import express from 'express';
import googleCalendarService from '../services/google-calendar-service.js';
import calendarPresetService from '../services/calendar-preset-service.js';
import crmCalendarEventsService from '../services/crm-calendar-events-service.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== Google Calendar OAuth ====================

/**
 * Get Google Calendar OAuth URL
 */
router.get('/google/auth-url', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const authUrl = googleCalendarService.getAuthUrl(userId);
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

/**
 * OAuth Callback - Exchange code for tokens and trigger auto-sync
 */
router.get('/google/oauth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state; // userId passed in state parameter

    if (!code || !userId) {
      return res.status(400).json({ error: 'Missing authorization code or user ID' });
    }

    // Exchange code for tokens
    const tokens = await googleCalendarService.getTokensFromCode(code);

    // Save tokens for Calendar AND Gmail (unified Google connection)
    await googleCalendarService.saveUserTokens(userId, tokens);

    // Trigger automatic calendar sync in background
    googleCalendarService.syncCalendarOnConnection(userId).catch(err => {
      console.error('Background calendar sync failed:', err);
    });

    // Get connection status to show what was connected
    const connectionStatus = await googleCalendarService.getGoogleConnectionStatus(userId);
    const connectedServices = Object.entries(connectionStatus.services)
      .filter(([_, connected]) => connected)
      .map(([service, _]) => service)
      .join(',');

    // Redirect to frontend calendar page with success message
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/calendar?connected=true&services=${connectedServices}`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/calendar?error=auth_failed`);
  }
});

/**
 * Check connection status - Simple check
 */
router.get('/google/status', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const isConnected = await googleCalendarService.isConnected(userId);
    res.json({ connected: isConnected });
  } catch (error) {
    console.error('Error checking connection status:', error);
    res.status(500).json({ error: 'Failed to check connection status' });
  }
});

/**
 * Get comprehensive Google connection status
 * Returns status for Calendar, Gmail, and all connected Google services
 */
router.get('/google/connection-status', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await googleCalendarService.getGoogleConnectionStatus(userId);
    res.json(status);
  } catch (error) {
    console.error('Error getting comprehensive connection status:', error);
    res.status(500).json({ error: 'Failed to get connection status' });
  }
});

/**
 * Disconnect Google Calendar
 */
router.post('/google/disconnect', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    await googleCalendarService.disconnectCalendar(userId);
    res.json({ success: true, message: 'Google Calendar disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    res.status(500).json({ error: 'Failed to disconnect calendar' });
  }
});

// ==================== Google Calendar Operations ====================

/**
 * List all user's Google Calendars
 */
router.get('/google/calendars', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const calendars = await googleCalendarService.listCalendars(userId);
    res.json(calendars);
  } catch (error) {
    console.error('Error listing calendars:', error);
    res.status(500).json({ error: 'Failed to list calendars' });
  }
});

/**
 * Get events from Google Calendar
 */
router.get('/google/events', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { calendarId, timeMin, timeMax, maxResults } = req.query;

    const events = await googleCalendarService.getEvents(userId, {
      calendarId: calendarId || 'primary',
      timeMin,
      timeMax,
      maxResults: maxResults ? parseInt(maxResults) : 250,
    });

    res.json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

/**
 * Create event in Google Calendar
 */
router.post('/google/events', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const event = await googleCalendarService.createEvent(userId, req.body);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * Update event in Google Calendar
 */
router.put('/google/events/:eventId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    const event = await googleCalendarService.updateEvent(userId, eventId, req.body);
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * Delete event from Google Calendar
 */
router.delete('/google/events/:eventId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    const { calendarId } = req.query;

    await googleCalendarService.deleteEvent(userId, {
      calendarId: calendarId || 'primary',
      eventId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ==================== CRM Events ====================

/**
 * Get all CRM events for calendar
 */
router.get('/crm/events', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Get user's visibility preset
    const preset = await calendarPresetService.getUserPreset(userId);

    const events = await crmCalendarEventsService.getCRMEvents(userId, {
      startDate: startDate || new Date().toISOString(),
      endDate,
      categories: preset.visible_categories,
    });

    res.json(events);
  } catch (error) {
    console.error('Error getting CRM events:', error);
    res.status(500).json({ error: 'Failed to get CRM events' });
  }
});

// ==================== Calendar Presets ====================

/**
 * Get user's calendar preset
 */
router.get('/presets', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const preset = await calendarPresetService.getUserPreset(userId);
    res.json(preset);
  } catch (error) {
    console.error('Error getting preset:', error);
    res.status(500).json({ error: 'Failed to get calendar preset' });
  }
});

/**
 * Save user's calendar preset
 */
router.post('/presets', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const preset = await calendarPresetService.saveUserPreset(userId, req.body);
    res.json(preset);
  } catch (error) {
    console.error('Error saving preset:', error);
    res.status(500).json({ error: 'Failed to save calendar preset' });
  }
});

/**
 * Update category visibility
 */
router.put('/presets/category', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, subcategory, visible } = req.body;

    const preset = await calendarPresetService.updateCategoryVisibility(
      userId,
      category,
      subcategory,
      visible
    );

    res.json(preset);
  } catch (error) {
    console.error('Error updating category visibility:', error);
    res.status(500).json({ error: 'Failed to update category visibility' });
  }
});

/**
 * Update Google Calendar visibility
 */
router.put('/presets/google-calendar', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { calendarId, visible } = req.body;

    const preset = await calendarPresetService.updateGoogleCalendarVisibility(
      userId,
      calendarId,
      visible
    );

    res.json(preset);
  } catch (error) {
    console.error('Error updating Google Calendar visibility:', error);
    res.status(500).json({ error: 'Failed to update Google Calendar visibility' });
  }
});

/**
 * Reset preset to default
 */
router.post('/presets/reset', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const preset = await calendarPresetService.resetToDefault(userId);
    res.json(preset);
  } catch (error) {
    console.error('Error resetting preset:', error);
    res.status(500).json({ error: 'Failed to reset preset' });
  }
});

// ==================== Combined Events ====================

/**
 * Get all events (Google + CRM) for unified calendar view
 */
router.get('/events/all', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeMin, timeMax } = req.query;

    const preset = await calendarPresetService.getUserPreset(userId);
    const allEvents = [];

    // Check if Google Calendar is connected
    const isConnected = await googleCalendarService.isConnected(userId);

    // Get CRM events
    const crmEvents = await crmCalendarEventsService.getCRMEvents(userId, {
      startDate: timeMin || new Date().toISOString(),
      endDate: timeMax,
      categories: preset.visible_categories,
    });
    allEvents.push(...crmEvents);

    // Get Google Calendar events if connected
    if (isConnected) {
      try {
        const visibleCalendars = preset.visible_google_calendars || [];

        // If no specific calendars selected, get primary calendar
        if (visibleCalendars.length === 0) {
          const googleEvents = await googleCalendarService.getEvents(userId, {
            calendarId: 'primary',
            timeMin,
            timeMax,
          });

          // Transform Google events to match our format
          const transformedGoogleEvents = googleEvents.map(event => ({
            ...event,
            type: 'google',
            category: 'google',
            title: event.summary,
          }));

          allEvents.push(...transformedGoogleEvents);
        } else {
          // Get events from each visible calendar
          for (const calendarId of visibleCalendars) {
            const googleEvents = await googleCalendarService.getEvents(userId, {
              calendarId,
              timeMin,
              timeMax,
            });

            const transformedGoogleEvents = googleEvents.map(event => ({
              ...event,
              type: 'google',
              category: 'google',
              title: event.summary,
            }));

            allEvents.push(...transformedGoogleEvents);
          }
        }
      } catch (googleError) {
        console.error('Error fetching Google events:', googleError);
        // Continue with CRM events even if Google fails
      }
    }

    res.json(allEvents);
  } catch (error) {
    console.error('Error getting all events:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

export default router;
