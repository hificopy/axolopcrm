import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Plus, X, Play, Pause, Save, Settings, Zap, Mail, Clock, User, Tag, Calendar,
  MessageSquare, Trash2, Copy, Database, GitBranch, Filter, Send, UserPlus,
  CheckCircle, AlertCircle, Webhook, Phone, FileText, DollarSign, Target,
  Split, Bell, MousePointer, ShoppingCart, Star, TrendingUp, Users, Award,
  Percent, BarChart, Eye, Activity, Repeat, XCircle as StopCircle, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

// ============================================
// CUSTOM NODE COMPONENTS
// ============================================

const TriggerNode = ({ data, selected }) => {
  const getIcon = () => {
    switch (data.triggerType) {
      case 'LEAD_CREATED': return <UserPlus className="w-4 h-4 text-yellow-600" />;
      case 'CONTACT_CREATED': return <User className="w-4 h-4 text-yellow-600" />;
      case 'EMAIL_OPENED': return <Mail className="w-4 h-4 text-yellow-600" />;
      case 'EMAIL_CLICKED': return <MousePointer className="w-4 h-4 text-yellow-600" />;
      case 'FORM_SUBMITTED': return <MessageSquare className="w-4 h-4 text-yellow-600" />;
      case 'TAG_ADDED': return <Tag className="w-4 h-4 text-yellow-600" />;
      case 'OPPORTUNITY_CREATED': return <Target className="w-4 h-4 text-yellow-600" />;
      case 'PIPELINE_STAGE_CHANGED': return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      case 'LEAD_SCORE_CHANGED': return <Star className="w-4 h-4 text-yellow-600" />;
      case 'APPOINTMENT_BOOKED': return <Calendar className="w-4 h-4 text-yellow-600" />;
      case 'PRODUCT_PURCHASED': return <ShoppingCart className="w-4 h-4 text-yellow-600" />;
      case 'WEBSITE_VISIT': return <Eye className="w-4 h-4 text-yellow-600" />;
      case 'DATE_BASED': return <Calendar className="w-4 h-4 text-yellow-600" />;
      default: return <Zap className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[220px] bg-yellow-50 ${
      selected ? 'border-red-500 ring-2 ring-red-200' : 'border-yellow-300'
    }`}>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded bg-yellow-100">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-600 mt-1">{data.description}</div>
          )}
        </div>
      </div>
      <div className="mt-2">
        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700">
          Trigger
        </Badge>
      </div>
    </div>
  );
};

const ActionNode = ({ data, selected }) => {
  const getIcon = () => {
    switch (data.actionType) {
      case 'EMAIL': return <Mail className="w-4 h-4 text-green-600" />;
      case 'SMS': return <Phone className="w-4 h-4 text-green-600" />;
      case 'TAG_ADD': return <Tag className="w-4 h-4 text-green-600" />;
      case 'TAG_REMOVE': return <Tag className="w-4 h-4 text-green-600" />;
      case 'FIELD_UPDATE': return <Database className="w-4 h-4 text-green-600" />;
      case 'TASK_CREATE': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'CONTACT_CREATE': return <UserPlus className="w-4 h-4 text-green-600" />;
      case 'OPPORTUNITY_CREATE': return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'OPPORTUNITY_UPDATE': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'WEBHOOK': return <Webhook className="w-4 h-4 text-green-600" />;
      case 'NOTIFICATION': return <Bell className="w-4 h-4 text-green-600" />;
      case 'LEAD_SCORE_UPDATE': return <Star className="w-4 h-4 text-green-600" />;
      case 'PIPELINE_MOVE': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'ASSIGN_TO_USER': return <Users className="w-4 h-4 text-green-600" />;
      default: return <Settings className="w-4 h-4 text-green-600" />;
    }
  };

  return (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[220px] bg-green-50 ${
      selected ? 'border-red-500 ring-2 ring-red-200' : 'border-green-300'
    }`}>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded bg-green-100">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-600 mt-1">{data.description}</div>
          )}
        </div>
      </div>
      <div className="mt-2">
        <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
          Action
        </Badge>
      </div>
    </div>
  );
};

const ConditionNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[220px] bg-purple-50 ${
      selected ? 'border-red-500 ring-2 ring-red-200' : 'border-purple-300'
    }`}>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded bg-purple-100">
          <GitBranch className="w-4 h-4 text-purple-600" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-600 mt-1">{data.description}</div>
          )}
        </div>
      </div>
      <div className="mt-2 flex gap-1">
        <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
          Yes
        </Badge>
        <Badge variant="outline" className="text-xs bg-red-100 text-red-700">
          No
        </Badge>
      </div>
    </div>
  );
};

const DelayNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[220px] bg-orange-50 ${
      selected ? 'border-red-500 ring-2 ring-red-200' : 'border-orange-300'
    }`}>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded bg-orange-100">
          <Clock className="w-4 h-4 text-orange-600" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-600 mt-1">{data.description}</div>
          )}
        </div>
      </div>
      <div className="mt-2">
        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
          {data.delayAmount ? `${data.delayAmount} ${data.delayUnit || 'minutes'}` : 'Wait'}
        </Badge>
      </div>
    </div>
  );
};

const GoalNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[220px] bg-blue-50 ${
      selected ? 'border-red-500 ring-2 ring-red-200' : 'border-blue-300'
    }`}>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded bg-blue-100">
          <Target className="w-4 h-4 text-[#3F0D28]" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-600 mt-1">{data.description}</div>
          )}
        </div>
      </div>
      <div className="mt-2">
        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
          Goal: Skip Ahead
        </Badge>
      </div>
    </div>
  );
};

const SplitTestNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[220px] bg-indigo-50 ${
      selected ? 'border-red-500 ring-2 ring-red-200' : 'border-indigo-300'
    }`}>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded bg-indigo-100">
          <Split className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-600 mt-1">{data.description}</div>
          )}
        </div>
      </div>
      <div className="mt-2 flex gap-1">
        <Badge variant="outline" className="text-xs bg-indigo-100 text-indigo-700">
          A: {data.splitPercentageA || 50}%
        </Badge>
        <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
          B: {data.splitPercentageB || 50}%
        </Badge>
      </div>
    </div>
  );
};

const ExitNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[220px] bg-red-50 ${
      selected ? 'border-red-500 ring-2 ring-red-200' : 'border-red-300'
    }`}>
      <div className="flex items-center gap-2">
        <div className="p-2 rounded bg-red-100">
          <StopCircle className="w-4 h-4 text-red-600" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900">{data.label}</div>
          {data.description && (
            <div className="text-xs text-gray-600 mt-1">{data.description}</div>
          )}
        </div>
      </div>
      <div className="mt-2">
        <Badge variant="outline" className="text-xs bg-red-100 text-red-700">
          End Workflow
        </Badge>
      </div>
    </div>
  );
};

// Node types configuration
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  goal: GoalNode,
  split: SplitTestNode,
  exit: ExitNode,
};

// ============================================
// MAIN FLOW BUILDER COMPONENT
// ============================================

const EnhancedFlowBuilder = ({ workflowId = null, onSave }) => {
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Workflow Settings
  const [workflowSettings, setWorkflowSettings] = useState({
    allow_reentry: true,
    reentry_wait_time: 24,
    reentry_wait_unit: 'hours',
    max_entries: null,
    execution_mode: 'sequential',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    timezone: 'America/New_York',
    send_on_weekends: true
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // Initialize with a default trigger if empty
  useEffect(() => {
    if (nodes.length === 0) {
      const initialTrigger = {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 100 },
        data: {
          label: 'Lead Created',
          triggerType: 'LEAD_CREATED',
          description: 'When a new lead is added to the CRM'
        }
      };
      setNodes([initialTrigger]);
    }
  }, []);

  // Handle node connection
  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    };
    setEdges((eds) => {
      const updatedEdges = addEdge(newEdge, eds);
      return updatedEdges;
    });
  }, [setEdges]);

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle edge click
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // Add a new node to the flow
  const addNode = useCallback((type, specificData = {}) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400 + 200,
        y: Math.random() * 300 + 150
      },
      data: {
        label: getNodeLabel(type, specificData),
        ...getNodeDefaultData(type),
        ...specificData
      }
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const getNodeLabel = (type, specificData = {}) => {
    if (specificData.label) return specificData.label;

    switch (type) {
      case 'trigger': return 'New Trigger';
      case 'action': return 'New Action';
      case 'condition': return 'New Condition';
      case 'delay': return 'Wait';
      case 'goal': return 'Goal';
      case 'split': return 'A/B Split Test';
      case 'exit': return 'End Workflow';
      default: return 'New Node';
    }
  };

  const getNodeDefaultData = (type) => {
    switch (type) {
      case 'trigger':
        return {
          triggerType: 'LEAD_CREATED',
          description: 'When this event occurs',
          filters: {}
        };
      case 'action':
        return {
          actionType: 'EMAIL',
          description: 'Perform this action',
          config: {}
        };
      case 'condition':
        return {
          conditionType: 'FIELD_COMPARE',
          description: 'Check this condition',
          field: '',
          operator: 'equals',
          value: ''
        };
      case 'delay':
        return {
          delayType: 'TIME_DELAY',
          description: 'Wait for a specific time',
          delayAmount: 1,
          delayUnit: 'hours'
        };
      case 'goal':
        return {
          goalType: 'EMAIL_CLICK',
          description: 'Skip to this point when goal is met',
          skipToNodeId: null
        };
      case 'split':
        return {
          splitType: 'AB_TEST',
          description: 'Split traffic between two paths',
          splitPercentageA: 50,
          splitPercentageB: 50,
          winnerMetric: 'conversion'
        };
      case 'exit':
        return {
          description: 'End the workflow here',
          reason: 'completed'
        };
      default:
        return { description: 'Node description' };
    }
  };

  // Delete selected node or edge
  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) =>
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
    }
    if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges]);

  // Duplicate selected node
  const duplicateNode = useCallback(() => {
    if (selectedNode) {
      const newNode = {
        ...selectedNode,
        id: `${selectedNode.type}-${Date.now()}`,
        position: {
          x: selectedNode.position.x + 50,
          y: selectedNode.position.y + 50
        }
      };
      setNodes((nds) => [...nds, newNode]);
    }
  }, [selectedNode, setNodes]);

  // Update node data
  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );

    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({
        ...selectedNode,
        data: { ...selectedNode.data, ...newData }
      });
    }
  }, [selectedNode, setNodes]);

  // Update edge data
  const updateEdgeLabel = useCallback((edgeId, label) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, label }
          : edge
      )
    );
  }, [setEdges]);

  // Toggle workflow status
  const toggleWorkflowStatus = () => {
    setIsRunning(!isRunning);
  };

  // Save workflow
  const saveWorkflow = async () => {
    setIsSaving(true);
    try {
      const workflowData = {
        id: workflowId,
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
        isActive: isRunning,
        settings: workflowSettings
      };

      if (onSave) {
        await onSave(workflowData);
      } else {
        console.log('Saving workflow:', workflowData);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Workflow Builder</h1>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="w-64"
            placeholder="Workflow name"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={duplicateNode}
            disabled={!selectedNode}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={deleteSelected}
            disabled={!selectedNode && !selectedEdge}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            variant={isRunning ? "secondary" : "default"}
            size="sm"
            onClick={toggleWorkflowStatus}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={saveWorkflow}
            disabled={isSaving}
            className="btn-premium-red text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Node Palette */}
        <div className="w-64 bg-white border-r overflow-y-auto shadow-sm">
          <div className="p-4">
            <h3 className="font-semibold mb-4 text-gray-900">Add Elements</h3>

            <div className="space-y-2">
              {/* TRIGGERS */}
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Triggers</h4>
              {[
                { label: 'Lead Created', type: 'LEAD_CREATED', icon: UserPlus },
                { label: 'Contact Created', type: 'CONTACT_CREATED', icon: User },
                { label: 'Email Opened', type: 'EMAIL_OPENED', icon: Mail },
                { label: 'Email Clicked', type: 'EMAIL_CLICKED', icon: MousePointer },
                { label: 'Form Submitted', type: 'FORM_SUBMITTED', icon: MessageSquare },
                { label: 'Tag Added', type: 'TAG_ADDED', icon: Tag },
                { label: 'Tag Removed', type: 'TAG_REMOVED', icon: Tag },
                { label: 'Opportunity Created', type: 'OPPORTUNITY_CREATED', icon: Target },
                { label: 'Pipeline Stage Changed', type: 'PIPELINE_STAGE_CHANGED', icon: TrendingUp },
                { label: 'Lead Score Changed', type: 'LEAD_SCORE_CHANGED', icon: Star },
                { label: 'Appointment Booked', type: 'APPOINTMENT_BOOKED', icon: Calendar },
                { label: 'Product Purchased', type: 'PRODUCT_PURCHASED', icon: ShoppingCart },
                { label: 'Website Visit', type: 'WEBSITE_VISIT', icon: Eye },
                { label: 'Date or Anniversary', type: 'DATE_BASED', icon: Calendar },
              ].map((trigger) => {
                const Icon = trigger.icon;
                return (
                  <Button
                    key={trigger.type}
                    variant="outline"
                    className="w-full justify-start mb-1 hover:bg-yellow-50 text-xs"
                    onClick={() => addNode('trigger', { label: trigger.label, triggerType: trigger.type })}
                  >
                    <Icon className="w-3 h-3 mr-2 text-yellow-600" />
                    {trigger.label}
                  </Button>
                );
              })}

              {/* ACTIONS */}
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Actions</h4>
              {[
                { label: 'Send Email', type: 'EMAIL', icon: Mail },
                { label: 'Send SMS', type: 'SMS', icon: Phone },
                { label: 'Add Tag', type: 'TAG_ADD', icon: Tag },
                { label: 'Remove Tag', type: 'TAG_REMOVE', icon: Tag },
                { label: 'Update Field', type: 'FIELD_UPDATE', icon: Database },
                { label: 'Create Task', type: 'TASK_CREATE', icon: CheckCircle },
                { label: 'Create Contact', type: 'CONTACT_CREATE', icon: UserPlus },
                { label: 'Create Opportunity', type: 'OPPORTUNITY_CREATE', icon: DollarSign },
                { label: 'Update Opportunity', type: 'OPPORTUNITY_UPDATE', icon: TrendingUp },
                { label: 'Move Pipeline Stage', type: 'PIPELINE_MOVE', icon: TrendingUp },
                { label: 'Update Lead Score', type: 'LEAD_SCORE_UPDATE', icon: Star },
                { label: 'Assign to User', type: 'ASSIGN_TO_USER', icon: Users },
                { label: 'Send Notification', type: 'NOTIFICATION', icon: Bell },
                { label: 'Call Webhook', type: 'WEBHOOK', icon: Webhook },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.type}
                    variant="outline"
                    className="w-full justify-start mb-1 hover:bg-green-50 text-xs"
                    onClick={() => addNode('action', { label: action.label, actionType: action.type })}
                  >
                    <Icon className="w-3 h-3 mr-2 text-green-600" />
                    {action.label}
                  </Button>
                );
              })}

              {/* LOGIC & FLOW CONTROL */}
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Logic & Flow</h4>
              <Button
                variant="outline"
                className="w-full justify-start mb-1 hover:bg-purple-50 text-xs"
                onClick={() => addNode('condition')}
              >
                <GitBranch className="w-3 h-3 mr-2 text-purple-600" />
                If/Else Condition
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start mb-1 hover:bg-orange-50 text-xs"
                onClick={() => addNode('delay')}
              >
                <Clock className="w-3 h-3 mr-2 text-orange-600" />
                Wait/Delay
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start mb-1 hover:bg-blue-50 text-xs"
                onClick={() => addNode('goal')}
              >
                <Target className="w-3 h-3 mr-2 text-[#3F0D28]" />
                Goal (Skip Ahead)
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start mb-1 hover:bg-indigo-50 text-xs"
                onClick={() => addNode('split')}
              >
                <Split className="w-3 h-3 mr-2 text-indigo-600" />
                A/B Split Test
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start mb-1 hover:bg-red-50 text-xs"
                onClick={() => addNode('exit')}
              >
                <StopCircle className="w-3 h-3 mr-2 text-red-600" />
                End Workflow
              </Button>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            className="bg-gray-100"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'trigger': return '#fef3c7';
                  case 'action': return '#d1fae5';
                  case 'condition': return '#f3e8ff';
                  case 'delay': return '#fed7aa';
                  case 'goal': return '#dbeafe';
                  case 'split': return '#e0e7ff';
                  case 'exit': return '#fee2e2';
                  default: return '#e2e8f0';
                }
              }}
              className="bg-white border-2 border-gray-200 rounded-lg"
            />
            <Panel position="top-right" className="bg-white p-3 rounded-lg shadow-md border">
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
                  <span className="text-gray-700">Triggers: {nodes.filter(n => n.type === 'trigger').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-300"></div>
                  <span className="text-gray-700">Actions: {nodes.filter(n => n.type === 'action').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-300"></div>
                  <span className="text-gray-700">Conditions: {nodes.filter(n => n.type === 'condition').length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                  <span className="text-gray-700">Goals: {nodes.filter(n => n.type === 'goal').length}</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        <div className="w-96 bg-white border-l overflow-y-auto shadow-sm">
          <div className="p-4">
            {showSettings ? (
              <WorkflowSettings
                settings={workflowSettings}
                onUpdate={setWorkflowSettings}
                onClose={() => setShowSettings(false)}
              />
            ) : selectedNode ? (
              <NodePropertiesPanel
                node={selectedNode}
                nodes={nodes}
                onUpdate={updateNodeData}
                onDelete={deleteSelected}
              />
            ) : selectedEdge ? (
              <EdgePropertiesPanel
                edge={selectedEdge}
                nodes={nodes}
                onUpdate={updateEdgeLabel}
                onDelete={deleteSelected}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Select a node or connection to edit</p>
                  <p className="text-xs mt-2 text-gray-400">Or click Settings for workflow configuration</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PROPERTY PANELS (Continue in next part...)
// ============================================

const WorkflowSettings = ({ settings, onUpdate, onClose }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Workflow Settings</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Re-entry Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Allow Re-entry</Label>
              <Switch
                checked={settings.allow_reentry}
                onCheckedChange={(checked) => onUpdate({ ...settings, allow_reentry: checked })}
              />
            </div>
            {settings.allow_reentry && (
              <>
                <div>
                  <Label className="text-xs">Wait Time Between Entries</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      value={settings.reentry_wait_time}
                      onChange={(e) => onUpdate({ ...settings, reentry_wait_time: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <Select
                      value={settings.reentry_wait_unit}
                      onValueChange={(value) => onUpdate({ ...settings, reentry_wait_unit: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Max Entries (optional)</Label>
                  <Input
                    type="number"
                    value={settings.max_entries || ''}
                    onChange={(e) => onUpdate({ ...settings, max_entries: e.target.value ? parseInt(e.target.value) : null })}
                    className="mt-1"
                    placeholder="Unlimited"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quiet Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Enable Quiet Hours</Label>
              <Switch
                checked={settings.quiet_hours_enabled}
                onCheckedChange={(checked) => onUpdate({ ...settings, quiet_hours_enabled: checked })}
              />
            </div>
            {settings.quiet_hours_enabled && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Time</Label>
                    <Input
                      type="time"
                      value={settings.quiet_hours_start}
                      onChange={(e) => onUpdate({ ...settings, quiet_hours_start: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Time</Label>
                    <Input
                      type="time"
                      value={settings.quiet_hours_end}
                      onChange={(e) => onUpdate({ ...settings, quiet_hours_end: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Timezone</Label>
                  <Input
                    value={settings.timezone}
                    onChange={(e) => onUpdate({ ...settings, timezone: e.target.value })}
                    className="mt-1"
                    placeholder="America/New_York"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Execution Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Send on Weekends</Label>
              <Switch
                checked={settings.send_on_weekends}
                onCheckedChange={(checked) => onUpdate({ ...settings, send_on_weekends: checked })}
              />
            </div>
            <div>
              <Label className="text-xs">Execution Mode</Label>
              <Select
                value={settings.execution_mode}
                onValueChange={(value) => onUpdate({ ...settings, execution_mode: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="parallel">Parallel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const NodePropertiesPanel = ({ node, nodes, onUpdate, onDelete }) => {
  // This will be a comprehensive properties panel
  // Implementation continues with all node type configurations...
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Node Properties</h3>
        <Button variant="outline" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Label</Label>
          <Input
            value={node.data.label}
            onChange={(e) => onUpdate(node.id, { label: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Description</Label>
          <Textarea
            value={node.data.description || ''}
            onChange={(e) => onUpdate(node.id, { description: e.target.value })}
            className="mt-1"
            rows={3}
          />
        </div>

        {/* Node-specific properties would go here */}
      </div>
    </div>
  );
};

const EdgePropertiesPanel = ({ edge, nodes, onUpdate, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Connection</h3>
        <Button variant="outline" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Label</Label>
          <Input
            value={edge.label || ''}
            onChange={(e) => onUpdate(edge.id, e.target.value)}
            className="mt-1"
            placeholder="Connection label (optional)"
          />
        </div>
        <div className="text-sm text-gray-600">
          <p>From: <span className="font-medium">{edge.source}</span></p>
          <p>To: <span className="font-medium">{edge.target}</span></p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFlowBuilder;
