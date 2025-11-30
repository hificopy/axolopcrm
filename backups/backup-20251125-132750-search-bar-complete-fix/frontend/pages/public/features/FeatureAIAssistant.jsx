import FeaturePageTemplate from './FeaturePageTemplate';
import { Bot, MessageSquare, Sparkles, Mail, FileText, Lightbulb, Zap, Wand2 } from 'lucide-react';

const FeatureAIAssistant = () => {
  return (
    <FeaturePageTemplate
      title="AI Assistant"
      subtitle="AI Tools"
      description="Your intelligent co-pilot for daily tasks. Write emails, summarize notes, and get smart recommendations powered by advanced AI."
      icon={Bot}
      iconColor="#f59e0b"
      iconBg="#d97706"
      features={[
        {
          icon: Mail,
          title: 'Email Drafting',
          description: 'Generate professional emails with the right tone and context.',
        },
        {
          icon: FileText,
          title: 'Note Summarization',
          description: 'Turn long meeting notes into actionable summaries.',
        },
        {
          icon: Sparkles,
          title: 'Content Generation',
          description: 'Create marketing copy, proposals, and templates instantly.',
        },
        {
          icon: Lightbulb,
          title: 'Smart Suggestions',
          description: 'Get AI recommendations based on your workflow.',
        },
        {
          icon: Wand2,
          title: 'One-Click Actions',
          description: 'Complete tasks with AI-powered quick actions.',
        },
        {
          icon: MessageSquare,
          title: 'Chat Interface',
          description: 'Natural conversation to get things done faster.',
        },
      ]}
      benefits={[
        'Write emails 5x faster',
        'Consistent professional tone',
        'Never stare at a blank page',
        'Works with your existing data',
        'Learn from your writing style',
        'Available in multiple languages',
      ]}
      useCases={[
        {
          title: 'Sales Outreach',
          description: 'Generate personalized outreach emails at scale.',
        },
        {
          title: 'Meeting Follow-ups',
          description: 'Automatically draft follow-up emails after meetings.',
        },
        {
          title: 'Proposal Writing',
          description: 'Create proposals and quotes with AI assistance.',
        },
      ]}
    />
  );
};

export default FeatureAIAssistant;
