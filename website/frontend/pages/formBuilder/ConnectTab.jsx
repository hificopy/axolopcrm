import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Webhook,
  Database,
  Zap,
  ToggleLeft,
  ToggleRight,
  Building,
  Send,
  ExternalLink
} from 'lucide-react';
import formsApi from '@/services/formsApi'; // Import formsApi

export default function ConnectTab({ form }) { // Removed setForm as it's no longer needed for integrations
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const integrationTypes = [
    { id: 'google-sheets', name: 'Google Sheets', icon: Database, description: 'Send form responses to a Google Sheet' },
    { id: 'email-notifications', name: 'Email Notifications', icon: Mail, description: 'Get notified when someone submits the form' },
    { id: 'webhooks', name: 'Webhooks', icon: Webhook, description: 'Send data to your custom endpoint' },
    { id: 'crm-sync', name: 'CRM Sync', icon: Building, description: 'Automatically create contacts and leads' },
    { id: 'zapier', name: 'Zapier', icon: Zap, description: 'Connect to 5000+ apps via Zapier' }
  ];

  const fetchIntegrations = useCallback(async () => {
    if (!form.id || form.id === 'new-form') {
      setIntegrations(integrationTypes.map(type => ({
        ...type,
        enabled: false,
        config: {}
      })));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedIntegrations = await formsApi.getIntegrations(form.id);
      
      // Merge fetched integrations with default types to ensure all types are displayed
      const mergedIntegrations = integrationTypes.map(type => {
        const fetched = fetchedIntegrations.find(fi => fi.integration_type === type.id);
        return {
          ...type,
          id: fetched?.id || type.id, // Use backend ID if available, otherwise use type ID
          enabled: !!fetched, // Enabled if fetched from backend
          integration_type: type.id, // Ensure integration_type is always present
          config: fetched?.config || {},
          webhook_url: fetched?.webhook_url || '',
          webhook_method: fetched?.webhook_method || 'POST',
          webhook_headers: fetched?.webhook_headers || {},
          notification_email: fetched?.notification_email || '',
          email_template: fetched?.email_template || ''
        };
      });
      setIntegrations(mergedIntegrations);
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [form.id]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const toggleIntegration = async (integrationType) => {
    if (!form.id || form.id === 'new-form') {
      alert('Please save the form first before managing integrations.');
      return;
    }

    const currentIntegration = integrations.find(int => int.integration_type === integrationType);

    try {
      if (currentIntegration.enabled) {
        // Disable/Delete integration
        await formsApi.deleteIntegration(form.id, currentIntegration.id);
        setIntegrations(prev => prev.map(int =>
          int.integration_type === integrationType ? { ...int, enabled: false, id: integrationType } : int
        ));
      } else {
        // Enable/Add integration
        const newIntegrationData = {
          integration_type: integrationType,
          config: {}, // Default empty config
          // Add other default fields if necessary
        };
        const newIntegration = await formsApi.addIntegration(form.id, newIntegrationData);
        setIntegrations(prev => prev.map(int =>
          int.integration_type === integrationType ? { ...int, enabled: true, id: newIntegration.id, ...newIntegration } : int
        ));
      }
    } catch (err) {
      console.error('Error toggling integration:', err);
      alert(`Failed to toggle integration: ${err.message}`);
    }
  };

  const handleConfigChange = async (integrationType, key, value) => {
    if (!form.id || form.id === 'new-form') {
      alert('Please save the form first before configuring integrations.');
      return;
    }

    const currentIntegration = integrations.find(int => int.integration_type === integrationType);
    if (!currentIntegration || !currentIntegration.enabled) return;

    const updates = { [key]: value };
    
    // Special handling for config object
    if (key === 'config') {
      updates.config = { ...currentIntegration.config, ...value };
    } else if (Object.prototype.hasOwnProperty.call(currentIntegration.config, key)) {
      updates.config = { ...currentIntegration.config, [key]: value };
    }

    try {
      const updatedIntegration = await formsApi.updateIntegration(form.id, currentIntegration.id, updates);
      setIntegrations(prev => prev.map(int =>
        int.integration_type === integrationType ? { ...int, ...updatedIntegration } : int
      ));
    } catch (err) {
      console.error('Error updating integration config:', err);
      alert(`Failed to update integration config: ${err.message}`);
    }
  };

  const handleCheckboxChange = async (integrationType, key, checked) => {
    if (!form.id || form.id === 'new-form') {
      alert('Please save the form first before configuring integrations.');
      return;
    }

    const currentIntegration = integrations.find(int => int.integration_type === integrationType);
    if (!currentIntegration || !currentIntegration.enabled) return;

    const updates = {};
    if (Object.prototype.hasOwnProperty.call(currentIntegration.config, key)) {
      updates.config = { ...currentIntegration.config, [key]: checked };
    } else {
      updates[key] = checked; // For top-level boolean fields if any
    }

    try {
      const updatedIntegration = await formsApi.updateIntegration(form.id, currentIntegration.id, updates);
      setIntegrations(prev => prev.map(int =>
        int.integration_type === integrationType ? { ...int, ...updatedIntegration } : int
      ));
    } catch (err) {
      console.error('Error updating integration checkbox:', err);
      alert(`Failed to update integration checkbox: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="h-full min-h-screen flex items-center justify-center text-crm-text-secondary pt-[150px]">Loading integrations...</div>;
  }

  if (error) {
    return <div className="h-full min-h-screen flex items-center justify-center text-[#3F0D28] pt-[150px]">Error loading integrations: ${error.message}</div>;
  }

  const getIntegrationState = (typeId) => integrations.find(int => int.integration_type === typeId) || integrationTypes.find(type => type.id === typeId);


  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-crm-text-primary mb-2">Connect</h2>
          <p className="text-crm-text-secondary">
            Integrate your form with external services and apps
          </p>
        </div>

        {/* Google Sheets Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Google Sheets</CardTitle>
                  <CardDescription>Send responses to a spreadsheet</CardDescription>
                </div>
              </div>
              <button
                onClick={() => toggleIntegration('google-sheets')}
                className="text-2xl"
                disabled={!form.id || form.id === 'new-form'}
              >
                {getIntegrationState('google-sheets')?.enabled ? (
                  <ToggleRight className="h-8 w-8 text-primary" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-400" />
                )}
              </button>
            </div>
          </CardHeader>
          {getIntegrationState('google-sheets')?.enabled && (
            <CardContent className="space-y-4">
              <div>
                <Label>Spreadsheet URL</Label>
                <Input
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="mt-1"
                  value={getIntegrationState('google-sheets')?.config?.spreadsheetUrl || ''}
                  onChange={(e) => handleConfigChange('google-sheets', 'spreadsheetUrl', e.target.value)}
                />
              </div>
              <div>
                <Label>Sheet Name</Label>
                <Input
                  placeholder="Form Responses"
                  className="mt-1"
                  value={getIntegrationState('google-sheets')?.config?.sheetName || ''}
                  onChange={(e) => handleConfigChange('google-sheets', 'sheetName', e.target.value)}
                />
              </div>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Google Account (Placeholder)
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#3F0D28]/10 rounded-lg">
                  <Mail className="h-5 w-5 text-[#3F0D28]" />
                </div>
                <div>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Get notified of new submissions</CardDescription>
                </div>
              </div>
              <button
                onClick={() => toggleIntegration('email-notifications')}
                className="text-2xl"
                disabled={!form.id || form.id === 'new-form'}
              >
                {getIntegrationState('email-notifications')?.enabled ? (
                  <ToggleRight className="h-8 w-8 text-primary" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-400" />
                )}
              </button>
            </div>
          </CardHeader>
          {getIntegrationState('email-notifications')?.enabled && (
            <CardContent className="space-y-4">
              <div>
                <Label>Notification Email</Label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  className="mt-1"
                  value={getIntegrationState('email-notifications')?.notification_email || ''}
                  onChange={(e) => handleConfigChange('email-notifications', 'notification_email', e.target.value)}
                />
              </div>
              <div>
                <Label>Send notifications for</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={getIntegrationState('email-notifications')?.config?.notifyAll || false}
                      onChange={(e) => handleCheckboxChange('email-notifications', 'notifyAll', e.target.checked)}
                    />
                    <span className="text-sm">All submissions</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={getIntegrationState('email-notifications')?.config?.notifyQualified || false}
                      onChange={(e) => handleCheckboxChange('email-notifications', 'notifyQualified', e.target.checked)}
                    />
                    <span className="text-sm">Qualified leads only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={getIntegrationState('email-notifications')?.config?.notifyHighScore || false}
                      onChange={(e) => handleCheckboxChange('email-notifications', 'notifyHighScore', e.target.checked)}
                    />
                    <span className="text-sm">High-score leads only (score &gt; 50)</span>
                  </label>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Webhook className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>Send data to your custom endpoint</CardDescription>
                </div>
              </div>
              <button
                onClick={() => toggleIntegration('webhooks')}
                className="text-2xl"
                disabled={!form.id || form.id === 'new-form'}
              >
                {getIntegrationState('webhooks')?.enabled ? (
                  <ToggleRight className="h-8 w-8 text-primary" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-400" />
                )}
              </button>
            </div>
          </CardHeader>
          {getIntegrationState('webhooks')?.enabled && (
            <CardContent className="space-y-4">
              <div>
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://your-api.com/webhook"
                  className="mt-1"
                  value={getIntegrationState('webhooks')?.webhook_url || ''}
                  onChange={(e) => handleConfigChange('webhooks', 'webhook_url', e.target.value)}
                />
              </div>
              <div>
                <Label>Method</Label>
                <select
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  value={getIntegrationState('webhooks')?.webhook_method || 'POST'}
                  onChange={(e) => handleConfigChange('webhooks', 'webhook_method', e.target.value)}
                >
                  <option>POST</option>
                  <option>PUT</option>
                  <option>PATCH</option>
                </select>
              </div>
              <div>
                <Label>Custom Headers (JSON)</Label>
                <textarea
                  placeholder='{"Authorization": "Bearer token"}'
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  rows="3"
                  value={getIntegrationState('webhooks')?.webhook_headers ? JSON.stringify(getIntegrationState('webhooks').webhook_headers, null, 2) : ''}
                  onChange={(e) => {
                    try {
                      handleConfigChange('webhooks', 'webhook_headers', JSON.parse(e.target.value));
                    } catch (jsonError) {
                      // Handle invalid JSON input gracefully
                      console.warn('Invalid JSON for webhook headers:', jsonError);
                      // Optionally, provide user feedback about invalid JSON
                    }
                  }}
                />
              </div>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Test Webhook (Placeholder)
              </Button>
            </CardContent>
          )}
        </Card>

        {/* CRM Sync */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Building className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle>CRM Sync</CardTitle>
                  <CardDescription>Create contacts and leads automatically</CardDescription>
                </div>
              </div>
              <button
                onClick={() => toggleIntegration('crm-sync')}
                className="text-2xl"
                disabled={!form.id || form.id === 'new-form'}
              >
                {getIntegrationState('crm-sync')?.enabled ? (
                  <ToggleRight className="h-8 w-8 text-primary" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-400" />
                )}
              </button>
            </div>
          </CardHeader>
          {getIntegrationState('crm-sync')?.enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={getIntegrationState('crm-sync')?.config?.createContact || false}
                    onChange={(e) => handleCheckboxChange('crm-sync', 'createContact', e.target.checked)}
                  />
                  <span className="text-sm font-medium">Create contact for each submission</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={getIntegrationState('crm-sync')?.config?.createLead || false}
                    onChange={(e) => handleCheckboxChange('crm-sync', 'createLead', e.target.checked)}
                  />
                  <span className="text-sm font-medium">Create lead for qualified submissions</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={getIntegrationState('crm-sync')?.config?.addToCampaign || false}
                    onChange={(e) => handleCheckboxChange('crm-sync', 'addToCampaign', e.target.checked)}
                  />
                  <span className="text-sm font-medium">Add to campaign automatically</span>
                </label>
              </div>

              <div>
                <Label>Default Lead Status</Label>
                <select
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  value={getIntegrationState('crm-sync')?.config?.defaultLeadStatus || 'New'}
                  onChange={(e) => handleConfigChange('crm-sync', 'defaultLeadStatus', e.target.value)}
                >
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Qualified</option>
                  <option>Proposal Sent</option>
                </select>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Zapier */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <CardTitle>Zapier</CardTitle>
                  <CardDescription>Connect to 5000+ apps</CardDescription>
                </div>
              </div>
              <button
                onClick={() => toggleIntegration('zapier')}
                className="text-2xl"
                disabled={!form.id || form.id === 'new-form'}
              >
                {getIntegrationState('zapier')?.enabled ? (
                  <ToggleRight className="h-8 w-8 text-primary" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-400" />
                )}
              </button>
            </div>
          </CardHeader>
          {getIntegrationState('zapier')?.enabled && (
            <CardContent>
              <p className="text-sm text-crm-text-secondary mb-4">
                Connect this form to Zapier to integrate with thousands of apps like Slack, Mailchimp, Airtable, and more.
              </p>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect to Zapier (Placeholder)
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}