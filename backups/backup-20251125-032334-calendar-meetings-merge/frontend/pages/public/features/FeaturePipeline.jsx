import FeaturePageTemplate from './FeaturePageTemplate';
import { Kanban, Move, DollarSign, Clock, Filter, BarChart3, Users, Target } from 'lucide-react';

const FeaturePipeline = () => {
  return (
    <FeaturePageTemplate
      title="Visual Pipeline"
      subtitle="Sales Tools"
      description="Visualize your entire sales process with drag-and-drop Kanban boards. Move deals through stages and forecast revenue with confidence."
      icon={Kanban}
      iconColor="#d4463c"
      iconBg="#761B14"
      features={[
        {
          icon: Move,
          title: 'Drag & Drop Interface',
          description: 'Move deals between stages with intuitive drag-and-drop.',
        },
        {
          icon: DollarSign,
          title: 'Deal Values & Forecasting',
          description: 'Track deal values and get accurate revenue forecasts.',
        },
        {
          icon: Clock,
          title: 'Stage Duration Tracking',
          description: 'See how long deals stay in each stage to optimize your process.',
        },
        {
          icon: Filter,
          title: 'Multiple Pipelines',
          description: 'Create separate pipelines for different products or services.',
        },
        {
          icon: BarChart3,
          title: 'Pipeline Analytics',
          description: 'Analyze win rates, deal velocity, and bottlenecks.',
        },
        {
          icon: Users,
          title: 'Team Collaboration',
          description: 'Share pipelines and collaborate on deals with your team.',
        },
      ]}
      benefits={[
        'See your entire sales pipeline at a glance',
        'Forecast revenue with weighted probabilities',
        'Identify and fix bottlenecks in your process',
        'Customize stages for your unique workflow',
        'Track deal history and activities',
        'Mobile-friendly pipeline management',
      ]}
      useCases={[
        {
          title: 'Sales Teams',
          description: 'Track opportunities from qualification to close with full visibility.',
        },
        {
          title: 'Account Managers',
          description: 'Manage renewals and upsells with dedicated account pipelines.',
        },
        {
          title: 'Consultants',
          description: 'Track project proposals and client engagements in one view.',
        },
      ]}
    />
  );
};

export default FeaturePipeline;
