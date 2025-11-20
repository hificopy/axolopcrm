/**
 * Dashboard Preset Service
 * Manages saving and loading custom dashboard layouts using Supabase
 */

import supabaseDashboardPresetService from './supabaseDashboardPresetService';

class DashboardPresetService {
  constructor() {
    // Now using Supabase service
  }

  // Get user presets from Supabase
  async getUserPresets(userId) {
    if (!userId) {
      console.error('No userId provided to getUserPresets');
      return [];
    }
    return await supabaseDashboardPresetService.getUserPresets();
  }

  // Save preset to Supabase
  async savePreset(userId, name, description, layout, basePreset) {
    if (!userId) {
      throw new Error('No userId provided to savePreset');
    }
    return await supabaseDashboardPresetService.savePreset(name, description, layout, basePreset);
  }

  // Update an existing preset in Supabase
  async updatePreset(presetId, name, description, layout) {
    return await supabaseDashboardPresetService.updatePreset(presetId, name, description, layout);
  }

  // Delete preset from Supabase
  async deletePreset(presetId) {
    return await supabaseDashboardPresetService.deletePreset(presetId);
  }

  // Get a specific preset from Supabase
  async getPreset(presetId) {
    return await supabaseDashboardPresetService.getPreset(presetId);
  }

  // Set default preset in Supabase
  async setDefaultPreset(presetId) {
    return await supabaseDashboardPresetService.setDefaultPreset(presetId);
  }

  // Get default preset from Supabase
  async getDefaultPreset() {
    return await supabaseDashboardPresetService.getDefaultPreset();
  }
}

const dashboardPresetService = new DashboardPresetService();
export default dashboardPresetService;
