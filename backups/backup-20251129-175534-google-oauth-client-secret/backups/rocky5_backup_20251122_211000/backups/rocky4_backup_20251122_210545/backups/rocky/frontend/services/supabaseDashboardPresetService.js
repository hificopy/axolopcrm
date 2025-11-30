/**
 * Supabase Dashboard Preset Service
 * Manages saving and loading custom dashboard layouts using Supabase
 */

import { supabase } from '@/config/supabaseClient';

class SupabaseDashboardPresetService {
  constructor() {
    this.table = 'dashboard_presets';
  }

  /**
   * Get all presets for the current user
   */
  async getUserPresets() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No user session found');
        return [];
      }

      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading user presets:', error);
        return [];
      }

      // Format the data to match the expected structure
      return data.map(preset => ({
        id: preset.id,
        name: preset.name,
        description: preset.description,
        layout: preset.layout,
        basePreset: preset.base_preset,
        isDefault: preset.is_default,
        createdAt: preset.created_at,
        updatedAt: preset.updated_at
      }));
    } catch (error) {
      console.error('Error getting user presets:', error);
      return [];
    }
  }

  /**
   * Save a new preset for the current user
   */
  async savePreset(name, description, layout, basePreset = 'default', isDefault = false) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No user session found');
      }

      const presetData = {
        user_id: session.user.id,
        name,
        description,
        layout,
        base_preset: basePreset,
        is_custom: true,
        is_default: isDefault
      };

      const { data, error } = await supabase
        .from(this.table)
        .insert(presetData)
        .select()
        .single();

      if (error) {
        console.error('Error saving preset:', error);
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
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error saving preset:', error);
      throw error;
    }
  }

  /**
   * Update an existing preset
   */
  async updatePreset(presetId, name, description, layout, isDefault = false) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No user session found');
      }

      const updateData = {
        name,
        description,
        layout,
        is_default: isDefault,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.table)
        .update(updateData)
        .eq('id', presetId)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating preset:', error);
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
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error updating preset:', error);
      throw error;
    }
  }

  /**
   * Delete a preset for the current user
   */
  async deletePreset(presetId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No user session found');
      }

      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', presetId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting preset:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting preset:', error);
      throw error;
    }
  }

  /**
   * Get a specific preset by ID for the current user
   */
  async getPreset(presetId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No user session found');
      }

      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', presetId)
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error getting preset:', error);
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
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error getting preset:', error);
      return null;
    }
  }

  /**
   * Set a preset as the default for the user
   */
  async setDefaultPreset(presetId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No user session found');
      }

      // First, unset all other presets for this user
      await supabase
        .from(this.table)
        .update({ is_default: false })
        .eq('user_id', session.user.id);

      // Then set the current preset as default
      const { data, error } = await supabase
        .from(this.table)
        .update({ is_default: true })
        .eq('id', presetId)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error setting default preset:', error);
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
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error setting default preset:', error);
      throw error;
    }
  }

  /**
   * Get the default preset for the current user
   */
  async getDefaultPreset() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No user session found');
      }

      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_default', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        console.error('Error getting default preset:', error);
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
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error getting default preset:', error);
      return null;
    }
  }
}

const supabaseDashboardPresetService = new SupabaseDashboardPresetService();
export default supabaseDashboardPresetService;