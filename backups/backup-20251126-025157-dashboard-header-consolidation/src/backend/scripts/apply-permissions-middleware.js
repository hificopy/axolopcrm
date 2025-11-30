#!/usr/bin/env node

/**
 * Script to apply permission middleware to route files
 * This adds extractAgencyContext and requireEditPermissions to POST/PUT/DELETE routes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route files to update
const routeFiles = [
  'leads.js',
  'opportunities.js',
  'activities.js',
  'forms.js',
  'user-preferences.js'
];

const routesDir = path.join(__dirname, '../routes');

// Process each file
for (const file of routeFiles) {
  const filePath = path.join(routesDir, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    continue;
  }

  console.log(`📝 Processing ${file}...`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Step 1: Add imports if not already present
  if (!content.includes('extractAgencyContext')) {
    // Find the authMiddleware import line
    const authMiddlewareRegex = /import \{ protect \} from ['"]\.\.\/middleware\/authMiddleware\.js['"];/;

    if (authMiddlewareRegex.test(content)) {
      content = content.replace(
        authMiddlewareRegex,
        `import { protect } from '../middleware/authMiddleware.js';\nimport { extractAgencyContext, requireEditPermissions } from '../middleware/agency-access.js';`
      );
      modified = true;
      console.log(`  ✓ Added middleware imports`);
    }
  }

  // Step 2: Add router.use(extractAgencyContext) after router declaration
  if (!content.includes('router.use(extractAgencyContext)')) {
    const routerDeclaration = 'const router = express.Router();';
    if (content.includes(routerDeclaration)) {
      content = content.replace(
        routerDeclaration,
        `${routerDeclaration}\n\n// Apply agency context extraction to all routes\nrouter.use(extractAgencyContext);`
      );
      modified = true;
      console.log(`  ✓ Added router.use(extractAgencyContext)`);
    }
  }

  // Step 3: Add requireEditPermissions to POST/PUT/DELETE routes
  // Find all POST/PUT/DELETE routes and add requireEditPermissions middleware

  // Match: router.post('...', protect, async (req, res)
  // Replace with: router.post('...', protect, requireEditPermissions, async (req, res)
  const postRouteRegex = /router\.(post|put|delete)\(([^,]+),\s*protect,\s*async\s*\(/g;

  if (content.match(postRouteRegex)) {
    content = content.replace(
      postRouteRegex,
      (match, method, route) => {
        if (match.includes('requireEditPermissions')) {
          return match; // Already has the middleware
        }
        return `router.${method}(${route}, protect, requireEditPermissions, async (`;
      }
    );
    modified = true;
    console.log(`  ✓ Added requireEditPermissions to modification routes`);
  }

  // Write back if modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${file} updated successfully\n`);
  } else {
    console.log(`⏭️  ${file} already up to date\n`);
  }
}

console.log('🎉 All route files processed!');
