import FeaturePageTemplate from './FeaturePageTemplate';
import { BarChart3, TrendingUp, PieChart, LineChart, Download, Calendar, Target, Zap } from 'lucide-react';

const FeatureAnalytics = () => {
  return (
    <FeaturePageTemplate
      title="Sales Analytics"
      subtitle="Sales Tools"
      description="Make data-driven decisions with real-time analytics and customizable dashboards. Track KPIs, identify trends, and optimize performance."
      icon={BarChart3}
      iconColor="#E92C92"
      iconBg="#E92C92"
      features={[
        {
          icon: TrendingUp,
          title: 'Real-time Dashboards',
          description: 'Live metrics that update as your team closes deals.',
        },
        {
          icon: PieChart,
          title: 'Custom Reports',
          description: 'Build reports with drag-and-drop report builder.',
        },
        {
          icon: LineChart,
          title: 'Trend Analysis',
          description: 'Spot trends and patterns over any time period.',
        },
        {
          icon: Download,
          title: 'Export & Share',
          description: 'Export reports to PDF, Excel, or schedule email delivery.',
        },
        {
          icon: Calendar,
          title: 'Period Comparisons',
          description: 'Compare performance across weeks, months, or quarters.',
        },
        {
          icon: Target,
          title: 'Goal Tracking',
          description: 'Set targets and track progress toward sales goals.',
        },
      ]}
      benefits={[
        'See exactly where revenue is coming from',
        'Identify top performers and best practices',
        'Forecast with confidence using historical data',
        'Spot at-risk deals before they slip',
        'Measure ROI on marketing campaigns',
        'Share insights with stakeholders easily',
      ]}
      useCases={[
        {
          title: 'Sales Leaders',
          description: 'Track team performance and pipeline health at a glance.',
        },
        {
          title: 'Revenue Operations',
          description: 'Build custom reports for accurate forecasting.',
        },
        {
          title: 'Marketing Teams',
          description: 'Measure lead quality and campaign attribution.',
        },
      ]}
    />
  );
};

export default FeatureAnalytics;
