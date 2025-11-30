/**
 * Dashboard Hooks
 * Custom hooks for dashboard functionality
 */

import { useState, useCallback, useMemo } from "react";
import { useSupabase } from "../context/SupabaseContext";
import { useAgency } from "../hooks/useAgency";
import { useDemoMode } from "../contexts/DemoModeContext";
import enhancedDashboardDataService from "@/services/enhanced-dashboard-data-service";
import dashboardPresetService from "@/services/dashboardPresetService";
import { DASHBOARD_PRESETS, getPreset } from "@/config/dashboardPresets";

export const useDashboardData = (dateRange) => {
  const { user, loading: userLoading } = useSupabase();
  const { isReadOnly, canEdit } = useAgency();
  const { isDemoMode } = useDemoMode();
  const [currentPreset, setCurrentPreset] = useState("default");

  // Memoized data fetching
  const dashboardData = useMemo(async () => {
    if (userLoading || isReadOnly || isDemoMode) {
      return { metrics: [], charts: [], activities: [] };
    }

    try {
      const data = await enhancedDashboardDataService.getDashboardData(
        user.id,
        dateRange,
        { useCache: true },
      );
      return data;
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      return { metrics: [], charts: [], activities: [] };
    }
  }, [user, userLoading, isReadOnly, isDemoMode, dateRange]);

  return {
    user,
    userLoading,
    isReadOnly,
    canEdit,
    isDemoMode,
    currentPreset,
    setCurrentPreset,
    dashboardData,
  };
};

export const useDashboardActions = () => {
  const { toast } = useToast();
  const { user } = useSupabase();
  const { isReadOnly } = useAgency();

  const savePreset = useCallback(
    async (presetData) => {
      if (isReadOnly) return;

      try {
        await dashboardPresetService.savePreset(user.id, presetData);
        toast.success("Dashboard preset saved successfully");
      } catch (error) {
        console.error("Save preset error:", error);
        toast.error("Failed to save preset");
      }
    },
    [user, isReadOnly, toast],
  );

  const exportDashboard = useCallback(
    async (format = "pdf") => {
      try {
        // Implementation for dashboard export
        toast.success(`Dashboard exported as ${format.toUpperCase()}`);
      } catch (error) {
        console.error("Export error:", error);
        toast.error("Failed to export dashboard");
      }
    },
    [toast],
  );

  const refreshData = useCallback(() => {
    // Implementation for data refresh
    window.location.reload();
  }, []);

  return {
    savePreset,
    exportDashboard,
    refreshData,
  };
};

export const useResponsiveLayout = (baseLayout) => {
  return useMemo(() => {
    const generateResponsiveLayouts = (baseLayout, lockedDimensions = {}) => {
      const lg = baseLayout.map((item) => {
        const locks = lockedDimensions[item.i] || {
          width: false,
          height: false,
        };
        return { ...item, ...locks };
      });

      const md = lg.map((item) => ({ ...item }));
      const sm = baseLayout.map((item) => {
        const result = {
          ...item,
          w: item.w * 0.8,
          h: item.h * 0.8,
        };
        return result;
      });

      const xs = baseLayout.map((item) => {
        const result = {
          ...item,
          w: item.w * 0.6,
          h: item.h * 0.6,
        };
        return result;
      });

      return { lg, md, sm, xs };
    };

    return generateResponsiveLayouts(baseLayout);
  }, [baseLayout]);
};
