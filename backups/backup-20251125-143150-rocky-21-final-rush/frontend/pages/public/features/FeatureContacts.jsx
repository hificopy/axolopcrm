import FeaturePageTemplate from './FeaturePageTemplate';
import { BookUser, Search, History, Mail, Phone, Building, Tag, Upload } from 'lucide-react';

const FeatureContacts = () => {
  return (
    <FeaturePageTemplate
      title="Contact Management"
      subtitle="Sales Tools"
      description="Build stronger relationships with a 360-degree view of every contact. Track interactions, notes, and history in one unified profile."
      icon={BookUser}
      iconColor="#d4463c"
      iconBg="#761B14"
      features={[
        {
          icon: Search,
          title: 'Instant Search',
          description: 'Find any contact instantly with powerful search and filters.',
        },
        {
          icon: History,
          title: 'Activity Timeline',
          description: 'See every interaction, email, and note in chronological order.',
        },
        {
          icon: Mail,
          title: 'Email Integration',
          description: 'Sync emails automatically from Gmail and Outlook.',
        },
        {
          icon: Phone,
          title: 'Call Logging',
          description: 'Log calls and notes directly from the contact profile.',
        },
        {
          icon: Building,
          title: 'Company Associations',
          description: 'Link contacts to companies and see organizational hierarchies.',
        },
        {
          icon: Upload,
          title: 'Easy Import',
          description: 'Import contacts from CSV, Excel, or other CRMs in minutes.',
        },
      ]}
      benefits={[
        'Never ask a client to repeat themselves',
        'Full context before every conversation',
        'Automatic email and call logging',
        'Custom fields for any data point',
        'Duplicate detection and merging',
        'Export contacts anytime you need',
      ]}
      useCases={[
        {
          title: 'Client Services',
          description: 'Maintain detailed client profiles with preferences and history.',
        },
        {
          title: 'Business Development',
          description: 'Track decision makers and champions at target accounts.',
        },
        {
          title: 'Event Management',
          description: 'Manage attendee lists and follow-up after events.',
        },
      ]}
    />
  );
};

export default FeatureContacts;
