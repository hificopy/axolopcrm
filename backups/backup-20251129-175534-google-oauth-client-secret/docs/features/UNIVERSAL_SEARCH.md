# Universal Search & Command Palette Documentation

## Overview

The Universal Search & Command Palette is a powerful, comprehensive search system that allows users to find **anything** in their CRM instantly. It combines traditional search functionality with command palette capabilities similar to Raycast, enabling users to search, navigate, create, and control their entire CRM from a single interface.

## Features

### 🔍 **Universal Search**

- **40+ Entity Types**: Search across all CRM entities including leads, contacts, forms, campaigns, meetings, deals, tasks, notes, workflows, and more
- **Real-Time Data**: All searches hit the live database - no local storage dependency
- **Smart Caching**: 5-minute result cache for instant repeat searches
- **Fuzzy Matching**: Intelligent text matching across multiple fields
- **User Isolation**: Proper data separation ensures users only see their own data

### ⚡ **Command Palette**

- **Command Mode**: Type `>` to activate command mode
- **Create Commands**: `>create lead`, `>create contact`, `>create form`, etc.
- **Navigation Commands**: `>navigate dashboard`, `>go to leads`, etc.
- **Settings Commands**: `>settings profile`, `>settings team`, etc.
- **Help Commands**: `>help shortcuts`, `>help api`, etc.
- **System Commands**: `>toggle dark`, `>export data`, etc.

### 🎯 **Quick Actions**

- **One-Click Creation**: Instantly create any entity type
- **Smart Shortcuts**: Keyboard shortcuts for common actions
- **Contextual Actions**: Relevant actions based on current context
- **Recent Commands**: Quick access to recently used commands

### 🎨 **Professional UX**

- **Responsive Design**: Works perfectly on all screen sizes
- **Keyboard Navigation**: Full keyboard support (↑↓ Enter Esc)
- **Loading States**: Professional loading indicators
- **Error Handling**: Comprehensive error messages and fallbacks
- **Empty States**: Helpful suggestions and quick actions

## Usage

### Basic Search

1. Press `⌘K` (or `Ctrl+K`) to open search
2. Type your search query
3. Use arrow keys to navigate results
4. Press `Enter` to select a result
5. Press `Esc` to close search

### Command Mode

1. Press `⌘K` to open search
2. Type `>` to enter command mode
3. Type command: `>create lead`
4. Press `Enter` to execute

### Quick Actions

1. Open search with `⌘K`
2. Click on any quick action button
3. Use keyboard shortcuts: `⌘⇧L` for new lead

## Commands Reference

### Create Commands

```
>create lead          - Create new lead
>create contact       - Create new contact
>create form          - Create new form
>create campaign      - Create new email campaign
>create meeting       - Schedule new meeting
>create deal          - Create new deal
>create task          - Create new task
>create note          - Create new note
>create workflow      - Create new workflow
>create opportunity   - Create new opportunity
```

### Navigation Commands

```
>navigate dashboard    - Go to dashboard
>go to leads         - Go to leads page
>go to contacts      - Go to contacts page
>go to forms         - Go to forms page
>go to campaigns     - Go to campaigns page
>go to calendar       - Go to calendar
>go to workflows     - Go to workflows page
>go to reports       - Go to reports page
>go to settings      - Go to settings page
```

### Settings Commands

```
>settings profile     - Open user profile
>settings team        - Open team management
>settings agency      - Open agency settings
>settings security    - Open security settings
>settings integrations - Open integrations page
>settings billing     - Open billing page
```

### Help Commands

```
>help shortcuts      - Show keyboard shortcuts
>help commands       - Show command reference
>help search         - Search help documentation
>help api           - Open API documentation
>help tutorials      - View video tutorials
```

### System Commands

```
>toggle dark         - Toggle dark/light mode
>toggle sidebar      - Toggle sidebar visibility
>export data         - Export CRM data
>import data         - Import data from other systems
```

## Searchable Entities

### Core CRM

- **Leads**: Name, email, phone, company, status, source
- **Contacts**: Name, email, phone, company, title
- **Opportunities**: Name, value, stage, probability, close date
- **Activities**: Type, description, date, duration
- **Companies**: Name, industry, website, size
- **Deals**: Name, value, currency, stage
- **Tasks**: Title, description, due date, priority, assignee

### Communication

- **Email Campaigns**: Name, subject, status, sent count
- **Inbox**: From, subject, preview, read status
- **Call Logs**: Phone number, duration, date, recording
- **Conversations**: Participant, last message, message count

### Marketing & Forms

- **Forms**: Name, status, response count, creation date
- **Form Submissions**: Form name, submitter, submission date
- **Email Templates**: Name, subject, category, usage count

### Workflows & Automation

- **Workflows**: Name, status, execution count, trigger type
- **Workflow Templates**: Name, category, usage count
- **Workflow Executions**: Workflow name, status, execution date
- **Automation Triggers**: Event type, description, status

### Second Brain (Knowledge Management)

- **Notes**: Title, content, folder, tags
- **Maps**: Name, node count, creation date
- **Folders**: Name, item count, parent folder

### Calendar & Events

- **Calendar Events**: Title, date, time, location
- **Important Dates**: Title, date, type
- **Recurring Events**: Title, frequency, next occurrence

### Reports & Analytics

- **Saved Reports**: Name, type, creation date
- **Performance Metrics**: Metric name, value, date

### Settings & Configuration

- **User Preferences**: Category, key, value
- **App Settings**: Category, key, value
- **Feature Flags**: Flag name, enabled status, description

### System & Audit

- **Audit Logs**: Action, entity type, date, user
- **Notifications**: Title, type, priority, read status
- **System Status**: Service name, status, last check

### Help & Documentation

- **Help Articles**: Title, category, view count, tags
- **Video Tutorials**: Title, duration, category, view count

### Integrations

- **API Integrations**: Service name, type, status, last sync

### User Activity

- **User Activity**: Action, page, entity type, duration

## Keyboard Shortcuts

### Global Shortcuts

- `⌘K` / `Ctrl+K`: Open universal search
- `Esc`: Close search or exit command mode
- `↑` / `↓`: Navigate search results
- `Enter`: Select search result or execute command

### Command Shortcuts

- `⌘⇧L`: Create new lead
- `⌘⇧C`: Create new contact
- `⌘⇧F`: Create new form
- `⌘⇧M`: Create new campaign
- `⌘⇧E`: Create new meeting
- `⌘⇧D`: Create new deal
- `⌘⇧T`: Create new task
- `⌘⇧N`: Create new note
- `⌘⇧W`: Create new workflow
- `⌘⇧O`: Create new opportunity

### Navigation Shortcuts

- `⌘1`: Dashboard
- `⌘2`: Leads
- `⌘3`: Contacts
- `⌘4`: Calendar
- `⌘5`: Forms
- `⌘6`: Campaigns
- `⌘7`: Workflows
- `⌘8`: Reports
- `⌘,`: Settings
- `⌘?`: Help

## Technical Implementation

### Frontend Components

- **UniversalSearch.jsx**: Main search component with command palette
- **QuickCreateModal.jsx**: Modal for creating entities from search
- **Enhanced API Integration**: Real API calls with caching

### Backend Services

- **comprehensive-search-service.js**: 40+ entity search methods
- **Enhanced Search Routes**: Command execution, quick actions, suggestions
- **Database Schema**: 15 new tables for comprehensive coverage

### Performance Features

- **Parallel Searches**: All entities searched simultaneously
- **Result Caching**: 5-minute cache for repeat queries
- **Debounced Input**: 300ms delay prevents API spam
- **Optimized Queries**: Efficient database queries with proper indexes

## API Endpoints

### Search Endpoints

```
GET /api/search                    - Universal search
GET /api/search/suggestions         - Search suggestions
POST /api/search/command            - Execute command
GET /api/search/quick-actions       - Get quick actions
GET /api/search/schema/:entity      - Get entity schema
```

### Request/Response Format

#### Search Request

```json
{
  "q": "search query",
  "limit": 8,
  "categories": "leads,contacts,forms"
}
```

#### Search Response

```json
{
  "success": true,
  "query": "search query",
  "data": {
    "leads": [...],
    "contacts": [...],
    "forms": [...],
    "quick_actions": [...]
  },
  "totalCount": 25,
  "categories": {
    "leads": 5,
    "contacts": 3,
    "forms": 2,
    "quick_actions": 8
  }
}
```

#### Command Request

```json
{
  "command": ">create lead",
  "commandType": "create",
  "entityType": "lead"
}
```

#### Command Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "Lead created successfully",
  "execution_time_ms": 245
}
```

## Database Schema

### New Tables Added

1. **user_preferences** - Individual user settings
2. **app_settings** - Agency-wide configuration
3. **feature_flags** - Feature enablement per agency
4. **audit_logs** - Comprehensive audit trail
5. **notifications** - Enhanced notification system
6. **system_status** - Service health monitoring
7. **help_articles** - Documentation and help content
8. **video_tutorials** - Video tutorial library
9. **quick_actions** - Command palette actions
10. **command_history** - Command execution history
11. **email_templates_enhanced** - Enhanced email templates
12. **workflow_templates_enhanced** - Enhanced workflow templates
13. **api_integrations** - Third-party integrations
14. **webhook_logs** - Webhook execution logs
15. **user_activity** - User activity analytics

### Performance Indexes

- Full-text search indexes on content fields
- Composite indexes on user_id + entity_type
- GIN indexes on array fields (tags)
- Partial indexes on common search fields

## Security & Permissions

### Row Level Security (RLS)

- All tables have proper RLS policies
- Users can only access their own data
- Agency-level isolation enforced
- Admin bypass for system operations

### Data Privacy

- No sensitive data in search results
- Encrypted API keys stored securely
- Audit trail for all data access
- GDPR compliance considerations

## Browser Compatibility

### Supported Browsers

- **Chrome/Chromium**: 90+ (Full support)
- **Firefox**: 88+ (Full support)
- **Safari**: 14+ (Full support)
- **Edge**: 90+ (Full support)

### Fallback Support

- Graceful degradation for older browsers
- Basic search functionality without command palette
- Mobile-optimized interface
- Touch-friendly interactions

## Mobile Support

### Responsive Design

- **Mobile (< 768px)**: Full-width search, simplified results
- **Tablet (768px - 1024px)**: Optimized layout, touch gestures
- **Desktop (> 1024px)**: Full feature set, keyboard shortcuts

### Touch Gestures

- Swipe to dismiss search
- Long press for context menu
- Pull to refresh suggestions
- Pinch to zoom results

## Performance Metrics

### Target Performance

- **Search Response**: < 500ms for cached results
- **Command Execution**: < 200ms for local actions
- **Database Queries**: < 100ms average query time
- **UI Rendering**: 60fps smooth animations

### Monitoring

- Real-time performance monitoring
- Error tracking and reporting
- Usage analytics and insights
- A/B testing framework ready

## Troubleshooting

### Common Issues

1. **Search Not Working**: Check backend service status
2. **Commands Not Recognized**: Verify command syntax
3. **Slow Performance**: Clear cache, check indexes
4. **Keyboard Shortcuts**: Check for browser conflicts
5. **Mobile Issues**: Test responsive breakpoints

### Debug Mode

Enable debug mode by adding `?debug=true` to URL for:

- Detailed console logging
- Performance metrics overlay
- Component boundary information
- Network request debugging

## Future Enhancements

### Planned Features

- **AI-Powered Search**: Natural language queries
- **Voice Search**: Speech-to-text input
- **Visual Search**: Image and document search
- **Collaborative Search**: Team search sharing
- **Advanced Filters**: Date ranges, categories, tags
- **Search Analytics**: Search behavior insights
- **Custom Commands**: User-defined command macros

### Integration Roadmap

- **Third-party APIs**: Google Search, Microsoft Graph
- **Browser Extensions**: Quick access from anywhere
- **Desktop App**: Native search integration
- **Mobile App**: Dedicated mobile search experience

---

## Getting Started

1. **Deploy the Database Schema**: Run the comprehensive-search-schema.sql in Supabase
2. **Update Backend Services**: Deploy the enhanced search service
3. **Install Frontend Components**: Use the UniversalSearch and QuickCreateModal components
4. **Configure API Endpoints**: Ensure all search routes are available
5. **Test Functionality**: Verify all 40+ entity types are searchable
6. **Monitor Performance**: Set up monitoring and analytics

For detailed implementation guidance, see the Technical Implementation section above.

---

_Last Updated: November 25, 2025_
_Version: 1.0.0_
