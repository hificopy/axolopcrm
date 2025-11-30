import { v4 as uuidv4 } from "uuid";

/**
 * Standardized error response utility for Axolop CRM API
 * Prevents internal Supabase error codes from reaching users
 */

/**
 * Creates a standardized error response
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} error - Error type (e.g., 'Not Found', 'Bad Request')
 * @param {string} message - User-friendly error message
 * @param {Object} additionalData - Additional error data (optional)
 * @param {string} requestId - Request ID for tracing (optional)
 */
export const sendErrorResponse = (
  res,
  status,
  error,
  message,
  additionalData = {},
  requestId = null,
) => {
  const response = {
    success: false,
    error,
    message,
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
    ...additionalData,
  };

  // Log error for debugging
  console.error(`API Error [${requestId || "unknown"}]:`, {
    status,
    error,
    message,
    ...additionalData,
  });

  return res.status(status).json(response);
};

/**
 * Handles Supabase errors and converts them to user-friendly responses
 * ROOT CAUSE FIX: Now handles internal PostgREST errors like "iad1::gtfjq"
 * @param {Object} res - Express response object
 * @param {Object} error - Supabase error object
 * @param {string} operation - Description of the operation that failed
 * @param {string} requestId - Request ID for tracing (optional)
 */
export const handleSupabaseError = (
  res,
  error,
  operation,
  requestId = null,
) => {
  console.error(
    `Supabase Error [${requestId || "unknown"}] during ${operation}:`,
    error,
  );

  // ROOT CAUSE FIX: Handle internal PostgREST errors like "iad1::gtfjq"
  if (error.code && error.code.includes("::")) {
    console.error(
      `Internal PostgREST Error [${requestId}]: This indicates database/schema issues`,
      {
        errorCode: error.code,
        operation,
        details: error.details,
        hint: "Check database schema, RLS policies, and data integrity",
      },
    );
    return sendErrorResponse(
      res,
      500,
      "Database Error",
      "A database operation failed. Please try again or contact support.",
      { operation, internalError: true, needsInvestigation: true },
      requestId,
    );
  }

  // Handle specific Supabase error codes
  switch (error.code) {
    case "PGRST116": // No rows returned
      return sendErrorResponse(
        res,
        404,
        "Not Found",
        "The requested resource was not found",
        { operation },
        requestId,
      );

    case "PGRST301": // Relation does not exist
      return sendErrorResponse(
        res,
        500,
        "Internal Server Error",
        "Database configuration error",
        { operation, originalCode: error.code, schemaIssue: true },
        requestId,
      );

    case "23505": // Unique violation
      return sendErrorResponse(
        res,
        409,
        "Conflict",
        "A record with this information already exists",
        { operation },
        requestId,
      );

    case "23503": // Foreign key violation
      return sendErrorResponse(
        res,
        400,
        "Bad Request",
        "Invalid reference to related data",
        { operation, dataIntegrityIssue: true },
        requestId,
      );

    case "42501": // Insufficient privileges
      return sendErrorResponse(
        res,
        403,
        "Forbidden",
        " you do not have permission to perform this action",
        { operation, permissionIssue: true },
        requestId,
      );

    default:
      return sendErrorResponse(
        res,
        500,
        "Internal Server Error",
        "An unexpected error occurred",
        { operation, originalCode: error.code, needsInvestigation: true },
        requestId,
      );
  }
};

/**
 * Middleware to add request ID to all requests for error tracing
 */
export const requestIdMiddleware = (req, res, next) => {
  req.requestId = req.headers["x-request-id"] || uuidv4();
  res.setHeader("X-Request-ID", req.requestId);
  next();
};

/**
 * Creates a standardized success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message (optional)
 * @param {Object} metadata - Additional metadata (optional)
 */
export const sendSuccessResponse = (
  res,
  data = null,
  message = "Operation successful",
  metadata = {},
) => {
  const response = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  return res.status(200).json(response);
};

/**
 * Async wrapper to catch unhandled errors in routes
 * @param {Function} fn - Async route handler function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  const requestId = req.requestId || "unknown";

  console.error(`Unhandled Error [${requestId}]:`, {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  sendErrorResponse(
    res,
    500,
    "Internal Server Error",
    "An unexpected error occurred",
    {
      ...(isDevelopment && {
        details: err.message,
        stack: err.stack,
      }),
    },
    requestId,
  );
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req, res) => {
  const requestId = req.requestId || "unknown";

  // Comprehensive logging for 404 errors
  console.error(`404 Error [${requestId}]: Route not found`, {
    method: req.method,
    path: req.path,
    url: req.url,
    headers: {
      "user-agent": req.headers["user-agent"],
      referer: req.headers["referer"],
      "x-request-id": req.headers["x-request-id"],
      authorization: req.headers["authorization"] ? "[REDACTED]" : undefined,
    },
    query: req.query,
    params: req.params,
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
  });

  sendErrorResponse(
    res,
    404,
    "Not Found",
    `Route ${req.method} ${req.path} not found`,
    {
      method: req.method,
      path: req.path,
      availableEndpoints: getAvailableEndpoints(),
    },
    requestId,
  );
};

/**
 * Get list of available endpoints for debugging
 */
function getAvailableEndpoints() {
  return [
    "GET /health",
    "GET /api/v1/forms",
    "POST /api/v1/forms",
    "GET /api/v1/leads",
    "POST /api/v1/leads",
    "GET /api/v1/contacts",
    "GET /api/v1/users",
    "GET /api/v1/agencies",
    "GET /api/v1/calendar",
    "GET /api/v1/workflows",
    "GET /api/v1/search",
    "GET /api/v1/dashboard",
  ];
}
