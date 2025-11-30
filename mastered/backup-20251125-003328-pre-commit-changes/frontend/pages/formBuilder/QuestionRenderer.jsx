import React from 'react';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Checkbox } from './components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Label } from './components/ui/label';
import { Calendar } from './components/ui/calendar';
import { Star } from 'lucide-react';

export default function QuestionRenderer({ question, value, onChange }) {
  if (!question) {
    return <p className="text-crm-text-secondary">Select a question to preview its input.</p>;
  }

  const commonProps = {
    id: question.id,
    name: question.id,
    value: value || '',
    onChange: (e) => onChange(e.target.value),
    placeholder: question.settings?.placeholder || '',
    required: question.required,
    className: 'mt-1',
  };

  switch (question.type) {
    case 'short-text':
      return <Input type="text" {...commonProps} />;
    case 'long-text':
      return <Textarea {...commonProps} />;
    case 'email':
      return <Input type="email" {...commonProps} />;
    case 'phone':
      return <Input type="tel" {...commonProps} />;
    case 'number':
      return <Input type="number" {...commonProps} />;
    case 'multiple-choice':
      return (
        <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${question.id}-${index}`} />
              <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    case 'checkboxes': {
      // For checkboxes, value should be an array
      const selectedCheckboxes = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`${question.id}-${index}`}
                checked={selectedCheckboxes.includes(option)}
                onCheckedChange={(checked) => {
                  const newSelection = checked
                    ? [...selectedCheckboxes, option]
                    : selectedCheckboxes.filter((item) => item !== option);
                  onChange(newSelection);
                }}
              />
              <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
            </div>
          ))}
        </div>
      );
    }
    case 'date':
      return (
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => onChange(date ? date.toISOString() : '')}
          className="rounded-md border shadow"
        />
      );
    case 'rating': {
      const rating = parseInt(value) || 0;
      return (
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((starValue) => (
            <Star
              key={starValue}
              className={`h-6 w-6 cursor-pointer ${
                starValue <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
              onClick={() => onChange(starValue.toString())}
            />
          ))}
        </div>
      );
    }
    case 'file-upload':
      return (
        <Input
          type="file"
          {...commonProps}
          onChange={(e) => onChange(e.target.files[0])} // Pass the file object
        />
      );
    default:
      return <p className="text-red-500">Unknown question type: {question.type}</p>;
  }
}
