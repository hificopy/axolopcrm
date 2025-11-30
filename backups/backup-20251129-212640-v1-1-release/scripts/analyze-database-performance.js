/**
 * Database Performance Analysis Script
 * Analyzes and optimizes database performance
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://fuclpfhitgwugxogxkmw.supabase.co";
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Y2xwZmhpdGd3dWd4b2d4a213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTI4MDEsImV4cCI6MjA3ODQ2ODgwMX0.XkKf0_PYuD-fWNMw-AMyDaO9bfugUBiRXG8dV53WiIA";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyzeDatabasePerformance() {
  console.log("🔍 Starting database performance analysis...");

  try {
    // Test query performance
    const testQueries = [
      {
        name: "contacts_query",
        query: () => supabase.from("contacts").select("*").limit(100),
      },
      {
        name: "leads_query",
        query: () => supabase.from("leads").select("*").limit(100),
      },
      {
        name: "users_query",
        query: () => supabase.from("users").select("*").limit(100),
      },
    ];

    console.log("⚡ Testing query performance...");
    const performanceResults = {};

    for (const test of testQueries) {
      const startTime = performance.now();

      try {
        await test.query();
        const endTime = performance.now();
        const duration = endTime - startTime;

        performanceResults[test.name] = duration;
        console.log(`  ${test.name}: ${duration.toFixed(2)}ms`);

        if (duration > 1000) {
          console.log(`    ⚠️  SLOW QUERY DETECTED`);
        }
      } catch (error) {
        console.error(`  ${test.name} failed:`, error.message);
        performanceResults[test.name] = "ERROR";
      }
    }

    // Generate recommendations
    const recommendations = [];

    Object.entries(performanceResults).forEach(([query, duration]) => {
      if (typeof duration === "number" && duration > 1000) {
        recommendations.push({
          type: "query_optimization",
          priority: "high",
          query,
          description: `Optimize ${query} - taking ${duration.toFixed(2)}ms`,
          suggestion: "Add database indexes or limit result sets",
        });
      }
    });

    // Check for common performance issues
    recommendations.push(
      {
        type: "index_optimization",
        priority: "high",
        description: "Add indexes to frequently queried columns",
        suggestion:
          "CREATE INDEX idx_contacts_created_at ON contacts(created_at);",
      },
      {
        type: "connection_pooling",
        priority: "medium",
        description: "Implement connection pooling for better performance",
        suggestion: "Configure connection pool in Supabase settings",
      },
      {
        type: "query_limiting",
        priority: "medium",
        description: "Implement proper query limiting and pagination",
        suggestion: "Add LIMIT and OFFSET to all list queries",
      },
    );

    console.log("\n🎯 Optimization Recommendations:");
    recommendations.forEach((rec, index) => {
      console.log(
        `\n${index + 1}. [${rec.priority.toUpperCase()}] ${rec.type}`,
      );
      console.log(`   Description: ${rec.description}`);
      console.log(`   Suggestion: ${rec.suggestion}`);
    });

    // Save analysis results
    const analysisResults = {
      timestamp: new Date().toISOString(),
      performance: performanceResults,
      recommendations,
      summary: {
        totalQueries: Object.keys(performanceResults).length,
        slowQueries: Object.values(performanceResults).filter(
          (d) => typeof d === "number" && d > 1000,
        ).length,
        recommendations: recommendations.length,
      },
    };

    console.log("\n📊 Analysis Summary:");
    console.log(
      `  Total Queries Tested: ${analysisResults.summary.totalQueries}`,
    );
    console.log(`  Slow Queries Found: ${analysisResults.summary.slowQueries}`);
    console.log(
      `  Recommendations Generated: ${analysisResults.summary.recommendations}`,
    );

    return analysisResults;
  } catch (error) {
    console.error("❌ Database analysis failed:", error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    const results = await analyzeDatabasePerformance();
    console.log("\n✅ Database performance analysis complete");
    console.log("📄 Results available in memory for further processing");
    return results;
  } catch (error) {
    console.error("❌ Analysis failed:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}

export { analyzeDatabasePerformance };
