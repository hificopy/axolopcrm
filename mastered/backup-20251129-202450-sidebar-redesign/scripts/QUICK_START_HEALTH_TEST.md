# Quick Start Guide for System Health Test

## Running the Test

```bash
# Run the complete system health test
npm run test:health

# Or run directly
node scripts/comprehensive-system-health-test.js
```

## Understanding Results

### ✅ Healthy System (What you want to see)

- Backend Health Check: ✅ PASS
- Redis Connection: ✅ PASS
- Database Connection: ✅ PASS
- Unauthenticated endpoints: ✅ PASS (returning 401/404)
- Frontend Accessibility: ✅ PASS
- Performance tests: ✅ PASS

### ⚠️ Common Issues and Solutions

#### Supabase Connection Failures

If you see errors like "fetch failed" or "ENOTFOUND":

```bash
# Check your .env file
cat .env | grep SUPABASE

# Verify Supabase URL is accessible
curl https://your-project.supabase.co/rest/v1/
```

#### Missing Endpoints (404 errors)

This is normal! Some endpoints may not exist yet:

- `/api/v1/users` - May be disabled or moved
- `/api/v1/calendar` - May be under different route

#### Backend Connection Issues

```bash
# Check if backend is running
curl http://localhost:3002/health

# Restart Docker containers if needed
docker-compose restart backend
```

## Test Categories

### 1. Core Infrastructure

- Backend health and services
- Database connectivity
- Redis cache status

### 2. Security

- Unauthenticated endpoint protection
- Authentication flow
- JWT token validation

### 3. Functionality

- CRUD operations (leads, contacts, etc.)
- Agency/user hierarchy
- Frontend integration

### 4. Performance

- API response times
- Concurrent request handling
- Error handling

## Exit Codes

- `0` - All tests passed (or only expected failures)
- `1` - Critical failures detected

Use this in CI/CD:

```bash
npm run test:health
if [ $? -eq 0 ]; then
  echo "✅ System is healthy"
else
  echo "❌ System has issues"
  exit 1
fi
```

## Troubleshooting Checklist

1. **Backend not responding?**
   - Check: `curl http://localhost:3002/health`
   - Fix: `docker-compose restart backend`

2. **Supabase connection failed?**
   - Check: `.env` file for correct SUPABASE_URL
   - Fix: Update Supabase credentials

3. **Frontend not accessible?**
   - Check: `curl http://localhost:3000`
   - Fix: `npm run dev`

4. **High failure rate?**
   - Check network connectivity
   - Verify all services are running
   - Check environment variables

## Integration with Development Workflow

### Pre-commit Check

Add to your `package.json`:

```json
{
  "scripts": {
    "pre-commit": "npm run test:health"
  }
}
```

### CI/CD Pipeline

```yaml
# GitHub Actions example
- name: System Health Check
  run: npm run test:health
```

### Monitoring

Run periodically to catch issues early:

```bash
# Every 5 minutes
watch -n 300 npm run test:health
```

## Customization

To modify the test:

1. **Add new endpoints**: Edit the `endpoints` array
2. **Change configuration**: Update `CONFIG` object
3. **Add new tests**: Create new async function and call it in `runSystemHealthTests()`

Example:

```javascript
async function testNewFeature() {
  log("Testing New Feature...");

  try {
    const response = await api.get("/api/v1/new-feature");
    recordTest("New Feature", response.status === 200);
  } catch (error) {
    recordTest("New Feature", false, error.message);
  }
}

// Add to main function
await testNewFeature();
```

## Support

For issues:

1. Check this guide first
2. Review the test output for specific error messages
3. Verify all services are running
4. Check environment configuration
