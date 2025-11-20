# Frontend Hosting Process for Axolop CRM

## Overview
This document outlines the process for hosting and deploying the Axolop CRM frontend using Vercel.

## Architecture
- **Frontend**: React application hosted on Vercel
- **Git Integration**: Automatic deployment from Git branches
- **Branch Strategy**: mastered branch for production, beta for testing, main for development

## Deployment Process

### Setup Vercel Project
1. Create Vercel account at [vercel.com](https://vercel.com)
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
3. Configure the project with:
   - Framework: Create React App or Vite
   - Build Command: `npm run build`
   - Output Directory: `dist` (for Vite) or `build` (for CRA)
   - Root Directory: `/` or `/website` depending on setup

### Branch Configuration
1. **Production Branch**: Set `mastered` as the production branch
2. **Preview Branches**: All other branches get preview deployments
3. **Environment Variables**: Configure API endpoints to point to your backend

### Environment Setup
```
# Vercel Environment Variables
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Git Workflow Integration

### Automatic Deployment
1. Push code to `mastered` branch triggers new production deployment
2. Push code to other branches triggers preview deployments
3. Preview deployments allow testing before merging to mastered

### Deployment Steps
1. Develop and test locally
2. Push changes to `beta` branch for team review
3. Deploy `beta` to preview URL for testing
4. Merge `beta` to `mastered` for production deployment
5. Vercel automatically builds and deploys the frontend

## Custom Domain Setup
1. Purchase domain (if needed)
2. Add custom domain in Vercel dashboard
3. Configure DNS records with your domain registrar
4. Vercel handles SSL certificate automatically

## Environment Variables for Different Stages
### Production Environment
```
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
```

### Preview Environments (Beta)
```
REACT_APP_API_URL=https://staging-api.yourdomain.com
REACT_APP_SUPABASE_URL=https://your-staging-project.supabase.co
```

## Build Configuration
### For Vite-based React App
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `/website`

### For Production Build
The build process:
1. Runs `npm run build` in the frontend directory
2. Creates optimized production assets
3. Deploys to CDN for fast global access

## Monitoring and Analytics
- Vercel Analytics for performance monitoring
- Automatic error reporting
- Performance metrics and optimization suggestions
- Git history integration for deployment tracking

## Rollback Process
1. If mastered deployment has issues, visit Vercel dashboard
2. Navigate to deployments section
3. Select previous successful deployment
4. Promote to production to rollback

## Best Practices
- Always test on beta branch before merging to mastered
- Use preview deployments for team review
- Keep `mastered` branch stable and production-ready
- Monitor deployment logs for any issues
- Set up custom error pages for better UX

## Troubleshooting
### Common Issues
- **Build failures**: Check environment variables and dependencies
- **API connection issues**: Verify API endpoint configuration
- **Supabase connection**: Confirm Supabase URL and key are correct

### Debugging Preview Deployments
- Check deployment logs in Vercel dashboard
- Verify environment variables are set correctly
- Test API endpoints from deployed site