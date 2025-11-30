import { motion } from 'framer-motion';
import { Mail, Users, MousePointerClick, Send, Eye, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { formatDateRange, getPeriodLabel } from './lib/utils';

export default function FullMarketingWidget({ data = {}, timeRange = 'month' }) {
  const stats = [
    {
      label: 'Campaigns',
      value: data.activeCampaigns || 0,
      icon: Send,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 backdrop-blur-sm'
    },
    {
      label: 'Email Opens',
      value: data.emailOpens || 0,
      icon: Eye,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 backdrop-blur-sm'
    },
    {
      label: 'Click Rate',
      value: data.clickRate ? `${data.clickRate.toFixed(1)}%` : '0%',
      icon: MousePointerClick,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 backdrop-blur-sm'
    },
    {
      label: 'Subscribers',
      value: data.totalSubscribers || 0,
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/50 dark:border-purple-900/30 backdrop-blur-sm'
    },
  ];

  const details = [
    { label: 'Engagement Rate', value: data.engagementRate ? `${data.engagementRate.toFixed(1)}%` : '0%' },
    { label: 'Unsubscribe Rate', value: data.unsubscribeRate ? `${data.unsubscribeRate.toFixed(2)}%` : '0%' },
    { label: 'Avg. Open Rate', value: data.avgOpenRate ? `${data.avgOpenRate.toFixed(1)}%` : '0%' },
    { label: 'New Subscribers', value: data.newSubscribers || '0' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full"
    >
      <Card className="h-full w-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Marketing Performance</CardTitle>
                <p className="text-xs text-crm-text-secondary">Campaign metrics & analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
              <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{getPeriodLabel(timeRange)}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{formatDateRange(timeRange)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`${stat.bg} rounded-lg p-3`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-xs text-crm-text-secondary">{stat.label}</span>
                  </div>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Detailed Stats */}
          <div className="border-t border-crm-border pt-3 space-y-2">
            <h4 className="text-xs font-semibold text-crm-text-secondary uppercase tracking-wider">Performance Details</h4>
            {details.map((detail, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded">
                <span className="text-sm text-crm-text-secondary">{detail.label}</span>
                <span className="text-sm font-semibold text-crm-text-primary">{detail.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
