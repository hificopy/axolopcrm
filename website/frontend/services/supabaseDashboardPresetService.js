/**
 * Supabase Dashboard Preset Service
 * Manages saving and loading custom dashboard layouts using Supabase
 */

import { supabase } from "@/config/supabaseClient";

class SupabaseDashboardPresetService {
  constructor() {
    this.table = "dashboard_presets";
  }

  /**
   * Get all presets for the current user
   */
  async getUserPresets() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.warn("No user session found");
        return [];
      }

      // Validate session user ID
      if (!session.user?.id) {
        console.error("Invalid user session: missing user ID");
        return [];
      }

      const { data, error } = await supabase
        .from(this.table)
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading user presets:", error);
        // Handle specific RLS errors
        if (error.code === "42501") {
          console.warn(
            "Row Level Security: User does not have access to dashboard_presets",
          );
        }
        return [];
      }

      // Validate data structure
      if (!Array.isArray(data)) {
        console.error("Invalid data structure received from Supabase");
        return [];
      }

      // Format data to match the expected structure
      return data
        .map((preset) => {
          // Validate preset structure
          if (!preset.id || !preset.name) {
            console.warn("Invalid preset structure:", preset);
            return null;
          }

          // Validate layout is array
          let layout = preset.layout;
          if (layout && typeof layout === "string") {
            try {
              layout = JSON.parse(layout);
            } catch (e) {
              console.warn("Invalid layout JSON for preset:", preset.id);
              layout = [];
            }
          }
          if (!Array.isArray(layout)) {
            layout = [];
          }

          return {
            id: preset.id,
            name: preset.name || "Untitled Preset",
            description: preset.description || "",
            layout: layout,
            basePreset: preset.base_preset || "default",
            isDefault: Boolean(preset.is_default),
            createdAt: preset.created_at,
            updatedAt: preset.updated_at,
          };
        })
        .filter(Boolean); // Remove null entries
    } catch (error) {
      console.error("Unexpected error getting user presets:", error);
      return [];
    }
  }

  /**
   * Save a new preset for the current user
   */
  async savePreset(
    name,
    description,
    layout,
    basePreset = "default",
    isDefault = false,
  ) {
    try {
      // Validate inputs
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw new Error(
          "Preset name is required and must be a non-empty string",
        );
      }

      if (name.length > 255) {
        throw new Error("Preset name must be less than 255 characters");
      }

      if (!Array.isArray(layout)) {
        throw new Error("Layout must be an array");
      }

      // Validate each widget in layout
      for (const widget of layout) {
        if (!widget.i || !widget.component) {
          throw new Error("Invalid widget structure: missing required fields");
        }
        if (typeof widget.w !== "number" || widget.w < 1) {
          throw new Error("Invalid widget width");
        }
        if (typeof widget.h !== "number" || widget.h < 1) {
          throw new Error("Invalid widget height");
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || !session.user?.id) {
        throw new Error("Valid user session required");
      }

      const presetData = {
        user_id: session.user.id,
        name: name.trim(),
        description: description?.trim() || "",
        layout: JSON.stringify(layout), // Ensure consistent storage format
        base_preset: basePreset || "default",
        is_custom: true,
        is_default: Boolean(isDefault),
      };

      const { data, error } = await supabase
        .from(this.table)
        .insert(presetData)
        .select()
        .single();

      if (error) {
        console.error("Error saving preset:", error);
        // Handle specific errors
        if (error.code === "23505") {
          throw new Error("A preset with this name already exists");
        }
        if (error.code === "42501") {
          throw new Error("Permission denied: Cannot save dashboard preset");
        }
        throw new Error(`Failed to save preset: ${error.message}`);
      }

      // Validate returned data
      if (!data || !data.id) {
        throw new Error("Invalid response from server");
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description || "",
        layout: layout, // Return the original layout array
        basePreset: data.base_preset || "default",
        isDefault: Boolean(data.is_default),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("Error saving preset:", error);
      throw error;
    }
  }

  /**
   * Update an existing preset
   */
  async updatePreset(presetId, name, description, layout, isDefault = false) {
    try {
      // Validate inputs
      if (!presetId || typeof presetId !== "string") {
        throw new Error("Valid preset ID is required");
      }

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        throw new Error(
          "Preset name is required and must be a non-empty string",
        );
      }

      if (name.length > 255) {
        throw new Error("Preset name must be less than 255 characters");
      }

      if (!Array.isArray(layout)) {
        throw new Error("Layout must be an array");
      }

      // Validate each widget in layout
      for (const widget of layout) {
        if (!widget.i || !widget.component) {
          throw new Error("Invalid widget structure: missing required fields");
        }
        if (typeof widget.w !== "number" || widget.w < 1) {
          throw new Error("Invalid widget width");
        }
        if (typeof widget.h !== "number" || widget.h < 1) {
          throw new Error("Invalid widget height");
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || !session.user?.id) {
        throw new Error("Valid user session required");
      }

      const updateData = {
        name: name.trim(),
        description: description?.trim() || "",
        layout: JSON.stringify(layout), // Ensure consistent storage format
        is_default: Boolean(isDefault),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(this.table)
        .update(updateData)
        .eq("id", presetId)
        .eq("user_id", session.user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating preset:", error);
        // Handle specific errors
        if (error.code === "PGRST116") {
          throw new Error("Preset not found or access denied");
        }
        if (error.code === "23505") {
          throw new Error("A preset with this name already exists");
        }
        if (error.code === "42501") {
          throw new Error("Permission denied: Cannot update dashboard preset");
        }
        throw new Error(`Failed to update preset: ${error.message}`);
      }

      // Validate returned data
      if (!data || !data.id) {
        throw new Error("Invalid response from server");
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description || "",
        layout: layout, // Return the original layout array
        basePreset: data.base_preset || "default",
        isDefault: Boolean(data.is_default),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("Error updating preset:", error);
      throw error;
    }
  }

  /**
   * Delete a preset for the current user
   */
  async deletePreset(presetId) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || !session.user?.id) {
        throw new Error("Valid user session required");
      }

      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq("id", presetId)
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error deleting preset:", error);
        if (error.code === "PGRST116") {
          throw new Error("Preset not found or access denied");
        }
        if (error.code === "42501") {
          throw new Error("Permission denied: Cannot delete dashboard preset");
        }
        throw new Error(`Failed to delete preset: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting preset:", error);
      throw error;
    }
  }

  /**
   * Get a specific preset by ID for the current user
   */
  async getPreset(presetId) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No user session found");
      }

      const { data, error } = await supabase
        .from(this.table)
        .select("*")
        .eq("id", presetId)
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Error getting preset:", error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        layout: data.layout,
        basePreset: data.base_preset,
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("Error getting preset:", error);
      return null;
    }
  }

  /**
   * Set a preset as the default for the user
   */
  async setDefaultPreset(presetId) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No user session found");
      }

      // First, unset all other presets for this user
      await supabase
        .from(this.table)
        .update({ is_default: false })
        .eq("user_id", session.user.id);

      // Then set the current preset as default
      const { data, error } = await supabase
        .from(this.table)
        .update({ is_default: true })
        .eq("id", presetId)
        .eq("user_id", session.user.id)
        .select()
        .single();

      if (error) {
        console.error("Error setting default preset:", error);
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        layout: data.layout,
        basePreset: data.base_preset,
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("Error setting default preset:", error);
      throw error;
    }
  }

  /**
   * Get the default preset for the current user
   */
  async getDefaultPreset() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No user session found");
      }

      const { data, error } = await supabase
        .from(this.table)
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_default", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null;
        }
        console.error("Error getting default preset:", error);
        throw error;
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        layout: data.layout,
        basePreset: data.base_preset,
        isDefault: data.is_default,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error("Error getting default preset:", error);
      return null;
    }
  }
}

const supabaseDashboardPresetService = new SupabaseDashboardPresetService();
export default supabaseDashboardPresetService;
