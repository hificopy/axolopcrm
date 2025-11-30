import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { Users, MessageSquare, Lightbulb, Calendar, ArrowRight } from 'lucide-react';

const BENEFITS = [
  { icon: Users, title: '6,000+ Members', description: 'Connect with agency owners from around the world' },
  { icon: MessageSquare, title: 'Daily Discussions', description: 'Share insights, ask questions, get answers' },
  { icon: Lightbulb, title: 'Expert Advice', description: 'Learn from top performers in the industry' },
  { icon: Calendar, title: 'Live Events', description: 'Weekly webinars, AMAs, and networking sessions' },
];

const Community = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <SEO title="Community - Axolop" description="Join 6,000+ agency owners in the Axolop community. Share insights, learn from experts, and grow together." />
      <NavigationBar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm font-semibold mb-6">
              Community
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Join{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                6,000+ Agency Owners
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Connect, learn, and grow with the most engaged community of agency owners. Share insights, get feedback, and level up together.
            </p>
            <a
              href="https://discord.gg/axolop"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-2 px-8 py-4 rounded-xl',
                'bg-gradient-to-r from-blue-500 to-cyan-500',
                'text-white font-semibold text-lg',
                'shadow-lg shadow-blue-500/25',
                'hover:opacity-90 transition-opacity'
              )}
            >
              Join Discord Community <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-6 rounded-2xl backdrop-blur-sm bg-white/5 border border-gray-800/50 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <BenefitIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-6">What Members Are Saying</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { quote: 'This community helped me scale my agency from 5 to 15 clients in 6 months.', name: 'Sarah K.', title: 'Agency Owner' },
                { quote: 'The weekly calls alone are worth it. So much actionable advice from people who get it.', name: 'Mike T.', title: 'Marketing Director' },
              ].map((testimonial, i) => (
                <div key={i} className="p-6 rounded-xl bg-white/5 border border-gray-800/50 text-left">
                  <p className="text-gray-300 mb-4">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Community;
