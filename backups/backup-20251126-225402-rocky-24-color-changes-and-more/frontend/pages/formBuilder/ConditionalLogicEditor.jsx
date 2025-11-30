import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

export default function ConditionalLogicEditor({ question, questions, endings, updateQuestion }) {
  const [logicRules, setLogicRules] = useState(question.conditional_logic || []);

  const handleRuleChange = (index, key, value) => {
    const newRules = [...logicRules];
    if (key.startsWith('condition.')) {
      const conditionKey = key.split('.')[1];
      newRules[index].condition = { ...newRules[index].condition, [conditionKey]: value };
    } else {
      newRules[index][key] = value;
    }
    setLogicRules(newRules);
    updateQuestion(question.id, { conditional_logic: newRules });
  };

  const addRule = () => {
    const newRule = {
      condition: {
        field: '',
        operator: 'equals',
        value: ''
      },
      action: 'jump',
      thenGoTo: ''
    };
    setLogicRules([...logicRules, newRule]);
    updateQuestion(question.id, { conditional_logic: [...logicRules, newRule] });
  };

  const removeRule = (index) => {
    const newRules = logicRules.filter((_, i) => i !== index);
    setLogicRules(newRules);
    updateQuestion(question.id, { conditional_logic: newRules });
  };

  const availableFields = questions.filter(q => q.id !== question.id).map(q => ({
    id: q.id,
    title: q.title,
    type: q.type
  }));

  const availableTargets = [
    ...questions.filter(q => q.id !== question.id).map(q => ({ id: q.id, title: q.title, type: 'question' })),
    ...endings.map(e => ({ id: e.id, title: e.title, type: 'ending' }))
  ];

  return (
    <div className="space-y-4">
      {logicRules.length === 0 && (
        <p className="text-sm text-crm-text-secondary">No conditional logic rules defined yet.</p>
      )}

      {logicRules.map((rule, index) => (
        <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-3 relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={() => removeRule(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <h4 className="font-medium text-sm mb-2">Rule {index + 1}</h4>

          {/* Condition */}
          <div>
            <Label htmlFor={`field-${index}`} className="text-xs">If this question's answer</Label>
            <Select
              value={rule.condition.operator}
              onValueChange={(value) => handleRuleChange(index, 'condition.operator', value)}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="not_equals">Does not equal</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="not_contains">Does not contain</SelectItem>
                <SelectItem value="greater_than">Greater than</SelectItem>
                <SelectItem value="less_than">Less than</SelectItem>
                {/* Add more operators as needed */}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`value-${index}`} className="text-xs">Value</Label>
            <Input
              id={`value-${index}`}
              value={rule.condition.value}
              onChange={(e) => handleRuleChange(index, 'condition.value', e.target.value)}
              className="mt-1"
              placeholder="Enter value"
            />
          </div>

          {/* Action */}
          <div>
            <Label htmlFor={`action-${index}`} className="text-xs">Then</Label>
            <Select
              value={rule.action}
              onValueChange={(value) => handleRuleChange(index, 'action', value)}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jump">Jump to</SelectItem>
                {/* Add more actions like show/hide field, set value etc. */}
              </SelectContent>
            </Select>
          </div>

          {rule.action === 'jump' && (
            <div>
              <Label htmlFor={`thenGoTo-${index}`} className="text-xs">Target</Label>
              <Select
                value={rule.thenGoTo}
                onValueChange={(value) => handleRuleChange(index, 'thenGoTo', value)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  {availableTargets.map(target => (
                    <SelectItem key={target.id} value={target.id}>
                      {target.title} ({target.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addRule} className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add Rule
      </Button>
    </div>
  );
}
