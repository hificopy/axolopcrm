# Comprehensive System Health Test

This script provides a complete health check for the Axolop CRM system, testing all major components and integrations.

## Usage

```bash
# Run the complete system health test
npm run test:health

# Or run directly
node scripts/comprehensive-system-health-test.js
```

## What It Tests

### 1. Backend Health

- ✅ Server connectivity and response time
- ✅ Redis connection status
- ✅ Database connection status
- ✅ API version and environment info

### 2. API Endpoints

- ✅ Unauthenticated endpoints (should return 401)
- ✅ Authenticated endpoints (requires valid token)
- ✅ HTTP methods (GET, POST, PUT, DELETE)
- ✅ Response status codes and data formats

### 3. Database Schema

- ✅ Connection to Supabase
- ✅ Key tables existence:
  - `leads`
  - `contacts`
  - `opportunities`
  - `agencies`
  - `agency_members`
  - `users`
  - `forms`
  - `tasks`
  - `activities`
  - `workflows`

### 4. Authentication Flow

- ✅ User signup (if test user doesn't exist)
- ✅ User signin
- ✅ JWT token generation and validation
- ✅ Session management

### 5. Agency/User Hierarchy

- ✅ Agency listing
- ✅ Agency member management
- ✅ User permissions and access control

### 6. CRUD Operations

- ✅ Create: Lead creation
- ✅ Read: Lead retrieval by ID
- ✅ Update: Lead modification
- ✅ Delete: Lead removal

### 7. Frontend Integration

- ✅ Frontend accessibility
- ✅ Key frontend files existence
- ✅ API client configuration

### 8. Error Handling

- ✅ 404 error handling
- ✅ Validation error handling
- ✅ Malformed data handling

### 9. Performance

- ✅ API response time (< 2 seconds)
- ✅ Concurrent request handling
- ✅ System load testing

## Configuration

The script uses environment variables or defaults:

```javascript
BACKEND_URL=http://localhost:3002
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Test Results

The script provides:

- ✅ Real-time test progress with timestamps
- ✅ Detailed pass/fail results for each test
- ✅ Error messages and debugging information
- ✅ Summary with success rate and overall system status
- ✅ Exit code 0 for success, 1 for failure

## Output Example

```
🚀 Starting Axolop CRM System Health Tests...
Backend URL: http://localhost:3002
Frontend URL: http://localhost:3000
================================================================================
📋 [2025-01-26T10:30:00.000Z] Testing Backend Health...
✅ [2025-01-26T10:30:00.100Z] PASS: Backend Health Check
✅ [2025-01-26T10:30:00.150Z] PASS: Redis Connection
✅ [2025-01-26T10:30:00.200Z] PASS: Database Connection
...

================================================================================
🏁 SYSTEM HEALTH TEST SUMMARY
================================================================================

📊 Test Results:
   Total Tests: 45
   ✅ Passed: 43
   ❌ Failed: 2
   📈 Success Rate: 95.6%

🔗 Service URLs:
   Backend: http://localhost:3002
   Frontend: http://localhost:3000
   Health Check: http://localhost:3002/health

🟢 Overall System Status: HEALTHY
================================================================================
```

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure backend is running on port 3002
   - Check Docker containers: `docker ps`
   - Restart backend: `docker-compose restart backend`

2. **Authentication Tests Fail**
   - Verify Supabase configuration in `.env`
   - Check Supabase project settings
   - Ensure auth is enabled in Supabase

3. **Database Schema Issues**
   - Run schema migration: `npm run migrate`
   - Check Supabase table permissions
   - Verify RLS policies

4. **Frontend Integration Fails**
   - Ensure frontend is running on port 3000
   - Check Vite configuration
   - Verify API proxy settings

### Environment Setup

Make sure your `.env` file contains:

```env
# Backend
PORT=3002
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Frontend
VITE_API_URL=http://localhost:3002
```

## Continuous Integration

This test can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run System Health Tests
  run: npm run test:health
```

## Extending the Tests

To add new tests:

1. Add test function to the script
2. Call it in `runSystemHealthTests()`
3. Use `recordTest()` for consistent reporting
4. Follow existing patterns for error handling

Example:

```javascript
async function testNewFeature() {
  log("Testing New Feature...");

  try {
    const response = await api.get("/api/v1/new-feature");
    recordTest("New Feature Endpoint", response.status === 200);
  } catch (error) {
    recordTest("New Feature Endpoint", false, error.message);
  }
}
```

## Support

For issues with the health test script:

1. Check the troubleshooting section above
2. Verify all services are running
3. Check environment configuration
4. Review test logs for specific error details
