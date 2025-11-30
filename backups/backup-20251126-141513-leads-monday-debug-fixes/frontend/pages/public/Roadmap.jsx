import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Clock,
  Rocket,
  Zap,
  Mail,
  Phone,
  LayoutDashboard,
  Code,
  CreditCard,
  Users,
  Shield,
  Download,
  Trash2,
  Archive,
  MessageSquare,
  CheckSquare,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { FEATURES, getFeaturesByVersion, getFeaturesByCategory } from '@/config/features';

// Icon mapping for features
const getFeatureIcon = (featureId) => {
  const iconMap = {
    'communication.phone': Phone,
    'communication.dialer': Phone,
    'communication.outcomes': Zap,
    'communication.notetaker': MessageSquare,
    'communication.email': Mail,
    'communication.templates': Mail,
    'communication.sendAs': Mail,
    'customization.aiKnowledge': Code,
    'account.appearance': LayoutDashboard,
    'account.twoFactor': Shield,
    'account.calendarSync': Clock,
    'billing.usage': CreditCard,
    'userMenu.importData': Download,
    'userMenu.automations': Zap,
    'userMenu.trash': Trash2,
    'userMenu.archive': Archive,
    'userMenu.teams': Users,
    'secondBrain.chat': MessageSquare,
    'secondBrain.tasks': CheckSquare
  };
  return iconMap[featureId] || Zap;
};

// Version status - Updated to use branded dark red instead of yellow
const getVersionStatus = (version) => {
  if (version === 'V1.0') return { status: 'released', label: 'Released', color: 'green' };
  if (version === 'V1.1') return { status: 'next', label: 'Coming Soon', color: 'red' };
  if (version === 'V1.2') return { status: 'planned', label: 'Planned', color: 'blue' };
  return { status: 'future', label: 'Future', color: 'gray' };
};

// Feature Card Component
const FeatureCard = ({ feature }) => {
  const Icon = getFeatureIcon(feature.id);
  const versionStatus = getVersionStatus(feature.version);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          versionStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
          versionStatus.color === 'red' ? 'bg-[#4A1515]/10 dark:bg-[#4A1515]/30' :
          versionStatus.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
          'bg-gray-100 dark:bg-gray-700'
        }`}>
          <Icon className={`h-5 w-5 ${
            versionStatus.color === 'green' ? 'text-green-600 dark:text-green-400' :
            versionStatus.color === 'red' ? 'text-[#d4463c] dark:text-[#d4463c]' :
            versionStatus.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
            'text-gray-600 dark:text-gray-400'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{feature.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{feature.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              versionStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
              versionStatus.color === 'red' ? 'bg-[#4A1515]/10 dark:bg-[#4A1515]/50 text-[#4A1515] dark:text-[#d4463c]' :
              versionStatus.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
              'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              {feature.version}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{feature.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Version Section Component
const VersionSection = ({ version, features, isExpanded, onToggle }) => {
  const versionStatus = getVersionStatus(version);

  return (
    <div className="mb-8">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${
            versionStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
            versionStatus.color === 'red' ? 'bg-[#4A1515]/10 dark:bg-[#4A1515]/30' :
            versionStatus.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
            'bg-gray-100 dark:bg-gray-700'
          }`}>
            {versionStatus.status === 'released' ? (
              <Check className={`h-6 w-6 text-green-600 dark:text-green-400`} />
            ) : versionStatus.status === 'next' ? (
              <Rocket className={`h-6 w-6 text-[#d4463c]`} />
            ) : (
              <Clock className={`h-6 w-6 text-blue-600 dark:text-blue-400`} />
            )}
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{version}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {versionStatus.label} - {features.length} feature{features.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            versionStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
            versionStatus.color === 'red' ? 'bg-[#4A1515]/10 dark:bg-[#4A1515]/50 text-[#4A1515] dark:text-[#d4463c]' :
            versionStatus.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {versionStatus.label}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Roadmap() {
  const [expandedVersions, setExpandedVersions] = useState({
    'V1.0': false,
    'V1.1': true,
    'V1.2': true
  });
  const [viewMode, setViewMode] = useState('version'); // 'version' or 'category'

  const featuresByVersion = getFeaturesByVersion();
  const featuresByCategory = getFeaturesByCategory();

  const toggleVersion = (version) => {
    setExpandedVersions(prev => ({
      ...prev,
      [version]: !prev[version]
    }));
  };

  // Sort versions
  const sortedVersions = Object.keys(featuresByVersion).sort((a, b) => {
    const order = { 'V1.0': 0, 'V1.1': 1, 'V1.2': 2 };
    return (order[a] ?? 99) - (order[b] ?? 99);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#4A1515] to-[#3D1212] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Axolop</span>
            </Link>
            <Link
              to="/signin"
              className="px-4 py-2 bg-gradient-to-br from-[#4A1515] to-[#3D1212] hover:from-[#5C1E1E] hover:to-[#4A1515] text-white font-semibold rounded-lg transition-colors shadow-[0_0_15px_rgba(74,21,21,0.3)]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#4A1515]/5 to-[#3D1212]/10 dark:from-gray-800 dark:to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Product Roadmap
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            See what we're working on and what's coming next. Our roadmap is driven by customer feedback
            and our mission to help agencies save time and money.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Released</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#d4463c]"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Coming Soon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Planned</span>
            </div>
          </div>
        </div>
      </section>

      {/* View Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Features</h2>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('version')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'version'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              By Version
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'category'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              By Category
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {viewMode === 'version' ? (
          // Version View
          <div>
            {sortedVersions.map((version) => (
              <VersionSection
                key={version}
                version={version}
                features={featuresByVersion[version]}
                isExpanded={expandedVersions[version] ?? true}
                onToggle={() => toggleVersion(version)}
              />
            ))}
          </div>
        ) : (
          // Category View
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(featuresByCategory).map(([category, features]) => (
              <div key={category} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#d4463c]" />
                  {category}
                </h3>
                <div className="space-y-3">
                  {features.map((feature) => {
                    const Icon = getFeatureIcon(feature.id);
                    const versionStatus = getVersionStatus(feature.version);
                    return (
                      <div key={feature.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{feature.name}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          versionStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                          versionStatus.color === 'red' ? 'bg-[#4A1515]/10 dark:bg-[#4A1515]/50 text-[#4A1515] dark:text-[#d4463c]' :
                          versionStatus.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {feature.version}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#4A1515] to-[#3D1212] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to transform your agency?
          </h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Join thousands of agencies using Axolop to streamline their operations and save over $1,375/month.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#4A1515] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Free Trial
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#4A1515] to-[#3D1212] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold">Axolop</span>
            </div>
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Axolop. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
