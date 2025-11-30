import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone, Video, User, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import SequentialQuestion from '../SequentialQuestion';

/**
 * Fully Functional Booking Link Live Preview Component
 * Interactive preview that works exactly like the final booking page
 * Supports Sequential Questions (Typeform-style) for 30% more conversions
 */
export default function BookingLinkPreview({ formData }) {
  const {
    name,
    description,
    duration,
    locationType,
    theme,
    brandColorPrimary,
    brandColorSecondary,
    useGradient,
    schedulerBackground,
    fontColor,
    primaryQuestions = [],
    secondaryQuestions = [],
    useSequentialQuestions = true, // Default to true for better conversions
  } = formData;

  // Preview state
  const [previewStep, setPreviewStep] = useState('primary_questions'); // 'primary_questions', 'secondary_questions', 'calendar', 'confirmation'
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formResponses, setFormResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // For sequential questions
  const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' or 'mobile'
  const [primaryQuestionsCompleted, setPrimaryQuestionsCompleted] = useState(false);

  // Separate primary and secondary questions
  const allQuestions = [...primaryQuestions, ...secondaryQuestions];

  // Generate gradient or solid background
  const headerBackground = useGradient
    ? `linear-gradient(135deg, ${brandColorPrimary} 0%, ${brandColorSecondary} 100%)`
    : brandColorPrimary;

  // Get location icon
  const getLocationIcon = () => {
    switch (locationType) {
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'zoom':
      case 'google_meet':
        return <Video className="h-4 w-4" />;
      case 'in_person':
        return <MapPin className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  // Get location text
  const getLocationText = () => {
    switch (locationType) {
      case 'phone':
        return 'Phone Call';
      case 'zoom':
        return 'Zoom Meeting';
      case 'google_meet':
        return 'Google Meet';
      case 'in_person':
        return 'In Person';
      default:
        return 'To be determined';
    }
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  // Generate sample time slots
  const generateTimeSlots = () => {
    const times = [];
    for (let hour = 9; hour <= 17; hour++) {
      times.push(`${hour}:00 ${hour < 12 ? 'AM' : 'PM'}`);
      if (hour < 17) {
        times.push(`${hour}:30 ${hour < 12 ? 'AM' : 'PM'}`);
      }
    }
    return times;
  };

  const calendarDays = generateCalendarDays();
  const timeSlots = generateTimeSlots();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Handle month navigation
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Check if primary questions are answered
  const arePrimaryQuestionsAnswered = () => {
    const requiredPrimary = primaryQuestions.filter(q => q.required);
    return requiredPrimary.every(q => formResponses[q.id] && formResponses[q.id].trim() !== '');
  };

  // Check if all secondary questions are answered
  const areSecondaryQuestionsAnswered = () => {
    const requiredSecondary = secondaryQuestions.filter(q => q.required);
    return requiredSecondary.every(q => formResponses[q.id] && formResponses[q.id].trim() !== '');
  };

  // Check if all questions are answered
  const areAllQuestionsAnswered = () => {
    return arePrimaryQuestionsAnswered() && areSecondaryQuestionsAnswered();
  };

  // Check if current question is answered (for sequential)
  const isCurrentQuestionAnswered = () => {
    if (!useSequentialQuestions) return true;

    const currentQuestions = previewStep === 'primary_questions' ? primaryQuestions : secondaryQuestions;
    if (currentQuestions.length === 0) return true;

    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;
    return formResponses[currentQuestion.id] && formResponses[currentQuestion.id].trim() !== '';
  };

  // Handle next question in sequential mode
  const handleNextQuestion = () => {
    if (previewStep === 'primary_questions') {
      if (currentQuestionIndex < primaryQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Primary questions completed
        setPrimaryQuestionsCompleted(true);
        if (secondaryQuestions.length > 0) {
          setPreviewStep('secondary_questions');
          setCurrentQuestionIndex(0);
        } else {
          setPreviewStep('calendar');
        }
      }
    } else if (previewStep === 'secondary_questions') {
      if (currentQuestionIndex < secondaryQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // All questions answered, move to calendar
        setPreviewStep('calendar');
      }
    }
  };

  // Handle previous question in sequential mode
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (previewStep === 'secondary_questions') {
      // Go back to primary questions
      setPreviewStep('primary_questions');
      setCurrentQuestionIndex(primaryQuestions.length - 1);
    }
  };

  // Handle continue from primary questions (non-sequential mode)
  const handleContinueFromPrimary = () => {
    setPrimaryQuestionsCompleted(true);
    if (secondaryQuestions.length > 0) {
      setPreviewStep('secondary_questions');
    } else {
      setPreviewStep('calendar');
    }
  };

  // Handle continue from secondary questions (non-sequential mode)
  const handleContinueFromSecondary = () => {
    setPreviewStep('calendar');
  };

  // Render question input based on type
  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'textarea':
        return (
          <Textarea
            placeholder={`Enter ${question.label.toLowerCase()}`}
            value={formResponses[question.id] || ''}
            onChange={(e) => setFormResponses({ ...formResponses, [question.id]: e.target.value })}
            className="mt-2 text-base"
            rows={4}
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827'),
            }}
          />
        );
      default:
        return (
          <Input
            type={question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 'text'}
            placeholder={`Enter ${question.label.toLowerCase()}`}
            value={formResponses[question.id] || ''}
            onChange={(e) => setFormResponses({ ...formResponses, [question.id]: e.target.value })}
            className="mt-2 text-base"
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827'),
            }}
          />
        );
    }
  };

  // Sequential question animation variants
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

  return (
    <div className="space-y-3 w-full">
      {/* Preview Mode Toggle */}
      <div className="flex justify-center mb-3">
        <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
          <button
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              previewMode === 'desktop'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setPreviewMode('desktop')}
          >
            Desktop
          </button>
          <div className="w-px h-6 bg-gray-300"></div>
          <button
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              previewMode === 'mobile'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setPreviewMode('mobile')}
          >
            Mobile
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div
        className={`border rounded-lg shadow-xl overflow-hidden ${
          previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full max-w-full'
        } ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
        style={{
          backgroundColor: theme === 'dark' ? '#1F2937' : schedulerBackground || '#FFFFFF',
          minWidth: '320px',
          maxWidth: '100%',
        }}
      >
        {/* Header */}
        <div
          className="p-6 text-white"
          style={{
            background: headerBackground,
          }}
        >
          <h3 className="text-xl font-bold mb-2">
            {name || 'Untitled Event'}
          </h3>
          {description && (
            <p className="text-sm opacity-90">{description}</p>
          )}
        </div>

        {/* Content - Split layout for desktop */}
        <div className={`${previewMode === 'desktop' ? 'flex min-h-[600px]' : ''}`}>
          {/* Left Pane - Form and Event Details */}
          <div className={`${previewMode === 'desktop' ? 'w-1/2 border-r' : 'w-full'} p-4 sm:p-6 space-y-4`} style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
          {/* Event Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColorPrimary}20` }}
              >
                <Clock
                  className="h-4 w-4"
                  style={{ color: brandColorPrimary }}
                />
              </div>
              <span style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}>
                {duration} minutes
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${brandColorPrimary}20` }}
              >
                <div style={{ color: brandColorPrimary }}>
                  {getLocationIcon()}
                </div>
              </div>
              <span style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}>
                {getLocationText()}
              </span>
            </div>

            {formData.hosts && formData.hosts.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${brandColorPrimary}20` }}
                >
                  <User
                    className="h-4 w-4"
                    style={{ color: brandColorPrimary }}
                  />
                </div>
                <span style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}>
                  {formData.hosts.length} host{formData.hosts.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Primary Questions Step - SEQUENTIAL MODE */}
          {previewStep === 'primary_questions' && useSequentialQuestions && primaryQuestions.length > 0 && (
            <SequentialQuestion
              questions={primaryQuestions.map(q => ({
                ...q,
                title: q.label,
                type: q.fieldType || q.type,
                settings: { placeholder: q.placeholder }
              }))}
              responses={formResponses}
              setResponses={setFormResponses}
              onSubmit={handleNextQuestion}
              onBack={handlePreviousQuestion}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              isMeetingMode={true}
              theme={theme}
              brandColorPrimary={brandColorPrimary}
              brandColorSecondary={brandColorSecondary}
              useGradient={useGradient}
              fontColor={fontColor}
              headerBackground={headerBackground}
              onResponseChange={(field, value) => {
                setFormResponses(prev => ({ ...prev, [field]: value }));
              }}
            />
          )}

          {/* Primary Questions Step - STANDARD MODE */}
          {previewStep === 'primary_questions' && !useSequentialQuestions && primaryQuestions.length > 0 && (
            <div className="pt-4 border-t space-y-4" style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
              <h4
                className="text-base font-semibold"
                style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}
              >
                Primary Questions
              </h4>

              {primaryQuestions.map((question) => (
                <div key={question.id}>
                  <label
                    className="text-sm font-medium"
                    style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}
                  >
                    {question.label}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderQuestionInput(question)}
                </div>
              ))}

              <button
                type="button"
                className="w-full py-3 px-4 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  background: headerBackground,
                }}
                disabled={!arePrimaryQuestionsAnswered()}
                onClick={handleContinueFromPrimary}
              >
                Continue
              </button>
            </div>
          )}

          {/* Secondary Questions Step - SEQUENTIAL MODE */}
          {previewStep === 'secondary_questions' && useSequentialQuestions && secondaryQuestions.length > 0 && (
            <SequentialQuestion
              questions={secondaryQuestions.map(q => ({
                ...q,
                title: q.label,
                type: q.fieldType || q.type,
                settings: { placeholder: q.placeholder }
              }))}
              responses={formResponses}
              setResponses={setFormResponses}
              onSubmit={handleNextQuestion}
              onBack={handlePreviousQuestion}
              currentQuestionIndex={currentQuestionIndex}
              setCurrentQuestionIndex={setCurrentQuestionIndex}
              isMeetingMode={true}
              theme={theme}
              brandColorPrimary={brandColorPrimary}
              brandColorSecondary={brandColorSecondary}
              useGradient={useGradient}
              fontColor={fontColor}
              headerBackground={headerBackground}
              onResponseChange={(field, value) => {
                setFormResponses(prev => ({ ...prev, [field]: value }));
              }}
            />
          )}

          {/* Secondary Questions Step - STANDARD MODE */}
          {previewStep === 'secondary_questions' && !useSequentialQuestions && secondaryQuestions.length > 0 && (
            <div className="pt-4 border-t space-y-4" style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
              <button
                onClick={() => {
                  setPreviewStep('primary_questions');
                  setCurrentQuestionIndex(0);
                }}
                className="flex items-center gap-2 text-sm mb-2"
                style={{ color: brandColorPrimary }}
              >
                <ChevronLeft className="h-4 w-4" />
                Back to primary questions
              </button>

              <h4
                className="text-base font-semibold"
                style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}
              >
                Additional Information
              </h4>

              {secondaryQuestions.map((question) => (
                <div key={question.id}>
                  <label
                    className="text-sm font-medium"
                    style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}
                  >
                    {question.label}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderQuestionInput(question)}
                </div>
              ))}

              <button
                type="button"
                className="w-full py-3 px-4 rounded-lg text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  background: headerBackground,
                }}
                disabled={!areSecondaryQuestionsAnswered()}
                onClick={handleContinueFromSecondary}
              >
                Continue to Select Time
              </button>
            </div>
          )}

          {/* Calendar Step */}
          {(previewStep === 'calendar' || (primaryQuestions.length === 0 && secondaryQuestions.length === 0)) && !selectedTime && (
            <>
              {/* Back button if we have questions */}
              {(primaryQuestions.length > 0 || secondaryQuestions.length > 0) && primaryQuestionsCompleted && (
                <button
                  onClick={() => {
                    if (secondaryQuestions.length > 0) {
                      setPreviewStep('secondary_questions');
                      setCurrentQuestionIndex(secondaryQuestions.length - 1);
                    } else {
                      setPreviewStep('primary_questions');
                      setCurrentQuestionIndex(primaryQuestions.length - 1);
                    }
                  }}
                  className="flex items-center gap-2 text-sm mb-2"
                  style={{ color: brandColorPrimary }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to questions
                </button>
              )}

              <div className="pt-4 border-t space-y-4" style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-3">
                  <h4
                    className="text-base font-semibold"
                    style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}
                  >
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={previousMonth}
                      className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                      style={{ color: brandColorPrimary }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                      style={{ color: brandColorPrimary }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 text-sm text-center">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <div
                      key={i}
                      className="py-2 font-semibold text-xs"
                      style={{ color: fontColor || (theme === 'dark' ? '#9CA3AF' : '#6B7280') }}
                    >
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((date, i) => {
                    if (!date) {
                      return <div key={i} />;
                    }

                    const isToday = date.getTime() === today.getTime();
                    const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
                    const isPast = date < today;

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isPast}
                        onClick={() => setSelectedDate(date)}
                        className={`py-2.5 rounded-md transition-all ${
                          isSelected ? 'font-bold ring-2 ring-offset-2' : theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                        } ${isPast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{
                          backgroundColor: isSelected ? brandColorPrimary : isToday ? `${brandColorPrimary}20` : 'transparent',
                          color: isSelected
                            ? '#FFFFFF'
                            : fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827'),
                          ringColor: isSelected ? brandColorPrimary : undefined,
                        }}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="pt-4 border-t" style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
                  <h4
                    className="text-sm font-semibold mb-3"
                    style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}
                  >
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h4>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className="py-2 px-3 rounded text-sm font-medium transition-all hover:scale-105"
                        style={{
                          backgroundColor: `${brandColorPrimary}15`,
                          color: brandColorPrimary,
                          border: `1px solid ${brandColorPrimary}40`,
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          </div>

          {/* Right Pane - Calendar (Desktop only) */}
          {previewMode === 'desktop' && (
            <div className="w-1/2 p-6 bg-gray-50 relative" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#F9FAFB' }}>
              {/* Show locked state if questions not completed */}
              {!areAllQuestionsAnswered() && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center p-4">
                  <div className="text-center p-4 sm:p-6 bg-white rounded-lg shadow-lg border w-full max-w-[90%] sm:max-w-sm" style={{ borderColor: brandColorPrimary }}>
                    <div className="mb-2 sm:mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColorPrimary}20` }}>
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: brandColorPrimary }} />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">
                      Please fill out the form before choosing your time slot.
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600">
                      Complete {previewStep === 'primary_questions' ? 'primary' : 'all'} questions to unlock calendar
                    </p>
                  </div>
                </div>
              )}

              {/* Calendar content (always rendered, greyed out when locked) */}
              <div className={!areAllQuestionsAnswered() ? 'opacity-30 pointer-events-none' : ''}>
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <h4
                    className="text-base font-semibold"
                    style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}
                  >
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={previousMonth}
                      className="p-1 rounded transition-colors hover:bg-gray-200"
                      style={{ color: brandColorPrimary }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-1 rounded transition-colors hover:bg-gray-200"
                      style={{ color: brandColorPrimary }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-sm text-center mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <div
                      key={i}
                      className="py-2 font-semibold text-xs"
                      style={{ color: fontColor || (theme === 'dark' ? '#9CA3AF' : '#6B7280') }}
                    >
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((date, i) => {
                    if (!date) {
                      return <div key={i} />;
                    }

                    const isToday = date.getTime() === today.getTime();
                    const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
                    const isPast = date < today;

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isPast}
                        onClick={() => setSelectedDate(date)}
                        className={`py-2 rounded-md transition-all ${
                          isSelected ? 'font-bold ring-2 ring-offset-1' : 'hover:bg-gray-200'
                        } ${isPast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{
                          backgroundColor: isSelected ? brandColorPrimary : isToday ? `${brandColorPrimary}20` : 'transparent',
                          color: isSelected
                            ? '#FFFFFF'
                            : fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827'),
                          ringColor: isSelected ? brandColorPrimary : undefined,
                        }}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="border-t pt-4" style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
                    <h4
                      className="text-sm font-semibold mb-3"
                      style={{ color: fontColor || (theme === 'dark' ? '#F9FAFB' : '#111827') }}
                    >
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {timeSlots.slice(0, 8).map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className="py-2 px-3 rounded text-sm font-medium transition-all hover:scale-105"
                          style={{
                            backgroundColor: `${brandColorPrimary}15`,
                            color: brandColorPrimary,
                            border: `1px solid ${brandColorPrimary}40`,
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Powered by Footer */}
        <div className="px-6 py-3 border-t bg-gray-50" style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>Powered by</span>
            <img
              src="/transparent-logo.png"
              alt="Axolop"
              className="h-4 w-4 opacity-70"
            />
            <span className="font-semibold text-gray-700">Axolop</span>
          </div>
        </div>
      </div>
    </div>
  );
}
