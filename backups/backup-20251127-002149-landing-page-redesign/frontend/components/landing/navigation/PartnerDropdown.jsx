import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  DollarSign,
  Award,
  Users,
  GraduationCap,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

/**
 * Partner menu items with thumbnails
 */
const PARTNER_ITEMS = [
  {
    name: 'Affiliate Program',
    description: 'Earn 30% recurring commissions on every referral',
    href: '/affiliate-program',
    icon: DollarSign,
    badge: '30% Commission',
    badgeColor: 'teal',
    // Placeholder thumbnail - will be replaced with actual image
    thumbnail: null,
  },
  {
    name: 'Ambassador Program',
    description: 'For power users and influencers who love Axolop',
    href: '/ambassador',
    icon: Award,
    badge: 'Apply Now',
    badgeColor: 'amber',
    thumbnail: null,
  },
  {
    name: 'Community',
    description: 'Join 6,000+ agency owners sharing insights',
    href: '/community',
    icon: Users,
    badge: null,
    thumbnail: null,
  },
  {
    name: 'Academy',
    description: 'Free courses, certifications, and guides',
    href: '/academy',
    icon: GraduationCap,
    badge: 'Free',
    badgeColor: 'teal',
    thumbnail: null,
  },
  {
    name: 'Help Center',
    description: 'Documentation, tutorials, and support',
    href: '/help',
    icon: HelpCircle,
    badge: null,
    thumbnail: null,
  },
];

/**
 * Read more links
 */
const READ_MORE_LINKS = [
  { name: 'Blog', href: '/blog' },
  { name: 'Changelog', href: '/changelog' },
  { name: 'Status', href: '/status' },
];

const badgeColors = {
  teal: 'bg-[#14787b]/20 text-[#1fb5b9]',
  amber: 'bg-amber-500/20 text-amber-400',
  red: 'bg-[#761B14]/20 text-[#6A2525]',
};

/**
 * PartnerDropdown - Full-width dropdown (Perspective.co style)
 */
const PartnerDropdown = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger */}
      <button
        className={cn(
          'flex items-center gap-1 px-3 py-2 rounded-lg',
          'text-gray-300 hover:text-white',
          'transition-colors duration-200',
          isOpen && 'text-white'
        )}
      >
        <span className="text-base font-medium">Partner</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Full-width Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "linear-gradient(180deg, #0F1522 0%, #131a2a 40%, #0F1522 100%)",
            }}
            className={cn(
              'fixed top-16 left-0 right-0',
              'w-full',
              'backdrop-blur-xl',
              'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)]',
              'z-50'
            )}
          >
            <div className="max-w-7xl mx-auto px-8 py-8">
              <div className="grid grid-cols-12 gap-8">
                {/* Partner Programs Column */}
                <div className="col-span-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Partner Programs
                  </h3>
                  <div className="space-y-3">
                    {PARTNER_ITEMS.slice(0, 3).map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-700 transition-colors">
                            <ItemIcon className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white">{item.name}</p>
                              {item.badge && (
                                <span
                                  className={cn(
                                    'px-2 py-0.5 rounded-full text-xs font-medium',
                                    badgeColors[item.badgeColor || 'teal']
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Resources Column */}
                <div className="col-span-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Resources
                  </h3>
                  <div className="space-y-3">
                    {PARTNER_ITEMS.slice(3).map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-700 transition-colors">
                            <ItemIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Read More Column */}
                <div className="col-span-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Read More
                  </h3>
                  <div className="space-y-2">
                    {READ_MORE_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="flex items-center gap-2 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.name}
                        <ExternalLink className="w-3 h-3 opacity-50" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* What's New Column */}
                <div className="col-span-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    What's New
                  </h3>
                  <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 p-5">
                    <p className="text-sm text-gray-300 mb-4">
                      Discover the latest improvements and features we've shipped
                    </p>
                    <Link
                      to="/changelog"
                      className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-colors group"
                    >
                      View changelog
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerDropdown;
