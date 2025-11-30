#!/usr/bin/env node
/**
 * Simple Database Migration Script
 * Uses direct SQL execution via Supabase SQL file approach
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting simple database migration...");
console.log(
  "📋 This script will create a migration file you can run in Supabase SQL Editor",
);

try {
  // Read the comprehensive schema file
  const schemaPath = path.join(
    __dirname,
    "../COMPREHENSIVE_DATABASE_SCHEMA_ALL_TABLES.sql",
  );
  const schemaSQL = fs.readFileSync(schemaPath, "utf8");

  console.log("📄 Reading comprehensive schema file...");
  console.log(`📊 Schema file size: ${schemaSQL.length} characters`);

  // Create a migration file with timestamp
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .split(".")[0];
  const migrationFileName = `migration-${timestamp}-comprehensive-schema.sql`;
  const migrationPath = path.join(__dirname, migrationFileName);

  // Add header to migration file
  const migrationSQL = `-- ============================================
-- COMPREHENSIVE DATABASE MIGRATION
-- Generated: ${new Date().toISOString()}
-- Purpose: Create all missing database tables
-- ============================================

${schemaSQL}

-- ============================================
-- MIGRATION COMPLETE
-- ============================================`;

  // Write migration file
  fs.writeFileSync(migrationPath, migrationSQL);

  console.log(`✅ Migration file created: ${migrationFileName}`);
  console.log(`📂 File location: ${migrationPath}`);
  console.log("\n📋 Next Steps:");
  console.log("1. Open Supabase Dashboard");
  console.log("2. Go to SQL Editor");
  console.log(`3. Copy and paste the contents of ${migrationFileName}`);
  console.log('4. Click "Run" to execute the migration');
  console.log("\n⚠️  Important Notes:");
  console.log("- This migration is idempotent (safe to run multiple times)");
  console.log("- It will create ~110+ missing tables");
  console.log("- Includes proper indexes and constraints");
  console.log("- Enables user isolation and RLS policies");

  // Also create a quick verification script
  const verificationSQL = `-- ============================================
-- TABLE VERIFICATION SCRIPT
-- Run this after migration to verify tables
-- ============================================

SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Critical tables to verify:
SELECT 'user_todos' as table_name, COUNT(*) as count FROM user_todos
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL  
SELECT 'agencies' as table_name, COUNT(*) as count FROM agencies
UNION ALL
SELECT 'forms' as table_name, COUNT(*) as count FROM forms
UNION ALL
SELECT 'form_submissions' as table_name, COUNT(*) as count FROM form_submissions;
`;

  const verificationFileName = `verification-${timestamp}.sql`;
  const verificationPath = path.join(__dirname, verificationFileName);
  fs.writeFileSync(verificationPath, verificationSQL);

  console.log(`✅ Verification script created: ${verificationFileName}`);
  console.log("\n🎉 Migration preparation completed!");
  console.log("📯 You are now ready to update the database schema.");
} catch (error) {
  console.error("❌ Failed to create migration files:", error.message);
  process.exit(1);
}
