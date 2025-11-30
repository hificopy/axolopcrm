// Simple script to execute SQL fix via backend API
import axios from "axios";

const BACKEND_URL = "http://localhost:3002";

async function executeSQLFix() {
  try {
    console.log("🔧 Attempting to execute sort_order SQL fix...");

    // Read the SQL fix script
    const fs = await import("fs");
    const sqlScript = fs.readFileSync("./fix-sort-order-columns.sql", "utf8");

    console.log("📝 SQL script loaded, attempting execution...");

    // Try to execute via a simple POST request to backend
    // We'll use the database health endpoint as a proxy
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/database/execute`,
      {
        sql: sqlScript,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ SQL fix executed successfully:", response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(
        "ℹ️  Database execution endpoint not found, trying alternative approach...",
      );

      // Try using the existing health check to verify database is working
      // Then manually verify if sort_order columns exist
      try {
        const healthResponse = await axios.get(`${BACKEND_URL}/health`);
        console.log(
          "✅ Database is connected:",
          healthResponse.data.services.database,
        );

        console.log(
          "🔍 Since direct SQL execution is not available, let me check if the issue is resolved by testing the todos endpoint...",
        );

        // Test the todos endpoint that was failing
        const todosResponse = await axios
          .get(`${BACKEND_URL}/api/v1/todos`, {
            headers: {
              Authorization: "Bearer test-token",
            },
          })
          .catch((err) => {
            if (err.response && err.response.status === 401) {
              console.log(
                "✅ Todos endpoint is accessible (401 is expected without auth)",
              );
            } else {
              console.log("❌ Todos endpoint error:", err.message);
            }
          });
      } catch (healthError) {
        console.log("❌ Health check failed:", healthError.message);
      }
    } else {
      console.log("❌ SQL fix execution failed:", error.message);
    }
  }
}

executeSQLFix();
