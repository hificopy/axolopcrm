import FeaturePageTemplate from './FeaturePageTemplate';
import { Layout, FileText, MessageSquare, CreditCard, Bell, Palette, Lock, Users } from 'lucide-react';

const FeaturePortal = () => {
  return (
    <FeaturePageTemplate
      title="Client Portal"
      subtitle="Service Tools"
      description="Give clients a branded self-service portal. Share files, track projects, view invoices, and communicate in one secure space."
      icon={Layout}
      iconColor="#8b5cf6"
      iconBg="#6d28d9"
      features={[
        {
          icon: FileText,
          title: 'File Sharing',
          description: 'Share documents and assets securely with clients.',
        },
        {
          icon: MessageSquare,
          title: 'Client Messaging',
          description: 'Communicate with clients directly through the portal.',
        },
        {
          icon: CreditCard,
          title: 'Invoice Access',
          description: 'Clients can view and pay invoices online.',
        },
        {
          icon: Bell,
          title: 'Project Updates',
          description: 'Keep clients informed with automatic project updates.',
        },
        {
          icon: Palette,
          title: 'White-Label Branding',
          description: 'Customize the portal with your logo and colors.',
        },
        {
          icon: Lock,
          title: 'Secure Access',
          description: 'Role-based permissions and secure login for clients.',
        },
      ]}
      benefits={[
        'Professional client experience',
        'Reduce back-and-forth emails',
        'Centralized communication history',
        'Faster invoice payments',
        'Clients can access files anytime',
        'Builds trust and transparency',
      ]}
      useCases={[
        {
          title: 'Agencies',
          description: 'Share deliverables and updates with clients professionally.',
        },
        {
          title: 'Consultants',
          description: 'Provide clients with a dedicated space for collaboration.',
        },
        {
          title: 'Professional Services',
          description: 'Manage client relationships and document sharing.',
        },
      ]}
    />
  );
};

export default FeaturePortal;
