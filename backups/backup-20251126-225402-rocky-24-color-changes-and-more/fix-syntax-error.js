#!/usr/bin/env node

/**
 * Fix syntax error in comprehensive-system-fix.js
 * The issue is with .replace() method calls having identical old and new strings
 */

import fs from "fs";

const filePath =
  "/Users/jdromeroherrera/Desktop/CODE/axolopcrm/website/comprehensive-system-fix.js";

try {
  console.log("🔧 Fixing syntax error in comprehensive-system-fix.js...");

  // Read the file
  let content = fs.readFileSync(filePath, "utf8");

  // Fix the problematic .replace() calls by using a different approach
  // Replace all instances of the problematic pattern with a single call
  const fixedContent = content.replace(
    /# VITE_CALENDAR_PUBLIC_KEY=your_calendar_public_key_here/g,
    "# VITE_CALENDAR_PUBLIC_KEY=your_calendar_public_key_here'\n",
  );

  // Write the fixed content back
  fs.writeFileSync(filePath, fixedContent);

  console.log("✅ Fixed syntax error in comprehensive-system-fix.js");
  console.log("🚀 Now run: node comprehensive-system-fix.js");
} catch (error) {
  console.error("❌ Failed to fix file:", error.message);
  process.exit(1);
}
