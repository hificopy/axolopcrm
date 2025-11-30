// Temporary wrapper to handle dashboard loading errors
import dashboardDataService from './dashboardDataService';

const wrappedService = {
  async getSalesMetrics(timeRange) {
    try {
      return await dashboardDataService.getSalesMetrics(timeRange);
    } catch (error) {
      console.error('Error loading sales metrics:', error);
      return {
        totalRevenue: 0,
        revenueByPeriod: [],
        dealsWon: 0,
        dealsLost: 0,
        totalLeads: 0,
        qualifiedLeads: 0,
        newLeads: 0,
        activeDeals: 0,
        avgDealSize: 0,
        winRate: 0,
        avgSalesCycle: "0 days",
        averageDealSize: 0,
        pipelineValue: 0,
        conversionRate: 0,
        salesVelocity: 0,
        trend: 0,
      };
    }
  },

  async getMarketingMetrics(timeRange) {
    try {
      return await dashboardDataService.getMarketingMetrics(timeRange);
    } catch (error) {
      console.error('Error loading marketing metrics:', error);
      return {
        emailsSent: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        campaigns: [],
      };
    }
  },

  async getProfitLossData(timeRange) {
    try {
      return await dashboardDataService.getProfitLossData(timeRange);
    } catch (error) {
      console.error('Error loading profit/loss data:', error);
      return {
        revenue: 0,
        expenses: 0,
        profit: 0,
        margin: 0,
      };
    }
  },

  async getFormSubmissions(timeRange) {
    try {
      return await dashboardDataService.getFormSubmissions(timeRange);
    } catch (error) {
      console.error('Error loading form submissions:', error);
      return {
        total: 0,
        submissions: [],
      };
    }
  }
};

export default wrappedService;
