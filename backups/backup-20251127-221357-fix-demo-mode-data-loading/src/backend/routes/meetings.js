import express from 'express';
// Using enhanced booking service only (unified schema)
import enhancedBookingLinkService from '../services/booking-link-service-enhanced.js';
import bookingEmailService from '../services/booking-email-service.js';
import { supabaseServer } from '../config/supabase-auth.js';
import { protect } from '../middleware/authMiddleware.js';
import { extractAgencyContext, requireEditPermissions } from '../middleware/agency-access.js';

const router = express.Router();
const supabase = supabaseServer;

// Apply agency context extraction to all routes
router.use(extractAgencyContext);

/**
 * Meetings API Routes
 * Integrates with booking-link-service for advanced scheduling functionality
 */

// Get all booking links for user
router.get('/booking-links', protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const links = await enhancedBookingLinkService.getUserBookingLinks(userId);
    res.json(links);
  } catch (error) {
    console.error('Error fetching booking links:', error);
    res.status(500).json({ error: 'Failed to fetch booking links' });
  }
});

// Get single booking link by slug
router.get('/booking-links/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await enhancedBookingLinkService.getBookingLink(slug);

    if (!link) {
      return res.status(404).json({ error: 'Booking link not found' });
    }

    res.json(link);
  } catch (error) {
    console.error('Error fetching booking link:', error);
    res.status(500).json({ error: 'Failed to fetch booking link' });
  }
});

// Create new booking link (with advanced scheduling features)
router.post('/booking-links', protect, requireEditPermissions, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const linkData = req.body;
    const link = await enhancedBookingLinkService.createBookingLink(userId, linkData);
    res.status(201).json(link);
  } catch (error) {
    console.error('Error creating booking link:', error);
    res.status(500).json({ error: error.message || 'Failed to create booking link' });
  }
});

// Update booking link
router.put('/booking-links/:id', protect, requireEditPermissions, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const updates = req.body;
    const link = await enhancedBookingLinkService.updateBookingLink(id, userId, updates);
    res.json(link);
  } catch (error) {
    console.error('Error updating booking link:', error);
    res.status(500).json({ error: 'Failed to update booking link' });
  }
});

// Delete booking link
router.delete('/booking-links/:id', protect, requireEditPermissions, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await enhancedBookingLinkService.deleteBookingLink(id, userId);
    res.json({ success: true, message: 'Booking link deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking link:', error);
    res.status(500).json({ error: 'Failed to delete booking link' });
  }
});

// Get available time slots for a booking link
router.get('/booking-links/:slug/availability', async (req, res) => {
  try {
    const { slug } = req.params;
    const { date, timezone } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const result = await enhancedBookingLinkService.getAvailableSlots(
      slug,
      date,
      timezone || 'America/New_York'
    );

    res.json(result);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// Get availability calendar (7 days with counts)
router.get('/booking-links/:slug/availability-calendar', async (req, res) => {
  try {
    const { slug } = req.params;
    const { startDate, timezone } = req.query;

    const calendar = await enhancedBookingLinkService.getAvailabilityCalendar(
      slug,
      startDate || new Date().toISOString().split('T')[0],
      timezone || 'America/New_York'
    );

    res.json(calendar);
  } catch (error) {
    console.error('Error fetching availability calendar:', error);
    res.status(500).json({ error: 'Failed to fetch availability calendar' });
  }
});

// Auto-save form data (saves lead even if they don't complete booking)
router.post('/booking-links/:slug/auto-save', async (req, res) => {
  try {
    const { slug } = req.params;
    const { leadId, formData, currentStep } = req.body;

    // Get booking link to check disqualification rules AND get creator user_id
    const bookingLink = await enhancedBookingLinkService.getBookingLink(slug);
    if (!bookingLink) {
      return res.status(404).json({ error: 'Booking link not found' });
    }

    const bookingLinkCreatorUserId = bookingLink.user_id; // The booking link creator

    // Check for automatic disqualification
    let disqualified = false;
    let disqualificationReason = null;
    let redirectUrl = null;

    // Business email requirement
    if (formData.email && bookingLink.require_business_email) {
      const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
      const domain = formData.email.split('@')[1]?.toLowerCase();
      if (freeEmailDomains.includes(domain)) {
        disqualified = true;
        disqualificationReason = 'We only work with business email addresses';
        redirectUrl = bookingLink.disqualified_redirect_url;
      }
    }

    // Country code filtering
    if (formData.phone && bookingLink.allowed_country_codes) {
      const phoneNumber = formData.phone.trim();
      if (phoneNumber.startsWith('+')) {
        const countryCode = phoneNumber.substring(0, 3);
        if (!bookingLink.allowed_country_codes.includes(countryCode)) {
          disqualified = true;
          disqualificationReason = 'We currently only serve specific regions';
          redirectUrl = bookingLink.disqualified_redirect_url;
        }
      }
    }

    // Check custom disqualification rules
    if (bookingLink.disqualification_rules) {
      for (const rule of bookingLink.disqualification_rules) {
        const fieldValue = formData[rule.field];

        if (rule.operator === 'equals' && fieldValue === rule.value) {
          disqualified = true;
          disqualificationReason = rule.message || 'Based on your responses, we may not be the best fit';
          redirectUrl = bookingLink.disqualified_redirect_url;
          break;
        }

        if (rule.operator === 'not_equals' && fieldValue !== rule.value) {
          disqualified = true;
          disqualificationReason = rule.message;
          redirectUrl = bookingLink.disqualified_redirect_url;
          break;
        }

        if (rule.operator === 'less_than' && parseFloat(fieldValue) < parseFloat(rule.value)) {
          disqualified = true;
          disqualificationReason = rule.message;
          redirectUrl = bookingLink.disqualified_redirect_url;
          break;
        }

        if (rule.operator === 'greater_than' && parseFloat(fieldValue) > parseFloat(rule.value)) {
          disqualified = true;
          disqualificationReason = rule.message;
          redirectUrl = bookingLink.disqualified_redirect_url;
          break;
        }
      }
    }

    // Save or update lead in CRM
    const { supabase } = await import('../config/supabase-auth.js');

    let savedLeadId = leadId;

    if (leadId) {
      // Update existing lead (ensure it belongs to booking link creator)
      await supabase
        .from('leads')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          qualification_data: formData,
          qualification_step: currentStep,
          qualified: !disqualified,
          disqualification_reason: disqualificationReason,
          booking_link_slug: slug,
          status: disqualified ? 'DISQUALIFIED' : (formData.status || 'DRAFT'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId)
        .eq('user_id', bookingLinkCreatorUserId); // Ensure lead belongs to creator
    } else {
      // Create new lead associated with booking link creator
      const { data, error } = await supabase
        .from('leads')
        .insert({
          user_id: bookingLinkCreatorUserId, // Associate with booking link creator
          name: formData.name || formData.email || 'Draft Lead',
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          source: `Booking Link: ${bookingLink.title || slug}`,
          status: disqualified ? 'DISQUALIFIED' : 'DRAFT',
          type: 'B2B_COMPANY', // Default type for meetings
          value: 0,
          custom_fields: {
            qualification_data: formData,
            qualification_step: currentStep,
            booking_link_slug: slug,
            booking_link_id: bookingLink.id
          },
          qualified: !disqualified,
          disqualification_reason: disqualificationReason,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        savedLeadId = data.id;
      } else if (error) {
        console.error('Error creating draft lead:', error);
      }
    }

    res.json({
      success: true,
      leadId: savedLeadId,
      disqualified,
      reason: disqualificationReason,
      redirectUrl,
    });
  } catch (error) {
    console.error('Auto-save error:', error);
    res.status(500).json({ error: 'Failed to save form data' });
  }
});

// Book a time slot (public endpoint)
router.post('/booking-links/:slug/book', async (req, res) => {
  try {
    const { slug } = req.params;
    const bookingData = req.body;

    // Validate required fields
    const { name, email, scheduled_time } = bookingData;
    if (!name || !email || !scheduled_time) {
      return res.status(400).json({
        error: 'Name, email, and scheduled_time are required'
      });
    }

    const result = await enhancedBookingLinkService.bookSlot(slug, bookingData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ error: error.message || 'Failed to book slot' });
  }
});

// Get booking analytics
router.get('/booking-links/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await enhancedBookingLinkService.getBookingAnalytics(id);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Cancel a booking
router.post('/bookings/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, cancelledBy } = req.body;

    const booking = await enhancedBookingLinkService.cancelBooking(
      id,
      reason,
      cancelledBy || 'lead'
    );
    res.json(booking);
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Reschedule a booking
router.post('/bookings/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { newScheduledTime, timezone } = req.body;

    if (!newScheduledTime) {
      return res.status(400).json({ error: 'newScheduledTime is required' });
    }

    const booking = await enhancedBookingLinkService.rescheduleBooking(
      id,
      newScheduledTime,
      timezone || 'America/New_York'
    );

    res.json(booking);
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    res.status(500).json({ error: error.message || 'Failed to reschedule booking' });
  }
});

// Get overall meeting analytics (for dashboard)
router.get('/analytics/overview', async (req, res) => {
  try {
    const userId = req.user?.id;

    // Fetch all bookings assigned to this user
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('assigned_to', userId);

    if (bookingsError) throw bookingsError;

    // Calculate real metrics
    const totalBookings = bookings?.length || 0;
    const showedUp = bookings?.filter(b => b.status === 'completed' || b.status === 'showed').length || 0;
    const closed = bookings?.filter(b => b.status === 'closed' || b.opportunity_status === 'won').length || 0;

    const showRate = totalBookings > 0 ? Math.round((showedUp / totalBookings) * 100) : 0;
    const closeRate = showedUp > 0 ? Math.round((closed / showedUp) * 100) : 0;

    // Calculate average booking value from opportunities
    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('value')
      .eq('user_id', userId)
      .not('value', 'is', null);

    const avgBookingValue = opportunities && opportunities.length > 0
      ? Math.round(opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0) / opportunities.length)
      : 0;

    // Get monthly trend (last 5 months)
    const monthlyTrend = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      const monthBookings = bookings?.filter(b => {
        const bookingDate = new Date(b.created_at);
        return bookingDate.getMonth() === date.getMonth() &&
               bookingDate.getFullYear() === date.getFullYear();
      }) || [];

      monthlyTrend.push({
        month: monthName,
        bookings: monthBookings.length,
        shows: monthBookings.filter(b => b.status === 'completed' || b.status === 'showed').length,
        closes: monthBookings.filter(b => b.status === 'closed' || b.opportunity_status === 'won').length
      });
    }

    const analytics = {
      totalBookings,
      showRate,
      closeRate,
      avgBookingValue,
      monthlyTrend
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get sales analytics
router.get('/analytics/sales', async (req, res) => {
  try {
    const userId = req.user?.id;

    // Fetch bookings and opportunities
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('assigned_to', userId);

    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('*')
      .eq('user_id', userId);

    // Calculate conversion funnel
    const booked = bookings?.length || 0;
    const showed = bookings?.filter(b => b.status === 'completed' || b.status === 'showed').length || 0;
    const closed = opportunities?.filter(o => o.status === 'won').length || 0;

    // Calculate outcomes
    const won = opportunities?.filter(o => o.status === 'won').length || 0;
    const lost = opportunities?.filter(o => o.status === 'lost').length || 0;
    const pending = opportunities?.filter(o => o.status === 'open' || o.status === 'in_progress').length || 0;

    // Calculate revenue metrics
    const wonOpportunities = opportunities?.filter(o => o.status === 'won') || [];
    const totalRevenue = wonOpportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
    const avgDealSize = wonOpportunities.length > 0 ? Math.round(totalRevenue / wonOpportunities.length) : 0;
    const pipelineValue = opportunities?.filter(o => o.status !== 'won' && o.status !== 'lost')
      .reduce((sum, opp) => sum + (opp.value || 0), 0) || 0;

    // Get lead sources from leads table
    const { data: leads } = await supabase
      .from('leads')
      .select('source')
      .eq('user_id', userId);

    const leadSourceMap = {};
    leads?.forEach(lead => {
      const source = lead.source || 'Unknown';
      if (!leadSourceMap[source]) {
        leadSourceMap[source] = { bookings: 0, conversions: 0 };
      }
      leadSourceMap[source].bookings++;
    });

    const leadSources = Object.entries(leadSourceMap).map(([name, data]) => ({
      name,
      bookings: data.bookings,
      conversions: data.conversions,
      rate: data.bookings > 0 ? Math.round((data.conversions / data.bookings) * 100) : 0
    })).slice(0, 4);

    const salesAnalytics = {
      conversionFunnel: { booked, showed, closed },
      outcomes: { won, lost, pending },
      topObjections: [], // Can be populated from call notes/feedback
      revenueMetrics: { totalRevenue, avgDealSize, pipelineValue },
      topClosers: [], // Can be populated from user/team data
      leadSources
    };

    res.json(salesAnalytics);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

// Get scheduling analytics
router.get('/analytics/scheduling', async (req, res) => {
  try {
    const userId = req.user?.id;

    // Fetch bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('assigned_to', userId);

    if (!bookings) {
      return res.json({
        bookingTrends: [],
        cancellationRate: 0,
        rescheduleRate: 0,
        noShowRate: 0,
        popularTimeSlots: [],
        eventTypes: [],
        busiestDays: []
      });
    }

    // Calculate booking trends (last 5 months)
    const bookingTrends = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.created_at);
        return bookingDate.getMonth() === date.getMonth() &&
               bookingDate.getFullYear() === date.getFullYear();
      });

      bookingTrends.push({
        month: monthName,
        booked: monthBookings.length,
        occurred: monthBookings.filter(b => b.status === 'completed').length
      });
    }

    // Calculate rates
    const totalBookings = bookings.length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const rescheduled = bookings.filter(b => b.rescheduled).length;
    const noShow = bookings.filter(b => b.status === 'no_show').length;

    const cancellationRate = totalBookings > 0 ? Math.round((cancelled / totalBookings) * 100) : 0;
    const rescheduleRate = totalBookings > 0 ? Math.round((rescheduled / totalBookings) * 100) : 0;
    const noShowRate = totalBookings > 0 ? Math.round((noShow / totalBookings) * 100) : 0;

    // Get popular time slots
    const timeSlotMap = {};
    bookings.forEach(booking => {
      if (booking.scheduled_time) {
        const time = new Date(booking.scheduled_time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        timeSlotMap[time] = (timeSlotMap[time] || 0) + 1;
      }
    });

    const popularTimeSlots = Object.entries(timeSlotMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([time, bookings]) => ({ time, bookings }));

    // Get busiest days
    const dayMap = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
    bookings.forEach(booking => {
      if (booking.scheduled_time) {
        const day = new Date(booking.scheduled_time).toLocaleDateString('en-US', { weekday: 'long' });
        if (dayMap.hasOwnProperty(day)) {
          dayMap[day]++;
        }
      }
    });

    const busiestDays = Object.entries(dayMap)
      .map(([day, bookings]) => ({ day, bookings }))
      .filter(d => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(d.day));

    // Get event types
    const { data: bookingLinks } = await supabase
      .from('booking_links')
      .select('name, duration')
      .eq('user_id', userId);

    const eventTypes = bookingLinks?.map(link => ({
      name: link.name,
      bookings: bookings.filter(b => b.booking_link_name === link.name).length,
      avgDuration: link.duration || 30
    })) || [];

    const schedulingAnalytics = {
      bookingTrends,
      cancellationRate,
      rescheduleRate,
      noShowRate,
      popularTimeSlots,
      eventTypes,
      busiestDays
    };

    res.json(schedulingAnalytics);
  } catch (error) {
    console.error('Error fetching scheduling analytics:', error);
    res.status(500).json({ error: 'Failed to fetch scheduling analytics' });
  }
});

// Lead qualification endpoints

// Get qualification forms for a booking link
router.get('/booking-links/:id/qualification', async (req, res) => {
  try {
    const { id } = req.params;

    // Implementation will fetch qualification form configuration
    res.json({ message: 'Qualification form endpoint - to be implemented' });
  } catch (error) {
    console.error('Error fetching qualification form:', error);
    res.status(500).json({ error: 'Failed to fetch qualification form' });
  }
});

// Save qualification form for a booking link
router.post('/booking-links/:id/qualification', async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Implementation will save qualification form
    // This enables the 2-step scheduler
    res.json({ message: 'Qualification form save endpoint - to be implemented' });
  } catch (error) {
    console.error('Error saving qualification form:', error);
    res.status(500).json({ error: 'Failed to save qualification form' });
  }
});

// Submit qualification responses (public endpoint - 2-step evaluation)
router.post('/booking-links/:slug/qualify', async (req, res) => {
  try {
    const { slug } = req.params;
    const { leadId, formData } = req.body;

    // Get booking link configuration
    const bookingLink = await enhancedBookingLinkService.getBookingLink(slug);
    if (!bookingLink) {
      return res.status(404).json({ error: 'Booking link not found' });
    }

    // Default to qualified
    let qualified = true;
    let disqualificationReason = null;

    // Check all qualification rules
    if (bookingLink.qualification_rules) {
      for (const rule of bookingLink.qualification_rules) {
        const fieldValue = formData[rule.field];

        // Required field not filled
        if (rule.required && !fieldValue) {
          qualified = false;
          disqualificationReason = `${rule.label} is required`;
          break;
        }

        // Minimum value check
        if (rule.min && parseFloat(fieldValue) < parseFloat(rule.min)) {
          qualified = false;
          disqualificationReason = rule.min_message || `${rule.label} is too low`;
          break;
        }

        // Maximum value check
        if (rule.max && parseFloat(fieldValue) > parseFloat(rule.max)) {
          qualified = false;
          disqualificationReason = rule.max_message || `${rule.label} is too high`;
          break;
        }

        // Exact match requirement
        if (rule.required_value && fieldValue !== rule.required_value) {
          qualified = false;
          disqualificationReason = rule.failure_message || 'Does not meet qualification criteria';
          break;
        }

        // Pattern matching (regex)
        if (rule.pattern) {
          const regex = new RegExp(rule.pattern);
          if (!regex.test(fieldValue)) {
            qualified = false;
            disqualificationReason = rule.pattern_message || 'Invalid format';
            break;
          }
        }
      }
    }

    // Update lead qualification status
    const { supabase } = await import('../config/supabase-auth.js');
    if (leadId) {
      await supabase
        .from('leads')
        .update({
          qualified,
          disqualification_reason: disqualificationReason,
          qualification_completed_at: new Date().toISOString(),
        })
        .eq('id', leadId);
    }

    // Determine team member assignment if qualified
    let assignedTo = null;
    if (qualified && bookingLink.assignment_type) {
      if (bookingLink.assignment_type === 'round_robin' && bookingLink.team_member_ids) {
        // Round-robin assignment
        assignedTo = await enhancedBookingLinkService.roundRobinAssignment(
          bookingLink.team_member_ids,
          bookingLink.id
        );
      } else if (bookingLink.assignment_type === 'load_balanced' && bookingLink.team_member_ids) {
        // Load-balanced assignment
        assignedTo = await enhancedBookingLinkService.loadBalancedAssignment(
          bookingLink.team_member_ids
        );
      }
    }

    res.json({
      qualified,
      message: qualified
        ? 'Great! You qualify for a meeting. Please select a time below.'
        : disqualificationReason || 'Based on your responses, we may not be the best fit at this time.',
      assignedTo,
      reason: disqualificationReason,
    });
  } catch (error) {
    console.error('Error processing qualification:', error);
    res.status(500).json({ error: 'Failed to process qualification' });
  }
});

// Process pending reminder emails (called by cron job)
router.post('/reminders/process', async (req, res) => {
  try {
    // Optional API key verification for cron jobs
    const apiKey = req.headers['x-api-key'];
    if (process.env.CRON_API_KEY && apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await bookingEmailService.processPendingReminders();
    res.json(result);
  } catch (error) {
    console.error('Error processing reminders:', error);
    res.status(500).json({ error: 'Failed to process reminders' });
  }
});

// Generate ICS file for a booking
router.get('/bookings/:id/ics', async (req, res) => {
  try {
    const { id } = req.params;

    // Get booking details
    const { supabase } = await import('../config/supabase-auth.js');
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        booking_link:booking_links(*)
      `)
      .eq('id', id)
      .single();

    if (error || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Generate ICS file content
    const { DateTime } = await import('luxon');
    const startTime = DateTime.fromISO(booking.scheduled_time);
    const endTime = startTime.plus({ minutes: booking.duration });

    const location = booking.location_type === 'phone'
      ? booking.location_details?.phone || 'Phone Call'
      : booking.location_details?.url || booking.location_details?.address || 'TBD';

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Axolop CRM//Booking System//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:booking-${booking.id}@axolop.com
DTSTAMP:${DateTime.now().toFormat("yyyyMMdd'T'HHmmss'Z'")}
DTSTART:${startTime.toFormat("yyyyMMdd'T'HHmmss'Z'")}
DTEND:${endTime.toFormat("yyyyMMdd'T'HHmmss'Z'")}
SUMMARY:${booking.booking_link.name}
DESCRIPTION:${booking.booking_link.description || ''}
LOCATION:${location}
STATUS:CONFIRMED
SEQUENCE:0
ORGANIZER;CN=${booking.booking_link.host_name || 'Axolop'}:mailto:noreply@axolop.com
ATTENDEE;CN=${booking.name};RSVP=TRUE:mailto:${booking.email}
END:VEVENT
END:VCALENDAR`;

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="booking-${booking.id}.ics"`);
    res.send(icsContent);
  } catch (error) {
    console.error('Error generating ICS file:', error);
    res.status(500).json({ error: 'Failed to generate calendar file' });
  }
});

// Manual test endpoint for sending confirmation email
router.post('/bookings/:id/send-confirmation', async (req, res) => {
  try {
    const { id } = req.params;

    // Get booking details
    const { supabase } = await import('../config/supabase-auth.js');
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        booking_link:booking_links(*)
      `)
      .eq('id', id)
      .single();

    if (error || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Get host info
    let hostInfo = null;
    if (booking.assigned_to) {
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', booking.assigned_to)
        .single();
      hostInfo = userData;
    }

    // Send confirmation email
    await bookingEmailService.sendConfirmationEmail(
      booking,
      booking.booking_link,
      hostInfo
    );

    res.json({ success: true, message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Error sending confirmation:', error);
    res.status(500).json({ error: 'Failed to send confirmation email' });
  }
});

export default router;
