// Temporary API endpoint to execute SQL fix
// This will be added to the backend temporarily

const express = require("express");
const { Pool } = require("pg");
const router = express.Router();

// POST /api/temp/fix-sort-order
router.post("/fix-sort-order", async (req, res) => {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Read SQL fix script
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

      const results = [];

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            await client.query(statement);
            results.push({ statement: i + 1, status: "success" });
          } catch (err) {
            results.push({
              statement: i + 1,
              status: "error",
              error: err.message,
            });
          }
        }
      }

      await client.query("COMMIT");

      // Verify the fix
      const verification = {};
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

          verification[table] = result.rows.length > 0;
        } catch (err) {
          verification[table] = false;
        }
      }

      res.json({
        success: true,
        message: "sort_order column fix completed",
        results,
        verification,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error("Error executing sort_order fix:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
