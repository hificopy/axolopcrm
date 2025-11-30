import express from 'express';
import googleCalendarService from '../services/google-calendar-service.js';
import calendarPresetService from '../services/calendar-preset-service.js';
import crmCalendarEventsService from '../services/crm-calendar-events-service.js';
import recurringEventsService from '../services/recurring-events-service.js';
import timezoneService from '../services/timezone-service.js';
import aiMeetingIntelligenceService from '../services/ai-meeting-intelligence-service.js';
import bookingLinkService from '../services/booking-link-service.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== RECURRING EVENTS ====================

/**
 * Create recurring event
 */
router.post('/recurring', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventData, patternData } = req.body;

    const result = await recurringEventsService.createRecurringEvent(
      userId,
      eventData,
      patternData
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating recurring event:', error);
    res.status(500).json({ error: 'Failed to create recurring event' });
  }
});

/**
 * Get recurring pattern details
 */
router.get('/recurring/:patternId', protect, async (req, res) => {
  try {
    const { patternId } = req.params;
    const pattern = await recurringEventsService.getRecurringPattern(patternId);
    res.json(pattern);
  } catch (error) {
    console.error('Error getting recurring pattern:', error);
    res.status(500).json({ error: 'Failed to get recurring pattern' });
  }
});

/**
 * Get next occurrences of recurring event
 */
router.get('/recurring/:patternId/occurrences', protect, async (req, res) => {
  try {
    const { patternId } = req.params;
    const { count = 10 } = req.query;

    const occurrences = await recurringEventsService.getNextOccurrences(
      patternId,
      parseInt(count)
    );

    res.json(occurrences);
  } catch (error) {
    console.error('Error getting occurrences:', error);
    res.status(500).json({ error: 'Failed to get occurrences' });
  }
});

/**
 * Update entire recurring series
 */
router.put('/recurring/:patternId/series', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { patternId } = req.params;
    const updates = req.body;

    const result = await recurringEventsService.updateRecurringSeries(
      patternId,
      userId,
      updates
    );

    res.json(result);
  } catch (error) {
    console.error('Error updating series:', error);
    res.status(500).json({ error: 'Failed to update series' });
  }
});

/**
 * Update single recurring instance (creates exception)
 */
router.put('/recurring/instance/:eventId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    const updates = req.body;

    const result = await recurringEventsService.updateSingleInstance(
      eventId,
      userId,
      updates
    );

    res.json(result);
  } catch (error) {
    console.error('Error updating instance:', error);
    res.status(500).json({ error: 'Failed to update instance' });
  }
});

/**
 * Delete recurring series
 */
router.delete('/recurring/:patternId/series', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { patternId } = req.params;

    await recurringEventsService.deleteRecurringSeries(patternId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting series:', error);
    res.status(500).json({ error: 'Failed to delete series' });
  }
});

/**
 * Delete single recurring instance
 */
router.delete('/recurring/instance/:eventId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    await recurringEventsService.deleteSingleInstance(eventId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting instance:', error);
    res.status(500).json({ error: 'Failed to delete instance' });
  }
});

/**
 * Parse natural language to recurring pattern
 */
router.post('/recurring/parse', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const pattern = recurringEventsService.parseNaturalLanguage(text);
    res.json(pattern);
  } catch (error) {
    console.error('Error parsing text:', error);
    res.status(500).json({ error: 'Failed to parse text' });
  }
});

// ==================== TIMEZONE ====================

/**
 * Get all timezones
 */
router.get('/timezones', (req, res) => {
  const timezones = timezoneService.getAllTimezones();
  res.json(timezones);
});

/**
 * Search timezones
 */
router.get('/timezones/search', (req, res) => {
  const { q } = req.query;
  const results = timezoneService.searchTimezones(q);
  res.json(results);
});

/**
 * Get timezone info
 */
router.get('/timezones/:timezone/info', (req, res) => {
  try {
    const { timezone } = req.params;
    const info = timezoneService.getTimezoneInfo(decodeURIComponent(timezone));
    res.json(info);
  } catch (error) {
    console.error('Error getting timezone info:', error);
    res.status(500).json({ error: 'Failed to get timezone info' });
  }
});

/**
 * Find best meeting time across timezones
 */
router.post('/timezones/best-time', protect, async (req, res) => {
  try {
    const { timezones, duration, date } = req.body;
    const searchDate = date ? new Date(date) : new Date();

    const suggestions = timezoneService.findBestMeetingTime(
      timezones,
      duration,
      searchDate
    );

    res.json(suggestions);
  } catch (error) {
    console.error('Error finding best time:', error);
    res.status(500).json({ error: 'Failed to find best time' });
  }
});

/**
 * Save user's timezone preference
 */
router.post('/timezones/preference', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timezone } = req.body;

    await timezoneService.saveUserTimezone(userId, timezone);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving timezone:', error);
    res.status(500).json({ error: 'Failed to save timezone' });
  }
});

// ==================== AI MEETING INTELLIGENCE ====================

/**
 * Generate pre-meeting brief
 */
router.get('/ai/brief/:eventId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const brief = await aiMeetingIntelligenceService.generatePreMeetingBrief(
      eventId,
      userId
    );

    res.json(brief);
  } catch (error) {
    console.error('Error generating brief:', error);
    res.status(500).json({ error: 'Failed to generate meeting brief' });
  }
});

/**
 * Predict meeting outcome
 */
router.get('/ai/predict/:eventId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const prediction = await aiMeetingIntelligenceService.predictMeetingOutcome(
      eventId,
      userId
    );

    res.json(prediction);
  } catch (error) {
    console.error('Error predicting outcome:', error);
    res.status(500).json({ error: 'Failed to predict outcome' });
  }
});

/**
 * Learn from meeting outcome
 */
router.post('/ai/learn/:eventId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    const { outcome } = req.body;

    await aiMeetingIntelligenceService.learnFromOutcome(eventId, userId, outcome);
    res.json({ success: true });
  } catch (error) {
    console.error('Error learning from outcome:', error);
    res.status(500).json({ error: 'Failed to learn from outcome' });
  }
});

/**
 * Get AI suggestions for user
 */
router.get('/ai/suggestions', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const suggestions = await aiMeetingIntelligenceService.generateSuggestions(userId);
    res.json(suggestions);
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

/**
 * Suggest delegation for event
 */
router.get('/ai/delegate/:eventId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const suggestion = await aiMeetingIntelligenceService.suggestDelegation(
      eventId,
      userId
    );

    res.json(suggestion);
  } catch (error) {
    console.error('Error suggesting delegation:', error);
    res.status(500).json({ error: 'Failed to suggest delegation' });
  }
});

/**
 * Learn scheduling preferences
 */
router.post('/ai/learn-preferences', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await aiMeetingIntelligenceService.learnSchedulingPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error('Error learning preferences:', error);
    res.status(500).json({ error: 'Failed to learn preferences' });
  }
});

// ==================== BOOKING LINKS (Protected) ====================

/**
 * Create booking link
 */
router.post('/booking-links', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const linkData = req.body;

    const bookingLink = await bookingLinkService.createBookingLink(userId, linkData);
    res.status(201).json(bookingLink);
  } catch (error) {
    console.error('Error creating booking link:', error);
    res.status(500).json({ error: error.message || 'Failed to create booking link' });
  }
});

/**
 * Get user's booking links
 */
router.get('/booking-links', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const links = await bookingLinkService.getUserBookingLinks(userId);
    res.json(links);
  } catch (error) {
    console.error('Error getting booking links:', error);
    res.status(500).json({ error: 'Failed to get booking links' });
  }
});

/**
 * Get booking link analytics
 */
router.get('/booking-links/:id/analytics', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await bookingLinkService.getBookingAnalytics(id);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

/**
 * Cancel booking
 */
router.post('/bookings/:id/cancel', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await bookingLinkService.cancelBooking(id, reason);
    res.json(booking);
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// ==================== BOOKING LINKS (Public) ====================

/**
 * Get booking link details (PUBLIC)
 */
router.get('/book/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const bookingLink = await bookingLinkService.getBookingLink(slug);

    if (!bookingLink) {
      return res.status(404).json({ error: 'Booking link not found' });
    }

    res.json(bookingLink);
  } catch (error) {
    console.error('Error getting booking link:', error);
    res.status(500).json({ error: 'Failed to get booking link' });
  }
});

/**
 * Get available slots (PUBLIC)
 */
router.get('/book/:slug/available', async (req, res) => {
  try {
    const { slug } = req.params;
    const { date, timezone = 'America/New_York' } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    const slots = await bookingLinkService.getAvailableSlots(slug, date, timezone);
    res.json(slots);
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

/**
 * Book a slot (PUBLIC)
 */
router.post('/book/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const bookingData = req.body;

    const result = await bookingLinkService.bookSlot(slug, bookingData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ error: error.message || 'Failed to book slot' });
  }
});

// ==================== DRAG & DROP / CONFLICT DETECTION ====================

/**
 * Check for conflicts when rescheduling
 */
router.post('/events/check-conflicts', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { start_time, end_time, exclude_event_id, attendee_emails } = req.body;

    // Get user's events in this time range
    const { data: userConflicts } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .neq('id', exclude_event_id || '')
      .neq('status', 'cancelled')
      .or(`and(start_time.lte.${end_time},end_time.gte.${start_time})`);

    // Check team member conflicts if attendee emails provided
    let teamConflicts = [];
    if (attendee_emails && attendee_emails.length > 0) {
      // This would check team members' calendars
      // Simplified version here
    }

    const hasConflicts = (userConflicts?.length || 0) > 0 || teamConflicts.length > 0;

    res.json({
      hasConflicts,
      userConflicts: userConflicts || [],
      teamConflicts,
      suggestions: hasConflicts ? await suggestAlternativeTimes(start_time, end_time, userId) : []
    });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({ error: 'Failed to check conflicts' });
  }
});

/**
 * Reschedule event (handles drag & drop)
 */
router.put('/events/:eventId/reschedule', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;
    const { new_start_time, new_end_time, notify_attendees = true } = req.body;

    // Check conflicts first
    const conflictsResponse = await fetch(`${req.protocol}://${req.get('host')}/api/calendar/events/check-conflicts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_time: new_start_time,
        end_time: new_end_time,
        exclude_event_id: eventId
      })
    });

    const { hasConflicts } = await conflictsResponse.json();

    if (hasConflicts) {
      return res.status(409).json({
        error: 'Time slot has conflicts',
        hasConflicts: true
      });
    }

    // Update the event
    const { data: event, error } = await supabase
      .from('calendar_events')
      .update({
        start_time: new_start_time,
        end_time: new_end_time,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // If Google Calendar event, update there too
    if (event.google_event_id && event.google_calendar_id) {
      try {
        await googleCalendarService.updateEvent(userId, event.google_event_id, {
          start: new_start_time,
          end: new_end_time,
          calendarId: event.google_calendar_id
        });
      } catch (googleError) {
        console.error('Error updating Google Calendar:', googleError);
        // Continue anyway, mark sync status as conflict
        await supabase
          .from('calendar_events')
          .update({ sync_status: 'conflict' })
          .eq('id', eventId);
      }
    }

    res.json(event);
  } catch (error) {
    console.error('Error rescheduling event:', error);
    res.status(500).json({ error: 'Failed to reschedule event' });
  }
});

// ==================== EVENT TEMPLATES ====================

/**
 * Create event template
 */
router.post('/templates', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const templateData = req.body;

    const { data, error } = await supabase
      .from('calendar_event_templates')
      .insert({
        user_id: userId,
        ...templateData
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * Get user's event templates
 */
router.get('/templates', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('calendar_event_templates')
      .select('*')
      .eq('user_id', userId)
      .order('use_count', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

/**
 * Create event from template
 */
router.post('/templates/:templateId/create', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateId } = req.params;
    const { start_time, overrides = {} } = req.body;

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('calendar_event_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', userId)
      .single();

    if (templateError) throw templateError;

    // Calculate end time based on template duration
    const startDate = new Date(start_time);
    const endDate = new Date(startDate.getTime() + template.default_duration * 60 * 1000);

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .insert({
        user_id: userId,
        title: overrides.title || template.default_title_template,
        description: overrides.description || template.default_description_template,
        start_time: start_time,
        end_time: endDate.toISOString(),
        event_type: template.event_type,
        category: template.category,
        subcategory: template.subcategory,
        location: overrides.location || template.default_location,
        meeting_url: overrides.meeting_url || template.default_meeting_url,
        color: template.color,
        template_id: templateId,
        status: 'scheduled',
        ...overrides
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // Update template usage
    await supabase
      .from('calendar_event_templates')
      .update({
        use_count: template.use_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', templateId);

    // Generate AI prep if enabled
    if (template.auto_generate_prep) {
      await aiMeetingIntelligenceService.generatePreMeetingBrief(event.id, userId);
    }

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event from template:', error);
    res.status(500).json({ error: 'Failed to create event from template' });
  }
});

// Helper function
async function suggestAlternativeTimes(originalStart, originalEnd, userId) {
  // Simplified - would implement more sophisticated logic
  const duration = new Date(originalEnd) - new Date(originalStart);
  const suggestions = [];

  // Suggest next hour
  const nextHour = new Date(new Date(originalStart).getTime() + 60 * 60 * 1000);
  suggestions.push({
    start: nextHour.toISOString(),
    end: new Date(nextHour.getTime() + duration).toISOString(),
    reason: 'Next available hour'
  });

  return suggestions;
}

export default router;
