import pkg from 'rrule';
const { RRule, RRuleSet, rrulestr } = pkg;
import { supabase } from '../config/supabase-auth.js';

/**
 * Recurring Events Service
 * Handles creation, parsing, and generation of recurring event instances
 * Uses RFC 5545 RRULE standard
 */
class RecurringEventsService {
  /**
   * Create a recurring pattern
   */
  async createRecurringPattern(userId, patternData) {
    try {
      const {
        name,
        frequency, // DAILY, WEEKLY, MONTHLY, YEARLY
        interval = 1,
        count,
        until,
        byDay, // ['MO', 'TU', 'WE', 'TH', 'FR']
        byMonthDay, // [1, 15]
        byMonth, // [1, 6, 12]
        timezone = 'America/New_York',
        exceptions = []
      } = patternData;

      // Build RRULE
      const rruleOptions = {
        freq: this.getFrequency(frequency),
        interval,
        dtstart: new Date(),
        tzid: timezone
      };

      if (count) rruleOptions.count = count;
      if (until) rruleOptions.until = new Date(until);
      if (byDay && byDay.length > 0) {
        rruleOptions.byweekday = byDay.map(day => this.getDayConstant(day));
      }
      if (byMonthDay && byMonthDay.length > 0) {
        rruleOptions.bymonthday = byMonthDay;
      }
      if (byMonth && byMonth.length > 0) {
        rruleOptions.bymonth = byMonth;
      }

      const rule = new RRule(rruleOptions);
      const rruleString = rule.toString();

      // Save to database
      const { data, error } = await supabase
        .from('calendar_recurring_patterns')
        .insert({
          user_id: userId,
          name,
          rrule: rruleString,
          frequency: frequency.toUpperCase(),
          interval,
          count,
          until,
          by_day: byDay ? byDay.join(',') : null,
          by_month_day: byMonthDay ? byMonthDay.join(',') : null,
          by_month: byMonth ? byMonth.join(',') : null,
          timezone,
          exceptions
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating recurring pattern:', error);
      throw error;
    }
  }

  /**
   * Get frequency constant from string
   */
  getFrequency(freq) {
    const frequencies = {
      DAILY: RRule.DAILY,
      WEEKLY: RRule.WEEKLY,
      MONTHLY: RRule.MONTHLY,
      YEARLY: RRule.YEARLY
    };
    return frequencies[freq.toUpperCase()] || RRule.WEEKLY;
  }

  /**
   * Get day constant from string
   */
  getDayConstant(day) {
    const days = {
      MO: RRule.MO,
      TU: RRule.TU,
      WE: RRule.WE,
      TH: RRule.TH,
      FR: RRule.FR,
      SA: RRule.SA,
      SU: RRule.SU
    };
    return days[day.toUpperCase()] || RRule.MO;
  }

  /**
   * Generate event instances for a date range
   */
  async generateInstances(recurringPatternId, startDate, endDate, baseEvent) {
    try {
      // Get the recurring pattern
      const { data: pattern, error } = await supabase
        .from('calendar_recurring_patterns')
        .select('*')
        .eq('id', recurringPatternId)
        .single();

      if (error) throw error;

      // Parse RRULE
      const rrule = rrulestr(pattern.rrule);

      // Generate occurrences
      const occurrences = rrule.between(
        new Date(startDate),
        new Date(endDate),
        true // inclusive
      );

      // Filter out exceptions
      const exceptions = pattern.exceptions || [];
      const filteredOccurrences = occurrences.filter(date => {
        const dateStr = date.toISOString().split('T')[0];
        return !exceptions.includes(dateStr);
      });

      // Generate event instances
      const instances = filteredOccurrences.map(occurrence => {
        const duration = baseEvent.end_time - baseEvent.start_time;
        const instanceStart = new Date(occurrence);
        const instanceEnd = new Date(instanceStart.getTime() + duration);

        return {
          ...baseEvent,
          id: undefined, // New instance
          start_time: instanceStart.toISOString(),
          end_time: instanceEnd.toISOString(),
          recurring_pattern_id: recurringPatternId,
          recurrence_instance_date: occurrence.toISOString().split('T')[0],
          created_at: undefined,
          updated_at: undefined
        };
      });

      return instances;
    } catch (error) {
      console.error('Error generating instances:', error);
      throw error;
    }
  }

  /**
   * Create recurring event with pattern
   */
  async createRecurringEvent(userId, eventData, patternData) {
    try {
      // Create the recurring pattern
      const pattern = await this.createRecurringPattern(userId, patternData);

      // Create the base event
      const { data: baseEvent, error: eventError } = await supabase
        .from('calendar_events')
        .insert({
          user_id: userId,
          ...eventData,
          recurring_pattern_id: pattern.id
        })
        .select()
        .single();

      if (eventError) throw eventError;

      return {
        pattern,
        baseEvent
      };
    } catch (error) {
      console.error('Error creating recurring event:', error);
      throw error;
    }
  }

  /**
   * Update recurring event series
   */
  async updateRecurringSeries(recurringPatternId, userId, updates) {
    try {
      // Update all events in the series
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('recurring_pattern_id', recurringPatternId)
        .eq('user_id', userId)
        .eq('is_recurring_exception', false)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating recurring series:', error);
      throw error;
    }
  }

  /**
   * Update single recurring instance (create exception)
   */
  async updateSingleInstance(eventId, userId, updates) {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          ...updates,
          is_recurring_exception: true
        })
        .eq('id', eventId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating single instance:', error);
      throw error;
    }
  }

  /**
   * Delete recurring series
   */
  async deleteRecurringSeries(recurringPatternId, userId) {
    try {
      // Delete all events in the series
      const { error: eventsError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('recurring_pattern_id', recurringPatternId)
        .eq('user_id', userId);

      if (eventsError) throw eventsError;

      // Delete the pattern
      const { error: patternError } = await supabase
        .from('calendar_recurring_patterns')
        .delete()
        .eq('id', recurringPatternId)
        .eq('user_id', userId);

      if (patternError) throw patternError;

      return { success: true };
    } catch (error) {
      console.error('Error deleting recurring series:', error);
      throw error;
    }
  }

  /**
   * Delete single instance (add to exceptions)
   */
  async deleteSingleInstance(eventId, userId) {
    try {
      // Get the event
      const { data: event, error: getError } = await supabase
        .from('calendar_events')
        .select('*, calendar_recurring_patterns(*)')
        .eq('id', eventId)
        .eq('user_id', userId)
        .single();

      if (getError) throw getError;

      if (event.recurring_pattern_id) {
        // Add to exceptions in pattern
        const currentExceptions = event.calendar_recurring_patterns.exceptions || [];
        const instanceDate = event.recurrence_instance_date;

        const { error: updateError } = await supabase
          .from('calendar_recurring_patterns')
          .update({
            exceptions: [...currentExceptions, instanceDate]
          })
          .eq('id', event.recurring_pattern_id);

        if (updateError) throw updateError;
      }

      // Delete the event
      const { error: deleteError } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      return { success: true };
    } catch (error) {
      console.error('Error deleting single instance:', error);
      throw error;
    }
  }

  /**
   * Get recurring pattern details
   */
  async getRecurringPattern(patternId) {
    try {
      const { data, error } = await supabase
        .from('calendar_recurring_patterns')
        .select('*')
        .eq('id', patternId)
        .single();

      if (error) throw error;

      // Parse RRULE to human-readable format
      const rrule = rrulestr(data.rrule);
      const humanReadable = rrule.toText();

      return {
        ...data,
        humanReadable
      };
    } catch (error) {
      console.error('Error getting recurring pattern:', error);
      throw error;
    }
  }

  /**
   * Get next N occurrences
   */
  async getNextOccurrences(recurringPatternId, count = 10) {
    try {
      const pattern = await this.getRecurringPattern(recurringPatternId);
      const rrule = rrulestr(pattern.rrule);

      const occurrences = rrule.all((date, i) => i < count);

      return occurrences.map(date => ({
        date: date.toISOString(),
        formatted: date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }));
    } catch (error) {
      console.error('Error getting next occurrences:', error);
      throw error;
    }
  }

  /**
   * Parse natural language to RRULE
   * Examples: "Every Monday", "Every 2 weeks", "Monthly on the 15th"
   */
  parseNaturalLanguage(text) {
    const patterns = {
      // Daily patterns
      'every day': { frequency: 'DAILY', interval: 1 },
      'daily': { frequency: 'DAILY', interval: 1 },

      // Weekly patterns
      'every week': { frequency: 'WEEKLY', interval: 1 },
      'weekly': { frequency: 'WEEKLY', interval: 1 },
      'every monday': { frequency: 'WEEKLY', interval: 1, byDay: ['MO'] },
      'every tuesday': { frequency: 'WEEKLY', interval: 1, byDay: ['TU'] },
      'every wednesday': { frequency: 'WEEKLY', interval: 1, byDay: ['WE'] },
      'every thursday': { frequency: 'WEEKLY', interval: 1, byDay: ['TH'] },
      'every friday': { frequency: 'WEEKLY', interval: 1, byDay: ['FR'] },
      'every saturday': { frequency: 'WEEKLY', interval: 1, byDay: ['SA'] },
      'every sunday': { frequency: 'WEEKLY', interval: 1, byDay: ['SU'] },
      'weekdays': { frequency: 'WEEKLY', interval: 1, byDay: ['MO', 'TU', 'WE', 'TH', 'FR'] },

      // Bi-weekly
      'every 2 weeks': { frequency: 'WEEKLY', interval: 2 },
      'bi-weekly': { frequency: 'WEEKLY', interval: 2 },
      'biweekly': { frequency: 'WEEKLY', interval: 2 },

      // Monthly patterns
      'every month': { frequency: 'MONTHLY', interval: 1 },
      'monthly': { frequency: 'MONTHLY', interval: 1 },

      // Yearly patterns
      'every year': { frequency: 'YEARLY', interval: 1 },
      'yearly': { frequency: 'YEARLY', interval: 1 },
      'annually': { frequency: 'YEARLY', interval: 1 }
    };

    const lowerText = text.toLowerCase().trim();

    // Check for exact matches
    if (patterns[lowerText]) {
      return patterns[lowerText];
    }

    // Check for "every N days/weeks/months"
    const everyNMatch = lowerText.match(/every (\d+) (day|week|month|year)s?/);
    if (everyNMatch) {
      const interval = parseInt(everyNMatch[1]);
      const unit = everyNMatch[2];
      const frequencyMap = {
        day: 'DAILY',
        week: 'WEEKLY',
        month: 'MONTHLY',
        year: 'YEARLY'
      };
      return {
        frequency: frequencyMap[unit],
        interval
      };
    }

    // Check for "monthly on the Nth"
    const monthlyOnMatch = lowerText.match(/monthly on the (\d+)(st|nd|rd|th)?/);
    if (monthlyOnMatch) {
      return {
        frequency: 'MONTHLY',
        interval: 1,
        byMonthDay: [parseInt(monthlyOnMatch[1])]
      };
    }

    // Default: weekly
    return { frequency: 'WEEKLY', interval: 1 };
  }
}

const recurringEventsService = new RecurringEventsService();
export default recurringEventsService;
