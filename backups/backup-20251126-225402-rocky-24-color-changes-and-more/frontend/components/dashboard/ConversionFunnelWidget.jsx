import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Branded red color palette for funnel stages
const COLORS = {
  leads: "#CA4238", // Soft red - top of funnel
  qualified: "#5C2222", // Medium red - middle
  won: "#761B14", // Dark red - converted
};

export default function ConversionFunnelWidget({ data }) {
  const { leads = 0, qualified = 0, won = 0 } = data || {};

  // Check if all data is zero (empty state)
  const isEmpty = leads === 0 && qualified === 0 && won === 0;

  const chartData = useMemo(
    () => [
      { name: "Leads", value: leads, fill: COLORS.leads },
      { name: "Qualified", value: qualified, fill: COLORS.qualified },
      { name: "Won", value: won, fill: COLORS.won },
    ],
    [leads, qualified, won],
  );

  const conversionRate = useMemo(() => {
    return leads > 0 ? ((won / leads) * 100).toFixed(1) : 0;
  }, [leads, won]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage =
        leads > 0 ? ((payload[0].value / leads) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 border border-crm-border rounded-lg shadow-lg p-3">
          <p className="text-sm text-crm-text-secondary">
            {payload[0].payload.name}
          </p>
          <p className="text-lg font-semibold text-crm-text-primary">
            {payload[0].value}
          </p>
          <p className="text-xs text-crm-text-secondary">
            {percentage}% of total
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
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full flex flex-col bg-white border border-black/[0.05] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden">
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Users className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-lg">Conversion Funnel</CardTitle>
                <CardDescription className="text-xs">
                  Lead to Customer Journey
                </CardDescription>
              </div>
            </div>
            <motion.div
              className="text-right"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <div className="text-2xl font-bold text-crm-text-primary">
                {conversionRate}%
              </div>
              <div className="text-xs text-crm-text-secondary">
                Conversion Rate
              </div>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-4 relative z-10">
          {isEmpty ? (
            // Empty state message
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col items-center justify-center text-center py-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4A1515]/10 to-[#761B14]/10 flex items-center justify-center mb-4"
              >
                <Users className="h-8 w-8 text-[#4A1515]/40" />
              </motion.div>
              <h3 className="text-lg font-semibold text-crm-text-primary mb-2">
                No Leads Data Yet
              </h3>
              <p className="text-sm text-crm-text-secondary mb-4 max-w-xs">
                Start generating leads to see your conversion funnel come to
                life
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A1515] text-white rounded-lg text-sm font-medium"
              >
                <Users className="h-4 w-4" />
                Create Your First Lead
              </motion.div>
            </motion.div>
          ) : (
            // Normal chart display
            <>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Mini Stats with Enhanced Animations */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="bg-neutral-50 dark:bg-neutral-900/20 rounded-lg p-2 text-center border border-neutral-200/50 dark:border-neutral-700/50 hover:shadow-md transition-shadow"
                >
                  <div className="text-xs text-[#CA4238] font-medium">
                    Leads
                  </div>
                  <div className="text-lg font-bold text-crm-text-primary">
                    {leads}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="bg-neutral-50 dark:bg-neutral-900/20 rounded-lg p-2 text-center border border-neutral-200/50 dark:border-neutral-700/50 hover:shadow-md transition-shadow"
                >
                  <div className="text-xs text-[#5C2222] font-medium">
                    Qualified
                  </div>
                  <div className="text-lg font-bold text-crm-text-primary">
                    {qualified}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="bg-neutral-50 dark:bg-neutral-900/20 rounded-lg p-2 text-center border border-neutral-200/50 dark:border-neutral-700/50 hover:shadow-md transition-shadow"
                >
                  <div className="text-xs text-[#761B14] font-medium">Won</div>
                  <div className="text-lg font-bold text-crm-text-primary">
                    {won}
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
