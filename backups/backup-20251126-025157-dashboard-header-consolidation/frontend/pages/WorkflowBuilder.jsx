import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Save,
  ArrowLeft,
  Play,
  Pause,
  Trash2,
  Settings,
  Mail,
  Phone,
  Clock,
  GitBranch,
  Tag,
  Database,
  User,
  Calendar,
  Zap,
  Target,
  DollarSign,
  CheckCircle,
  XCircle,
  GripHorizontal,
  UserPlus,
  MessageSquare,
  Webhook,
  Bell,
  Award,
  Users,
  TrendingUp,
  Split,
  X,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import DraggablePanel from './formBuilder/DraggablePanel';

// ==========================================
// CUSTOM NODE COMPONENTS
// ==========================================

const TriggerNode = ({ data, selected }) => {
  const getIcon = () => {
    const iconClass = "w-5 h-5";
    switch (data.triggerType) {
      case 'MEETING_BOOKED': return <Calendar className={iconClass} />;
      case 'MEETING_COMPLETED': return <CheckCircle className={iconClass} />;
      case 'MEETING_CANCELLED': return <XCircle className={iconClass} />;
      case 'MEETING_NO_SHOW': return <User className={iconClass} />;
      case 'FORM_SUBMITTED': return <MessageSquare className={iconClass} />;
      case 'LEAD_CREATED': return <UserPlus className={iconClass} />;
      case 'TAG_ADDED': return <Tag className={iconClass} />;
      default: return <Zap className={iconClass} />;
    }
  };

  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-yellow-400 dark:border-yellow-600'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-500" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-200 dark:bg-yellow-800">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-gray-800 dark:text-gray-200">{data.label}</div>
            {data.description && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700">
          Trigger
        </Badge>
      </div>
    </div>
  );
};

const ActionNode = ({ data, selected }) => {
  const getIcon = () => {
    const iconClass = "w-5 h-5";
    switch (data.actionType) {
      case 'SEND_EMAIL': return <Mail className={iconClass} />;
      case 'SEND_SMS': return <Phone className={iconClass} />;
      case 'ADD_TAG': return <Tag className={iconClass} />;
      case 'CREATE_TASK': return <CheckCircle className={iconClass} />;
      case 'UPDATE_FIELD': return <Database className={iconClass} />;
      case 'WEBHOOK': return <Webhook className={iconClass} />;
      case 'NOTIFICATION': return <Bell className={iconClass} />;
      case 'UPDATE_SCORE': return <Award className={iconClass} />;
      case 'ASSIGN_USER': return <Users className={iconClass} />;
      case 'MOVE_PIPELINE': return <TrendingUp className={iconClass} />;
      case 'CREATE_DEAL': return <DollarSign className={iconClass} />;
      default: return <Settings className={iconClass} />;
    }
  };

  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-green-400 dark:border-green-600'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-200 dark:bg-green-800">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-gray-800 dark:text-gray-200">{data.label}</div>
            {data.description && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700">
          Action
        </Badge>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
    </div>
  );
};

const ConditionNode = ({ data, selected }) => {
  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-purple-400 dark:border-purple-600'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-200 dark:bg-purple-800">
            <GitBranch className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-gray-800 dark:text-gray-200">{data.label}</div>
            {data.description && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
            True
          </Badge>
          <Badge variant="outline" className="text-xs bg-[#761B14]/10 dark:bg-[#761B14]/20 text-[#761B14] dark:text-[#9A392D]">
            False
          </Badge>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: '30%' }} className="w-3 h-3 bg-green-500" />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: '70%' }} className="w-3 h-3 bg-[#761B14]" />
    </div>
  );
};

const DelayNode = ({ data, selected }) => {
  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-orange-400 dark:border-orange-600'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105 hover:shadow-2xl`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-500" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-200 dark:bg-orange-800">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base text-gray-800 dark:text-gray-200">{data.label}</div>
            {data.description && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{data.description}</div>
            )}
          </div>
        </div>
        <Badge variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700">
          {data.delayAmount ? `${data.delayAmount} ${data.delayUnit || 'minutes'}` : 'Delay'}
        </Badge>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-orange-500" />
    </div>
  );
};

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

// ==========================================
// MAIN WORKFLOW BUILDER COMPONENT
// ==========================================

const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const { workflowId } = useParams();
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isActive, setIsActive] = useState(false);

  const initialNodes = [
    {
      id: 'trigger-1',
      type: 'trigger',
      position: { x: 250, y: 50 },
      data: {
        label: 'Meeting Booked',
        triggerType: 'MEETING_BOOKED',
        description: 'When a meeting is booked'
      }
    }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  // Toolbar drag state
  const [toolbarPosition, setToolbarPosition] = useState({ x: null, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const toolbarRef = React.useRef(null);

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

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const addNode = (nodeType) => {
    let newNode;
    const nodeCount = nodes.filter(n => n.type === nodeType).length;

    switch (nodeType) {
      case 'action':
        newNode = {
          id: `action-${Date.now()}`,
          type: 'action',
          position: { x: 250 + (nodeCount * 50), y: 200 + (nodeCount * 100) },
          data: {
            label: 'New Action',
            actionType: 'SEND_EMAIL',
            description: 'Configure action'
          }
        };
        break;
      case 'condition':
        newNode = {
          id: `condition-${Date.now()}`,
          type: 'condition',
          position: { x: 250 + (nodeCount * 50), y: 200 + (nodeCount * 100) },
          data: {
            label: 'New Condition',
            description: 'If/Then logic'
          }
        };
        break;
      case 'delay':
        newNode = {
          id: `delay-${Date.now()}`,
          type: 'delay',
          position: { x: 250 + (nodeCount * 50), y: 200 + (nodeCount * 100) },
          data: {
            label: 'Wait',
            delayAmount: 1,
            delayUnit: 'hours',
            description: 'Wait before continuing'
          }
        };
        break;
      default:
        return;
    }

    setNodes((nds) => [...nds, newNode]);
    setShowNodePanel(false);
  };

  const deleteSelected = () => {
    if (selectedNode && selectedNode.type !== 'trigger') {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  };

  const handleSave = async () => {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      is_active: isActive,
      nodes: nodes,
      edges: edges
    };

    console.log('Saving workflow:', workflowData);
    // TODO: Implement API call to save workflow
    alert('Workflow saved successfully!');
  };

  const handleBack = () => {
    navigate('/app/workflows');
  };

  // Toolbar drag handlers
  const handleToolbarMouseDown = (e) => {
    if (e.target.closest('.toolbar-drag-handle') && toolbarRef.current) {
      setIsDragging(true);
      const rect = toolbarRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleToolbarMouseMove = React.useCallback((e) => {
    if (isDragging && toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      setToolbarPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  }, [isDragging, dragOffset]);

  const handleToolbarMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleToolbarMouseMove);
      window.addEventListener('mouseup', handleToolbarMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleToolbarMouseMove);
        window.removeEventListener('mouseup', handleToolbarMouseUp);
      };
    }
  }, [isDragging, handleToolbarMouseMove, handleToolbarMouseUp]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 bg-white dark:bg-[#1a1d24] pr-[200px]">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-xl font-bold border-none p-0 h-auto focus-visible:ring-0"
              placeholder="Workflow Name"
            />
            <Input
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="text-sm text-gray-500 dark:text-gray-400 border-none p-0 h-auto focus-visible:ring-0 mt-1"
              placeholder="Description"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Active</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Canvas */}
      <div className="flex-1 relative bg-gray-50 dark:bg-[#0d0f12]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className="w-full h-full"
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>

        {/* Top Left - Back & Save Buttons */}
        <div className="absolute top-6 left-6 bg-white/95 dark:bg-[#1a1d24]/95 rounded-xl shadow-xl border border-crm-border p-3 flex items-center gap-3 backdrop-blur-sm z-10">
          <Button size="sm" variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button size="sm" variant="default" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>

        {/* Draggable Toolbar */}
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
          <Button size="sm" variant="outline" onClick={() => setShowNodePanel(!showNodePanel)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Node
          </Button>
          <Button size="sm" variant="outline" onClick={deleteSelected} disabled={!selectedNode || selectedNode.type === 'trigger'}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Info Panel Toggle */}
        {!showInfo && (
          <button
            onClick={() => setShowInfo(true)}
            className="absolute top-20 right-6 bg-white/95 dark:bg-[#1a1d24]/95 rounded-full shadow-xl border border-crm-border p-3 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-[#2C3440] transition-colors z-10"
          >
            <HelpCircle className="h-5 w-5 text-crm-text-secondary" />
          </button>
        )}

        {/* Info Panel */}
        {showInfo && (
          <div className="absolute top-20 right-6 bg-white/95 dark:bg-[#1a1d24]/95 rounded-xl shadow-xl border border-crm-border p-5 max-w-xs backdrop-blur-sm z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base">Workflow Info</h3>
              <button onClick={() => setShowInfo(false)} className="text-crm-text-secondary hover:text-crm-text-primary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm space-y-2 text-crm-text-secondary">
              <div>• {nodes.length} nodes</div>
              <div>• {edges.length} connections</div>
              <div>• Status: {isActive ? 'Active' : 'Inactive'}</div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                <p className="italic text-xs">Drag nodes to connect them</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Node Panel */}
        <DraggablePanel
          isOpen={showNodePanel}
          onClose={() => setShowNodePanel(false)}
          title="Add Node"
          defaultPosition="bottom"
        >
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="flex-col h-24 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => addNode('action')}>
              <Settings className="w-8 h-8 mb-2 text-green-600" />
              <span className="text-sm">Action</span>
            </Button>
            <Button variant="outline" className="flex-col h-24 hover:bg-purple-50 dark:hover:bg-purple-900/20" onClick={() => addNode('condition')}>
              <GitBranch className="w-8 h-8 mb-2 text-purple-600" />
              <span className="text-sm">Condition</span>
            </Button>
            <Button variant="outline" className="flex-col h-24 hover:bg-orange-50 dark:hover:bg-orange-900/20" onClick={() => addNode('delay')}>
              <Clock className="w-8 h-8 mb-2 text-orange-600" />
              <span className="text-sm">Delay</span>
            </Button>
          </div>
        </DraggablePanel>
      </div>

      {/* Right Panel - Node Editor */}
      <div className="absolute right-0 top-0 bottom-0 w-96 bg-white dark:bg-[#1a1d24] border-l border-crm-border overflow-y-auto pt-20">
        <div className="p-4">
          {selectedNode ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-crm-text-primary">Node Settings</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={selectedNode.data.label}
                      onChange={(e) => {
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, data: { ...n.data, label: e.target.value } }
                              : n
                          )
                        );
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={selectedNode.data.description || ''}
                      onChange={(e) => {
                        setNodes((nds) =>
                          nds.map((n) =>
                            n.id === selectedNode.id
                              ? { ...n, data: { ...n.data, description: e.target.value } }
                              : n
                          )
                        );
                      }}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {selectedNode.type === 'action' && (
                    <div>
                      <Label className="text-xs">Action Type</Label>
                      <Select
                        value={selectedNode.data.actionType || 'SEND_EMAIL'}
                        onValueChange={(value) => {
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, actionType: value } }
                                : n
                            )
                          );
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SEND_EMAIL">Send Email</SelectItem>
                          <SelectItem value="SEND_SMS">Send SMS</SelectItem>
                          <SelectItem value="ADD_TAG">Add Tag</SelectItem>
                          <SelectItem value="CREATE_TASK">Create Task</SelectItem>
                          <SelectItem value="UPDATE_FIELD">Update Field</SelectItem>
                          <SelectItem value="WEBHOOK">Webhook</SelectItem>
                          <SelectItem value="NOTIFICATION">Send Notification</SelectItem>
                          <SelectItem value="UPDATE_SCORE">Update Lead Score</SelectItem>
                          <SelectItem value="ASSIGN_USER">Assign to User</SelectItem>
                          <SelectItem value="MOVE_PIPELINE">Move in Pipeline</SelectItem>
                          <SelectItem value="CREATE_DEAL">Create Deal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedNode.type === 'delay' && (
                    <>
                      <div>
                        <Label className="text-xs">Delay Amount</Label>
                        <Input
                          type="number"
                          value={selectedNode.data.delayAmount || 1}
                          onChange={(e) => {
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? { ...n, data: { ...n.data, delayAmount: parseInt(e.target.value) } }
                                  : n
                              )
                            );
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Delay Unit</Label>
                        <Select
                          value={selectedNode.data.delayUnit || 'minutes'}
                          onValueChange={(value) => {
                            setNodes((nds) =>
                              nds.map((n) =>
                                n.id === selectedNode.id
                                  ? { ...n, data: { ...n.data, delayUnit: value } }
                                  : n
                              )
                            );
                          }}
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
                    </>
                  )}

                  {selectedNode.type === 'trigger' && (
                    <div>
                      <Label className="text-xs">Trigger Type</Label>
                      <Select
                        value={selectedNode.data.triggerType || 'MEETING_BOOKED'}
                        onValueChange={(value) => {
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, triggerType: value } }
                                : n
                            )
                          );
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEETING_BOOKED">Meeting Booked</SelectItem>
                          <SelectItem value="MEETING_COMPLETED">Meeting Completed</SelectItem>
                          <SelectItem value="MEETING_CANCELLED">Meeting Cancelled</SelectItem>
                          <SelectItem value="MEETING_NO_SHOW">Meeting No-Show</SelectItem>
                          <SelectItem value="FORM_SUBMITTED">Form Submitted</SelectItem>
                          <SelectItem value="LEAD_CREATED">Lead Created</SelectItem>
                          <SelectItem value="TAG_ADDED">Tag Added</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-crm-text-secondary">
              <Settings className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a node to edit</p>
              <p className="text-xs mt-2">Click on nodes to configure them</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
