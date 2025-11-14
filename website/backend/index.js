import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { supabase, supabaseServer, getUserFromRequest, syncUserProfile } from './config/supabase-auth.js';
import Redis from 'ioredis';
import AutomationEngine from './services/automation-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;



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

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        supabase: supabaseStatus,
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

// Mount routes
app.use('/api/email-marketing', emailMarketingRoutes);

// 404 handler for development (API only)
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
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
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║      Axolop CRM API Server Running       ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server:    http://localhost:${PORT}`);
  console.log(`🏥 Health:    http://localhost:${PORT}/health`);
  console.log(`🌍 Env:       ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database:  PostgreSQL (Supabase)`);
  console.log(`🔴 Redis:     ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
  console.log('');
});

// Initialize Automation Engine
const automationEngine = new AutomationEngine();
automationEngine.start();

export { redis, automationEngine };
