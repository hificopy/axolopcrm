import FeaturePageTemplate from './FeaturePageTemplate';
import { Zap, MousePointer, Calendar, Tag, Bell, Settings, Globe, Target } from 'lucide-react';

const FeatureTriggers = () => {
  return (
    <FeaturePageTemplate
      title="Smart Triggers"
      subtitle="Automation"
      description="React instantly to customer actions with event-based triggers. Connect any event to any action for real-time automation."
      icon={Zap}
      iconColor="#10b981"
      iconBg="#059669"
      features={[
        {
          icon: MousePointer,
          title: 'Behavior Triggers',
          description: 'React to page visits, clicks, and engagement.',
        },
        {
          icon: Calendar,
          title: 'Date Triggers',
          description: 'Trigger actions on birthdays, renewals, or any date.',
        },
        {
          icon: Tag,
          title: 'Tag Triggers',
          description: 'Fire automations when tags are added or removed.',
        },
        {
          icon: Bell,
          title: 'Event Notifications',
          description: 'Get notified when important events occur.',
        },
        {
          icon: Globe,
          title: 'Webhook Triggers',
          description: 'Trigger workflows from external systems.',
        },
        {
          icon: Settings,
          title: 'Custom Events',
          description: 'Define custom events for your specific needs.',
        },
      ]}
      benefits={[
        'Respond to customer actions in real-time',
        'No more missed opportunities',
        'Personalized experiences at scale',
        'Connect with any external system',
        'Reduce manual monitoring',
        'Create event-driven workflows',
      ]}
      useCases={[
        {
          title: 'Hot Lead Alerts',
          description: 'Get notified instantly when leads show buying intent.',
        },
        {
          title: 'Renewal Reminders',
          description: 'Trigger outreach before contracts expire.',
        },
        {
          title: 'Re-engagement',
          description: 'Reach out when contacts become inactive.',
        },
      ]}
    />
  );
};

export default FeatureTriggers;
