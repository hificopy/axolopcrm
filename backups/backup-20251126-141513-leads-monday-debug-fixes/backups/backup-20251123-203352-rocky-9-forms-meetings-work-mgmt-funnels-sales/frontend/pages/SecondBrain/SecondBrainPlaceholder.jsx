import { useParams, useLocation } from 'react-router-dom';
import { Database, Network, FileText, Construction } from 'lucide-react';

const categoryColors = {
  logic: { bg: '#791C14', text: '#791C14' },
  maps: { bg: '#8b5cf6', text: '#8b5cf6' },
  notes: { bg: '#14b8a6', text: '#14b8a6' },
};

const categoryIcons = {
  logic: Database,
  maps: Network,
  notes: FileText,
};

const subsectionInfo = {
  // Logic subsections
  workflows: {
    category: 'logic',
    title: 'Workflows',
    description: 'Document and automate repeatable business processes',
    features: [
      'Visual workflow builder',
      'Workflow templates library',
      'Active workflows dashboard',
      'Trigger configuration',
      'Workflow history & logs',
    ],
  },
  playbooks: {
    category: 'logic',
    title: 'Playbooks',
    description: 'Codified sales strategies and best practices',
    features: [
      'Sales playbook repository',
      'Objection handling scripts',
      'Qualification frameworks',
      'Email and Call templates library',
      'Battle cards',
    ],
  },
  'decision-trees': {
    category: 'logic',
    title: 'Decision Trees',
    description: 'Structured decision-making frameworks',
    features: [
      'Interactive decision flows',
      'Qualification decision trees',
      'Routing rules',
      'Escalation pathways',
      'Risk assessment matrices',
    ],
  },
  formulas: {
    category: 'logic',
    title: 'Formulas & Calculations',
    description: 'Reusable business logic and metrics',
    features: [
      'Formula library (LTV, CAC, win rate)',
      'Custom field calculators',
      'Scoring models',
      'ROI calculators',
      'KPI dashboards',
    ],
  },
  sops: {
    category: 'logic',
    title: 'SOPs',
    description: 'Standard Operating Procedures',
    features: [
      'Process documentation library',
      'Onboarding checklists',
      'Role-specific procedures',
      'Tool and System guides',
      'Compliance procedures',
    ],
  },
  templates: {
    category: 'logic',
    title: 'Templates',
    description: 'Reusable content and document structures',
    features: [
      'Email templates',
      'Document templates',
      'Meeting agenda templates',
      'Project templates',
      'Campaign templates',
    ],
  },
  // Maps subsections
  'process-maps': {
    category: 'maps',
    title: 'Process Maps',
    description: 'Visual documentation of business workflows',
    features: [
      'BPMN diagram editor',
      'Sales process flowcharts',
      'Onboarding process maps',
      'Process gallery',
      'Process optimization notes',
    ],
  },
  'customer-journeys': {
    category: 'maps',
    title: 'Customer Journeys',
    description: 'Map touchpoints and experiences',
    features: [
      'Journey mapping canvas',
      'Stage-based journey views',
      'Persona-specific journeys',
      'Touchpoint repository',
      'Pain point annotations',
    ],
  },
  funnels: {
    category: 'maps',
    title: 'Funnels & Pipelines',
    description: 'Visualize conversion paths',
    features: [
      'Funnel visualization tool',
      'Pipeline stage diagrams',
      'Conversion analytics',
      'Multi-channel funnel maps',
      'Bottleneck identification',
    ],
  },
  'mind-maps': {
    category: 'maps',
    title: 'Mind Maps',
    description: 'Non-linear brainstorming',
    features: [
      'Mind map canvas',
      'Strategy brainstorms',
      'Campaign planning maps',
      'Product roadmap maps',
      'Idea incubator',
    ],
  },
  'org-charts': {
    category: 'maps',
    title: 'Org Charts & Relationships',
    description: 'Map organizational structures',
    features: [
      'Organization chart builder',
      'Stakeholder maps',
      'Influence diagrams',
      'Decision-maker hierarchies',
      'Partner and Vendor maps',
    ],
  },
  'concept-maps': {
    category: 'maps',
    title: 'Concept Maps',
    description: 'Visual knowledge structures',
    features: [
      'Concept mapping tool',
      'Product feature maps',
      'Competitive landscape maps',
      'Solution architecture diagrams',
      'Integration maps',
    ],
  },
  // Notes subsections
  meetings: {
    category: 'notes',
    title: 'Meeting Notes',
    description: 'Capture and retrieve meeting intelligence',
    features: [
      'Meeting notes repository',
      'Auto-transcription integration',
      'Action items extractor',
      'Search & filters',
      'Follow-up tracking',
    ],
  },
  research: {
    category: 'notes',
    title: 'Research & Insights',
    description: 'Market intelligence and learning',
    features: [
      'Research library',
      'Competitive intelligence',
      'Industry trend notes',
      'Customer research',
      'Case study repository',
    ],
  },
  'customer-intel': {
    category: 'notes',
    title: 'Customer Intel',
    description: 'Centralize customer-specific knowledge',
    features: [
      'Account profiles (enriched)',
      'Customer success notes',
      'Renewal and Expansion opportunities',
      'Pain points log',
      'Win and Loss analysis',
    ],
  },
  quick: {
    category: 'notes',
    title: 'Quick Notes',
    description: 'Rapid capture inbox',
    features: [
      'Quick capture interface',
      'Daily notes (journal-style)',
      'Inbox processing queue',
      'Voice-to-text capture',
      'Note triage system',
    ],
  },
  'knowledge-base': {
    category: 'notes',
    title: 'Knowledge Base',
    description: 'Evergreen documentation',
    features: [
      'Product documentation',
      'FAQ repository',
      'Troubleshooting guides',
      'Best practices library',
      'Training materials',
    ],
  },
  projects: {
    category: 'notes',
    title: 'Project Docs',
    description: 'Project-specific documentation',
    features: [
      'Active projects repository',
      'Project plans & timelines',
      'Deliverables & assets',
      'Project meeting notes',
      'Retrospectives',
    ],
  },
};

export default function SecondBrainPlaceholder() {
  const { category, subsection } = useParams();
  const location = useLocation();

  const info = subsectionInfo[subsection] || {
    category: category || 'logic',
    title: 'Coming Soon',
    description: 'This section is under development',
    features: [],
  };

  const colors = categoryColors[info.category] || categoryColors.logic;
  const Icon = categoryIcons[info.category] || Database;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div
        className="relative border-b shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${colors.bg}05 0%, white 50%, ${colors.bg}05 100%)`,
          borderBottomColor: `${colors.bg}20`,
        }}
      >
        <div className="px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="p-4 rounded-2xl shadow-lg"
              style={{
                backgroundColor: `${colors.bg}10`,
                borderColor: `${colors.bg}30`,
                border: '2px solid',
              }}
            >
              <Icon className="h-8 w-8" style={{ color: colors.text }} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
                {info.category.charAt(0).toUpperCase() + info.category.slice(1)}
              </div>
              <h1 className="text-4xl font-bold text-gray-900">{info.title}</h1>
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">{info.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Coming Soon Card */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 mb-8">
            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${colors.bg}10` }}
              >
                <Construction className="h-6 w-6" style={{ color: colors.text }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Under Construction
                </h2>
                <p className="text-gray-600 mb-4">
                  This section is currently being developed. Check back soon for a fully functional {info.title} module integrated with your CRM data.
                </p>
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{
                    backgroundColor: `${colors.bg}10`,
                    color: colors.text,
                  }}
                >
                  <span>⏰</span>
                  <span>Coming in V1.2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Planned Features */}
          {info.features.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>🎯</span>
                <span>Planned Features</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {info.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-100 hover:border-gray-200 transition-colors duration-200"
                  >
                    <div
                      className="mt-0.5 h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colors.text }}
                    />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CRM Integration Note */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔗</span>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">CRM Integration</h4>
                <p className="text-sm text-gray-700">
                  When launched, this feature will be deeply integrated with your CRM data,
                  allowing you to connect {info.title.toLowerCase()} directly to contacts, deals,
                  opportunities, and campaigns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
