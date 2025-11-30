import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NavigationBar } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/sections";
import SEO from "@/components/SEO";
import {
  Users,
  MessageSquare,
  Lightbulb,
  Ticket,
  ArrowRight,
  ThumbsUp,
  MessageCircle,
  Clock,
  CheckCircle2,
  Rocket,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Zap,
  Star,
  ChevronRight,
  ExternalLink,
  Heart,
  Award,
  Shield,
  HelpCircle,
  Send,
  X,
} from "lucide-react";

// Tab options
const TABS = [
  { id: "ideas", label: "Feature Ideas", icon: Lightbulb },
  { id: "discussions", label: "Discussions", icon: MessageSquare },
  { id: "support", label: "Get Help", icon: HelpCircle },
  { id: "changelog", label: "What's New", icon: Rocket },
];

// Feature request status options
const STATUS_OPTIONS = {
  submitted: { label: "Submitted", color: "gray", icon: Clock },
  under_review: { label: "Under Review", color: "yellow", icon: Search },
  planned: { label: "Planned", color: "blue", icon: TrendingUp },
  in_progress: { label: "In Progress", color: "purple", icon: Zap },
  shipped: { label: "Shipped", color: "green", icon: CheckCircle2 },
};

// Sample feature requests (in production, this would come from an API)
const FEATURE_REQUESTS = [
  {
    id: 1,
    title: "Zapier Integration for Lead Automation",
    description: "Would love to connect Axolop with other tools via Zapier for automated workflows.",
    status: "planned",
    votes: 847,
    comments: 56,
    author: "Sarah K.",
    authorAvatar: "SK",
    category: "Integrations",
    createdAt: "2 days ago",
    isHot: true,
  },
  {
    id: 2,
    title: "Dark Mode for the Dashboard",
    description: "A dark theme option would be easier on the eyes during late-night work sessions.",
    status: "in_progress",
    votes: 623,
    comments: 34,
    author: "Mike T.",
    authorAvatar: "MT",
    category: "UI/UX",
    createdAt: "1 week ago",
    isHot: true,
  },
  {
    id: 3,
    title: "Bulk SMS Messaging",
    description: "Ability to send SMS messages in bulk to segmented contact lists.",
    status: "under_review",
    votes: 412,
    comments: 28,
    author: "David L.",
    authorAvatar: "DL",
    category: "Communication",
    createdAt: "3 days ago",
    isHot: false,
  },
  {
    id: 4,
    title: "Calendar Sync with Google & Outlook",
    description: "Two-way calendar sync to keep all meetings in one place.",
    status: "shipped",
    votes: 534,
    comments: 42,
    author: "Emma R.",
    authorAvatar: "ER",
    category: "Productivity",
    createdAt: "2 weeks ago",
    isHot: false,
  },
  {
    id: 5,
    title: "Custom Dashboard Widgets",
    description: "Allow users to customize which metrics appear on their dashboard.",
    status: "planned",
    votes: 389,
    comments: 21,
    author: "Chris P.",
    authorAvatar: "CP",
    category: "Customization",
    createdAt: "5 days ago",
    isHot: false,
  },
  {
    id: 6,
    title: "AI-Powered Email Subject Lines",
    description: "Use AI to suggest high-converting email subject lines based on past performance.",
    status: "submitted",
    votes: 256,
    comments: 18,
    author: "Lisa M.",
    authorAvatar: "LM",
    category: "AI Features",
    createdAt: "1 day ago",
    isHot: false,
  },
];

// Sample discussions
const DISCUSSIONS = [
  {
    id: 1,
    title: "Best practices for agency onboarding?",
    preview: "I'm trying to streamline how we onboard new clients. What's working for you?",
    author: "Agency Owner",
    authorAvatar: "AO",
    replies: 24,
    views: 342,
    lastActive: "2 hours ago",
    isPinned: true,
  },
  {
    id: 2,
    title: "How to set up automated follow-up sequences",
    preview: "Looking for tips on creating effective follow-up automation...",
    author: "Sales Team",
    authorAvatar: "ST",
    replies: 18,
    views: 189,
    lastActive: "5 hours ago",
    isPinned: false,
  },
  {
    id: 3,
    title: "Pipeline customization tips",
    preview: "Sharing my custom pipeline setup for real estate...",
    author: "RE Agent",
    authorAvatar: "RA",
    replies: 31,
    views: 456,
    lastActive: "1 day ago",
    isPinned: false,
  },
];

// Sample changelog entries
const CHANGELOG = [
  {
    id: 1,
    version: "V1.3",
    date: "November 30, 2025",
    title: "System Optimization Release",
    description: "Performance improvements, bug fixes, and stability enhancements across the platform.",
    type: "improvement",
    isNew: true,
  },
  {
    id: 2,
    version: "V1.2",
    date: "November 10, 2025",
    title: "Multi-Agency Management",
    description: "Switch between multiple agencies with a unified dashboard view. Plus CSV data import with field mapping.",
    type: "feature",
    isNew: false,
  },
  {
    id: 3,
    version: "V1.1",
    date: "October 15, 2025",
    title: "Forms & Calendar",
    description: "New drag-and-drop form builder with conditional logic. Built-in calendar with booking links.",
    type: "feature",
    isNew: false,
  },
];

// Community Stats
const STATS = [
  { label: "Community Members", value: "6,000+", icon: Users },
  { label: "Feature Ideas", value: "420+", icon: Lightbulb },
  { label: "Ideas Shipped", value: "89", icon: Rocket },
  { label: "Discussions", value: "1.2K", icon: MessageSquare },
];

// Top Contributors
const TOP_CONTRIBUTORS = [
  { name: "Sarah K.", points: 2450, badge: "Power User", avatar: "SK" },
  { name: "Mike T.", points: 1890, badge: "Helper", avatar: "MT" },
  { name: "Emma R.", points: 1654, badge: "Idea Machine", avatar: "ER" },
];

// Feature Request Card Component
const FeatureRequestCard = ({ request, onVote }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const status = STATUS_OPTIONS[request.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-5 hover:border-[#E92C92]/30 transition-all duration-300 group"
    >
      <div className="flex gap-4">
        {/* Vote Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => {
              setHasVoted(!hasVoted);
              onVote?.(request.id);
            }}
            className={cn(
              "w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all",
              hasVoted
                ? "bg-[#E92C92] text-white"
                : "bg-gray-800/50 text-gray-400 hover:bg-[#E92C92]/20 hover:text-[#E92C92]"
            )}
          >
            <ThumbsUp className={cn("h-4 w-4", hasVoted && "fill-white")} />
            <span className="text-xs font-bold mt-0.5">
              {hasVoted ? request.votes + 1 : request.votes}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-semibold text-lg group-hover:text-[#E92C92] transition-colors">
                {request.title}
              </h3>
              {request.isHot && (
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Hot
                </span>
              )}
            </div>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shrink-0",
                status.color === "gray" && "bg-gray-700/50 text-gray-300",
                status.color === "yellow" && "bg-yellow-500/20 text-yellow-400",
                status.color === "blue" && "bg-blue-500/20 text-blue-400",
                status.color === "purple" && "bg-purple-500/20 text-purple-400",
                status.color === "green" && "bg-green-500/20 text-green-400"
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>

          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {request.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#E92C92] to-[#C81E78] flex items-center justify-center text-[10px] text-white font-medium">
                  {request.authorAvatar}
                </div>
                {request.author}
              </span>
              <span className="px-2 py-0.5 bg-gray-800/50 rounded text-xs">
                {request.category}
              </span>
              <span>{request.createdAt}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {request.comments}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Discussion Card Component
const DiscussionCard = ({ discussion }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-5 hover:border-[#E92C92]/30 transition-all duration-300 cursor-pointer group"
  >
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E92C92] to-[#C81E78] flex items-center justify-center text-white font-medium shrink-0">
        {discussion.authorAvatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {discussion.isPinned && (
            <span className="px-2 py-0.5 bg-[#E92C92]/20 text-[#E92C92] text-xs font-medium rounded-full">
              Pinned
            </span>
          )}
          <h3 className="text-white font-semibold group-hover:text-[#E92C92] transition-colors truncate">
            {discussion.title}
          </h3>
        </div>
        <p className="text-gray-400 text-sm mb-3 line-clamp-1">
          {discussion.preview}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{discussion.author}</span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {discussion.replies} replies
          </span>
          <span>{discussion.views} views</span>
          <span className="text-[#E92C92]">{discussion.lastActive}</span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-[#E92C92] transition-colors shrink-0" />
    </div>
  </motion.div>
);

// Changelog Card Component
const ChangelogCard = ({ entry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative pl-8 pb-8 last:pb-0"
  >
    {/* Timeline line */}
    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-800 last:hidden" />

    {/* Timeline dot */}
    <div
      className={cn(
        "absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center",
        entry.isNew ? "bg-[#E92C92]" : "bg-gray-700"
      )}
    >
      {entry.type === "feature" ? (
        <Rocket className="h-3 w-3 text-white" />
      ) : (
        <Zap className="h-3 w-3 text-white" />
      )}
    </div>

    <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="px-2.5 py-1 bg-[#E92C92]/20 text-[#E92C92] text-sm font-bold rounded-lg">
          {entry.version}
        </span>
        <span className="text-gray-500 text-sm">{entry.date}</span>
        {entry.isNew && (
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
            New
          </span>
        )}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{entry.title}</h3>
      <p className="text-gray-400 text-sm">{entry.description}</p>
    </div>
  </motion.div>
);

// Submit Idea Modal
const SubmitIdeaModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-[#E92C92]" />
              Submit Feature Idea
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your idea?"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E92C92] focus:ring-1 focus:ring-[#E92C92] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-[#E92C92] focus:ring-1 focus:ring-[#E92C92] outline-none transition-all"
              >
                <option value="">Select a category</option>
                <option value="integrations">Integrations</option>
                <option value="ui-ux">UI/UX</option>
                <option value="communication">Communication</option>
                <option value="automation">Automation</option>
                <option value="ai">AI Features</option>
                <option value="analytics">Analytics</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your feature idea in detail..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E92C92] focus:ring-1 focus:ring-[#E92C92] outline-none transition-all resize-none"
              />
            </div>

            <button
              onClick={() => {
                // Handle submission
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-[#E92C92] to-[#C81E78] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit Idea
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center mt-4">
            Your idea will be reviewed by our team and the community can vote on it.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Support Ticket Card
const SupportCard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
      <div className="w-12 h-12 rounded-xl bg-[#E92C92]/20 flex items-center justify-center mb-4">
        <Ticket className="h-6 w-6 text-[#E92C92]" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Submit a Ticket</h3>
      <p className="text-gray-400 mb-4">
        Need help with something specific? Our support team typically responds within 24 hours.
      </p>
      <Link
        to="/help"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#E92C92]/20 text-[#E92C92] font-medium rounded-lg hover:bg-[#E92C92]/30 transition-colors"
      >
        Open Support Ticket <ArrowRight className="h-4 w-4" />
      </Link>
    </div>

    <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
        <Users className="h-6 w-6 text-purple-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Community Support</h3>
      <p className="text-gray-400 mb-4">
        Get help from other Axolop users. Many community members are eager to share their expertise.
      </p>
      <a
        href="https://discord.gg/axolop"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 font-medium rounded-lg hover:bg-purple-500/30 transition-colors"
      >
        Join Discord <ExternalLink className="h-4 w-4" />
      </a>
    </div>

    <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
        <HelpCircle className="h-6 w-6 text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Knowledge Base</h3>
      <p className="text-gray-400 mb-4">
        Browse our comprehensive documentation, guides, and tutorials.
      </p>
      <Link
        to="/help"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 font-medium rounded-lg hover:bg-blue-500/30 transition-colors"
      >
        Browse Docs <ArrowRight className="h-4 w-4" />
      </Link>
    </div>

    <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
        <Award className="h-6 w-6 text-green-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Become a Helper</h3>
      <p className="text-gray-400 mb-4">
        Love helping others? Become a verified community helper and earn rewards.
      </p>
      <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 font-medium rounded-lg hover:bg-green-500/30 transition-colors">
        Apply Now <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const Community = () => {
  const [activeTab, setActiveTab] = useState("ideas");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const filteredRequests = FEATURE_REQUESTS.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen text-white" style={{ background: "#0F0510" }}>
      <SEO
        title="Community - Axolop CRM"
        description="Join 6,000+ agency owners in the Axolop community. Share feature ideas, get support, and connect with other users."
      />
      <NavigationBar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#E92C92]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#E92C92]/20 text-[#E92C92] text-sm font-semibold mb-6">
              Community Hub
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Shape the Future of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E92C92] to-[#ff85c8]">
                Axolop CRM
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Share your ideas, vote on features, get help from the community, and stay updated on what we're building. Your voice matters.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {STATS.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 text-center"
                >
                  <StatIcon className="h-6 w-6 text-[#E92C92] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-2 flex-wrap"
          >
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#E92C92] to-[#C81E78] text-white shadow-lg shadow-[#E92C92]/25"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Feature Ideas Tab */}
              {activeTab === "ideas" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Search and Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search feature ideas..."
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-gray-800/50 rounded-xl text-white placeholder-gray-500 focus:border-[#E92C92] focus:ring-1 focus:ring-[#E92C92] outline-none transition-all"
                      />
                    </div>
                    <div className="flex gap-3">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-white/5 border border-gray-800/50 rounded-xl text-gray-300 focus:border-[#E92C92] outline-none transition-all"
                      >
                        <option value="all">All Status</option>
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="shipped">Shipped</option>
                      </select>
                      <button
                        onClick={() => setShowSubmitModal(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#E92C92] to-[#C81E78] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#E92C92]/25"
                      >
                        <Plus className="h-5 w-5" />
                        Submit Idea
                      </button>
                    </div>
                  </div>

                  {/* Feature Request List */}
                  <div className="space-y-4">
                    {filteredRequests.map((request) => (
                      <FeatureRequestCard
                        key={request.id}
                        request={request}
                        onVote={(id) => console.log("Voted on", id)}
                      />
                    ))}
                  </div>

                  {filteredRequests.length === 0 && (
                    <div className="text-center py-12">
                      <Lightbulb className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        No ideas found
                      </h3>
                      <p className="text-gray-400">
                        Try adjusting your search or filters, or submit a new idea!
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Discussions Tab */}
              {activeTab === "discussions" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                      Community Discussions
                    </h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#E92C92]/20 text-[#E92C92] font-medium rounded-lg hover:bg-[#E92C92]/30 transition-colors">
                      <Plus className="h-4 w-4" />
                      Start Discussion
                    </button>
                  </div>
                  <div className="space-y-4">
                    {DISCUSSIONS.map((discussion) => (
                      <DiscussionCard key={discussion.id} discussion={discussion} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Support Tab */}
              {activeTab === "support" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-white mb-6">
                    Get Help & Support
                  </h2>
                  <SupportCard />
                </motion.div>
              )}

              {/* Changelog Tab */}
              {activeTab === "changelog" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                      What's New in Axolop
                    </h2>
                    <Link
                      to="/roadmap"
                      className="flex items-center gap-2 text-[#E92C92] font-medium hover:underline"
                    >
                      View Full Roadmap <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="relative">
                    {CHANGELOG.map((entry) => (
                      <ChangelogCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#E92C92] to-[#C81E78] text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <Lightbulb className="h-5 w-5" />
                    Submit Feature Idea
                  </button>
                  <a
                    href="https://discord.gg/axolop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-3 bg-[#5865F2]/20 text-[#5865F2] font-medium rounded-xl hover:bg-[#5865F2]/30 transition-colors"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Join Discord
                  </a>
                  <Link
                    to="/roadmap"
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 text-gray-300 font-medium rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <Rocket className="h-5 w-5" />
                    View Roadmap
                  </Link>
                </div>
              </div>

              {/* Top Contributors */}
              <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Top Contributors
                </h3>
                <div className="space-y-3">
                  {TOP_CONTRIBUTORS.map((contributor, index) => (
                    <div
                      key={contributor.name}
                      className="flex items-center gap-3"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E92C92] to-[#C81E78] flex items-center justify-center text-white font-medium">
                          {contributor.avatar}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Star className="h-3 w-3 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {contributor.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {contributor.points} points
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                        {contributor.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Legend */}
              <div className="bg-white/5 backdrop-blur-sm border border-gray-800/50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Status Guide
                </h3>
                <div className="space-y-2">
                  {Object.entries(STATUS_OPTIONS).map(([key, status]) => {
                    const StatusIcon = status.icon;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            status.color === "gray" && "bg-gray-700/50",
                            status.color === "yellow" && "bg-yellow-500/20",
                            status.color === "blue" && "bg-blue-500/20",
                            status.color === "purple" && "bg-purple-500/20",
                            status.color === "green" && "bg-green-500/20"
                          )}
                        >
                          <StatusIcon
                            className={cn(
                              "h-3 w-3",
                              status.color === "gray" && "text-gray-300",
                              status.color === "yellow" && "text-yellow-400",
                              status.color === "blue" && "text-blue-400",
                              status.color === "purple" && "text-purple-400",
                              status.color === "green" && "text-green-400"
                            )}
                          />
                        </div>
                        <span className="text-sm text-gray-400">
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-black/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heart className="h-12 w-12 text-[#E92C92] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built By the Community, For the Community
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              89 features shipped from community ideas. Your next idea could be on our roadmap.
            </p>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#E92C92] to-[#C81E78] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#E92C92]/25"
            >
              <Lightbulb className="h-5 w-5" />
              Share Your Idea
            </button>
          </motion.div>
        </div>
      </section>

      <FooterSection />

      {/* Submit Idea Modal */}
      <SubmitIdeaModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
};

export default Community;
