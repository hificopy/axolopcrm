/**
 * Standardized API Response Utility
 * Provides consistent response format across all backend routes
 */

/**
 * Standard success response
 * @param {object} data - The data to return
 * @param {string} message - Success message
 * @param {object} meta - Additional metadata
 * @returns {object} - Standardized success response
 */
export const createSuccessResponse = (
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
 * Standard error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {string} code - Error code
 * @param {object} details - Additional error details
 * @returns {object} - Standardized error response
 */
export const createErrorResponse = (
  message,
  status = 500,
  code = null,
  details = {},
) => {
  return {
    success: false,
    error: message,
    status,
    code,
    details,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Standard paginated response
 * @param {array} data - The data to return
 * @param {object} pagination - Pagination information
 * @param {string} message - Success message
 * @returns {object} - Standardized paginated response
 */
export const createPaginatedResponse = (
  data,
  pagination,
  message = "Data retrieved successfully",
) => {
  return {
    success: true,
    data,
    pagination,
    message,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Express middleware for standardized responses
 * @param {function} handler - The route handler to wrap
 * @returns {function} - Wrapped handler with standardized responses
 */
export const withStandardizedResponse = (handler) => {
  return async (req, res, next) => {
    try {
      const result = await handler(req, res, next);

      // If handler already returned a response, don't modify it
      if (res.headersSent) {
        return result;
      }

      // Standardize success responses
      if (result && typeof result === "object") {
        if (!result.success && result.data !== undefined) {
          // Convert non-standard success to standard format
          return res.status(200).json(createSuccessResponse(result.data));
        }
      }

      return result;
    } catch (error) {
      console.error(`API Error in ${req.path}:`, error);

      // Remove console.error statements and use standardized error response
      const statusCode = error.status || 500;
      const errorMessage = error.message || "Internal server error";

      return res
        .status(statusCode)
        .json(
          createErrorResponse(errorMessage, statusCode, error.code, {
            path: req.path,
            method: req.method,
          }),
        );
    }
  };
};

export default {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  withStandardizedResponse,
};
