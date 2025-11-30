import FeaturePageTemplate from './FeaturePageTemplate';
import { Ticket, Inbox, Tag, Clock, Users, MessageSquare, BarChart, Zap } from 'lucide-react';

const FeatureTickets = () => {
  return (
    <FeaturePageTemplate
      title="Support Tickets"
      subtitle="Service Tools"
      description="Deliver exceptional customer support with a unified inbox. Track, prioritize, and resolve tickets faster than ever before."
      icon={Ticket}
      iconColor="#8b5cf6"
      iconBg="#6d28d9"
      features={[
        {
          icon: Inbox,
          title: 'Unified Inbox',
          description: 'All support channels in one place: email, chat, and forms.',
        },
        {
          icon: Tag,
          title: 'Smart Categorization',
          description: 'Auto-tag and route tickets based on content and keywords.',
        },
        {
          icon: Clock,
          title: 'SLA Tracking',
          description: 'Set response time goals and track SLA compliance.',
        },
        {
          icon: Users,
          title: 'Team Assignment',
          description: 'Assign tickets to individuals or teams with round-robin.',
        },
        {
          icon: MessageSquare,
          title: 'Canned Responses',
          description: 'Reply faster with saved response templates.',
        },
        {
          icon: BarChart,
          title: 'Support Analytics',
          description: 'Track resolution times, satisfaction, and team performance.',
        },
      ]}
      benefits={[
        'Respond 3x faster with canned responses',
        'Never lose a customer request again',
        'Clear visibility into support workload',
        'Escalation rules for urgent issues',
        'Customer history at your fingertips',
        'Integrate with CRM for full context',
      ]}
      useCases={[
        {
          title: 'Customer Support',
          description: 'Handle inbound support requests efficiently.',
        },
        {
          title: 'Account Management',
          description: 'Track client requests and escalations in one place.',
        },
        {
          title: 'Internal IT Help Desk',
          description: 'Manage employee tech support requests.',
        },
      ]}
    />
  );
};

export default FeatureTickets;
