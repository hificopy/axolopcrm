import { useNavigate } from 'react-router-dom';
import SecondBrainLayout from '../../layouts/SecondBrainLayout';
import {
  Database,
  Network,
  FileText,
  Workflow,
  BookOpen,
  GitBranch,
  Calculator,
  FileCode,
  FileStack,
  FolderTree,
  TrendingUp,
  Layers,
  Map,
  Users,
  Share2,
  ClipboardList,
  Search,
  Lightbulb,
  StickyNote,
  FolderOpen,
  Brain,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const SecondBrainDashboard = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'Logic',
      icon: Database,
      color: '#791C14',
      description: 'Structured thinking & automation',
      subsections: [
        { name: 'Workflows', icon: Workflow, href: '/second-brain/logic/workflows' },
        { name: 'Playbooks', icon: BookOpen, href: '/second-brain/logic/playbooks' },
        { name: 'Decision Trees', icon: GitBranch, href: '/second-brain/logic/decision-trees' },
        { name: 'Formulas', icon: Calculator, href: '/second-brain/logic/formulas' },
        { name: 'SOPs', icon: FileCode, href: '/second-brain/logic/sops' },
        { name: 'Templates', icon: FileStack, href: '/second-brain/logic/templates' },
      ]
    },
    {
      name: 'Maps',
      icon: Network,
      color: '#8b5cf6',
      description: 'Visual thinking & diagrams',
      subsections: [
        { name: 'Process Maps', icon: FolderTree, href: '/second-brain/maps/process-maps' },
        { name: 'Customer Journeys', icon: TrendingUp, href: '/second-brain/maps/customer-journeys' },
        { name: 'Funnels & Pipelines', icon: Layers, href: '/second-brain/maps/funnels' },
        { name: 'Mind Maps', icon: Map, href: '/second-brain/maps/mind-maps' },
        { name: 'Org Charts', icon: Users, href: '/second-brain/maps/org-charts' },
        { name: 'Concept Maps', icon: Share2, href: '/second-brain/maps/concept-maps' },
      ]
    },
    {
      name: 'Notes',
      icon: FileText,
      color: '#14b8a6',
      description: 'Documentation & knowledge capture',
      subsections: [
        { name: 'Meeting Notes', icon: ClipboardList, href: '/second-brain/notes/meetings' },
        { name: 'Research & Insights', icon: Search, href: '/second-brain/notes/research' },
        { name: 'Customer Intel', icon: Lightbulb, href: '/second-brain/notes/customer-intel' },
        { name: 'Quick Notes', icon: StickyNote, href: '/second-brain/notes/quick' },
        { name: 'Knowledge Base', icon: BookOpen, href: '/second-brain/notes/knowledge-base' },
        { name: 'Project Docs', icon: FolderOpen, href: '/second-brain/notes/projects' },
      ]
    }
  ];

  return (
    <SecondBrainLayout>
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        {/* Header */}
        <div className="relative border-b border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
          <div className="px-8 py-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  <span>Axolop Second Brain</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Knowledge Management</h1>
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl">
              Your unified system for structured thinking, visual mapping, and knowledge capture - integrated directly with your CRM data.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to Your Second Brain</h2>
                  <p className="text-white/90 mb-4">
                    Transform your CRM into a complete Business Operating System. Capture knowledge, visualize processes, and automate your thinking.
                  </p>
                  <div className="flex gap-3">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                      🧠 Logic
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                      🗺️ Maps
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                      📝 Notes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.name}
                    className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {/* Category Header */}
                    <div
                      className="p-6 border-b-4"
                      style={{ borderBottomColor: category.color }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="p-3 rounded-xl shadow-md"
                          style={{
                            backgroundColor: `${category.color}15`,
                            borderColor: `${category.color}30`,
                            border: '2px solid'
                          }}
                        >
                          <Icon className="h-6 w-6" style={{ color: category.color }} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>

                    {/* Subsections List */}
                    <div className="p-4">
                      <div className="space-y-1">
                        {category.subsections.map((subsection) => {
                          const SubIcon = subsection.icon;
                          return (
                            <button
                              key={subsection.name}
                              onClick={() => navigate(subsection.href)}
                              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-3">
                                <SubIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                  {subsection.name}
                                </span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What is Second Brain */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  <span>What is Second Brain?</span>
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Second Brain integrates <strong>Logic</strong> (structured thinking), <strong>Maps</strong> (visual thinking),
                  and <strong>Notes</strong> (knowledge capture) directly with your CRM data.
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Never lose institutional knowledge when team members leave</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Document processes, playbooks, and strategies in one place</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Connect insights directly to contacts, deals, and campaigns</span>
                  </div>
                </div>
              </div>

              {/* Getting Started */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🚀</span>
                  <span>Getting Started</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Explore Categories</p>
                      <p className="text-xs text-gray-600">Browse Logic, Maps, and Notes subsections</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Start with Quick Notes</p>
                      <p className="text-xs text-gray-600">Capture ideas and meeting insights immediately</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Build Your System</p>
                      <p className="text-xs text-gray-600">Create workflows, maps, and knowledge base articles</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SecondBrainLayout>
  );
};

export default SecondBrainDashboard;
