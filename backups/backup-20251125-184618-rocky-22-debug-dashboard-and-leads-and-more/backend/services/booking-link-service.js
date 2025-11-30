import { supabase } from "../config/supabase-auth.js";
import { DateTime } from "luxon";
import timezoneService from "./timezone-service.js";
import historyService from "./historyService.js";

/**
 * Booking Link Service
 * Handles public booking links, availability calculation, and round-robin assignment
 */
class BookingLinkService {
  /**
   * Create a new booking link
   */
  async createBookingLink(userId, linkData) {
    try {
      const {
        name,
        slug,
        description,
        event_type,
        duration,
        availability_type = "weekly",
        weekly_hours,
        buffer_before = 0,
        buffer_after = 0,
        min_notice_hours = 24,
        max_days_advance = 30,
        assignment_type = "owner",
        team_member_ids = [],
        custom_questions = [],
        max_bookings_per_day,
        max_bookings_per_week,
      } = linkData;

      // Generate unique slug if not provided
      const finalSlug = slug || this.generateSlug(name);

      // Check if slug is available
      const { data: existing } = await supabase
        .from("calendar_booking_links")
        .select("id")
        .eq("slug", finalSlug)
        .single();

      if (existing) {
        throw new Error("Slug already in use");
      }

      // Create the booking link
      const { data, error } = await supabase
        .from("calendar_booking_links")
        .insert({
          user_id: userId,
          slug: finalSlug,
          name,
          description,
          event_type,
          duration,
          availability_type,
          weekly_hours: weekly_hours || this.getDefaultWeeklyHours(),
          buffer_before,
          buffer_after,
          min_notice_hours,
          max_days_advance,
          assignment_type,
          team_member_ids,
          custom_questions,
          max_bookings_per_day,
          max_bookings_per_week,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating booking link:", error);
      throw error;
    }
  }

  /**
   * Get booking link details
   */
  async getBookingLink(slug) {
    try {
      const { data, error } = await supabase
        .from("calendar_booking_links")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting booking link:", error);
      throw error;
    }
  }

  /**
   * Get all booking links for user
   */
  async getUserBookingLinks(userId) {
    try {
      const { data, error } = await supabase
        .from("calendar_booking_links")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting user booking links:", error);
      throw error;
    }
  }

  /**
   * Calculate available time slots for a booking link
   */
  async getAvailableSlots(slug, date, timezone = "America/New_York") {
    try {
      const bookingLink = await this.getBookingLink(slug);
      if (!bookingLink) {
        throw new Error("Booking link not found");
      }

      // Get the target date in the requested timezone
      const targetDate = DateTime.fromISO(date, { zone: timezone });

      // Check if date is within allowed range
      const minDate = DateTime.now().plus({
        hours: bookingLink.min_notice_hours,
      });
      const maxDate = DateTime.now().plus({
        days: bookingLink.max_days_advance,
      });

      if (targetDate < minDate || targetDate > maxDate) {
        return [];
      }

      // Get availability for the day
      const dayAvailability = this.getDayAvailability(bookingLink, targetDate);
      if (!dayAvailability || dayAvailability.length === 0) {
        return [];
      }

      // Generate time slots
      const slots = [];
      for (const timeRange of dayAvailability) {
        const rangeSlots = this.generateTimeSlots(
          targetDate,
          timeRange.start,
          timeRange.end,
          bookingLink.duration,
          timezone,
        );
        slots.push(...rangeSlots);
      }

      // Filter out already booked slots
      const availableSlots = await this.filterBookedSlots(
        slots,
        bookingLink.id,
        bookingLink.user_id,
        bookingLink.team_member_ids,
      );

      // Check daily/weekly booking limits
      const limitedSlots = await this.applyBookingLimits(
        availableSlots,
        bookingLink,
        targetDate,
      );

      return limitedSlots;
    } catch (error) {
      console.error("Error getting available slots:", error);
      throw error;
    }
  }

  /**
   * Get day availability based on weekly hours
   */
  getDayAvailability(bookingLink, targetDate) {
    if (bookingLink.availability_type !== "weekly") {
      return [];
    }

    const dayName = targetDate.toFormat("cccc").toLowerCase(); // Monday, Tuesday, etc.
    const weeklyHours = bookingLink.weekly_hours || {};

    return weeklyHours[dayName] || [];
  }

  /**
   * Generate time slots for a time range
   */
  generateTimeSlots(date, startTime, endTime, duration, timezone) {
    const slots = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let currentSlot = date.set({ hour: startHour, minute: startMinute });
    const endSlot = date.set({ hour: endHour, minute: endMinute });

    while (currentSlot.plus({ minutes: duration }) <= endSlot) {
      slots.push({
        start: currentSlot.toISO(),
        end: currentSlot.plus({ minutes: duration }).toISO(),
        formatted: currentSlot.toFormat("h:mm a"),
        timezone,
      });

      currentSlot = currentSlot.plus({ minutes: 15 }); // 15-minute intervals
    }

    return slots;
  }

  /**
   * Filter out slots that are already booked
   * Optimized version using interval tree approach for O(n log n) performance
   */
  async filterBookedSlots(slots, bookingLinkId, userId, teamMemberIds) {
    try {
      const userIds = [userId, ...teamMemberIds];

      // Get existing events for all potential assignees
      const { data: events } = await supabase
        .from("calendar_events")
        .select("start_time, end_time, user_id")
        .in("user_id", userIds)
        .gte("start_time", slots[0]?.start)
        .lte("end_time", slots[slots.length - 1]?.end)
        .neq("status", "cancelled");

      if (!events || events.length === 0) {
        return slots;
      }

      // Convert events to sorted intervals for efficient overlap checking
      const eventIntervals = events
        .map((event) => ({
          start: DateTime.fromISO(event.start_time),
          end: DateTime.fromISO(event.end_time),
        }))
        .sort((a, b) => a.start - b.start);

      const bookedSlots = new Set();

      // For each slot, check for overlaps using binary search approach
      slots.forEach((slot) => {
        const slotStart = DateTime.fromISO(slot.start);
        const slotEnd = DateTime.fromISO(slot.end);

        // Use binary search to find potential overlapping events
        let hasOverlap = false;
        let left = 0;
        let right = eventIntervals.length - 1;

        while (left <= right && !hasOverlap) {
          const mid = Math.floor((left + right) / 2);
          const event = eventIntervals[mid];

          // Check if event overlaps with slot
          if (
            (slotStart >= event.start && slotStart < event.end) ||
            (slotEnd > event.start && slotEnd <= event.end) ||
            (slotStart <= event.start && slotEnd >= event.end)
          ) {
            hasOverlap = true;
            break;
          }

          // If slot is before this event, search left half
          if (slotEnd <= event.start) {
            right = mid - 1;
          } else {
            // If slot is after this event, search right half
            left = mid + 1;
          }
        }

        // Also check neighboring events since binary search might miss some
        if (!hasOverlap && left >= 0 && left < eventIntervals.length) {
          const event = eventIntervals[left];
          if (
            (slotStart >= event.start && slotStart < event.end) ||
            (slotEnd > event.start && slotEnd <= event.end) ||
            (slotStart <= event.start && slotEnd >= event.end)
          ) {
            hasOverlap = true;
          }
        }

        if (!hasOverlap && right >= 0 && right < eventIntervals.length) {
          const event = eventIntervals[right];
          if (
            (slotStart >= event.start && slotStart < event.end) ||
            (slotEnd > event.start && slotEnd <= event.end) ||
            (slotStart <= event.start && slotEnd >= event.end)
          ) {
            hasOverlap = true;
          }
        }

        if (hasOverlap) {
          bookedSlots.add(slot.start);
        }
      });

      return slots.filter((slot) => !bookedSlots.has(slot.start));
    } catch (error) {
      console.error("Error filtering booked slots:", error);
      return slots;
    }
  }

  /**
   * Apply booking limits (max per day/week)
   */
  async applyBookingLimits(slots, bookingLink, targetDate) {
    try {
      if (
        !bookingLink.max_bookings_per_day &&
        !bookingLink.max_bookings_per_week
      ) {
        return slots;
      }

      const dayStart = targetDate.startOf("day").toISO();
      const dayEnd = targetDate.endOf("day").toISO();

      const { data: dayBookings } = await supabase
        .from("calendar_bookings")
        .select("id")
        .eq("booking_link_id", bookingLink.id)
        .gte("scheduled_time", dayStart)
        .lte("scheduled_time", dayEnd)
        .neq("status", "cancelled");

      if (
        bookingLink.max_bookings_per_day &&
        dayBookings?.length >= bookingLink.max_bookings_per_day
      ) {
        return [];
      }

      // Check weekly limit
      if (bookingLink.max_bookings_per_week) {
        const weekStart = targetDate.startOf("week").toISO();
        const weekEnd = targetDate.endOf("week").toISO();

        const { data: weekBookings } = await supabase
          .from("calendar_bookings")
          .select("id")
          .eq("booking_link_id", bookingLink.id)
          .gte("scheduled_time", weekStart)
          .lte("scheduled_time", weekEnd)
          .neq("status", "cancelled");

        if (weekBookings?.length >= bookingLink.max_bookings_per_week) {
          return [];
        }
      }

      return slots;
    } catch (error) {
      console.error("Error applying booking limits:", error);
      return slots;
    }
  }

  /**
   * Book a time slot
   */
  async bookSlot(slug, bookingData) {
    try {
      const bookingLink = await this.getBookingLink(slug);
      if (!bookingLink) {
        throw new Error("Booking link not found");
      }

      const {
        name,
        email,
        phone,
        company,
        scheduled_time,
        timezone,
        custom_responses = {},
      } = bookingData;

      // Determine who to assign to
      const assignedUserId = await this.determineAssignment(
        bookingLink,
        scheduled_time,
      );

      // Create the booking record
      const { data: booking, error: bookingError } = await supabase
        .from("calendar_bookings")
        .insert({
          booking_link_id: bookingLink.id,
          booker_name: name,
          booker_email: email,
          booker_phone: phone,
          booker_company: company,
          scheduled_time,
          timezone,
          custom_responses,
          assigned_to_user_id: assignedUserId,
          status: "confirmed",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create the calendar event
      const { data: event, error: eventError } = await supabase
        .from("calendar_events")
        .insert({
          user_id: assignedUserId,
          title: `${bookingLink.name} - ${name}`,
          description: `Booked via ${slug}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\nCompany: ${company || "Not provided"}`,
          start_time: scheduled_time,
          end_time: DateTime.fromISO(scheduled_time)
            .plus({ minutes: bookingLink.duration })
            .toISO(),
          timezone,
          event_type: bookingLink.event_type,
          category: "sales",
          attendees: [{ email, name, response_status: "accepted" }],
          status: "scheduled",
          booked_via: "booking_link",
          booking_link_id: bookingLink.id,
          confirmed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Link booking to event
      await supabase
        .from("calendar_bookings")
        .update({ calendar_event_id: event.id })
        .eq("id", booking.id);

      // Update booking link stats
      await this.updateBookingLinkStats(bookingLink.id);

      // Send confirmation email (implement separately)
      await this.sendBookingConfirmation(booking, event);

      // Log to history
      try {
        await historyService.logMeetingEvent(
          assignedUserId,
          booking.id,
          `${bookingLink.name} with ${name}`,
          "MEETING_BOOKED",
          `${name} (${email}) scheduled for ${DateTime.fromISO(scheduled_time).toLocaleString(DateTime.DATETIME_MED)}`,
          {
            booking_link_slug: slug,
            scheduled_time,
            duration: bookingLink.duration,
            email,
            phone,
            company,
          },
        );
      } catch (historyError) {
        console.error("Error logging meeting to history:", historyError);
        // Don't fail the booking if history logging fails
      }

      return {
        booking,
        event,
      };
    } catch (error) {
      console.error("Error booking slot:", error);
      throw error;
    }
  }

  /**
   * Determine which user to assign booking to
   */
  async determineAssignment(bookingLink, scheduledTime) {
    switch (bookingLink.assignment_type) {
      case "owner":
        return bookingLink.user_id;

      case "round_robin":
        return await this.roundRobinAssignment(
          bookingLink.team_member_ids,
          bookingLink.id,
        );

      case "load_balanced":
        return await this.loadBalancedAssignment(
          bookingLink.team_member_ids,
          scheduledTime,
        );

      default:
        return bookingLink.user_id;
    }
  }

  /**
   * Round robin assignment
   */
  async roundRobinAssignment(teamMemberIds, bookingLinkId) {
    try {
      if (!teamMemberIds || teamMemberIds.length === 0) {
        return null;
      }

      // Get last assignment
      const { data: lastBooking } = await supabase
        .from("calendar_bookings")
        .select("assigned_to_user_id")
        .eq("booking_link_id", bookingLinkId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!lastBooking) {
        return teamMemberIds[0];
      }

      // Find next in rotation
      const currentIndex = teamMemberIds.indexOf(
        lastBooking.assigned_to_user_id,
      );
      const nextIndex = (currentIndex + 1) % teamMemberIds.length;

      return teamMemberIds[nextIndex];
    } catch (error) {
      console.error("Error in round robin assignment:", error);
      return teamMemberIds[0];
    }
  }

  /**
   * Load balanced assignment (assign to person with fewest bookings)
   */
  async loadBalancedAssignment(teamMemberIds, scheduledTime) {
    try {
      if (!teamMemberIds || teamMemberIds.length === 0) {
        return null;
      }

      // Get booking counts for each team member in the same week
      const weekStart = DateTime.fromISO(scheduledTime).startOf("week").toISO();
      const weekEnd = DateTime.fromISO(scheduledTime).endOf("week").toISO();

      const counts = {};
      for (const userId of teamMemberIds) {
        const { data } = await supabase
          .from("calendar_events")
          .select("id")
          .eq("user_id", userId)
          .gte("start_time", weekStart)
          .lte("end_time", weekEnd)
          .neq("status", "cancelled");

        counts[userId] = data?.length || 0;
      }

      // Find user with lowest count
      let minCount = Infinity;
      let selectedUser = teamMemberIds[0];

      for (const userId of teamMemberIds) {
        if (counts[userId] < minCount) {
          minCount = counts[userId];
          selectedUser = userId;
        }
      }

      return selectedUser;
    } catch (error) {
      console.error("Error in load balanced assignment:", error);
      return teamMemberIds[0];
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId, reason = null) {
    try {
      // Update booking status
      const { data: booking, error: bookingError } = await supabase
        .from("calendar_bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Cancel the associated event
      if (booking.calendar_event_id) {
        await supabase
          .from("calendar_events")
          .update({ status: "cancelled" })
          .eq("id", booking.calendar_event_id);
      }

      return booking;
    } catch (error) {
      console.error("Error canceling booking:", error);
      throw error;
    }
  }

  /**
   * Update booking link statistics
   */
  async updateBookingLinkStats(bookingLinkId) {
    try {
      const { data: bookings } = await supabase
        .from("calendar_bookings")
        .select("status")
        .eq("booking_link_id", bookingLinkId);

      const stats = {
        total_bookings: bookings?.length || 0,
        total_completed:
          bookings?.filter((b) => b.status === "completed").length || 0,
        total_no_shows:
          bookings?.filter((b) => b.status === "no_show").length || 0,
        conversion_rate: 0,
      };

      if (stats.total_bookings > 0) {
        stats.conversion_rate =
          (stats.total_completed / stats.total_bookings) * 100;
      }

      await supabase
        .from("calendar_booking_links")
        .update(stats)
        .eq("id", bookingLinkId);
    } catch (error) {
      console.error("Error updating booking link stats:", error);
    }
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(booking, event) {
    // Implement email sending logic
    // This would integrate with your email service
    console.log("Sending booking confirmation:", booking.booker_email);
  }

  /**
   * Generate unique slug from name
   */
  generateSlug(name) {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 7)
    );
  }

  /**
   * Get default weekly hours (9 AM - 5 PM weekdays)
   */
  getDefaultWeeklyHours() {
    return {
      monday: [{ start: "09:00", end: "17:00" }],
      tuesday: [{ start: "09:00", end: "17:00" }],
      wednesday: [{ start: "09:00", end: "17:00" }],
      thursday: [{ start: "09:00", end: "17:00" }],
      friday: [{ start: "09:00", end: "17:00" }],
      saturday: [],
      sunday: [],
    };
  }

  /**
   * Get booking analytics
   */
  async getBookingAnalytics(bookingLinkId) {
    try {
      const { data: bookings } = await supabase
        .from("calendar_bookings")
        .select("*")
        .eq("booking_link_id", bookingLinkId)
        .order("created_at", { ascending: false });

      const analytics = {
        total: bookings?.length || 0,
        byStatus: {},
        byDay: {},
        byHour: {},
        averageLeadTime: 0,
        conversionRate: 0,
      };

      bookings?.forEach((booking) => {
        // Status breakdown
        analytics.byStatus[booking.status] =
          (analytics.byStatus[booking.status] || 0) + 1;

        // Day breakdown
        const day = DateTime.fromISO(booking.scheduled_time).toFormat("cccc");
        analytics.byDay[day] = (analytics.byDay[day] || 0) + 1;

        // Hour breakdown
        const hour = DateTime.fromISO(booking.scheduled_time).hour;
        analytics.byHour[hour] = (analytics.byHour[hour] || 0) + 1;
      });

      return analytics;
    } catch (error) {
      console.error("Error getting booking analytics:", error);
      throw error;
    }
  }
}

const bookingLinkService = new BookingLinkService();
export default bookingLinkService;
