import posthogService from '../services/posthog-service.js';
import logger from '../utils/logger.js';

/**
 * Analytics middleware to track API requests
 */
const analyticsMiddleware = async (req, res, next) => {
  const startTime = Date.now();
  const userId = req.user ? req.user.id : null;
  const endpoint = req.path;
  const method = req.method;
  
  // Capture the API request
  posthogService.captureApiRequest(userId, endpoint, method, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    timestamp: new Date().toISOString()
  });

  // Capture page view for frontend-facing endpoints
  if (!endpoint.startsWith('/api')) {
    posthogService.capturePageView(userId, endpoint, {
      method,
      ip: req.ip
    });
  }

  // Continue with the request
  next();

  // Hook into response to capture additional data after request completes
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;
    
    // Track the response
    posthogService.captureEvent(userId, 'api_response', {
      endpoint,
      method,
      statusCode: res.statusCode,
      duration,
      ip: req.ip
    });

    return originalSend.call(this, body);
  };
};

/**
 * Track user signup
 */
const trackSignup = (userId, additionalProperties = {}) => {
  posthogService.captureSignup(userId, additionalProperties);
};

/**
 * Track user login
 */
const trackLogin = (userId, additionalProperties = {}) => {
  posthogService.captureLogin(userId, additionalProperties);
};

/**
 * Track user logout
 */
const trackLogout = (userId, additionalProperties = {}) => {
  posthogService.captureLogout(userId, additionalProperties);
};

/**
 * Track form submission
 */
const trackFormSubmission = (userId, formId, additionalProperties = {}) => {
  posthogService.captureFormSubmission(userId, formId, additionalProperties);
};

/**
 * Track email interaction
 */
const trackEmailInteraction = (userId, campaignId, interactionType, additionalProperties = {}) => {
  posthogService.captureEmailInteraction(userId, campaignId, interactionType, additionalProperties);
};

/**
 * Track AI usage
 */
const trackAIUsage = (userId, feature, additionalProperties = {}) => {
  posthogService.captureAIUsage(userId, feature, additionalProperties);
};

/**
 * Track workflow execution
 */
const trackWorkflowExecution = (userId, workflowId, additionalProperties = {}) => {
  posthogService.captureWorkflowExecution(userId, workflowId, additionalProperties);
};

export {
  analyticsMiddleware,
  trackSignup,
  trackLogin,
  trackLogout,
  trackFormSubmission,
  trackEmailInteraction,
  trackAIUsage,
  trackWorkflowExecution
};