import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Play, Pause, Copy, Trash2, Edit, BarChart3, Zap, Layers, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedFlowBuilder from '../components/workflows/EnhancedFlowBuilder';
import { useAgency } from '@/hooks/useAgency';
import ViewOnlyBadge from '@/components/ui/view-only-badge';

const WorkflowsPage = () => {
  const { isReadOnly, canEdit, canCreate } = useAgency();
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    fetchWorkflows();
    fetchTemplates();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const result = await response.json();
        setWorkflows(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/workflows/templates');
      if (response.ok) {
        const result = await response.json();
        setTemplates(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setShowBuilder(true);
  };

  const handleEditWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowBuilder(true);
  };

  const handleDuplicateWorkflow = async (workflowId) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/duplicate`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchWorkflows();
      }
    } catch (error) {
      console.error('Error duplicating workflow:', error);
    }
  };

  const handleToggleWorkflow = async (workflow) => {
    try {
      const endpoint = workflow.is_active ? 'deactivate' : 'activate';
      const response = await fetch(`/api/workflows/${workflow.id}/${endpoint}`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchWorkflows();
      }
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchWorkflows();
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      const response = await fetch(`/api/workflows/templates/${template.id}/use`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedWorkflow(result.data);
        setShowBuilder(true);
      }
    } catch (error) {
      console.error('Error using template:', error);
    }
  };

  const handleSaveWorkflow = async (workflowData) => {
    try {
      const method = selectedWorkflow ? 'PUT' : 'POST';
      const url = selectedWorkflow
        ? `/api/workflows/${selectedWorkflow.id}`
        : '/api/workflows';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      });

      if (response.ok) {
        setShowBuilder(false);
        setSelectedWorkflow(null);
        fetchWorkflows();
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && workflow.is_active) ||
                         (filterStatus === 'inactive' && !workflow.is_active);

    return matchesSearch && matchesFilter;
  });

  if (showBuilder) {
    return (
      <div className="h-screen">
        <EnhancedFlowBuilder
          workflowId={selectedWorkflow?.id}
          initialData={selectedWorkflow}
          onSave={handleSaveWorkflow}
          onBack={() => {
            setShowBuilder(false);
            setSelectedWorkflow(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crm-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-crm-text-primary flex items-center gap-3">
                  <Zap className="w-8 h-8 text-primary" />
                  Automation Workflows
                </h1>
                {isReadOnly() && <ViewOnlyBadge />}
              </div>
              <p className="text-crm-text-secondary mt-1">
                {isReadOnly() ? 'View automation workflows - Read-only access' : 'Create powerful automations to streamline your sales and marketing'}
              </p>
            </div>
            {canCreate() && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplates(true)}
                  className="flex items-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  Browse Templates
                </Button>
                <Button
                  onClick={handleCreateWorkflow}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Workflow
                </Button>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-crm-border rounded-lg bg-white dark:bg-[#1a1d24] text-sm"
            >
              <option value="all">All Workflows</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crm-text-secondary">Total Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-text-primary">{workflows.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crm-text-secondary">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">
                {workflows.filter(w => w.is_active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crm-text-secondary">Total Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-text-primary">
                {workflows.reduce((sum, w) => sum + (w.total_executions || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crm-text-secondary">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {workflows.length > 0
                  ? Math.round(
                      workflows.reduce((sum, w) => sum + (w.successful_executions || 0), 0) /
                      Math.max(workflows.reduce((sum, w) => sum + (w.total_executions || 0), 0), 1) * 100
                    )
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflows List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-crm-text-secondary">Loading workflows...</p>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
              <p className="text-crm-text-secondary mb-6">
                {searchTerm ? 'Try adjusting your search' : 'Create your first workflow to get started'}
              </p>
              <Button onClick={handleCreateWorkflow}>
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-crm-text-primary">
                          {workflow.name}
                        </h3>
                        <Badge variant={workflow.is_active ? "default" : "secondary"}>
                          {workflow.is_active ? (
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Pause className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </Badge>
                      </div>
                      {workflow.description && (
                        <p className="text-sm text-crm-text-secondary mb-4">
                          {workflow.description}
                        </p>
                      )}
                      <div className="flex gap-6 text-sm text-crm-text-secondary">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          {workflow.nodes?.length || 0} nodes
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          {workflow.total_executions || 0} executions
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                          {workflow.successful_executions || 0} successful
                        </div>
                      </div>
                    </div>
                    {!isReadOnly() && (
                      <div className="flex gap-2 ml-4">
                        {canEdit() && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditWorkflow(workflow)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {canCreate() && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDuplicateWorkflow(workflow.id)}
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                        {canEdit() && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleWorkflow(workflow)}
                            title={workflow.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {workflow.is_active ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        {canEdit() && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                            title="Delete"
                            className="text-[#761B14] hover:text-[#9A392D] hover:bg-[#761B14]/5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Workflow Templates
            </DialogTitle>
            <DialogDescription>
              Choose from professionally designed workflow templates to get started quickly
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleUseTemplate(template)}>
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap mb-3">
                    <Badge variant="outline">{template.category}</Badge>
                    <Badge variant="outline">{template.difficulty_level}</Badge>
                    {template.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  <div className="text-sm text-crm-text-secondary">
                    <div>• {template.nodes?.length || 0} nodes</div>
                    <div>• ~{template.estimated_setup_time || 5} min setup</div>
                    {template.use_count > 0 && (
                      <div>• Used {template.use_count} times</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowsPage;
