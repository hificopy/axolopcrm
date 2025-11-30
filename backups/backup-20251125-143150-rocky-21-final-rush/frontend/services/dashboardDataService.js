/**
 * Dashboard Data Aggregation Service
 * Connects to all CRM sections and provides real-time data
 * Now with optional backend caching support via /api/dashboard/summary
 * FIXED: All queries now filter by authenticated user_id
 */

import { supabase } from "../config/supabaseClient";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import api from "../lib/api";

export class DashboardDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.useBackendCache = true; // Use new cached backend endpoint by default
    this._userId = null;
  }

  /**
   * Get the current authenticated user's ID
   */
  async getCurrentUserId() {
    if (this._userId) return this._userId;

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      this._userId = user?.id || null;
      return this._userId;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Clear the cached user ID (call on logout)
   */
  clearUserCache() {
    this._userId = null;
  }

  /**
   * Fetch all dashboard data from cached backend endpoint
   * This is the preferred method - uses Redis caching for 10 min TTL
   */
  async getCachedDashboardSummary(timeRange = "7d") {
    try {
      const response = await api.get(`/dashboard/summary?timeRange=${timeRange}`);
      if (response.data.success) {
        console.log("✅ [DASHBOARD] Using cached backend data", {
          cached: response.data.cached,
          cacheTtl: response.data.cacheTtl,
        });
        return response.data.data;
      }
      throw new Error(response.data.error || "Failed to fetch dashboard data");
    } catch (error) {
      console.warn("⚠️ [DASHBOARD] Backend cache failed, falling back to direct queries", error.message);
      // Fall back to direct Supabase queries if backend fails
      return null;
    }
  }

  // ============= SALES METRICS =============

  async getSalesMetrics(timeRange = "month") {
    const { startDate, endDate } = this.getTimeRange(timeRange);

    console.log("📊 [METRICS DEBUG] Fetching sales metrics for:", {
      timeRange,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const [deals, pipeline, conversion] = await Promise.all([
      this.getDealsData(startDate, endDate),
      this.getPipelineData(),
      this.getConversionRates(startDate, endDate),
    ]);

    console.log("📊 [METRICS DEBUG] Raw data fetched:", {
      deals: {
        won: deals.won,
        lost: deals.lost,
        revenue: deals.totalRevenue,
        avgDealSize: deals.averageDealSize,
        avgCycleDays: deals.avgSalesCycleDays,
      },
      pipeline: {
        totalValue: pipeline.totalValue,
        weightedValue: pipeline.weightedValue,
        totalCount: pipeline.totalCount,
        dealsCount: pipeline.dealsCount,
        opportunitiesCount: pipeline.opportunitiesCount,
      },
      conversion: {
        rate: conversion.rate,
        funnel: conversion.funnel,
      },
    });

    // Calculate win rate from actual won/lost data
    const winRate =
      deals.won > 0 && deals.won + deals.lost > 0
        ? (deals.won / (deals.won + deals.lost)) * 100
        : 0;

    // Validate data integrity
    const validatedMetrics = {
      // Revenue metrics
      totalRevenue: Math.max(0, deals.totalRevenue || 0),
      revenueByPeriod: deals.historical || [],

      // Deal metrics
      dealsWon: Math.max(0, deals.won || 0),
      dealsLost: Math.max(0, deals.lost || 0),
      activeDeals: Math.max(0, pipeline.totalCount || 0),
      avgDealSize: Math.max(0, deals.averageDealSize || 0),
      averageDealSize: Math.max(0, deals.averageDealSize || 0),
      winRate: Math.min(100, Math.max(0, winRate)),

      // Lead metrics
      totalLeads: Math.max(0, conversion.total || 0),
      qualifiedLeads: Math.max(0, conversion.qualified || 0),
      newLeads: Math.max(0, conversion.total || 0),

      // Pipeline metrics
      pipelineValue: Math.max(0, pipeline.totalValue || 0),
      weightedPipelineValue: Math.max(
        0,
        pipeline.weightedValue || pipeline.totalValue || 0,
      ),

      // Conversion & velocity
      conversionRate: Math.min(100, Math.max(0, conversion.rate || 0)),
      conversionFunnel: conversion.funnel || {}, // Full funnel breakdown
      avgSalesCycle: `${this.calculateSalesVelocity(deals)} days`,
      salesVelocity: Math.max(0, this.calculateSalesVelocity(deals) || 0),
      avgSalesCycleDays: Math.max(0, deals.avgSalesCycleDays || 0),

      // Trends
      trend: this.calculateTrend(deals.historical),

      // Additional context
      opportunitiesCount: Math.max(0, pipeline.opportunitiesCount || 0),
      dealsCount: Math.max(0, pipeline.dealsCount || 0),
    };

    console.log("✅ [METRICS DEBUG] Validated metrics:", validatedMetrics);

    // Data integrity checks
    if (
      validatedMetrics.avgDealSize > validatedMetrics.totalRevenue &&
      validatedMetrics.dealsWon > 0
    ) {
      console.warn(
        "⚠️  [METRICS WARNING] avgDealSize > totalRevenue - possible data issue",
      );
    }

    if (
      validatedMetrics.activeDeals <
      validatedMetrics.dealsCount + validatedMetrics.opportunitiesCount
    ) {
      console.warn("⚠️  [METRICS WARNING] activeDeals count mismatch");
    }

    return validatedMetrics;
  }

  async getDealsData(startDate, endDate) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn("No authenticated user for deals data");
        return this.getEmptyDealsData();
      }

      // Get both deals and opportunities for comprehensive metrics - filtered by user
      const [dealsResult, opportunitiesResult] = await Promise.all([
        supabase
          .from("deals")
          .select("*")
          .eq("user_id", userId)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),
        supabase
          .from("opportunities")
          .select("id, status, value, created_at, closed_at, stage")
          .eq("user_id", userId)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),
      ]);

      if (dealsResult.error) throw dealsResult.error;

      const deals = dealsResult.data || [];
      const opportunities = opportunitiesResult.data || [];

      // Calculate from deals table
      const wonDeals =
        deals.filter((d) => d.status === "WON" || d.status === "won") || [];
      const lostDeals =
        deals.filter((d) => d.status === "LOST" || d.status === "lost") || [];

      // Also count opportunities that are won
      const wonOpportunities =
        opportunities.filter(
          (o) =>
            o.status === "won" ||
            o.status === "WON" ||
            o.stage === "won" ||
            o.stage === "WON",
        ) || [];
      const lostOpportunities =
        opportunities.filter(
          (o) =>
            o.status === "lost" ||
            o.status === "LOST" ||
            o.stage === "lost" ||
            o.stage === "LOST",
        ) || [];

      // Combine revenue from both sources
      const dealsRevenue = wonDeals.reduce(
        (sum, d) => sum + (d.amount || d.value || 0),
        0,
      );
      const opportunitiesRevenue = wonOpportunities.reduce(
        (sum, o) => sum + (o.value || 0),
        0,
      );
      const totalRevenue = dealsRevenue + opportunitiesRevenue;

      // Total won count
      const totalWon = wonDeals.length + wonOpportunities.length;
      const totalLost = lostDeals.length + lostOpportunities.length;

      // Average deal size
      const averageDealSize = totalWon > 0 ? totalRevenue / totalWon : 0;

      // Calculate sales cycle duration (days from created to closed)
      const closedWithDates = [
        ...wonDeals
          .filter((d) => d.created_at && d.closed_at)
          .map((d) => ({
            created: new Date(d.created_at),
            closed: new Date(d.closed_at || d.won_at),
          })),
        ...wonOpportunities
          .filter((o) => o.created_at && o.closed_at)
          .map((o) => ({
            created: new Date(o.created_at),
            closed: new Date(o.closed_at),
          })),
      ];

      const avgSalesCycleDays =
        closedWithDates.length > 0
          ? closedWithDates.reduce((sum, item) => {
              const days = Math.floor(
                (item.closed - item.created) / (1000 * 60 * 60 * 24),
              );
              return sum + days;
            }, 0) / closedWithDates.length
          : 0;

      // Get historical data for trend
      const historicalData = await this.getHistoricalDeals();

      return {
        totalRevenue,
        won: totalWon,
        lost: totalLost,
        averageDealSize,
        avgSalesCycleDays: Math.round(avgSalesCycleDays),
        historical: historicalData,
        deals: deals,
        opportunities: opportunities,
      };
    } catch (error) {
      console.error("Error fetching deals data:", error);
      return {
        totalRevenue: 0,
        won: 0,
        lost: 0,
        averageDealSize: 0,
        avgSalesCycleDays: 0,
        historical: [],
        deals: [],
        opportunities: [],
      };
    }
  }

  async getPipelineData() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn("No authenticated user for pipeline data");
        return this.getEmptyPipelineData();
      }

      // Get both deals and opportunities in pipeline stages - filtered by user
      const [dealsResult, opportunitiesResult] = await Promise.all([
        supabase
          .from("deals")
          .select("*")
          .eq("user_id", userId)
          .in("status", [
            "NEW",
            "QUALIFIED",
            "PROPOSAL",
            "NEGOTIATION",
            "new",
            "qualified",
            "proposal",
            "negotiation",
          ]),
        supabase
          .from("opportunities")
          .select("*")
          .eq("user_id", userId)
          .in("stage", [
            "NEW",
            "QUALIFIED",
            "PROPOSAL",
            "NEGOTIATION",
            "new",
            "qualified",
            "proposal",
            "negotiation",
            "discovery",
            "demo",
            "proposal_sent",
          ]),
      ]);

      if (dealsResult.error) throw dealsResult.error;

      const deals = dealsResult.data || [];
      const opportunities = opportunitiesResult.data || [];

      // Calculate total pipeline value from both sources
      const dealsValue = deals.reduce(
        (sum, d) => sum + (d.amount || d.value || 0),
        0,
      );
      const opportunitiesValue = opportunities.reduce(
        (sum, o) => sum + (o.value || 0),
        0,
      );
      const totalValue = dealsValue + opportunitiesValue;

      // Group by stage
      const byStage = this.groupByStage([...deals, ...opportunities]);

      // Calculate weighted pipeline value (based on dynamic stage probability)
      const weightedValue = [...deals, ...opportunities].reduce((sum, item) => {
        const stage = item.status || item.stage;
        const probability = this.getStageProbability(stage);
        const value = item.amount || item.value || 0;
        return sum + value * probability;
      }, 0);

      return {
        totalValue,
        weightedValue: Math.round(weightedValue),
        byStage,
        deals: [...deals, ...opportunities], // Combined for display
        dealsCount: deals.length,
        opportunitiesCount: opportunities.length,
        totalCount: deals.length + opportunities.length,
      };
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
      return {
        totalValue: 0,
        weightedValue: 0,
        byStage: {},
        deals: [],
        dealsCount: 0,
        opportunitiesCount: 0,
        totalCount: 0,
      };
    }
  }

  async getConversionRates(startDate, endDate) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn("No authenticated user for conversion data");
        return this.getEmptyConversionData();
      }

      console.log("🔄 [CONVERSION DEBUG] Fetching funnel data for user:", userId);

      // Get the full conversion funnel data - filtered by user
      const [formSubmissions, leads, opportunities, deals] = await Promise.all([
        supabase
          .from("form_submissions")
          .select("id, converted_to_lead, submitted_at")
          .eq("user_id", userId)
          .gte("submitted_at", startDate.toISOString())
          .lte("submitted_at", endDate.toISOString()),
        supabase
          .from("leads")
          .select("id, status, created_at")
          .eq("user_id", userId)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),
        supabase
          .from("opportunities")
          .select("id, status, stage, created_at, lead_id")
          .eq("user_id", userId)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),
        supabase
          .from("deals")
          .select("id, status, created_at")
          .eq("user_id", userId)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),
      ]);

      console.log("🔄 [CONVERSION DEBUG] Raw funnel data:", {
        formSubmissions: formSubmissions.data?.length || 0,
        leads: leads.data?.length || 0,
        opportunities: opportunities.data?.length || 0,
        deals: deals.data?.length || 0,
        errors: {
          forms: formSubmissions.error,
          leads: leads.error,
          opportunities: opportunities.error,
          deals: deals.error,
        },
      });

      // Calculate funnel metrics
      const totalForms = formSubmissions.data?.length || 0;
      const formsToLeads =
        formSubmissions.data?.filter((f) => f.converted_to_lead === true)
          .length || 0;

      const totalLeads = leads.data?.length || 0;
      const qualifiedLeads =
        leads.data?.filter((l) => l.status === "QUALIFIED").length || 0;

      const totalOpportunities = opportunities.data?.length || 0;

      const totalDeals = deals.data?.length || 0;
      const wonDeals =
        deals.data?.filter((d) => d.status === "WON" || d.status === "won")
          .length || 0;

      // Calculate conversion rates for each stage
      const formToLeadRate =
        totalForms > 0 ? (formsToLeads / totalForms) * 100 : 0;
      const leadToOpportunityRate =
        totalLeads > 0 ? (totalOpportunities / totalLeads) * 100 : 0;
      const opportunityToWinRate =
        totalOpportunities > 0 ? (wonDeals / totalOpportunities) * 100 : 0;

      // Overall conversion rate: Forms → Won Deals
      const overallConversionRate =
        totalForms > 0 ? (wonDeals / totalForms) * 100 : 0;

      // Alternative: Leads → Won Deals (if no form data)
      const leadsToWonRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

      const funnelData = {
        forms: totalForms,
        formsToLeads: formsToLeads,
        formToLeadRate: Math.round(formToLeadRate * 10) / 10,

        leads: totalLeads,
        qualifiedLeads,
        leadQualificationRate:
          Math.round(
            (totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0) * 10,
          ) / 10,

        opportunities: totalOpportunities,
        leadToOpportunityRate: Math.round(leadToOpportunityRate * 10) / 10,

        deals: totalDeals,
        wonDeals,
        opportunityToWinRate: Math.round(opportunityToWinRate * 10) / 10,

        overallConversionRate: Math.round(overallConversionRate * 10) / 10,
      };

      console.log("✅ [CONVERSION DEBUG] Calculated funnel:", funnelData);
      console.log(
        "📊 [CONVERSION DEBUG] Selected conversion rate:",
        totalForms > 0 ? overallConversionRate : leadsToWonRate,
      );

      return {
        // Use the most relevant conversion rate based on available data
        rate: totalForms > 0 ? overallConversionRate : leadsToWonRate,

        // Funnel breakdown
        funnel: funnelData,

        // Legacy format for backwards compatibility
        total: totalLeads,
        qualified: qualifiedLeads,
      };
    } catch (error) {
      console.error("❌ [CONVERSION ERROR]", error);
      return {
        rate: 0,
        funnel: {
          forms: 0,
          formsToLeads: 0,
          formToLeadRate: 0,
          leads: 0,
          qualifiedLeads: 0,
          leadQualificationRate: 0,
          opportunities: 0,
          leadToOpportunityRate: 0,
          deals: 0,
          wonDeals: 0,
          opportunityToWinRate: 0,
          overallConversionRate: 0,
        },
        total: 0,
        qualified: 0,
      };
    }
  }

  // ============= MARKETING METRICS =============

  async getMarketingMetrics(timeRange = "month") {
    const { startDate, endDate } = this.getTimeRange(timeRange);

    const [campaigns, emails, forms] = await Promise.all([
      this.getCampaignData(startDate, endDate),
      this.getEmailMarketingData(startDate, endDate),
      this.getFormsData(startDate, endDate),
    ]);

    return {
      // Original fields
      campaignsActive: campaigns.active,
      emailsSent: emails.sent,
      emailsDelivered: emails.delivered,
      emailOpens: emails.opened,
      emailClicks: emails.clicked,
      openRate: emails.openRate,
      clickRate: emails.clickRate,
      formSubmissions: forms.submissions,
      leadGeneration: forms.leads,
      roi: this.calculateMarketingROI(campaigns, emails),

      // Additional fields for FullMarketingWidget
      activeCampaigns: campaigns.active,
      totalSubscribers: emails.totalSubscribers || 0,
      engagementRate: emails.openRate, // Using open rate as engagement proxy
      unsubscribeRate: emails.unsubscribeRate || 0,
      avgOpenRate: emails.openRate,
      newSubscribers: emails.newSubscribers || 0,
    };
  }

  async getEmailMarketingData(startDate, endDate) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn("No authenticated user for email marketing data");
        return { sent: 0, delivered: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0, campaigns: 0 };
      }

      const { data: campaigns, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("user_id", userId)
        .gte("sent_at", startDate.toISOString())
        .lte("sent_at", endDate.toISOString());

      if (error) throw error;

      const sent =
        campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
      const delivered =
        campaigns?.reduce(
          (sum, c) => sum + (c.delivered_count || c.sent_count || 0),
          0,
        ) || 0;
      const opened =
        campaigns?.reduce((sum, c) => sum + (c.opened_count || 0), 0) || 0;
      const clicked =
        campaigns?.reduce((sum, c) => sum + (c.clicked_count || 0), 0) || 0;

      return {
        sent,
        delivered,
        opened,
        clicked,
        openRate: sent > 0 ? (opened / sent) * 100 : 0,
        clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
        campaigns: campaigns?.length || 0,
      };
    } catch (error) {
      console.error("Error fetching email marketing data:", error);
      return {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        openRate: 0,
        clickRate: 0,
        campaigns: 0,
      };
    }
  }

  async getFormsData(startDate, endDate) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn("No authenticated user for forms data");
        return { submissions: 0, leads: 0, conversionRate: 0 };
      }

      const { data: submissions, error } = await supabase
        .from("form_submissions")
        .select("*")
        .eq("user_id", userId)
        .gte("submitted_at", startDate.toISOString())
        .lte("submitted_at", endDate.toISOString());

      if (error) throw error;

      const leads =
        submissions?.filter((s) => s.converted_to_lead === true).length || 0;

      return {
        submissions: submissions?.length || 0,
        leads,
        conversionRate:
          submissions?.length > 0 ? (leads / submissions.length) * 100 : 0,
      };
    } catch (error) {
      console.error("Error fetching forms data:", error);
      return { submissions: 0, leads: 0, conversionRate: 0 };
    }
  }

  // Alias for getFormsData to match Dashboard component usage
  async getFormSubmissions(timeRange = "month") {
    const { startDate, endDate } = this.getTimeRange(timeRange);
    const formData = await this.getFormsData(startDate, endDate);

    // Add trend data for the FormSubmissionsWidget
    const trend = await this.getFormSubmissionsTrend(startDate, endDate);

    return {
      total: formData.submissions,
      converted: formData.leads,
      conversionRate: formData.conversionRate,
      trend,
    };
  }

  async getFormSubmissionsTrend(startDate, endDate) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn("No authenticated user for form submissions trend");
        return [];
      }

      // Get submissions grouped by week for the last 6 weeks
      const weeks = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - i * 7);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from("form_submissions")
          .select("id")
          .eq("user_id", userId)
          .gte("submitted_at", weekStart.toISOString())
          .lte("submitted_at", weekEnd.toISOString());

        if (error) throw error;

        weeks.push({
          name: `W${6 - i}`,
          value: data?.length || 0,
        });
      }

      return weeks;
    } catch (error) {
      console.error("Error fetching form submissions trend:", error);
      return [];
    }
  }

  // ============= PROFIT & LOSS =============

  async getProfitLossData(timeRange = "month") {
    const { startDate, endDate } = this.getTimeRange(timeRange);

    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn("No authenticated user for profit/loss data");
        return { revenue: 0, expenses: 0, netProfit: 0, profitMargin: 0, expensesByCategory: {}, monthlyTrend: [] };
      }

      // Revenue from won deals - filtered by user
      const { data: revenue, error: revenueError } = await supabase
        .from("deals")
        .select("amount, closed_at")
        .eq("user_id", userId)
        .eq("status", "WON")
        .gte("closed_at", startDate.toISOString())
        .lte("closed_at", endDate.toISOString());

      if (revenueError) throw revenueError;

      // Expenses (from expense tracking - to be implemented) - filtered by user
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("amount, category, date")
        .eq("user_id", userId)
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString());

      const totalRevenue =
        revenue?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const totalExpenses =
        expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin =
        totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        netProfit,
        profitMargin,
        expensesByCategory: this.groupExpensesByCategory(expenses || []),
        monthlyTrend: await this.getMonthlyProfitTrend(),
      };
    } catch (error) {
      console.error("Error fetching P&L data:", error);
      return {
        revenue: 0,
        expenses: 0,
        netProfit: 0,
        profitMargin: 0,
        expensesByCategory: {},
        monthlyTrend: [],
      };
    }
  }

  // ============= INDUSTRY-SPECIFIC METRICS =============

  async getRealEstateMetrics() {
    const { startDate, endDate } = this.getTimeRange("month");

    try {
      const [listings, showings, offers] = await Promise.all([
        supabase.from("properties").select("*"),
        supabase
          .from("showings")
          .select("*")
          .gte("date", startDate.toISOString()),
        supabase
          .from("offers")
          .select("*")
          .gte("created_at", startDate.toISOString()),
      ]);

      return {
        activeListings:
          listings.data?.filter((l) => l.status === "ACTIVE").length || 0,
        totalListings: listings.data?.length || 0,
        showingsScheduled: showings.data?.length || 0,
        offersReceived: offers.data?.length || 0,
        averageListPrice: this.calculateAverage(
          listings.data || [],
          "list_price",
        ),
        daysOnMarket: this.calculateAverage(
          listings.data?.filter((l) => l.status === "SOLD") || [],
          "days_on_market",
        ),
      };
    } catch (error) {
      console.error("Error fetching real estate metrics:", error);
      return {};
    }
  }

  async getEcommerceMetrics() {
    const { startDate, endDate } = this.getTimeRange("month");

    try {
      const [orders, products, customers] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .gte("created_at", startDate.toISOString()),
        supabase.from("products").select("*"),
        supabase
          .from("customers")
          .select("*")
          .gte("created_at", startDate.toISOString()),
      ]);

      const revenue =
        orders.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const orderCount = orders.data?.length || 0;

      return {
        revenue,
        orderCount,
        averageOrderValue: orderCount > 0 ? revenue / orderCount : 0,
        newCustomers: customers.data?.length || 0,
        productsSold: this.calculateProductsSold(orders.data || []),
        cartAbandonmentRate: await this.getCartAbandonmentRate(
          startDate,
          endDate,
        ),
        topProducts: this.getTopProducts(orders.data || []),
      };
    } catch (error) {
      console.error("Error fetching ecommerce metrics:", error);
      return {};
    }
  }

  async getB2BMetrics() {
    const { startDate, endDate } = this.getTimeRange("month");

    try {
      const [accounts, meetings, proposals] = await Promise.all([
        supabase.from("accounts").select("*"),
        supabase
          .from("meetings")
          .select("*")
          .gte("date", startDate.toISOString()),
        supabase
          .from("proposals")
          .select("*")
          .gte("created_at", startDate.toISOString()),
      ]);

      return {
        activeAccounts:
          accounts.data?.filter((a) => a.status === "ACTIVE").length || 0,
        meetingsHeld: meetings.data?.length || 0,
        proposalsSent: proposals.data?.length || 0,
        proposalsAccepted:
          proposals.data?.filter((p) => p.status === "ACCEPTED").length || 0,
        avgContractValue: this.calculateAverage(
          accounts.data || [],
          "contract_value",
        ),
        churnRate: await this.calculateChurnRate(startDate, endDate),
      };
    } catch (error) {
      console.error("Error fetching B2B metrics:", error);
      return {};
    }
  }

  // ============= HELPER FUNCTIONS =============

  /**
   * Calculates stage probability based on historical data
   */
  getStageProbability(stage) {
    // Default probabilities based on industry standards
    const defaultProbabilities = {
      new: 0.1,
      NEW: 0.1,
      qualified: 0.25,
      QUALIFIED: 0.25,
      discovery: 0.3,
      demo: 0.4,
      proposal: 0.5,
      PROPOSAL: 0.5,
      proposal_sent: 0.6,
      negotiation: 0.7,
      NEGOTIATION: 0.7,
    };

    // Try to get historical conversion rates for this stage
    // This would be enhanced with actual historical data in production
    return defaultProbabilities[stage] || 0.3; // Default 30%
  }

  getTimeRange(range) {
    const now = new Date();
    let startDate, endDate;

    switch (range) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case "month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "quarter":
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        endDate = new Date();
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        endDate = new Date();
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return { startDate, endDate };
  }

  groupByStage(deals) {
    return deals.reduce((acc, deal) => {
      const stage = deal.stage || "NEW";
      if (!acc[stage]) acc[stage] = [];
      acc[stage].push(deal);
      return acc;
    }, {});
  }

  groupExpensesByCategory(expenses) {
    return expenses.reduce((acc, expense) => {
      const category = expense.category || "Other";
      if (!acc[category]) acc[category] = 0;
      acc[category] += expense.amount || 0;
      return acc;
    }, {});
  }

  calculateAverage(items, field) {
    if (!items || items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + (item[field] || 0), 0);
    return sum / items.length;
  }

  calculateSalesVelocity(deals) {
    // Use the pre-calculated sales cycle days if available
    if (deals.avgSalesCycleDays !== undefined) {
      return deals.avgSalesCycleDays;
    }

    // Fallback: Calculate from deals array
    const wonDeals =
      deals.deals?.filter((d) => d.status === "WON" || d.status === "won") ||
      [];
    const wonOpportunities =
      deals.opportunities?.filter(
        (o) =>
          o.status === "won" ||
          o.status === "WON" ||
          o.stage === "won" ||
          o.stage === "WON",
      ) || [];

    const allWon = [
      ...wonDeals.filter((d) => d.created_at && (d.closed_at || d.won_at)),
      ...wonOpportunities.filter((o) => o.created_at && o.closed_at),
    ];

    if (allWon.length === 0) return 0;

    const avgDays =
      allWon.reduce((sum, item) => {
        const created = new Date(item.created_at);
        const closed = new Date(item.closed_at || item.won_at);
        const days = Math.floor((closed - created) / (1000 * 60 * 60 * 24));
        return sum + Math.max(0, days); // Ensure no negative values
      }, 0) / allWon.length;

    return Math.round(avgDays);
  }

  calculateTrend(historicalData) {
    if (!historicalData || historicalData.length < 2)
      return { direction: "neutral", percentage: 0 };

    const current = historicalData[historicalData.length - 1];
    const previous = historicalData[historicalData.length - 2];

    if (!current || !previous) return { direction: "neutral", percentage: 0 };

    const change = current.value - previous.value;
    const percentage = previous.value > 0 ? (change / previous.value) * 100 : 0;

    return {
      direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      percentage: Math.abs(Math.round(percentage * 10) / 10),
    };
  }

  calculateMarketingROI(campaigns, emails) {
    // Simplified ROI calculation
    if (!campaigns || typeof campaigns !== "object") return 0;

    // Handle if campaigns is an object with data
    const campaignArray = Array.isArray(campaigns) ? campaigns : [];

    const cost = campaignArray.reduce((sum, c) => sum + (c.cost || 0), 0);
    const revenue = campaignArray.reduce(
      (sum, c) => sum + (c.attributed_revenue || 0),
      0,
    );

    if (cost === 0) return 0;
    return ((revenue - cost) / cost) * 100;
  }

  async getHistoricalDeals() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn("No authenticated user for historical deals");
        return [];
      }

      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));

        const { data, error } = await supabase
          .from("deals")
          .select("amount, status")
          .eq("user_id", userId)
          .eq("status", "WON")
          .gte("closed_at", monthStart.toISOString())
          .lte("closed_at", monthEnd.toISOString());

        if (error) throw error;

        const value = data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
        months.push({
          month: format(monthStart, "MMM"),
          value,
        });
      }
      return months;
    } catch (error) {
      console.error("Error fetching historical deals:", error);
      return [];
    }
  }

  async getMonthlyProfitTrend() {
    // Get last 6 months of profit data
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));

      const profitData = await this.getProfitLossData("month");

      months.push({
        month: format(monthStart, "MMM"),
        revenue: profitData.revenue,
        expenses: profitData.expenses,
        profit: profitData.netProfit,
      });
    }
    return months;
  }

  // ============= HELPER METHODS =============

  async getCampaignData(startDate, endDate) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn("No authenticated user for campaign data");
        return { active: 0, total: 0 };
      }

      const { data: campaigns, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) throw error;

      const active =
        campaigns?.filter((c) => c.status === "active").length || 0;
      const total = campaigns?.length || 0;

      return { active, total };
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      return { active: 0, total: 0 };
    }
  }

  calculateProductsSold(orders) {
    return orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
  }

  async getCartAbandonmentRate(startDate, endDate) {
    try {
      const { data: carts, error } = await supabase
        .from("shopping_carts")
        .select("status")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) throw error;

      const total = carts?.length || 0;
      const abandoned =
        carts?.filter((c) => c.status === "abandoned").length || 0;

      return total > 0 ? (abandoned / total) * 100 : 0;
    } catch (error) {
      console.error("Error calculating cart abandonment rate:", error);
      return 0;
    }
  }

  getTopProducts(orders) {
    const productCount = {};

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const productId = item.product_id;
        if (!productCount[productId]) {
          productCount[productId] = { ...item, count: 0 };
        }
        productCount[productId].count += item.quantity || 1;
      });
    });

    return Object.values(productCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  async calculateChurnRate(startDate, endDate) {
    try {
      const { data: accounts, error } = await supabase
        .from("accounts")
        .select("status, churned_at")
        .gte("churned_at", startDate.toISOString())
        .lte("churned_at", endDate.toISOString());

      if (error) throw error;

      const churned =
        accounts?.filter((a) => a.status === "churned").length || 0;
      const { data: totalAccounts } = await supabase
        .from("accounts")
        .select("id")
        .eq("status", "active");

      const total = totalAccounts?.length || 0;

      return total > 0 ? (churned / total) * 100 : 0;
    } catch (error) {
      console.error("Error calculating churn rate:", error);
      return 0;
    }
  }

  // ============= EMPTY DATA HELPERS =============

  getEmptyDealsData() {
    return {
      totalRevenue: 0,
      won: 0,
      lost: 0,
      averageDealSize: 0,
      avgSalesCycleDays: 0,
      historical: [],
      deals: [],
      opportunities: [],
    };
  }

  getEmptyPipelineData() {
    return {
      totalValue: 0,
      weightedValue: 0,
      byStage: {},
      deals: [],
      dealsCount: 0,
      opportunitiesCount: 0,
      totalCount: 0,
    };
  }

  getEmptyConversionData() {
    return {
      rate: 0,
      funnel: {
        forms: 0,
        formsToLeads: 0,
        formToLeadRate: 0,
        leads: 0,
        qualifiedLeads: 0,
        leadQualificationRate: 0,
        opportunities: 0,
        leadToOpportunityRate: 0,
        deals: 0,
        wonDeals: 0,
        opportunityToWinRate: 0,
        overallConversionRate: 0,
      },
      total: 0,
      qualified: 0,
    };
  }
}

export const dashboardDataService = new DashboardDataService();
export default dashboardDataService;
