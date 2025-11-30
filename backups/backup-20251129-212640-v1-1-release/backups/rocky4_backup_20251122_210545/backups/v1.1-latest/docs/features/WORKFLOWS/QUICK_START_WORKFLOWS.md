# 🚀 Quick Start: Get Workflows Running in 5 Minutes

## Step-by-Step Setup

### 1. Run the Database Schema (2 minutes)

```bash
# Option A: If using PostgreSQL directly
psql your_database_name < backend/db/enhanced-workflow-schema.sql

# Option B: If using Supabase (RECOMMENDED)
# 1. Go to Supabase Dashboard > SQL Editor
# 2. Create a new query
# 3. Copy ALL contents from backend/db/enhanced-workflow-schema.sql
# 4. Paste and click "Run"
```

### 2. Add Routes to Backend (1 minute)

Add these lines to your `backend/index.js`:

```javascript
// At the top with other imports
import enhancedWorkflowExecutionEngine from './services/enhanced-workflow-execution-engine.js';
import enhancedWorkflowRoutes from './routes/enhanced-workflows.js';

// After your middleware setup, before app.listen()
app.use('/api/workflows', enhancedWorkflowRoutes);

// Before app.listen(), start the execution engine
enhancedWorkflowExecutionEngine.start();
console.log('✅ Workflow Execution Engine started');
```

### 3. Initialize Templates (30 seconds)

Start your backend server, then run:

```bash
curl -X POST http://localhost:3002/api/workflows/templates/initialize
```

Or in your browser console:

```javascript
fetch('/api/workflows/templates/initialize', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### 4. Add Frontend Route (1 minute)

In your React Router configuration (`App.jsx` or equivalent):

```javascript
import WorkflowsPage from './pages/WorkflowsPage';

// Add to your routes
<Route path="/workflows" element={<WorkflowsPage />} />
```

### 5. Test It! (30 seconds)

1. Navigate to `http://localhost:3000/workflows`
2. Click "Browse Templates"
3. Select "Welcome New Lead"
4. Click to open it
5. Click "Save" then "Activate"
6. Done! Your first workflow is live! 🎉

---

## File Locations Reference

**Backend Files:**
```
backend/
├── db/
│   └── enhanced-workflow-schema.sql         ← Run this first
├── services/
│   ├── enhanced-workflow-execution-engine.js ← Execution engine
│   └── workflow-templates-service.js         ← Template library
└── routes/
    └── enhanced-workflows.js                 ← API routes
```

**Frontend Files:**
```
frontend/
├── pages/
│   └── WorkflowsPage.jsx                    ← Main dashboard
└── components/
    └── workflows/
        ├── EnhancedFlowBuilder.jsx          ← Visual builder
        └── NodeEditorPanel.jsx              ← Settings panel
```

---

## Testing Your Setup

### Test 1: Check Database

```sql
-- Should return 7 templates
SELECT COUNT(*) FROM email_workflow_templates;

-- Should show all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name LIKE '%workflow%';
```

### Test 2: Check API

```bash
# List workflows
curl http://localhost:3002/api/workflows

# List templates
curl http://localhost:3002/api/workflows/templates
```

### Test 3: Check Frontend

1. Go to `/workflows`
2. Should see workflow dashboard
3. Click "Create Workflow"
4. Should open visual builder
5. Try adding nodes from palette

---

## Common Issues & Fixes

### Issue: "Table does not exist"
**Fix:** Run the database schema first (Step 1)

### Issue: "Cannot find module"
**Fix:** Make sure files are in correct locations (see File Locations above)

### Issue: "Templates not showing"
**Fix:** Run template initialization (Step 3)

### Issue: "Execution engine not starting"
**Fix:** Check console for errors, ensure Redis is running (if used)

### Issue: "Routes not working"
**Fix:** Ensure routes are registered before `app.listen()`

---

## Quick Commands Cheat Sheet

```bash
# Initialize templates
curl -X POST http://localhost:3002/api/workflows/templates/initialize

# Create a workflow
curl -X POST http://localhost:3002/api/workflows \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Workflow","nodes":[],"edges":[]}'

# List all workflows
curl http://localhost:3002/api/workflows

# Activate a workflow
curl -X POST http://localhost:3002/api/workflows/WORKFLOW_ID/activate

# Get workflow analytics
curl http://localhost:3002/api/workflows/WORKFLOW_ID/analytics
```

---

## What You Get Out of the Box

✅ **7 Professional Templates Ready to Use:**
1. Welcome New Lead
2. Engaged Lead Follow-up
3. Opportunity Pipeline Automation
4. Contact Form Response
5. Re-engage Inactive Leads
6. Auto-assign New Leads
7. A/B Test Welcome Sequence

✅ **20+ Trigger Types:**
- Lead/Contact Created
- Form Submitted
- Email Opened/Clicked
- Page Visited
- Webhook Received
- API Call
- Scheduled Time
- Tag Added/Removed
- And more...

✅ **15+ Action Types:**
- Send Email
- Send SMS
- Add/Remove Tags
- Update Fields
- Create Tasks
- Create Deals
- Call Webhooks
- Send Notifications
- And more...

✅ **Advanced Features:**
- A/B/C/D Split Testing
- Goal Tracking
- Multi-field Conditions
- Wait-for-Event Delays
- Analytics Dashboard
- Template Library

---

## Next Steps

Once everything is running:

1. **Create Your First Custom Workflow**
   - Click "Create Workflow"
   - Drag nodes from palette
   - Connect them
   - Save and activate

2. **Test an Execution**
   - Use the "Execute" button
   - Provide test data
   - Watch it run in real-time

3. **View Analytics**
   - Check execution history
   - Review success rates
   - Optimize performance

4. **Customize Templates**
   - Modify existing templates
   - Create your own
   - Share with team

---

## Support

Everything is **fully documented** in the code with inline comments. Check:

- Database schema: Comments explain each table
- Execution engine: Comments explain each method
- API routes: Comments explain each endpoint
- UI components: PropTypes and comments included

**Need help?** All files have comprehensive inline documentation!

---

## 🎉 You're All Set!

Your enterprise-level workflow automation system is **ready to use**!

Start building powerful automations that will:
- Save time with automation
- Increase conversions with nurturing
- Scale your operations effortlessly
- Provide insights with analytics

**Happy Automating!** 🚀
