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
  GripHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConditionalLogicEditor from './ConditionalLogicEditor';
import DraggablePanel from './DraggablePanel';

// Custom node components
function StartNode({ data }) {
  return (
    <div className="px-6 py-4 shadow-xl rounded-xl bg-green-500 text-white border-2 border-green-600 transition-all duration-200 hover:scale-105">
      <Handle type="source" position={Position.Bottom} />
      <div className="flex items-center gap-3">
        <Play className="h-5 w-5" />
        <div className="font-bold text-lg">Start</div>
      </div>
    </div>
  );
}

function QuestionNode({ data, selected }) {
  const hasConditionalLogic = data.question?.conditional_logic?.length > 0;
  const hasLeadScoring = data.question?.lead_scoring_enabled;

  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl bg-white dark:bg-[#1a1d24] border-2 ${
      selected ? 'border-primary ring-2 ring-offset-2 ring-primary' : 'border-gray-300 dark:border-gray-700'
    } min-w-[280px] max-w-[400px] transition-all duration-200 hover:scale-105`}>
      <Handle type="target" position={Position.Top} />
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base text-crm-text-primary truncate">
              {data.label}
            </div>
            <div className="text-sm text-crm-text-secondary capitalize mt-1">
              {data.question?.type || 'question'}
            </div>
          </div>
          {data.question?.required && (
            <span className="text-red-500 text-sm flex-shrink-0">*</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasConditionalLogic && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
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
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function EndNode({ data, selected }) {
  const isQualified = data.ending?.mark_as_qualified === true;
  const isDisqualified = data.ending?.mark_as_qualified === false;

  let bgColor = 'bg-gray-500';
  let borderColor = 'border-gray-600';
  let icon = <CheckCircle2 className="h-5 w-5" />;

  if (isQualified) {
    bgColor = 'bg-green-500';
    borderColor = 'border-green-600';
    icon = <CheckCircle2 className="h-5 w-5" />;
  } else if (isDisqualified) {
    bgColor = 'bg-red-500';
    borderColor = 'border-red-600';
    icon = <XCircle className="h-5 w-5" />;
  }

  return (
    <div className={`px-6 py-4 shadow-xl rounded-xl ${bgColor} text-white border-2 ${borderColor} ${
      selected ? 'ring-2 ring-offset-2 ring-primary' : ''
    } min-w-[280px] transition-all duration-200 hover:scale-105`}>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="font-bold text-base">{data.ending?.title || data.label}</div>
          {data.ending?.message && (
            <div className="text-sm opacity-90 mt-1 line-clamp-2">{data.ending.message}</div>
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

  // Draggable toolbar state
  const [toolbarPosition, setToolbarPosition] = useState({ x: null, y: 24 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  const [toolbarDragOffset, setToolbarDragOffset] = useState({ x: 0, y: 0 });
  const toolbarRef = React.useRef(null);

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

  // Add new ending
  const addEnding = () => {
    const newEnding = {
      id: `end-${Date.now()}`,
      title: 'New Ending',
      message: 'Thank you for your response.',
      icon: 'success',
      mark_as_qualified: null,
    };

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
          question: newQuestion
        }
      };
      const updatedNodes = [...prevNodes, newNode];
      setWorkflowNodes(updatedNodes);
      return updatedNodes;
    });

    setShowQuestionPanel(false);
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

  return (
    <div className="absolute inset-0 flex">
      {/* Main Workflow Canvas */}
      <div className="flex-1 relative bg-gray-50 dark:bg-[#0d0f12]">
        <ReactFlow
          nodes={nodes}
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

        {/* Center Top - Workflow Actions - Draggable */}
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowQuestionPanel(!showQuestionPanel)}
            title="Add Question"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Question
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
          title="Add Question"
          defaultPosition="bottom"
        >
          <div className="grid grid-cols-3 gap-3">
            {/* Text Inputs */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-crm-text-secondary uppercase tracking-wider mb-2">Text Input</h4>
              <Button variant="outline" className="w-full justify-start text-sm h-10 hover:bg-blue-50" onClick={() => addQuestion('text')}>
                <Type className="w-4 h-4 mr-2 text-blue-600" />
                Short Text
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-10 hover:bg-blue-50" onClick={() => addQuestion('textarea')}>
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                Long Text
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-10 hover:bg-blue-50" onClick={() => addQuestion('email')}>
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                Email
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-10 hover:bg-blue-50" onClick={() => addQuestion('tel')}>
                <Phone className="w-4 h-4 mr-2 text-blue-600" />
                Phone
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-10 hover:bg-blue-50" onClick={() => addQuestion('number')}>
                <Hash className="w-4 h-4 mr-2 text-blue-600" />
                Number
              </Button>
            </div>

            {/* Selection */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-crm-text-secondary uppercase tracking-wider mb-2">Selection</h4>
              <Button variant="outline" className="w-full justify-start text-sm h-10 hover:bg-purple-50" onClick={() => addQuestion('select')}>
                <List className="w-4 h-4 mr-2 text-purple-600" />
                Dropdown
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-10 hover:bg-purple-50" onClick={() => addQuestion('radio')}>
                <CheckCircle2 className="w-4 h-4 mr-2 text-purple-600" />
                Radio Buttons
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-10 hover:bg-purple-50" onClick={() => addQuestion('checkbox')}>
                <CheckSquare className="w-4 h-4 mr-2 text-purple-600" />
                Checkboxes
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-10 hover:bg-purple-50" onClick={() => addQuestion('toggle')}>
                <ToggleLeft className="w-4 h-4 mr-2 text-purple-600" />
                Toggle Switch
              </Button>
            </div>

            {/* Special */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-crm-text-secondary uppercase tracking-wider mb-2">Special</h4>
              <Button variant="outline" className="w-full justify-start text-sm h-10 hover:bg-green-50" onClick={() => addQuestion('date')}>
                <Calendar className="w-4 h-4 mr-2 text-green-600" />
                Date
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-10 hover:bg-green-50" onClick={() => addQuestion('time')}>
                <Calendar className="w-4 h-4 mr-2 text-green-600" />
                Time
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm h-10 hover:bg-green-50" onClick={() => addQuestion('rating')}>
                <Star className="w-4 h-4 mr-2 text-green-600" />
                Rating
              </Button>
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
