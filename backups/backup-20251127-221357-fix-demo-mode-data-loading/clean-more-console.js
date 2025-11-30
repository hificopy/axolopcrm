#!/usr/bin/env node

import fs from "fs";
import path from "path";

// Additional files to clean up
const additionalFiles = [
  "frontend/services/enhanced-dashboard-data-service.js",
  "frontend/services/supabase-singleton.js",
  "frontend/services/calendarService.js",
  "frontend/services/homePresetService.js",
  "frontend/services/dashboardPresetService.js",
  "frontend/utils/lazy-loading.js",
  "frontend/utils/ux-enhancements.js",
];

let totalRemoved = 0;

additionalFiles.forEach((filePath) => {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${fullPath}`);
    return;
  }

  console.log(`🧹 Cleaning: ${filePath}`);

  let content = fs.readFileSync(fullPath, "utf8");
  const originalLength = content.length;

  // Remove console.log, console.error, console.warn, console.debug
  // But keep console.error in error handlers and critical logs
  content = content.replace(/console\.log\([^)]*\);?/g, "// console.log$1");
  content = content.replace(/console\.debug\([^)]*\);?/g, "// console.debug$1");
  content = content.replace(/console\.info\([^)]*\);?/g, "// console.info$1");

  // Remove console.warn but keep error handling ones
  content = content.replace(/console\.warn\([^)]*\);?/g, "// console.warn$1");

  // Keep console.error only in try-catch blocks and error handlers
  const lines = content.split("\n");
  let inTryBlock = false;
  let inErrorHandler = false;

  const cleanedLines = lines.map((line, index) => {
    // Track if we're in error handling context
    if (
      line.includes("catch") ||
      line.includes("error") ||
      line.includes("Error")
    ) {
      inErrorHandler = true;
    }

    // Remove console.error unless it's in error handling
    if (line.includes("console.error")) {
      if (inErrorHandler || inTryBlock) {
        inErrorHandler = false;
        return line; // Keep error logs in error handlers
      } else {
        return line.replace(/console\.error\([^)]*\);?/, "// console.error$1");
      }
    }

    // Reset error handler flag
    if (line.trim() === "" || line.includes("}")) {
      inErrorHandler = false;
    }

    return line;
  });

  content = cleanedLines.join("\n");

  const removed = originalLength - content.length;
  totalRemoved += removed;

  if (removed > 0) {
    fs.writeFileSync(fullPath, content);
    console.log(`   ✅ Removed ${removed} characters from ${filePath}`);
  } else {
    console.log(`   ✅ Already clean: ${filePath}`);
  }
});

console.log(
  `\n🎯 Additional console statements removed: ${totalRemoved} characters`,
);
console.log("✅ Additional console logging cleanup complete!");
