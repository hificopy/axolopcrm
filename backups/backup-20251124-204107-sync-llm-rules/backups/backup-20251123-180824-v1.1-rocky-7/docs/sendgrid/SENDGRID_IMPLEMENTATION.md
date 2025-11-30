# SendGrid Implementation Reference

## Quick Start

This guide shows you how to use SendGrid features in your Axolop CRM code.

---

## Basic Email Sending

### Send a Simple Email

```javascript
import EmailService from './backend/services/email-service.js';

const emailService = new EmailService();

await emailService.sendEmail({
  to: 'customer@example.com',
  subject: 'Welcome to Axolop CRM!',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
  from: 'noreply@yourdomain.com',
  fromName: 'Axolop CRM'
});
```

### Send with CC/BCC

```javascript
await emailService.sendEmail({
  to: 'customer@example.com',
  cc: ['manager@yourdomain.com'],
  bcc: ['archive@yourdomain.com'],
  subject: 'Important Update',
  html: '<p>Email content here</p>'
});
```

### Send with Attachments

```javascript
await emailService.sendEmail({
  to: 'customer@example.com',
  subject: 'Invoice #12345',
  html: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      content: base64FileContent,
      filename: 'invoice-12345.pdf',
      type: 'application/pdf',
      disposition: 'attachment'
    }
  ]
});
```

---

## Campaign Management

### Send Campaign Email

```javascript
// This method handles:
// - Template rendering
// - Personalization
// - Tracking pixel insertion
// - Campaign analytics

await emailService.sendCampaignEmail(
  campaignId,          // UUID of campaign
  {                    // Recipient object
    email: 'customer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    company: 'Acme Inc',
    custom_fields: {
      subscription: 'premium',
      signup_date: '2025-01-01'
    }
  },
  leadId,             // Optional: UUID of lead
  contactId           // Optional: UUID of contact
);
```

### Placeholder Replacement

The system automatically replaces these placeholders in your email content:

```javascript
// Email template:
`
Hello {{firstName}} {{lastName}},

Thanks for choosing {{company}}!

{{customField}}
`

// Gets rendered as:
`
Hello John Doe,

Thanks for choosing Acme Inc!

Premium Subscription
`
```

---

## Contact Sync

### Sync Single Contact to SendGrid

```javascript
await emailService.syncContactToSendGrid({
  email: 'customer@example.com',
  firstName: 'John',
  lastName: 'Doe',
  company: 'Acme Inc',
  phone: '+1-555-0100',
  industry: 'Technology',
  leadScore: 85,
  id: 'contact-uuid-here'
});
```

### Bulk Contact Sync

```javascript
const contacts = [
  { email: 'john@example.com', firstName: 'John', ... },
  { email: 'jane@example.com', firstName: 'Jane', ... },
  // ... more contacts
];

await emailService.syncContactsToSendGrid(contacts);
```

---

## Analytics & Tracking

### Get Email Statistics

```javascript
import SendGridAnalyticsSync from './backend/services/sendgrid-analytics-sync.js';

const analyticsSync = new SendGridAnalyticsSync();

// Get last 30 days of cached analytics
const analytics = await analyticsSync.getCachedAnalytics({
  days: 30
});

console.log(analytics.totals);
// {
//   requests: 10000,
//   delivered: 9800,
//   uniqueOpens: 2940,
//   uniqueClicks: 980,
//   openRate: 30.00,
//   clickRate: 10.00,
//   bounceRate: 2.00
// }
```

### Get Campaign Performance

```javascript
const campaignAnalytics = await analyticsSync.getCampaignAnalytics(campaignId);

console.log(campaignAnalytics.analytics);
// {
//   name: 'Welcome Series',
//   total_sent: 1245,
//   delivered: 1230,
//   opened: 420,
//   clicked: 180,
//   open_rate: 34.15,
//   click_rate: 14.63,
//   bounced: 15
// }
```

### Get Top Performing Campaigns

```javascript
const topCampaigns = await analyticsSync.getTopCampaigns(10);

topCampaigns.campaigns.forEach(campaign => {
  console.log(`${campaign.name}: ${campaign.open_rate}% open rate`);
});
```

### Get Engagement Metrics

```javascript
const metrics = await analyticsSync.getEngagementMetrics();

console.log(metrics.metrics);
// {
//   campaigns: { total: 24, activeWorkflows: 8 },
//   emails: { sent: 12458, delivered: 12345, opened: 3508, clicked: 1245 },
//   rates: { deliveryRate: 99.09, openRate: 28.4, clickRate: 10.1, bounceRate: 0.91 },
//   contacts: 5432
// }
```

---

## Suppression Management

### Get All Suppression Lists

```javascript
const suppressions = await emailService.getSuppressionLists();

console.log(suppressions.bounces.length);      // Bounced emails
console.log(suppressions.unsubscribes.length); // Unsubscribed emails
console.log(suppressions.spamReports.length);  // Spam complaints
console.log(suppressions.blocks.length);       // Blocked emails
```

### Check if Email is Suppressed

```javascript
const isSuppressed = await emailService.isEmailSuppressed('customer@example.com');

if (isSuppressed) {
  console.log('Cannot send to this email');
}
```

### Sync Suppression Lists to Database

```javascript
// Sync all suppression lists from SendGrid to Supabase
const result = await emailService.syncSuppressionLists();

console.log(`Synced ${result.totalSynced} suppressed emails`);
```

---

## Template Management

### Create Email Template

```javascript
await emailService.createEmailTemplate({
  name: 'Welcome Email v1',
  subject: 'Welcome to {{company}}!',
  htmlContent: `
    <html>
      <body>
        <h1>Welcome {{firstName}}!</h1>
        <p>Thanks for joining {{company}}.</p>
      </body>
    </html>
  `,
  textContent: 'Welcome {{firstName}}! Thanks for joining {{company}}.'
});
```

### Send Using Template

```javascript
import SendGridService from './backend/services/sendgrid-service.js';

const sendgrid = new SendGridService();

await sendgrid.sendTemplateEmail({
  to: 'customer@example.com',
  templateId: 'd-1234567890abcdef', // SendGrid template ID
  templateData: {
    firstName: 'John',
    company: 'Axolop CRM',
    customData: 'value'
  },
  campaignId: 'campaign-uuid',
  contactId: 'contact-uuid'
});
```

---

## Webhook Event Processing

### Process Incoming Webhook

This is handled automatically by the webhook route, but you can also process events manually:

```javascript
// Webhook events arrive as an array
const events = [
  {
    email: 'customer@example.com',
    event: 'open',
    timestamp: 1641024000,
    sg_message_id: 'abc123',
    customArgs: {
      campaignId: 'campaign-uuid',
      leadId: 'lead-uuid',
      contactId: 'contact-uuid'
    }
  },
  // ... more events
];

await emailService.processWebhookEvents(events);
```

### Event Types Tracked

```javascript
// Event types you'll receive:
'delivered'    // Email successfully delivered
'open'         // Recipient opened email
'click'        // Recipient clicked link
'bounce'       // Email bounced (hard or soft)
'dropped'      // SendGrid dropped the email
'spamreport'   // Recipient marked as spam
'unsubscribe'  // Recipient unsubscribed
```

---

## Automation Examples

### Welcome Email Automation

```javascript
// When a new contact is created, send welcome email
async function handleNewContact(contact) {
  // Sync to SendGrid
  await emailService.syncContactToSendGrid(contact);

  // Send welcome email
  await emailService.sendEmail({
    to: contact.email,
    subject: `Welcome to Axolop CRM, ${contact.firstName}!`,
    html: `
      <h1>Welcome ${contact.firstName}!</h1>
      <p>We're excited to have you as part of ${contact.company}.</p>
    `,
    categories: ['welcome', 'onboarding'],
    customArgs: {
      contactId: contact.id,
      automationType: 'welcome-sequence'
    }
  });
}
```

### Abandoned Cart Email

```javascript
async function sendAbandonedCartEmail(cart) {
  const contact = await getContact(cart.contactId);

  await emailService.sendEmail({
    to: contact.email,
    subject: 'You left items in your cart!',
    html: `
      <h2>Don't forget about these items!</h2>
      ${cart.items.map(item => `
        <div>
          <h3>${item.name}</h3>
          <p>$${item.price}</p>
        </div>
      `).join('')}
      <a href="${cart.checkoutUrl}">Complete Your Purchase</a>
    `,
    categories: ['abandoned-cart', 'ecommerce'],
    customArgs: {
      cartId: cart.id,
      contactId: contact.id
    }
  });
}
```

### Drip Campaign

```javascript
async function scheduleDripCampaign(contact, sequence) {
  const emails = [
    { delay: 0, subject: 'Day 1: Getting Started', template: 'drip-day-1' },
    { delay: 3, subject: 'Day 3: Best Practices', template: 'drip-day-3' },
    { delay: 7, subject: 'Day 7: Advanced Tips', template: 'drip-day-7' },
  ];

  for (const email of emails) {
    // Schedule email in database
    await supabase.from('campaign_emails').insert({
      campaign_id: sequence.id,
      recipient_email: contact.email,
      recipient_name: `${contact.firstName} ${contact.lastName}`,
      contact_id: contact.id,
      status: 'PENDING',
      scheduled_at: new Date(Date.now() + email.delay * 24 * 60 * 60 * 1000)
    });
  }
}
```

---

## Analytics Sync (Scheduled Task)

### Set Up Daily Sync

```javascript
import cron from 'node-cron';
import SendGridAnalyticsSync from './backend/services/sendgrid-analytics-sync.js';

const analyticsSync = new SendGridAnalyticsSync();

// Run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Starting SendGrid analytics sync...');

  try {
    const result = await analyticsSync.scheduledSync();
    console.log('Sync completed:', result);
  } catch (error) {
    console.error('Sync failed:', error);
  }
});
```

### Manual Sync

```javascript
// Sync last 30 days
await analyticsSync.syncAnalytics(30);

// Sync last 7 days (for daily updates)
await analyticsSync.syncAnalytics(7);

// Get cached data (very fast)
const cachedStats = await analyticsSync.getCachedAnalytics({ days: 30 });
```

---

## Frontend Integration

### Call Analytics API

```javascript
// In your React component
import { useState, useEffect } from 'react';

function EmailAnalytics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      const response = await fetch('/api/sendgrid/stats?startDate=2025-01-01&endDate=2025-01-31');
      const data = await response.json();
      setStats(data.stats);
    }

    fetchStats();
  }, []);

  return (
    <div>
      <h2>Email Performance</h2>
      <p>Open Rate: {stats?.openRate}%</p>
      <p>Click Rate: {stats?.clickRate}%</p>
      <p>Emails Sent: {stats?.requests}</p>
    </div>
  );
}
```

### Sync Contact from Frontend

```javascript
async function syncContact(contact) {
  const response = await fetch('/api/sendgrid/contacts/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contact })
  });

  const result = await response.json();
  console.log('Contact synced:', result);
}
```

---

## Database Queries

### Get Email Events for a Campaign

```sql
SELECT
  email,
  event_type,
  timestamp,
  url,
  user_agent
FROM email_events
WHERE campaign_id = 'your-campaign-uuid'
ORDER BY timestamp DESC;
```

### Get Campaign Performance

```sql
SELECT * FROM campaign_performance
WHERE id = 'your-campaign-uuid';
```

### Get Suppressed Emails

```sql
SELECT
  email,
  type,
  reason,
  created_at
FROM email_suppressions
WHERE type = 'unsubscribes'
ORDER BY created_at DESC;
```

### Get Daily Performance Summary

```sql
SELECT * FROM email_performance_summary
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

---

## Error Handling

### Handle Send Failures

```javascript
try {
  await emailService.sendEmail({
    to: 'invalid-email',
    subject: 'Test',
    html: '<p>Test</p>'
  });
} catch (error) {
  if (error.statusCode === 400) {
    console.error('Invalid email address');
  } else if (error.statusCode === 401) {
    console.error('Invalid API key');
  } else if (error.statusCode === 413) {
    console.error('Email too large');
  } else {
    console.error('Send failed:', error.message);
  }
}
```

### Check Suppression Before Sending

```javascript
async function safeSendEmail(to, subject, html) {
  // Check if email is suppressed
  const isSuppressed = await emailService.isEmailSuppressed(to);

  if (isSuppressed) {
    console.log(`Skipping send to ${to} - email is suppressed`);
    return { success: false, reason: 'suppressed' };
  }

  // Send email
  return await emailService.sendEmail({ to, subject, html });
}
```

---

## Best Practices

### 1. Always Use Categories

```javascript
await emailService.sendEmail({
  to: 'customer@example.com',
  subject: 'Invoice',
  html: '<p>Invoice content</p>',
  categories: ['transactional', 'invoice', 'billing']
});
```

Categories help you:
- Filter analytics in SendGrid
- Track different email types
- Identify which campaigns perform best

### 2. Include Custom Arguments

```javascript
await emailService.sendEmail({
  to: 'customer@example.com',
  subject: 'Welcome',
  html: '<p>Welcome!</p>',
  customArgs: {
    campaignId: 'campaign-uuid',
    contactId: 'contact-uuid',
    source: 'signup-form',
    tier: 'premium'
  }
});
```

Custom arguments:
- Track email source in webhooks
- Link emails to database records
- Filter webhook events
- Build custom reports

### 3. Respect Unsubscribes

```javascript
// Check before every campaign send
const isSuppressed = await emailService.isEmailSuppressed(email);

if (isSuppressed) {
  // Skip this recipient
  continue;
}
```

### 4. Monitor Bounce Rates

```javascript
// Get bounces from last 7 days
const { data: bounces } = await supabase
  .from('email_events')
  .select('*')
  .eq('event_type', 'bounce')
  .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

const bounceRate = (bounces.length / totalSent) * 100;

if (bounceRate > 5) {
  console.warn('High bounce rate detected! Clean your list.');
}
```

### 5. Use Suppression Sync

```javascript
// Run daily to keep your database in sync
cron.schedule('0 3 * * *', async () => {
  await emailService.syncSuppressionLists();
});
```

---

## Testing

### Local Testing with Ngrok

1. **Start ngrok**:
   ```bash
   ngrok http 3001
   ```

2. **Update SendGrid webhook URL**:
   ```
   https://your-ngrok-url.ngrok.io/api/sendgrid/webhook
   ```

3. **Send test email and watch logs**:
   ```bash
   npm run dev
   # Watch for webhook events in console
   ```

### Send Test Email

```javascript
// Test email sending
const testEmail = await emailService.sendEmail({
  to: 'your-email@example.com',
  subject: 'SendGrid Integration Test',
  html: '<h1>Test successful!</h1><p>Your SendGrid integration is working.</p>',
  categories: ['test']
});

console.log('Test email sent:', testEmail.messageId);
```

---

## Monitoring & Debugging

### Check Integration Health

```bash
curl http://localhost:3002/api/sendgrid/health
```

### View Recent Email Events

```sql
SELECT
  email,
  event_type,
  timestamp,
  campaign_id
FROM email_events
ORDER BY timestamp DESC
LIMIT 100;
```

### Monitor Error Rates

```sql
SELECT
  DATE(timestamp) as date,
  event_type,
  COUNT(*) as count
FROM email_events
WHERE event_type IN ('bounce', 'dropped', 'spam_report')
GROUP BY DATE(timestamp), event_type
ORDER BY date DESC;
```

---

## Additional Resources

- **SendGrid API Docs**: https://docs.sendgrid.com/
- **Event Webhook Docs**: https://docs.sendgrid.com/for-developers/tracking-events/event
- **Best Practices**: https://sendgrid.com/resource/email-best-practices/

---

You now have full SendGrid integration with all features ready to use! 🚀
