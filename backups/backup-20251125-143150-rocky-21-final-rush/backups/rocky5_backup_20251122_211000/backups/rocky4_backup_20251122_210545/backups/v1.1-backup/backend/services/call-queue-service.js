import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Call Queue Service
 * Manages call queues and queue items for systematic calling
 */

// ===========================================================================
// CALL QUEUES
// ===========================================================================

/**
 * Get all call queues for a user
 */
const getCallQueues = async (userId) => {
  const { data, error } = await supabase
    .from('call_queues')
    .select('*, items:call_queue_items(count)')
    .eq('user_id', userId)
    .order('priority', { ascending: false });

  if (error) throw error;

  // Add item counts
  const queuesWithCounts = await Promise.all(
    data.map(async (queue) => {
      const { count: pendingCount } = await supabase
        .from('call_queue_items')
        .select('*', { count: 'exact', head: true })
        .eq('queue_id', queue.id)
        .eq('status', 'pending');

      const { count: totalCount } = await supabase
        .from('call_queue_items')
        .select('*', { count: 'exact', head: true })
        .eq('queue_id', queue.id);

      return {
        ...queue,
        pending_count: pendingCount || 0,
        total_count: totalCount || 0
      };
    })
  );

  return queuesWithCounts;
};

/**
 * Get call queue by ID
 */
const getCallQueueById = async (userId, queueId) => {
  const { data, error } = await supabase
    .from('call_queues')
    .select('*')
    .eq('id', queueId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create a new call queue
 */
const createCallQueue = async (userId, queueData) => {
  const {
    name,
    description,
    priority,
    autoDialEnabled,
    autoDialIntervalSeconds,
    activeHours,
    timezone,
    isActive
  } = queueData;

  const { data, error } = await supabase
    .from('call_queues')
    .insert({
      user_id: userId,
      name,
      description,
      priority: priority || 1,
      auto_dial_enabled: autoDialEnabled || false,
      auto_dial_interval_seconds: autoDialIntervalSeconds || 60,
      active_hours: activeHours || {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' }
      },
      timezone: timezone || 'America/New_York',
      is_active: isActive !== undefined ? isActive : true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a call queue
 */
const updateCallQueue = async (userId, queueId, queueData) => {
  const {
    name,
    description,
    priority,
    autoDialEnabled,
    autoDialIntervalSeconds,
    activeHours,
    timezone,
    isActive
  } = queueData;

  const updateData = {
    updated_at: new Date()
  };

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (priority !== undefined) updateData.priority = priority;
  if (autoDialEnabled !== undefined) updateData.auto_dial_enabled = autoDialEnabled;
  if (autoDialIntervalSeconds !== undefined) updateData.auto_dial_interval_seconds = autoDialIntervalSeconds;
  if (activeHours !== undefined) updateData.active_hours = activeHours;
  if (timezone !== undefined) updateData.timezone = timezone;
  if (isActive !== undefined) updateData.is_active = isActive;

  const { data, error } = await supabase
    .from('call_queues')
    .update(updateData)
    .eq('id', queueId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a call queue
 */
const deleteCallQueue = async (userId, queueId) => {
  const { error } = await supabase
    .from('call_queues')
    .delete()
    .eq('id', queueId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};

// ===========================================================================
// CALL QUEUE ITEMS
// ===========================================================================

/**
 * Get all items in a queue
 */
const getQueueItems = async (userId, queueId, filters = {}) => {
  let query = supabase
    .from('call_queue_items')
    .select(`
      *,
      queue:call_queues(*),
      lead:leads(*),
      contact:contacts(*),
      assigned_user:assigned_to(id, email)
    `)
    .eq('queue_id', queueId)
    .order('priority', { ascending: false })
    .order('next_attempt_at', { ascending: true });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Add lead to call queue
 */
const addLeadToQueue = async (userId, queueId, leadId, itemData = {}) => {
  const {
    contactId,
    priority,
    maxAttempts,
    nextAttemptAt,
    assignedTo,
    notes
  } = itemData;

  // Check if lead already in queue
  const { data: existing } = await supabase
    .from('call_queue_items')
    .select('*')
    .eq('queue_id', queueId)
    .eq('lead_id', leadId)
    .eq('status', 'pending')
    .single();

  if (existing) {
    throw new Error('Lead already in this queue');
  }

  const { data, error } = await supabase
    .from('call_queue_items')
    .insert({
      queue_id: queueId,
      lead_id: leadId,
      contact_id: contactId,
      user_id: userId,
      assigned_to: assignedTo || userId,
      status: 'pending',
      priority: priority || 0,
      max_attempts: maxAttempts || 3,
      attempts: 0,
      next_attempt_at: nextAttemptAt || new Date(),
      notes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Add multiple leads to queue
 */
const addMultipleLeadsToQueue = async (userId, queueId, leadIds, options = {}) => {
  const {
    priority,
    maxAttempts,
    assignedTo
  } = options;

  const items = leadIds.map(leadId => ({
    queue_id: queueId,
    lead_id: leadId,
    user_id: userId,
    assigned_to: assignedTo || userId,
    status: 'pending',
    priority: priority || 0,
    max_attempts: maxAttempts || 3,
    attempts: 0,
    next_attempt_at: new Date()
  }));

  const { data, error } = await supabase
    .from('call_queue_items')
    .insert(items)
    .select();

  if (error) throw error;
  return data;
};

/**
 * Update queue item
 */
const updateQueueItem = async (userId, itemId, updateData) => {
  const {
    status,
    priority,
    maxAttempts,
    nextAttemptAt,
    callbackScheduledAt,
    disposition,
    notes,
    assignedTo
  } = updateData;

  const update = {
    updated_at: new Date()
  };

  if (status !== undefined) update.status = status;
  if (priority !== undefined) update.priority = priority;
  if (maxAttempts !== undefined) update.max_attempts = maxAttempts;
  if (nextAttemptAt !== undefined) update.next_attempt_at = nextAttemptAt;
  if (callbackScheduledAt !== undefined) update.callback_scheduled_at = callbackScheduledAt;
  if (disposition !== undefined) update.disposition = disposition;
  if (notes !== undefined) update.notes = notes;
  if (assignedTo !== undefined) update.assigned_to = assignedTo;

  const { data, error } = await supabase
    .from('call_queue_items')
    .update(update)
    .eq('id', itemId)
    .or(`user_id.eq.${userId},assigned_to.eq.${userId}`)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Remove item from queue
 */
const removeFromQueue = async (userId, itemId) => {
  const { error } = await supabase
    .from('call_queue_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};

/**
 * Get next item to call
 */
const getNextItemToCall = async (userId, queueId = null) => {
  const now = new Date();

  let query = supabase
    .from('call_queue_items')
    .select(`
      *,
      queue:call_queues(*),
      lead:leads(*),
      contact:contacts(*)
    `)
    .or(`assigned_to.eq.${userId},user_id.eq.${userId}`)
    .eq('status', 'pending')
    .lte('next_attempt_at', now.toISOString())
    .order('priority', { ascending: false })
    .order('next_attempt_at', { ascending: true })
    .limit(1);

  if (queueId) {
    query = query.eq('queue_id', queueId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data && data.length > 0 ? data[0] : null;
};

/**
 * Get queue statistics
 */
const getQueueStats = async (userId, queueId) => {
  // Get all items in queue
  const { data: items } = await supabase
    .from('call_queue_items')
    .select('*')
    .eq('queue_id', queueId);

  const stats = {
    total: items?.length || 0,
    pending: items?.filter(i => i.status === 'pending').length || 0,
    in_progress: items?.filter(i => i.status === 'in_progress').length || 0,
    completed: items?.filter(i => i.status === 'completed').length || 0,
    disposed: items?.filter(i => i.status === 'disposed').length || 0,
    callback: items?.filter(i => i.status === 'callback').length || 0,
    completion_rate: 0,
    average_attempts: 0
  };

  if (stats.total > 0) {
    stats.completion_rate = Math.round((stats.completed / stats.total) * 100);
    stats.average_attempts = Math.round(
      items.reduce((sum, item) => sum + item.attempts, 0) / stats.total * 10
    ) / 10;
  }

  return stats;
};

/**
 * Bulk update queue items status
 */
const bulkUpdateStatus = async (userId, itemIds, status, disposition = null) => {
  const updateData = {
    status,
    updated_at: new Date()
  };

  if (disposition) {
    updateData.disposition = disposition;
  }

  const { data, error } = await supabase
    .from('call_queue_items')
    .update(updateData)
    .in('id', itemIds)
    .eq('user_id', userId)
    .select();

  if (error) throw error;
  return data;
};

/**
 * Schedule callback for queue item
 */
const scheduleCallback = async (userId, itemId, callbackTime, notes = null) => {
  const updateData = {
    status: 'callback',
    callback_scheduled_at: callbackTime,
    next_attempt_at: callbackTime,
    updated_at: new Date()
  };

  if (notes) {
    updateData.notes = notes;
  }

  const { data, error } = await supabase
    .from('call_queue_items')
    .update(updateData)
    .eq('id', itemId)
    .or(`user_id.eq.${userId},assigned_to.eq.${userId}`)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get callbacks scheduled for today
 */
const getTodayCallbacks = async (userId) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const { data, error } = await supabase
    .from('call_queue_items')
    .select(`
      *,
      queue:call_queues(*),
      lead:leads(*),
      contact:contacts(*)
    `)
    .or(`assigned_to.eq.${userId},user_id.eq.${userId}`)
    .eq('status', 'callback')
    .gte('callback_scheduled_at', startOfDay.toISOString())
    .lte('callback_scheduled_at', endOfDay.toISOString())
    .order('callback_scheduled_at', { ascending: true });

  if (error) throw error;
  return data;
};

// ===========================================================================
// EXPORTS
// ===========================================================================

export default {
  // Queue management
  getCallQueues,
  getCallQueueById,
  createCallQueue,
  updateCallQueue,
  deleteCallQueue,

  // Queue items
  getQueueItems,
  addLeadToQueue,
  addMultipleLeadsToQueue,
  updateQueueItem,
  removeFromQueue,
  getNextItemToCall,
  getQueueStats,
  bulkUpdateStatus,
  scheduleCallback,
  getTodayCallbacks
};
