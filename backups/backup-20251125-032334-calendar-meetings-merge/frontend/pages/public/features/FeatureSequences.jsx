import FeaturePageTemplate from './FeaturePageTemplate';
import { ListOrdered, Mail, Clock, Users, BarChart, Pause, Play, Target } from 'lucide-react';

const FeatureSequences = () => {
  return (
    <FeaturePageTemplate
      title="Email Sequences"
      subtitle="Automation"
      description="Set up automated email sequences that nurture leads and follow up automatically. Personal touch at scale."
      icon={ListOrdered}
      iconColor="#10b981"
      iconBg="#059669"
      features={[
        {
          icon: Mail,
          title: 'Multi-Step Sequences',
          description: 'Create sequences with multiple emails and touchpoints.',
        },
        {
          icon: Clock,
          title: 'Smart Timing',
          description: 'Set delays between emails for natural cadence.',
        },
        {
          icon: Users,
          title: 'Bulk Enrollment',
          description: 'Add contacts to sequences individually or in bulk.',
        },
        {
          icon: Pause,
          title: 'Auto-Pause',
          description: 'Automatically stop when contacts reply or book.',
        },
        {
          icon: BarChart,
          title: 'Sequence Analytics',
          description: 'Track opens, replies, and conversions per step.',
        },
        {
          icon: Target,
          title: 'A/B Testing',
          description: 'Test different email variations to optimize results.',
        },
      ]}
      benefits={[
        'Follow up consistently without manual effort',
        'Personalize at scale with merge fields',
        'Stop sequences when goals are met',
        'Reply detection to prevent awkward sends',
        'Business hours sending for better results',
        'Clone and customize existing sequences',
      ]}
      useCases={[
        {
          title: 'Sales Outreach',
          description: 'Reach out to prospects with persistent follow-up.',
        },
        {
          title: 'Lead Nurturing',
          description: 'Educate and warm up leads over time.',
        },
        {
          title: 'Customer Success',
          description: 'Check in with customers after onboarding.',
        },
      ]}
    />
  );
};

export default FeatureSequences;
