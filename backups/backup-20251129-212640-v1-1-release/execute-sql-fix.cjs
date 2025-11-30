const fs = require("fs");
const path = require("path");

// Create a temporary API endpoint to execute the SQL fix
async function executeSQLFix() {
  try {
    console.log("🔧 Creating SQL fix endpoint...");

    // Read the SQL fix script
    const sqlScript = fs.readFileSync("./fix-sort-order-columns.sql", "utf8");

    // Create a temporary backend script to execute the SQL
    const tempScript = `
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function executeFix() {
  try {
    console.log('🚀 Executing sort_order column fix...');
    
    // Direct SQL execution using raw PostgreSQL connection
    const { Pool } = require('pg');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
    });
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Execute the SQL script
      await client.query(sqlScript);
      
      await client.query('COMMIT');
      console.log('✅ sort_order column fix completed successfully!');
      
      // Verify the fix
      const tables = ['user_todos', 'forms', 'form_fields'];
      
      for (const table of tables) {
        const result = await client.query(\`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = '\${table}' 
          AND column_name = 'sort_order'
        \`);
        
        if (result.rows.length > 0) {
          console.log(\`✅ \${table}.sort_order column exists\`);
        } else {
          console.log(\`ℹ️  \${table} table or sort_order column not found\`);
        }
      }
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error executing SQL:', error.message);
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

executeFix();
`;

    fs.writeFileSync("./temp-sql-fix.cjs", tempScript);

    console.log("🚀 Executing SQL fix via backend...");

    // Execute the temporary script
    const { execSync } = require("child_process");
    try {
      const output = execSync("node temp-sql-fix.cjs", {
        encoding: "utf8",
        cwd: process.cwd(),
      });
      console.log(output);
    } catch (error) {
      console.log("Script execution output:", error.stdout || error.message);
    }

    // Clean up
    fs.unlinkSync("./temp-sql-fix.cjs");

    console.log("🎉 SQL fix process completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

executeSQLFix();
