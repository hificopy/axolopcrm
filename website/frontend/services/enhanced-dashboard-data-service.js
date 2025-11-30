/**
 * Enhanced Dashboard Data Service with Metrics Validation
 * Wraps the original dashboardDataService with reliability detection
 * Optimized: Uses cached backend endpoint, reduced timeouts (3s), single retry
 */

import dashboardDataService from "./dashboardDataService";
import { metricsValidator } from "../utils/metrics-validator";
import { supabase } from "../config/supabaseClient";

class EnhancedDashboardDataService {
  constructor() {
    this.originalService = dashboardDataService;
    this.requestTimeouts = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 1; // Reduced from 2 to 1 for faster failure
    this.baseDelay = 500; // Reduced from 1000ms to 500ms
    this.useBackendCache = true; // Prefer cached backend endpoint
  }

  /**
   * Wrapper method that adds validation to any service method
   */
  async wrapServiceMethod(methodName, ...args) {
    const startTime = Date.now();
    const methodKey = `${methodName}_${JSON.stringify(args)}`;

    try {
      // Check if we should retry this request
      const retryCount = this.retryAttempts.get(methodKey) || 0;
      if (retryCount >= this.maxRetries) {
        return this.createErrorResponse(
          `Max retries exceeded for ${methodName}`,
        );
      }

      // Set timeout for the request
      const timeoutPromise = this.createTimeoutPromise(methodKey);

      // Execute the original method
      const methodPromise = this.originalService[methodName](...args);

      // Race between timeout and actual method
      const result = await Promise.race([methodPromise, timeoutPromise]);

      const responseTime = Date.now() - startTime;

      // Clear timeout and retry attempts on success
      this.clearTimeout(methodKey);
      this.retryAttempts.delete(methodKey);

      // Validate the response
      const validation = metricsValidator.validateMetricResponse(
        result,
        responseTime,
      );

      // If validation fails and we haven't exceeded retries, try again
      if (!validation.isReliable && retryCount < this.maxRetries) {
        // console.warn - retrying request due to validation failure
        this.retryAttempts.set(methodKey, retryCount + 1);

        // Exponential backoff
        const delay = this.baseDelay * Math.pow(2, retryCount);
        await this.sleep(delay);

        return this.wrapServiceMethod(methodName, ...args);
      }

      // Add metadata to the response
      return this.enhanceResponse(result, validation, responseTime);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const methodKey = `${methodName}_${JSON.stringify(args)}`;

      console.error(`❌ [METRICS] ${methodName} failed:`, error);

      // Clear timeout
      this.clearTimeout(methodKey);

      // Check if we should retry
      const retryCount = this.retryAttempts.get(methodKey) || 0;
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        // console.warn - retrying request due to error
        this.retryAttempts.set(methodKey, retryCount + 1);

        // Exponential backoff
        const delay = this.baseDelay * Math.pow(2, retryCount);
        await this.sleep(delay);

        return this.wrapServiceMethod(methodName, ...args);
      }

      // Return error response
      const validation = metricsValidator.validateMetricResponse(
        null,
        responseTime,
        error,
      );
      return this.enhanceResponse(null, validation, responseTime);
    }
  }

  /**
   * Creates a timeout promise for the request
   */
  createTimeoutPromise(methodKey) {
    return new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timeout for ${methodKey}`));
      }, 3000); // Reduced from 5s to 3s for faster user feedback

      this.requestTimeouts.set(methodKey, timeoutId);
    });
  }

  /**
   * Clears timeout for a method
   */
  clearTimeout(methodKey) {
    const timeoutId = this.requestTimeouts.get(methodKey);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.requestTimeouts.delete(methodKey);
    }
  }

  /**
   * Checks if an error is retryable
   */
  isRetryableError(error) {
    const retryableErrors = [
      "timeout",
      "network",
      "connection",
      "ECONNRESET",
      "ENOTFOUND",
      "ECONNREFUSED",
    ];

    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some((retryableError) =>
      errorMessage.includes(retryableError),
    );
  }

  /**
   * Sleep utility for delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Creates an error response
   */
  createErrorResponse(message) {
    return {
      _metadata: {
        isReliable: false,
        status: "max_retries_exceeded",
        message,
        shouldShowLoading: true,
        responseTime: 0,
        lastValidated: new Date().toISOString(),
      },
      // Include default zero values for all expected fields
      totalRevenue: 0,
      dealsWon: 0,
      activeDeals: 0,
      conversionRate: 0,
      campaignsActive: 0,
      emailOpens: 0,
      clickRate: 0,
      formSubmissions: 0,
    };
  }

  /**
   * Enhances response with metadata
   */
  enhanceResponse(data, validation, responseTime) {
    if (!data) {
      data = {};
    }

    return {
      ...data,
      _metadata: {
        isReliable: validation.isReliable,
        status: validation.status,
        message: validation.message,
        shouldShowLoading: validation.shouldShowLoading,
        responseTime,
        lastValidated: new Date().toISOString(),
        zerosAreReal: validation.zerosAreReal,
      },
    };
  }

  /**
   * Batch method to get all dashboard metrics with reliability info
   * Now uses unified v2 API endpoint with tiered caching
   */
  async getAllMetrics(timeRange = "month", include = "all") {
    const startTime = Date.now();

    try {
      // console.log - getting all metrics

      // Use the new unified dashboard API endpoint
      const response = await fetch(
        `/api/v2/dashboard/summary?timeRange=${timeRange}&include=${include}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Dashboard API error: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();
      const responseTime = Date.now() - startTime;

      if (!result.success) {
        throw new Error(result.message || "Dashboard API returned error");
      }

      // console.log$1

      // Transform unified API response to match expected format
      const transformedData = this.transformUnifiedResponse(
        result.data,
        result.source,
      );

      return {
        ...transformedData,
        _metadata: {
          responseTime,
          lastValidated: new Date().toISOString(),
          source: result.source,
          overallReliability: {
            total: 4,
            reliable: 4,
            reliabilityPercentage: 100,
          },
          isReliable: true,
          status: result.source === "cache" ? "cached" : "fresh",
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error("❌ [METRICS] getAllMetrics failed:", error);

      // Fallback to legacy method if unified API fails
      // console.log$1
      return this.fallbackToLegacy(timeRange, responseTime);
    }
  }

  /**
   * Transform unified API response to match expected frontend format
   */
  transformUnifiedResponse(data, source) {
    const result = {
      sales: {},
      marketing: {},
      profitLoss: {},
      forms: {},
      overview: {},
      recentLeads: [],
      recentActivities: [],
    };

    // Merge data from different tiers
    if (data.realtime) {
      result.recentLeads = data.realtime.recentLeads || [];
      result.recentActivities = data.realtime.recentActivities || [];
      result.sales.activeDeals = data.realtime.activeDeals || 0;
      result.sales.todayStats = data.realtime.todayStats || {};
    }

    if (data.hourly) {
      result.sales = { ...result.sales, ...data.hourly.sales };
      result.marketing = data.hourly.marketing || {};
      result.opportunities = data.hourly.opportunities || {};
    }

    if (data.daily) {
      result.overview = data.daily.overview || {};
      result.forms = data.daily.forms || {};
      result.profitLoss = data.daily.profitLoss || {};
    }

    // Add metadata to each section
    Object.keys(result).forEach((key) => {
      if (typeof result[key] === "object" && result[key] !== null) {
        result[key]._metadata = {
          isReliable: true,
          status: source === "cache" ? "cached" : "fresh",
          source,
        };
      }
    });

    return result;
  }

  /**
   * Fallback to legacy dashboard service if unified API fails
   */
  async fallbackToLegacy(timeRange, startTime) {
    try {
      const [salesResult, marketingResult, profitLossResult, formsResult] =
        await Promise.allSettled([
          this.wrapServiceMethod("getSalesMetrics", timeRange),
          this.wrapServiceMethod("getMarketingMetrics", timeRange),
          this.wrapServiceMethod("getProfitLossData", timeRange),
          this.wrapServiceMethod("getFormSubmissions", timeRange),
        ]);

      const responseTime = Date.now() - startTime;

      return {
        sales: this.processSettledResult(salesResult, "sales"),
        marketing: this.processSettledResult(marketingResult, "marketing"),
        profitLoss: this.processSettledResult(profitLossResult, "profitLoss"),
        forms: this.processSettledResult(formsResult, "forms"),
        _metadata: {
          responseTime,
          lastValidated: new Date().toISOString(),
          source: "legacy_fallback",
          overallReliability: this.calculateOverallReliability([
            salesResult,
            marketingResult,
            profitLossResult,
            formsResult,
          ]),
        },
      };
    } catch (fallbackError) {
      console.error("❌ [METRICS] Legacy fallback also failed:", fallbackError);
      return this.createErrorResponse("Failed to fetch all metrics");
    }
  }

  /**
   * Get auth token for API requests
   */
  async getAuthToken() {
    // Try to get token from Supabase auth
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token || "";
    } catch (error) {
      // console.warn$1
      return "";
    }
  }

  /**
   * Processes a settled promise result
   */
  processSettledResult(result, metricType) {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      console.error(`❌ [METRICS] ${metricType} failed:`, result.reason);
      return this.createErrorResponse(`${metricType} metrics failed`);
    }
  }

  /**
   * Calculates overall reliability from multiple results
   */
  calculateOverallReliability(results) {
    const total = results.length;
    const reliable = results.filter(
      (r) => r.status === "fulfilled" && r.value?._metadata?.isReliable,
    ).length;

    return {
      total,
      reliable,
      unreliable: total - reliable,
      reliabilityPercentage: total > 0 ? (reliable / total) * 100 : 0,
    };
  }

  /**
   * Alias for getAllMetrics to prevent breaking changes
   * Dashboard page was calling getDashboardMetrics which doesn't exist
   */
  async getDashboardMetrics(timeRange, include) {
    return this.getAllMetrics(timeRange, include);
  }

  /**
   * Health check for metrics service
   */
  async healthCheck() {
    try {
      const startTime = Date.now();

      // Test a simple metrics call
      const result = await this.wrapServiceMethod("getSalesMetrics", "today");
      const responseTime = Date.now() - startTime;

      return {
        status: "healthy",
        responseTime,
        timestamp: new Date().toISOString(),
        isReliable: result?._metadata?.isReliable || false,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
        isReliable: false,
      };
    }
  }

  // Proxy all original service methods through the wrapper
  async getSalesMetrics(timeRange) {
    return this.wrapServiceMethod("getSalesMetrics", timeRange);
  }

  async getMarketingMetrics(timeRange) {
    return this.wrapServiceMethod("getMarketingMetrics", timeRange);
  }

  async getProfitLossData(timeRange) {
    return this.wrapServiceMethod("getProfitLossData", timeRange);
  }

  async getFormSubmissions(timeRange) {
    return this.wrapServiceMethod("getFormSubmissions", timeRange);
  }

  // Add other methods as needed...
  async getDealsData(startDate, endDate) {
    return this.wrapServiceMethod("getDealsData", startDate, endDate);
  }

  async getPipelineData() {
    return this.wrapServiceMethod("getPipelineData");
  }

  async getConversionRates(startDate, endDate) {
    return this.wrapServiceMethod("getConversionRates", startDate, endDate);
  }
}

// Create and export singleton instance
export const enhancedDashboardDataService = new EnhancedDashboardDataService();
export default enhancedDashboardDataService;
