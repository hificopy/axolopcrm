import { motion } from 'framer-motion';
import { FileText, Users, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function FormSubmissionsWidget({ data }) {
  const {
    total = 0,
    converted = 0,
    conversionRate = 0,
    trend = []
  } = data || {};

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-crm-border rounded-lg shadow-lg p-3">
          <p className="text-sm text-crm-text-secondary">{payload[0].payload.name}</p>
          <p className="text-lg font-semibold text-crm-text-primary">{payload[0].value} submissions</p>
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
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-yellow to-yellow-600 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Form Submissions</CardTitle>
              <CardDescription className="text-xs">Lead Generation Performance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <FileText className="h-5 w-5 text-primary-yellow mx-auto mb-1" />
              <div className="text-xs text-crm-text-secondary mb-1">Total</div>
              <div className="text-lg font-bold text-crm-text-primary">{total}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <Users className="h-5 w-5 text-primary-green mx-auto mb-1" />
              <div className="text-xs text-crm-text-secondary mb-1">Converted</div>
              <div className="text-lg font-bold text-crm-text-primary">{converted}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <TrendingUp className="h-5 w-5 text-primary-blue mx-auto mb-1" />
              <div className="text-xs text-crm-text-secondary mb-1">Rate</div>
              <div className="text-lg font-bold text-crm-text-primary">{conversionRate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Trend Chart */}
          {trend && trend.length > 0 && (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    stroke="#6B7280"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#6B7280"
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#F5A623"
                    strokeWidth={2}
                    dot={{ fill: '#F5A623', r: 3 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
