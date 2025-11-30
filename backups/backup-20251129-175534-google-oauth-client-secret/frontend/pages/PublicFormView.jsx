import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SequentialQuestion from '../components/SequentialQuestion';
import LegalFooter from '../components/LegalFooter';
import formsApi from '../services/formsApi';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function PublicFormView() {
  const { agencyAlias, formSlug } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPublishedForm();
  }, [agencyAlias, formSlug]);

  const loadPublishedForm = async () => {
    if (!agencyAlias || !formSlug) {
      setError('Invalid form URL');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await formsApi.getPublishedForm(agencyAlias, formSlug);

      if (response.success && response.form) {
        setForm(response.form);
        setError(null);
      } else {
        setError('Form not found');
      }
    } catch (err) {
      console.error('Error loading published form:', err);
      setError(err.message || 'Failed to load form. This form may not be published or may have been removed.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#3F0D28] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#3F0D28]/10 rounded-full">
              <AlertCircle className="h-6 w-6 text-[#3F0D28]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Form Not Found</h2>
          </div>
          <p className="text-gray-600 mb-6">
            {error || 'The form you are looking for does not exist or is no longer available.'}
          </p>
          <div className="text-sm text-gray-500">
            <p>Possible reasons:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The form has been unpublished</li>
              <li>The form has been deleted</li>
              <li>The URL is incorrect</li>
            </ul>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              If you believe this is an error, please contact the form owner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine if this is a sequential form
  const isSequential = form.settings?.mode === 'sequential';

  // If sequential, use SequentialQuestion component
  if (isSequential) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <SequentialQuestion form={form} isPublicView={true} />
        </div>
        {/* Legal Footer for Sequential Forms */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <LegalFooter
            variant="form"
            showBranding={form.settings?.share?.hideBranding !== true}
            showConsentText={true}
          />
        </div>
      </div>
    );
  }

  // Otherwise, render standard form view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r bg-[#3F0D28] px-8 py-6 text-white">
            {form.settings?.share?.showTitle !== false && (
              <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
            )}
            {form.description && (
              <p className="text-blue-100 text-lg">{form.description}</p>
            )}
          </div>

          {/* Form Body */}
          <div className="p-8">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const responses = {};

                form.questions.forEach((question) => {
                  const value = formData.get(question.id);
                  if (value !== null && value !== '') {
                    responses[question.id] = value;
                  }
                });

                try {
                  await formsApi.submitForm(form.id, {
                    responses,
                    metadata: {
                      referrer: document.referrer,
                      user_agent: navigator.userAgent
                    }
                  });

                  alert('Thank you for your submission!');
                  e.target.reset();
                } catch (err) {
                  alert('Failed to submit form: ' + err.message);
                }
              }}
            >
              <div className="space-y-6">
                {form.questions && form.questions.map((question, index) => (
                  <div key={question.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {question.title}
                      {question.required && <span className="text-[#3F0D28] ml-1">*</span>}
                    </label>

                    {question.description && (
                      <p className="text-sm text-gray-500">{question.description}</p>
                    )}

                    {/* Question input based on type */}
                    {question.type === 'short-text' && (
                      <input
                        type="text"
                        name={question.id}
                        required={question.required}
                        placeholder={question.placeholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}

                    {question.type === 'long-text' && (
                      <textarea
                        name={question.id}
                        required={question.required}
                        placeholder={question.placeholder}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}

                    {question.type === 'email' && (
                      <input
                        type="email"
                        name={question.id}
                        required={question.required}
                        placeholder={question.placeholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}

                    {question.type === 'phone' && (
                      <input
                        type="tel"
                        name={question.id}
                        required={question.required}
                        placeholder={question.placeholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}

                    {question.type === 'number' && (
                      <input
                        type="number"
                        name={question.id}
                        required={question.required}
                        placeholder={question.placeholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}

                    {question.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        {question.options && question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              required={question.required}
                              className="text-[#3F0D28] focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'checkboxes' && (
                      <div className="space-y-2">
                        {question.options && question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name={`${question.id}[]`}
                              value={option}
                              className="rounded text-[#3F0D28] focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'dropdown' && (
                      <select
                        name={question.id}
                        required={question.required}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select an option</option>
                        {question.options && question.options.map((option, optionIndex) => (
                          <option key={optionIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {question.type === 'date' && (
                      <input
                        type="date"
                        name={question.id}
                        required={question.required}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}

                    {question.type === 'rating' && (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <label key={rating} className="cursor-pointer">
                            <input
                              type="radio"
                              name={question.id}
                              value={rating}
                              required={question.required}
                              className="sr-only"
                            />
                            <div className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                              {rating}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#3F0D28] hover:bg-[#5a1a3a] text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>

          {/* Form Footer with Legal Links */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <LegalFooter
              variant="form"
              showBranding={form.settings?.share?.hideBranding !== true}
              showConsentText={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
