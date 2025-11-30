import { motion } from "framer-motion";
import { FileText, Users, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function FormSubmissionsWidget({ data }) {
  const {
    total = 0,
    converted = 0,
    conversionRate = 0,
    trend = [],
  } = data || {};

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-crm-border rounded-lg shadow-lg p-3">
          <p className="text-sm text-crm-text-secondary">
            {payload[0].payload.name}
          </p>
          <p className="text-lg font-semibold text-crm-text-primary">
            {payload[0].value} submissions
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
      transition={{ duration: 0.5, delay: 0.4 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full flex flex-col border-2 hover:border-opacity-60 hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 relative group overflow-hidden">
        {/* Animated background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/10 dark:to-yellow-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary-yellow to-yellow-600 flex items-center justify-center flex-shrink-0 shadow-lg"
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-lg">Form Submissions</CardTitle>
              <CardDescription className="text-xs">
                Lead Generation Performance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 relative z-10">
          {/* Stats with Enhanced Animations */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 backdrop-blur-sm rounded-lg p-3 text-center hover:shadow-md transition-shadow"
            >
              <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <div className="text-xs text-crm-text-secondary mb-1">Total</div>
              <div className="text-lg font-bold text-crm-text-primary">
                {total}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 backdrop-blur-sm rounded-lg p-3 text-center hover:shadow-md transition-shadow"
            >
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <div className="text-xs text-crm-text-secondary mb-1">
                Converted
              </div>
              <div className="text-lg font-bold text-crm-text-primary">
                {converted}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-red-50/50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30 backdrop-blur-sm rounded-lg p-3 text-center hover:shadow-md transition-shadow"
            >
              <TrendingUp className="h-5 w-5 text-[#761B14] dark:text-[#761B14] mx-auto mb-1" />
              <div className="text-xs text-crm-text-secondary mb-1">Rate</div>
              <div className="text-lg font-bold text-crm-text-primary">
                {conversionRate.toFixed(1)}%
              </div>
            </motion.div>
          </div>

          {/* Trend Chart */}
          {trend && trend.length > 0 && (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trend}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    stroke="#6B7280"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis stroke="#6B7280" fontSize={10} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#F5A623"
                    strokeWidth={2}
                    dot={{ fill: "#F5A623", r: 3 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>

        {/* Decorative corner accent */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500 to-yellow-500 opacity-5 blur-3xl rounded-full -mb-12 -mr-12" />
      </Card>
    </motion.div>
  );
}
