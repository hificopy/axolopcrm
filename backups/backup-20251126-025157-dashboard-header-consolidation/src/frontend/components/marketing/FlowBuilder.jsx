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
  Plus,
  X,
  Play,
  Pause,
  Save,
  Settings,
  Zap,
  Mail,
  Clock,
  User,
  Tag,
  Calendar,
  MessageSquare,
  Trash2,
  Copy,
  Database,
  GitBranch,
  Filter,
  Send,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Webhook,
  Phone,
  FileText,
  DollarSign,
  ArrowLeft,
  HelpCircle,
  XCircle,
  GripHorizontal
} from 'lucide-react';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import DraggablePanel from './DraggablePanel';

// Custom Node Components
const TriggerNode = ({ data, selected }) => {
  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-yellow-50 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-yellow-300'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105`}>
      <Handle type="source" position={Position.Bottom} />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-100">
            <Zap className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-crm-text-primary">{data.label}</div>
            {data.description && (
              <div className="text-sm text-crm-text-secondary mt-1">{data.description}</div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700">
          {data.triggerType || 'Trigger'}
        </Badge>
      </div>
    </div>
  );
};

const ActionNode = ({ data, selected }) => {
  const getIcon = () => {
    switch (data.actionType) {
      case 'EMAIL': return <Mail className="w-5 h-5 text-green-600" />;
      case 'TAG_ASSIGNMENT': return <Tag className="w-5 h-5 text-green-600" />;
      case 'FIELD_UPDATE': return <Database className="w-5 h-5 text-green-600" />;
      case 'TASK_CREATION': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'WEBHOOK': return <Webhook className="w-5 h-5 text-green-600" />;
      case 'CREATE_CONTACT': return <UserPlus className="w-5 h-5 text-green-600" />;
      case 'SEND_SMS': return <Phone className="w-5 h-5 text-green-600" />;
      case 'CREATE_DEAL': return <DollarSign className="w-5 h-5 text-green-600" />;
      default: return <Settings className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-green-50 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-green-300'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105`}>
      <Handle type="target" position={Position.Top} />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-crm-text-primary">{data.label}</div>
            {data.description && (
              <div className="text-sm text-crm-text-secondary mt-1">{data.description}</div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
          {data.actionType || 'Action'}
        </Badge>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const ConditionNode = ({ data, selected }) => {
  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-purple-50 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-purple-300'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105`}>
      <Handle type="target" position={Position.Top} />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <GitBranch className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-crm-text-primary">{data.label}</div>
            {data.description && (
              <div className="text-sm text-crm-text-secondary mt-1">{data.description}</div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
            True
          </Badge>
          <Badge variant="outline" className="text-xs bg-red-100 text-red-700">
            False
          </Badge>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%' }} />
    </div>
  );
};

const DelayNode = ({ data, selected }) => {
  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-orange-50 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-orange-300'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105`}>
      <Handle type="target" position={Position.Top} />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-crm-text-primary">{data.label}</div>
            {data.description && (
              <div className="text-sm text-crm-text-secondary mt-1">{data.description}</div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
          {data.delayAmount ? `${data.delayAmount} ${data.delayUnit || 'minutes'}` : 'Delay'}
        </Badge>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

// Node types configuration
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

const FlowBuilder = ({ workflowId = null, onSave, onBack }) => {
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWorkflowInfo, setShowWorkflowInfo] = useState(true);
  const [showNodePalette, setShowNodePalette] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // Draggable toolbar state
  const [toolbarPosition, setToolbarPosition] = useState({ x: null, y: 24 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  const [toolbarDragOffset, setToolbarDragOffset] = useState({ x: 0, y: 0 });
  const toolbarRef = React.useRef(null);

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
      case 'trigger':
        return 'New Trigger';
      case 'action':
        return 'New Action';
      case 'condition':
        return 'New Condition';
      case 'delay':
        return 'New Delay';
      default:
        return 'New Node';
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

      // Constrain to viewport
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

    // Update selected node if it's the one being updated
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
    // TODO: API call to activate/deactivate workflow
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
        isActive: isRunning
      };

      // Call the onSave callback if provided
      if (onSave) {
        await onSave(workflowData);
      } else {
        // TODO: API call to save workflow
        console.log('Saving workflow:', workflowData);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
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
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>

        {/* Top Left - Navigation & Actions */}
        <div className="absolute top-6 left-6 bg-white/95 dark:bg-[#1a1d24]/95 rounded-xl shadow-xl border border-crm-border p-3 flex items-center gap-3 backdrop-blur-sm">
          {onBack && (
            <Button
              size="sm"
              variant="outline"
              onClick={onBack}
              title="Back"
            >
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
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
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
            onClick={deleteSelected}
            disabled={!selectedNode && !selectedEdge}
            title="Delete Selected"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Top Right - Info Panel Toggle - Moved down to avoid Chat/Tasks buttons */}
        {!showWorkflowInfo && (
          <button
            onClick={() => setShowWorkflowInfo(true)}
            className="absolute top-20 right-6 bg-white/95 dark:bg-[#1a1d24]/95 rounded-full shadow-xl border border-crm-border p-3 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-[#2C3440] transition-colors"
            title="Show Workflow Info"
          >
            <HelpCircle className="h-5 w-5 text-crm-text-secondary" />
          </button>
        )}

        {/* Top Right - Info Panel - Moved down to avoid Chat/Tasks buttons */}
        {showWorkflowInfo && (
          <div className="absolute top-20 right-6 bg-white/95 dark:bg-[#1a1d24]/95 rounded-xl shadow-xl border border-crm-border p-5 max-w-xs backdrop-blur-sm">
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
              <div>• {nodes.filter(n => n.type === 'trigger').length} triggers</div>
              <div>• {nodes.filter(n => n.type === 'action').length} actions</div>
              <div>• {nodes.filter(n => n.type === 'condition').length} conditions</div>
              <div>• {nodes.filter(n => n.type === 'delay').length} delays</div>
              <div>• {edges.length} connections</div>
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
          title="Add Workflow Element"
          defaultPosition="bottom"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Triggers */}
            <div>
              <h4 className="text-xs font-semibold text-crm-text-secondary uppercase tracking-wider mb-2">Triggers</h4>
              <div className="space-y-1">
                <Button variant="outline" className="w-full justify-start text-sm h-9 hover:bg-yellow-50" onClick={() => addNode('trigger', { label: 'Lead Created', triggerType: 'LEAD_CREATED' })}>
                  <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                  Lead Created
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm h-9 hover:bg-yellow-50" onClick={() => addNode('trigger', { label: 'Email Opened', triggerType: 'EMAIL_OPENED' })}>
                  <Mail className="w-4 h-4 mr-2 text-yellow-600" />
                  Email Opened
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm h-9 hover:bg-yellow-50" onClick={() => addNode('trigger', { label: 'Form Submitted', triggerType: 'FORM_SUBMITTED' })}>
                  <MessageSquare className="w-4 h-4 mr-2 text-yellow-600" />
                  Form Submitted
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h4 className="text-xs font-semibold text-crm-text-secondary uppercase tracking-wider mb-2">Actions</h4>
              <div className="space-y-1">
                <Button variant="outline" className="w-full justify-start text-sm h-9 hover:bg-green-50" onClick={() => addNode('action', { label: 'Send Email', actionType: 'EMAIL' })}>
                  <Mail className="w-4 h-4 mr-2 text-green-600" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm h-9 hover:bg-green-50" onClick={() => addNode('action', { label: 'Add Tag', actionType: 'TAG_ASSIGNMENT' })}>
                  <Tag className="w-4 h-4 mr-2 text-green-600" />
                  Add Tag
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm h-9 hover:bg-green-50" onClick={() => addNode('action', { label: 'Update Field', actionType: 'FIELD_UPDATE' })}>
                  <Database className="w-4 h-4 mr-2 text-green-600" />
                  Update Field
                </Button>
              </div>
            </div>

            {/* Logic & Delays */}
            <div className="col-span-2">
              <h4 className="text-xs font-semibold text-crm-text-secondary uppercase tracking-wider mb-2">Logic & Timing</h4>
              <div className="grid grid-cols-2 gap-1">
                <Button variant="outline" className="justify-start text-sm h-9 hover:bg-purple-50" onClick={() => addNode('condition', { label: 'If/Else', conditionType: 'FIELD_COMPARE' })}>
                  <GitBranch className="w-4 h-4 mr-2 text-purple-600" />
                  If/Else Condition
                </Button>
                <Button variant="outline" className="justify-start text-sm h-9 hover:bg-orange-50" onClick={() => addNode('delay', { label: 'Wait 1 hour', delayAmount: 1, delayUnit: 'hours' })}>
                  <Clock className="w-4 h-4 mr-2 text-orange-600" />
                  Delay
                </Button>
              </div>
            </div>
          </div>
        </DraggablePanel>
      </div>

      {/* Right Panel - Node/Edge Editor - Added pt-20 to avoid Chat/Tasks buttons overlap */}
      <div className="w-96 bg-white dark:bg-[#1a1d24] border-l border-crm-border overflow-y-auto flex-shrink-0">
        <div className="p-4 pt-20">
          {selectedNode ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-crm-text-primary">Node Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNode(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Label</Label>
                  <Input
                    value={selectedNode.data.label}
                    onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={selectedNode.data.description || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {selectedNode.type === 'trigger' && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Trigger Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs">Trigger Type</Label>
                        <Select
                          value={selectedNode.data.triggerType}
                          onValueChange={(value) => updateNodeData(selectedNode.id, { triggerType: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LEAD_CREATED">Lead Created</SelectItem>
                            <SelectItem value="EMAIL_OPENED">Email Opened</SelectItem>
                            <SelectItem value="EMAIL_CLICKED">Email Clicked</SelectItem>
                            <SelectItem value="FORM_SUBMITTED">Form Submitted</SelectItem>
                            <SelectItem value="LEAD_STATUS_CHANGED">Status Changed</SelectItem>
                            <SelectItem value="SCHEDULED_TIME">Scheduled Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedNode.type === 'action' && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Action Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs">Action Type</Label>
                        <Select
                          value={selectedNode.data.actionType}
                          onValueChange={(value) => updateNodeData(selectedNode.id, { actionType: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EMAIL">Send Email</SelectItem>
                            <SelectItem value="SEND_SMS">Send SMS</SelectItem>
                            <SelectItem value="TAG_ASSIGNMENT">Add/Remove Tag</SelectItem>
                            <SelectItem value="FIELD_UPDATE">Update Field</SelectItem>
                            <SelectItem value="TASK_CREATION">Create Task</SelectItem>
                            <SelectItem value="WEBHOOK">Call Webhook</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedNode.data.actionType === 'EMAIL' && (
                        <div>
                          <Label className="text-xs">Email Template</Label>
                          <Select
                            value={selectedNode.data.emailTemplateId || ''}
                            onValueChange={(value) => updateNodeData(selectedNode.id, { emailTemplateId: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select template" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="welcome">Welcome Email</SelectItem>
                              <SelectItem value="followup">Follow-up Email</SelectItem>
                              <SelectItem value="reminder">Reminder Email</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {selectedNode.data.actionType === 'TAG_ASSIGNMENT' && (
                        <>
                          <div>
                            <Label className="text-xs">Tag Name</Label>
                            <Input
                              value={selectedNode.data.tagName || ''}
                              onChange={(e) => updateNodeData(selectedNode.id, { tagName: e.target.value })}
                              className="mt-1"
                              placeholder="Enter tag name"
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selectedNode.type === 'condition' && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Condition Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs">Field Name</Label>
                        <Input
                          value={selectedNode.data.field || ''}
                          onChange={(e) => updateNodeData(selectedNode.id, { field: e.target.value })}
                          className="mt-1"
                          placeholder="e.g., email, status"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Operator</Label>
                        <Select
                          value={selectedNode.data.operator || 'equals'}
                          onValueChange={(value) => updateNodeData(selectedNode.id, { operator: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Value</Label>
                        <Input
                          value={selectedNode.data.value || ''}
                          onChange={(e) => updateNodeData(selectedNode.id, { value: e.target.value })}
                          className="mt-1"
                          placeholder="Comparison value"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedNode.type === 'delay' && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Delay Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs">Delay Amount</Label>
                        <Input
                          type="number"
                          value={selectedNode.data.delayAmount || 1}
                          onChange={(e) => updateNodeData(selectedNode.id, { delayAmount: parseInt(e.target.value) })}
                          className="mt-1"
                          min="1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Delay Unit</Label>
                        <Select
                          value={selectedNode.data.delayUnit || 'hours'}
                          onValueChange={(value) => updateNodeData(selectedNode.id, { delayUnit: value })}
                        >
                          <SelectTrigger className="mt-1">
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
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : selectedEdge ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-crm-text-primary">Connection Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEdge(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Connection Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">From</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                      {nodes.find(n => n.id === selectedEdge.source)?.data.label || selectedEdge.source}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">To</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                      {nodes.find(n => n.id === selectedEdge.target)?.data.label || selectedEdge.target}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Label (optional)</Label>
                    <Input
                      value={selectedEdge.label || ''}
                      onChange={(e) => updateEdgeLabel(selectedEdge.id, e.target.value)}
                      className="mt-1"
                      placeholder="e.g., If Yes"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-crm-text-secondary">
              <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a node or connection to edit</p>
              <p className="text-xs mt-2">Click on nodes to view and edit their settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowBuilder;
