import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import fetch from 'node-fetch';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Call Service - Manages all call-related operations
 * Supports insurance agents with comprehensive call management
 */

// ===========================================================================
// CALL MANAGEMENT
// ===========================================================================

/**
 * Initiate an outbound call
 */
const initiateCall = async (userId, callData) => {
  const {
    leadId,
    contactId,
    phoneNumber,
    queueItemId,
    scriptTemplateId,
    callerId
  } = callData;

  try {
    // Create call record
    const { data: call, error: callError } = await supabase
      .from('calls')
      .insert({
        user_id: userId,
        lead_id: leadId,
        contact_id: contactId,
        queue_item_id: queueItemId,
        direction: 'outbound',
        phone_number: phoneNumber,
        caller_id: callerId || process.env.TWILIO_PHONE_NUMBER,
        status: 'initiated',
        script_template_id: scriptTemplateId,
        started_at: new Date()
      })
      .select()
      .single();

    if (callError) throw callError;

    // Initiate Twilio call
    const twilioCall = await twilioClient.calls.create({
      to: phoneNumber,
      from: callerId || process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.BACKEND_URL}/api/calls/voice/${call.id}`,
      statusCallback: `${process.env.BACKEND_URL}/api/calls/status/${call.id}`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      record: true,
      recordingStatusCallback: `${process.env.BACKEND_URL}/api/calls/recording/${call.id}`
    });

    // Update call with Twilio SID
    const { data: updatedCall, error: updateError } = await supabase
      .from('calls')
      .update({
        provider_call_id: twilioCall.sid,
        status: 'ringing'
      })
      .eq('id', call.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return updatedCall;
  } catch (error) {
    console.error('Error initiating call:', error);
    throw error;
  }
};

/**
 * Update call status
 */
const updateCallStatus = async (callId, statusData) => {
  const {
    status,
    answeredAt,
    endedAt,
    durationSeconds,
    talkTimeSeconds,
    disposition,
    recordingUrl,
    recordingDurationSeconds
  } = statusData;

  const updateData = {
    status,
    updated_at: new Date()
  };

  if (answeredAt) updateData.answered_at = answeredAt;
  if (endedAt) updateData.ended_at = endedAt;
  if (durationSeconds !== undefined) updateData.duration_seconds = durationSeconds;
  if (talkTimeSeconds !== undefined) updateData.talk_time_seconds = talkTimeSeconds;
  if (disposition) updateData.disposition = disposition;
  if (recordingUrl) {
    updateData.recording_url = recordingUrl;
    updateData.has_recording = true;
  }
  if (recordingDurationSeconds !== undefined) {
    updateData.recording_duration_seconds = recordingDurationSeconds;
  }

  const { data, error } = await supabase
    .from('calls')
    .update(updateData)
    .eq('id', callId)
    .select()
    .single();

  if (error) throw error;

  // If call ended, update queue item if exists
  if (status === 'ended' && data.queue_item_id) {
    await updateQueueItemAfterCall(data.queue_item_id, disposition);
  }

  return data;
};

/**
 * Get call by ID
 */
const getCallById = async (userId, callId) => {
  const { data, error } = await supabase
    .from('calls')
    .select(`
      *,
      lead:leads(*),
      contact:contacts(*),
      script_template:sales_script_templates(*),
      transcript:call_transcripts(*),
      comments:call_comments(*)
    `)
    .eq('id', callId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get calls for a user with filtering
 */
const getCalls = async (userId, filters = {}) => {
  let query = supabase
    .from('calls')
    .select(`
      *,
      lead:leads(id, name, email),
      contact:contacts(id, first_name, last_name, email)
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  // Apply filters
  if (filters.leadId) query = query.eq('lead_id', filters.leadId);
  if (filters.contactId) query = query.eq('contact_id', filters.contactId);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.disposition) query = query.eq('disposition', filters.disposition);
  if (filters.direction) query = query.eq('direction', filters.direction);
  if (filters.startDate) query = query.gte('started_at', filters.startDate);
  if (filters.endDate) query = query.lte('started_at', filters.endDate);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Add comment to call
 */
const addCallComment = async (userId, callId, commentData) => {
  const { comment, commentType, isPrivate, mentionedUsers } = commentData;

  const { data, error } = await supabase
    .from('call_comments')
    .insert({
      call_id: callId,
      user_id: userId,
      comment,
      comment_type: commentType || 'note',
      is_private: isPrivate || false,
      mentioned_users: mentionedUsers || []
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get call comments
 */
const getCallComments = async (userId, callId) => {
  const { data, error } = await supabase
    .from('call_comments')
    .select('*')
    .eq('call_id', callId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Update call disposition
 */
const updateCallDisposition = async (userId, callId, disposition, notes) => {
  const { data, error } = await supabase
    .from('calls')
    .update({
      disposition,
      updated_at: new Date()
    })
    .eq('id', callId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  // Add automatic comment with disposition
  if (notes) {
    await addCallComment(userId, callId, {
      comment: notes,
      commentType: 'disposition'
    });
  }

  return data;
};

// ===========================================================================
// CALL QUEUE MANAGEMENT
// ===========================================================================

/**
 * Update queue item after call completion
 */
const updateQueueItemAfterCall = async (queueItemId, disposition) => {
  const updateData = {
    last_attempt_at: new Date(),
    updated_at: new Date()
  };

  // Determine next status based on disposition
  if (disposition === 'callback') {
    updateData.status = 'callback';
    // Set callback for tomorrow at same time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    updateData.callback_scheduled_at = tomorrow;
  } else if (disposition === 'interested' || disposition === 'completed') {
    updateData.status = 'completed';
  } else if (disposition === 'do_not_call') {
    updateData.status = 'disposed';
    updateData.disposition = 'do_not_call';
  } else if (disposition === 'no_answer' || disposition === 'busy' || disposition === 'voicemail') {
    // Check if max attempts reached
    const { data: item } = await supabase
      .from('call_queue_items')
      .select('attempts, max_attempts')
      .eq('id', queueItemId)
      .single();

    if (item && item.attempts >= item.max_attempts) {
      updateData.status = 'disposed';
      updateData.disposition = 'max_attempts_reached';
    } else {
      updateData.status = 'pending';
      // Schedule next attempt (e.g., in 4 hours)
      const nextAttempt = new Date();
      nextAttempt.setHours(nextAttempt.getHours() + 4);
      updateData.next_attempt_at = nextAttempt;
    }
  } else {
    updateData.status = 'pending';
  }

  const { data, error } = await supabase
    .from('call_queue_items')
    .update(updateData)
    .eq('id', queueItemId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get next call from queue
 */
const getNextQueueItem = async (userId, queueId = null) => {
  let query = supabase
    .from('call_queue_items')
    .select(`
      *,
      queue:call_queues(*),
      lead:leads(*),
      contact:contacts(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'pending')
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
 * Requeue a call queue item
 */
const requeueItem = async (userId, queueItemId, nextAttemptAt = null) => {
  const updateData = {
    status: 'pending',
    updated_at: new Date()
  };

  if (nextAttemptAt) {
    updateData.next_attempt_at = nextAttemptAt;
  } else {
    // Default to 1 hour from now
    const nextAttempt = new Date();
    nextAttempt.setHours(nextAttempt.getHours() + 1);
    updateData.next_attempt_at = nextAttempt;
  }

  const { data, error } = await supabase
    .from('call_queue_items')
    .update(updateData)
    .eq('id', queueItemId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Dispose a call queue item
 */
const disposeQueueItem = async (userId, queueItemId, disposition, notes) => {
  const { data, error } = await supabase
    .from('call_queue_items')
    .update({
      status: 'disposed',
      disposition,
      notes,
      updated_at: new Date()
    })
    .eq('id', queueItemId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ===========================================================================
// CALL RECORDINGS
// ===========================================================================

/**
 * Process call recording from Twilio
 */
const processCallRecording = async (callId, recordingData) => {
  const { recordingSid, recordingUrl, duration } = recordingData;

  // Update call with recording info
  const { data, error } = await supabase
    .from('calls')
    .update({
      recording_url: recordingUrl,
      recording_duration_seconds: parseInt(duration),
      has_recording: true,
      updated_at: new Date()
    })
    .eq('id', callId)
    .select()
    .single();

  if (error) throw error;

  // Trigger transcript generation (async)
  if (process.env.ENABLE_AI_TRANSCRIPTION === 'true') {
    generateTranscriptAsync(callId, recordingUrl);
  }

  return data;
};

/**
 * Generate transcript asynchronously (will be implemented in ai-call-service.js)
 */
const generateTranscriptAsync = async (callId, recordingUrl) => {
  // This will trigger the AI service to process the recording
  // Implementation in ai-call-service.js
  console.log(`Transcript generation queued for call ${callId}`);
};

// ===========================================================================
// VOICEMAIL DROP
// ===========================================================================

/**
 * Drop voicemail using template
 */
const dropVoicemail = async (userId, callId, templateId) => {
  try {
    // Get voicemail template
    const { data: template, error: templateError } = await supabase
      .from('voicemail_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', userId)
      .single();

    if (templateError) throw templateError;

    // Update call record
    const { data: call, error: callError } = await supabase
      .from('calls')
      .update({
        voicemail_template_id: templateId,
        disposition: 'voicemail',
        status: 'ended',
        ended_at: new Date()
      })
      .eq('id', callId)
      .select()
      .single();

    if (callError) throw callError;

    // Update template usage count
    await supabase
      .from('voicemail_templates')
      .update({
        usage_count: template.usage_count + 1
      })
      .eq('id', templateId);

    return call;
  } catch (error) {
    console.error('Error dropping voicemail:', error);
    throw error;
  }
};

// ===========================================================================
// CALL ANALYTICS
// ===========================================================================

/**
 * Get call analytics for date range
 */
const getCallAnalytics = async (userId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('call_analytics_daily')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get agent performance metrics
 */
const getAgentPerformance = async (userId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('agent_call_performance')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get today's call statistics
 */
const getTodayStats = async (userId) => {
  const today = new Date().toISOString().split('T')[0];

  // Get calls made today
  const { data: calls, error: callsError } = await supabase
    .from('calls')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', `${today}T00:00:00`)
    .lte('started_at', `${today}T23:59:59`);

  if (callsError) throw callsError;

  // Calculate stats
  const stats = {
    total_calls: calls.length,
    answered_calls: calls.filter(c => c.answered_at).length,
    total_talk_time_minutes: Math.round(
      calls.reduce((sum, c) => sum + (c.talk_time_seconds || 0), 0) / 60
    ),
    average_talk_time_minutes: 0,
    interested_count: calls.filter(c => c.disposition === 'interested').length,
    callback_count: calls.filter(c => c.disposition === 'callback').length,
    dispositions: {}
  };

  if (stats.answered_calls > 0) {
    stats.average_talk_time_minutes = Math.round(
      stats.total_talk_time_minutes / stats.answered_calls
    );
  }

  // Group by disposition
  calls.forEach(call => {
    if (call.disposition) {
      stats.dispositions[call.disposition] =
        (stats.dispositions[call.disposition] || 0) + 1;
    }
  });

  return stats;
};

// ===========================================================================
// EXPORTS
// ===========================================================================

export default {
  // Call management
  initiateCall,
  updateCallStatus,
  getCallById,
  getCalls,
  addCallComment,
  getCallComments,
  updateCallDisposition,

  // Queue management
  getNextQueueItem,
  requeueItem,
  disposeQueueItem,
  updateQueueItemAfterCall,

  // Recordings
  processCallRecording,

  // Voicemail
  dropVoicemail,

  // Analytics
  getCallAnalytics,
  getAgentPerformance,
  getTodayStats
};
