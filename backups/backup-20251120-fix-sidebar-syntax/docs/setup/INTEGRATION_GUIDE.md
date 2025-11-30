# Axolop CRM - Complete Integration & Feature Implementation Guide

**Version:** 1.3.0
**Last Updated:** November 18, 2025
**Purpose:** Comprehensive guide for implementing all features that make Axolop the new age CRM with Local AI Second Brain

---

## Table of Contents

1. [Overview](#overview)
2. [Live Calls Feature](#live-calls-feature)
3. [Miro Replacement Features](#miro-replacement-features)
4. [Second Brain Features](#second-brain-features)
5. [Integration Roadmap](#integration-roadmap)

---

## Overview

**The New Age CRM with Local AI Second Brain**

Tired of juggling GoHighLevel, ClickUp, Notion, Miro, and 10+ disconnected tools?

### What We Replace

| Tool | Replacement Status | Priority |
|------|-------------------|----------|
| **GoHighLevel** | ✅ Complete | Critical |
| **Typeform/Jotform** | ✅ Complete | High |
| **ClickUp/Asana** | ✅ Complete | High |
| **Notion/Coda** | ✅ Complete | High |
| **Miro/Lucidchart** | ✅ Complete | High |
| **iClosed/Calendly** | ✅ Complete | High |
| **ActiveCampaign** | ✅ Complete | Critical |
| **Slack** | 🔄 In Development | Medium |

---

## Live Calls Feature

### Overview
The Live Calls feature provides enterprise-grade calling capabilities with AI-powered insights, replacing Close CRM and similar sales dialing platforms.

### Architecture

**Tech Stack:**
- **Twilio** - WebRTC/VoIP integration
- **OpenAI Whisper** - Call transcription
- **OpenAI GPT-4o** - AI analysis and coaching
- **Supabase PostgreSQL** - Data storage
- **Redis** - Caching and real-time updates

### Database Schema

**Tables Created:**
1. `sales_script_templates` - Sales scripts with dynamic variables
2. `voicemail_templates` - Pre-recorded voicemail drops
3. `call_queues` - Call campaign management
4. `call_queue_items` - Individual leads in queues
5. `calls` - Main call records with transcripts
6. `call_transcripts` - Detailed transcriptions
7. `call_comments` - Call notes and comments
8. `lead_important_dates` - Birthdays and policy renewals
9. `call_analytics_daily` - Daily performance metrics
10. `agent_call_performance` - Individual agent statistics

### Implementation Steps

#### 1. Database Setup
```sql
-- Run in Supabase SQL Editor
-- File: scripts/live-calls-schema.sql
-- Creates all tables, indexes, RLS policies, and 5 default script templates
```

#### 2. Backend Services
Created 5 core services in `/backend/services/`:

**`call-service.js`**
- `initiateCall()` - Start outbound calls via Twilio
- `updateCallStatus()` - Handle call state changes
- `addCallComment()` - Add notes to calls
- `getCallAnalytics()` - Performance metrics
- `getTodayStats()` - Dashboard statistics

**`ai-call-analysis-service.js`**
- `generateTranscript()` - Whisper API transcription
- `analyzeTranscript()` - GPT-4o call analysis
- `getRealTimeSuggestions()` - Live coaching
- `learnFromCall()` - AI learning pipeline
- `analyzeCallTrends()` - Pattern recognition

**`sales-script-service.js`**
- `getScriptTemplates()` - Retrieve all scripts
- `getRecommendedScript()` - AI script selection
- `populateScriptTemplate()` - Variable replacement
- Dynamic variables: `{lead_name}`, `{company_name}`, `{agent_name}`, etc.

**`call-queue-service.js`**
- `getCallQueues()` - List all campaigns
- `addLeadToQueue()` - Add leads to campaigns
- `getNextItemToCall()` - Priority-based next lead
- `requeueItem()` - Put back in queue
- `disposeQueueItem()` - Mark as completed/failed

**`important-dates-service.js`**
- `addBirthday()` - Track birthdays
- `getUpcomingBirthdays()` - 30-day preview
- `getTodayBirthdays()` - Daily reminders
- `addPolicyDate()` - Track renewals
- `getExpiringPolicies()` - Renewal alerts

#### 3. API Routes
File: `/backend/routes/calls.js`

**20+ Endpoints:**
```javascript
// Core Calls
POST   /api/calls/initiate          // Start a call
GET    /api/calls                   // List calls
GET    /api/calls/:id               // Get call details
PUT    /api/calls/:id/status        // Update call status
POST   /api/calls/:id/comments      // Add comment
PUT    /api/calls/:id/disposition   // Set disposition

// Call Queue
GET    /api/calls/queues            // List queues
POST   /api/calls/queues            // Create queue
GET    /api/calls/queues/:id        // Get queue items
POST   /api/calls/queues/:id/items  // Add lead to queue
GET    /api/calls/queues/:id/next   // Get next to call
PUT    /api/calls/queue-items/:id/requeue    // Requeue
PUT    /api/calls/queue-items/:id/dispose    // Dispose

// Scripts & Voicemail
GET    /api/calls/scripts           // List scripts
POST   /api/calls/scripts           // Create script
GET    /api/calls/scripts/recommend // AI recommendation
POST   /api/calls/voicemail-drop    // Drop voicemail
GET    /api/calls/voicemail-templates // List templates

// Important Dates
GET    /api/calls/birthdays         // Upcoming birthdays
GET    /api/calls/birthdays/today   // Today's birthdays
POST   /api/calls/birthdays         // Add birthday
GET    /api/calls/policy-dates      // Policy renewals
POST   /api/calls/policy-dates      // Add policy date

// Analytics
GET    /api/calls/analytics         // Performance metrics
GET    /api/calls/analytics/today   // Today's stats
```

#### 4. Twilio Webhooks
File: `/backend/routes/twilio-webhooks.js`

```javascript
POST   /api/twilio/voice/:callId      // Voice handler (TwiML)
POST   /api/twilio/status/:callId     // Status callback
POST   /api/twilio/recording/:callId  // Recording callback
```

**Setup:**
1. Configure Twilio webhook URLs in Twilio Console
2. Use ngrok for local development: `ngrok http 3002`
3. Update webhook URLs: `https://your-ngrok-url.ngrok.io/api/twilio/`

#### 5. Frontend Components

**`CallDialer.jsx`**
Features:
- Real-time call status display
- Call timer with automatic updates
- Mute/unmute controls
- Disposition buttons (Interested, Not Interested, Callback, No Answer, Voicemail, Do Not Call)
- Call notes textarea
- Sales script display with dynamic variables
- AI assistant panel with real-time suggestions
- Voicemail drop functionality
- Lead/contact information display

**`Calls.jsx`**
Four main views:
1. **Dialer** - Active calling interface
2. **Queue** - Campaign management
3. **History** - Call records with filters
4. **Analytics** - Performance dashboard

Today's Stats:
- Total calls made
- Average call duration
- Conversion rate
- Appointments set

#### 6. Environment Variables

Required in `.env`:
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_API_KEY_SID=your_api_key_sid
TWILIO_API_KEY_SECRET=your_api_key_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
ENABLE_AI_TRANSCRIPTION=true
ENABLE_AI_COACHING=true

# Backend URLs (for Twilio webhooks)
BACKEND_URL=https://your-backend-url.com
FRONTEND_URL=http://localhost:3000

# Company Information
COMPANY_NAME=Your Company Name
COMPANY_PHONE=+1234567890
```

#### 7. Testing

**Test Call Flow:**
```bash
# 1. Start backend
node backend/index.js

# 2. Test call initiation
curl -X POST http://localhost:3002/api/calls/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "leadId": "uuid-here",
    "scriptType": "default"
  }'

# 3. Check call status
curl http://localhost:3002/api/calls/CALL_ID

# 4. Add comment
curl -X POST http://localhost:3002/api/calls/CALL_ID/comments \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Great conversation, very interested",
    "sentiment": "positive"
  }'
```

### Production Checklist

- [ ] Supabase database schema deployed
- [ ] All environment variables configured
- [ ] Twilio account configured with webhook URLs
- [ ] OpenAI API key active with sufficient credits
- [ ] Backend deployed and accessible
- [ ] Frontend deployed on Vercel
- [ ] Test calls made successfully
- [ ] AI transcription working
- [ ] Call recording storage configured
- [ ] RLS policies tested
- [ ] Rate limiting configured
- [ ] Error monitoring enabled (Sentry/LogRocket)

---

## Miro Replacement Features

### Overview
Axolop CRM will replace **Miro** as the visual collaboration platform, providing infinite canvas whiteboarding, mind mapping, and real-time team collaboration without needing a separate tool.

### Complete Miro Feature Set

#### 1. Infinite Canvas
**Core Capability:**
- Unlimited zoomable workspace
- No space constraints for projects
- Pan and zoom with smooth performance
- Multi-board organization

**Implementation Plan:**
- HTML5 Canvas or WebGL rendering
- Virtual DOM for performance optimization
- Lazy loading for large boards
- Auto-save with conflict resolution

**Priority:** High
**Timeline:** Phase 4 (Q2 2025)

#### 2. Whiteboarding Tools

**Drawing & Shapes:**
- Freehand pen tool with pressure sensitivity
- Basic shapes (rectangles, circles, lines, arrows)
- Connectors with auto-routing
- Text boxes with rich formatting
- Highlighter tool
- Eraser tool

**Objects & Elements:**
- Sticky notes (7 colors minimum)
- Cards with descriptions
- Frames for grouping
- Sections with labels
- Images and file uploads
- Emojis and stickers
- Icons library (500+ icons)

**Implementation:**
- Fabric.js or Konva.js for canvas manipulation
- Real-time sync with WebSockets
- Undo/redo with command pattern
- Layer management

**Priority:** High
**Timeline:** Phase 4 (Q2 2025)

#### 3. Mind Mapping

**Mind Map Features:**
- Central node with branches
- Unlimited sub-branches
- Auto-layout algorithms
- Branch colors customization
- Node icons and images
- Collapsible branches
- Export to various formats

**Templates:**
- Business Mind Map
- Concept Map
- Semantic Map
- Brain Map
- SWOT Analysis Map
- Project Planning Map

**AI Capabilities:**
- Auto-organize nodes
- Suggest connections
- Generate branches from prompts
- Smart layout optimization

**Implementation:**
- D3.js or GoJS for mind map rendering
- Tree layout algorithms
- Real-time collaborative editing
- Integration with AI for suggestions

**Priority:** Medium
**Timeline:** Phase 4 (Q3 2025)

#### 4. Real-Time Collaboration

**Collaboration Features:**
- Live cursors with user names
- Multi-user editing (up to 100 concurrent users)
- User avatars on canvas
- Presence indicators
- Follow mode (follow another user's cursor)
- Selection sharing
- Collaborative selection

**Communication:**
- Built-in video chat (25 participants)
- Audio-only mode
- Screen sharing
- In-canvas comments
- @mentions
- Threaded discussions
- Reactions (emojis)

**Implementation:**
- WebRTC for video/audio
- WebSockets for real-time sync
- Operational transformation or CRDT for conflict-free editing
- Redis pub/sub for presence

**Priority:** High
**Timeline:** Phase 3-4 (Q1-Q2 2025)

#### 5. Presentation Mode

**Features:**
- Full-screen presentation
- Frame-based slides
- Auto-advance timer
- Presenter notes (private)
- Audience cursor following
- Laser pointer tool
- Recording capabilities
- Share link with view-only access

**Talktrack:**
- Record video walkthroughs
- Narrate boards with audio
- Export as video files
- Share immersive presentations

**Implementation:**
- Canvas-to-video recording
- WebRTC for screen capture
- Video encoding and storage
- Playback controls

**Priority:** Medium
**Timeline:** Phase 4 (Q3 2025)

#### 6. Workshop & Meeting Tools

**Facilitation Features:**
- **Voting** - Anonymous voting on items
- **Timer** - Countdown timer visible to all
- **Icebreakers** - Quick activities
- **Private mode** - Hide work until reveal
- **Music** - Background music during workshops
- **Raise hand** - Queue for speaking

**Frameworks & Templates:**
- 300+ pre-built templates
- Agile ceremonies (Sprint Planning, Retro, Daily Standup)
- Design thinking workshops
- Strategy frameworks (Business Model Canvas, OKRs)
- User story mapping
- Kanban boards
- Flowcharts
- Wireframes
- Customer journey maps

**Implementation:**
- Template library with categories
- Template preview and search
- Custom template creation
- Framework-specific widgets

**Priority:** Medium
**Timeline:** Phase 4 (Q3 2025)

#### 7. Integrations & Imports

**Native Integrations:**
- Slack notifications
- Microsoft Teams
- Google Drive
- Dropbox
- Jira (issue linking)
- Confluence
- Asana
- Monday.com
- Zoom
- Google Meet

**Import/Export:**
- Import images, PDFs, CSVs
- Export to PDF, PNG, SVG
- Export boards as presentations
- CSV import for bulk objects
- API for custom integrations

**Implementation:**
- REST API for external integrations
- Webhooks for event notifications
- OAuth for third-party auth
- File processing pipeline

**Priority:** Low
**Timeline:** Phase 5 (Q4 2025)

#### 8. Organization & Management

**Board Management:**
- Folders and workspaces
- Board templates
- Duplicate boards
- Board permissions (view, edit, admin)
- Public/private boards
- Password-protected sharing
- Expiring share links

**Search & Navigation:**
- Full-text search across boards
- Tag-based filtering
- Recently viewed
- Favorites
- Quick jump to boards

**Implementation:**
- PostgreSQL full-text search
- Elasticsearch for large deployments
- Redis for recent items cache
- Permission system with RLS

**Priority:** Medium
**Timeline:** Phase 4 (Q2 2025)

#### 9. AI Features (Miro Assist)

**AI Capabilities:**
- Auto-generate sticky notes from text
- Summarize board content
- Generate diagrams from descriptions
- Smart clustering of sticky notes
- Sentiment analysis on feedback
- Auto-create mind maps from prompts
- AI-assisted brainstorming
- Role-specific agents (Product Lead, Agile Coach)

**Implementation:**
- OpenAI GPT-4o for content generation
- ChromaDB for semantic search
- Custom AI agents for specific roles
- Context-aware suggestions

**Priority:** High (Competitive advantage)
**Timeline:** Phase 4 (Q2 2025)

#### 10. Mobile & Accessibility

**Mobile Apps:**
- iOS and Android native apps
- Touch-optimized interface
- Offline mode with sync
- Mobile-specific gestures
- Camera integration

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard shortcuts (50+ shortcuts)
- Screen reader support
- High contrast mode
- Zoom and magnification

**Implementation:**
- React Native for mobile apps
- Progressive Web App (PWA) support
- Accessibility testing framework
- ARIA labels and semantic HTML

**Priority:** Low
**Timeline:** Phase 5 (2026)

### Technical Architecture

**Frontend:**
```
- React 18+ with TypeScript
- Canvas rendering: Fabric.js or Konva.js
- State management: Redux + Redux Toolkit
- Real-time: Socket.io client
- Video/audio: WebRTC (Daily.co or Twilio)
```

**Backend:**
```
- Node.js with Express
- WebSocket server (Socket.io)
- PostgreSQL for persistence
- Redis for real-time presence and caching
- S3 for file storage
- WebRTC signaling server
```

**Real-Time Sync:**
```
- Operational Transformation or CRDT
- Conflict-free collaborative editing
- Optimistic updates with rollback
- Event sourcing for history
```

### Database Schema Preview

```sql
-- Boards
CREATE TABLE boards (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Board Objects (shapes, sticky notes, etc.)
CREATE TABLE board_objects (
  id UUID PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'sticky_note', 'shape', 'text', 'image', 'frame'
  data JSONB NOT NULL, -- Contains object-specific properties
  position_x FLOAT,
  position_y FLOAT,
  width FLOAT,
  height FLOAT,
  z_index INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mind Maps
CREATE TABLE mind_maps (
  id UUID PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  root_node_id UUID,
  layout_type TEXT DEFAULT 'radial', -- 'radial', 'tree', 'org_chart'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mind Map Nodes
CREATE TABLE mind_map_nodes (
  id UUID PRIMARY KEY,
  mind_map_id UUID REFERENCES mind_maps(id) ON DELETE CASCADE,
  parent_node_id UUID REFERENCES mind_map_nodes(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  position JSONB,
  is_collapsed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Board Comments
CREATE TABLE board_comments (
  id UUID PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  object_id UUID REFERENCES board_objects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  position_x FLOAT,
  position_y FLOAT,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Real-time Presence
CREATE TABLE board_presence (
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  cursor_x FLOAT,
  cursor_y FLOAT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (board_id, user_id)
);
```

### Cost-Benefit Analysis

**Miro Pricing (2025):**
- Free: 3 boards, limited features
- Starter: $8/user/month
- Business: $16/user/month
- Enterprise: Custom pricing ($25+/user/month)

**For 25-user team:**
- Miro Business: $400/month = $4,800/year
- Axolop CRM: Included in platform price

**ROI:** Saves $4,800/year for 25-user team, plus eliminates context switching between tools.

---

## Second Brain Features

### Overview
Axolop CRM will replace **Notion, Roam Research, and Obsidian** as the knowledge management and second brain system, providing hierarchical notes, bi-directional linking, and AI-powered knowledge discovery.

### Complete Second Brain Feature Set

#### 1. Note-Taking & Documents

**Core Features:**
- Hierarchical page structure
- Unlimited nesting
- Rich text editor (WYSIWYG)
- Markdown support
- Code blocks with syntax highlighting
- Tables, checklists, quotes
- Inline images and videos
- File attachments
- LaTeX math equations

**Implementation:**
- TipTap or ProseMirror for editing
- Markdown parser and serializer
- Syntax highlighting: Prism.js
- PostgreSQL for storage
- S3 for media files

**Priority:** Medium
**Timeline:** Phase 4 (Q3 2025)

#### 2. Databases & Tables

**Features:**
- Database views (Table, Board, Calendar, Gallery, List)
- Custom properties (Text, Number, Select, Multi-Select, Date, Person, Files, Checkbox)
- Filters and sorting
- Grouping and sub-groups
- Formulas and rollups
- Relations between databases
- Templates for database entries

**Implementation:**
- PostgreSQL JSONB for flexible schema
- Custom query builder
- Views stored as configurations
- Real-time updates with WebSockets

**Priority:** High
**Timeline:** Phase 4 (Q2 2025)

#### 3. Bi-Directional Linking

**Features:**
- `[[Wiki-style links]]`
- Automatic backlinks panel
- Link graph visualization
- Unlinked mentions detection
- Link preview on hover
- Broken link detection
- Alias support

**Implementation:**
- Full-text search for link suggestions
- Graph database (Neo4j) or PostgreSQL with recursive queries
- D3.js for graph visualization
- Real-time link indexing

**Priority:** High (Unique feature)
**Timeline:** Phase 4 (Q2 2025)

#### 4. Knowledge Graph

**Features:**
- Visual graph of all connections
- Filter by tags, dates, or properties
- Zoom and pan interface
- Node clustering
- Path finding between notes
- Orphaned notes detection
- Export graph data

**Implementation:**
- Force-directed graph layout
- WebGL rendering for performance
- Graph algorithms for analysis
- Cytoscape.js or vis.js

**Priority:** Medium
**Timeline:** Phase 4 (Q3 2025)

#### 5. Templates

**Built-in Templates:**
- Meeting notes
- Project plans
- Personal goals
- Reading notes
- Research papers
- Task lists
- Habit trackers
- Weekly reviews
- OKRs
- Product specs

**Custom Templates:**
- Create from any page
- Template variables
- Default properties
- Template gallery

**Implementation:**
- Template library in database
- Variable substitution engine
- Template sharing and discovery

**Priority:** Medium
**Timeline:** Phase 4 (Q3 2025)

#### 6. Workspaces & Permissions

**Features:**
- Personal workspaces
- Team workspaces
- Guest access
- Page-level permissions (View, Comment, Edit, Full Access)
- Workspace templates
- Import/export workspaces

**Implementation:**
- Multi-tenant architecture
- RLS policies per workspace
- Invitation system
- Role-based access control

**Priority:** High
**Timeline:** Phase 4 (Q2 2025)

#### 7. AI-Powered Features

**AI Capabilities:**
- Auto-summarize long documents
- Generate meeting notes from transcripts
- Extract action items
- Smart tagging and categorization
- Related content suggestions
- AI writing assistant
- Knowledge base Q&A chatbot
- Semantic search across all notes

**Implementation:**
- OpenAI GPT-4o for generation
- ChromaDB for semantic embeddings
- RAG (Retrieval Augmented Generation)
- Background processing queue

**Priority:** High (Competitive advantage)
**Timeline:** Phase 4 (Q2 2025)

#### 8. Search & Discovery

**Features:**
- Full-text search across all pages
- Filters by date, author, tags, properties
- Search within page content
- Search in specific databases
- Quick switcher (Cmd+K)
- Recently viewed pages
- Favorites and bookmarks

**Implementation:**
- Elasticsearch for full-text search
- Search result ranking algorithm
- Fuzzy matching
- Autocomplete with suggestions

**Priority:** High
**Timeline:** Phase 4 (Q2 2025)

#### 9. Collaboration

**Features:**
- Real-time collaborative editing
- Comments and mentions
- Activity feed per page
- Version history
- Restore previous versions
- Track changes
- Lock pages to prevent edits

**Implementation:**
- Operational Transformation or CRDT
- WebSockets for real-time sync
- Event sourcing for history
- Diff visualization

**Priority:** High
**Timeline:** Phase 4 (Q2 2025)

#### 10. Mobile & Offline

**Features:**
- iOS and Android apps
- Offline editing with sync
- Quick capture widget
- Voice notes
- Camera integration
- Offline search

**Implementation:**
- React Native apps
- Local SQLite cache
- Sync conflict resolution
- Background sync

**Priority:** Low
**Timeline:** Phase 5 (2026)

### Database Schema Preview

```sql
-- Pages (Second Brain)
CREATE TABLE pages (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  parent_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT,
  cover_url TEXT,
  content JSONB, -- ProseMirror document
  content_text TEXT, -- Plain text for search
  is_database BOOLEAN DEFAULT false,
  database_config JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_edited_by UUID REFERENCES auth.users(id)
);

-- Backlinks
CREATE TABLE page_links (
  id UUID PRIMARY KEY,
  source_page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  target_page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  link_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(source_page_id, target_page_id)
);

-- Page Comments
CREATE TABLE page_comments (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  position JSONB, -- Location in document
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Page History
CREATE TABLE page_history (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  edited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Database Entries
CREATE TABLE database_entries (
  id UUID PRIMARY KEY,
  database_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  properties JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Cost-Benefit Analysis

**Notion Pricing (2025):**
- Personal: Free (limited blocks)
- Plus: $10/user/month
- Business: $15/user/month
- Enterprise: $25+/user/month

**Roam Research:** $15/user/month

**For 25-user team:**
- Notion Business: $375/month = $4,500/year
- Axolop CRM: Included in platform price

**ROI:** Saves $4,500/year for 25-user team

---

## Integration Roadmap

### Phase 3 - Communication (Q1 2025)
**Status:** 🔄 In Progress

- [ ] Team chat (Slack replacement)
- [ ] Channels and DMs
- [ ] File sharing
- [ ] @mentions and notifications
- [ ] CRM integration

**Estimated Timeline:** 3 months
**Resources Required:** 2 developers

### Phase 4 - Knowledge & Collaboration (Q2-Q3 2025)
**Status:** 📋 Planned

**Q2 2025 (Miro Core Features):**
- [ ] Infinite canvas infrastructure
- [ ] Basic whiteboarding tools
- [ ] Real-time collaboration
- [ ] Mind mapping
- [ ] AI-powered features
- [ ] Board management

**Q3 2025 (Second Brain Core Features):**
- [ ] Note-taking and documents
- [ ] Databases and views
- [ ] Bi-directional linking
- [ ] Knowledge graph
- [ ] AI search and summarization
- [ ] Templates

**Estimated Timeline:** 6 months
**Resources Required:** 3 developers

### Phase 5 - Advanced Features (Q4 2025 - 2026)
**Status:** 📋 Planned

- [ ] Workshop tools (voting, timer, etc.)
- [ ] Advanced templates library (300+)
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Custom integrations marketplace
- [ ] API for developers
- [ ] White-label options

**Estimated Timeline:** 9 months
**Resources Required:** 4 developers

---

## Success Metrics

### Live Calls
- ✅ Average call duration: 5+ minutes
- ✅ Call connection rate: 95%+
- ✅ AI transcription accuracy: 90%+
- ✅ Daily calls per agent: 50+

### Miro Replacement
- 🎯 Boards created per team: 20+
- 🎯 Active concurrent users: 50+
- 🎯 Average session duration: 30+ minutes
- 🎯 Objects per board: 200+

### Second Brain
- 🎯 Pages created per user: 100+
- 🎯 Backlinks per page: 5+
- 🎯 Search queries per day: 50+
- 🎯 Daily active users: 80%+

---

## Support & Resources

**Documentation:**
- Live Calls: See backend services and API routes
- Miro Features: This guide, Section 3
- Second Brain: This guide, Section 4

**For Questions:**
- Email: support@axolopcrm.com
- Slack: #axolop-development

---

**Built with ❤️ for teams that demand excellence.**

*Axolop CRM - One Platform. Unlimited Potential.*
