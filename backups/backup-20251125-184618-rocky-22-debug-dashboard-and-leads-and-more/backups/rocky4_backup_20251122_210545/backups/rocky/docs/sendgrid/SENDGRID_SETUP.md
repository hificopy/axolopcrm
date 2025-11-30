# SendGrid Integration Setup Guide

## Overview

This guide walks you through setting up SendGrid as your primary email marketing platform for Axolop CRM. SendGrid will handle:

- ✅ Marketing campaigns and newsletters
- ✅ Transactional emails (password resets, notifications)
- ✅ Bulk email sending
- ✅ Email analytics and tracking
- ✅ Bounce and spam management
- ✅ Unsubscribe handling (legal compliance)

---

## Step 1: Create SendGrid Account

1. **Sign up for SendGrid**
   - Go to: https://signup.sendgrid.com/
   - Choose the plan that fits your needs:
     - **Free**: 100 emails/day forever
     - **Essentials**: $19.95/month - 50K emails
     - **Pro**: $89.95/month - 100K emails + advanced features

2. **Verify your email address**
   - Check your inbox for verification email
   - Click the verification link

---

## Step 2: Get Your SendGrid API Key

1. **Log in to SendGrid Dashboard**
   - Go to: https://app.sendgrid.com/

2. **Navigate to API Keys**
   - Click: **Settings** → **API Keys**
   - Or go directly to: https://app.sendgrid.com/settings/api_keys

3. **Create a new API key**
   - Click **"Create API Key"**
   - Name it: `Axolop CRM Production` (or similar)
   - Permission: Select **"Full Access"** (recommended for full CRM functionality)
   - Click **"Create & View"**

4. **Copy your API key**
   - **IMPORTANT**: Copy the API key immediately - you can only see it once!
   - It should look like: `SG.xxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Step 3: Configure Your Environment Variables

1. **Open your `.env` file** (or create one from `.env.example`)

2. **Add SendGrid credentials**:
   ```bash
   # SendGrid Configuration
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=Axolop CRM
   ```

3. **Important Notes**:
   - Replace `yourdomain.com` with your actual domain
   - The `FROM_EMAIL` must be verified in SendGrid (see Step 4)
   - Use a professional sender name (e.g., "Your Company CRM")

---

## Step 4: Verify Your Sender Email/Domain

SendGrid requires you to verify your sender identity before sending emails.

### Option A: Single Sender Verification (Quick - 5 minutes)

1. **Go to Sender Authentication**
   - Navigate to: **Settings** → **Sender Authentication**
   - Click **"Verify a Single Sender"**

2. **Fill in sender details**:
   - From Name: `Axolop CRM` (or your company name)
   - From Email: `noreply@yourdomain.com`
   - Reply To: `support@yourdomain.com` (optional)
   - Company Address: Your business address

3. **Verify the email**
   - Check your inbox at the sender email
   - Click verification link
   - Status will change to ✅ "Verified"

### Option B: Domain Authentication (Recommended - 15 minutes)

**Why domain authentication?**
- ✅ Better deliverability rates
- ✅ Verify entire domain at once
- ✅ Send from any email@yourdomain.com
- ✅ Looks more professional

1. **Go to Domain Authentication**
   - Navigate to: **Settings** → **Sender Authentication**
   - Click **"Authenticate Your Domain"**

2. **Enter your domain**
   - Domain: `yourdomain.com`
   - DNS Provider: Select your provider (Cloudflare, GoDaddy, etc.)

3. **Add DNS records**
   - SendGrid will provide 3 DNS records (CNAME records)
   - Copy each record to your DNS provider
   - Example DNS records:
     ```
     em1234.yourdomain.com → CNAME → u1234567.wl.sendgrid.net
     s1._domainkey.yourdomain.com → CNAME → s1.domainkey.u1234567.wl.sendgrid.net
     s2._domainkey.yourdomain.com → CNAME → s2.domainkey.u1234567.wl.sendgrid.net
     ```

4. **Verify DNS propagation**
   - Click **"Verify"** in SendGrid
   - DNS changes can take 24-48 hours (usually 15 minutes)
   - Check status: ✅ "Verified" when complete

---

## Step 5: Configure SendGrid Webhooks (Critical for Analytics)

Webhooks allow your CRM to receive real-time email events (opens, clicks, bounces).

1. **Go to Event Webhook Settings**
   - Navigate to: **Settings** → **Mail Settings** → **Event Webhook**
   - Or go to: https://app.sendgrid.com/settings/mail_settings

2. **Enable Event Webhook**
   - Toggle: **"Event Webhook: ON"**

3. **Set your webhook URL**
   - HTTP Post URL: `https://yourdomain.com/api/sendgrid/webhook`
   - Replace `yourdomain.com` with your actual domain
   - For local testing use: `https://your-ngrok-url.ngrok.io/api/sendgrid/webhook`

4. **Select events to track** (enable ALL of these):
   - ✅ Delivered
   - ✅ Opened
   - ✅ Clicked
   - ✅ Bounced
   - ✅ Dropped
   - ✅ Spam Report
   - ✅ Unsubscribe

5. **Test the webhook**
   - Click **"Test Your Integration"**
   - Check your backend logs to confirm receipt
   - You should see: `Received X SendGrid webhook events`

---

## Step 6: Install Dependencies

Run the following command in your project directory:

```bash
npm install @sendgrid/mail @sendgrid/client
```

This will install:
- `@sendgrid/mail` - For sending emails
- `@sendgrid/client` - For API calls (contacts, templates, lists)

---

## Step 7: Initialize Database Schema

Run the SendGrid database schema to create necessary tables:

```bash
# Connect to your Supabase database
psql "postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Run the schema file
\i scripts/sendgrid-schema.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `scripts/sendgrid-schema.sql`
3. Click **"Run"**

This creates tables for:
- Email events (opens, clicks, bounces)
- Suppression lists (unsubscribes, spam reports)
- Contact sync tracking
- Template sync tracking
- Analytics cache

---

## Step 8: Start Your Backend

```bash
npm run dev
```

Check the console output for:
```
✅ Email provider: SendGrid
```

If you see this, SendGrid is successfully configured!

---

## Step 9: Test the Integration

### Test 1: Check Health Endpoint

```bash
curl http://localhost:3002/api/sendgrid/health
```

Expected response:
```json
{
  "success": true,
  "provider": "sendgrid",
  "configured": true,
  "apiKeyPresent": true,
  "fromEmail": "noreply@yourdomain.com",
  "fromName": "Axolop CRM"
}
```

### Test 2: Send a Test Email

Create a test campaign in the CRM UI:
1. Go to **Email Marketing** → **Campaigns**
2. Click **"New Campaign"**
3. Fill in details and send to yourself
4. Check your inbox

### Test 3: Verify Webhook Events

1. Send a test email (from Test 2)
2. Open the email
3. Click a link in the email
4. Check your database:
   ```sql
   SELECT * FROM email_events ORDER BY timestamp DESC LIMIT 10;
   ```
5. You should see events: `delivered`, `open`, `click`

---

## Step 10: Request Production Access (Important!)

By default, SendGrid puts new accounts in **"Sandbox Mode"** which restricts sending to verified emails only.

### To remove sandbox mode:

1. **Go to Settings**
   - Navigate to: **Settings** → **Account Details**

2. **Complete your profile**
   - Add company info
   - Add billing details
   - Verify phone number

3. **Request production access**
   - SendGrid will review your account (usually 24-48 hours)
   - You'll receive an email when approved

4. **Check your status**
   - Look for: **"Account Status: Active"**
   - Sandbox badge should be removed

---

## SendGrid Features Now Available

Once setup is complete, your CRM has access to:

### ✅ Email Sending
- Single emails
- Bulk campaigns
- Template-based emails
- Scheduled sending

### ✅ Contact Management
- Sync contacts to SendGrid
- Segment by custom fields
- Create contact lists
- Import/export contacts

### ✅ Analytics & Tracking
- Real-time open/click tracking
- Engagement metrics
- Campaign performance
- Geographic data
- Device/client data

### ✅ Compliance & Deliverability
- Automatic unsubscribe handling
- Bounce management
- Spam report tracking
- Suppression list management
- List hygiene

### ✅ Advanced Features
- A/B testing (Pro plan)
- Template management
- Email scheduling
- Category tracking
- Custom arguments

---

## API Endpoints Available

Your CRM now has these SendGrid endpoints:

```
POST   /api/sendgrid/webhook              # Webhook for email events
GET    /api/sendgrid/stats                # Get email statistics
GET    /api/sendgrid/suppressions         # Get suppression lists
POST   /api/sendgrid/suppressions/sync    # Sync suppressions to DB
POST   /api/sendgrid/contacts/sync        # Sync single contact
POST   /api/sendgrid/contacts/bulk-sync   # Sync multiple contacts
POST   /api/sendgrid/templates            # Create email template
GET    /api/sendgrid/health               # Check integration health
```

---

## Maintenance Tasks

### Daily Automatic Sync (Recommended)

Set up a cron job to sync analytics daily:

```javascript
// In your cron scheduler
import SendGridAnalyticsSync from './backend/services/sendgrid-analytics-sync.js';

const analyticsSync = new SendGridAnalyticsSync();

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  await analyticsSync.scheduledSync();
});
```

### Manual Sync Commands

```bash
# Sync last 30 days of analytics
node -e "import('./backend/services/sendgrid-analytics-sync.js').then(m => new m.default().syncAnalytics(30))"

# Sync suppression lists
node -e "import('./backend/services/email-service.js').then(m => new m.default().syncSuppressionLists())"
```

---

## Troubleshooting

### Error: "The from email does not match a verified Sender Identity"
**Solution**: Verify your sender email in Step 4

### Error: "API key not found"
**Solution**: Double-check your `.env` file has `SENDGRID_API_KEY` set

### Webhook events not received
**Solution**:
1. Check webhook URL is publicly accessible
2. Use ngrok for local testing
3. Verify webhook is enabled in SendGrid
4. Check backend logs for errors

### Emails going to spam
**Solution**:
1. Complete domain authentication (Step 4 Option B)
2. Set up SPF, DKIM, DMARC records
3. Request dedicated IP (Pro plan)
4. Warm up your IP gradually

### Low delivery rates
**Solution**:
1. Clean your email lists regularly
2. Remove bounced/unsubscribed emails
3. Monitor spam complaints
4. Use double opt-in for new subscribers

---

## Best Practices

1. **Always use verified sender addresses**
2. **Enable all webhook events** for complete tracking
3. **Sync suppression lists daily** to maintain list hygiene
4. **Monitor bounce rates** - keep below 5%
5. **Respect unsubscribes** - legally required (CAN-SPAM, GDPR)
6. **Use segmentation** for better engagement
7. **Test emails** before sending to large lists
8. **Warm up new IPs** gradually (Pro plan)
9. **Monitor your sender reputation** in SendGrid dashboard
10. **Keep contact lists clean** - remove inactive subscribers

---

## Support Resources

- **SendGrid Documentation**: https://docs.sendgrid.com/
- **SendGrid Support**: https://support.sendgrid.com/
- **API Reference**: https://docs.sendgrid.com/api-reference
- **Status Page**: https://status.sendgrid.com/

---

## Next Steps

Now that SendGrid is integrated:

1. ✅ Create your first email campaign
2. ✅ Set up email automation workflows
3. ✅ Import your contact lists
4. ✅ Design email templates
5. ✅ Monitor analytics dashboard
6. ✅ Set up A/B testing (Pro plan)

Your Axolop CRM is now ready to send professional emails at scale! 🚀
