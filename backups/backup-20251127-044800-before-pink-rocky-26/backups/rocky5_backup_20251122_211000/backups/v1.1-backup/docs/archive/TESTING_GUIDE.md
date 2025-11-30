# Form Builder V2 - Testing Guide

## Status: ✅ Frontend Ready

The Form Builder V2 with workflow visualization is now fully implemented and ready to test!

## Quick Start

1. **Start the development server:**
   ```bash
   cd /Users/jdromeroherrera/Desktop/CODE/axolopcrm/website
   npm run dev
   ```

2. **Access the application:**
   - Open http://localhost:3002 in your browser
   - Navigate to Forms → Create New Form
   - You'll see the new FormBuilderV2 with tabs!

## What's Implemented

### ✅ Tab Navigation (TypeForm-style)
- **Content Tab** - Question builder (existing functionality)
- **Workflow Tab** - Visual workflow editor with React Flow
- **Connect Tab** - Integrations configuration
- **Share Tab** - Sharing and embedding options
- **Results Tab** - Analytics dashboard

### ✅ Workflow Tab Features
- Visual drag-and-drop workflow builder
- Node types:
  - Start node (green circle)
  - Question nodes (white rectangles)
  - End nodes (colored: green=qualified, red=disqualified, gray=neutral)
- Connect nodes by clicking and dragging
- Edit node properties in right panel
- Add multiple endings
- Add conditional logic to questions
- Visual minimap and controls

### ✅ Data Persistence
- Workflow data saved in `settings.workflow_nodes`, `settings.workflow_edges`, `settings.endings`
- Automatically loads saved workflows
- Auto-generates linear workflow for new forms

## Testing Scenarios

### Test 1: Create a New Form
1. Click "Create New Form"
2. You should see the FormBuilderV2 with tab navigation at the top
3. The Content tab should be active by default
4. Click through each tab to verify they load

### Test 2: Workflow Tab - Default Linear Flow
1. Create a new form or open an existing one
2. Click the "Workflow" tab
3. You should see:
   - Green "Start" node at top
   - White question nodes for each question
   - Gray "Thank You" end node at bottom
   - Arrows connecting them in order

### Test 3: Add Multiple Endings
1. In Workflow tab, click "Add Ending" button
2. A new end node should appear on the canvas
3. Click the new end node
4. In the right panel, edit:
   - Title
   - Message
   - Lead Qualification (Qualified/Disqualified/Neutral)
   - Redirect URL
5. The node color should change based on qualification status

### Test 4: Create Conditional Branches
1. Click on a question node
2. In the right panel, click "Add Logic Rule"
3. This adds conditional logic to the question
4. The node should show a "Logic" badge
5. Click and drag from the question node to an ending node to create a connection
6. Click the edge and add a label (e.g., "If Yes")

### Test 5: Save and Load Workflow
1. Create a workflow with multiple endings and connections
2. Click "Save" button
3. Refresh the page
4. The workflow should load exactly as you left it

### Test 6: Connect Tab
1. Click "Connect" tab
2. Toggle integrations on/off
3. Configure settings for:
   - Google Sheets
   - Email Notifications
   - Webhooks
   - CRM Sync
   - Zapier

### Test 7: Share Tab
1. Save the form first
2. Click "Share" tab
3. You should see:
   - Direct link to form
   - Embed codes (inline and popup)
   - Social sharing buttons
   - Advanced settings

### Test 8: Results Tab
1. Click "Results" tab
2. You should see:
   - Key metrics cards
   - Chart placeholders
   - Recent submissions list (mock data)
   - Drop-off analysis
   - Time range selector

## Known Limitations

### Backend Integration
- **Workflow database tables**: Run `/Users/jdromeroherrera/Desktop/CODE/axolopcrm/website/backend/db/workflow-schema.sql` in Supabase SQL Editor to create workflow tables
- **Workflow data**: Currently stored in `settings` JSONB field (works but not optimal)
- **Form submission**: Conditional logic evaluation not yet implemented in backend

### Workarounds
1. **Database Schema**: The workflow schema is optional for testing. The basic functionality works without it by storing workflow data in the `settings` field.

2. **Manual Schema Installation**:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy content from `backend/db/workflow-schema.sql`
   - Paste and run
   - This creates the dedicated workflow tables

## Frontend-Only Testing

You can fully test the workflow builder without backend changes:

1. **Visual Workflow Builder** - Fully functional
2. **Node Editing** - All properties editable
3. **Drag and Drop** - Reposition nodes freely
4. **Connect Nodes** - Click and drag to create edges
5. **Save/Load** - Persists in `settings` field
6. **Multiple Endings** - Create as many as needed
7. **Conditional Logic UI** - Add logic rules to questions

## Component Files

### Main Components
- `/frontend/pages/FormBuilderV2.jsx` - Main form builder with tabs
- `/frontend/pages/formBuilder/ContentTab.jsx` - Question editor
- `/frontend/pages/formBuilder/WorkflowTab.jsx` - Visual workflow builder ⭐
- `/frontend/pages/formBuilder/ConnectTab.jsx` - Integrations
- `/frontend/pages/formBuilder/ShareTab.jsx` - Sharing options
- `/frontend/pages/formBuilder/ResultsTab.jsx` - Analytics

### Database
- `/backend/db/workflow-schema.sql` - Workflow tables (optional)
- `/scripts/init-workflow-db.js` - Migration script (optional)

## Tips for Testing

1. **Use Browser DevTools**: React DevTools extension helps inspect component state
2. **Check Console**: Watch for any errors or warnings
3. **Test on Different Browsers**: Chrome, Firefox, Safari
4. **Try Mobile View**: Use responsive mode in DevTools
5. **Test with Real Data**: Create forms with different question types

## Debugging

If something doesn't work:

1. **Check Browser Console** for JavaScript errors
2. **Check Network Tab** for failed API requests
3. **Verify React Flow is loading**: Should see nodes and canvas
4. **Clear localStorage**: `localStorage.clear()` in console
5. **Hard refresh**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## Success Criteria

The implementation is successful if:

- [x] FormBuilderV2 loads without errors
- [x] All 5 tabs are visible and clickable
- [x] Workflow tab shows React Flow canvas
- [x] Can add/edit/delete nodes
- [x] Can create connections between nodes
- [x] Can save and reload workflows
- [x] Forms build successfully (`npm run build`)
- [x] No TypeScript/import errors

## Next Steps for Full Integration

1. **Run Workflow Schema**: Execute `workflow-schema.sql` in Supabase
2. **Update Backend Routes**: Modify forms routes to handle workflow tables
3. **Implement Form Rendering**: Add conditional logic to form viewer
4. **Add Workflow Evaluation**: Implement path navigation in form submissions
5. **Enhanced Analytics**: Track which paths users take

## Support

- Component documentation: See inline comments in each file
- Database schema: `FORM_BUILDER_WORKFLOW_IMPLEMENTATION.md`
- API reference: `formsApi.js`

---

**Status**: All components created and working. Frontend fully functional. Backend integration optional for basic testing.

**Build Status**: ✅ Passing (built successfully with no errors)

**Ready for Testing**: YES 🎉
