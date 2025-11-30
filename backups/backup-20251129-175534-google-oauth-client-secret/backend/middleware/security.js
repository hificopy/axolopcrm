// ========================================
// SECURITY ENHANCEMENTS
// ========================================
// Comprehensive security middleware for Axolop CRM

import crypto from "crypto";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { createHash, timingSafeEqual } from "crypto";
import { logger } from "../utils/logger.js";

// ========================================
// CSRF PROTECTION
// ========================================

class CSRFProtection {
  constructor(options = {}) {
    this.secret =
      options.secret ||
      process.env.CSRF_SECRET ||
      crypto.randomBytes(32).toString("hex");
    this.cookieName = options.cookieName || "_csrf";
    this.headerName = options.headerName || "x-csrf-token";
    this.excludedMethods = new Set(["GET", "HEAD", "OPTIONS"]);
    this.excludedPaths = new Set(options.excludedPaths || []);
  }

  // Generate CSRF token
  generateToken() {
    const timestamp = Date.now().toString();
    const hmac = createHmac("sha256", this.secret);
    hmac.update(timestamp);
    const signature = hmac.digest("hex");
    return `${timestamp}.${signature}`;
  }

  // Verify CSRF token
  verifyToken(token) {
    if (!token) return false;

    const [timestamp, signature] = token.split(".");
    if (!timestamp || !signature) return false;

    // Check token age (max 1 hour)
    const age = Date.now() - parseInt(timestamp);
    if (age > 3600000) return false;

    // Verify signature
    const hmac = createHmac("sha256", this.secret);
    hmac.update(timestamp);
    const expectedSignature = hmac.digest("hex");

    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  // Middleware
  middleware() {
    return (req, res, next) => {
      // Skip for excluded methods and paths
      if (
        this.excludedMethods.has(req.method) ||
        this.excludedPaths.has(req.path)
      ) {
        return next();
      }

      // Set CSRF token cookie
      if (!req.cookies?.[this.cookieName]) {
        const token = this.generateToken();
        res.cookie(this.cookieName, token, {
          httpOnly: false, // Allow JavaScript access
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 3600000, // 1 hour
        });
        req.csrfToken = token;
      } else {
        req.csrfToken = req.cookies[this.cookieName];
      }

      // Verify token for state-changing requests
      if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        const token =
          req.headers[this.headerName.toLowerCase()] ||
          req.body?.csrfToken ||
          req.query?.csrfToken;

        if (!this.verifyToken(token)) {
          logger.warn("CSRF token verification failed", {
            ip: req.ip,
            method: req.method,
            path: req.path,
            userAgent: req.get("User-Agent"),
          });
          return res.status(403).json({
            error: "Invalid CSRF token",
            code: "CSRF_INVALID",
          });
        }
      }

      next();
    };
  }
}

// ========================================
// INPUT VALIDATION ENHANCEMENTS
// ========================================

export const enhancedInputValidation = (options = {}) => {
  const {
    maxStringLength = 10000,
    allowedTags = ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    allowedAttributes = {
      a: ["href", "title"],
      "*": ["class"],
    },
  } = options;

  // Sanitize HTML content
  const sanitizeHTML = (html) => {
    if (!html || typeof html !== "string") return html;

    // Basic HTML sanitization (consider using a library like DOMPurify)
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");
  };

  // Validate and sanitize request body
  const sanitizeObject = (obj, maxDepth = 10) => {
    if (maxDepth <= 0) return null;
    if (typeof obj !== "object" || obj === null) return obj;

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip prototype properties
      if (!obj.hasOwnProperty(key)) continue;

      // Check key length
      if (key.length > 100) continue;

      if (typeof value === "string") {
        // Check string length
        if (value.length > maxStringLength) {
          sanitized[key] = value.substring(0, maxStringLength);
        } else {
          sanitized[key] = sanitizeHTML(value);
        }
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          typeof item === "object" ? sanitizeObject(item, maxDepth - 1) : item,
        );
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizeObject(value, maxDepth - 1);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  return (req, res, next) => {
    try {
      // Sanitize request body
      if (req.body) {
        req.body = sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query) {
        req.query = sanitizeObject(req.query);
      }

      // Sanitize URL parameters
      if (req.params) {
        req.params = sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      logger.error("Input sanitization error:", error);
      res.status(400).json({
        error: "Invalid input data",
        code: "INVALID_INPUT",
      });
    }
  };
};

// ========================================
// SECURITY HEADERS ENHANCEMENT
// ========================================

export const enhancedSecurityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
      ],
      imgSrc: ["'self'", "data:", "https:", "https://*.supabase.co"],
      scriptSrc: [
        "'self'",
        "'unsafe-eval'", // Required for some React features
        "https://cdnjs.cloudflare.com",
      ],
      connectSrc: [
        "'self'",
        "https://api.supabase.io",
        "https://*.supabase.co",
        "wss://*.supabase.co",
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
    },
  },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: process.env.NODE_ENV === "production",

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },

  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // Frame Options
  frameguard: { action: "deny" },

  // Hide Powered-By Header
  hidePoweredBy: true,

  // HSTS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // IE Compatibility
  ieNoOpen: true,

  // No Sniff
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Permission Policy
  permissionsPolicy: {
    features: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'self'"],
      payment: ["'none'"],
      usb: ["'none'"],
      magnetometer: ["'none'"],
      gyroscope: ["'none'"],
      accelerometer: ["'none'"],
    },
  },

  // Referrer Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },

  // X-Content-Type-Options
  xContentTypeOptions: true,
});

// ========================================
// RATE LIMITING ENHANCEMENTS
// ========================================

export const createAdvancedRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = "Too many requests",
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip,
    onLimitReached = (req, res, options) => {
      logger.warn("Rate limit exceeded", {
        ip: req.ip,
        method: req.method,
        path: req.path,
        userAgent: req.get("User-Agent"),
      });
    },
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000),
      code: "RATE_LIMIT_EXCEEDED",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    skipSuccessfulRequests,
    skipFailedRequests,
    onLimitReached,
    handler: (req, res) => {
      logger.warn("Rate limit exceeded", {
        ip: req.ip,
        method: req.method,
        path: req.path,
        userAgent: req.get("User-Agent"),
      });

      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
        code: "RATE_LIMIT_EXCEEDED",
      });
    },
  });
};

// Different rate limiters for different use cases
export const authRateLimiter = createAdvancedRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
});

export const apiRateLimiter = createAdvancedRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
});

export const uploadRateLimiter = createAdvancedRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: "Too many file uploads, please try again later.",
});

// ========================================
// IP BLOCKING AND MONITORING
// ========================================

class IPBlocker {
  constructor(options = {}) {
    this.blockedIPs = new Set(options.blockedIPs || []);
    this.suspiciousIPs = new Map(); // IP -> { count, lastSeen }
    this.maxSuspiciousAttempts = options.maxSuspiciousAttempts || 10;
    this.suspiciousWindow = options.suspiciousWindow || 5 * 60 * 1000; // 5 minutes
    this.blockDuration = options.blockDuration || 24 * 60 * 60 * 1000; // 24 hours
  }

  // Check if IP is blocked
  isBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  // Add suspicious activity
  addSuspiciousActivity(ip) {
    const now = Date.now();
    const current = this.suspiciousIPs.get(ip) || { count: 0, lastSeen: 0 };

    // Reset count if window has passed
    if (now - current.lastSeen > this.suspiciousWindow) {
      current.count = 0;
    }

    current.count++;
    current.lastSeen = now;
    this.suspiciousIPs.set(ip, current);

    // Block IP if threshold exceeded
    if (current.count >= this.maxSuspiciousAttempts) {
      this.blockIP(ip);
      return true;
    }

    return false;
  }

  // Block IP temporarily
  blockIP(ip) {
    this.blockedIPs.add(ip);
    logger.warn("IP blocked due to suspicious activity", { ip });

    // Auto-unblock after duration
    setTimeout(() => {
      this.blockedIPs.delete(ip);
      logger.info("IP auto-unblocked", { ip });
    }, this.blockDuration);
  }

  // Middleware
  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;

      if (this.isBlocked(ip)) {
        logger.warn("Blocked IP attempted access", {
          ip,
          method: req.method,
          path: req.path,
        });
        return res.status(403).json({
          error: "Access denied",
          code: "IP_BLOCKED",
        });
      }

      next();
    };
  }
}

// ========================================
// SECURITY AUDIT LOGGING
// ========================================

export const securityAuditLogger = (options = {}) => {
  const {
    logLevel = "info",
    includeBody = false,
    sensitiveFields = ["password", "token", "secret", "key"],
  } = options;

  const sanitizeData = (data) => {
    if (!data || typeof data !== "object") return data;

    const sanitized = { ...data };
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    }
    return sanitized;
  };

  return (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;

    // Log request
    const requestData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: req.user?.id,
      body: includeBody ? sanitizeData(req.body) : undefined,
    };

    // Override res.send to log response
    res.send = function (data) {
      const duration = Date.now() - startTime;

      const logData = {
        ...requestData,
        statusCode: res.statusCode,
        duration,
        success: res.statusCode < 400,
      };

      // Log security-relevant events
      if (
        req.path.includes("/auth") ||
        req.path.includes("/admin") ||
        res.statusCode >= 400 ||
        req.method !== "GET"
      ) {
        logger[logLevel]("Security audit", logData);
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

// ========================================
// SESSION SECURITY
// ========================================

export const sessionSecurity = (options = {}) => {
  const {
    maxAge = 24 * 60 * 60 * 1000, // 24 hours
    secure = process.env.NODE_ENV === "production",
    httpOnly = true,
    sameSite = "strict",
    rolling = true,
  } = options;

  return (req, res, next) => {
    // Set secure session cookie
    if (req.session) {
      req.session.cookie.maxAge = maxAge;
      req.session.cookie.secure = secure;
      req.session.cookie.httpOnly = httpOnly;
      req.session.cookie.sameSite = sameSite;
      req.session.cookie.rolling = rolling;
    }

    // Regenerate session on authentication
    if (req.path.includes("/login") && req.method === "POST") {
      req.session.regenerate((err) => {
        if (err) {
          logger.error("Session regeneration error:", err);
          return next(err);
        }
        next();
      });
    } else {
      next();
    }
  };
};

// ========================================
// DATA ENCRYPTION UTILITIES
// ========================================

export class DataEncryption {
  constructor(secretKey) {
    this.algorithm = "aes-256-gcm";
    this.secretKey = crypto.scryptSync(secretKey, "salt", 32);
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    cipher.setAAD(Buffer.from("axolop-crm", "utf8"));

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    decipher.setAAD(Buffer.from("axolop-crm", "utf8"));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, "hex"));

    let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}

// ========================================
// COMBINED SECURITY MIDDLEWARE
// ========================================

export const applySecurityMiddleware = (app, options = {}) => {
  const csrfProtection = new CSRFProtection(options.csrf);
  const ipBlocker = new IPBlocker(options.ipBlocking);

  // Apply security middleware in order
  app.use(enhancedSecurityHeaders);
  app.use(enhancedInputValidation(options.validation));
  app.use(ipBlocker.middleware());
  app.use(securityAuditLogger(options.audit));
  app.use(sessionSecurity(options.session));
  app.use(csrfProtection.middleware());

  // Apply rate limiters
  app.use("/api/auth/", authRateLimiter);
  app.use("/api/", apiRateLimiter);
  app.use("/api/upload/", uploadRateLimiter);

  logger.info("Security middleware applied successfully");
};

// ========================================
// SECURITY MONITORING
// ========================================

export const securityMonitor = {
  // Log security events
  logSecurityEvent: (event, data) => {
    logger.warn(`Security event: ${event}`, {
      timestamp: new Date().toISOString(),
      ...data,
    });
  },

  // Check for common attack patterns
  detectAttackPatterns: (req) => {
    const patterns = {
      sqlInjection:
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER)\b)/i,
      xss: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      pathTraversal: /\.\.[\/\\]/,
      commandInjection: /[;&|`$(){}[\]]/,
    };

    const suspicious = [];
    const checkString = `${req.path} ${JSON.stringify(req.query)} ${JSON.stringify(req.body)}`;

    for (const [name, pattern] of Object.entries(patterns)) {
      if (pattern.test(checkString)) {
        suspicious.push(name);
      }
    }

    if (suspicious.length > 0) {
      securityMonitor.logSecurityEvent("attack_pattern_detected", {
        ip: req.ip,
        method: req.method,
        path: req.path,
        patterns: suspicious,
        userAgent: req.get("User-Agent"),
      });
      return true;
    }

    return false;
  },
};

// ========================================
// USAGE EXAMPLES
// ========================================

/*
// Example usage in your main app file:

import { 
  applySecurityMiddleware, 
  securityMonitor,
  DataEncryption 
} from './middleware/security.js';

// Apply all security middleware
applySecurityMiddleware(app, {
  csrf: {
    excludedPaths: ['/api/webhook', '/api/public']
  },
  validation: {
    maxStringLength: 5000
  },
  ipBlocking: {
    maxSuspiciousAttempts: 5
  },
  audit: {
    includeBody: false
  }
});

// Add attack detection middleware
app.use((req, res, next) => {
  if (securityMonitor.detectAttackPatterns(req)) {
    return res.status(400).json({
      error: 'Invalid request detected',
      code: 'INVALID_REQUEST'
    });
  }
  next();
});

// Use encryption for sensitive data
const encryption = new DataEncryption(process.env.ENCRYPTION_SECRET);
const encrypted = encryption.encrypt('sensitive data');
const decrypted = encryption.decrypt(encrypted);
*/
