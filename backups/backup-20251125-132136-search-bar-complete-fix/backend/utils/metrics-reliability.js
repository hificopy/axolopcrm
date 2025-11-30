/**
 * Metrics Reliability Detector
 * Stub implementation for monitoring metrics reliability
 */

class MetricsReliabilityDetector {
  constructor() {
    this.metrics = {};
    this.healthStatus = {
      lastCheck: null,
      isHealthy: true,
      errors: []
    };
  }

  track(name, value) {
    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }
    this.metrics[name].push({
      value,
      timestamp: new Date()
    });
  }

  checkReliability(name) {
    const data = this.metrics[name] || [];
    return {
      name,
      count: data.length,
      isReliable: data.length >= 1,
      lastUpdated: data.length > 0 ? data[data.length - 1].timestamp : null
    };
  }

  getAllMetrics() {
    return Object.keys(this.metrics).map(name => this.checkReliability(name));
  }

  clear() {
    this.metrics = {};
  }

  /**
   * Middleware to add reliability metadata to responses
   */
  addReliabilityMetadata(req, res, next) {
    // Add metadata to response
    res.locals.metricsReliability = {
      timestamp: new Date().toISOString(),
      isReliable: true
    };
    next();
  }

  /**
   * Perform health check against Supabase
   */
  async performHealthCheck(supabase) {
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      this.healthStatus = {
        lastCheck: new Date(),
        isHealthy: !error,
        errors: error ? [error.message] : []
      };
      return this.healthStatus;
    } catch (err) {
      this.healthStatus = {
        lastCheck: new Date(),
        isHealthy: false,
        errors: [err.message]
      };
      return this.healthStatus;
    }
  }

  /**
   * Get reliability statistics
   */
  getReliabilityStats() {
    return {
      metrics: this.getAllMetrics(),
      health: this.healthStatus,
      summary: {
        totalMetrics: Object.keys(this.metrics).length,
        isSystemHealthy: this.healthStatus.isHealthy
      }
    };
  }
}

const metricsReliabilityDetector = new MetricsReliabilityDetector();

export default metricsReliabilityDetector;
