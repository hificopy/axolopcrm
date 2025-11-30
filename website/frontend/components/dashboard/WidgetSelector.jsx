import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  Mail,
  FileText,
  Percent,
  LayoutGrid,
  Sparkles,
  Filter,
  Search,
  Target,
  Award,
  Calendar,
  Clock,
  CheckSquare,
  Activity,
  PieChart,
  Briefcase,
  UserCheck,
  Phone,
  MessageSquare,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

// Comprehensive widget library for agency owners - 35+ widgets
const WIDGET_CATEGORIES = {
  sales: {
    name: 'Sales & Revenue',
    icon: DollarSign,
    widgets: [
      {
        id: 'total-revenue',
        name: 'Total Revenue',
        icon: DollarSign,
        component: 'MetricCard',
        props: { title: 'Total Revenue', color: 'accent', subtitle: 'Current period' },
        description: 'Revenue metrics with trend'
      },
      {
        id: 'revenue-chart',
        name: 'Revenue Chart',
        icon: BarChart3,
        component: 'RevenueChart',
        props: { title: 'Revenue Overview' },
        description: 'Revenue over time with gradient'
      },
      {
        id: 'mrr',
        name: 'Monthly Recurring Revenue',
        icon: TrendingUp,
        component: 'MetricCard',
        props: { title: 'MRR', color: 'accent', subtitle: 'Recurring revenue' },
        description: 'Monthly recurring revenue tracking'
      },
      {
        id: 'avg-deal-size',
        name: 'Average Deal Size',
        icon: DollarSign,
        component: 'MetricCard',
        props: { title: 'Avg. Deal Size', color: 'accent', subtitle: 'Per closed deal' },
        description: 'Average value of closed deals'
      },
      {
        id: 'win-rate',
        name: 'Win Rate',
        icon: Award,
        component: 'MetricCard',
        props: { title: 'Win Rate', color: 'accent', subtitle: 'Deals won vs lost' },
        description: 'Percentage of deals won'
      },
      {
        id: 'sales-velocity',
        name: 'Sales Velocity',
        icon: Zap,
        component: 'MetricCard',
        props: { title: 'Sales Velocity', color: 'accent', subtitle: 'Avg. days to close' },
        description: 'Speed of closing deals'
      },
      {
        id: 'pipeline-value',
        name: 'Pipeline Value',
        icon: TrendingUp,
        component: 'MetricCard',
        props: { title: 'Pipeline Value', color: 'accent', subtitle: 'Total opportunity value' },
        description: 'Total value in pipeline'
      },
      {
        id: 'full-sales',
        name: 'Sales Overview',
        icon: TrendingUp,
        component: 'FullSalesWidget',
        props: {},
        description: 'Complete sales metrics dashboard'
      },
    ]
  },
  leads: {
    name: 'Lead Management',
    icon: Users,
    widgets: [
      {
        id: 'new-leads',
        name: 'New Leads',
        icon: Users,
        component: 'MetricCard',
        props: { title: 'New Leads', color: 'accent', subtitle: 'This period' },
        description: 'New leads acquired'
      },
      {
        id: 'active-leads',
        name: 'Active Leads',
        icon: UserCheck,
        component: 'MetricCard',
        props: { title: 'Active Leads', color: 'accent', subtitle: 'In pipeline' },
        description: 'Currently active leads'
      },
      {
        id: 'lead-source',
        name: 'Lead Sources',
        icon: PieChart,
        component: 'MetricCard',
        props: { title: 'Top Lead Source', color: 'accent', subtitle: 'Best performing' },
        description: 'Lead source breakdown'
      },
      {
        id: 'lead-qualification-rate',
        name: 'Qualification Rate',
        icon: Target,
        component: 'MetricCard',
        props: { title: 'Qualification Rate', color: 'accent', subtitle: 'Leads qualified' },
        description: 'Lead qualification percentage'
      },
      {
        id: 'hot-leads',
        name: 'Hot Leads',
        icon: Zap,
        component: 'MetricCard',
        props: { title: 'Hot Leads', color: 'accent', subtitle: 'High score leads' },
        description: 'High-priority leads'
      },
      {
        id: 'conversion-funnel',
        name: 'Conversion Funnel',
        icon: Filter,
        component: 'ConversionFunnelWidget',
        props: {},
        description: 'Lead to customer journey'
      },
      {
        id: 'conversion-rate',
        name: 'Conversion Rate',
        icon: Percent,
        component: 'MetricCard',
        props: { title: 'Conversion Rate', color: 'accent', subtitle: 'Lead to customer' },
        description: 'Overall conversion rate'
      },
    ]
  },
  marketing: {
    name: 'Marketing',
    icon: Mail,
    widgets: [
      {
        id: 'active-campaigns',
        name: 'Active Campaigns',
        icon: Mail,
        component: 'MetricCard',
        props: { title: 'Active Campaigns', color: 'accent', subtitle: 'Running now' },
        description: 'Current active campaigns'
      },
      {
        id: 'email-open-rate',
        name: 'Email Open Rate',
        icon: Mail,
        component: 'MetricCard',
        props: { title: 'Open Rate', color: 'accent', subtitle: 'Email opens' },
        description: 'Email open percentage'
      },
      {
        id: 'click-through-rate',
        name: 'Click-Through Rate',
        icon: ArrowUpRight,
        component: 'MetricCard',
        props: { title: 'CTR', color: 'accent', subtitle: 'Link clicks' },
        description: 'Email click-through rate'
      },
      {
        id: 'form-submissions',
        name: 'Form Submissions',
        icon: FileText,
        component: 'FormSubmissionsWidget',
        props: {},
        description: 'Form submission analytics'
      },
      {
        id: 'form-conversion-rate',
        name: 'Form Conversion Rate',
        icon: Target,
        component: 'MetricCard',
        props: { title: 'Form Conv. Rate', color: 'accent', subtitle: 'Forms to leads' },
        description: 'Form to lead conversion'
      },
      {
        id: 'full-marketing',
        name: 'Marketing Performance',
        icon: Mail,
        component: 'FullMarketingWidget',
        props: {},
        description: 'Complete marketing analytics'
      },
    ]
  },
  tasks: {
    name: 'Tasks & Productivity',
    icon: CheckSquare,
    widgets: [
      {
        id: 'tasks-due-today',
        name: 'Tasks Due Today',
        icon: Clock,
        component: 'MetricCard',
        props: { title: 'Due Today', color: 'accent', subtitle: 'Tasks pending' },
        description: 'Tasks due today count'
      },
      {
        id: 'overdue-tasks',
        name: 'Overdue Tasks',
        icon: CheckSquare,
        component: 'MetricCard',
        props: { title: 'Overdue', color: 'accent', subtitle: 'Past due date' },
        description: 'Overdue task count'
      },
      {
        id: 'tasks-completed',
        name: 'Tasks Completed',
        icon: Award,
        component: 'MetricCard',
        props: { title: 'Completed', color: 'accent', subtitle: 'This week' },
        description: 'Tasks completed this week'
      },
      {
        id: 'activity-feed',
        name: 'Recent Activity',
        icon: Activity,
        component: 'MetricCard',
        props: { title: 'Activity', color: 'accent', subtitle: 'Recent actions' },
        description: 'Recent activity feed'
      },
      {
        id: 'team-performance',
        name: 'Team Performance',
        icon: Users,
        component: 'MetricCard',
        props: { title: 'Team Score', color: 'accent', subtitle: 'Productivity index' },
        description: 'Team productivity metrics'
      },
    ]
  },
  calendar: {
    name: 'Calendar & Meetings',
    icon: Calendar,
    widgets: [
      {
        id: 'upcoming-meetings',
        name: 'Upcoming Meetings',
        icon: Calendar,
        component: 'MetricCard',
        props: { title: 'Upcoming', color: 'accent', subtitle: 'Scheduled meetings' },
        description: 'Next scheduled meetings'
      },
      {
        id: 'meetings-this-week',
        name: 'Meetings This Week',
        icon: Calendar,
        component: 'MetricCard',
        props: { title: 'This Week', color: 'accent', subtitle: 'Meetings count' },
        description: 'Meetings scheduled this week'
      },
      {
        id: 'no-show-rate',
        name: 'No-Show Rate',
        icon: Clock,
        component: 'MetricCard',
        props: { title: 'No-Show Rate', color: 'accent', subtitle: 'Missed meetings' },
        description: 'Meeting no-show percentage'
      },
      {
        id: 'calls-today',
        name: 'Calls Today',
        icon: Phone,
        component: 'MetricCard',
        props: { title: 'Calls Today', color: 'accent', subtitle: 'Scheduled calls' },
        description: 'Calls scheduled for today'
      },
    ]
  },
  financial: {
    name: 'Financial',
    icon: PieChart,
    widgets: [
      {
        id: 'profit-margin',
        name: 'Profit Margin',
        icon: PieChart,
        component: 'ProfitMarginWidget',
        props: {},
        description: 'Profit and loss analysis'
      },
      {
        id: 'revenue-vs-expenses',
        name: 'Revenue vs Expenses',
        icon: BarChart3,
        component: 'MetricCard',
        props: { title: 'Net Profit', color: 'accent', subtitle: 'Revenue - Expenses' },
        description: 'Net profit calculation'
      },
      {
        id: 'active-clients',
        name: 'Active Clients',
        icon: Briefcase,
        component: 'MetricCard',
        props: { title: 'Active Clients', color: 'accent', subtitle: 'Current customers' },
        description: 'Active client count'
      },
      {
        id: 'customer-ltv',
        name: 'Customer LTV',
        icon: DollarSign,
        component: 'MetricCard',
        props: { title: 'Customer LTV', color: 'accent', subtitle: 'Lifetime value' },
        description: 'Customer lifetime value'
      },
      {
        id: 'active-accounts',
        name: 'Active Accounts',
        icon: Users,
        component: 'MetricCard',
        props: { title: 'Active Accounts', color: 'accent', subtitle: 'Customer base' },
        description: 'Total active accounts'
      },
    ]
  }
};

export default function WidgetSelector({ isOpen, onClose, onAddWidget }) {
  const [selectedCategory, setSelectedCategory] = useState('sales');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddWidget = (widget) => {
    const widgetId = `${widget.id}-${Date.now()}`;
    const isMetric = widget.component === 'MetricCard';
    const isFull = widget.component.startsWith('Full');
    const newWidget = {
      i: widgetId,
      x: 0,
      y: Infinity, // Add to the bottom
      w: isMetric ? 3 : isFull ? 6 : 6,
      h: isMetric ? 2 : isFull ? 4 : 3,
      minW: isMetric ? 2 : isFull ? 4 : 4,
      minH: isMetric ? 2 : isFull ? 4 : 3,
      component: widget.component,
      props: widget.props
    };
    onAddWidget(newWidget);
  };

  const filteredWidgets = searchQuery
    ? Object.values(WIDGET_CATEGORIES).flatMap(cat =>
        cat.widgets.filter(w =>
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : WIDGET_CATEGORIES[selectedCategory]?.widgets || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-[#1a1d24] border-l border-crm-border shadow-2xl z-50 flex flex-col pt-20"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-crm-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3F0D28] to-[#3F0D28] flex items-center justify-center">
                  <LayoutGrid className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-crm-text-primary">Add Widgets</h2>
                  <p className="text-xs text-crm-text-secondary">Customize your dashboard</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-crm-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search widgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories */}
            {!searchQuery && (
              <div className="flex flex-wrap gap-2 p-4 border-b border-crm-border">
                {Object.entries(WIDGET_CATEGORIES).map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg text-xs transition-colors ${
                        selectedCategory === key
                          ? 'bg-[#3F0D28] text-white font-medium'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Widget List */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {filteredWidgets.map((widget) => {
                  const Icon = widget.icon;
                  return (
                    <motion.div
                      key={widget.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group border border-crm-border rounded-lg p-4 hover:border-[#3F0D28] hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleAddWidget(widget)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center group-hover:from-[#3F0D28]/10 group-hover:to-[#3F0D28]/20 transition-colors">
                          <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-[#3F0D28] dark:group-hover:text-[#3F0D28]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm text-crm-text-primary group-hover:text-[#3F0D28] transition-colors">
                            {widget.name}
                          </h3>
                          <p className="text-xs text-crm-text-secondary mt-1">
                            {widget.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddWidget(widget);
                          }}
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filteredWidgets.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-sm text-crm-text-secondary">No widgets found</p>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
