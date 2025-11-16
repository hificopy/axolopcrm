import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer'; // Import multer

import { supabase, supabaseServer, getUserFromRequest, syncUserProfile } from './config/supabase-auth.js';
import Redis from 'ioredis';
import chromaService from './services/chroma-service.js';
import AutomationEngine from './services/automation-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads (using memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Initialize ChromaDB service
let chromaInitialized = false;
try {
  chromaInitialized = await chromaService.initialize();
  if (chromaInitialized) {
    console.log('✅ ChromaDB service initialized');
  } else {
    console.error('❌ Failed to initialize ChromaDB service');
  }
} catch (error) {
  console.error('❌ ChromaDB service initialization error:', error.message);
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {


    // Check Redis connection
    await redis.ping();
    
    // Check Supabase connection
    let supabaseStatus = 'disconnected';
    if (supabase) {
      try {
        // Test auth connection
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!authError) {
          supabaseStatus = 'connected (auth)';
        } else {
          supabaseStatus = 'connection error';
        }
      } catch (error) {
        supabaseStatus = 'connection failed';
      }
    } else {
      supabaseStatus = 'not configured';
    }

    // Check ChromaDB connection
    let chromaStatus = chromaInitialized ? 'connected' : 'disconnection';

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        supabase: supabaseStatus,
        chromadb: chromaStatus,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

// API Routes will be imported here
import emailMarketingRoutes from './routes/email-marketing.js';
import chromadbTestRoutes from './routes/chromadb-test.js';
import formsRoutes from './routes/forms.js';
import leadsRoutes from './routes/leads.js'; // Import leads routes
import contactsRoutes from './routes/contacts.js'; // Import contacts routes
import opportunitiesRoutes from './routes/opportunities.js'; // Import opportunities routes

// Mount routes
app.use('/api/email-marketing', emailMarketingRoutes);
app.use('/api/chromadb', chromadbTestRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/leads', upload.single('csvFile'), leadsRoutes); // Mount leads routes with multer middleware
app.use('/api/contacts', contactsRoutes); // Mount contacts routes
app.use('/api/opportunities', opportunitiesRoutes); // Mount opportunities routes

// 404 handler for API routes
app.use('/api', (req, res) => {
  console.warn(`404 - API route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'API Route Not Found',
    message: `The requested API endpoint ${req.method} ${req.path} does not exist`,
    availableRoutes: [
      'GET /health',
      'POST /api/email-marketing/*',
      'GET /api/chromadb/*',
      'GET /api/forms',
      'POST /api/forms',
      'GET /api/forms/:id',
      'PUT /api/forms/:id',
      'DELETE /api/forms/:id',
      'POST /api/forms/:id/submit',
      'POST /api/leads/import',
      'GET /api/leads/presets',
      'POST /api/leads/presets',
      'PUT /api/leads/presets/:id',
      'DELETE /api/leads/presets/:id',
      'GET /api/contacts',
      'GET /api/contacts/:id',
      'POST /api/contacts',
      'PUT /api/contacts/:id',
      'DELETE /api/contacts/:id',
      'GET /api/opportunities',
      'GET /api/opportunities/:id',
      'POST /api/opportunities',
      'PUT /api/opportunities/:id',
      'DELETE /api/opportunities/:id'
    ],
    timestamp: new Date().toISOString(),
  });
});

// Catch all 404 handler
app.use((req, res) => {
  console.warn(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await redis.quit();
  // Supabase doesn't require explicit disconnection
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await redis.quit();
  // Supabase doesn't require explicit disconnection
  process.exit(0);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║           Axolop CRM API Server Running        ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server:    http://localhost:${PORT}`);
  console.log(`🏥 Health:    http://localhost:${PORT}/health`);
  console.log(`🌍 Env:       ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database:  PostgreSQL (Supabase)`);
  console.log(`🔴 Redis:     ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
  console.log(`🔷 ChromaDB:  ${process.env.CHROMADB_URL || 'http://localhost:8001'}`);
  console.log('');
});

// Initialize Automation Engine
const automationEngine = new AutomationEngine();
automationEngine.start();

export { redis, chromaService, automationEngine };

