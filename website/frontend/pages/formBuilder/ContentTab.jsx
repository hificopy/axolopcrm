import { useState } from 'react';
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
  Target,
  GitBranch,
  Settings as SettingsIcon // Import SettingsIcon for the settings panel
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { InfoTooltipInline } from '@/components/ui/info-tooltip';
import QuestionSettingsPanel from './QuestionSettingsPanel'; // Import the new component
import QuestionRenderer from './QuestionRenderer'; // Import the new component

// Available question types
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

export default function ContentTab({ form, setForm, questions, setQuestions, onQuestionsChange }) {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [responses, setResponses] = useState({});
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activeRightPanelTab, setActiveRightPanelTab] = useState('outline'); // 'outline' or 'settings'

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
    };

    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);
    if (onQuestionsChange) onQuestionsChange(newQuestions);
    setSelectedQuestion(newQuestion); // Select the newly added question
    setActiveRightPanelTab('settings'); // Switch to settings tab for the new question
  };

  const updateQuestion = (id, updates) => {
    const newQuestions = questions.map(q => q.id === id ? { ...q, ...updates } : q);
    setQuestions(newQuestions);
    if (onQuestionsChange) onQuestionsChange(newQuestions);
    // Also update the selected question if it's the one being updated
    if (selectedQuestion && selectedQuestion.id === id) {
      setSelectedQuestion(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteQuestion = (id) => {
    const newQuestions = questions.filter(q => q.id !== id);
    setQuestions(newQuestions);
    if (selectedQuestion?.id === id) {
      setSelectedQuestion(null);
      setActiveRightPanelTab('outline'); // Go back to outline if selected question is deleted
    }
    if (onQuestionsChange) onQuestionsChange(newQuestions);
  };

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question);
    setActiveRightPanelTab('settings'); // Automatically switch to settings when a question is selected
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel - Question Types */}
      <div className="w-64 bg-white dark:bg-[#1a1d24] border-r border-crm-border overflow-y-auto">
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
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium text-sm">{type.name}</div>
                    <div className="text-xs text-crm-text-secondary">{type.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Center Panel - Question Preview */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
        {/* Preview Controls */}
        <div className="bg-white dark:bg-[#1a1d24] border-b border-crm-border p-4">
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
                        setActiveRightPanelTab('settings');
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
                        setActiveRightPanelTab('settings');
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
          </div>

          {/* Preview Device Toggle */}
          <div className="flex justify-center">
            <div className="flex items-center border border-crm-border rounded-lg overflow-hidden">
              <button
                className={`px-3 py-1.5 text-xs ${
                  previewMode === 'desktop'
                    ? 'bg-primary text-white'
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
                    ? 'bg-primary text-white'
                    : 'bg-white text-crm-text-secondary hover:bg-gray-50'
                }`}
                onClick={() => setPreviewMode('mobile')}
              >
                Mobile
              </button>
            </div>
          </div>
        </div>

        {/* Question Preview - Rendered by existing component logic */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-gray-100">
          {selectedQuestion ? (
            <div className={`${previewMode === 'mobile' ? 'w-full max-w-sm mx-4' : 'w-full max-w-4xl'}`}>
              <div className="bg-white dark:bg-[#1a1d24] min-h-[500px] rounded-xl shadow-sm overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-6">
                  <h1 className="text-xl font-bold text-crm-text-primary">{form.title}</h1>
                  <p className="text-crm-text-secondary mt-1">{form.description}</p>
                </div>

                {/* Sequential Mode - Show one question at a time */}
                {form.settings?.displayMode === 'sequential' && (
                  <div className="p-6 sm:p-8">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-crm-text-secondary">
                          <span className="font-medium">
                            Question {questions.findIndex(q => q.id === selectedQuestion.id) + 1}
                          </span>
                          {selectedQuestion.required && <span className="text-[#3F0D28]">*</span>}
                        </div>
                      </div>

                      <h2 className="text-lg font-semibold text-crm-text-primary mb-4">
                        {selectedQuestion.title}
                      </h2>

                      {/* Question Input */}
                      <div className="mt-4">
                        <QuestionRenderer
                          question={selectedQuestion}
                          value={responses[selectedQuestion.id]}
                          onChange={(val) => setResponses(prev => ({ ...prev, [selectedQuestion.id]: val }))}
                        />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((questions.findIndex(q => q.id === selectedQuestion.id) + 1) / questions.length) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-xs text-crm-text-secondary mt-1">
                        {questions.findIndex(q => q.id === selectedQuestion.id) + 1} of {questions.length}
                      </div>
                    </div>
                  </div>
                )}

                {/* Regular Mode - Show all questions vertically stacked */}
                {form.settings?.displayMode === 'regular' && (
                  <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-300px)]">
                    <div className="space-y-6">
                      {questions.map((question, index) => (
                        <div
                          key={question.id}
                          className={`pb-6 border-b border-gray-200 last:border-b-0 ${
                            question.id === selectedQuestion.id ? 'bg-primary/5 p-4 rounded-lg -m-4 mb-2' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h2 className="text-base font-semibold text-crm-text-primary">
                                {question.title}
                                {question.required && <span className="text-[#3F0D28] ml-1">*</span>}
                              </h2>
                            </div>
                          </div>

                          {/* Question Input */}
                          <div className="ml-10">
                            <QuestionRenderer
                              question={question}
                              value={responses[question.id]}
                              onChange={(val) => setResponses(prev => ({ ...prev, [question.id]: val }))}
                            />
                          </div>
                        </div>
                      ))}

                      {/* Submit Button */}
                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all"
                        >
                          Submit Form
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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

      {/* Right Panel - Question Outline / Settings */}
      <div className="w-80 bg-white dark:bg-[#1a1d24] border-l border-crm-border overflow-y-auto flex flex-col">
        {/* Tabs for Outline and Settings */}
        <div className="flex border-b border-crm-border">
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeRightPanelTab === 'outline'
                ? 'border-b-2 border-primary text-primary'
                : 'text-crm-text-secondary hover:text-crm-text-primary'
            }`}
            onClick={() => setActiveRightPanelTab('outline')}
          >
            Outline
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium ${
              activeRightPanelTab === 'settings'
                ? 'border-b-2 border-primary text-primary'
                : 'text-crm-text-secondary hover:text-crm-text-primary'
            }`}
            onClick={() => setActiveRightPanelTab('settings')}
            disabled={!selectedQuestion} // Disable settings tab if no question is selected
          >
            <div className="flex items-center justify-center gap-1">
              <SettingsIcon className="h-4 w-4" /> Settings
            </div>
          </button>
        </div>

        {activeRightPanelTab === 'outline' && (
          <div className="p-4">
            <h3 className="font-semibold text-crm-text-primary mb-4 flex items-center justify-between">
              <span>Form Outline</span>
              <span className="text-sm text-crm-text-secondary">{questions.length} questions</span>
            </h3>

            {/* Display Mode Toggle */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-crm-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="display-mode" className="text-sm font-medium text-crm-text-primary">
                    Sequential Mode
                  </Label>
                  <InfoTooltipInline
                    content="Sequential mode shows one question at a time (like Typeform). This approach gets 40-60% higher conversion rates compared to traditional long forms. Turn off for a regular vertical form showing all questions at once."
                    delay={500}
                  />
                </div>
                <Switch
                  id="display-mode"
                  checked={form.settings?.displayMode === 'sequential'}
                  onCheckedChange={(checked) => {
                    setForm({
                      ...form,
                      settings: {
                        ...form.settings,
                        displayMode: checked ? 'sequential' : 'regular'
                      }
                    });
                  }}
                />
              </div>
              <p className="text-xs text-crm-text-secondary">
                {form.settings?.displayMode === 'sequential'
                  ? '✅ One question at a time (recommended for higher conversions)'
                  : 'All questions visible on one page'
                }
              </p>
            </div>

            <div className="space-y-2">
              {questions.map((question, index) => {
                const questionType = questionTypes.find(qt => qt.id === question.type);
                const Icon = questionType?.icon || Type;
                const hasConditionalLogic = question.conditional_logic && question.conditional_logic.length > 0;

                return (
                  <div
                    key={question.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedQuestion?.id === question.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleQuestionSelect(question)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <Icon className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        {hasConditionalLogic && (
                          <GitBranch className="h-3 w-3 text-[#3F0D28]" title="Has conditional logic" />
                        )}
                        {question.lead_scoring_enabled && (
                          <Target className="h-3 w-3 text-green-600" title="Lead scoring enabled" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-crm-text-primary truncate">
                          {index + 1}. {question.title}
                        </div>
                        <div className="text-xs text-crm-text-secondary">
                          <span className="capitalize">{questionType?.name || question.type}</span>
                          {question.required && <span className="text-[#3F0D28]"> *</span>}
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

        {activeRightPanelTab === 'settings' && selectedQuestion && (
          <QuestionSettingsPanel question={selectedQuestion} updateQuestion={updateQuestion} />
        )}
        {activeRightPanelTab === 'settings' && !selectedQuestion && (
          <div className="p-4 text-crm-text-secondary">Select a question to edit its settings.</div>
        )}
      </div>
    </div>
  );
}
