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
import SequentialQuestion from '@/components/SequentialQuestion';
import { useAutoCapture } from '@/hooks/useAutoCapture';

export default function FormPreview() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionHistory, setQuestionHistory] = useState([0]);
  const [draftLeadId, setDraftLeadId] = useState(null); // Assuming it might be set later
  const [leadScore, setLeadScore] = useState(null);
  const [disqualificationReason, setDisqualificationReason] = useState('');
  const [showDisqualified, setShowDisqualified] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const isUUID = (uuid) => {
    // Regex to check if string is a valid UUID (v4)
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
  }, [formId]); // Removed `loading` from dependencies to prevent infinite loop.

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNextQuestion = () => {
    if (!form) return;
    const nextResult = getNextQuestion(currentQuestion, form.questions, responses);

    if (nextResult.action === 'disqualify') {
      const currentQ = form.questions[currentQuestion];
      const reason = currentQ.disqualificationMessage || 'Unfortunately, you do not meet the criteria for this form.';
      setDisqualificationReason(reason);
      setShowDisqualified(true);
      return;
    }

    if (nextResult.nextIndex === -1 || nextResult.action === 'submit') {
      handleSubmit();
      return;
    }

    setQuestionHistory([...questionHistory, nextResult.nextIndex]);
    setCurrentQuestion(nextResult.nextIndex);
  };

  const handlePrevQuestion = () => {
    if (questionHistory.length > 1) {
      const newHistory = [...questionHistory];
      newHistory.pop();
      const prevIndex = newHistory[newHistory.length - 1];
      setQuestionHistory(newHistory);
      setCurrentQuestion(prevIndex);
    }
  };

  const handleSubmit = async () => {
    if (!form) return;
    const scoreResult = calculateLeadScore(form.questions, responses);
    setLeadScore(scoreResult);

    try {
      await formsApi.submitForm(form.id, {
        responses,
        draftLeadId,
        metadata: {
          user_agent: navigator.userAgent,
          referrer: document.referrer
        }
      });

      console.warn('Form submitted successfully:', {
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
    // ... (existing renderQuestionInput content)
  };

  // Consolidated rendering logic for loading, error, and form not found states
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <svg className="animate-spin h-8 w-8 text-crm-accent mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-crm-text-secondary">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Form</h2>
          <p className="text-crm-text-secondary mb-4">{error}</p>
          <p className="text-crm-text-secondary">Please check the link and try again.</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold text-crm-text-primary mb-2">Form Not Found</h2>
          <p className="text-crm-text-secondary mb-4">The requested form could not be found or does not exist.</p>
          <p className="text-crm-text-secondary">Please ensure the form ID is correct.</p>
        </div>
      </div>
    );
  }

  // The rest of your component's rendering logic follows here
  // (showDisqualified, showThankYou, and actual form rendering)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
        {showDisqualified ? (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Disqualified</h2>
            <p className="text-crm-text-secondary mb-4">{disqualificationReason}</p>
            <Button onClick={handleRestart}>Restart Form</Button>
          </div>
        ) : showThankYou ? (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h2>
            <p className="text-crm-text-secondary mb-4">Your responses have been submitted.</p>
            {leadScore && (
              <p className="text-sm text-crm-text-secondary mb-4">Lead Score: {leadScore}</p>
            )}
            <Button onClick={handleRestart}>Start New Form</Button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-crm-text-primary mb-6">{form.name}</h2>
            {form.description && (
              <p className="text-crm-text-secondary mb-6">{form.description}</p>
            )}
            <SequentialQuestion
              questions={form.questions || []}
              responses={responses}
              setResponses={setResponses}
              onSubmit={handleNextQuestion}
              onBack={handlePrevQuestion}
              currentQuestionIndex={currentQuestion}
              setCurrentQuestionIndex={setCurrentQuestion}
              theme="light"
              brandColorPrimary={form.settings?.brandColor || "#0d9488"}
              brandColorSecondary={form.settings?.accentColor || "#0f766e"}
              useGradient={form.settings?.useGradient || false}
              fontColor={form.settings?.fontColor || "#111827"}
              headerBackground={form.settings?.headerBackground || "#0d9488"}
              onResponseChange={handleResponseChange}
              showGrouped={form.settings?.showGrouped || false}
            />
          </div>
        )}
      </div>
    </div>
  );
}