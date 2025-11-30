import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { Search, BookOpen, Video, MessageSquare, HelpCircle, ChevronRight, Zap, Users, Mail } from 'lucide-react';

const CATEGORIES = [
  { icon: Zap, title: 'Getting Started', articles: 12, href: '/help/getting-started' },
  { icon: Users, title: 'Account & Billing', articles: 8, href: '/help/account' },
  { icon: BookOpen, title: 'Features Guide', articles: 25, href: '/help/features' },
  { icon: Mail, title: 'Email Marketing', articles: 15, href: '/help/email' },
  { icon: HelpCircle, title: 'Troubleshooting', articles: 10, href: '/help/troubleshooting' },
  { icon: Video, title: 'Video Tutorials', articles: 20, href: '/help/videos' },
];

const POPULAR_ARTICLES = [
  { title: 'How to import contacts from CSV', category: 'Getting Started' },
  { title: 'Setting up your first email campaign', category: 'Email Marketing' },
  { title: 'Understanding pipeline stages', category: 'Features Guide' },
  { title: 'Connecting your email account', category: 'Getting Started' },
  { title: 'Creating automated workflows', category: 'Features Guide' },
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO title="Help Center - Axolop" description="Find answers, tutorials, and guides to help you get the most out of Axolop CRM." />
      <NavigationBar />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#761B14]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">How can we help?</h1>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for articles, tutorials..."
                className={cn(
                  'w-full pl-12 pr-4 py-4 rounded-xl',
                  'bg-white/5 border border-gray-800',
                  'text-white placeholder-gray-500',
                  'focus:outline-none focus:border-[#761B14]',
                  'transition-colors text-lg'
                )}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-white mb-6">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((category, index) => {
              const CategoryIcon = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link
                    to={category.href}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl',
                      'bg-white/5 border border-gray-800/50',
                      'hover:bg-white/10 hover:border-gray-700/50',
                      'transition-all group'
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#761B14]/20 flex items-center justify-center flex-shrink-0">
                      <CategoryIcon className="w-5 h-5 text-[#d4463c]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white group-hover:text-[#d4463c] transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-500">{category.articles} articles</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#d4463c] transition-colors" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-white mb-6">Popular Articles</h2>
          <div className="space-y-2">
            {POPULAR_ARTICLES.map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link
                  to="#"
                  className={cn(
                    'flex items-center justify-between p-4 rounded-xl',
                    'hover:bg-white/5 transition-colors group'
                  )}
                >
                  <div>
                    <h3 className="text-white group-hover:text-[#d4463c] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500">{article.category}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#d4463c] transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-gradient-to-br from-[#761B14]/20 to-[#14787b]/20 border border-gray-800/50 text-center"
          >
            <MessageSquare className="w-12 h-12 text-[#d4463c] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Still need help?</h3>
            <p className="text-gray-400 mb-6">Our support team is here to help you succeed.</p>
            <Link
              to="/contact"
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
                'bg-gradient-to-r from-[#761B14] to-[#d4463c]',
                'text-white font-semibold',
                'hover:opacity-90 transition-opacity'
              )}
            >
              Contact Support
            </Link>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default HelpCenter;
