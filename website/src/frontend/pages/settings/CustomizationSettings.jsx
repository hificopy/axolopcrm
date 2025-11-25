import { useState } from 'react';
import { LayoutDashboard, Zap, Clock, Code, Lock } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';

export default function CustomizationSettings() {
  const [activeTab, setActiveTab] = useState('fields');

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#1a1d24] border-b border-crm-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-crm-text-primary">Customization Settings</h1>
            <p className="text-sm text-crm-text-secondary mt-1">
              Customize your Axolop experience
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
                    onClick={() => setActiveTab('fields')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'fields'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Custom Fields</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('links')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'links'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    <span>Integration Links</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('scheduling')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'scheduling'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Scheduling Links</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('statuses')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'statuses'
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-100 text-crm-text-primary'
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    <span>Statuses & Pipelines</span>
                  </button>
                  {/* Locked AI Knowledge Sources Tab */}
                  <div className="relative group">
                    <div
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-not-allowed text-gray-400 bg-gray-100/50 dark:bg-gray-800/30"
                    >
                      <Code className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">AI Knowledge Sources</span>
                      <Lock className="h-3 w-3 ml-auto text-gray-400" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        Coming in V1.1
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              <div className="bg-white dark:bg-[#1a1d24] rounded-lg border border-crm-border p-6">
                {/* Custom Fields */}
                {activeTab === 'fields' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Custom Fields</h2>
                    <p className="text-crm-text-secondary mb-6">
                      Create and manage custom fields for leads, contacts, and opportunities.
                    </p>
                    
                    <Card className="border border-crm-border mb-6">
                      <CardHeader>
                        <CardTitle>Lead Fields</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-crm-text-primary">Company Size</h4>
                              <p className="text-sm text-crm-text-secondary">Single Select</p>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-crm-text-primary">Industry</h4>
                              <p className="text-sm text-crm-text-secondary">Multiple Select</p>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                        <Button variant="outline" className="mt-4">+ Add Custom Field</Button>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <Button variant="default">Save Changes</Button>
                    </div>
                  </div>
                )}

                {/* Integration Links */}
                {activeTab === 'links' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Integration Links</h2>
                    <p className="text-crm-text-secondary mb-6">
                      Customize how your integrations connect to external services.
                    </p>
                    
                    <Card className="border border-crm-border mb-6">
                      <CardHeader>
                        <CardTitle>Integration Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-crm-text-primary">Google Calendar Sync</h4>
                              <p className="text-sm text-crm-text-secondary">Automatically sync meetings with Google Calendar</p>
                            </div>
                            <Button variant="outline">Configure</Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-crm-text-primary">Slack Notifications</h4>
                              <p className="text-sm text-crm-text-secondary">Send lead notifications to Slack channels</p>
                            </div>
                            <Button variant="outline">Configure</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <Button variant="default">Save Changes</Button>
                    </div>
                  </div>
                )}

                {/* Scheduling Links */}
                {activeTab === 'scheduling' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Scheduling Links</h2>
                    <p className="text-crm-text-secondary mb-6">
                      Create and manage scheduling links for meetings and calls.
                    </p>
                    
                    <Card className="border border-crm-border mb-6">
                      <CardHeader>
                        <CardTitle>Scheduling Links</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border border-crm-border rounded-lg">
                            <h4 className="font-medium text-crm-text-primary">Sales Consultation</h4>
                            <p className="text-sm text-crm-text-secondary mb-2">https://axolop.your-site.com/sales-consult</p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm">Share</Button>
                              <Button variant="outline" size="sm">Analytics</Button>
                            </div>
                          </div>
                          <div className="p-4 border border-crm-border rounded-lg">
                            <h4 className="font-medium text-crm-text-primary">Demo Request</h4>
                            <p className="text-sm text-crm-text-secondary mb-2">https://axolop.your-site.com/demo-request</p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm">Share</Button>
                              <Button variant="outline" size="sm">Analytics</Button>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" className="mt-4">+ Create Scheduling Link</Button>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <Button variant="default">Save Changes</Button>
                    </div>
                  </div>
                )}

                {/* Statuses & Pipelines */}
                {activeTab === 'statuses' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">Statuses & Pipelines</h2>
                    <p className="text-crm-text-secondary mb-6">
                      Define custom statuses and sales pipelines for your team.
                    </p>
                    
                    <Card className="border border-crm-border mb-6">
                      <CardHeader>
                        <CardTitle>Sales Pipeline</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-crm-text-primary">New Lead</h4>
                              <p className="text-sm text-crm-text-secondary">Initial contact made</p>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-crm-text-primary">Qualified</h4>
                              <p className="text-sm text-crm-text-secondary">Lead meets qualification criteria</p>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-crm-text-primary">Proposal Sent</h4>
                              <p className="text-sm text-crm-text-secondary">Proposal delivered to lead</p>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-crm-text-primary">Demo Scheduled</h4>
                              <p className="text-sm text-crm-text-secondary">Demo meeting scheduled</p>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium text-crm-text-primary">Closed Won</h4>
                              <p className="text-sm text-crm-text-secondary">Deal successfully closed</p>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                        <Button variant="outline" className="mt-4">+ Add Status</Button>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end">
                      <Button variant="default">Save Changes</Button>
                    </div>
                  </div>
                )}

                {/* AI Knowledge Sources */}
                {activeTab === 'ai' && (
                  <div>
                    <h2 className="text-xl font-semibold text-crm-text-primary mb-6">AI Knowledge Sources</h2>
                    <p className="text-crm-text-secondary mb-6">
                      Configure knowledge sources for AI-powered assistance.
                    </p>
                    
                    <Card className="border border-crm-border mb-6">
                      <CardHeader>
                        <CardTitle>Knowledge Sources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border border-crm-border rounded-lg">
                            <div>
                              <h4 className="font-medium text-crm-text-primary">Product Documentation</h4>
                              <p className="text-sm text-crm-text-secondary">Uploaded: Oct 15, 2025</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">View</Button>
                              <Button variant="outline" size="sm">Remove</Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-4 border border-crm-border rounded-lg">
                            <div>
                              <h4 className="font-medium text-crm-text-primary">FAQ Database</h4>
                              <p className="text-sm text-crm-text-secondary">Uploaded: Oct 20, 2025</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">View</Button>
                              <Button variant="outline" size="sm">Remove</Button>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" className="mt-4">+ Add Knowledge Source</Button>
                      </CardContent>
                    </Card>

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