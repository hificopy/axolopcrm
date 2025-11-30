import FeaturePageTemplate from './FeaturePageTemplate';
import { Brain, Search, FileText, Link, Sparkles, Lock, Zap, Database } from 'lucide-react';

const FeatureSecondBrain = () => {
  return (
    <FeaturePageTemplate
      title="AI Second Brain"
      subtitle="AI Tools"
      description="Your private AI assistant that knows your business. Ask questions, get insights, and make decisions faster with local AI that respects your privacy."
      icon={Brain}
      iconColor="#f59e0b"
      iconBg="#d97706"
      features={[
        {
          icon: Search,
          title: 'Natural Language Search',
          description: 'Ask questions in plain English and get relevant answers.',
        },
        {
          icon: FileText,
          title: 'Document Intelligence',
          description: 'Upload documents and extract insights automatically.',
        },
        {
          icon: Link,
          title: 'CRM Integration',
          description: 'Access your contacts, deals, and history through AI.',
        },
        {
          icon: Sparkles,
          title: 'Smart Suggestions',
          description: 'Get AI-powered recommendations for next actions.',
        },
        {
          icon: Lock,
          title: 'Privacy-First',
          description: 'Your data stays local and never leaves your control.',
        },
        {
          icon: Database,
          title: 'Knowledge Base',
          description: 'Build a searchable knowledge base from your content.',
        },
      ]}
      benefits={[
        'Find any information in seconds',
        'Your data never leaves your servers',
        'No additional AI subscriptions needed',
        'Learns your business over time',
        'Works offline without internet',
        'Enterprise-grade security',
      ]}
      useCases={[
        {
          title: 'Sales Prep',
          description: 'Instantly recall client history and preferences before calls.',
        },
        {
          title: 'Knowledge Management',
          description: 'Build institutional knowledge that anyone can search.',
        },
        {
          title: 'Decision Support',
          description: 'Get AI insights based on your historical data.',
        },
      ]}
    />
  );
};

export default FeatureSecondBrain;
