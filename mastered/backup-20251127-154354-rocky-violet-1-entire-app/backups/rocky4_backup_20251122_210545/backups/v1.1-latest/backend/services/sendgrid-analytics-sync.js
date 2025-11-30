import { createClient } from '@supabase/supabase-js';
import SendGridService from './sendgrid-service.js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * SendGrid Analytics Sync Service
 *
 * Automatically syncs SendGrid analytics data to Supabase for:
 * - Faster dashboard loading
 * - Historical data preservation
 * - Custom reporting
 */
class SendGridAnalyticsSync {
  constructor() {
    this.sendgridService = new SendGridService();
  }

  /**
   * Sync analytics for the last N days
   * @param {Number} days - Number of days to sync
   * @returns {Object} Sync result
   */
  async syncAnalytics(days = 30) {
    try {
      console.log(`Syncing SendGrid analytics for last ${days} days...`);

      const startDate = this.getDateDaysAgo(days);
      const endDate = this.getDateToday();

      // Get stats from SendGrid
      const { stats } = await this.sendgridService.getGlobalStats({
        startDate,
        endDate,
        aggregatedBy: 'day'
      });

      let syncedDays = 0;

      // Cache each day's stats in Supabase
      for (const dayStat of stats) {
        if (dayStat.stats && dayStat.stats.length > 0) {
          const date = dayStat.date;
          const metrics = dayStat.stats[0].metrics;

          const delivered = metrics.delivered || 0;
          const requests = metrics.requests || 0;

          const analyticsData = {
            date,
            provider: 'sendgrid',
            requests,
            delivered,
            opens: metrics.opens || 0,
            unique_opens: metrics.unique_opens || 0,
            clicks: metrics.clicks || 0,
            unique_clicks: metrics.unique_clicks || 0,
            bounces: (metrics.bounces || 0) + (metrics.blocks || 0),
            spam_reports: metrics.spam_reports || 0,
            unsubscribes: metrics.unsubscribes || 0,
            delivery_rate: requests > 0 ? ((delivered / requests) * 100).toFixed(2) : 0,
            open_rate: delivered > 0 ? ((metrics.unique_opens || 0) / delivered * 100).toFixed(2) : 0,
            click_rate: delivered > 0 ? ((metrics.unique_clicks || 0) / delivered * 100).toFixed(2) : 0,
            bounce_rate: requests > 0 ? (((metrics.bounces || 0) + (metrics.blocks || 0)) / requests * 100).toFixed(2) : 0
          };

          // Upsert to database
          const { error } = await supabase
            .from('email_analytics_cache')
            .upsert(analyticsData, {
              onConflict: 'date,provider'
            });

          if (error) {
            console.error(`Error syncing analytics for ${date}:`, error);
          } else {
            syncedDays++;
          }
        }
      }

      console.log(`Successfully synced ${syncedDays} days of analytics`);

      return {
        success: true,
        syncedDays,
        startDate,
        endDate
      };

    } catch (error) {
      console.error('Analytics sync error:', error);
      throw error;
    }
  }

  /**
   * Get cached analytics from Supabase
   * @param {Object} options - Query options
   * @returns {Object} Cached analytics
   */
  async getCachedAnalytics(options = {}) {
    try {
      const days = options.days || 30;
      const startDate = options.startDate || this.getDateDaysAgo(days);
      const endDate = options.endDate || this.getDateToday();

      const { data, error } = await supabase
        .from('email_analytics_cache')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('provider', 'sendgrid')
        .order('date', { ascending: false });

      if (error) throw error;

      // Calculate totals
      const totals = {
        requests: 0,
        delivered: 0,
        opens: 0,
        uniqueOpens: 0,
        clicks: 0,
        uniqueClicks: 0,
        bounces: 0,
        spamReports: 0,
        unsubscribes: 0
      };

      data.forEach(day => {
        totals.requests += day.requests || 0;
        totals.delivered += day.delivered || 0;
        totals.opens += day.opens || 0;
        totals.uniqueOpens += day.unique_opens || 0;
        totals.clicks += day.clicks || 0;
        totals.uniqueClicks += day.unique_clicks || 0;
        totals.bounces += day.bounces || 0;
        totals.spamReports += day.spam_reports || 0;
        totals.unsubscribes += day.unsubscribes || 0;
      });

      // Calculate average rates
      totals.deliveryRate = totals.requests > 0 ? ((totals.delivered / totals.requests) * 100).toFixed(2) : 0;
      totals.openRate = totals.delivered > 0 ? ((totals.uniqueOpens / totals.delivered) * 100).toFixed(2) : 0;
      totals.clickRate = totals.delivered > 0 ? ((totals.uniqueClicks / totals.delivered) * 100).toFixed(2) : 0;
      totals.bounceRate = totals.requests > 0 ? ((totals.bounces / totals.requests) * 100).toFixed(2) : 0;

      return {
        success: true,
        totals,
        dailyStats: data,
        startDate,
        endDate
      };

    } catch (error) {
      console.error('Get cached analytics error:', error);
      throw error;
    }
  }

  /**
   * Get campaign analytics from database
   * @param {String} campaignId - Campaign ID
   * @returns {Object} Campaign analytics
   */
  async getCampaignAnalytics(campaignId) {
    try {
      const { data, error } = await supabase
        .from('campaign_performance')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;

      return {
        success: true,
        analytics: data
      };

    } catch (error) {
      console.error('Get campaign analytics error:', error);
      throw error;
    }
  }

  /**
   * Get top performing campaigns
   * @param {Number} limit - Number of campaigns to return
   * @returns {Array} Top campaigns
   */
  async getTopCampaigns(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('campaign_performance')
        .select('*')
        .order('open_rate', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        campaigns: data
      };

    } catch (error) {
      console.error('Get top campaigns error:', error);
      throw error;
    }
  }

  /**
   * Get email performance summary
   * @param {Number} days - Number of days
   * @returns {Object} Performance summary
   */
  async getPerformanceSummary(days = 30) {
    try {
      const startDate = this.getDateDaysAgo(days);

      const { data, error } = await supabase
        .from('email_performance_summary')
        .select('*')
        .gte('date', startDate)
        .order('date', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        summary: data
      };

    } catch (error) {
      console.error('Get performance summary error:', error);
      throw error;
    }
  }

  /**
   * Get engagement metrics
   * @returns {Object} Engagement metrics
   */
  async getEngagementMetrics() {
    try {
      // Get last 30 days of cached analytics
      const analytics = await this.getCachedAnalytics({ days: 30 });

      // Get campaign count
      const { count: campaignCount } = await supabase
        .from('email_campaigns')
        .select('*', { count: 'exact', head: true });

      // Get active workflow count
      const { count: workflowCount } = await supabase
        .from('automation_workflows')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total contacts
      const { count: contactCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      return {
        success: true,
        metrics: {
          campaigns: {
            total: campaignCount || 0,
            activeWorkflows: workflowCount || 0
          },
          emails: {
            sent: analytics.totals.requests,
            delivered: analytics.totals.delivered,
            opened: analytics.totals.uniqueOpens,
            clicked: analytics.totals.uniqueClicks
          },
          rates: {
            deliveryRate: analytics.totals.deliveryRate,
            openRate: analytics.totals.openRate,
            clickRate: analytics.totals.clickRate,
            bounceRate: analytics.totals.bounceRate
          },
          contacts: contactCount || 0
        }
      };

    } catch (error) {
      console.error('Get engagement metrics error:', error);
      throw error;
    }
  }

  /**
   * Sync suppression lists from SendGrid
   * @returns {Object} Sync result
   */
  async syncSuppressionLists() {
    try {
      return await this.sendgridService.syncSuppressionListToSupabase();
    } catch (error) {
      console.error('Sync suppression lists error:', error);
      throw error;
    }
  }

  /**
   * Schedule automatic sync (call this from a cron job or scheduler)
   * @returns {Object} Sync results
   */
  async scheduledSync() {
    try {
      console.log('Starting scheduled SendGrid sync...');

      // Sync analytics for last 7 days (to catch any updates)
      const analyticsResult = await this.syncAnalytics(7);

      // Sync suppression lists
      const suppressionResult = await this.syncSuppressionLists();

      console.log('Scheduled sync completed');

      return {
        success: true,
        analytics: analyticsResult,
        suppressions: suppressionResult,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Scheduled sync error:', error);
      throw error;
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Get date N days ago in YYYY-MM-DD format
   * @param {Number} days - Number of days ago
   * @returns {String} Date string
   */
  getDateDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get today's date in YYYY-MM-DD format
   * @returns {String} Date string
   */
  getDateToday() {
    return new Date().toISOString().split('T')[0];
  }
}

export default SendGridAnalyticsSync;
