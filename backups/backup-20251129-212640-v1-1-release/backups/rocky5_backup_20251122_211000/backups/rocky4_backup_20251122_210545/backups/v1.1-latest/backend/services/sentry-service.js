import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import config from '../config/app.config.js';
import logger from '../utils/logger.js';

class SentryService {
  constructor() {
    this.enabled = config.sentry.enabled && config.sentry.dsn && config.sentry.dsn !== 'your_sentry_dsn';
    
    if (this.enabled) {
      Sentry.init({
        dsn: config.sentry.dsn,
        integrations: [
          // Enable HTTP tracing
          new Sentry.Integrations.Http({ tracing: true }),
          // Enable console breadcrumbs
          new Sentry.Integrations.Console(),
          // Enable node console, node http, and node onuncaughtexception handlers
          new Tracing.Integrations.Prisma({ client: null }), // Will be ignored since we're not using Prisma
          ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Capture 100% of the transactions
        
        // Set sampling rates for different environments
        ...(config.env === 'production' && { 
          tracesSampleRate: 0.5, // Capture 50% of transactions in production to reduce volume
          sampleRate: 0.2 // Capture 20% of errors in production
        }),
        
        // Set environment
        environment: config.env,
        
        // Custom release version
        release: `axolop-crm@${config.version || '1.0.0'}`,
        
        // Additional configuration
        attachStacktrace: true,
        sendDefaultPii: true, // Send personally identifiable information
      });
      
      logger.info('✅ Sentry initialized');
    } else {
      logger.warn('⚠️ Sentry is not configured or disabled');
    }
  }

  /**
   * Capture an exception/error
   */
  captureException(error, context = {}) {
    if (!this.enabled) {
      return;
    }

    try {
      Sentry.captureException(error, {
        contexts: {
          custom: context,
        },
      });
    } catch (captureError) {
      logger.error('Error capturing exception in Sentry:', captureError);
    }
  }

  /**
   * Capture a message
   */
  captureMessage(message, level = 'info', context = {}) {
    if (!this.enabled) {
      return;
    }

    try {
      Sentry.captureMessage(message, {
        level,
        contexts: {
          custom: context,
        },
      });
    } catch (captureError) {
      logger.error('Error capturing message in Sentry:', captureError);
    }
  }

  /**
   * Add breadcrumbs for debugging
   */
  addBreadcrumb(breadcrumb) {
    if (!this.enabled) {
      return;
    }

    try {
      Sentry.addBreadcrumb(breadcrumb);
    } catch (error) {
      logger.error('Error adding breadcrumb to Sentry:', error);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(user) {
    if (!this.enabled) {
      return;
    }

    try {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name || user.username,
      });
    } catch (error) {
      logger.error('Error setting user in Sentry:', error);
    }
  }

  /**
   * Set extra context for error tracking
   */
  setExtra(key, value) {
    if (!this.enabled) {
      return;
    }

    try {
      Sentry.setExtra(key, value);
    } catch (error) {
      logger.error('Error setting extra in Sentry:', error);
    }
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name, op = 'function', description = '') {
    if (!this.enabled) {
      return null;
    }

    try {
      return Sentry.startTransaction({
        name,
        op,
        description,
      });
    } catch (error) {
      logger.error('Error starting Sentry transaction:', error);
      return null;
    }
  }

  /**
   * Create a Sentry middleware for Express
   */
  getSentryMiddleware() {
    if (!this.enabled) {
      // Return a no-op middleware when disabled
      return (req, res, next) => next();
    }

    return [
      // Request handler must be the first middleware
      Sentry.Handlers.requestHandler({
        ip: true, // Enable client IP capture
        request: ['headers', 'method', 'url'], // Capture these request attributes
        user: ['id', 'email'], // Capture these user attributes
      }),
      // Tracing handler must be after the request handler
      Sentry.Handlers.tracingHandler(),
    ];
  }

  /**
   * Get Sentry error handler middleware
   */
  getSentryErrorHandler() {
    if (!this.enabled) {
      // Return a no-op error handler when disabled
      return (err, req, res, next) => {
        logger.error('Sentry disabled, logging error:', err);
        next(err);
      };
    }

    return Sentry.Handlers.errorHandler();
  }

  /**
   * Get performance monitoring middleware
   */
  getPerformanceMiddleware(name) {
    if (!this.enabled) {
      // Return a no-op middleware when disabled
      return (req, res, next) => next();
    }

    return (req, res, next) => {
      const transaction = this.startTransaction(name, 'http.server');
      if (transaction) {
        // Set the transaction on the request for access in route handlers
        req.sentryTransaction = transaction;
        
        // Set the status when response is finished
        res.on('finish', () => {
          transaction.setHttpStatus(res.statusCode);
          transaction.finish();
        });
      }
      next();
    };
  }
}

export default new SentryService();