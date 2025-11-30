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
    href: '/affiliate',
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
  red: 'bg-[#761B14]/20 text-[#d4463c]',
};

/**
 * PartnerDropdown - Dropdown with partner program options
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
        <span className="text-sm font-medium">Partner</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-full left-1/2 -translate-x-1/2 mt-2',
              'w-[600px] max-w-[calc(100vw-2rem)]',
              'rounded-2xl overflow-hidden',
              'backdrop-blur-xl bg-gray-900/95',
              'border border-gray-800/50',
              'shadow-2xl shadow-black/40',
              'z-50'
            )}
          >
            {/* Arrow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-gray-900/95 border-l border-t border-gray-800/50" />

            <div className="relative p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Partner Items Column */}
                <div className="space-y-2">
                  {PARTNER_ITEMS.map((item) => {
                    const ItemIcon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'group block p-3 rounded-xl',
                          'transition-all duration-200',
                          'hover:bg-white/5'
                        )}
                      >
                        <div className="flex gap-3">
                          {/* Thumbnail or Icon */}
                          <div
                            className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                              'bg-gradient-to-br from-gray-800 to-gray-900',
                              'border border-gray-700/50',
                              'group-hover:border-gray-600/50 transition-colors'
                            )}
                          >
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <ItemIcon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white group-hover:text-[#1fb5b9] transition-colors">
                                {item.name}
                              </p>
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
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Featured / What's New Column */}
                <div className="space-y-4">
                  {/* What's New Card */}
                  <div className="rounded-xl overflow-hidden bg-gradient-to-br from-[#761B14]/20 to-[#14787b]/20 border border-gray-800/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#14787b]/30 text-[#1fb5b9]">
                        NEW
                      </span>
                      <span className="text-sm font-medium text-white">
                        What's New
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">
                      Discover the latest improvements and features we've shipped
                    </p>
                    <Link
                      to="/changelog"
                      className="inline-flex items-center gap-1 text-sm text-[#1fb5b9] hover:text-[#14787b] transition-colors"
                    >
                      View changelog
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Read More Links */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Read More
                    </p>
                    <div className="space-y-1">
                      {READ_MORE_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          className={cn(
                            'flex items-center gap-2 px-2 py-1.5 rounded-lg',
                            'text-sm text-gray-400',
                            'hover:text-white hover:bg-white/5',
                            'transition-all duration-200'
                          )}
                        >
                          {link.name}
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </Link>
                      ))}
                    </div>
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
