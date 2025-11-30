#!/usr/bin/env node

/**
 * Dashboard Performance Monitor
 * Tracks and reports dashboard performance improvements
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { performance } from "perf_hooks";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiResponseTimes: [],
      cacheHitRates: {},
      databaseQueryCounts: {},
      frontendRenderTimes: [],
      memoryUsage: [],
      errorRates: {},
    };
  }

  /**
   * Measure API response time
   */
  async measureApiCall(endpoint, testFunction) {
    const start = performance.now();

    try {
      const result = await testFunction();
      const duration = performance.now() - start;

      this.metrics.apiResponseTimes.push({
        endpoint,
        duration,
        timestamp: new Date().toISOString(),
        success: true,
      });

      return { success: true, result, duration };
    } catch (error) {
      const duration = performance.now() - start;

      this.metrics.apiResponseTimes.push({
        endpoint,
        duration,
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message,
      });

      return { success: false, error, duration };
    }
  }

  /**
   * Test dashboard endpoints
   */
  async testDashboardEndpoints() {
    console.log("🚀 Testing Dashboard API Performance...\n");

    const tests = [
      {
        name: "Legacy Stats Overview",
        endpoint: "/api/v1/stats/overview",
        test: () => this.fetchWithAuth("/api/v1/stats/overview"),
      },
      {
        name: "Legacy Stats Sales",
        endpoint: "/api/v1/stats/sales",
        test: () => this.fetchWithAuth("/api/v1/stats/sales"),
      },
      {
        name: "Legacy Stats Marketing",
        endpoint: "/api/v1/stats/marketing",
        test: () => this.fetchWithAuth("/api/v1/stats/marketing"),
      },
      {
        name: "Unified Dashboard (New)",
        endpoint: "/api/v2/dashboard/summary",
        test: () =>
          this.fetchWithAuth(
            "/api/v2/dashboard/summary?timeRange=month&include=all",
          ),
      },
    ];

    for (const test of tests) {
      console.log(`📊 Testing: ${test.name}`);
      const result = await this.measureApiCall(test.endpoint, test.test);

      if (result.success) {
        console.log(`   ✅ ${result.duration.toFixed(2)}ms`);
      } else {
        console.log(`   ❌ Failed: ${result.error.message}`);
      }
    }

    console.log("\n📈 Performance Comparison:");
    this.analyzeResults();
  }

  /**
   * Fetch with authentication
   */
  async fetchWithAuth(endpoint) {
    // For testing, we'll make unauthenticated requests
    // In production, this would include proper auth headers
    const response = await fetch(`http://localhost:3002${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Analyze performance results
   */
  analyzeResults() {
    const legacyCalls = this.metrics.apiResponseTimes.filter((m) =>
      m.endpoint.includes("/api/v1/stats/"),
    );

    const unifiedCall = this.metrics.apiResponseTimes.find((m) =>
      m.endpoint.includes("/api/v2/dashboard/summary"),
    );

    if (legacyCalls.length > 0) {
      const avgLegacyTime =
        legacyCalls.reduce((sum, m) => sum + m.duration, 0) /
        legacyCalls.length;
      console.log(
        `   📊 Legacy API Average: ${avgLegacyTime.toFixed(2)}ms (${legacyCalls.length} calls)`,
      );

      if (unifiedCall) {
        const improvement =
          ((avgLegacyTime - unifiedCall.duration) / avgLegacyTime) * 100;
        console.log(`   ⚡ Unified API: ${unifiedCall.duration.toFixed(2)}ms`);
        console.log(
          `   🚀 Performance Improvement: ${improvement.toFixed(1)}% faster`,
        );

        // Calculate reduction in API calls
        const callReduction = legacyCalls.length - 1;
        console.log(
          `   📉 API Call Reduction: ${callReduction} fewer calls (${((callReduction / legacyCalls.length) * 100).toFixed(1)}% reduction)`,
        );
      }
    }
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalApiCalls: this.metrics.apiResponseTimes.length,
        averageResponseTime: this.calculateAverage(
          this.metrics.apiResponseTimes.map((m) => m.duration),
        ),
        cacheHitRate: this.calculateCacheHitRate(),
        errorRate: this.calculateErrorRate(),
      },
      endpoints: this.metrics.apiResponseTimes,
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  /**
   * Calculate average of array
   */
  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate cache hit rate
   */
  calculateCacheHitRate() {
    // This would be implemented with actual cache metrics
    return 0; // Placeholder
  }

  /**
   * Calculate error rate
   */
  calculateErrorRate() {
    const errors = this.metrics.apiResponseTimes.filter((m) => !m.success);
    return this.metrics.apiResponseTimes.length > 0
      ? (errors.length / this.metrics.apiResponseTimes.length) * 100
      : 0;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    const avgResponseTime = this.calculateAverage(
      this.metrics.apiResponseTimes.map((m) => m.duration),
    );

    if (avgResponseTime > 1000) {
      recommendations.push({
        priority: "high",
        category: "performance",
        issue: "Slow API response times",
        solution: "Implement Redis caching and database query optimization",
        expectedImprovement: "70-90% faster",
      });
    }

    const errorRate = this.calculateErrorRate();
    if (errorRate > 5) {
      recommendations.push({
        priority: "high",
        category: "reliability",
        issue: "High error rate",
        solution: "Add proper error handling and retry logic",
        expectedImprovement: "95%+ reliability",
      });
    }

    return recommendations;
  }

  /**
   * Save performance metrics to database
   */
  async saveMetrics() {
    try {
      const report = this.generateReport();

      const { error } = await supabase.from("performance_metrics").insert([
        {
          report,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.warn("Could not save performance metrics:", error.message);
      } else {
        console.log("✅ Performance metrics saved to database");
      }
    } catch (err) {
      console.warn("Error saving performance metrics:", err.message);
    }
  }

  /**
   * Run complete performance analysis
   */
  async runAnalysis() {
    console.log("🎯 Dashboard Performance Analysis Started\n");

    try {
      await this.testDashboardEndpoints();
      await this.saveMetrics();

      console.log("\n📊 Full Performance Report:");
      console.log(JSON.stringify(this.generateReport(), null, 2));

      console.log("\n✨ Performance analysis completed!");
    } catch (error) {
      console.error("❌ Performance analysis failed:", error.message);
    }
  }
}

// Run performance monitor
const monitor = new PerformanceMonitor();
monitor
  .runAnalysis()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
