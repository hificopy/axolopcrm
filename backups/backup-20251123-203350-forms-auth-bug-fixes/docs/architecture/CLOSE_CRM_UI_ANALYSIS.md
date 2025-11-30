# Close CRM UI/UX Analysis

**Source:** Close CRM Screenshots
**Goal:** Clone UI/UX exactly for custom CRM

---

## Overall Design System

### Color Palette
```css
/* Primary Colors */
--primary-blue: #4C7FFF;      /* Action buttons, active states */
--primary-green: #00D084;     /* Success, positive indicators */
--primary-yellow: #FFB800;    /* Warnings, pending states */

/* Neutral Colors */
--bg-primary: #FFFFFF;        /* Main background */
--bg-secondary: #F7F7F7;      /* Secondary background */
--bg-dark: #1A1A1A;          /* Dark sidebar */
--text-primary: #1A1A1A;     /* Main text */
--text-secondary: #666666;   /* Secondary text */
--text-tertiary: #999999;    /* Tertiary text */
--border: #E5E5E5;           /* Borders */

/* Status Colors */
--status-qualified: #00D084;     /* Green dot */
--status-rejected: #FF4444;      /* Red */
--status-no-contact: #999999;    /* Gray */
--status-klaviyo: #FFB800;       /* Yellow */
```

### Typography
```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;

/* Font Sizes */
--text-xs: 11px;
--text-sm: 12px;
--text-base: 13px;
--text-md: 14px;
--text-lg: 16px;
--text-xl: 18px;
--text-2xl: 24px;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 20px;
--spacing-2xl: 24px;
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-full: 9999px;
```

---

## Layout Structure

### Sidebar (Left)
```
Width: 200px
Background: #1A1A1A (dark)
Padding: 12px

Components:
├── Logo/Brand (top)
│   • Avatar: 40x40px circle
│   • Name: 14px, white
│   • Email: 12px, gray
│   • Dropdown arrow
│
├── Navigation Menu
│   • Icon (20x20px) + Label (13px)
│   • Active state: slightly lighter bg + icon color
│   • Hover: subtle bg change
│   • Items:
│     - Inbox (mail icon)
│     - Opportunities (trophy icon)
│     - Leads (person icon)
│     - Contacts (people icon)
│     - Workflows (flow icon)
│     - Conversations (chat icon)
│     - Activities (activity icon)
│     - Reports (chart icon)
│
├── Smart Views Section
│   • Collapsible header
│   • Icon indicators (folder, ?, trophy, etc.)
│   • Checkmarks for completed
│   • X for no-shows/rejected
│   • "Show all" link at bottom
│
└── Bottom Actions
    • Support & FAQs (with external link icon)
    • Integrations (plug icon)
    • Settings (gear icon)
    • Collapse button
```

### Main Content Area
```
Layout: Full remaining width
Background: #FFFFFF

Structure:
├── Top Navigation Bar
│   • Search bar (left)
│   • Page title/breadcrumbs (center-left)
│   • Action buttons (right)
│   • User avatar (far right)
│
├── Content Header
│   • Title with dropdown
│   • Filters (All Users, All Leads, etc.)
│   • Sort controls
│   • View toggles (list/kanban)
│   • Bulk actions
│
└── Content Body
    • Data table / Kanban board / Detail view
    • Pagination / infinite scroll
```

### Right Sidebar (Meetings Panel)
```
Width: 320px (collapsible)
Background: #FFFFFF
Border-left: 1px solid #E5E5E5

Components:
├── Header: "Meetings"
├── Date selector: "Mon, Nov 10"
├── Empty state or meeting list
└── Close button (X)
```

---

## Key UI Components

### 1. Inbox View (Screenshot #1)

**Layout:**
```
Top Bar:
├── "Inbox" title with dropdown
├── Tabs: Primary (36), Emails (2), Calls, Messages, Tasks, Reminders, Potential Contacts (34)
├── Filters button (right)
├── Settings icons (right)

Content:
├── Checkbox: "Select all"
├── Filters dropdown (funnel icon)
├── Sort by: "Due date"

Email List:
└── Each row:
    ├── Checkbox
    ├── Email icon (blue circle)
    ├── Sender name (bold) + email
    ├── Tag: "POTENTIAL CONTACT"
    ├── Subject line
    ├── Preview text (truncated)
    ├── Status badge: "NO LEAD", "7DF - REJECTED"
    ├── Date (right aligned)
```

**Styling:**
- Row height: 64px
- Hover: light gray background
- Selected: light blue background
- Tags: Rounded pills with gray background
- Status badges: Colored text with light background

### 2. Pipeline View (Screenshots #2, #3)

**Kanban Board Layout:**
```
Structure:
├── Header with metrics
│   • Total opportunities: 2
│   • Annualized value: $0
│
├── Stage columns (horizontal scroll)
│   • Column header: Yellow badge with stage name
│   • "0 OPPORTUNITIES" count
│   • "ANNUALIZED VALUE $0"
│
└── Deal cards
    ├── Lead name (blue link)
    ├── Company logo (circular, 24px)
    ├── Progress: "50%" with blue progress bar
```

**Column Styles:**
- Width: 280px
- Padding: 16px
- Gap between columns: 12px
- Yellow header badges: Uppercase text, rounded

**Card Styles:**
- Background: white
- Border: 1px solid #E5E5E5
- Border-radius: 8px
- Padding: 16px
- Hover: slight shadow

### 3. Opportunities List View (Screenshot #4)

**Table Layout:**
```
Headers:
├── Lead (sortable)
├── Value
├── Confidence (progress bar)
├── Close date
├── Status
├── User
├── More actions (...)

Rows:
├── Lead name (blue link) + subtitle
├── "Unknown" value
├── Confidence meter (blue fill)
│   • 60% or 50% with percentage label
├── Empty close date
├── Status: "AXOLOP Agency Retainer S..."
├── User: "Juan Romero"
├── Three-dot menu
```

**Styling:**
- Alternating row backgrounds
- Sortable headers with arrow icons
- Progress bars inline (width: 100px)

### 4. Leads List View (Screenshot #5)

**Table with Avatars:**
```
Columns:
├── Name (with avatar/logo)
├── Actions (call/email icons)
├── Contacts
├── Status (colored dots)

Row Design:
├── Logo/avatar (32px circle/square)
├── Lead name (blue link)
├── Icon buttons (phone, email)
├── Contact name
├── Status dot (green/yellow/gray) + label
```

**Status Indicators:**
- Qualified: Green dot
- Klaviyo?: Yellow dot
- Do Not Contact: Gray dot
- 7DF - Rejected: Red label

### 5. Contacts List View (Screenshot #6)

**Simple Table:**
```
Columns:
├── Name (blue link)
├── Email icon
├── Call icon
├── Title
├── Lead

Row Styling:
├── Name: Bold, blue link
├── Icons: Gray, hover to show tooltip
├── Title: Regular text
├── Lead: Regular text
```

### 6. Workflows View (Screenshot #7)

**Empty State:**
```
Center-aligned:
├── Icon (circular, gray)
│   • Three horizontal lines
├── Heading: "Workflows"
├── Description text
└── Button: "+ New Workflow" (blue)
```

**When populated:**
```
Table:
├── Name
├── To Do If
├── Stats
├── Last activity
├── Owner
```

### 7. Call History View (Screenshots #8, #9)

**Activity Feed:**
```
Each activity card:
├── Call icon (green circle)
├── Title: "Call from Close Sales Team"
├── Participants: Name + avatar
├── Duration: "6m 23s"
├── Date: "Jun 16"
├── Avatar of assigned user
├── Expandable content:
│   ├── "This is a call..." description
│   ├── Bullet points of notes
│   ├── "Show more..." link
│   └── Audio player:
│       • Play button
│       • Waveform visualization
│       • Duration: "0:00 / 6:23"
│       • Playback speed: "1x"
│       • Download/More options
```

**Styling:**
- Card background: White
- Border: 1px solid #E5E5E5
- Padding: 20px
- Margin: 12px between cards
- Waveform: Purple gradient

### 8. Live Calls View (Screenshot #10)

**Empty State:**
```
Center layout:
├── Icon: Phone in green circle (large)
├── Heading: "There are no live calls at this time"
├── Description: "As users join calls, they'll display here."

Side Panel:
├── "TODAY'S MEETINGS"
├── Calendar icon (purple circle)
├── "There are no meetings today"
└── Description
```

### 9. Activities View (Screenshot #11)

**Activity Type Selector:**
```
Modal/Popover:
├── Title: "Select an activity type"
├── Description text
├── Grid of activity types (2 columns):
│   ├── Calls (phone icon)
│   ├── Emails (envelope icon)
│   ├── SMS (message icon)
│   ├── WhatsApp (whatsapp icon)
│   ├── Meetings (calendar icon)
│   └── Notes (note icon)
└── Search: "Select a Custom Activity"
```

**Card Style:**
- Border: 1px solid #E5E5E5
- Border-radius: 8px
- Padding: 16px
- Hover: Blue border
- Icon + Label layout

### 10. Activity Overview (Screenshot #12)

**Dashboard with Metrics:**
```
Layout:
├── Filters bar (top)
│   • "This Week"
│   • "Compare to"
│   • "All Leads"
│   • "All Users with data"
│   • Grid/Chart toggle
│
├── Metrics cards (grid)
│   • Each card:
│     - Value (large number)
│     - Label (below)
│     - Subtitle
│
└── "+ Add a tile" button

Metrics shown:
├── 0 Leads CREATED
├── 0 Outbound Calls ALL TYPES
├── 0 Inbound Calls ALL TYPES
├── 0s All Calls AVERAGE DURATION
├── 0 Sent Emails ALL TYPES
├── 1 Received Emails ALL TYPES
├── 0 Opportunities CREATED
└── Leaderboard (empty state with illustration)
```

### 11. Activity Comparison (Screenshot #13)

**Data Table:**
```
Columns:
├── Team Members (All users)
├── Leads Created
├── Outbound Calls (All Types)
├── Inbound Calls (All Types)
├── All Calls (Average Duration)
├── Sent Emails (All Types)
├── Received Emails (All Types)
├── Opportunities Created
├── Opportunities Won
├── Opportunities Value Won

Row:
├── 1. Juan Romero
└── All zeros except "1" in Received Emails

Footer:
└── Total: row with sums
```

### 12. Opportunity Funnel (Screenshot #14)

**Funnel Visualization:**
```
Header:
├── Title: "AXOLOP Agency Retainer Sales Funnel"
├── Filters:
│   • "Was Active, Won or Lost"
│   • Period: "Aug 12-Nov 10, 2025"
│   • "Compare to"
│   • Pipeline selector
│   • "All Users with data"
│   • "All Leads"

Metrics:
├── 2 Opportunities
├── 0% Win Rate (Count)
├── Average Time to Win
├── $- Avg Value per Win
├── $-/day Sales Velocity

Funnel Chart:
├── Stages as columns with:
│   • Yellow badge header (stage name)
│   • Blue bar showing count
│   • Win rate: 0%
│   • 0 LOST count
│   • Red indicator

Bottom Table:
├── Columns: Stage, Count, Value, Weighted Value, Avg Time to Advance, Conversion Rate, Lost
├── Data for each stage
```

**Styling:**
- Large blue bar for QUALIFIED stage (2 opportunities)
- Yellow stage badges
- Red drop-off indicators
- Table with alternating rows

### 13. Smart View (Screenshot #15)

**Filtered List:**
```
Header:
├── Name: "____HIFI 7DF____"
├── Filters indicator: "5 Leads (Set limit)"
├── Sort/Columns controls
├── "Save" button

Table:
├── Columns: Name, Actions, Contacts, Status
├── Filtered leads matching "7DF" criteria
├── Status colors matching criteria
```

### 14. Settings - Account (Screenshot #16)

**Form Layout:**
```
Sidebar Menu:
├── Account (active)
│   • Appearance
│   • Memberships
├── Organization
│   • General
│   • Team Management
│   • Roles & Permissions
├── Customization
│   • Custom Fields
│   • Integration Links
│   • Scheduling Links
│   • Statuses & Pipelines
│   • AI Knowledge Sources
├── Communication
│   • Phone & Voicemail
│   • Dialer
│   • Outcomes
│   • Notetaker BETA
│   • Email
│   • Templates & Snippets
│   • Send As
├── Connect
│   • Integrations
│   • Accounts & Apps
│   • Developer
└── Billing

Main Form:
├── Section: "Profile"
├── Fields:
│   • First Name*
│   • Last Name*
│   • Country*
├── Profile Image section
│   • Avatar preview
│   • Gravatar link
└── "Save Profile" button

Email section:
├── Email field (pre-filled)
├── "Save Email..." button
├── Connected Accounts link

Change Password:
├── "Set Password" link
├── Email syncing note
```

**Form Styling:**
- Labels: 13px, semibold
- Inputs: Border #E5E5E5, border-radius 6px, padding 8px 12px
- Buttons: Blue primary, white secondary
- Sections separated by whitespace

### 15. Settings - General (Screenshot #17)

**Organization Settings:**
```
Form:
├── Organization Name*
│   • Input field: "axolop"
├── Currency
│   • Dropdown: "USD - US Dollar ($)"
└── "Save" button (blue)
```

### 16. Settings - Team Management (Screenshot #18)

**User Management:**
```
Header:
├── Title: "Team Management"
├── Tabs: Users (1), Groups (0), Domains
├── "+ New User" button (top right)

Filter:
└── Search: "Filter Users..."

Table:
├── Columns:
│   • User (with avatar)
│   • Role
│   • Email & Phone
│   • 2FA
│   • Auto-Record Calls
│
└── Row:
    ├── Avatar + "Juan Romero"
    ├── Role badge: "Admin"
    ├── Email: "juan@axolop.com"
    ├── Phone: "+1 813-536-3540"
    ├── 2FA: "2FA" badge with checkmark
    └── "Auto-Record Calls" with info icon
```

### 17. Settings - Roles & Permissions (Screenshot #19)

**Permissions Grid:**
```
Header:
├── Title: "Roles & Permissions"
├── Upgrade banner (blue):
│   • Icon
│   • "Custom Roles & Permissions requires an upgraded plan"
│   • "Upgrade Now" button

Description:
└── "Roles allow you to set which users are allowed to perform certain actions within Close..."

User Roles Grid:
├── Admin (SYSTEM)
│   • Icon with crown
│   • "1 user"
│
├── Super User (SYSTEM)
│   • "No users"
│
├── User (SYSTEM)
│   • "No users"
│
└── Restricted User (SYSTEM)
    • "No users"
```

**Card Styling:**
- Border: 1px solid #E5E5E5
- Padding: 24px
- Border-radius: 8px
- System badge for default roles

### 18. Forms Dashboard (TypeForm 2.0 Clone)

**Dashboard Layout:**
```
Header:
├── "Forms" title with dropdown
├── "Create Form" button (large blue CTA)
├── Search/filter controls
├── Sort options (created date, responses, etc.)

Form Cards Grid:
├── Each form as a card with:
│   ├── Form name (large bold text)
│   ├── Preview thumbnail/image
│   ├── Description text
│   ├── Stats: Responses count, Conversion rate
│   ├── Last updated date
│   ├── Status badge (active/inactive)
│   └── Action buttons (Edit, Share, View, Delete)
├── Empty state: "Create your first form"
└── "Create From Template" option
```

**Card Styling:**
- Border: 1px solid #E5E5E5
- Border-radius: 8px
- Hover: subtle shadow effect
- Padding: 16px
- Background: white

### 19. Forms Builder Interface (TypeForm 2.0 Clone)

**Layout:**
```
Top Bar:
├── Form title editor
├── Save/Save as Draft buttons
├── Preview button
├── Share/Embed button
└── Back to dashboard

Main Area:
├── Left Panel (Question Types):
│   ├── Text inputs (short, long, email, etc.)
│   ├── Choice inputs (multiple choice, checkboxes)
│   ├── Rating scales
│   ├── File uploads
│   └── Logic elements
├── Center Panel (Form Preview):
│   ├── Live form preview
│   ├── Drag-and-drop question interface
│   └── Question settings panel
└── Right Panel (Settings):
    ├── Form styling
    ├── Branding options
    ├── Logic rules
    └── Completion actions
```

**Question Styling:**
- Border: 2px dashed #E5E5E5 (when draggable)
- Padding: 20px
- Background: #FFFFFF
- Hover: border-color: #4C7FFF
- Active: border-color: #00D084

**Builder Tools:**
- Visual drag handles
- Add question buttons
- Settings sidebar with context-sensitive options
- Real-time preview updates

### 20. Form Embed & Sharing

**Embed Options:**
```
Modal/Popover:
├── Title: "Share Form"
├── Tabs: "Link", "Embed", "QR Code"
├── Link sharing options:
│   ├── URL with form ID
│   ├── Password protection
│   ├── Expiration settings
│   └── Customization options
├── Embed options:
│   ├── IFrame code
│   ├── Height/width settings
│   ├── Responsive options
│   └── Styling integration code
└── QR Code:
    ├── Downloadable QR code
    └── Instructions for use
```

**Styling:**
- Modal with clean white background
- Clear section organization
- Copy-to-clipboard functionality for codes
- Preview of embedded form

### 21. Form Responses & Analytics

**Analytics Dashboard:**
```
Header:
├── Form name and description
├── Total responses count
├── Completion rate
└── Response time metrics

Charts Section:
├── Completion Funnel chart
├── Question-level response rates
├── Drop-off analysis
└── Response timeline

Data Tables:
├── Individual responses
├── Response details
└── Export options (CSV, Excel, PDF)
```

**Analytics Card Styling:**
- White background with subtle shadows
- Clean data visualization
- Color-coded metrics
- Responsive chart layouts

---

## Component Patterns

### Buttons

**Primary Button:**
```css
background: #4C7FFF;
color: white;
padding: 8px 16px;
border-radius: 6px;
font-size: 13px;
font-weight: 600;
hover: darken(5%);
```

**Secondary Button:**
```css
background: white;
color: #1A1A1A;
border: 1px solid #E5E5E5;
padding: 8px 16px;
border-radius: 6px;
```

**Icon Button:**
```css
padding: 6px;
border-radius: 6px;
background: transparent;
hover: background: #F7F7F7;
```

### Inputs

**Text Input:**
```css
border: 1px solid #E5E5E5;
border-radius: 6px;
padding: 8px 12px;
font-size: 13px;
focus: border-color: #4C7FFF;
```

**Select/Dropdown:**
```css
/* Same as text input + */
background: white;
appearance: none;
padding-right: 32px; /* for arrow */
```

### Badges/Pills

**Status Badge:**
```css
padding: 4px 8px;
border-radius: 12px;
font-size: 11px;
font-weight: 600;
text-transform: uppercase;
```

**Tag:**
```css
padding: 2px 8px;
border-radius: 4px;
font-size: 11px;
background: #F7F7F7;
color: #666666;
```

### Avatars

**User Avatar:**
```css
width: 32px;
height: 32px;
border-radius: 50%;
object-fit: cover;
```

**Company Logo:**
```css
width: 32px;
height: 32px;
border-radius: 6px; /* slightly rounded */
object-fit: cover;
```

### Tables

**Table Header:**
```css
background: #F7F7F7;
padding: 8px 12px;
font-size: 12px;
font-weight: 600;
color: #666666;
border-bottom: 1px solid #E5E5E5;
```

**Table Row:**
```css
padding: 12px;
border-bottom: 1px solid #F7F7F7;
hover: background: #F7F7F7;
```

**Table Cell:**
```css
padding: 12px;
font-size: 13px;
vertical-align: middle;
```

### Cards

**Standard Card:**
```css
background: white;
border: 1px solid #E5E5E5;
border-radius: 8px;
padding: 20px;
box-shadow: 0 1px 2px rgba(0,0,0,0.04);
```

**Hover Card:**
```css
hover: {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
```

---

## Interaction Patterns

### Hover States
- Subtle background change (#F7F7F7)
- Scale transform (1.02) for cards
- Color darkening for buttons
- Underline for links

### Active States
- Blue border or background (#4C7FFF)
- Bold font weight
- Icon color change

### Loading States
- Skeleton screens (gray placeholders)
- Spinner icons
- "Loading..." text

### Empty States
- Centered layout
- Large icon (gray)
- Heading + description
- Call-to-action button

### Error States
- Red border
- Error message below field
- Red text color

---

## Responsive Behavior

### Sidebar
- Collapsible on smaller screens
- Icons-only mode when collapsed
- Hamburger menu for mobile

### Tables
- Horizontal scroll on overflow
- Fixed left column (name)
- Priority columns shown first

### Modals/Dialogs
- Full-screen on mobile
- Centered overlay on desktop
- Backdrop blur effect

---

## Animation & Motion

### Transitions
```css
transition: all 0.2s ease;
```

### Page Transitions
- Fade in content
- Slide in sidebars
- Scale dialogs

### Loading Indicators
- Smooth spinner rotation
- Pulse effect for skeletons

---

## Accessibility

### Focus States
- 2px blue outline
- Visible keyboard navigation
- Skip links for main content

### Screen Reader
- Proper ARIA labels
- Role attributes
- Alt text for images

### Color Contrast
- WCAG AA compliant
- 4.5:1 minimum ratio
- Clear status indicators

---

## Key UI Principles

1. **Clean & Minimal** - Lots of whitespace, no clutter
2. **Consistent** - Same patterns everywhere
3. **Fast** - Instant feedback, optimistic UI
4. **Scannable** - Clear hierarchy, visual weight
5. **Professional** - Business-focused, no playful elements

---

**Next Steps:**
1. Implement design system with shadcn/ui
2. Build core layout (sidebar + main content)
3. Create reusable components
4. Build page-specific views
5. Add interactions and animations

---

**Last Updated:** 2025-11-10
**Source:** Close CRM Screenshots Analysis
