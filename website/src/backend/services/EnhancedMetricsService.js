/**
 * Enhanced Metrics Service
 * Provides real-time, accurate metrics calculation with proper data validation
 */

class EnhancedMetricsService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.realtimeSubscriptions = new Map();
  }

  /**
   * Get comprehensive CRM metrics with real-time accuracy
   */
  async getCRMMetrics(userId, agencyId = null, timeRange = "30d") {
    const cacheKey = `crm_metrics_${userId}_${agencyId}_${timeRange}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      // Fetch all data in parallel for better performance
      const [
        leadsData,
        contactsData,
        opportunitiesData,
        activitiesData,
        dealsData,
      ] = await Promise.all([
        this.getLeadsData(userId, agencyId, timeRange),
        this.getContactsData(userId, agencyId, timeRange),
        this.getOpportunitiesData(userId, agencyId, timeRange),
        this.getActivitiesData(userId, agencyId, timeRange),
        this.getDealsData(userId, agencyId, timeRange),
      ]);

      // Calculate comprehensive metrics
      const metrics = {
        // Lead Metrics
        leads: {
          total: leadsData.total,
          new: leadsData.byStatus?.new || 0,
          contacted: leadsData.byStatus?.contacted || 0,
          qualified: leadsData.byStatus?.qualified || 0,
          converted: leadsData.byStatus?.converted || 0,
          conversionRate: this.calculateConversionRate(leadsData.byStatus),
          averageScore: this.calculateAverageScore(leadsData.leads),
          sourceBreakdown: this.calculateSourceBreakdown(leadsData.leads),
          valueBreakdown: this.calculateValueBreakdown(leadsData.leads),
          monthlyTrend: this.calculateMonthlyTrend(leadsData.leads, timeRange),
        },

        // Contact Metrics
        contacts: {
          total: contactsData.total,
          withCompany: contactsData.withCompany || 0,
          withoutCompany: contactsData.withoutCompany || 0,
          averageDealsPerContact: this.calculateAverageDealsPerContact(
            contactsData.contacts,
            opportunitiesData.opportunities,
          ),
          recentActivity: this.calculateRecentActivity(
            contactsData.contacts,
            activitiesData.activities,
          ),
        },

        // Opportunity/Deal Metrics
        opportunities: {
          total: opportunitiesData.total,
          byStage: opportunitiesData.byStage || {},
          totalValue: opportunitiesData.totalValue,
          weightedValue: opportunitiesData.weightedValue,
          averageDealSize: this.calculateAverageDealSize(
            opportunitiesData.opportunities,
          ),
          winRate: this.calculateWinRate(opportunitiesData.opportunities),
          salesCycle: this.calculateAverageSalesCycle(
            opportunitiesData.opportunities,
          ),
          pipelineVelocity: this.calculatePipelineVelocity(
            opportunitiesData.opportunities,
          ),
          stageDistribution: this.calculateStageDistribution(
            opportunitiesData.byStage,
          ),
        },

        // Activity Metrics
        activities: {
          total: activitiesData.total,
          byType: activitiesData.byType || {},
          recentActivity: this.calculateRecentActivityTrend(
            activitiesData.activities,
            timeRange,
          ),
          completionRate: this.calculateActivityCompletionRate(
            activitiesData.activities,
          ),
        },

        // Overall Performance Metrics
        performance: {
          leadToOpportunityRate: this.calculateLeadToOpportunityRate(
            leadsData.leads,
            opportunitiesData.opportunities,
          ),
          contactEngagementRate: this.calculateContactEngagementRate(
            contactsData.contacts,
            activitiesData.activities,
          ),
          salesEfficiency: this.calculateSalesEfficiency(
            opportunitiesData.opportunities,
            activitiesData.activities,
          ),
          dataQuality: this.calculateDataQuality(
            leadsData.leads,
            contactsData.contacts,
          ),
        },

        // Time-based metrics
        timeRange,
        generatedAt: new Date().toISOString(),
        dataFreshness: await this.calculateDataFreshness(userId, agencyId),
      };

      // Cache the results
      this.cache.set(cacheKey, {
        data: metrics,
        timestamp: Date.now(),
      });

      return metrics;
    } catch (error) {
      console.error("Error calculating CRM metrics:", error);
      throw new Error(`Failed to calculate CRM metrics: ${error.message}`);
    }
  }

  /**
   * Get leads data for metrics
   */
  async getLeadsData(userId, agencyId, timeRange) {
    const dateFilter = this.getDateFilter(timeRange);

    let query = this.supabase
      .from("leads")
      .select("id, status, score, value, source, created_at, type");

    if (agencyId) {
      query = query.eq("agency_id", agencyId);
    } else {
      query = query.eq("user_id", userId);
    }

    if (dateFilter) {
      query = query.gte("created_at", dateFilter);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch leads: ${error.message}`);
    }

    const leads = data || [];

    return {
      total: leads.length,
      leads,
      byStatus: this.groupBy(leads, "status"),
      bySource: this.groupBy(leads, "source"),
      byType: this.groupBy(leads, "type"),
    };
  }

  /**
   * Get contacts data for metrics
   */
  async getContactsData(userId, agencyId, timeRange) {
    const dateFilter = this.getDateFilter(timeRange);

    let query = this.supabase
      .from("contacts")
      .select("id, company, created_at");

    if (agencyId) {
      query = query.eq("agency_id", agencyId);
    } else {
      query = query.eq("user_id", userId);
    }

    if (dateFilter) {
      query = query.gte("created_at", dateFilter);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }

    const contacts = data || [];

    return {
      total: contacts.length,
      contacts,
      withCompany: contacts.filter((c) => c.company && c.company.trim() !== "")
        .length,
      withoutCompany: contacts.filter(
        (c) => !c.company || c.company.trim() === "",
      ).length,
    };
  }

  /**
   * Get opportunities data for metrics
   */
  async getOpportunitiesData(userId, agencyId, timeRange) {
    const dateFilter = this.getDateFilter(timeRange);

    let query = this.supabase
      .from("opportunities")
      .select(
        "id, stage, amount, probability, expected_close_date, status, created_at, won_at, lost_at",
      );

    if (agencyId) {
      query = query.eq("agency_id", agencyId);
    } else {
      query = query.eq("user_id", userId);
    }

    if (dateFilter) {
      query = query.gte("created_at", dateFilter);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch opportunities: ${error.message}`);
    }

    const opportunities = data || [];

    return {
      total: opportunities.length,
      opportunities,
      byStage: this.groupBy(opportunities, "stage"),
      totalValue: opportunities.reduce(
        (sum, opp) => sum + (opp.amount || 0),
        0,
      ),
      weightedValue: opportunities.reduce(
        (sum, opp) => sum + ((opp.amount || 0) * (opp.probability || 0)) / 100,
        0,
      ),
    };
  }

  /**
   * Get activities data for metrics
   */
  async getActivitiesData(userId, agencyId, timeRange) {
    const dateFilter = this.getDateFilter(timeRange);

    let query = this.supabase
      .from("activities")
      .select("id, type, created_at, completed_at");

    if (agencyId) {
      query = query.eq("agency_id", agencyId);
    } else {
      query = query.eq("user_id", userId);
    }

    if (dateFilter) {
      query = query.gte("created_at", dateFilter);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    const activities = data || [];

    return {
      total: activities.length,
      activities,
      byType: this.groupBy(activities, "type"),
    };
  }

  /**
   * Get deals data (alias for opportunities for consistency)
   */
  async getDealsData(userId, agencyId, timeRange) {
    return this.getOpportunitiesData(userId, agencyId, timeRange);
  }

  /**
   * Calculate conversion rate
   */
  calculateConversionRate(byStatus) {
    const total = Object.values(byStatus).reduce(
      (sum, count) => sum + count,
      0,
    );
    if (total === 0) return 0;

    const converted = byStatus.converted || 0;
    return Math.round((converted / total) * 100);
  }

  /**
   * Calculate average lead score
   */
  calculateAverageScore(leads) {
    if (leads.length === 0) return 0;

    const totalScore = leads.reduce((sum, lead) => sum + (lead.score || 0), 0);
    return Math.round(totalScore / leads.length);
  }

  /**
   * Calculate source breakdown
   */
  calculateSourceBreakdown(leads) {
    return this.groupBy(leads, "source");
  }

  /**
   * Calculate value breakdown
   */
  calculateValueBreakdown(leads) {
    const values = leads.filter((lead) => lead.value && lead.value > 0);
    const totalValue = values.reduce((sum, lead) => sum + lead.value, 0);

    if (totalValue === 0) {
      return { ranges: {}, total: 0 };
    }

    const ranges = {
      "0-1k": 0,
      "1k-5k": 0,
      "5k-10k": 0,
      "10k-25k": 0,
      "25k-50k": 0,
      "50k+": 0,
    };

    values.forEach((lead) => {
      const value = lead.value;
      if (value <= 1000) ranges["0-1k"]++;
      else if (value <= 5000) ranges["1k-5k"]++;
      else if (value <= 10000) ranges["5k-10k"]++;
      else if (value <= 25000) ranges["10k-25k"]++;
      else if (value <= 50000) ranges["25k-50k"]++;
      else ranges["50k+"]++;
    });

    return { ranges, total: totalValue };
  }

  /**
   * Calculate monthly trend
   */
  calculateMonthlyTrend(leads, timeRange) {
    const months = this.getMonthsFromTimeRange(timeRange);
    const monthlyData = {};

    months.forEach((month) => {
      monthlyData[month] = leads.filter((lead) => {
        const leadDate = new Date(lead.created_at);
        return (
          leadDate.getMonth() === month &&
          leadDate.getFullYear() === new Date().getFullYear()
        );
      }).length;
    });

    return monthlyData;
  }

  /**
   * Calculate average deals per contact
   */
  calculateAverageDealsPerContact(contacts, opportunities) {
    if (contacts.length === 0) return 0;

    const contactIds = new Set(contacts.map((c) => c.id));
    const dealsWithContacts = opportunities.filter(
      (opp) => opp.contact_id && contactIds.has(opp.contact_id),
    );

    return Math.round((dealsWithContacts.length / contacts.length) * 10) / 10;
  }

  /**
   * Calculate recent activity
   */
  calculateRecentActivity(contacts, activities) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentActivities = activities.filter(
      (activity) => new Date(activity.created_at) > thirtyDaysAgo,
    );

    const contactIds = new Set(recentActivities.map((a) => a.contact_id));

    return contacts.filter((contact) => contactIds.has(contact.id)).length;
  }

  /**
   * Calculate average deal size
   */
  calculateAverageDealSize(opportunities) {
    if (opportunities.length === 0) return 0;

    const totalValue = opportunities.reduce(
      (sum, opp) => sum + (opp.amount || 0),
      0,
    );
    return Math.round(totalValue / opportunities.length);
  }

  /**
   * Calculate win rate
   */
  calculateWinRate(opportunities) {
    const closedDeals = opportunities.filter(
      (opp) => opp.status === "won" || opp.status === "lost",
    );
    if (closedDeals.length === 0) return 0;

    const wonDeals = opportunities.filter((opp) => opp.status === "won");
    return Math.round((wonDeals.length / closedDeals.length) * 100);
  }

  /**
   * Calculate average sales cycle
   */
  calculateAverageSalesCycle(opportunities) {
    const wonDeals = opportunities.filter(
      (opp) => opp.status === "won" && opp.created_at && opp.won_at,
    );
    if (wonDeals.length === 0) return 0;

    const totalDays = wonDeals.reduce((sum, deal) => {
      const created = new Date(deal.created_at);
      const won = new Date(deal.won_at);
      return sum + Math.ceil((won - created) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / wonDeals.length);
  }

  /**
   * Calculate pipeline velocity
   */
  calculatePipelineVelocity(opportunities) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentWonDeals = opportunities.filter(
      (opp) => opp.status === "won" && new Date(opp.won_at) > thirtyDaysAgo,
    );

    return recentWonDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  }

  /**
   * Calculate stage distribution
   */
  calculateStageDistribution(byStage) {
    const total = Object.values(byStage).reduce((sum, count) => sum + count, 0);
    if (total === 0) return {};

    const distribution = {};
    Object.entries(byStage).forEach(([stage, count]) => {
      distribution[stage] = Math.round((count / total) * 100);
    });

    return distribution;
  }

  /**
   * Calculate recent activity trend
   */
  calculateRecentActivityTrend(activities, timeRange) {
    const days = this.getDaysFromTimeRange(timeRange);
    const dailyActivity = {};

    days.forEach((day) => {
      dailyActivity[day] = activities.filter((activity) => {
        const activityDate = new Date(activity.created_at);
        return activityDate.toDateString() === day;
      }).length;
    });

    return dailyActivity;
  }

  /**
   * Calculate activity completion rate
   */
  calculateActivityCompletionRate(activities) {
    const completedActivities = activities.filter(
      (activity) => activity.completed_at,
    );
    if (activities.length === 0) return 0;

    return Math.round((completedActivities.length / activities.length) * 100);
  }

  /**
   * Calculate lead to opportunity rate
   */
  calculateLeadToOpportunityRate(leads, opportunities) {
    if (leads.length === 0) return 0;

    const convertedLeads = leads.filter((lead) =>
      opportunities.some((opp) => opp.lead_id === lead.id),
    );

    return Math.round((convertedLeads.length / leads.length) * 100);
  }

  /**
   * Calculate contact engagement rate
   */
  calculateContactEngagementRate(contacts, activities) {
    if (contacts.length === 0) return 0;

    const engagedContacts = activities.filter(
      (activity) => activity.contact_id,
    );
    const engagedContactIds = new Set(engagedContacts.map((a) => a.contact_id));

    return Math.round((engagedContactIds.size / contacts.length) * 100);
  }

  /**
   * Calculate sales efficiency
   */
  calculateSalesEfficiency(opportunities, activities) {
    const wonDeals = opportunities.filter((opp) => opp.status === "won");
    if (wonDeals.length === 0) return 0;

    const totalValue = wonDeals.reduce(
      (sum, deal) => sum + (deal.amount || 0),
      0,
    );
    const salesActivities = activities.filter(
      (activity) =>
        activity.type === "sale" &&
        wonDeals.some((deal) => deal.id === activity.opportunity_id),
    );

    return salesActivities.length > 0 ? totalValue / salesActivities.length : 0;
  }

  /**
   * Calculate data quality score
   */
  calculateDataQuality(leads, contacts) {
    let qualityScore = 100;

    // Deduct points for missing data
    const leadsWithEmail = leads.filter(
      (lead) => lead.email && lead.email.trim() !== "",
    ).length;
    if (leads.length > 0) {
      qualityScore -= ((leads.length - leadsWithEmail) / leads.length) * 10;
    }

    const contactsWithEmail = contacts.filter(
      (contact) => contact.email && contact.email.trim() !== "",
    ).length;
    if (contacts.length > 0) {
      qualityScore -=
        ((contacts.length - contactsWithEmail) / contacts.length) * 10;
    }

    return Math.max(0, Math.round(qualityScore));
  }

  /**
   * Calculate data freshness
   */
  async calculateDataFreshness(userId, agencyId) {
    try {
      const tables = ["leads", "contacts", "opportunities", "activities"];
      const freshnessScores = {};

      for (const table of tables) {
        let query = this.supabase.from(table).select("updated_at");

        if (agencyId) {
          query = query.eq("agency_id", agencyId);
        } else {
          query = query.eq("user_id", userId);
        }

        query = query.order("updated_at", { ascending: false }).limit(1);

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
          freshnessScores[table] = 0;
          continue;
        }

        const lastUpdate = new Date(data[0].updated_at);
        const hoursOld = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);

        // Score: 100 for very fresh, 0 for very old
        if (hoursOld < 1) freshnessScores[table] = 100;
        else if (hoursOld < 24) freshnessScores[table] = 90;
        else if (hoursOld < 168) freshnessScores[table] = 70;
        else if (hoursOld < 720) freshnessScores[table] = 50;
        else freshnessScores[table] = 20;
      }

      const averageScore =
        Object.values(freshnessScores).reduce((sum, score) => sum + score, 0) /
        Object.keys(freshnessScores).length;

      return Math.round(averageScore);
    } catch (error) {
      console.error("Error calculating data freshness:", error);
      return 50; // Default to middle score on error
    }
  }

  /**
   * Helper methods
   */
  groupBy(items, field) {
    return items.reduce((groups, item) => {
      const key = item[field] || "unknown";
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  getDateFilter(timeRange) {
    const now = new Date();
    let daysBack = 30; // Default to 30 days

    switch (timeRange) {
      case "7d":
        daysBack = 7;
        break;
      case "30d":
        daysBack = 30;
        break;
      case "90d":
        daysBack = 90;
        break;
      case "1y":
        daysBack = 365;
        break;
    }

    return new Date(
      now.getTime() - daysBack * 24 * 60 * 60 * 1000,
    ).toISOString();
  }

  getMonthsFromTimeRange(timeRange) {
    const now = new Date();
    const months = [];

    let monthsBack = 3; // Default to 3 months
    switch (timeRange) {
      case "30d":
        monthsBack = 1;
        break;
      case "90d":
        monthsBack = 3;
        break;
      case "1y":
        monthsBack = 12;
        break;
    }

    for (let i = 0; i < monthsBack; i++) {
      const month = (now.getMonth() - i + 12) % 12;
      months.push(month);
    }

    return months;
  }

  getDaysFromTimeRange(timeRange) {
    const now = new Date();
    const days = [];

    let daysBack = 30; // Default to 30 days
    switch (timeRange) {
      case "7d":
        daysBack = 7;
        break;
      case "30d":
        daysBack = 30;
        break;
      case "90d":
        daysBack = 90;
        break;
    }

    for (let i = 0; i < daysBack; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push(date.toDateString());
    }

    return days;
  }

  /**
   * Clear cache for specific user/agency
   */
  clearCache(userId, agencyId = null) {
    const keysToDelete = [];

    for (const [key] of this.cache.entries()) {
      if (key.includes(userId) && (!agencyId || key.includes(agencyId))) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Setup real-time subscriptions for metrics updates
   */
  setupRealtimeSubscriptions(userId, agencyId = null, callback) {
    // Subscribe to changes in key tables
    const subscriptions = [
      this.supabase
        .channel(`crm_metrics_${userId}_${agencyId}`)
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "leads",
        })
        .subscribe((payload) => {
          callback({ type: "lead_change", data: payload });
        }),

      this.supabase
        .channel(`crm_metrics_${userId}_${agencyId}`)
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "contacts",
        })
        .subscribe((payload) => {
          callback({ type: "contact_change", data: payload });
        }),

      this.supabase
        .channel(`crm_metrics_${userId}_${agencyId}`)
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "opportunities",
        })
        .subscribe((payload) => {
          callback({ type: "opportunity_change", data: payload });
        }),
    ];

    // Store subscriptions for cleanup
    this.realtimeSubscriptions.set(`${userId}_${agencyId}`, subscriptions);

    return subscriptions;
  }

  /**
   * Cleanup real-time subscriptions
   */
  cleanupRealtimeSubscriptions(userId, agencyId = null) {
    const key = `${userId}_${agencyId}`;
    const subscriptions = this.realtimeSubscriptions.get(key);

    if (subscriptions) {
      subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.realtimeSubscriptions.delete(key);
    }
  }
}

export default EnhancedMetricsService;
