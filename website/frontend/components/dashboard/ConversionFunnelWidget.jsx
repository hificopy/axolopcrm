import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, UserCheck, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const COLORS = {
  leads: '#5BB9F5',
  qualified: '#2DCE89',
  won: '#7b1c14'
};

export default function ConversionFunnelWidget({ data }) {
  const { leads = 0, qualified = 0, won = 0 } = data || {};

  const chartData = useMemo(() => [
    { name: 'Leads', value: leads, fill: COLORS.leads },
    { name: 'Qualified', value: qualified, fill: COLORS.qualified },
    { name: 'Won', value: won, fill: COLORS.won },
  ], [leads, qualified, won]);

  const conversionRate = useMemo(() => {
    return leads > 0 ? ((won / leads) * 100).toFixed(1) : 0;
  }, [leads, won]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage = leads > 0 ? ((payload[0].value / leads) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white border border-crm-border rounded-lg shadow-lg p-3">
          <p className="text-sm text-crm-text-secondary">{payload[0].payload.name}</p>
          <p className="text-lg font-semibold text-crm-text-primary">{payload[0].value}</p>
          <p className="text-xs text-crm-text-secondary">{percentage}% of total</p>
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
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-blue to-blue-600 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Conversion Funnel</CardTitle>
                <CardDescription className="text-xs">Lead to Customer Journey</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-crm-text-primary">{conversionRate}%</div>
              <div className="text-xs text-crm-text-secondary">Conversion Rate</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1000}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <div className="text-xs text-primary-blue font-medium">Leads</div>
              <div className="text-lg font-bold text-crm-text-primary">{leads}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center">
              <div className="text-xs text-primary-green font-medium">Qualified</div>
              <div className="text-lg font-bold text-crm-text-primary">{qualified}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-2 text-center">
              <div className="text-xs text-[#7b1c14] font-medium">Won</div>
              <div className="text-lg font-bold text-crm-text-primary">{won}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
