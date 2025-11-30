import { supabase } from '../config/supabase-auth.js';

/**
 * Service for managing CRM-specific calendar events
 * This aggregates events from various CRM modules (campaigns, calls, webinars, etc.)
 */
class CRMCalendarEventsService {
  /**
   * Get all CRM events for calendar display
   */
  async getCRMEvents(userId, { startDate, endDate, categories }) {
    try {
      const events = [];

      // Fetch events based on enabled categories
      if (categories.sales?.enabled) {
        const salesEvents = await this.getSalesEvents(userId, startDate, endDate, categories.sales.subcategories);
        events.push(...salesEvents);
      }

      if (categories.marketing?.enabled) {
        const marketingEvents = await this.getMarketingEvents(userId, startDate, endDate, categories.marketing.subcategories);
        events.push(...marketingEvents);
      }

      if (categories.service?.enabled) {
        const serviceEvents = await this.getServiceEvents(userId, startDate, endDate, categories.service.subcategories);
        events.push(...serviceEvents);
      }

      return events;
    } catch (error) {
      console.error('Error getting CRM events:', error);
      throw error;
    }
  }

  /**
   * Get Sales category events
   */
  async getSalesEvents(userId, startDate, endDate, subcategories) {
    const events = [];

    try {
      // Sales Calls
      if (subcategories.salesCalls) {
        const calls = await this.getSalesCalls(userId, startDate, endDate);
        events.push(...calls);
      }

      // Meetings
      if (subcategories.meetings) {
        const meetings = await this.getMeetings(userId, startDate, endDate);
        events.push(...meetings);
      }

      // Demos
      if (subcategories.demos) {
        const demos = await this.getDemos(userId, startDate, endDate);
        events.push(...demos);
      }

      // Follow-ups
      if (subcategories.followUps) {
        const followUps = await this.getFollowUps(userId, startDate, endDate);
        events.push(...followUps);
      }

      // Closing Events
      if (subcategories.closingEvents) {
        const closingEvents = await this.getClosingEvents(userId, startDate, endDate);
        events.push(...closingEvents);
      }

      return events;
    } catch (error) {
      console.error('Error getting sales events:', error);
      return [];
    }
  }

  /**
   * Get Marketing category events
   */
  async getMarketingEvents(userId, startDate, endDate, subcategories) {
    const events = [];

    try {
      // Email Campaigns
      if (subcategories.emailCampaigns) {
        const campaigns = await this.getEmailCampaigns(userId, startDate, endDate);
        events.push(...campaigns);
      }

      // Webinars
      if (subcategories.webinars) {
        const webinars = await this.getWebinars(userId, startDate, endDate);
        events.push(...webinars);
      }

      // Content Publishing
      if (subcategories.contentPublishing) {
        const content = await this.getContentPublishing(userId, startDate, endDate);
        events.push(...content);
      }

      // Social Media Posts
      if (subcategories.socialMediaPosts) {
        const social = await this.getSocialMediaPosts(userId, startDate, endDate);
        events.push(...social);
      }

      // Ad Campaigns
      if (subcategories.adCampaigns) {
        const ads = await this.getAdCampaigns(userId, startDate, endDate);
        events.push(...ads);
      }

      return events;
    } catch (error) {
      console.error('Error getting marketing events:', error);
      return [];
    }
  }

  /**
   * Get Service category events
   */
  async getServiceEvents(userId, startDate, endDate, subcategories) {
    const events = [];

    try {
      // Support Calls
      if (subcategories.supportCalls) {
        const support = await this.getSupportCalls(userId, startDate, endDate);
        events.push(...support);
      }

      // Maintenance Windows
      if (subcategories.maintenanceWindows) {
        const maintenance = await this.getMaintenanceWindows(userId, startDate, endDate);
        events.push(...maintenance);
      }

      // Customer Check-ins
      if (subcategories.customerCheckIns) {
        const checkIns = await this.getCustomerCheckIns(userId, startDate, endDate);
        events.push(...checkIns);
      }

      // Training Sessions
      if (subcategories.trainingsSessions) {
        const training = await this.getTrainingSessions(userId, startDate, endDate);
        events.push(...training);
      }

      // Renewal Reminders
      if (subcategories.renewalReminders) {
        const renewals = await this.getRenewalReminders(userId, startDate, endDate);
        events.push(...renewals);
      }

      return events;
    } catch (error) {
      console.error('Error getting service events:', error);
      return [];
    }
  }

  // Sales Event Fetchers
  async getSalesCalls(userId, startDate, endDate) {
    // Query opportunities or activities table for scheduled calls
    const { data } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'call')
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate);

    return (data || []).map(activity => ({
      id: `sales-call-${activity.id}`,
      title: activity.title || 'Sales Call',
      start: activity.scheduled_at,
      end: this.addMinutes(activity.scheduled_at, activity.duration || 30),
      category: 'sales',
      subcategory: 'salesCalls',
      color: '#3b82f6', // Blue
      type: 'crm',
      metadata: activity,
    }));
  }

  async getMeetings(userId, startDate, endDate) {
    const { data } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'meeting')
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate);

    return (data || []).map(activity => ({
      id: `meeting-${activity.id}`,
      title: activity.title || 'Meeting',
      start: activity.scheduled_at,
      end: this.addMinutes(activity.scheduled_at, activity.duration || 60),
      category: 'sales',
      subcategory: 'meetings',
      color: '#8b5cf6', // Purple
      type: 'crm',
      metadata: activity,
    }));
  }

  async getDemos(userId, startDate, endDate) {
    const { data } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'demo')
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate);

    return (data || []).map(activity => ({
      id: `demo-${activity.id}`,
      title: activity.title || 'Product Demo',
      start: activity.scheduled_at,
      end: this.addMinutes(activity.scheduled_at, activity.duration || 45),
      category: 'sales',
      subcategory: 'demos',
      color: '#10b981', // Green
      type: 'crm',
      metadata: activity,
    }));
  }

  async getFollowUps(userId, startDate, endDate) {
    const { data } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'follow_up')
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate);

    return (data || []).map(activity => ({
      id: `followup-${activity.id}`,
      title: activity.title || 'Follow-up',
      start: activity.scheduled_at,
      end: this.addMinutes(activity.scheduled_at, activity.duration || 15),
      category: 'sales',
      subcategory: 'followUps',
      color: '#f59e0b', // Amber
      type: 'crm',
      metadata: activity,
    }));
  }

  async getClosingEvents(userId, startDate, endDate) {
    const { data } = await supabase
      .from('opportunities')
      .select('*')
      .eq('user_id', userId)
      .eq('stage', 'closing')
      .gte('expected_close_date', startDate)
      .lte('expected_close_date', endDate);

    return (data || []).map(opp => ({
      id: `closing-${opp.id}`,
      title: `Close: ${opp.name}`,
      start: opp.expected_close_date,
      end: opp.expected_close_date,
      allDay: true,
      category: 'sales',
      subcategory: 'closingEvents',
      color: '#ef4444', // Red
      type: 'crm',
      metadata: opp,
    }));
  }

  // Marketing Event Fetchers
  async getEmailCampaigns(userId, startDate, endDate) {
    const { data } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate);

    return (data || []).map(campaign => ({
      id: `campaign-${campaign.id}`,
      title: campaign.name || 'Email Campaign',
      start: campaign.scheduled_at,
      end: campaign.scheduled_at,
      allDay: false,
      category: 'marketing',
      subcategory: 'emailCampaigns',
      color: '#ec4899', // Pink
      type: 'crm',
      metadata: campaign,
    }));
  }

  async getWebinars(userId, startDate, endDate) {
    const { data } = await supabase
      .from('webinars')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate);

    return (data || []).map(webinar => ({
      id: `webinar-${webinar.id}`,
      title: webinar.title || 'Webinar',
      start: webinar.scheduled_at,
      end: this.addMinutes(webinar.scheduled_at, webinar.duration || 60),
      category: 'marketing',
      subcategory: 'webinars',
      color: '#06b6d4', // Cyan
      type: 'crm',
      metadata: webinar,
    }));
  }

  async getContentPublishing(userId, startDate, endDate) {
    const { data } = await supabase
      .from('content_schedule')
      .select('*')
      .eq('user_id', userId)
      .gte('publish_date', startDate)
      .lte('publish_date', endDate);

    return (data || []).map(content => ({
      id: `content-${content.id}`,
      title: content.title || 'Content Publishing',
      start: content.publish_date,
      end: content.publish_date,
      allDay: true,
      category: 'marketing',
      subcategory: 'contentPublishing',
      color: '#8b5cf6', // Purple
      type: 'crm',
      metadata: content,
    }));
  }

  async getSocialMediaPosts(userId, startDate, endDate) {
    const { data } = await supabase
      .from('social_media_schedule')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate);

    return (data || []).map(post => ({
      id: `social-${post.id}`,
      title: post.content ? `Social: ${post.content.substring(0, 30)}...` : 'Social Media Post',
      start: post.scheduled_at,
      end: post.scheduled_at,
      allDay: false,
      category: 'marketing',
      subcategory: 'socialMediaPosts',
      color: '#14b8a6', // Teal
      type: 'crm',
      metadata: post,
    }));
  }

  async getAdCampaigns(userId, startDate, endDate) {
    const { data } = await supabase
      .from('ad_campaigns')
      .select('*')
      .eq('user_id', userId)
      .gte('start_date', startDate)
      .lte('end_date', endDate);

    return (data || []).map(campaign => ({
      id: `ad-${campaign.id}`,
      title: campaign.name || 'Ad Campaign',
      start: campaign.start_date,
      end: campaign.end_date,
      allDay: true,
      category: 'marketing',
      subcategory: 'adCampaigns',
      color: '#f97316', // Orange
      type: 'crm',
      metadata: campaign,
    }));
  }

  // Service Event Fetchers
  async getSupportCalls(userId, startDate, endDate) {
    const { data } = await supabase
      .from('support_calls')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate);

    return (data || []).map(call => ({
      id: `support-${call.id}`,
      title: call.title || 'Support Call',
      start: call.scheduled_at,
      end: this.addMinutes(call.scheduled_at, call.duration || 30),
      category: 'service',
      subcategory: 'supportCalls',
      color: '#6366f1', // Indigo
      type: 'crm',
      metadata: call,
    }));
  }

  async getMaintenanceWindows(userId, startDate, endDate) {
    const { data } = await supabase
      .from('maintenance_windows')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate)
      .lte('end_time', endDate);

    return (data || []).map(window => ({
      id: `maintenance-${window.id}`,
      title: window.title || 'Maintenance Window',
      start: window.start_time,
      end: window.end_time,
      category: 'service',
      subcategory: 'maintenanceWindows',
      color: '#71717a', // Gray
      type: 'crm',
      metadata: window,
    }));
  }

  async getCustomerCheckIns(userId, startDate, endDate) {
    const { data } = await supabase
      .from('customer_checkins')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate);

    return (data || []).map(checkin => ({
      id: `checkin-${checkin.id}`,
      title: checkin.title || 'Customer Check-in',
      start: checkin.scheduled_at,
      end: this.addMinutes(checkin.scheduled_at, 30),
      category: 'service',
      subcategory: 'customerCheckIns',
      color: '#10b981', // Green
      type: 'crm',
      metadata: checkin,
    }));
  }

  async getTrainingSessions(userId, startDate, endDate) {
    const { data } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate);

    return (data || []).map(training => ({
      id: `training-${training.id}`,
      title: training.title || 'Training Session',
      start: training.scheduled_at,
      end: this.addMinutes(training.scheduled_at, training.duration || 60),
      category: 'service',
      subcategory: 'trainingsSessions',
      color: '#3b82f6', // Blue
      type: 'crm',
      metadata: training,
    }));
  }

  async getRenewalReminders(userId, startDate, endDate) {
    const { data } = await supabase
      .from('contracts')
      .select('*')
      .eq('user_id', userId)
      .gte('renewal_date', startDate)
      .lte('renewal_date', endDate);

    return (data || []).map(contract => ({
      id: `renewal-${contract.id}`,
      title: `Renewal: ${contract.customer_name}`,
      start: contract.renewal_date,
      end: contract.renewal_date,
      allDay: true,
      category: 'service',
      subcategory: 'renewalReminders',
      color: '#f59e0b', // Amber
      type: 'crm',
      metadata: contract,
    }));
  }

  // Helper function to add minutes to a date
  addMinutes(dateString, minutes) {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + minutes);
    return date.toISOString();
  }
}

const crmCalendarEventsService = new CRMCalendarEventsService();
export default crmCalendarEventsService;
