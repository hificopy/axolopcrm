import { Brain, Sparkles, Network, Search, FileText, Link2, Zap } from 'lucide-react';

const SecondBrain = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Brain Icon with Orbiting Elements */}
          <div className="relative inline-block mb-8">
            <div className="relative">
              <Brain className="w-24 h-24 text-[#761B14] mx-auto" />

              {/* Orbiting particles */}
              <div className="absolute inset-0 -m-8">
                <div className="absolute w-3 h-3 bg-[#761B14] rounded-full animate-orbit-1"
                     style={{ top: '50%', left: '50%', transformOrigin: '0 0' }} />
                <div className="absolute w-3 h-3 bg-[#761B14]/70 rounded-full animate-orbit-2"
                     style={{ top: '50%', left: '50%', transformOrigin: '0 0' }} />
                <div className="absolute w-3 h-3 bg-[#761B14]/40 rounded-full animate-orbit-3"
                     style={{ top: '50%', left: '50%', transformOrigin: '0 0' }} />
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#761B14]/10 text-[#761B14] mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">COMING SOON - BETA Q2 2025</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Your Second Brain
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
            The ultimate knowledge management system. Replace Notion, Roam Research, and Obsidian with one powerful platform built directly into your CRM.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <button className="btn-premium-red px-8 py-3 rounded-lg text-white font-semibold transition-colors shadow-lg hover:shadow-xl">
              Join Waitlist
            </button>
            <button className="px-8 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg">
              View Roadmap
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="group p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#761B14] hover:-translate-y-1">
            <div className="w-12 h-12 rounded-lg bg-[#761B14]/10 flex items-center justify-center mb-4 group-hover:bg-[#761B14] transition-colors">
              <FileText className="w-6 h-6 text-[#761B14] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Rich Documents
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create beautiful docs with Markdown, tables, code blocks, and embeds. WYSIWYG or Markdown mode.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#761B14] hover:-translate-y-1">
            <div className="w-12 h-12 rounded-lg bg-[#761B14]/10 flex items-center justify-center mb-4 group-hover:bg-[#761B14] transition-colors">
              <Link2 className="w-6 h-6 text-[#761B14] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Bi-Directional Links
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect ideas with [[wiki-links]]. Automatic backlinks and unlinked mentions detection.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#761B14] hover:-translate-y-1">
            <div className="w-12 h-12 rounded-lg bg-[#761B14]/10 flex items-center justify-center mb-4 group-hover:bg-[#761B14] transition-colors">
              <Network className="w-6 h-6 text-[#761B14] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Knowledge Graph
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Visualize connections between notes. Discover patterns and relationships in your knowledge.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#761B14] hover:-translate-y-1">
            <div className="w-12 h-12 rounded-lg bg-[#761B14]/10 flex items-center justify-center mb-4 group-hover:bg-[#761B14] transition-colors">
              <Search className="w-6 h-6 text-[#761B14] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI-Powered Search
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Semantic search across all notes. AI understands context and finds relevant information instantly.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#761B14] hover:-translate-y-1">
            <div className="w-12 h-12 rounded-lg bg-[#761B14]/10 flex items-center justify-center mb-4 group-hover:bg-[#761B14] transition-colors">
              <Zap className="w-6 h-6 text-[#761B14] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Databases & Views
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create custom databases with Table, Board, Calendar, and Gallery views. Relations and rollups.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#761B14] hover:-translate-y-1">
            <div className="w-12 h-12 rounded-lg bg-[#761B14]/10 flex items-center justify-center mb-4 group-hover:bg-[#761B14] transition-colors">
              <Sparkles className="w-6 h-6 text-[#761B14] group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Assistant
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Auto-summarize documents, extract action items, and chat with your knowledge base using AI.
            </p>
          </div>
        </div>

        {/* Why Second Brain */}
        <div className="max-w-4xl mx-auto mt-20 p-8 rounded-2xl bg-gradient-to-br from-[#761B14]/10 to-[#761B14]/5 border border-[#761B14]/20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Why Built Into Your CRM?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#761B14] text-white flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Context Everywhere
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Link notes to leads, deals, and meetings. Your knowledge connects directly to your business.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#761B14] text-white flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  No More Switching
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Stop jumping between Notion, your CRM, and Slack. Everything in one place.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#761B14] text-white flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Unified Search
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Search across notes, contacts, deals, and emails in one search bar.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#761B14] text-white flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Save $4,500/Year
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  For 25-user team. Replace Notion Business ($15/user/month) with included feature.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Development Roadmap
          </h2>

          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#761B14] text-white flex items-center justify-center font-bold">
                  Q2
                </div>
                <div className="w-0.5 h-full bg-[#761B14]/30 mt-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Q2 2025 - Beta Launch
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Core features: Rich documents, bi-directional links, databases, AI search, real-time collaboration
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#761B14]/50 text-white flex items-center justify-center font-bold">
                  Q3
                </div>
                <div className="w-0.5 h-full bg-[#761B14]/30 mt-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Q3 2025 - Advanced Features
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Templates library, knowledge graph visualization, AI assistant, version history, public pages
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#761B14]/30 text-white flex items-center justify-center font-bold">
                  Q4
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Q4 2025 - Mobile & Integrations
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  iOS and Android apps, offline mode, third-party integrations, API for developers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Be the First to Know
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join the waitlist to get early access and exclusive beta pricing
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#761B14]"
            />
            <button className="btn-premium-red px-8 py-3 rounded-lg text-white font-semibold transition-colors shadow-lg hover:shadow-xl">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes orbit-1-page {
          from { transform: rotate(0deg) translateX(32px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(32px) rotate(-360deg); }
        }
        @keyframes orbit-2-page {
          from { transform: rotate(120deg) translateX(32px) rotate(-120deg); }
          to { transform: rotate(480deg) translateX(32px) rotate(-480deg); }
        }
        @keyframes orbit-3-page {
          from { transform: rotate(240deg) translateX(32px) rotate(-240deg); }
          to { transform: rotate(600deg) translateX(32px) rotate(-600deg); }
        }
        .animate-orbit-1 { animation: orbit-1-page 4s linear infinite; }
        .animate-orbit-2 { animation: orbit-2-page 4s linear infinite; }
        .animate-orbit-3 { animation: orbit-3-page 4s linear infinite; }
      `}</style>
    </div>
  );
};

export default SecondBrain;
