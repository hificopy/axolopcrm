#!/usr/bin/env node

/**
 * Monday Table System - Integration Test
 *
 * Verifies that all components of the Monday.com-inspired table system
 * are properly installed and configured.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('\n🧪 Monday Table System - Integration Test\n');
console.log('=' .repeat(60));

let passed = 0;
let failed = 0;

function test(description, condition) {
  if (condition) {
    console.log(`✅ ${description}`);
    passed++;
  } else {
    console.log(`❌ ${description}`);
    failed++;
  }
}

function fileExists(filePath) {
  const fullPath = path.join(rootDir, filePath);
  return fs.existsSync(fullPath);
}

function fileContains(filePath, searchString) {
  const fullPath = path.join(rootDir, filePath);
  if (!fs.existsSync(fullPath)) return false;
  const content = fs.readFileSync(fullPath, 'utf-8');
  return content.includes(searchString);
}

console.log('\n📁 File Structure Tests\n');

// Frontend component files
test('MondayTable.jsx exists', fileExists('frontend/components/MondayTable/MondayTable.jsx'));
test('MondayTable.css exists', fileExists('frontend/components/MondayTable/MondayTable.css'));
test('TableRow.jsx exists', fileExists('frontend/components/MondayTable/TableRow.jsx'));
test('GroupHeader.jsx exists', fileExists('frontend/components/MondayTable/GroupHeader.jsx'));
test('StatusDropdown.jsx exists', fileExists('frontend/components/MondayTable/StatusDropdown.jsx'));
test('PriorityDropdown.jsx exists', fileExists('frontend/components/MondayTable/PriorityDropdown.jsx'));
test('RowActionsMenu.jsx exists', fileExists('frontend/components/MondayTable/RowActionsMenu.jsx'));
test('ColumnTypes.jsx exists', fileExists('frontend/components/MondayTable/ColumnTypes.jsx'));
test('MondayTable index.js exists', fileExists('frontend/components/MondayTable/index.js'));

// Backend files
test('tasks.js routes exist', fileExists('backend/routes/tasks.js'));
test('tasks-schema.sql exists', fileExists('scripts/tasks-schema.sql'));

// Documentation
test('MONDAY_TABLE_SYSTEM.md exists', fileExists('docs/features/MONDAY_TABLE_SYSTEM.md'));

console.log('\n🔧 Configuration Tests\n');

// Backend routes registration
test('Tasks routes imported in backend/index.js', fileContains('backend/index.js', "import tasksRoutes from './routes/tasks.js'"));
test('Tasks routes registered at /api/tasks', fileContains('backend/index.js', "app.use(`${apiPrefix}/tasks', tasksRoutes)") || fileContains('backend/index.js', "app.use('/api/tasks', tasksRoutes)"));

// MyWork page integration
test('MyWork imports MondayTable', fileContains('frontend/pages/MyWork.jsx', "import { MondayTable } from '@/components/MondayTable'"));
test('MyWork uses MondayTable component', fileContains('frontend/pages/MyWork.jsx', '<MondayTable'));

console.log('\n🎨 Component Integrity Tests\n');

// MondayTable component
test('MondayTable exports default', fileContains('frontend/components/MondayTable/MondayTable.jsx', 'export default function MondayTable'));
test('MondayTable has search functionality', fileContains('frontend/components/MondayTable/MondayTable.jsx', 'enableSearch'));
test('MondayTable has bulk actions', fileContains('frontend/components/MondayTable/MondayTable.jsx', 'enableBulkActions'));
test('MondayTable has grouping', fileContains('frontend/components/MondayTable/MondayTable.jsx', 'enableGroups'));

// CSS styling
test('CSS has Axolop branding colors', fileContains('frontend/components/MondayTable/MondayTable.css', '--axolop-primary: #791C14'));
test('CSS has animations', fileContains('frontend/components/MondayTable/MondayTable.css', '@keyframes fadeInUp'));
test('CSS has accessibility support', fileContains('frontend/components/MondayTable/MondayTable.css', 'prefers-reduced-motion'));

// Column types
test('ColumnTypes has renderCell function', fileContains('frontend/components/MondayTable/ColumnTypes.jsx', 'export function renderCell'));
test('ColumnTypes supports status type', fileContains('frontend/components/MondayTable/ColumnTypes.jsx', 'StatusCell'));
test('ColumnTypes supports priority type', fileContains('frontend/components/MondayTable/ColumnTypes.jsx', 'PriorityCell'));

// Dropdowns
test('StatusDropdown has status options', fileContains('frontend/components/MondayTable/StatusDropdown.jsx', 'STATUS_OPTIONS'));
test('PriorityDropdown has priority options', fileContains('frontend/components/MondayTable/PriorityDropdown.jsx', 'PRIORITY_OPTIONS'));

console.log('\n🔌 Backend Integration Tests\n');

// API routes
test('Tasks API has GET endpoint', fileContains('backend/routes/tasks.js', "router.get('/'"));
test('Tasks API has POST endpoint', fileContains('backend/routes/tasks.js', "router.post('/'"));
test('Tasks API has PATCH endpoint', fileContains('backend/routes/tasks.js', "router.patch('/:id'"));
test('Tasks API has DELETE endpoint', fileContains('backend/routes/tasks.js', "router.delete('/:id'"));
test('Tasks API has bulk delete', fileContains('backend/routes/tasks.js', "router.post('/bulk-delete'"));

// Database schema
test('Schema creates tasks table', fileContains('scripts/tasks-schema.sql', 'CREATE TABLE IF NOT EXISTS tasks'));
test('Schema has user_id foreign key', fileContains('scripts/tasks-schema.sql', 'user_id UUID NOT NULL'));
test('Schema has RLS enabled', fileContains('scripts/tasks-schema.sql', 'ENABLE ROW LEVEL SECURITY'));
test('Schema has indexes', fileContains('scripts/tasks-schema.sql', 'CREATE INDEX'));

console.log('\n📊 Integration Tests\n');

// MyWork page integration
test('MyWork has fetchTasks function', fileContains('frontend/pages/MyWork.jsx', 'const fetchTasks'));
test('MyWork has handleAddTask function', fileContains('frontend/pages/MyWork.jsx', 'const handleAddTask'));
test('MyWork has handleCellEdit function', fileContains('frontend/pages/MyWork.jsx', 'const handleCellEdit'));
test('MyWork has handleDelete function', fileContains('frontend/pages/MyWork.jsx', 'const handleDelete'));
test('MyWork has handleBulkDelete function', fileContains('frontend/pages/MyWork.jsx', 'const handleBulkDelete'));
test('MyWork has column configuration', fileContains('frontend/pages/MyWork.jsx', 'const columns'));
test('MyWork has grouping logic', fileContains('frontend/pages/MyWork.jsx', 'const groupTasks'));

console.log('\n📚 Documentation Tests\n');

test('Documentation has overview section', fileContains('docs/features/MONDAY_TABLE_SYSTEM.md', '## Overview'));
test('Documentation has quick start', fileContains('docs/features/MONDAY_TABLE_SYSTEM.md', 'Quick Start'));
test('Documentation has column types', fileContains('docs/features/MONDAY_TABLE_SYSTEM.md', 'Column Configuration'));
test('Documentation has backend integration', fileContains('docs/features/MONDAY_TABLE_SYSTEM.md', 'Backend Integration'));
test('Documentation has use cases', fileContains('docs/features/MONDAY_TABLE_SYSTEM.md', 'Use Cases'));
test('Documentation has troubleshooting', fileContains('docs/features/MONDAY_TABLE_SYSTEM.md', 'Troubleshooting'));

console.log('\n' + '='.repeat(60));
console.log('\n📈 Test Results\n');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total:  ${passed + failed}`);
console.log(`🎯 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! Monday Table System is ready for deployment.\n');
  console.log('📋 Next Steps:');
  console.log('   1. Deploy database schema: Run scripts/tasks-schema.sql in Supabase');
  console.log('   2. Start the development server: npm run dev');
  console.log('   3. Navigate to /my-work to test the table');
  console.log('   4. Test CRUD operations (create, edit, delete tasks)');
  console.log('   5. Test bulk actions (select multiple, bulk delete)');
  console.log('   6. Test search and filtering');
  console.log('   7. Test grouping functionality\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the issues above.\n');
  process.exit(1);
}
