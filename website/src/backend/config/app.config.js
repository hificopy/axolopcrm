import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  // Server
  port: parseInt(process.env.PORT || process.env.API_PORT || '3001', 10),
  env: process.env.NODE_ENV || 'development',

  // API
  apiVersion: 'v1',
  requestLimit: process.env.REQUEST_LIMIT || '10mb',

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',

  // Database
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    },
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET,
  },

  // Auth0
  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    retryDelayMs: 50,
  },

  // ChromaDB
  chromadb: {
    url: process.env.CHROMADB_URL || 'http://localhost:8001',
    enabled: process.env.CHROMADB_ENABLED !== 'false',
  },

  // Email Services
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL,
    fromName: process.env.SENDGRID_FROM_NAME,
    enabled: !!process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key',
  },

  // AWS SES
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  },

  // AI Services
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    enabled: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key',
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama3-70b-8192',
    enabled: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key',
  },

  // Google Services
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    enabled: !!process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id',
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    enabled: !!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_stripe'),
  },

  // Analytics
  posthog: {
    apiKey: process.env.POSTHOG_API_KEY,
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
    enabled: !!process.env.POSTHOG_API_KEY && process.env.POSTHOG_API_KEY !== 'your_posthog_api_key',
  },

  // Error Tracking
  sentry: {
    dsn: process.env.SENTRY_DSN,
    enabled: !!process.env.SENTRY_DSN && process.env.SENTRY_DSN !== 'your_sentry_dsn',
  },

  // Workflow Engine
  workflow: {
    pollIntervalMs: parseInt(process.env.WORKFLOW_POLL_INTERVAL || '5000', 10),
    emailPollIntervalMs: parseInt(process.env.EMAIL_POLL_INTERVAL || '10000', 10),
    schedulePollIntervalMs: parseInt(process.env.SCHEDULE_POLL_INTERVAL || '60000', 10),
    maxConcurrentExecutions: parseInt(process.env.MAX_CONCURRENT_EXECUTIONS || '10', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    enabled: process.env.ENABLE_WORKFLOWS !== 'false',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
  },

  // Caching
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10),
    workflowTtl: parseInt(process.env.CACHE_WORKFLOW_TTL || '1800', 10),
    templateTtl: parseInt(process.env.CACHE_TEMPLATE_TTL || '3600', 10),
    leadTtl: parseInt(process.env.CACHE_LEAD_TTL || '300', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    console: process.env.LOG_CONSOLE !== 'false',
    file: process.env.LOG_FILE !== 'false',
  },

  // Feature Flags
  features: {
    emailMarketing: process.env.ENABLE_EMAIL_MARKETING !== 'false',
    workflows: process.env.ENABLE_WORKFLOWS !== 'false',
    aiScoring: process.env.ENABLE_AI_SCORING !== 'false',
    forms: process.env.ENABLE_FORMS !== 'false',
    calendar: process.env.ENABLE_CALENDAR !== 'false',
    calls: process.env.ENABLE_CALLS !== 'false',
    secondBrain: process.env.ENABLE_SECOND_BRAIN !== 'false',
  },

  // Encryption
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'default_key_change_in_production',
  },
};

// Validation
function validateConfig() {
  const required = [
    { key: 'database.url', value: config.database.url },
    { key: 'supabase.url', value: config.supabase.url },
    { key: 'supabase.anonKey', value: config.supabase.anonKey },
  ];

  const missing = [];

  for (const { key, value } of required) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ Missing required configuration: ${missing.join(', ')}`);
    console.error('Please check your .env file and ensure all required variables are set.');
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }

  // Warnings for optional but recommended services
  const warnings = [];

  if (!config.sendgrid.enabled) {
    warnings.push('SendGrid not configured - email sending will fail');
  }

  if (!config.openai.enabled && !config.groq.enabled) {
    warnings.push('No AI service configured - AI features will be disabled');
  }

  if (config.encryption.key === 'default_key_change_in_production' && config.env === 'production') {
    warnings.push('⚠️  WARNING: Using default encryption key in production! Please set ENCRYPTION_KEY');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Configuration warnings:');
    warnings.forEach(w => console.warn(`   - ${w}`));
    console.warn('');
  }
}

// Validate on import
try {
  validateConfig();
} catch (error) {
  if (config.env !== 'test') {
    throw error;
  }
}

export default config;
