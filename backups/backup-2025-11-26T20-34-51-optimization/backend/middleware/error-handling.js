// ========================================
// ERROR HANDLING IMPROVEMENTS
// ========================================
// Comprehensive error handling for Axolop CRM

import { logger } from "../utils/logger.js";

// ========================================
// ERROR CLASSES
// ========================================

export class AppError extends Error {
  constructor(
    message,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details = null,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401, "AUTHENTICATION_ERROR");
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, 403, "AUTHORIZATION_ERROR");
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND_ERROR");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409, "CONFLICT_ERROR");
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT_ERROR");
    this.name = "RateLimitError";
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", details = null) {
    super(message, 500, "DATABASE_ERROR", details);
    this.name = "DatabaseError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service error", service = null) {
    super(message, 502, "EXTERNAL_SERVICE_ERROR", { service });
    this.name = "ExternalServiceError";
  }
}

// ========================================
// ERROR RESPONSE FORMATTER
// ========================================

export const formatErrorResponse = (error, includeStackTrace = false) => {
  const response = {
    success: false,
    error: {
      message: error.message || "Internal server error",
      code: error.code || "INTERNAL_ERROR",
      timestamp: error.timestamp || new Date().toISOString(),
    },
  };

  // Add status code if available
  if (error.statusCode) {
    response.error.statusCode = error.statusCode;
  }

  // Add details if available and safe to expose
  if (error.details && error.isOperational) {
    response.error.details = error.details;
  }

  // Add stack trace in development or when explicitly requested
  if (includeStackTrace && error.stack) {
    response.error.stack = error.stack;
  }

  // Add request ID if available
  if (error.requestId) {
    response.error.requestId = error.requestId;
  }

  return response;
};

// ========================================
// COMPREHENSIVE ERROR HANDLER
// ========================================

export const comprehensiveErrorHandler = (error, req, res, next) => {
  // Add request ID to error
  error.requestId = req.headers["x-request-id"] || "unknown";

  // Log the error
  const logLevel = error.statusCode >= 500 ? "error" : "warn";
  logger[logLevel]("Request error", {
    requestId: error.requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
    },
  });

  // Handle specific error types
  if (error.name === "ValidationError") {
    return res.status(400).json(formatErrorResponse(error));
  }

  if (error.name === "AuthenticationError") {
    return res.status(401).json(formatErrorResponse(error));
  }

  if (error.name === "AuthorizationError") {
    return res.status(403).json(formatErrorResponse(error));
  }

  if (error.name === "NotFoundError") {
    return res.status(404).json(formatErrorResponse(error));
  }

  if (error.name === "ConflictError") {
    return res.status(409).json(formatErrorResponse(error));
  }

  if (error.name === "RateLimitError") {
    return res.status(429).json(formatErrorResponse(error));
  }

  if (error.name === "DatabaseError") {
    return res.status(500).json(formatErrorResponse(error));
  }

  if (error.name === "ExternalServiceError") {
    return res.status(502).json(formatErrorResponse(error));
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    const jwtError = new AuthenticationError("Invalid token");
    return res.status(401).json(formatErrorResponse(jwtError));
  }

  if (error.name === "TokenExpiredError") {
    const jwtError = new AuthenticationError("Token expired");
    return res.status(401).json(formatErrorResponse(jwtError));
  }

  // Handle Multer errors
  if (error.name === "MulterError") {
    let message = "File upload error";
    if (error.code === "LIMIT_FILE_SIZE") {
      message = "File too large";
    } else if (error.code === "LIMIT_FILE_COUNT") {
      message = "Too many files";
    } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field";
    }

    const uploadError = new ValidationError(message);
    return res.status(400).json(formatErrorResponse(uploadError));
  }

  // Handle Zod validation errors
  if (error.name === "ZodError") {
    const validationError = new ValidationError("Validation failed", {
      issues: error.issues,
    });
    return res.status(400).json(formatErrorResponse(validationError));
  }

  // Handle Supabase errors
  if (error.code?.startsWith("PGRST")) {
    const dbError = new DatabaseError("Database operation failed", {
      pgCode: error.code,
      details: error.details,
      hint: error.hint,
    });
    return res.status(500).json(formatErrorResponse(dbError));
  }

  // Handle network errors
  if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
    const networkError = new ExternalServiceError("Network connection failed");
    return res.status(503).json(formatErrorResponse(networkError));
  }

  // Handle timeout errors
  if (error.code === "ETIMEDOUT") {
    const timeoutError = new ExternalServiceError("Request timeout");
    return res.status(504).json(formatErrorResponse(timeoutError));
  }

  // Default error handling
  const isDevelopment = process.env.NODE_ENV === "development";
  const defaultError = new AppError(
    error.message || "Internal server error",
    error.statusCode || 500,
    error.code || "INTERNAL_ERROR",
  );

  res
    .status(defaultError.statusCode)
    .json(formatErrorResponse(defaultError, isDevelopment));
};

// ========================================
// ASYNC ERROR WRAPPER
// ========================================

export const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ========================================
// GRACEFUL DEGRADATION
// ========================================

export class GracefulDegradation {
  constructor() {
    this.fallbacks = new Map();
  }

  // Register a fallback for a service
  register(serviceName, fallbackFn) {
    this.fallbacks.set(serviceName, fallbackFn);
  }

  // Execute with fallback
  async execute(serviceName, primaryFn, ...args) {
    try {
      return await primaryFn(...args);
    } catch (error) {
      logger.warn(`Service ${serviceName} failed, trying fallback`, {
        service: serviceName,
        error: error.message,
      });

      const fallback = this.fallbacks.get(serviceName);
      if (fallback) {
        try {
          return await fallback(...args);
        } catch (fallbackError) {
          logger.error(`Fallback for ${serviceName} also failed`, {
            service: serviceName,
            error: fallbackError.message,
          });
          throw new ExternalServiceError(
            `Service ${serviceName} is unavailable`,
            serviceName,
          );
        }
      }

      throw new ExternalServiceError(
        `Service ${serviceName} is unavailable`,
        serviceName,
      );
    }
  }
}

// ========================================
// CIRCUIT BREAKER PATTERN
// ========================================

export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds

    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  async execute(operation, ...args) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "HALF_OPEN";
        this.successCount = 0;
      } else {
        throw new ExternalServiceError("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = "CLOSED";
        this.failureCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// ========================================
// RETRY MECHANISM
// ========================================

export class RetryMechanism {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000; // 1 second
    this.maxDelay = options.maxDelay || 30000; // 30 seconds
    this.backoffFactor = options.backoffFactor || 2;
    this.retryableErrors = options.retryableErrors || [
      "ECONNRESET",
      "ETIMEDOUT",
      "ENOTFOUND",
      "ECONNREFUSED",
    ];
  }

  async execute(operation, ...args) {
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation(...args);
      } catch (error) {
        lastError = error;

        // Don't retry on last attempt or non-retryable errors
        if (attempt === this.maxRetries || !this.isRetryableError(error)) {
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        logger.warn(`Operation failed, retrying in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries: this.maxRetries + 1,
          error: error.message,
        });

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  isRetryableError(error) {
    return (
      this.retryableErrors.includes(error.code) ||
      error.statusCode >= 500 ||
      error.message?.includes("timeout") ||
      error.message?.includes("connection")
    );
  }

  calculateDelay(attempt) {
    const delay = this.baseDelay * Math.pow(this.backoffFactor, attempt);
    return Math.min(delay, this.maxDelay);
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ========================================
// ERROR RECOVERY MECHANISMS
// ========================================

export class ErrorRecovery {
  constructor() {
    this.recoveryStrategies = new Map();
  }

  // Register a recovery strategy
  register(errorType, strategy) {
    this.recoveryStrategies.set(errorType, strategy);
  }

  // Attempt recovery
  async recover(error, context = {}) {
    const strategy = this.recoveryStrategies.get(error.constructor.name);

    if (strategy) {
      try {
        logger.info(`Attempting recovery for ${error.constructor.name}`, {
          error: error.message,
          context,
        });

        return await strategy(error, context);
      } catch (recoveryError) {
        logger.error(`Recovery failed for ${error.constructor.name}`, {
          error: error.message,
          recoveryError: recoveryError.message,
        });
        throw recoveryError;
      }
    }

    throw error;
  }
}

// ========================================
// USER-FRIENDLY ERROR MESSAGES
// ========================================

export const getUserFriendlyMessage = (error) => {
  const messageMap = {
    VALIDATION_ERROR: "Please check your input and try again.",
    AUTHENTICATION_ERROR: "Please log in to continue.",
    AUTHORIZATION_ERROR: "You don't have permission to perform this action.",
    NOT_FOUND_ERROR: "The requested resource was not found.",
    CONFLICT_ERROR: "This action conflicts with existing data.",
    RATE_LIMIT_ERROR: "Please wait before trying again.",
    DATABASE_ERROR: "A database error occurred. Please try again.",
    EXTERNAL_SERVICE_ERROR:
      "A service is temporarily unavailable. Please try again.",
    NETWORK_ERROR:
      "Network connection failed. Please check your internet connection.",
    TIMEOUT_ERROR: "The request timed out. Please try again.",
  };

  return (
    messageMap[error.code] || "An unexpected error occurred. Please try again."
  );
};

// ========================================
// ERROR MONITORING AND ANALYTICS
// ========================================

export class ErrorMonitor {
  constructor() {
    this.errorCounts = new Map();
    this.errorRates = new Map();
    this.lastReset = Date.now();
    this.resetInterval = 60000; // 1 minute
  }

  // Record an error
  record(error, context = {}) {
    const key = `${error.code || "UNKNOWN"}:${error.statusCode || 500}`;

    // Increment count
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);

    // Log to external monitoring
    this.logToMonitoring(error, context);

    // Reset counters if interval passed
    if (Date.now() - this.lastReset > this.resetInterval) {
      this.reset();
    }
  }

  // Get error statistics
  getStats() {
    const total = Array.from(this.errorCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );

    return {
      total,
      errors: Object.fromEntries(this.errorCounts),
      rates: Object.fromEntries(this.errorRates),
      timestamp: new Date().toISOString(),
    };
  }

  // Reset counters
  reset() {
    this.errorCounts.clear();
    this.errorRates.clear();
    this.lastReset = Date.now();
  }

  // Log to external monitoring service
  logToMonitoring(error, context) {
    // Send to Sentry, DataDog, etc.
    if (global.Sentry) {
      global.Sentry.captureException(error, {
        contexts: {
          app: context,
        },
      });
    }

    // Send to custom analytics
    if (global.analytics) {
      global.analytics.track("error_occurred", {
        error_code: error.code,
        error_message: error.message,
        status_code: error.statusCode,
        ...context,
      });
    }
  }
}

// ========================================
// GLOBAL ERROR HANDLERS
// ========================================

export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Promise Rejection", {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise,
    });

    // Send to monitoring
    const errorMonitor = new ErrorMonitor();
    errorMonitor.record(new AppError("Unhandled Promise Rejection", 500), {
      reason: reason?.message,
      stack: reason?.stack,
    });
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", {
      message: error.message,
      stack: error.stack,
    });

    // Send to monitoring
    const errorMonitor = new ErrorMonitor();
    errorMonitor.record(error, {
      type: "uncaught_exception",
    });

    // Graceful shutdown
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  });
};

// ========================================
// USAGE EXAMPLES
// ========================================

/*
// Example usage in your routes:

import { 
  ValidationError, 
  asyncErrorHandler, 
  comprehensiveErrorHandler,
  GracefulDegradation,
  CircuitBreaker,
  RetryMechanism
} from './middleware/error-handling.js';

// Apply error handler middleware
app.use(comprehensiveErrorHandler);

// Use async error wrapper
app.get('/api/users/:id', asyncErrorHandler(async (req, res) => {
  const userId = req.params.id;
  
  if (!userId || isNaN(userId)) {
    throw new ValidationError('Invalid user ID');
  }
  
  const user = await getUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.json({ success: true, data: user });
}));

// Use graceful degradation
const degradation = new GracefulDegradation();
degradation.register('emailService', async (to, subject, body) => {
  // Fallback email service
  console.log(`Email fallback: ${to} - ${subject}`);
  return { success: true, method: 'fallback' };
});

// Use circuit breaker
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000
});

// Use retry mechanism
const retry = new RetryMechanism({
  maxRetries: 3,
  baseDelay: 1000
});

// Combine patterns
app.post('/api/send-email', asyncErrorHandler(async (req, res) => {
  const result = await degradation.execute(
    'emailService',
    () => retry.execute(
      () => circuitBreaker.execute(
        sendEmail,
        req.body.to,
        req.body.subject,
        req.body.body
      )
    )
  );
  
  res.json({ success: true, data: result });
}));

// Setup global error handlers
setupGlobalErrorHandlers();
*/
