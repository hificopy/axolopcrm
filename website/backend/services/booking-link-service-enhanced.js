import { supabaseServer } from "../config/supabase-auth.js";
import { DateTime } from "luxon";
import availabilityService from "./availability-service.js";
import bookingEmailService from "./booking-email-service.js";

/**
 * Enhanced Booking Link Service
 * Advanced booking system with:
 * - Lead qualification
 * - Disqualification rules
 * - Conditional routing
 * - Team assignment (round-robin, load-balanced)
 * - Form questions integration
 * - Workflow engine sync
 * - Analytics tracking
 * - Full customization
 */
class EnhancedBookingLinkService {
  /**
   * Create a new booking link with all advanced features
   */
  async createBookingLink(userId, linkData) {
    try {
      const {
        // Basic Details
        name,
        slug,
        description,
        internalNote,
        color = "#0099FF",

        // Location
        locationType = "phone",
        locationDetails = {},

        // Timing
        duration = 30,
        dateRangeType = "calendar_days",
        dateRangeValue = 14,
        startTimeIncrement = 15,
        timeFormat = "12h",
        bufferBefore = 0,
        bufferAfter = 0,

        // Limitations
        minNoticeHours = 1,
        allowReschedule = true,
        preventDuplicateBookings = false,
        maxBookingsPerDay,

        // Team/Hosts
        hosts = [],
        assignmentType = "round_robin",
        hostPriority = "optimize_manually",

        // Questions
        primaryQuestions = [],
        secondaryQuestions = [],
        hidePrimaryLabels = false,
        collapseRadioCheckbox = false,
        enablePrefillSkipping = false,

        // Disqualification
        requireBusinessEmail = false,
        allowedCountryCodes = null,
        enableTwoStepQualification = false,
        disqualificationRules = [],

        // Routing
        routingRules = [],

        // Redirects
        confirmationRedirectType = "default",
        confirmationRedirectUrl,
        disqualifiedRedirectUrl,

        // Notifications
        sendConfirmationEmail = true,
        sendCancellationEmail = true,
        sendReminderEmails = false,
        reminderTimes = [],
        replyToType = "host_email",
        customReplyTo,

        // Customization
        theme = "light",
        brandColorPrimary = "#0236C2",
        brandColorSecondary = "#031953",
        useGradient = false,
        schedulerBackground = "#FFFFFF",
        fontColor = "#1F2A37",
        borderColor = "#D1D5DB",
        inputFieldsColor = "#F9FAFB",
        buttonFontColor = "#FFFFFF",
        companyLogoUrl,
      } = linkData;

      // Generate unique slug if not provided
      const finalSlug = slug || this.generateSlug(name);

      // Check if slug is available
      const { data: existing } = await supabaseServer
        .from("booking_links")
        .select("id")
        .eq("slug", finalSlug)
        .single();

      if (existing) {
        throw new Error(
          "Slug already in use. Please choose a different link prefix.",
        );
      }

      // Create the booking link
      const { data: bookingLink, error: linkError } = await supabaseServer
        .from("booking_links")
        .insert({
          user_id: userId,

          // Basic Details
          name,
          slug: finalSlug,
          description,
          internal_note: internalNote,
          color,

          // Location
          location_type: locationType,
          location_details: locationDetails,

          // Timing
          duration,
          date_range_type: dateRangeType,
          date_range_value: dateRangeValue,
          start_time_increment: startTimeIncrement,
          time_format: timeFormat,
          buffer_before: bufferBefore,
          buffer_after: bufferAfter,

          // Limitations
          min_notice_hours: minNoticeHours,
          allow_reschedule: allowReschedule,
          prevent_duplicate_bookings: preventDuplicateBookings,
          max_bookings_per_day: maxBookingsPerDay,

          // Team/Hosts
          assignment_type: assignmentType,
          host_priority: hostPriority,

          // Qualification
          require_business_email: requireBusinessEmail,
          allowed_country_codes: allowedCountryCodes,
          enable_two_step_qualification: enableTwoStepQualification,

          // Redirects
          confirmation_redirect_type: confirmationRedirectType,
          confirmation_redirect_url: confirmationRedirectUrl,
          disqualified_redirect_url: disqualifiedRedirectUrl,

          // Notifications
          send_confirmation_email: sendConfirmationEmail,
          send_cancellation_email: sendCancellationEmail,
          send_reminder_emails: sendReminderEmails,
          reminder_times: reminderTimes,
          reply_to_type: replyToType,
          custom_reply_to: customReplyTo,

          // Customization
          theme,
          brand_color_primary: brandColorPrimary,
          brand_color_secondary: brandColorSecondary,
          use_gradient: useGradient,
          scheduler_background: schedulerBackground,
          font_color: fontColor,
          border_color: borderColor,
          input_fields_color: inputFieldsColor,
          button_font_color: buttonFontColor,
          company_logo_url: companyLogoUrl,

          // Question Settings
          hide_primary_labels: hidePrimaryLabels,
          collapse_radio_checkbox: collapseRadioCheckbox,
          enable_prefill_skipping: enablePrefillSkipping,

          is_active: true,
        })
        .select()
        .single();

      if (linkError) throw linkError;

      // Add hosts
      if (hosts && hosts.length > 0) {
        const hostInserts = hosts.map((host, index) => ({
          booking_link_id: bookingLink.id,
          user_id: host.userId,
          priority: host.priority || "medium",
          priority_order: index,
          is_active: true,
        }));

        const { error: hostsError } = await supabaseServer
          .from("booking_link_hosts")
          .insert(hostInserts);

        if (hostsError) console.error("Error adding hosts:", hostsError);
      }

      // Add questions
      const allQuestions = [
        ...primaryQuestions.map((q) => ({ ...q, question_type: "primary" })),
        ...secondaryQuestions.map((q) => ({
          ...q,
          question_type: "secondary",
        })),
      ];

      if (allQuestions.length > 0) {
        const questionInserts = allQuestions.map((q, index) => ({
          booking_link_id: bookingLink.id,
          question_type: q.question_type,
          field_type: q.type || q.fieldType || "text",
          label: q.label,
          placeholder: q.placeholder,
          help_text: q.helpText,
          is_required: q.required || false,
          validation_rules: q.validation,
          options: q.options,
          display_order: index,
          parent_question_id: q.parentQuestionId,
          show_if_conditions: q.showIfConditions,
        }));

        const { error: questionsError } = await supabaseServer
          .from("booking_link_questions")
          .insert(questionInserts);

        if (questionsError)
          console.error("Error adding questions:", questionsError);
      }

      // Add disqualification rules
      if (disqualificationRules && disqualificationRules.length > 0) {
        const rulesInserts = disqualificationRules.map((rule, index) => ({
          booking_link_id: bookingLink.id,
          question_id: rule.questionId,
          operator: rule.operator,
          value: rule.value,
          disqualification_message: rule.message,
          rule_order: index,
        }));

        const { error: rulesError } = await supabaseServer
          .from("booking_link_disqualification_rules")
          .insert(rulesInserts);

        if (rulesError)
          console.error("Error adding disqualification rules:", rulesError);
      }

      // Add routing rules
      if (routingRules && routingRules.length > 0) {
        const routingInserts = routingRules.map((rule, index) => ({
          booking_link_id: bookingLink.id,
          question_id: rule.questionId,
          operator: rule.operator,
          value: rule.value,
          route_to_user_id: rule.routeToUserId,
          assignment_method: rule.assignmentMethod || "specific",
          rule_order: index,
        }));

        const { error: routingError } = await supabaseServer
          .from("booking_link_routing_rules")
          .insert(routingInserts);

        if (routingError)
          console.error("Error adding routing rules:", routingError);
      }

      // Return complete booking link with related data
      return await this.getBookingLinkById(bookingLink.id);
    } catch (error) {
      console.error("Error creating booking link:", error);
      throw error;
    }
  }

  /**
   * Get booking link by slug (public-facing)
   */
  async getBookingLink(slug) {
    try {
      const { data, error } = await supabaseServer
        .from("booking_links")
        .select(
          `
          *,
          booking_link_hosts (
            id,
            user_id,
            priority,
            priority_order,
            is_active
          ),
          booking_link_questions (
            id,
            question_type,
            field_type,
            label,
            placeholder,
            help_text,
            is_required,
            validation_rules,
            options,
            display_order,
            parent_question_id,
            show_if_conditions
          )
        `,
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting booking link:", error);
      return null;
    }
  }

  /**
   * Get booking link by ID (with full details)
   */
  async getBookingLinkById(id) {
    try {
      const { data, error } = await supabaseServer
        .from("booking_links")
        .select(
          `
          *,
          booking_link_hosts (
            id,
            user_id,
            priority,
            priority_order,
            is_active
          ),
          booking_link_questions (
            id,
            question_type,
            field_type,
            label,
            placeholder,
            help_text,
            is_required,
            validation_rules,
            options,
            display_order,
            parent_question_id,
            show_if_conditions
          ),
          booking_link_disqualification_rules (
            id,
            question_id,
            operator,
            value,
            disqualification_message,
            rule_order
          ),
          booking_link_routing_rules (
            id,
            question_id,
            operator,
            value,
            route_to_user_id,
            assignment_method,
            rule_order
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting booking link by ID:", error);
      return null;
    }
  }

  /**
   * Get all booking links for a user
   */
  async getUserBookingLinks(userId) {
    try {
      const { data, error } = await supabaseServer
        .from("booking_links")
        .select(
          `
          *,
          booking_link_hosts (
            id,
            user_id,
            priority
          )
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting user booking links:", error);
      return [];
    }
  }

  /**
   * Update booking link
   */
  async updateBookingLink(id, userId, updates) {
    try {
      // Verify ownership
      const { data: existing } = await supabaseServer
        .from("booking_links")
        .select("user_id")
        .eq("id", id)
        .single();

      if (!existing || existing.user_id !== userId) {
        throw new Error("Unauthorized");
      }

      const { data, error } = await supabaseServer
        .from("booking_links")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating booking link:", error);
      throw error;
    }
  }

  /**
   * Delete booking link
   */
  async deleteBookingLink(id, userId) {
    try {
      // Verify ownership
      const { data: existing } = await supabaseServer
        .from("booking_links")
        .select("user_id")
        .eq("id", id)
        .single();

      if (!existing || existing.user_id !== userId) {
        throw new Error("Unauthorized");
      }

      const { error } = await supabaseServer
        .from("booking_links")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error deleting booking link:", error);
      throw error;
    }
  }

  /**
   * Get available time slots for a booking link
   */
  async getAvailableSlots(slug, date, timezone = "America/New_York") {
    try {
      const bookingLink = await this.getBookingLink(slug);
      if (!bookingLink) {
        throw new Error("Booking link not found");
      }

      // Use availability service to get real available slots
      return await availabilityService.getAvailableSlots(
        bookingLink,
        date,
        timezone,
      );
    } catch (error) {
      console.error("Error getting available slots:", error);
      throw error;
    }
  }

  /**
   * Get availability calendar (7 days with slot counts)
   */
  async getAvailabilityCalendar(
    slug,
    startDate,
    timezone = "America/New_York",
  ) {
    try {
      const bookingLink = await this.getBookingLink(slug);
      if (!bookingLink) {
        throw new Error("Booking link not found");
      }

      return await availabilityService.getAvailabilityCalendar(
        bookingLink,
        startDate,
        timezone,
      );
    } catch (error) {
      console.error("Error getting availability calendar:", error);
      throw error;
    }
  }

  /**
   * Process lead qualification (2-step booking)
   */
  async qualifyLead(slug, leadId, formData) {
    try {
      const bookingLink = await this.getBookingLink(slug);
      if (!bookingLink) {
        throw new Error("Booking link not found");
      }

      let qualified = true;
      let disqualificationReason = null;
      let redirectUrl = null;

      // Check business email requirement
      if (formData.email && bookingLink.require_business_email) {
        const freeEmailDomains = [
          "gmail.com",
          "yahoo.com",
          "hotmail.com",
          "outlook.com",
          "aol.com",
          "icloud.com",
          "mail.com",
          "protonmail.com",
        ];
        const domain = formData.email.split("@")[1]?.toLowerCase();
        if (freeEmailDomains.includes(domain)) {
          qualified = false;
          disqualificationReason = "We only work with business email addresses";
          redirectUrl = bookingLink.disqualified_redirect_url;
        }
      }

      // Check country code filtering
      if (formData.phone && bookingLink.allowed_country_codes) {
        const phoneNumber = formData.phone.trim();
        if (phoneNumber.startsWith("+")) {
          // Extract country code (first 1-3 digits after +)
          const matches = phoneNumber.match(/^\+(\d{1,3})/);
          if (matches) {
            const countryCode = "+" + matches[1];
            if (!bookingLink.allowed_country_codes.includes(countryCode)) {
              qualified = false;
              disqualificationReason =
                "We currently only serve specific regions";
              redirectUrl = bookingLink.disqualified_redirect_url;
            }
          }
        }
      }

      // Check custom disqualification rules
      const { data: disqualRules } = await supabaseServer
        .from("booking_link_disqualification_rules")
        .select("*")
        .eq("booking_link_id", bookingLink.id)
        .order("rule_order");

      if (disqualRules) {
        for (const rule of disqualRules) {
          const question = bookingLink.booking_link_questions?.find(
            (q) => q.id === rule.question_id,
          );
          if (!question) continue;

          const fieldValue = formData[question.label] || formData[question.id];

          let isDisqualified = false;

          switch (rule.operator) {
            case "equals":
              isDisqualified = fieldValue === rule.value;
              break;
            case "not_equals":
              isDisqualified = fieldValue !== rule.value;
              break;
            case "less_than":
              isDisqualified = parseFloat(fieldValue) < parseFloat(rule.value);
              break;
            case "greater_than":
              isDisqualified = parseFloat(fieldValue) > parseFloat(rule.value);
              break;
            case "contains":
              isDisqualified = String(fieldValue)
                .toLowerCase()
                .includes(String(rule.value).toLowerCase());
              break;
            case "not_contains":
              isDisqualified = !String(fieldValue)
                .toLowerCase()
                .includes(String(rule.value).toLowerCase());
              break;
          }

          if (isDisqualified) {
            qualified = false;
            disqualificationReason =
              rule.disqualification_message ||
              "Based on your responses, we may not be the best fit";
            redirectUrl = bookingLink.disqualified_redirect_url;
            break;
          }
        }
      }

      // Update or create lead
      if (leadId) {
        await supabaseServer
          .from("leads")
          .update({
            qualified,
            disqualification_reason: disqualificationReason,
            qualification_data: formData,
            qualification_completed_at: new Date().toISOString(),
          })
          .eq("id", leadId);
      }

      return {
        qualified,
        reason: disqualificationReason,
        redirectUrl,
        message: qualified
          ? "Great! You qualify for a meeting. Please select a time below."
          : disqualificationReason ||
            "Based on your responses, we may not be the best fit at this time.",
      };
    } catch (error) {
      console.error("Error qualifying lead:", error);
      throw error;
    }
  }

  /**
   * Determine assignment based on routing rules and assignment type
   */
  async determineAssignment(bookingLink, formData) {
    try {
      // Check routing rules first
      const { data: routingRules } = await supabaseServer
        .from("booking_link_routing_rules")
        .select("*")
        .eq("booking_link_id", bookingLink.id)
        .order("rule_order");

      if (routingRules && routingRules.length > 0) {
        for (const rule of routingRules) {
          const question = bookingLink.booking_link_questions?.find(
            (q) => q.id === rule.question_id,
          );
          if (!question) continue;

          const fieldValue = formData[question.label] || formData[question.id];
          let matches = false;

          switch (rule.operator) {
            case "equals":
              matches = fieldValue === rule.value;
              break;
            case "contains":
              matches = String(fieldValue)
                .toLowerCase()
                .includes(String(rule.value).toLowerCase());
              break;
            case "not_equals":
              matches = fieldValue !== rule.value;
              break;
            case "less_than":
              matches = parseFloat(fieldValue) < parseFloat(rule.value);
              break;
            case "greater_than":
              matches = parseFloat(fieldValue) > parseFloat(rule.value);
              break;
          }

          if (matches && rule.route_to_user_id) {
            return rule.route_to_user_id;
          }
        }
      }

      // Fall back to assignment type
      const hostIds =
        bookingLink.booking_link_hosts?.map((h) => h.user_id) || [];

      switch (bookingLink.assignment_type) {
        case "round_robin":
          return await this.roundRobinAssignment(hostIds, bookingLink.id);

        case "load_balanced":
          return await this.loadBalancedAssignment(hostIds);

        default:
          return bookingLink.user_id; // Assign to owner
      }
    } catch (error) {
      console.error("Error determining assignment:", error);
      return bookingLink.user_id;
    }
  }

  /**
   * Round-robin assignment
   */
  async roundRobinAssignment(hostIds, bookingLinkId) {
    if (!hostIds || hostIds.length === 0) return null;

    try {
      const { data: lastBooking } = await supabaseServer
        .from("bookings")
        .select("assigned_to")
        .eq("booking_link_id", bookingLinkId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!lastBooking) {
        return hostIds[0];
      }

      const currentIndex = hostIds.indexOf(lastBooking.assigned_to);
      const nextIndex = (currentIndex + 1) % hostIds.length;
      return hostIds[nextIndex];
    } catch (error) {
      return hostIds[0];
    }
  }

  /**
   * Load-balanced assignment (fewest current bookings)
   */
async loadBalancedAssignment(hostIds) {
    if (!hostIds || hostIds.length === 0) return null;

    try {
      const weekStart = DateTime.now().startOf("week").toISO();
      const weekEnd = DateTime.now().endOf("week").toISO();

      // Single query to get all booking counts for all hosts
      const { data: bookingCounts } = await supabaseServer
        .from("bookings")
        .select("assigned_to")
        .in("assigned_to", hostIds)
        .gte("scheduled_time", weekStart)
        .lte("scheduled_time", weekEnd)
        .neq("status", "cancelled");

      // Count bookings per user in JavaScript (much faster than N+1 queries)
      const counts = {};
      hostIds.forEach(userId => {
        counts[userId] = 0;
      });

      bookingCounts?.forEach(booking => {
        if (booking.assigned_to && counts[booking.assigned_to] !== undefined) {
          counts[booking.assigned_to]++;
        }
      });

      // Find user with lowest count
      let minCount = Infinity;
      let selectedUser = hostIds[0];

      for (const userId of hostIds) {
        if (counts[userId] < minCount) {
          minCount = counts[userId];
          selectedUser = userId;
        }
      }

      return selectedUser;
    } catch (error) {
      console.error("Error in loadBalancedAssignment:", error);
      return hostIds[0];
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

      // Determine assignment based on routing rules
      const assignedTo = await this.determineAssignment(
        bookingLink,
        bookingData.qualification_data || {},
      );

      // Use availability service to book the slot
      // This handles calendar event creation and conflict checking
      const result = await availabilityService.bookSlot(bookingLink, {
        ...bookingData,
        assigned_to: assignedTo,
      });

      // Send confirmation email if enabled
      if (bookingLink.send_confirmation_email) {
        await this.sendConfirmationEmail(result.booking, bookingLink);
      }

      return result.booking;
    } catch (error) {
      console.error("Error booking slot:", error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id, reason, cancelledBy = "lead") {
    try {
      // Use availability service which also cancels calendar event
      return await availabilityService.cancelBooking(id, reason, cancelledBy);
    } catch (error) {
      console.error("Error canceling booking:", error);
      throw error;
    }
  }

  /**
   * Reschedule a booking
   */
  async rescheduleBooking(id, newScheduledTime, timezone = "America/New_York") {
    try {
      return await availabilityService.rescheduleBooking(
        id,
        newScheduledTime,
        timezone,
      );
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      throw error;
    }
  }

  /**
   * Get booking analytics for a booking link
   */
  async getBookingAnalytics(bookingLinkId) {
    try {
      const { data: bookings } = await supabaseServer
        .from("bookings")
        .select("*")
        .eq("booking_link_id", bookingLinkId)
        .order("created_at", { ascending: false });

      const total = bookings?.length || 0;
      const completed =
        bookings?.filter((b) => b.status === "completed").length || 0;
      const noShows =
        bookings?.filter((b) => b.status === "no_show").length || 0;
      const cancelled =
        bookings?.filter((b) => b.status === "cancelled").length || 0;
      const qualified = bookings?.filter((b) => b.qualified).length || 0;
      const disqualified = bookings?.filter((b) => !b.qualified).length || 0;

      return {
        total,
        completed,
        noShows,
        cancelled,
        qualified,
        disqualified,
        showRate: total > 0 ? ((total - noShows) / total) * 100 : 0,
        closeRate: completed > 0 ? (completed / total) * 100 : 0,
        qualificationRate: total > 0 ? (qualified / total) * 100 : 0,
      };
    } catch (error) {
      console.error("Error getting booking analytics:", error);
      throw error;
    }
  }

  /**
   * Send confirmation email
   */
  async sendConfirmationEmail(booking, bookingLink) {
    try {
      // Get host information if available
      let hostInfo = null;
      if (bookingLink.host_id) {
        const { data: host } = await supabaseServer
          .from("users")
          .select("name, email")
          .eq("id", bookingLink.host_id)
          .single();

        hostInfo = host;
      }

      // Send confirmation email using the booking email service
      await bookingEmailService.sendConfirmationEmail(
        booking,
        bookingLink,
        hostInfo,
      );

      // Schedule reminder emails if enabled
      await bookingEmailService.scheduleReminders(booking, bookingLink);

      console.log(
        `Confirmation email sent to ${booking.email} for booking ${booking.id}`,
      );
      return { success: true };
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      throw error;
    }
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
}

const enhancedBookingLinkService = new EnhancedBookingLinkService();
export default enhancedBookingLinkService;
