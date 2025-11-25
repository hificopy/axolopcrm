import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import config from '../config/app.config.js';

let redis = null;

/**
 * Initialize rate limiter with Redis store
 */
export function initializeRateLimiter(redisClient) {
  redis = redisClient;
}

/**
 * Create rate limiter with Redis store or memory store
 */
function createLimiter(options) {
  const limiterConfig = {
    ...options,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      statusCode: 429,
      message: options.message || 'Too many requests, please try again later.',
    },
  };

  // Use Redis store if available
  if (redis && config.rateLimit.enabled) {
    limiterConfig.store = new RedisStore({
      client: redis,
      prefix: options.prefix || 'rl:',
    });
  }

  return rateLimit(limiterConfig);
}

/**
 * General API rate limiter
 */
export const apiLimiter = createLimiter({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  prefix: 'rl:api:',
});

/**
 * Strict auth rate limiter
 */
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  prefix: 'rl:auth:',
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

/**
 * Workflow execution rate limiter
 */
export const workflowLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 executions per minute
  prefix: 'rl:workflow:',
  message: 'Workflow execution rate limit exceeded.',
});

/**
 * Email sending rate limiter
 */
export const emailLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 emails per minute
  prefix: 'rl:email:',
  message: 'Email sending rate limit exceeded.',
});

/**
 * File upload rate limiter
 */
export const uploadLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads
  prefix: 'rl:upload:',
  message: 'Too many file uploads, please try again later.',
});

/**
 * Lead import rate limiter
 */
export const importLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 imports per hour
  prefix: 'rl:import:',
  message: 'Too many import requests, please try again later.',
});

/**
 * Per-user rate limiter factory
 */
export function createUserLimiter(max = 100, windowMs = 15 * 60 * 1000) {
  return createLimiter({
    windowMs,
    max,
    prefix: 'rl:user:',
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip;
    },
  });
}
