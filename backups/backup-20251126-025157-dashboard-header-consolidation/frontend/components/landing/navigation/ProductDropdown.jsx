import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  Send,
  Headset,
  Brain,
  Workflow,
  ChevronDown,
  Users,
  BarChart3,
  PieChart,
  Mail,
  FileText,
  Zap,
  Ticket,
  BookOpen,
  Globe,
  Sparkles,
  Mic,
  GitBranch,
  ListOrdered,
  Bell,
  Map,
  Rocket,
  ArrowRight,
} from 'lucide-react';

/**
 * Product categories with their items
 * Each category links to dedicated feature pages
 */
const PRODUCT_CATEGORIES = {
  sales: {
    title: 'Sales Tools',
    icon: DollarSign,
    color: 'red',
    items: [
      {
        name: 'Lead Management',
        description: 'Capture and nurture leads',
        href: '/features/leads',
        icon: Users,
      },
      {
        name: 'Pipeline',
        description: 'Visual deal tracking',
        href: '/features/pipeline',
        icon: GitBranch,
      },
      {
        name: 'Contacts',
        description: 'Customer relationship hub',
        href: '/features/contacts',
        icon: Users,
      },
      {
        name: 'Analytics',
        description: 'Revenue insights',
        href: '/features/analytics',
        icon: BarChart3,
      },
    ],
  },
  marketing: {
    title: 'Marketing Tools',
    icon: Send,
    color: 'teal',
    items: [
      {
        name: 'Email Marketing',
        description: 'Campaign automation',
        href: '/features/email',
        icon: Mail,
      },
      {
        name: 'Form Builder',
        description: 'Typeform alternative',
        href: '/features/forms',
        icon: FileText,
      },
      {
        name: 'Automation',
        description: 'Workflow builder',
        href: '/features/automation',
        icon: Zap,
      },
    ],
  },
  service: {
    title: 'Service Tools',
    icon: Headset,
    color: 'amber',
    items: [
      {
        name: 'Tickets',
        description: 'Support management',
        href: '/features/tickets',
        icon: Ticket,
      },
      {
        name: 'Knowledge Base',
        description: 'Self-service docs',
        href: '/features/knowledge-base',
        icon: BookOpen,
      },
      {
        name: 'Customer Portal',
        description: 'Client self-service',
        href: '/features/portal',
        icon: Globe,
      },
    ],
  },
  ai: {
    title: 'AI Tools',
    icon: Brain,
    color: 'blue',
    items: [
      {
        name: 'Second Brain',
        description: 'AI knowledge assistant',
        href: '/features/second-brain',
        icon: Brain,
      },
      {
        name: 'AI Assistant',
        description: 'Intelligent automation',
        href: '/features/ai-assistant',
        icon: Sparkles,
      },
      {
        name: 'Meeting Intelligence',
        description: 'Call transcription',
        href: '/features/meetings-ai',
        icon: Mic,
      },
    ],
  },
  automation: {
    title: 'Automation',
    icon: Workflow,
    color: 'purple',
    items: [
      {
        name: 'Workflows',
        description: 'Visual automation',
        href: '/features/workflows',
        icon: Workflow,
      },
      {
        name: 'Sequences',
        description: 'Email sequences',
        href: '/features/sequences',
        icon: ListOrdered,
      },
      {
        name: 'Triggers',
        description: 'Event-based actions',
        href: '/features/triggers',
        icon: Bell,
      },
    ],
  },
};

const colorStyles = {
  red: {
    iconBg: 'bg-[#761B14]/20',
    iconText: 'text-[#d4463c]',
    hoverBg: 'hover:bg-[#761B14]/10',
  },
  teal: {
    iconBg: 'bg-[#14787b]/20',
    iconText: 'text-[#1fb5b9]',
    hoverBg: 'hover:bg-[#14787b]/10',
  },
  amber: {
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-400',
    hoverBg: 'hover:bg-amber-500/10',
  },
  blue: {
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-400',
    hoverBg: 'hover:bg-blue-500/10',
  },
  purple: {
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-400',
    hoverBg: 'hover:bg-purple-500/10',
  },
};

/**
 * ProductDropdown - Mega menu for product categories
 */
const ProductDropdown = ({ className }) => {
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
        <span className="text-sm font-medium">Product</span>
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
              'w-[800px] max-w-[calc(100vw-2rem)]',
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
              {/* Grid of categories */}
              <div className="grid grid-cols-5 gap-6">
                {Object.entries(PRODUCT_CATEGORIES).map(([key, category]) => {
                  const CategoryIcon = category.icon;
                  const styles = colorStyles[category.color];

                  return (
                    <div key={key} className="space-y-3">
                      {/* Category header */}
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-800/50">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center',
                            styles.iconBg
                          )}
                        >
                          <CategoryIcon className={cn('w-4 h-4', styles.iconText)} />
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {category.title}
                        </span>
                      </div>

                      {/* Category items */}
                      <div className="space-y-1">
                        {category.items.map((item) => {
                          const ItemIcon = item.icon;

                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              className={cn(
                                'block p-2 rounded-lg',
                                'transition-all duration-200',
                                styles.hoverBg
                              )}
                            >
                              <div className="flex items-start gap-2">
                                <ItemIcon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', styles.iconText)} />
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Section: Roadmap + CTA */}
              <div className="mt-6 pt-4 border-t border-gray-800/50">
                {/* Roadmap Card - Visually Stunning with Branded Dark Red */}
                <Link
                  to="/roadmap"
                  className={cn(
                    'group block mb-4 p-4 rounded-xl',
                    'bg-gradient-to-r from-[#4A1515]/30 via-[#3D1212]/30 to-[#4A1515]/20',
                    'border border-[#4A1515]/30',
                    'hover:border-[#d4463c]/50 hover:from-[#4A1515]/40 hover:via-[#3D1212]/40 hover:to-[#4A1515]/30',
                    'transition-all duration-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4A1515] to-[#3D1212] flex items-center justify-center shadow-[0_0_15px_rgba(74,21,21,0.4)]">
                          <Map className="w-5 h-5 text-white" />
                        </div>
                        {/* Animated pulse ring */}
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#4A1515] to-[#3D1212] animate-ping opacity-20" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">Product Roadmap</h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white uppercase tracking-wide">
                            Live
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          See what's coming next • V1.1 features releasing soon
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#d4463c] group-hover:text-[#e85a50] transition-colors">
                      <Rocket className="w-4 h-4" />
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>

                {/* Original CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      Replace 10+ tools with one unified platform
                    </p>
                  </div>
                  <Link
                    to="/pricing"
                    className={cn(
                      'px-4 py-2 rounded-lg',
                      'bg-gradient-to-r from-[#761B14] to-[#d4463c]',
                      'text-white text-sm font-medium',
                      'hover:opacity-90 transition-opacity'
                    )}
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDropdown;
