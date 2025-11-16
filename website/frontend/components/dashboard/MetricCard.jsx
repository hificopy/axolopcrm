import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  delay = 0
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-br from-primary-blue to-blue-600',
      text: 'text-primary-blue',
      lightBg: 'bg-blue-50'
    },
    green: {
      bg: 'bg-gradient-to-br from-primary-green to-green-600',
      text: 'text-primary-green',
      lightBg: 'bg-green-50'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-primary-yellow to-yellow-600',
      text: 'text-primary-yellow',
      lightBg: 'bg-yellow-50'
    },
    accent: {
      bg: 'bg-gradient-to-br from-[#7b1c14] to-[#a03a2e]',
      text: 'text-[#7b1c14]',
      lightBg: 'bg-red-50'
    },
    gray: {
      bg: 'bg-gradient-to-br from-gray-600 to-gray-700',
      text: 'text-gray-600',
      lightBg: 'bg-gray-50'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;
  const isPositiveTrend = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-crm-text-secondary mb-1">{title}</p>
              <p className="text-3xl font-bold text-crm-text-primary">{value}</p>

              {trendValue && (
                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                  isPositiveTrend ? 'text-primary-green' : 'text-red-500'
                }`}>
                  {isPositiveTrend ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{trendValue}</span>
                </div>
              )}
            </div>

            <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
