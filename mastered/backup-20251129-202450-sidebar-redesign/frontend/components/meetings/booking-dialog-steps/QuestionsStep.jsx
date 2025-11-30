import { useState } from "react";
import { MessageSquare, Plus, X, GripVertical, HelpCircle } from "lucide-react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Switch } from "../../ui/switch";
import { Button } from "../../ui/button";

export default function QuestionsStep({ formData, onChange, errors = {} }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.primaryQuestions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    handleFieldChange("primaryQuestions", updatedQuestions);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      type: "short-text",
      label: "",
      required: false,
      order: formData.primaryQuestions.length + 1,
    };
    handleFieldChange("primaryQuestions", [
      ...formData.primaryQuestions,
      newQuestion,
    ]);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = formData.primaryQuestions.filter(
      (_, i) => i !== index,
    );
    handleFieldChange("primaryQuestions", updatedQuestions);
  };

  const moveQuestion = (index, direction) => {
    const updatedQuestions = [...formData.primaryQuestions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < updatedQuestions.length) {
      [updatedQuestions[index], updatedQuestions[targetIndex]] = [
        updatedQuestions[targetIndex],
        updatedQuestions[index],
      ];
      handleFieldChange("primaryQuestions", updatedQuestions);
    }
  };

  const questionTypes = [
    { value: "short-text", label: "Short Text" },
    { value: "long-text", label: "Long Text" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "number", label: "Number" },
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "checkboxes", label: "Checkboxes" },
    { value: "date", label: "Date" },
    { value: "rating", label: "Rating" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Booking Questions
        </h3>

        <p className="text-sm text-gray-600">
          Add questions that will be asked when someone books this meeting.
        </p>

        {/* Questions List */}
        <div className="space-y-3">
          {formData.primaryQuestions?.map((question, index) => (
            <div
              key={question.id}
              className="border rounded-lg p-4 space-y-3 bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <span className="text-sm font-medium">
                    Question {index + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveQuestion(index, "up")}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveQuestion(index, "down")}
                    disabled={index === formData.primaryQuestions.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor={`question-type-${question.id}`}
                    className="text-sm font-medium"
                  >
                    Question Type
                  </Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) =>
                      handleQuestionChange(index, "type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor={`question-required-${question.id}`}
                    className="text-sm font-medium"
                  >
                    Required
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`question-required-${question.id}`}
                      checked={question.required}
                      onCheckedChange={(checked) =>
                        handleQuestionChange(index, "required", checked)
                      }
                    />
                    <Label
                      htmlFor={`question-required-${question.id}`}
                      className="text-sm"
                    >
                      {question.required ? "Yes" : "No"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor={`question-label-${question.id}`}
                  className="text-sm font-medium"
                >
                  Question Text *
                </Label>
                <Input
                  id={`question-label-${question.id}`}
                  value={question.label}
                  onChange={(e) =>
                    handleQuestionChange(index, "label", e.target.value)
                  }
                  placeholder="e.g., What's your name?"
                  className={
                    errors[`question_${index}_label`] ? "border-red-500" : ""
                  }
                />
                {errors[`question_${index}_label`] && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" />
                    {errors[`question_${index}_label`]}
                  </p>
                )}
              </div>

              {/* Conditional options for multiple choice */}
              {question.type === "multiple-choice" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Options</Label>
                  <Textarea
                    value={question.options?.join("\n") || ""}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "options",
                        e.target.value.split("\n").filter((opt) => opt.trim()),
                      )
                    }
                    placeholder="Option 1\nOption 2\nOption 3"
                    rows={3}
                  />
                </div>
              )}

              {/* Placeholder for different question types */}
              <div className="space-y-2">
                <Label
                  htmlFor={`question-placeholder-${question.id}`}
                  className="text-sm font-medium"
                >
                  Placeholder Text
                </Label>
                <Input
                  id={`question-placeholder-${question.id}`}
                  value={question.placeholder || ""}
                  onChange={(e) =>
                    handleQuestionChange(index, "placeholder", e.target.value)
                  }
                  placeholder="e.g., Enter your name"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add Question Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>

        {/* Default Questions Info */}
        <div className="bg-blue-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Default Questions</h4>
          <p className="text-sm text-blue-700">
            By default, we include Name and Email questions for all booking
            links. You can customize these or add additional questions as
            needed.
          </p>
        </div>
      </div>
    </div>
  );
}
