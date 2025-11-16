/**
 * Default Dashboard Presets
 */

export const DASHBOARD_PRESETS = {
  DEFAULT: 'default',
  SALES: 'sales',
  MARKETING: 'marketing',
  EXECUTIVE: 'executive'
};

const presetConfigs = {
  default: {
    id: 'default',
    name: 'Default Dashboard',
    widgets: ['revenue', 'deals', 'leads', 'conversion'],
    layout: []
  },
  sales: {
    id: 'sales',
    name: 'Sales Dashboard',
    widgets: ['revenue', 'pipeline', 'deals', 'conversion'],
    layout: []
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Dashboard',
    widgets: ['campaigns', 'emails', 'forms', 'leads'],
    layout: []
  },
  executive: {
    id: 'executive',
    name: 'Executive Dashboard',
    widgets: ['revenue', 'profit', 'growth', 'kpis'],
    layout: []
  }
};

export function getPreset(id) {
  return presetConfigs[id] || presetConfigs.default;
}

export function getPresetList() {
  return Object.values(presetConfigs);
}
