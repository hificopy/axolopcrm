# SendGrid Quick Reference Card

## 🚀 Installation

```bash
npm install
```

---

## ⚙️ Environment Setup

```bash
# .env file
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Axolop CRM
```

---

## 🧪 Test Integration

```bash
# Check health
curl http://localhost:3002/api/sendgrid/health

# Should return:
# { "success": true, "configured": true }
```

---

## 📧 Send Email (Code)

```javascript
import EmailService from './backend/services/email-service.js';
const emailService = new EmailService();

await emailService.sendEmail({
  to: 'customer@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello!</h1>'
});
```

---

## 📊 Get Analytics

```javascript
import SendGridAnalyticsSync from './backend/services/sendgrid-analytics-sync.js';
const sync = new SendGridAnalyticsSync();

const stats = await sync.getCachedAnalytics({ days: 30 });
// stats.totals.openRate, stats.totals.clickRate, etc.
```

---

## 👥 Sync Contacts

```javascript
// Single contact
await emailService.syncContactToSendGrid({
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe'
});

// Multiple contacts
await emailService.syncContactsToSendGrid([
  { email: 'john@example.com', firstName: 'John' },
  { email: 'jane@example.com', firstName: 'Jane' }
]);
```

---

## 🚫 Check Suppressions

```javascript
// Check if email is suppressed
const suppressed = await emailService.isEmailSuppressed('test@example.com');

// Get all suppressions
const lists = await emailService.getSuppressionLists();
// lists.bounces, lists.unsubscribes, lists.spamReports
```

---

## 📅 Schedule Daily Sync

```javascript
import cron from 'node-cron';
import SendGridAnalyticsSync from './backend/services/sendgrid-analytics-sync.js';

const sync = new SendGridAnalyticsSync();

// Run daily at 2 AM
cron.schedule('0 2 * * *', () => sync.scheduledSync());
```

---

## 🔗 API Endpoints

```bash
GET    /api/sendgrid/health              # Check status
GET    /api/sendgrid/stats               # Get statistics
GET    /api/sendgrid/suppressions        # Get suppression lists
POST   /api/sendgrid/webhook             # SendGrid webhook
POST   /api/sendgrid/contacts/sync       # Sync contact
POST   /api/sendgrid/contacts/bulk-sync  # Bulk sync
POST   /api/sendgrid/templates           # Create template
```

---

## 📈 Database Queries

```sql
-- Get recent email events
SELECT * FROM email_events
ORDER BY timestamp DESC LIMIT 100;

-- Get campaign performance
SELECT * FROM campaign_performance
WHERE id = 'your-campaign-uuid';

-- Get suppressed emails
SELECT * FROM email_suppressions
WHERE type = 'unsubscribes';

-- Get daily stats
SELECT * FROM email_performance_summary
WHERE date >= CURRENT_DATE - 30;
```

---

## 🛠️ Common Tasks

### Send Campaign Email
```javascript
await emailService.sendCampaignEmail(
  campaignId,
  { email: 'customer@example.com', firstName: 'John' },
  leadId,
  contactId
);
```

### Create Template
```javascript
await emailService.createEmailTemplate({
  name: 'Welcome Email',
  subject: 'Welcome {{firstName}}!',
  htmlContent: '<h1>Welcome {{firstName}}!</h1>'
});
```

### Sync Suppressions
```javascript
await emailService.syncSuppressionLists();
```

---

## ⚡ Webhook Events

Events sent to `/api/sendgrid/webhook`:
- `delivered` - Email delivered
- `open` - Email opened
- `click` - Link clicked
- `bounce` - Email bounced
- `dropped` - SendGrid dropped email
- `spamreport` - Marked as spam
- `unsubscribe` - User unsubscribed

---

## 🎯 SendGrid Dashboard Links

- **Home**: https://app.sendgrid.com/
- **API Keys**: https://app.sendgrid.com/settings/api_keys
- **Sender Auth**: https://app.sendgrid.com/settings/sender_auth
- **Event Webhook**: https://app.sendgrid.com/settings/mail_settings
- **Stats**: https://app.sendgrid.com/stats

---

## 🔍 Troubleshooting

```bash
# Error: "from email does not match verified Sender"
# Solution: Verify sender in SendGrid dashboard

# Error: "API key not found"
# Solution: Check SENDGRID_API_KEY in .env

# Webhooks not working
# Solution: Check URL is publicly accessible
# Use ngrok for local testing: ngrok http 3001
```

---

## 📚 Documentation

- **Setup Guide**: `docs/SENDGRID_SETUP.md`
- **Implementation**: `docs/SENDGRID_IMPLEMENTATION.md`
- **Full Summary**: `SENDGRID_INTEGRATION_COMPLETE.md`

---

## ✅ Pre-Launch Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Set environment variables
- [ ] Create SendGrid account
- [ ] Get API key
- [ ] Verify sender email/domain
- [ ] Run database schema
- [ ] Configure webhook URL
- [ ] Test email sending
- [ ] Request production access

---

**Quick Help**: Check integration status at `/api/sendgrid/health`
