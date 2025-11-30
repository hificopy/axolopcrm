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

  // Check if there's no data (empty state)
  const isEmpty = total === 0;

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
      <Card className="h-full flex flex-col bg-white border border-black/[0.05] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden">
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3F0D28] to-[#3F0D28] flex items-center justify-center shadow-sm">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Form Submissions</CardTitle>
              <CardDescription className="text-xs">
                Lead Generation Performance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 relative z-10">
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
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3F0D28]/10 to-[#3F0D28]/10 flex items-center justify-center mb-4"
              >
                <FileText className="h-8 w-8 text-[#3F0D28]/40" />
              </motion.div>
              <h3 className="text-lg font-semibold text-crm-text-primary mb-2">
                No Form Submissions Yet
              </h3>
              <p className="text-sm text-crm-text-secondary mb-4 max-w-xs">
                Create forms to start collecting leads and track your submission
                performance
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3F0D28] text-white rounded-lg text-sm font-medium"
              >
                <FileText className="h-4 w-4" />
                Create Your First Form
              </motion.div>
            </motion.div>
          ) : (
            // Normal content display
            <>
              {/* Stats with Enhanced Animations */}
              <div className="grid grid-cols-3 gap-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200/50 dark:border-neutral-700/50 backdrop-blur-sm rounded-lg p-3 text-center hover:shadow-md transition-shadow"
                >
                  <FileText className="h-5 w-5 text-[#CA4238] mx-auto mb-1" />
                  <div className="text-xs text-crm-text-secondary mb-1">
                    Total
                  </div>
                  <div className="text-lg font-bold text-crm-text-primary">
                    {total}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200/50 dark:border-neutral-700/50 backdrop-blur-sm rounded-lg p-3 text-center hover:shadow-md transition-shadow"
                >
                  <Users className="h-5 w-5 text-[#3F0D28] mx-auto mb-1" />
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
                  className="bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200/50 dark:border-neutral-700/50 backdrop-blur-sm rounded-lg p-3 text-center hover:shadow-md transition-shadow"
                >
                  <TrendingUp className="h-5 w-5 text-[#3F0D28] mx-auto mb-1" />
                  <div className="text-xs text-crm-text-secondary mb-1">
                    Rate
                  </div>
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
                        stroke="#3F0D28"
                        strokeWidth={2}
                        dot={{ fill: "#3F0D28", r: 3 }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
