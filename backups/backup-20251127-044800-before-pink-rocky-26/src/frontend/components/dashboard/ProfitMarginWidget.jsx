import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function ProfitMarginWidget({ data }) {
  const { revenue = 0, expenses = 0, netProfit = 0, profitMargin = 0 } = data || {};

  const chartData = useMemo(() => [
    { name: 'Net Profit', value: netProfit > 0 ? netProfit : 0, color: '#2DCE89' },
    { name: 'Expenses', value: expenses > 0 ? expenses : 0, color: '#F5A623' },
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
      <Card className="h-full flex flex-col border-2 hover:border-opacity-60 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 relative group overflow-hidden">
        {/* Animated background gradient on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isProfit
            ? 'bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/10 dark:to-green-950/10'
            : 'bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/10 dark:to-orange-950/10'
        }`} />

        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <motion.div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                isProfit
                  ? 'bg-gradient-to-br from-[#2DCE89] to-[#25a56f]'
                  : 'bg-gradient-to-br from-red-500 to-red-600'
              }`}
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <DollarSign className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-lg">Profit & Loss</CardTitle>
              <CardDescription className="text-xs">Current Period Summary</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          {/* Chart */}
          <div className="h-40">
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
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-crm-text-secondary">Revenue</span>
              <span className="text-sm font-semibold text-crm-text-primary">
                {formatCurrency(revenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-crm-text-secondary">Expenses</span>
              <span className="text-sm font-semibold text-primary-yellow">
                {formatCurrency(expenses)}
              </span>
            </div>
            <div className="h-px bg-crm-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-crm-text-primary">Net Profit</span>
              <div className="flex items-center gap-2">
                <span className={`text-base font-bold ${
                  isProfit ? 'text-primary-green' : 'text-red-500'
                }`}>
                  {formatCurrency(netProfit)}
                </span>
                {isProfit ? (
                  <ArrowUpRight className="h-4 w-4 text-primary-green" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <motion.div
              className="flex items-center justify-between bg-crm-bg-light rounded-lg p-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm font-medium text-crm-text-primary">Profit Margin</span>
              <span className={`text-lg font-bold ${
                profitMargin >= 20 ? 'text-primary-green' :
                profitMargin >= 10 ? 'text-primary-yellow' : 'text-red-500'
              }`}>
                {profitMargin.toFixed(1)}%
              </span>
            </motion.div>
          </div>
        </CardContent>

        {/* Decorative corner accent */}
        <div className={`absolute bottom-0 left-0 w-24 h-24 opacity-5 blur-3xl rounded-full -mb-12 -ml-12 ${
          isProfit
            ? 'bg-gradient-to-br from-emerald-500 to-green-500'
            : 'bg-gradient-to-br from-red-500 to-orange-500'
        }`} />
      </Card>
    </motion.div>
  );
}
