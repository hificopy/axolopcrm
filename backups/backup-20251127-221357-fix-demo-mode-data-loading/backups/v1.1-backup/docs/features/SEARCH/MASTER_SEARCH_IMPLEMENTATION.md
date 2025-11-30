# Master Search Implementation

## Overview

The Master Search feature is a comprehensive, unified search system that searches across ALL entities in the CRM. It provides a beautiful, fast, and intuitive search experience with keyboard shortcuts, real-time results, and smooth animations.

## Features

### ✨ Core Features

1. **Unified Search Across All Entities**
   - Leads
   - Contacts
   - Email Campaigns
   - Second Brain (Nodes, Maps, Notes)
   - Opportunities
   - Activities
   - Forms

2. **Keyboard Shortcuts**
   - `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to open search
   - `↑` / `↓` to navigate results
   - `Enter` to select a result
   - `Esc` to close search

3. **Real-time Search**
   - Debounced search (300ms)
   - Instant results as you type
   - Loading indicators

4. **Beautiful UI/UX**
   - Glassmorphic design
   - Smooth animations with Framer Motion
   - Categorized results with icons
   - Gradient accents per category
   - Dark mode support
   - Responsive design

5. **Smart Search**
   - Searches across multiple fields (name, email, company, phone, description, etc.)
   - Relevance sorting (exact match → starts with → contains)
   - Up to 5 results per category

## Architecture

### Backend

#### Files Created

1. **`/backend/services/master-search-service.js`**
   - Main search service
   - Implements parallel search across all entities
   - Handles relevance sorting
   - Returns categorized results

2. **`/backend/routes/search.js`**
   - REST API endpoint: `GET /api/search?q={query}&limit={limit}&categories={categories}`
   - Protected route (requires authentication)
   - Suggestions endpoint (for future enhancements)

#### API Endpoint

```
GET /api/search
```

**Query Parameters:**
- `q` (required): Search query string
- `limit` (optional): Results per category (default: 5)
- `categories` (optional): Comma-separated list of categories to search (default: all)

**Response:**
```json
{
  "success": true,
  "query": "john",
  "results": [
    {
      "id": "123",
      "title": "John Doe",
      "subtitle": "CEO at Acme Corp",
      "description": "john@acme.com",
      "url": "/leads?id=123",
      "category": "leads",
      "icon": "UserPlus",
      "metadata": { "status": "active" }
    }
  ],
  "totalCount": 15,
  "categories": {
    "leads": 5,
    "contacts": 3,
    "campaigns": 2,
    "secondBrain": 5
  }
}
```

#### Search Logic

The service searches the following fields for each entity:

- **Leads**: name, email, company, phone
- **Contacts**: name, email, company, phone, position
- **Campaigns**: name, subject
- **Second Brain Nodes**: label, description
- **Second Brain Maps**: name, description
- **Second Brain Notes**: title, content
- **Opportunities**: name, company
- **Activities**: title, description
- **Forms**: name, description

### Frontend

#### Files Created/Modified

1. **`/frontend/components/MasterSearch.jsx`**
   - Main search modal component
   - Handles keyboard navigation
   - Implements debouncing
   - Renders categorized results
   - Manages animations

2. **`/frontend/components/layout/Topbar.jsx`** (Modified)
   - Integrated search button with Cmd+K hint
   - Keyboard shortcut listener
   - Opens master search modal

#### Component Features

- **Glassmorphic Design**: Modern, premium look with backdrop blur
- **Gradient Accents**: Each category has a unique gradient color
- **Smooth Animations**: Entry/exit animations, result hover effects
- **Keyboard Navigation**: Full keyboard support for power users
- **Dark Mode**: Fully supports dark/light themes
- **Empty States**: Helpful messages when no results or no query
- **Loading States**: Visual feedback during search

## Usage

### For Users

1. **Open Search**
   - Click the search bar in the top navigation
   - Or press `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux)

2. **Search**
   - Type at least 2 characters
   - Results appear in real-time
   - Results are grouped by category

3. **Navigate**
   - Use arrow keys (↑/↓) to move between results
   - Press `Enter` to go to selected result
   - Click any result to navigate
   - Press `Esc` to close

### For Developers

#### Adding New Search Entities

To add a new entity to the master search:

1. **Add search method to `master-search-service.js`**:

```javascript
async searchYourEntity(userId, query, limit) {
  try {
    const { data, error } = await supabase
      .from('your_table')
      .select('id, name, description')
      .eq('user_id', userId)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      title: item.name,
      subtitle: 'Your Entity Type',
      description: item.description,
      url: `/your-entity?id=${item.id}`,
      metadata: {},
    }));
  } catch (error) {
    console.error('Error searching your entity:', error);
    return [];
  }
}
```

2. **Add to main search method**:

```javascript
const yourEntity = await this.searchYourEntity(userId, searchQuery, limit);
```

3. **Add to results mapping**:

```javascript
...yourEntity.map(item => ({ ...item, category: 'yourEntity', icon: 'YourIcon' }))
```

4. **Add category config in `MasterSearch.jsx`**:

```javascript
yourEntity: {
  icon: YourIcon,
  label: 'Your Entity',
  color: 'from-color-500 to-color-600'
}
```

## Performance

- **Debouncing**: 300ms delay prevents excessive API calls
- **Parallel Queries**: All database queries run in parallel
- **Limited Results**: 5 results per category by default
- **Indexed Fields**: Ensure database fields used in search are indexed
- **Cached Results**: Future enhancement: implement Redis caching

## Future Enhancements

1. **Recent Searches**: Store and display recent search queries
2. **Popular Items**: Show frequently accessed items
3. **Search Filters**: Allow filtering by category, date, status
4. **Advanced Search**: Support for operators (AND, OR, NOT)
5. **Search Analytics**: Track search queries and click-through rates
6. **Fuzzy Search**: Implement fuzzy matching for typos
7. **Search Suggestions**: Auto-complete as you type
8. **Quick Actions**: Perform actions directly from search results
9. **Search Shortcuts**: Custom keyboard shortcuts for categories
10. **Voice Search**: Voice input support

## Testing

### Manual Testing

1. Open the app at `http://localhost:3002`
2. Press `Cmd+K` to open search
3. Type "test" or any query with at least 2 characters
4. Verify results appear and are categorized correctly
5. Test keyboard navigation with arrow keys
6. Test clicking results
7. Test ESC to close

### API Testing

```bash
# Test search endpoint
curl "http://localhost:3002/api/search?q=test&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Search not working

1. Check backend is running on port 3002
2. Verify database tables exist (leads, contacts, etc.)
3. Check browser console for errors
4. Verify authentication middleware is working

### No results showing

1. Ensure data exists in the database
2. Check database connection
3. Verify user_id is correctly set
4. Check backend logs for errors

### Keyboard shortcuts not working

1. Ensure no other app/extension is using Cmd+K
2. Check browser console for JavaScript errors
3. Verify event listeners are attached

## Credits

- **Design Inspiration**: Raycast, Spotlight, Command Palette patterns
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

## License

Part of Axolop CRM - All Rights Reserved
