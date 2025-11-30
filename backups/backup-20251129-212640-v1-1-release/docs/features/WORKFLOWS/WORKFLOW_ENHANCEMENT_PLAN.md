# Workflow Enhancement Implementation Plan

## Overview
Comprehensive improvements to the Form Workflow visualization system to make it fully functional with enhanced UX and complete backend integration.

## Phase 1: Enhanced Node Components

### 1.1 Start Node Improvements
**Current**: Simple green box saying "Start"
**Target**:
- Display form title and description
- Blue label "START" at top
- Show form welcome message/intro
- Editable in right panel when selected
- Fields to edit:
  - Form Title
  - Form Description
  - Welcome Message

### 1.2 Question Node Improvements
**Current**: Shows question label and type
**Target**:
- Add small + button on right side of each node
- Clicking + opens quick-add menu for connected question
- Node displays more info (placeholder, validation rules)
- Full editability in right panel:
  - Question Label/Title
  - Placeholder text
  - Required toggle
  - Options (for select/radio/checkbox types)
  - Validation rules
  - Help text

### 1.3 End Node Improvements
**Current**: Shows title and message
**Target**:
- Display ending type icon more prominently
- Show redirect URL if configured
- Show "create contact" setting if enabled
- Full editability in right panel:
  - Title
  - Message (longer textarea)
  - Qualification status (qualified/disqualified/neutral)
  - Redirect URL
  - Create contact toggle
  - Contact field mapping

## Phase 2: Quick Add Functionality

### 2.1 Context Menu on Nodes
- Add + button overlay on each Question node
- Clicking + opens dropdown menu with question types
- Selecting a type:
  1. Creates new question node
  2. Auto-connects from current node to new node
  3. Positions new node below/right of current node
  4. Auto-selects new node for editing

### 2.2 Auto-Connection Logic
- When adding via +, automatically create edge
- Edge connects source node → new question
- Edge is animated and has proper arrow marker
- Edge inherits conditional logic if applicable

## Phase 3: Full Editability in Workflow

### 3.1 Start Node Editing Panel
When Start node is selected, show:
```
┌─ Start Configuration ─────────────────┐
│ Form Title                             │
│ [input field]                          │
│                                        │
│ Description                            │
│ [textarea]                             │
│                                        │
│ Welcome Message                        │
│ [textarea]                             │
│                                        │
│ [Save] [Cancel]                        │
└────────────────────────────────────────┘
```

### 3.2 Question Node Editing Panel
When Question node is selected, show:
```
┌─ Question Settings ───────────────────┐
│ Title/Label                            │
│ [input]                                │
│                                        │
│ Type: [dropdown - readonly or editable]│
│                                        │
│ Placeholder                            │
│ [input]                                │
│                                        │
│ ☐ Required                             │
│                                        │
│ Options (for select/radio/checkbox)   │
│ [dynamic list with add/remove]         │
│                                        │
│ Validation Rules                       │
│ [conditional rendering based on type]  │
│                                        │
│ Help Text                              │
│ [input]                                │
│                                        │
│ ── Lead Scoring ──                     │
│ ☐ Enable Lead Scoring                 │
│ [scoring rules if enabled]             │
│                                        │
│ ── Conditional Logic ──                │
│ [existing ConditionalLogicEditor]      │
│                                        │
│ [Save Changes]                         │
└────────────────────────────────────────┘
```

### 3.3 End Node Editing Panel
Already mostly implemented, enhance with:
- Better layout
- More prominent controls
- Contact creation settings
- Field mapping UI

## Phase 4: Backend Integration

### 4.1 Database Schema Update
Add columns to `forms` table (if not exists):
```sql
ALTER TABLE forms ADD COLUMN IF NOT EXISTS workflow_nodes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS workflow_edges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS endings JSONB DEFAULT '[]'::jsonb;
```

### 4.2 Backend API Updates

**Update `POST /api/v1/forms` (Create)**:
```javascript
{
  title: string,
  description: string,
  questions: array,
  settings: object,
  workflow_nodes: array,  // NEW
  workflow_edges: array,  // NEW
  endings: array,         // NEW
  is_active: boolean,
  is_published: boolean
}
```

**Update `PUT /api/v1/forms/:id` (Update)**:
Same payload structure as create.

**Update `GET /api/v1/forms/:id` (Retrieve)**:
Return workflow_nodes, workflow_edges, and endings in response.

### 4.3 Frontend Save Logic Update

**FormBuilder.jsx changes**:
1. When form is loaded from API, populate workflow state from `workflow_nodes`, `workflow_edges`, `endings`
2. When saving form, include workflow data in payload:

```javascript
// In save function
await formsApi.updateForm(form.id, {
  title: form.title,
  description: form.description,
  questions: questions,
  settings: form.settings,
  workflow_nodes: workflowNodes,  // NEW
  workflow_edges: workflowEdges,  // NEW
  endings: endings,               // NEW
  is_active: form.is_active,
  is_published: form.is_published
});
```

## Phase 5: Testing & Validation

### 5.1 Frontend Testing
- [ ] Add question via + button
- [ ] Edit Start node information
- [ ] Edit Question in workflow panel
- [ ] Edit End node configuration
- [ ] Drag nodes to reposition
- [ ] Create connections manually
- [ ] Delete nodes and edges
- [ ] Conditional logic still works

### 5.2 Backend Testing
- [ ] Create new form with workflow data → saves correctly
- [ ] Update existing form with workflow → persists changes
- [ ] Load form → workflow data loads correctly
- [ ] Delete form → cascade deletes workflow data

### 5.3 Integration Testing
- [ ] Create form in builder → view in workflow → edit in workflow → save → reload → verify persistence
- [ ] Multi-tab test → workflow changes in one tab reflect in another after save/reload
- [ ] Test with large forms (20+ questions)
- [ ] Test performance with complex conditional logic

## Implementation Order

1. **Quick Win**: Enhance Start and End node display (Phase 1.1, 1.3)
2. **High Value**: Add + buttons to nodes (Phase 2)
3. **Critical**: Full editability in panels (Phase 3)
4. **Foundation**: Backend integration (Phase 4)
5. **Quality**: Testing and validation (Phase 5)

## Files to Modify

### Frontend
- `/frontend/pages/formBuilder/WorkflowTab.jsx` - Main workflow component
- `/frontend/pages/FormBuilder.jsx` - Save logic and state management
- `/frontend/services/formsApi.js` - API calls (minimal changes needed)

### Backend
- `/backend/routes/forms.js` - API route handlers
- Database migration script for schema update

## Estimated Effort
- Phase 1-2: 2-3 hours (Enhanced nodes + Quick add)
- Phase 3: 3-4 hours (Full editability)
- Phase 4: 2-3 hours (Backend integration)
- Phase 5: 1-2 hours (Testing)
**Total: 8-12 hours of focused development**

## Next Steps
1. Create database migration for workflow columns
2. Update backend routes to handle workflow data
3. Implement enhanced node components
4. Add quick-add functionality
5. Implement full edit panels
6. Test end-to-end
7. Deploy and validate in production

---
**Status**: Plan Created
**Priority**: High
**Assignee**: Development Team
**Target**: Next Sprint
