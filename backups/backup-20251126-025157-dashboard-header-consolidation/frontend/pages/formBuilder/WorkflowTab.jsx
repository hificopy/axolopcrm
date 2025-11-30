import React, { useState, useCallback, useMemo } from 'react';
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
  GitBranch,
  CheckCircle2,
  XCircle,
  Play,
  Target,
  Trash2,
  Edit,
  Settings,
  HelpCircle,
  X,
  ArrowLeft,
  Save,
  Type,
  Mail,
  Phone,
  Hash,
  Calendar,
  ToggleLeft,
  List,
  CheckSquare,
  Star,
  FileText,
  GripHorizontal,
  Video,
  Image,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConditionalLogicEditor from './ConditionalLogicEditor';
import DraggablePanel from './DraggablePanel';

// Custom node components
function StartNode({ data, selected }) {
  const formTitle = data.formTitle || 'Untitled Form';
  const formDescription = data.formDescription || '';
  const welcomeMessage = data.welcomeMessage || '';

  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-gradient-to-br from-[#1a1d24] via-[#252a35] to-[#2d3342] border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-[#3d4556]'
    } min-w-[320px] max-w-[400px] transition-all duration-200 hover:scale-105`}>
      <Handle type="source" position={Position.Bottom} />
      <div className="space-y-2">
        {/* Blue START label */}
        <div className="flex items-center gap-2 mb-3">
          <Play className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">START</span>
        </div>

        {/* Form Title */}
        <div className="font-semibold text-base text-white">
          {formTitle}
        </div>

        {/* Form Description */}
        {formDescription && (
          <div className="text-sm text-gray-300 line-clamp-2">
            {formDescription}
          </div>
        )}

        {/* Welcome Message */}
        {welcomeMessage && (
          <div className="text-xs text-gray-400 italic border-t border-gray-600 pt-2 mt-2 line-clamp-2">
            {welcomeMessage}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionNode({ data, selected }) {
  const hasConditionalLogic = data.question?.conditional_logic?.length > 0;
  const hasLeadScoring = data.question?.lead_scoring_enabled;
  const placeholder = data.question?.placeholder || '';
  const hasValidation = data.question?.validation || false;

  const [showHandle, setShowHandle] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  const hoverTimerRef = React.useRef(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    hoverTimerRef.current = setTimeout(() => {
      setShowHandle(true);
    }, 1000); // 1 second
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowHandle(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative px-6 py-4 shadow-xl rounded-xl bg-white dark:bg-[#1a1d24] border-2 ${
        selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-gray-300 dark:border-gray-700'
      } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105 group`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Handle type="target" position={Position.Top} />

      {/* Bottom center: + button that morphs into connection handle */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
        {/* Connection Handle - shows after 1 second hover */}
        <div
          className={`transition-all duration-500 ${
            showHandle ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
          }`}
        >
          <Handle
            type="source"
            position={Position.Bottom}
            className="!static !transform-none !w-4 !h-4 !bg-gray-900 dark:!bg-gray-100 !border-2 !border-white shadow-lg"
          />
        </div>

        {/* Plus Button - shows initially, fades out after 1 second */}
        {data.onQuickAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onQuickAdd(data.question?.id || data.id, data.question?.type);
            }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
              showHandle ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'
            } ${
              isHovering ? 'w-8 h-8 bg-gradient-to-br from-[#1a1d24] via-[#252a35] to-[#2d3342]' : 'w-6 h-6 bg-gradient-to-br from-[#1a1d24] via-[#252a35] to-[#2d3342]'
            } text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl z-10 border border-gray-600`}
            style={{
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            title="Add same question type"
          >
            <Plus className={`transition-all duration-300 ${isHovering ? 'h-5 w-5' : 'h-4 w-4'}`} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base text-crm-text-primary truncate">
              {data.label}
            </div>
            <div className="text-sm text-crm-text-secondary capitalize mt-1">
              {data.question?.type || 'question'}
            </div>
            {placeholder && (
              <div className="text-xs text-crm-text-secondary italic mt-1 truncate">
                "{placeholder}"
              </div>
            )}
          </div>
          {data.question?.required && (
            <span className="text-[#761B14] text-sm flex-shrink-0">*</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {hasConditionalLogic && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
              <GitBranch className="h-3 w-3" />
              <span>Logic</span>
            </div>
          )}
          {hasLeadScoring && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
              <Target className="h-3 w-3" />
              <span>Scored</span>
            </div>
          )}
          {hasValidation && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
              <CheckCircle2 className="h-3 w-3" />
              <span>Validated</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EndNode({ data, selected }) {
  const isQualified = data.ending?.mark_as_qualified === true;
  const isDisqualified = data.ending?.mark_as_qualified === false;
  const redirectUrl = data.ending?.redirect_url || '';
  const createContact = data.ending?.create_contact || false;

  let bgColor = 'bg-gray-100 dark:bg-gray-800';
  let textColor = 'text-gray-900 dark:text-gray-100';
  let borderColor = 'border-gray-400';
  let badgeColor = 'bg-gray-500';
  let icon = <CheckCircle2 className="h-5 w-5" />;
  let statusLabel = 'Neutral';

  if (isQualified) {
    bgColor = 'bg-green-50 dark:bg-green-900/20';
    textColor = 'text-green-900 dark:text-green-100';
    borderColor = 'border-green-500';
    badgeColor = 'bg-green-500';
    icon = <CheckCircle2 className="h-5 w-5 text-green-600" />;
    statusLabel = 'Qualified';
  } else if (isDisqualified) {
    bgColor = 'bg-[#761B14]/5 dark:bg-[#761B14]/20';
    textColor = 'text-[#761B14] dark:text-[#9A392D]';
    borderColor = 'border-[#761B14]';
    badgeColor = 'bg-[#761B14]';
    icon = <XCircle className="h-5 w-5 text-[#761B14]" />;
    statusLabel = 'Disqualified';
  }

  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl ${bgColor} border-2 ${borderColor} ${
      selected ? 'ring-2 ring-offset-2 ring-primary' : ''
    } min-w-[320px] max-w-[400px] transition-all duration-200 hover:scale-105`}>
      <Handle type="target" position={Position.Top} />
      <div className="space-y-3">
        {/* Header with icon and status badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {icon}
            <span className={`text-xs font-bold tracking-wider uppercase ${textColor}`}>END</span>
          </div>
          <span className={`px-2 py-0.5 ${badgeColor} text-white text-xs font-medium rounded`}>
            {statusLabel}
          </span>
        </div>

        {/* Title */}
        <div className={`font-bold text-base ${textColor}`}>
          {data.ending?.title || data.label}
        </div>

        {/* Message */}
        {data.ending?.message && (
          <div className={`text-sm ${textColor} opacity-90 line-clamp-3`}>
            {data.ending.message}
          </div>
        )}

        {/* Additional info */}
        <div className="space-y-1 text-xs border-t border-current opacity-30 pt-2">
          {redirectUrl && (
            <div className={`${textColor} opacity-70 truncate`}>
              → Redirects to: {redirectUrl}
            </div>
          )}
          {createContact && (
            <div className={`${textColor} opacity-70`}>
              ✓ Creates contact
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  start: StartNode,
  question: QuestionNode,
  end: EndNode,
};

export default function WorkflowTab({
  form,
  questions,
  setQuestions,
  workflowNodes: initialNodes,
  setWorkflowNodes,
  workflowEdges: initialEdges,
  setWorkflowEdges,
  endings,
  setEndings,
  onSave,
  onBack
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showEndingEditor, setShowEndingEditor] = useState(false);
  const [editingEnding, setEditingEnding] = useState(null);
  const [showWorkflowInfo, setShowWorkflowInfo] = useState(true);
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);

  // Update parent state when nodes/edges change
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
    // Use setTimeout to ensure React Flow's state is updated first
    setTimeout(() => {
      setNodes((currentNodes) => {
        setWorkflowNodes(currentNodes);
        return currentNodes;
      });
    }, 0);
  }, [onNodesChange, setWorkflowNodes, setNodes]);

  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    // Use setTimeout to ensure React Flow's state is updated first
    setTimeout(() => {
      setEdges((currentEdges) => {
        setWorkflowEdges(currentEdges);
        return currentEdges;
      });
    }, 0);
  }, [onEdgesChange, setWorkflowEdges, setEdges]);

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
      setWorkflowEdges(updatedEdges);
      return updatedEdges;
    });
  }, [setEdges, setWorkflowEdges]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Configure start screen
  const configureStartScreen = (screenType) => {
    // Find the start node
    const startNode = nodes.find(n => n.type === 'start');
    if (startNode) {
      setSelectedNode(startNode);
    }
    setShowQuestionPanel(false);
    // User can then edit it in the right panel
  };

  // Add new ending with type
  const addEnding = (endingType = 'neutral') => {
    let newEnding = {
      id: `end-${Date.now()}`,
      title: 'New Ending',
      message: 'Thank you for your response.',
      icon: 'success',
      mark_as_qualified: null,
      create_contact: false,
      redirect_url: ''
    };

    // Configure ending based on type
    switch (endingType) {
      case 'qualified':
        newEnding = {
          ...newEnding,
          title: 'Qualified Lead',
          message: 'Thank you! We\'ll be in touch soon.',
          mark_as_qualified: true,
          create_contact: true
        };
        break;
      case 'disqualified':
        newEnding = {
          ...newEnding,
          title: 'Thank You',
          message: 'Thank you for your interest. We\'ll keep you updated.',
          mark_as_qualified: false
        };
        break;
      case 'redirect':
        newEnding = {
          ...newEnding,
          title: 'Redirecting...',
          message: 'Thank you! Redirecting you now...',
          redirect_url: 'https://example.com'
        };
        break;
      case 'contact':
        newEnding = {
          ...newEnding,
          title: 'Success!',
          message: 'Your information has been saved.',
          create_contact: true
        };
        break;
      default:
        // Keep default neutral ending
        break;
    }

    setEndings(prevEndings => [...prevEndings, newEnding]);

    // Add ending node to workflow
    setNodes(prevNodes => {
      const newNode = {
        id: newEnding.id,
        type: 'end',
        position: { x: 250 + (prevNodes.filter(n => n.type === 'end').length * 200), y: 600 },
        data: {
          label: newEnding.title,
          ending: newEnding
        }
      };
      const updatedNodes = [...prevNodes, newNode];
      setWorkflowNodes(updatedNodes);
      return updatedNodes;
    });

    setShowQuestionPanel(false);
  };

  // Update question in the main questions array and in the nodes
  const updateQuestionInWorkflow = useCallback((questionId, updates) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q => (q.id === questionId ? { ...q, ...updates } : q))
    );
    setNodes(prevNodes => {
      const updatedNodes = prevNodes.map(node =>
        node.id === questionId
          ? { ...node, data: { ...node.data, question: { ...node.data.question, ...updates } } }
          : node
      );
      setWorkflowNodes(updatedNodes); // Ensure parent state is updated with current nodes
      return updatedNodes;
    });
  }, [setQuestions, setNodes, setWorkflowNodes]);


  // Add new question
  const addQuestion = (questionType) => {
    const newQuestion = {
      id: `q-${Date.now()}`,
      type: questionType,
      label: `New ${questionType} Question`,
      placeholder: 'Enter your answer',
      required: false,
      options: questionType === 'select' || questionType === 'radio' || questionType === 'checkbox'
        ? ['Option 1', 'Option 2', 'Option 3']
        : undefined,
      conditional_logic: [],
      lead_scoring_enabled: false,
      lead_scoring_rules: [],
    };

    // Add to questions array
    setQuestions(prevQuestions => [...prevQuestions, newQuestion]);

    // Add question node to workflow
    setNodes(prevNodes => {
      const questionNodes = prevNodes.filter(n => n.type === 'question');
      const newNode = {
        id: newQuestion.id,
        type: 'question',
        position: {
          x: 250 + (questionNodes.length % 3) * 250,
          y: 200 + Math.floor(questionNodes.length / 3) * 150
        },
        data: {
          label: newQuestion.label,
          question: newQuestion,
          onQuickAdd: handleQuickAdd
        }
      };
      const updatedNodes = [...prevNodes, newNode];
      setWorkflowNodes(updatedNodes);
      return updatedNodes;
    });

    setShowQuestionPanel(false);
  };

  // Quick add handler - adds a new question connected from source node
  const handleQuickAdd = useCallback((sourceNodeId, questionType) => {
    // If question type is provided, directly add the same type
    if (questionType) {
      // Find source node
      const sourceNode = nodes.find(n => n.id === sourceNodeId);
      const newQuestion = {
        id: `q-${Date.now()}`,
        type: questionType,
        label: `New ${questionType} Question`,
        placeholder: 'Enter your answer',
        required: false,
        options: questionType === 'select' || questionType === 'radio' || questionType === 'checkbox'
          ? ['Option 1', 'Option 2', 'Option 3']
          : undefined,
        conditional_logic: [],
        lead_scoring_enabled: false,
        lead_scoring_rules: [],
      };

      // Add to questions array
      setQuestions(prevQuestions => [...prevQuestions, newQuestion]);

      // Position below source node
      let newX = 250;
      let newY = 200;
      if (sourceNode) {
        newX = sourceNode.position.x + 50;
        newY = sourceNode.position.y + 180;
      }

      // Add question node to workflow
      setNodes(prevNodes => {
        const newNode = {
          id: newQuestion.id,
          type: 'question',
          position: { x: newX, y: newY },
          data: {
            label: newQuestion.label,
            question: newQuestion,
            onQuickAdd: handleQuickAdd
          }
        };
        const updatedNodes = [...prevNodes, newNode];
        setWorkflowNodes(updatedNodes);

        // Auto-connect
        setEdges(prevEdges => {
          const newEdge = {
            id: `e-${sourceNodeId}-${newQuestion.id}`,
            source: sourceNodeId,
            target: newQuestion.id,
            type: 'smoothstep',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          };
          const updatedEdges = [...prevEdges, newEdge];
          setWorkflowEdges(updatedEdges);
          return updatedEdges;
        });

        // Auto-select new node
        setTimeout(() => {
          setSelectedNode(newNode);
        }, 100);

        return updatedNodes;
      });
    } else {
      // Open question panel and set up auto-connection
      setShowQuestionPanel(true);
      // Store source node for auto-connection after question is created
      window.__quickAddSourceNodeId = sourceNodeId;
    }
  }, [nodes, setQuestions, setNodes, setWorkflowNodes, setEdges, setWorkflowEdges]);

  // Enhanced add question with auto-connection support
  const addQuestionWithConnection = (questionType, sourceNodeId = null) => {
    const newQuestion = {
      id: `q-${Date.now()}`,
      type: questionType,
      label: `New ${questionType} Question`,
      placeholder: 'Enter your answer',
      required: false,
      options: questionType === 'select' || questionType === 'radio' || questionType === 'checkbox'
        ? ['Option 1', 'Option 2', 'Option 3']
        : undefined,
      conditional_logic: [],
      lead_scoring_enabled: false,
      lead_scoring_rules: [],
    };

    // Add to questions array
    setQuestions(prevQuestions => [...prevQuestions, newQuestion]);

    // Find source node position for smart positioning
    let newX = 250;
    let newY = 200;

    if (sourceNodeId) {
      const sourceNode = nodes.find(n => n.id === sourceNodeId);
      if (sourceNode) {
        // Position below and slightly to the right of source
        newX = sourceNode.position.x + 50;
        newY = sourceNode.position.y + 180;
      }
    } else {
      const questionNodes = nodes.filter(n => n.type === 'question');
      newX = 250 + (questionNodes.length % 3) * 250;
      newY = 200 + Math.floor(questionNodes.length / 3) * 150;
    }

    // Add question node to workflow
    setNodes(prevNodes => {
      const newNode = {
        id: newQuestion.id,
        type: 'question',
        position: { x: newX, y: newY },
        data: {
          label: newQuestion.label,
          question: newQuestion,
          onQuickAdd: handleQuickAdd
        }
      };
      const updatedNodes = [...prevNodes, newNode];
      setWorkflowNodes(updatedNodes);

      // Auto-connect if source node provided
      if (sourceNodeId) {
        setEdges(prevEdges => {
          const newEdge = {
            id: `e-${sourceNodeId}-${newQuestion.id}`,
            source: sourceNodeId,
            target: newQuestion.id,
            type: 'smoothstep',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          };
          const updatedEdges = [...prevEdges, newEdge];
          setWorkflowEdges(updatedEdges);
          return updatedEdges;
        });

        // Auto-select new node
        setTimeout(() => {
          setSelectedNode(newNode);
        }, 100);
      }

      return updatedNodes;
    });

    setShowQuestionPanel(false);

    // Clear temporary source node
    if (window.__quickAddSourceNodeId) {
      delete window.__quickAddSourceNodeId;
    }
  };

  // Delete selected node or edge
  const deleteSelected = () => {
    if (selectedNode && selectedNode.type !== 'start') {
      setNodes(nodes.filter(n => n.id !== selectedNode.id));
      setEdges(edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);

      // If it's a question, remove from questions array
      if (selectedNode.type === 'question') {
        setQuestions(questions.filter(q => q.id !== selectedNode.id));
      }

      // If it's an ending, remove from endings array
      if (selectedNode.type === 'end') {
        setEndings(endings.filter(e => e.id !== selectedNode.id));
      }
    } else if (selectedEdge) {
      setEdges(edges.filter(e => e.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  };

  // Enrich nodes with dynamic data (form info for start node, callbacks for question nodes)
  const enrichedNodes = useMemo(() => {
    return nodes.map(node => {
      if (node.type === 'start') {
        return {
          ...node,
          data: {
            ...node.data,
            formTitle: form?.title || 'Untitled Form',
            formDescription: form?.description || '',
            welcomeMessage: form?.settings?.welcomeMessage || ''
          }
        };
      } else if (node.type === 'question') {
        return {
          ...node,
          data: {
            ...node.data,
            onQuickAdd: handleQuickAdd
          }
        };
      }
      return node;
    });
  }, [nodes, form, handleQuickAdd]);

  return (
    <div className="absolute inset-0 flex">
      {/* Main Workflow Canvas */}
      <div className="flex-1 relative bg-gray-50 dark:bg-[#0d0f12]">
        <ReactFlow
          nodes={enrichedNodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className="w-full h-full"
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>

        {/* Top Left - Exit & Save Buttons */}
        <div className="absolute top-6 left-6 bg-white/95 dark:bg-[#1a1d24]/95 rounded-xl shadow-xl border border-crm-border p-3 flex items-center gap-3 backdrop-blur-sm">
          <Button
            size="sm"
            variant="outline"
            onClick={onBack}
            title="Back to Content"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={onSave}
            title="Save Workflow"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>

        {/* Bottom Center - Workflow Actions */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-[#1a1d24]/95 rounded-xl shadow-xl border border-crm-border p-3 flex items-center gap-3 backdrop-blur-sm z-40">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowQuestionPanel(!showQuestionPanel)}
            title="Add Element"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Element
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={addEnding}
            title="Add Ending"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Ending
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

        {/* Top Right - Info Panel Toggle Button - Moved down to avoid Chat/Tasks buttons */}
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
              <div>• {questions.length} questions</div>
              <div>• {endings.length} endings</div>
              <div>• {edges.length} connections</div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                <p className="italic text-xs">Click nodes to edit, drag to connect</p>
              </div>
            </div>
          </div>
        )}

        {/* Draggable Question Panel */}
        <DraggablePanel
          isOpen={showQuestionPanel}
          onClose={() => setShowQuestionPanel(false)}
          title="Add Element"
          defaultPosition="above-bottom"
        >
          <div className="space-y-4">
            {/* Start Screens Section */}
            <div>
              <h4 className="text-xs font-semibold text-crm-text-secondary uppercase tracking-wider mb-2">Start Screens</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-green-50" onClick={() => configureStartScreen('welcome')}>
                  <Play className="w-3 h-3 mr-1 text-green-600" />
                  Welcome
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-green-50" onClick={() => configureStartScreen('video')}>
                  <Video className="w-3 h-3 mr-1 text-green-600" />
                  Video
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-green-50" onClick={() => configureStartScreen('image')}>
                  <Image className="w-3 h-3 mr-1 text-green-600" />
                  Image
                </Button>
              </div>
            </div>

            {/* Question Types Section */}
            <div>
              <h4 className="text-xs font-semibold text-crm-text-secondary uppercase tracking-wider mb-2">Questions</h4>
              <div className="grid grid-cols-5 gap-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-blue-50" onClick={() => addQuestionWithConnection('text', window.__quickAddSourceNodeId)}>
                  <Type className="w-3 h-3 mr-1 text-blue-600" />
                  Text
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-blue-50" onClick={() => addQuestionWithConnection('email', window.__quickAddSourceNodeId)}>
                  <Mail className="w-3 h-3 mr-1 text-blue-600" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-blue-50" onClick={() => addQuestionWithConnection('tel', window.__quickAddSourceNodeId)}>
                  <Phone className="w-3 h-3 mr-1 text-blue-600" />
                  Phone
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-purple-50" onClick={() => addQuestionWithConnection('select', window.__quickAddSourceNodeId)}>
                  <List className="w-3 h-3 mr-1 text-purple-600" />
                  Dropdown
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-purple-50" onClick={() => addQuestionWithConnection('radio', window.__quickAddSourceNodeId)}>
                  <CheckCircle2 className="w-3 h-3 mr-1 text-purple-600" />
                  Radio
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-purple-50" onClick={() => addQuestionWithConnection('checkbox', window.__quickAddSourceNodeId)}>
                  <CheckSquare className="w-3 h-3 mr-1 text-purple-600" />
                  Checkbox
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-green-50" onClick={() => addQuestionWithConnection('date', window.__quickAddSourceNodeId)}>
                  <Calendar className="w-3 h-3 mr-1 text-green-600" />
                  Date
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-green-50" onClick={() => addQuestionWithConnection('rating', window.__quickAddSourceNodeId)}>
                  <Star className="w-3 h-3 mr-1 text-green-600" />
                  Rating
                </Button>
              </div>
            </div>

            {/* End Screens Section */}
            <div>
              <h4 className="text-xs font-semibold text-crm-text-secondary uppercase tracking-wider mb-2">End Screens</h4>
              <div className="grid grid-cols-5 gap-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-gray-50" onClick={() => addEnding('neutral')}>
                  <MessageSquare className="w-3 h-3 mr-1 text-gray-600" />
                  Thank You
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-green-50" onClick={() => addEnding('qualified')}>
                  <ThumbsUp className="w-3 h-3 mr-1 text-green-600" />
                  Qualified
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-[#761B14]/5" onClick={() => addEnding('disqualified')}>
                  <ThumbsDown className="w-3 h-3 mr-1 text-[#761B14]" />
                  Disqualified
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-blue-50" onClick={() => addEnding('redirect')}>
                  <ExternalLink className="w-3 h-3 mr-1 text-blue-600" />
                  Redirect
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8 hover:bg-purple-50" onClick={() => addEnding('contact')}>
                  <Flag className="w-3 h-3 mr-1 text-purple-600" />
                  Contact
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

              {selectedNode.type === 'start' && (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                      <Play className="h-4 w-4" />
                      <span>Start Node</span>
                    </div>
                    <p className="text-xs text-green-700">
                      This is where your form begins. Connect it to your first question.
                    </p>
                  </div>
                </div>
              )}

              {selectedNode.type === 'question' && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Question Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs">Title</Label>
                        <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                          {selectedNode.data.question?.title}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <div className="mt-1 p-2 bg-gray-50 rounded text-sm capitalize">
                          {selectedNode.data.question?.type}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Required</Label>
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={selectedNode.data.question?.required || false}
                            className="rounded"
                            readOnly
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Conditional Logic Editor */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Conditional Logic
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ConditionalLogicEditor
                        question={selectedNode.data.question}
                        questions={questions}
                        endings={endings}
                        updateQuestion={updateQuestionInWorkflow}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedNode.type === 'end' && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Ending Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={selectedNode.data.ending?.title || ''}
                          onChange={(e) => {
                            const updatedEndings = endings.map(ending =>
                              ending.id === selectedNode.id
                                ? { ...ending, title: e.target.value }
                                : ending
                            );
                            setEndings(updatedEndings);

                            const updatedNodes = nodes.map(node =>
                              node.id === selectedNode.id
                                ? {
                                    ...node,
                                    data: {
                                      ...node.data,
                                      ending: { ...node.data.ending, title: e.target.value }
                                    }
                                  }
                                : node
                            );
                            setNodes(updatedNodes);
                          }}
                          className="mt-1"
                          placeholder="Thank you!"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Message</Label>
                        <textarea
                          value={selectedNode.data.ending?.message || ''}
                          onChange={(e) => {
                            const updatedEndings = endings.map(ending =>
                              ending.id === selectedNode.id
                                ? { ...ending, message: e.target.value }
                                : ending
                            );
                            setEndings(updatedEndings);

                            const updatedNodes = nodes.map(node =>
                              node.id === selectedNode.id
                                ? {
                                    ...node,
                                    data: {
                                      ...node.data,
                                      ending: { ...node.data.ending, message: e.target.value }
                                    }
                                  }
                                : node
                            );
                            setNodes(updatedNodes);
                          }}
                          className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                          rows="3"
                          placeholder="Your response has been recorded."
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Lead Qualification</Label>
                        <select
                          value={selectedNode.data.ending?.mark_as_qualified === true ? 'qualified' : selectedNode.data.ending?.mark_as_qualified === false ? 'disqualified' : 'neutral'}
                          onChange={(e) => {
                            const value = e.target.value === 'qualified' ? true : e.target.value === 'disqualified' ? false : null;
                            const updatedEndings = endings.map(ending =>
                              ending.id === selectedNode.id
                                ? { ...ending, mark_as_qualified: value }
                                : ending
                            );
                            setEndings(updatedEndings);

                            const updatedNodes = nodes.map(node =>
                              node.id === selectedNode.id
                                ? {
                                    ...node,
                                    data: {
                                      ...node.data,
                                      ending: { ...node.data.ending, mark_as_qualified: value }
                                    }
                                  }
                                : node
                            );
                            setNodes(updatedNodes);
                          }}
                          className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                        >
                          <option value="neutral">Neutral</option>
                          <option value="qualified">Mark as Qualified</option>
                          <option value="disqualified">Mark as Disqualified</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs">Redirect URL (optional)</Label>
                        <Input
                          value={selectedNode.data.ending?.redirect_url || ''}
                          onChange={(e) => {
                            const updatedEndings = endings.map(ending =>
                              ending.id === selectedNode.id
                                ? { ...ending, redirect_url: e.target.value }
                                : ending
                            );
                            setEndings(updatedEndings);
                          }}
                          className="mt-1"
                          placeholder="https://example.com"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
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
                      onChange={(e) => {
                        const updatedEdges = edges.map(edge =>
                          edge.id === selectedEdge.id
                            ? { ...edge, label: e.target.value }
                            : edge
                        );
                        setEdges(updatedEdges);
                        setWorkflowEdges(updatedEdges);
                      }}
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
}
