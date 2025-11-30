import { supabaseServer } from '../config/supabase-auth.js';
import { DateTime, Interval } from 'luxon';
import bookingEmailService from './booking-email-service.js';

/**
 * Availability Service
 * Comprehensive availability checking for booking links
 * Integrates with calendar_events and user availability settings
 */
class AvailabilityService {
  /**
   * Get available time slots for a specific date and booking link
   */
  async getAvailableSlots(bookingLink, date, timezone = 'America/New_York') {
    try {
      // Parse the target date in the specified timezone
      const targetDate = DateTime.fromISO(date, { zone: timezone });

      if (!targetDate.isValid) {
        throw new Error('Invalid date format');
      }

      // Validate date is within allowed range
      const validation = this.validateDateRange(bookingLink, targetDate);
      if (!validation.valid) {
        return {
          slots: [],
          message: validation.message,
          date: targetDate.toISODate(),
        };
      }

      // Get working hours for this day
      const workingHours = await this.getWorkingHoursForDate(
        bookingLink,
        targetDate
      );

      if (!workingHours || workingHours.length === 0) {
        return {
          slots: [],
          message: 'No availability on this date',
          date: targetDate.toISODate(),
        };
      }

      // Get hosts (team members who can take this booking)
      const hosts = await this.getBookingHosts(bookingLink);

      if (!hosts || hosts.length === 0) {
        return {
          slots: [],
          message: 'No hosts available',
          date: targetDate.toISODate(),
        };
      }

      // Generate all possible time slots based on working hours
      const allSlots = this.generateTimeSlots(
        targetDate,
        workingHours,
        bookingLink.duration,
        bookingLink.start_time_increment || 30,
        timezone
      );

      // Get existing events for all hosts on this date
      const existingEvents = await this.getExistingEvents(
        hosts.map(h => h.user_id),
        targetDate.startOf('day').toISO(),
        targetDate.endOf('day').toISO()
      );

      // Filter slots based on availability
      const availableSlots = this.filterAvailableSlots(
        allSlots,
        existingEvents,
        bookingLink,
        hosts,
        targetDate,
        timezone
      );

      // Check daily booking limits
      const limitedSlots = await this.applyBookingLimits(
        availableSlots,
        bookingLink,
        targetDate
      );

      return {
        slots: limitedSlots,
        date: targetDate.toISODate(),
        timezone,
        hostsAvailable: hosts.length,
      };
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  /**
   * Validate date is within allowed booking range
   */
  validateDateRange(bookingLink, targetDate) {
    const now = DateTime.now();

    // Check minimum notice
    const minDate = now.plus({ hours: bookingLink.min_notice_hours || 1 });
    if (targetDate < minDate) {
      return {
        valid: false,
        message: `Bookings require at least ${bookingLink.min_notice_hours || 1} hour(s) notice`,
      };
    }

    // Check maximum advance booking
    const dateRangeValue = bookingLink.date_range_value || 14;
    const dateRangeType = bookingLink.date_range_type || 'calendar_days';

    let maxDate;
    if (dateRangeType === 'calendar_days') {
      maxDate = now.plus({ days: dateRangeValue });
    } else if (dateRangeType === 'business_days') {
      // Calculate business days (skip weekends)
      let businessDaysAdded = 0;
      let currentDate = now;
      while (businessDaysAdded < dateRangeValue) {
        currentDate = currentDate.plus({ days: 1 });
        const dayOfWeek = currentDate.weekday;
        if (dayOfWeek !== 6 && dayOfWeek !== 7) { // Not Saturday or Sunday
          businessDaysAdded++;
        }
      }
      maxDate = currentDate;
    } else {
      maxDate = now.plus({ years: 1 }); // Indefinite - 1 year max
    }

    if (targetDate > maxDate) {
      return {
        valid: false,
        message: `Bookings can only be made up to ${dateRangeValue} ${dateRangeType} in advance`,
      };
    }

    return { valid: true };
  }

  /**
   * Get working hours for a specific date
   * This will check:
   * 1. Custom availability overrides (future feature)
   * 2. Weekly schedule
   */
  async getWorkingHoursForDate(bookingLink, targetDate) {
    try {
      // For now, use default business hours
      // In production, this would fetch from a user_availability table
      const dayOfWeek = targetDate.weekday; // 1 = Monday, 7 = Sunday
      const dayName = targetDate.toFormat('cccc').toLowerCase();

      // Check if it's a weekend
      if (dayOfWeek === 6 || dayOfWeek === 7) {
        return []; // No availability on weekends by default
      }

      // Default business hours: 9 AM - 5 PM
      return [
        {
          start: '09:00',
          end: '17:00',
        },
      ];
    } catch (error) {
      console.error('Error getting working hours:', error);
      return [];
    }
  }

  /**
   * Get hosts (team members) for this booking link
   */
  async getBookingHosts(bookingLink) {
    try {
      const { data: hosts, error } = await supabaseServer
        .from('booking_link_hosts')
        .select('user_id, priority, is_active')
        .eq('booking_link_id', bookingLink.id)
        .eq('is_active', true)
        .order('priority_order');

      if (error) {
        console.error('Error fetching hosts:', error);
        return [{ user_id: bookingLink.user_id }]; // Fallback to owner
      }

      if (!hosts || hosts.length === 0) {
        return [{ user_id: bookingLink.user_id }]; // Fallback to owner
      }

      return hosts;
    } catch (error) {
      console.error('Error getting booking hosts:', error);
      return [{ user_id: bookingLink.user_id }];
    }
  }

  /**
   * Generate time slots based on working hours
   */
  generateTimeSlots(date, workingHours, duration, increment, timezone) {
    const slots = [];

    for (const timeRange of workingHours) {
      const [startHour, startMinute] = timeRange.start.split(':').map(Number);
      const [endHour, endMinute] = timeRange.end.split(':').map(Number);

      let slotStart = date.set({ hour: startHour, minute: startMinute });
      const rangeEnd = date.set({ hour: endHour, minute: endMinute });

      // Generate slots at specified intervals
      while (slotStart.plus({ minutes: duration }) <= rangeEnd) {
        const slotEnd = slotStart.plus({ minutes: duration });

        slots.push({
          start: slotStart.toISO(),
          end: slotEnd.toISO(),
          startTime: slotStart.toFormat('h:mm a'),
          endTime: slotEnd.toFormat('h:mm a'),
          formatted: slotStart.toFormat('h:mm a'),
          timezone,
          available: true, // Will be updated during filtering
        });

        slotStart = slotStart.plus({ minutes: increment });
      }
    }

    return slots;
  }

  /**
   * Get existing calendar events for hosts
   */
  async getExistingEvents(hostUserIds, startISO, endISO) {
    try {
      const { data: events, error } = await supabaseServer
        .from('calendar_events')
        .select('id, user_id, start_time, end_time, status')
        .in('user_id', hostUserIds)
        .gte('start_time', startISO)
        .lte('end_time', endISO)
        .neq('status', 'cancelled')
        .neq('status', 'declined');

      if (error) {
        console.error('Error fetching existing events:', error);
        return [];
      }

      return events || [];
    } catch (error) {
      console.error('Error getting existing events:', error);
      return [];
    }
  }

  /**
   * Filter slots to show only available ones
   */
  filterAvailableSlots(slots, existingEvents, bookingLink, hosts, targetDate, timezone) {
    const bufferBefore = bookingLink.buffer_before || 0;
    const bufferAfter = bookingLink.buffer_after || 0;

    return slots.filter(slot => {
      const slotStart = DateTime.fromISO(slot.start, { zone: timezone });
      const slotEnd = DateTime.fromISO(slot.end, { zone: timezone });

      // Add buffer times
      const slotStartWithBuffer = slotStart.minus({ minutes: bufferBefore });
      const slotEndWithBuffer = slotEnd.plus({ minutes: bufferAfter });

      // Check if ANY host is available for this slot
      const isAnyHostAvailable = hosts.some(host => {
        // Get events for this specific host
        const hostEvents = existingEvents.filter(e => e.user_id === host.user_id);

        // Check if this slot conflicts with any of the host's events
        const hasConflict = hostEvents.some(event => {
          const eventStart = DateTime.fromISO(event.start_time);
          const eventEnd = DateTime.fromISO(event.end_time);

          // Check for overlap
          return (
            (slotStartWithBuffer >= eventStart && slotStartWithBuffer < eventEnd) ||
            (slotEndWithBuffer > eventStart && slotEndWithBuffer <= eventEnd) ||
            (slotStartWithBuffer <= eventStart && slotEndWithBuffer >= eventEnd)
          );
        });

        return !hasConflict; // Host is available if no conflict
      });

      return isAnyHostAvailable;
    });
  }

  /**
   * Apply daily/weekly booking limits
   */
  async applyBookingLimits(slots, bookingLink, targetDate) {
    try {
      if (!bookingLink.max_bookings_per_day) {
        return slots; // No limit
      }

      // Check how many bookings exist for this date
      const dayStart = targetDate.startOf('day').toISO();
      const dayEnd = targetDate.endOf('day').toISO();

      const { data: existingBookings, error } = await supabaseServer
        .from('bookings')
        .select('id')
        .eq('booking_link_id', bookingLink.id)
        .gte('scheduled_time', dayStart)
        .lte('scheduled_time', dayEnd)
        .neq('status', 'cancelled');

      if (error) {
        console.error('Error checking booking limits:', error);
        return slots;
      }

      const currentBookingCount = existingBookings?.length || 0;

      if (currentBookingCount >= bookingLink.max_bookings_per_day) {
        return []; // Daily limit reached
      }

      // Limit remaining slots to not exceed daily limit
      const remainingSlots = bookingLink.max_bookings_per_day - currentBookingCount;
      return slots.slice(0, remainingSlots);
    } catch (error) {
      console.error('Error applying booking limits:', error);
      return slots;
    }
  }

  /**
   * Get next 7 days with availability count
   * Used for the booking calendar view
   */
  async getAvailabilityCalendar(bookingLink, startDate, timezone = 'America/New_York') {
    try {
      const start = DateTime.fromISO(startDate, { zone: timezone });
      const calendar = [];

      for (let i = 0; i < 7; i++) {
        const date = start.plus({ days: i });
        const dateISO = date.toISODate();

        // Get slots for this date
        const result = await this.getAvailableSlots(bookingLink, dateISO, timezone);

        calendar.push({
          date: dateISO,
          dayOfWeek: date.toFormat('EEE'),
          dayNumber: date.day,
          month: date.toFormat('MMM'),
          slotsAvailable: result.slots?.length || 0,
          hasAvailability: (result.slots?.length || 0) > 0,
        });
      }

      return calendar;
    } catch (error) {
      console.error('Error getting availability calendar:', error);
      throw error;
    }
  }

  /**
   * Check if a specific slot is still available (before booking)
   */
  async isSlotAvailable(bookingLink, slotStartISO, timezone = 'America/New_York') {
    try {
      const slotStart = DateTime.fromISO(slotStartISO, { zone: timezone });
      const date = slotStart.toISODate();

      const result = await this.getAvailableSlots(bookingLink, date, timezone);

      return result.slots.some(slot => slot.start === slotStartISO);
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
  }

  /**
   * Book a slot - create calendar event and booking record
   */
  async bookSlot(bookingLink, bookingData) {
    try {
      const {
        scheduled_time,
        timezone,
        leadId,
        contactId,
        name,
        email,
        phone,
        company,
        qualification_data,
        assigned_to,
      } = bookingData;

      // Verify slot is still available
      const isAvailable = await this.isSlotAvailable(
        bookingLink,
        scheduled_time,
        timezone
      );

      if (!isAvailable) {
        throw new Error('This time slot is no longer available');
      }

      const scheduledStart = DateTime.fromISO(scheduled_time, { zone: timezone });
      const scheduledEnd = scheduledStart.plus({ minutes: bookingLink.duration });

      // Create calendar event
      const { data: calendarEvent, error: eventError } = await supabaseServer
        .from('calendar_events')
        .insert({
          user_id: assigned_to,
          title: `${bookingLink.name} - ${name}`,
          description: `Booked via ${bookingLink.slug}\n\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nCompany: ${company || 'Not provided'}`,
          start_time: scheduledStart.toISO(),
          end_time: scheduledEnd.toISO(),
          timezone,
          event_type: bookingLink.location_type || 'phone',
          category: 'sales',
          subcategory: 'booking',
          location: this.getLocationString(bookingLink),
          meeting_url: bookingLink.location_details?.url,
          attendees: [
            {
              email,
              name,
              response_status: 'accepted',
              is_organizer: false,
            },
          ],
          status: 'scheduled',
          booked_via: 'booking_link',
          booking_link_id: bookingLink.id,
          confirmed_at: new Date().toISOString(),
          deal_id: null,
          contact_id: contactId,
          lead_id: leadId,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create booking record
      const { data: booking, error: bookingError } = await supabaseServer
        .from('bookings')
        .insert({
          booking_link_id: bookingLink.id,
          lead_id: leadId,
          contact_id: contactId,
          name,
          email,
          phone,
          company,
          assigned_to,
          scheduled_time: scheduledStart.toISO(),
          duration: bookingLink.duration,
          location_type: bookingLink.location_type,
          location_details: bookingLink.location_details,
          timezone,
          qualification_data,
          qualified: true,
          status: 'scheduled',
          calendar_event_id: calendarEvent.id,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create or update lead/contact in CRM
      await this.updateCRMRecord(booking, bookingLink);

      // Send confirmation email if enabled
      if (bookingLink.send_confirmation_email !== false) {
        try {
          // Get host info for email
          let hostInfo = null;
          if (assigned_to) {
            const { data: userData } = await supabaseServer
              .from('users')
              .select('name, email')
              .eq('id', assigned_to)
              .single();
            hostInfo = userData;
          }

          await bookingEmailService.sendConfirmationEmail(
            booking,
            bookingLink,
            hostInfo
          );

          // Schedule reminder emails if enabled
          await bookingEmailService.scheduleReminders(booking, bookingLink);

          console.log(`Confirmation email sent for booking ${booking.id}`);
        } catch (emailError) {
          // Log error but don't fail the booking
          console.error('Error sending confirmation email:', emailError);
        }
      }

      // Log to history
      if (assigned_to) {
        try {
          const historyService = (await import('./historyService.js')).default;
          await historyService.logMeetingEvent(
            assigned_to,
            booking.id,
            `${bookingLink.name} with ${name}`,
            'MEETING_BOOKED',
            `${name} (${email}) scheduled for ${scheduledStart.toLocaleString(DateTime.DATETIME_MED)}`,
            {
              booking_link_slug: bookingLink.slug,
              scheduled_time: scheduledStart.toISO(),
              duration: bookingLink.duration,
              email,
              phone,
              company
            }
          );
        } catch (historyError) {
          console.error('Error logging meeting to history:', historyError);
          // Don't fail the booking if history logging fails
        }
      }

      return {
        booking,
        calendarEvent,
      };
    } catch (error) {
      console.error('Error booking slot:', error);
      throw error;
    }
  }

  /**
   * Get location string for calendar event
   */
  getLocationString(bookingLink) {
    switch (bookingLink.location_type) {
      case 'phone':
        return bookingLink.location_details?.phone || 'Phone Call';
      case 'google_meet':
        return bookingLink.location_details?.url || 'Google Meet';
      case 'zoom':
        return bookingLink.location_details?.url || 'Zoom';
      case 'in_person':
        return bookingLink.location_details?.address || 'In Person';
      default:
        return bookingLink.location_details?.custom || 'TBD';
    }
  }

  /**
   * Update or create lead/contact in CRM
   */
  async updateCRMRecord(booking, bookingLink) {
    try {
      if (booking.contact_id) {
        // Update existing contact
        await supabaseServer
          .from('contacts')
          .update({
            phone: booking.phone,
            company: booking.company,
            last_contacted: new Date().toISOString(),
          })
          .eq('id', booking.contact_id);
      } else if (booking.lead_id) {
        // Update existing lead
        await supabaseServer
          .from('leads')
          .update({
            status: 'meeting_scheduled',
            phone: booking.phone,
            company: booking.company,
            last_activity: new Date().toISOString(),
          })
          .eq('id', booking.lead_id);
      } else {
        // Create new lead
        const { data: newLead } = await supabaseServer
          .from('leads')
          .insert({
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            company: booking.company,
            source: 'booking_link',
            status: 'meeting_scheduled',
            qualification_data: booking.qualification_data,
            booking_link_slug: bookingLink.slug,
          })
          .select()
          .single();

        if (newLead) {
          // Link booking to new lead
          await supabaseServer
            .from('bookings')
            .update({ lead_id: newLead.id })
            .eq('id', booking.id);
        }
      }
    } catch (error) {
      console.error('Error updating CRM record:', error);
      // Don't throw - booking is already created
    }
  }

  /**
   * Reschedule a booking
   */
  async rescheduleBooking(bookingId, newScheduledTime, timezone) {
    try {
      // Get existing booking
      const { data: booking } = await supabaseServer
        .from('bookings')
        .select('*, booking_links(*)')
        .eq('id', bookingId)
        .single();

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if new slot is available
      const isAvailable = await this.isSlotAvailable(
        booking.booking_links,
        newScheduledTime,
        timezone
      );

      if (!isAvailable) {
        throw new Error('New time slot is not available');
      }

      const newStart = DateTime.fromISO(newScheduledTime, { zone: timezone });
      const newEnd = newStart.plus({ minutes: booking.duration });

      // Update calendar event
      if (booking.calendar_event_id) {
        await supabaseServer
          .from('calendar_events')
          .update({
            start_time: newStart.toISO(),
            end_time: newEnd.toISO(),
            timezone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.calendar_event_id);
      }

      // Store old time for email
      const oldScheduledTime = booking.scheduled_time;

      // Update booking
      const { data: updatedBooking } = await supabaseServer
        .from('bookings')
        .update({
          scheduled_time: newStart.toISO(),
          timezone,
          status: 'rescheduled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      // Send reschedule email
      try {
        // Get host info for email
        let hostInfo = null;
        if (updatedBooking.assigned_to) {
          const { data: userData } = await supabaseServer
            .from('users')
            .select('name, email')
            .eq('id', updatedBooking.assigned_to)
            .single();
          hostInfo = userData;
        }

        await bookingEmailService.sendRescheduleEmail(
          updatedBooking,
          booking.booking_links,
          oldScheduledTime,
          hostInfo
        );

        // Reschedule reminders
        await bookingEmailService.scheduleReminders(updatedBooking, booking.booking_links);

        console.log(`Reschedule email sent for booking ${bookingId}`);
      } catch (emailError) {
        // Log error but don't fail the reschedule
        console.error('Error sending reschedule email:', emailError);
      }

      return updatedBooking;
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId, reason, cancelledBy = 'lead') {
    try {
      // Get booking with booking link details
      const { data: booking } = await supabaseServer
        .from('bookings')
        .select('*, booking_links(*)')
        .eq('id', bookingId)
        .single();

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Cancel calendar event
      if (booking.calendar_event_id) {
        await supabaseServer
          .from('calendar_events')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', booking.calendar_event_id);
      }

      // Cancel all pending reminders
      await supabaseServer
        .from('booking_reminders')
        .update({ status: 'cancelled' })
        .eq('booking_id', bookingId)
        .eq('status', 'pending');

      // Cancel booking
      const { data: cancelledBooking } = await supabaseServer
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_by: cancelledBy,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      // Send cancellation email
      try {
        // Get host info for email
        let hostInfo = null;
        if (booking.assigned_to) {
          const { data: userData } = await supabaseServer
            .from('users')
            .select('name, email')
            .eq('id', booking.assigned_to)
            .single();
          hostInfo = userData;
        }

        await bookingEmailService.sendCancellationEmail(
          cancelledBooking,
          booking.booking_links,
          reason,
          cancelledBy === 'host',
          hostInfo
        );

        console.log(`Cancellation email sent for booking ${bookingId}`);
      } catch (emailError) {
        // Log error but don't fail the cancellation
        console.error('Error sending cancellation email:', emailError);
      }

      return cancelledBooking;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
}

const availabilityService = new AvailabilityService();
export default availabilityService;
