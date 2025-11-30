import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const requiredVars = {
  development: [
    'DATABASE_URL',
    'JWT_SECRET',
    'AUTH0_DOMAIN',
    'AUTH0_CLIENT_ID',
  ],
  production: [
    'DATABASE_URL',
    'JWT_SECRET',
    'AUTH0_DOMAIN',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
    'REDIS_URL',
  ],
};

const env = process.env.NODE_ENV || 'development';
const required = requiredVars[env] || requiredVars.development;

console.log('\n🔍 Validating environment configuration...\n');

const missing = required.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Please check your .env file and ensure all required variables are set.\n');
  process.exit(1);
}

console.log('✅ All required environment variables are configured');
console.log(`📝 Environment: ${env}\n`);
