#!/usr/bin/env node

/**
 * Axolop CRM - System Health Check Script
 *
 * Verifies all system components and provides a comprehensive status report.
 * Run this before starting development or when debugging issues.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const symbols = {
  success: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
};

console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║     Axolop CRM - System Health Check              ║');
console.log('╚════════════════════════════════════════════════════╝\n');

let totalChecks = 0;
let passedChecks = 0;
let warningChecks = 0;
let failedChecks = 0;

function printStatus(status, message, details = '') {
  totalChecks++;
  let symbol, color;

  if (status === 'pass') {
    symbol = symbols.success;
    color = colors.green;
    passedChecks++;
  } else if (status === 'warn') {
    symbol = symbols.warning;
    color = colors.yellow;
    warningChecks++;
  } else {
    symbol = symbols.error;
    color = colors.red;
    failedChecks++;
  }

  console.log(`${symbol} ${color}${message}${colors.reset}`);
  if (details) {
    console.log(`   ${colors.cyan}${details}${colors.reset}`);
  }
}

function checkEnvVar(varName, required = true, validator = null) {
  const value = process.env[varName];

  if (!value || value === '' || value.includes('your_') || value.includes('YOUR_')) {
    if (required) {
      printStatus('fail', `${varName} - Not configured`,
        `Set this in .env file`);
      return false;
    } else {
      printStatus('warn', `${varName} - Not configured (optional)`,
        `This is optional but recommended`);
      return null;
    }
  }

  if (validator) {
    const validation = validator(value);
    if (!validation.valid) {
      printStatus('fail', `${varName} - Invalid`, validation.message);
      return false;
    }
  }

  // Mask sensitive values
  const displayValue = value.length > 20 ?
    `${value.substring(0, 10)}...${value.substring(value.length - 5)}` :
    value.substring(0, 10) + '...';

  printStatus('pass', `${varName} - Configured`, `Value: ${displayValue}`);
  return true;
}

async function checkService(serviceName, checker) {
  try {
    const result = await checker();
    if (result.success) {
      printStatus('pass', `${serviceName} - Connected`, result.message || '');
    } else {
      printStatus('fail', `${serviceName} - Connection failed`, result.message || '');
    }
  } catch (error) {
    printStatus('fail', `${serviceName} - Error`, error.message);
  }
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    printStatus('pass', `${description} exists`, fullPath);
    return true;
  } else {
    printStatus('warn', `${description} not found`, fullPath);
    return false;
  }
}

// ========================================
// 1. Environment Variables Check
// ========================================
console.log(`${colors.bright}${colors.blue}📋 Environment Variables${colors.reset}\n`);

checkEnvVar('NODE_ENV', false);
checkEnvVar('PORT', false);
checkEnvVar('FRONTEND_URL', false);

console.log(`\n${colors.bright}Database Configuration${colors.reset}`);
checkEnvVar('DATABASE_URL', true, (val) => ({
  valid: val.includes('postgresql://'),
  message: 'Must be a valid PostgreSQL connection string'
}));
checkEnvVar('SUPABASE_URL', true, (val) => ({
  valid: val.startsWith('https://') && val.includes('supabase.co'),
  message: 'Must be a valid Supabase URL'
}));
checkEnvVar('SUPABASE_ANON_KEY', true);
checkEnvVar('SUPABASE_SERVICE_ROLE_KEY', true);

console.log(`\n${colors.bright}Redis Configuration${colors.reset}`);
checkEnvVar('REDIS_URL', true, (val) => ({
  valid: val.includes('redis://'),
  message: 'Must be a valid Redis connection string'
}));

console.log(`\n${colors.bright}SendGrid Configuration${colors.reset}`);
checkEnvVar('SENDGRID_API_KEY', true, (val) => ({
  valid: val.startsWith('SG.'),
  message: 'SendGrid API keys must start with "SG."'
}));
checkEnvVar('SENDGRID_FROM_EMAIL', true, (val) => ({
  valid: val.includes('@') && !val.includes('example'),
  message: 'Must be a valid email address'
}));
checkEnvVar('SENDGRID_FROM_NAME', true);

console.log(`\n${colors.bright}ChromaDB Configuration${colors.reset}`);
checkEnvVar('CHROMADB_URL', false);

console.log(`\n${colors.bright}Optional Services${colors.reset}`);
checkEnvVar('GOOGLE_CLIENT_ID', false);
checkEnvVar('GOOGLE_CLIENT_SECRET', false);
checkEnvVar('AUTH0_DOMAIN', false);
checkEnvVar('OPENAI_API_KEY', false);
checkEnvVar('GROQ_API_KEY', false);

// ========================================
// 2. Required Files Check
// ========================================
console.log(`\n${colors.bright}${colors.blue}📁 Required Files${colors.reset}\n`);

checkFile('package.json', 'package.json');
checkFile('.env', '.env file');
checkFile('backend/index.js', 'Backend entry point');
checkFile('frontend/main.jsx', 'Frontend entry point');

console.log(`\n${colors.bright}Database Schema Files${colors.reset}`);
checkFile('supabase-complete-setup.sql', 'Complete database schema');
checkFile('scripts/sendgrid-schema.sql', 'SendGrid schema');
checkFile('scripts/calendar-schema.sql', 'Calendar schema');
checkFile('scripts/enhanced-calendar-schema.sql', 'Enhanced calendar schema');

// ========================================
// 3. Service Connectivity Check
// ========================================
console.log(`\n${colors.bright}${colors.blue}🔌 Service Connectivity${colors.reset}\n`);

// Check Redis
await checkService('Redis', async () => {
  try {
    const Redis = (await import('ioredis')).default;
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
    });

    await redis.ping();
    await redis.quit();

    return { success: true, message: 'Redis is running' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Check ChromaDB
await checkService('ChromaDB', async () => {
  try {
    const chromaUrl = process.env.CHROMADB_URL || 'http://localhost:8001';
    const response = await fetch(`${chromaUrl}/api/v1/heartbeat`);

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: `Heartbeat: ${data['nanosecond heartbeat']}` };
    }

    return { success: false, message: `HTTP ${response.status}` };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Check Supabase
await checkService('Supabase', async () => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.from('leads').select('count').limit(1);

    if (error) {
      // Table might not exist, but connection works
      if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
        return { success: true, message: 'Connected (some tables missing)' };
      }
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Connected and tables accessible' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Check Backend API
await checkService('Backend API', async () => {
  try {
    const port = process.env.PORT || 3002;
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(3000)
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: `Server running on port ${port}` };
    }

    return { success: false, message: `HTTP ${response.status}` };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, message: 'Backend not responding (timeout)' };
    }
    return { success: false, message: 'Backend not running - start with "npm run dev:backend"' };
  }
});

// ========================================
// 4. Summary Report
// ========================================
console.log(`\n${'='.repeat(60)}`);
console.log(`${colors.bright}${colors.blue}📊 Health Check Summary${colors.reset}\n`);

const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);
const overallStatus = failedChecks === 0 ? 'HEALTHY' : 'NEEDS ATTENTION';
const statusColor = failedChecks === 0 ? colors.green : colors.yellow;

console.log(`Total Checks:      ${totalChecks}`);
console.log(`${colors.green}✅ Passed:         ${passedChecks}${colors.reset}`);
console.log(`${colors.yellow}⚠️  Warnings:       ${warningChecks}${colors.reset}`);
console.log(`${colors.red}❌ Failed:         ${failedChecks}${colors.reset}`);
console.log(`\nSuccess Rate:      ${successRate}%`);
console.log(`Overall Status:    ${statusColor}${overallStatus}${colors.reset}\n`);

// ========================================
// 5. Recommendations
// ========================================
if (failedChecks > 0 || warningChecks > 0) {
  console.log(`${colors.bright}${colors.yellow}📝 Recommendations${colors.reset}\n`);

  if (failedChecks > 0) {
    console.log(`${symbols.error} Critical issues found. Review failed checks above.`);
    console.log(`   - Check SYSTEM_STATUS_AND_SETUP_GUIDE.md for setup instructions`);
    console.log(`   - Ensure all required environment variables are set`);
    console.log(`   - Start required services (Redis, ChromaDB, Backend)\n`);
  }

  if (warningChecks > 0) {
    console.log(`${symbols.warning} Optional features not configured.`);
    console.log(`   - These are not required but recommended for full functionality`);
    console.log(`   - See .env.example for complete configuration options\n`);
  }
}

// ========================================
// 6. Next Steps
// ========================================
console.log(`${colors.bright}${colors.cyan}🚀 Next Steps${colors.reset}\n`);

if (failedChecks === 0) {
  console.log(`${symbols.success} System is healthy! You can start development:`);
  console.log(`   npm run dev:backend    # Start backend server`);
  console.log(`   npm run dev:vite       # Start frontend (in another terminal)`);
} else {
  console.log(`${symbols.info} To fix issues:`);
  console.log(`   1. Read SYSTEM_STATUS_AND_SETUP_GUIDE.md`);
  console.log(`   2. Update .env file with required values`);
  console.log(`   3. Start required services (Redis, ChromaDB)`);
  console.log(`   4. Run database initialization scripts`);
  console.log(`   5. Run this health check again`);
}

console.log(`\n${colors.bright}Documentation:${colors.reset}`);
console.log(`   - SYSTEM_STATUS_AND_SETUP_GUIDE.md - Complete setup guide`);
console.log(`   - SENDGRID_QUICK_REFERENCE.md - SendGrid quick start`);
console.log(`   - .env.example - Environment variable reference\n`);

console.log(`${'='.repeat(60)}\n`);

// Exit with appropriate code
process.exit(failedChecks > 0 ? 1 : 0);
