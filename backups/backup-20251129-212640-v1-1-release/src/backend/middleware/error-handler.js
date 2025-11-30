import config from '../config/app.config.js';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  let error = err;

  // Convert non-AppError to AppError
  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    error = new AppError(message, statusCode, false);
  }

  // Log error with context
  const errorContext = {
    message: error.message,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    body: config.env === 'development' ? req.body : undefined,
    stack: error.stack,
  };

  if (error.statusCode >= 500) {
    logger.error('Server error occurred', errorContext);
  } else if (error.statusCode >= 400) {
    logger.warn('Client error occurred', errorContext);
  }

  // Send error response
  const response = {
    status: 'error',
    statusCode: error.statusCode,
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(error.resource && { resource: error.resource }),
    ...(error.field && { field: error.field }),
    timestamp: error.timestamp || new Date().toISOString(),
    path: req.path,
  };

  // Include stack trace in development
  if (config.env === 'development') {
    response.stack = error.stack;
    if (error.originalError) {
      response.originalError = {
        message: error.originalError.message,
        stack: error.originalError.stack,
      };
    }
  }

  res.status(error.statusCode).json(response);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req, res) {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    availableRoutes: getAvailableRoutes(),
  });
}

/**
 * Get list of available API routes
 */
function getAvailableRoutes() {
  return [
    'GET /health',
    'GET /api/v1/leads',
    'POST /api/v1/leads',
    'GET /api/v1/contacts',
    'POST /api/v1/contacts',
    'GET /api/v1/opportunities',
    'POST /api/v1/opportunities',
    'GET /api/v1/workflows',
    'POST /api/v1/workflows',
    'GET /api/v1/email-marketing/campaigns',
    'POST /api/v1/email-marketing/campaigns',
  ];
}

/**
 * Unhandled rejection handler
 */
export function handleUnhandledRejection(reason, promise) {
  logger.error('Unhandled Promise Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise,
  });

  // In production, we might want to exit the process
  if (config.env === 'production') {
    console.error('FATAL: Unhandled Promise Rejection. Exiting...');
    process.exit(1);
  }
}

/**
 * Uncaught exception handler
 */
export function handleUncaughtException(error) {
  logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack,
  });

  // Always exit on uncaught exception
  console.error('FATAL: Uncaught Exception:');
  console.error(error);
  console.error(error.stack);
  process.exit(1);
}
