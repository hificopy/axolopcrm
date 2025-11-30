import { google } from "googleapis";
import { supabaseServer } from "../config/supabase-auth.js";
import { DateTime } from "luxon";

/**
 * Calendar Sync Service
 * Handles real-time Google Calendar synchronization using push notifications
 */
class CalendarSyncService {
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
          "http://localhost:3000/api/calendar/oauth/callback",
      );
    } catch (error) {
      console.error("Error initializing OAuth client for sync:", error);
    }
  }

  /**
   * Set up push notifications for a user's calendar
   * This enables real-time sync when calendar changes
   */
  async setupPushNotifications(userId, calendarId = "primary") {
    try {
      // Get user's refresh token from database
      const { data: userTokens } = await supabaseServer
        .from("user_integrations")
        .select("refresh_token, access_token")
        .eq("user_id", userId)
        .eq("provider", "google")
        .single();

      if (!userTokens?.refresh_token) {
        throw new Error("User has not authorized Google Calendar");
      }

      // Set credentials for OAuth client
      this.oauth2Client.setCredentials({
        refresh_token: userTokens.refresh_token,
        access_token: userTokens.access_token,
      });

      const calendar = google.calendar({
        version: "v3",
        auth: this.oauth2Client,
      });

      // Set up webhook channel
      const webhookUrl = `${process.env.APP_BASE_URL || "http://localhost:3002"}/api/calendar/webhook`;
      const channelId = `calendar-${userId}-${calendarId}-${Date.now()}`;

      const response = await calendar.events.watch({
        calendarId,
        requestBody: {
          id: channelId,
          type: "web_hook",
          address: webhookUrl,
          expiration: this.getWebhookExpiration(),
        },
      });

      // Store webhook channel info in database
      await supabaseServer.from("calendar_webhooks").upsert({
        user_id: userId,
        calendar_id: calendarId,
        channel_id: channelId,
        resource_id: response.data.resourceId,
        expiration: new Date(response.data.expiration).toISOString(),
        webhook_url: webhookUrl,
        status: "active",
        created_at: new Date().toISOString(),
      });

      console.log(
        `Push notifications set up for user ${userId}, calendar ${calendarId}`,
      );

      return {
        success: true,
        channelId,
        resourceId: response.data.resourceId,
        expiration: response.data.expiration,
      };
    } catch (error) {
      console.error("Error setting up push notifications:", error);
      throw error;
    }
  }

  /**
   * Stop push notifications for a user's calendar
   */
  async stopPushNotifications(userId, calendarId = "primary") {
    try {
      // Get webhook channel info from database
      const { data: webhook } = await supabaseServer
        .from("calendar_webhooks")
        .select("channel_id, resource_id")
        .eq("user_id", userId)
        .eq("calendar_id", calendarId)
        .eq("status", "active")
        .single();

      if (!webhook) {
        return { success: true, message: "No active webhook found" };
      }

      // Get user's refresh token
      const { data: userTokens } = await supabaseServer
        .from("user_integrations")
        .select("refresh_token, access_token")
        .eq("user_id", userId)
        .eq("provider", "google")
        .single();

      if (!userTokens?.refresh_token) {
        throw new Error("User has not authorized Google Calendar");
      }

      // Set credentials for OAuth client
      this.oauth2Client.setCredentials({
        refresh_token: userTokens.refresh_token,
        access_token: userTokens.access_token,
      });

      const calendar = google.calendar({
        version: "v3",
        auth: this.oauth2Client,
      });

      // Stop the channel
      await calendar.channels.stop({
        requestBody: {
          id: webhook.channel_id,
          resourceId: webhook.resource_id,
        },
      });

      // Update webhook status in database
      await supabaseServer
        .from("calendar_webhooks")
        .update({
          status: "stopped",
          stopped_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("calendar_id", calendarId);

      console.log(
        `Push notifications stopped for user ${userId}, calendar ${calendarId}`,
      );

      return { success: true };
    } catch (error) {
      console.error("Error stopping push notifications:", error);
      throw error;
    }
  }

  /**
   * Handle incoming webhook notification from Google Calendar
   */
  async handleWebhookNotification(headers, body) {
    try {
      // Verify webhook authenticity
      const channelId = headers["x-goog-channel-id"];
      const resourceId = headers["x-goog-resource-id"];
      const resourceState = headers["x-goog-resource-state"];
      const resourceUri = headers["x-goog-resource-uri"];

      if (!channelId || !resourceId) {
        throw new Error("Missing required webhook headers");
      }

      // Find webhook in database
      const { data: webhook } = await supabaseServer
        .from("calendar_webhooks")
        .select("user_id, calendar_id")
        .eq("channel_id", channelId)
        .eq("resource_id", resourceId)
        .eq("status", "active")
        .single();

      if (!webhook) {
        console.warn("Webhook not found in database:", {
          channelId,
          resourceId,
        });
        return { success: false, error: "Webhook not found" };
      }

      console.log(`Calendar webhook received for user ${webhook.user_id}:`, {
        resourceState,
        resourceUri,
        channelId,
      });

      // Handle different resource states
      switch (resourceState) {
        case "exists":
          // Calendar changed - sync events
          await this.syncCalendarEvents(webhook.user_id, webhook.calendar_id);
          break;

        case "sync":
          // Initial sync complete
          console.log(`Initial sync complete for user ${webhook.user_id}`);
          break;

        case "not_exists":
          // Calendar or event deleted
          await this.handleCalendarDeletion(
            webhook.user_id,
            webhook.calendar_id,
            resourceUri,
          );
          break;

        default:
          console.warn("Unknown resource state:", resourceState);
      }

      // Update webhook last activity
      await supabaseServer
        .from("calendar_webhooks")
        .update({
          last_activity: new Date().toISOString(),
        })
        .eq("channel_id", channelId);

      return { success: true };
    } catch (error) {
      console.error("Error handling webhook notification:", error);
      throw error;
    }
  }

  /**
   * Sync calendar events for a user
   * This is called when webhook notification is received
   */
  async syncCalendarEvents(userId, calendarId = "primary") {
    try {
      // Get user's refresh token
      const { data: userTokens } = await supabaseServer
        .from("user_integrations")
        .select("refresh_token, access_token")
        .eq("user_id", userId)
        .eq("provider", "google")
        .single();

      if (!userTokens?.refresh_token) {
        throw new Error("User has not authorized Google Calendar");
      }

      // Set credentials for OAuth client
      this.oauth2Client.setCredentials({
        refresh_token: userTokens.refresh_token,
        access_token: userTokens.access_token,
      });

      const calendar = google.calendar({
        version: "v3",
        auth: this.oauth2Client,
      });

      // Get events from the last 30 days and next 90 days
      const timeMin = DateTime.now().minus({ days: 30 }).toISO();
      const timeMax = DateTime.now().plus({ days: 90 }).toISO();

      const response = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 1000, // Increased from 100 to get more events
      });

      const events = response.data.items || [];

      // Clear existing events for this user and calendar
      await supabaseServer
        .from("calendar_events")
        .delete()
        .eq("user_id", userId)
        .eq("calendar_id", calendarId);

      // Insert updated events
      if (events.length > 0) {
        const eventsToInsert = events
          .filter((event) => event.status !== "cancelled")
          .map((event) => ({
            user_id: userId,
            calendar_id: calendarId,
            google_event_id: event.id,
            title: event.summary || "No Title",
            description: event.description || "",
            start_time: event.start?.dateTime || event.start?.date,
            end_time: event.end?.dateTime || event.end?.date,
            location: event.location || "",
            status: event.status || "confirmed",
            visibility: event.visibility || "default",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

        await supabaseServer.from("calendar_events").insert(eventsToInsert);

        console.log(
          `Synced ${eventsToInsert.length} events for user ${userId}`,
        );
      }

      return { success: true, eventsSynced: events.length };
    } catch (error) {
      console.error("Error syncing calendar events:", error);
      throw error;
    }
  }

  /**
   * Handle calendar or event deletion
   */
  async handleCalendarDeletion(userId, calendarId, resourceUri) {
    try {
      // Extract event ID from resource URI if it's an event
      if (resourceUri && resourceUri.includes("/events/")) {
        const eventId = resourceUri.split("/events/")[1];

        // Delete specific event from database
        await supabaseServer
          .from("calendar_events")
          .delete()
          .eq("user_id", userId)
          .eq("calendar_id", calendarId)
          .eq("google_event_id", eventId);

        console.log(`Deleted event ${eventId} for user ${userId}`);
      } else {
        // Entire calendar might be deleted
        await supabaseServer
          .from("calendar_events")
          .delete()
          .eq("user_id", userId)
          .eq("calendar_id", calendarId);

        console.log(
          `Deleted all events for calendar ${calendarId} for user ${userId}`,
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Error handling calendar deletion:", error);
      throw error;
    }
  }

  /**
   * Renew webhook channels before they expire
   * This should be called by a cron job daily
   */
  async renewExpiringWebhooks() {
    try {
      const tomorrow = DateTime.now().plus({ days: 1 }).toISO();

      // Find webhooks expiring in next 24 hours
      const { data: expiringWebhooks } = await supabaseServer
        .from("calendar_webhooks")
        .select("*")
        .eq("status", "active")
        .lte("expiration", tomorrow);

      console.log(
        `Found ${expiringWebhooks?.length || 0} webhooks expiring soon`,
      );

      for (const webhook of expiringWebhooks || []) {
        try {
          // Stop old webhook
          await this.stopPushNotifications(
            webhook.user_id,
            webhook.calendar_id,
          );

          // Set up new webhook
          await this.setupPushNotifications(
            webhook.user_id,
            webhook.calendar_id,
          );

          console.log(`Renewed webhook for user ${webhook.user_id}`);
        } catch (error) {
          console.error(
            `Failed to renew webhook for user ${webhook.user_id}:`,
            error,
          );
        }
      }

      return { success: true, renewed: expiringWebhooks?.length || 0 };
    } catch (error) {
      console.error("Error renewing expiring webhooks:", error);
      throw error;
    }
  }

  /**
   * Get webhook expiration time (7 days from now)
   */
  getWebhookExpiration() {
    return DateTime.now().plus({ days: 7 }).toMillis();
  }

  /**
   * Clean up old stopped webhooks
   */
  async cleanupOldWebhooks() {
    try {
      const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toISO();

      const { data } = await supabaseServer
        .from("calendar_webhooks")
        .delete()
        .eq("status", "stopped")
        .lte("stopped_at", thirtyDaysAgo);

      console.log(`Cleaned up ${data?.length || 0} old webhooks`);

      return { success: true, deleted: data?.length || 0 };
    } catch (error) {
      console.error("Error cleaning up old webhooks:", error);
      throw error;
    }
  }
}

export default new CalendarSyncService();
