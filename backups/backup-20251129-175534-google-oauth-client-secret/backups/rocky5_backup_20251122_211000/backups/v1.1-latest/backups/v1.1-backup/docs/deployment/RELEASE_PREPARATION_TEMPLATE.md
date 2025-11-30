# Release Preparation Template

## Pre-Release Checklist

### 1. Version Assessment
- **Current Production Version**: [Check package.json and last release notes]
- **New Version Number**: [Increment appropriately - typically X.Y+1.0]
- **Version Format**: V.X.Y (e.g., V1.0, V1.1, V1.2)

### 2. Feature Documentation
- **New Features Since Last Release**: [List from commit history]
- **Bug Fixes**: [List of resolved issues]
- **Performance Improvements**: [List of optimizations]
- **Breaking Changes**: [List any breaking changes]

### 3. Backup Creation
- **Backup Location**: `../mastered/backup-YYYYMMDD-HHMMSS-VX.Y-release/`
- **Files Included**: All project files except .git, node_modules, dist, build, GEMINI.md, CLAUDE.md, QWEN.md
- **Backup Command**: `rsync -av --exclude='.git' --exclude='node_modules' --exclude='dist' --exclude='build' --exclude='GEMINI.md' --exclude='CLAUDE.md' --exclude='QWEN.md' . ../mastered/backup-YYYYMMDD-HHMMSS-VX.Y-release/`

### 4. Testing Verification
- **Backend Health**: [Verify health check response]
- **Frontend-BE Communication**: [Verify API endpoints work]
- **Feature Testing**: [List of features to be manually tested]

## Release Documentation Template

### Release Notes for Version V.X.Y
**Release Date**: [Current Date]
**Release Manager**: Juan D. Romero Herrera

#### What's New
[New features list]

#### Bug Fixes
[Bug fixes list]

#### Performance Improvements
[Performance improvements list]

#### Breaking Changes
[Breaking changes list - if any]

#### Migration Guide
[Steps for users to migrate if needed]

#### Known Issues
[Known issues in this release]

## Post-Release Verification
- [ ] Frontend loads correctly on Vercel
- [ ] API endpoints respond properly
- [ ] All main features work as expected
- [ ] Database operations function correctly
- [ ] Authentication works properly

**IMPORTANT**: This document is prepared by AI to assist the human developer. Only the human developer may push to the `mastered` branch and deploy to production.