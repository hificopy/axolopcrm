import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DateTime } from 'luxon';
import EmailService from './email-service.js';
import { supabaseServer } from '../config/supabase-auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Booking Email Service
 * Handles all email notifications for booking system (confirmation, reminders, cancellation, reschedule)
 */
class BookingEmailService {
  constructor() {
    this.emailService = new EmailService();
    this.templatesDir = path.join(__dirname, '../templates/emails');
    this.companyName = process.env.COMPANY_NAME || 'Axolop CRM';
    this.companyWebsite = process.env.COMPANY_WEBSITE || 'https://axolop.com';
    this.baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Load and render an email template
   */
  async renderTemplate(templateName, data) {
    const templatePath = path.join(this.templatesDir, `${templateName}.html`);

    try {
      let template = fs.readFileSync(templatePath, 'utf-8');

      // Replace all placeholders with data
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, data[key] || '');
      });

      // Handle conditional blocks {{#if field}}...{{/if}}
      template = template.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, field, content) => {
        return data[field] ? content : '';
      });

      // Handle each loops {{#each field}}...{{/each}}
      template = template.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, field, content) => {
        if (!data[field] || !Array.isArray(data[field])) return '';
        return data[field].map(item => {
          let itemContent = content;
          Object.keys(item).forEach(key => {
            itemContent = itemContent.replace(new RegExp(`{{${key}}}`, 'g'), item[key] || '');
          });
          return itemContent;
        }).join('');
      });

      // Clean up any remaining placeholders
      template = template.replace(/{{[^}]+}}/g, '');

      return template;
    } catch (error) {
      console.error('Error rendering email template:', error);
      throw new Error(`Failed to render template: ${templateName}`);
    }
  }

  /**
   * Format datetime for email display
   */
  formatDateTime(isoDate, timezone = 'America/New_York') {
    const dt = DateTime.fromISO(isoDate, { zone: timezone });
    return {
      formattedDate: dt.toFormat('EEEE, MMMM d, yyyy'),
      formattedTime: dt.toFormat('h:mm a ZZZZ'),
      shortDate: dt.toFormat('MMM d, yyyy'),
      shortTime: dt.toFormat('h:mm a'),
    };
  }

  /**
   * Calculate time until meeting
   */
  getTimeUntilMeeting(scheduledTime, timezone = 'America/New_York') {
    const now = DateTime.now().setZone(timezone);
    const meeting = DateTime.fromISO(scheduledTime, { zone: timezone });
    const diff = meeting.diff(now, ['hours', 'minutes']);

    const hours = Math.floor(diff.hours);
    const minutes = Math.floor(diff.minutes % 60);

    if (hours < 1) {
      return `${minutes} minutes`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }

  /**
   * Generate calendar links
   */
  generateCalendarLinks(booking, bookingLink) {
    const startTime = DateTime.fromISO(booking.scheduled_time);
    const endTime = startTime.plus({ minutes: bookingLink.duration });

    // Google Calendar
    const googleParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: bookingLink.name,
      dates: `${startTime.toFormat("yyyyMMdd'T'HHmmss'Z'")}/${endTime.toFormat("yyyyMMdd'T'HHmmss'Z'")}`,
      details: bookingLink.description || '',
      location: this.getLocationString(bookingLink),
    });
    const googleCalendarLink = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;

    // Outlook Calendar
    const outlookParams = new URLSearchParams({
      subject: bookingLink.name,
      startdt: startTime.toISO(),
      enddt: endTime.toISO(),
      body: bookingLink.description || '',
      location: this.getLocationString(bookingLink),
    });
    const outlookCalendarLink = `https://outlook.office.com/calendar/0/deeplink/compose?${outlookParams.toString()}`;

    // ICS Download Link
    const icsDownloadLink = `${this.baseUrl}/api/meetings/bookings/${booking.id}/ics`;

    return {
      googleCalendarLink,
      outlookCalendarLink,
      icsDownloadLink,
    };
  }

  /**
   * Get location string for calendar
   */
  getLocationString(bookingLink) {
    if (bookingLink.location_type === 'phone') {
      return bookingLink.location_details?.phone || 'Phone Call';
    } else if (bookingLink.location_type === 'zoom') {
      return bookingLink.location_details?.zoom_link || 'Zoom Meeting';
    } else if (bookingLink.location_type === 'google_meet') {
      return bookingLink.location_details?.meet_link || 'Google Meet';
    } else if (bookingLink.location_type === 'in_person') {
      return bookingLink.location_details?.address || 'In Person';
    } else if (bookingLink.location_type === 'custom') {
      return bookingLink.location_details?.custom_location || 'TBD';
    }
    return 'TBD';
  }

  /**
   * Send booking confirmation email
   */
  async sendConfirmationEmail(booking, bookingLink, hostInfo = null) {
    try {
      const dateTime = this.formatDateTime(booking.scheduled_time, booking.timezone || 'America/New_York');
      const calendarLinks = this.generateCalendarLinks(booking, bookingLink);

      const templateData = {
        name: booking.name,
        email: booking.email,
        eventName: bookingLink.name,
        description: bookingLink.description,
        duration: bookingLink.duration,
        timezone: booking.timezone || 'America/New_York',
        location: this.getLocationString(bookingLink),
        hostName: hostInfo?.name || bookingLink.host_name,
        confirmationMessage: bookingLink.confirmation_message,
        brandColorPrimary: bookingLink.brand_color_primary || '#0236C2',
        brandColorSecondary: bookingLink.brand_color_secondary || '#0099FF',
        companyName: this.companyName,
        companyWebsite: this.companyWebsite,
        rescheduleLink: `${this.baseUrl}/book/${bookingLink.slug}/reschedule/${booking.id}`,
        cancelLink: `${this.baseUrl}/book/${bookingLink.slug}/cancel/${booking.id}`,
        ...dateTime,
        ...calendarLinks,
      };

      const html = await this.renderTemplate('booking-confirmation', templateData);

      await this.emailService.sendEmail({
        to: booking.email,
        subject: `Confirmed: ${bookingLink.name} - ${dateTime.formattedDate} at ${dateTime.shortTime}`,
        html,
        from: process.env.DEFAULT_EMAIL_FROM || 'noreply@axolop.com',
      });

      console.log(`Confirmation email sent to ${booking.email} for booking ${booking.id}`);

      return { success: true };
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }
  }

  /**
   * Send booking reminder email
   */
  async sendReminderEmail(booking, bookingLink, timeUntil = '1 hour', hostInfo = null) {
    try {
      const dateTime = this.formatDateTime(booking.scheduled_time, booking.timezone || 'America/New_York');
      const timeUntilMeeting = this.getTimeUntilMeeting(booking.scheduled_time, booking.timezone);

      const templateData = {
        name: booking.name,
        email: booking.email,
        eventName: bookingLink.name,
        duration: bookingLink.duration,
        location: this.getLocationString(bookingLink),
        hostName: hostInfo?.name || bookingLink.host_name,
        timeUntilMeeting,
        brandColorPrimary: bookingLink.brand_color_primary || '#0236C2',
        brandColorSecondary: bookingLink.brand_color_secondary || '#0099FF',
        companyName: this.companyName,
        companyWebsite: this.companyWebsite,
        rescheduleLink: `${this.baseUrl}/book/${bookingLink.slug}/reschedule/${booking.id}`,
        cancelLink: `${this.baseUrl}/book/${bookingLink.slug}/cancel/${booking.id}`,
        meetingLink: this.getLocationString(bookingLink),
        ...dateTime,
      };

      // Add preparation tips if configured
      if (bookingLink.preparation_tips) {
        templateData.preparationTips = bookingLink.preparation_tips;
      }

      const html = await this.renderTemplate('booking-reminder', templateData);

      await this.emailService.sendEmail({
        to: booking.email,
        subject: `Reminder: ${bookingLink.name} in ${timeUntilMeeting}`,
        html,
        from: process.env.DEFAULT_EMAIL_FROM || 'noreply@axolop.com',
      });

      console.log(`Reminder email sent to ${booking.email} for booking ${booking.id}`);

      return { success: true };
    } catch (error) {
      console.error('Error sending reminder email:', error);
      throw error;
    }
  }

  /**
   * Send cancellation email
   */
  async sendCancellationEmail(booking, bookingLink, reason = null, cancelledByHost = false, hostInfo = null) {
    try {
      const dateTime = this.formatDateTime(booking.scheduled_time, booking.timezone || 'America/New_York');

      const templateData = {
        name: booking.name,
        email: booking.email,
        eventName: bookingLink.name,
        duration: bookingLink.duration,
        hostName: hostInfo?.name || bookingLink.host_name,
        cancellationReason: reason,
        cancelledByHost,
        companyName: this.companyName,
        companyWebsite: this.companyWebsite,
        bookingLink: `${this.baseUrl}/book/${bookingLink.slug}`,
        ...dateTime,
      };

      const html = await this.renderTemplate('booking-cancelled', templateData);

      await this.emailService.sendEmail({
        to: booking.email,
        subject: `Cancelled: ${bookingLink.name}`,
        html,
        from: process.env.DEFAULT_EMAIL_FROM || 'noreply@axolop.com',
      });

      console.log(`Cancellation email sent to ${booking.email} for booking ${booking.id}`);

      return { success: true };
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      throw error;
    }
  }

  /**
   * Send reschedule email
   */
  async sendRescheduleEmail(booking, bookingLink, oldScheduledTime, hostInfo = null) {
    try {
      const newDateTime = this.formatDateTime(booking.scheduled_time, booking.timezone || 'America/New_York');
      const oldDateTime = this.formatDateTime(oldScheduledTime, booking.timezone || 'America/New_York');
      const calendarLinks = this.generateCalendarLinks(booking, bookingLink);

      const templateData = {
        name: booking.name,
        email: booking.email,
        eventName: bookingLink.name,
        duration: bookingLink.duration,
        timezone: booking.timezone || 'America/New_York',
        location: this.getLocationString(bookingLink),
        hostName: hostInfo?.name || bookingLink.host_name,
        newFormattedDate: newDateTime.formattedDate,
        newFormattedTime: newDateTime.shortTime,
        oldFormattedDate: oldDateTime.formattedDate,
        oldFormattedTime: oldDateTime.shortTime,
        brandColorPrimary: bookingLink.brand_color_primary || '#0236C2',
        brandColorSecondary: bookingLink.brand_color_secondary || '#0099FF',
        companyName: this.companyName,
        companyWebsite: this.companyWebsite,
        rescheduleLink: `${this.baseUrl}/book/${bookingLink.slug}/reschedule/${booking.id}`,
        cancelLink: `${this.baseUrl}/book/${bookingLink.slug}/cancel/${booking.id}`,
        ...calendarLinks,
      };

      const html = await this.renderTemplate('booking-rescheduled', templateData);

      await this.emailService.sendEmail({
        to: booking.email,
        subject: `Rescheduled: ${bookingLink.name} - ${newDateTime.formattedDate} at ${newDateTime.shortTime}`,
        html,
        from: process.env.DEFAULT_EMAIL_FROM || 'noreply@axolop.com',
      });

      console.log(`Reschedule email sent to ${booking.email} for booking ${booking.id}`);

      return { success: true };
    } catch (error) {
      console.error('Error sending reschedule email:', error);
      throw error;
    }
  }

  /**
   * Schedule reminder emails based on booking link settings
   */
  async scheduleReminders(booking, bookingLink) {
    try {
      if (!bookingLink.send_reminder_emails || !bookingLink.reminder_times) {
        return { success: true, message: 'Reminders not enabled' };
      }

      const meetingTime = DateTime.fromISO(booking.scheduled_time);
      const now = DateTime.now();

      // Schedule reminders for each configured time
      for (const reminderMinutes of bookingLink.reminder_times) {
        const reminderTime = meetingTime.minus({ minutes: reminderMinutes });

        // Only schedule if reminder time is in the future
        if (reminderTime > now) {
          // Create reminder record in database
          await supabaseServer
            .from('booking_reminders')
            .insert({
              booking_id: booking.id,
              booking_link_id: bookingLink.id,
              scheduled_for: reminderTime.toISO(),
              minutes_before: reminderMinutes,
              status: 'pending',
            });

          console.log(`Reminder scheduled for ${reminderTime.toISO()} (${reminderMinutes} minutes before meeting)`);
        }
      }

      return { success: true, message: 'Reminders scheduled' };
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      throw error;
    }
  }

  /**
   * Process pending reminders (called by cron job)
   */
  async processPendingReminders() {
    try {
      const now = DateTime.now();

      // Get all pending reminders that should be sent now
      const { data: pendingReminders, error } = await supabaseServer
        .from('booking_reminders')
        .select(`
          *,
          booking:bookings!inner(*),
          booking_link:booking_links!inner(*)
        `)
        .eq('status', 'pending')
        .lte('scheduled_for', now.toISO())
        .limit(50);

      if (error) {
        console.error('Error fetching pending reminders:', error);
        return { success: false, error };
      }

      let sent = 0;
      let failed = 0;

      for (const reminder of pendingReminders) {
        try {
          // Only send if booking is still scheduled
          if (reminder.booking.status === 'scheduled') {
            await this.sendReminderEmail(
              reminder.booking,
              reminder.booking_link,
              `${reminder.minutes_before} minutes`
            );

            // Mark as sent
            await supabaseServer
              .from('booking_reminders')
              .update({
                status: 'sent',
                sent_at: now.toISO(),
              })
              .eq('id', reminder.id);

            sent++;
          } else {
            // Cancel reminder if booking is cancelled
            await supabaseServer
              .from('booking_reminders')
              .update({ status: 'cancelled' })
              .eq('id', reminder.id);
          }
        } catch (emailError) {
          console.error(`Failed to send reminder ${reminder.id}:`, emailError);

          // Mark as failed
          await supabaseServer
            .from('booking_reminders')
            .update({
              status: 'failed',
              error_message: emailError.message,
            })
            .eq('id', reminder.id);

          failed++;
        }
      }

      console.log(`Processed ${pendingReminders.length} reminders: ${sent} sent, ${failed} failed`);

      return { success: true, sent, failed, total: pendingReminders.length };
    } catch (error) {
      console.error('Error processing pending reminders:', error);
      throw error;
    }
  }
}

export default new BookingEmailService();
