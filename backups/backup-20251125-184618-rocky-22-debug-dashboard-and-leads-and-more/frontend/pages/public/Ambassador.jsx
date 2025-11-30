import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { Award, Star, Gift, Mic, Users, Sparkles, ArrowRight } from 'lucide-react';

const PERKS = [
  { icon: Gift, title: 'Free Axolop Account', description: 'Get a free Business plan account for life' },
  { icon: Star, title: 'Exclusive Badge', description: 'Stand out with an Ambassador badge on your profile' },
  { icon: Mic, title: 'Early Access', description: 'Be the first to try new features before anyone else' },
  { icon: Users, title: 'Private Community', description: 'Join our exclusive Ambassador Slack channel' },
];

const Ambassador = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <SEO title="Ambassador Program - Axolop" description="Become an Axolop Ambassador. Get exclusive perks, early access, and recognition." />
      <NavigationBar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-semibold mb-6">
              Ambassador Program
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Become an{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-500">
                Axolop Ambassador
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              For power users and influencers who love Axolop. Get exclusive perks, early access to features, and recognition in our community.
            </p>
            <Link
              to="/contact?type=ambassador"
              className={cn(
                'inline-flex items-center gap-2 px-8 py-4 rounded-xl',
                'bg-gradient-to-r from-amber-500 to-yellow-500',
                'text-black font-semibold text-lg',
                'shadow-lg shadow-amber-500/25',
                'hover:opacity-90 transition-opacity'
              )}
            >
              Apply Now <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-4">Ambassador Perks</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERKS.map((perk, index) => {
              const PerkIcon = perk.icon;
              return (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-gray-800/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                    <PerkIcon className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{perk.title}</h3>
                  <p className="text-gray-400 text-sm">{perk.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Requirements</h3>
            <ul className="space-y-3">
              {[
                'Active Axolop user for at least 3 months',
                'Strong presence in agency/marketing communities',
                'Willingness to share feedback and create content',
                'Passion for helping other agency owners succeed',
              ].map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{req}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Ambassador;
