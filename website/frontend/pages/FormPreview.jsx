import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Type,
  ListOrdered,
  Minus,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Star,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNextQuestion, calculateLeadScore } from '@/utils/formLogicEngine';
import formsApi from '@/services/formsApi';

// Mock form data for demo purposes - in real app this would come from API
const mockForms = {
  '1': {
    id: '1',
    title: 'Customer Feedback Survey',
    description: 'We value your feedback! Please share your thoughts with us.',
    questions: [
      {
        id: '1',
        type: 'short-text',
        title: 'What is your name?',
        required: true,
        options: [],
        settings: {
          placeholder: 'Enter your full name'
        }
      },
      {
        id: '2',
        type: 'email',
        title: 'What is your email address?',
        required: true,
        options: [],
        settings: {
          placeholder: 'your.email@example.com'
        }
      },
      {
        id: '3',
        type: 'multiple-choice',
        title: 'How did you hear about us?',
        required: false,
        options: ['Google Search', 'Social Media', 'Friend Recommendation', 'Advertisement'],
        settings: {}
      },
      {
        id: '4',
        type: 'rating',
        title: 'How satisfied are you with our service?',
        required: true,
        options: [],
        settings: {}
      },
      {
        id: '5',
        type: 'long-text',
        title: 'What can we do to improve?',
        required: false,
        options: [],
        settings: {
          placeholder: 'Share your suggestions...'
        }
      }
    ]
  },
  '2': {
    id: '2',
    title: 'Lead Qualification Form',
    description: 'Help us understand your needs better.',
    questions: [
      {
        id: '1',
        type: 'short-text',
        title: 'Company Name',
        required: true,
        options: [],
        settings: {
          placeholder: 'Enter company name'
        }
      },
      {
        id: '2',
        type: 'number',
        title: 'Number of Employees',
        required: true,
        options: [],
        settings: {}
      },
      {
        id: '3',
        type: 'multiple-choice',
        title: 'What product are you interested in?',
        required: true,
        options: ['Service A', 'Service B', 'Service C', 'Not Sure'],
        settings: {}
      },
      {
        id: '4',
        type: 'short-text',
        title: 'What is your budget range?',
        required: false,
        options: [],
        settings: {
          placeholder: 'e.g., $10k - $50k'
        }
      }
    ]
  }
};

export default function FormPreview() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showDisqualified, setShowDisqualified] = useState(false);
  const [disqualificationReason, setDisqualificationReason] = useState('');
  const [leadScore, setLeadScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionHistory, setQuestionHistory] = useState([0]); // Track navigation history for back button

  useEffect(() => {
    // Fetch form from the API
    formsApi.getForm(formId)
      .then(formData => {
        // Parse questions if they're stored as JSON string
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
        setError(err);
        setLoading(false);
      });
  }, [formId]);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNextQuestion = () => {
    // Use conditional logic engine to determine next question
    const nextResult = getNextQuestion(currentQuestion, form.questions, responses);

    if (nextResult.action === 'disqualify') {
      // Show disqualification screen
      const currentQ = form.questions[currentQuestion];
      const reason = currentQ.disqualificationMessage || 'Unfortunately, you do not meet the criteria for this form.';
      setDisqualificationReason(reason);
      setShowDisqualified(true);
      return;
    }

    if (nextResult.nextIndex === -1 || nextResult.action === 'submit') {
      // Submit form
      handleSubmit();
      return;
    }

    // Update history and move to next question
    setQuestionHistory([...questionHistory, nextResult.nextIndex]);
    setCurrentQuestion(nextResult.nextIndex);
  };

  const handlePrevQuestion = () => {
    if (questionHistory.length > 1) {
      // Go back to previous question in history
      const newHistory = [...questionHistory];
      newHistory.pop(); // Remove current
      const prevIndex = newHistory[newHistory.length - 1];
      setQuestionHistory(newHistory);
      setCurrentQuestion(prevIndex);
    }
  };

  const handleSubmit = async () => {
    // Calculate lead score if applicable
    const scoreResult = calculateLeadScore(form.questions, responses);
    setLeadScore(scoreResult);

    try {
      // Submit to the API
      await formsApi.submitForm(form.id, {
        responses,
        metadata: {
          user_agent: navigator.userAgent,
          referrer: document.referrer
        }
      });

      console.log('Form submitted successfully:', {
        formId: form.id,
        responses,
        leadScore: scoreResult
      });

      setShowThankYou(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error submitting form: ${error.message}`);
    }
  };

  const handleRestart = () => {
    setResponses({});
    setCurrentQuestion(0);
    setShowThankYou(false);
    setShowDisqualified(false);
    setDisqualificationReason('');
    setLeadScore(null);
    setQuestionHistory([0]);
  };

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'short-text':
        return (
          <input
            type="text"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.settings.placeholder || 'Type your answer'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            required={question.required}
          />
        );
      
      case 'long-text':
        return (
          <textarea
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.settings.placeholder || 'Type your answer'}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            required={question.required}
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.settings.placeholder || 'your.email@example.com'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            required={question.required}
          />
        );
      
      case 'phone':
        return (
          <input
            type="tel"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.settings.placeholder || '(123) 456-7890'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            required={question.required}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            required={question.required}
          />
        );
      
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {question.options.map((option, idx) => (
              <label key={idx} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={responses[question.id] === option}
                  onChange={() => handleResponseChange(question.id, option)}
                  className="mr-3"
                  required={question.required && !responses[question.id]}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options.map((option, idx) => (
              <label key={idx} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={(responses[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = responses[question.id] || [];
                    let newValues;
                    if (e.target.checked) {
                      newValues = [...currentValues, option];
                    } else {
                      newValues = currentValues.filter(v => v !== option);
                    }
                    handleResponseChange(question.id, newValues);
                  }}
                  className="mr-3"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            required={question.required}
          />
        );
      
      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleResponseChange(question.id, star)}
                className={`text-2xl ${star <= (responses[question.id] || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            required={question.required}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-blue border-t-transparent"></div>
          <p className="text-crm-text-secondary">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-crm-text-primary mb-2">Error Loading Form</h2>
          <p className="text-crm-text-secondary mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-crm-text-primary mb-2">Form Not Found</h2>
          <p className="text-crm-text-secondary mb-4">The requested form could not be found.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (showDisqualified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-crm-text-primary mb-2">Not Qualified</h2>
          <p className="text-crm-text-secondary mb-6">
            {disqualificationReason}
          </p>
          <Button onClick={handleRestart} variant="outline" className="w-full">
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-crm-text-primary mb-2">Thank You!</h2>
          <p className="text-crm-text-secondary mb-4">
            Your responses have been recorded. We appreciate your feedback!
          </p>

          {leadScore && leadScore.total > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800 font-medium mb-2">Lead Score</div>
              <div className="text-3xl font-bold text-blue-600">{leadScore.total} points</div>
              {Object.keys(leadScore.breakdown).length > 0 && (
                <div className="mt-3 text-xs text-left space-y-1">
                  {Object.values(leadScore.breakdown).map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-crm-text-secondary">{item.title}</span>
                      <span className="text-blue-600 font-medium">+{item.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button onClick={handleRestart} className="w-full">
            Take Again
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = form.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-crm-text-primary">{form.title}</h1>
          <p className="text-crm-text-secondary mt-2">{form.description}</p>
        </div>

        {/* Question */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-crm-text-secondary mb-4">
              <span className="font-medium">Question {currentQuestion + 1}/{form.questions.length}</span>
              {currentQ.required && <span className="text-red-500">*</span>}
            </div>
            
            <h2 className="text-lg font-semibold text-crm-text-primary mb-4">
              {currentQ.title}
            </h2>
            
            <div className="mt-4">
              {renderQuestionInput(currentQ)}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handlePrevQuestion}
              disabled={questionHistory.length <= 1}
            >
              Back
            </Button>

            <Button
              onClick={handleNextQuestion}
              disabled={currentQ.required && !responses[currentQ.id] && responses[currentQ.id] !== 0}
            >
              {currentQuestion === form.questions.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-blue h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestion + 1) / form.questions.length) * 100}%` }}
              ></div>
            </div>
            <div className="text-right text-xs text-crm-text-secondary mt-1">
              {currentQuestion + 1} of {form.questions.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}