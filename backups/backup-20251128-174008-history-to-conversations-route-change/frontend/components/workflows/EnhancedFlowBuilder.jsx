import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Plus, X, Play, Pause, Save, Settings, Zap, Mail, Clock, User, Tag,
  Calendar, MessageSquare, Trash2, Copy, Database, GitBranch, Filter,
  Send, UserPlus, CheckCircle, AlertCircle, Webhook, Phone, FileText,
  DollarSign, ArrowLeft, HelpCircle, XCircle, Target, Split, Bell,
  ExternalLink, Code, Repeat, MousePointer, Box, Layers, Activity,
  TrendingUp, Award, Globe, Briefcase, Users, GripHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DraggablePanel from '../email-marketing/DraggablePanel';
import NodeEditorPanel from './NodeEditorPanel';

// ==========================================
// CUSTOM NODE COMPONENTS
// ==========================================

const TriggerNode = ({ data, selected }) => {
  const getIcon = () => {
    switch (data.triggerType) {
      case 'LEAD_CREATED': return <UserPlus className="w-5 h-5" />;
      case 'FORM_SUBMITTED': return <MessageSquare className="w-5 h-5" />;
      case 'EMAIL_OPENED': return <Mail className="w-5 h-5" />;
      case 'EMAIL_CLICKED': return <MousePointer className="w-5 h-5" />;
      case 'PAGE_VISITED': return <Globe className="w-5 h-5" />;
      case 'API_CALL': return <Code className="w-5 h-5" />;
      case 'SCHEDULED_TIME': return <Clock className="w-5 h-5" />;
      case 'WEBHOOK_RECEIVED': return <Webhook className="w-5 h-5" />;
      case 'TAG_ADDED': return <Tag className="w-5 h-5" />;
      case 'OPPORTUNITY_CREATE': return <DollarSign className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-yellow-400'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-500" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-200">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-gray-800">{data.label}</div>
            {data.description && (
              <div className="text-xs text-gray-600 mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
          Trigger
        </Badge>
      </div>
    </div>
  );
};

const ActionNode = ({ data, selected }) => {
  const getIcon = () => {
    switch (data.actionType) {
      case 'EMAIL': return <Mail className="w-5 h-5" />;
      case 'SMS': case 'SEND_SMS': return <Phone className="w-5 h-5" />;
      case 'TAG_ADD': case 'TAG_ASSIGNMENT': return <Tag className="w-5 h-5" />;
      case 'FIELD_UPDATE': return <Database className="w-5 h-5" />;
      case 'TASK_CREATE': case 'TASK_CREATION': return <CheckCircle className="w-5 h-5" />;
      case 'WEBHOOK': case 'API_CALL': return <Webhook className="w-5 h-5" />;
      case 'CREATE_CONTACT': return <UserPlus className="w-5 h-5" />;
      case 'CREATE_DEAL': case 'OPPORTUNITY_CREATE': return <DollarSign className="w-5 h-5" />;
      case 'INTERNAL_NOTIFICATION': return <Bell className="w-5 h-5" />;
      case 'CALENDAR_EVENT_CREATE': return <Calendar className="w-5 h-5" />;
      case 'PIPELINE_MOVE': return <TrendingUp className="w-5 h-5" />;
      case 'LEAD_SCORE_UPDATE': return <Award className="w-5 h-5" />;
      case 'ASSIGN_TO_USER': return <Users className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-green-400'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-200">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-gray-800">{data.label}</div>
            {data.description && (
              <div className="text-xs text-gray-600 mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
          Action
        </Badge>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
    </div>
  );
};

const ConditionNode = ({ data, selected }) => {
  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-purple-400'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-200">
            <GitBranch className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-gray-800">{data.label}</div>
            {data.description && (
              <div className="text-xs text-gray-600 mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
            True
          </Badge>
          <Badge variant="outline" className="text-xs bg-[#3F0D28]/10 text-[#3F0D28]">
            False
          </Badge>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%' }} className="w-3 h-3 bg-green-500" />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%' }} className="w-3 h-3 bg-[#3F0D28]" />
    </div>
  );
};

const DelayNode = ({ data, selected }) => {
  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-orange-400'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-200">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-gray-800">{data.label}</div>
            {data.description && (
              <div className="text-xs text-gray-600 mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
          {data.delayAmount ? `${data.delayAmount} ${data.delayUnit || 'minutes'}` : 'Delay'}
        </Badge>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500" />
    </div>
  );
};

const SplitNode = ({ data, selected }) => {
  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-blue-400'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-200">
            <Split className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-gray-800">{data.label}</div>
            {data.description && (
              <div className="text-xs text-gray-600 mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">A {data.splitPercentageA || 50}%</Badge>
          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">B {data.splitPercentageB || 50}%</Badge>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" style={{ left: '33%' }} className="w-3 h-3 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} id="b" style={{ left: '67%' }} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};

const GoalNode = ({ data, selected }) => {
  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-pink-400'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-pink-500" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-200">
            <Target className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-gray-800">{data.label}</div>
            {data.description && (
              <div className="text-xs text-gray-600 mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-pink-100 text-pink-800 border-pink-300">
          Goal
        </Badge>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-pink-500" />
    </div>
  );
};

const ExitNode = ({ data, selected }) => {
  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-gray-400'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-500" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-200">
            <XCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-gray-800">{data.label}</div>
            {data.description && (
              <div className="text-xs text-gray-600 mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 border-gray-300">
          Exit
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
  split: SplitNode,
  goal: GoalNode,
  exit: ExitNode,
};

const EnhancedFlowBuilder = ({ workflowId = null, initialData = null, onSave, onBack }) => {
  const [workflowName, setWorkflowName] = useState(initialData?.name || 'New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState(initialData?.description || '');
  const [isRunning, setIsRunning] = useState(initialData?.is_active || false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWorkflowInfo, setShowWorkflowInfo] = useState(true);
  const [showNodePalette, setShowNodePalette] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // Draggable toolbar state
  const [toolbarPosition, setToolbarPosition] = useState({ x: null, y: 24 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  const [toolbarDragOffset, setToolbarDragOffset] = useState({ x: 0, y: 0 });
  const toolbarRef = React.useRef(null);

  // Initialize with a default trigger if empty
  useEffect(() => {
    if (nodes.length === 0 && !initialData) {
      const initialTrigger = {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 250, y: 100 },
        data: {
          label: 'Start Workflow',
          triggerType: 'LEAD_CREATED',
          description: 'Choose your trigger type'
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
    setEdges((eds) => addEdge(newEdge, eds));
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
    setShowNodePalette(false);
  }, [setNodes]);

  const getNodeLabel = (type, specificData = {}) => {
    if (specificData.label) return specificData.label;

    switch (type) {
      case 'trigger': return 'New Trigger';
      case 'action': return 'New Action';
      case 'condition': return 'New Condition';
      case 'delay': return 'New Delay';
      case 'split': return 'A/B Split Test';
      case 'goal': return 'Track Goal';
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
      case 'split':
        return {
          description: 'Split traffic for A/B testing',
          splitPercentageA: 50,
          splitPercentageB: 50
        };
      case 'goal':
        return {
          goalType: 'EMAIL_CLICKED',
          description: 'Track when this goal is achieved'
        };
      case 'exit':
        return {
          description: 'End the workflow',
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

  // Toolbar drag handlers
  const handleToolbarMouseDown = (e) => {
    if (e.target.closest('.toolbar-drag-handle') && toolbarRef.current) {
      setIsDraggingToolbar(true);
      const rect = toolbarRef.current.getBoundingClientRect();
      setToolbarDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleToolbarMouseMove = React.useCallback((e) => {
    if (isDraggingToolbar && toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      const newX = e.clientX - toolbarDragOffset.x;
      const newY = e.clientY - toolbarDragOffset.y;

      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      setToolbarPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDraggingToolbar, toolbarDragOffset]);

  const handleToolbarMouseUp = React.useCallback(() => {
    setIsDraggingToolbar(false);
  }, []);

  React.useEffect(() => {
    if (isDraggingToolbar) {
      window.addEventListener('mousemove', handleToolbarMouseMove);
      window.addEventListener('mouseup', handleToolbarMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleToolbarMouseMove);
        window.removeEventListener('mouseup', handleToolbarMouseUp);
      };
    }
  }, [isDraggingToolbar, handleToolbarMouseMove, handleToolbarMouseUp]);

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
  const toggleWorkflowStatus = async () => {
    const newStatus = !isRunning;
    setIsRunning(newStatus);

    if (workflowId) {
      try {
        const endpoint = newStatus ? 'activate' : 'deactivate';
        await fetch(`/api/workflows/${workflowId}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error toggling workflow status:', error);
        setIsRunning(!newStatus); // Revert on error
      }
    }
  };

  // Save workflow
  const saveWorkflow = async () => {
    setIsSaving(true);
    try {
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
        is_active: isRunning
      };

      if (onSave) {
        await onSave(workflowData);
      } else {
        const method = workflowId ? 'PUT' : 'POST';
        const url = workflowId ? `/api/workflows/${workflowId}` : '/api/workflows';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflowData)
        });

        if (!response.ok) {
          throw new Error('Failed to save workflow');
        }

        const result = await response.json();
        console.log('Workflow saved:', result);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 flex">
      {/* Main Workflow Canvas */}
      <div className="flex-1 relative bg-gray-50 dark:bg-[#0d0f12]">
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
          proOptions={{ hideAttribution: true }}
          className="w-full h-full"
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'trigger': return '#fbbf24';
                case 'action': return '#34d399';
                case 'condition': return '#a78bfa';
                case 'delay': return '#fb923c';
                case 'split': return '#38bdf8';
                case 'goal': return '#f472b6';
                case 'exit': return '#9ca3af';
                default: return '#e5e7eb';
              }
            }}
          />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>

        {/* Top Left - Navigation & Actions */}
        <div className="absolute top-6 left-6 bg-white/95 dark:bg-[#1a1d24]/95 rounded-xl shadow-xl border border-crm-border p-3 flex items-center gap-3 backdrop-blur-sm z-10">
          {onBack && (
            <Button size="sm" variant="outline" onClick={onBack} title="Back">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <Button
            size="sm"
            variant="default"
            onClick={saveWorkflow}
            disabled={isSaving}
            title="Save Workflow"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            size="sm"
            variant={isRunning ? "secondary" : "default"}
            onClick={toggleWorkflowStatus}
            title={isRunning ? 'Pause Workflow' : 'Activate Workflow'}
            className={isRunning ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
          >
            {isRunning ? (
              <>
                <Activity className="h-4 w-4 mr-1 animate-pulse" />
                Active
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Activate
              </>
            )}
          </Button>
        </div>

        {/* Center Top - Workflow Name & Actions - Draggable */}
        <div
          ref={toolbarRef}
          onMouseDown={handleToolbarMouseDown}
          className="fixed bg-white/95 dark:bg-[#1a1d24]/95 rounded-xl shadow-xl border border-crm-border p-3 flex items-center gap-3 backdrop-blur-sm cursor-move z-40"
          style={{
            left: toolbarPosition.x !== null ? `${toolbarPosition.x}px` : '50%',
            top: `${toolbarPosition.y}px`,
            transform: toolbarPosition.x !== null ? 'none' : 'translateX(-50%)'
          }}
        >
          <div className="toolbar-drag-handle flex items-center gap-2 cursor-move pr-2 border-r border-crm-border">
            <GripHorizontal className="h-4 w-4 text-crm-text-secondary" />
          </div>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="w-64 h-8"
            placeholder="Workflow name"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowNodePalette(!showNodePalette)}
            title="Add Node"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Node
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={duplicateNode}
            disabled={!selectedNode}
            title="Duplicate Node"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={deleteSelected}
            disabled={!selectedNode && !selectedEdge}
            title="Delete Selected"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Top Right - Info Panel Toggle - Moved down to avoid Chat/Tasks buttons */}
        {!showWorkflowInfo && (
          <button
            onClick={() => setShowWorkflowInfo(true)}
            className="absolute top-20 right-6 bg-white/95 dark:bg-[#1a1d24]/95 rounded-full shadow-xl border border-crm-border p-3 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-[#2C3440] transition-colors z-10"
            title="Show Workflow Info"
          >
            <HelpCircle className="h-5 w-5 text-crm-text-secondary" />
          </button>
        )}

        {/* Top Right - Info Panel - Moved down to avoid Chat/Tasks buttons */}
        {showWorkflowInfo && (
          <div className="absolute top-20 right-6 bg-white/95 dark:bg-[#1a1d24]/95 rounded-xl shadow-xl border border-crm-border p-5 max-w-xs backdrop-blur-sm z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base">Workflow Info</h3>
              <button
                onClick={() => setShowWorkflowInfo(false)}
                className="text-crm-text-secondary hover:text-crm-text-primary transition-colors"
                title="Hide Info"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm space-y-2 text-crm-text-secondary">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                {nodes.filter(n => n.type === 'trigger').length} triggers
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-green-600" />
                {nodes.filter(n => n.type === 'action').length} actions
              </div>
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-600" />
                {nodes.filter(n => n.type === 'condition').length} conditions
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                {nodes.filter(n => n.type === 'delay').length} delays
              </div>
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-[#3F0D28]" />
                {nodes.filter(n => n.type === 'split').length} split tests
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-pink-600" />
                {nodes.filter(n => n.type === 'goal').length} goals
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {edges.length} connections
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                <p className="italic text-xs">Click nodes to edit, drag to connect</p>
              </div>
            </div>
          </div>
        )}

        {/* Node Palette - Draggable */}
        <DraggablePanel
          isOpen={showNodePalette}
          onClose={() => setShowNodePalette(false)}
          title="Add Workflow Elements"
          defaultPosition="bottom"
        >
          <Tabs defaultValue="triggers" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="logic">Logic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="triggers" className="space-y-2 mt-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('trigger', { label: 'Lead Created', triggerType: 'LEAD_CREATED' })}>
                <UserPlus className="w-4 h-4 mr-2" />
                Lead Created
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('trigger', { label: 'Form Submitted', triggerType: 'FORM_SUBMITTED' })}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Form Submitted
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('trigger', { label: 'Email Opened', triggerType: 'EMAIL_OPENED' })}>
                <Mail className="w-4 h-4 mr-2" />
                Email Opened
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('trigger', { label: 'Email Clicked', triggerType: 'EMAIL_CLICKED' })}>
                <MousePointer className="w-4 h-4 mr-2" />
                Email Clicked
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('trigger', { label: 'Page Visited', triggerType: 'PAGE_VISITED' })}>
                <Globe className="w-4 h-4 mr-2" />
                Page Visited
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('trigger', { label: 'Webhook Received', triggerType: 'WEBHOOK_RECEIVED' })}>
                <Webhook className="w-4 h-4 mr-2" />
                Webhook
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('trigger', { label: 'Scheduled Time', triggerType: 'SCHEDULED_TIME' })}>
                <Clock className="w-4 h-4 mr-2" />
                Scheduled
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('trigger', { label: 'Tag Added', triggerType: 'TAG_ADDED' })}>
                <Tag className="w-4 h-4 mr-2" />
                Tag Added
              </Button>
            </TabsContent>

            <TabsContent value="actions" className="space-y-2 mt-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('action', { label: 'Send Email', actionType: 'EMAIL' })}>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('action', { label: 'Send SMS', actionType: 'SEND_SMS' })}>
                <Phone className="w-4 h-4 mr-2" />
                Send SMS
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('action', { label: 'Add Tag', actionType: 'TAG_ADD' })}>
                <Tag className="w-4 h-4 mr-2" />
                Add Tag
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('action', { label: 'Update Field', actionType: 'FIELD_UPDATE' })}>
                <Database className="w-4 h-4 mr-2" />
                Update Field
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('action', { label: 'Create Task', actionType: 'TASK_CREATE' })}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Task
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('action', { label: 'Create Contact', actionType: 'CREATE_CONTACT' })}>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Contact
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('action', { label: 'Create Deal', actionType: 'CREATE_DEAL' })}>
                <DollarSign className="w-4 h-4 mr-2" />
                Create Deal
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('action', { label: 'Send Notification', actionType: 'INTERNAL_NOTIFICATION' })}>
                <Bell className="w-4 h-4 mr-2" />
                Notify Team
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('action', { label: 'Call Webhook', actionType: 'WEBHOOK' })}>
                <Webhook className="w-4 h-4 mr-2" />
                Webhook
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('action', { label: 'Assign to User', actionType: 'ASSIGN_TO_USER' })}>
                <Users className="w-4 h-4 mr-2" />
                Assign User
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('action', { label: 'Update Lead Score', actionType: 'LEAD_SCORE_UPDATE' })}>
                <Award className="w-4 h-4 mr-2" />
                Lead Score
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('action', { label: 'Move Pipeline Stage', actionType: 'PIPELINE_MOVE' })}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Move Stage
              </Button>
            </TabsContent>

            <TabsContent value="logic" className="space-y-2 mt-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('condition', { label: 'If/Else Condition' })}>
                <GitBranch className="w-4 h-4 mr-2" />
                If/Else
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('delay', { label: 'Wait 1 Hour', delayAmount: 1, delayUnit: 'hours' })}>
                <Clock className="w-4 h-4 mr-2" />
                Delay/Wait
              </Button>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-2 mt-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('split', { label: 'A/B Split Test' })}>
                <Split className="w-4 h-4 mr-2" />
                A/B Split Test
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('goal', { label: 'Track Goal' })}>
                <Target className="w-4 h-4 mr-2" />
                Goal Tracker
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => addNode('exit', { label: 'End Workflow' })}>
                <XCircle className="w-4 h-4 mr-2" />
                Exit Point
              </Button>
            </TabsContent>
          </Tabs>
        </DraggablePanel>
      </div>

      {/* Right Panel - Node/Edge Editor - Added pt-20 to avoid Chat/Tasks buttons overlap */}
      <div className="w-96 bg-white dark:bg-[#1a1d24] border-l border-crm-border overflow-y-auto flex-shrink-0 pt-20">
        <NodeEditorPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          nodes={nodes}
          onUpdateNode={updateNodeData}
          onUpdateEdge={updateEdgeLabel}
          onClose={() => {
            setSelectedNode(null);
            setSelectedEdge(null);
          }}
        />
      </div>
    </div>
  );
};

export default EnhancedFlowBuilder;
