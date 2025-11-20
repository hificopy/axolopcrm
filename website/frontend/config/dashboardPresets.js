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
    description: 'Overview of key metrics',
    widgets: [
      // Top row - Revenue chart and metrics (y: 0-4)
      { i: 'revenue-chart', x: 0, y: 0, w: 7, h: 5, minW: 4, minH: 3, component: 'RevenueChart', props: { title: 'Revenue Overview' } },
      { i: 'metric-1', x: 7, y: 0, w: 5, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Total Revenue', color: 'accent' } },
      { i: 'metric-2', x: 7, y: 2, w: 2, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Active Deals', color: 'blue' } },
      { i: 'metric-3', x: 9, y: 2, w: 3, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'New Leads', color: 'green' } },
      { i: 'metric-4', x: 7, y: 4, w: 5, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Conversion Rate', color: 'yellow' } },

      // Middle row - Complex widgets (y: 6-10)
      { i: 'profit-margin', x: 0, y: 6, w: 6, h: 5, minW: 3, minH: 3, component: 'ProfitMarginWidget' },
      { i: 'conversion-funnel', x: 6, y: 6, w: 6, h: 5, minW: 3, minH: 3, component: 'ConversionFunnelWidget' },

      // Bottom row - Marketing widgets (y: 11-14)
      { i: 'form-submissions', x: 0, y: 11, w: 6, h: 4, minW: 3, minH: 3, component: 'FormSubmissionsWidget' },
      { i: 'email-marketing', x: 6, y: 11, w: 6, h: 4, minW: 3, minH: 3, component: 'EmailMarketingWidget' },
    ]
  },
  sales: {
    id: 'sales',
    name: 'Sales Dashboard',
    description: 'Focus on sales metrics and pipeline',
    widgets: [
      // Top row - Dominant revenue chart with vertical metric stack
      { i: 'revenue-chart', x: 0, y: 0, w: 8, h: 5, minW: 6, minH: 4, component: 'RevenueChart', props: { title: 'Sales Revenue' } },
      { i: 'metric-1', x: 8, y: 0, w: 4, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Total Revenue', color: 'accent' } },
      { i: 'metric-2', x: 8, y: 2, w: 2, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Active Deals', color: 'blue' } },
      { i: 'metric-3', x: 10, y: 2, w: 2, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Avg. Deal Size', color: 'green' } },

      // Middle row - Three-column asymmetric layout with better heights
      { i: 'metric-4', x: 0, y: 5, w: 2, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Conversion Rate', color: 'yellow' } },
      { i: 'conversion-funnel', x: 2, y: 5, w: 5, h: 5, minW: 4, minH: 4, component: 'ConversionFunnelWidget' },
      { i: 'profit-margin', x: 7, y: 5, w: 5, h: 5, minW: 4, minH: 4, component: 'ProfitMarginWidget' },

      // Bottom row - Full-width sales widget
      { i: 'full-sales', x: 0, y: 10, w: 12, h: 5, minW: 6, minH: 5, component: 'FullSalesWidget' },
    ]
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Dashboard',
    description: 'Track marketing campaigns and leads',
    widgets: [
      // Top row - Equal width marketing widgets with better heights
      { i: 'email-marketing', x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 4, component: 'EmailMarketingWidget' },
      { i: 'form-submissions', x: 6, y: 0, w: 6, h: 4, minW: 4, minH: 4, component: 'FormSubmissionsWidget' },

      // Middle row - Creative metric card stagger with varied widths
      { i: 'metric-1', x: 0, y: 4, w: 2, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Running Campaigns', color: 'blue' } },
      { i: 'metric-2', x: 2, y: 4, w: 4, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Engagement Rate', color: 'green' } },
      { i: 'metric-3', x: 6, y: 4, w: 3, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Total Subscribers', color: 'yellow' } },
      { i: 'metric-4', x: 9, y: 4, w: 3, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'New Leads', color: 'accent' } },

      // Bottom row - Asymmetric full widgets with better heights
      { i: 'conversion-funnel', x: 0, y: 6, w: 5, h: 5, minW: 4, minH: 4, component: 'ConversionFunnelWidget' },
      { i: 'full-marketing', x: 5, y: 6, w: 7, h: 5, minW: 4, minH: 5, component: 'FullMarketingWidget' },
    ]
  },
  executive: {
    id: 'executive',
    name: 'Executive Dashboard',
    description: 'High-level business overview',
    widgets: [
      // Top row - Dominant revenue with profit margin sidebar - better heights
      { i: 'revenue-chart', x: 0, y: 0, w: 7, h: 5, minW: 6, minH: 4, component: 'RevenueChart', props: { title: 'Revenue Trend' } },
      { i: 'profit-margin', x: 7, y: 0, w: 5, h: 5, minW: 4, minH: 4, component: 'ProfitMarginWidget' },

      // Middle row - Staggered metric cards with varying widths for visual interest
      { i: 'metric-1', x: 0, y: 5, w: 4, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Total Revenue', color: 'accent' } },
      { i: 'metric-2', x: 4, y: 5, w: 2, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Active Accounts', color: 'blue' } },
      { i: 'metric-3', x: 6, y: 5, w: 3, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Customer LTV', color: 'green' } },
      { i: 'metric-4', x: 9, y: 5, w: 3, h: 2, minW: 2, minH: 2, component: 'MetricCard', props: { title: 'Churn Rate', color: 'yellow' } },

      // Bottom row - Asymmetric full-width widgets with better heights
      { i: 'conversion-funnel', x: 0, y: 7, w: 5, h: 5, minW: 4, minH: 4, component: 'ConversionFunnelWidget' },
      { i: 'email-marketing', x: 5, y: 7, w: 7, h: 5, minW: 4, minH: 4, component: 'EmailMarketingWidget' },
    ]
  }
};

export function getPreset(id) {
  return presetConfigs[id] || presetConfigs.default;
}

export function getPresetList() {
  return Object.values(presetConfigs);
}
