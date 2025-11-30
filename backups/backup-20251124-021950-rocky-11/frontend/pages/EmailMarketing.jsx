import React, { useState, useEffect, useCallback } from 'react';
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
  BookOpen,
  Workflow as WorkflowIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import Newsletter from '../components/email-marketing/Newsletter';
import EmailAnalytics from '../components/email-marketing/EmailAnalytics';
import FlowBuilder from '../components/email-marketing/FlowBuilder';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const EmailMarketing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);

  // Fetch data from API
  const fetchEmailMarketingData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch campaigns, workflows, and templates in parallel
      const [campaignsRes, workflowsRes, templatesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/email-marketing/campaigns`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/email-marketing/workflows`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/email-marketing/templates`, { headers }).catch(() => ({ data: [] })),
      ]);

      setCampaigns(campaignsRes.data || []);
      setWorkflows(workflowsRes.data || []);
      setTemplates(templatesRes.data || []);
    } catch (error) {
      console.error('Error fetching email marketing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email marketing data.',
        variant: 'destructive',
      });

      // Set empty arrays on error
      setCampaigns([]);
      setWorkflows([]);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmailMarketingData();
  }, [fetchEmailMarketingData]);

  const handleCreateCampaign = () => {
    navigate('/app/email-marketing/campaigns/create');
  };

  const handleCreateWorkflow = () => {
    setSelectedWorkflowId(null);
    setShowWorkflowBuilder(true);
  };

  const handleEditWorkflow = (workflowId) => {
    setSelectedWorkflowId(workflowId);
    setShowWorkflowBuilder(true);
  };

  const handleSaveWorkflow = async (workflowData) => {
    try {
      const token = localStorage.getItem('supabase.auth.token');
      const headers = { Authorization: `Bearer ${token}` };

      if (workflowData.id) {
        // Update existing workflow
        await axios.put(`${API_BASE_URL}/api/email-marketing/workflows/${workflowData.id}`, workflowData, { headers });
        toast({
          title: 'Success',
          description: 'Workflow updated successfully.',
        });
      } else {
        // Create new workflow
        await axios.post(`${API_BASE_URL}/api/email-marketing/workflows`, workflowData, { headers });
        toast({
          title: 'Success',
          description: 'Workflow created successfully.',
        });
      }

      // Refresh workflows list
      fetchEmailMarketingData();
      setShowWorkflowBuilder(false);
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workflow.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTemplate = () => {
    navigate('/app/email-marketing/templates/create');
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

  if (loading) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center pt-[150px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#791C14] mx-auto mb-4"></div>
          <p className="text-crm-text-secondary">Loading email marketing...</p>
        </div>
      </div>
    );
  }

  // If workflow builder is shown, render it full-screen
  if (showWorkflowBuilder) {
    return (
      <div className="h-full flex flex-col">
        <FlowBuilder
          workflowId={selectedWorkflowId}
          onSave={handleSaveWorkflow}
          onBack={() => setShowWorkflowBuilder(false)}
        />
      </div>
    );
  }

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
            <div className="p-2 bg-red-100 rounded-lg">
              <Mail className="w-6 h-6 text-red-600" />
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
            <WorkflowIcon className="w-4 h-4" />
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
                          <span className="text-primary">{campaign.clickRate}% click</span>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditWorkflow(workflow.id)}
                        >
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