import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function RevenueChart({ data, title = 'Revenue Overview', timeRange = 'month' }) {
  const trend = useMemo(() => {
    if (!data || data.length < 2) return { value: 0, direction: 'up' };
    const latest = data[data.length - 1]?.value || 0;
    const previous = data[data.length - 2]?.value || 0;
    const change = previous > 0 ? ((latest - previous) / previous) * 100 : 0;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'up' : 'down'
    };
  }, [data]);

  const totalRevenue = useMemo(() => {
    return data?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
  }, [data]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-crm-border rounded-lg shadow-lg p-3">
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
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#7b1c14] to-[#a03a2e] flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="text-xs">Total: {formatCurrency(totalRevenue)}</CardDescription>
              </div>
            </div>
            {trend.value > 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                trend.direction === 'up' ? 'text-primary-green' : 'text-red-500'
              }`}>
                <TrendingUp className={`h-4 w-4 ${trend.direction === 'down' ? 'rotate-180' : ''}`} />
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7b1c14" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7b1c14" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#7b1c14"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
