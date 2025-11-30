import winston from 'winston';
import config from '../config/app.config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Custom format for console
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, ...meta } = info;
      let metaStr = '';
      if (Object.keys(meta).length > 0) {
        metaStr = '\n' + JSON.stringify(meta, null, 2);
      }
      return `${timestamp} [${level}]: ${message}${metaStr}`;
    }
  )
);

// JSON format for file
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports = [];

// Console transport
if (config.logging.console) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// File transports
if (config.logging.file) {
  const logsDir = path.join(__dirname, '../../logs');

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  if (config.env === 'development') {
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'debug.log'),
        level: 'debug',
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 3,
      })
    );
  }
}

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  transports,
  exitOnError: false,
});

// Request logging middleware
export function requestLogger(req, res, next) {
  const start = Date.now();

  // Log request
  logger.http('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };

    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request error', logData);
    } else {
      logger.http('Request completed', logData);
    }
  });

  next();
}

// Workflow execution logger
export function logWorkflowExecution(workflowId, executionId, status, data = {}) {
  logger.info('Workflow execution', {
    workflowId,
    executionId,
    status,
    ...data,
  });
}

// Email event logger
export function logEmailEvent(eventType, emailData) {
  logger.info('Email event', {
    eventType,
    ...emailData,
  });
}

// Database query logger
export function logDatabaseQuery(operation, table, duration, error = null) {
  if (error) {
    logger.error('Database query failed', {
      operation,
      table,
      duration,
      error: error.message,
    });
  } else if (config.env === 'development') {
    logger.debug('Database query', {
      operation,
      table,
      duration,
    });
  }
}

// Cache operation logger
export function logCacheOperation(operation, key, hit = null) {
  logger.debug('Cache operation', {
    operation,
    key,
    hit,
  });
}

export default logger;
