# Form Publishing System - Complete Implementation

## Overview

The Form Publishing System is a comprehensive feature that allows users to publish their forms and share them via agency-branded subpage URLs (e.g., `/{agency-alias}/{form-slug}`). This system includes versioning, publish history tracking, and public access without authentication.

## Key Features

1. **Form Publishing**: Publish forms to make them publicly accessible
2. **Version Management**: Track all published versions with full snapshots
3. **Agency Alias Subpages**: Forms accessible at `/{agency-alias}/{form-slug}`
4. **Publish History**: View all versions with timestamps
5. **Custom Slugs**: Users can customize their form URL slugs
6. **Public Access**: Published forms are accessible without authentication
7. **Unpublish**: Remove public access while keeping the form

## Database Schema

### Migration File
Location: `/backend/db/migrations/004_add_form_publishing.sql`

### New Fields in `forms` Table
- `published_at` (TIMESTAMPTZ): When last published
- `published_version` (INTEGER): Current version number (increments on each publish)
- `published_slug` (VARCHAR(255)): URL-friendly slug
- `publish_history` (JSONB): Array of publish events with snapshots

### New Field in `users` Table
- `agency_alias` (VARCHAR(100) UNIQUE): URL-friendly alias for agency subpages

### Database Functions
- `generate_form_slug(form_title TEXT, form_user_id UUID)`: Generates unique slugs
- `generate_agency_alias(user_name TEXT, user_email TEXT)`: Generates unique agency aliases
- `auto_generate_agency_alias()`: Trigger function for new users

### Indexes
```sql
-- Performance indexes
idx_forms_published_slug
idx_forms_published_at
idx_forms_user_published
idx_users_agency_alias
idx_forms_public_lookup
idx_forms_user_slug_unique (UNIQUE)
```

## Backend API Endpoints

### Base URL
All endpoints are under `/api/v1/forms`

### 1. Publish Form
**POST /api/forms/:id/publish**

Publishes a form and creates a new version.

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body (Optional):**
```json
{
  "customSlug": "my-custom-slug"  // Optional: Custom slug instead of auto-generated
}
```

**Response:**
```json
{
  "success": true,
  "form": { /* full form object with publish data */ },
  "version": 2,
  "slug": "contact-form",
  "publicUrl": "https://yoursite.com/agency-name/contact-form",
  "message": "Form published successfully as version 2"
}
```

**Validations:**
- Form must exist and belong to user
- Form must have at least one question
- Custom slug must be unique for the user (if provided)
- Custom slug must follow format rules (lowercase, letters, numbers, hyphens only)

### 2. Unpublish Form
**POST /api/forms/:id/unpublish**

Makes the form inaccessible to public (but keeps publish history).

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "success": true,
  "form": { /* updated form object */ },
  "message": "Form unpublished successfully"
}
```

### 3. Get Publish History
**GET /api/forms/:id/publish-history**

Returns all published versions of a form.

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "success": true,
  "formId": "uuid",
  "formTitle": "Contact Form",
  "currentVersion": 3,
  "history": [
    {
      "version": 1,
      "published_at": "2025-01-24T10:00:00Z",
      "published_by": "user_uuid",
      "slug": "contact-form",
      "snapshot": {
        "title": "Contact Form",
        "description": "Get in touch",
        "questions": [ /* full question array */ ],
        "settings": { /* form settings */ }
      }
    },
    {
      "version": 2,
      "published_at": "2025-01-25T14:30:00Z",
      "published_by": "user_uuid",
      "slug": "contact-form",
      "snapshot": { /* form snapshot at v2 */ }
    }
  ]
}
```

### 4. Get Published Form (Public)
**GET /api/forms/public/:agencyAlias/:formSlug**

Fetches a published form by agency alias and slug. **No authentication required.**

**Response:**
```json
{
  "success": true,
  "form": {
    "id": "uuid",
    "title": "Contact Form",
    "description": "Get in touch with us",
    "questions": [ /* questions array */ ],
    "settings": { /* form settings */ },
    "published_at": "2025-01-24T10:00:00Z",
    "published_version": 2
  },
  "agencyAlias": "agency-name",
  "slug": "contact-form"
}
```

**Error Responses:**
- 404: Agency not found
- 404: Form not found or not published

### 5. Update Form Slug
**PUT /api/forms/:id/slug**

Updates the form slug (for published forms).

**Headers:**
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "slug": "new-custom-slug"
}
```

**Response:**
```json
{
  "success": true,
  "form": { /* updated form */ },
  "slug": "new-custom-slug",
  "publicUrl": "https://yoursite.com/agency-name/new-custom-slug",
  "message": "Slug updated successfully"
}
```

## Backend Utilities

### Slug Generation (`/backend/utils/slug.js`)

**Functions:**

1. **generateSlug(text)**
   - Converts text to URL-friendly slug
   - Removes special characters
   - Replaces spaces with hyphens
   - Limits to 100 characters

2. **isSlugUnique(supabase, slug, userId, excludeFormId)**
   - Checks if slug is unique for user
   - Returns boolean

3. **generateUniqueSlug(supabase, title, userId, excludeFormId)**
   - Generates unique slug by appending numbers if needed
   - Returns unique slug string

4. **validateSlug(slug)**
   - Validates slug format
   - Returns `{ valid: boolean, error: string }`

5. **generateAgencyAlias(name, email)**
   - Generates agency alias from user info
   - Returns URL-friendly alias

## Frontend Components

### 1. ShareTab Component
**Location:** `/frontend/pages/formBuilder/ShareTab.jsx`

**Features:**
- Prominent publish button with version display
- Published status badge (Published/Not Published)
- Public URL display with copy button
- Custom slug editor
- Publish history viewer
- Republish button (increments version)
- Unpublish button
- Preview link (for testing before publishing)
- Embed codes (iframe, popup)
- Social sharing (Twitter, LinkedIn, Facebook, Email)
- Advanced settings

**State Management:**
```jsx
const [publishing, setPublishing] = useState(false);
const [publishHistory, setPublishHistory] = useState([]);
const [customSlug, setCustomSlug] = useState('');
const [editingSlug, setEditingSlug] = useState(false);
const [publishError, setPublishError] = useState(null);
```

**Key Functions:**
- `handlePublish()`: Publishes form
- `handleUnpublish()`: Unpublishes form
- `handleUpdateSlug()`: Updates slug
- `loadPublishHistory()`: Fetches history

### 2. PublicFormView Component
**Location:** `/frontend/pages/PublicFormView.jsx`

**Purpose:** Renders published forms for public viewing (no auth required)

**Features:**
- Fetches form by agency alias + slug
- Supports sequential and standard form modes
- Loading state
- Error handling (form not found)
- Form submission
- Branded footer (can be hidden via settings)

**URL Parameters:**
- `:agencyAlias` - Agency's URL-friendly alias
- `:formSlug` - Form's URL-friendly slug

**States:**
```jsx
const [form, setForm] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### 3. Forms API Service
**Location:** `/frontend/services/formsApi.js`

**New Methods:**

```javascript
// Publish a form
await formsApi.publishForm(formId, { customSlug: 'optional-slug' });

// Unpublish a form
await formsApi.unpublishForm(formId);

// Get publish history
const history = await formsApi.getPublishHistory(formId);

// Get published form (public - no auth)
const form = await formsApi.getPublishedForm('agency-alias', 'form-slug');

// Update slug
await formsApi.updateFormSlug(formId, 'new-slug');
```

## Frontend Routing

### Public Route
**Path:** `/:agencyAlias/:formSlug`

**Component:** `PublicFormView`

**Added to:** `/frontend/App.jsx`

**Important:** This route must come BEFORE protected routes to avoid conflicts.

```jsx
{/* Public form route - must come before protected routes */}
<Route path="/:agencyAlias/:formSlug" element={<PublicFormView />} />
```

## User Flow

### Publishing a Form

1. User creates/edits form in Form Builder
2. User navigates to "Share" tab
3. (Optional) User enters custom slug
4. User clicks "Publish Form" button
5. System:
   - Validates form has questions
   - Generates/validates slug
   - Increments version number
   - Creates snapshot of current form state
   - Updates form record with publish data
   - Adds entry to publish_history
6. User receives public URL
7. Form is now accessible at `/{agency-alias}/{form-slug}`

### Republishing a Form

1. User makes changes to published form
2. User clicks "Republish" button
3. System:
   - Increments version number
   - Creates new snapshot
   - Appends to publish_history
   - Updates published_at timestamp
4. Changes go live immediately at same URL

### Accessing a Published Form

1. Anyone visits `/{agency-alias}/{form-slug}`
2. System:
   - Looks up user by agency_alias
   - Finds form by user_id + published_slug
   - Checks is_published = true
   - Returns form data
3. Form renders for public user
4. User submits form
5. Response saved to database

## URL Structure

### Format
```
https://yoursite.com/{agency-alias}/{form-slug}
```

### Examples
```
https://yoursite.com/john-doe-agency/contact-form
https://yoursite.com/acme-corp/lead-capture
https://yoursite.com/marketing-pro/survey-2024
```

### Slug Rules
- Lowercase letters only
- Numbers allowed
- Hyphens allowed
- No spaces or special characters
- 1-100 characters
- Cannot start or end with hyphen
- No consecutive hyphens
- Reserved slugs blocked (api, admin, dashboard, etc.)

### Agency Alias
- Auto-generated from user name or email
- Unique across all users
- Can be customized (future feature)
- Follows same format rules as slugs

## Security Considerations

### Public Access
- Published forms are accessible without authentication
- Form responses are associated with form creator (not respondent)
- No user data exposed (only form structure)

### Authentication
- Publish/unpublish actions require authentication
- Only form owner can publish/unpublish
- User isolation enforced (user_id checks)

### Validation
- Slug uniqueness per user
- Form ownership verification
- Input sanitization
- SQL injection prevention (parameterized queries)

## Testing

### Manual Testing Steps

1. **Create and Publish a Form**
   ```
   - Create a new form with questions
   - Navigate to Share tab
   - Click "Publish Form"
   - Verify public URL is generated
   - Copy URL and open in incognito window
   - Verify form displays correctly
   - Submit form
   - Verify response is saved
   ```

2. **Custom Slug**
   ```
   - Before publishing, enter custom slug
   - Click "Publish Form"
   - Verify URL uses custom slug
   - Try to use same slug on another form (should fail)
   ```

3. **Republish**
   ```
   - Modify published form (add question)
   - Click "Republish"
   - Verify version incremented
   - Verify changes appear on public URL
   ```

4. **Publish History**
   ```
   - Publish form multiple times
   - Check publish history section
   - Verify all versions listed with timestamps
   ```

5. **Unpublish**
   ```
   - Click "Unpublish"
   - Try to access public URL
   - Verify "Form not found" error
   - Republish to restore access
   ```

6. **Slug Update**
   ```
   - Click edit button on slug
   - Change slug
   - Save
   - Verify new URL works
   - Verify old URL shows "not found"
   ```

### Database Migration

**To apply migration:**

```bash
# Connect to your Supabase project
psql <your-connection-string>

# Run migration
\i backend/db/migrations/004_add_form_publishing.sql

# Verify tables updated
\d forms
\d users

# Check if indexes created
\di
```

**Or via Supabase Dashboard:**
1. Go to SQL Editor
2. Copy contents of `004_add_form_publishing.sql`
3. Paste and run
4. Verify success message

### API Testing

**Using cURL:**

```bash
# Publish form
curl -X POST http://localhost:3002/api/v1/forms/{form-id}/publish \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"customSlug": "test-form"}'

# Get public form
curl http://localhost:3002/api/v1/forms/public/agency-alias/test-form

# Get publish history
curl http://localhost:3002/api/v1/forms/{form-id}/publish-history \
  -H "Authorization: Bearer {token}"

# Unpublish
curl -X POST http://localhost:3002/api/v1/forms/{form-id}/unpublish \
  -H "Authorization: Bearer {token}"
```

## Files Created/Modified

### New Files Created

1. `/backend/db/migrations/004_add_form_publishing.sql` - Database migration
2. `/backend/utils/slug.js` - Slug generation utilities
3. `/frontend/pages/PublicFormView.jsx` - Public form viewer component
4. `/FORM_PUBLISHING_SYSTEM.md` - This documentation

### Files Modified

1. `/backend/routes/forms.js` - Added publish endpoints
2. `/frontend/services/formsApi.js` - Added publish methods
3. `/frontend/pages/formBuilder/ShareTab.jsx` - Enhanced with publish UI
4. `/frontend/App.jsx` - Added public form route

## Error Handling

### Backend Errors

**404 - Form Not Found**
```json
{
  "success": false,
  "error": "Form not found"
}
```

**404 - Agency Not Found**
```json
{
  "success": false,
  "error": "Agency not found"
}
```

**400 - Validation Error**
```json
{
  "success": false,
  "error": "Cannot publish form without questions"
}
```

**400 - Slug Error**
```json
{
  "success": false,
  "error": "This slug is already in use. Please choose a different one."
}
```

**500 - Server Error**
```json
{
  "success": false,
  "error": "Failed to publish form",
  "message": "Detailed error message"
}
```

### Frontend Error Handling

- Loading states during API calls
- Error messages displayed in UI
- User-friendly alerts for success/failure
- Form validation before publish
- Network error handling

## Future Enhancements

### Planned Features

1. **Version Preview**: View any historical version
2. **Version Rollback**: Restore previous version
3. **Custom Agency Alias**: Allow users to customize their agency alias
4. **Form Analytics**: Track views and submissions per version
5. **A/B Testing**: Compare different form versions
6. **Scheduled Publishing**: Publish at specific date/time
7. **Expiration Dates**: Auto-unpublish after date
8. **Password Protection**: Require password to access form
9. **Domain Mapping**: Use custom domains
10. **Version Comparison**: Side-by-side diff of versions

### Technical Improvements

1. **Caching**: Add Redis caching for public forms
2. **Rate Limiting**: Protect public endpoints
3. **CDN Integration**: Serve forms via CDN
4. **SEO Optimization**: Add meta tags for published forms
5. **Progressive Web App**: Offline support for forms
6. **Webhooks**: Notify on publish events
7. **Bulk Operations**: Publish multiple forms at once
8. **Template System**: Save published forms as templates

## Troubleshooting

### Common Issues

**Issue: Public URL returns 404**
- Check if form is published (is_published = true)
- Verify agency_alias exists for user
- Check published_slug matches URL
- Ensure form is not deleted (deleted_at IS NULL)

**Issue: Slug already in use error**
- Try different slug
- Check existing forms for user
- Use auto-generated slug

**Issue: Cannot publish form**
- Verify form has at least one question
- Check user owns the form
- Verify database migration ran successfully

**Issue: Agency alias not found**
- Check if user has agency_alias in database
- Run migration to backfill existing users
- Verify trigger is active for new users

**Issue: Publish history not loading**
- Check form is published
- Verify publish_history JSONB field exists
- Check browser console for API errors

## Support

For issues or questions:
1. Check this documentation
2. Review database migration logs
3. Check backend API logs
4. Test with cURL to isolate frontend/backend issues
5. Verify Supabase connection and credentials

---

**Last Updated:** 2025-01-24
**Version:** 1.0.0
**Author:** Axolop CRM Development Team
