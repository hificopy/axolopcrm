import { DateTime } from 'luxon';
import { supabase } from '../config/supabase-auth.js';

/**
 * Timezone Service
 * Handles timezone detection, conversion, and display
 */
class TimezoneService {
  constructor() {
    // Common timezone groups for quick selection
    this.timezoneGroups = {
      'US & Canada': [
        { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5' },
        { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6' },
        { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8' },
        { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: 'UTC-9' },
        { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', offset: 'UTC-10' }
      ],
      'Europe': [
        { value: 'Europe/London', label: 'London (GMT)', offset: 'UTC+0' },
        { value: 'Europe/Paris', label: 'Paris (CET)', offset: 'UTC+1' },
        { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 'UTC+1' },
        { value: 'Europe/Rome', label: 'Rome (CET)', offset: 'UTC+1' },
        { value: 'Europe/Madrid', label: 'Madrid (CET)', offset: 'UTC+1' },
        { value: 'Europe/Athens', label: 'Athens (EET)', offset: 'UTC+2' },
        { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 'UTC+3' }
      ],
      'Asia': [
        { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
        { value: 'Asia/Kolkata', label: 'India (IST)', offset: 'UTC+5:30' },
        { value: 'Asia/Shanghai', label: 'China (CST)', offset: 'UTC+8' },
        { value: 'Asia/Tokyo', label: 'Japan (JST)', offset: 'UTC+9' },
        { value: 'Asia/Seoul', label: 'South Korea (KST)', offset: 'UTC+9' },
        { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
        { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 'UTC+8' }
      ],
      'Australia': [
        { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: 'UTC+11' },
        { value: 'Australia/Melbourne', label: 'Melbourne (AEDT)', offset: 'UTC+11' },
        { value: 'Australia/Brisbane', label: 'Brisbane (AEST)', offset: 'UTC+10' },
        { value: 'Australia/Perth', label: 'Perth (AWST)', offset: 'UTC+8' }
      ],
      'South America': [
        { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: 'UTC-3' },
        { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)', offset: 'UTC-3' },
        { value: 'America/Santiago', label: 'Santiago (CLT)', offset: 'UTC-3' },
        { value: 'America/Mexico_City', label: 'Mexico City (CST)', offset: 'UTC-6' }
      ]
    };
  }

  /**
   * Detect timezone from browser/request
   */
  detectTimezone(req) {
    // Try to get from Accept-Language or other headers
    // For now, use a default
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  }

  /**
   * Convert time between timezones
   */
  convertTimezone(dateTime, fromTz, toTz) {
    try {
      const dt = DateTime.fromISO(dateTime, { zone: fromTz });
      return dt.setZone(toTz).toISO();
    } catch (error) {
      console.error('Error converting timezone:', error);
      return dateTime;
    }
  }

  /**
   * Get current time in a timezone
   */
  getCurrentTimeInTimezone(timezone) {
    return DateTime.now().setZone(timezone).toISO();
  }

  /**
   * Format time for display in specific timezone
   */
  formatForTimezone(dateTime, timezone, format = 'full') {
    try {
      const dt = DateTime.fromISO(dateTime).setZone(timezone);

      const formats = {
        full: 'EEEE, MMMM d, yyyy \'at\' h:mm a ZZZZ',
        long: 'MMMM d, yyyy h:mm a',
        medium: 'MMM d, h:mm a',
        short: 'M/d h:mm a',
        time: 'h:mm a',
        date: 'MMMM d, yyyy'
      };

      return dt.toFormat(formats[format] || formats.full);
    } catch (error) {
      console.error('Error formatting time:', error);
      return dateTime;
    }
  }

  /**
   * Get timezone offset in minutes
   */
  getTimezoneOffset(timezone, dateTime = new Date()) {
    try {
      const dt = DateTime.fromJSDate(dateTime).setZone(timezone);
      return dt.offset; // Returns offset in minutes
    } catch (error) {
      console.error('Error getting timezone offset:', error);
      return 0;
    }
  }

  /**
   * Get timezone abbreviation (EST, PST, etc.)
   */
  getTimezoneAbbreviation(timezone, dateTime = new Date()) {
    try {
      const dt = DateTime.fromJSDate(dateTime).setZone(timezone);
      return dt.toFormat('ZZZZ');
    } catch (error) {
      console.error('Error getting timezone abbreviation:', error);
      return '';
    }
  }

  /**
   * Check if timezone observes DST
   */
  observesDST(timezone) {
    try {
      const jan = DateTime.fromObject({ month: 1, day: 1 }, { zone: timezone });
      const jul = DateTime.fromObject({ month: 7, day: 1 }, { zone: timezone });
      return jan.offset !== jul.offset;
    } catch (error) {
      console.error('Error checking DST:', error);
      return false;
    }
  }

  /**
   * Get all available timezones
   */
  getAllTimezones() {
    return this.timezoneGroups;
  }

  /**
   * Search timezones by name or city
   */
  searchTimezones(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(this.timezoneGroups).forEach(([region, zones]) => {
      zones.forEach(zone => {
        if (
          zone.label.toLowerCase().includes(lowerQuery) ||
          zone.value.toLowerCase().includes(lowerQuery) ||
          region.toLowerCase().includes(lowerQuery)
        ) {
          results.push({ ...zone, region });
        }
      });
    });

    return results;
  }

  /**
   * Get timezone info
   */
  getTimezoneInfo(timezone) {
    try {
      const now = DateTime.now().setZone(timezone);

      return {
        timezone,
        currentTime: now.toISO(),
        offset: now.offset,
        offsetFormatted: now.toFormat('ZZ'),
        abbreviation: now.toFormat('ZZZZ'),
        observesDST: this.observesDST(timezone),
        isDST: now.isInDST
      };
    } catch (error) {
      console.error('Error getting timezone info:', error);
      return null;
    }
  }

  /**
   * Calculate time until event in user's timezone
   */
  getTimeUntilEvent(eventTime, userTimezone) {
    try {
      const now = DateTime.now().setZone(userTimezone);
      const event = DateTime.fromISO(eventTime).setZone(userTimezone);

      const diff = event.diff(now, ['days', 'hours', 'minutes']);

      return {
        days: Math.floor(diff.days),
        hours: Math.floor(diff.hours % 24),
        minutes: Math.floor(diff.minutes % 60),
        totalMinutes: Math.floor(diff.as('minutes')),
        isPast: diff.as('milliseconds') < 0,
        humanReadable: this.formatDuration(diff)
      };
    } catch (error) {
      console.error('Error calculating time until event:', error);
      return null;
    }
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(duration) {
    const days = Math.floor(duration.days);
    const hours = Math.floor(duration.hours % 24);
    const minutes = Math.floor(duration.minutes % 60);

    const parts = [];

    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    }
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    }
    if (minutes > 0 && days === 0) {
      parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    }

    if (parts.length === 0) {
      return 'now';
    }

    return parts.join(', ');
  }

  /**
   * Get meeting time in all attendees' timezones
   */
  getMultiTimezoneDisplay(eventTime, timezones) {
    return timezones.map(tz => ({
      timezone: tz,
      time: this.formatForTimezone(eventTime, tz, 'long'),
      abbreviation: this.getTimezoneAbbreviation(tz),
      offset: this.getTimezoneOffset(tz)
    }));
  }

  /**
   * Find best meeting time across multiple timezones
   * Considers business hours (9 AM - 6 PM) in all timezones
   */
  findBestMeetingTime(timezones, duration = 60, searchDate = new Date()) {
    try {
      const businessHourStart = 9; // 9 AM
      const businessHourEnd = 18; // 6 PM
      const suggestions = [];

      // Check every 30-minute slot
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const testTime = DateTime.fromObject({
            year: searchDate.getFullYear(),
            month: searchDate.getMonth() + 1,
            day: searchDate.getDate(),
            hour,
            minute
          }, { zone: timezones[0] });

          // Check if this time is during business hours for ALL timezones
          const isBusinessHours = timezones.every(tz => {
            const timeInTz = testTime.setZone(tz);
            const hourInTz = timeInTz.hour;
            return hourInTz >= businessHourStart && hourInTz < businessHourEnd;
          });

          if (isBusinessHours) {
            suggestions.push({
              time: testTime.toISO(),
              formatted: this.getMultiTimezoneDisplay(testTime.toISO(), timezones)
            });
          }
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Error finding best meeting time:', error);
      return [];
    }
  }

  /**
   * Save user's timezone preference
   */
  async saveUserTimezone(userId, timezone) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          timezone,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving user timezone:', error);
      throw error;
    }
  }

  /**
   * Get user's timezone preference
   */
  async getUserTimezone(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('timezone')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.timezone || 'America/New_York';
    } catch (error) {
      console.error('Error getting user timezone:', error);
      return 'America/New_York';
    }
  }
}

const timezoneService = new TimezoneService();
export default timezoneService;
