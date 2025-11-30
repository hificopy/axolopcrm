/**
 * Rate Limiter Middleware
 *
 * Provides configurable rate limiting for API endpoints
 * to prevent abuse and ensure fair usage.
 */

// In-memory store for rate limiting
const requestCounts = new Map();
const blockList = new Map();

// Default configuration
const DEFAULT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 60, // 60 requests per window
  blockDurationMs: 5 * 60 * 1000, // 5 minutes block
  keyGenerator: (req) => req.user?.id || req.ip,
  onRateLimited: null,
  skipIf: null
};

// Preset configurations for different endpoint types
export const RATE_LIMIT_PRESETS = {
  // Standard API calls
  standard: {
    windowMs: 60 * 1000,
    maxRequests: 100
  },

  // Authentication endpoints (login, signup)
  auth: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    blockDurationMs: 15 * 60 * 1000
  },

  // Invitation sending
  invitations: {
    windowMs: 60 * 1000,
    maxRequests: 20,
    blockDurationMs: 10 * 60 * 1000
  },

  // Role/permission modifications
  permissions: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    blockDurationMs: 5 * 60 * 1000
  },

  // Bulk operations
  bulk: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    blockDurationMs: 10 * 60 * 1000
  },

  // Data export
  export: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 5
  },

  // Very strict (for sensitive operations)
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 5,
    blockDurationMs: 30 * 60 * 1000
  }
};

/**
 * Clean up expired entries periodically
 */
function cleanup() {
  const now = Date.now();

  // Clean up request counts
  for (const [key, data] of requestCounts) {
    if (now - data.windowStart >= data.windowMs) {
      requestCounts.delete(key);
    }
  }

  // Clean up block list
  for (const [key, blockUntil] of blockList) {
    if (now >= blockUntil) {
      blockList.delete(key);
    }
  }
}

// Run cleanup every minute
setInterval(cleanup, 60 * 1000);

/**
 * Create a rate limiter middleware
 * @param {Object} options - Configuration options
 * @returns {Function} Express middleware
 */
export function createRateLimiter(options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };

  return async (req, res, next) => {
    try {
      // Check if should skip
      if (config.skipIf && await config.skipIf(req)) {
        return next();
      }

      const key = config.keyGenerator(req);
      const now = Date.now();

      // Check if blocked
      const blockUntil = blockList.get(key);
      if (blockUntil && now < blockUntil) {
        const retryAfter = Math.ceil((blockUntil - now) / 1000);

        if (config.onRateLimited) {
          config.onRateLimited(req, key, true);
        }

        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'You have been temporarily blocked due to excessive requests',
          retryAfter,
          blocked: true
        });
      }

      // Get or create request count entry
      let data = requestCounts.get(key);

      if (!data || now - data.windowStart >= config.windowMs) {
        data = {
          count: 0,
          windowStart: now,
          windowMs: config.windowMs
        };
        requestCounts.set(key, data);
      }

      // Increment count
      data.count++;

      // Check if over limit
      if (data.count > config.maxRequests) {
        // Add to block list
        blockList.set(key, now + config.blockDurationMs);

        if (config.onRateLimited) {
          config.onRateLimited(req, key, false);
        }

        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please slow down.',
          retryAfter: Math.ceil(config.blockDurationMs / 1000)
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': config.maxRequests,
        'X-RateLimit-Remaining': Math.max(0, config.maxRequests - data.count),
        'X-RateLimit-Reset': Math.ceil((data.windowStart + config.windowMs) / 1000)
      });

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(); // Don't block on error
    }
  };
}

/**
 * Create a rate limiter with a preset configuration
 * @param {string} presetName - Name of preset from RATE_LIMIT_PRESETS
 * @param {Object} overrides - Optional overrides
 * @returns {Function} Express middleware
 */
export function rateLimitPreset(presetName, overrides = {}) {
  const preset = RATE_LIMIT_PRESETS[presetName] || RATE_LIMIT_PRESETS.standard;
  return createRateLimiter({ ...preset, ...overrides });
}

/**
 * Rate limit by agency (for agency-wide operations)
 */
export function agencyRateLimiter(options = {}) {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => {
      const agencyId = req.params.agencyId ||
        req.body.agencyId ||
        req.headers['x-agency-id'];
      return `agency:${agencyId}`;
    }
  });
}

/**
 * Combined rate limiter (checks both user and agency limits)
 */
export function combinedRateLimiter(userOptions = {}, agencyOptions = {}) {
  const userLimiter = createRateLimiter(userOptions);
  const agencyLimiter = agencyRateLimiter(agencyOptions);

  return async (req, res, next) => {
    // Check user limit first
    await new Promise((resolve) => {
      userLimiter(req, res, (err) => {
        if (err || res.headersSent) {
          resolve();
          return;
        }
        // Then check agency limit
        agencyLimiter(req, res, resolve);
      });
    });

    if (!res.headersSent) {
      next();
    }
  };
}

/**
 * Get rate limit stats for monitoring
 */
export function getRateLimitStats() {
  cleanup();
  return {
    activeKeys: requestCounts.size,
    blockedKeys: blockList.size,
    requestCounts: Array.from(requestCounts.entries()).map(([key, data]) => ({
      key,
      count: data.count,
      windowStart: new Date(data.windowStart).toISOString()
    })),
    blockedUntil: Array.from(blockList.entries()).map(([key, until]) => ({
      key,
      until: new Date(until).toISOString()
    }))
  };
}

/**
 * Manually unblock a key
 */
export function unblock(key) {
  blockList.delete(key);
  requestCounts.delete(key);
}

export default {
  createRateLimiter,
  rateLimitPreset,
  agencyRateLimiter,
  combinedRateLimiter,
  getRateLimitStats,
  unblock,
  RATE_LIMIT_PRESETS
};
