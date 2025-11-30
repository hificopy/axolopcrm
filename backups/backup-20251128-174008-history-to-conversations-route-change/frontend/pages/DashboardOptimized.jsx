/**
 * Optimized Dashboard Component
 * Breaks down the monolithic dashboard into smaller, manageable pieces
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Download, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { formatDateRange, getPeriodLabel } from "../lib/utils";
import { FullPageSkeleton } from "../ui/skeletons";
import ViewOnlyBadge from "../ui/view-only-badge";

// Import custom hooks
import {
  useDashboardData,
  useDashboardActions,
  useResponsiveLayout,
} from "../hooks/useDashboard";

// Import widget components
import RevenueChart from "../dashboard/RevenueChart";
import ProfitMarginWidget from "../dashboard/ProfitMarginWidget";
import ConversionFunnelWidget from "../dashboard/ConversionFunnelWidget";
import EmailMarketingWidget from "../dashboard/EmailMarketingWidget";
import FormSubmissionsWidget from "../dashboard/FormSubmissionsWidget";
import MetricCard from "../dashboard/MetricCard";
import FullSalesWidget from "../dashboard/FullSalesWidget";
import FullMarketingWidget from "../dashboard/FullMarketingWidget";

// Import layout components
import SavePresetModal from "@/components/dashboard/SavePresetModal";
import WidgetSelector from "@/components/dashboard/WidgetSelector";

// CSS for react-grid-layout
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const OptimizedDashboard = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  // Use custom hooks for data and actions
  const {
    user,
    userLoading,
    isReadOnly,
    canEdit,
    isDemoMode,
    currentPreset,
    setCurrentPreset,
    dashboardData,
  } = useDashboardData(dateRange);

  const { savePreset, exportDashboard, refreshData } = useDashboardActions();
  const { generateResponsiveLayouts } = useResponsiveLayout();

  // Loading state
  if (userLoading) {
    return <FullPageSkeleton />;
  }

  // Demo mode warning
  if (isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Demo Mode Active
          </h1>
          <p className="text-gray-600 mb-6">
            Dashboard is in demo mode. Some features may be limited.
          </p>
          <Button onClick={() => (window.location.href = "/signin")}>
            Exit Demo Mode
          </Button>
        </div>
      </div>
    );
  }

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  const handleExportPDF = async () => {
    try {
      await exportDashboard("pdf");
    } catch (error) {
      toast.error("Failed to export dashboard");
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportDashboard("csv");
    } catch (error) {
      toast.error("Failed to export dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            {isReadOnly && <ViewOnlyBadge />}
          </div>

          <div className="flex items-center space-x-4">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {formatDateRange(dateRange)}
              </span>
            </div>

            {/* Export Options */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isReadOnly}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={isReadOnly}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Settings */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPreset("settings")}
              disabled={isReadOnly}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metrics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboardData.metrics.slice(0, 8).map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                icon={metric.icon}
                trend={metric.trend}
              />
            ))}
          </div>
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <RevenueChart data={dashboardData.charts.revenue} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-1"
        >
          <ProfitMarginWidget data={dashboardData.charts.profit} />
        </motion.div>

        {/* Additional Widgets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <ConversionFunnelWidget data={dashboardData.charts.conversion} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-1"
        >
          <EmailMarketingWidget data={dashboardData.charts.email} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="lg:col-span-3"
        >
          <FormSubmissionsWidget data={dashboardData.charts.forms} />
        </motion.div>
      </div>

      {/* Modals */}
      <SavePresetModal
        isOpen={currentPreset === "save"}
        onClose={() => setCurrentPreset(null)}
        onSave={savePreset}
      />

      <WidgetSelector
        isOpen={currentPreset === "widgets"}
        onClose={() => setCurrentPreset(null)}
      />
    </div>
  );
};

export default OptimizedDashboard;
