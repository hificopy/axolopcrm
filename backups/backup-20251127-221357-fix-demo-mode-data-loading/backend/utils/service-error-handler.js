/**
 * Standardized Error Handler for Backend Services
 * Provides consistent error handling across all backend services
 */

import { createErrorResponse } from "./standard-responses";

/**
 * Standardized error handler for backend services
 * @param {Error} error - The error to handle
 * @param {string} context - Context where error occurred
 * @param {string} service - Service name where error occurred
 * @param {object} additionalInfo - Additional error information
 * @returns {object} - Standardized error response
 */
export const handleServiceError = (
  error,
  context = "Service operation",
  service = "Unknown",
  additionalInfo = {},
) => {
  console.error(`[${service}] ${context}:`, {
    message: error.message,
    stack: error.stack,
    ...additionalInfo,
  });

  // Determine error type and status code
  let statusCode = 500;
  let errorCode = "INTERNAL_ERROR";
  let userMessage = "An unexpected error occurred";

  if (error.name === "ValidationError") {
    statusCode = 400;
    errorCode = "VALIDATION_ERROR";
    userMessage = error.message || "Invalid input provided";
  } else if (error.name === "NotFoundError") {
    statusCode = 404;
    errorCode = "NOT_FOUND";
    userMessage = "Requested resource not found";
  } else if (error.name === "UnauthorizedError") {
    statusCode = 401;
    errorCode = "UNAUTHORIZED";
    userMessage = "Authentication required";
  } else if (error.name === "ForbiddenError") {
    statusCode = 403;
    errorCode = "FORBIDDEN";
    userMessage = "Access denied";
  } else if (error.code === "PGRST116") {
    statusCode = 404;
    errorCode = "NOT_FOUND";
    userMessage = "Requested resource not found";
  } else if (error.code?.startsWith("PGRST")) {
    statusCode = 400;
    errorCode = "DATABASE_ERROR";
    userMessage = "Database operation failed";
  }

  return createErrorResponse(userMessage, statusCode, errorCode, {
    service,
    context,
    originalError: error.message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Standardized success response for backend services
 * @param {any} data - The data to return
 * @param {string} message - Success message
 * @param {object} meta - Additional metadata
 * @returns {object} - Standardized success response
 */
export const createServiceSuccess = (
  data = null,
  message = "Operation successful",
  meta = {},
) => {
  return {
    success: true,
    data,
    message,
    meta,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Async wrapper for service functions with error handling
 * @param {Function} fn - The async function to wrap
 * @param {string} context - Context for error handling
 * @param {string} service - Service name
 * @returns {Function} - Wrapped function with error handling
 */
export const withServiceErrorHandling = (
  fn,
  context = "Service operation",
  service = "Unknown",
) => {
  return async (...args) => {
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      throw handleServiceError(error, context, service);
    }
  };
};

/**
 * Validation helper using Zod schemas
 * @param {any} data - Data to validate
 * @param {object} schema - Zod schema for validation
 * @returns {object} - Validation result
 */
export const validateInput = (data, schema, context = "Input validation") => {
  try {
    const result = schema.parse(data);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message,
        field: error.path?.join(".") || "unknown",
      },
    };
  }
};

export default {
  handleServiceError,
  createServiceSuccess,
  withServiceErrorHandling,
  validateInput,
};
