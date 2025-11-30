import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import multer from "multer";

// Import new config and utilities
import config from "./config/app.config.js";
import logger, { requestLogger } from "./utils/logger.js";
import {
  globalErrorHandler,
  notFoundHandler,
  requestIdMiddleware,
} from "./utils/error-handler.js";
import {
  errorHandler,
  handleUnhandledRejection,
  handleUncaughtException,
} from "./middleware/error-handler.js";
import {
  apiLimiter,
  initializeRateLimiter,
  createSessionLimiter,
  createGlobalLimiter,
} from "./middleware/rate-limit.js";
import { sanitizeMiddleware } from "./middleware/validate.js";
import cacheService from "./utils/cache.js";
import {
  validateStartupConfig,
  exitOnInvalidConfig,
} from "./utils/env-validator.js";

// Services
import { supabase, supabaseServer } from "./config/supabase-auth.js";
import Redis from "ioredis";
// import chromaService from "./services/chroma-service.js"; // Temporarily disabled

// Services will be initialized dynamically

// Initialize Express
const app = express();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ================================
// INITIALIZE SERVICES
// ================================

// ROOT CAUSE FIX: Validate configuration before initializing services
const configValidation = validateStartupConfig();
exitOnInvalidConfig(configValidation);

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

redis.on("connect", () => {
  logger.info("✅ Redis connected");

  // Initialize rate limiter with Redis
  initializeRateLimiter(redis);

  // Initialize cache service
  cacheService.initialize(redis);
});

redis.on("error", (err) => {
  logger.error("❌ Redis error", { error: err.message });
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

// ChromaDB initialization (if enabled)
let chromaInitialized = false;
if (config.chromadb.enabled) {
  try {
    chromaInitialized = await chromaService.initialize();
    if (chromaInitialized) {
      logger.info("✅ ChromaDB initialized");
    } else {
      logger.warn("⚠️  ChromaDB initialization failed");
    }
  } catch (error) {
    logger.error("❌ ChromaDB error", { error: error.message });
  }
}

// ================================
// MIDDLEWARE
// ================================

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: config.env === "production",
    crossOriginEmbedderPolicy: config.env === "production",
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS - Allow both development and production origins
const allowedOrigins = [
  config.frontendUrl,
  "http://localhost:3000",
  "http://localhost:3002",
  "https://axolop.com",
  "https://www.axolop.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Session-ID",
      "X-Agency-ID",
      "Accept",
      "Accept-Language",
      "Content-Language",
    ],
  }),
);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: config.requestLimit }));
app.use(express.urlencoded({ extended: true, limit: config.requestLimit }));

// Sanitize input
app.use(sanitizeMiddleware);

// Request ID tracking for error tracing
app.use(requestIdMiddleware);

// Request logging
app.use(requestLogger);

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// ================================
// HEALTH CHECK
// ================================

app.get("/health", async (req, res) => {
  try {
    // Check Redis
    await redis.ping();

    // Check Supabase
    let supabaseStatus = "unknown";
    try {
      const { error } = await supabase.from("leads").select("id").limit(1);
      supabaseStatus = error ? "error" : "connected";
    } catch (e) {
      supabaseStatus = "disconnected";
    }

    // ROOT CAUSE FIX: Check database health for schema issues
    const dbHealth = await checkDatabaseHealth(req.requestId);

    const health = {
      status:
        dbHealth.healthy && supabaseStatus === "connected"
          ? "healthy"
          : "degraded",
      timestamp: new Date().toISOString(),
      version: config.apiVersion,
      environment: config.env,
      services: {
        api: "connected",
        redis: "connected",
        database: supabaseStatus,
        chromadb: chromaInitialized ? "connected" : "disabled",
      },
      features: config.features,
      // ROOT CAUSE FIX: Include database health issues
      ...(dbHealth.issues.length > 0 && {
        warnings: {
          database: dbHealth.issues,
          message: "Database schema issues detected that may cause errors",
        },
      }),
    };

    res.json(health);
  } catch (error) {
    logger.error("Health check failed", { error: error.message });
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// ================================
// API ROUTES
// ================================

// Import routes
import emailMarketingRoutes from "./routes/email-marketing.js";
import meetingsRoutes from "./routes/meetings.js";
import chromadbTestRoutes from "./routes/chromadb-test.js";
import formsRoutes from "./routes/forms.js";
import leadsRoutes from "./routes/leads.js";
import contactsRoutes from "./routes/contacts.js";
import opportunitiesRoutes from "./routes/opportunities.js";
import activitiesRoutes from "./routes/activities.js";
import conversationsRoutes from "./routes/conversations.js";
import inboxRoutes from "./routes/inbox.js";
import gmailRoutes from "./routes/gmail.js";
import sendgridWebhooksRoutes from "./routes/sendgrid-webhooks.js";
import calendarRoutes from "./routes/calendar.js";
import calendarWebhooksRoutes from "./routes/calendar-webhooks.js";
import enhancedCalendarRoutes from "./routes/enhanced-calendar.js";
import workflowsRoutes from "./routes/workflows.js";
import searchRoutes from "./routes/search.js";
import secondBrainRoutes from "./routes/second-brain.js";
import aiAssistantRoutes from "./routes/ai-assistant.js";
import affiliateRoutes from "./routes/affiliate.js";
import usersRoutes from "./routes/users.js";
import callsRoutes from "./routes/calls.js";
import demoDataRoutes from "./routes/demo-data.js";
import userPreferencesRoutes from "./routes/user-preferences.js";
import twilioWebhooksRoutes from "./routes/twilio-webhooks.js";
import customFieldsRoutes from "./routes/custom-fields.js";
import agenciesRoutes from "./routes/agencies.js";
import agencyMembersRoutes from "./routes/agency-members.js";
import invitesRoutes from "./routes/invites.js";
import tasksRoutes from "./routes/tasks.js";
import statsRoutes from "./routes/stats.js";
import dashboardRoutes from "./routes/dashboard.js";
import dashboardV2Routes from "./routes/dashboard-v2.js";
import sessionAnalyticsRoutes from "./routes/session-analytics.js";
import rolesRoutes from "./routes/roles.js";
import stripeRoutes from "./routes/stripe.js";
import auditRoutes from "./routes/audit.js";
import invitationTemplatesRoutes from "./routes/invitation-templates.js";
import landingPageRoutes from "./routes/landing-page.js";
import bootstrapRoutes from "./routes/bootstrap-simple.js";

// Import database validation for ROOT CAUSE prevention
import { checkDatabaseHealth } from "./utils/database-validator.js";

// API prefix with versioning
const apiPrefix = `/api/${config.apiVersion}`;

// Create specialized rate limiters
// Use much higher limits for development/testing to prevent false positives
const isDev = process.env.NODE_ENV !== "production";
const sessionLimiter = createSessionLimiter(isDev ? 1000 : 200, 15 * 60 * 1000); // 1000 req/15min in dev, 200 in prod
const globalLimiter = createGlobalLimiter(isDev ? 500 : 100, 15 * 60 * 1000); // 500 req/15min in dev, 100 in prod

// Apply rate limiting to all API routes
if (config.rateLimit.enabled) {
  // Apply global limiter first (for unauthenticated requests)
  app.use(apiPrefix, globalLimiter);

  // Apply session-based limiter for authenticated requests
  app.use(apiPrefix, sessionLimiter);

  // Apply general API limiter as backup
  app.use(apiPrefix, apiLimiter);

  console.log("✅ Multi-tier rate limiting ENABLED for production");
  console.log("   - Global limiter: 20 req/15min (unauthenticated)");
  console.log("   - Session limiter: 50 req/15min (per session)");
  console.log("   - API limiter: 100 req/15min (backup)");
} else {
  console.log("⚠️  Rate limiting DISABLED for development");
}

// Mount routes
app.use(`${apiPrefix}/email-marketing`, emailMarketingRoutes);
app.use(`${apiPrefix}/meetings`, meetingsRoutes);
app.use(`${apiPrefix}/chromadb`, chromadbTestRoutes);
app.use(`${apiPrefix}/forms`, formsRoutes);
app.use(`${apiPrefix}/leads`, upload.single("csvFile"), leadsRoutes);
app.use(`${apiPrefix}/contacts`, contactsRoutes);
app.use(`${apiPrefix}/opportunities`, opportunitiesRoutes);
app.use(`${apiPrefix}/activities`, activitiesRoutes);
app.use(`${apiPrefix}/conversations`, conversationsRoutes);
app.use(`${apiPrefix}/inbox`, inboxRoutes);
app.use(`${apiPrefix}/gmail`, gmailRoutes);
app.use(`${apiPrefix}/sendgrid`, sendgridWebhooksRoutes);
app.use(`${apiPrefix}/calendar`, calendarRoutes);
app.use(`${apiPrefix}/calendar/webhooks`, calendarWebhooksRoutes);
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
app.use(`${apiPrefix}/invites`, invitesRoutes);
app.use(`${apiPrefix}/agencies`, agencyMembersRoutes);
app.use(`${apiPrefix}/tasks`, tasksRoutes);
app.use(`${apiPrefix}/stats`, statsRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`/api/v2/dashboard`, dashboardV2Routes);
app.use(`${apiPrefix}/sessions`, sessionAnalyticsRoutes);
app.use(`${apiPrefix}/roles`, rolesRoutes);
app.use(`${apiPrefix}/stripe`, stripeRoutes);
app.use(`${apiPrefix}/audit`, auditRoutes);
app.use(`${apiPrefix}/invitation-templates`, invitationTemplatesRoutes);
app.use(`${apiPrefix}/landing`, landingPageRoutes);
app.use(`${apiPrefix}/bootstrap`, bootstrapRoutes);

// Legacy routes (without version) for backward compatibility - MINIMAL SET
// Only keep critical legacy routes that might break existing integrations
app.use("/api/forms", formsRoutes); // Critical for forms functionality
app.use("/api/leads", upload.single("csvFile"), leadsRoutes); // Critical for leads
app.use("/api/contacts", contactsRoutes); // Critical for contacts
app.use("/api/agencies", agenciesRoutes); // Critical for agency management
app.use("/api/calendar", calendarRoutes); // Critical for calendar functionality

// ================================
// ERROR HANDLING
// ================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// Unhandled promise rejections
process.on("unhandledRejection", handleUnhandledRejection);

// Uncaught exceptions
process.on("uncaughtException", handleUncaughtException);

// ================================
// GRACEFUL SHUTDOWN
// ================================

let automationEngine = null;
let workflowExecutionEngine = null;

async function gracefulShutdown(signal) {
  logger.info(`${signal} received - starting graceful shutdown`);

  try {
    // Stop automation engine
    if (automationEngine) {
      automationEngine.stop();
      logger.info("Automation engine stopped");
    }

    // Stop workflow execution engine
    if (workflowExecutionEngine) {
      workflowExecutionEngine.stop();
      logger.info("Workflow execution engine stopped");
    }

    // Close Redis connection
    await redis.quit();
    logger.info("Redis connection closed");

    // Give time for pending operations
    await new Promise((resolve) => setTimeout(resolve, 1000));

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown", { error: error.message });
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ================================
// START SERVER
// ================================

const server = app.listen(config.port, "0.0.0.0", () => {
  logger.info("");
  logger.info("╔════════════════════════════════════════════════╗");
  logger.info("║       Axolop CRM API Server Running            ║");
  logger.info("╚════════════════════════════════════════════════╝");
  logger.info("");
  logger.info(`🚀 Server:    http://localhost:${config.port}`);
  logger.info(`🏥 Health:    http://localhost:${config.port}/health`);
  logger.info(
    `📚 API v${config.apiVersion}:  http://localhost:${config.port}${apiPrefix}`,
  );
  logger.info(`🌍 Env:       ${config.env}`);
  logger.info(`💾 Database:  PostgreSQL (Supabase)`);
  logger.info(`🔴 Redis:     ${config.redis.host}:${config.redis.port}`);
  if (config.chromadb.enabled) {
    logger.info(`🔷 ChromaDB:  ${config.chromadb.url}`);
  }
  logger.info("");

  // Log enabled features
  const enabledFeatures = Object.entries(config.features)
    .filter(([_, enabled]) => enabled)
    .map(([feature]) => feature);
  if (enabledFeatures.length > 0) {
    logger.info(`✨ Features:  ${enabledFeatures.join(", ")}`);
    logger.info("");
  }
});

// ================================
// INITIALIZE AUTOMATION
// ================================

// Initialize automation engine after server starts (if available)

if (config.workflow.enabled) {
  try {
    // Dynamic imports to handle missing modules gracefully
    const AutomationEngineModule = await import(
      "./services/automation-engine.js"
    );
    automationEngine = new AutomationEngineModule.default();
    automationEngine.start();
    logger.info("🔄 Automation Engine started");
  } catch (error) {
    logger.warn("⚠️ Automation Engine not available:", error.message);
  }

  try {
    const WorkflowExecutionEngineModule = await import(
      "./services/workflow-execution-engine.js"
    );
    workflowExecutionEngine = WorkflowExecutionEngineModule.default;
    workflowExecutionEngine.start();
    logger.info("🚀 Workflow Execution Engine started");
  } catch (error) {
    logger.warn("⚠️ Workflow Execution Engine not available:", error.message);
  }
}

// Export for testing and external use
export { automationEngine, workflowExecutionEngine };
