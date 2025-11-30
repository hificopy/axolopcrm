import FeaturePageTemplate from './FeaturePageTemplate';
import { Users, Filter, Tag, TrendingUp, Zap, Target, Bell, BarChart } from 'lucide-react';

const FeatureLeads = () => {
  return (
    <FeaturePageTemplate
      title="Lead Management"
      subtitle="Sales Tools"
      description="Capture, organize, and nurture leads with intelligent scoring and automated follow-ups. Never let a hot lead slip through the cracks."
      icon={Users}
      iconColor="#d4463c"
      iconBg="#761B14"
      features={[
        {
          icon: Filter,
          title: 'Smart Lead Capture',
          description: 'Capture leads from forms, landing pages, and integrations automatically.',
        },
        {
          icon: Tag,
          title: 'Custom Tags & Segments',
          description: 'Organize leads with tags, custom fields, and dynamic segments.',
        },
        {
          icon: TrendingUp,
          title: 'AI Lead Scoring',
          description: 'Automatically score leads based on engagement and fit criteria.',
        },
        {
          icon: Zap,
          title: 'Instant Notifications',
          description: 'Get notified instantly when high-value leads come in.',
        },
        {
          icon: Target,
          title: 'Lead Assignment',
          description: 'Auto-assign leads to team members based on rules or round-robin.',
        },
        {
          icon: BarChart,
          title: 'Lead Analytics',
          description: 'Track lead sources, conversion rates, and pipeline velocity.',
        },
      ]}
      benefits={[
        'Reduce lead response time by 80%',
        'Increase conversion rates with AI scoring',
        'Never lose track of a lead again',
        'Automate repetitive follow-up tasks',
        'Unified view of all lead interactions',
        'Import leads from any source',
      ]}
      useCases={[
        {
          title: 'Marketing Agencies',
          description: 'Capture leads from client campaigns and automatically route them to account managers.',
        },
        {
          title: 'Real Estate Teams',
          description: 'Score property inquiries and prioritize hot buyers based on engagement.',
        },
        {
          title: 'SaaS Companies',
          description: 'Track trial signups and identify product-qualified leads ready for sales.',
        },
      ]}
    />
  );
};

export default FeatureLeads;
