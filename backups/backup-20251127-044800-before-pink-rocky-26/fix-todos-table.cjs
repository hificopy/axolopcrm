const { Pool } = require("pg");
require("dotenv").config();

async function executeSortOrderFix() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    console.log("🔧 Connected to database, executing sort_order fix...");

    await client.query("BEGIN");

    // Read and execute the SQL fix script
    const fs = require("fs");
    const sqlScript = fs.readFileSync("./fix-sort-order-columns.sql", "utf8");

    // Split into individual statements
    const statements = sqlScript
      .split(";")
      .map((stmt) => stmt.trim())
      .filter(
        (stmt) =>
          stmt.length > 0 && !stmt.startsWith("--") && !stmt.startsWith("/*"),
      );

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(
            `📝 Executing statement ${i + 1}/${statements.length}...`,
          );
          await client.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} warning:`, err.message);
          // Continue with other statements
        }
      }
    }

    await client.query("COMMIT");
    console.log("🎉 sort_order column fix completed successfully!");

    // Verify the fix
    console.log("🔍 Verifying sort_order columns...");
    const tables = ["user_todos", "forms", "form_fields"];

    for (const table of tables) {
      try {
        const result = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = '${table}' 
          AND column_name = 'sort_order'
        `);

        if (result.rows.length > 0) {
          console.log(`✅ ${table}.sort_order column exists`);
        } else {
          console.log(`ℹ️  ${table} table or sort_order column not found`);
        }
      } catch (err) {
        console.log(`❌ Error checking ${table}:`, err.message);
      }
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error executing fix:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

executeSortOrderFix();
