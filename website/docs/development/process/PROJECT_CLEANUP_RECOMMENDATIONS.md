# Project Directory Cleanup Recommendations

## Summary of Updates Made
I've updated all documentation and code references to use the correct port (3002) instead of the old port (3001) throughout the project.

## Cleanup Recommendations

### 1. Archive/Documentation Cleanup
- **docs/archive/**: This directory contains outdated documentation files that may no longer be relevant
  - Many files reference old port configurations and processes
  - Consider reviewing and removing files that are no longer applicable to the current architecture

### 2. Old SQL Files
- Several SQL files in the root directory appear to be old migration or setup scripts:
  - `add-user-id-columns.sql`
  - `complete-rls-setup.sql`
  - `comprehensive-security-audit.sql`
  - `conditional-rls-setup.sql`
  - `final-security-fixes.sql`
  - `fix-critical-tables-simple.sql`
  - `fix-critical-tables-v2.sql`
  - `fix-critical-tables.sql`
  - `fixed-rls-setup.sql`
  - `simple-rls-setup.sql`
  - `verify-rls-complete.sql`
  - `verify-rls-setup.sql`
- These may be safe to archive if they've been superseded by newer versions

### 3. Backup Directories
- The `backups/`, `beta/`, and `mastered/` directories in the root are part of your release strategy
- Ensure these are managed according to your new deployment strategy documentation

### 4. Development Scripts
- Review the scripts in `/scripts` to ensure they all reflect the current port configuration
- Some scripts may need updating to reflect the current architecture

### 5. Remove Duplicate Files
- Check for any duplicate documentation files that may exist in multiple locations
- Consolidate documentation to prevent inconsistencies

### 6. Environment Files
- Ensure `.env.example` and other environment files reflect the current configuration
- Remove any obsolete environment variables

## Completed Updates
All the following have been updated to reflect port 3002 as the correct development port:

1. Frontend service files
2. Documentation files 
3. Test scripts
4. Configuration files
5. Deployment scripts

## Architecture Documentation
- Created comprehensive documentation for the new split architecture
- Documented the proper deployment strategy with human-controlled releases
- Added clear boundaries for AI-assisted vs human-controlled operations

This cleanup will help maintain consistency and prevent confusion in the future.