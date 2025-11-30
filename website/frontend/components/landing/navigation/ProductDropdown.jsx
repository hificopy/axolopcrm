import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  ArrowRight,
  Shield,
  Phone,
  Home,
  Briefcase,
  GraduationCap,
  Funnel,
  Calendar,
  Layout,
  Network,
  BarChart as BarChartIcon,
  Link as LinkIcon,
  Smartphone,
  MessageSquare,
} from "lucide-react";

/**
 * Product categories with their items
 * Each category links to dedicated feature pages
 */
const PRODUCT_CATEGORIES = {
  sales: {
    title: "Sales Tools",
    icon: DollarSign,
    color: "red",
    items: [
      {
        name: "Lead Management",
        description: "Capture and nurture leads",
        href: "/features/leads",
        icon: Users,
      },
      {
        name: "Pipeline",
        description: "Visual deal tracking",
        href: "/features/pipeline",
        icon: GitBranch,
      },
      {
        name: "Contacts",
        description: "Customer relationship hub",
        href: "/features/contacts",
        icon: Users,
      },
      {
        name: "Funnels",
        description: "High-converting sales funnels",
        href: "/features/funnels",
        icon: Funnel,
      },
      {
        name: "Calls & Dialer",
        description: "Professional calling system",
        href: "/features/calls",
        icon: Phone,
      },
      {
        name: "Calendar",
        description: "Smart scheduling",
        href: "/features/calendar",
        icon: Calendar,
      },
      {
        name: "Analytics",
        description: "Revenue insights",
        href: "/features/analytics",
        icon: BarChart3,
      },
    ],
  },
  marketing: {
    title: "Marketing Tools",
    icon: Send,
    color: "teal",
    items: [
      {
        name: "Email Marketing",
        description: "Campaign automation",
        href: "/features/email",
        icon: Mail,
      },
      {
        name: "Form Builder",
        description: "Typeform alternative",
        href: "/features/forms",
        icon: FileText,
      },
      {
        name: "Automation",
        description: "Workflow builder",
        href: "/features/automation",
        icon: Zap,
      },
    ],
  },
  business: {
    title: "Business Tools",
    icon: Layout,
    color: "gold",
    items: [
      {
        name: "Team Chat",
        description: "Internal team collaboration",
        href: "/features/chat",
        icon: MessageSquare,
      },
      {
        name: "Projects",
        description: "Complete project management",
        href: "/features/projects",
        icon: Layout,
      },
      {
        name: "Reports",
        description: "Advanced analytics & reporting",
        href: "/features/reports",
        icon: BarChartIcon,
      },
      {
        name: "Integrations",
        description: "Connect your favorite tools",
        href: "/features/integrations",
        icon: LinkIcon,
      },
      {
        name: "Mobile App",
        description: "Full-featured mobile access",
        href: "/features/mobile",
        icon: Smartphone,
      },
      {
        name: "Security",
        description: "Enterprise-grade security",
        href: "/features/security",
        icon: Shield,
      },
    ],
  },
  service: {
    title: "Service Tools",
    icon: Headset,
    color: "amber",
    items: [
      {
        name: "Tickets",
        description: "Support management",
        href: "/features/tickets",
        icon: Ticket,
      },
      {
        name: "Knowledge Base",
        description: "Self-service docs",
        href: "/features/knowledge-base",
        icon: BookOpen,
      },
      {
        name: "Customer Portal",
        description: "Client self-service",
        href: "/features/portal",
        icon: Globe,
      },
    ],
  },
  ai: {
    title: "AI Tools",
    icon: Brain,
    color: "blue",
    items: [
      {
        name: "Second Brain",
        description: "AI knowledge assistant",
        href: "/features/second-brain",
        icon: Brain,
      },
      {
        name: "AI Assistant",
        description: "Intelligent automation",
        href: "/features/ai-assistant",
        icon: Sparkles,
      },
      {
        name: "Mind Maps",
        description: "Visual brainstorming & planning",
        href: "/features/mind-maps",
        icon: Network,
      },
      {
        name: "Meeting Intelligence",
        description: "Call transcription",
        href: "/features/meetings-ai",
        icon: Mic,
      },
    ],
  },
  automation: {
    title: "Automation",
    icon: Workflow,
    color: "purple",
    items: [
      {
        name: "Workflows",
        description: "Visual automation",
        href: "/features/workflows",
        icon: Workflow,
      },
      {
        name: "Sequences",
        description: "Email sequences",
        href: "/features/sequences",
        icon: ListOrdered,
      },
      {
        name: "Triggers",
        description: "Event-based actions",
        href: "/features/triggers",
        icon: Bell,
      },
    ],
  },
};

const colorStyles = {
  red: {
    iconBg: "bg-[#E92C92]/20",
    iconText: "text-gray-300",
    hoverBg: "hover:bg-[#E92C92]/10",
  },
  teal: {
    iconBg: "bg-[#14787b]/20",
    iconText: "text-[#1fb5b9]",
    hoverBg: "hover:bg-[#14787b]/10",
  },
  amber: {
    iconBg: "bg-amber-500/20",
    iconText: "text-amber-400",
    hoverBg: "hover:bg-amber-500/10",
  },
  blue: {
    iconBg: "bg-white/20",
    iconText: "text-white",
    hoverBg: "hover:bg-white/10",
  },
  purple: {
    iconBg: "bg-purple-500/20",
    iconText: "text-purple-400",
    hoverBg: "hover:bg-purple-500/10",
  },
};

/**
 * ProductDropdown - Full-width mega menu (Perspective.co style)
 */
const ProductDropdown = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Group categories for the new layout
  const productFeatures = [
    { ...PRODUCT_CATEGORIES.sales, key: "sales" },
    { ...PRODUCT_CATEGORIES.marketing, key: "marketing" },
    { ...PRODUCT_CATEGORIES.service, key: "service" },
  ];

  const productTools = [
    { ...PRODUCT_CATEGORIES.ai, key: "ai" },
    { ...PRODUCT_CATEGORIES.automation, key: "automation" },
  ];

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger */}
      <button
        className={cn(
          "flex items-center gap-1 px-3 py-2 rounded-lg",
          "text-gray-300 hover:text-white",
          "transition-colors duration-200",
          isOpen && "text-white",
        )}
      >
        <span className="text-base font-medium">Product</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen && "rotate-180",
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
              background: "#0F0510",
            }}
            className={cn(
              "fixed top-16 left-0 right-0",
              "w-full",
              "backdrop-blur-xl",
              "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)]",
              "z-50",
            )}
          >
            <div className="max-w-7xl mx-auto px-8 py-8">
              <div className="grid grid-cols-12 gap-8">
                {/* Product Column */}
                <div className="col-span-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Product
                  </h3>
                  <div className="space-y-1">
                    {productFeatures.map((category) => {
                      const CategoryIcon = category.icon;
                      return (
                        <div key={category.key} className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                              <CategoryIcon className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-sm font-semibold text-white">
                              {category.title}
                            </span>
                          </div>
                          <div className="ml-10 space-y-1">
                            {category.items.slice(0, 2).map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                className="block py-1 text-sm text-gray-400 hover:text-white transition-colors"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI & Automation Column */}
                <div className="col-span-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    AI & Automation
                  </h3>
                  <div className="space-y-1">
                    {productTools.map((category) => {
                      const CategoryIcon = category.icon;
                      return (
                        <div key={category.key} className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                              <CategoryIcon className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-sm font-semibold text-white">
                              {category.title}
                            </span>
                          </div>
                          <div className="ml-10 space-y-1">
                            {category.items.map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                className="block py-1 text-sm text-gray-400 hover:text-white transition-colors"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Use Cases Column */}
                <div className="col-span-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Use Cases
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Insurance Agencies",
                        desc: "Compliance & renewals",
                        href: "/use-cases/insurance",
                        icon: Shield,
                      },
                      {
                        name: "Call Centers",
                        desc: "Dialer & analytics",
                        href: "/use-cases/call-centers",
                        icon: Phone,
                      },
                      {
                        name: "Marketing Agencies",
                        desc: "Replace 10+ tools",
                        href: "/use-cases/marketing-agencies",
                        icon: Users,
                      },
                      {
                        name: "Real Estate",
                        desc: "Lead & deal management",
                        href: "/use-cases/real-estate",
                        icon: Home,
                      },
                      {
                        name: "B2B Sales",
                        desc: "Pipeline automation",
                        href: "/use-cases/b2b-sales",
                        icon: Briefcase,
                      },
                      {
                        name: "Consulting Firms",
                        desc: "Client management",
                        href: "/use-cases/consulting",
                        icon: GraduationCap,
                      },
                    ].map((useCase) => {
                      const Icon = useCase.icon;
                      return (
                        <Link
                          key={useCase.href}
                          to={useCase.href}
                          className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-700 transition-colors">
                            <Icon className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {useCase.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {useCase.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* What's New Column */}
                <div className="col-span-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    What's New
                  </h3>
                  <div className="rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 p-5">
                    <p className="text-sm text-gray-300 mb-4">
                      Discover the latest improvements and features we've
                      shipped
                    </p>
                    <Link
                      to="/changelog"
                      className="inline-flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-colors group"
                    >
                      View changelog
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Quick Links */}
                  <div className="mt-4 space-y-2">
                    <Link
                      to="/pricing"
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <DollarSign className="w-4 h-4" />
                      Pricing
                    </Link>
                    <Link
                      to="/roadmap"
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <Map className="w-4 h-4" />
                      Roadmap
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#1A777B]/20 text-[#1A777B] uppercase">
                        Live
                      </span>
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

export default ProductDropdown;
