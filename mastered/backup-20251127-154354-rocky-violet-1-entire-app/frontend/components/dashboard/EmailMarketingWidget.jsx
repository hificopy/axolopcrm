import { motion } from 'framer-motion';
import { Mail, Send, Eye, MousePointer } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function EmailMarketingWidget({ data }) {
  const {
    sent = 0,
    delivered = 0,
    opened = 0,
    clicked = 0,
    openRate = 0,
    clickRate = 0
  } = data || {};

  // Branded red color palette for metrics
  const metrics = [
    {
      label: 'Sent',
      value: sent,
      icon: Send,
      color: 'text-[#3F0D28] dark:text-[#3F0D28]',
      bgColor: 'bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200/50 dark:border-neutral-700/50'
    },
    {
      label: 'Opened',
      value: opened,
      icon: Eye,
      color: 'text-[#3F0D28] dark:text-[#3F0D28]',
      bgColor: 'bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200/50 dark:border-neutral-700/50'
    },
    {
      label: 'Clicked',
      value: clicked,
      icon: MousePointer,
      color: 'text-[#CA4238] dark:text-[#3F0D28]',
      bgColor: 'bg-neutral-50 dark:bg-neutral-900/20 border border-neutral-200/50 dark:border-neutral-700/50'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full flex flex-col bg-white border border-black/[0.05] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 relative group overflow-hidden">

        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3F0D28] to-[#3F0D28] flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Mail className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-lg">Email Marketing</CardTitle>
              <CardDescription className="text-xs">Campaign Performance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 relative z-10">
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`${metric.bgColor} rounded-lg p-3 text-center backdrop-blur-sm hover:shadow-md transition-shadow`}
              >
                <metric.icon className={`h-5 w-5 ${metric.color} mx-auto mb-1`} />
                <div className="text-xs text-crm-text-secondary mb-1">{metric.label}</div>
                <div className="text-lg font-bold text-crm-text-primary">{metric.value.toLocaleString()}</div>
              </motion.div>
            ))}
          </div>

          {/* Rates */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-crm-text-secondary">Open Rate</span>
                <span className="text-sm font-semibold text-crm-text-primary">{openRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${openRate}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-[#3F0D28] to-[#3F0D28]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-crm-text-secondary">Click Rate</span>
                <span className="text-sm font-semibold text-crm-text-primary">{clickRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${clickRate}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-full bg-gradient-to-r from-[#3F0D28] to-[#CA4238]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-crm-text-secondary">Delivery Rate</span>
                <span className="text-sm font-semibold text-crm-text-primary">
                  {sent > 0 ? ((delivered / sent) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sent > 0 ? (delivered / sent) * 100 : 0}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-gradient-to-r from-[#CA4238] to-[#3F0D28]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
