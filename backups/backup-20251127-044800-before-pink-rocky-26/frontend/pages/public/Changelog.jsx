import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { Sparkles, Bug, Zap, Shield, Rocket, Wrench, Bell } from 'lucide-react';

/**
 * Changelog Page - Version history with feature releases and bug fixes
 */

const CHANGELOG_ENTRIES = [
  {
    version: '1.2.0',
    date: 'November 25, 2025',
    title: 'AI Lead Scoring & Performance Improvements',
    description: 'Introducing AI-powered lead scoring and major performance optimizations.',
    changes: [
      { type: 'feature', text: 'AI Lead Scoring - automatically prioritize your hottest leads' },
      { type: 'feature', text: 'New dashboard widgets for pipeline analytics' },
      { type: 'improvement', text: '50% faster page load times across the app' },
      { type: 'improvement', text: 'Enhanced form builder with new field types' },
      { type: 'fix', text: 'Fixed email template preview rendering issues' },
      { type: 'fix', text: 'Resolved calendar sync conflicts with Google Calendar' },
    ],
  },
  {
    version: '1.1.0',
    date: 'November 10, 2025',
    title: 'Workflow Automation & Calendar Enhancements',
    description: 'Powerful new automation capabilities and improved scheduling features.',
    changes: [
      { type: 'feature', text: 'Visual workflow builder with 50+ triggers and actions' },
      { type: 'feature', text: 'Booking links with timezone detection' },
      { type: 'feature', text: 'Email sequence automation' },
      { type: 'improvement', text: 'Redesigned contact detail page' },
      { type: 'improvement', text: 'Better mobile responsiveness' },
      { type: 'fix', text: 'Fixed duplicate lead creation from forms' },
      { type: 'security', text: 'Enhanced password requirements for enterprise security' },
    ],
  },
  {
    version: '1.0.5',
    date: 'October 28, 2025',
    title: 'Bug Fixes & Stability',
    description: 'Important bug fixes and stability improvements.',
    changes: [
      { type: 'fix', text: 'Fixed issue with email tracking not recording opens' },
      { type: 'fix', text: 'Resolved pipeline drag-and-drop glitches' },
      { type: 'fix', text: 'Fixed CSV import for contacts with special characters' },
      { type: 'improvement', text: 'Improved error messages for form validation' },
    ],
  },
  {
    version: '1.0.0',
    date: 'October 15, 2025',
    title: 'Official Launch',
    description: 'Axolop CRM is officially live! Replace 10+ tools with one powerful platform.',
    changes: [
      { type: 'feature', text: 'Complete CRM with leads, contacts, and opportunities' },
      { type: 'feature', text: 'Visual pipeline management with Kanban boards' },
      { type: 'feature', text: 'Form builder with 20+ field types' },
      { type: 'feature', text: 'Email marketing with drag-and-drop builder' },
      { type: 'feature', text: 'Calendar and scheduling system' },
      { type: 'feature', text: 'Customizable dashboards and reports' },
      { type: 'feature', text: 'Role-based access control' },
      { type: 'feature', text: 'Gmail and Google Calendar integration' },
    ],
  },
];

const changeTypeConfig = {
  feature: { icon: Sparkles, color: 'text-[#2DCE89]', bg: 'bg-[#2DCE89]/10', label: 'New' },
  improvement: { icon: Zap, color: 'text-[#5BB9F5]', bg: 'bg-[#5BB9F5]/10', label: 'Improved' },
  fix: { icon: Bug, color: 'text-[#F5A623]', bg: 'bg-[#F5A623]/10', label: 'Fixed' },
  security: { icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Security' },
};

const Changelog = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="Changelog - Axolop CRM"
        description="Stay up to date with the latest features, improvements, and fixes in Axolop CRM."
      />
      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl bg-[#761B14]/20" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 rounded-2xl bg-[#761B14]/30 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-8 h-8 text-[#761B14]" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Changelog</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              New updates and improvements to Axolop CRM. See what's new and what we're working on.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-8 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-gray-800/50">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#761B14]" />
              <span className="text-gray-300">Get notified about new updates</span>
            </div>
            <button
              className={cn(
                'px-5 py-2 rounded-lg',
                'bg-gradient-to-r from-[#761B14] to-[#761B14]',
                'text-white font-medium text-sm',
                'hover:opacity-90 transition-opacity'
              )}
            >
              Subscribe to Updates
            </button>
          </div>
        </div>
      </section>

      {/* Changelog Entries */}
      <section className="py-12 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {CHANGELOG_ENTRIES.map((entry, index) => (
              <motion.div
                key={entry.version}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Timeline connector */}
                {index < CHANGELOG_ENTRIES.length - 1 && (
                  <div className="absolute left-4 top-12 bottom-0 w-px bg-gray-800" />
                )}

                {/* Entry */}
                <div className="flex gap-6">
                  {/* Version badge */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#761B14] flex items-center justify-center text-white text-xs font-bold">
                      {entry.version.split('.')[1]}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <span className="text-xl font-bold text-white">v{entry.version}</span>
                      <span className="text-gray-500 text-sm">{entry.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{entry.title}</h3>
                    <p className="text-gray-400 mb-4">{entry.description}</p>

                    {/* Changes list */}
                    <div className="space-y-2">
                      {entry.changes.map((change, changeIndex) => {
                        const config = changeTypeConfig[change.type];
                        const Icon = config.icon;
                        return (
                          <div
                            key={changeIndex}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                          >
                            <div className={cn('w-6 h-6 rounded flex items-center justify-center flex-shrink-0', config.bg)}>
                              <Icon className={cn('w-3 h-3', config.color)} />
                            </div>
                            <div className="flex-1">
                              <span className={cn('text-xs font-medium mr-2', config.color)}>
                                {config.label}
                              </span>
                              <span className="text-gray-300 text-sm">{change.text}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 bg-gradient-to-b from-black to-[#761B14]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Wrench className="w-12 h-12 text-[#761B14] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">What's Coming Next?</h2>
            <p className="text-gray-400 mb-8">
              Check out our public roadmap to see what features we're building next and vote on what matters most to you.
            </p>
            <a
              href="/roadmap"
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl',
                'bg-gradient-to-r from-[#761B14] to-[#761B14]',
                'text-white font-semibold',
                'hover:opacity-90 transition-opacity'
              )}
            >
              View Roadmap
            </a>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Changelog;
