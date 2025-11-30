import { supabaseServer } from "../config/supabase-auth.js";

// Use the shared supabaseServer client (service role key) from config
const supabase = supabaseServer;

/**
 * User Preferences Service
 * Handles all user-specific preferences and data stored in Supabase
 * Replaces localStorage usage for cross-device synchronization
 */
class UserPreferencesService {
  /**
   * Get user preferences
   */
  async getUserPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned" which is fine, we'll create one
        throw error;
      }

      // If no preferences exist, create default ones
      if (!data) {
        return this.createDefaultPreferences(userId);
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error getting user preferences:", error);
      throw error;
    }
  }

  /**
   * Create default preferences for a user
   */
  async createDefaultPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .insert({
          user_id: userId,

          dashboard_layout: {},
          dashboard_widgets: [],
          default_view_contacts: "table",
          default_view_leads: "table",
          default_view_opportunities: "kanban",
          preferences: {},
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error creating default preferences:", error);
      throw error;
    }
  }

  /**
   * Update specific preference field
   */
  async updatePreference(userId, key, value) {
    try {
      // Get current preferences
      const current = await this.getUserPreferences(userId);

      // Update the specific field or merge into preferences JSONB
      const updates = {};
      if (key === "dashboard_layout") {
        updates.dashboard_layout = value;
      } else if (key === "dashboard_widgets") {
        updates.dashboard_widgets = value;
      } else if (key.startsWith("default_view_")) {
        updates[key] = value;
      } else {
        // Store in preferences JSONB
        const currentPreferences = current.data?.preferences || {};
        updates.preferences = { ...currentPreferences, [key]: value };
      }

      const { data, error } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error updating preference:", error);
      throw error;
    }
  }

  /**
   * Update user settings (theme, notifications, etc.)
   */
  async updateUserSettings(userId, settings) {
    try {
      // Use user_preferences table instead since user_settings doesn't exist
      // Store settings in the preferences JSONB field
      const { data: existing } = await supabase
        .from("user_preferences")
        .select("preferences")
        .eq("user_id", userId)
        .single();

      if (!existing) {
        // Create new preferences with settings
        const { data, error } = await supabase
          .from("user_preferences")
          .insert({
            user_id: userId,
            preferences: settings,
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } else {
        // Update existing preferences
        const currentPreferences = existing.preferences || {};
        const updatedPreferences = { ...currentPreferences, ...settings };

        const { data, error } = await supabase
          .from("user_preferences")
          .update({
            preferences: updatedPreferences,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      }
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw error;
    }
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId) {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      // Return default settings if none exist
      if (!data) {
        return {
          success: true,
          data: {
            theme: "system",
            email_notifications: true,
            push_notifications: true,
            sms_notifications: false,
            marketing_emails: false,
          },
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error getting user settings:", error);
      throw error;
    }
  }

  /**
   * Get user todos
   */
  async getUserTodos(userId) {
    try {
      const { data, error } = await supabase
        .from("user_todos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error getting user todos:", error);
      throw error;
    }
  }

  /**
   * Create a new todo
   */
  async createTodo(userId, todoData) {
    try {
      const { data, error } = await supabase
        .from("user_todos")
        .insert({
          user_id: userId,
          title: todoData.title,
          description: todoData.description,
          completed: todoData.completed || false,
          priority: todoData.priority || "medium",
          due_date: todoData.due_date,
          category: todoData.category,
          tags: todoData.tags,
          sort_order: todoData.sort_order || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error creating todo:", error);
      throw error;
    }
  }

  /**
   * Update a todo
   */
  async updateTodo(userId, todoId, updates) {
    try {
      const { data, error } = await supabase
        .from("user_todos")
        .update(updates)
        .eq("id", todoId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  }

  /**
   * Delete a todo
   */
  async deleteTodo(userId, todoId) {
    try {
      const { error } = await supabase
        .from("user_todos")
        .delete()
        .eq("id", todoId)
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  }

  /**
   * Toggle todo completion
   */
  async toggleTodoCompletion(userId, todoId) {
    try {
      // Get current todo
      const { data: todo, error: fetchError } = await supabase
        .from("user_todos")
        .select("completed")
        .eq("id", todoId)
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      // Toggle completion
      const updates = {
        completed: !todo.completed,
        completed_at: !todo.completed ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from("user_todos")
        .update(updates)
        .eq("id", todoId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error toggling todo completion:", error);
      throw error;
    }
  }

  /**
   * Bulk update todos (for reordering)
   */
  async bulkUpdateTodos(userId, todos) {
    try {
      const updates = todos.map((todo, index) => ({
        id: todo.id,
        user_id: userId,
        sort_order: index,
      }));

      // Use upsert to update sort_order
      const { data, error } = await supabase
        .from("user_todos")
        .upsert(updates, { onConflict: "id" })
        .select();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error bulk updating todos:", error);
      throw error;
    }
  }

  /**
   * Update user settings (theme, notifications, etc.)
   */
  async updateUserSettings(userId, settings) {
    try {
      // Use user_preferences table instead since user_settings doesn't exist
      // Store settings in preferences JSONB field
      const { data: existing } = await supabase
        .from("user_preferences")
        .select("preferences")
        .eq("user_id", userId)
        .single();

      if (!existing) {
        // Create new preferences with settings
        const { data, error } = await supabase
          .from("user_preferences")
          .insert({
            user_id: userId,
            preferences: settings,
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      } else {
        // Update existing preferences
        const currentPreferences = existing.preferences || {};
        const updatedPreferences = { ...currentPreferences, ...settings };
        
        const { data, error } = await supabase
          .from("user_preferences")
          .update({
            preferences: updatedPreferences,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data };
      }
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw error;
    }
  }

  /**
   * Get pinned quick action buttons for a user
   * Returns array of button IDs that should be pinned in the header
   */
  async getPinnedQuickActions(userId) {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("preferences")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      // Default pinned buttons (help and notifications)
      const defaultPinned = ["help", "notifications"];

      // Return saved pinned buttons from preferences JSONB or defaults
      return {
        success: true,
        data: data?.preferences?.pinned_quick_actions || defaultPinned,
      };
    } catch (error) {
      console.error("Error getting pinned quick actions:", error);
      throw error;
    }
  }

  /**
   * Update pinned quick action buttons for a user
   * Max 4 buttons allowed
   */
  async updatePinnedQuickActions(userId, pinnedButtons) {
    try {
      // Validate max 4 buttons
      if (pinnedButtons.length > 4) {
        throw new Error("Maximum 4 pinned quick action buttons allowed");
      }

      // First, get the existing preferences row
      const { data: existing, error: fetchError } = await supabase
        .from("user_preferences")
        .select("preferences")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      // Merge pinned_quick_actions into existing preferences
      const currentPreferences = existing?.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        pinned_quick_actions: pinnedButtons,
      };

      if (!existing) {
        // Create new row if doesn't exist
        const { data, error } = await supabase
          .from("user_preferences")
          .insert({
            user_id: userId,
            preferences: updatedPreferences,
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: pinnedButtons };
      } else {
        // Update existing row
        const { data, error } = await supabase
          .from("user_preferences")
          .update({
            preferences: updatedPreferences,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: pinnedButtons };
      }
    } catch (error) {
      console.error("Error updating pinned quick actions:", error);
      throw error;
    }
  }

  /**
   * Update sidebar menu buttons for a user
   * Max 12 buttons allowed
   */
  async updateSidebarMenuButtons(userId, buttons) {
    try {
      // Validate max 12 buttons
      if (buttons.length > 12) {
        throw new Error("Maximum 12 sidebar menu buttons allowed");
      }

      // First, get the existing preferences row
      const { data: existing, error: fetchError } = await supabase
        .from("user_preferences")
        .select("preferences")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      // Merge sidebar_menu_buttons into existing preferences
      const currentPreferences = existing?.preferences || {};
      const updatedPreferences = {
        ...currentPreferences,
        sidebar_menu_buttons: buttons,
      };

      if (!existing) {
        // Create new row if doesn't exist
        const { data, error } = await supabase
          .from("user_preferences")
          .insert({
            user_id: userId,
            preferences: updatedPreferences,
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: buttons };
      } else {
        // Update existing row
        const { data, error } = await supabase
          .from("user_preferences")
          .update({
            preferences: updatedPreferences,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: buttons };
      }
    } catch (error) {
      console.error("Error updating sidebar menu buttons:", error);
      throw error;
    }
  }
}

export default new UserPreferencesService();
