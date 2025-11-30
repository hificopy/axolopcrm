import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function RevenueChart({ data, title = 'Revenue Overview', timeRange = 'month' }) {
  // Generate flatline data if revenue is $0 or data is empty
  const chartData = useMemo(() => {
    console.log('📈 [REVENUE CHART] Input data:', { data, timeRange });

    if (!data || data.length === 0) {
      // Generate default time periods with zero values
      const periods = timeRange === 'week' ? 7 : timeRange === 'year' ? 12 : timeRange === 'quarter' ? 12 : 4;
      const labels = timeRange === 'week'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : timeRange === 'year'
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        : timeRange === 'quarter'
        ? ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12']
        : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

      const flatlineData = labels.slice(0, periods).map(label => ({
        name: label,
        value: 0
      }));

      console.log('📈 [REVENUE CHART] Generated flatline data:', flatlineData);
      return flatlineData;
    }

    // Check if all values are zero
    const hasNonZeroValue = data.some(item => (item.value || 0) > 0);
    if (!hasNonZeroValue && data.length > 0) {
      // Data exists but all zeros - use the provided labels with zero values
      const zeroData = data.map(item => ({
        name: item.name || item.month || 'Period',
        value: 0
      }));
      console.log('📈 [REVENUE CHART] All values are zero, returning:', zeroData);
      return zeroData;
    }

    console.log('📈 [REVENUE CHART] Returning actual data:', data);
    return data;
  }, [data, timeRange]);

  const trend = useMemo(() => {
    if (!chartData || chartData.length < 2) return { value: 0, direction: 'up' };
    const latest = chartData[chartData.length - 1]?.value || 0;
    const previous = chartData[chartData.length - 2]?.value || 0;
    const change = previous > 0 ? ((latest - previous) / previous) * 100 : 0;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'up' : 'down'
    };
  }, [chartData]);

  const totalRevenue = useMemo(() => {
    return chartData?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
  }, [chartData]);

  // Check if all values are zero for special Y-axis handling
  const isAllZero = useMemo(() => {
    return chartData?.every(item => (item.value || 0) === 0) || false;
  }, [chartData]);

  // Calculate time period metrics
  const periodMetrics = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    const getTimeLabel = () => {
      switch(timeRange) {
        case 'week': return { period: 'Day', average: 'Daily Avg' };
        case 'month': return { period: 'Week', average: 'Weekly Avg' };
        case 'quarter': return { period: 'Month', average: 'Monthly Avg' };
        case 'year': return { period: 'Month', average: 'Monthly Avg' };
        default: return { period: 'Period', average: 'Average' };
      }
    };

    const labels = getTimeLabel();
    const average = totalRevenue / chartData.length;
    const highest = Math.max(...chartData.map(d => d.value || 0));
    const lowest = Math.min(...chartData.map(d => d.value || 0));

    return { average, highest, lowest, labels };
  }, [chartData, totalRevenue, timeRange]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-crm-border rounded-lg shadow-lg p-3">
          <p className="text-sm text-crm-text-secondary">{payload[0].payload.name}</p>
          <p className="text-lg font-semibold text-crm-text-primary">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
      className="h-full w-full"
    >
      <Card className="h-full w-full flex flex-col border-2 hover:border-opacity-60 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300 relative group overflow-hidden">
        {/* Animated background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/10 dark:to-orange-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <motion.div
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3F0D28] to-[#3F0D28] flex items-center justify-center flex-shrink-0 shadow-lg"
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <DollarSign className="h-4 w-4 text-white" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base font-semibold truncate">{title}</CardTitle>
                <CardDescription className="text-xs truncate">Total: {formatCurrency(totalRevenue)}</CardDescription>
              </div>
            </div>
            {trend.value > 0 && (
              <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium flex-shrink-0 ${
                trend.direction === 'up' ? 'text-[#1A777B]' : 'text-[#CA4238]'
              }`}>
                <TrendingUp className={`h-3 w-3 sm:h-4 sm:w-4 ${trend.direction === 'down' ? 'rotate-180' : ''}`} />
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-4 min-h-0 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3F0D28" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3F0D28" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="name"
                className="fill-gray-500 dark:fill-gray-400"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                className="fill-gray-500 dark:fill-gray-400"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => isAllZero ? '$0' : `$${(value / 1000).toFixed(0)}k`}
                domain={isAllZero ? [0, 1000] : ['auto', 'auto']}
                ticks={isAllZero ? [0, 250, 500, 750, 1000] : undefined}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3F0D28"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                animationDuration={1500}
                animationBegin={0}
                isAnimationActive={true}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>

        {/* Time Period Metrics */}
        {periodMetrics && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 relative z-10">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{periodMetrics.labels.average}</div>
                <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(periodMetrics.average)}
                </div>
              </div>
              <div className="text-center border-x border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Highest</div>
                <div className="text-sm sm:text-base font-semibold text-[#1A777B]">
                  {formatCurrency(periodMetrics.highest)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lowest</div>
                <div className="text-sm sm:text-base font-semibold text-[#CA4238]">
                  {formatCurrency(periodMetrics.lowest)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Decorative corner accent */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-[#3F0D28] to-[#3F0D28] opacity-5 blur-3xl rounded-full -mb-16 -mr-16" />
      </Card>
    </motion.div>
  );
}
