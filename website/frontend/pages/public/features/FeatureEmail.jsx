import FeaturePageTemplate from './FeaturePageTemplate';
import { Mail, Sparkles, BarChart, Users, Clock, Palette, MousePointer, Send } from 'lucide-react';

const FeatureEmail = () => {
  return (
    <FeaturePageTemplate
      title="Email Marketing"
      subtitle="Marketing Tools"
      description="Create beautiful email campaigns that convert. Design, personalize, and automate emails that your audience actually wants to read."
      icon={Mail}
      iconColor="#1fb5b9"
      iconBg="#14787b"
      features={[
        {
          icon: Palette,
          title: 'Drag & Drop Builder',
          description: 'Create stunning emails without any coding knowledge.',
        },
        {
          icon: Sparkles,
          title: 'AI Subject Lines',
          description: 'Generate high-converting subject lines with AI assistance.',
        },
        {
          icon: Users,
          title: 'Smart Segmentation',
          description: 'Send targeted emails to specific audience segments.',
        },
        {
          icon: Clock,
          title: 'Send Time Optimization',
          description: 'Automatically send emails when recipients are most likely to engage.',
        },
        {
          icon: BarChart,
          title: 'Campaign Analytics',
          description: 'Track opens, clicks, and conversions in real-time.',
        },
        {
          icon: MousePointer,
          title: 'A/B Testing',
          description: 'Test subject lines, content, and send times to optimize results.',
        },
      ]}
      benefits={[
        'Replace expensive email tools like Mailchimp',
        'Higher deliverability with dedicated IPs',
        'Unlimited email sends on all plans',
        'Beautiful templates ready to customize',
        'CRM integration for personalization',
        'Compliance with GDPR and CAN-SPAM',
      ]}
      useCases={[
        {
          title: 'Newsletter Campaigns',
          description: 'Keep your audience engaged with regular updates and content.',
        },
        {
          title: 'Product Launches',
          description: 'Build anticipation and drive sales with launch sequences.',
        },
        {
          title: 'Re-engagement',
          description: 'Win back inactive contacts with targeted campaigns.',
        },
      ]}
    />
  );
};

export default FeatureEmail;
