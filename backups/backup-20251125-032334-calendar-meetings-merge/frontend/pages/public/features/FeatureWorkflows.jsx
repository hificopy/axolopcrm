import FeaturePageTemplate from './FeaturePageTemplate';
import { Workflow, GitBranch, Zap, Clock, Bell, Settings, Repeat, Target } from 'lucide-react';

const FeatureWorkflows = () => {
  return (
    <FeaturePageTemplate
      title="Workflow Builder"
      subtitle="Automation"
      description="Automate any business process with a visual workflow builder. Connect triggers, actions, and conditions without writing code."
      icon={Workflow}
      iconColor="#10b981"
      iconBg="#059669"
      features={[
        {
          icon: GitBranch,
          title: 'Visual Canvas',
          description: 'Build workflows with drag-and-drop on an infinite canvas.',
        },
        {
          icon: Zap,
          title: 'Smart Triggers',
          description: 'Start workflows from form submissions, tags, dates, and more.',
        },
        {
          icon: Settings,
          title: 'Conditional Logic',
          description: 'Add if/then branches for complex decision trees.',
        },
        {
          icon: Clock,
          title: 'Time-Based Actions',
          description: 'Schedule actions with delays and specific times.',
        },
        {
          icon: Bell,
          title: 'Multi-Step Actions',
          description: 'Chain multiple actions: emails, tasks, updates, and more.',
        },
        {
          icon: Repeat,
          title: 'Recurring Workflows',
          description: 'Run workflows on a schedule: daily, weekly, or monthly.',
        },
      ]}
      benefits={[
        'Replace Zapier and save $150+/month',
        'No coding or technical skills required',
        'Unlimited workflows on all plans',
        'Native integration with all CRM data',
        'Test workflows before activating',
        'Detailed logs for troubleshooting',
      ]}
      useCases={[
        {
          title: 'Lead Routing',
          description: 'Automatically assign leads based on territory or criteria.',
        },
        {
          title: 'Onboarding Automation',
          description: 'Trigger welcome sequences when new clients sign up.',
        },
        {
          title: 'Task Management',
          description: 'Create follow-up tasks when deals move to new stages.',
        },
      ]}
    />
  );
};

export default FeatureWorkflows;
