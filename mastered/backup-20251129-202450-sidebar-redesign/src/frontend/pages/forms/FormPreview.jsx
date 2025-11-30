import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Type,
  ListOrdered,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Star,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { calculateLeadScore } from '@/utils/formLogicEngine';
import formsApi from '@/services/formsApi';
import SequentialQuestion from '@components/SequentialQuestion';

export default function FormPreview() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [leadScore, setLeadScore] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const isUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  useEffect(() => {
    if (!formId) {
      setError('Form ID is missing.');
      setLoading(false);
      return;
    }

    if (formId === 'new' || !isUUID(formId)) {
      setError('Invalid Form ID. Please ensure the form is saved and you are using a valid link.');
      setLoading(false);
      return;
    }

    setLoading(true);
    formsApi.getForm(formId)
      .then(formData => {
        const parsedForm = {
          ...formData,
          questions: typeof formData.questions === 'string'
            ? JSON.parse(formData.questions)
            : formData.questions
        };
        setForm(parsedForm);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading form:', err);
        setError(`Failed to load form: ${err.message || 'Unknown error'}`);
        setLoading(false);
      });
  }, [formId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;

    setSubmitting(true);
    const scoreResult = calculateLeadScore(form.questions, responses);
    setLeadScore(scoreResult);

    try {
      await formsApi.submitForm(form.id, {
        responses,
        metadata: {
          user_agent: navigator.userAgent,
          referrer: document.referrer
        }
      });

      setShowThankYou(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error submitting form: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const renderQuestionInput = (question) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'short-text':
      case 'text':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'Type your answer...'}
            required={question.required}
            className="w-full"
          />
        );

      case 'long-text':
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'Type your answer...'}
            required={question.required}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'your@email.com'}
            required={question.required}
            className="w-full"
          />
        );

      case 'phone':
        return (
          <Input
            type="tel"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder || '(555) 123-4567'}
            required={question.required}
            className="w-full"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder || '0'}
            required={question.required}
            className="w-full"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            required={question.required}
            className="w-full"
          />
        );

      case 'dropdown':
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            required={question.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiple-choice':
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  required={question.required}
                  className="text-primary focus:ring-primary"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        const selectedValues = value ? (Array.isArray(value) ? value : [value]) : [];
        return (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    handleResponseChange(question.id, newValues);
                  }}
                  className="text-primary focus:ring-primary"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(question.id, rating)}
                className={`p-2 ${
                  value === rating
                    ? 'text-yellow-500'
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <Star className={`h-8 w-8 ${value === rating ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'Type your answer...'}
            required={question.required}
            className="w-full"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 text-lg">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-2xl">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Form</h2>
          <p className="text-gray-600 text-lg mb-2">{error}</p>
          <p className="text-gray-500">Please check the link and try again.</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-2xl">
          <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Form Not Found</h2>
          <p className="text-gray-600 text-lg mb-2">The requested form could not be found or does not exist.</p>
          <p className="text-gray-500">Please ensure the form ID is correct.</p>
        </div>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-2xl w-full">
          <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">Thank You!</h2>
          <p className="text-gray-600 text-lg mb-6">Your responses have been submitted successfully.</p>
          {leadScore && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Lead Score</p>
              <p className="text-2xl font-bold text-gray-800">{leadScore}</p>
            </div>
          )}
          <Button
            onClick={() => {
              setResponses({});
              setShowThankYou(false);
              setLeadScore(null);
            }}
            size="lg"
            className="px-8"
          >
            Submit Another Response
          </Button>
        </div>
      </div>
    );
  }

  // Check if form is in sequential mode
  const isSequentialMode = form.settings?.displayMode === 'sequential';

  // If sequential mode, use SequentialQuestion component
  if (isSequentialMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Form Header */}
            <div className="bg-white border-b border-gray-200 p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {form.title || 'Untitled Form'}
              </h1>
              {form.description && (
                <p className="text-gray-600">
                  {form.description}
                </p>
              )}
            </div>

            {/* Sequential Questions */}
            <div className="p-8">
              <SequentialQuestion
                questions={form.questions || []}
                responses={responses}
                setResponses={setResponses}
                onSubmit={handleSubmit}
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                isMeetingMode={false}
                showGrouped={false}
                showPrivacyNotice={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular mode - show all questions vertically stacked
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Form Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {form.title || 'Untitled Form'}
            </h1>
            {form.description && (
              <p className="text-lg text-gray-600">
                {form.description}
              </p>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {form.questions && form.questions.length > 0 ? (
                form.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="pb-8 border-b border-gray-200 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <Label className="text-lg font-semibold text-gray-900 mb-3 block">
                          {question.title || question.label || question.text}
                          {question.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        {question.description && (
                          <p className="text-sm text-gray-500 mb-4">
                            {question.description}
                          </p>
                        )}
                        <div className="mt-3">
                          {renderQuestionInput(question)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No questions available in this form.</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          {form.questions && form.questions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="max-w-4xl mx-auto flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className="px-12 py-6 text-lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Form'
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
