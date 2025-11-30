# Preventing Component Naming Issues in Axolop CRM

This document outlines best practices to prevent issues like component naming typos that can cause blank screens and other runtime errors.

## 1. Development Best Practices

### Component Naming
- Always use exact component names as defined in the import statement
- Pay special attention to plural vs singular forms (e.g., `IntegrationsSettings` vs `IntegrationSettings`)
- Use consistent naming conventions throughout the application

### Error Prevention
- The project now includes an ErrorBoundary component that will catch and display runtime errors
- ESLint rules have been enhanced to catch component naming issues early
- A pre-commit script will validate component names before committing changes

## 2. Tools and Scripts

### ESLint Configuration
- Added rules to catch common component naming errors:
  - `react/jsx-no-undef`: Prevents using undefined components
  - `react/jsx-pascal-case`: Ensures proper PascalCase for components
  - `react/display-name`: Ensures components have proper display names

### Component Typo Checker
Run the following command to check for common component naming issues:
```bash
npm run check-typos
```

This script will scan all JSX/JS files and look for potential component naming issues.

### Pre-commit Validation
The project includes a pre-commit script that will run the typo checker and config validation before allowing commits.

## 3. Common Issues to Watch For

### Import vs Component Name Mismatches
- Make sure import names match the actual component names exactly
- Check both the import statement and the component usage in JSX
- Be careful with pluralization (s vs no s)

### Case Sensitivity
- React component names must be capitalized
- File names should match component names for consistency

## 4. Debugging Tips

If you encounter a blank page:
1. Check the browser console for error messages
2. Run `npm run check-typos` to identify potential component naming issues
3. Ensure all components are imported correctly
4. Verify that all component names are spelled correctly in JSX tags

## 5. Testing and Validation

Always remember to:
- Run the development server to test changes
- Use `npm run check-typos` regularly
- Pay attention to ESLint warnings and errors
- Ensure your code passes all linting checks before committing