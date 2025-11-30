/**
 * Enhanced Search Service with Command Support
 * Adds new search methods for comprehensive coverage
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class EnhancedSearchService {
  /**
   * Search User Preferences
   */
  async searchUserPreferences(userId, query, limit = 8) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .or(`key.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        console.error("Error searching user preferences:", error);
        return [];
      }

      return (
        data?.map((item) => ({
          ...item,
          type: "user_preferences",
          name: item.key,
          title: item.key,
          subtitle: item.category,
          value: item.value,
          category: "settings",
        })) || []
      );
    } catch (error) {
      console.error("Error in searchUserPreferences:", error);
      return [];
    }
  }

  /**
   * Search App Settings
   */
  async searchAppSettings(userId, query, limit = 8) {
    if (!userId) return [];

    try {
      const agencyId = await this.getUserAgencyId(userId);
      if (!agencyId) return [];

      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("agency_id", agencyId)
        .or(`key.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        console.error("Error searching app settings:", error);
        return [];
      }

      return (
        data?.map((item) => ({
          ...item,
          type: "app_settings",
          name: item.key,
          title: item.key,
          subtitle: item.category,
          value: item.value,
          category: "settings",
        })) || []
      );
    } catch (error) {
      console.error("Error in searchAppSettings:", error);
      return [];
    }
  }

  /**
   * Search Feature Flags
   */
  async searchFeatureFlags(userId, query, limit = 8) {
    if (!userId) return [];

    try {
      const agencyId = await this.getUserAgencyId(userId);
      if (!agencyId) return [];

      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .eq("agency_id", agencyId)
        .or(`flag_name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) {
        console.error("Error searching feature flags:", error);
        return [];
      }

      return (
        data?.map((item) => ({
          ...item,
          type: "feature_flags",
          name: item.flag_name,
          title: item.flag_name,
          subtitle: item.description,
          enabled: item.enabled,
          category: "settings",
        })) || []
      );
    } catch (error) {
      console.error("Error in searchFeatureFlags:", error);
      return [];
    }
  }

  /**
   * Search Audit Logs
   */
  async searchAuditLogs(userId, query, limit = 8) {
    if (!userId) return [];

    try {
      const agencyId = await this.getUserAgencyId(userId);
      if (!agencyId) return [];

      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("agency_id", agencyId)
        .or(`action.ilike.%${query}%,entity_type.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error searching audit logs:", error);
        return [];
      }

      return (
        data?.map((item) => ({
          ...item,
          type: "audit_logs",
          name: `${item.action} - ${item.entity_type || "System"}`,
          title: `${item.action} - ${item.entity_type || "System"}`,
          subtitle: new Date(item.created_at).toLocaleString(),
          action: item.action,
          category: "system",
        })) || []
      );
    } catch (error) {
      console.error("Error in searchAuditLogs:", error);
      return [];
    }
  }

  /**
   * Search Notifications
   */
  async searchNotifications(userId, query, limit = 8) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .or(
          `title.ilike.%${query}%,message.ilike.%${query}%,entity_type.ilike.%${query}%`,
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error searching notifications:", error);
        return [];
      }

      return (
        data?.map((item) => ({
          ...item,
          type: "notifications",
          name: item.title,
          title: item.title,
          subtitle: item.message,
          priority: item.priority,
          read: item.read,
          category: "system",
        })) || []
      );
    } catch (error) {
      console.error("Error in searchNotifications:", error);
      return [];
    }
  }

  /**
   * Search Help Articles
   */
  async searchHelpArticles(query, limit = 8) {
    try {
      const { data, error } = await supabase
        .from("help_articles")
        .select("*")
        .eq("published", true)
        .or(
          `title.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%,tags.cs.{${query}}`,
        )
        .order("view_count", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error searching help articles:", error);
        return [];
      }

      return (
        data?.map((item) => ({
          ...item,
          type: "help_articles",
          name: item.title,
          title: item.title,
          subtitle: `${item.category} • ${item.view_count || 0} views`,
          content: item.content,
          category: "help",
        })) || []
      );
    } catch (error) {
      console.error("Error in searchHelpArticles:", error);
      return [];
    }
  }

  /**
   * Search Video Tutorials
   */
  async searchVideoTutorials(query, limit = 8) {
    try {
      const { data, error } = await supabase
        .from("video_tutorials")
        .select("*")
        .eq("published", true)
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,tags.cs.{${query}}`,
        )
        .order("view_count", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error searching video tutorials:", error);
        return [];
      }

      return (
        data?.map((item) => ({
          ...item,
          type: "video_tutorials",
          name: item.title,
          title: item.title,
          subtitle: `${item.category} • ${Math.floor(item.duration / 60)}m ${item.duration % 60}s`,
          duration: item.duration,
          category: "help",
        })) || []
      );
    } catch (error) {
      console.error("Error in searchVideoTutorials:", error);
      return [];
    }
  }

  /**
   * Search Quick Actions
   */
  async searchQuickActions(query, limit = 8) {
    try {
      const { data, error } = await supabase
        .from("quick_actions")
        .select("*")
        .eq("enabled", true)
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,target_entity.ilike.%${query}%`,
        )
        .order("order_index", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("Error searching quick actions:", error);
        return [];
      }

      return (
        data?.map((item) => ({
          ...item,
          type: "quick_actions",
          name: item.title,
          title: item.title,
          subtitle: item.description,
          action_type: item.action_type,
          target_route: item.target_route,
          keyboard_shortcut: item.keyboard_shortcut,
          category: "actions",
        })) || []
      );
    } catch (error) {
      console.error("Error in searchQuickActions:", error);
      return [];
    }
  }

  /**
   * Get User Agency ID (helper method)
   */
  async getUserAgencyId(userId) {
    try {
      const { data, error } = await supabase
        .from("agency_users")
        .select("agency_id")
        .eq("user_id", userId)
        .single();

      return data?.agency_id || null;
    } catch (error) {
      console.error("Error getting user agency ID:", error);
      return null;
    }
  }

  /**
   * Log Command Execution
   */
  async logCommandExecution(
    userId,
    command,
    commandType,
    entityType = null,
    entityId = null,
    success = true,
    executionTime = 0,
    errorMessage = null,
  ) {
    if (!userId) return;

    try {
      await supabase.from("command_history").insert({
        user_id: userId,
        command,
        command_type: commandType,
        entity_type: entityType,
        entity_id: entityId,
        success,
        execution_time_ms: executionTime,
        error_message: errorMessage,
      });
    } catch (error) {
      console.error("Error logging command execution:", error);
    }
  }

  /**
   * Execute Command from Command Palette
   */
  async executeCommand(userId, options = {}) {
    const { command, commandType, entityType, entityId } = options;

    if (!command) {
      return {
        success: false,
        message: "Command is required",
      };
    }

    try {
      const startTime = Date.now();

      // Execute the command based on type
      let result;
      switch (commandType) {
        case "create":
          result = await this.handleCreateCommand(userId, entityType, options);
          break;
        case "navigate":
          result = await this.handleNavigateCommand(
            userId,
            entityType,
            options,
          );
          break;
        case "settings":
          result = await this.handleSettingsCommand(
            userId,
            entityType,
            options,
          );
          break;
        case "help":
          result = await this.handleHelpCommand(userId, entityType, options);
          break;
        case "toggle":
          result = await this.handleToggleCommand(userId, entityType, options);
          break;
        case "export":
          result = await this.handleExportCommand(userId, entityType, options);
          break;
        case "import":
          result = await this.handleImportCommand(userId, entityType, options);
          break;
        default:
          result = {
            success: false,
            message: `Unknown command type: ${commandType}`,
          };
          break;
      }

      const executionTime = Date.now() - startTime;

      // Log the command execution
      await this.logCommandExecution(
        userId,
        command,
        commandType,
        entityType,
        entityId,
        result.success,
        executionTime,
        result.error,
      );

      return {
        success: result.success,
        data: result.data,
        message: result.message,
      };
    } catch (error) {
      console.error("Error executing command:", error);
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  /**
   * Handle Create Commands
   */
  async handleCreateCommand(userId, entityType, options = {}) {
    // For now, return a success response
    // In a real implementation, this would create the entity
    return {
      success: true,
      data: {
        id: "temp-id",
        name: `New ${entityType}`,
        created: true,
      },
      message: `${entityType} creation initiated`,
    };
  }

  /**
   * Handle Navigate Commands
   */
  async handleNavigateCommand(userId, destination, options = {}) {
    const routeMap = {
      dashboard: "/app/dashboard",
      home: "/app/dashboard",
      leads: "/app/leads",
      contacts: "/app/contacts",
      forms: "/app/forms",
      campaigns: "/app/email-campaigns",
      calendar: "/app/calendar",
      workflows: "/app/workflows",
      reports: "/app/reports",
      settings: "/app/settings",
      help: "/app/help",
      profile: "/app/profile",
      team: "/app/team",
      billing: "/app/billing",
      integrations: "/app/integrations",
    };

    const route = routeMap[destination.toLowerCase()];
    if (route) {
      return {
        success: true,
        data: {
          route,
          destination,
        },
        message: `Navigating to ${destination}`,
      };
    } else {
      return {
        success: false,
        message: `Unknown destination: ${destination}`,
      };
    }
  }

  /**
   * Handle Settings Commands
   */
  async handleSettingsCommand(userId, setting, options = {}) {
    const settingsMap = {
      profile: "/app/profile",
      user: "/app/profile",
      agency: "/app/agency/settings",
      team: "/app/team",
      security: "/app/settings/security",
      notifications: "/app/settings/notifications",
      integrations: "/app/integrations",
      billing: "/app/billing",
      plans: "/app/billing",
    };

    const route = settingsMap[setting.toLowerCase()];
    if (route) {
      return {
        success: true,
        data: {
          route,
          setting,
        },
        message: `Opening ${setting} settings`,
      };
    } else {
      return {
        success: false,
        message: `Unknown setting: ${setting}`,
      };
    }
  }

  /**
   * Handle Help Commands
   */
  async handleHelpCommand(userId, topic, options = {}) {
    const helpMap = {
      shortcuts: "/app/shortcuts",
      commands: "/app/help/commands",
      search: "/app/help/search",
      api: "/app/docs/api",
      tutorials: "/app/tutorials",
      videos: "/app/tutorials",
      docs: "/app/docs",
    };

    const route = helpMap[topic.toLowerCase()];
    if (route) {
      return {
        success: true,
        data: {
          route,
          topic,
        },
        message: `Opening help for ${topic}`,
      };
    } else {
      return {
        success: false,
        message: `Unknown help topic: ${topic}`,
      };
    }
  }

  /**
   * Handle Toggle Commands
   */
  async handleToggleCommand(userId, feature, options = {}) {
    // For now, just return success
    // In a real implementation, this would toggle the feature
    return {
      success: true,
      data: {
        feature,
        toggled: true,
      },
      message: `${feature} toggled`,
    };
  }

  /**
   * Handle Export Commands
   */
  async handleExportCommand(userId, dataType, options = {}) {
    // For now, just return success
    // In a real implementation, this would export data
    return {
      success: true,
      data: {
        dataType,
        exportStarted: true,
      },
      message: `Exporting ${dataType || "data"}...`,
    };
  }

  /**
   * Handle Import Commands
   */
  async handleImportCommand(userId, dataType, options = {}) {
    // For now, just return success
    // In a real implementation, this would import data
    return {
      success: true,
      data: {
        dataType,
        importStarted: true,
      },
      message: `Importing ${dataType || "data"}...`,
    };
  }

  /**
   * Get Recent Commands
   */
  async getRecentCommands(userId, limit = 10) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from("command_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error getting recent commands:", error);
        return [];
      }

      return data?.map((item) => item.command) || [];
    } catch (error) {
      console.error("Error in getRecentCommands:", error);
      return [];
    }
  }

  /**
   * Get Popular Entities
   */
  async getPopularEntities(userId, limit = 10) {
    // For now, return empty array
    // In a real implementation, this would return most accessed entities
    return [];
  }

  /**
   * Get Quick Actions
   */
  async getQuickActions() {
    try {
      const { data, error } = await supabase
        .from("quick_actions")
        .select("*")
        .eq("enabled", true)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error getting quick actions:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getQuickActions:", error);
      return [];
    }
  }
}

export default new EnhancedSearchService();
