import { useState, useEffect } from 'react';
import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  FileText, 
  Calendar,
  Target,
  Mail,
  Phone,
  Settings,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

// Dashboard templates configuration
const DASHBOARD_TEMPLATES = {
  sales: {
    id: 'sales',
    name: 'Sales Dashboard',
    description: 'Track leads, opportunities, and revenue metrics',
    icon: TrendingUp,
    color: 'blue',
    widgets: [
      { id: 'revenue', type: 'RevenueChart', w: 8, h: 4, x: 0, y: 0 },
      { id: 'leads', type: 'MetricCard', w: 4, h: 2, x: 8, y: 0, props: { title: 'Total Leads', icon: 'Users' } },
      { id: 'opportunities', type: 'MetricCard', w: 4, h: 2, x: 0, y: 2, props: { title: 'Opportunities', icon: 'Target' } },
      { id: 'conversion', type: 'ConversionFunnelWidget', w: 6, h: 3, x: 4, y: 2 },
      { id: 'activities', type: 'MetricCard', w: 4, h: 2, x: 10, y: 2, props: { title: 'Activities', icon: 'Calendar' } }
    ]
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Dashboard',
    description: 'Monitor campaigns, forms, and engagement',
    icon: Mail,
    color: 'purple',
    widgets: [
      { id: 'campaigns', type: 'MetricCard', w: 4, h: 2, x: 0, y: 0, props: { title: 'Active Campaigns', icon: 'Mail' } },
      { id: 'forms', type: 'MetricCard', w: 4, h: 2, x: 4, y: 0, props: { title: 'Total Forms', icon: 'FileText' } },
      { id: 'submissions', type: 'MetricCard', w: 4, h: 2, x: 8, y: 0, props: { title: 'Form Submissions', icon: 'BarChart3' } },
      { id: 'email-marketing', type: 'EmailMarketingWidget', w: 8, h: 4, x: 0, y: 2 },
      { id: 'conversion-rate', type: 'MetricCard', w: 4, h: 2, x: 8, y: 2, props: { title: 'Conversion Rate', icon: 'TrendingUp' } }
    ]
  },
  executive: {
    id: 'executive',
    name: 'Executive Overview',
    description: 'High-level business metrics and KPIs',
    icon: Settings,
    color: 'emerald',
    widgets: [
      { id: 'total-revenue', type: 'MetricCard', w: 4, h: 2, x: 0, y: 0, props: { title: 'Total Revenue', icon: 'DollarSign' } },
      { id: 'active-clients', type: 'MetricCard', w: 4, h: 2, x: 4, y: 0, props: { title: 'Active Clients', icon: 'Users' } },
      { id: 'team-performance', type: 'MetricCard', w: 4, h: 2, x: 8, y: 0, props: { title: 'Team Performance', icon: 'TrendingUp' } },
      { id: 'client-acquisition', type: 'MetricCard', w: 4, h: 2, x: 0, y: 2, props: { title: 'Client Acquisition', icon: 'Users' } },
      { id: 'revenue-growth', type: 'RevenueChart', w: 8, h: 4, x: 4, y: 2 },
      { id: 'churn-rate', type: 'MetricCard', w: 4, h: 2, x: 8, y: 2, props: { title: 'Churn Rate', icon: 'TrendingUp' } }
    ]
  },
  support: {
    id: 'support',
    name: 'Support Dashboard',
    description: 'Track tickets, response times, and customer satisfaction',
    icon: Phone,
    color: 'orange',
    widgets: [
      { id: 'open-tickets', type: 'MetricCard', w: 4, h: 2, x: 0, y: 0, props: { title: 'Open Tickets', icon: 'Phone' } },
      { id: 'response-time', type: 'MetricCard', w: 4, h: 2, x: 4, y: 0, props: { title: 'Avg Response Time', icon: 'Clock' } },
      { id: 'customer-satisfaction', type: 'MetricCard', w: 4, h: 2, x: 8, y: 0, props: { title: 'Satisfaction Score', icon: 'TrendingUp' } },
      { id: 'resolved-tickets', type: 'MetricCard', w: 4, h: 2, x: 0, y: 2, props: { title: 'Resolved Today', icon: 'CheckSquare' } }
    ]
  }
};

// Template card component
const TemplateCard = ({ template, onSelect, isSelected }) => {
  const Icon = template.icon;
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
  };
  
  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${colorClasses[template.color] || colorClasses.blue}
      `}
      onClick={() => onSelect(template)}
    >
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-white/50">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {template.widgets.length} widgets
          </span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </Card>
  );
};

// Quick setup wizard component
export const DashboardSetupWizard = ({ isOpen, onClose, onSelectTemplate, onQuickSetup }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };
  
  const handleStartSetup = () => {
    if (!selectedTemplate) return;
    
    setIsSettingUp(true);
    
    // Simulate setup process
    setTimeout(() => {
      onSelectTemplate(selectedTemplate);
      onQuickSetup(selectedTemplate);
      setIsSettingUp(false);
      onClose();
    }, 2000);
  };
  
  const handleSkipSetup = () => {
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Choose Your Dashboard</h2>
              <p className="text-sm text-gray-600 mt-1">Select a template to get started quickly</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              ×
            </Button>
          </div>
        </div>
        
        {/* Templates */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(DASHBOARD_TEMPLATES).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleSelectTemplate}
                isSelected={selectedTemplate?.id === template.id}
              />
            ))}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleSkipSetup}
              disabled={isSettingUp}
            >
              Skip for now
            </Button>
            
            <Button
              onClick={handleStartSetup}
              disabled={!selectedTemplate || isSettingUp}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSettingUp ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Setting up...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Start with this template
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>
          
          {selectedTemplate && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Sparkles className="h-4 w-4" />
                <span>
                  <strong>{selectedTemplate.name}</strong> will be set up with:
                  {selectedTemplate.widgets.length} pre-configured widgets
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick start button component
export const QuickStartButton = ({ onClick, showWizard = true }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={onClick}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-200 hover:scale-105"
      >
        <Sparkles className="h-4 w-4" />
        {showWizard ? 'Setup Dashboard' : 'Get Started'}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Dashboard template selector component
export const DashboardTemplateSelector = ({ currentTemplate, onTemplateChange, showQuickStart = false }) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  
  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };
  
  const handleTemplateSelect = (template) => {
    onTemplateChange(template);
    setIsWizardOpen(false);
  };
  
  return (
    <>
      <DashboardSetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        onQuickSetup={(template) => {
          // Apply template logic would go here
          console.log('Applying template:', template);
        }}
      />
      
      {showQuickStart && (
        <QuickStartButton onClick={handleOpenWizard} />
      )}
    </>
  );
};

export default DASHBOARD_TEMPLATES;