/**
 * Second Brain - Node Service
 * Handles Logic graph nodes, connections, and CRM linking
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Get all nodes for a user
 */
const getNodes = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('second_brain_nodes')
      .select('*, connections_from:second_brain_connections!from_node_id(*), connections_to:second_brain_connections!to_node_id(*)')
      .eq('user_id', userId);

    // Filter by type
    if (options.type) {
      query = query.eq('type', options.type);
    }

    // Filter by workspace
    if (options.workspaceId) {
      query = query.eq('workspace_id', options.workspaceId);
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags);
    }

    // Search
    if (options.search) {
      query = query.textSearch('search_vector', options.search);
    }

    // Pagination
    const page = options.page || 1;
    const limit = options.limit || 100;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return {
      nodes: data,
      pagination: {
        page,
        limit,
        total: data.length,
      },
    };
  } catch (error) {
    console.error('[NodeService] Error getting nodes:', error);
    throw error;
  }
};

/**
 * Get a single node by ID
 */
const getNodeById = async (userId, nodeId) => {
  try {
    const { data, error } = await supabase
      .from('second_brain_nodes')
      .select(`
        *,
        connections_from:second_brain_connections!from_node_id(*),
        connections_to:second_brain_connections!to_node_id(*),
        crm_links:second_brain_crm_links(*)
      `)
      .eq('id', nodeId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[NodeService] Error getting node:', error);
    throw error;
  }
};

/**
 * Create a new node
 */
const createNode = async (userId, nodeData) => {
  try {
    const node = {
      user_id: userId,
      type: nodeData.type,
      label: nodeData.label,
      description: nodeData.description,
      color: nodeData.color || '#7b1c14',
      icon: nodeData.icon,
      size: nodeData.size || 40,
      orbit_level: nodeData.orbit_level || 0,
      angle: nodeData.angle || 0,
      radius: nodeData.radius || 0,
      position_x: nodeData.position_x,
      position_y: nodeData.position_y,
      is_pinned: nodeData.is_pinned || false,
      metadata: nodeData.metadata || {},
      tags: nodeData.tags || [],
      workspace_id: nodeData.workspace_id,
    };

    const { data, error } = await supabase
      .from('second_brain_nodes')
      .insert(node)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity(userId, 'create', 'node', data.id, { label: data.label });

    return data;
  } catch (error) {
    console.error('[NodeService] Error creating node:', error);
    throw error;
  }
};

/**
 * Update a node
 */
const updateNode = async (userId, nodeId, updates) => {
  try {
    const allowedUpdates = {
      label: updates.label,
      description: updates.description,
      color: updates.color,
      icon: updates.icon,
      size: updates.size,
      orbit_level: updates.orbit_level,
      angle: updates.angle,
      radius: updates.radius,
      position_x: updates.position_x,
      position_y: updates.position_y,
      is_pinned: updates.is_pinned,
      metadata: updates.metadata,
      tags: updates.tags,
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key =>
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const { data, error } = await supabase
      .from('second_brain_nodes')
      .update(allowedUpdates)
      .eq('id', nodeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity(userId, 'update', 'node', nodeId, { updates: Object.keys(allowedUpdates) });

    return data;
  } catch (error) {
    console.error('[NodeService] Error updating node:', error);
    throw error;
  }
};

/**
 * Delete a node
 */
const deleteNode = async (userId, nodeId) => {
  try {
    const { error } = await supabase
      .from('second_brain_nodes')
      .delete()
      .eq('id', nodeId)
      .eq('user_id', userId);

    if (error) throw error;

    // Log activity
    await logActivity(userId, 'delete', 'node', nodeId, {});

    return { success: true };
  } catch (error) {
    console.error('[NodeService] Error deleting node:', error);
    throw error;
  }
};

/**
 * Get all connections for a user
 */
const getConnections = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('second_brain_connections')
      .select(`
        *,
        from_node:second_brain_nodes!from_node_id(*),
        to_node:second_brain_nodes!to_node_id(*)
      `)
      .or(`from_node.user_id.eq.${userId},to_node.user_id.eq.${userId}`);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[NodeService] Error getting connections:', error);
    throw error;
  }
};

/**
 * Create a connection between nodes
 */
const createConnection = async (userId, fromNodeId, toNodeId, options = {}) => {
  try {
    // Verify both nodes belong to user
    const { data: fromNode } = await supabase
      .from('second_brain_nodes')
      .select('id')
      .eq('id', fromNodeId)
      .eq('user_id', userId)
      .single();

    const { data: toNode } = await supabase
      .from('second_brain_nodes')
      .select('id')
      .eq('id', toNodeId)
      .eq('user_id', userId)
      .single();

    if (!fromNode || !toNode) {
      throw new Error('One or both nodes not found or not owned by user');
    }

    const connection = {
      from_node_id: fromNodeId,
      to_node_id: toNodeId,
      connection_type: options.connectionType || 'related',
      strength: options.strength || 1.0,
      label: options.label,
      color: options.color,
      metadata: options.metadata || {},
    };

    const { data, error } = await supabase
      .from('second_brain_connections')
      .insert(connection)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity(userId, 'create', 'connection', data.id, {
      from: fromNodeId,
      to: toNodeId,
    });

    return data;
  } catch (error) {
    console.error('[NodeService] Error creating connection:', error);
    throw error;
  }
};

/**
 * Delete a connection
 */
const deleteConnection = async (userId, connectionId) => {
  try {
    // Verify connection belongs to user's nodes
    const { data: connection } = await supabase
      .from('second_brain_connections')
      .select('*, from_node:second_brain_nodes!from_node_id(*)')
      .eq('id', connectionId)
      .single();

    if (!connection || connection.from_node.user_id !== userId) {
      throw new Error('Connection not found or not owned by user');
    }

    const { error } = await supabase
      .from('second_brain_connections')
      .delete()
      .eq('id', connectionId);

    if (error) throw error;

    // Log activity
    await logActivity(userId, 'delete', 'connection', connectionId, {});

    return { success: true };
  } catch (error) {
    console.error('[NodeService] Error deleting connection:', error);
    throw error;
  }
};

/**
 * Link a node to a CRM record
 */
const linkToCRM = async (userId, nodeId, crmRecordType, crmRecordId, options = {}) => {
  try {
    // Verify node belongs to user
    const { data: node } = await supabase
      .from('second_brain_nodes')
      .select('id')
      .eq('id', nodeId)
      .eq('user_id', userId)
      .single();

    if (!node) {
      throw new Error('Node not found or not owned by user');
    }

    const link = {
      node_id: nodeId,
      crm_record_type: crmRecordType,
      crm_record_id: crmRecordId,
      sync_enabled: options.syncEnabled !== false,
    };

    const { data, error } = await supabase
      .from('second_brain_crm_links')
      .insert(link)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity(userId, 'link_crm', 'node', nodeId, {
      crm_record_type: crmRecordType,
      crm_record_id: crmRecordId,
    });

    return data;
  } catch (error) {
    console.error('[NodeService] Error linking to CRM:', error);
    throw error;
  }
};

/**
 * Get CRM links for a node
 */
const getCRMLinks = async (userId, nodeId) => {
  try {
    const { data, error } = await supabase
      .from('second_brain_crm_links')
      .select('*, node:second_brain_nodes(*)')
      .eq('node_id', nodeId);

    if (error) throw error;

    // Verify node belongs to user
    if (data.length > 0 && data[0].node.user_id !== userId) {
      throw new Error('Node not found or not owned by user');
    }

    return data;
  } catch (error) {
    console.error('[NodeService] Error getting CRM links:', error);
    throw error;
  }
};

/**
 * Sync CRM data to create/update nodes
 */
const syncCRMData = async (userId, options = {}) => {
  try {
    const results = {
      contacts: [],
      leads: [],
      deals: [],
      activities: [],
    };

    // Sync contacts
    if (!options.types || options.types.includes('contacts')) {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .limit(100);

      for (const contact of contacts || []) {
        // Check if node already exists
        const { data: existingNode } = await supabase
          .from('second_brain_crm_links')
          .select('node_id')
          .eq('crm_record_type', 'contact')
          .eq('crm_record_id', contact.id)
          .single();

        if (!existingNode) {
          // Create new node
          const node = await createNode(userId, {
            type: 'database',
            label: contact.name || contact.email,
            description: `Contact: ${contact.company || ''}`,
            color: '#4C7FFF',
            orbit_level: 1,
            metadata: { source: 'crm', crm_type: 'contact' },
          });

          // Link to CRM
          await linkToCRM(userId, node.id, 'contact', contact.id);
          results.contacts.push(node);
        }
      }
    }

    // Sync leads (similar pattern)
    if (!options.types || options.types.includes('leads')) {
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', userId)
        .limit(100);

      for (const lead of leads || []) {
        const { data: existingNode } = await supabase
          .from('second_brain_crm_links')
          .select('node_id')
          .eq('crm_record_type', 'lead')
          .eq('crm_record_id', lead.id)
          .single();

        if (!existingNode) {
          const node = await createNode(userId, {
            type: 'database',
            label: lead.name || lead.email,
            description: `Lead: ${lead.company || ''}`,
            color: '#7b1c14',
            orbit_level: 1,
            metadata: { source: 'crm', crm_type: 'lead' },
          });

          await linkToCRM(userId, node.id, 'lead', lead.id);
          results.leads.push(node);
        }
      }
    }

    // Log activity
    await logActivity(userId, 'sync_crm', 'system', null, {
      synced: {
        contacts: results.contacts.length,
        leads: results.leads.length,
        deals: results.deals.length,
        activities: results.activities.length,
      },
    });

    return results;
  } catch (error) {
    console.error('[NodeService] Error syncing CRM data:', error);
    throw error;
  }
};

/**
 * Log activity
 */
const logActivity = async (userId, actionType, entityType, entityId, details) => {
  try {
    await supabase
      .from('second_brain_activity')
      .insert({
        user_id: userId,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        details,
      });
  } catch (error) {
    console.error('[NodeService] Error logging activity:', error);
    // Don't throw - activity logging shouldn't break main flow
  }
};

export default {
  getNodes,
  getNodeById,
  createNode,
  updateNode,
  deleteNode,
  getConnections,
  createConnection,
  deleteConnection,
  linkToCRM,
  getCRMLinks,
  syncCRMData,
};
