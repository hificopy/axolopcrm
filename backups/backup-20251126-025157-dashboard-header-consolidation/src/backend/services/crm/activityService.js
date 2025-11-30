import { createClient } from '@supabase/supabase-js';

// Only create Supabase client if credentials are available
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY.length > 50
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const activityService = {
  /**
   * Get all activities for a user
   */
  async getActivities(userId) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          lead:lead_id (
            id,
            name,
            email
          ),
          contact:contact_id (
            id,
            first_name,
            last_name,
            email
          ),
          opportunity:opportunity_id (
            id,
            name,
            amount
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include computed name for contacts
      const transformedData = (data || []).map(activity => ({
        ...activity,
        contact: activity.contact ? {
          ...activity.contact,
          name: `${activity.contact.first_name || ''} ${activity.contact.last_name || ''}`.trim()
        } : null
      }));

      return transformedData;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  },

  /**
   * Get a single activity by ID
   */
  async getActivityById(userId, activityId) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          lead:lead_id (
            id,
            name,
            email
          ),
          contact:contact_id (
            id,
            first_name,
            last_name,
            email
          ),
          opportunity:opportunity_id (
            id,
            name,
            amount
          )
        `)
        .eq('id', activityId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Transform contact to include computed name
      if (data && data.contact) {
        data.contact.name = `${data.contact.first_name || ''} ${data.contact.last_name || ''}`.trim();
      }

      return data;
    } catch (error) {
      console.error('Error fetching activity by ID:', error);
      throw error;
    }
  },

  /**
   * Create a new activity
   */
  async createActivity(userId, activityData) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([
          {
            user_id: userId,
            type: activityData.type,
            title: activityData.title,
            description: activityData.description,
            status: activityData.status || 'PENDING',
            due_date: activityData.due_date,
            lead_id: activityData.lead_id,
            contact_id: activityData.contact_id,
            opportunity_id: activityData.opportunity_id,
            notes: activityData.notes,
            metadata: activityData.metadata || {},
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },

  /**
   * Update an existing activity
   */
  async updateActivity(userId, activityId, activityData) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update({
          type: activityData.type,
          title: activityData.title,
          description: activityData.description,
          status: activityData.status,
          due_date: activityData.due_date,
          lead_id: activityData.lead_id,
          contact_id: activityData.contact_id,
          opportunity_id: activityData.opportunity_id,
          notes: activityData.notes,
          metadata: activityData.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activityId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  /**
   * Delete an activity
   */
  async deleteActivity(userId, activityId) {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },

  /**
   * Get activities by lead ID
   */
  async getActivitiesByLead(userId, leadId) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activities by lead:', error);
      throw error;
    }
  },

  /**
   * Get activities by opportunity ID
   */
  async getActivitiesByOpportunity(userId, opportunityId) {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching activities by opportunity:', error);
      throw error;
    }
  },
};

export default activityService;
