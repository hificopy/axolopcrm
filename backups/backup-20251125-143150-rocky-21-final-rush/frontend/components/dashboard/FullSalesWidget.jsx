import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Award,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDateRange, getPeriodLabel } from "@/lib/utils";
import MetricLoadingState, {
  DataFreshnessIndicator,
} from "@/components/ui/metric-loading-state";

export default function FullSalesWidget({ data = {}, timeRange = "month" }) {
  // Check if data is reliable
  const isReliable = data?._metadata?.isReliable !== false;
  const shouldShowLoading = data?._metadata?.shouldShowLoading === true;

  const formatValue = (value, formatter) => {
    if (shouldShowLoading || !isReliable) {
      return null; // Will show loading state
    }
    return formatter ? formatter(value) : value;
  };

  const stats = [
    {
      label: "Total Revenue",
      value: formatValue(data.totalRevenue, (val) =>
        val ? `$${(val / 1000).toFixed(0)}k` : "$0",
      ),
      icon: DollarSign,
      color: "text-[#761B14] dark:text-[#d4463c]",
      bg: "bg-red-50/50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30 backdrop-blur-sm",
    },
    {
      label: "Active Deals",
      value: formatValue(data.activeDeals),
      icon: Target,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 backdrop-blur-sm",
    },
    {
      label: "New Leads",
      value: formatValue(data.newLeads),
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 backdrop-blur-sm",
    },
    {
      label: "Conversion Rate",
      value: formatValue(data.conversionRate, (val) =>
        val ? `${val.toFixed(1)}%` : "0%",
      ),
      icon: Award,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 backdrop-blur-sm",
    },
  ];

  const details = [
    {
      label: "Avg. Deal Size",
      value: formatValue(data.avgDealSize, (val) =>
        val ? `$${(val / 1000).toFixed(1)}k` : "$0",
      ),
    },
    {
      label: "Win Rate",
      value: formatValue(data.winRate, (val) =>
        val ? `${val.toFixed(1)}%` : "0%",
      ),
    },
    {
      label: "Sales Cycle",
      value: formatValue(data.avgSalesCycle),
    },
    {
      label: "Pipeline Value",
      value: formatValue(data.pipelineValue, (val) =>
        val ? `$${(val / 1000).toFixed(0)}k` : "$0",
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full"
    >
      <Card className="h-full w-full flex flex-col bg-white border border-black/[0.05] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Sales Overview</CardTitle>
                <p className="text-xs text-crm-text-secondary">
                  Complete sales metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50">
                <Calendar className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                  {getPeriodLabel(timeRange)}
                </span>
              </div>
              {data?._metadata?.lastValidated && (
                <DataFreshnessIndicator
                  lastUpdated={data._metadata.lastValidated}
                  className="text-xs"
                />
              )}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-black/[0.05]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#761B14] animate-pulse" />
              <span className="text-xs text-neutral-500 font-medium">
                {formatDateRange(timeRange)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`${stat.bg} rounded-lg p-3`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xs text-crm-text-secondary">
                      {stat.label}
                    </span>
                  </div>
                  <p className={`text-xl font-bold ${stat.color}`}>
                    {stat.value !== null ? (
                      stat.value
                    ) : (
                      <MetricLoadingState size="text-xl" showIcon={false} />
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Detailed Stats */}
          <div className="border-t border-black/[0.05] pt-3 space-y-2">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Additional Metrics
            </h4>
            {details.map((detail, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-1.5 hover:bg-[#FAFAFA] px-2 rounded transition-colors"
              >
                <span className="text-sm text-neutral-500">
                  {detail.label}
                </span>
                <span className="text-sm font-semibold text-neutral-900">
                  {detail.value !== null ? (
                    detail.value
                  ) : (
                    <MetricLoadingState size="text-sm" showIcon={false} />
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
