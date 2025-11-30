import { supabase } from '../config/supabase-auth.js';
import logger from './logger.js';
import cacheService from './cache.js';

/**
 * Analytics and reporting utilities
 */

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(userId, dateRange = 'week') {
  const cacheKey = `stats:dashboard:${userId}:${dateRange}`;

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const { startDate, endDate } = getDateRange(dateRange);

      const [leads, contacts, opportunities, workflows, emails] = await Promise.all([
        getLeadStats(userId, startDate, endDate),
        getContactStats(userId, startDate, endDate),
        getOpportunityStats(userId, startDate, endDate),
        getWorkflowStats(userId, startDate, endDate),
        getEmailStats(userId, startDate, endDate),
      ]);

      return {
        leads,
        contacts,
        opportunities,
        workflows,
        emails,
        dateRange: { startDate, endDate },
        generatedAt: new Date().toISOString(),
      };
    },
    300 // Cache for 5 minutes
  );
}

/**
 * Get lead statistics
 */
async function getLeadStats(userId, startDate, endDate) {
  try {
    // Total leads
    const { count: total } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // New leads in period
    const { count: newLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Leads by status
    const { data: byStatus } = await supabase
      .from('leads')
      .select('status')
      .eq('user_id', userId);

    const statusCounts = {};
    byStatus?.forEach((lead) => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });

    // Average lead score
    const { data: scores } = await supabase
      .from('leads')
      .select('lead_score')
      .eq('user_id', userId)
      .not('lead_score', 'is', null);

    const avgScore =
      scores && scores.length > 0
        ? scores.reduce((sum, l) => sum + (l.lead_score || 0), 0) / scores.length
        : 0;

    return {
      total,
      new: newLeads,
      byStatus: statusCounts,
      avgScore: Math.round(avgScore),
    };
  } catch (error) {
    logger.error('Error getting lead stats', { error: error.message });
    return { total: 0, new: 0, byStatus: {}, avgScore: 0 };
  }
}

/**
 * Get contact statistics
 */
async function getContactStats(userId, startDate, endDate) {
  try {
    const { count: total } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: newContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    return {
      total,
      new: newContacts,
    };
  } catch (error) {
    logger.error('Error getting contact stats', { error: error.message });
    return { total: 0, new: 0 };
  }
}

/**
 * Get opportunity statistics
 */
async function getOpportunityStats(userId, startDate, endDate) {
  try {
    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('stage, amount')
      .eq('user_id', userId);

    const byStage = {};
    let totalValue = 0;
    let wonValue = 0;

    opportunities?.forEach((opp) => {
      byStage[opp.stage] = (byStage[opp.stage] || 0) + 1;
      totalValue += opp.amount || 0;

      if (opp.stage === 'CLOSED_WON') {
        wonValue += opp.amount || 0;
      }
    });

    return {
      total: opportunities?.length || 0,
      byStage,
      totalValue,
      wonValue,
    };
  } catch (error) {
    logger.error('Error getting opportunity stats', { error: error.message });
    return { total: 0, byStage: {}, totalValue: 0, wonValue: 0 };
  }
}

/**
 * Get workflow statistics
 */
async function getWorkflowStats(userId, startDate, endDate) {
  try {
    const { count: total } = await supabase
      .from('automation_workflows')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId);

    const { count: active } = await supabase
      .from('automation_workflows')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)
      .eq('is_active', true);

    return {
      total,
      active,
      inactive: total - active,
    };
  } catch (error) {
    logger.error('Error getting workflow stats', { error: error.message });
    return { total: 0, active: 0, inactive: 0 };
  }
}

/**
 * Get email statistics
 */
async function getEmailStats(userId, startDate, endDate) {
  try {
    const { data: campaigns } = await supabase
      .from('email_campaigns')
      .select('total_sent, total_opened, total_clicked, total_bounced')
      .eq('created_by', userId);

    let sent = 0;
    let opened = 0;
    let clicked = 0;
    let bounced = 0;

    campaigns?.forEach((campaign) => {
      sent += campaign.total_sent || 0;
      opened += campaign.total_opened || 0;
      clicked += campaign.total_clicked || 0;
      bounced += campaign.total_bounced || 0;
    });

    const openRate = sent > 0 ? ((opened / sent) * 100).toFixed(2) : 0;
    const clickRate = sent > 0 ? ((clicked / sent) * 100).toFixed(2) : 0;
    const bounceRate = sent > 0 ? ((bounced / sent) * 100).toFixed(2) : 0;

    return {
      sent,
      opened,
      clicked,
      bounced,
      openRate: parseFloat(openRate),
      clickRate: parseFloat(clickRate),
      bounceRate: parseFloat(bounceRate),
    };
  } catch (error) {
    logger.error('Error getting email stats', { error: error.message });
    return {
      sent: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
    };
  }
}

/**
 * Get date range
 */
function getDateRange(range) {
  const endDate = new Date();
  const startDate = new Date();

  switch (range) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

/**
 * Get activity timeline
 */
export async function getActivityTimeline(userId, limit = 20) {
  try {
    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return activities || [];
  } catch (error) {
    logger.error('Error getting activity timeline', { error: error.message });
    return [];
  }
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(userId) {
  try {
    const { data: leads } = await supabase
      .from('leads')
      .select('status')
      .eq('user_id', userId);

    const funnel = {
      new: 0,
      qualified: 0,
      contacted: 0,
      converted: 0,
    };

    leads?.forEach((lead) => {
      switch (lead.status) {
        case 'NEW':
          funnel.new++;
          break;
        case 'QUALIFIED':
          funnel.qualified++;
          break;
        case 'CONTACTED':
          funnel.contacted++;
          break;
      }
    });

    // Get converted (opportunities)
    const { count: converted } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('stage', 'CLOSED_WON');

    funnel.converted = converted || 0;

    // Calculate conversion rates
    const total = funnel.new || 1;
    const rates = {
      newToQualified: ((funnel.qualified / total) * 100).toFixed(2),
      qualifiedToContacted: ((funnel.contacted / (funnel.qualified || 1)) * 100).toFixed(2),
      contactedToConverted: ((funnel.converted / (funnel.contacted || 1)) * 100).toFixed(2),
      overallConversion: ((funnel.converted / total) * 100).toFixed(2),
    };

    return {
      funnel,
      rates,
    };
  } catch (error) {
    logger.error('Error getting conversion funnel', { error: error.message });
    return {
      funnel: { new: 0, qualified: 0, contacted: 0, converted: 0 },
      rates: {
        newToQualified: 0,
        qualifiedToContacted: 0,
        contactedToConverted: 0,
        overallConversion: 0,
      },
    };
  }
}

/**
 * Get revenue analytics
 */
export async function getRevenueAnalytics(userId, dateRange = 'month') {
  const { startDate, endDate } = getDateRange(dateRange);

  try {
    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('amount, stage, close_date')
      .eq('user_id', userId)
      .gte('close_date', startDate)
      .lte('close_date', endDate);

    let totalRevenue = 0;
    let pipelineValue = 0;
    let wonDeals = 0;
    let lostDeals = 0;

    opportunities?.forEach((opp) => {
      if (opp.stage === 'CLOSED_WON') {
        totalRevenue += opp.amount || 0;
        wonDeals++;
      } else if (opp.stage === 'CLOSED_LOST') {
        lostDeals++;
      } else {
        pipelineValue += opp.amount || 0;
      }
    });

    const winRate =
      wonDeals + lostDeals > 0 ? ((wonDeals / (wonDeals + lostDeals)) * 100).toFixed(2) : 0;

    return {
      totalRevenue,
      pipelineValue,
      wonDeals,
      lostDeals,
      winRate: parseFloat(winRate),
      avgDealSize: wonDeals > 0 ? totalRevenue / wonDeals : 0,
    };
  } catch (error) {
    logger.error('Error getting revenue analytics', { error: error.message });
    return {
      totalRevenue: 0,
      pipelineValue: 0,
      wonDeals: 0,
      lostDeals: 0,
      winRate: 0,
      avgDealSize: 0,
    };
  }
}

export default {
  getDashboardStats,
  getActivityTimeline,
  getConversionFunnel,
  getRevenueAnalytics,
};
