# Getting Started with Axolop CRM

**Your 15-Minute Guide to CRM Mastery**

Welcome to Axolop CRM! This guide will get you from zero to productive in 15 minutes.

---

## 🎯 What You'll Learn

1. **First Login** (2 minutes)
2. **Import Your Contacts** (3 minutes)
3. **Send Your First Campaign** (5 minutes)
4. **Set Up Your First Automation** (5 minutes)
5. **Make Your First Call** (Optional)

---

## Step 1: First Login (2 minutes)

### Access Your CRM
1. Open your browser to `http://localhost:3000` (development) or your production URL
2. Sign in with your email and password
3. You'll land on the **Dashboard**

### Dashboard Overview
Your dashboard shows:
- **Today's Activities** - Recent interactions
- **Pipeline Value** - Total value of open deals
- **Win Rate** - Percentage of deals won
- **Recent Leads** - Latest leads added
- **Email Stats** - Campaign performance
- **Upcoming Meetings** - Your calendar

### Quick Tour
Click through the sidebar to explore:
- **Dashboard** - Your command center
- **Leads** - All your prospects
- **Contacts** - Your relationships
- **Opportunities** - Your deals
- **Activities** - All interactions
- **Email Marketing** - Campaigns and lists
- **Forms** - Lead capture forms
- **Workflows** - Automation builder
- **Calendar** - Meetings and events
- **Live Calls** - Sales dialer
- **Inbox** - Email integration

---

## Step 2: Import Your Contacts (3 minutes)

### Option A: Import from CSV

1. Go to **Contacts** in the sidebar
2. Click **Import** button (top right)
3. Download the sample CSV template
4. Fill in your contacts (minimum: name, email)
5. Upload your CSV file
6. Map columns (Name → Name, Email → Email)
7. Click **Import**

**CSV Format:**
```csv
First Name,Last Name,Email,Phone,Company,Title
John,Doe,john@example.com,555-0100,Acme Inc,CEO
Jane,Smith,jane@example.com,555-0101,Widget Co,CTO
```

### Option B: Add Manually

1. Go to **Contacts**
2. Click **New Contact** button
3. Fill in the form:
   - First Name (required)
   - Last Name (required)
   - Email (required)
   - Phone (optional)
   - Company (optional)
   - Title (optional)
4. Click **Save**

### Option C: Connect Gmail

1. Go to **Settings** → **Integrations**
2. Click **Connect Gmail**
3. Authorize Axolop CRM
4. Your contacts will sync automatically

---

## Step 3: Send Your First Campaign (5 minutes)

### Create Your Campaign

1. Go to **Email Marketing** → **Campaigns**
2. Click **New Campaign**
3. Fill in campaign details:
   - **Name:** "Welcome Campaign" (internal name)
   - **Subject:** "Welcome to [Your Company]!"
   - **From Name:** Your name
   - **From Email:** your-email@domain.com

### Design Your Email

4. Choose a template or start from scratch
5. Use the drag-and-drop editor:
   - Add **Text Block** for your message
   - Add **Button Block** for CTA
   - Add **Image Block** for visuals
6. Personalize with merge fields:
   - `{{first_name}}` - Contact's first name
   - `{{company}}` - Contact's company
   - `{{email}}` - Contact's email

**Example Email:**
```
Hi {{first_name}},

Welcome to [Your Company]! We're excited to have you here.

As a [Company] professional, we thought you'd be interested in our latest features...

[Learn More Button]

Best regards,
[Your Name]
```

### Select Recipients

7. Choose recipients:
   - **All Contacts** - Send to everyone
   - **Segment** - Choose specific tags/filters
   - **List** - Select a custom list

### Send or Schedule

8. Options:
   - **Send Now** - Immediate delivery
   - **Schedule** - Choose date/time
   - **Test Email** - Send to yourself first (recommended)

9. Review your campaign
10. Click **Send** or **Schedule**

### Track Performance

11. Go to **Email Marketing** → **Analytics**
12. Monitor:
    - Open rate
    - Click-through rate
    - Unsubscribes
    - Bounces

---

## Step 4: Set Up Your First Automation (5 minutes)

### Create a Welcome Sequence

1. Go to **Workflows** → **Automation**
2. Click **New Workflow**
3. Name it "Welcome Sequence"

### Build the Workflow

4. **Add Trigger:**
   - Click **Add Trigger**
   - Select "Contact Created"
   - This fires when a new contact is added

5. **Add Action 1: Wait 1 Day**
   - Click **+** to add action
   - Select "Wait"
   - Enter "1" day

6. **Add Action 2: Send Email**
   - Click **+** to add action
   - Select "Send Email"
   - Choose your welcome email template
   - Or create new email inline

7. **Add Action 3: Wait 3 Days**
   - Add another "Wait" action
   - Enter "3" days

8. **Add Action 4: Create Task**
   - Add "Create Task" action
   - Task: "Follow up with {{first_name}}"
   - Assign to: Yourself
   - Due: Today

### Activate Workflow

9. Review the workflow
10. Click **Activate**
11. New contacts will automatically enter this workflow

### Pre-Built Templates

**Quick Start Templates:**
- **Welcome Series** - Onboard new contacts
- **Lead Nurture** - Educate prospects over time
- **Re-engagement** - Win back inactive contacts
- **Meeting Reminders** - Auto-remind before meetings
- **Follow-Up Sequence** - Auto-follow-up after calls

---

## Step 5: Make Your First Call (Optional)

### Prerequisites
- Twilio account configured
- Phone number added to system
- Leads in call queue

### Start Calling

1. Go to **Live Calls**
2. You'll see the **Dialer** tab
3. Click **Next Call** to load first lead
4. Review lead information:
   - Name, company, title
   - Previous interactions
   - Call script (if available)
5. Click green **Call** button
6. Call connects via Twilio
7. Take notes during call
8. After call:
   - Call is auto-recorded
   - Transcription generated (if OpenAI enabled)
   - AI summary created
   - Next steps recommended

### Call Queue Management

**Add Leads to Queue:**
1. Go to **Leads**
2. Select leads (checkbox)
3. Click **Add to Call Queue**
4. Choose priority (High/Medium/Low)

**Organize Queue:**
1. Go to **Live Calls** → **Queue** tab
2. Drag to reorder
3. Set priorities
4. Skip leads if needed

### Call Analytics

View performance:
1. Go to **Live Calls** → **Analytics** tab
2. See:
   - Calls made today
   - Average call duration
   - Conversion rate
   - Top performers

---

## 🎓 Next Steps

### Essential Training (30 minutes)

**Week 1:**
- [ ] Import all contacts
- [ ] Set up email signature
- [ ] Create 3 email templates
- [ ] Build first automation workflow
- [ ] Create first lead capture form

**Week 2:**
- [ ] Connect Google Calendar
- [ ] Set up meeting types
- [ ] Share booking link with customers
- [ ] Create sales pipeline stages
- [ ] Add first 10 opportunities

**Week 3:**
- [ ] Set up Twilio for calls
- [ ] Create call scripts
- [ ] Make 20 calls
- [ ] Review call transcripts
- [ ] Optimize scripts based on AI insights

**Week 4:**
- [ ] Build advanced automation
- [ ] Create custom reports
- [ ] Set up lead scoring
- [ ] Train team members
- [ ] Launch major campaign

### Advanced Features

**Power User Training:**
- [ ] Custom fields and data structure
- [ ] Advanced segmentation
- [ ] A/B testing campaigns
- [ ] Custom reports and dashboards
- [ ] API integrations
- [ ] Workflow branching logic
- [ ] Lead scoring rules
- [ ] Territory management

---

## 💡 Pro Tips

### Email Marketing
- **Warm Up Domain:** Start with small sends, gradually increase
- **Test Everything:** Always send test emails first
- **Segment Your Lists:** Targeted emails perform 3x better
- **Personalize:** Use merge fields for better engagement
- **Mobile Optimize:** 60% of emails opened on mobile

### Automation
- **Start Simple:** Begin with 2-3 step workflows
- **Test First:** Use test contacts before activating
- **Monitor Performance:** Check analytics weekly
- **Iterate:** Improve based on data
- **Don't Over-Automate:** Keep human touch

### Calling
- **Prepare:** Review lead info before calling
- **Use Scripts:** But sound natural
- **Take Notes:** During and after calls
- **Follow Up:** Within 24 hours
- **Review Transcripts:** Learn from AI insights

### Data Management
- **Clean Data:** Remove duplicates monthly
- **Consistent Format:** Standardize phone numbers, names
- **Tag Everything:** Use tags for easy filtering
- **Update Regularly:** Keep data current
- **Backup:** Export data monthly

---

## 🔧 Common Tasks

### How to Create a Segment
1. Go to **Contacts**
2. Click **Filter** icon
3. Add conditions (e.g., "Tag contains 'VIP'")
4. Click **Save as Segment**
5. Name your segment

### How to Create a Form
1. Go to **Forms**
2. Click **New Form**
3. Drag fields from left panel
4. Configure field settings
5. Style your form
6. Click **Publish**
7. Copy embed code

### How to Schedule a Meeting
1. Go to **Calendar**
2. Click **New Meeting**
3. Choose meeting type
4. Fill in details
5. Add attendees
6. Click **Save**
7. Invites sent automatically

### How to Create a Deal
1. Go to **Opportunities**
2. Click **New Opportunity**
3. Fill in:
   - Deal name
   - Contact/Company
   - Value
   - Expected close date
   - Stage
4. Click **Save**

### How to Generate a Report
1. Go to **Dashboard** → **Reports**
2. Click **New Report**
3. Choose report type
4. Select metrics
5. Add filters
6. Choose date range
7. Click **Generate**
8. Export to CSV/PDF

---

## 🆘 Getting Help

### Documentation
- **Full Docs:** [docs/README.md](README.md)
- **Features Overview:** [docs/FEATURES_OVERVIEW.md](FEATURES_OVERVIEW.md)
- **Setup Guide:** [SYSTEM_STATUS_AND_SETUP_GUIDE.md](../SYSTEM_STATUS_AND_SETUP_GUIDE.md)

### Support
- **System Health Check:** Run `node scripts/system-health-check.js`
- **API Health:** `curl http://localhost:3002/health`
- **Backend Logs:** Check terminal where backend is running
- **Frontend Logs:** Open browser console (F12)

### Common Issues
- **Port conflicts:** [Troubleshooting guide](../README.md#troubleshooting)
- **SendGrid not working:** [SendGrid setup](sendgrid/SENDGRID_QUICK_REFERENCE.md)
- **Calendar not syncing:** [Calendar setup](setup/CALENDAR_SETUP_GUIDE.md)
- **Calls not working:** [Integration guide](setup/INTEGRATION_GUIDE.md)

---

## 📊 Success Metrics

Track these KPIs weekly:

### Sales Metrics
- [ ] Leads created
- [ ] Opportunities created
- [ ] Deals won
- [ ] Revenue generated
- [ ] Average deal size
- [ ] Win rate
- [ ] Sales cycle length

### Marketing Metrics
- [ ] Email subscribers
- [ ] Email open rate (target: 20%+)
- [ ] Email click rate (target: 3%+)
- [ ] Form submissions
- [ ] Website traffic
- [ ] Conversion rate

### Activity Metrics
- [ ] Calls made
- [ ] Emails sent
- [ ] Meetings booked
- [ ] Tasks completed
- [ ] Notes added

---

## 🎯 30-Day Success Plan

### Week 1: Foundation
- [ ] Import all contacts
- [ ] Set up integrations (Gmail, Calendar)
- [ ] Create email templates
- [ ] Build first form
- [ ] Launch welcome automation

### Week 2: Engagement
- [ ] Send first email campaign
- [ ] Make 50 calls
- [ ] Book 10 meetings
- [ ] Create 20 opportunities
- [ ] Set up dashboard widgets

### Week 3: Optimization
- [ ] Review email analytics
- [ ] Optimize call scripts
- [ ] A/B test email subject lines
- [ ] Clean contact database
- [ ] Train team members

### Week 4: Scale
- [ ] Launch advanced automations
- [ ] Create custom reports
- [ ] Implement lead scoring
- [ ] Set up advanced workflows
- [ ] Plan next month's campaigns

---

**You're Ready to Go!** 🚀

Start with Steps 1-4 today, then explore advanced features as you get comfortable. Remember: the best CRM is the one you actually use. Keep it simple, stay consistent, and watch your business grow.

**Questions?** Check the [full documentation](README.md) or run the health check: `node scripts/system-health-check.js`

---

**Last Updated:** 2025-01-17
**Estimated Reading Time:** 15 minutes
**Difficulty:** Beginner
