# Axolop CRM Under Construction Page

## Purpose
The beta login page serves as a temporary landing page that acts as the home page when the application is under construction. This allows the development team to work on the actual CRM while maintaining a professional front for visitors.

## Functionality
- When UNDER_CONSTRUCTION mode is enabled, the `/` route redirects to the Beta Login page at `/password`
- Users must enter the password "katewife" to access the main CRM dashboard
- After successful authentication, the session is stored in sessionStorage
- When development is complete, this can be disabled by changing the toggle in App.jsx

## Activation/Deactivation
To activate/deactivate the under construction page:

**To activate (current default):**
- Set `UNDER_CONSTRUCTION = true` in `/frontend/App.jsx` 
- The home page will redirect to the password page

**To deactivate (show normal app):**
- Set `UNDER_CONSTRUCTION = false` in `/frontend/App.jsx`
- The application will bypass the beta login and load directly

## Development vs Production
- **Development**: Use the toggle in App.jsx to enable/disable the under construction page
- **Production**: The toggle will work the same way in the deployed version
- When deployed to Vercel, this toggle can be changed before pushing to `mastered` branch

## Branding
- Uses the official Axolop CRM brand colors: #101010 (black) and #7b1c14 (red accent)
- Features the transparent logo from `/branding/LOGO/`
- Uses the background from `/branding/banner/`

## Password
- Current beta access password: `katewife`
- This should be changed in production environments
- Password can be updated in `/frontend/pages/BetaLogin.jsx` in the verification function

## Technical Implementation
- Session-based authentication (sessionStorage)
- No database or external authentication required
- Temporary measure for development/under construction period