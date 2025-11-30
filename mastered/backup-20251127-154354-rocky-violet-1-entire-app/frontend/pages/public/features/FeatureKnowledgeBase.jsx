import FeaturePageTemplate from './FeaturePageTemplate';
import { BookOpen, Search, Folder, Edit, Globe, Lock, BarChart, Sparkles } from 'lucide-react';

const FeatureKnowledgeBase = () => {
  return (
    <FeaturePageTemplate
      title="Knowledge Base"
      subtitle="Service Tools"
      description="Empower customers to help themselves with a beautiful, searchable knowledge base. Reduce support volume and improve satisfaction."
      icon={BookOpen}
      iconColor="#8b5cf6"
      iconBg="#6d28d9"
      features={[
        {
          icon: Search,
          title: 'Instant Search',
          description: 'Powerful search helps users find answers quickly.',
        },
        {
          icon: Folder,
          title: 'Organized Categories',
          description: 'Structure articles in intuitive categories and subcategories.',
        },
        {
          icon: Edit,
          title: 'Rich Text Editor',
          description: 'Create beautiful articles with images, videos, and code blocks.',
        },
        {
          icon: Globe,
          title: 'Custom Domain',
          description: 'Host your knowledge base on your own domain.',
        },
        {
          icon: Lock,
          title: 'Access Control',
          description: 'Create public or private articles for different audiences.',
        },
        {
          icon: BarChart,
          title: 'Article Analytics',
          description: 'See which articles are helpful and which need improvement.',
        },
      ]}
      benefits={[
        'Reduce support tickets by 40%',
        'Available 24/7 for self-service',
        'Consistent answers across your team',
        'SEO-optimized for search engines',
        'Embed articles in your app or website',
        'Multiple language support',
      ]}
      useCases={[
        {
          title: 'Product Documentation',
          description: 'Create comprehensive guides for your product or service.',
        },
        {
          title: 'FAQ Portal',
          description: 'Answer common questions before they become tickets.',
        },
        {
          title: 'Internal Wiki',
          description: 'Build an internal knowledge base for your team.',
        },
      ]}
    />
  );
};

export default FeatureKnowledgeBase;
