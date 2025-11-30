import FeaturePageTemplate from './FeaturePageTemplate';
import { Workflow, Zap, Clock, GitBranch, Bell, Repeat, Target, Settings } from 'lucide-react';

const FeatureAutomation = () => {
  return (
    <FeaturePageTemplate
      title="Marketing Automation"
      subtitle="Marketing Tools"
      description="Put your marketing on autopilot with powerful automation. Nurture leads, trigger campaigns, and scale personalized outreach effortlessly."
      icon={Workflow}
      iconColor="#1fb5b9"
      iconBg="#14787b"
      features={[
        {
          icon: GitBranch,
          title: 'Visual Workflow Builder',
          description: 'Build automations with an intuitive drag-and-drop canvas.',
        },
        {
          icon: Zap,
          title: 'Trigger-Based Actions',
          description: 'Start automations when contacts take specific actions.',
        },
        {
          icon: Clock,
          title: 'Time Delays',
          description: 'Add delays between steps for perfect timing.',
        },
        {
          icon: Bell,
          title: 'Multi-Channel',
          description: 'Automate emails, SMS, tasks, and notifications.',
        },
        {
          icon: Repeat,
          title: 'Drip Campaigns',
          description: 'Set up ongoing nurture sequences that run automatically.',
        },
        {
          icon: Target,
          title: 'Behavior Tracking',
          description: 'Trigger actions based on website visits and email engagement.',
        },
      ]}
      benefits={[
        'Save 10+ hours per week on manual tasks',
        'Never forget to follow up again',
        'Personalize at scale without extra work',
        'Consistent customer experience every time',
        'Reduce human error in processes',
        'Focus on high-value activities',
      ]}
      useCases={[
        {
          title: 'Lead Nurturing',
          description: 'Automatically nurture leads from cold to sales-ready.',
        },
        {
          title: 'Onboarding Sequences',
          description: 'Guide new customers through setup and adoption.',
        },
        {
          title: 'Re-engagement Campaigns',
          description: 'Automatically reach out to inactive contacts.',
        },
      ]}
    />
  );
};

export default FeatureAutomation;
