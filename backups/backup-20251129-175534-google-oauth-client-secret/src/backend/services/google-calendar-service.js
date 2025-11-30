import { google } from "googleapis";
import { supabase } from "../config/supabase-auth.js";

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = null;
    this.initializeOAuth();
  }

  initializeOAuth() {
    try {
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI ||
          "http://localhost:3002/api/calendar/oauth/callback",
      );
    } catch (error) {
      console.error("Error initializing OAuth client:", error);
    }
  }

  /**
   * Generate OAuth URL for user to authorize full Google integration
   * Includes Calendar, Gmail, and Contacts for complete CRM integration
   */
  getAuthUrl(userId) {
    const scopes = [
      // Calendar - Full access for event management
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",

      // Gmail - For email integration with CRM
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.compose",
      "https://www.googleapis.com/auth/gmail.modify",

      // Contacts - For contact sync
      "https://www.googleapis.com/auth/contacts.readonly",

      // User info - For profile and email
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      state: userId, // Pass userId to identify user after redirect
      prompt: "consent", // Force consent screen to get refresh token
      include_granted_scopes: true, // Include previously granted scopes
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error("Error getting tokens from code:", error);
      throw new Error("Failed to get tokens from authorization code");
    }
  }

  /**
   * Save user's Google tokens to database
   * This saves tokens for both Calendar and Gmail integration
   */
  async saveUserTokens(userId, tokens) {
    try {
      // Save to calendar_integrations table
      const { data: calendarData, error: calendarError } = await supabase
        .from("calendar_integrations")
        .upsert({
          user_id: userId,
          provider: "google",
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: tokens.expiry_date,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (calendarError) throw calendarError;

      // Also save to gmail_tokens table for Gmail integration
      try {
        await supabase.from("gmail_tokens").upsert({
          user_id: userId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: tokens.expiry_date
            ? new Date(tokens.expiry_date).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        });
      } catch (gmailError) {
        console.log(
          "Gmail tokens table may not exist yet, skipping Gmail token save",
        );
      }

      console.log(
        `✅ Google integration complete for user ${userId} - Calendar & Gmail connected`,
      );
      return calendarData;
    } catch (error) {
      console.error("Error saving user tokens:", error);
      throw error;
    }
  }

  /**
   * Get user's calendar tokens from database
   */
  async getUserTokens(userId) {
    try {
      const { data, error } = await supabase
        .from("calendar_integrations")
        .select("*")
        .eq("user_id", userId)
        .eq("provider", "google")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (error) {
      console.error("Error getting user tokens:", error);
      return null;
    }
  }

  /**
   * Refresh access token if expired
   */
  async refreshAccessToken(userId) {
    try {
      const tokens = await this.getUserTokens(userId);
      if (!tokens || !tokens.refresh_token) {
        throw new Error("No refresh token found");
      }

      this.oauth2Client.setCredentials({
        refresh_token: tokens.refresh_token,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      await this.saveUserTokens(userId, credentials);
      return credentials;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  }

  /**
   * Get authenticated calendar client for user
   */
  async getCalendarClient(userId) {
    try {
      let tokens = await this.getUserTokens(userId);

      if (!tokens) {
        throw new Error("User has not connected Google Calendar");
      }

      // Check if token is expired
      const now = Date.now();
      if (tokens.token_expiry && now >= tokens.token_expiry) {
        tokens = await this.refreshAccessToken(userId);
      }

      this.oauth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      return google.calendar({ version: "v3", auth: this.oauth2Client });
    } catch (error) {
      console.error("Error getting calendar client:", error);
      throw error;
    }
  }

  /**
   * List all calendars for user
   */
  async listCalendars(userId) {
    try {
      const calendar = await this.getCalendarClient(userId);
      const response = await calendar.calendarList.list();

      return response.data.items.map((cal) => ({
        id: cal.id,
        summary: cal.summary,
        description: cal.description,
        primary: cal.primary || false,
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor,
        accessRole: cal.accessRole,
      }));
    } catch (error) {
      console.error("Error listing calendars:", error);
      throw error;
    }
  }

  /**
   * Get events from Google Calendar
   */
  async getEvents(
    userId,
    { calendarId = "primary", timeMin, timeMax, maxResults = 250 },
  ) {
    try {
      const calendar = await this.getCalendarClient(userId);

      const response = await calendar.events.list({
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax,
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
      });

      return response.data.items.map((event) => ({
        id: event.id,
        calendarId,
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        attendees: event.attendees || [],
        status: event.status,
        htmlLink: event.htmlLink,
        colorId: event.colorId,
      }));
    } catch (error) {
      console.error("Error getting events:", error);
      throw error;
    }
  }

  /**
   * Create event in Google Calendar
   */
  async createEvent(userId, eventData) {
    try {
      const calendar = await this.getCalendarClient(userId);

      const event = {
        summary: eventData.summary,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.start,
          timeZone: eventData.timeZone || "America/New_York",
        },
        end: {
          dateTime: eventData.end,
          timeZone: eventData.timeZone || "America/New_York",
        },
        attendees: eventData.attendees || [],
        reminders: {
          useDefault: false,
          overrides: eventData.reminders || [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
        colorId: eventData.colorId,
      };

      const response = await calendar.events.insert({
        calendarId: eventData.calendarId || "primary",
        resource: event,
        sendUpdates: "all",
      });

      return response.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  /**
   * Update event in Google Calendar
   */
  async updateEvent(userId, eventId, eventData) {
    try {
      const calendar = await this.getCalendarClient(userId);

      const event = {
        summary: eventData.summary,
        description: eventData.description,
        location: eventData.location,
        start: {
          dateTime: eventData.start,
          timeZone: eventData.timeZone || "America/New_York",
        },
        end: {
          dateTime: eventData.end,
          timeZone: eventData.timeZone || "America/New_York",
        },
        attendees: eventData.attendees,
        colorId: eventData.colorId,
      };

      const response = await calendar.events.update({
        calendarId: eventData.calendarId || "primary",
        eventId,
        resource: event,
        sendUpdates: "all",
      });

      return response.data;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  /**
   * Delete event from Google Calendar
   */
  async deleteEvent(userId, { calendarId = "primary", eventId }) {
    try {
      const calendar = await this.getCalendarClient(userId);

      await calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: "all",
      });

      return { success: true };
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }

  /**
   * Disconnect Google Calendar integration
   */
  async disconnectCalendar(userId) {
    try {
      const { error } = await supabase
        .from("calendar_integrations")
        .delete()
        .eq("user_id", userId)
        .eq("provider", "google");

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      throw error;
    }
  }

  /**
   * Check if user has connected Google Calendar
   */
  async isConnected(userId) {
    try {
      const tokens = await this.getUserTokens(userId);
      return !!tokens;
    } catch (error) {
      console.error("Error checking connection status:", error);
      return false;
    }
  }

  /**
   * Get comprehensive Google connection status
   * Checks Calendar, Gmail, and returns connected services
   */
  async getGoogleConnectionStatus(userId) {
    try {
      const calendarConnected = await this.isConnected(userId);

      // Check Gmail connection
      let gmailConnected = false;
      try {
        const { data: gmailTokens } = await supabase
          .from("gmail_tokens")
          .select("access_token")
          .eq("user_id", userId)
          .single();
        gmailConnected =
          gmailTokens !== null && gmailTokens.access_token !== null;
      } catch (error) {
        gmailConnected = false;
      }

      return {
        google_connected: calendarConnected || gmailConnected,
        calendar_connected: calendarConnected,
        gmail_connected: gmailConnected,
        services: {
          calendar: calendarConnected,
          gmail: gmailConnected,
        },
      };
    } catch (error) {
      console.error("Error getting Google connection status:", error);
      return {
        google_connected: false,
        calendar_connected: false,
        gmail_connected: false,
        services: {
          calendar: false,
          gmail: false,
        },
      };
    }
  }

  /**
   * Trigger automatic calendar sync on connection
   */
  async syncCalendarOnConnection(userId) {
    try {
      console.log(`🔄 Starting automatic calendar sync for user ${userId}...`);

      // Get next 30 days of events
      const timeMin = new Date().toISOString();
      const timeMax = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      // Fetch events from primary calendar
      const events = await this.getEvents(userId, {
        calendarId: "primary",
        timeMin,
        timeMax,
        maxResults: 100,
      });

      console.log(
        `✅ Synced ${events.length} calendar events for user ${userId}`,
      );
      return events;
    } catch (error) {
      console.error("Error syncing calendar:", error);
      return [];
    }
  }
}

const googleCalendarService = new GoogleCalendarService();
export default googleCalendarService;
