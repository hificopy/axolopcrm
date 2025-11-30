/**
 * Settings Service
 * Handles all settings-related API calls
 */

import { createClient } from "@supabase/supabase-js";
import { handleApiError, standardizedFetch } from "../lib/error-handler";

const API_BASE_URL =
  (typeof import.meta.env !== "undefined" && import.meta.env.VITE_API_URL) ||
  "http://localhost:3002/api/v1";

// Initialize Supabase client at module level for consistent session access
const supabaseUrl =
  (typeof import.meta.env !== "undefined" &&
    import.meta.env.VITE_SUPABASE_URL) ||
  process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  (typeof import.meta.env !== "undefined" &&
    import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  process.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
          flowType: "pkce",
        },
      })
    : null;

class SettingsService {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/user-preferences`;
  }

  /**
   * Get authorization headers with current Supabase token
   */
  async getAuthHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    }

    return headers;
  }

  // ==================== USER PREFERENCES ====================

  /**
   * Get user preferences
   */
  async getUserPreferences() {
    try {
      const headers = await this.getAuthHeaders();
      return await standardizedFetch(
        `${this.baseUrl}/settings`,
        {
          method: "GET",
          headers,
        },
        "getting user settings",
      );
    } catch (error) {
      console.error("Error getting user preferences:", error);
      throw error;
    }
  }

  /**
   * Update specific preference
   */
  async updatePreference(key, value) {
    try {
      const headers = await this.getAuthHeaders();
      return await standardizedFetch(
        `${this.baseUrl}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ key, value }),
        },
        "updating preference",
      );
    } catch (error) {
      throw handleApiError(error, "updating preference");
    }
  }

  // ==================== USER SETTINGS ====================

  /**
   * Get user settings (theme, notifications, etc.)
   */
  async getUserSettings() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to get user settings");
      }

      return await response.json();
    } catch (error) {
      throw handleApiError(error, "getting user settings");
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(settings) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: "PUT",
        headers,
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update user settings");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw error;
    }
  }

  // ==================== USER TODOS ====================

  /**
   * Get user todos
   */
  async getUserTodos() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/todos`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to get user todos");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting user todos:", error);
      throw error;
    }
  }

  /**
   * Create a new todo
   */
  async createTodo(todoData) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/todos`, {
        method: "POST",
        headers,
        body: JSON.stringify(todoData),
      });

      if (!response.ok) {
        throw new Error("Failed to create todo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating todo:", error);
      throw error;
    }
  }

  /**
   * Update a todo
   */
  async updateTodo(todoId, updates) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/todos/${todoId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  }

  /**
   * Delete a todo
   */
  async deleteTodo(todoId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/todos/${todoId}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  }

  /**
   * Toggle todo completion
   */
  async toggleTodoCompletion(todoId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/todos/${todoId}/toggle`, {
        method: "POST",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to toggle todo completion");
      }

      return await response.json();
    } catch (error) {
      console.error("Error toggling todo completion:", error);
      throw error;
    }
  }

  /**
   * Bulk update todos (for reordering)
   */
  async bulkUpdateTodos(todos) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/todos/bulk`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ todos }),
      });

      if (!response.ok) {
        throw new Error("Failed to bulk update todos");
      }

      return await response.json();
    } catch (error) {
      console.error("Error bulk updating todos:", error);
      throw error;
    }
  }

  // ==================== AGENCY SETTINGS ====================

  /**
   * Get agency settings
   */
  async getAgencySettings() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/agencies/settings`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to get agency settings");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting agency settings:", error);
      throw error;
    }
  }

  /**
   * Update agency settings
   */
  async updateAgencySettings(settings) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/agencies/settings`, {
        method: "PUT",
        headers,
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update agency settings");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating agency settings:", error);
      throw error;
    }
  }

  // Backwards compatibility aliases
  async getOrganizationSettings() {
    return this.getAgencySettings();
  }

  async updateOrganizationSettings(settings) {
    return this.updateAgencySettings(settings);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Handle API errors consistently
   */
  handleError(error, customMessage = null) {
    const message = customMessage || error.message || "An error occurred";
    console.error("Settings Service Error:", error);
    throw new Error(message);
  }

  /**
   * Validate settings data
   */
  validateSettings(settings, type) {
    const validators = {
      general: ["firstName", "lastName", "email", "timezone"],
      security: ["twoFactor", "autoLogout"],
      notifications: ["emailNotifications", "pushNotifications"],
      organization: ["name", "currency", "timezone"],
    };

    const required = validators[type] || [];
    const missing = required.filter((field) => !settings[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }

    return true;
  }
}

const settingsService = new SettingsService();
export default settingsService;
