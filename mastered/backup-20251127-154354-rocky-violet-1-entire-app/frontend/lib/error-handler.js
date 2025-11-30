/**
 * Standardized Error Handler for Frontend API Calls
 * Provides consistent error handling across all frontend services
 */

import { toast } from "react-hot-toast";

export class ApiError extends Error {
  constructor(message, status = null, code = null, response = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.response = response;
  }
}

/**
 * Standardized error handler for API calls
 * @param {Error} error - The error to handle
 * @param {string} context - Context where error occurred (e.g., 'fetching user settings')
 * @param {boolean} showToast - Whether to show toast notification
 * @returns {ApiError} - Standardized error object
 */
export const handleApiError = (
  error,
  context = "API call",
  showToast = true,
) => {
  console.error(`[${context}] Error:`, error);

  // Create standardized error
  const apiError = new ApiError(
    error.message || "Unknown error occurred",
    error.status || null,
    error.code || null,
    error.response || null,
  );

  // Show user-friendly toast if requested
  if (showToast) {
    const userMessage = getUserFriendlyErrorMessage(error);
    toast.error(userMessage);
  }

  return apiError;
};

/**
 * Convert technical errors to user-friendly messages
 * @param {Error} error - The error to convert
 * @returns {string} - User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error) => {
  // Network errors
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return "Network connection failed. Please check your internet connection.";
  }

  // HTTP status errors
  if (error.status) {
    switch (error.status) {
      case 401:
        return "Your session has expired. Please sign in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error occurred. Please try again later.";
      default:
        return `Request failed with status: ${error.status}`;
    }
  }

  // Supabase specific errors
  if (error.message) {
    if (error.message.includes("Invalid login credentials")) {
      return "Invalid email or password. Please try again.";
    }
    if (error.message.includes("User already registered")) {
      return "An account with this email already exists.";
    }
    if (error.message.includes("Email not confirmed")) {
      return "Please check your email and confirm your account.";
    }
  }

  // Default error message
  return error.message || "An unexpected error occurred. Please try again.";
};

/**
 * Standardized success response handler
 * @param {any} data - The data to return
 * @param {string} message - Success message
 * @param {boolean} showToast - Whether to show toast notification
 * @returns {object} - Standardized success response
 */
export const createSuccessResponse = (
  data,
  message = "Operation successful",
  showToast = false,
) => {
  if (showToast) {
    toast.success(message);
  }

  return {
    success: true,
    data,
    message,
  };
};

/**
 * Standardized API wrapper for fetch calls
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @param {string} context - Context for error handling
 * @returns {Promise} - Promise that resolves to standardized response
 */
export const standardizedFetch = async (
  url,
  options = {},
  context = "API call",
) => {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = new Error(
        `HTTP ${response.status}: ${response.statusText}`,
      );
      error.status = response.status;
      error.response = response;
      throw error;
    }

    const data = await response.json();
    return createSuccessResponse(data);
  } catch (error) {
    throw handleApiError(error, context);
  }
};

export default {
  ApiError,
  handleApiError,
  getUserFriendlyErrorMessage,
  createSuccessResponse,
  standardizedFetch,
};
