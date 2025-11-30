import { supabase } from '../config/supabase-auth.js';

class CalendarPresetService {
  /**
   * Get user's calendar visibility preset
   */
  async getUserPreset(userId) {
    try {
      const { data, error } = await supabase
        .from('calendar_presets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Return default preset if none exists
      if (!data) {
        return this.getDefaultPreset();
      }

      return data;
    } catch (error) {
      console.error('Error getting user preset:', error);
      return this.getDefaultPreset();
    }
  }

  /**
   * Save user's calendar visibility preset
   */
  async saveUserPreset(userId, presetData) {
    try {
      const { data, error } = await supabase
        .from('calendar_presets')
        .upsert({
          user_id: userId,
          preset_name: presetData.presetName || 'My Calendar Preset',
          visible_categories: presetData.visibleCategories || this.getDefaultCategories(),
          visible_google_calendars: presetData.visibleGoogleCalendars || [],
          default_view: presetData.defaultView || 'month',
          time_zone: presetData.timeZone || 'America/New_York',
          week_start: presetData.weekStart || 'sunday',
          business_hours: presetData.businessHours || {
            start: '09:00',
            end: '17:00',
          },
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving user preset:', error);
      throw error;
    }
  }

  /**
   * Get default preset configuration
   */
  getDefaultPreset() {
    return {
      preset_name: 'Default Calendar View',
      visible_categories: this.getDefaultCategories(),
      visible_google_calendars: [],
      default_view: 'month',
      time_zone: 'America/New_York',
      week_start: 'sunday',
      business_hours: {
        start: '09:00',
        end: '17:00',
      },
    };
  }

  /**
   * Get default category visibility settings
   */
  getDefaultCategories() {
    return {
      sales: {
        enabled: true,
        subcategories: {
          salesCalls: true,
          meetings: true,
          demos: true,
          followUps: true,
          closingEvents: true,
        },
      },
      marketing: {
        enabled: true,
        subcategories: {
          emailCampaigns: true,
          webinars: true,
          contentPublishing: true,
          socialMediaPosts: true,
          adCampaigns: true,
        },
      },
      service: {
        enabled: true,
        subcategories: {
          supportCalls: true,
          maintenanceWindows: true,
          customerCheckIns: true,
          trainingsSessions: true,
          renewalReminders: true,
        },
      },
    };
  }

  /**
   * Update specific category visibility
   */
  async updateCategoryVisibility(userId, category, subcategory, visible) {
    try {
      const preset = await this.getUserPreset(userId);
      const categories = preset.visible_categories || this.getDefaultCategories();

      if (subcategory) {
        // Update subcategory
        if (categories[category] && categories[category].subcategories) {
          categories[category].subcategories[subcategory] = visible;
        }
      } else {
        // Update main category
        if (categories[category]) {
          categories[category].enabled = visible;
        }
      }

      return await this.saveUserPreset(userId, {
        ...preset,
        visibleCategories: categories,
      });
    } catch (error) {
      console.error('Error updating category visibility:', error);
      throw error;
    }
  }

  /**
   * Update Google Calendar visibility
   */
  async updateGoogleCalendarVisibility(userId, calendarId, visible) {
    try {
      const preset = await this.getUserPreset(userId);
      let visibleCalendars = preset.visible_google_calendars || [];

      if (visible && !visibleCalendars.includes(calendarId)) {
        visibleCalendars.push(calendarId);
      } else if (!visible) {
        visibleCalendars = visibleCalendars.filter(id => id !== calendarId);
      }

      return await this.saveUserPreset(userId, {
        ...preset,
        visibleGoogleCalendars: visibleCalendars,
      });
    } catch (error) {
      console.error('Error updating Google Calendar visibility:', error);
      throw error;
    }
  }

  /**
   * Reset preset to default
   */
  async resetToDefault(userId) {
    try {
      return await this.saveUserPreset(userId, this.getDefaultPreset());
    } catch (error) {
      console.error('Error resetting to default:', error);
      throw error;
    }
  }
}

const calendarPresetService = new CalendarPresetService();
export default calendarPresetService;
