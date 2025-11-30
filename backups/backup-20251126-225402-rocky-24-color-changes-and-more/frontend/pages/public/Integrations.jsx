import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { Puzzle, Search, Mail, Calendar, Phone, Cloud, Brain, CreditCard, MessageSquare, ArrowRight, Plus } from 'lucide-react';

/**
 * Integrations Page - Grid of available integrations
 */

const INTEGRATION_CATEGORIES = [
  { name: 'All', slug: 'all', icon: Puzzle },
  { name: 'Email', slug: 'email', icon: Mail },
  { name: 'Calendar', slug: 'calendar', icon: Calendar },
  { name: 'Communication', slug: 'communication', icon: Phone },
  { name: 'Storage', slug: 'storage', icon: Cloud },
  { name: 'AI', slug: 'ai', icon: Brain },
  { name: 'Payment', slug: 'payment', icon: CreditCard },
];

const INTEGRATIONS = [
  {
    name: 'Gmail',
    description: 'Sync emails, track opens, and send campaigns directly from Axolop.',
    category: 'email',
    status: 'available',
    logo: 'https://www.gstatic.com/images/branding/product/2x/gmail_2020q4_48dp.png',
    popular: true,
  },
  {
    name: 'Google Calendar',
    description: 'Two-way sync for meetings, appointments, and booking links.',
    category: 'calendar',
    status: 'available',
    logo: 'https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png',
    popular: true,
  },
  {
    name: 'Twilio',
    description: 'Make and receive calls, send SMS, and track all communications.',
    category: 'communication',
    status: 'available',
    logo: 'https://www.twilio.com/docs/static/company/img/social-cards/twilio-social-card.png',
    popular: true,
  },
  {
    name: 'SendGrid',
    description: 'Reliable email delivery for campaigns and transactional emails.',
    category: 'email',
    status: 'available',
    logo: 'https://sendgrid.com/wp-content/themes/flavor-flavor/assets/src/images/logo.svg',
    popular: true,
  },
  {
    name: 'OpenAI',
    description: 'Power AI features like lead scoring and content generation.',
    category: 'ai',
    status: 'available',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
  },
  {
    name: 'Groq',
    description: 'Ultra-fast AI inference for real-time features.',
    category: 'ai',
    status: 'available',
    logo: 'https://groq.com/wp-content/uploads/2024/03/PBG-mark-color.svg',
  },
  {
    name: 'Supabase',
    description: 'Database and authentication infrastructure.',
    category: 'storage',
    status: 'available',
    logo: 'https://supabase.com/favicon/favicon-196x196.png',
  },
  {
    name: 'Zapier',
    description: 'Connect Axolop to 5,000+ apps with automated workflows.',
    category: 'communication',
    status: 'available',
    logo: 'https://cdn.zapier.com/zapier/images/favicon.ico',
    popular: true,
  },
  {
    name: 'Stripe',
    description: 'Accept payments and manage subscriptions.',
    category: 'payment',
    status: 'coming_soon',
    logo: 'https://stripe.com/favicon.ico',
  },
  {
    name: 'Slack',
    description: 'Get notifications and updates in your Slack channels.',
    category: 'communication',
    status: 'coming_soon',
    logo: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack.png',
  },
  {
    name: 'Microsoft Outlook',
    description: 'Sync emails and calendar with Microsoft 365.',
    category: 'email',
    status: 'coming_soon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg',
  },
  {
    name: 'Zoom',
    description: 'Create meeting links and sync recordings automatically.',
    category: 'calendar',
    status: 'coming_soon',
    logo: 'https://st1.zoom.us/zoom.ico',
  },
  {
    name: 'HubSpot',
    description: 'Migrate data from HubSpot or sync contacts.',
    category: 'communication',
    status: 'coming_soon',
    logo: 'https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png',
  },
  {
    name: 'QuickBooks',
    description: 'Sync invoices and financial data.',
    category: 'payment',
    status: 'planned',
    logo: 'https://quickbooks.intuit.com/etc/designs/quickbooks/clientlibs/quickbooks-global/resources/img/qb-icon.png',
  },
  {
    name: 'Salesforce',
    description: 'Migrate data from Salesforce CRM.',
    category: 'communication',
    status: 'planned',
    logo: 'https://www.salesforce.com/content/dam/web/en_us/www/images/home/logo-salesforce.svg',
  },
];

const statusConfig = {
  available: { label: 'Available', color: 'text-[#2DCE89]', bg: 'bg-[#2DCE89]/10' },
  coming_soon: { label: 'Coming Soon', color: 'text-[#F5A623]', bg: 'bg-[#F5A623]/10' },
  planned: { label: 'Planned', color: 'text-gray-400', bg: 'bg-gray-400/10' },
};

const Integrations = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIntegrations = INTEGRATIONS.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularIntegrations = INTEGRATIONS.filter(i => i.popular && i.status === 'available');

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="Integrations - Axolop CRM"
        description="Connect Axolop CRM with your favorite tools. Gmail, Google Calendar, Twilio, SendGrid, and more."
      />
      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl bg-[#761B14]/20" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 rounded-2xl bg-[#761B14]/30 flex items-center justify-center mx-auto mb-6">
              <Puzzle className="w-8 h-8 text-[#761B14]" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Integrations</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Connect Axolop with the tools you already use. Seamless data flow, zero friction.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Popular Integrations */}
      <section className="py-12 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-white mb-6">Popular Integrations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularIntegrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 rounded-xl bg-white/5 border border-gray-800/50 hover:border-[#761B14]/50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-3 overflow-hidden">
                  <img src={integration.logo} alt={integration.name} className="w-8 h-8 object-contain" />
                </div>
                <h3 className="text-white font-semibold">{integration.name}</h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-1">{integration.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {INTEGRATION_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      selectedCategory === category.slug
                        ? 'bg-[#761B14] text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
            {/* Search */}
            <div className="relative w-full lg:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full lg:w-64 pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#761B14]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-12 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration, index) => {
              const status = statusConfig[integration.status];
              return (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="p-6 rounded-2xl bg-white/5 border border-gray-800/50 hover:border-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                      <img src={integration.logo} alt={integration.name} className="w-10 h-10 object-contain" />
                    </div>
                    <span className={cn('px-2 py-1 rounded text-xs font-medium', status.color, status.bg)}>
                      {status.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{integration.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{integration.description}</p>
                  {integration.status === 'available' && (
                    <button className="text-[#761B14] text-sm font-medium hover:underline flex items-center gap-1">
                      Learn more <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No integrations found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Request Integration */}
      <section className="py-20 bg-gradient-to-b from-black to-[#761B14]/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Plus className="w-12 h-12 text-[#761B14] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Need an Integration?</h2>
            <p className="text-gray-400 mb-8">
              Don't see the integration you need? Let us know and we'll prioritize it on our roadmap.
            </p>
            <Link
              to="/contact"
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
                'bg-gradient-to-r from-[#761B14] to-[#761B14]',
                'text-white font-semibold',
                'hover:opacity-90 transition-opacity'
              )}
            >
              Request Integration
            </Link>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Integrations;
