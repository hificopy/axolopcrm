import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import RGL from "react-grid-layout";
const { Responsive, WidthProvider } = RGL;
import {
  Settings,
  Download,
  Save,
  Sparkles,
  LayoutGrid,
  DollarSign,
  Users,
  TrendingUp,
  Percent,
  X,
  FileText,
  File,
  Lock,
  Unlock,
  ArrowLeftRight,
  ArrowUpDown,
  Calendar as CalendarIcon,
  Grid3X3,
  Info,
  MoreVertical,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { formatDateRange, getPeriodLabel } from "@/lib/utils";
import { useSupabase } from "../context/SupabaseContext";
import { useAgency } from "@/hooks/useAgency";
import ViewOnlyBadge from "@/components/ui/view-only-badge";
import SEO from "@/components/SEO";

// Dashboard widgets
import RevenueChart from "@/components/home/RevenueChart";
import ProfitMarginWidget from "@/components/home/ProfitMarginWidget";
import ConversionFunnelWidget from "@/components/home/ConversionFunnelWidget";
import EmailMarketingWidget from "@/components/home/EmailMarketingWidget";
import FormSubmissionsWidget from "@/components/home/FormSubmissionsWidget";
import MetricCard from "@/components/home/MetricCard";
import FullSalesWidget from "@/components/home/FullSalesWidget";
import FullMarketingWidget from "@/components/home/FullMarketingWidget";

// Services and configs
import homeDataService from "@/services/home-wrapper";
import homePresetService from "@/services/homePresetService";
import { HOME_PRESETS, getPreset, getPresetList } from "@/config/homePresets";
import SavePresetModal from "@/components/home/SavePresetModal";
import WidgetSelector from "@/components/home/WidgetSelector";

// CSS for react-grid-layout
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Check if Responsive is defined
if (!Responsive) {
  console.error("Responsive component from react-grid-layout is undefined!");
}

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget component mapping
const WIDGET_COMPONENTS = {
  RevenueChart,
  ProfitMarginWidget,
  ConversionFunnelWidget,
  EmailMarketingWidget,
  FormSubmissionsWidget,
  MetricCard,
  FullSalesWidget,
  FullMarketingWidget,
};

// Icon mapping for MetricCard
const METRIC_ICONS = {
  "Total Revenue": DollarSign,
  "Active Deals": TrendingUp,
  "New Leads": Users,
  "Conversion Rate": Percent,
  "Active Listings": LayoutGrid,
  "Scheduled Showings": Users,
  "Pending Closings": DollarSign,
  "Avg. Sale Price": DollarSign,
  "Total Sales Volume": DollarSign,
  "Active Agents": Users,
  "Team Listings": LayoutGrid,
  "Avg. Commission": DollarSign,
  "Annual Recurring Revenue": DollarSign,
  "Active Accounts": Users,
  "Churn Rate": Percent,
  "Customer LTV": DollarSign,
  "Active Clients": Users,
  "Running Campaigns": Sparkles,
  "Retainer Revenue": DollarSign,
  "Client Retention": Percent,
  "Total Subscribers": Users,
  "Engagement Rate": Percent,
  "Active Sponsorships": Sparkles,
  "Avg. Deal Size": DollarSign,
  "Total Orders": LayoutGrid,
  "Average Order Value": DollarSign,
  "Cart Abandonment": Percent,
};

// Helper function to fill empty space by expanding widgets
const fillEmptySpace = (layout, totalCols, lockedDimensions = {}) => {
  if (!layout || layout.length === 0) return layout;

  // ONLY fill horizontal space (width) - let vertical compacting handle height naturally
  // Group widgets by row (y position)
  const rows = {};
  layout.forEach((item) => {
    if (!rows[item.y]) rows[item.y] = [];
    rows[item.y].push(item);
  });

  // Expand widgets in each row to fill all columns
  Object.keys(rows).forEach((y) => {
    const rowWidgets = rows[y].sort((a, b) => a.x - b.x);
    const totalUsed = rowWidgets.reduce((sum, w) => sum + w.w, 0);

    // If row doesn't use full width, expand unlocked widgets
    if (totalUsed < totalCols) {
      const unlockedWidgets = rowWidgets.filter(
        (w) => !lockedDimensions[w.i]?.width,
      );
      if (unlockedWidgets.length > 0) {
        const extraSpace = totalCols - totalUsed;
        const spacePerWidget = extraSpace / unlockedWidgets.length;

        unlockedWidgets.forEach((widget) => {
          widget.w += Math.floor(spacePerWidget);
        });

        // Give remaining columns to last widget
        const newTotal = rowWidgets.reduce((sum, w) => sum + w.w, 0);
        if (newTotal < totalCols) {
          unlockedWidgets[unlockedWidgets.length - 1].w += totalCols - newTotal;
        }
      }
    }
  });

  return layout;
};

// Helper function to generate responsive layouts
const generateResponsiveLayouts = (baseLayout, lockedDimensions = {}) => {
  if (!baseLayout || baseLayout.length === 0) {
    return {};
  }

  // Large screens (12 columns) - use preset layouts as designed
  const lg = baseLayout.map((item) => {
    const locks = lockedDimensions[item.i] || { width: false, height: false };
    return {
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: item.minW || 2,
      minH: item.minH || 2,
      // Widget is fully static only if both dimensions are locked
      static: locks.width && locks.height,
    };
  });

  // Medium screens (12 columns) - same as large
  const md = lg.map((item) => ({ ...item }));

  // Small screens (6 columns) - full width, stacked vertically
  let smY = 0;
  const sm = baseLayout.map((item) => {
    const result = {
      i: item.i,
      x: 0,
      y: smY,
      w: 6, // Full width on small screens
      h: item.h,
      minW: 6,
      minH: item.minH || 2,
    };
    smY += item.h;
    return result;
  });

  // Extra small screens (2 columns) - full width stack
  let xsY = 0;
  const xs = baseLayout.map((item) => {
    const result = {
      i: item.i,
      x: 0,
      y: xsY,
      w: 2, // Full width on extra small screens
      h: item.h,
      minW: 2,
      minH: item.minH || 2,
    };
    xsY += item.h;
    return result;
  });

  return { lg, md, sm, xs };
};

export default function Home() {
  const { toast } = useToast();
  const { user, loading: userLoading, supabase } = useSupabase();
  const { isReadOnly, canEdit } = useAgency();
  const scrollContainerRef = useRef(null);
  const [currentPreset, setCurrentPreset] = useState("default");
  const [layout, setLayout] = useState([]);
  const [savedLayout, setSavedLayout] = useState([]); // Store layout before editing
  const [customCount, setCustomCount] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [homeData, setHomeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [customPresets, setCustomPresets] = useState([]);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  // Track locked dimensions separately: { widgetId: { width: boolean, height: boolean } }
  const [lockedDimensions, setLockedDimensions] = useState({});
  // Loading states for widget operations
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [widgetError, setWidgetError] = useState(null);

  // Helper function to get and format first name
  const getFormattedFirstName = () => {
    if (!user) return "";

    // Try to get first name from various user properties
    let firstName =
      user?.user_metadata?.first_name ||
      user?.user_metadata?.name?.split(" ")[0] ||
      user?.user_metadata?.full_name?.split(" ")[0] ||
      user?.name?.split(" ")[0] ||
      user?.email?.split("@")[0];

    if (!firstName) return "";

    // Format: First letter capitalized, rest lowercase
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  // Load dashboard data function
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [sales, marketing, profitLoss, forms] = await Promise.all([
        homeDataService.getSalesMetrics(timeRange),
        homeDataService.getMarketingMetrics(timeRange),
        homeDataService.getProfitLossData(timeRange),
        homeDataService.getFormSubmissions(timeRange),
      ]);

      setHomeData({
        sales,
        marketing,
        profitLoss,
        forms,
      });
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Load dashboard data on mount and when timeRange changes
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Initialize layout from preset
  useEffect(() => {
    if (currentPreset.startsWith("custom-")) {
      // Load custom preset from Supabase if user is logged in
      if (user) {
        const customPresetId = currentPreset.replace("custom-", "");
        homePresetService
          .getPreset(customPresetId)
          .then((preset) => {
            if (preset) {
              setLayout(preset.layout);
            } else {
              // Fallback to default if custom preset not found
              const defaultPreset = getPreset("default");
              setLayout(defaultPreset.widgets);
            }
          })
          .catch((error) => {
            console.error("Error loading custom home preset:", error);
            const defaultPreset = getPreset("default");
            setLayout(defaultPreset.widgets);
          });
      }
    } else {
      // Load default preset from config
      const preset = getPreset(currentPreset);
      if (preset && preset.widgets && preset.widgets.length > 0) {
        setLayout(preset.widgets);
      } else {
        // Fallback to default if preset is invalid
        const defaultPreset = getPreset("default");
        setLayout(defaultPreset.widgets);
      }
    }
  }, [currentPreset, user]);

  // Handle preset change - wrapped in useCallback to prevent flickering
  const handlePresetChange = useCallback(async (presetId) => {
    // If it's a custom preset (stored in Supabase), fetch its layout
    if (presetId.startsWith("custom-")) {
      const customPresetId = presetId.replace("custom-", "");
      try {
        const preset = await homePresetService.getPreset(customPresetId);
        if (preset) {
          setLayout(preset.layout);
        } else {
          // If preset not found, fallback to default
          const defaultPreset = getPreset("default");
          setLayout(defaultPreset.widgets);
        }
      } catch (error) {
        console.error("Error loading custom home preset:", error);
        const defaultPreset = getPreset("default");
        setLayout(defaultPreset.widgets);
      }
    } else {
      // It's a default preset, load from config
      const preset = getPreset(presetId);
      if (preset && preset.widgets && preset.widgets.length > 0) {
        setLayout(preset.widgets);
      } else {
        // Fallback to default if preset is invalid
        const defaultPreset = getPreset("default");
        setLayout(defaultPreset.widgets);
      }
    }

    setCurrentPreset(presetId);
    setIsEditMode(false);
    setSavedLayout([]); // Clear saved layout when changing presets
  }, []);

  // Handle entering edit mode
  const handleEnterEditMode = () => {
    // Prevent read-only users from entering edit mode
    if (isReadOnly()) {
      toast({
        title: "Access Restricted",
        description:
          "You have read-only access and cannot edit the home layout.",
        variant: "destructive",
      });
      return;
    }
    // Save current layout before entering edit mode
    setSavedLayout(JSON.parse(JSON.stringify(layout))); // Deep copy
    setIsEditMode(true);
  };

  // Handle exiting edit mode
  const handleExitEditMode = () => {
    // Restore saved layout if user didn't save
    if (savedLayout.length > 0) {
      setLayout(savedLayout);
      setSavedLayout([]);

      toast({
        title: "Changes Discarded",
        description: "Layout changes were not saved.",
      });
    }
    setIsEditMode(false);
  };

  // Handle layout change (drag/resize)
  const handleLayoutChange = (newLayout) => {
    if (isEditMode) {
      // Only update the layout if it's actually changed to prevent unnecessary re-renders
      setLayout((prevLayout) => {
        // Compare the new layout with the previous one
        if (JSON.stringify(prevLayout) !== JSON.stringify(newLayout)) {
          // Update preset to custom if it's not already
          if (!currentPreset.startsWith("custom-")) {
            const newCustomId = `custom-${customCount + 1}`;
            setCustomCount(customCount + 1);
            setCurrentPreset(newCustomId);
          }
          return newLayout;
        }
        return prevLayout; // No change, return previous layout
      });
    }
  };

  // Load custom presets
  useEffect(() => {
    if (user) {
      loadCustomPresets();
    } else {
      // If user is not logged in, clear custom presets
      setCustomPresets([]);
    }
  }, [user]);

  const loadCustomPresets = async () => {
    if (!user) {
      console.warn("No user logged in, cannot load custom presets");
      return;
    }

    try {
      const presets = await homePresetService.getUserPresets(user.id);
      setCustomPresets(presets);
    } catch (error) {
      console.error("Error loading custom home preset:", error);
      setCustomPresets([]);
    }
  };

  // Handle save preset
  const handleSavePreset = () => {
    setShowSaveModal(true);
  };

  // Handle save from modal
  const handleSaveFromModal = async (name, description) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save dashboard presets.",
        variant: "destructive",
      });
      return;
    }

    const basePreset = currentPreset.startsWith("custom-")
      ? HOME_PRESETS[currentPreset.split("-")[1]] || "default"
      : currentPreset;

    try {
      const savedPreset = await homePresetService.savePreset(
        user.id,
        name,
        description,
        layout,
        basePreset,
      );

      if (savedPreset) {
        setCurrentPreset(`custom-${savedPreset.id}`);
        await loadCustomPresets();
        setIsEditMode(false);
        setSavedLayout([]); // Clear saved layout since changes are persisted

        toast({
          title: "Layout Saved",
          description: `Dashboard preset "${name}" has been saved successfully.`,
        });
      }
    } catch (error) {
      console.error("Error saving preset:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save dashboard preset. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle adding a new widget
  const handleAddWidget = async (widget) => {
    if (isAddingWidget) return; // Prevent multiple simultaneous additions

    setIsAddingWidget(true);
    setWidgetError(null);

    try {
      // Validate widget data
      if (!widget || !widget.i || !widget.component) {
        throw new Error("Invalid widget data");
      }

      // Check if widget already exists
      setLayout((prevLayout) => {
        if (prevLayout.some((w) => w.i === widget.i)) {
          throw new Error("Widget already exists");
        }
        return prevLayout;
      });

      // Update preset to custom if it's not already
      let newPresetId = currentPreset;
      if (!currentPreset.startsWith("custom-")) {
        const newCustomId = `custom-${customCount + 1}`;
        setCustomCount((prev) => prev + 1);
        setCurrentPreset(newCustomId);
        newPresetId = newCustomId;
      }

      // Add widget to layout
      await new Promise((resolve) => {
        setLayout((prevLayout) => {
          const newLayout = [...prevLayout, widget];
          resolve(newLayout);
          return newLayout;
        });
      });

      // Show success toast
      toast({
        title: "Widget Added",
        description: "Widget has been successfully added to your dashboard.",
      });
    } catch (error) {
      console.error("Error adding widget:", error);
      setWidgetError(error.message);

      toast({
        title: "Failed to Add Widget",
        description:
          error.message || "An error occurred while adding the widget.",
        variant: "destructive",
      });
    } finally {
      setIsAddingWidget(false);
    }
  };

  // Handle removing a widget
  const handleRemoveWidget = async (widgetId) => {
    try {
      // Validate widget ID
      if (!widgetId) {
        throw new Error("Invalid widget ID");
      }

      // Remove widget from layout
      await new Promise((resolve) => {
        setLayout((prevLayout) => {
          const newLayout = prevLayout.filter((w) => w.i !== widgetId);

          // Update preset to custom if it's not already
          let newPresetId = currentPreset;
          if (!currentPreset.startsWith("custom-")) {
            const newCustomId = `custom-${customCount + 1}`;
            setCustomCount((prev) => prev + 1);
            setCurrentPreset(newCustomId);
            newPresetId = newCustomId;
          }

          resolve(newLayout);
          return newLayout;
        });
      });

      // Also remove from locked dimensions if it was locked
      setLockedDimensions((prev) => {
        const newDimensions = { ...prev };
        delete newDimensions[widgetId];
        return newDimensions;
      });

      // Show success toast
      toast({
        title: "Widget Removed",
        description:
          "Widget has been successfully removed from your dashboard.",
      });
    } catch (error) {
      console.error("Error removing widget:", error);

      toast({
        title: "Failed to Remove Widget",
        description:
          error.message || "An error occurred while removing the widget.",
        variant: "destructive",
      });
    }
  };

  // Handle toggling widget dimension lock (width or height)
  const handleToggleDimensionLock = (widgetId, dimension) => {
    setLockedDimensions((prev) => {
      const current = prev[widgetId] || { width: false, height: false };
      return {
        ...prev,
        [widgetId]: {
          ...current,
          [dimension]: !current[dimension],
        },
      };
    });
  };

  // Generate export content (shared between HTML and PDF)
  const generateExportContent = (forPDF = false) => {
    const exportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const dateRangeDisplay = formatDateRange(timeRange);
    const periodLabel = getPeriodLabel(timeRange);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Export - ${exportDate}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: ${forPDF ? "white" : "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)"};
      padding: ${forPDF ? "1.5rem" : "2rem"};
      color: #1a1a1a;
      ${forPDF ? "max-width: 210mm; margin: 0 auto;" : ""}
    }
    .header {
      background: white;
      border-radius: ${forPDF ? "8px" : "16px"};
      padding: ${forPDF ? "1.5rem" : "2rem"};
      margin-bottom: ${forPDF ? "1.5rem" : "2rem"};
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border-left: 4px solid #761B14;
      ${forPDF ? "page-break-inside: avoid;" : ""}
    }
    .header h1 {
      font-size: ${forPDF ? "1.75rem" : "2rem"};
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 0.5rem;
    }
    .header .subtitle {
      color: #666;
      font-size: 0.875rem;
    }
    .header .meta {
      display: flex;
      gap: ${forPDF ? "1.5rem" : "2rem"};
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e5e5;
      flex-wrap: wrap;
    }
    .header .meta-item {
      display: flex;
      flex-direction: column;
    }
    .header .meta-label {
      font-size: 0.75rem;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .header .meta-value {
      font-size: 1rem;
      font-weight: 600;
      color: #761B14;
      margin-top: 0.25rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(${forPDF ? "2" : "auto-fit"}, minmax(${forPDF ? "45%" : "250px"}, 1fr));
      gap: ${forPDF ? "1rem" : "1.5rem"};
      margin-bottom: ${forPDF ? "1.5rem" : "2rem"};
      ${forPDF ? "page-break-inside: avoid;" : ""}
    }
    .stat-card {
      background: white;
      border-radius: ${forPDF ? "8px" : "12px"};
      padding: ${forPDF ? "1.25rem" : "1.5rem"};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      ${forPDF ? "page-break-inside: avoid;" : "transition: transform 0.2s;"}
    }
    ${
      !forPDF
        ? `.stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }`
        : ""
    }
    .stat-label {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .stat-value {
      font-size: ${forPDF ? "1.75rem" : "2rem"};
      font-weight: 700;
      margin-top: 0.5rem;
      color: #1a1a1a;
    }
    .stat-change {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background: #d1fae5;
      color: #065f46;
      font-weight: 600;
    }
    .data-section {
      background: white;
      border-radius: ${forPDF ? "8px" : "12px"};
      padding: ${forPDF ? "1.5rem" : "2rem"};
      margin-top: ${forPDF ? "1.5rem" : "2rem"};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      ${forPDF ? "page-break-inside: avoid;" : ""}
    }
    .data-section h2 {
      font-size: ${forPDF ? "1.125rem" : "1.25rem"};
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #1a1a1a;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #761B14;
    }
    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${forPDF ? "180px" : "200px"}, 1fr));
      gap: 1rem;
    }
    .data-item {
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 3px solid #761B14;
      ${forPDF ? "page-break-inside: avoid;" : ""}
    }
    .data-item-label {
      font-size: 0.75rem;
      color: #666;
      margin-bottom: 0.25rem;
    }
    .data-item-value {
      font-size: ${forPDF ? "1rem" : "1.125rem"};
      font-weight: 600;
      color: #1a1a1a;
    }
    .footer {
      text-align: center;
      padding: ${forPDF ? "1.5rem" : "2rem"};
      color: #999;
      font-size: 0.875rem;
      margin-top: ${forPDF ? "2rem" : "3rem"};
      ${forPDF ? "page-break-inside: avoid;" : ""}
    }
    @media print {
      body {
        background: white !important;
        padding: 0 !important;
      }
      .stat-card:hover { transform: none; }
      .header, .stats-grid, .data-section {
        page-break-inside: avoid;
      }
    }
    @page {
      margin: 1.5cm;
      size: A4;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Dashboard Report</h1>
    <p class="subtitle">Business Analytics & Performance Metrics</p>
    <div class="meta">
      <div class="meta-item">
        <span class="meta-label">Export Date</span>
        <span class="meta-value">${exportDate}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Reporting Period</span>
        <span class="meta-value">${periodLabel}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Date Range</span>
        <span class="meta-value">${dateRangeDisplay}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Dashboard Preset</span>
        <span class="meta-value">${currentPresetName}</span>
      </div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Total Revenue</div>
      <div class="stat-value">$${((homeData.sales?.totalRevenue || 0) / 1000).toFixed(1)}k</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Active Deals</div>
      <div class="stat-value">${homeData.sales?.activeDeals || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">New Leads</div>
      <div class="stat-value">${homeData.sales?.newLeads || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Conversion Rate</div>
      <div class="stat-value">${(homeData.sales?.conversionRate || 0).toFixed(1)}%</div>
    </div>
  </div>

  <div class="data-section">
    <h2>📧 Marketing Metrics</h2>
    <div class="data-grid">
      <div class="data-item">
        <div class="data-item-label">Active Campaigns</div>
        <div class="data-item-value">${homeData.marketing?.activeCampaigns || 0}</div>
      </div>
      <div class="data-item">
        <div class="data-item-label">Email Opens</div>
        <div class="data-item-value">${homeData.marketing?.emailOpens || 0}</div>
      </div>
      <div class="data-item">
        <div class="data-item-label">Click Rate</div>
        <div class="data-item-value">${(homeData.marketing?.clickRate || 0).toFixed(1)}%</div>
      </div>
      <div class="data-item">
        <div class="data-item-label">Total Subscribers</div>
        <div class="data-item-value">${homeData.marketing?.totalSubscribers || 0}</div>
      </div>
    </div>
  </div>

  <div class="data-section">
    <h2>💰 Sales Performance</h2>
    <div class="data-grid">
      <div class="data-item">
        <div class="data-item-label">Average Deal Size</div>
        <div class="data-item-value">$${((homeData.sales?.avgDealSize || 0) / 1000).toFixed(1)}k</div>
      </div>
      <div class="data-item">
        <div class="data-item-label">Pipeline Value</div>
        <div class="data-item-value">$${((homeData.sales?.pipelineValue || 0) / 1000).toFixed(1)}k</div>
      </div>
      <div class="data-item">
        <div class="data-item-label">Win Rate</div>
        <div class="data-item-value">${(homeData.sales?.winRate || 0).toFixed(1)}%</div>
      </div>
      <div class="data-item">
        <div class="data-item-label">Avg Sales Cycle</div>
        <div class="data-item-value">${homeData.sales?.avgSalesCycle || "0 days"}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>🤖 Generated with Axolop | ${exportDate}</p>
    <p style="margin-top: 0.5rem; font-size: 0.75rem;">This report contains confidential business data. Handle with care.</p>
  </div>
</body>
</html>`;
  };

  // Handle export dashboard as HTML
  const handleExportHTML = () => {
    try {
      const htmlContent = generateExportContent(false);
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard-report-${new Date().toISOString().split("T")[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Home Exported as HTML",
        description: "Your beautiful dashboard report has been downloaded!",
      });
    } catch (error) {
      console.error("Error exporting home:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export home. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle export dashboard as PDF
  const handleExportPDF = async () => {
    let tempContainer = null;

    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we create your beautiful home report.",
      });

      const htmlContent = generateExportContent();

      // Parse HTML content and extract body innerHTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      const bodyContent = doc.body.innerHTML;
      const styles = doc.querySelector("style")?.innerHTML || "";

      // Create a temporary container completely hidden from view
      tempContainer = document.createElement("div");
      tempContainer.style.cssText = `
        position: fixed;
        top: -10000px;
        left: -10000px;
        width: 210mm;
        visibility: hidden;
        pointer-events: none;
        z-index: -9999;
      `;

      // Add styles and content
      tempContainer.innerHTML = `
        <style>${styles}</style>
        <div class="pdf-content">${bodyContent}</div>
      `;

      document.body.appendChild(tempContainer);

      // Wait for any fonts/styles to load
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the content element
      const contentElement = tempContainer.querySelector(".pdf-content");

      // Configure PDF options for download (not preview)
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `dashboard-report-${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 794, // A4 width in pixels at 96 DPI
          width: 794,
          scrollY: 0,
          scrollX: 0,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: true,
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        enableLinks: false,
      };

      // Generate and automatically download PDF (no preview)
      await html2pdf().set(opt).from(contentElement).save();

      // Clean up - ensure removal even if save succeeds
      if (tempContainer && tempContainer.parentNode) {
        document.body.removeChild(tempContainer);
        tempContainer = null;
      }

      toast({
        title: "Home Exported as PDF",
        description: "Your beautiful dashboard report has been downloaded!",
      });
    } catch (error) {
      console.error("Error exporting home:", error);

      // Clean up on error
      if (tempContainer && tempContainer.parentNode) {
        document.body.removeChild(tempContainer);
      }

      toast({
        title: "Export Failed",
        description:
          error.message || "Failed to export dashboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Memoized widget rendering to prevent unnecessary re-renders
  const renderWidget = useCallback(
    (widget) => {
      const Component = WIDGET_COMPONENTS[widget.component];
      if (!Component) {
        console.error(
          `Widget component "${widget.component}" not found in WIDGET_COMPONENTS`,
        );
        return null;
      }

      // Prepare widget data based on component type
      let widgetData = {};
      let widgetProps = widget.props || {};

      switch (widget.component) {
        case "RevenueChart":
          widgetData = {
            data: homeData.sales?.revenueByPeriod || [],
            title: widgetProps.title || "Revenue Overview",
            timeRange,
          };
          break;

        case "ProfitMarginWidget":
          widgetData = {
            data: homeData.profitLoss || {},
          };
          break;

        case "ConversionFunnelWidget":
          widgetData = {
            data: {
              leads: homeData.sales?.totalLeads || 0,
              qualified: homeData.sales?.qualifiedLeads || 0,
              won: homeData.sales?.dealsWon || 0,
            },
          };
          break;

        case "EmailMarketingWidget":
          widgetData = {
            data: {
              sent: homeData.marketing?.emailsSent || 0,
              delivered:
                homeData.marketing?.emailsDelivered ||
                homeData.marketing?.emailsSent ||
                0,
              opened: homeData.marketing?.emailOpens || 0,
              clicked: homeData.marketing?.emailClicks || 0,
              openRate: homeData.marketing?.openRate || 0,
              clickRate: homeData.marketing?.clickRate || 0,
            },
          };
          break;

        case "FormSubmissionsWidget":
          widgetData = {
            data: homeData.forms || {},
          };
          break;

        case "MetricCard": {
          const icon = METRIC_ICONS[widgetProps.title] || DollarSign;
          const value = getMetricValue(widgetProps.title);
          const trend = getMetricTrend(widgetProps.title);

          widgetData = {
            title: widgetProps.title,
            value,
            icon,
            color: widgetProps.color || "blue",
            trend: trend.direction,
            trendValue: trend.value,
            subtitle: widgetProps.subtitle,
            additionalInfo: widgetProps.additionalInfo,
          };
          break;
        }

        case "FullSalesWidget":
          widgetData = {
            data: {
              totalRevenue: homeData.sales?.totalRevenue || 0,
              activeDeals: homeData.sales?.activeDeals || 0,
              newLeads: homeData.sales?.newLeads || 0,
              conversionRate: homeData.sales?.conversionRate || 0,
              avgDealSize: homeData.sales?.avgDealSize || 0,
              winRate: homeData.sales?.winRate || 0,
              avgSalesCycle: homeData.sales?.avgSalesCycle || "0 days",
              pipelineValue: homeData.sales?.pipelineValue || 0,
            },
            timeRange,
          };
          break;

        case "FullMarketingWidget":
          widgetData = {
            data: {
              activeCampaigns: homeData.marketing?.activeCampaigns || 0,
              emailOpens: homeData.marketing?.emailOpens || 0,
              clickRate: homeData.marketing?.clickRate || 0,
              totalSubscribers: homeData.marketing?.totalSubscribers || 0,
              engagementRate: homeData.marketing?.engagementRate || 0,
              unsubscribeRate: homeData.marketing?.unsubscribeRate || 0,
              avgOpenRate: homeData.marketing?.avgOpenRate || 0,
              newSubscribers: homeData.marketing?.newSubscribers || 0,
            },
            timeRange,
          };
          break;

        default:
          return null;
      }

      return <Component {...widgetData} {...widgetProps} />;
    },
    [homeData, timeRange, getMetricValue, getMetricTrend],
  ); // Add dependencies that affect widget rendering

  // Memoize responsive layouts to prevent unnecessary recalculations
  const responsiveLayouts = useMemo(() => {
    return generateResponsiveLayouts(layout, lockedDimensions);
  }, [layout, lockedDimensions]);

  // Memoize preset list to prevent unnecessary recalculations
  const memoizedPresetList = useMemo(() => {
    return getPresetList();
  }, []);

  // Memoize formatted first name to prevent unnecessary recalculations
  const formattedFirstName = useMemo(() => {
    return getFormattedFirstName();
  }, [user]);

  // Get metric value for MetricCard
  const getMetricValue = (title) => {
    const { sales, marketing, profitLoss, forms } = homeData;

    const metricMap = {
      "Total Revenue": sales?.totalRevenue
        ? `$${(sales.totalRevenue / 1000).toFixed(0)}k`
        : "$0",
      "Active Deals": sales?.activeDeals || 0,
      "New Leads": sales?.newLeads || 0,
      "Conversion Rate": sales?.conversionRate
        ? `${sales.conversionRate.toFixed(1)}%`
        : "0%",
      "Active Listings": sales?.activeListings || 0,
      "Scheduled Showings": sales?.scheduledShowings || 0,
      "Pending Closings": sales?.pendingClosings || 0,
      "Avg. Sale Price": sales?.avgSalePrice
        ? `$${(sales.avgSalePrice / 1000).toFixed(0)}k`
        : "$0",
      "Total Sales Volume": sales?.totalVolume
        ? `$${(sales.totalVolume / 1000000).toFixed(1)}M`
        : "$0",
      "Active Agents": sales?.activeAgents || 0,
      "Team Listings": sales?.teamListings || 0,
      "Avg. Commission": sales?.avgCommission
        ? `${sales.avgCommission.toFixed(1)}%`
        : "0%",
      "Annual Recurring Revenue": sales?.arr
        ? `$${(sales.arr / 1000000).toFixed(1)}M`
        : "$0",
      "Active Accounts": sales?.activeAccounts || 0,
      "Churn Rate": sales?.churnRate ? `${sales.churnRate.toFixed(1)}%` : "0%",
      "Customer LTV": sales?.customerLTV
        ? `$${(sales.customerLTV / 1000).toFixed(0)}k`
        : "$0",
      "Active Clients": sales?.activeClients || 0,
      "Running Campaigns": marketing?.activeCampaigns || 0,
      "Retainer Revenue": sales?.retainerRevenue
        ? `$${(sales.retainerRevenue / 1000).toFixed(0)}k`
        : "$0",
      "Client Retention": sales?.clientRetention
        ? `${sales.clientRetention.toFixed(1)}%`
        : "0%",
      "Total Subscribers": marketing?.totalSubscribers || 0,
      "Engagement Rate": marketing?.engagementRate
        ? `${marketing.engagementRate.toFixed(1)}%`
        : "0%",
      "Active Sponsorships": sales?.activeSponsorships || 0,
      "Avg. Deal Size": sales?.avgDealSize
        ? `$${(sales.avgDealSize / 1000).toFixed(0)}k`
        : "$0",
      "Total Orders": sales?.totalOrders || 0,
      "Average Order Value": sales?.aov ? `$${sales.aov.toFixed(0)}` : "$0",
      "Cart Abandonment": sales?.cartAbandonment
        ? `${sales.cartAbandonment.toFixed(1)}%`
        : "0%",
    };

    return metricMap[title] || "0";
  };

  // Get metric trend
  const getMetricTrend = (title) => {
    const trend = homeData.sales?.trend;
    if (!trend || typeof trend !== "object") {
      return { direction: "neutral", value: "0%" };
    }

    const sign =
      trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : "";
    return {
      direction: trend.direction || "neutral",
      value: trend.percentage ? `${sign}${trend.percentage}%` : "0%",
    };
  };

  const presetList = memoizedPresetList;

  // Get current preset name
  const getCurrentPresetName = () => {
    if (currentPreset.startsWith("custom-")) {
      const customId = currentPreset.replace("custom-", "");
      const customPreset = customPresets.find((p) => p.id === customId);
      return customPreset ? customPreset.name : `Custom Layout`;
    }
    return HOME_PRESETS[currentPreset]?.name || "Default";
  };

  const currentPresetName = getCurrentPresetName();

  // Stable time range change handlers to prevent flickering
  const handleTimeRangeChange = useCallback((newTimeRange) => {
    // Reset scroll position when changing time ranges to prevent bricking
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setTimeRange(newTimeRange);
  }, []);

  if (loading || userLoading) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center pt-[150px] bg-white">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#761B14] mx-auto mb-6"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="rounded-full h-16 w-16 border-4 border-[#761B14]/20 mx-auto"></div>
            </div>
          </div>
          <p className="text-gray-700 font-medium text-lg">
            Loading your home...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Preparing your business insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col crm-page-wrapper bg-white">
      {/* Page Header */}
      <div className="relative bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="relative flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Hey there
                  {formattedFirstName && `, ${formattedFirstName}`}!
                </h1>
                {isReadOnly() && <ViewOnlyBadge />}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#761B14]/10 to-[#3D1515]/10 border border-[#761B14]/30">
                  <div className="w-2 h-2 rounded-full bg-[#761B14] animate-pulse" />
                  <span className="text-xs font-bold text-[#761B14] uppercase tracking-wider">
                    {getPeriodLabel(timeRange)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200">
                  <Settings className="h-3.5 w-3.5 text-gray-600" />
                  <span className="text-gray-700 font-medium">
                    {currentPresetName}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-blue-700 font-semibold">
                    {formatDateRange(timeRange)}
                  </span>
                </div>
                {isEditMode && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-amber-700 font-medium">
                      Edit Mode
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 3-Dot Dropdown Menu */}
            <div className="absolute top-6 right-4 sm:top-6 sm:right-6">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Time Range Section */}
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time Range
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handleTimeRangeChange("week")}
                    className={timeRange === "week" ? "bg-[#761B14]/10" : ""}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    This Week
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleTimeRangeChange("month")}
                    className={timeRange === "month" ? "bg-[#761B14]/10" : ""}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    This Month
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleTimeRangeChange("quarter")}
                    className={timeRange === "quarter" ? "bg-[#761B14]/10" : ""}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    This Quarter
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleTimeRangeChange("year")}
                    className={timeRange === "year" ? "bg-[#761B14]/10" : ""}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    This Year
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Dashboard Presets Section */}
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dashboard Presets
                  </DropdownMenuLabel>
                  {presetList.map((preset) => (
                    <DropdownMenuItem
                      key={preset.id}
                      onClick={() => handlePresetChange(preset.id)}
                      className={`flex flex-col items-start py-2 ${currentPreset === preset.id ? "bg-[#761B14]/10" : ""}`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <LayoutGrid className="h-3.5 w-3.5 text-[#761B14]" />
                        <span className="font-medium text-sm">
                          {preset.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600 ml-6">
                        {preset.description}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  {customPresets.length > 0 && (
                    <>
                      <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
                        My Custom Presets
                      </DropdownMenuLabel>
                      {customPresets.map((preset) => (
                        <DropdownMenuItem
                          key={preset.id}
                          onClick={() =>
                            handlePresetChange(`custom-${preset.id}`)
                          }
                          className={`flex flex-col items-start py-2 ${currentPreset === `custom-${preset.id}` ? "bg-[#761B14]/10" : ""}`}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Users className="h-3.5 w-3.5 text-[#761B14]" />
                            <span className="font-medium text-sm">
                              {preset.name}
                            </span>
                          </div>
                          {preset.description && (
                            <span className="text-xs text-gray-600 ml-6">
                              {preset.description}
                            </span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}

                  <DropdownMenuSeparator />

                  {/* Layout Actions Section */}
                  {canEdit() && (
                    <>
                      <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Layout
                      </DropdownMenuLabel>
                      {isEditMode ? (
                        <>
                          <DropdownMenuItem
                            onClick={() => setShowWidgetSelector(true)}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Add Widget
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleSavePreset}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Layout
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleExitEditMode}>
                            <X className="h-4 w-4 mr-2" />
                            Exit Edit Mode
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem onClick={handleEnterEditMode}>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Layout
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Export Section */}
                  <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Export
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleExportHTML}>
                    <FileText className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Export as HTML</span>
                      <span className="text-xs text-gray-600">
                        Interactive web document
                      </span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <File className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>Export as PDF</span>
                      <span className="text-xs text-gray-600">
                        Print-ready document
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Mode Banner */}
      {isEditMode && (
        <div className="bg-[#761B14] text-white px-4 py-3 text-sm flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 animate-pulse" />
            <span className="font-semibold text-base">✏️ Edit Mode Active</span>
            <span className="hidden sm:inline text-white/90">
              • Drag widgets to rearrange • Click X to remove
            </span>
          </div>
          <button
            onClick={handleExitEditMode}
            className="hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200 font-semibold"
          >
            Exit
          </button>
        </div>
      )}

      {/* Dashboard Grid */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50"
        style={{ height: "calc(100vh - 200px)" }}
      >
        <div className="p-2 sm:p-4 md:p-6 max-w-full min-h-full">
          {layout.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-sm">
              <LayoutGrid className="h-20 w-20 text-[#761B14]/30 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Home Widgets Yet
              </h3>
              <p className="text-base text-gray-600 mb-6 max-w-md">
                Start customizing your dashboard by adding widgets tailored to
                your business needs
              </p>
              <Button
                variant="accent"
                onClick={handleEnterEditMode}
                className="px-8 py-3 text-base font-semibold shadow-lg"
              >
                <Settings className="h-5 w-5 mr-2" />
                Start Editing
              </Button>
            </div>
          ) : (
            <ResponsiveGridLayout
              key={`layout-${currentPreset}-${timeRange}`}
              className="layout"
              layouts={responsiveLayouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
              cols={{ lg: 12, md: 12, sm: 6, xs: 2 }}
              rowHeight={100}
              isDraggable={isEditMode}
              isResizable={isEditMode}
              onLayoutChange={useCallback(
                (currentLayout, allLayouts) => {
                  // Only update if user is actively dragging/resizing in edit mode
                  if (
                    isEditMode &&
                    allLayouts &&
                    allLayouts.lg &&
                    !isAddingWidget
                  ) {
                    // Debounce layout updates to prevent excessive re-renders
                    const timeoutId = setTimeout(() => {
                      setLayout((prevLayout) => {
                        const newLayout = prevLayout.map((widget) => {
                          const updated = allLayouts.lg.find(
                            (l) => l.i === widget.i,
                          );
                          if (
                            updated &&
                            (widget.x !== updated.x ||
                              widget.y !== updated.y ||
                              widget.w !== updated.w ||
                              widget.h !== updated.h)
                          ) {
                            return {
                              ...widget,
                              x: updated.x,
                              y: updated.y,
                              w: updated.w,
                              h: updated.h,
                            };
                          }
                          return widget;
                        });

                        // Only update if layout actually changed
                        if (
                          JSON.stringify(prevLayout) !==
                          JSON.stringify(newLayout)
                        ) {
                          // Update preset to custom if it's not already
                          if (!currentPreset.startsWith("custom-")) {
                            const newCustomId = `custom-${customCount + 1}`;
                            setCustomCount((prev) => prev + 1);
                            setCurrentPreset(newCustomId);
                          }
                        }

                        return newLayout;
                      });
                    }, 300); // 300ms debounce

                    return () => clearTimeout(timeoutId);
                  }
                },
                [isEditMode, isAddingWidget, currentPreset, customCount],
              )}
              draggableHandle=".drag-handle"
              compactType="vertical"
              preventCollision={false}
              margin={[8, 8]}
              containerPadding={[0, 0]}
              useCSSTransforms={true}
              transformScale={1}
              isBounded={true}
              allowOverlap={false}
            >
              {layout.map((widget, index) => (
                <div
                  key={widget.i}
                  className={`dashboard-widget bg-white rounded-xl transition-all duration-300 border border-gray-100 ${
                    isEditMode
                      ? "hover:shadow-2xl hover:scale-[1.02] ring-2 ring-[#761B14]/20 hover:ring-[#761B14]/40"
                      : "shadow-md hover:shadow-xl hover:border-[#761B14]/20"
                  }`}
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                  }}
                >
                  {isEditMode && (
                    <div className="drag-handle absolute -top-1 left-0 right-0 h-8 bg-[#761B14] rounded-t-xl cursor-move flex items-center justify-between px-3 z-20 shadow-lg hover:bg-[#6b1a12] transition-all duration-300">
                      <div className="text-xs text-white font-semibold flex items-center gap-1.5">
                        <LayoutGrid className="h-3 w-3" />
                        <span className="hidden sm:inline">⋮⋮ Drag</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {/* Width Lock Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDimensionLock(widget.i, "width");
                          }}
                          className={`text-white transition-all duration-200 p-1 rounded text-xs ${
                            lockedDimensions[widget.i]?.width
                              ? "bg-white/30 hover:bg-white/40"
                              : "hover:bg-white/20"
                          }`}
                          aria-label={
                            lockedDimensions[widget.i]?.width
                              ? "Unlock width"
                              : "Lock width"
                          }
                          title={
                            lockedDimensions[widget.i]?.width
                              ? "Unlock width"
                              : "Lock width"
                          }
                        >
                          <ArrowLeftRight className="h-3.5 w-3.5" />
                        </button>
                        {/* Height Lock Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDimensionLock(widget.i, "height");
                          }}
                          className={`text-white transition-all duration-200 p-1 rounded hover:bg-white/20 ml-0.5`}
                          aria-label={
                            lockedDimensions[widget.i]?.height
                              ? "Unlock height"
                              : "Lock height"
                          }
                          title={
                            lockedDimensions[widget.i]?.height
                              ? "Unlock height"
                              : "Lock height"
                          }
                        >
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveWidget(widget.i);
                          }}
                          className="text-white hover:text-[#3D1515] transition-all duration-200 p-1 rounded hover:bg-white/20 ml-0.5"
                          aria-label="Remove widget"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div
                    className={isEditMode ? "pt-8 px-3 pb-3" : "p-4"}
                    style={{
                      height: "100%",
                      width: "100%",
                      overflow: "auto",
                      boxSizing: "border-box",
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                  >
                    {renderWidget(widget)}
                  </div>
                </div>
              ))}
            </ResponsiveGridLayout>
          )}
        </div>
      </div>

      {/* Save Preset Modal */}
      <SavePresetModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveFromModal}
        currentPresetName={currentPresetName}
      />

      {/* Widget Selector Sidebar */}
      <WidgetSelector
        isOpen={showWidgetSelector}
        onClose={() => setShowWidgetSelector(false)}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
}
