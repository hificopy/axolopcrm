import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Type,
  ListOrdered,
  Minus,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Image,
  Star,
  X,
  GripVertical,
  Eye,
  Save,
  Share2,
  Zap,
  Target,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Available question types based on TypeForm inspiration
const questionTypes = [
  { id: 'short-text', name: 'Short Text', icon: Type, description: 'Ask for short text responses' },
  { id: 'long-text', name: 'Long Text', icon: MessageSquare, description: 'Ask for detailed text responses' },
  { id: 'email', name: 'Email', icon: Mail, description: 'Collect email addresses' },
  { id: 'phone', name: 'Phone', icon: Phone, description: 'Collect phone numbers' },
  { id: 'number', name: 'Number', icon: Minus, description: 'Ask for numerical responses' },
  { id: 'multiple-choice', name: 'Multiple Choice', icon: ListOrdered, description: 'Single selection from options' },
  { id: 'checkboxes', name: 'Checkboxes', icon: ListOrdered, description: 'Multiple selections from options' },
  { id: 'date', name: 'Date', icon: Calendar, description: 'Date picker' },
  { id: 'rating', name: 'Rating', icon: Star, description: 'Star rating scale' },
  { id: 'file-upload', name: 'File Upload', icon: Image, description: 'Allow file uploads' },
];

export default function FormBuilder() {
  const { formId } = useParams();
  const [form, setForm] = useState({
    id: 'new-form',
    title: 'Untitled Form',
    description: 'Describe what this form is about',
    settings: {
      branding: true,
      analytics: true,
      notifications: true,
    }
  });

  const [questions, setQuestions] = useState([
    {
      id: '1',
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
      showThankYou: false,
      thankYouTitle: '',
      thankYouMessage: '',
      redirectUrl: ''
    },
    {
      id: '2',
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
      showThankYou: false,
      thankYouTitle: '',
      thankYouMessage: '',
      redirectUrl: ''
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [activeTab, setActiveTab] = useState('builder'); // builder, settings, preview
  const [formMode, setFormMode] = useState('standard'); // standard, lead-qualification
  const [leadScores, setLeadScores] = useState({}); // Store lead scores for each question option
  const [showTriggers, setShowTriggers] = useState(false);
  const [showScoringPopup, setShowScoringPopup] = useState(false);
  const [responses, setResponses] = useState({});
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, mobile

  useEffect(() => {
    // In a real app, this would fetch the form from API if editing
    if (formId && formId !== 'new' && !formId.startsWith('new-')) {
      // formsApi.getForm(formId)
      //   .then(formData => {
      //     setForm(formData);
      //     // Initialize lead scoring fields for existing questions
      //     const questionsWithScoring = (formData.questions || []).map(q => ({
      //       ...q,
      //       lead_scoring_enabled: q.lead_scoring_enabled || false,
      //       lead_scoring: q.lead_scoring || {},
      //       conditional_logic: q.conditional_logic || []
      //     }));
      //     setQuestions(questionsWithScoring);
      //     setLoading(false);
      //   })
      //   .catch(setError);
      
      // For demo purposes, use mock data for existing form
      const mockFormData = {
        id: formId,
        title: 'Customer Feedback Survey',
        description: 'We value your feedback! Please share your thoughts with us.',
        settings: {
          branding: true,
          analytics: true,
          notifications: true,
        }
      };
      
      setForm(mockFormData);
      setLoading(false);
    } else {
      // Creating a new form
      setForm({
        id: formId || 'new-form',
        title: 'Untitled Form',
        description: 'Describe what this form is about',
        settings: {
          branding: true,
          analytics: true,
          notifications: true,
        }
      });
      setLoading(false);
    }
  }, [formId]);

  const addQuestion = (type) => {
    const newQuestion = {
      id: `question-${Date.now()}`,
      type: type.id,
      title: `New ${type.name} Question`,
      required: false,
      options: type.id === 'multiple-choice' || type.id === 'checkboxes' ? ['Option 1', 'Option 2'] : [],
      settings: {},
      lead_scoring_enabled: false,
      lead_scoring: {},
      conditional_logic: [],
      showThankYou: false,
      thankYouTitle: '',
      thankYouMessage: '',
      redirectUrl: ''
    };

    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, updates) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
    if (selectedQuestion?.id === id) {
      setSelectedQuestion(null);
    }
  };

  const moveQuestion = (fromIndex, toIndex) => {
    const newQuestions = [...questions];
    const [movedItem] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedItem);
    setQuestions(newQuestions);
  };

  const updateFormTitle = (title) => {
    setForm({ ...form, title });
  };

  const calculateLeadScore = () => {
    let totalScore = 0;
    
    questions.forEach(question => {
      if (question.lead_scoring_enabled && question.lead_scoring) {
        const response = responses[question.id];
        
        if (response !== undefined && response !== null) {
          if (Array.isArray(response)) {
            // Handle checkboxes (multiple selections)
            response.forEach(option => {
              const score = question.lead_scoring[option] || 0;
              totalScore += score;
            });
          } else {
            // Handle single selection (radio, dropdown, etc.)
            const score = question.lead_scoring[response] || 0;
            totalScore += score;
          }
        }
      }
    });
    
    return totalScore;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-blue border-t-transparent"></div>
          <p className="text-crm-text-secondary">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
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
      {/* Top Bar */}
      <div className="bg-white border-b border-crm-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            value={form.title}
            onChange={(e) => updateFormTitle(e.target.value)}
            className="text-xl font-semibold border-none focus:ring-0 h-auto py-2 px-3 w-96"
            placeholder="Form Title"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  if (formId && formId !== 'new' && !formId.startsWith('new-')) {
                    // Update existing form
                    // await formsApi.updateForm(form.id, {
                    //   ...form,
                    //   questions,
                    //   fields: questions,  // For compatibility with database schema
                    // });
                    alert(`Form "${form.title}" updated successfully!`);
                  } else {
                    // Create new form
                    // const newForm = await formsApi.createForm({
                    //   ...form,
                    //   questions,
                    //   fields: questions,  // For compatibility with database schema
                    //   isActive: false,
                    //   isPublished: false
                    // });
                    // Update the URL to the new form ID
                    // window.history.replaceState({}, '', `/forms/builder/${newForm.id}`);
                    alert(`New form "${form.title}" created successfully!`);
                  }
                } catch (error) {
                  console.error('Error saving form:', error);
                  alert('Error saving form. Please try again.');
                }
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (formId && formId !== 'new' && !formId.startsWith('new-')) {
                  window.location.href = `/forms/preview/${formId}`;
                } else {
                  alert('Please save the form first before previewing.');
                }
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (formId && formId !== 'new' && !formId.startsWith('new-')) {
                  const formUrl = `${window.location.origin}/forms/preview/${formId}`;
                  navigator.clipboard.writeText(formUrl);
                  alert(`Form link copied to clipboard: ${formUrl}`);
                } else {
                  alert('Please save the form first before sharing.');
                }
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant={activeTab === 'builder' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('builder')}
          >
            Build
          </Button>
          <Button 
            variant={activeTab === 'settings' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </Button>
          <Button 
            variant={activeTab === 'preview' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Question Types */}
        <div className="w-64 bg-white border-r border-crm-border overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-crm-text-primary mb-3">Question Types</h3>
            <div className="space-y-1">
              {questionTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => addQuestion(type)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <Icon className="h-5 w-5 text-primary-blue" />
                    <div>
                      <div className="font-medium text-sm">{type.name}</div>
                      <div className="text-xs text-crm-text-secondary">{type.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Content Triggers Button */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-crm-text-primary mb-3">Logic & Triggers</h3>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowTriggers(true)}
              >
                <Zap className="h-4 w-4 mr-2" />
                Content Triggers
              </Button>
            </div>
          </div>
        </div>

        {/* Center Panel - Single Question Preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
          {/* Preview Controls */}
          <div className="bg-white border-b border-crm-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {selectedQuestion ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const currentIndex = questions.findIndex(q => q.id === selectedQuestion.id);
                        if (currentIndex > 0) {
                          setSelectedQuestion(questions[currentIndex - 1]);
                        }
                      }}
                      disabled={questions.findIndex(q => q.id === selectedQuestion.id) === 0}
                    >
                      ← Prev
                    </Button>
                    <span className="text-sm text-crm-text-secondary mx-2">
                      {questions.findIndex(q => q.id === selectedQuestion.id) + 1} of {questions.length}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const currentIndex = questions.findIndex(q => q.id === selectedQuestion.id);
                        if (currentIndex < questions.length - 1) {
                          setSelectedQuestion(questions[currentIndex + 1]);
                        }
                      }}
                      disabled={questions.findIndex(q => q.id === selectedQuestion.id) === questions.length - 1}
                    >
                      Next →
                    </Button>
                  </>
                ) : (
                  <span className="text-sm text-crm-text-secondary">Select a question to preview</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-crm-text-secondary">Preview</span>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            </div>
            
            {/* Preview Device Toggle */}
            <div className="flex justify-center">
              <div className="flex items-center border border-crm-border rounded-lg overflow-hidden">
                <button
                  className={`px-3 py-1.5 text-xs ${
                    previewMode === 'desktop'
                      ? 'bg-primary-blue text-white' 
                      : 'bg-white text-crm-text-secondary hover:bg-gray-50'
                  }`}
                  onClick={() => setPreviewMode('desktop')}
                >
                  Desktop
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                  className={`px-3 py-1.5 text-xs ${
                    previewMode === 'mobile'
                      ? 'bg-primary-blue text-white' 
                      : 'bg-white text-crm-text-secondary hover:bg-gray-50'
                  }`}
                  onClick={() => setPreviewMode('mobile')}
                >
                  Mobile
                </button>
              </div>
            </div>
          </div>
          
          {/* Question Preview Area */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-gray-100">
            {selectedQuestion ? (
              <div className={`${previewMode === 'mobile' ? 'w-full max-w-sm mx-4' : 'w-full max-w-4xl'}`}>
                <div className="bg-white min-h-[500px] rounded-xl shadow-sm overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="bg-white border-b border-gray-200 p-6">
                    <h1 className="text-xl font-bold text-crm-text-primary">{form.title}</h1>
                    <p className="text-crm-text-secondary mt-1">{form.description}</p>
                  </div>

                  {/* Question */}
                  <div className="p-6 sm:p-8">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-crm-text-secondary">
                          <span className="font-medium">
                            Question {questions.findIndex(q => q.id === selectedQuestion.id) + 1}
                          </span>
                          {selectedQuestion.required && <span className="text-red-500">*</span>}
                        </div>
                        {formMode === 'lead-qualification' && selectedQuestion.lead_scoring_enabled && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            +{Object.values(selectedQuestion.lead_scoring || {}).reduce((sum, score) => sum + (score || 0), 0)} pts
                          </span>
                        )}
                      </div>

                      <h2 className="text-lg font-semibold text-crm-text-primary mb-4">
                        {selectedQuestion.title}
                      </h2>

                      <div className="mt-4">
                        {selectedQuestion.type === 'short-text' && (
                          <Input
                            value={responses[selectedQuestion.id] || ''}
                            onChange={(e) => {
                              setResponses(prev => ({
                                ...prev,
                                [selectedQuestion.id]: e.target.value
                              }));
                            }}
                            placeholder={selectedQuestion.settings.placeholder || 'Type your answer'}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          />
                        )}

                        {selectedQuestion.type === 'long-text' && (
                          <textarea
                            value={responses[selectedQuestion.id] || ''}
                            onChange={(e) => {
                              setResponses(prev => ({
                                ...prev,
                                [selectedQuestion.id]: e.target.value
                              }));
                            }}
                            placeholder={selectedQuestion.settings.placeholder || 'Type your answer'}
                            rows="4"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          />
                        )}

                        {selectedQuestion.type === 'email' && (
                          <input
                            type="email"
                            value={responses[selectedQuestion.id] || ''}
                            onChange={(e) => {
                              setResponses(prev => ({
                                ...prev,
                                [selectedQuestion.id]: e.target.value
                              }));
                            }}
                            placeholder={selectedQuestion.settings.placeholder || 'your.email@example.com'}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          />
                        )}

                        {selectedQuestion.type === 'number' && (
                          <input
                            type="number"
                            value={responses[selectedQuestion.id] || ''}
                            onChange={(e) => {
                              setResponses(prev => ({
                                ...prev,
                                [selectedQuestion.id]: e.target.value
                              }));
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          />
                        )}

                        {selectedQuestion.type === 'multiple-choice' && (
                          <div className="space-y-2">
                            {selectedQuestion.options.map((option, idx) => (
                              <label key={idx} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="radio"
                                  name={selectedQuestion.id}
                                  value={option}
                                  checked={responses[selectedQuestion.id] === option}
                                  onChange={(e) => {
                                    setResponses(prev => ({
                                      ...prev,
                                      [selectedQuestion.id]: e.target.value
                                    }));
                                  }}
                                  className="mr-3"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {selectedQuestion.type === 'checkboxes' && (
                          <div className="space-y-2">
                            {selectedQuestion.options.map((option, idx) => (
                              <label key={idx} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={(responses[selectedQuestion.id] || []).includes(option)}
                                  onChange={(e) => {
                                    const currentValue = responses[selectedQuestion.id] || [];
                                    let newValue;
                                    if (e.target.checked) {
                                      newValue = [...currentValue, option];
                                    } else {
                                      newValue = currentValue.filter(item => item !== option);
                                    }
                                    setResponses(prev => ({
                                      ...prev,
                                      [selectedQuestion.id]: newValue
                                    }));
                                  }}
                                  value={option}
                                  className="mr-3"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {selectedQuestion.type === 'date' && (
                          <input
                            type="date"
                            value={responses[selectedQuestion.id] || ''}
                            onChange={(e) => {
                              setResponses(prev => ({
                                ...prev,
                                [selectedQuestion.id]: e.target.value
                              }));
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          />
                        )}

                        {selectedQuestion.type === 'rating' && (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => {
                                  setResponses(prev => ({
                                    ...prev,
                                    [selectedQuestion.id]: star
                                  }));
                                }}
                                className={`text-2xl ${star <= (responses[selectedQuestion.id] || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        )}

                        {selectedQuestion.type === 'file-upload' && (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                              type="file"
                              className="hidden"
                              id={`file-upload-${selectedQuestion.id}`}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setResponses(prev => ({
                                    ...prev,
                                    [selectedQuestion.id]: file.name  // Store filename or file object as needed
                                  }));
                                }
                              }}
                            />
                            <label 
                              htmlFor={`file-upload-${selectedQuestion.id}`}
                              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90"
                            >
                              <Plus className="h-4 w-4" />
                              Choose File
                            </label>
                            <p className="text-sm text-crm-text-secondary mt-2">
                              Drag & drop or click to browse
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const currentIndex = questions.findIndex(q => q.id === selectedQuestion.id);
                          if (currentIndex > 0) {
                            setSelectedQuestion(questions[currentIndex - 1]);
                          }
                        }}
                        disabled={questions.findIndex(q => q.id === selectedQuestion.id) === 0}
                      >
                        ← Back
                      </Button>

                      <Button
                        onClick={() => {
                          const currentIndex = questions.findIndex(q => q.id === selectedQuestion.id);
                          if (currentIndex < questions.length - 1) {
                            // Move to next question
                            setSelectedQuestion(questions[currentIndex + 1]);
                          } else {
                            // Calculate lead score and submit form
                            const totalScore = calculateLeadScore();
                            console.log('Form submitted with responses:', responses, 'Lead Score:', totalScore);
                            
                            // In a real application, this would save to the CRM
                            // formsApi.submitForm(form.id, responses, totalScore);
                            
                            alert(`Form "${form.title}" submitted successfully!\nLead Score: ${totalScore} points`);
                          }
                        }}
                      >
                        {questions.findIndex(q => q.id === selectedQuestion.id) === questions.length - 1 ? 'Submit Form' : 'Next →'}
                      </Button>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-blue h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((questions.findIndex(q => q.id === selectedQuestion.id) + 1) / questions.length) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xs text-crm-text-secondary mt-1">
                        {questions.findIndex(q => q.id === selectedQuestion.id) + 1} of {questions.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-crm-text-secondary">
                <div className="text-lg mb-2">No question selected</div>
                <p className="text-sm">Select a question from the outline to preview it here</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Outline and Settings */}
        <div className="w-80 bg-white border-l border-crm-border overflow-y-auto flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-crm-border flex">
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                !selectedQuestion 
                  ? 'text-primary-blue border-b-2 border-primary-blue' 
                  : 'text-crm-text-secondary hover:text-crm-text-primary'
              }`}
              onClick={() => setSelectedQuestion(null)}
            >
              Outline
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                selectedQuestion 
                  ? 'text-primary-blue border-b-2 border-primary-blue' 
                  : 'text-crm-text-secondary hover:text-crm-text-primary'
              }`}
              onClick={() => {
                if (selectedQuestion) {
                  // Keep selectedQuestion selected
                }
              }}
              disabled={!selectedQuestion}
            >
              Settings
            </button>
          </div>

          {/* Content based on selection */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedQuestion ? (
              <div className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-crm-text-primary">Question Settings</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedQuestion(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800 text-sm">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">{selectedQuestion.title}</span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Question {questions.findIndex(q => q.id === selectedQuestion.id) + 1} of {questions.length}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Required</Label>
                    <input
                      type="checkbox"
                      checked={selectedQuestion.required}
                      onChange={(e) => {
                        updateQuestion(selectedQuestion.id, { required: e.target.checked });
                        setSelectedQuestion({ ...selectedQuestion, required: e.target.checked });
                      }}
                      className="ml-2 rounded"
                    />
                  </div>

                  <div>
                    <Label>Placeholder Text</Label>
                    <Input
                      value={selectedQuestion.settings.placeholder || ''}
                      onChange={(e) => {
                        const newSettings = { ...selectedQuestion.settings, placeholder: e.target.value };
                        updateQuestion(selectedQuestion.id, { settings: newSettings });
                        setSelectedQuestion({ ...selectedQuestion, settings: newSettings });
                      }}
                      placeholder="Enter placeholder text"
                    />
                  </div>

                  <div>
                    <Label>Validation</Label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedQuestion.settings.validation || ''}
                      onChange={(e) => {
                        const newSettings = { ...selectedQuestion.settings, validation: e.target.value };
                        updateQuestion(selectedQuestion.id, { settings: newSettings });
                        setSelectedQuestion({ ...selectedQuestion, settings: newSettings });
                      }}
                    >
                      <option value="">No validation</option>
                      <option value="email">Email format</option>
                      <option value="phone">Phone format</option>
                      <option value="number">Number only</option>
                      <option value="url">URL format</option>
                      <option value="required">Required</option>
                    </select>
                  </div>
                  
                  {/* Lead Qualification Scoring */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedQuestion.lead_scoring_enabled || false}
                          onChange={(e) => {
                            const newQuestion = { 
                              ...selectedQuestion, 
                              lead_scoring_enabled: e.target.checked 
                            };
                            updateQuestion(selectedQuestion.id, newQuestion);
                            setSelectedQuestion(newQuestion);
                          }}
                          className="rounded"
                        />
                        Enable Lead Scoring
                      </Label>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            // Reset all scores to 0
                            const newQuestion = {
                              ...selectedQuestion,
                              lead_scoring: {}
                            };
                            updateQuestion(selectedQuestion.id, newQuestion);
                            setSelectedQuestion(newQuestion);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {selectedQuestion?.lead_scoring_enabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              // Show more detailed scoring popup for this question
                              setShowScoringPopup(true);
                            }}
                          >
                            <Target className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {selectedQuestion.lead_scoring_enabled && (
                      <div className="mt-3 pl-6 space-y-3">
                        <div className="text-sm font-medium text-crm-text-primary mb-1">Assign points to responses:</div>
                        
                        {selectedQuestion.type === 'multiple-choice' && selectedQuestion.options && selectedQuestion.options.map((option, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-crm-text-secondary truncate flex-1 mr-2">{option}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">=</span>
                              <input
                                type="number"
                                value={selectedQuestion.lead_scoring?.[option] || 0}
                                onChange={(e) => {
                                  const newScoring = { 
                                    ...selectedQuestion.lead_scoring, 
                                    [option]: parseInt(e.target.value) || 0 
                                  };
                                  const newQuestion = { 
                                    ...selectedQuestion, 
                                    lead_scoring: newScoring 
                                  };
                                  updateQuestion(selectedQuestion.id, newQuestion);
                                  setSelectedQuestion(newQuestion);
                                }}
                                className="w-16 p-1 border border-gray-300 rounded text-xs text-center"
                                placeholder="0"
                              />
                              <span className="text-sm">pts</span>
                            </div>
                          </div>
                        ))}
                        
                        {selectedQuestion.type === 'checkboxes' && selectedQuestion.options && selectedQuestion.options.map((option, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-crm-text-secondary truncate flex-1 mr-2">{option}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">=</span>
                              <input
                                type="number"
                                value={selectedQuestion.lead_scoring?.[option] || 0}
                                onChange={(e) => {
                                  const newScoring = { 
                                    ...selectedQuestion.lead_scoring, 
                                    [option]: parseInt(e.target.value) || 0 
                                  };
                                  const newQuestion = { 
                                    ...selectedQuestion, 
                                    lead_scoring: newScoring 
                                  };
                                  updateQuestion(selectedQuestion.id, newQuestion);
                                  setSelectedQuestion(newQuestion);
                                }}
                                className="w-16 p-1 border border-gray-300 rounded text-xs text-center"
                                placeholder="0"
                              />
                              <span className="text-sm">pts</span>
                            </div>
                          </div>
                        ))}
                        
                        {selectedQuestion.type === 'rating' && (
                          <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <div key={value} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm text-crm-text-secondary">Rate {value}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">=</span>
                                  <input
                                    type="number"
                                    value={selectedQuestion.lead_scoring?.[`rating-${value}`] || 0}
                                    onChange={(e) => {
                                      const newScoring = { 
                                        ...selectedQuestion.lead_scoring, 
                                        [`rating-${value}`]: parseInt(e.target.value) || 0 
                                      };
                                      const newQuestion = { 
                                        ...selectedQuestion, 
                                        lead_scoring: newScoring 
                                      };
                                      updateQuestion(selectedQuestion.id, newQuestion);
                                      setSelectedQuestion(newQuestion);
                                    }}
                                    className="w-16 p-1 border border-gray-300 rounded text-xs text-center"
                                    placeholder="0"
                                  />
                                  <span className="text-sm">pts</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="pt-2 border-t border-gray-200">
                          <div className="text-xs text-crm-text-secondary">
                            Points will be added to the lead's score when respondents select these options
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Detailed Scoring Popup */}
                  {selectedQuestion.lead_scoring_enabled && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-800 text-sm">
                          <Target className="h-4 w-4" />
                          <span className="font-medium">Lead Scoring</span>
                        </div>
                        <span className="text-xs font-medium text-blue-700">
                          {Object.values(selectedQuestion.lead_scoring || {}).reduce((sum, score) => sum + (score || 0), 0)} pts possible
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-blue-600">
                        {selectedQuestion.lead_scoring && Object.keys(selectedQuestion.lead_scoring).length > 0 
                          ? 'Scoring configured' 
                          : 'Configure scoring for this question'}
                      </div>
                    </div>
                  )}
                  
                  {/* Thank You Screen */}
                  <div className="pt-4 border-t border-gray-200">
                    <Label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={selectedQuestion?.showThankYou || false}
                        onChange={(e) => {
                          const newQuestion = {
                            ...selectedQuestion,
                            showThankYou: e.target.checked
                          };
                          updateQuestion(selectedQuestion.id, newQuestion);
                          setSelectedQuestion(newQuestion);
                        }}
                        className="rounded"
                      />
                      Show as Thank You Screen
                    </Label>
                    {selectedQuestion?.showThankYou && (
                      <div className="pl-6 space-y-3">
                        <div>
                          <Label className="text-xs font-medium text-crm-text-primary">Thank You Title</Label>
                          <input
                            type="text"
                            value={selectedQuestion.thankYouTitle || ''}
                            onChange={(e) => {
                              const newQuestion = {
                                ...selectedQuestion,
                                thankYouTitle: e.target.value
                              };
                              updateQuestion(selectedQuestion.id, newQuestion);
                              setSelectedQuestion(newQuestion);
                            }}
                            placeholder="Thank you for your response!"
                            className="w-full p-2 text-sm border border-gray-300 rounded mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-crm-text-primary">Thank You Message</Label>
                          <textarea
                            value={selectedQuestion.thankYouMessage || ''}
                            onChange={(e) => {
                              const newQuestion = {
                                ...selectedQuestion,
                                thankYouMessage: e.target.value
                              };
                              updateQuestion(selectedQuestion.id, newQuestion);
                              setSelectedQuestion(newQuestion);
                            }}
                            placeholder="We appreciate your feedback."
                            rows="2"
                            className="w-full p-2 text-sm border border-gray-300 rounded mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-crm-text-primary">Redirect URL (optional)</Label>
                          <input
                            type="text"
                            value={selectedQuestion.redirectUrl || ''}
                            onChange={(e) => {
                              const newQuestion = {
                                ...selectedQuestion,
                                redirectUrl: e.target.value
                              };
                              updateQuestion(selectedQuestion.id, newQuestion);
                              setSelectedQuestion(newQuestion);
                            }}
                            placeholder="https://example.com"
                            className="w-full p-2 text-sm border border-gray-300 rounded mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Conditional Logic - Logic Jumps */}
                  <div className="pt-4 border-t border-gray-200">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedQuestion?.conditional_logic && selectedQuestion.conditional_logic.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Enable conditional logic with empty array
                            const newQuestion = {
                              ...selectedQuestion,
                              conditional_logic: selectedQuestion.conditional_logic || []
                            };
                            updateQuestion(selectedQuestion.id, newQuestion);
                            setSelectedQuestion(newQuestion);
                          } else {
                            // Disable conditional logic
                            const newQuestion = {
                              ...selectedQuestion,
                              conditional_logic: []
                            };
                            updateQuestion(selectedQuestion.id, newQuestion);
                            setSelectedQuestion(newQuestion);
                          }
                        }}
                        className="rounded"
                      />
                      Enable Logic Jumps
                    </Label>
                    {selectedQuestion?.conditional_logic && selectedQuestion.conditional_logic.length > 0 && (
                      <div className="mt-2 pl-6 space-y-3">
                        <div className="text-xs text-crm-text-secondary mb-1">Configure logic jump:</div>
                        {selectedQuestion.conditional_logic?.map((rule, idx) => (
                          <div key={idx} className="space-y-2 p-3 bg-gray-50 rounded">
                            <div className="text-xs font-medium text-crm-text-primary">Rule #{idx + 1}</div>
                            <div className="grid grid-cols-3 gap-2">
                              <select
                                value={rule.question}
                                onChange={(e) => {
                                  const newRules = [...selectedQuestion.conditional_logic];
                                  newRules[idx] = { ...newRules[idx], question: e.target.value };
                                  const newQuestion = {
                                    ...selectedQuestion,
                                    conditional_logic: newRules
                                  };
                                  updateQuestion(selectedQuestion.id, newQuestion);
                                  setSelectedQuestion(newQuestion);
                                }}
                                className="text-xs p-1 border border-gray-300 rounded"
                              >
                                <option value="">Select question</option>
                                {questions.filter(q => q.id !== selectedQuestion.id).map(q => (
                                  <option key={q.id} value={q.id}>{q.title}</option>
                                ))}
                              </select>
                              <select
                                value={rule.operator}
                                onChange={(e) => {
                                  const newRules = [...selectedQuestion.conditional_logic];
                                  newRules[idx] = { ...newRules[idx], operator: e.target.value };
                                  const newQuestion = {
                                    ...selectedQuestion,
                                    conditional_logic: newRules
                                  };
                                  updateQuestion(selectedQuestion.id, newQuestion);
                                  setSelectedQuestion(newQuestion);
                                }}
                                className="text-xs p-1 border border-gray-300 rounded"
                              >
                                <option value="equals">equals</option>
                                <option value="not_equals">not equals</option>
                                <option value="contains">contains</option>
                                <option value="greater_than">greater than</option>
                                <option value="less_than">less than</option>
                              </select>
                              <input
                                type="text"
                                value={rule.value}
                                onChange={(e) => {
                                  const newRules = [...selectedQuestion.conditional_logic];
                                  newRules[idx] = { ...newRules[idx], value: e.target.value };
                                  const newQuestion = {
                                    ...selectedQuestion,
                                    conditional_logic: newRules
                                  };
                                  updateQuestion(selectedQuestion.id, newQuestion);
                                  setSelectedQuestion(newQuestion);
                                }}
                                placeholder="Value"
                                className="text-xs p-1 border border-gray-300 rounded"
                              />
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-crm-text-secondary">Then go to:</span>
                              <select
                                value={rule.thenGoTo || ''}
                                onChange={(e) => {
                                  const newRules = [...selectedQuestion.conditional_logic];
                                  newRules[idx] = { ...newRules[idx], thenGoTo: e.target.value };
                                  const newQuestion = {
                                    ...selectedQuestion,
                                    conditional_logic: newRules
                                  };
                                  updateQuestion(selectedQuestion.id, newQuestion);
                                  setSelectedQuestion(newQuestion);
                                }}
                                className="text-xs p-1 border border-gray-300 rounded"
                              >
                                <option value="">Next question</option>
                                {questions.map(q => (
                                  <option key={q.id} value={q.id}>Question: {q.title}</option>
                                ))}
                              </select>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-auto block"
                              onClick={() => {
                                const newRules = [...selectedQuestion.conditional_logic];
                                newRules.splice(idx, 1);
                                const newQuestion = {
                                  ...selectedQuestion,
                                  conditional_logic: newRules
                                };
                                updateQuestion(selectedQuestion.id, newQuestion);
                                setSelectedQuestion(newQuestion);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            if (!selectedQuestion) return;
                            // Add a new rule
                            const newRule = {
                              question: '',
                              operator: 'equals',
                              value: '',
                              thenGoTo: ''
                            };
                            const newQuestion = {
                              ...selectedQuestion,
                              conditional_logic: [...selectedQuestion.conditional_logic, newRule]
                            };
                            updateQuestion(selectedQuestion.id, newQuestion);
                            setSelectedQuestion(newQuestion);
                          }}
                        >
                          Add Logic Jump
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <h3 className="font-semibold text-crm-text-primary mb-4 flex items-center justify-between">
                  <span>Form Outline</span>
                  <span className="text-sm text-crm-text-secondary">{questions.length} questions</span>
                </h3>
                
                {/* Form Mode Toggle */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-crm-text-primary">Form Mode</span>
                  </div>
                  <div className="flex items-center border border-crm-border rounded-lg overflow-hidden">
                    <button
                      className={`flex-1 py-1.5 text-xs ${
                        formMode === 'standard' 
                          ? 'bg-primary-blue text-white' 
                          : 'bg-white text-crm-text-secondary hover:bg-gray-50'
                      }`}
                      onClick={() => setFormMode('standard')}
                    >
                      Standard
                    </button>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <button
                      className={`flex-1 py-1.5 text-xs ${
                        formMode === 'lead-qualification' 
                          ? 'bg-primary-blue text-white' 
                          : 'bg-white text-crm-text-secondary hover:bg-gray-50'
                      }`}
                      onClick={() => setFormMode('lead-qualification')}
                    >
                      Lead Qual
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {questions.map((question, index) => {
                    const questionType = questionTypes.find(qt => qt.id === question.type);
                    const Icon = questionType?.icon || Type;
                    
                    return (
                      <div
                        key={question.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedQuestion?.id === question.id
                            ? 'border-primary-blue bg-primary-blue/5'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedQuestion(question)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <Icon className="h-4 w-4 mt-0.5 text-primary-blue flex-shrink-0" />
                            {formMode === 'lead-qualification' && question.lead_scoring_enabled && (
                              <div className="mt-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-crm-text-primary truncate">
                              {index + 1}. {question.title}
                            </div>
                            <div className="text-xs text-crm-text-secondary capitalize">
                              {questionType?.name || question.type}
                              {question.required && <span className="text-red-500"> *</span>}
                              {formMode === 'lead-qualification' && question.lead_scoring_enabled && (
                                <span className="ml-1 text-green-600">• Scored</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteQuestion(question.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {questions.length === 0 && (
                  <div className="text-center py-8 text-crm-text-secondary">
                    <p className="text-sm">No questions yet</p>
                    <p className="text-xs mt-1">Add questions to build your form</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Triggers Popup */}
      {showTriggers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-crm-text-primary">Content Triggers</h2>
                <p className="text-sm text-crm-text-secondary">Define automated actions based on user responses</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowTriggers(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lead Scoring Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary-blue" />
                      Lead Scoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-crm-text-secondary mb-3">
                      Assign scores to responses to qualify leads automatically
                    </p>
                    <div className="space-y-3">
                      {questions.filter(q => q.lead_scoring_enabled).map((question) => (
                        <div key={question.id} className="p-3 border rounded-lg bg-gray-50">
                          <div className="font-medium text-sm mb-1 truncate">{question.title}</div>
                          <div className="text-xs text-crm-text-secondary space-y-1">
                            {Object.entries(question.lead_scoring || {})
                              .filter(([_, score]) => score !== 0 && score !== undefined)
                              .map(([option, score]) => (
                                <div key={option} className="flex justify-between">
                                  <span className="truncate max-w-[120px]">{option}</span>
                                  <span className="font-medium text-primary-blue">{score} pts</span>
                                </div>
                              ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-xs text-crm-text-secondary">Total possible: 
                              <span className="font-medium">
                                {Object.values(question.lead_scoring || {}).reduce((sum, score) => sum + (score || 0), 0)} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {questions.filter(q => q.lead_scoring_enabled).length === 0 && (
                        <div className="text-center py-4 text-crm-text-secondary text-sm">
                          No questions have scoring enabled
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Conditional Logic Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Filter className="h-4 w-4 text-primary-blue" />
                      Conditional Logic
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-crm-text-secondary mb-3">
                      Show or hide questions based on previous answers
                    </p>
                    <Button variant="outline" className="w-full mb-3">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Conditional Logic
                    </Button>
                    <div className="text-xs text-crm-text-secondary">
                      <p className="mb-1">Examples:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Skip questions based on previous answers</li>
                        <li>Personalize content dynamically</li>
                        <li>Route users down different paths</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                {/* CRM Integration Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary-blue" />
                      CRM Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-crm-text-secondary mb-3">
                      Trigger CRM actions based on form responses
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Create new lead</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Add to campaign</span>
                        <input type="checkbox" className="rounded" />
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Send notification</span>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Notifications Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary-blue" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-crm-text-secondary mb-3">
                      Send notifications when specific conditions are met
                    </p>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Notification
                    </Button>
                    <div className="mt-3 text-xs text-crm-text-secondary">
                      Get notified for high-value leads or specific responses
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-between">
              <Button variant="outline" onClick={() => setShowTriggers(false)}>
                Cancel
              </Button>
              <div className="flex gap-3">
                <Button variant="outline">Save as Template</Button>
                <Button onClick={() => setShowTriggers(false)}>
                  Save Triggers
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Detailed Scoring Popup */}
      {showScoringPopup && selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-crm-text-primary">Lead Scoring</h2>
                <p className="text-sm text-crm-text-secondary">Assign points to each answer option</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowScoringPopup(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-crm-text-primary">{selectedQuestion?.title || 'Select a question'}</h3>
                <p className="text-sm text-crm-text-secondary mt-1">{questionTypes.find(qt => qt.id === selectedQuestion?.type)?.name || 'Question type'}</p>
              </div>
              
              <div className="space-y-3">
                {selectedQuestion.type === 'multiple-choice' && selectedQuestion.options && selectedQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-crm-text-primary flex-1">{option}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">=</span>
                      <input
                        type="number"
                        value={selectedQuestion.lead_scoring?.[option] || 0}
                        onChange={(e) => {
                          const newScoring = { 
                            ...selectedQuestion.lead_scoring, 
                            [option]: parseInt(e.target.value) || 0 
                          };
                          const newQuestion = { 
                            ...selectedQuestion, 
                            lead_scoring: newScoring 
                          };
                          updateQuestion(selectedQuestion.id, newQuestion);
                          // Update the selectedQuestion state to reflect changes in the popup
                          setSelectedQuestion(newQuestion);
                        }}
                        className="w-20 p-2 border border-gray-300 rounded text-sm text-center"
                        placeholder="0"
                      />
                      <span className="text-sm">points</span>
                    </div>
                  </div>
                ))}
                
                {selectedQuestion.type === 'checkboxes' && selectedQuestion.options && selectedQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-crm-text-primary flex-1">{option}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">=</span>
                      <input
                        type="number"
                        value={selectedQuestion.lead_scoring?.[option] || 0}
                        onChange={(e) => {
                          const newScoring = { 
                            ...selectedQuestion.lead_scoring, 
                            [option]: parseInt(e.target.value) || 0 
                          };
                          const newQuestion = { 
                            ...selectedQuestion, 
                            lead_scoring: newScoring 
                          };
                          updateQuestion(selectedQuestion.id, newQuestion);
                        }}
                        className="w-20 p-2 border border-gray-300 rounded text-sm text-center"
                        placeholder="0"
                      />
                      <span className="text-sm">points</span>
                    </div>
                  </div>
                ))}
                
                {selectedQuestion.type === 'rating' && [1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-crm-text-primary flex-1">Rate {value}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">=</span>
                      <input
                        type="number"
                        value={selectedQuestion.lead_scoring?.[`rating-${value}`] || 0}
                        onChange={(e) => {
                          const newScoring = { 
                            ...selectedQuestion.lead_scoring, 
                            [`rating-${value}`]: parseInt(e.target.value) || 0 
                          };
                          const newQuestion = { 
                            ...selectedQuestion, 
                            lead_scoring: newScoring 
                          };
                          updateQuestion(selectedQuestion.id, newQuestion);
                        }}
                        className="w-20 p-2 border border-gray-300 rounded text-sm text-center"
                        placeholder="0"
                      />
                      <span className="text-sm">points</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowScoringPopup(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}