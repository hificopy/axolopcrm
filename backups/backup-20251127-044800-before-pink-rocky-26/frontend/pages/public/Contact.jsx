import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { NavigationBar } from '@/components/landing/navigation';
import { FooterSection } from '@/components/landing/sections';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import {
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Send,
  Clock,
} from 'lucide-react';

/**
 * Contact options
 */
const CONTACT_OPTIONS = [
  {
    icon: MessageSquare,
    title: 'Sales Inquiry',
    description: 'Talk to our sales team about your agency needs',
    action: 'Schedule a call',
    color: 'red',
  },
  {
    icon: Mail,
    title: 'Support',
    description: 'Get help from our customer success team',
    action: 'Email support',
    color: 'teal',
  },
  {
    icon: Phone,
    title: 'Partnership',
    description: 'Explore affiliate or integration opportunities',
    action: 'Contact us',
    color: 'amber',
  },
];

const colorStyles = {
  red: { iconBg: 'bg-[#761B14]/20', iconText: 'text-[#761B14]' },
  teal: { iconBg: 'bg-[#14787b]/20', iconText: 'text-[#1fb5b9]' },
  amber: { iconBg: 'bg-amber-500/20', iconText: 'text-amber-400' },
};

/**
 * Contact Page
 */
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO
        title="Contact Us - Axolop CRM"
        description="Get in touch with the Axolop team. We're here to help with sales inquiries, support, and partnership opportunities."
      />

      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#14787b]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Have questions about Axolop? Our team is here to help.
              We typically respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CONTACT_OPTIONS.map((option, index) => {
              const OptionIcon = option.icon;
              const styles = colorStyles[option.color];

              return (
                <motion.div
                  key={option.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={cn(
                    'p-6 rounded-2xl text-center',
                    'backdrop-blur-sm bg-white/5',
                    'border border-gray-800/50',
                    'hover:border-gray-700/50 transition-colors'
                  )}
                >
                  <div
                    className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4',
                      styles.iconBg
                    )}
                  >
                    <OptionIcon className={cn('w-7 h-7', styles.iconText)} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {option.description}
                  </p>
                  <button
                    className={cn(
                      'text-sm font-medium',
                      styles.iconText,
                      'hover:opacity-80 transition-opacity'
                    )}
                  >
                    {option.action}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              'p-8 rounded-2xl',
              'backdrop-blur-sm bg-white/5',
              'border border-gray-800/50'
            )}
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#14787b]/20 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-[#1fb5b9]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Message Sent!
                </h3>
                <p className="text-gray-400">
                  We will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Send us a message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={cn(
                          'w-full px-4 py-3 rounded-xl',
                          'bg-white/5 border border-gray-800',
                          'text-white placeholder-gray-500',
                          'focus:outline-none focus:border-[#14787b]',
                          'transition-colors'
                        )}
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={cn(
                          'w-full px-4 py-3 rounded-xl',
                          'bg-white/5 border border-gray-800',
                          'text-white placeholder-gray-500',
                          'focus:outline-none focus:border-[#14787b]',
                          'transition-colors'
                        )}
                        placeholder="john@agency.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl',
                        'bg-white/5 border border-gray-800',
                        'text-white placeholder-gray-500',
                        'focus:outline-none focus:border-[#14787b]',
                        'transition-colors'
                      )}
                      placeholder="Your Agency Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl',
                        'bg-white/5 border border-gray-800',
                        'text-white',
                        'focus:outline-none focus:border-[#14787b]',
                        'transition-colors'
                      )}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="sales">Sales / Pricing</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl',
                        'bg-white/5 border border-gray-800',
                        'text-white placeholder-gray-500',
                        'focus:outline-none focus:border-[#14787b]',
                        'transition-colors resize-none'
                      )}
                      placeholder="How can we help you?"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'w-full py-4 rounded-xl',
                      'bg-gradient-to-r from-[#761B14] to-[#761B14]',
                      'text-white font-semibold',
                      'hover:opacity-90 transition-opacity',
                      'disabled:opacity-50'
                    )}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </>
            )}
          </motion.div>

          {/* Response time */}
          <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>We typically respond within 24 hours</span>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Contact;
