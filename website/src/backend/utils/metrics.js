import logger from './logger.js';

/**
 * Simple metrics collection system
 */
class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: { total: 0, by_method: {}, by_status: {}, by_endpoint: {} },
      workflows: { executed: 0, failed: 0, avg_duration: 0 },
      emails: { sent: 0, opened: 0, clicked: 0, bounced: 0 },
      cache: { hits: 0, misses: 0, hit_rate: 0 },
      database: { queries: 0, errors: 0, avg_duration: 0 },
      errors: { total: 0, by_type: {} },
    };

    this.durations = {
      workflows: [],
      database: [],
    };

    this.startTime = Date.now();
  }

  /**
   * Record HTTP request
   */
  recordRequest(method, path, statusCode, duration) {
    this.metrics.requests.total++;

    // By method
    this.metrics.requests.by_method[method] =
      (this.metrics.requests.by_method[method] || 0) + 1;

    // By status
    const statusRange = `${Math.floor(statusCode / 100)}xx`;
    this.metrics.requests.by_status[statusRange] =
      (this.metrics.requests.by_status[statusRange] || 0) + 1;

    // By endpoint (simplified)
    const endpoint = path.split('?')[0];
    this.metrics.requests.by_endpoint[endpoint] =
      (this.metrics.requests.by_endpoint[endpoint] || 0) + 1;
  }

  /**
   * Record workflow execution
   */
  recordWorkflow(success, duration) {
    this.metrics.workflows.executed++;
    if (!success) {
      this.metrics.workflows.failed++;
    }

    this.durations.workflows.push(duration);
    this.metrics.workflows.avg_duration = this.calculateAverage(this.durations.workflows);
  }

  /**
   * Record email event
   */
  recordEmail(event) {
    switch (event) {
      case 'sent':
        this.metrics.emails.sent++;
        break;
      case 'opened':
        this.metrics.emails.opened++;
        break;
      case 'clicked':
        this.metrics.emails.clicked++;
        break;
      case 'bounced':
        this.metrics.emails.bounced++;
        break;
    }
  }

  /**
   * Record cache hit/miss
   */
  recordCache(hit) {
    if (hit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }

    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hit_rate = total > 0 ? (this.metrics.cache.hits / total) * 100 : 0;
  }

  /**
   * Record database query
   */
  recordDatabase(success, duration) {
    this.metrics.database.queries++;
    if (!success) {
      this.metrics.database.errors++;
    }

    this.durations.database.push(duration);
    this.metrics.database.avg_duration = this.calculateAverage(this.durations.database);
  }

  /**
   * Record error
   */
  recordError(errorType) {
    this.metrics.errors.total++;
    this.metrics.errors.by_type[errorType] =
      (this.metrics.errors.by_type[errorType] || 0) + 1;
  }

  /**
   * Calculate average
   */
  calculateAverage(values) {
    if (values.length === 0) return 0;

    // Keep only last 100 values
    const recent = values.slice(-100);
    const sum = recent.reduce((a, b) => a + b, 0);
    return Math.round(sum / recent.length);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const uptime = Date.now() - this.startTime;

    return {
      ...this.metrics,
      uptime: {
        ms: uptime,
        seconds: Math.floor(uptime / 1000),
        minutes: Math.floor(uptime / 60000),
        hours: Math.floor(uptime / 3600000),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const metrics = this.getMetrics();

    return {
      requests: {
        total: metrics.requests.total,
        per_minute: this.calculateRate(metrics.requests.total, metrics.uptime.minutes),
        errors: metrics.requests.by_status['4xx'] + metrics.requests.by_status['5xx'] || 0,
      },
      workflows: {
        total: metrics.workflows.executed,
        success_rate: this.calculateSuccessRate(
          metrics.workflows.executed,
          metrics.workflows.failed
        ),
        avg_duration: metrics.workflows.avg_duration,
      },
      emails: {
        total_sent: metrics.emails.sent,
        open_rate: this.calculateRate(metrics.emails.opened, metrics.emails.sent),
        click_rate: this.calculateRate(metrics.emails.clicked, metrics.emails.sent),
        bounce_rate: this.calculateRate(metrics.emails.bounced, metrics.emails.sent),
      },
      cache: {
        hit_rate: metrics.cache.hit_rate.toFixed(2) + '%',
        total_operations: metrics.cache.hits + metrics.cache.misses,
      },
      database: {
        total_queries: metrics.database.queries,
        error_rate: this.calculateRate(metrics.database.errors, metrics.database.queries),
        avg_duration: metrics.database.avg_duration,
      },
      errors: {
        total: metrics.errors.total,
        rate: this.calculateRate(metrics.errors.total, metrics.requests.total),
      },
      uptime: this.formatUptime(metrics.uptime.seconds),
    };
  }

  /**
   * Calculate rate as percentage
   */
  calculateRate(numerator, denominator) {
    if (denominator === 0) return 0;
    return ((numerator / denominator) * 100).toFixed(2) + '%';
  }

  /**
   * Calculate success rate
   */
  calculateSuccessRate(total, failed) {
    if (total === 0) return '100.00%';
    const success = total - failed;
    return ((success / total) * 100).toFixed(2) + '%';
  }

  /**
   * Format uptime
   */
  formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      requests: { total: 0, by_method: {}, by_status: {}, by_endpoint: {} },
      workflows: { executed: 0, failed: 0, avg_duration: 0 },
      emails: { sent: 0, opened: 0, clicked: 0, bounced: 0 },
      cache: { hits: 0, misses: 0, hit_rate: 0 },
      database: { queries: 0, errors: 0, avg_duration: 0 },
      errors: { total: 0, by_type: {} },
    };

    this.durations = {
      workflows: [],
      database: [],
    };

    this.startTime = Date.now();

    logger.info('Metrics reset');
  }

  /**
   * Log metrics summary
   */
  logSummary() {
    const summary = this.getSummary();
    logger.info('Metrics Summary', summary);
  }
}

// Create singleton instance
const metrics = new MetricsCollector();

// Log metrics every 5 minutes
setInterval(() => {
  metrics.logSummary();
}, 5 * 60 * 1000);

export default metrics;

/**
 * Metrics middleware
 */
export function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.recordRequest(req.method, req.path, res.statusCode, duration);
  });

  next();
}
