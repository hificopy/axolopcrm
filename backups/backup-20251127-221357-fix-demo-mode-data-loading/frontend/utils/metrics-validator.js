/**
 * Metrics Validation System
 * Distinguishes between real zeros and sync issues in metrics data
 */

export class MetricsValidator {
  constructor() {
    this.timeoutThreshold = 5000; // 5 seconds
    this.retryThreshold = 2; // Max retries before marking as sync issue
  }

  /**
   * Validates a metric response and determines if it's reliable
   * @param {Object} response - API response object
   * @param {number} responseTime - Time taken to get response in ms
   * @param {Error|null} error - Any error that occurred
   * @returns {Object} Validation result with reliability status
   */
  validateMetricResponse(response, responseTime = 0, error = null) {
    // If there was an error, it's a sync issue
    if (error) {
      return {
        isReliable: false,
        status: "error",
        message: error.message || "Failed to fetch metric",
        value: null,
        shouldShowLoading: true,
      };
    }

    // If response took too long, mark as potentially unreliable
    if (responseTime > this.timeoutThreshold) {
      return {
        isReliable: false,
        status: "timeout",
        message: "Request timed out",
        value: null,
        shouldShowLoading: true,
      };
    }

    // If response is null/undefined, it's a sync issue
    if (!response) {
      return {
        isReliable: false,
        status: "no_data",
        message: "No data available",
        value: null,
        shouldShowLoading: true,
      };
    }

    // Check if response has expected structure
    const validationResult = this.validateResponseStructure(response);
    if (!validationResult.isValid) {
      return {
        isReliable: false,
        status: "invalid_structure",
        message: validationResult.message,
        value: null,
        shouldShowLoading: true,
      };
    }

    // At this point, we have a valid response - determine if zeros are real
    const zerosAreReal = this.validateZeros(response);

    return {
      isReliable: true,
      status: "success",
      message: "Data loaded successfully",
      value: response,
      shouldShowLoading: false,
      zerosAreReal,
    };
  }

  /**
   * Validates response structure for expected metrics format
   */
  validateResponseStructure(response) {
    if (typeof response !== "object") {
      return {
        isValid: false,
        message: "Response is not an object",
      };
    }

    // Check for common metrics response patterns
    const validPatterns = [
      // Simple numeric response
      (resp) => typeof resp === "number",
      // Object with numeric values
      (resp) => Object.values(resp).every((val) => typeof val === "number"),
      // Array of metric objects
      (resp) =>
        Array.isArray(resp) &&
        resp.every((item) => typeof item === "object" && "value" in item),
      // Dashboard service response format
      (resp) => this.isDashboardServiceResponse(resp),
    ];

    const isValidPattern = validPatterns.some((pattern) => pattern(response));

    return {
      isValid: isValidPattern,
      message: isValidPattern ? null : "Invalid response structure for metrics",
    };
  }

  /**
   * Checks if response matches dashboard service format
   */
  isDashboardServiceResponse(response) {
    const expectedFields = [
      "totalRevenue",
      "dealsWon",
      "activeDeals",
      "conversionRate",
      "campaignsActive",
      "emailOpens",
      "clickRate",
      "formSubmissions",
    ];

    return (
      expectedFields.some((field) => field in response) &&
      Object.values(response).some((val) => typeof val === "number")
    );
  }

  /**
   * Validates whether zero values are legitimate or indicate sync issues
   */
  validateZeros(response) {
    // Extract all numeric values from response
    const numericValues = this.extractNumericValues(response);

    if (numericValues.length === 0) {
      return false; // No numeric values found
    }

    // Check if all values are zero
    const allZeros = numericValues.every((val) => val === 0);

    if (!allZeros) {
      return true; // Mixed values means zeros are real
    }

    // All values are zero - check if this makes sense
    return this.validateAllZerosScenario(response);
  }

  /**
   * Extracts all numeric values from a nested response object
   */
  extractNumericValues(obj, values = []) {
    if (typeof obj === "number") {
      values.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach((item) => this.extractNumericValues(item, values));
    } else if (typeof obj === "object" && obj !== null) {
      Object.values(obj).forEach((val) =>
        this.extractNumericValues(val, values),
      );
    }
    return values;
  }

  /**
   * Validates if all-zero scenario is plausible
   */
  validateAllZerosScenario(response) {
    // Check for indicators that suggest real zeros vs sync issues

    // 1. Check for metadata that confirms data was processed
    if (response._metadata || response.dataFreshness || response.lastUpdated) {
      return true; // Metadata suggests real data processing
    }

    // 2. Check for counts that should realistically be zero
    const hasRealisticZeros = this.hasRealisticZeroPattern(response);

    // 3. Check for partial data (some fields populated, others zero)
    const hasPartialData = this.hasPartialDataPattern(response);

    return hasRealisticZeros || hasPartialData;
  }

  /**
   * Checks if zero values follow realistic patterns
   */
  hasRealisticZeroPattern(response) {
    // Patterns that suggest real zeros:

    // 1. New account with no activity
    const isNewAccountPattern =
      (response.totalLeads === 0 && response.totalRevenue === 0) ||
      (response.forms === 0 && response.formSubmissions === 0);

    // 2. No activity in specific time range
    const isTimeRangePattern =
      (response.thisMonth === 0 && response.lastMonth > 0) ||
      (response.today === 0 && response.thisWeek > 0);

    // 3. Specific metric categories that can legitimately be zero
    const isCategoryPattern =
      (response.wonDeals === 0 && response.activeDeals > 0) || // No wins yet
      (response.unsubscribeRate === 0 && response.totalSubscribers > 0); // No unsubscribes

    return isNewAccountPattern || isTimeRangePattern || isCategoryPattern;
  }

  /**
   * Checks for partial data patterns
   */
  hasPartialDataPattern(response) {
    const numericValues = this.extractNumericValues(response);
    const nonZeroValues = numericValues.filter((val) => val > 0);
    const zeroValues = numericValues.filter((val) => val === 0);

    // If we have both zero and non-zero values, zeros are likely real
    return nonZeroValues.length > 0 && zeroValues.length > 0;
  }

  /**
   * Creates a metrics wrapper with reliability information
   */
  wrapMetric(value, validation) {
    return {
      value,
      isReliable: validation.isReliable,
      status: validation.status,
      message: validation.message,
      shouldShowLoading: validation.shouldShowLoading,
      lastValidated: new Date().toISOString(),
    };
  }

  /**
   * Batch validates multiple metrics
   */
  validateMultipleMetrics(metricsMap) {
    const results = {};
    const overallReliability = {
      total: Object.keys(metricsMap).length,
      reliable: 0,
      unreliable: 0,
      errors: 0,
    };

    Object.entries(metricsMap).forEach(([key, metricData]) => {
      const validation = this.validateMetricResponse(
        metricData.response,
        metricData.responseTime,
        metricData.error,
      );

      results[key] = this.wrapMetric(metricData.response, validation);

      // Update overall reliability stats
      if (validation.isReliable) {
        overallReliability.reliable++;
      } else {
        overallReliability.unreliable++;
        if (validation.status === "error") {
          overallReliability.errors++;
        }
      }
    });

    return {
      metrics: results,
      overallReliability,
      isPartiallyReliable:
        overallReliability.reliable > 0 && overallReliability.unreliable > 0,
      isFullyReliable: overallReliability.reliable === overallReliability.total,
      isFullyUnreliable: overallReliability.reliable === 0,
    };
  }
}

// Singleton instance
export const metricsValidator = new MetricsValidator();
export default metricsValidator;
