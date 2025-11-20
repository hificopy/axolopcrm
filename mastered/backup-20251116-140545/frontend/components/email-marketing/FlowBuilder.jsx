import React, { useState, useCallback, useRef } from 'react';
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
  ArrowRight,
  Trash2,
  Copy,
  Edit3,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FlowBuilder = () => {
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [nodes, setNodes] = useState([
    {
      id: 'trigger-1',
      type: 'trigger',
      position: { x: 100, y: 100 },
      data: {
        label: 'Lead Created',
        triggerType: 'LEAD_CREATED',
        description: 'When a new lead is added to the CRM'
      }
    },
    {
      id: 'action-1',
      type: 'action',
      position: { x: 400, y: 100 },
      data: {
        label: 'Send Welcome Email',
        actionType: 'EMAIL',
        description: 'Send a welcome email to the new lead'
      }
    }
  ]);
  const [connections, setConnections] = useState([
    { id: 'conn-1', source: 'trigger-1', target: 'action-1' }
  ]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Add a new node to the flow
  const addNode = (type) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 300 + 100 
      },
      data: {
        label: getNodeLabel(type),
        ...getNodeDefaultData(type)
      }
    };

    setNodes([...nodes, newNode]);
  };

  const getNodeLabel = (type) => {
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
          description: 'When this event occurs'
        };
      case 'action':
        return {
          actionType: 'EMAIL',
          description: 'Perform this action'
        };
      case 'condition':
        return {
          conditionType: 'FIELD_COMPARE',
          description: 'Check this condition'
        };
      case 'delay':
        return {
          delayType: 'TIME_DELAY',
          description: 'Wait for a specific time'
        };
      default:
        return { description: 'Node description' };
    }
  };

  // Delete a node
  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setConnections(connections.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    ));
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(null);
    }
  };

  // Update node data
  const updateNodeData = (nodeId, newData) => {
    setNodes(nodes.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...newData } } 
        : node
    ));
    
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...newData } });
    }
  };

  // Toggle workflow status
  const toggleWorkflowStatus = () => {
    setIsRunning(!isRunning);
  };

  // Render a node on the canvas
  const renderNode = (node) => {
    const isSelected = selectedNode && selectedNode.id === node.id;
    const nodeClasses = `absolute rounded-lg border-2 p-4 shadow-lg min-w-[200px] cursor-pointer transition-all ${
      isSelected 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200 bg-white hover:shadow-md'
    }`;

    let icon, colorClass;
    switch (node.type) {
      case 'trigger':
        icon = <Zap className="w-5 h-5" />;
        colorClass = 'border-yellow-200 bg-yellow-50';
        break;
      case 'action':
        icon = <Mail className="w-5 h-5" />;
        colorClass = 'border-green-200 bg-green-50';
        break;
      case 'condition':
        icon = <User className="w-5 h-5" />;
        colorClass = 'border-purple-200 bg-purple-50';
        break;
      case 'delay':
        icon = <Clock className="w-5 h-5" />;
        colorClass = 'border-orange-200 bg-orange-50';
        break;
      default:
        icon = <Settings className="w-5 h-5" />;
        colorClass = 'border-gray-200 bg-gray-50';
    }

    return (
      <div
        key={node.id}
        className={`${nodeClasses} ${colorClass}`}
        style={{ left: node.position.x, top: node.position.y }}
        onClick={() => setSelectedNode(node)}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1 rounded ${isSelected ? 'bg-blue-100' : ''}`}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{node.data.label}</div>
            <div className="text-xs text-gray-500">{node.data.description}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(node.id);
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  };

  // Render connections between nodes
  const renderConnections = () => {
    return connections.map(conn => {
      const sourceNode = nodes.find(n => n.id === conn.source);
      const targetNode = nodes.find(n => n.id === conn.target);
      
      if (!sourceNode || !targetNode) return null;
      
      const sourceX = sourceNode.position.x + 100; // center of node width
      const sourceY = sourceNode.position.y + 40;  // center of node height
      const targetX = targetNode.position.x;
      const targetY = targetNode.position.y + 40;  // center of node height
      
      return (
        <svg
          key={conn.id}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#94a3b8"
              />
            </marker>
          </defs>
          <line
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke="#94a3b8"
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Flow Builder</h1>
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="w-64"
            placeholder="Workflow name"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button variant={isRunning ? "secondary" : "default"} size="sm" onClick={toggleWorkflowStatus}>
            {isRunning ? (
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
          <Button size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Node Palette */}
        <div className="w-64 bg-white border-r p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Add Elements</h3>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 mb-2">TRIGGERS</h4>
            <Button 
              variant="outline" 
              className="w-full justify-start mb-1" 
              onClick={() => addNode('trigger')}
            >
              <Zap className="w-4 h-4 mr-2" />
              Lead Created
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start mb-1" 
              onClick={() => addNode('trigger')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Opened
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start mb-1" 
              onClick={() => addNode('trigger')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Form Submitted
            </Button>

            <h4 className="text-sm font-medium text-gray-500 mb-2 mt-4">ACTIONS</h4>
            <Button 
              variant="outline" 
              className="w-full justify-start mb-1" 
              onClick={() => addNode('action')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start mb-1" 
              onClick={() => addNode('action')}
            >
              <Tag className="w-4 h-4 mr-2" />
              Add Tag
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start mb-1" 
              onClick={() => addNode('action')}
            >
              <Database className="w-4 h-4 mr-2" />
              Update Field
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start mb-1" 
              onClick={() => addNode('action')}
            >
              <User className="w-4 h-4 mr-2" />
              Create Task
            </Button>

            <h4 className="text-sm font-medium text-gray-500 mb-2 mt-4">LOGIC</h4>
            <Button 
              variant="outline" 
              className="w-full justify-start mb-1" 
              onClick={() => addNode('condition')}
            >
              <User className="w-4 h-4 mr-2" />
              If/Else Condition
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start mb-1" 
              onClick={() => addNode('delay')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Delay
            </Button>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative overflow-auto bg-gray-100">
          {/* Canvas grid background */}
          <div 
            className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px]"
            style={{ 
              backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)'
            }}
          />
          
          {/* Render connections first so nodes appear on top */}
          {renderConnections()}
          
          {/* Render nodes */}
          {nodes.map(node => renderNode(node))}
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white border-l p-4 overflow-y-auto">
          {selectedNode ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Properties</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteNode(selectedNode.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Label</Label>
                  <Input
                    value={selectedNode.data.label}
                    onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Input
                    value={selectedNode.data.description}
                    onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                  />
                </div>
                
                {selectedNode.type === 'trigger' && (
                  <div>
                    <Label>Trigger Type</Label>
                    <Select
                      value={selectedNode.data.triggerType}
                      onValueChange={(value) => updateNodeData(selectedNode.id, { triggerType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEAD_CREATED">Lead Created</SelectItem>
                        <SelectItem value="EMAIL_OPENED">Email Opened</SelectItem>
                        <SelectItem value="EMAIL_CLICKED">Email Clicked</SelectItem>
                        <SelectItem value="FORM_SUBMITTED">Form Submitted</SelectItem>
                        <SelectItem value="LEAD_STATUS_CHANGED">Lead Status Changed</SelectItem>
                        <SelectItem value="SCHEDULED_TIME">Scheduled Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedNode.type === 'action' && (
                  <div>
                    <Label>Action Type</Label>
                    <Select
                      value={selectedNode.data.actionType}
                      onValueChange={(value) => updateNodeData(selectedNode.id, { actionType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMAIL">Send Email</SelectItem>
                        <SelectItem value="TAG_ASSIGNMENT">Add/Remove Tag</SelectItem>
                        <SelectItem value="FIELD_UPDATE">Update Field</SelectItem>
                        <SelectItem value="TASK_CREATION">Create Task</SelectItem>
                        <SelectItem value="WEBHOOK">Call Webhook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedNode.type === 'condition' && (
                  <div>
                    <Label>Condition</Label>
                    <Select
                      value={selectedNode.data.conditionType}
                      onValueChange={(value) => updateNodeData(selectedNode.id, { conditionType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIELD_COMPARE">Compare Field Value</SelectItem>
                        <SelectItem value="TAG_CHECK">Check for Tag</SelectItem>
                        <SelectItem value="EMAIL_STATUS">Email Status</SelectItem>
                        <SelectItem value="CUSTOM_LOGIC">Custom Logic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a node to edit its properties</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowBuilder;