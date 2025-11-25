# Axolop CRM API - Complete Reference Guide

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Configuration](#configuration)
5. [API Endpoints](#api-endpoints)
6. [Utilities Reference](#utilities-reference)
7. [Error Handling](#error-handling)
8. [Security](#security)
9. [Performance & Caching](#performance--caching)
10. [Job Queues](#job-queues)
11. [Events System](#events-system)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

---

## Overview

The Axolop CRM API is a comprehensive backend system built with Express.js, Supabase, and Redis. This reference covers the complete API implementation with all enterprise-grade features.

### Key Features

- **RESTful API** with versioning (`/api/v1/`)
- **PostgreSQL** database via Supabase
- **Redis** for caching and rate limiting
- **Structured logging** with Winston
- **Input validation** with Zod schemas
- **Error handling** with custom error classes
- **Rate limiting** per endpoint type
- **Job queues** for async processing
- **Event system** for decoupled components
- **Webhook delivery** with retry logic
- **Template rendering** for emails
- **Metrics collection** for monitoring
- **Security utilities** for encryption/hashing
- **Export capabilities** to CSV/JSON

---

## Quick Start

### Prerequisites

```bash
node >= 16.x
npm >= 8.x
redis >= 6.x
postgresql >= 13.x (via Supabase)
```

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run database migration
node backend/db/run-migration.js
# Follow instructions to run migration in Supabase

# Start server
npm run dev
```

### Verify Installation

```bash
# Health check
curl http://localhost:3002/health

# API info
curl http://localhost:3002/api/v1/info

# Metrics
curl http://localhost:3002/metrics
```

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────┐
│                  Client Apps                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          Express.js API Server                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Middleware Stack                        │  │
│  │  - Rate Limiting                         │  │
│  │  - Request Logging                       │  │
│  │  - Metrics Collection                    │  │
│  │  - Error Handling                        │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  API Routes (/api/v1)                    │  │
│  │  - Leads, Contacts, Opportunities        │  │
│  │  - Workflows, Email Campaigns            │  │
│  │  - Calendar, Calls, Forms                │  │
│  └──────────────────────────────────────────┘  │
└────────┬────────────┬──────────────────────────┘
         │            │
         ▼            ▼
┌─────────────┐  ┌─────────────┐
│  Supabase   │  │   Redis     │
│  PostgreSQL │  │  - Cache    │
│  - Data     │  │  - Queues   │
│  - Auth     │  │  - Limits   │
└─────────────┘  └─────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│           Background Services                   │
│  - Job Queues (Bull)                           │
│  - Event Handlers                              │
│  - Webhook Delivery                            │
│  - Email Processing                            │
└─────────────────────────────────────────────────┘
```

### Directory Structure

```
backend/
├── config/
│   └── app.config.js          # Centralized configuration
├── db/
│   └── migrations/
│       └── 001_fix_workflow_schema.sql
├── middleware/
│   ├── error-handler.js       # Global error handling
│   ├── validate.js            # Zod validation
│   └── rate-limit.js          # Rate limiting
├── validators/
│   ├── lead.validator.js      # Lead schemas
│   ├── contact.validator.js   # Contact schemas
│   └── workflow.validator.js  # Workflow schemas
├── utils/
│   ├── errors.js              # Custom error classes
│   ├── logger.js              # Winston logging
│   ├── cache.js               # Redis caching
│   ├── database.js            # DB helpers
│   ├── metrics.js             # Metrics collection
│   ├── events.js              # Event system
│   ├── webhook.js             # Webhook delivery
│   ├── queue.js               # Job queues
│   ├── template.js            # Email templates
│   ├── analytics.js           # Analytics helpers
│   ├── security.js            # Security utilities
│   └── export.js              # Data export
├── services/
│   └── [existing services]
├── routes/
│   └── [existing routes]
└── index.js                   # Main server file
```

---

## Configuration

### Environment Variables

All configuration is managed via `backend/config/app.config.js` which reads from `.env`:

#### Server Configuration
```env
PORT=3002
NODE_ENV=development
API_VERSION=v1
```

#### Supabase Configuration
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

#### Redis Configuration
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

#### Email Configuration
```env
SENDGRID_API_KEY=your-sendgrid-key
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your-access-key
AWS_SES_SECRET_ACCESS_KEY=your-secret-key
```

#### Google Services
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3002/auth/google/callback
```

#### Cache Configuration
```env
CACHE_ENABLED=true
CACHE_DEFAULT_TTL=3600
```

#### Logging Configuration
```env
LOG_LEVEL=info
LOG_DIR=logs
```

#### Workflow Configuration
```env
WORKFLOW_POLL_INTERVAL=5000
MAX_CONCURRENT_EXECUTIONS=10
```

#### Security Configuration
```env
ENCRYPTION_KEY=your-32-character-encryption-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuration Access

```javascript
import config from './config/app.config.js';

console.log(config.port); // 3002
console.log(config.supabase.url);
console.log(config.redis.host);
```

---

## API Endpoints

### Base URL

All endpoints are prefixed with `/api/v1/`:

```
http://localhost:3002/api/v1/
```

### Authentication

Most endpoints require authentication via Supabase JWT:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3002/api/v1/leads
```

### Core Endpoints

#### Leads

```
GET    /api/v1/leads              # List leads (paginated)
POST   /api/v1/leads              # Create lead
GET    /api/v1/leads/:id          # Get lead by ID
PUT    /api/v1/leads/:id          # Update lead
DELETE /api/v1/leads/:id          # Delete lead
GET    /api/v1/leads/export       # Export leads to CSV
```

**Create Lead Example:**
```bash
curl -X POST http://localhost:3002/api/v1/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "type": "B2B_COMPANY",
    "status": "NEW",
    "value": 50000
  }'
```

#### Contacts

```
GET    /api/v1/contacts           # List contacts
POST   /api/v1/contacts           # Create contact
GET    /api/v1/contacts/:id       # Get contact
PUT    /api/v1/contacts/:id       # Update contact
DELETE /api/v1/contacts/:id       # Delete contact
GET    /api/v1/contacts/export    # Export contacts
```

#### Opportunities

```
GET    /api/v1/opportunities      # List opportunities
POST   /api/v1/opportunities      # Create opportunity
GET    /api/v1/opportunities/:id  # Get opportunity
PUT    /api/v1/opportunities/:id  # Update opportunity
DELETE /api/v1/opportunities/:id  # Delete opportunity
```

#### Workflows

```
GET    /api/v1/workflows          # List workflows
POST   /api/v1/workflows          # Create workflow
GET    /api/v1/workflows/:id      # Get workflow
PUT    /api/v1/workflows/:id      # Update workflow
DELETE /api/v1/workflows/:id      # Delete workflow
POST   /api/v1/workflows/:id/execute  # Execute workflow
GET    /api/v1/workflows/:id/executions  # Get executions
```

#### Email Campaigns

```
GET    /api/v1/campaigns          # List campaigns
POST   /api/v1/campaigns          # Create campaign
GET    /api/v1/campaigns/:id      # Get campaign
PUT    /api/v1/campaigns/:id      # Update campaign
POST   /api/v1/campaigns/:id/send # Send campaign
GET    /api/v1/campaigns/:id/analytics  # Campaign analytics
```

#### Forms

```
GET    /api/v1/forms              # List forms
POST   /api/v1/forms              # Create form
GET    /api/v1/forms/:id          # Get form
PUT    /api/v1/forms/:id          # Update form
POST   /api/v1/forms/:id/submit   # Submit form
```

#### Calendar

```
GET    /api/v1/calendar/events    # List events
POST   /api/v1/calendar/events    # Create event
GET    /api/v1/calendar/events/:id  # Get event
PUT    /api/v1/calendar/events/:id  # Update event
DELETE /api/v1/calendar/events/:id  # Delete event
```

#### Analytics

```
GET    /api/v1/analytics/dashboard       # Dashboard stats
GET    /api/v1/analytics/funnel          # Conversion funnel
GET    /api/v1/analytics/revenue         # Revenue analytics
GET    /api/v1/analytics/activity        # Activity timeline
```

#### System

```
GET    /health                    # Health check
GET    /metrics                   # System metrics
GET    /api/v1/info              # API information
```

### Rate Limits

Different endpoints have different rate limits:

| Endpoint Type | Window | Max Requests |
|--------------|--------|--------------|
| General API | 15 min | 100 |
| Auth | 15 min | 5 |
| Workflows | 1 min | 10 |
| Email Send | 1 min | 20 |

### Pagination

List endpoints support pagination:

```bash
GET /api/v1/leads?page=1&limit=20
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Filtering

Most list endpoints support filtering:

```bash
# Filter leads by status
GET /api/v1/leads?status=QUALIFIED

# Filter by date range
GET /api/v1/leads?startDate=2024-01-01&endDate=2024-12-31

# Multiple filters
GET /api/v1/leads?status=NEW&type=B2B_COMPANY
```

### Sorting

```bash
GET /api/v1/leads?sort=created_at&order=desc
```

---

## Utilities Reference

### Error Handling (`utils/errors.js`)

Custom error classes for consistent error responses:

```javascript
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError
} from './utils/errors.js';

// Throw errors in your code
throw new NotFoundError('Lead not found');
throw new ValidationError('Invalid email format');
throw new UnauthorizedError('Invalid credentials');

// These are automatically caught and formatted by error-handler middleware
```

**Available Error Classes:**
- `AppError` - Base error class
- `ValidationError` - 400 Bad Request
- `NotFoundError` - 404 Not Found
- `UnauthorizedError` - 401 Unauthorized
- `ForbiddenError` - 403 Forbidden
- `ConflictError` - 409 Conflict
- `DatabaseError` - 500 Database error
- `ExternalServiceError` - 503 Service error
- `RateLimitError` - 429 Too Many Requests
- `WorkflowExecutionError` - 500 Workflow error

### Logging (`utils/logger.js`)

Structured logging with Winston:

```javascript
import logger from './utils/logger.js';

// Log levels: error, warn, info, http, debug
logger.info('User created', { userId: 123, email: 'user@example.com' });
logger.error('Database error', { error: err.message, query });
logger.debug('Cache hit', { key: 'user:123' });

// Request logging middleware (automatically applied)
app.use(requestLogger);
```

**Log Files:**
- `logs/error.log` - Error level only
- `logs/combined.log` - All levels
- `logs/debug.log` - Debug level (dev only)

### Caching (`utils/cache.js`)

Redis-backed caching service:

```javascript
import cacheService from './utils/cache.js';

// Initialize (done in index.js)
cacheService.initialize(redis);

// Basic operations
await cacheService.set('key', value, ttl);
const value = await cacheService.get('key');
await cacheService.delete('key');
await cacheService.clear();

// Get or set pattern
const data = await cacheService.getOrSet(
  'user:123',
  async () => {
    // This function only runs on cache miss
    return await fetchUserFromDB(123);
  },
  3600 // TTL in seconds
);

// Domain-specific methods
const workflow = await cacheService.getWorkflow(workflowId);
const lead = await cacheService.getLead(leadId);
await cacheService.invalidateUserLeads(userId);
```

### Database Utilities (`utils/database.js`)

Helper functions for common database operations:

```javascript
import {
  paginatedQuery,
  bulkInsert,
  search,
  Transaction
} from './utils/database.js';

// Paginated queries
const result = await paginatedQuery('leads', {
  page: 1,
  limit: 20,
  filters: { status: 'NEW' },
  sort: { field: 'created_at', order: 'desc' }
});

// Bulk insert
await bulkInsert('leads', records, 100); // batch size 100

// Full-text search
const results = await search('leads',
  ['name', 'email', 'company'],
  'acme',
  { limit: 10 }
);

// Transactions
const transaction = new Transaction();
try {
  await transaction.execute(async () => {
    await supabase.from('leads').insert(leadData);
    await supabase.from('activities').insert(activityData);
  });
} catch (error) {
  await transaction.rollback();
}
```

### Metrics (`utils/metrics.js`)

Performance and usage metrics:

```javascript
import metrics from './utils/metrics.js';

// Record metrics
metrics.recordRequest('GET', '/api/v1/leads', 200, 45); // 45ms
metrics.recordWorkflow(true, 1200); // success, 1200ms
metrics.recordEmail('sent');
metrics.recordError('database_connection_failed');

// Get metrics summary
const summary = metrics.getSummary();
console.log(summary.requests.total);
console.log(summary.requests.avgDuration);
```

### Events System (`utils/events.js`)

Internal event system for decoupled architecture:

```javascript
import events, { EventTypes } from './utils/events.js';

// Subscribe to events
events.subscribe(EventTypes.LEAD_CREATED, async (lead) => {
  logger.info('New lead created', { leadId: lead.id });
  await sendWelcomeEmail(lead);
});

// Emit events
events.emit(EventTypes.LEAD_CREATED, leadData);
events.emit(EventTypes.EMAIL_SENT, { to, subject });
```

**Available Events:**
- `LEAD_CREATED`, `LEAD_UPDATED`, `LEAD_DELETED`
- `CONTACT_CREATED`, `CONTACT_UPDATED`, `CONTACT_DELETED`
- `OPPORTUNITY_WON`, `OPPORTUNITY_LOST`
- `EMAIL_SENT`, `EMAIL_OPENED`, `EMAIL_CLICKED`
- `WORKFLOW_STARTED`, `WORKFLOW_COMPLETED`, `WORKFLOW_FAILED`
- Plus 20+ more event types

### Webhooks (`utils/webhook.js`)

Webhook delivery with retry logic:

```javascript
import webhookService from './utils/webhook.js';

// Send webhook
await webhookService.sendWebhook(
  'https://example.com/webhook',
  { event: 'lead.created', data: leadData },
  { maxRetries: 3, secret: 'webhook-secret' }
);

// Trigger event to multiple webhooks
await webhookService.trigger('lead.created', leadData, [
  'https://webhook1.com',
  'https://webhook2.com'
]);

// Verify webhook signature (in webhook receiver)
const isValid = webhookService.verifySignature(
  payload,
  signature,
  secret
);
```

### Job Queues (`utils/queue.js`)

Background job processing with Bull:

```javascript
import {
  queueEmail,
  queueWorkflow,
  getQueueStats
} from './utils/queue.js';

// Queue jobs
await queueEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  template: 'welcome',
  data: { name: 'John' }
}, { priority: 5, delay: 0 });

await queueWorkflow({
  workflowId: 123,
  leadId: 456
});

// Get queue statistics
const stats = await getQueueStats('email');
console.log(stats.waiting, stats.active, stats.completed);
```

**Available Queues:**
- `email` - Email sending
- `workflow` - Workflow execution
- `import` - Data imports
- `export` - Data exports
- `analytics` - Analytics processing

### Templates (`utils/template.js`)

Handlebars email template rendering:

```javascript
import { renderEmail, renderTemplate } from './utils/template.js';

// Render base template
const html = renderEmail('welcome', {
  firstName: 'John',
  companyName: 'Axolop',
  getStartedLink: 'https://app.axolop.com/start'
});

// Render custom template
const html = renderTemplate(customTemplate, templateData);
```

**Available Base Templates:**
- `basic` - Basic email layout
- `welcome` - Welcome email
- `leadNotification` - Lead notification
- `taskReminder` - Task reminder
- `invoice` - Invoice template

**Custom Helpers:**
- `{{formatDate date}}` - Format dates
- `{{formatCurrency amount}}` - Format currency
- `{{uppercase str}}` - Uppercase text
- `{{truncate str 50}}` - Truncate text
- `{{#ifEquals}}` - Conditional rendering

### Analytics (`utils/analytics.js`)

Analytics and reporting functions:

```javascript
import {
  getDashboardStats,
  getConversionFunnel,
  getRevenueAnalytics
} from './utils/analytics.js';

// Dashboard statistics
const stats = await getDashboardStats(userId, 'week');
console.log(stats.leads.total, stats.leads.new);

// Conversion funnel
const funnel = await getConversionFunnel(userId);
console.log(funnel.rates.overallConversion);

// Revenue analytics
const revenue = await getRevenueAnalytics(userId, 'month');
console.log(revenue.totalRevenue, revenue.winRate);
```

### Security (`utils/security.js`)

Security and encryption utilities:

```javascript
import {
  hashPassword,
  verifyPassword,
  encrypt,
  decrypt,
  generateApiKey,
  sanitizeInput
} from './utils/security.js';

// Password hashing
const hash = await hashPassword('password123');
const isValid = await verifyPassword('password123', hash);

// Encryption
const encrypted = encrypt('sensitive data');
const decrypted = decrypt(encrypted);

// API key generation
const apiKey = generateApiKey(); // axolop_...

// Input sanitization
const clean = sanitizeInput(userInput);
```

### Export (`utils/export.js`)

Data export to CSV/JSON:

```javascript
import {
  exportLeads,
  exportContacts,
  createExportPackage
} from './utils/export.js';

// Export leads
const csv = await exportLeads(userId, {
  status: 'QUALIFIED',
  startDate: '2024-01-01'
});

// Export contacts
const csv = await exportContacts(userId);

// Complete export package
const exports = await createExportPackage(userId, 'all');
console.log(exports.leads, exports.contacts, exports.opportunities);
```

---

## Error Handling

### Error Response Format

All errors return consistent JSON:

```json
{
  "status": "error",
  "message": "Lead not found",
  "statusCode": 404,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/leads/999",
  "requestId": "req_abc123"
}
```

### Using asyncHandler

Wrap async route handlers to automatically catch errors:

```javascript
import { asyncHandler } from './middleware/error-handler.js';

router.get('/leads/:id', asyncHandler(async (req, res) => {
  const lead = await getLeadById(req.params.id);
  if (!lead) {
    throw new NotFoundError('Lead not found');
  }
  res.json({ data: lead });
}));
```

### Validation Errors

Validation errors include field-specific details:

```json
{
  "status": "error",
  "message": "Validation failed",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

---

## Security

### Input Validation

All inputs are validated using Zod schemas:

```javascript
import { validate } from './middleware/validate.js';
import { createLeadSchema } from './validators/lead.validator.js';

router.post('/leads',
  validate(createLeadSchema),
  asyncHandler(async (req, res) => {
    // req.body is validated and sanitized
  })
);
```

### Rate Limiting

Rate limiting prevents abuse:

```javascript
import { apiLimiter, authLimiter } from './middleware/rate-limit.js';

router.use('/api/v1/', apiLimiter);
router.use('/auth/', authLimiter);
```

When rate limit is exceeded:
```json
{
  "status": "error",
  "message": "Too many requests, please try again later",
  "statusCode": 429,
  "retryAfter": 300
}
```

### Authentication

Routes are protected with Supabase auth:

```javascript
import { authenticate } from './middleware/auth.js';

router.get('/leads', authenticate, asyncHandler(async (req, res) => {
  // req.user contains authenticated user
}));
```

### Data Encryption

Sensitive data is encrypted at rest:

```javascript
import { encrypt, decrypt } from './utils/security.js';

// Store encrypted
const encrypted = encrypt(apiKey);
await supabase.from('integrations').insert({
  api_key: encrypted
});

// Retrieve and decrypt
const { data } = await supabase.from('integrations').select('api_key');
const apiKey = decrypt(data.api_key);
```

---

## Performance & Caching

### Caching Strategy

Multi-layer caching for optimal performance:

1. **Application Cache** - Redis in-memory cache
2. **Database Cache** - Supabase query cache
3. **HTTP Cache** - Response caching headers

### Cache TTLs

Default TTLs by data type:

| Data Type | TTL |
|-----------|-----|
| Workflows | 1 hour |
| Leads | 5 minutes |
| Dashboard Stats | 5 minutes |
| Analytics | 15 minutes |
| User Data | 10 minutes |

### Cache Invalidation

Caches are automatically invalidated on updates:

```javascript
// When lead is updated
await cacheService.invalidateLead(leadId);
await cacheService.invalidateUserLeads(userId);
```

Manual cache clearing:

```javascript
await cacheService.clear(); // Clear all
await cacheService.clearPattern('user:*'); // Pattern-based
```

### Performance Monitoring

Metrics are collected for all operations:

```javascript
// Automatically tracked:
// - Request duration
// - Database query time
// - Cache hit/miss rates
// - Error rates

const metrics = await fetch('/metrics').then(r => r.json());
console.log(metrics.requests.avgDuration);
```

---

## Job Queues

### Queue Types

Five specialized queues for different operations:

1. **Email Queue** - Sending emails
2. **Workflow Queue** - Executing workflows
3. **Import Queue** - Data imports
4. **Export Queue** - Data exports
5. **Analytics Queue** - Analytics processing

### Adding Jobs

```javascript
import { queueEmail, queueWorkflow } from './utils/queue.js';

// High priority email
await queueEmail(emailData, { priority: 1 });

// Delayed workflow
await queueWorkflow(workflowData, { delay: 60000 }); // 1 minute

// Single retry import
await queueImport(importData, { attempts: 1 });
```

### Job Priority

Lower numbers = higher priority (1-10):

- 1-2: Critical (urgent emails, time-sensitive workflows)
- 3-5: High (normal operations)
- 6-8: Normal (analytics, reports)
- 9-10: Low (cleanup, maintenance)

### Monitoring Queues

```javascript
import { getQueueStats, getAllQueueStats } from './utils/queue.js';

// Single queue
const stats = await getQueueStats('email');
console.log(`Waiting: ${stats.waiting}, Active: ${stats.active}`);

// All queues
const allStats = await getAllQueueStats();
```

### Queue Management

```javascript
import { pauseQueue, resumeQueue, cleanQueue } from './utils/queue.js';

// Pause queue (stop processing)
await pauseQueue('email');

// Resume queue
await resumeQueue('email');

// Clean old completed jobs (older than 1 hour)
await cleanQueue('email', 3600000);
```

---

## Events System

### Event Types

30+ event types for different operations:

**Lead Events:**
- `lead.created`, `lead.updated`, `lead.deleted`
- `lead.status_changed`, `lead.assigned`

**Contact Events:**
- `contact.created`, `contact.updated`, `contact.deleted`

**Opportunity Events:**
- `opportunity.created`, `opportunity.won`, `opportunity.lost`

**Email Events:**
- `email.sent`, `email.delivered`, `email.opened`, `email.clicked`

**Workflow Events:**
- `workflow.started`, `workflow.completed`, `workflow.failed`

### Subscribing to Events

```javascript
import events, { EventTypes } from './utils/events.js';

// Single event
events.subscribe(EventTypes.LEAD_CREATED, async (lead) => {
  await sendNotification('New lead created', lead);
});

// Multiple events
events.subscribe(EventTypes.EMAIL_OPENED, handleEmailOpened);
events.subscribe(EventTypes.EMAIL_CLICKED, handleEmailClicked);
```

### Emitting Events

```javascript
// Emit with data
events.emit(EventTypes.LEAD_CREATED, {
  id: leadId,
  name: 'Acme Corp',
  userId: req.user.id
});

// Event handlers run asynchronously
```

### Unsubscribing

```javascript
const handler = (data) => console.log(data);

// Subscribe
events.subscribe(EventTypes.LEAD_CREATED, handler);

// Unsubscribe
events.unsubscribe(EventTypes.LEAD_CREATED, handler);
```

---

## Best Practices

### Error Handling

Always use custom error classes:

```javascript
// ❌ Bad
throw new Error('Not found');

// ✅ Good
throw new NotFoundError('Lead not found');
```

### Async Operations

Use asyncHandler for route handlers:

```javascript
// ❌ Bad
router.get('/leads', async (req, res) => {
  try {
    const leads = await getLeads();
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Good
router.get('/leads', asyncHandler(async (req, res) => {
  const leads = await getLeads();
  res.json({ data: leads });
}));
```

### Validation

Validate all inputs:

```javascript
// ❌ Bad
router.post('/leads', async (req, res) => {
  const lead = await createLead(req.body);
  res.json(lead);
});

// ✅ Good
router.post('/leads',
  validate(createLeadSchema),
  asyncHandler(async (req, res) => {
    const lead = await createLead(req.body);
    res.json({ data: lead });
  })
);
```

### Logging

Use structured logging with context:

```javascript
// ❌ Bad
console.log('Lead created');

// ✅ Good
logger.info('Lead created', {
  leadId: lead.id,
  userId: req.user.id,
  leadType: lead.type
});
```

### Caching

Cache expensive operations:

```javascript
// ❌ Bad
router.get('/analytics', async (req, res) => {
  const stats = await calculateDashboardStats(req.user.id);
  res.json(stats);
});

// ✅ Good
router.get('/analytics', asyncHandler(async (req, res) => {
  const stats = await cacheService.getOrSet(
    `stats:${req.user.id}`,
    () => calculateDashboardStats(req.user.id),
    300 // 5 minutes
  );
  res.json({ data: stats });
}));
```

### Database Queries

Use pagination for large datasets:

```javascript
// ❌ Bad
const leads = await supabase.from('leads').select('*');

// ✅ Good
const leads = await paginatedQuery('leads', {
  page: req.query.page || 1,
  limit: req.query.limit || 20,
  filters: { user_id: req.user.id }
});
```

### Security

Always sanitize user inputs:

```javascript
import { sanitizeInput } from './utils/security.js';

// ❌ Bad
const name = req.body.name;

// ✅ Good
const name = sanitizeInput(req.body.name);
```

### Event-Driven Architecture

Decouple operations using events:

```javascript
// ❌ Bad - tightly coupled
async function createLead(data) {
  const lead = await insertLead(data);
  await sendWelcomeEmail(lead);
  await notifySlack(lead);
  await updateAnalytics(lead);
  return lead;
}

// ✅ Good - decoupled
async function createLead(data) {
  const lead = await insertLead(data);
  events.emit(EventTypes.LEAD_CREATED, lead);
  return lead;
}

// Separate handlers
events.subscribe(EventTypes.LEAD_CREATED, sendWelcomeEmail);
events.subscribe(EventTypes.LEAD_CREATED, notifySlack);
events.subscribe(EventTypes.LEAD_CREATED, updateAnalytics);
```

---

## Troubleshooting

### Common Issues

#### 1. Redis Connection Failed

**Symptom:** `Error: Redis connection failed`

**Solution:**
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG

# If not running:
redis-server

# Or use Docker:
docker run -d -p 6379:6379 redis:latest
```

#### 2. Database Migration Not Applied

**Symptom:** `relation "email_campaigns" does not exist`

**Solution:**
```bash
# Run migration
node backend/db/run-migration.js

# Or manually in Supabase SQL Editor:
# Copy contents of backend/db/migrations/001_fix_workflow_schema.sql
```

#### 3. Rate Limit Errors

**Symptom:** `429 Too Many Requests`

**Solution:**
```bash
# Clear rate limits in Redis
redis-cli KEYS "rl:*" | xargs redis-cli DEL

# Or increase limits in .env:
RATE_LIMIT_MAX_REQUESTS=200
```

#### 4. Cache Not Working

**Symptom:** Slow responses, no cache hits

**Solution:**
```javascript
// Check cache is enabled
console.log(config.cache.enabled); // should be true

// Clear and rebuild cache
await cacheService.clear();
```

#### 5. Jobs Not Processing

**Symptom:** Jobs stuck in queue

**Solution:**
```javascript
// Check queue stats
const stats = await getAllQueueStats();
console.log(stats);

// Resume paused queue
await resumeQueue('email');
```

#### 6. Validation Errors

**Symptom:** All requests returning 400

**Solution:**
```javascript
// Check schema matches your data
import { createLeadSchema } from './validators/lead.validator.js';
console.log(createLeadSchema);

// Verify request body structure
```

#### 7. Log Files Growing Large

**Symptom:** `logs/` directory using too much disk

**Solution:**
```bash
# Clean old logs
find logs -name "*.log" -mtime +7 -delete

# Or configure log rotation in logger.js
```

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

View debug logs:

```bash
tail -f logs/debug.log
```

### Health Checks

Verify system health:

```bash
# Overall health
curl http://localhost:3002/health

# Database
curl http://localhost:3002/health/db

# Redis
curl http://localhost:3002/health/redis

# Queue stats
curl http://localhost:3002/metrics | jq '.queues'
```

### Performance Issues

Check metrics:

```bash
# Get performance metrics
curl http://localhost:3002/metrics

# Check slow queries
# View logs/combined.log for queries > 1000ms
```

---

## Migration Guide

### Migrating from Old API

If you're upgrading from the previous API version:

#### 1. Update Imports

```javascript
// Old
const config = require('./config');

// New
import config from './config/app.config.js';
```

#### 2. Update Error Handling

```javascript
// Old
try {
  // ...
} catch (error) {
  res.status(500).json({ error: error.message });
}

// New
import { asyncHandler } from './middleware/error-handler.js';
import { NotFoundError } from './utils/errors.js';

router.get('/resource', asyncHandler(async (req, res) => {
  if (!resource) throw new NotFoundError('Resource not found');
  res.json({ data: resource });
}));
```

#### 3. Add Validation

```javascript
// Old
router.post('/leads', async (req, res) => {
  const lead = await createLead(req.body);
  res.json(lead);
});

// New
import { validate } from './middleware/validate.js';
import { createLeadSchema } from './validators/lead.validator.js';

router.post('/leads',
  validate(createLeadSchema),
  asyncHandler(async (req, res) => {
    const lead = await createLead(req.body);
    res.json({ data: lead });
  })
);
```

#### 4. Update Database Calls

```javascript
// Old
const { data } = await supabase
  .from('leads')
  .select('*')
  .eq('user_id', userId);

// New
import { paginatedQuery } from './utils/database.js';

const result = await paginatedQuery('leads', {
  filters: { user_id: userId },
  page: req.query.page || 1,
  limit: req.query.limit || 20
});
```

---

## Additional Resources

### Related Documentation

- [IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md) - Summary of all changes
- [API_DIAGNOSTIC_REPORT.md](./API_DIAGNOSTIC_REPORT.md) - Issues found and fixed
- [API_IMPROVEMENT_PLAN.md](./API_IMPROVEMENT_PLAN.md) - Implementation plan

### External Documentation

- [Express.js](https://expressjs.com/)
- [Supabase](https://supabase.com/docs)
- [Redis](https://redis.io/documentation)
- [Bull](https://github.com/OptimalBits/bull)
- [Winston](https://github.com/winstonjs/winston)
- [Zod](https://zod.dev/)

---

## Support

For issues or questions:

1. Check this documentation
2. Review logs in `logs/` directory
3. Check health endpoints
4. Review metrics at `/metrics`
5. Check Supabase dashboard for database issues

---

**Last Updated:** 2024-01-15
**API Version:** v1
**Documentation Version:** 1.0.0
