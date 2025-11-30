import FeaturePageTemplate from './FeaturePageTemplate';
import { FileText, Layers, Zap, Palette, BarChart, Code, Globe, Shield } from 'lucide-react';

const FeatureForms = () => {
  return (
    <FeaturePageTemplate
      title="Form Builder"
      subtitle="Marketing Tools"
      description="Build beautiful, high-converting forms in minutes. Capture leads, collect payments, and gather feedback with no coding required."
      icon={FileText}
      iconColor="#1fb5b9"
      iconBg="#14787b"
      features={[
        {
          icon: Layers,
          title: 'Drag & Drop Builder',
          description: 'Create forms with an intuitive visual builder.',
        },
        {
          icon: Zap,
          title: 'Conditional Logic',
          description: 'Show or hide fields based on previous answers.',
        },
        {
          icon: Palette,
          title: 'Custom Styling',
          description: 'Match forms to your brand with custom colors and fonts.',
        },
        {
          icon: BarChart,
          title: 'Submission Analytics',
          description: 'Track form views, submissions, and drop-off rates.',
        },
        {
          icon: Code,
          title: 'Easy Embedding',
          description: 'Embed forms anywhere with a simple code snippet.',
        },
        {
          icon: Shield,
          title: 'Spam Protection',
          description: 'Built-in CAPTCHA and honeypot fields to block spam.',
        },
      ]}
      benefits={[
        'Replace Typeform and save $100+/month',
        'Unlimited forms and submissions',
        'Direct CRM integration for leads',
        'File uploads and signatures',
        'Payment collection with Stripe',
        'Mobile-responsive by default',
      ]}
      useCases={[
        {
          title: 'Lead Generation',
          description: 'Capture leads on landing pages with optimized forms.',
        },
        {
          title: 'Client Onboarding',
          description: 'Collect client information and documents during onboarding.',
        },
        {
          title: 'Event Registration',
          description: 'Manage event signups with custom registration forms.',
        },
      ]}
    />
  );
};

export default FeatureForms;
