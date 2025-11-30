#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * Script to check for common component naming typos in JSX files
 * This helps prevent issues like "IntegrationSettings" vs "IntegrationsSettings"
 */
function checkComponentTypos() {
  const projectDir = './frontend';
  const errors = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && !file.startsWith('.')) {
          scanDirectory(filePath);
        }
      } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
        checkFileForTypos(filePath);
      }
    }
  }
  
  function checkFileForTypos(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Patterns that might indicate component naming issues
    const componentPattern = /<([A-Z][A-Za-z0-9]*)[^>]*>/g;
    const closingComponentPattern = /<\/([A-Z][A-Za-z0-9]*)[^>]*>/g;
    const elementPattern = /\b([A-Z][A-Za-z0-9]*)\s*:\s*<[^>]*>/g;
    
    // Check for likely component names that could be typos
    const potentialTypos = [
      /IntegrationSettings/,
      /CustomizationSettings/,
      /CommunicationSettings/,
      /OrganizationSettings/,
      /AccountSettings/,
      /BillingSettings/
    ];
    
    const matches = content.matchAll(componentPattern);
    for (const match of matches) {
      const componentName = match[1];
      
      // Check for suspicious patterns that might indicate typos
      if (componentName.includes('Setting') && !componentName.endsWith('Settings')) {
        if (componentName !== 'Setting' && componentName.includes('Integration')) {
          errors.push({
            file: filePath,
            component: componentName,
            issue: `Component ${componentName} should likely be 'IntegrationsSettings' (with 's') if referring to the integrations settings component`
          });
        }
      }
    }
    
    const closingMatches = content.matchAll(closingComponentPattern);
    for (const match of closingMatches) {
      const componentName = match[1];
      
      // Check for suspicious patterns that might indicate typos
      if (componentName.includes('Setting') && !componentName.endsWith('Settings')) {
        if (componentName !== 'Setting' && componentName.includes('Integration')) {
          errors.push({
            file: filePath,
            component: componentName,
            issue: `Component ${componentName} should likely be 'IntegrationsSettings' (with 's') if referring to the integrations settings component`
          });
        }
      }
    }

    // Check for import statements that might have typos
    const importMatches = content.matchAll(/import\s+.*\s+from\s+['"][^'"]*\/(\w+Settings)['"]/g);
    for (const match of importMatches) {
      const importedComponent = match[1];
      if (importedComponent.includes('Setting') && !importedComponent.endsWith('Settings')) {
        if (importedComponent.includes('Integration')) {
          errors.push({
            file: filePath,
            component: importedComponent,
            issue: `Imported component ${importedComponent} should likely be 'IntegrationsSettings' (with 's')`
          });
        }
      }
    }
  }
  
  console.log('🔍 Checking for component naming typos...');
  scanDirectory(projectDir);
  
  if (errors.length > 0) {
    console.log('\n❌ Found potential component naming issues:');
    errors.forEach((error, index) => {
      console.log(`\n${index + 1}. File: ${error.file}`);
      console.log(`   Component: ${error.component}`);
      console.log(`   Issue: ${error.issue}`);
    });
    console.log('\nPlease review these potential typos to prevent runtime errors.');
    process.exit(1); // Exit with error code to indicate issues found
  } else {
    console.log('\n✅ No obvious component naming typos detected!');
  }
}

checkComponentTypos();