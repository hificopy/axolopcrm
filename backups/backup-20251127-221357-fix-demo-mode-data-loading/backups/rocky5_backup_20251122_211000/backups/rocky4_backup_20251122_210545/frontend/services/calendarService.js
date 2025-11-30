/**
 * Calendar Service
 * Handles all calendar-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

class CalendarService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/calendar`;
  }

  // ==================== Google Calendar OAuth ====================

  /**
   * Get Google Calendar OAuth URL
   */
  async getGoogleAuthUrl() {
    try {
      const response = await fetch(`${this.baseUrl}/google/auth-url`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }

      const data = await response.json();
      return data.authUrl;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw error;
    }
  }

  /**
   * Check Google Calendar connection status
   */
  async checkGoogleStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/google/status`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check connection status');
      }

      const data = await response.json();
      return data.connected;
    } catch (error) {
      console.error('Error checking connection status:', error);
      return false;
    }
  }

  /**
   * Get comprehensive Google connection status
   * Returns status for Calendar, Gmail, Contacts, and all Google services
   */
  async getGoogleConnectionStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/google/connection-status`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get comprehensive connection status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting comprehensive connection status:', error);
      return {
        google_connected: false,
        calendar_connected: false,
        gmail_connected: false,
        services: {
          calendar: false,
          gmail: false,
        }
      };
    }
  }

  /**
   * Disconnect Google Calendar
   */
  async disconnectGoogle() {
    try {
      const response = await fetch(`${this.baseUrl}/google/disconnect`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect Google Calendar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      throw error;
    }
  }

  // ==================== Google Calendar Operations ====================

  /**
   * List all user's Google Calendars
   */
  async listGoogleCalendars() {
    try {
      const response = await fetch(`${this.baseUrl}/google/calendars`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to list calendars');
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing calendars:', error);
      throw error;
    }
  }

  /**
   * Get events from Google Calendar
   */
  async getGoogleEvents({ calendarId = 'primary', timeMin, timeMax, maxResults = 250 }) {
    try {
      const params = new URLSearchParams({
        calendarId,
        maxResults: maxResults.toString(),
      });

      if (timeMin) params.append('timeMin', timeMin);
      if (timeMax) params.append('timeMax', timeMax);

      const response = await fetch(`${this.baseUrl}/google/events?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get Google events');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting Google events:', error);
      throw error;
    }
  }

  /**
   * Create event in Google Calendar
   */
  async createGoogleEvent(eventData) {
    try {
      const response = await fetch(`${this.baseUrl}/google/events`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to create Google event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Google event:', error);
      throw error;
    }
  }

  /**
   * Update event in Google Calendar
   */
  async updateGoogleEvent(eventId, eventData) {
    try {
      const response = await fetch(`${this.baseUrl}/google/events/${eventId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to update Google event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating Google event:', error);
      throw error;
    }
  }

  /**
   * Delete event from Google Calendar
   */
  async deleteGoogleEvent(eventId, calendarId = 'primary') {
    try {
      const response = await fetch(`${this.baseUrl}/google/events/${eventId}?calendarId=${calendarId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete Google event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting Google event:', error);
      throw error;
    }
  }

  // ==================== CRM Events ====================

  /**
   * Get all CRM events for calendar
   */
  async getCRMEvents({ startDate, endDate }) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${this.baseUrl}/crm/events?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get CRM events');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting CRM events:', error);
      throw error;
    }
  }

  // ==================== Calendar Presets ====================

  /**
   * Get user's calendar preset
   */
  async getPreset() {
    try {
      const response = await fetch(`${this.baseUrl}/presets`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get calendar preset');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting calendar preset:', error);
      throw error;
    }
  }

  /**
   * Save user's calendar preset
   */
  async savePreset(presetData) {
    try {
      const response = await fetch(`${this.baseUrl}/presets`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(presetData),
      });

      if (!response.ok) {
        throw new Error('Failed to save calendar preset');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving calendar preset:', error);
      throw error;
    }
  }

  /**
   * Update category visibility
   */
  async updateCategoryVisibility(category, subcategory, visible) {
    try {
      const response = await fetch(`${this.baseUrl}/presets/category`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, subcategory, visible }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category visibility');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating category visibility:', error);
      throw error;
    }
  }

  /**
   * Update Google Calendar visibility
   */
  async updateGoogleCalendarVisibility(calendarId, visible) {
    try {
      const response = await fetch(`${this.baseUrl}/presets/google-calendar`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ calendarId, visible }),
      });

      if (!response.ok) {
        throw new Error('Failed to update Google Calendar visibility');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating Google Calendar visibility:', error);
      throw error;
    }
  }

  /**
   * Reset preset to default
   */
  async resetPreset() {
    try {
      const response = await fetch(`${this.baseUrl}/presets/reset`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset preset');
      }

      return await response.json();
    } catch (error) {
      console.error('Error resetting preset:', error);
      throw error;
    }
  }

  // ==================== Combined Events ====================

  /**
   * Get all events (Google + CRM) for unified calendar view
   */
  async getAllEvents({ timeMin, timeMax }) {
    try {
      const params = new URLSearchParams();
      if (timeMin) params.append('timeMin', timeMin);
      if (timeMax) params.append('timeMax', timeMax);

      const response = await fetch(`${this.baseUrl}/events/all?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get all events');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting all events:', error);
      throw error;
    }
  }
}

const calendarService = new CalendarService();
export default calendarService;
