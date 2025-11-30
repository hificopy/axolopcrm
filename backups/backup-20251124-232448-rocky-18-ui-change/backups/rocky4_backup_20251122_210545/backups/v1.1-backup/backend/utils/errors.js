/**
 * Custom Error Classes for Axolop CRM API
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      status: 'error',
      statusCode: this.statusCode,
      message: this.message,
      timestamp: this.timestamp,
      isOperational: this.isOperational,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400);
    this.name = 'ValidationError';
    this.details = details;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      details: this.details,
    };
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden - insufficient permissions') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message, conflictingResource = null) {
    super(message, 409);
    this.name = 'ConflictError';
    this.conflictingResource = conflictingResource;
  }
}

export class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500, true);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

export class ExternalServiceError extends AppError {
  constructor(service, message, originalError = null) {
    super(`${service}: ${message}`, 503, true);
    this.name = 'ExternalServiceError';
    this.service = service;
    this.originalError = originalError;
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class WorkflowExecutionError extends AppError {
  constructor(workflowId, stepId, message, originalError = null) {
    super(message, 500, true);
    this.name = 'WorkflowExecutionError';
    this.workflowId = workflowId;
    this.stepId = stepId;
    this.originalError = originalError;
  }
}

// Error factory functions
export function createValidationError(field, message) {
  return new ValidationError(`Validation failed for ${field}`, {
    field,
    message,
  });
}

export function createDatabaseError(operation, error) {
  return new DatabaseError(
    `Database operation failed: ${operation}`,
    error
  );
}

export function createNotFoundError(resourceType, resourceId = null) {
  const message = resourceId
    ? `${resourceType} with ID ${resourceId} not found`
    : `${resourceType} not found`;
  return new NotFoundError(message);
}
