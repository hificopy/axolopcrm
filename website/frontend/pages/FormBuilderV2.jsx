import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Eye,
  Settings as SettingsIcon,
  Share2,
  BarChart3,
  Workflow as WorkflowIcon,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import formsApi from '@/services/formsApi';

// Import tab components
import ContentTab from './formBuilder/ContentTab';
import WorkflowTab from './formBuilder/WorkflowTab';
import ConnectTab from './formBuilder/ConnectTab';
import ShareTab from './formBuilder/ShareTab';
import ResultsTab from './formBuilder/ResultsTab';

export default function FormBuilderV2() {
  const { formId } = useParams();
  const navigate = useNavigate();

  // Main state
  const [form, setForm] = useState({
    id: 'new-form',
    title: 'Untitled Form',
    description: 'Describe what this form is about',
    settings: {
      branding: true,
      analytics: true,
      notifications: true,
      mode: 'standard',
      theme: 'default',
      create_contact: false,
      contact_mapping: {},
      displayMode: 'sequential', // 'sequential' or 'regular' - default to sequential for better conversions
    }
  });

  const [questions, setQuestions] = useState([
    {
      id: 'question-1',
      type: 'short-text',
      title: 'What is your name?',
      required: true,
      options: [],
      settings: {
        placeholder: 'Enter your full name',
      },
      lead_scoring_enabled: false,
      lead_scoring: {},
      conditional_logic: [],
    },
    {
      id: 'question-2',
      type: 'email',
      title: 'What is your email address?',
      required: true,
      options: [],
      settings: {
        placeholder: 'your.email@example.com',
      },
      lead_scoring_enabled: false,
      lead_scoring: {},
      conditional_logic: [],
    }
  ]);

  // Workflow state - nodes and edges for visual workflow
  const [workflowNodes, setWorkflowNodes] = useState([]);
  const [workflowEdges, setWorkflowEdges] = useState([]);
  const [endings, setEndings] = useState([
    {
      id: 'end-default',
      title: 'Thank you!',
      message: 'Your response has been recorded.',
      icon: 'success',
      mark_as_qualified: null,
    }
  ]);

  // UI state
  const [activeTab, setActiveTab] = useState('content'); // content, workflow, connect, share, results
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Initialize linear workflow from questions
  const initializeWorkflowFromQuestions = useCallback((questionsArray) => {
    const nodes = [];
    const edges = [];

    // Start node
    nodes.push({
      id: 'start',
      type: 'start',
      position: { x: 250, y: 50 },
      data: { label: 'Start' }
    });

    // Question nodes
    questionsArray.forEach((q, index) => {
      nodes.push({
        id: q.id,
        type: 'question',
        position: { x: 250, y: 200 + (index * 150) },
        data: {
          label: q.title,
          question: q
        }
      });

      // Edge from previous node
      if (index === 0) {
        edges.push({
          id: `start-to-${q.id}`,
          source: 'start',
          target: q.id,
          type: 'default'
        });
      } else {
        edges.push({
          id: `${questionsArray[index - 1].id}-to-${q.id}`,
          source: questionsArray[index - 1].id,
          target: q.id,
          type: 'default'
        });
      }
    });

    // End node
    nodes.push({
      id: 'end-default',
      type: 'end',
      position: { x: 250, y: 200 + (questionsArray.length * 150) },
      data: {
        label: 'Thank You',
        ending: endings[0]
      }
    });

    // Edge from last question to end
    if (questionsArray.length > 0) {
      edges.push({
        id: `${questionsArray[questionsArray.length - 1].id}-to-end-default`,
        source: questionsArray[questionsArray.length - 1].id,
        target: 'end-default',
        type: 'default'
      });
    }

    setWorkflowNodes(nodes);
    setWorkflowEdges(edges);
  }, [endings]);

  // Load form data
  useEffect(() => {
    if (formId && formId !== 'new' && !formId.startsWith('new-')) {
      formsApi.getForm(formId)
        .then(formData => {
          // Ensure displayMode defaults to 'sequential'
          setForm({
            ...formData,
            settings: {
              ...formData.settings,
              displayMode: formData.settings?.displayMode || 'sequential'
            }
          });
          const questionsWithDefaults = (formData.questions || []).map(q => ({
            ...q,
            lead_scoring_enabled: q.lead_scoring_enabled || false,
            lead_scoring: q.lead_scoring || {},
            conditional_logic: q.conditional_logic || []
          }));
          setQuestions(questionsWithDefaults);

          // Extract workflow data from settings if it exists
          if (formData.settings?.workflow_nodes && formData.settings?.workflow_nodes.length > 0) {
            setWorkflowNodes(formData.settings.workflow_nodes);
            setWorkflowEdges(formData.settings.workflow_edges || []);
            setEndings(formData.settings.endings || [
              {
                id: 'end-default',
                title: 'Thank you!',
                message: 'Your response has been recorded.',
                icon: 'success',
                mark_as_qualified: null,
              }
            ]);
          } else {
            // Initialize workflow from questions if no saved workflow
            initializeWorkflowFromQuestions(questionsWithDefaults);
          }

          setLoading(false);
        })
        .catch(err => {
          setError(err);
          setLoading(false);
        });
    } else {
      // Initialize default workflow for new form
      initializeWorkflowFromQuestions(questions);
      setLoading(false);
    }
  }, [formId, initializeWorkflowFromQuestions, questions]);

  // Save form
  const handleSave = async () => {
    setSaving(true);
    try {
      // Include workflow data in settings for now (until backend is updated)
      const settingsWithWorkflow = {
        ...form.settings,
        workflow_nodes: workflowNodes,
        workflow_edges: workflowEdges,
        endings: endings
      };

      if (formId && formId !== 'new' && !formId.startsWith('new-')) {
        // Update existing form
        await formsApi.updateForm(form.id, {
          title: form.title,
          description: form.description,
          questions: questions,
          settings: settingsWithWorkflow
        });
        alert(`Form "${form.title}" updated successfully!`);
      } else {
        // Create new form
        const newForm = await formsApi.createForm({
          title: form.title,
          description: form.description,
          questions: questions,
          settings: settingsWithWorkflow
        });

        setForm(newForm);
        navigate(`/app/forms/builder/${newForm.id}`, { replace: true });
        alert(`New form "${form.title}" created successfully!`);
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert(`Error saving form: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center pt-[150px] bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-crm-text-secondary">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center pt-[150px] bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-crm-text-primary mb-2">Error Loading Form</h2>
          <p className="text-crm-text-secondary mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Bar - Form Title and Actions */}
      <div className="bg-white border-b border-crm-border py-3 px-4 flex items-center gap-3 overflow-x-auto">
        {/* Form Title - Compact on left */}
        <div className="flex-shrink-0" style={{ width: '150px' }}>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="text-sm font-semibold border-none focus:ring-0 h-auto py-2 px-2"
            placeholder="Form Title"
          />
        </div>

        {/* Action Buttons - On the left side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('workflow')}
            className="min-w-[100px]"
          >
            <WorkflowIcon className="h-4 w-4 mr-2" />
            Workflow
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 border border-crm-border rounded-md">
            <span className="text-sm text-crm-text-secondary">Draft</span>
            <button
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors bg-gray-200"
              onClick={() => {
                // Toggle draft/active status
                setForm({ ...form, status: form.status === 'active' ? 'draft' : 'active' });
              }}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.status === 'active' ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="min-w-[80px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (form.id && form.id !== 'new-form' && !form.id.toString().startsWith('new-')) {
                navigate(`/forms/preview/${form.id}`);
              } else {
                alert('Please save the form first before previewing.');
              }
            }}
            className="min-w-[90px]"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (form.id && form.id !== 'new-form') {
                const shareUrl = `${window.location.origin}/forms/preview/${form.id}`;
                navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
              }
            }}
            className="min-w-[100px]"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </div>

      {/* Tab Navigation - Conversational Style */}
      <div className="bg-white dark:bg-[#1a1d24] border-b border-crm-border">
        <div className="flex items-center px-6">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-primary text-primary'
                : 'border-transparent text-crm-text-secondary hover:text-crm-text-primary'
            }`}
          >
            <FileText className="h-4 w-4" />
            Content
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'workflow'
                ? 'border-primary text-primary'
                : 'border-transparent text-crm-text-secondary hover:text-crm-text-primary'
            }`}
          >
            <WorkflowIcon className="h-4 w-4" />
            Workflow
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'connect'
                ? 'border-primary text-primary'
                : 'border-transparent text-crm-text-secondary hover:text-crm-text-primary'
            }`}
          >
            <Share2 className="h-4 w-4" />
            Connect
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'share'
                ? 'border-primary text-primary'
                : 'border-transparent text-crm-text-secondary hover:text-crm-text-primary'
            }`}
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'results'
                ? 'border-primary text-primary'
                : 'border-transparent text-crm-text-secondary hover:text-crm-text-primary'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Results
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'content' && (
          <ContentTab
            form={form}
            setForm={setForm}
            questions={questions}
            setQuestions={setQuestions}
            onQuestionsChange={initializeWorkflowFromQuestions}
          />
        )}
        {activeTab === 'workflow' && (
          <WorkflowTab
            form={form}
            questions={questions}
            setQuestions={setQuestions}
            workflowNodes={workflowNodes}
            setWorkflowNodes={setWorkflowNodes}
            workflowEdges={workflowEdges}
            setWorkflowEdges={setWorkflowEdges}
            endings={endings}
            setEndings={setEndings}
            onSave={handleSave}
            onBack={() => setActiveTab('content')}
          />
        )}
        {activeTab === 'connect' && (
          <ConnectTab
            form={form}
          />
        )}
        {activeTab === 'share' && (
          <ShareTab
            form={form}
          />
        )}
        {activeTab === 'results' && (
          <ResultsTab
            form={form}
          />
        )}
      </div>
    </div>
  );
}
