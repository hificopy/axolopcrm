import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Laptop,
  Plane,
  GraduationCap,
  Users,
  Zap,
  Globe,
  ArrowRight,
  Coffee,
  Sparkles,
} from 'lucide-react';

/**
 * Careers Page - Company culture, benefits, and open positions
 */

const COMPANY_VALUES = [
  {
    icon: Heart,
    title: 'Customer Obsession',
    description: 'Every decision starts with the customer. We listen, learn, and deliver solutions that make their lives easier.',
  },
  {
    icon: Zap,
    title: 'Move Fast',
    description: 'We ship early, iterate often, and embrace the 80/20 rule. Perfect is the enemy of done.',
  },
  {
    icon: Users,
    title: 'Team First',
    description: 'We win together. No egos, no silos. We support each other and celebrate shared victories.',
  },
  {
    icon: Sparkles,
    title: 'Quality Matters',
    description: 'We take pride in our craft. Every pixel, every line of code, every interaction should feel polished.',
  },
];

const BENEFITS = [
  { icon: Laptop, title: 'Remote-First', description: 'Work from anywhere in the world' },
  { icon: DollarSign, title: 'Competitive Pay', description: 'Top-tier salaries and equity' },
  { icon: Heart, title: 'Health Coverage', description: 'Medical, dental, and vision for you and family' },
  { icon: Plane, title: 'Unlimited PTO', description: 'Take the time you need to recharge' },
  { icon: GraduationCap, title: 'Learning Budget', description: '$2,000/year for courses and conferences' },
  { icon: Coffee, title: 'Home Office', description: '$1,000 stipend for your workspace' },
  { icon: Globe, title: 'Team Retreats', description: 'Annual in-person gatherings worldwide' },
  { icon: Clock, title: 'Flexible Hours', description: "Work when you're most productive" },
];

const OPEN_POSITIONS = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote (US/Europe)',
    type: 'Full-time',
    salary: '$150k - $200k',
    description: 'Build and scale our core platform using React, Node.js, and PostgreSQL.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    salary: '$120k - $160k',
    description: 'Design beautiful, intuitive experiences that delight our users.',
  },
  {
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote (US)',
    type: 'Full-time',
    salary: '$80k - $110k',
    description: 'Help our customers succeed and grow with Axolop.',
  },
  {
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    location: 'Remote (US/Europe)',
    type: 'Full-time',
    salary: '$100k - $140k',
    description: 'Drive user acquisition and optimize our growth funnels.',
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    salary: '$140k - $180k',
    description: 'Scale our infrastructure and improve deployment processes.',
  },
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="Careers - Axolop CRM"
        description="Join the Axolop team. We're building the future of CRM and looking for talented people to help us get there."
      />
      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-3xl bg-[#761B14]/20" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 rounded-2xl bg-[#761B14]/30 flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-[#d4463c]" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Join Our Team</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              We're building the all-in-one platform that helps agencies replace 10+ tools. Join us and help shape the future of work.
            </p>
            <a
              href="#positions"
              className={cn(
                'inline-flex items-center gap-2 px-8 py-4 rounded-xl',
                'bg-gradient-to-r from-[#761B14] to-[#d4463c]',
                'text-white font-semibold text-lg',
                'shadow-lg shadow-[#761B14]/25',
                'hover:opacity-90 transition-opacity'
              )}
            >
              View Open Positions <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-gray-400 text-lg">What guides everything we do</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMPANY_VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-gray-800/50 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#761B14]/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-[#d4463c]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                  <p className="text-gray-400 text-sm">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Benefits & Perks</h2>
            <p className="text-gray-400 text-lg">We take care of our team so they can do their best work</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-white/5 border border-gray-800/50"
                >
                  <Icon className="w-6 h-6 text-[#2DCE89] mb-3" />
                  <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-gray-500 text-sm">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-20 bg-gradient-to-b from-black to-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Open Positions</h2>
            <p className="text-gray-400 text-lg">Find your next role</p>
          </motion.div>
          <div className="space-y-4">
            {OPEN_POSITIONS.map((position, index) => (
              <motion.div
                key={position.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-gray-800/50 hover:border-[#761B14]/50 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-[#761B14]/20 text-[#d4463c] text-xs font-medium">
                        {position.department}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-[#d4463c] transition-colors">
                      {position.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{position.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <MapPin className="w-4 h-4" /> {position.location}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <Clock className="w-4 h-4" /> {position.type}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <DollarSign className="w-4 h-4" /> {position.salary}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      className={cn(
                        'px-4 py-2 rounded-lg',
                        'bg-[#761B14] text-white',
                        'font-medium text-sm',
                        'hover:bg-[#8c1f17] transition-colors',
                        'flex items-center gap-2'
                      )}
                    >
                      Apply <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* No Fit CTA */}
      <section className="py-20 bg-black">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Don't See a Good Fit?</h2>
            <p className="text-gray-400 mb-8">
              We're always looking for talented people. Send us your resume and we'll reach out when the right opportunity comes up.
            </p>
            <Link
              to="/contact"
              className="text-[#d4463c] font-medium hover:underline flex items-center justify-center gap-2"
            >
              Send us your resume <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Life at Axolop */}
      <section className="py-20 bg-gradient-to-b from-black to-[#761B14]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Life at Axolop</h2>
            <p className="text-gray-400 text-lg">A glimpse into our remote-first culture</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
              'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=400&h=300&fit=crop',
              'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=300&fit=crop',
              'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop',
            ].map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="aspect-[4/3] rounded-xl overflow-hidden"
              >
                <img src={img} alt="Team" className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Careers;
