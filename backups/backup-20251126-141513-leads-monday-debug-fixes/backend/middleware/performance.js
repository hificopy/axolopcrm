// ========================================
// BACKEND PERFORMANCE MIDDLEWARE
// ========================================
// Performance optimization middleware for Axolop CRM

import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import compression from "compression";
import helmet from "helmet";
import { performance } from "perf_hooks";
import { logger } from "../utils/logger.js";

// ========================================
// ENHANCED RATE LIMITING
// ========================================

// Create Redis store for rate limiting
const createRedisStore = (redis) => {
  return new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rl:",
  });
};

// Different rate limits for different endpoints
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = "Too many requests from this IP, please try again later.",
    redis = null,
    ...otherOptions
  } = options;

  const store = redis ? createRedisStore(redis) : undefined;

  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    store,
    ...otherOptions,
  });
};

// Strict rate limiting for sensitive endpoints
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: "Too many attempts, please try again later.",
});

// API rate limiting
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
});

// Upload rate limiting
export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: "Too many uploads, please try again later.",
});

// ========================================
// RESPONSE CACHING MIDDLEWARE
// ========================================

// Simple in-memory cache for GET requests
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const cacheMiddleware = (options = {}) => {
  const {
    ttl = CACHE_TTL,
    keyGenerator = (req) =>
      `${req.method}:${req.originalUrl}:${req.user?.id || "anonymous"}`,
    shouldCache = (req) => req.method === "GET" && req.query.cache !== "false",
  } = options;

  return (req, res, next) => {
    if (!shouldCache(req)) {
      return next();
    }

    const cacheKey = keyGenerator(req);
    const cached = responseCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      logger.debug(`Cache hit for ${cacheKey}`);
      return res.json(cached.data);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function (data) {
      if (res.statusCode === 200) {
        responseCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
        logger.debug(`Cache set for ${cacheKey}`);
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

// Redis-based caching for distributed systems
export const redisCacheMiddleware = (redis, options = {}) => {
  const {
    ttl = CACHE_TTL,
    keyPrefix = "cache:",
    shouldCache = (req) => req.method === "GET" && req.query.cache !== "false",
  } = options;

  return async (req, res, next) => {
    if (!shouldCache(req)) {
      return next();
    }

    const cacheKey = `${keyPrefix}${req.method}:${req.originalUrl}:${req.user?.id || "anonymous"}`;

    try {
      const cached = await redis.get(cacheKey);

      if (cached) {
        logger.debug(`Redis cache hit for ${cacheKey}`);
        return res.json(JSON.parse(cached));
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function (data) {
        if (res.statusCode === 200) {
          redis.setex(cacheKey, Math.ceil(ttl / 1000), JSON.stringify(data));
          logger.debug(`Redis cache set for ${cacheKey}`);
        }
        return originalJson.call(this, data);
      };
    } catch (error) {
      logger.error("Redis cache error:", error);
    }

    next();
  };
};

// ========================================
// REQUEST DEDUPLICATION
// ========================================

const pendingRequests = new Map();

export const deduplicationMiddleware = (options = {}) => {
  const {
    keyGenerator = (req) =>
      `${req.method}:${req.originalUrl}:${JSON.stringify(req.body)}:${req.user?.id || "anonymous"}`,
    timeout = 30000, // 30 seconds
  } = options;

  return (req, res, next) => {
    const requestKey = keyGenerator(req);
    const existing = pendingRequests.get(requestKey);

    if (existing) {
      logger.debug(`Deduplicating request: ${requestKey}`);
      return existing
        .then((response) => {
          res.json(response);
        })
        .catch((error) => {
          next(error);
        });
    }

    const promise = new Promise((resolve, reject) => {
      const originalJson = res.json;
      const originalEnd = res.end;
      let responseData = null;

      res.json = function (data) {
        responseData = data;
        return originalJson.call(this, data);
      };

      res.end = function (chunk) {
        pendingRequests.delete(requestKey);

        if (responseData) {
          resolve(responseData);
        } else {
          reject(new Error("Request failed"));
        }

        return originalEnd.call(this, chunk);
      };

      // Set timeout
      setTimeout(() => {
        pendingRequests.delete(requestKey);
        reject(new Error("Request timeout"));
      }, timeout);
    });

    pendingRequests.set(requestKey, promise);
    next();
  };
};

// ========================================
// PERFORMANCE MONITORING
// ========================================

export const performanceMiddleware = (options = {}) => {
  const {
    threshold = 1000, // Log requests taking longer than 1 second
    sampleRate = 1.0, // Sample 100% of requests (adjust for high traffic)
  } = options;

  return (req, res, next) => {
    const startTime = performance.now();
    const requestId = Math.random().toString(36).substr(2, 9);

    // Add request ID to headers
    res.setHeader("X-Request-ID", requestId);

    // Log request start
    logger.debug(`[${requestId}] ${req.method} ${req.originalUrl} - Started`);

    // Override res.end to measure response time
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log request completion
      const logLevel = duration > threshold ? "warn" : "debug";
      logger[logLevel](
        `[${requestId}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration.toFixed(2)}ms`,
      );

      // Add performance headers
      res.setHeader("X-Response-Time", `${duration.toFixed(2)}ms`);

      // Send to analytics (sampled)
      if (Math.random() < sampleRate) {
        // Send to your analytics service
        // analytics.track('api_request', {
        //   method: req.method,
        //   path: req.originalUrl,
        //   status: res.statusCode,
        //   duration,
        //   user_id: req.user?.id
        // });
      }

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

// ========================================
// ENHANCED COMPRESSION
// ========================================

export const enhancedCompression = compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    // Don't compress already compressed content
    return compression.filter(req, res);
  },
  level: 6, // Balance between CPU and compression ratio
  threshold: 1024, // Only compress responses larger than 1KB
});

// ========================================
// SECURITY ENHANCEMENTS
// ========================================

export const enhancedSecurity = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.supabase.io"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for better compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// ========================================
// REQUEST SIZE LIMITING
// ========================================

export const requestSizeLimit = (options = {}) => {
  const {
    jsonLimit = "10mb",
    urlEncodedLimit = "10mb",
    textLimit = "10mb",
  } = options;

  return (req, res, next) => {
    const contentLength = req.headers["content-length"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength && parseInt(contentLength) > maxSize) {
      return res.status(413).json({
        error: "Request entity too large",
        maxSize: "10MB",
      });
    }

    next();
  };
};

// ========================================
// CONNECTION POOLING MONITORING
// ========================================

export const connectionPoolMonitor = (pool) => {
  return (req, res, next) => {
    const poolStats = pool.totalCount
      ? {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount,
        }
      : null;

    if (poolStats) {
      res.setHeader("X-DB-Pool-Total", poolStats.total);
      res.setHeader("X-DB-Pool-Idle", poolStats.idle);
      res.setHeader("X-DB-Pool-Waiting", poolStats.waiting);

      // Log warnings if pool is under stress
      if (poolStats.waiting > 5) {
        logger.warn("Database connection pool under stress:", poolStats);
      }
    }

    next();
  };
};

// ========================================
// MEMORY USAGE MONITORING
// ========================================

export const memoryMonitor = (options = {}) => {
  const {
    threshold = 0.9, // Alert at 90% memory usage
    interval = 60000, // Check every minute
  } = options;

  let lastCheck = 0;

  return (req, res, next) => {
    const now = Date.now();

    if (now - lastCheck > interval) {
      const memUsage = process.memoryUsage();
      const totalMem = require("os").totalmem();
      const freeMem = require("os").freemem();
      const usedMem = totalMem - freeMem;
      const memUsagePercent = usedMem / totalMem;

      res.setHeader("X-Memory-Used", `${Math.round(memUsagePercent * 100)}%`);
      res.setHeader(
        "X-Process-Memory",
        `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      );

      if (memUsagePercent > threshold) {
        logger.warn("High memory usage detected:", {
          process: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          system: `${Math.round(memUsagePercent * 100)}%`,
        });
      }

      lastCheck = now;
    }

    next();
  };
};

// ========================================
// HEALTH CHECK ENHANCEMENT
// ========================================

export const enhancedHealthCheck = (services = {}) => {
  return async (req, res) => {
    const startTime = performance.now();
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      responseTime: 0,
      services: {},
      metrics: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
    };

    try {
      // Check database
      if (services.database) {
        const dbStart = performance.now();
        await services.database.ping();
        health.services.database = {
          status: "connected",
          responseTime: performance.now() - dbStart,
        };
      }

      // Check Redis
      if (services.redis) {
        const redisStart = performance.now();
        await services.redis.ping();
        health.services.redis = {
          status: "connected",
          responseTime: performance.now() - redisStart,
        };
      }

      // Check other services
      for (const [name, service] of Object.entries(services)) {
        if (
          name !== "database" &&
          name !== "redis" &&
          typeof service.healthCheck === "function"
        ) {
          const serviceStart = performance.now();
          const result = await service.healthCheck();
          health.services[name] = {
            status: result.healthy ? "connected" : "disconnected",
            responseTime: performance.now() - serviceStart,
            ...result,
          };
        }
      }
    } catch (error) {
      health.status = "unhealthy";
      health.error = error.message;
      logger.error("Health check failed:", error);
    }

    health.responseTime = performance.now() - startTime;

    const statusCode = health.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(health);
  };
};

// ========================================
// BATCH REQUEST PROCESSING
// ========================================

export const batchMiddleware = (options = {}) => {
  const { maxBatchSize = 10, timeout = 5000 } = options;

  return (req, res, next) => {
    if (req.path !== "/api/batch" || req.method !== "POST") {
      return next();
    }

    const { requests } = req.body;

    if (!Array.isArray(requests)) {
      return res.status(400).json({ error: "Requests must be an array" });
    }

    if (requests.length > maxBatchSize) {
      return res.status(400).json({
        error: `Maximum batch size is ${maxBatchSize}`,
      });
    }

    // Process batch requests
    Promise.allSettled(
      requests.map(async (request) => {
        const { method, path, headers, body } = request;

        // Create mock request/response for internal processing
        const mockReq = {
          method,
          path,
          headers: { ...req.headers, ...headers },
          body,
          user: req.user,
        };

        const mockRes = {
          statusCode: 200,
          data: null,
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(data) {
            this.data = data;
            return this;
          },
        };

        // Process the request
        await new Promise((resolve) => {
          // This would need to be integrated with your router
          resolve();
        });

        return {
          status: mockRes.statusCode,
          data: mockRes.data,
        };
      }),
    )
      .then((results) => {
        res.json({
          results: results.map((result) => ({
            status: result.status === "fulfilled" ? "success" : "error",
            data: result.status === "fulfilled" ? result.value : null,
            error: result.status === "rejected" ? result.reason.message : null,
          })),
        });
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  };
};

// ========================================
// COMBINED MIDDLEWARE
// ========================================

export const applyPerformanceMiddleware = (app, redis, services = {}) => {
  // Security and compression first
  app.use(enhancedSecurity);
  app.use(enhancedCompression);
  app.use(requestSizeLimit());

  // Performance monitoring
  app.use(performanceMiddleware());
  app.use(memoryMonitor());

  // Caching and deduplication
  app.use(cacheMiddleware());
  if (redis) {
    app.use(redisCacheMiddleware(redis));
  }
  app.use(deduplicationMiddleware());

  // Connection pool monitoring
  if (services.database) {
    app.use(connectionPoolMonitor(services.database));
  }

  // Enhanced health check
  app.get("/health", enhancedHealthCheck(services));

  // Batch processing
  app.use(batchMiddleware());

  logger.info("Performance middleware applied successfully");
};

// ========================================
// USAGE EXAMPLES
// ========================================

/*
// Example usage in your main app file:

import { applyPerformanceMiddleware } from './middleware/performance.js';
import redis from './utils/redis.js';
import { supabase } from './config/supabase.js';

// Apply all performance middleware
applyPerformanceMiddleware(app, redis, {
  database: supabase,
  redis: redis,
});

// Or apply individual middleware:
import { 
  apiRateLimiter, 
  strictRateLimiter,
  cacheMiddleware,
  performanceMiddleware 
} from './middleware/performance.js';

app.use(performanceMiddleware());
app.use('/api/', apiRateLimiter);
app.use('/api/auth/', strictRateLimiter);
app.use('/api/public/', cacheMiddleware({ ttl: 60000 })); // 1 minute cache
*/
