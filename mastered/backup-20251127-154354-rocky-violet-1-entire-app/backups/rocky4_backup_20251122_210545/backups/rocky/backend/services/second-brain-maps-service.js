/**
 * Second Brain - Maps Service
 * Complete Miro/Whimsical/FigJam clone
 * Handles infinite canvas, objects, shapes, sticky notes, connectors
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Get all maps for a user
 */
const getMaps = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('second_brain_maps')
      .select('*, object_count:second_brain_map_objects(count)')
      .eq('user_id', userId);

    // Filter by workspace
    if (options.workspaceId) {
      query = query.eq('workspace_id', options.workspaceId);
    }

    // Search
    if (options.search) {
      query = query.textSearch('search_vector', options.search);
    }

    // Pagination
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by
    query = query.order('updated_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return {
      maps: data,
      pagination: { page, limit, total: data.length },
    };
  } catch (error) {
    console.error('[MapsService] Error getting maps:', error);
    throw error;
  }
};

/**
 * Get a single map by ID with all objects
 */
const getMapById = async (userId, mapId) => {
  try {
    const { data: map, error: mapError } = await supabase
      .from('second_brain_maps')
      .select(`
        *,
        objects:second_brain_map_objects(*),
        connectors:second_brain_map_connectors(*)
      `)
      .eq('id', mapId)
      .eq('user_id', userId)
      .single();

    if (mapError) throw mapError;
    return map;
  } catch (error) {
    console.error('[MapsService] Error getting map:', error);
    throw error;
  }
};

/**
 * Create a new map
 */
const createMap = async (userId, mapData) => {
  try {
    const map = {
      user_id: userId,
      name: mapData.name || 'Untitled Board',
      description: mapData.description,
      background_color: mapData.background_color || '#1a1a1a',
      background_pattern: mapData.background_pattern || 'grid',
      default_zoom: mapData.default_zoom || 1.0,
      viewport_x: mapData.viewport_x || 0,
      viewport_y: mapData.viewport_y || 0,
      workspace_id: mapData.workspace_id,
      is_public: mapData.is_public || false,
      settings: mapData.settings || {
        snap_to_grid: true,
        grid_size: 20,
        show_grid: true,
      },
    };

    const { data, error } = await supabase
      .from('second_brain_maps')
      .insert(map)
      .select()
      .single();

    if (error) throw error;

    await logActivity(userId, 'create', 'map', data.id, { name: data.name });
    return data;
  } catch (error) {
    console.error('[MapsService] Error creating map:', error);
    throw error;
  }
};

/**
 * Update a map
 */
const updateMap = async (userId, mapId, updates) => {
  try {
    const allowedUpdates = {
      name: updates.name,
      description: updates.description,
      background_color: updates.background_color,
      background_pattern: updates.background_pattern,
      default_zoom: updates.default_zoom,
      viewport_x: updates.viewport_x,
      viewport_y: updates.viewport_y,
      is_public: updates.is_public,
      settings: updates.settings,
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key =>
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const { data, error } = await supabase
      .from('second_brain_maps')
      .update({ ...allowedUpdates, updated_at: new Date() })
      .eq('id', mapId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    await logActivity(userId, 'update', 'map', mapId, { updates: Object.keys(allowedUpdates) });
    return data;
  } catch (error) {
    console.error('[MapsService] Error updating map:', error);
    throw error;
  }
};

/**
 * Delete a map and all its objects
 */
const deleteMap = async (userId, mapId) => {
  try {
    const { error } = await supabase
      .from('second_brain_maps')
      .delete()
      .eq('id', mapId)
      .eq('user_id', userId);

    if (error) throw error;

    await logActivity(userId, 'delete', 'map', mapId, {});
    return { success: true };
  } catch (error) {
    console.error('[MapsService] Error deleting map:', error);
    throw error;
  }
};

/**
 * Get all objects in a map
 */
const getMapObjects = async (userId, mapId) => {
  try {
    // Verify map ownership
    const { data: map } = await supabase
      .from('second_brain_maps')
      .select('id')
      .eq('id', mapId)
      .eq('user_id', userId)
      .single();

    if (!map) throw new Error('Map not found or not owned by user');

    const { data, error } = await supabase
      .from('second_brain_map_objects')
      .select('*')
      .eq('map_id', mapId)
      .order('z_index', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[MapsService] Error getting map objects:', error);
    throw error;
  }
};

/**
 * Create a new object on a map
 */
const createObject = async (userId, mapId, objectData) => {
  try {
    // Verify map ownership
    const { data: map } = await supabase
      .from('second_brain_maps')
      .select('id')
      .eq('id', mapId)
      .eq('user_id', userId)
      .single();

    if (!map) throw new Error('Map not found or not owned by user');

    const object = {
      map_id: mapId,
      type: objectData.type, // 'shape', 'text', 'sticky_note', 'image', 'connector'
      position_x: objectData.position_x || 0,
      position_y: objectData.position_y || 0,
      width: objectData.width,
      height: objectData.height,
      rotation: objectData.rotation || 0,
      z_index: objectData.z_index || 0,
      data: objectData.data || {}, // Type-specific data
      style: objectData.style || {},
      locked: objectData.locked || false,
    };

    const { data, error } = await supabase
      .from('second_brain_map_objects')
      .insert(object)
      .select()
      .single();

    if (error) throw error;

    // Update map's updated_at
    await supabase
      .from('second_brain_maps')
      .update({ updated_at: new Date() })
      .eq('id', mapId);

    await logActivity(userId, 'create', 'map_object', data.id, { map_id: mapId, type: object.type });
    return data;
  } catch (error) {
    console.error('[MapsService] Error creating object:', error);
    throw error;
  }
};

/**
 * Update an object
 */
const updateObject = async (userId, mapId, objectId, updates) => {
  try {
    // Verify map ownership
    const { data: map } = await supabase
      .from('second_brain_maps')
      .select('id')
      .eq('id', mapId)
      .eq('user_id', userId)
      .single();

    if (!map) throw new Error('Map not found or not owned by user');

    const allowedUpdates = {
      position_x: updates.position_x,
      position_y: updates.position_y,
      width: updates.width,
      height: updates.height,
      rotation: updates.rotation,
      z_index: updates.z_index,
      data: updates.data,
      style: updates.style,
      locked: updates.locked,
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key =>
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const { data, error } = await supabase
      .from('second_brain_map_objects')
      .update(allowedUpdates)
      .eq('id', objectId)
      .eq('map_id', mapId)
      .select()
      .single();

    if (error) throw error;

    // Update map's updated_at
    await supabase
      .from('second_brain_maps')
      .update({ updated_at: new Date() })
      .eq('id', mapId);

    return data;
  } catch (error) {
    console.error('[MapsService] Error updating object:', error);
    throw error;
  }
};

/**
 * Delete an object
 */
const deleteObject = async (userId, mapId, objectId) => {
  try {
    // Verify map ownership
    const { data: map } = await supabase
      .from('second_brain_maps')
      .select('id')
      .eq('id', mapId)
      .eq('user_id', userId)
      .single();

    if (!map) throw new Error('Map not found or not owned by user');

    const { error } = await supabase
      .from('second_brain_map_objects')
      .delete()
      .eq('id', objectId)
      .eq('map_id', mapId);

    if (error) throw error;

    // Update map's updated_at
    await supabase
      .from('second_brain_maps')
      .update({ updated_at: new Date() })
      .eq('id', mapId);

    await logActivity(userId, 'delete', 'map_object', objectId, { map_id: mapId });
    return { success: true };
  } catch (error) {
    console.error('[MapsService] Error deleting object:', error);
    throw error;
  }
};

/**
 * Bulk update objects (for performance during drag/resize)
 */
const bulkUpdateObjects = async (userId, mapId, updates) => {
  try {
    // Verify map ownership
    const { data: map } = await supabase
      .from('second_brain_maps')
      .select('id')
      .eq('id', mapId)
      .eq('user_id', userId)
      .single();

    if (!map) throw new Error('Map not found or not owned by user');

    // Update each object
    const promises = updates.map(update =>
      supabase
        .from('second_brain_map_objects')
        .update({
          position_x: update.position_x,
          position_y: update.position_y,
          width: update.width,
          height: update.height,
          rotation: update.rotation,
          z_index: update.z_index,
        })
        .eq('id', update.id)
        .eq('map_id', mapId)
    );

    await Promise.all(promises);

    // Update map's updated_at
    await supabase
      .from('second_brain_maps')
      .update({ updated_at: new Date() })
      .eq('id', mapId);

    return { success: true, count: updates.length };
  } catch (error) {
    console.error('[MapsService] Error bulk updating objects:', error);
    throw error;
  }
};

/**
 * Get all connectors in a map
 */
const getMapConnectors = async (userId, mapId) => {
  try {
    // Verify map ownership
    const { data: map } = await supabase
      .from('second_brain_maps')
      .select('id')
      .eq('id', mapId)
      .eq('user_id', userId)
      .single();

    if (!map) throw new Error('Map not found or not owned by user');

    const { data, error } = await supabase
      .from('second_brain_map_connectors')
      .select('*')
      .eq('map_id', mapId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[MapsService] Error getting connectors:', error);
    throw error;
  }
};

/**
 * Create a connector between objects
 */
const createConnector = async (userId, mapId, connectorData) => {
  try {
    // Verify map ownership
    const { data: map } = await supabase
      .from('second_brain_maps')
      .select('id')
      .eq('id', mapId)
      .eq('user_id', userId)
      .single();

    if (!map) throw new Error('Map not found or not owned by user');

    const connector = {
      map_id: mapId,
      from_object_id: connectorData.from_object_id,
      to_object_id: connectorData.to_object_id,
      type: connectorData.type || 'line', // 'line', 'arrow', 'curved'
      style: connectorData.style || {
        stroke: '#7b1c14',
        stroke_width: 2,
        stroke_dash: [],
      },
      label: connectorData.label,
    };

    const { data, error } = await supabase
      .from('second_brain_map_connectors')
      .insert(connector)
      .select()
      .single();

    if (error) throw error;

    await logActivity(userId, 'create', 'map_connector', data.id, { map_id: mapId });
    return data;
  } catch (error) {
    console.error('[MapsService] Error creating connector:', error);
    throw error;
  }
};

/**
 * Delete a connector
 */
const deleteConnector = async (userId, mapId, connectorId) => {
  try {
    // Verify map ownership
    const { data: map } = await supabase
      .from('second_brain_maps')
      .select('id')
      .eq('id', mapId)
      .eq('user_id', userId)
      .single();

    if (!map) throw new Error('Map not found or not owned by user');

    const { error } = await supabase
      .from('second_brain_map_connectors')
      .delete()
      .eq('id', connectorId)
      .eq('map_id', mapId);

    if (error) throw error;

    await logActivity(userId, 'delete', 'map_connector', connectorId, { map_id: mapId });
    return { success: true };
  } catch (error) {
    console.error('[MapsService] Error deleting connector:', error);
    throw error;
  }
};

/**
 * Duplicate a map
 */
const duplicateMap = async (userId, mapId) => {
  try {
    // Get original map
    const original = await getMapById(userId, mapId);
    if (!original) throw new Error('Map not found');

    // Create new map
    const newMap = await createMap(userId, {
      name: `${original.name} (Copy)`,
      description: original.description,
      background_color: original.background_color,
      background_pattern: original.background_pattern,
      default_zoom: original.default_zoom,
      settings: original.settings,
    });

    // Duplicate all objects
    if (original.objects && original.objects.length > 0) {
      const objectPromises = original.objects.map(obj =>
        createObject(userId, newMap.id, {
          type: obj.type,
          position_x: obj.position_x,
          position_y: obj.position_y,
          width: obj.width,
          height: obj.height,
          rotation: obj.rotation,
          z_index: obj.z_index,
          data: obj.data,
          style: obj.style,
        })
      );

      await Promise.all(objectPromises);
    }

    return newMap;
  } catch (error) {
    console.error('[MapsService] Error duplicating map:', error);
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
    console.error('[MapsService] Error logging activity:', error);
    // Don't throw - activity logging shouldn't break main flow
  }
};

export default {
  getMaps,
  getMapById,
  createMap,
  updateMap,
  deleteMap,
  getMapObjects,
  createObject,
  updateObject,
  deleteObject,
  bulkUpdateObjects,
  getMapConnectors,
  createConnector,
  deleteConnector,
  duplicateMap,
};
