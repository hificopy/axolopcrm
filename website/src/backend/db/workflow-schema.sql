-- Workflow Schema Extension for Forms
-- This extends the forms schema to support visual workflow builder with conditional logic and multiple endings

-- Form Workflow Nodes Table - Stores visual workflow node positions and connections
CREATE TABLE IF NOT EXISTS form_workflow_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    node_id VARCHAR(255) NOT NULL, -- Unique ID for the node (question-1, start, end-1, etc.)
    node_type VARCHAR(50) NOT NULL, -- 'start', 'question', 'end', 'conditional'

    -- Visual positioning for workflow view
    position_x DECIMAL(10,2) DEFAULT 0,
    position_y DECIMAL(10,2) DEFAULT 0,

    -- Node-specific data
    question_id VARCHAR(255), -- References question ID if node_type is 'question'
    ending_config JSONB, -- Config for ending screens (title, message, redirect, etc.)
    conditional_config JSONB, -- Config for conditional nodes

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workflow_nodes_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    UNIQUE(form_id, node_id)
);

-- Form Workflow Edges Table - Stores connections between nodes
CREATE TABLE IF NOT EXISTS form_workflow_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    edge_id VARCHAR(255) NOT NULL, -- Unique ID for the edge
    source_node_id VARCHAR(255) NOT NULL, -- ID of source node
    target_node_id VARCHAR(255) NOT NULL, -- ID of target node

    -- Conditional logic for this edge
    condition JSONB, -- {operator: 'equals', value: 'Yes', field: 'question-1'}
    condition_label VARCHAR(255), -- Display label for the condition (e.g., "If Yes")

    -- Visual styling
    edge_type VARCHAR(50) DEFAULT 'default', -- 'default', 'conditional', 'fallback'
    edge_label VARCHAR(255),

    -- Priority for multiple edges from same source (lower = higher priority)
    priority INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workflow_edges_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    UNIQUE(form_id, edge_id)
);

-- Form Endings Table - Stores multiple ending screens for forms
CREATE TABLE IF NOT EXISTS form_endings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    ending_id VARCHAR(255) NOT NULL, -- Unique ID for the ending (end-qualified, end-disqualified, etc.)

    -- Ending configuration
    title TEXT NOT NULL DEFAULT 'Thank you!',
    message TEXT,

    -- Actions
    redirect_url VARCHAR(500),
    redirect_delay INTEGER DEFAULT 0, -- Delay in seconds before redirect

    -- Visual customization
    icon VARCHAR(50), -- 'success', 'warning', 'error', 'info', custom emoji
    button_text VARCHAR(100),
    button_url VARCHAR(500),

    -- Lead qualification
    mark_as_qualified BOOLEAN DEFAULT NULL, -- NULL = neutral, true = qualified, false = disqualified
    lead_status VARCHAR(50), -- Status to assign to lead

    -- CRM actions
    create_contact BOOLEAN DEFAULT false,
    add_to_campaign_id UUID, -- Campaign to add contact to
    trigger_webhook BOOLEAN DEFAULT false,
    webhook_url VARCHAR(500),

    -- Analytics
    total_reached INTEGER DEFAULT 0, -- How many users reached this ending

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_form_endings_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    UNIQUE(form_id, ending_id)
);

-- Form Workflow Sessions Table - Track user path through workflow
CREATE TABLE IF NOT EXISTS form_workflow_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL,
    form_response_id UUID, -- Links to form_responses table when submitted
    session_id VARCHAR(255) NOT NULL, -- Unique session identifier

    -- Path tracking
    current_node_id VARCHAR(255), -- Current node user is on
    visited_nodes JSONB DEFAULT '[]'::jsonb, -- Array of visited node IDs
    path_history JSONB DEFAULT '[]'::jsonb, -- Full path with timestamps

    -- Session status
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    abandoned_at TIMESTAMP WITH TIME ZONE,

    -- Final outcome
    ending_id VARCHAR(255), -- Which ending the user reached

    -- Metadata
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workflow_sessions_form FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT fk_workflow_sessions_response FOREIGN KEY (form_response_id) REFERENCES form_responses(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_form_id ON form_workflow_nodes(form_id);
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_node_type ON form_workflow_nodes(node_type);

CREATE INDEX IF NOT EXISTS idx_workflow_edges_form_id ON form_workflow_edges(form_id);
CREATE INDEX IF NOT EXISTS idx_workflow_edges_source ON form_workflow_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_workflow_edges_target ON form_workflow_edges(target_node_id);

CREATE INDEX IF NOT EXISTS idx_form_endings_form_id ON form_endings(form_id);

CREATE INDEX IF NOT EXISTS idx_workflow_sessions_form_id ON form_workflow_sessions(form_id);
CREATE INDEX IF NOT EXISTS idx_workflow_sessions_session_id ON form_workflow_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_sessions_status ON form_workflow_sessions(status);

-- Triggers to update updated_at timestamp
CREATE TRIGGER update_workflow_nodes_updated_at BEFORE UPDATE ON form_workflow_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_edges_updated_at BEFORE UPDATE ON form_workflow_edges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_endings_updated_at BEFORE UPDATE ON form_endings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_sessions_updated_at BEFORE UPDATE ON form_workflow_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to get next node based on current node and response
CREATE OR REPLACE FUNCTION get_next_workflow_node(
    p_form_id UUID,
    p_current_node_id VARCHAR(255),
    p_responses JSONB
)
RETURNS VARCHAR(255) AS $$
DECLARE
    v_next_node_id VARCHAR(255);
    v_edge RECORD;
BEGIN
    -- Get edges from current node ordered by priority
    FOR v_edge IN
        SELECT * FROM form_workflow_edges
        WHERE form_id = p_form_id
        AND source_node_id = p_current_node_id
        ORDER BY priority ASC
    LOOP
        -- Check if condition matches (if condition exists)
        IF v_edge.condition IS NULL OR v_edge.condition = '{}'::jsonb THEN
            -- No condition, this is the default path
            v_next_node_id := v_edge.target_node_id;
            EXIT;
        ELSE
            -- Evaluate condition
            -- This is a simplified version - expand based on your needs
            DECLARE
                v_field VARCHAR(255);
                v_operator VARCHAR(50);
                v_value TEXT;
                v_response_value TEXT;
            BEGIN
                v_field := v_edge.condition->>'field';
                v_operator := v_edge.condition->>'operator';
                v_value := v_edge.condition->>'value';
                v_response_value := p_responses->>v_field;

                IF v_operator = 'equals' AND v_response_value = v_value THEN
                    v_next_node_id := v_edge.target_node_id;
                    EXIT;
                ELSIF v_operator = 'not_equals' AND v_response_value != v_value THEN
                    v_next_node_id := v_edge.target_node_id;
                    EXIT;
                ELSIF v_operator = 'contains' AND v_response_value LIKE '%' || v_value || '%' THEN
                    v_next_node_id := v_edge.target_node_id;
                    EXIT;
                END IF;
            END;
        END IF;
    END LOOP;

    RETURN v_next_node_id;
END;
$$ LANGUAGE plpgsql;
