/**
 * Dashboard Preset Service
 * Manages saving and loading custom dashboard layouts
 */

class DashboardPresetService {
  constructor() {
    this.storageKey = 'dashboard_presets';
  }

  getPresets() {
    try {
      const presets = localStorage.getItem(this.storageKey);
      return presets ? JSON.parse(presets) : [];
    } catch (error) {
      console.error('Error loading presets:', error);
      return [];
    }
  }

  savePreset(name, layout, widgets) {
    try {
      const presets = this.getPresets();
      const newPreset = {
        id: Date.now().toString(),
        name,
        layout,
        widgets,
        createdAt: new Date().toISOString()
      };
      presets.push(newPreset);
      localStorage.setItem(this.storageKey, JSON.stringify(presets));
      return newPreset;
    } catch (error) {
      console.error('Error saving preset:', error);
      throw error;
    }
  }

  deletePreset(id) {
    try {
      const presets = this.getPresets();
      const filtered = presets.filter(p => p.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting preset:', error);
      throw error;
    }
  }

  getPreset(id) {
    const presets = this.getPresets();
    return presets.find(p => p.id === id);
  }

  // Get user presets (for multi-user support, currently uses localStorage)
  async getUserPresets(userId) {
    // For now, return all presets from localStorage
    // In the future, this could fetch from a backend API
    return this.getPresets();
  }
}

const dashboardPresetService = new DashboardPresetService();
export default dashboardPresetService;
