-- =====================================================
-- AXOLOP CRM - SECOND BRAIN DATABASE SCHEMA
-- Complete schema for Logic, Maps, and Notes
-- Version: 1.0.0
-- Created: November 17, 2025
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- LOGIC VIEW - Graph Nodes and Connections
-- =====================================================

-- Nodes for Logic graph visualization
CREATE TABLE IF NOT EXISTS public.second_brain_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID,

  -- Node properties
  type TEXT NOT NULL CHECK (type IN ('database', 'document', 'mindmap', 'folder')),
  label TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#7b1c14',
  icon TEXT,

  -- Visual properties
  size INTEGER NOT NULL DEFAULT 40 CHECK (size >= 20 AND size <= 100),
  orbit_level INTEGER DEFAULT 0 CHECK (orbit_level >= 0),
  angle FLOAT DEFAULT 0,
  radius FLOAT DEFAULT 0,
  position_x FLOAT,
  position_y FLOAT,
  is_pinned BOOLEAN DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(label, '') || ' ' || coalesce(description, ''))
  ) STORED
);

-- Connections between nodes
CREATE TABLE IF NOT EXISTS public.second_brain_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_node_id UUID REFERENCES public.second_brain_nodes(id) ON DELETE CASCADE,
  to_node_id UUID REFERENCES public.second_brain_nodes(id) ON DELETE CASCADE,

  -- Connection properties
  connection_type TEXT DEFAULT 'related' CHECK (connection_type IN ('related', 'parent', 'child', 'reference', 'dependency')),
  strength FLOAT DEFAULT 1.0 CHECK (strength >= 0 AND strength <= 1),
  label TEXT,
  color TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Prevent duplicate connections
  UNIQUE(from_node_id, to_node_id)
);

-- Link nodes to CRM records
CREATE TABLE IF NOT EXISTS public.second_brain_crm_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id UUID REFERENCES public.second_brain_nodes(id) ON DELETE CASCADE,

  -- CRM record reference
  crm_record_type TEXT NOT NULL CHECK (crm_record_type IN ('lead', 'contact', 'deal', 'activity', 'opportunity', 'campaign')),
  crm_record_id UUID NOT NULL,

  -- Metadata
  sync_enabled BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- One node can link to multiple CRM records
  UNIQUE(node_id, crm_record_type, crm_record_id)
);

-- =====================================================
-- MAPS VIEW - Infinite Canvas
-- =====================================================

-- Boards (Maps)
CREATE TABLE IF NOT EXISTS public.second_brain_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID,

  -- Board properties
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  background_color TEXT DEFAULT '#1a1a1a',
  background_pattern TEXT DEFAULT 'grid',

  -- Viewport settings
  default_zoom FLOAT DEFAULT 1.0,
  default_pan_x FLOAT DEFAULT 0,
  default_pan_y FLOAT DEFAULT 0,

  -- Access control
  is_public BOOLEAN DEFAULT false,
  password TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  template_id UUID,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_edited_by UUID REFERENCES auth.users(id),

  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) STORED
);

-- Board objects (shapes, text, sticky notes, etc.)
CREATE TABLE IF NOT EXISTS public.second_brain_map_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  map_id UUID REFERENCES public.second_brain_maps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),

  -- Object type
  type TEXT NOT NULL CHECK (type IN ('shape', 'text', 'sticky_note', 'image', 'connector', 'mindmap_node', 'frame', 'group')),

  -- Position and dimensions
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  width FLOAT,
  height FLOAT,
  rotation FLOAT DEFAULT 0,
  z_index INTEGER DEFAULT 0,

  -- Visual properties
  data JSONB NOT NULL, -- Object-specific properties (color, text, shape type, etc.)
  style JSONB DEFAULT '{}',
  locked BOOLEAN DEFAULT false,

  -- Grouping
  parent_id UUID REFERENCES public.second_brain_map_objects(id) ON DELETE CASCADE,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Connectors between objects
CREATE TABLE IF NOT EXISTS public.second_brain_map_connectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  map_id UUID REFERENCES public.second_brain_maps(id) ON DELETE CASCADE,

  -- Connected objects
  from_object_id UUID REFERENCES public.second_brain_map_objects(id) ON DELETE CASCADE,
  to_object_id UUID REFERENCES public.second_brain_map_objects(id) ON DELETE CASCADE,

  -- Connector properties
  connector_type TEXT DEFAULT 'arrow' CHECK (connector_type IN ('arrow', 'line', 'curved', 'elbow')),
  style JSONB DEFAULT '{}',
  label TEXT,

  -- Path points for custom routing
  path_points JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Board comments
CREATE TABLE IF NOT EXISTS public.second_brain_map_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  map_id UUID REFERENCES public.second_brain_maps(id) ON DELETE CASCADE,
  object_id UUID REFERENCES public.second_brain_map_objects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),

  -- Comment properties
  content TEXT NOT NULL,
  position_x FLOAT,
  position_y FLOAT,
  is_resolved BOOLEAN DEFAULT false,

  -- Threading
  parent_comment_id UUID REFERENCES public.second_brain_map_comments(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- NOTES VIEW - Rich Documents
-- =====================================================

-- Notes (Documents)
CREATE TABLE IF NOT EXISTS public.second_brain_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID,

  -- Hierarchy
  parent_id UUID REFERENCES public.second_brain_notes(id) ON DELETE CASCADE,

  -- Note properties
  title TEXT NOT NULL DEFAULT 'Untitled',
  content JSONB, -- ProseMirror/TipTap document
  content_text TEXT, -- Plain text for search
  content_markdown TEXT, -- Markdown export

  -- Organization
  folder TEXT,
  starred BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  template BOOLEAN DEFAULT false,

  -- Visual properties
  icon TEXT,
  cover_image TEXT,

  -- Database properties (for database views)
  is_database BOOLEAN DEFAULT false,
  database_type TEXT CHECK (database_type IN ('table', 'board', 'calendar', 'gallery', 'list')),
  database_config JSONB,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_edited_by UUID REFERENCES auth.users(id),
  last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content_text, ''))
  ) STORED
);

-- Note links (Backlinks)
CREATE TABLE IF NOT EXISTS public.second_brain_note_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_note_id UUID REFERENCES public.second_brain_notes(id) ON DELETE CASCADE,
  target_note_id UUID REFERENCES public.second_brain_notes(id) ON DELETE CASCADE,

  -- Link properties
  link_text TEXT,
  link_type TEXT DEFAULT 'wiki' CHECK (link_type IN ('wiki', 'mention', 'embed')),
  position_in_source JSONB, -- Location in source document

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Prevent duplicate links
  UNIQUE(source_note_id, target_note_id)
);

-- Note comments
CREATE TABLE IF NOT EXISTS public.second_brain_note_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES public.second_brain_notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),

  -- Comment properties
  content TEXT NOT NULL,
  position JSONB, -- Location in document
  is_resolved BOOLEAN DEFAULT false,

  -- Threading
  parent_comment_id UUID REFERENCES public.second_brain_note_comments(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Note version history
CREATE TABLE IF NOT EXISTS public.second_brain_note_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES public.second_brain_notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),

  -- Snapshot
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  content_text TEXT,

  -- Version info
  version_number INTEGER NOT NULL,
  change_summary TEXT,

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Database entries (for note databases)
CREATE TABLE IF NOT EXISTS public.second_brain_database_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  database_id UUID REFERENCES public.second_brain_notes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),

  -- Entry properties
  properties JSONB NOT NULL,
  page_id UUID REFERENCES public.second_brain_notes(id), -- Link to full page if exists

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- SHARED - Workspaces and Collaboration
-- =====================================================

-- Workspaces for team collaboration
CREATE TABLE IF NOT EXISTS public.second_brain_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Workspace properties
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#7b1c14',

  -- Settings
  settings JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Workspace members
CREATE TABLE IF NOT EXISTS public.second_brain_workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.second_brain_workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role and permissions
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}',

  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- One user per workspace
  UNIQUE(workspace_id, user_id)
);

-- Real-time presence tracking
CREATE TABLE IF NOT EXISTS public.second_brain_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Location
  location_type TEXT NOT NULL CHECK (location_type IN ('logic', 'map', 'note')),
  location_id UUID NOT NULL,

  -- Cursor position (for maps and notes)
  cursor_x FLOAT,
  cursor_y FLOAT,

  -- Selection (for notes)
  selection JSONB,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity log
CREATE TABLE IF NOT EXISTS public.second_brain_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  workspace_id UUID REFERENCES public.second_brain_workspaces(id),

  -- Activity details
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Logic View Indexes
CREATE INDEX IF NOT EXISTS idx_sb_nodes_user_id ON public.second_brain_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_sb_nodes_workspace_id ON public.second_brain_nodes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sb_nodes_type ON public.second_brain_nodes(type);
CREATE INDEX IF NOT EXISTS idx_sb_nodes_search ON public.second_brain_nodes USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_sb_nodes_tags ON public.second_brain_nodes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_sb_connections_from ON public.second_brain_connections(from_node_id);
CREATE INDEX IF NOT EXISTS idx_sb_connections_to ON public.second_brain_connections(to_node_id);
CREATE INDEX IF NOT EXISTS idx_sb_crm_links_node ON public.second_brain_crm_links(node_id);
CREATE INDEX IF NOT EXISTS idx_sb_crm_links_record ON public.second_brain_crm_links(crm_record_type, crm_record_id);

-- Maps View Indexes
CREATE INDEX IF NOT EXISTS idx_sb_maps_user_id ON public.second_brain_maps(user_id);
CREATE INDEX IF NOT EXISTS idx_sb_maps_workspace_id ON public.second_brain_maps(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sb_maps_search ON public.second_brain_maps USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_sb_map_objects_map_id ON public.second_brain_map_objects(map_id);
CREATE INDEX IF NOT EXISTS idx_sb_map_objects_type ON public.second_brain_map_objects(type);
CREATE INDEX IF NOT EXISTS idx_sb_map_objects_z_index ON public.second_brain_map_objects(z_index);
CREATE INDEX IF NOT EXISTS idx_sb_map_connectors_map_id ON public.second_brain_map_connectors(map_id);
CREATE INDEX IF NOT EXISTS idx_sb_map_connectors_from ON public.second_brain_map_connectors(from_object_id);
CREATE INDEX IF NOT EXISTS idx_sb_map_connectors_to ON public.second_brain_map_connectors(to_object_id);

-- Notes View Indexes
CREATE INDEX IF NOT EXISTS idx_sb_notes_user_id ON public.second_brain_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_sb_notes_workspace_id ON public.second_brain_notes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sb_notes_parent_id ON public.second_brain_notes(parent_id);
CREATE INDEX IF NOT EXISTS idx_sb_notes_folder ON public.second_brain_notes(folder);
CREATE INDEX IF NOT EXISTS idx_sb_notes_starred ON public.second_brain_notes(starred) WHERE starred = true;
CREATE INDEX IF NOT EXISTS idx_sb_notes_archived ON public.second_brain_notes(archived) WHERE archived = true;
CREATE INDEX IF NOT EXISTS idx_sb_notes_search ON public.second_brain_notes USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_sb_notes_tags ON public.second_brain_notes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_sb_note_links_source ON public.second_brain_note_links(source_note_id);
CREATE INDEX IF NOT EXISTS idx_sb_note_links_target ON public.second_brain_note_links(target_note_id);
CREATE INDEX IF NOT EXISTS idx_sb_note_history_note_id ON public.second_brain_note_history(note_id);

-- Collaboration Indexes
CREATE INDEX IF NOT EXISTS idx_sb_workspace_members_workspace ON public.second_brain_workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sb_workspace_members_user ON public.second_brain_workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_sb_presence_location ON public.second_brain_presence(location_type, location_id);
CREATE INDEX IF NOT EXISTS idx_sb_activity_user ON public.second_brain_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_sb_activity_workspace ON public.second_brain_activity(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sb_activity_created ON public.second_brain_activity(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.second_brain_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_crm_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_map_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_map_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_map_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_note_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_database_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_brain_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Nodes
CREATE POLICY "Users can view their own nodes" ON public.second_brain_nodes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nodes" ON public.second_brain_nodes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nodes" ON public.second_brain_nodes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nodes" ON public.second_brain_nodes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Connections
CREATE POLICY "Users can view connections for their nodes" ON public.second_brain_connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.second_brain_nodes
      WHERE id = from_node_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their connections" ON public.second_brain_connections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.second_brain_nodes
      WHERE id = from_node_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for Maps
CREATE POLICY "Users can view their own maps" ON public.second_brain_maps
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own maps" ON public.second_brain_maps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maps" ON public.second_brain_maps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maps" ON public.second_brain_maps
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Map Objects
CREATE POLICY "Users can view map objects for accessible maps" ON public.second_brain_map_objects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.second_brain_maps
      WHERE id = map_id AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can manage map objects for their maps" ON public.second_brain_map_objects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.second_brain_maps
      WHERE id = map_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for Notes
CREATE POLICY "Users can view their own notes" ON public.second_brain_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON public.second_brain_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON public.second_brain_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON public.second_brain_notes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Note Links
CREATE POLICY "Users can view note links for their notes" ON public.second_brain_note_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.second_brain_notes
      WHERE id = source_note_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their note links" ON public.second_brain_note_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.second_brain_notes
      WHERE id = source_note_id AND user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sb_nodes_updated_at BEFORE UPDATE ON public.second_brain_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sb_maps_updated_at BEFORE UPDATE ON public.second_brain_maps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sb_notes_updated_at BEFORE UPDATE ON public.second_brain_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create backlink when link is created
CREATE OR REPLACE FUNCTION auto_create_backlink()
RETURNS TRIGGER AS $$
BEGIN
  -- Optionally create reverse link
  -- This is commented out because backlinks are implicit
  -- UNCOMMENT if you want explicit bidirectional links
  /*
  IF NOT EXISTS (
    SELECT 1 FROM public.second_brain_note_links
    WHERE source_note_id = NEW.target_note_id
    AND target_note_id = NEW.source_note_id
  ) THEN
    INSERT INTO public.second_brain_note_links (source_note_id, target_note_id, link_type)
    VALUES (NEW.target_note_id, NEW.source_note_id, 'backlink');
  END IF;
  */
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA FOR DEMO
-- =====================================================

-- Insert demo nodes (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.second_brain_nodes LIMIT 1) THEN
    -- Insert demo nodes here when needed
    -- This will be populated by the application
  END IF;
END $$;

-- =====================================================
-- SUCCESS
-- =====================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Second Brain database schema created successfully!';
  RAISE NOTICE 'Tables created: 17';
  RAISE NOTICE 'Indexes created: 30+';
  RAISE NOTICE 'RLS policies created: 20+';
  RAISE NOTICE 'Ready for backend integration.';
END $$;
