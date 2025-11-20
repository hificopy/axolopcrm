import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Activity, 
  Zap, 
  LayoutDashboard, 
  Settings, 
  Plus, 
  Search,
  Filter,
  Calendar,
  BarChart3,
  Users,
  Play,
  Pause,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Newsletter from '../components/email-marketing/Newsletter';
import EmailAnalytics from '../components/email-marketing/EmailAnalytics';

const EmailMarketing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API calls to get data
    setCampaigns([
      {
        id: 'camp_1',
        name: 'Welcome Series',
        subject: 'Welcome to our platform!',
        status: 'SENT',
        sent: 1245,
        opened: 420,
        clicked: 180,
        openRate: 33.7,
        clickRate: 14.4,
        createdAt: '2025-01-15',
        stats: { sent: 1245, opened: 420, clicked: 180, openRate: 33.7, clickRate: 14.4 }
      },
      {
        id: 'camp_2',
        name: 'Product Update',
        subject: 'New features available',
        status: 'SCHEDULED',
        sent: 0,
        opened: 0,
        clicked: 0,
        openRate: 0,
        clickRate: 0,
        createdAt: '2025-01-20',
        stats: { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 }
      },
      {
        id: 'camp_3',
        name: 'Abandoned Cart',
        subject: 'Don\'t forget your items!',
        status: 'DRAFT',
        sent: 0,
        opened: 0,
        clicked: 0,
        openRate: 0,
        clickRate: 0,
        createdAt: '2025-01-22',
        stats: { sent: 0, opened: 0, clicked: 0, openRate: 0, clickRate: 0 }
      }
    ]);

    setWorkflows([
      {
        id: 'wf_1',
        name: 'Lead Nurturing Sequence',
        description: 'Automated follow-up sequence for new leads',
        isActive: true,
        executionCount: 125,
        successCount: 120,
        failureCount: 5,
        createdAt: '2025-01-10'
      },
      {
        id: 'wf_2',
        name: 'Post-Purchase Journey',
        description: 'Onboarding sequence for new customers',
        isActive: true,
        executionCount: 89,
        successCount: 87,
        failureCount: 2,
        createdAt: '2025-01-18'
      },
      {
        id: 'wf_3',
        name: 'Re-engagement Campaign',
        description: 'Win back inactive subscribers',
        isActive: false,
        executionCount: 42,
        successCount: 38,
        failureCount: 4,
        createdAt: '2025-01-25'
      }
    ]);

    setTemplates([
      {
        id: 'temp_1',
        name: 'Welcome Template',
        subject: 'Welcome aboard!',
        category: 'Onboarding',
        usageCount: 45,
        createdAt: '2025-01-05'
      },
      {
        id: 'temp_2',
        name: 'Promotional Template',
        subject: 'Special offer inside!',
        category: 'Promotion',
        usageCount: 23,
        createdAt: '2025-01-12'
      },
      {
        id: 'temp_3',
        name: 'Newsletter Template',
        subject: 'Weekly digest',
        category: 'Newsletter',
        usageCount: 31,
        createdAt: '2025-01-19'
      }
    ]);
  }, []);

  const handleCreateCampaign = () => {
    navigate('/email-marketing/campaigns/create');
  };

  const handleCreateWorkflow = () => {
    navigate('/email-marketing/workflows/create');
  };

  const handleCreateTemplate = () => {
    navigate('/email-marketing/templates/create');
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'SENT':
        return 'success';
      case 'SCHEDULED':
        return 'secondary';
      case 'DRAFT':
        return 'outline';
      case 'SENDING':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getWorkflowStatusVariant = (isActive) => {
    return isActive ? 'success' : 'outline';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-crm-text-primary">Email Marketing</h1>
          <p className="text-crm-text-secondary mt-1">
            Create campaigns, automate workflows, and engage your audience
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateWorkflow} variant="outline" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            New Workflow
          </Button>
          <Button onClick={handleCreateCampaign} className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-crm-text-secondary">Total Campaigns</p>
              <p className="text-2xl font-bold text-crm-text-primary">24</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-crm-text-secondary">Active Workflows</p>
              <p className="text-2xl font-bold text-crm-text-primary">8</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-crm-text-secondary">Emails Sent</p>
              <p className="text-2xl font-bold text-crm-text-primary">12,458</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-crm-text-secondary">Avg. Open Rate</p>
              <p className="text-2xl font-bold text-crm-text-primary">28.4%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Newsletter
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Campaigns
                  <Button variant="outline" size="sm">View All</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-crm-bg-light">
                      <div className="flex-1">
                        <h3 className="font-medium text-crm-text-primary">{campaign.name}</h3>
                        <p className="text-sm text-crm-text-secondary">{campaign.subject}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>{campaign.sent} sent</span>
                          <span className="text-green-600">{campaign.openRate}% open</span>
                          <span className="text-blue-600">{campaign.clickRate}% click</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Workflows */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Active Workflows
                  <Button variant="outline" size="sm">View All</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.filter(wf => wf.isActive).map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-crm-bg-light">
                      <div className="flex-1">
                        <h3 className="font-medium text-crm-text-primary">{workflow.name}</h3>
                        <p className="text-sm text-crm-text-secondary">{workflow.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>{workflow.executionCount} runs</span>
                          <span className="text-green-600">{workflow.successCount} success</span>
                          <span className="text-red-600">{workflow.failureCount} failed</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getWorkflowStatusVariant(workflow.isActive)}>
                          {workflow.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Email Campaigns</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-crm-text-secondary w-4 h-4" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button onClick={handleCreateCampaign}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-crm-text-secondary">Campaign</th>
                      <th className="text-left py-3 px-4 font-medium text-crm-text-secondary">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-crm-text-secondary">Sent</th>
                      <th className="text-left py-3 px-4 font-medium text-crm-text-secondary">Open Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-crm-text-secondary">Click Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-crm-text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-crm-bg-light">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-crm-text-primary">{campaign.name}</div>
                            <div className="text-sm text-crm-text-secondary">{campaign.subject}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusBadgeVariant(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-crm-text-primary">{campaign.stats.sent}</td>
                        <td className="py-3 px-4 text-crm-text-primary">{campaign.stats.openRate}%</td>
                        <td className="py-3 px-4 text-crm-text-primary">{campaign.stats.clickRate}%</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Automation Workflows</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-crm-text-secondary w-4 h-4" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button onClick={handleCreateWorkflow}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflows.map((workflow) => (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <Badge variant={getWorkflowStatusVariant(workflow.isActive)}>
                          {workflow.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <p className="text-sm text-crm-text-secondary">{workflow.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-crm-text-secondary">Executions:</span>
                          <span className="text-crm-text-primary">{workflow.executionCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-crm-text-secondary">Success:</span>
                          <span className="text-green-600">{workflow.successCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-crm-text-secondary">Failed:</span>
                          <span className="text-red-600">{workflow.failureCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-crm-text-secondary">Created:</span>
                          <span className="text-crm-text-primary">{workflow.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant={workflow.isActive ? "outline" : "default"} 
                          size="sm"
                          className="flex-1"
                        >
                          {workflow.isActive ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Email Templates</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-crm-text-secondary w-4 h-4" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button onClick={handleCreateTemplate}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                      <p className="text-sm text-crm-text-secondary">{template.subject}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-crm-text-secondary">Category:</span>
                          <span className="text-crm-text-primary">{template.category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-crm-text-secondary">Uses:</span>
                          <span className="text-crm-text-primary">{template.usageCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-crm-text-secondary">Created:</span>
                          <span className="text-crm-text-primary">{template.createdAt}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter">
          <Newsletter />
        </TabsContent>

        <TabsContent value="analytics">
          <EmailAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailMarketing;