#!/usr/bin/env node

import fs from "fs";

// Read App.jsx
const content = fs.readFileSync("./frontend/App.jsx", "utf8");

// Extract all imports
const importRegex = /^import\s+.*?\s+from\s+["']([^"']+)["'];?$/gm;
const imports = [];
let match;

while ((match = importRegex.exec(content)) !== null) {
  const importPath = match[1];
  const importLine = match[0];

  // Get the component name (last part after /)
  const componentName = importPath
    .split("/")
    .pop()
    .replace(/\.(jsx?)/, "");

  imports.push({
    path: importPath,
    name: componentName,
    line: importLine,
  });
}

console.log("Found imports:", imports.length);

// Check which imports are actually used
const unusedImports = [];

for (const imp of imports) {
  // Skip React and utility imports
  if (
    imp.path.startsWith("react") ||
    imp.path.startsWith("react-router-dom") ||
    imp.path.startsWith("framer-motion") ||
    imp.name.startsWith("use") ||
    imp.name === "Routes" ||
    imp.name === "Route" ||
    imp.name === "Navigate" ||
    imp.name === "AnimatePresence" ||
    imp.name === "motion" ||
    imp.name === "MainLayout" ||
    imp.name === "ProtectedRoute" ||
    imp.name === "FullPageLoader" ||
    imp.name === "Toaster" ||
    imp.name === "ErrorBoundary"
  ) {
    continue;
  }

  // Count occurrences in the file
  const regex = new RegExp(`\\b${imp.name}\\b`, "g");
  const occurrences = (content.match(regex) || []).length;

  // Subtract 1 for the import itself
  const actualUsage = occurrences - 1;

  if (actualUsage === 0) {
    unusedImports.push(imp);
  }
}

console.log("\nUnused imports:");
unusedImports.forEach((imp) => {
  console.log(`- ${imp.name} from "${imp.path}"`);
});

console.log(`\nTotal unused imports: ${unusedImports.length}`);
