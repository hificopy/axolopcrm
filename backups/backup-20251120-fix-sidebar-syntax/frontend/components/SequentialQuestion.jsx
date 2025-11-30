import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  User,
  Building,
  Globe,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AutoCapturePrivacyNotice from '@/components/AutoCapturePrivacyNotice';

/**
 * Shared Sequential Question Component for both Forms and Meetings
 * Implements Typeform-style one-question-at-a-time flow for better conversions
 */
const SequentialQuestion = ({
  questions = [],
  responses = {},
  setResponses = () => {},
  onSubmit = () => {},
  onBack = () => {},
  currentQuestionIndex = 0,
  setCurrentQuestionIndex = () => {},
  isMeetingMode = false, // Set to true for meetings, false for forms
  theme = 'light',
  brandColorPrimary = '#7b1c14',
  brandColorSecondary = '#4a0f0a',
  useGradient = true,
  fontColor = '#1F2A37',
  headerBackground = null,
  // Optional callback for response changes (for auto-save in meetings)
  onResponseChange = null,
  showGrouped = false, // When true, show all questions in the group instead of one at a time
  showPrivacyNotice = true, // Show auto-capture privacy notice
  showProgress = true, // Show progress indicator (question bar)
  showTopBorder = true, // Show top border
}) => {
  const [localResponses, setLocalResponses] = useState(responses);
  const [localCurrentIndex, setLocalCurrentIndex] = useState(currentQuestionIndex);

  // Update local state when props change
  useEffect(() => {
    setLocalResponses(responses);
  }, [responses]);

  useEffect(() => {
    setLocalCurrentIndex(currentQuestionIndex);
  }, [currentQuestionIndex]);

  const currentQuestion = questions[localCurrentIndex];

  // Generate gradient or solid background
  const getHeaderBackground = () => {
    if (headerBackground) return headerBackground;
    return useGradient
      ? `linear-gradient(135deg, ${brandColorPrimary} 0%, ${brandColorSecondary} 100%)`
      : brandColorPrimary;
  };

  // Validation functions for specific field types
  const validateField = (fieldType, value) => {
    if (!value) return { isValid: true, errorMessage: null }; // Empty values are valid if not required

    switch (fieldType) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: emailRegex.test(value),
          errorMessage: emailRegex.test(value) ? null : 'Please enter a valid email address'
        };
      }

      case 'number': {
        const numberRegex = /^-?\d+\.?\d*$/; // Allow negative numbers and decimals
        return {
          isValid: numberRegex.test(value),
          errorMessage: numberRegex.test(value) ? null : 'Please enter a valid number'
        };
      }

      case 'tel':
      case 'phone': {
        // Simple phone validation: allow digits, spaces, parentheses, hyphens, and plus signs
        const phoneRegex = /^[+]?[0-9\s\-()]+$/;
        return {
          isValid: phoneRegex.test(value),
          errorMessage: phoneRegex.test(value) ? null : 'Please enter a valid phone number'
        };
      }

      case 'website':
      case 'url': {
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return {
          isValid: urlRegex.test(value),
          errorMessage: urlRegex.test(value) ? null : 'Please enter a valid URL'
        };
      }

      default:
        return { isValid: true, errorMessage: null };
    }
  };

  // Handle response change and notify parent
  const handleResponseChange = (questionId, value) => {
    // Validate the field before saving if it's not empty
    const question = questions.find(q => q.field === questionId || q.id === questionId);
    const validation = validateField(question?.type, value);

    if (!validation.isValid) {
      // Handle validation error - for now, we'll log it or could show an error
      console.warn(`Validation failed for ${questionId}: ${validation.errorMessage}`);
    }

    const newResponses = { ...localResponses, [questionId]: value };
    setLocalResponses(newResponses);

    // If onResponseChange is provided, use it instead of setResponses
    if (onResponseChange) {
      onResponseChange(questionId, value);
    } else {
      setResponses(newResponses);
    }
  };

  // Handle Enter key press to continue to next question
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if in a form context

      // Only proceed if the current question is answered
      if (isCurrentQuestionAnswered()) {
        handleNext();
      }
    }
  };

  const handleNext = () => {
    if (localCurrentIndex < questions.length - 1) {
      const newIndex = localCurrentIndex + 1;
      setLocalCurrentIndex(newIndex);
      setCurrentQuestionIndex(newIndex);
    } else {
      onSubmit();
    }
  };

  const handlePrevious = () => {
    if (localCurrentIndex > 0) {
      const newIndex = localCurrentIndex - 1;
      setLocalCurrentIndex(newIndex);
      setCurrentQuestionIndex(newIndex);
    } else {
      onBack();
    }
  };

  // Check if current question is answered (required validation)
  const isCurrentQuestionAnswered = () => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;

    const response = localResponses[currentQuestion.field || currentQuestion.id];
    if (response === undefined || response === null || response === '') return false;

    // For checkboxes, check if any option is selected
    if (Array.isArray(response)) return response.length > 0;

    const responseStr = response.toString().trim();
    if (responseStr === '') return false;

    // Additional validation for specific field types
    // If the field has content, validate its format
    const validation = validateField(currentQuestion.type, responseStr);
    return validation.isValid;
  };

  // Render question input based on type
  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'textarea':
        return (
          <Textarea
            placeholder={question.settings?.placeholder || `Enter ${question.title.toLowerCase()}`}
            value={localResponses[question.field || question.id] || ''}
            onChange={(e) => handleResponseChange(question.field || question.id, e.target.value)}
            onKeyDown={handleKeyPress}
            className="mt-2 text-base"
            rows={4}
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827'),
            }}
          />
        );

      case 'short-text':
      case 'text':
        return (
          <Input
            type="text"
            placeholder={question.settings?.placeholder || `Enter ${question.title.toLowerCase()}`}
            value={localResponses[question.field || question.id] || ''}
            onChange={(e) => handleResponseChange(question.field || question.id, e.target.value)}
            onKeyDown={handleKeyPress}
            className="mt-2 text-base py-3 px-4 rounded-lg"
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827'),
            }}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            placeholder={question.settings?.placeholder || 'your.email@example.com'}
            value={localResponses[question.field || question.id] || ''}
            onChange={(e) => handleResponseChange(question.field || question.id, e.target.value)}
            onKeyDown={handleKeyPress}
            className="mt-2 text-base py-3 px-4 rounded-lg"
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827'),
            }}
          />
        );

      case 'phone':
        return (
          <Input
            type="tel"
            placeholder={question.settings?.placeholder || '(123) 456-7890'}
            value={localResponses[question.field || question.id] || ''}
            onChange={(e) => handleResponseChange(question.field || question.id, e.target.value)}
            onKeyDown={handleKeyPress}
            className="mt-2 text-base py-3 px-4 rounded-lg"
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827'),
            }}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={localResponses[question.field || question.id] || ''}
            onChange={(e) => handleResponseChange(question.field || question.id, e.target.value)}
            onKeyDown={handleKeyPress}
            className="mt-2 text-base py-3 px-4 rounded-lg"
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827'),
            }}
          />
        );
      
      case 'multiple-choice':
        return (
          <div className="space-y-3 mt-4">
            {question.options?.map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  handleResponseChange(question.field || question.id, option);
                  // If this is the last question, go to next automatically
                  if (localCurrentIndex === questions.length - 1) {
                    setTimeout(handleNext, 300);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleResponseChange(question.field || question.id, option);
                    // If this is the last question, go to next automatically
                    if (localCurrentIndex === questions.length - 1) {
                      setTimeout(handleNext, 300);
                    }
                  }
                }}
                tabIndex={0} // Make the button focusable for keyboard navigation
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  localResponses[question.field || question.id] === option
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-200 hover:border-teal-300'
                }`}
                style={{
                  borderColor: localResponses[question.field || question.id] === option
                    ? brandColorPrimary
                    : (theme === 'dark' ? '#374151' : '#E5E7EB'),
                  backgroundColor: localResponses[question.field || question.id] === option
                    ? `${brandColorPrimary}10`
                    : (theme === 'dark' ? '#1F2937' : '#FFFFFF'),
                  color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827'),
                }}
              >
                <div className="font-medium" style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}>
                  {option}
                </div>
              </button>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3 mt-4">
            {question.options?.map((option, idx) => (
              <label
                key={idx}
                className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent default form submission
                    const currentValues = localResponses[question.field || question.id] || [];
                    let newValues;
                    const optionExists = currentValues.includes(option);
                    if (!optionExists) {
                      newValues = [...currentValues, option];
                    } else {
                      newValues = currentValues.filter(v => v !== option);
                    }
                    handleResponseChange(question.field || question.id, newValues);
                  }
                }}
                tabIndex={0} // Make the label focusable for keyboard navigation
                style={{
                  borderColor: localResponses[question.field || question.id]?.includes(option)
                    ? brandColorPrimary
                    : (theme === 'dark' ? '#374151' : '#E5E7EB'),
                  backgroundColor: localResponses[question.field || question.id]?.includes(option)
                    ? `${brandColorPrimary}10`
                    : (theme === 'dark' ? '#1F2937' : '#FFFFFF'),
                }}
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={localResponses[question.field || question.id]?.includes(option) || false}
                  onChange={(e) => {
                    const currentValues = localResponses[question.field || question.id] || [];
                    let newValues;
                    if (e.target.checked) {
                      newValues = [...currentValues, option];
                    } else {
                      newValues = currentValues.filter(v => v !== option);
                    }
                    handleResponseChange(question.field || question.id, newValues);
                  }}
                  className="mr-3 h-4 w-4"
                  style={{ color: brandColorPrimary }}
                />
                <span
                  className="font-medium"
                  style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}
                >
                  {option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={localResponses[question.field || question.id] || ''}
            onChange={(e) => handleResponseChange(question.field || question.id, e.target.value)}
            onKeyDown={handleKeyPress}
            className="mt-2 text-base py-3 px-4 rounded-lg"
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827'),
            }}
          />
        );

      case 'rating':
        return (
          <div className="flex gap-2 mt-4 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleResponseChange(question.field || question.id, star)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleResponseChange(question.field || question.id, star);
                  }
                }}
                tabIndex={0} // Make the button focusable for keyboard navigation
                className="text-4xl focus:outline-none"
                style={{ color: star <= (localResponses[question.field || question.id] || 0) ? 'yellow' : (theme === 'dark' ? '#6B7280' : '#D1D5DB') }}
              >
                ★
              </button>
            ))}
          </div>
        );

      default:
        return (
          <Input
            type="text"
            placeholder={question.settings?.placeholder || `Enter ${question.title.toLowerCase()}`}
            value={localResponses[question.field || question.id] || ''}
            onChange={(e) => handleResponseChange(question.field || question.id, e.target.value)}
            onKeyDown={handleKeyPress}
            className="mt-2 text-base py-3 px-4 rounded-lg"
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827'),
            }}
          />
        );
    }
  };

  // Get icon based on question type
  const getIconForType = (type) => {
    const icons = {
      text: User,
      'short-text': User,
      email: Mail,
      tel: Phone,
      phone: Phone,
      number: DollarSign,
      company: Building,
      website: Globe,
      'long-text': MessageSquare,
      'multiple-choice': ListOrdered,
      checkboxes: ListOrdered,
      date: Calendar,
      rating: Star,
    };
    return icons[type] || Type;
  };

  // Animation variants for question transitions
  const questionVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  if (showGrouped) {
    // Show all questions in the group on one screen
    return (
      <div className={`pt-4 ${showTopBorder ? 'border-t' : ''} space-y-6 min-h-[300px]`} style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs" style={{ color: fontColor || (theme === 'dark' ? '#9CA3AF' : '#6B7280') }}>
            <span>Primary Information</span>
            <span>{Math.round((questions.length / questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: getHeaderBackground() }}
              initial={{ width: 0 }}
              animate={{ width: '100%' }} // Always show as complete for grouped view
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Grouped Questions */}
        <div className="space-y-6">
          {questions.map((question, index) => {
            const Icon = getIconForType(question.type);
            return (
              <div key={question.field || question.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-teal-50 rounded-xl flex-shrink-0">
                    <Icon className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <label
                      className="block text-sm font-medium"
                      style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}
                    >
                      {question.title}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderQuestionInput(question)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={onSubmit} // Use onSubmit to move to next section
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !(!questions.every(q => {
                const response = localResponses[q.field || q.id];
                if (!q.required) return true;  // Not required, so valid
                if (response === undefined || response === null || response === '') return false;
                if (Array.isArray(response)) return response.length > 0;

                const responseStr = response.toString().trim();
                if (responseStr === '') return false;

                // Additional validation for specific field types
                const validation = validateField(q.type, responseStr);
                return validation.isValid;
              }))) {
                onSubmit();
              }
            }}
            disabled={!questions.every(q => {
              const response = localResponses[q.field || q.id];
              if (!q.required) return true;  // Not required, so valid
              if (response === undefined || response === null || response === '') return false;
              if (Array.isArray(response)) return response.length > 0;

              const responseStr = response.toString().trim();
              if (responseStr === '') return false;

              // Additional validation for specific field types
              const validation = validateField(q.type, responseStr);
              return validation.isValid;
            })}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: getHeaderBackground(),
            }}
            tabIndex={0}
          >
            Continue to Calendar
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Back button for grouped view */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium underline"
            style={{ color: brandColorPrimary }}
          >
            Back
          </button>
        </div>
      </div>
    );
  } else {
    // Show one question at a time (current sequential behavior)
    if (!currentQuestion) return null;

    const Icon = getIconForType(currentQuestion.type);

    return (
      <div className={`pt-4 ${showTopBorder ? 'border-t' : ''} space-y-6 min-h-[300px]`} style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
        {/* Progress Indicator - can be made optional */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs" style={{ color: fontColor || (theme === 'dark' ? '#9CA3AF' : '#6B7280') }}>
              <span>Question {localCurrentIndex + 1} of {questions.length}</span>
              <span>{Math.round(((localCurrentIndex + 1) / questions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: getHeaderBackground() }}
                initial={{ width: 0 }}
                animate={{ width: `${((localCurrentIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Privacy Notice - Show on first question */}
        {showPrivacyNotice && localCurrentIndex === 0 && (
          <AutoCapturePrivacyNotice className="mb-4" />
        )}

        {/* Sequential Question */}
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={localCurrentIndex}
            custom={1}
            variants={questionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-3 bg-teal-50 rounded-xl flex-shrink-0">
                <Icon className="h-6 w-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <h4
                  className="text-2xl font-bold"
                  style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}
                >
                  {currentQuestion.title}
                  {currentQuestion.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h4>
                {renderQuestionInput(currentQuestion)}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={localCurrentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              color: brandColorPrimary,
              border: `1px solid ${brandColorPrimary}40`,
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isCurrentQuestionAnswered()) {
                handleNext();
              }
            }}
            disabled={!isCurrentQuestionAnswered()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: getHeaderBackground(),
            }}
            tabIndex={0}
          >
            {localCurrentIndex < questions.length - 1 ? (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                {isMeetingMode ? 'Continue to Calendar' : 'Submit Form'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Keyboard hint for form mode */}
        {currentQuestion.type !== 'multiple-choice' && !isMeetingMode && (
          <div className="text-center mt-4 text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded">Enter ↵</kbd> to continue
          </div>
        )}
      </div>
    );
  }
};

export default SequentialQuestion;