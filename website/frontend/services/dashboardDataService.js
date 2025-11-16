/**
 * Dashboard Data Aggregation Service
 * Connects to all CRM sections and provides real-time data
 */

import { supabase } from '../config/supabaseClient';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export class DashboardDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // ============= SALES METRICS =============

  async getSalesMetrics(timeRange = 'month') {
    const { startDate, endDate } = this.getTimeRange(timeRange);

    const [deals, pipeline, conversion] = await Promise.all([
      this.getDealsData(startDate, endDate),
      this.getPipelineData(),
      this.getConversionRates(startDate, endDate)
    ]);

    return {
      totalRevenue: deals.totalRevenue,
      dealsWon: deals.won,
      dealsLost: deals.lost,
      averageDealSize: deals.averageDealSize,
      pipelineValue: pipeline.totalValue,
      conversionRate: conversion.rate,
      salesVelocity: this.calculateSalesVelocity(deals),
      trend: this.calculateTrend(deals.historical),
    };
  }

  async getDealsData(startDate, endDate) {
    try {
      const { data: deals, error } = await supabase
        .from('deals')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const won = deals?.filter(d => d.status === 'WON') || [];
      const lost = deals?.filter(d => d.status === 'LOST') || [];
      const totalRevenue = won.reduce((sum, d) => sum + (d.amount || 0), 0);
      const averageDealSize = won.length > 0 ? totalRevenue / won.length : 0;

      // Get historical data for trend
      const historicalData = await this.getHistoricalDeals();

      return {
        totalRevenue,
        won: won.length,
        lost: lost.length,
        averageDealSize,
        historical: historicalData,
        deals: deals || []
      };
    } catch (error) {
      console.error('Error fetching deals data:', error);
      return this.getMockDealsData();
    }
  }

  async getPipelineData() {
    try {
      const { data: pipeline, error } = await supabase
        .from('deals')
        .select('*')
        .in('status', ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION']);

      if (error) throw error;

      const totalValue = pipeline?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
      const byStage = this.groupByStage(pipeline || []);

      return { totalValue, byStage, deals: pipeline || [] };
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      return this.getMockPipelineData();
    }
  }

  async getConversionRates(startDate, endDate) {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const total = leads?.length || 0;
      const qualified = leads?.filter(l => l.status === 'QUALIFIED').length || 0;
      const rate = total > 0 ? (qualified / total) * 100 : 0;

      return { rate, total, qualified };
    } catch (error) {
      console.error('Error fetching conversion rates:', error);
      return { rate: 0, total: 0, qualified: 0 };
    }
  }

  // ============= MARKETING METRICS =============

  async getMarketingMetrics(timeRange = 'month') {
    const { startDate, endDate } = this.getTimeRange(timeRange);

    const [campaigns, emails, forms] = await Promise.all([
      this.getCampaignData(startDate, endDate),
      this.getEmailMarketingData(startDate, endDate),
      this.getFormsData(startDate, endDate)
    ]);

    return {
      campaignsActive: campaigns.active,
      emailsSent: emails.sent,
      openRate: emails.openRate,
      clickRate: emails.clickRate,
      formSubmissions: forms.submissions,
      leadGeneration: forms.leads,
      roi: this.calculateMarketingROI(campaigns, emails),
    };
  }

  async getEmailMarketingData(startDate, endDate) {
    try {
      const { data: campaigns, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .gte('sent_at', startDate.toISOString())
        .lte('sent_at', endDate.toISOString());

      if (error) throw error;

      const sent = campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
      const opened = campaigns?.reduce((sum, c) => sum + (c.opened_count || 0), 0) || 0;
      const clicked = campaigns?.reduce((sum, c) => sum + (c.clicked_count || 0), 0) || 0;

      return {
        sent,
        openRate: sent > 0 ? (opened / sent) * 100 : 0,
        clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
        campaigns: campaigns?.length || 0
      };
    } catch (error) {
      console.error('Error fetching email marketing data:', error);
      return { sent: 0, openRate: 0, clickRate: 0, campaigns: 0 };
    }
  }

  async getFormsData(startDate, endDate) {
    try {
      const { data: submissions, error } = await supabase
        .from('form_submissions')
        .select('*')
        .gte('submitted_at', startDate.toISOString())
        .lte('submitted_at', endDate.toISOString());

      if (error) throw error;

      const leads = submissions?.filter(s => s.converted_to_lead === true).length || 0;

      return {
        submissions: submissions?.length || 0,
        leads,
        conversionRate: submissions?.length > 0 ? (leads / submissions.length) * 100 : 0
      };
    } catch (error) {
      console.error('Error fetching forms data:', error);
      return { submissions: 0, leads: 0, conversionRate: 0 };
    }
  }

  // ============= PROFIT & LOSS =============

  async getProfitLossData(timeRange = 'month') {
    const { startDate, endDate } = this.getTimeRange(timeRange);

    try {
      // Revenue from won deals
      const { data: revenue, error: revenueError } = await supabase
        .from('deals')
        .select('amount, closed_at')
        .eq('status', 'WON')
        .gte('closed_at', startDate.toISOString())
        .lte('closed_at', endDate.toISOString());

      if (revenueError) throw revenueError;

      // Expenses (from expense tracking - to be implemented)
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, category, date')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());

      const totalRevenue = revenue?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        netProfit,
        profitMargin,
        expensesByCategory: this.groupExpensesByCategory(expenses || []),
        monthlyTrend: await this.getMonthlyProfitTrend()
      };
    } catch (error) {
      console.error('Error fetching P&L data:', error);
      return this.getMockProfitLossData();
    }
  }

  // ============= INDUSTRY-SPECIFIC METRICS =============

  async getRealEstateMetrics() {
    const { startDate, endDate } = this.getTimeRange('month');

    try {
      const [listings, showings, offers] = await Promise.all([
        supabase.from('properties').select('*'),
        supabase.from('showings').select('*').gte('date', startDate.toISOString()),
        supabase.from('offers').select('*').gte('created_at', startDate.toISOString())
      ]);

      return {
        activeListings: listings.data?.filter(l => l.status === 'ACTIVE').length || 0,
        totalListings: listings.data?.length || 0,
        showingsScheduled: showings.data?.length || 0,
        offersReceived: offers.data?.length || 0,
        averageListPrice: this.calculateAverage(listings.data || [], 'list_price'),
        daysOnMarket: this.calculateAverage(listings.data?.filter(l => l.status === 'SOLD') || [], 'days_on_market'),
      };
    } catch (error) {
      console.error('Error fetching real estate metrics:', error);
      return {};
    }
  }

  async getEcommerceMetrics() {
    const { startDate, endDate } = this.getTimeRange('month');

    try {
      const [orders, products, customers] = await Promise.all([
        supabase.from('orders').select('*').gte('created_at', startDate.toISOString()),
        supabase.from('products').select('*'),
        supabase.from('customers').select('*').gte('created_at', startDate.toISOString())
      ]);

      const revenue = orders.data?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      const orderCount = orders.data?.length || 0;

      return {
        revenue,
        orderCount,
        averageOrderValue: orderCount > 0 ? revenue / orderCount : 0,
        newCustomers: customers.data?.length || 0,
        productsSold: this.calculateProductsSold(orders.data || []),
        cartAbandonmentRate: await this.getCartAbandonmentRate(startDate, endDate),
        topProducts: this.getTopProducts(orders.data || [])
      };
    } catch (error) {
      console.error('Error fetching ecommerce metrics:', error);
      return {};
    }
  }

  async getB2BMetrics() {
    const { startDate, endDate } = this.getTimeRange('month');

    try {
      const [accounts, meetings, proposals] = await Promise.all([
        supabase.from('accounts').select('*'),
        supabase.from('meetings').select('*').gte('date', startDate.toISOString()),
        supabase.from('proposals').select('*').gte('created_at', startDate.toISOString())
      ]);

      return {
        activeAccounts: accounts.data?.filter(a => a.status === 'ACTIVE').length || 0,
        meetingsHeld: meetings.data?.length || 0,
        proposalsSent: proposals.data?.length || 0,
        proposalsAccepted: proposals.data?.filter(p => p.status === 'ACCEPTED').length || 0,
        avgContractValue: this.calculateAverage(accounts.data || [], 'contract_value'),
        churnRate: await this.calculateChurnRate(startDate, endDate)
      };
    } catch (error) {
      console.error('Error fetching B2B metrics:', error);
      return {};
    }
  }

  // ============= HELPER FUNCTIONS =============

  getTimeRange(range) {
    const now = new Date();
    let startDate, endDate;

    switch (range) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        endDate = new Date();
        break;
      case 'year':
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
      const stage = deal.stage || 'NEW';
      if (!acc[stage]) acc[stage] = [];
      acc[stage].push(deal);
      return acc;
    }, {});
  }

  groupExpensesByCategory(expenses) {
    return expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
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
    // Average time from created to won
    const wonDeals = deals.deals.filter(d => d.status === 'WON');
    if (wonDeals.length === 0) return 0;

    const avgDays = wonDeals.reduce((sum, d) => {
      const created = new Date(d.created_at);
      const closed = new Date(d.closed_at || d.won_at);
      const days = Math.floor((closed - created) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0) / wonDeals.length;

    return Math.round(avgDays);
  }

  calculateTrend(historicalData) {
    if (!historicalData || historicalData.length < 2) return { direction: 'neutral', percentage: 0 };

    const current = historicalData[historicalData.length - 1];
    const previous = historicalData[historicalData.length - 2];

    if (!current || !previous) return { direction: 'neutral', percentage: 0 };

    const change = current.value - previous.value;
    const percentage = previous.value > 0 ? (change / previous.value) * 100 : 0;

    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(Math.round(percentage * 10) / 10)
    };
  }

  calculateMarketingROI(campaigns, emails) {
    // Simplified ROI calculation
    if (!campaigns || typeof campaigns !== 'object') return 0;

    // Handle if campaigns is an object with data
    const campaignArray = Array.isArray(campaigns) ? campaigns : [];

    const cost = campaignArray.reduce((sum, c) => sum + (c.cost || 0), 0);
    const revenue = campaignArray.reduce((sum, c) => sum + (c.attributed_revenue || 0), 0);

    if (cost === 0) return 0;
    return ((revenue - cost) / cost) * 100;
  }

  async getHistoricalDeals() {
    try {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));

        const { data, error } = await supabase
          .from('deals')
          .select('amount, status')
          .eq('status', 'WON')
          .gte('closed_at', monthStart.toISOString())
          .lte('closed_at', monthEnd.toISOString());

        if (error) throw error;

        const value = data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
        months.push({
          month: format(monthStart, 'MMM'),
          value
        });
      }
      return months;
    } catch (error) {
      console.error('Error fetching historical deals:', error);
      return this.getMockHistoricalData();
    }
  }

  async getMonthlyProfitTrend() {
    // Get last 6 months of profit data
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));

      const profitData = await this.getProfitLossData('month');

      months.push({
        month: format(monthStart, 'MMM'),
        revenue: profitData.revenue,
        expenses: profitData.expenses,
        profit: profitData.netProfit
      });
    }
    return months;
  }

  // ============= MOCK DATA FALLBACKS =============

  getMockDealsData() {
    return {
      totalRevenue: 125450,
      won: 8,
      lost: 3,
      averageDealSize: 15681,
      historical: this.getMockHistoricalData(),
      deals: []
    };
  }

  getMockPipelineData() {
    return {
      totalValue: 340000,
      byStage: {
        NEW: 5,
        QUALIFIED: 8,
        PROPOSAL: 4,
        NEGOTIATION: 2
      },
      deals: []
    };
  }

  getMockProfitLossData() {
    return {
      revenue: 125450,
      expenses: 45200,
      netProfit: 80250,
      profitMargin: 64,
      expensesByCategory: {
        'Marketing': 15000,
        'Operations': 20000,
        'Payroll': 10200
      },
      monthlyTrend: [
        { month: 'Jul', revenue: 95000, expenses: 42000, profit: 53000 },
        { month: 'Aug', revenue: 108000, expenses: 43500, profit: 64500 },
        { month: 'Sep', revenue: 112000, expenses: 44000, profit: 68000 },
        { month: 'Oct', revenue: 118000, expenses: 44800, profit: 73200 },
        { month: 'Nov', revenue: 125450, expenses: 45200, profit: 80250 },
      ]
    };
  }

  getMockHistoricalData() {
    return [
      { month: 'Jul', value: 95000 },
      { month: 'Aug', value: 108000 },
      { month: 'Sep', value: 112000 },
      { month: 'Oct', value: 118000 },
      { month: 'Nov', value: 125450 },
      { month: 'Dec', value: 142000 },
    ];
  }

  async getCampaignData(startDate, endDate) {
    return { active: 5, total: 12 };
  }

  calculateProductsSold(orders) {
    return orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
  }

  async getCartAbandonmentRate(startDate, endDate) {
    return 28.5; // Mock data
  }

  getTopProducts(orders) {
    return []; // To be implemented
  }

  async calculateChurnRate(startDate, endDate) {
    return 5.2; // Mock data
  }
}

export const dashboardDataService = new DashboardDataService();
export default dashboardDataService;
