/**
 * Backend Service Consistency Checker
 * Analyzes backend services for consistency and best practices
 */

import fs from "fs";
import path from "path";

const servicesDir = "./backend/services";

function analyzeServiceConsistency() {
  console.log("🔍 Analyzing backend service consistency...");

  const issues = [];
  const recommendations = [];

  try {
    const serviceFiles = fs
      .readdirSync(servicesDir)
      .filter((file) => file.endsWith(".js"))
      .map((file) => path.join(servicesDir, file));

    console.log(`📋 Found ${serviceFiles.length} service files`);

    for (const serviceFile of serviceFiles) {
      const content = fs.readFileSync(serviceFile, "utf8");
      const serviceName = path.basename(serviceFile, ".js");

      console.log(`\n📄 Analyzing ${serviceName}...`);

      // Check for common issues
      analyzeServiceFile(content, serviceName, issues, recommendations);
    }

    // Generate summary
    console.log("\n🎯 Service Analysis Summary:");
    console.log(`  Total Issues Found: ${issues.length}`);
    console.log(`  Total Recommendations: ${recommendations.length}`);

    // Categorize issues
    const issueCategories = {
      errorHandling: issues.filter((i) => i.category === "error_handling"),
      validation: issues.filter((i) => i.category === "validation"),
      performance: issues.filter((i) => i.category === "performance"),
      security: issues.filter((i) => i.category === "security"),
      consistency: issues.filter((i) => i.category === "consistency"),
    };

    Object.entries(issueCategories).forEach(([category, categoryIssues]) => {
      if (categoryIssues.length > 0) {
        console.log(
          `\n  ${category.toUpperCase()}: ${categoryIssues.length} issues`,
        );
        categoryIssues.forEach((issue) => {
          console.log(`    - ${issue.description}`);
        });
      }
    });

    // Generate recommendations
    console.log("\n🎯 Recommendations:");
    recommendations.forEach((rec, index) => {
      console.log(
        `\n${index + 1}. [${rec.priority.toUpperCase()}] ${rec.type}`,
      );
      console.log(`   Description: ${rec.description}`);
      console.log(`   File: ${rec.file}`);
      if (rec.codeExample) {
        console.log(`   Example: ${rec.codeExample}`);
      }
    });

    return {
      timestamp: new Date().toISOString(),
      totalServices: serviceFiles.length,
      issues,
      recommendations,
      summary: {
        totalIssues: issues.length,
        criticalIssues: issues.filter((i) => i.severity === "critical").length,
        highIssues: issues.filter((i) => i.severity === "high").length,
        mediumIssues: issues.filter((i) => i.severity === "medium").length,
        lowIssues: issues.filter((i) => i.severity === "low").length,
      },
    };
  } catch (error) {
    console.error("❌ Service analysis failed:", error);
    throw error;
  }
}

function analyzeServiceFile(content, serviceName, issues, recommendations) {
  // Check for proper error handling
  if (!content.includes("try {") || !content.includes("catch")) {
    issues.push({
      file: serviceName,
      category: "error_handling",
      severity: "high",
      description: "Missing try-catch blocks",
      line: null,
    });
  }

  // Check for input validation
  if (!content.includes("validation") && !content.includes("zod")) {
    issues.push({
      file: serviceName,
      category: "validation",
      severity: "medium",
      description: "Missing input validation",
      line: null,
    });

    recommendations.push({
      type: "validation",
      priority: "high",
      description: "Add input validation using Zod",
      file: serviceName,
      codeExample: 'import { z } from "zod";',
    });
  }

  // Check for logging
  if (!content.includes("console.error") && !content.includes("logger")) {
    issues.push({
      file: serviceName,
      category: "consistency",
      severity: "medium",
      description: "Missing error logging",
      line: null,
    });
  }

  // Check for async/await usage
  if (content.includes("async ") && !content.includes("await ")) {
    issues.push({
      file: serviceName,
      category: "consistency",
      severity: "high",
      description: "Async function without await",
      line: null,
    });
  }

  // Check for proper exports
  if (
    !content.includes("export default") &&
    !content.includes("module.exports")
  ) {
    issues.push({
      file: serviceName,
      category: "consistency",
      severity: "high",
      description: "Missing proper export",
      line: null,
    });
  }

  // Check for database connection handling
  if (content.includes("supabase") && !content.includes("error")) {
    issues.push({
      file: serviceName,
      category: "error_handling",
      severity: "high",
      description: "Database operations without error handling",
      line: null,
    });
  }

  // Check for response standardization
  if (!content.includes("success") && !content.includes("error")) {
    recommendations.push({
      type: "response_format",
      priority: "medium",
      description: "Standardize response format with success/error structure",
      file: serviceName,
      codeExample: "return { success: true, data: result };",
    });
  }
}

// Main execution
async function main() {
  try {
    const results = await analyzeServiceConsistency();
    console.log("\n✅ Backend service analysis complete");
    return results;
  } catch (error) {
    console.error("❌ Analysis failed:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}

export { analyzeServiceConsistency };
