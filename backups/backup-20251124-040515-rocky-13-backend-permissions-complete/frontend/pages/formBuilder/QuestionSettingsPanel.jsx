import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export default function QuestionSettingsPanel({ question, updateQuestion }) {
  const [currentQuestion, setCurrentQuestion] = useState(question);

  useEffect(() => {
    setCurrentQuestion(question);
  }, [question]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setCurrentQuestion(prev => ({ ...prev, [name]: newValue }));
    updateQuestion(question.id, { [name]: newValue });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    updateQuestion(question.id, { options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...currentQuestion.options, `Option ${currentQuestion.options.length + 1}`];
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    updateQuestion(question.id, { options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    updateQuestion(question.id, { options: newOptions });
  };

  if (!currentQuestion) {
    return <div className="p-4 text-crm-text-secondary">Select a question to edit its settings.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-crm-text-primary mb-3">Question Settings</h3>

      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-sm">Question Title</Label>
        <Input
          id="title"
          name="title"
          value={currentQuestion.title}
          onChange={handleInputChange}
          className="mt-1"
        />
      </div>

      {/* Description (if applicable, e.g., for long text) */}
      {/* <div>
        <Label htmlFor="description" className="text-sm">Description</Label>
        <Input
          id="description"
          name="description"
          value={currentQuestion.description || ''}
          onChange={handleInputChange}
          className="mt-1"
        />
      </div> */}

      {/* Required Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="required" className="text-sm">Required</Label>
        <Switch
          id="required"
          name="required"
          checked={currentQuestion.required}
          onCheckedChange={(checked) => {
            setCurrentQuestion(prev => ({ ...prev, required: checked }));
            updateQuestion(question.id, { required: checked });
          }}
        />
      </div>

      {/* Placeholder (for text-based inputs) */}
      {(currentQuestion.type === 'short-text' || currentQuestion.type === 'long-text' || currentQuestion.type === 'email' || currentQuestion.type === 'phone' || currentQuestion.type === 'number') && (
        <div>
          <Label htmlFor="placeholder" className="text-sm">Placeholder</Label>
          <Input
            id="placeholder"
            name="placeholder"
            value={currentQuestion.settings?.placeholder || ''}
            onChange={(e) => {
              const newSettings = { ...currentQuestion.settings, placeholder: e.target.value };
              setCurrentQuestion(prev => ({ ...prev, settings: newSettings }));
              updateQuestion(question.id, { settings: newSettings });
            }}
            className="mt-1"
          />
        </div>
      )}

      {/* Options for Multiple Choice / Checkboxes */}
      {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'checkboxes') && (
        <div>
          <Label className="text-sm mb-2 block">Options</Label>
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => removeOption(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addOption} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Option
            </Button>
          </div>
        </div>
      )}

      {/* Lead Scoring Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="lead_scoring_enabled" className="text-sm">Enable Lead Scoring</Label>
        <Switch
          id="lead_scoring_enabled"
          name="lead_scoring_enabled"
          checked={currentQuestion.lead_scoring_enabled}
          onCheckedChange={(checked) => {
            setCurrentQuestion(prev => ({ ...prev, lead_scoring_enabled: checked }));
            updateQuestion(question.id, { lead_scoring_enabled: checked });
          }}
        />
      </div>

      {/* Conditional Logic Toggle (simplified for now) */}
      <div className="flex items-center justify-between">
        <Label htmlFor="conditional_logic_enabled" className="text-sm">Enable Conditional Logic</Label>
        <Switch
          id="conditional_logic_enabled"
          name="conditional_logic_enabled"
          checked={currentQuestion.conditional_logic && currentQuestion.conditional_logic.length > 0}
          onCheckedChange={(checked) => {
            const newConditionalLogic = checked ? [{ /* default condition */ }] : [];
            setCurrentQuestion(prev => ({ ...prev, conditional_logic: newConditionalLogic }));
            updateQuestion(question.id, { conditional_logic: newConditionalLogic });
          }}
        />
      </div>
    </div>
  );
}
