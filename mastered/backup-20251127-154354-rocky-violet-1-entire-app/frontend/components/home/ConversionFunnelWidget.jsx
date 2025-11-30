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
import { Users, UserCheck, DollarSign } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const COLORS = {
  leads: "#5BB9F5",
  qualified: "#2DCE89",
  won: "#3F0D28",
};

export default function ConversionFunnelWidget({ data }) {
  const { leads = 0, qualified = 0, won = 0 } = data || {};

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
      <Card className="h-full flex flex-col border-2 hover:border-opacity-60 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 relative group overflow-hidden">
        {/* Animated background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/10 dark:to-blue-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-red-700 flex items-center justify-center flex-shrink-0 shadow-lg"
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
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
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center border border-gray-200/50 dark:border-blue-700/50 hover:shadow-md transition-shadow"
            >
              <div className="text-xs text-primary font-medium">Leads</div>
              <div className="text-lg font-bold text-crm-text-primary">
                {leads}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg p-2 text-center border border-emerald-100/50 dark:border-emerald-900/30 backdrop-blur-sm hover:shadow-md transition-shadow"
            >
              <div className="text-xs text-primary-green font-medium">
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
              className="bg-red-50/50 dark:bg-red-950/20 rounded-lg p-2 text-center border border-red-100/50 dark:border-red-900/30 backdrop-blur-sm hover:shadow-md transition-shadow"
            >
              <div className="text-xs text-[#3F0D28] font-medium">Won</div>
              <div className="text-lg font-bold text-crm-text-primary">
                {won}
              </div>
            </motion.div>
          </div>
        </CardContent>

        {/* Decorative corner accent */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 opacity-5 blur-3xl rounded-full -mb-12 -mr-12" />
      </Card>
    </motion.div>
  );
}
