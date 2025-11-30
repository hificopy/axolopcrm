import { useState } from 'react';
import { Plug, Settings, Code, Globe, Database, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function IntegrationsSettings() {
  const [activeTab, setActiveTab] = useState('integrations');

  const [integrations, setIntegrations] = useState([
    { id: 1, name: 'Google Workspace', connected: true, description: 'Integrate with Gmail, Calendar, and Drive' },
    { id: 2, name: 'Salesforce', connected: false, description: 'Sync leads and opportunities with Salesforce' },
    { id: 3, name: 'HubSpot', connected: false, description: 'Connect with HubSpot CRM for seamless data sync' },
    { id: 4, name: 'Slack', connected: true, description: 'Receive notifications in Slack' },
    { id: 5, name: 'Zoom', connected: false, description: 'Schedule and join Zoom meetings directly' },
    { id: 6, name: 'Microsoft Teams', connected: false, description: 'Integrate with Microsoft Teams' },
    { id: 7, name: 'Stripe', connected: true, description: 'Payment processing integration' },
    { id: 8, name: 'Mailchimp', connected: false, description: 'Email marketing integration' },
  ]);

  const toggleIntegration = (id) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === id 
          ? { ...integration, connected: !integration.connected } 
          : integration
      )
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#1a1d24] border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">Integrations</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Connect your tools and services with Axolop
            </p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <nav className="bg-white dark:bg-[#1a1d24] rounded-lg border border-crm-border p-4">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('integrations')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'integrations'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Plug className="h-4 w-4" />
                    <span>Integrations</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'accounts'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Accounts & Apps</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('developer')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'developer'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Code className="h-4 w-4" />
                    <span>Developer</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              <div className="bg-white dark:bg-[#1a1d24] rounded-lg border border-crm-border p-6">
                {/* Integrations */}
                {activeTab === 'integrations' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Integrations</h2>

                    <div className="mb-6">
                      <div className="relative mb-4">
                        <input
                          type="text"
                          placeholder="Search integrations..."
                          className="w-full pl-10 pr-4 py-2 border border-crm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                        />
                        <Globe
                          className="absolute left-3 top-2.5 h-5 w-5 text-crm-text-secondary"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {integrations.map((integration) => (
                          <Card key={integration.id} className="border border-crm-border">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Plug className="h-5 w-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-crm-text-primary">{integration.name}</h3>
                                    <p className="text-sm text-crm-text-secondary mt-1">{integration.description}</p>
                                  </div>
                                </div>
                                <Button
                                  variant={integration.connected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleIntegration(integration.id)}
                                >
                                  {integration.connected ? 'Connected' : 'Connect'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="default">Save Changes</Button>
                    </div>
                  </div>
                )}

                {/* Accounts & Apps */}
                {activeTab === 'accounts' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Accounts & Apps</h2>

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-crm-text-primary">Connected Accounts</h3>
                        <Button variant="default">+ Add Account</Button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-crm-border">
                              <th className="text-left py-3 px-4 text-sm font-medium text-crm-text-secondary">Account</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-crm-text-secondary">Status</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-crm-text-secondary">Last Synced</th>
                              <th className="text-right py-3 px-4 text-sm font-medium text-crm-text-secondary">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-gray-100">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-[#3F0D28]/10 flex items-center justify-center">
                                    <span className="text-[#3F0D28] font-semibold text-sm">G</span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-crm-text-primary">Google Workspace</p>
                                    <p className="text-sm text-crm-text-secondary">juan@axolop.com</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Connected
                                </span>
                              </td>
                              <td className="py-3 px-4 text-crm-text-secondary">Today, 02:30 PM</td>
                              <td className="py-3 px-4 text-right">
                                <Button variant="outline" size="sm">Disconnect</Button>
                              </td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <span className="text-purple-800 font-semibold text-sm">S</span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-crm-text-primary">Slack</p>
                                    <p className="text-sm text-crm-text-secondary">axolop-crm.slack.com</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Connected
                                </span>
                              </td>
                              <td className="py-3 px-4 text-crm-text-secondary">Yesterday, 04:15 PM</td>
                              <td className="py-3 px-4 text-right">
                                <Button variant="outline" size="sm">Disconnect</Button>
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Zap className="h-4 w-4 text-green-800" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-crm-text-primary">Stripe</p>
                                    <p className="text-sm text-crm-text-secondary">axolop-payments.com</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Connected
                                </span>
                              </td>
                              <td className="py-3 px-4 text-crm-text-secondary">Nov 8, 2025</td>
                              <td className="py-3 px-4 text-right">
                                <Button variant="outline" size="sm">Disconnect</Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="default">Save Changes</Button>
                    </div>
                  </div>
                )}

                {/* Developer */}
                {activeTab === 'developer' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Developer Settings</h2>

                    <div className="mb-6">
                      <Card className="border border-crm-border p-6">
                        <h3 className="font-medium text-crm-text-primary mb-4">API Access</h3>
                        <p className="text-crm-text-secondary mb-4">
                          Use the API to integrate Axolop with your custom applications.
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-crm-text-primary">API Access Enabled</p>
                            <p className="text-sm text-crm-text-secondary">Enable API access for your account</p>
                          </div>
                          <Button variant="outline">Manage API Keys</Button>
                        </div>
                      </Card>
                    </div>

                    <div className="mb-6">
                      <Card className="border border-crm-border p-6">
                        <h3 className="font-medium text-crm-text-primary mb-4">Webhooks</h3>
                        <p className="text-crm-text-secondary mb-4">
                          Configure webhooks to receive real-time notifications about events in your account.
                        </p>
                        <Button variant="outline">Manage Webhooks</Button>
                      </Card>
                    </div>

                    <div className="mb-6">
                      <Card className="border border-crm-border p-6">
                        <h3 className="font-medium text-crm-text-primary mb-4">Custom Fields</h3>
                        <p className="text-crm-text-secondary mb-4">
                          Manage custom fields for leads, contacts, and opportunities.
                        </p>
                        <Button variant="outline">Manage Custom Fields</Button>
                      </Card>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="default">Save Changes</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}