import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Settings, Download, Save, Sparkles, LayoutGrid, DollarSign, Users, TrendingUp, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Dashboard widgets
import RevenueChart from '@/components/dashboard/RevenueChart';
import ProfitMarginWidget from '@/components/dashboard/ProfitMarginWidget';
import ConversionFunnelWidget from '@/components/dashboard/ConversionFunnelWidget';
import EmailMarketingWidget from '@/components/dashboard/EmailMarketingWidget';
import FormSubmissionsWidget from '@/components/dashboard/FormSubmissionsWidget';
import MetricCard from '@/components/dashboard/MetricCard';

// Services and configs
import dashboardDataService from '@/services/dashboardDataService';
import dashboardPresetService from '@/services/dashboardPresetService';
import { DASHBOARD_PRESETS, getPreset, getPresetList } from '@/config/dashboardPresets';
import SavePresetModal from '@/components/dashboard/SavePresetModal';

// CSS for react-grid-layout
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget component mapping
const WIDGET_COMPONENTS = {
  RevenueChart,
  ProfitMarginWidget,
  ConversionFunnelWidget,
  EmailMarketingWidget,
  FormSubmissionsWidget,
  MetricCard,
};

// Icon mapping for MetricCard
const METRIC_ICONS = {
  'Total Revenue': DollarSign,
  'Active Deals': TrendingUp,
  'New Leads': Users,
  'Conversion Rate': Percent,
  'Active Listings': LayoutGrid,
  'Scheduled Showings': Users,
  'Pending Closings': DollarSign,
  'Avg. Sale Price': DollarSign,
  'Total Sales Volume': DollarSign,
  'Active Agents': Users,
  'Team Listings': LayoutGrid,
  'Avg. Commission': DollarSign,
  'Annual Recurring Revenue': DollarSign,
  'Active Accounts': Users,
  'Churn Rate': Percent,
  'Customer LTV': DollarSign,
  'Active Clients': Users,
  'Running Campaigns': Sparkles,
  'Retainer Revenue': DollarSign,
  'Client Retention': Percent,
  'Total Subscribers': Users,
  'Engagement Rate': Percent,
  'Active Sponsorships': Sparkles,
  'Avg. Deal Size': DollarSign,
  'Total Orders': LayoutGrid,
  'Average Order Value': DollarSign,
  'Cart Abandonment': Percent,
};

export default function Dashboard() {
  const [currentPreset, setCurrentPreset] = useState('default');
  const [layout, setLayout] = useState([]);
  const [customCount, setCustomCount] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [customPresets, setCustomPresets] = useState([]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sales, marketing, profitLoss, forms] = await Promise.all([
        dashboardDataService.getSalesMetrics(timeRange),
        dashboardDataService.getMarketingMetrics(timeRange),
        dashboardDataService.getProfitLossData(timeRange),
        dashboardDataService.getFormSubmissions(timeRange),
      ]);

      setDashboardData({
        sales,
        marketing,
        profitLoss,
        forms,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize layout from preset
  useEffect(() => {
    const preset = getPreset(currentPreset);
    setLayout(preset.widgets);
  }, [currentPreset]);

  // Handle preset change
  const handlePresetChange = (presetId) => {
    if (currentPreset !== 'default' && currentPreset !== presetId && !currentPreset.startsWith('custom-')) {
      // Create a custom version
      const newCustomId = `custom-${customCount + 1}`;
      setCustomCount(customCount + 1);
      setCurrentPreset(newCustomId);
    } else {
      setCurrentPreset(presetId);
    }
    setIsEditMode(false);
  };

  // Handle layout change (drag/resize)
  const handleLayoutChange = (newLayout) => {
    if (isEditMode) {
      setLayout(newLayout);
      if (!currentPreset.startsWith('custom-')) {
        const newCustomId = `custom-${customCount + 1}`;
        setCustomCount(customCount + 1);
        setCurrentPreset(newCustomId);
      }
    }
  };

  // Load custom presets
  useEffect(() => {
    loadCustomPresets();
  }, []);

  const loadCustomPresets = async () => {
    // TODO: Get actual user ID from auth context
    const userId = 'demo-user-id';
    const presets = await dashboardPresetService.getUserPresets(userId);
    setCustomPresets(presets);
  };

  // Handle save preset
  const handleSavePreset = () => {
    setShowSaveModal(true);
  };

  // Handle save from modal
  const handleSaveFromModal = async (name, description) => {
    // TODO: Get actual user ID from auth context
    const userId = 'demo-user-id';

    const basePreset = currentPreset.startsWith('custom-')
      ? DASHBOARD_PRESETS[currentPreset.split('-')[0]] || 'default'
      : currentPreset;

    const savedPreset = await dashboardPresetService.savePreset(
      userId,
      name,
      description,
      layout,
      basePreset
    );

    if (savedPreset) {
      setCurrentPreset(`custom-${savedPreset.id}`);
      await loadCustomPresets();
      setIsEditMode(false);
    }
  };

  // Render widget based on component type
  const renderWidget = (widget) => {
    const Component = WIDGET_COMPONENTS[widget.component];
    if (!Component) return null;

    // Prepare widget data based on component type
    let widgetData = {};
    let widgetProps = widget.props || {};

    switch (widget.component) {
      case 'RevenueChart':
        widgetData = {
          data: dashboardData.sales?.revenueByPeriod || [],
          title: widgetProps.title || 'Revenue Overview',
          timeRange,
        };
        break;

      case 'ProfitMarginWidget':
        widgetData = {
          data: dashboardData.profitLoss || {},
        };
        break;

      case 'ConversionFunnelWidget':
        widgetData = {
          data: {
            leads: dashboardData.sales?.totalLeads || 0,
            qualified: dashboardData.sales?.qualifiedLeads || 0,
            won: dashboardData.sales?.dealsWon || 0,
          },
        };
        break;

      case 'EmailMarketingWidget':
        widgetData = {
          data: dashboardData.marketing || {},
        };
        break;

      case 'FormSubmissionsWidget':
        widgetData = {
          data: dashboardData.forms || {},
        };
        break;

      case 'MetricCard':
        const icon = METRIC_ICONS[widgetProps.title] || DollarSign;
        const value = getMetricValue(widgetProps.title);
        const trend = getMetricTrend(widgetProps.title);

        widgetData = {
          title: widgetProps.title,
          value,
          icon,
          color: widgetProps.color || 'blue',
          trend: trend.direction,
          trendValue: trend.value,
        };
        break;

      default:
        return null;
    }

    return <Component {...widgetData} {...widgetProps} />;
  };

  // Get metric value for MetricCard
  const getMetricValue = (title) => {
    const { sales, marketing, profitLoss, forms } = dashboardData;

    const metricMap = {
      'Total Revenue': sales?.totalRevenue ? `$${(sales.totalRevenue / 1000).toFixed(0)}k` : '$0',
      'Active Deals': sales?.activeDeals || 0,
      'New Leads': sales?.newLeads || 0,
      'Conversion Rate': sales?.conversionRate ? `${sales.conversionRate.toFixed(1)}%` : '0%',
      'Active Listings': sales?.activeListings || 0,
      'Scheduled Showings': sales?.scheduledShowings || 0,
      'Pending Closings': sales?.pendingClosings || 0,
      'Avg. Sale Price': sales?.avgSalePrice ? `$${(sales.avgSalePrice / 1000).toFixed(0)}k` : '$0',
      'Total Sales Volume': sales?.totalVolume ? `$${(sales.totalVolume / 1000000).toFixed(1)}M` : '$0',
      'Active Agents': sales?.activeAgents || 0,
      'Team Listings': sales?.teamListings || 0,
      'Avg. Commission': sales?.avgCommission ? `${sales.avgCommission.toFixed(1)}%` : '0%',
      'Annual Recurring Revenue': sales?.arr ? `$${(sales.arr / 1000000).toFixed(1)}M` : '$0',
      'Active Accounts': sales?.activeAccounts || 0,
      'Churn Rate': sales?.churnRate ? `${sales.churnRate.toFixed(1)}%` : '0%',
      'Customer LTV': sales?.customerLTV ? `$${(sales.customerLTV / 1000).toFixed(0)}k` : '$0',
      'Active Clients': sales?.activeClients || 0,
      'Running Campaigns': marketing?.activeCampaigns || 0,
      'Retainer Revenue': sales?.retainerRevenue ? `$${(sales.retainerRevenue / 1000).toFixed(0)}k` : '$0',
      'Client Retention': sales?.clientRetention ? `${sales.clientRetention.toFixed(1)}%` : '0%',
      'Total Subscribers': marketing?.totalSubscribers || 0,
      'Engagement Rate': marketing?.engagementRate ? `${marketing.engagementRate.toFixed(1)}%` : '0%',
      'Active Sponsorships': sales?.activeSponsorships || 0,
      'Avg. Deal Size': sales?.avgDealSize ? `$${(sales.avgDealSize / 1000).toFixed(0)}k` : '$0',
      'Total Orders': sales?.totalOrders || 0,
      'Average Order Value': sales?.aov ? `$${sales.aov.toFixed(0)}` : '$0',
      'Cart Abandonment': sales?.cartAbandonment ? `${sales.cartAbandonment.toFixed(1)}%` : '0%',
    };

    return metricMap[title] || '0';
  };

  // Get metric trend
  const getMetricTrend = (title) => {
    // TODO: Calculate actual trends from data
    return { direction: 'up', value: '+12.5%' };
  };

  const presetList = getPresetList();

  // Get current preset name
  const getCurrentPresetName = () => {
    if (currentPreset.startsWith('custom-')) {
      const customId = currentPreset.replace('custom-', '');
      const customPreset = customPresets.find(p => p.id === customId);
      return customPreset ? customPreset.name : `Custom #${customCount}`;
    }
    return DASHBOARD_PRESETS[currentPreset]?.name || 'Default';
  };

  const currentPresetName = getCurrentPresetName();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b1c14] mx-auto mb-4"></div>
          <p className="text-crm-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col crm-page-wrapper">
      {/* Page Header */}
      <div className="bg-white border-b border-crm-border px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">Dashboard</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              {currentPresetName} - {isEditMode ? 'Edit Mode' : 'View Mode'}
            </p>
          </div>

          <div className="crm-button-group">
            {/* Time Range Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="capitalize">{timeRange}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Time Range</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTimeRange('week')}>This Week</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('month')}>This Month</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('quarter')}>This Quarter</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('year')}>This Year</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Preset Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Presets</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Dashboard Presets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {presetList.map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    onClick={() => handlePresetChange(preset.id)}
                    className="flex flex-col items-start"
                  >
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-xs text-crm-text-secondary">{preset.description}</span>
                  </DropdownMenuItem>
                ))}
                {customPresets.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>My Custom Presets</DropdownMenuLabel>
                    {customPresets.map((preset) => (
                      <DropdownMenuItem
                        key={preset.id}
                        onClick={() => handlePresetChange(`custom-${preset.id}`)}
                        className="flex flex-col items-start"
                      >
                        <span className="font-medium">{preset.name}</span>
                        {preset.description && (
                          <span className="text-xs text-crm-text-secondary">{preset.description}</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-primary-blue">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generate Custom
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit/Save Toggle */}
            {isEditMode ? (
              <Button variant="accent" size="default" className="gap-2" onClick={handleSavePreset}>
                <Save className="h-4 w-4" />
                <span>Save Layout</span>
              </Button>
            ) : (
              <Button variant="outline" size="default" className="gap-2" onClick={() => setIsEditMode(true)}>
                <Settings className="h-4 w-4" />
                <span>Edit Layout</span>
              </Button>
            )}

            <Button variant="outline" size="default" className="gap-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-crm-bg-light">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
        >
          {layout.map((widget) => (
            <div key={widget.i} className="dashboard-widget">
              {isEditMode && (
                <div className="drag-handle absolute top-2 left-2 right-2 h-6 bg-gray-100 rounded cursor-move flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10">
                  <div className="text-xs text-gray-500">Drag to move</div>
                </div>
              )}
              {renderWidget(widget)}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Save Preset Modal */}
      <SavePresetModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveFromModal}
        currentPresetName={currentPresetName}
      />
    </div>
  );
}
