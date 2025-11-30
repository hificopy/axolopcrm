import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  DollarSign,
  Send,
  Headset,
  Brain,
  Workflow,
  Award,
  Users,
  GraduationCap,
  HelpCircle,
  Map,
  Rocket,
  ArrowRight,
  Shield,
  Phone,
  Home,
  Briefcase,
} from 'lucide-react';

/**
 * Product categories for mobile menu
 */
const PRODUCT_CATEGORIES = [
  {
    title: 'Sales Tools',
    icon: DollarSign,
    items: [
      { name: 'Lead Management', href: '/features/leads' },
      { name: 'Pipeline', href: '/features/pipeline' },
      { name: 'Contacts', href: '/features/contacts' },
      { name: 'Analytics', href: '/features/analytics' },
    ],
  },
  {
    title: 'Marketing Tools',
    icon: Send,
    items: [
      { name: 'Email Marketing', href: '/features/email' },
      { name: 'Form Builder', href: '/features/forms' },
      { name: 'Automation', href: '/features/automation' },
    ],
  },
  {
    title: 'Service Tools',
    icon: Headset,
    items: [
      { name: 'Tickets', href: '/features/tickets' },
      { name: 'Knowledge Base', href: '/features/knowledge-base' },
      { name: 'Customer Portal', href: '/features/portal' },
    ],
  },
  {
    title: 'AI Tools',
    icon: Brain,
    items: [
      { name: 'Second Brain', href: '/features/second-brain' },
      { name: 'AI Assistant', href: '/features/ai-assistant' },
      { name: 'Meeting Intelligence', href: '/features/meetings-ai' },
    ],
  },
  {
    title: 'Automation',
    icon: Workflow,
    items: [
      { name: 'Workflows', href: '/features/workflows' },
      { name: 'Sequences', href: '/features/sequences' },
      { name: 'Triggers', href: '/features/triggers' },
    ],
  },
];

/**
 * Use Cases for mobile menu
 */
const USE_CASES = [
  { name: 'Insurance Agencies', href: '/use-cases/insurance', icon: Shield },
  { name: 'Call Centers', href: '/use-cases/call-centers', icon: Phone },
  { name: 'Marketing Agencies', href: '/use-cases/marketing-agencies', icon: Users },
  { name: 'Real Estate', href: '/use-cases/real-estate', icon: Home },
  { name: 'B2B Sales', href: '/use-cases/b2b-sales', icon: Briefcase },
  { name: 'Consulting Firms', href: '/use-cases/consulting', icon: GraduationCap },
];

/**
 * Partner items for mobile menu
 */
const PARTNER_ITEMS = [
  { name: 'Affiliate Program', href: '/affiliate-program', icon: DollarSign },
  { name: 'Ambassador Program', href: '/ambassador', icon: Award },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Academy', href: '/academy', icon: GraduationCap },
  { name: 'Help Center', href: '/help', icon: HelpCircle },
];

/**
 * Accordion section component
 */
const AccordionSection = ({ title, icon: Icon, items, onItemClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-800/50 last:border-b-0">
      <button
        className="flex items-center justify-between w-full py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-gray-400" />}
          <span className="text-base font-medium text-white">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pl-8 space-y-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block py-2 text-gray-400 hover:text-white transition-colors"
                  onClick={onItemClick}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * MobileNav - Mobile navigation drawer
 */
const MobileNav = ({ isOpen, onClose, affiliateRef }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);

  const handleGetStarted = () => {
    onClose();
    if (affiliateRef) {
      navigate(`/signup?ref=${affiliateRef}`);
    } else {
      navigate('/signup');
    }
  };

  const handleSignIn = () => {
    onClose();
    navigate('/signin');
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed top-0 right-0 bottom-0 w-full max-w-sm z-50 lg:hidden',
              'bg-gradient-to-br from-gray-900 via-[#000000] to-gray-900',
              'border-l border-gray-800/50',
              'shadow-2xl',
              'overflow-y-auto'
            )}
          >
            {/* Header */}
            <div className="sticky top-0 bg-inherit border-b border-gray-800/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">Menu</span>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {/* Product Section */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Product
                </p>
                {PRODUCT_CATEGORIES.map((category) => (
                  <AccordionSection
                    key={category.title}
                    title={category.title}
                    icon={category.icon}
                    items={category.items}
                    onItemClick={handleLinkClick}
                  />
                ))}

                {/* Roadmap Card - Visually Stunning with Branded Dark Red */}
                <Link
                  to="/roadmap"
                  className={cn(
                    'group flex items-center justify-between mt-4 p-4 rounded-xl',
                    'bg-gradient-to-r from-[#4F1B1B]/40 via-[#3D1515]/40 to-[#4F1B1B]/30',
                    'border border-[#4F1B1B]/40',
                    'hover:border-[#5C2222]/50',
                    'transition-all duration-300'
                  )}
                  onClick={handleLinkClick}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4F1B1B] to-[#3D1515] flex items-center justify-center shadow-[0_0_15px_rgba(74,21,21,0.4)]">
                      <Map className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">Roadmap</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white uppercase">
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">See what's coming</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[#6A2525]">
                    <Rocket className="w-4 h-4" />
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* Use Cases Section */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Use Cases
                </p>
                {USE_CASES.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center gap-3 py-3 border-b border-gray-800/50 last:border-b-0"
                      onClick={handleLinkClick}
                    >
                      <ItemIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-base font-medium text-white">
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Partner Section */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Partner
                </p>
                {PARTNER_ITEMS.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center gap-3 py-3 border-b border-gray-800/50 last:border-b-0"
                      onClick={handleLinkClick}
                    >
                      <ItemIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-base font-medium text-white">
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Other Links */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Company
                </p>
                <div className="space-y-1">
                  {[
                    { name: 'Pricing', href: '/pricing' },
                    { name: 'About', href: '/about' },
                    { name: 'Contact', href: '/contact' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="block py-3 text-base font-medium text-white border-b border-gray-800/50 last:border-b-0"
                      onClick={handleLinkClick}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-800/50">
                <Button
                  className={cn(
                    'w-full bg-gradient-to-br from-[#4F1B1B] to-[#3D1515]',
                    'hover:from-[#5C2222] hover:to-[#4F1B1B]',
                    'text-white font-medium',
                    'shadow-[0_0_25px_rgba(74,21,21,0.5)]',
                    'hover:shadow-[0_0_35px_rgba(74,21,21,0.6)]',
                    'border border-[#6A2525]/20 rounded-full'
                  )}
                  onClick={handleGetStarted}
                >
                  {affiliateRef ? 'Try 30 days FREE' : 'Get Started Free'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-white hover:bg-white/5"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;
