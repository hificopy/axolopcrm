/**
 * Validation Middleware
 * Comprehensive validation for API requests
 */

// ===========================================================================
// VALIDATION HELPERS
// ===========================================================================

/**
 * Validate required fields in request body
 */
export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = [];

    fields.forEach(field => {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (field = 'phoneNumber') => {
  return (req, res, next) => {
    const phone = req.body[field];

    if (!phone) {
      return next(); // Let required validation handle this
    }

    // Basic E.164 format validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `Invalid phone number format for ${field}. Use E.164 format: +1234567890`
      });
    }

    next();
  };
};

/**
 * Validate email format
 */
export const validateEmail = (field = 'email') => {
  return (req, res, next) => {
    const email = req.body[field];

    if (!email) {
      return next(); // Let required validation handle this
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `Invalid email format for ${field}`
      });
    }

    next();
  };
};

/**
 * Validate UUID format
 */
export const validateUUID = (field = 'id') => {
  return (req, res, next) => {
    const id = req.params[field] || req.body[field];

    if (!id) {
      return next(); // Let required validation handle this
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `Invalid UUID format for ${field}`
      });
    }

    next();
  };
};

/**
 * Validate date format (ISO 8601)
 */
export const validateDate = (field) => {
  return (req, res, next) => {
    const date = req.body[field] || req.query[field];

    if (!date) {
      return next(); // Let required validation handle this
    }

    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `Invalid date format for ${field}. Use ISO 8601 format: YYYY-MM-DD`
      });
    }

    next();
  };
};

/**
 * Validate enum values
 */
export const validateEnum = (field, allowedValues) => {
  return (req, res, next) => {
    const value = req.body[field] || req.query[field];

    if (!value) {
      return next(); // Let required validation handle this
    }

    if (!allowedValues.includes(value)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `Invalid value for ${field}. Allowed values: ${allowedValues.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Validate number range
 */
export const validateRange = (field, min, max) => {
  return (req, res, next) => {
    const value = req.body[field] || req.query[field];

    if (value === undefined || value === null) {
      return next(); // Let required validation handle this
    }

    const num = Number(value);

    if (isNaN(num)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `${field} must be a number`
      });
    }

    if (min !== undefined && num < min) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `${field} must be at least ${min}`
      });
    }

    if (max !== undefined && num > max) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `${field} must be at most ${max}`
      });
    }

    next();
  };
};

// ===========================================================================
// CALL-SPECIFIC VALIDATIONS
// ===========================================================================

/**
 * Validate call disposition
 */
export const validateCallDisposition = validateEnum('disposition', [
  'interested',
  'not_interested',
  'callback',
  'voicemail',
  'no_answer',
  'busy',
  'do_not_call',
  'completed',
  'failed'
]);

/**
 * Validate call status
 */
export const validateCallStatus = validateEnum('status', [
  'initiated',
  'ringing',
  'answered',
  'active',
  'ended',
  'failed'
]);

/**
 * Validate script type
 */
export const validateScriptType = validateEnum('scriptType', [
  'default',
  'interested',
  'not_interested',
  'upsell',
  'downsell',
  'follow_up',
  'voicemail'
]);

/**
 * Validate queue item status
 */
export const validateQueueStatus = validateEnum('status', [
  'pending',
  'in_progress',
  'completed',
  'disposed',
  'callback'
]);

/**
 * Validate date type
 */
export const validateDateType = validateEnum('dateType', [
  'birthday',
  'anniversary',
  'policy_expiration',
  'renewal_date',
  'follow_up',
  'custom'
]);

/**
 * Validate comment type
 */
export const validateCommentType = validateEnum('commentType', [
  'note',
  'action_item',
  'follow_up',
  'objection',
  'ai_insight',
  'disposition'
]);

// ===========================================================================
// COMPOSITE VALIDATORS FOR COMMON OPERATIONS
// ===========================================================================

/**
 * Validate call initiation request
 */
export const validateCallInitiation = [
  validateRequired(['phoneNumber']),
  validatePhoneNumber('phoneNumber'),
  validateUUID('leadId'),
  (req, res, next) => {
    // Either leadId or contactId must be provided
    if (!req.body.leadId && !req.body.contactId) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Either leadId or contactId must be provided'
      });
    }
    next();
  }
];

/**
 * Validate disposition update
 */
export const validateDispositionUpdate = [
  validateRequired(['disposition']),
  validateCallDisposition
];

/**
 * Validate script template creation
 */
export const validateScriptCreation = [
  validateRequired(['name', 'content']),
  validateScriptType,
  (req, res, next) => {
    // Validate content length
    if (req.body.content && req.body.content.length < 10) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Script content must be at least 10 characters'
      });
    }
    next();
  }
];

/**
 * Validate queue item creation
 */
export const validateQueueItemCreation = [
  validateRequired(['queueId', 'leadId']),
  validateUUID('queueId'),
  validateUUID('leadId'),
  validateRange('priority', 0, 10),
  validateRange('maxAttempts', 1, 10)
];

/**
 * Validate important date creation
 */
export const validateImportantDateCreation = [
  validateRequired(['leadId', 'dateValue']),
  validateUUID('leadId'),
  validateDate('dateValue'),
  validateDateType,
  validateRange('notifyDaysBefore', 0, 365)
];

// ===========================================================================
// ERROR HANDLING
// ===========================================================================

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Supabase errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'A record with this information already exists'
        });

      case '23503': // Foreign key violation
        return res.status(400).json({
          error: 'Invalid reference',
          message: 'Referenced record does not exist'
        });

      case '23502': // Not null violation
        return res.status(400).json({
          error: 'Missing required field',
          message: err.message
        });

      default:
        return res.status(500).json({
          error: 'Database error',
          message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
        });
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message
    });
  }

  // Authentication errors
  if (err.name === 'UnauthorizedError' || err.message?.includes('Unauthorized')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
};

/**
 * Async handler wrapper
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
};

/**
 * Rate limiting helper
 */
export const createRateLimiter = (windowMs = 60000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(time => time > windowStart);
      requests.set(ip, userRequests);
    } else {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);

    if (userRequests.length >= max) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    userRequests.push(now);
    next();
  };
};

export default {
  validateRequired,
  validatePhoneNumber,
  validateEmail,
  validateUUID,
  validateDate,
  validateEnum,
  validateRange,
  validateCallDisposition,
  validateCallStatus,
  validateScriptType,
  validateQueueStatus,
  validateDateType,
  validateCommentType,
  validateCallInitiation,
  validateDispositionUpdate,
  validateScriptCreation,
  validateQueueItemCreation,
  validateImportantDateCreation,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  createRateLimiter
};
