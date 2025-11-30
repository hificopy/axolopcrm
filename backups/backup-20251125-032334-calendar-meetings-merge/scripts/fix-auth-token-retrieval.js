#!/usr/bin/env node

/**
 * Script to fix incorrect localStorage token retrieval across all frontend pages
 * Replaces direct localStorage.getItem('supabase.auth.token') with proper API wrapper usage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files that need to be fixed (from grep results)
const filesToFix = [
  'frontend/pages/TodoList.jsx',
  'frontend/pages/Inbox.jsx',
  'frontend/pages/Activities.jsx',
  'frontend/pages/EmailMarketing.jsx',
  'frontend/pages/Pipeline.jsx',
  'frontend/pages/Opportunities.jsx',
  'frontend/pages/Contacts.jsx',
  'frontend/pages/MyWork.jsx',
  'frontend/pages/CreateCampaign.jsx',
  'frontend/pages/CustomFieldsSettings.jsx',
  'frontend/pages/History.jsx',
  'frontend/components/LeadImportModal.jsx',
  'frontend/components/CreateLeadModal.jsx',
  'frontend/components/CreateContactModal.jsx',
  'frontend/components/ComposeEmailModal.jsx',
  'frontend/components/EnhancedLeadImportModal.jsx',
];

// API mappings for different resources
const apiMappings = {
  '/api/contacts': { api: 'contactsApi', methods: { GET: 'getAll', POST: 'create' } },
  '/api/leads': { api: 'leadsApi', methods: { GET: 'getAll', POST: 'create' } },
  '/api/activities': { api: 'activitiesApi', methods: { GET: 'getAll' } },
  '/api/opportunities': { api: 'dealsApi', methods: { GET: 'getAll', POST: 'create' } },
  '/api/email-campaigns': { api: 'emailCampaignsApi', methods: { GET: 'getAll', POST: 'create' } },
  '/api/workflows': { api: 'workflowsApi', methods: { GET: 'getAll' } },
  '/api/tasks': { api: 'tasksApi', methods: { GET: 'getAll', POST: 'create' } },
  '/api/forms': { api: 'formsApi', methods: { GET: 'getAll', POST: 'create' } },
};

console.log('🔧 Starting auth token fix script...\n');

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Count occurrences before fix
  const occurrences = (content.match(/localStorage\.getItem\('supabase\.auth\.token'\)/g) || []).length;

  if (occurrences === 0) {
    console.log(`✓ ${file} - Already fixed`);
    return;
  }

  console.log(`📝 Processing ${file} (${occurrences} occurrences)...`);

  // Remove API_BASE_URL constant if it exists and isn't used elsewhere
  const hasApiBaseUrl = content.includes('const API_BASE_URL');
  const apiBaseUrlUsages = (content.match(/API_BASE_URL/g) || []).length;

  // Replace axios imports with API wrapper imports
  if (content.includes("import axios from 'axios'")) {
    // Check which APIs are used in this file
    const usedApis = [];
    Object.entries(apiMappings).forEach(([endpoint, config]) => {
      if (content.includes(endpoint)) {
        usedApis.push(config.api);
      }
    });

    if (usedApis.length > 0) {
      const uniqueApis = [...new Set(usedApis)];
      const apiImports = uniqueApis.join(', ');

      // Replace or augment axios import
      if (content.match(/import axios from 'axios';/)) {
        content = content.replace(
          /import axios from 'axios';/,
          `import { ${apiImports} } from '@/lib/api';`
        );
        modified = true;
      }
    }
  }

  // Fix fetch patterns with localStorage token
  // Pattern 1: axios.get with manual token
  content = content.replace(
    /const token = localStorage\.getItem\('supabase\.auth\.token'\);\s*const response = await axios\.get\(`\$\{API_BASE_URL\}(\/api\/\w+)`[^)]*\{[^}]*headers:[^}]*Authorization:[^}]*`Bearer \$\{token\}`[^}]*\}[^)]*\)/g,
    (match, endpoint) => {
      const mapping = apiMappings[endpoint];
      if (mapping) {
        modified = true;
        return `const response = await ${mapping.api}.getAll()`;
      }
      return match;
    }
  );

  // Pattern 2: Simple axios calls with token
  content = content.replace(
    /localStorage\.getItem\('supabase\.auth\.token'\)/g,
    () => {
      // This is a fallback - log a warning
      console.log(`  ⚠️  Manual replacement needed for complex pattern`);
      return `localStorage.getItem('supabase.auth.token') /* TODO: Use API wrapper */`;
    }
  );

  // Remove API_BASE_URL if only used in replaced axios calls
  if (hasApiBaseUrl && apiBaseUrlUsages <= 2 && modified) {
    content = content.replace(
      /const API_BASE_URL = import\.meta\.env\.VITE_API_BASE_URL \|\| 'http:\/\/localhost:3002';\n\n/,
      ''
    );
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✓ Fixed ${file}`);
  } else {
    console.log(`  ⚠️  ${file} - Manual review needed`);
  }
});

console.log('\n✅ Script complete!');
console.log('\n📋 Next steps:');
console.log('  1. Review modified files');
console.log('  2. Test each page to ensure auth works');
console.log('  3. Remove any remaining localStorage.getItem calls');
console.log('  4. Run: npm run build to verify no errors\n');
