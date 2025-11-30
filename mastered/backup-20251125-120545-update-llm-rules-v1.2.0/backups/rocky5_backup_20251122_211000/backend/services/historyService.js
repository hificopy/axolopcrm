import { createClient } from '@supabase/supabase-js';

// Only create Supabase client if credentials are available
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY.length > 50
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const historyService = {
  /**
   * Get all history events for a user
   */
  async getHistory(userId, filters = {}) {
    try {
      let query = supabase
        .from('history_events')
        .select(`
          *,
          user:user_id (
            id,
            name,
            email
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  /**
   * Get history events for a specific entity
   */
  async getEntityHistory(userId, entityType, entityId) {
    try {
      const { data, error } = await supabase
        .from('history_events')
        .select(`
          *,
          user:user_id (
            id,
            name,
            email
          )
        `)
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching entity history:', error);
      throw error;
    }
  },

  /**
   * Create a history event
   */
  async createHistoryEvent(userId, eventData) {
    try {
      const { data, error } = await supabase
        .from('history_events')
        .insert([
          {
            user_id: userId,
            event_type: eventData.event_type,
            entity_type: eventData.entity_type,
            entity_id: eventData.entity_id,
            entity_name: eventData.entity_name,
            title: eventData.title,
            description: eventData.description,
            metadata: eventData.metadata || {},
            changes: eventData.changes || {},
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating history event:', error);
      throw error;
    }
  },

  /**
   * Log a lead event
   */
  async logLeadEvent(userId, leadId, leadName, eventType, description, changes = {}) {
    return this.createHistoryEvent(userId, {
      event_type: eventType,
      entity_type: 'LEAD',
      entity_id: leadId,
      entity_name: leadName,
      title: `Lead ${eventType.toLowerCase().replace(/_/g, ' ')}`,
      description,
      changes,
    });
  },

  /**
   * Log an opportunity event
   */
  async logOpportunityEvent(userId, opportunityId, opportunityName, eventType, description, changes = {}) {
    return this.createHistoryEvent(userId, {
      event_type: eventType,
      entity_type: 'OPPORTUNITY',
      entity_id: opportunityId,
      entity_name: opportunityName,
      title: `Opportunity ${eventType.toLowerCase().replace(/_/g, ' ')}`,
      description,
      changes,
    });
  },

  /**
   * Log a contact event
   */
  async logContactEvent(userId, contactId, contactName, eventType, description, changes = {}) {
    return this.createHistoryEvent(userId, {
      event_type: eventType,
      entity_type: 'CONTACT',
      entity_id: contactId,
      entity_name: contactName,
      title: `Contact ${eventType.toLowerCase().replace(/_/g, ' ')}`,
      description,
      changes,
    });
  },

  /**
   * Log an activity event
   */
  async logActivityEvent(userId, activityId, activityTitle, eventType, description, changes = {}) {
    return this.createHistoryEvent(userId, {
      event_type: eventType,
      entity_type: 'ACTIVITY',
      entity_id: activityId,
      entity_name: activityTitle,
      title: `Activity ${eventType.toLowerCase().replace(/_/g, ' ')}`,
      description,
      changes,
    });
  },

  /**
   * Log a meeting booking event
   */
  async logMeetingEvent(userId, bookingId, meetingName, eventType, description, changes = {}) {
    return this.createHistoryEvent(userId, {
      event_type: eventType,
      entity_type: 'MEETING',
      entity_id: bookingId,
      entity_name: meetingName,
      title: `Meeting ${eventType.toLowerCase().replace(/_/g, ' ')}`,
      description,
      changes,
    });
  },

  /**
   * Get today's bookings formatted as history events
   */
  async getTodaysBookings(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch bookings for today where the user is either the owner of the booking link or assigned
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          booking_link:booking_links(
            name,
            user_id
          )
        `)
        .gte('scheduled_time', today.toISOString())
        .lt('scheduled_time', tomorrow.toISOString())
        .or(`assigned_to.eq.${userId},booking_link.user_id.eq.${userId}`);

      if (error) throw error;

      // Transform bookings into history event format
      const bookingEvents = (data || []).map(booking => ({
        id: `booking-${booking.id}`,
        event_type: 'MEETING_BOOKED',
        entity_type: 'MEETING',
        entity_id: booking.id,
        entity_name: `${booking.booking_link?.name || 'Meeting'} with ${booking.name}`,
        title: `Meeting scheduled: ${booking.booking_link?.name || 'Meeting'}`,
        description: `${booking.name} (${booking.email}) scheduled for ${new Date(booking.scheduled_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
        created_at: booking.created_at,
        metadata: {
          scheduled_time: booking.scheduled_time,
          duration: booking.duration,
          status: booking.status,
          location_type: booking.location_type,
          email: booking.email,
          phone: booking.phone,
          company: booking.company,
        },
        user: null, // System-generated
      }));

      return bookingEvents;
    } catch (error) {
      console.error('Error fetching today\'s bookings:', error);
      return [];
    }
  },

  /**
   * Delete history events older than a specified date
   */
  async deleteOldHistory(userId, olderThan) {
    try {
      const { error } = await supabase
        .from('history_events')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', olderThan);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting old history:', error);
      throw error;
    }
  },
};

export default historyService;
