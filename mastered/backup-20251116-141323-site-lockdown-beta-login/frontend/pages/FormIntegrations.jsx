import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Users, 
  Target, 
  FileText, 
  Zap, 
  Activity, 
  Briefcase, 
  Plus, 
  Download,
  Settings,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FormIntegrations() {
  const { formId } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from API
    // formsApi.getForm(formId).then(setFormData).catch(setError);
    // For demo purposes, using mock data
    const mockFormData = {
      id: formId,
      name: 'Lead Qualification Form',
      connectedLeadFields: [
        { formField: 'Full Name', crmField: 'Contact Name', type: 'mapping' },
        { formField: 'Email', crmField: 'Email', type: 'mapping' },
        { formField: 'Company', crmField: 'Company Name', type: 'mapping' },
        { formField: 'Phone', crmField: 'Phone', type: 'mapping' },
        { formField: 'Budget Range', crmField: 'Lead Budget', type: 'mapping' },
      ],
      triggers: [
        { 
          type: 'new-submission', 
          action: 'Create Lead', 
          condition: 'Always',
          active: true 
        },
        { 
          type: 'high-value-response', 
          action: 'Assign to Sales', 
          condition: 'Budget > $10,000',
          active: true 
        },
        { 
          type: 'keyword-detected', 
          action: 'Send Email', 
          condition: 'Response contains "urgent"',
          active: false 
        },
      ],
      recentSubmissions: [
        { id: 'sub1', name: 'John Smith', email: 'john@example.com', date: '2025-11-10', leadCreated: true },
        { id: 'sub2', name: 'Sarah Johnson', email: 'sarah@example.com', date: '2025-11-09', leadCreated: true },
        { id: 'sub3', name: 'Mike Davis', email: 'mike@example.com', date: '2025-11-08', leadCreated: false },
      ],
      integrationStats: {
        leadsGenerated: 247,
        conversionRate: 68.5,
        averageValue: 12500,
        roi: 4.2
      }
    };
    
    setFormData(mockFormData);
    setLoading(false);
  }, [formId]);

  const handleRefreshStats = async () => {
    setLoading(true);
    try {
      // In a real app, this would refetch the data from API
      // const updatedData = await formsApi.getFormIntegrations(formId);
      // setFormData(updatedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTrigger = async (index) => {
    if (!formData) return;
    
    const updatedTriggers = [...formData.triggers];
    updatedTriggers[index].active = !updatedTriggers[index].active;
    
    // Create updated form data
    const updatedFormData = { ...formData, triggers: updatedTriggers };
    setFormData(updatedFormData);
    
    // In a real app, this would update the trigger via API
    // try {
    //   await formsApi.updateFormTrigger(formId, updatedTriggers[index]);
    // } catch (err) {
    //   // Handle error and revert the change
    //   updatedTriggers[index].active = !updatedTriggers[index].active;
    //   setFormData({ ...formData, triggers: updatedTriggers });
    //   alert('Error updating trigger. Please try again.');
    // }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-blue border-t-transparent"></div>
          <p className="text-crm-text-secondary">Loading integration settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-crm-text-primary mb-2">Error Loading Integrations</h2>
          <p className="text-crm-text-secondary mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-crm-text-primary mb-2">Form Not Found</h2>
          <p className="text-crm-text-secondary mb-4">The requested form could not be found.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">
              {formData.name} - CRM Integration
            </h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Connect form responses to CRM workflows and automation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="default" 
              onClick={handleRefreshStats}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              <span>Refresh</span>
            </Button>
            <Button variant="default" size="default" className="gap-2">
              <Settings className="h-4 w-4" />
              <span>Configure</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Integration Stats */}
      <div className="bg-white border-b border-crm-border px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-blue/10">
                  <Users className="h-5 w-5 text-primary-blue" />
                </div>
                <div>
                  <div className="text-sm text-crm-text-secondary">Leads Generated</div>
                  <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                    {formData.integrationStats.leadsGenerated}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-green/10">
                  <TrendingUp className="h-5 w-5 text-primary-green" />
                </div>
                <div>
                  <div className="text-sm text-crm-text-secondary">Conversion Rate</div>
                  <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                    {formData.integrationStats.conversionRate}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-yellow/10">
                  <Target className="h-5 w-5 text-primary-yellow" />
                </div>
                <div>
                  <div className="text-sm text-crm-text-secondary">Avg. Value</div>
                  <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                    ${formData.integrationStats.averageValue.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-blue/10">
                  <Zap className="h-5 w-5 text-primary-blue" />
                </div>
                <div>
                  <div className="text-sm text-crm-text-secondary">ROI</div>
                  <div className="text-2xl font-semibold text-crm-text-primary mt-1">
                    {formData.integrationStats.roi}x
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Integration Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Field Mapping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Field Mapping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.connectedLeadFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded">
                        {field.type === 'mapping' ? <FileText className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-crm-text-primary">{field.formField}</div>
                        <div className="text-sm text-crm-text-secondary">→ {field.crmField}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">{field.type}</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Field Mapping
              </Button>
            </CardContent>
          </Card>

          {/* Automation Triggers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automation Triggers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.triggers.map((trigger, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-crm-text-primary">{trigger.action}</div>
                      <div className="text-sm text-crm-text-secondary">
                        When {trigger.type.replace('-', ' ')} and {trigger.condition}
                      </div>
                    </div>
                    <Button
                      variant={trigger.active ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleTrigger(index)}
                    >
                      {trigger.active ? 'Active' : 'Inactive'}
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Automation
              </Button>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Submissions with Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${submission.leadCreated ? 'bg-primary-green' : 'bg-gray-300'}`}></div>
                      <div>
                        <div className="font-medium text-crm-text-primary">{submission.name}</div>
                        <div className="text-sm text-crm-text-secondary">{submission.email}</div>
                      </div>
                    </div>
                    <div className="text-sm text-crm-text-secondary">{submission.date}</div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Download className="h-4 w-4 mr-2" />
                Export Submissions
              </Button>
            </CardContent>
          </Card>

          {/* Integration Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Integration Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary-blue/10 rounded">
                      <Users className="h-4 w-4 text-primary-blue" />
                    </div>
                    <div className="font-medium">Lead Creation</div>
                  </div>
                  <p className="text-sm text-crm-text-secondary">
                    New form submissions automatically create leads in the CRM
                  </p>
                </div>

                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary-green/10 rounded">
                      <Briefcase className="h-4 w-4 text-primary-green" />
                    </div>
                    <div className="font-medium">Deal Generation</div>
                  </div>
                  <p className="text-sm text-crm-text-secondary">
                    High-value leads can automatically create opportunities
                  </p>
                </div>

                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary-yellow/10 rounded">
                      <Mail className="h-4 w-4 text-primary-yellow" />
                    </div>
                    <div className="font-medium">Email Automation</div>
                  </div>
                  <p className="text-sm text-crm-text-secondary">
                    Send follow-up emails based on form responses
                  </p>
                </div>

                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary-blue/10 rounded">
                      <Phone className="h-4 w-4 text-primary-blue" />
                    </div>
                    <div className="font-medium">Task Creation</div>
                  </div>
                  <p className="text-sm text-crm-text-secondary">
                    Create follow-up tasks for sales team
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}