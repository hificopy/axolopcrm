import { DateTime } from "luxon";

/**
 * Enhanced Timezone Service
 * Fixes timezone handling issues across the meetings module
 */
class EnhancedTimezoneService {
  constructor() {
    this.defaultTimezone = "UTC";
    this.userTimezoneCache = new Map();
  }

  /**
   * Get user's preferred timezone from database or use default
   */
  async getUserTimezone(userId) {
    if (this.userTimezoneCache.has(userId)) {
      return this.userTimezoneCache.get(userId);
    }

    try {
      const { data: user } = await supabaseServer
        .from("users")
        .select("timezone")
        .eq("id", userId)
        .single();

      const timezone = user?.timezone || this.defaultTimezone;
      this.userTimezoneCache.set(userId, timezone);
      return timezone;
    } catch (error) {
      console.error("Error getting user timezone:", error);
      return this.defaultTimezone;
    }
  }

  /**
   * Set user's preferred timezone
   */
  async setUserTimezone(userId, timezone) {
    try {
      const { error } = await supabaseServer
        .from("users")
        .update({ timezone })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      // Clear cache to force refresh
      this.userTimezoneCache.delete(userId);
      return true;
    } catch (error) {
      console.error("Error setting user timezone:", error);
      throw error;
    }
  }

  /**
   * Convert datetime from one timezone to another with proper validation
   */
  convertTimezone(dateTime, fromTz, toTz) {
    try {
      if (!dateTime) {
        throw new Error("DateTime is required");
      }

      const dt = DateTime.fromISO(dateTime, { zone: fromTz });

      if (!dt.isValid) {
        throw new Error(`Invalid datetime: ${dateTime} in timezone ${fromTz}`);
      }

      return dt.setZone(toTz);
    } catch (error) {
      console.error("Error converting timezone:", error);
      // Return original datetime as fallback
      return DateTime.fromISO(dateTime);
    }
  }

  /**
   * Format datetime for display in user's timezone
   */
  formatForUser(dateTime, userTimezone, format = "full") {
    try {
      const dt = DateTime.fromISO(dateTime);

      if (!dt.isValid) {
        return "Invalid Date";
      }

      const userDt = userTimezone ? dt.setZone(userTimezone) : dt;

      const formats = {
        full: "EEEE, MMMM d, yyyy 'at' h:mm a ZZZZ",
        long: "MMMM d, yyyy h:mm a",
        medium: "MMM d, h:mm a",
        short: "M/d h:mm a",
        time: "h:mm a",
        date: "MMMM d, yyyy",
        iso: "yyyy-MM-dd'T'HH:mm:ssZZ",
      };

      return userDt.toFormat(formats[format] || formats.full);
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return dateTime;
    }
  }

  /**
   * Get timezone offset information
   */
  getTimezoneInfo(timezone) {
    try {
      const now = DateTime.now().setZone(timezone);
      return {
        timezone,
        offset: now.offset,
        offsetString: now.toFormat("ZZ"),
        abbreviation: now.toFormat("ZZZ"),
        observesDST: this.observesDST(timezone),
        currentOffset: now.isInDST ? now.offset + 60 : now.offset,
      };
    } catch (error) {
      console.error("Error getting timezone info:", error);
      return null;
    }
  }

  /**
   * Check if timezone observes Daylight Saving Time
   */
  observesDST(timezone) {
    try {
      const now = DateTime.now().setZone(timezone);
      const jan = DateTime.fromObject({ month: 1, day: 1 }, { zone: timezone });
      const jul = DateTime.fromObject({ month: 7, day: 1 }, { zone: timezone });

      return jan.offset !== jul.offset;
    } catch (error) {
      console.error("Error checking DST:", error);
      return false;
    }
  }

  /**
   * Validate timezone string
   */
  isValidTimezone(timezone) {
    try {
      return DateTime.now().setZone(timezone).isValid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get common timezone options for UI
   */
  getCommonTimezones() {
    return [
      {
        value: "UTC",
        label: "UTC (Coordinated Universal Time)",
        offset: "UTC+0",
      },
      {
        value: "America/New_York",
        label: "Eastern Time (ET)",
        offset: "UTC-5",
      },
      { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6" },
      { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7" },
      {
        value: "America/Los_Angeles",
        label: "Pacific Time (PT)",
        offset: "UTC-8",
      },
      { value: "Europe/London", label: "London (GMT)", offset: "UTC+0" },
      { value: "Europe/Paris", label: "Paris (CET)", offset: "UTC+1" },
      { value: "Asia/Tokyo", label: "Japan (JST)", offset: "UTC+9" },
      { value: "Australia/Sydney", label: "Sydney (AEDT)", offset: "UTC+11" },
    ];
  }

  /**
   * Get timezone-aware current time
   */
  getCurrentTimeInTimezone(timezone) {
    try {
      return DateTime.now().setZone(timezone);
    } catch (error) {
      console.error("Error getting current time:", error);
      return DateTime.now();
    }
  }

  /**
   * Parse datetime string with timezone awareness
   */
  parseDateTime(dateTimeString, timezone = null) {
    try {
      let dt = DateTime.fromISO(dateTimeString);

      if (!dt.isValid) {
        // Try parsing as local time
        dt = DateTime.fromJSDate(new Date(dateTimeString));
      }

      if (timezone && dt.isValid) {
        dt = dt.setZone(timezone);
      }

      return dt;
    } catch (error) {
      console.error("Error parsing datetime:", error);
      return null;
    }
  }

  /**
   * Calculate time difference between timezones
   */
  getTimezoneDifference(fromTz, toTz, dateTime = null) {
    try {
      const dt = dateTime ? DateTime.fromISO(dateTime) : DateTime.now();
      const fromTime = dt.setZone(fromTz);
      const toTime = dt.setZone(toTz);

      return {
        fromOffset: fromTime.offset,
        toOffset: toTime.offset,
        difference: toTime.offset - fromTime.offset,
        fromTimezone: fromTz,
        toTimezone: toTz,
      };
    } catch (error) {
      console.error("Error calculating timezone difference:", error);
      return null;
    }
  }
}

export default new EnhancedTimezoneService();
