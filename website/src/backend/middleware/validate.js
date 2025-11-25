import { ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Validation middleware factory using Zod schemas
 * @param {Object} schema - Zod schema object
 * @returns {Function} Express middleware
 */
export function validate(schema) {
  return async (req, res, next) => {
    try {
      // Validate request data
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace request data with validated data
      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        // Format Zod errors
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Validation failed', {
          path: req.path,
          errors: details,
        });

        next(new ValidationError('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Sanitize input data
 */
export function sanitize(data) {
  if (typeof data === 'string') {
    return data.trim();
  }
  if (Array.isArray(data)) {
    return data.map(sanitize);
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitize(value);
    }
    return sanitized;
  }
  return data;
}

/**
 * Sanitization middleware
 */
export function sanitizeMiddleware(req, res, next) {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  next();
}
