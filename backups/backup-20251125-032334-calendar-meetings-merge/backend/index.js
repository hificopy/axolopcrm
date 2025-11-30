import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import multer from 'multer';

// Import new config and utilities
import config from './config/app.config.js';
import logger, { requestLogger } from './utils/logger.js';
import { errorHandler, notFoundHandler, handleUnhandledRejection, handleUncaughtException } from './middleware/error-handler.js';
import { apiLimiter, initializeRateLimiter } from './middleware/rate-limit.js';
import { sanitizeMiddleware } from './middleware/validate.js';
import cacheService from './utils/cache.js';

// Services
import { supabase, supabaseServer } from './config/supabase-auth.js';
import Redis from 'ioredis';
import chromaService from './services/chroma-service.js';
import AutomationEngine from './services/automation-engine.js';
import workflowExecutionEngine from './services/workflow-execution-engine.js';

// Initialize Express
const app = express();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ================================
// INITIALIZE SERVICES
// ================================

// Redis initialization with config
export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
  retryStrategy: (times) => {
    const delay = Math.min(times * config.redis.retryDelayMs, 2000);
    return delay;
  },
  lazyConnect: false,
});

redis.on('connect', () => {
  logger.info('✅ Redis connected');

  // Initialize rate limiter with Redis
  initializeRateLimiter(redis);

  // Initialize cache service
  cacheService.initialize(redis);
});

redis.on('error', (err) => {
  logger.error('❌ Redis error', { error: err.message });
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// ChromaDB initialization (if enabled)
let chromaInitialized = false;
if (config.chromadb.enabled) {
  try {
    chromaInitialized = await chromaService.initialize();
    if (chromaInitialized) {
      logger.info('✅ ChromaDB initialized');
    } else {
      logger.warn('⚠️  ChromaDB initialization failed');
    }
  } catch (error) {
    logger.error('❌ ChromaDB error', { error: error.message });
  }
}

// ================================
// MIDDLEWARE
// ================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: config.env === 'production',
  crossOriginEmbedderPolicy: config.env === 'production',
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: config.requestLimit }));
app.use(express.urlencoded({ extended: true, limit: config.requestLimit }));

// Sanitize input
app.use(sanitizeMiddleware);

// Request logging
app.use(requestLogger);

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// ================================
// HEALTH CHECK
// ================================

app.get('/health', async (req, res) => {
  try {
    // Check Redis
    await redis.ping();

    // Check Supabase
    let supabaseStatus = 'unknown';
    try {
      const { error } = await supabase.from('leads').select('id').limit(1);
      supabaseStatus = error ? 'error' : 'connected';
    } catch (e) {
      supabaseStatus = 'disconnected';
    }

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: config.apiVersion,
      environment: config.env,
      services: {
        api: 'connected',
        redis: 'connected',
        database: supabaseStatus,
        chromadb: chromaInitialized ? 'connected' : 'disabled',
      },
      features: config.features,
    };

    res.json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// ================================
// API ROUTES
// ================================

// Import routes
import emailMarketingRoutes from './routes/email-marketing.js';
import meetingsRoutes from './routes/meetings.js';
import chromadbTestRoutes from './routes/chromadb-test.js';
import formsRoutes from './routes/forms.js';
import leadsRoutes from './routes/leads.js';
import contactsRoutes from './routes/contacts.js';
import opportunitiesRoutes from './routes/opportunities.js';
import activitiesRoutes from './routes/activities.js';
import historyRoutes from './routes/history.js';
import inboxRoutes from './routes/inbox.js';
import gmailRoutes from './routes/gmail.js';
import sendgridWebhooksRoutes from './routes/sendgrid-webhooks.js';
import calendarRoutes from './routes/calendar.js';
import enhancedCalendarRoutes from './routes/enhanced-calendar.js';
import workflowsRoutes from './routes/workflows.js';
import searchRoutes from './routes/search.js';
import secondBrainRoutes from './routes/second-brain.js';
import aiAssistantRoutes from './routes/ai-assistant.js';
import affiliateRoutes from './routes/affiliate.js';
import usersRoutes from './routes/users.js';
import callsRoutes from './routes/calls.js';
import demoDataRoutes from './routes/demo-data.js';
import userPreferencesRoutes from './routes/user-preferences.js';
import twilioWebhooksRoutes from './routes/twilio-webhooks.js';
import customFieldsRoutes from './routes/custom-fields.js';
import agenciesRoutes from './routes/agencies.js';
import agencyMembersRoutes from './routes/agency-members.js';
import tasksRoutes from './routes/tasks.js';
import statsRoutes from './routes/stats.js';
import dashboardRoutes from './routes/dashboard.js';

// API prefix with versioning
const apiPrefix = `/api/${config.apiVersion}`;

// Apply rate limiting to all API routes
// Use a much higher limit in development to prevent false positives
const isDev = process.env.NODE_ENV !== 'production';
if (config.rateLimit.enabled && !isDev) {
  app.use(apiPrefix, apiLimiter);
  console.log('✅ Rate limiting ENABLED for production');
} else {
  console.log('⚠️  Rate limiting DISABLED for development');
}

// Mount routes
app.use(`${apiPrefix}/email-marketing`, emailMarketingRoutes);
app.use(`${apiPrefix}/meetings`, meetingsRoutes);
app.use(`${apiPrefix}/chromadb`, chromadbTestRoutes);
app.use(`${apiPrefix}/forms`, formsRoutes);
app.use(`${apiPrefix}/leads`, upload.single('csvFile'), leadsRoutes);
app.use(`${apiPrefix}/contacts`, contactsRoutes);
app.use(`${apiPrefix}/opportunities`, opportunitiesRoutes);
app.use(`${apiPrefix}/activities`, activitiesRoutes);
app.use(`${apiPrefix}/history`, historyRoutes);
app.use(`${apiPrefix}/inbox`, inboxRoutes);
app.use(`${apiPrefix}/gmail`, gmailRoutes);
app.use(`${apiPrefix}/sendgrid`, sendgridWebhooksRoutes);
app.use(`${apiPrefix}/calendar`, calendarRoutes);
app.use(`${apiPrefix}/calendar/enhanced`, enhancedCalendarRoutes);
app.use(`${apiPrefix}/workflows`, workflowsRoutes);
app.use(`${apiPrefix}/search`, searchRoutes);
app.use(`${apiPrefix}/second-brain`, secondBrainRoutes);
app.use(`${apiPrefix}/ai-assistant`, aiAssistantRoutes);
app.use(`${apiPrefix}/affiliate`, affiliateRoutes);
app.use(`${apiPrefix}/users`, usersRoutes);
app.use(`${apiPrefix}/calls`, callsRoutes);
app.use(`${apiPrefix}/demo-data`, demoDataRoutes);
app.use(`${apiPrefix}/user-preferences`, userPreferencesRoutes);
app.use(`${apiPrefix}/twilio`, twilioWebhooksRoutes);
app.use(`${apiPrefix}/custom-fields`, customFieldsRoutes);
app.use(`${apiPrefix}/agencies`, agenciesRoutes);
app.use(`${apiPrefix}/agencies`, agencyMembersRoutes);
app.use(`${apiPrefix}/tasks`, tasksRoutes);
app.use(`${apiPrefix}/stats`, statsRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);

// Legacy routes (without version) for backward compatibility
app.use('/api/email-marketing', emailMarketingRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/chromadb', chromadbTestRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/leads', upload.single('csvFile'), leadsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/sendgrid', sendgridWebhooksRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/workflows', workflowsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/second-brain', secondBrainRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/demo-data', demoDataRoutes);
app.use('/api/user-preferences', userPreferencesRoutes);
app.use('/api/twilio', twilioWebhooksRoutes);
app.use('/api/custom-fields', customFieldsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/agencies', agenciesRoutes);
app.use('/api/agencies', agencyMembersRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ================================
// ERROR HANDLING
// ================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Unhandled promise rejections
process.on('unhandledRejection', handleUnhandledRejection);

// Uncaught exceptions
process.on('uncaughtException', handleUncaughtException);

// ================================
// GRACEFUL SHUTDOWN
// ================================

let automationEngine = null;

async function gracefulShutdown(signal) {
  logger.info(`${signal} received - starting graceful shutdown`);

  try {
    // Stop automation engine
    if (automationEngine) {
      automationEngine.stop();
      logger.info('Automation engine stopped');
    }

    // Stop workflow execution engine
    if (workflowExecutionEngine) {
      workflowExecutionEngine.stop();
      logger.info('Workflow execution engine stopped');
    }

    // Close Redis connection
    await redis.quit();
    logger.info('Redis connection closed');

    // Give time for pending operations
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ================================
// START SERVER
// ================================

const server = app.listen(config.port, '0.0.0.0', () => {
  logger.info('');
  logger.info('╔════════════════════════════════════════════════╗');
  logger.info('║       Axolop CRM API Server Running            ║');
  logger.info('╚════════════════════════════════════════════════╝');
  logger.info('');
  logger.info(`🚀 Server:    http://localhost:${config.port}`);
  logger.info(`🏥 Health:    http://localhost:${config.port}/health`);
  logger.info(`📚 API v${config.apiVersion}:  http://localhost:${config.port}${apiPrefix}`);
  logger.info(`🌍 Env:       ${config.env}`);
  logger.info(`💾 Database:  PostgreSQL (Supabase)`);
  logger.info(`🔴 Redis:     ${config.redis.host}:${config.redis.port}`);
  if (config.chromadb.enabled) {
    logger.info(`🔷 ChromaDB:  ${config.chromadb.url}`);
  }
  logger.info('');

  // Log enabled features
  const enabledFeatures = Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
  if (enabledFeatures.length > 0) {
    logger.info(`✨ Features:  ${enabledFeatures.join(', ')}`);
    logger.info('');
  }
});

// ================================
// INITIALIZE AUTOMATION
// ================================

// Initialize automation engine after server starts
if (config.workflow.enabled) {
  automationEngine = new AutomationEngine();
  automationEngine.start();
  logger.info('🔄 Automation Engine started');

  // Initialize workflow execution engine
  workflowExecutionEngine.start();
  logger.info('🚀 Workflow Execution Engine started');
}

// Export for testing and external use
export { chromaService, automationEngine, workflowExecutionEngine };
