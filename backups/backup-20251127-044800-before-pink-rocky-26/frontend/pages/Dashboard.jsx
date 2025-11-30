import { useState, useEffect, useCallback, useMemo } from "react";
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
  ArrowLeftRight,
  ArrowUpDown,
  MoreVertical,
  Calendar,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useToast } from "../components/ui/use-toast";
import { formatDateRange, getPeriodLabel } from "../lib/utils";
import { useSupabase } from "../context/SupabaseContext";
import { useAgency } from "../hooks/useAgency";
import { useDemoMode } from "../contexts/DemoModeContext";
import ViewOnlyBadge from "../components/ui/view-only-badge";
import { FullPageSkeleton } from "../components/ui/skeletons";

// Dashboard widgets
import RevenueChart from "../components/dashboard/RevenueChart";
import ProfitMarginWidget from "../components/dashboard/ProfitMarginWidget";
import ConversionFunnelWidget from "../components/dashboard/ConversionFunnelWidget";
import EmailMarketingWidget from "../components/dashboard/EmailMarketingWidget";
import FormSubmissionsWidget from "../components/dashboard/FormSubmissionsWidget";
import MetricCard from "../components/dashboard/MetricCard";
import FullSalesWidget from "../components/dashboard/FullSalesWidget";
import FullMarketingWidget from "../components/dashboard/FullMarketingWidget";

// Services and configs
import enhancedDashboardDataService from "@/services/enhanced-dashboard-data-service";
import dashboardPresetService from "@/services/dashboardPresetService";
import {
  DASHBOARD_PRESETS,
  getPreset,
  getPresetList,
} from "@/config/dashboardPresets";
import SavePresetModal from "@/components/dashboard/SavePresetModal";
import WidgetSelector from "@/components/dashboard/WidgetSelector";

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
  // Sales & Revenue
  "Total Revenue": DollarSign,
  MRR: TrendingUp,
  "Avg. Deal Size": DollarSign,
  "Win Rate": TrendingUp,
  "Sales Velocity": TrendingUp,
  "Pipeline Value": TrendingUp,
  "Active Deals": TrendingUp,

  // Lead Management
  "New Leads": Users,
  "Active Leads": Users,
  "Top Lead Source": LayoutGrid,
  "Qualification Rate": Percent,
  "Hot Leads": Users,
  "Conversion Rate": Percent,

  // Marketing
  "Active Campaigns": Sparkles,
  "Open Rate": Percent,
  CTR: Percent,
  "Form Conv. Rate": Percent,
  "Total Subscribers": Users,
  "Engagement Rate": Percent,

  // Tasks & Productivity
  "Due Today": LayoutGrid,
  Overdue: LayoutGrid,
  Completed: LayoutGrid,
  Activity: LayoutGrid,
  "Team Score": Users,

  // Calendar & Meetings
  Upcoming: LayoutGrid,
  "This Week": LayoutGrid,
  "No-Show Rate": Percent,
  "Calls Today": LayoutGrid,

  // Financial
  "Net Profit": DollarSign,
  "Active Clients": Users,
  "Customer LTV": DollarSign,
  "Active Accounts": Users,

  // Legacy mappings
  "Active Listings": LayoutGrid,
  "Scheduled Showings": Users,
  "Pending Closings": DollarSign,
  "Avg. Sale Price": DollarSign,
  "Total Sales Volume": DollarSign,
  "Active Agents": Users,
  "Team Listings": LayoutGrid,
  "Avg. Commission": DollarSign,
  "Annual Recurring Revenue": DollarSign,
  "Churn Rate": Percent,
  "Running Campaigns": Sparkles,
  "Retainer Revenue": DollarSign,
  "Client Retention": Percent,
  "Active Sponsorships": Sparkles,
  "Total Orders": LayoutGrid,
  "Average Order Value": DollarSign,
  "Cart Abandonment": Percent,
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

  // Small screens (6 columns) - ALWAYS full width to prevent white space
  let smY = 0;
  const sm = baseLayout.map((item) => {
    const result = {
      i: item.i,
      x: 0,
      y: smY,
      w: 6, // Always full width on small screens
      h: item.h,
      minW: 6, // Force full width
      minH: item.minH || 2,
    };
    smY += item.h;
    return result;
  });

  // Extra small screens (2 columns) - ALWAYS full width stack
  let xsY = 0;
  const xs = baseLayout.map((item) => {
    const result = {
      i: item.i,
      x: 0,
      y: xsY,
      w: 2, // Always full width on xs screens
      h: item.h,
      minW: 2, // Force full width
      minH: item.minH || 2,
    };
    xsY += item.h;
    return result;
  });

  return { lg, md, sm, xs };
};

export default function Dashboard() {
  const { toast } = useToast();
  const { user, loading: userLoading } = useSupabase();
  const { isReadOnly, canEdit } = useAgency();
  const { isDemoMode } = useDemoMode();
  const [currentPreset, setCurrentPreset] = useState("default");
  const [layout, setLayout] = useState([]);
  const [savedLayout, setSavedLayout] = useState([]); // Store layout before editing
  const [customCount, setCustomCount] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [timeRange, setTimeRange] = useState("month");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [customPresets, setCustomPresets] = useState([]);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  // Track locked dimensions separately: { widgetId: { width: boolean, height: boolean } }
  const [lockedDimensions, setLockedDimensions] = useState({});

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

  // Load dashboard data function with optimization
  const loadDashboardData = useCallback(async () => {
    if (!user && !isDemoMode) {
      console.warn("No user logged in, skipping dashboard data load");
      return;
    }

    setLoading(true);
    setDataError(null);

    try {
      const allMetrics = await enhancedDashboardDataService.getAllMetrics(
        timeRange,
        "all",
      );
      setDashboardData(allMetrics);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error("Error loading dashboard data:", error);

      // Provide specific error messages based on error type
      let errorMessage = "Failed to load dashboard data. Please try again.";

      if (error.message?.includes("Unauthorized") || error.status === 401) {
        errorMessage = "Authentication required. Please sign in again.";
      } else if (error.message?.includes("Forbidden") || error.status === 403) {
        errorMessage = "You don't have permission to view this data.";
      } else if (
        error.message?.includes("Network") ||
        error.code === "NETWORK_ERROR"
      ) {
        errorMessage =
          "Network connection issue. Please check your internet connection.";
      } else if (error.message?.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message?.includes("500")) {
        errorMessage = "Server error. Please try again in a few moments.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setDataError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [timeRange, user, isDemoMode]);

  // Retry function for error handling with exponential backoff
  const handleRetry = useCallback(() => {
    setDataError(null);

    // Calculate delay with exponential backoff (1s, 2s, 4s, 8s, max 10s)
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);

    setTimeout(() => {
      setRetryCount((prev) => prev + 1);
      loadDashboardData();
    }, delay);
  }, [loadDashboardData, retryCount]);

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
        dashboardPresetService
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
            console.error("Error loading custom preset:", error);
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

  // Handle preset change
  const handlePresetChange = async (presetId) => {
    // If it's a custom preset (stored in Supabase), fetch its layout
    if (presetId.startsWith("custom-")) {
      const customPresetId = presetId.replace("custom-", "");
      try {
        const preset = await dashboardPresetService.getPreset(customPresetId);
        if (preset) {
          setLayout(preset.layout);
        } else {
          // If preset not found, fallback to default
          const defaultPreset = getPreset("default");
          setLayout(defaultPreset.widgets);
        }
      } catch (error) {
        console.error("Error loading custom preset:", error);
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
  };

  // Handle entering edit mode
  const handleEnterEditMode = () => {
    // Prevent read-only users from entering edit mode
    if (isReadOnly()) {
      toast({
        title: "Access Restricted",
        description:
          "You have read-only access and cannot edit the dashboard layout.",
        variant: "destructive",
      });
      return;
    }
    // Save current layout before entering edit mode using structuredClone for better performance
    setSavedLayout(structuredClone(layout));
    setIsEditMode(true);
  };

  // Handle exiting edit mode
  const handleExitEditMode = () => {
    // Check if there are unsaved changes
    const hasUnsavedChanges =
      savedLayout.length > 0 &&
      JSON.stringify(layout) !== JSON.stringify(savedLayout);

    if (hasUnsavedChanges) {
      // Show custom modal instead of browser confirm
      setShowDiscardModal(true);
      return;
    }

    // No changes, just exit
    if (savedLayout.length > 0) {
      setSavedLayout([]);
    }
    setIsEditMode(false);
  };

  // Handle discard changes confirmation from modal
  const handleDiscardChanges = () => {
    setLayout(savedLayout);
    setSavedLayout([]);
    setIsEditMode(false);
    setShowDiscardModal(false);
    toast({
      title: "Changes Discarded",
      description: "Layout changes were not saved.",
    });
  };

  // Deep comparison utility for layout changes
  const deepEqual = useCallback((obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 !== "object") return obj1 === obj2;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  }, []);

  // Helper to validate layout items
  const isValidLayoutItem = useCallback((item) => {
    return (
      item &&
      typeof item.i === "string" &&
      typeof item.x === "number" &&
      typeof item.y === "number" &&
      typeof item.w === "number" &&
      typeof item.h === "number" &&
      item.w > 0 &&
      item.h > 0
    );
  }, []);

  // Handle layout change (drag/resize) with optimized comparison and validation
  const handleLayoutChange = useCallback(
    (newLayout) => {
      if (!isEditMode) return;

      // Validate new layout - filter out invalid items
      const validLayout = newLayout.filter(isValidLayoutItem);

      // If validation removed all items, don't update
      if (validLayout.length === 0) {
        console.warn(
          "[Dashboard] handleLayoutChange: No valid items in new layout",
        );
        return;
      }

      setLayout((prevLayout) => {
        // Preserve component and props from previous layout
        const mergedLayout = validLayout.map((newItem) => {
          const prevItem = prevLayout.find((p) => p.i === newItem.i);
          if (prevItem) {
            return {
              ...newItem,
              component: prevItem.component,
              props: prevItem.props,
            };
          }
          return newItem;
        });

        // Use deep comparison instead of expensive JSON.stringify
        if (!deepEqual(prevLayout, mergedLayout)) {
          // Update preset to custom if it's not already
          if (!currentPreset.startsWith("custom-")) {
            const newCustomId = `custom-${Date.now()}`;
            setCurrentPreset(newCustomId);
          }
          return mergedLayout;
        }
        return prevLayout; // No change, return previous layout
      });
    },
    [isEditMode, currentPreset, deepEqual, isValidLayoutItem],
  );

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
      const presets = await dashboardPresetService.getUserPresets(user.id);
      setCustomPresets(presets);
    } catch (error) {
      console.error("Error loading custom presets:", error);
      setCustomPresets([]);
    }
  };

  // Handle save preset
  const handleSavePreset = async () => {
    // If we're currently viewing a custom preset, offer to update it instead
    if (currentPreset.startsWith("custom-")) {
      const customPresetId = currentPreset.replace("custom-", "");
      const existingPreset = customPresets.find((p) => p.id === customPresetId);

      if (existingPreset) {
        const shouldUpdate = window.confirm(
          `Update existing preset "${existingPreset.name}"?\n\nClick OK to update, or Cancel to save as new preset.`,
        );

        if (shouldUpdate) {
          try {
            toast({
              title: "Updating...",
              description: `Updating preset "${existingPreset.name}"...`,
            });

            await dashboardPresetService.updatePreset(
              customPresetId,
              existingPreset.name,
              existingPreset.description,
              layout,
            );

            await loadCustomPresets();
            setIsEditMode(false);
            setSavedLayout([]);

            toast({
              title: "Preset Updated!",
              description: `"${existingPreset.name}" has been updated successfully.`,
            });
            return;
          } catch (error) {
            console.error("Error updating preset:", error);
            toast({
              title: "Update Failed",
              description: "Failed to update preset. Please try again.",
              variant: "destructive",
            });
            return;
          }
        }
      }
    }

    // Show save modal for new preset
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

    // Determine the base preset
    const basePreset = currentPreset.startsWith("custom-")
      ? DASHBOARD_PRESETS[currentPreset.split("-")[1]] || "default"
      : currentPreset;

    try {
      // Show loading toast
      toast({
        title: "Saving...",
        description: "Please wait while we save your dashboard preset.",
      });

      const savedPreset = await dashboardPresetService.savePreset(
        user.id,
        name,
        description,
        layout,
        basePreset,
      );

      if (savedPreset) {
        // Update the current preset to the newly saved one
        setCurrentPreset(`custom-${savedPreset.id}`);

        // Reload custom presets to get the updated list
        await loadCustomPresets();

        // Exit edit mode and clear saved layout
        setIsEditMode(false);
        setSavedLayout([]);

        toast({
          title: "Layout Saved Successfully!",
          description: `Dashboard preset "${name}" has been saved and activated.`,
        });
      } else {
        throw new Error("Failed to save preset - no data returned");
      }
    } catch (error) {
      console.error("Error saving preset:", error);
      toast({
        title: "Save Failed",
        description:
          error.message || "Failed to save dashboard preset. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle adding a new widget
  const handleAddWidget = (widget) => {
    setLayout((prevLayout) => {
      // Update preset to custom if it's not already
      if (!currentPreset.startsWith("custom-")) {
        const newCustomId = `custom-${customCount + 1}`;
        setCustomCount(customCount + 1);
        setCurrentPreset(newCustomId);
      }
      return [...prevLayout, widget];
    });
  };

  // Handle removing a widget
  const handleRemoveWidget = (widgetId) => {
    setLayout((prevLayout) => {
      const newLayout = prevLayout.filter((w) => w.i !== widgetId);
      // Update preset to custom if it's not already
      if (!currentPreset.startsWith("custom-")) {
        const newCustomId = `custom-${customCount + 1}`;
        setCustomCount(customCount + 1);
        setCurrentPreset(newCustomId);
      }
      return newLayout;
    });
    // Also remove from locked dimensions if it was locked
    setLockedDimensions((prev) => {
      const newDimensions = { ...prev };
      delete newDimensions[widgetId];
      return newDimensions;
    });
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
    // Define currentPresetName locally to ensure it's always available
    const currentPresetName = getCurrentPresetName();
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
    <h1>Dashboard Report</h1>
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
      <div class="stat-value">$${((dashboardData.sales?.totalRevenue || 0) / 1000).toFixed(1)}k</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Active Deals</div>
      <div class="stat-value">${dashboardData.sales?.activeDeals || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">New Leads</div>
      <div class="stat-value">${dashboardData.sales?.newLeads || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Conversion Rate</div>
      <div class="stat-value">${(dashboardData.sales?.conversionRate || 0).toFixed(1)}%</div>
    </div>
  </div>

  <div class="data-section">
    <h2>Marketing Metrics</h2>
    <div class="data-grid">
      <div class="data-item">
        <div class="data-item-label">Active Campaigns</div>
        <div class="data-item-value">${dashboardData.marketing?.activeCampaigns || 0}</div>
      </div>
      <div class="data-item">
        <div class="data-item-label">Email Opens</div>
        <div class="data-item-value">${dashboardData.marketing?.emailOpens || 0}</div>
      </div>
      <div class="data-item">
        <div class="data-item-label">Click Rate</div>
        <div class="data-item-value">${(dashboardData.marketing?.clickRate || 0).toFixed(1)}%</div>
      </div>
      <div class="data-item">
        <div class="data-item-label">Total Subscribers</div>
        <div class="data-item-value">${dashboardData.marketing?.totalSubscribers || 0}</div>
      </div>
    </div>
  </div>

  <div class="data-section">
    <h2>Sales Performance</h2>
    <div class="data-grid">
      <div class="data-item">
        <div class="data-item-label">Average Deal Size</div>
        <div class="data-item-value">$${((dashboardData.sales?.avgDealSize || 0) / 1000).toFixed(1)}k</div>
      </div>
      <div class="data-item">
        <div class="data-item-label">Pipeline Value</div>
        <div class="data-item-value">$${((dashboardData.sales?.pipelineValue || 0) / 1000).toFixed(1)}k</div>
      </div>
      <div class="data-item">
        <div class="data-item-label">Win Rate</div>
        <div class="data-item-value">${(dashboardData.sales?.winRate || 0).toFixed(1)}%</div>
      </div>
      <div class="data-item">
        <div class="data-item-label">Avg Sales Cycle</div>
        <div class="data-item-value">${dashboardData.sales?.avgSalesCycle || "0 days"}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Generated with Axolop CRM | ${exportDate}</p>
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
        title: "Dashboard Exported as HTML",
        description: "Your beautiful dashboard report has been downloaded!",
      });
    } catch (error) {
      console.error("Error exporting dashboard:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export dashboard. Please try again.",
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
        description:
          "Please wait while we create your beautiful dashboard report.",
      });

      const htmlContent = generateExportContent(true);

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
        title: "Dashboard Exported as PDF",
        description: "Your beautiful dashboard report has been downloaded!",
      });
    } catch (error) {
      console.error("Error exporting dashboard:", error);

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

  // Memoized widget data mapping to prevent unnecessary recalculations
  const widgetDataMap = useMemo(() => {
    const map = {};

    // Pre-calculate all widget data to avoid repeated calculations
    map.RevenueChart = {
      data: dashboardData.sales?.revenueByPeriod || [],
      title: "Revenue Overview",
      timeRange,
    };

    map.ProfitMarginWidget = {
      data: dashboardData.profitLoss || {},
    };

    map.ConversionFunnelWidget = {
      data: {
        leads: dashboardData.sales?.totalLeads || 0,
        qualified: dashboardData.sales?.qualifiedLeads || 0,
        won: dashboardData.sales?.dealsWon || 0,
      },
    };

    map.EmailMarketingWidget = {
      data: dashboardData.marketing || {},
    };

    map.FormSubmissionsWidget = {
      data: dashboardData.forms || {},
    };

    map.FullSalesWidget = {
      data: {
        totalRevenue: dashboardData.sales?.totalRevenue || 0,
        activeDeals: dashboardData.sales?.activeDeals || 0,
        newLeads: dashboardData.sales?.newLeads || 0,
        conversionRate: dashboardData.sales?.conversionRate || 0,
        avgDealSize: dashboardData.sales?.avgDealSize || 0,
        winRate: dashboardData.sales?.winRate || 0,
        avgSalesCycle: dashboardData.sales?.avgSalesCycle || "0 days",
        pipelineValue: dashboardData.sales?.pipelineValue || 0,
      },
      timeRange,
    };

    map.FullMarketingWidget = {
      data: {
        activeCampaigns: dashboardData.marketing?.activeCampaigns || 0,
        emailOpens: dashboardData.marketing?.emailOpens || 0,
        clickRate: dashboardData.marketing?.clickRate || 0,
        totalSubscribers: dashboardData.marketing?.totalSubscribers || 0,
        engagementRate: dashboardData.marketing?.engagementRate || 0,
        unsubscribeRate: dashboardData.marketing?.unsubscribeRate || 0,
        avgOpenRate: dashboardData.marketing?.avgOpenRate || 0,
        newSubscribers: dashboardData.marketing?.newSubscribers || 0,
      },
      timeRange,
    };

    return map;
  }, [dashboardData, timeRange]);

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

      // Use pre-calculated widget data
      let widgetData = widgetDataMap[widget.component] || {};
      let widgetProps = widget.props || {};

      // Special handling for MetricCard
      if (widget.component === "MetricCard") {
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
      }

      return <Component {...widgetData} {...widgetProps} />;
    },
    [widgetDataMap],
  ); // Only depends on pre-calculated data map

  // Get metric value for MetricCard
  const getMetricValue = (title) => {
    const { sales, marketing, profitLoss, forms } = dashboardData;

    const metricMap = {
      // Sales & Revenue
      "Total Revenue": sales?.totalRevenue
        ? `$${(sales.totalRevenue / 1000).toFixed(0)}k`
        : "$0",
      MRR: sales?.mrr ? `$${(sales.mrr / 1000).toFixed(0)}k` : "$0",
      "Avg. Deal Size": sales?.avgDealSize
        ? `$${(sales.avgDealSize / 1000).toFixed(0)}k`
        : "$0",
      "Win Rate": sales?.winRate ? `${sales.winRate.toFixed(1)}%` : "0%",
      "Sales Velocity": sales?.avgSalesCycle
        ? `${sales.avgSalesCycle} days`
        : "0 days",
      "Pipeline Value": sales?.pipelineValue
        ? `$${(sales.pipelineValue / 1000).toFixed(0)}k`
        : "$0",
      "Active Deals": sales?.activeDeals || 0,

      // Lead Management
      "New Leads": sales?.newLeads || 0,
      "Active Leads": sales?.activeLeads || sales?.newLeads || 0,
      "Top Lead Source": sales?.topLeadSource || "Website",
      "Qualification Rate": sales?.qualificationRate
        ? `${sales.qualificationRate.toFixed(1)}%`
        : "0%",
      "Hot Leads": sales?.hotLeads || 0,
      "Conversion Rate": sales?.conversionRate
        ? `${sales.conversionRate.toFixed(1)}%`
        : "0%",

      // Marketing
      "Active Campaigns": marketing?.activeCampaigns || 0,
      "Open Rate": marketing?.openRate
        ? `${marketing.openRate.toFixed(1)}%`
        : "0%",
      CTR: marketing?.clickRate ? `${marketing.clickRate.toFixed(1)}%` : "0%",
      "Form Conv. Rate": forms?.conversionRate
        ? `${forms.conversionRate.toFixed(1)}%`
        : "0%",
      "Total Subscribers": marketing?.totalSubscribers || 0,
      "Engagement Rate": marketing?.engagementRate
        ? `${marketing.engagementRate.toFixed(1)}%`
        : "0%",

      // Tasks & Productivity
      "Due Today": sales?.tasksDueToday || 0,
      Overdue: sales?.overdueTask || 0,
      Completed: sales?.tasksCompleted || 0,
      Activity: sales?.recentActivity || 0,
      "Team Score": sales?.teamScore ? `${sales.teamScore}%` : "0%",

      // Calendar & Meetings
      Upcoming: sales?.upcomingMeetings || 0,
      "This Week": sales?.meetingsThisWeek || 0,
      "No-Show Rate": sales?.noShowRate
        ? `${sales.noShowRate.toFixed(1)}%`
        : "0%",
      "Calls Today": sales?.callsToday || 0,

      // Financial
      "Net Profit": profitLoss?.netProfit
        ? `$${(profitLoss.netProfit / 1000).toFixed(0)}k`
        : "$0",
      "Active Clients": sales?.activeClients || 0,
      "Customer LTV": sales?.customerLTV
        ? `$${(sales.customerLTV / 1000).toFixed(0)}k`
        : "$0",
      "Active Accounts": sales?.activeAccounts || 0,

      // Legacy mappings
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
      "Churn Rate": sales?.churnRate ? `${sales.churnRate.toFixed(1)}%` : "0%",
      "Running Campaigns": marketing?.activeCampaigns || 0,
      "Retainer Revenue": sales?.retainerRevenue
        ? `$${(sales.retainerRevenue / 1000).toFixed(0)}k`
        : "$0",
      "Client Retention": sales?.clientRetention
        ? `${sales.clientRetention.toFixed(1)}%`
        : "0%",
      "Active Sponsorships": sales?.activeSponsorships || 0,
      "Total Orders": sales?.totalOrders || 0,
      "Average Order Value": sales?.aov ? `$${sales.aov.toFixed(0)}` : "$0",
      "Cart Abandonment": sales?.cartAbandonment
        ? `${sales.cartAbandonment.toFixed(1)}%`
        : "0%",
    };

    return metricMap[title] || "0";
  };

  // Get metric trend
  const getMetricTrend = (_title) => {
    const trend = dashboardData.sales?.trend;
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

  const presetList = getPresetList();

  // Get current preset name
  const getCurrentPresetName = () => {
    if (currentPreset.startsWith("custom-")) {
      const customId = currentPreset.replace("custom-", "");
      const customPreset = customPresets.find((p) => p.id === customId);
      return customPreset ? customPreset.name : `Custom Layout`;
    }
    return DASHBOARD_PRESETS[currentPreset]?.name || "Default";
  };

  const currentPresetName = getCurrentPresetName();

  if (loading || userLoading) {
    return (
      <FullPageSkeleton
        title="Loading your dashboard..."
        subtitle="Preparing your business insights"
      />
    );
  }

  return (
    <div className="h-full flex flex-col crm-page-wrapper bg-white">
      {/* Page Header */}
      <div className="relative bg-white px-6 sm:px-8 py-6">
        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-display text-neutral-900">
                Hey there
                {getFormattedFirstName() && `, ${getFormattedFirstName()}`}!
              </h1>
              {isReadOnly() && <ViewOnlyBadge />}
            </div>

            {/* Dashboard Actions Dropdown */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 sm:right-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8 w-8 p-0 hover:bg-[#761B14]/10 transition-colors"
                    aria-label="Dashboard options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 shadow-lg border-gray-200"
                >
                  {/* Time Range Submenu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full">
                      <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Time Range</span>
                        </div>
                        <span className="text-sm text-gray-500 capitalize">
                          {timeRange}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => setTimeRange("week")}>
                        This Week
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTimeRange("month")}>
                        This Month
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTimeRange("quarter")}>
                        This Quarter
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTimeRange("year")}>
                        This Year
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Presets Submenu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full">
                      <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4" />
                          <span>Presets</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-72 shadow-lg border-gray-200"
                    >
                      <DropdownMenuLabel className="text-sm font-semibold text-gray-900 px-3 py-2">
                        Dashboard Presets
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {presetList.map((preset) => (
                        <DropdownMenuItem
                          key={preset.id}
                          onClick={() => handlePresetChange(preset.id)}
                          className={`flex flex-col items-start px-3 py-3 cursor-pointer transition-all hover:bg-[#761B14]/5 ${
                            currentPreset === preset.id
                              ? "bg-[#761B14]/10 border-l-2 border-[#761B14]"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 w-full mb-1">
                            <LayoutGrid className="h-3.5 w-3.5 text-[#761B14]" />
                            <span className="font-semibold text-sm">
                              {preset.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600 ml-5">
                            {preset.description}
                          </span>
                        </DropdownMenuItem>
                      ))}
                      {customPresets.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-sm font-semibold text-gray-900 px-3 py-2 flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-[#761B14]" />
                            My Custom Presets
                          </DropdownMenuLabel>
                          {customPresets.map((preset) => (
                            <DropdownMenuItem
                              key={preset.id}
                              onClick={() =>
                                handlePresetChange(`custom-${preset.id}`)
                              }
                              className={`flex flex-col items-start px-3 py-3 cursor-pointer transition-all hover:bg-[#761B14]/5 ${
                                currentPreset === `custom-${preset.id}`
                                  ? "bg-[#761B14]/10 border-l-2 border-[#761B14]"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-2 w-full mb-1">
                                <Users className="h-3.5 w-3.5 text-[#761B14]" />
                                <span className="font-semibold text-sm">
                                  {preset.name}
                                </span>
                              </div>
                              {preset.description && (
                                <span className="text-xs text-gray-600 ml-5">
                                  {preset.description}
                                </span>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenuSeparator />

                  {/* Edit/Save Options */}
                  {canEdit() && (
                    <>
                      {isEditMode ? (
                        <>
                          <DropdownMenuItem
                            onClick={() => setShowWidgetSelector(true)}
                            className="gap-2"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span>Add Widget</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleSavePreset}
                            className="gap-2"
                          >
                            <Save className="h-4 w-4" />
                            <span>Save Layout</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleExitEditMode}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" />
                            <span>Exit Edit Mode</span>
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem
                          onClick={handleEnterEditMode}
                          className="gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Edit Layout</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Export Options */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full">
                      <DropdownMenuItem className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <span>Export</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={handleExportHTML}
                        className="gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">Export as HTML</span>
                          <span className="text-xs text-gray-500">
                            Interactive web document
                          </span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleExportPDF}
                        className="gap-2"
                      >
                        <File className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">Export as PDF</span>
                          <span className="text-xs text-gray-500">
                            Print-ready document
                          </span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Mode Banner */}
      {isEditMode && (
        <div className="bg-[#761B14] text-white px-4 py-3 text-sm flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 flex-1">
            <Settings className="h-5 w-5 animate-pulse" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="font-semibold text-base">Edit Mode Active</span>
              <span className="hidden sm:inline text-white/90 text-xs">
                • Drag widgets to rearrange • Resize from corners • Click X to
                remove
              </span>
              {savedLayout.length > 0 &&
                JSON.stringify(layout) !== JSON.stringify(savedLayout) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500 text-yellow-900 rounded-full text-xs font-semibold animate-pulse">
                    <span className="w-1.5 h-1.5 bg-yellow-900 rounded-full"></span>
                    Unsaved Changes
                  </span>
                )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePreset}
              className="hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-200 font-semibold text-sm flex items-center gap-1.5 bg-white/10"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={handleExitEditMode}
              className="hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all duration-200 font-semibold text-sm"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Hero Metrics Section */}
      <div className="bg-white px-6 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Revenue */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow">
            <p className="text-sm font-medium text-neutral-500 mb-1">
              Total Revenue
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              ${((dashboardData.sales?.totalRevenue || 0) / 1000).toFixed(1)}k
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              ${(dashboardData.sales?.totalRevenue || 0).toLocaleString()} All
              Time
            </p>
          </div>
          {/* Active Leads */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow">
            <p className="text-sm font-medium text-neutral-500 mb-1">
              Active Leads
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              {dashboardData.sales?.newLeads || 0}
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              {dashboardData.sales?.totalLeads || 0} All Time
            </p>
          </div>
          {/* Conversion Rate */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow">
            <p className="text-sm font-medium text-neutral-500 mb-1">
              Conversion Rate
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              {(dashboardData.sales?.conversionRate || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              {dashboardData.sales?.dealsWon || 0} Won Deals
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
        <div className="px-6 sm:px-8 py-4 max-w-full">
          {/* Data Loading Error Message */}
          {dataError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{dataError}</p>
                {retryCount > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Retry attempt {retryCount}...
                  </p>
                )}
              </div>
              <button
                onClick={handleRetry}
                className="flex-shrink-0 text-sm font-medium text-red-600 hover:text-red-500 underline"
              >
                {retryCount > 0 ? `Retry (${retryCount})` : "Retry"}
              </button>
            </div>
          )}

          {layout.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-dashed border-neutral-300 shadow-sm">
              <LayoutGrid className="h-20 w-20 text-[#761B14]/30 mb-6" />
              <h3 className="text-headline text-neutral-900 mb-4">
                No Widgets Yet
              </h3>
              <p className="text-body text-neutral-600 mb-8 max-w-md">
                Start customizing your dashboard by adding widgets tailored to
                your business needs
              </p>
              <Button
                variant="accent"
                onClick={handleEnterEditMode}
                className="btn-primary"
              >
                <Settings className="h-5 w-5 mr-2" />
                Start Editing
              </Button>
            </div>
          ) : (
            <ResponsiveGridLayout
              className="layout"
              layouts={generateResponsiveLayouts(layout, lockedDimensions)}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
              cols={{ lg: 12, md: 12, sm: 6, xs: 2 }}
              rowHeight={100}
              isDraggable={isEditMode}
              isResizable={isEditMode}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".drag-handle"
              compactType={null}
              preventCollision={true}
              margin={[16, 16]}
              containerPadding={[0, 0]}
              useCSSTransforms={false}
              transformScale={1}
            >
              {layout.map((widget, index) => (
                <motion.div
                  key={widget.i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className={`dashboard-widget bg-white rounded-2xl border border-black/[0.06] ${
                    isEditMode
                      ? "shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-lg hover:scale-[1.01] ring-2 ring-[#761B14]/20 hover:ring-[#761B14]/40"
                      : "shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
                  }`}
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
                          className={`text-white transition-all duration-200 p-1 rounded text-xs ${
                            lockedDimensions[widget.i]?.height
                              ? "bg-white/30 hover:bg-white/40"
                              : "hover:bg-white/20"
                          }`}
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
                          className="text-white hover:text-[#CA4238] transition-all duration-200 p-1 rounded hover:bg-white/20 ml-0.5"
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
                </motion.div>
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

      {/* Discard Changes Confirmation Modal */}
      <Dialog open={showDiscardModal} onOpenChange={setShowDiscardModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes to your dashboard layout. Are you sure
              you want to exit without saving?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDiscardModal(false)}
            >
              Keep Editing
            </Button>
            <Button variant="destructive" onClick={handleDiscardChanges}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
