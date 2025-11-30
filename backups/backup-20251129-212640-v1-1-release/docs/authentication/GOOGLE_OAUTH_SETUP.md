# Google OAuth Setup Guide

## Overview

Google OAuth is used for:

- User authentication via Google Sign-In
- Gmail API integration for email synchronization
- Google Calendar integration for meeting scheduling

## Configuration

### Required Environment Variables

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3002/api/gmail/callback
```

### Current Credentials

**Client Secret:** `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`

_Note: Client ID should be obtained from Google Cloud Console_

## Google Cloud Console Setup

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Select **Web application**
6. Configure redirect URIs:
   - Development: `http://localhost:3002/api/gmail/callback`
   - Production: `https://yourdomain.com/api/gmail/callback`

### 2. Enable Required APIs

Enable the following APIs for your project:

- **Gmail API** - For email integration
- **Google Calendar API** - For calendar integration
- **Google+ API** - For user profile information

### 3. OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Configure required fields:
   - Application name
   - User support email
   - Developer contact information
3. Add required scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

## Implementation Details

### Authentication Flow

1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. User grants permissions
4. Google redirects to callback URI with authorization code
5. Backend exchanges code for access token
6. Store tokens securely for API calls

### Token Storage

- Access tokens stored in database encrypted
- Refresh tokens used for long-term access
- Tokens automatically refreshed when expired

### Security Considerations

- Client secret stored securely in environment variables
- Redirect URIs must match exactly in Google Console
- HTTPS required in production
- State parameter used to prevent CSRF attacks

## API Endpoints

### Authentication Routes

```javascript
GET  /api/auth/google          # Initiate OAuth flow
GET  /api/gmail/callback       # OAuth callback handler
POST /api/auth/google/refresh  # Refresh access token
DELETE /api/auth/google/revoke # Revoke access
```

### Gmail Integration

```javascript
GET  /api/gmail/threads       # Fetch email threads
GET  /api/gmail/messages/:id   # Fetch specific message
POST /api/gmail/send          # Send email
```

### Calendar Integration

```javascript
GET  /api/calendar/events      # Fetch calendar events
POST /api/calendar/events      # Create calendar event
PUT  /api/calendar/events/:id  # Update event
```

## Environment-Specific Configuration

### Development

```bash
GOOGLE_REDIRECT_URI=http://localhost:3002/api/gmail/callback
```

### Production

```bash
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/gmail/callback
```

## Testing

### Test OAuth Flow

1. Start development server: `npm run dev`
2. Navigate to `/settings/integrations`
3. Click "Connect Google Account"
4. Verify OAuth consent screen appears
5. Confirm redirect back to application
6. Check that tokens are stored correctly

### Debug Common Issues

1. **Redirect URI Mismatch**
   - Ensure URI matches Google Console exactly
   - Check for trailing slashes
   - Verify HTTP vs HTTPS

2. **Invalid Client Secret**
   - Verify client secret in environment variables
   - Check for extra spaces or characters

3. **Access Token Expired**
   - Implement automatic token refresh
   - Check refresh token validity

## Monitoring

### Log Events

- OAuth initiation
- Successful authentication
- Token refresh events
- API errors and rate limits

### Metrics to Track

- Authentication success rate
- Token refresh frequency
- API quota usage
- Error rates by type

## Security Best Practices

1. **Never expose client secret in frontend code**
2. **Use HTTPS in production**
3. **Implement proper token storage and encryption**
4. **Regularly rotate client secrets**
5. **Monitor for suspicious authentication activity**
6. **Implement proper logout and token revocation**

## Troubleshooting

### Common Error Codes

- `400: redirect_uri_mismatch` - Check redirect URI configuration
- `401: invalid_client` - Verify client ID and secret
- `403: access_denied` - User denied authorization
- `429: rate_limit_exceeded` - Implement backoff strategy

### Debug Steps

1. Check environment variables
2. Verify Google Console configuration
3. Review server logs for detailed errors
4. Test with OAuth playground
5. Check network requests in browser dev tools

## Related Documentation

- [Authentication System Overview](./AUTH_SYSTEM_STATUS.md)
- [Gmail Integration Guide](../email/GMAIL_INTEGRATION.md)
- [Calendar Setup Guide](../calendar/CALENDAR_SETUP.md)
- [Security Best Practices](../security/SECURITY_GUIDELINES.md)

---

**Last Updated:** 2025-01-29
**Version:** 1.0
**Client Secret Version:** Current (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)
