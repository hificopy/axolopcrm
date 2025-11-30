# Monday.com-Inspired Table System

**Version:** 1.0
**Date:** 2025-01-23
**Status:** Production Ready ✅

## Overview

The **MondayTable** is a fully functional, production-ready table component system inspired by Monday.com's interface but branded with Axolop's #791C14 red color scheme. This system provides a complete solution for displaying and managing data with rich interactions, inline editing, bulk operations, and beautiful animations.

**What it replaces:** This table system can be used throughout Axolop CRM for leads, contacts, tasks, opportunities, and any other data that needs a professional, interactive table interface.

---

## 🎯 Key Features

### Visual & UX
- ✅ **Monday.com-inspired design** with Axolop branding (#791C14)
- ✅ **Smooth animations** (fade-in, slide-in, hover effects)
- ✅ **Sticky headers** with shadow on scroll
- ✅ **Collapsible groups** with color indicators
- ✅ **Row hover effects** showing action menus
- ✅ **Responsive design** for mobile and desktop
- ✅ **Accessibility support** (keyboard navigation, reduced motion, focus states)

### Functionality
- ✅ **Inline editing** for editable columns
- ✅ **Column sorting** (ascending/descending)
- ✅ **Search/filtering** across all columns
- ✅ **Bulk selection** with select all/clear
- ✅ **Bulk delete** operations
- ✅ **Row actions menu** (delete, duplicate, archive, edit)
- ✅ **Custom grouping** by field or function
- ✅ **Optimistic updates** with error rollback
- ✅ **Interactive dropdowns** for status and priority

### Column Types
- **text** - Editable text fields
- **status** - Interactive status badges with dropdown
- **priority** - Priority selector with color coding
- **date** - Date display with formatting
- **person** - User/assignee display with avatar
- **group** - Group classification badges
- **board** - Board name display
- **comments** - Comment count with icon
- **numberBadge** - Numeric badges for counts

---

## 📁 File Structure

```
frontend/components/MondayTable/
├── MondayTable.jsx           # Core table component (366 lines)
├── MondayTable.css           # Production styling (278 lines)
├── TableRow.jsx              # Individual row renderer (102 lines)
├── GroupHeader.jsx           # Collapsible group headers (51 lines)
├── StatusDropdown.jsx        # Status selector dropdown (90 lines)
├── PriorityDropdown.jsx      # Priority selector dropdown (85 lines)
├── RowActionsMenu.jsx        # Row action menu (60 lines)
├── ColumnTypes.jsx           # Cell renderers for all types (340 lines)
└── index.js                  # Exports (7 lines)

backend/routes/
└── tasks.js                  # Complete CRUD API (160 lines)

scripts/
└── tasks-schema.sql          # Database schema (85 lines)
```

**Total:** ~1,624 lines of production-ready code

---

## 🚀 Quick Start

### Basic Usage

```jsx
import { MondayTable } from '@/components/MondayTable';

function MyPage() {
  const [data, setData] = useState([]);

  const columns = [
    { key: 'name', label: 'Name', type: 'text', editable: true, width: 300 },
    { key: 'status', label: 'Status', type: 'status', editable: true, width: 160 },
    { key: 'priority', label: 'Priority', type: 'priority', editable: true, width: 160 },
    { key: 'due_date', label: 'Date', type: 'date', width: 140 },
  ];

  const handleCellEdit = async (rowId, columnKey, value) => {
    // Update backend
    await api.updateItem(rowId, { [columnKey]: value });

    // Optimistic update
    setData(prev => prev.map(item =>
      item.id === rowId ? { ...item, [columnKey]: value } : item
    ));
  };

  return (
    <MondayTable
      data={data}
      columns={columns}
      onAddItem={handleAddItem}
      onCellEdit={handleCellEdit}
      onDelete={handleDelete}
      enableSearch={true}
      enableGroups={true}
      enableBulkActions={true}
    />
  );
}
```

---

## 📊 Column Configuration

### Column Definition Schema

```typescript
{
  key: string;           // Data field name (e.g., 'status', 'name')
  label: string;         // Column header display text
  type: string;          // Column type (see types below)
  editable?: boolean;    // Allow inline editing
  width?: number;        // Fixed column width in pixels
}
```

### Available Column Types

#### 1. Text Column
```jsx
{ key: 'name', label: 'Task Name', type: 'text', editable: true, width: 300 }
```
- Displays plain text
- Click to edit when `editable: true`
- Press Enter to save, Escape to cancel

#### 2. Status Column
```jsx
{ key: 'status', label: 'Status', type: 'status', editable: true, width: 160 }
```
- Displays colored status badge
- Click to open dropdown when `editable: true`
- Options: Done (green), Working on it (orange), Stuck (red), Not Started (gray)
- Auto-normalizes values to lowercase

#### 3. Priority Column
```jsx
{ key: 'priority', label: 'Priority', type: 'priority', editable: true, width: 160 }
```
- Displays priority badge with color
- Click to open dropdown when `editable: true`
- Options: Critical (red ⚠️), High, Medium, Low, TOF, MOF, BOF
- Supports funnel stage labeling (Top/Middle/Bottom of Funnel)

#### 4. Date Column
```jsx
{ key: 'due_date', label: 'Due Date', type: 'date', width: 140 }
```
- Formats date as "Jan 15, 2025"
- Uses `formatDate()` utility from `@/lib/utils`

#### 5. Person Column
```jsx
{ key: 'assigned_to', label: 'Assigned To', type: 'person', width: 150 }
```
- Displays user with avatar circle
- Shows initials if name available, otherwise "Unassigned"

#### 6. Group Column
```jsx
{ key: 'group_name', label: 'Group', type: 'group', width: 180 }
```
- Displays group name in a badge
- Color-coded by group name hash

#### 7. Board Column
```jsx
{ key: 'board', label: 'Board', type: 'board', width: 130 }
```
- Displays board name with folder icon
- Gray background badge

#### 8. Comments Column
```jsx
{ key: 'comments', label: '', type: 'comments', width: 50 }
```
- Shows message icon with count
- Clickable to view comments
- Triggers `onCommentClick` callback

#### 9. Number Badge Column
```jsx
{ key: 'count', label: 'Items', type: 'numberBadge', width: 100 }
```
- Displays numeric value in a badge
- Useful for counts, scores, etc.

---

## 🎨 Styling & Branding

### CSS Variables

All Axolop branding is controlled via CSS variables in `MondayTable.css`:

```css
.monday-table {
  --axolop-primary: #791C14;
  --axolop-primary-hover: #6b1a12;
  --axolop-primary-light: #a03a2e;
  --axolop-green: #00c875;
  --axolop-orange: #fdab3d;
  --axolop-red: #e44258;
  --axolop-purple: #7b2d8e;
  --axolop-blue: #2563eb;
  --axolop-gray: #c4c4c4;
  --axolop-bg: #f6f7fb;
  --axolop-border: #e6e9ef;
}
```

### Customization

To customize colors for a specific table instance, add a wrapper class:

```jsx
<div className="custom-table">
  <MondayTable {...props} />
</div>
```

```css
.custom-table .monday-table {
  --axolop-primary: #your-color;
}
```

---

## 🔧 Props Reference

### MondayTable Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array | `[]` | Array of row objects to display |
| `columns` | Array | `[]` | Column configuration (see Column Configuration) |
| `groups` | string \| function \| Array | `null` | Grouping configuration |
| `onAddItem` | function | - | Callback when "New Item" button clicked |
| `onRowClick` | function | - | Callback when row is clicked |
| `onCellEdit` | function | - | Callback when cell is edited: `(rowId, columnKey, value)` |
| `onCommentClick` | function | - | Callback when comment icon clicked |
| `onDuplicate` | function | - | Callback when duplicate action triggered |
| `onDelete` | function | - | Callback when delete action triggered |
| `onArchive` | function | - | Callback when archive action triggered |
| `onBulkDelete` | function | - | Callback when bulk delete triggered: `(rowIds[])` |
| `searchPlaceholder` | string | `"Search"` | Placeholder text for search input |
| `newItemLabel` | string | `"New item"` | Label for add button |
| `className` | string | `""` | Additional CSS classes |
| `enableSearch` | boolean | `true` | Show search input |
| `enableGroups` | boolean | `true` | Enable grouping functionality |
| `enableBulkActions` | boolean | `true` | Show checkboxes and bulk actions |
| `defaultCollapsed` | boolean | `false` | Start with all groups collapsed |

---

## 📦 Grouping

### Group by Field Name

```jsx
<MondayTable
  data={tasks}
  columns={columns}
  groups="status"  // Group by status field
/>
```

### Group by Custom Function

```jsx
const groupByDate = (task) => {
  if (!task.due_date) return 'No Date';

  const today = new Date();
  const taskDate = new Date(task.due_date);

  if (taskDate < today) return 'Past Dates';
  if (taskDate.getTime() === today.getTime()) return 'Today';
  return 'Upcoming';
};

<MondayTable
  data={tasks}
  columns={columns}
  groups={groupByDate}
/>
```

### Group by Array Definition

```jsx
const groupDefinitions = [
  {
    key: 'high-priority',
    label: 'High Priority',
    color: '#e44258',
    filter: (item) => item.priority === 'critical' || item.priority === 'high'
  },
  {
    key: 'normal',
    label: 'Normal Priority',
    color: '#fdab3d',
    filter: (item) => item.priority === 'medium'
  },
  {
    key: 'low',
    label: 'Low Priority',
    color: '#c4c4c4',
    filter: (item) => item.priority === 'low'
  }
];

<MondayTable
  data={tasks}
  columns={columns}
  groups={groupDefinitions}
/>
```

---

## 🔌 Backend Integration

### Database Schema

The table system uses a PostgreSQL schema with user isolation:

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    group_name TEXT,
    board TEXT,
    status TEXT DEFAULT 'Not Started',
    priority TEXT DEFAULT 'medium',
    assigned_to TEXT,
    due_date DATE,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own tasks"
ON tasks FOR ALL
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### API Routes

Complete REST API with authentication:

```javascript
// GET /api/tasks - Fetch all tasks
router.get('/', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  res.json({ success: true, data });
});

// POST /api/tasks - Create task
router.post('/', authenticate, async (req, res) => {
  const { name, status, priority, due_date, ...rest } = req.body;
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...req.body, user_id: userId }])
    .select()
    .single();

  res.json({ success: true, data });
});

// PATCH /api/tasks/:id - Update task
router.patch('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...req.body, updated_at: new Date() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  res.json({ success: true, data });
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  res.json({ success: true });
});

// POST /api/tasks/bulk-delete - Bulk delete
router.post('/bulk-delete', authenticate, async (req, res) => {
  const { taskIds } = req.body;
  await supabase
    .from('tasks')
    .delete()
    .in('id', taskIds)
    .eq('user_id', userId);

  res.json({ success: true });
});
```

### Frontend Integration Example

```jsx
import { useState, useCallback } from 'react';
import { MondayTable } from '@/components/MondayTable';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

function MyWorkPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add task
  const handleAddTask = async () => {
    const token = localStorage.getItem('supabase.auth.token');
    const response = await axios.post(
      `${API_BASE_URL}/api/tasks`,
      { name: 'New Task', status: 'Not Started', priority: 'medium' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTasks([response.data.data, ...tasks]);
  };

  // Edit cell
  const handleCellEdit = async (taskId, columnKey, value) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      await axios.patch(
        `${API_BASE_URL}/api/tasks/${taskId}`,
        { [columnKey]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optimistic update
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, [columnKey]: value } : task
      ));
    } catch (error) {
      console.error('Update failed:', error);
      fetchTasks(); // Rollback on error
    }
  };

  // Delete task
  const handleDelete = async (task) => {
    const confirmed = window.confirm(`Delete "${task.name}"?`);
    if (!confirmed) return;

    const token = localStorage.getItem('supabase.auth.token');
    await axios.delete(`${API_BASE_URL}/api/tasks/${task.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(tasks.filter(t => t.id !== task.id));
  };

  // Bulk delete
  const handleBulkDelete = async (taskIds) => {
    const token = localStorage.getItem('supabase.auth.token');
    await axios.post(
      `${API_BASE_URL}/api/tasks/bulk-delete`,
      { taskIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTasks(tasks.filter(t => !taskIds.includes(t.id)));
  };

  const columns = [
    { key: 'name', label: 'Task', type: 'text', editable: true, width: 300 },
    { key: 'status', label: 'Status', type: 'status', editable: true, width: 160 },
    { key: 'priority', label: 'Priority', type: 'priority', editable: true, width: 160 },
    { key: 'due_date', label: 'Date', type: 'date', width: 140 },
  ];

  return (
    <MondayTable
      data={tasks}
      columns={columns}
      onAddItem={handleAddTask}
      onCellEdit={handleCellEdit}
      onDelete={handleDelete}
      onBulkDelete={handleBulkDelete}
      enableSearch={true}
      enableGroups={true}
      enableBulkActions={true}
    />
  );
}
```

---

## 🎯 Use Cases in Axolop CRM

### 1. My Work Page (Tasks)
**Already Implemented** ✅

```jsx
// Group by date: Past Dates, Today, Upcoming
const groupByDate = (task) => {
  if (!task.due_date) return 'No Date';
  const today = new Date();
  const taskDate = new Date(task.due_date);
  if (taskDate < today) return 'Past Dates';
  if (taskDate.getTime() === today.getTime()) return 'Today';
  return 'Upcoming';
};

<MondayTable
  data={tasks}
  columns={[
    { key: 'name', label: 'Task', type: 'text', editable: true, width: 300 },
    { key: 'group_name', label: 'Group', type: 'group', width: 180 },
    { key: 'status', label: 'Status', type: 'status', editable: true, width: 160 },
    { key: 'board', label: 'Board', type: 'board', width: 130 },
    { key: 'assigned_to', label: 'People', type: 'person', width: 150 },
    { key: 'due_date', label: 'Date', type: 'date', width: 140 },
    { key: 'priority', label: 'Priority', type: 'priority', editable: true, width: 160 },
  ]}
  groups={groupByDate}
/>
```

### 2. Leads Page
**To Be Implemented**

```jsx
// Group by lead score or status
const groupByScore = (lead) => {
  if (lead.score >= 80) return 'Hot Leads';
  if (lead.score >= 50) return 'Warm Leads';
  return 'Cold Leads';
};

<MondayTable
  data={leads}
  columns={[
    { key: 'name', label: 'Lead Name', type: 'text', editable: true, width: 250 },
    { key: 'company', label: 'Company', type: 'text', width: 200 },
    { key: 'status', label: 'Status', type: 'status', editable: true, width: 160 },
    { key: 'score', label: 'Score', type: 'numberBadge', width: 100 },
    { key: 'assigned_to', label: 'Owner', type: 'person', width: 150 },
    { key: 'created_at', label: 'Created', type: 'date', width: 140 },
  ]}
  groups={groupByScore}
/>
```

### 3. Contacts Page
**To Be Implemented**

```jsx
<MondayTable
  data={contacts}
  columns={[
    { key: 'name', label: 'Contact Name', type: 'text', editable: true, width: 250 },
    { key: 'email', label: 'Email', type: 'text', width: 250 },
    { key: 'phone', label: 'Phone', type: 'text', width: 150 },
    { key: 'company', label: 'Company', type: 'text', width: 200 },
    { key: 'status', label: 'Status', type: 'status', editable: true, width: 160 },
    { key: 'tags', label: 'Tags', type: 'group', width: 180 },
  ]}
  groups="company"
  enableSearch={true}
  enableBulkActions={true}
/>
```

### 4. Opportunities Pipeline
**To Be Implemented**

```jsx
<MondayTable
  data={opportunities}
  columns={[
    { key: 'name', label: 'Opportunity', type: 'text', editable: true, width: 300 },
    { key: 'value', label: 'Value', type: 'numberBadge', width: 120 },
    { key: 'stage', label: 'Stage', type: 'status', editable: true, width: 160 },
    { key: 'probability', label: 'Probability', type: 'numberBadge', width: 120 },
    { key: 'close_date', label: 'Close Date', type: 'date', width: 140 },
    { key: 'owner', label: 'Owner', type: 'person', width: 150 },
  ]}
  groups="stage"
/>
```

---

## 🎨 Design Principles

### 1. Axolop Branding
- Primary color: **#791C14** (Axolop Red)
- Hover state: **#6b1a12** (Darker red)
- Success: **#00c875** (Green)
- Warning: **#fdab3d** (Orange)
- Danger: **#e44258** (Red)

### 2. Smooth Interactions
- **Hover effects** on rows, buttons, and badges
- **Fade-in animations** for groups and dropdowns
- **Slide-in animations** for bulk actions toolbar
- **Scale animations** on button clicks
- **Transform animations** on hover (translateY)

### 3. Accessibility
- **Keyboard navigation** (Tab, Enter, Escape)
- **Focus states** with visible outlines
- **Reduced motion** support for users with motion sensitivity
- **ARIA-friendly** patterns for screen readers
- **Semantic HTML** structure

### 4. Performance
- **Optimistic updates** for instant feedback
- **useMemo hooks** for expensive computations
- **Virtual scrolling** ready (max-height with overflow)
- **Efficient re-renders** with React.memo where needed

---

## 🐛 Troubleshooting

### Issue: Table not showing data

**Check:**
1. Is `data` prop an array? `console.log(data)`
2. Do all items have unique `id` fields?
3. Are column keys matching data fields?
4. Is the API returning data in the expected format?

**Solution:**
```jsx
// Verify data structure
console.log('Data:', data);
console.log('Columns:', columns);

// Ensure each item has an id
const validData = data.map(item => ({ ...item, id: item.id || uuid() }));
```

### Issue: Inline editing not working

**Check:**
1. Is the column marked as `editable: true`?
2. Is `onCellEdit` callback provided?
3. Is the callback receiving correct parameters?

**Solution:**
```jsx
const handleCellEdit = (rowId, columnKey, value) => {
  console.log('Edit:', { rowId, columnKey, value });
  // Your update logic here
};

<MondayTable onCellEdit={handleCellEdit} />
```

### Issue: Dropdowns not appearing

**Check:**
1. Is the column type `'status'` or `'priority'`?
2. Is the column `editable: true`?
3. Are there any z-index conflicts?

**Solution:**
```jsx
// Ensure proper column config
{
  key: 'status',
  label: 'Status',
  type: 'status',  // Must be exact string
  editable: true,  // Must be true for dropdown
  width: 160
}
```

### Issue: Bulk actions not working

**Check:**
1. Is `enableBulkActions={true}`?
2. Is `onBulkDelete` callback provided?
3. Are row IDs unique?

**Solution:**
```jsx
<MondayTable
  enableBulkActions={true}
  onBulkDelete={(rowIds) => {
    console.log('Bulk delete:', rowIds);
    // Your bulk delete logic
  }}
/>
```

---

## 📈 Future Enhancements

Potential improvements for v1.2+:

- [ ] Column reordering (drag and drop)
- [ ] Column resizing (drag column borders)
- [ ] Column visibility toggle (show/hide columns)
- [ ] Export to CSV/Excel
- [ ] Advanced filters (multi-condition)
- [ ] Saved views (save filter/sort/group configurations)
- [ ] Customizable column types (user-defined renderers)
- [ ] Virtual scrolling for 10,000+ rows
- [ ] Real-time collaboration (live cursors, presence)
- [ ] Inline forms for complex edits
- [ ] Drag and drop rows between groups
- [ ] Timeline view mode
- [ ] Gantt chart view mode

---

## 📚 Related Documentation

- [Forms Module](./FORMS/) - Form builder using similar design patterns
- [Dashboard Widgets](./DASHBOARD/) - Metrics and analytics
- [Workflow Automation](./WORKFLOWS/) - Task automation system
- [API Reference](../api/) - Backend API documentation
- [Component Library](../components/) - Reusable UI components

---

## ✅ Checklist for New Implementations

When implementing MondayTable on a new page:

- [ ] Define column configuration with proper types
- [ ] Create backend API routes (GET, POST, PATCH, DELETE, bulk)
- [ ] Create database schema with user isolation
- [ ] Deploy schema to Supabase
- [ ] Implement CRUD handlers with optimistic updates
- [ ] Add error handling and loading states
- [ ] Test inline editing functionality
- [ ] Test bulk operations
- [ ] Test search and filtering
- [ ] Test grouping functionality
- [ ] Verify mobile responsiveness
- [ ] Check accessibility (keyboard navigation)
- [ ] Add analytics tracking (PostHog events)
- [ ] Update documentation with use case

---

**Built with ❤️ for Axolop CRM**
**Questions?** Check `docs/README.md` or contact the dev team.
