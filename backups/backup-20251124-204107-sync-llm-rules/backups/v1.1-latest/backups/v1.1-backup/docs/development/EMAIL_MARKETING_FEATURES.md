# Email Marketing & Automation System Documentation

## Overview

This document describes the email marketing and automation system built for the Axolop CRM, designed to provide ActiveCampaign 2.0 features with deep CRM integration.

## Core Features

### 1. Email Campaign Management
- **Campaign Creation**: Create one-time, drip, and sequence campaigns
- **Template System**: Reusable email templates with personalization
- **Scheduling**: Schedule campaigns for future delivery
- **A/B Testing**: Test different subject lines and content

### 2. Advanced Segmentation
- **Tag-based Segmentation**: Target contacts based on assigned tags
- **Field-based Segmentation**: Filter by lead/prospect properties
- **Dynamic Segments**: Segments that update in real-time

### 3. Visual Workflow Builder (Automation Engine)
- **Drag & Drop Interface**: Visual builder similar to ActiveCampaign
- **Multiple Triggers**: Email opens, clicks, form submissions, lead creation, etc.
- **Conditional Logic**: If/else conditions for branching workflows
- **Action Types**: Send emails, update fields, create tasks, assign tags

### 4. Deep CRM Integration
- **Lead/Contact Sync**: Real-time synchronization with CRM data
- **Personalization Tokens**: Use CRM fields in emails
- **Activity Tracking**: Record email interactions in CRM

### 5. Newsletter Functionality
- **Simple Newsletter Builder**: Beehive-style newsletter creation
- **Template Library**: Pre-built newsletter templates
- **Subscriber Management**: Track and manage newsletter subscribers

### 6. Analytics & Reporting
- **Real-time Metrics**: Open rates, click rates, conversion tracking
- **Performance Analytics**: Campaign performance over time
- **Engagement Reports**: Track contact engagement levels

## API Endpoints

### Email Campaigns
```
GET    /api/email-marketing/campaigns        # List campaigns
POST   /api/email-marketing/campaigns        # Create campaign
GET    /api/email-marketing/campaigns/:id    # Get campaign details
PUT    /api/email-marketing/campaigns/:id    # Update campaign
DELETE /api/email-marketing/campaigns/:id    # Delete campaign
POST   /api/email-marketing/campaigns/:id/send  # Send campaign
POST   /api/email-marketing/campaigns/:id/send-test  # Send test
GET    /api/email-marketing/campaigns/:id/stats  # Get stats
```

### Email Templates
```
GET    /api/email-marketing/templates        # List templates
POST   /api/email-marketing/templates        # Create template
GET    /api/email-marketing/templates/:id    # Get template
PUT    /api/email-marketing/templates/:id    # Update template
DELETE /api/email-marketing/templates/:id    # Delete template
```

### Automation Workflows
```
GET    /api/email-marketing/workflows        # List workflows
POST   /api/email-marketing/workflows        # Create workflow
GET    /api/email-marketing/workflows/:id    # Get workflow
PUT    /api/email-marketing/workflows/:id    # Update workflow
DELETE /api/email-marketing/workflows/:id    # Delete workflow
POST   /api/email-marketing/workflows/:id/toggle  # Toggle active status
GET    /api/email-marketing/workflows/:id/executions  # Get executions
POST   /api/email-marketing/workflows/:id/trigger  # Manual trigger
```

### Segments
```
GET    /api/email-marketing/segments         # List segments
POST   /api/email-marketing/segments         # Create segment
```

### Recipients & Analytics
```
GET    /api/email-marketing/recipients       # Get all recipients
GET    /api/email-marketing/analytics        # Get analytics
GET    /api/email-marketing/analytics/engagement  # Get engagement analytics
```

## Database Schema

### Core Models

#### EmailCampaign
- **id**: Unique identifier
- **name**: Campaign name
- **subject**: Email subject line
- **htmlContent**: HTML version of email
- **textContent**: Plain text version
- **type**: Campaign type (ONE_TIME, DRIP, SEQUENCE, AB_TEST)
- **status**: Campaign status (DRAFT, SCHEDULED, SENDING, SENT, PAUSED, ARCHIVED)
- **targetSegment**: JSON defining target audience
- **scheduledAt**: Scheduled send time
- **stats**: Various performance metrics

#### EmailTemplate
- **id**: Unique identifier
- **name**: Template name
- **subject**: Default subject line
- **htmlContent**: HTML template content
- **textContent**: Plain text version
- **category**: Template category
- **variables**: Available personalization variables

#### AutomationWorkflow
- **id**: Unique identifier
- **name**: Workflow name
- **triggerType**: Event that triggers the workflow
- **triggerConfig**: Configuration for the trigger
- **flowData**: Serialized flow builder data
- **isActive**: Whether workflow is active
- **executionCount**: Number of executions
- **successCount**: Successful executions
- **failureCount**: Failed executions

#### AutomationStep
- **id**: Unique identifier
- **workflowId**: Associated workflow
- **stepType**: Type of step (TRIGGER, CONDITION, ACTION, etc.)
- **stepConfig**: Configuration for this step
- **position**: Order in the workflow
- **parentId**: Parent step for branching

#### CampaignEmail
- **id**: Unique identifier
- **campaignId**: Associated campaign
- **recipientEmail**: Target email address
- **status**: Email status (PENDING, SENT, DELIVERED, OPENED, CLICKED, etc.)
- **timestamps**: Various event timestamps
- **openCount/clickCount**: Tracking metrics

#### Segment
- **id**: Unique identifier
- **name**: Segment name
- **criteria**: JSON defining segment rules
- **contactCount**: Number of contacts in segment

## Frontend Components

### EmailMarketing Page
The main email marketing dashboard with tabs for:
- Dashboard: Overview of email marketing performance
- Campaigns: Manage and create email campaigns
- Workflows: Visual automation builder
- Templates: Email template management
- Newsletter: Simple newsletter creation
- Analytics: Performance reporting

### Workflow Builder (FlowBuilder)
A visual workflow builder component with:
- Palette of actions and triggers
- Canvas for building workflows
- Properties panel for configuring steps
- Connection lines showing workflow flow

### CreateCampaign Page
Step-by-step campaign creation wizard with:
- Basic information
- Audience targeting
- Email content editor
- Sending settings

## Personalization Tokens

The system supports personalization tokens using double curly braces:
- `{{firstName}}` - First name of recipient
- `{{lastName}}` - Last name of recipient
- `{{name}}` - Full name of recipient
- `{{email}}` - Email address
- `{{company}}` - Company name
- `{{customFieldName}}` - Custom field values

## Workflow Step Types

### Triggers
- **LEAD_CREATED**: When a new lead is added
- **EMAIL_OPENED**: When an email is opened
- **EMAIL_CLICKED**: When a link in an email is clicked
- **FORM_SUBMITTED**: When a form is submitted
- **LEAD_STATUS_CHANGED**: When a lead's status changes
- **SCHEDULED_TIME**: At a specific time

### Actions
- **EMAIL**: Send an email
- **TAG_ASSIGNMENT**: Add/remove tags from contact
- **FIELD_UPDATE**: Update a field on the entity
- **TASK_CREATION**: Create a task for a user
- **WEBHOOK**: Call an external URL
- **DELAY**: Wait for a specified time

### Conditions
- **FIELD_COMPARE**: Compare field values
- **TAG_CHECK**: Check if contact has a specific tag
- **EMAIL_STATUS**: Check email status
- **CUSTOM_LOGIC**: Custom condition logic

## Integration with CRM

### Lead/Contact Sync
- Email campaigns automatically use up-to-date lead and contact data
- Recipients are segmented based on current CRM status
- Email activity is logged back to CRM

### Activity Tracking
- Email opens, clicks, and bounces are recorded as interactions
- These interactions appear in the contact's activity feed
- Engagement scores are updated based on email activity

## Reporting & Analytics

### Campaign Metrics
- **Open Rate**: Percentage of recipients who opened the email
- **Click Rate**: Percentage of recipients who clicked a link
- **Bounce Rate**: Percentage of emails that bounced
- **Unsubscribe Rate**: Percentage of recipients who unsubscribed
- **Conversion Rate**: Percentage of recipients who took desired action

### Workflow Metrics
- **Execution Count**: Number of times workflow has run
- **Success Rate**: Percentage of successful executions
- **Failure Analysis**: Details on execution failures

## Setup & Configuration

### Environment Variables
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASS=your-app-password
DEFAULT_EMAIL_FROM=Your Company Name <your-email@company.com>
API_BASE_URL=http://localhost:3002
```

### Required Dependencies
- Node.js 20+
- PostgreSQL with Prisma
- Redis for caching and queues
- Nodemailer for email delivery

## Best Practices

### Campaign Creation
1. Always use A/B testing for important campaigns
2. Include clear call-to-action buttons
3. Personalize content when possible
4. Segment your audience appropriately
5. Test emails across different clients

### Workflow Design
1. Start with a clear goal in mind
2. Use conditional logic to personalize experiences
3. Include delays to avoid overwhelming contacts
4. Test workflows before activating
5. Monitor performance and optimize regularly

### Performance Optimization
1. Use batch processing for large email sends
2. Implement proper indexing for segments
3. Monitor database performance during heavy usage
4. Use CDN for email content when possible
5. Implement proper error handling and retries

## Troubleshooting

### Common Issues
- **Emails not sending**: Check SMTP configuration and credentials
- **Workflow not triggering**: Verify trigger conditions and workflow status
- **Segment not finding contacts**: Review segment criteria
- **Tracking not working**: Verify tracking pixel implementation

### Logging
- Server logs available in standard output
- Workflow executions logged in database
- Email send attempts tracked with status

## Security Considerations

- All API endpoints require authentication
- Email templates are sanitized to prevent XSS
- Personal data is handled according to privacy policies
- SMTP credentials are encrypted in environment variables