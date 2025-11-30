import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function ProfitMarginWidget({ data }) {
  const { revenue = 0, expenses = 0, netProfit = 0, profitMargin = 0 } = data || {};

  // Check if there's no data (empty state)
  const isEmpty = revenue === 0 && expenses === 0 && netProfit === 0;

  // Branded color palette for pie chart
  const chartData = useMemo(() => [
    { name: 'Net Profit', value: netProfit > 0 ? netProfit : 0, color: '#1A777B' },
    { name: 'Expenses', value: expenses > 0 ? expenses : 0, color: '#CA4238' },
  ], [netProfit, expenses]);

  const isProfit = netProfit >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full flex flex-col bg-white border border-black/[0.05] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden">

        <CardHeader className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-gradient-to-br from-[#3F0D28] to-[#3F0D28]">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Profit & Loss</CardTitle>
              <CardDescription className="text-xs">Current Period Summary</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
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
                <DollarSign className="h-8 w-8 text-[#3F0D28]/40" />
              </motion.div>
              <h3 className="text-lg font-semibold text-crm-text-primary mb-2">
                No Financial Data Yet
              </h3>
              <p className="text-sm text-crm-text-secondary mb-4 max-w-xs">
                Start tracking revenue and expenses to see your profit margins
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3F0D28] text-white rounded-lg text-sm font-medium"
              >
                <DollarSign className="h-4 w-4" />
                Add Revenue Data
              </motion.div>
            </motion.div>
          ) : (
            // Normal content display
            <>
              {/* Chart with minimum height */}
              <div className="flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'var(--crm-bg-light)',
                        border: '1px solid var(--crm-border)',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics */}
              <div className="space-y-3 mt-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-crm-text-secondary">Revenue</span>
              <span className="text-sm font-semibold text-crm-text-primary">
                {formatCurrency(revenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-crm-text-secondary">Expenses</span>
              <span className="text-sm font-semibold text-[#CA4238]">
                {formatCurrency(expenses)}
              </span>
            </div>
            <div className="h-px bg-crm-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-crm-text-primary">Net Profit</span>
              <div className="flex items-center gap-2">
                <span className={`text-base font-bold ${
                  isProfit ? 'text-[#1A777B]' : 'text-[#CA4238]'
                }`}>
                  {formatCurrency(netProfit)}
                </span>
                {isProfit ? (
                  <ArrowUpRight className="h-4 w-4 text-[#1A777B]" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-[#CA4238]" />
                )}
              </div>
            </div>
            <motion.div
              className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/20 rounded-lg p-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm font-medium text-crm-text-primary">Profit Margin</span>
              <span className={`text-lg font-bold ${
                profitMargin >= 20 ? 'text-[#1A777B]' :
                profitMargin >= 10 ? 'text-[#EBB207]' : 'text-[#CA4238]'
              }`}>
                {profitMargin.toFixed(1)}%
              </span>
            </motion.div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
