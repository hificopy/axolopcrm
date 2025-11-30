import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  DollarSign,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { evaluateQuestionLogic } from "../utils/formLogicEngine.js";
import { Badge } from "../components/ui/badge";
import { useToast } from "../components/ui/use-toast";
import { DateTime } from "luxon";
import SequentialQuestion from "../components/SequentialQuestion";
import LegalFooter from "../components/LegalFooter";

/**
 * BookingEmbed - Public booking page with modern scheduling functionality
 *
 * Features:
 * - 2-step qualification (qualify before showing calendar)
 * - Conversational progressive form (one question at a time)
 * - Auto-save on every change (no submit button)
 * - Conditional routing based on responses
 * - Automatic disqualification rules
 * - Lead capture even if booking not completed
 */
export default function BookingEmbed() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Booking link configuration
  const [bookingLink, setBookingLink] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [leadId, setLeadId] = useState(null);
  const [qualified, setQualified] = useState(null);
  const [disqualificationReason, setDisqualificationReason] = useState(null);

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(false);

  // Booking confirmation
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Preview settings
  const [previewMode, setPreviewMode] = useState("desktop"); // 'desktop' or 'mobile'

  // Load booking link configuration
  useEffect(() => {
    loadBookingLink();
  }, [slug]);

  const loadBookingLink = async () => {
    try {
      const response = await fetch(`/api/meetings/booking-links/${slug}`);
      if (!response.ok) {
        throw new Error("Booking link not found");
      }
      const data = await response.json();
      setBookingLink(data);
    } catch (error) {
      console.error("Error loading booking link:", error);
      toast({
        title: "Error",
        description: "Booking link not found",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-save form data on every change with retry logic
  const autoSaveFormData = useCallback(
    async (fieldName, value) => {
      const updatedData = { ...formData, [fieldName]: value };
      setFormData(updatedData);

      // Implement retry logic with exponential backoff
      const maxRetries = 3;
      const baseDelay = 1000; // 1 second

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Save to backend immediately
          const response = await fetch(
            `/api/meetings/booking-links/${slug}/auto-save`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                leadId,
                formData: updatedData,
                currentStep,
              }),
              signal: AbortSignal.timeout(baseDelay * Math.pow(2, attempt - 1)),
            },
          );

          const result = await response.json();

          // Store lead ID from first save
          if (!leadId && result.leadId) {
            setLeadId(result.leadId);
          }

          // Check for automatic disqualification
          if (result.disqualified) {
            setQualified(false);
            setDisqualificationReason(result.reason);
          }

          // If successful, break retry loop
          if (response.ok) {
            return;
          }

          // If rate limited, wait longer before retry
          if (response.status === 429) {
            await new Promise((resolve) =>
              setTimeout(resolve, baseDelay * attempt),
            );
            continue;
          }
        } catch (error) {
          console.error(`Auto-save attempt ${attempt} failed:`, error);

          // If last attempt, show error to user
          if (attempt === maxRetries) {
            toast({
              title: "Auto-save Failed",
              description:
                "Your changes could not be saved. Please check your connection and try again.",
              variant: "destructive",
            });
          }

          // Continue trying unless it's the last attempt
          if (attempt < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, baseDelay * attempt),
            );
          }
        }
      }
    },
    [formData, leadId, currentStep, slug],
  );

  // Handle field change with auto-save
  const handleFieldChange = (fieldName, value) => {
    autoSaveFormData(fieldName, value);
  };

  // Validate current step before proceeding
  const validateCurrentStep = () => {
    const currentQuestion = getQuestions()[currentStep];
    if (!currentQuestion) return false;

    const value = formData[currentQuestion.field];

    // Required field validation
    if (currentQuestion.required && !value) {
      return false;
    }

    // Email validation
    if (currentQuestion.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return false;
      }

      // Business email requirement
      if (currentQuestion.requireBusinessEmail) {
        const freeEmailDomains = [
          "gmail.com",
          "yahoo.com",
          "hotmail.com",
          "outlook.com",
          "aol.com",
        ];
        const domain = value.split("@")[1]?.toLowerCase();
        if (freeEmailDomains.includes(domain)) {
          setQualified(false);
          setDisqualificationReason(
            "We only work with business email addresses",
          );
          return false;
        }
      }
    }

    // Phone validation
    if (currentQuestion.type === "tel" && value) {
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(value)) {
        return false;
      }

      // Country code filtering
      if (currentQuestion.allowedCountryCodes && value.startsWith("+")) {
        const countryCode = value.substring(0, 3);
        if (!currentQuestion.allowedCountryCodes.includes(countryCode)) {
          setQualified(false);
          setDisqualificationReason("We currently only serve specific regions");
          return false;
        }
      }
    }

    // Number range validation
    if (currentQuestion.type === "number" && value) {
      const numValue = parseInt(value);
      if (currentQuestion.min && numValue < currentQuestion.min) {
        setQualified(false);
        setDisqualificationReason(
          currentQuestion.minMessage || "Value too low",
        );
        return false;
      }
      if (currentQuestion.max && numValue > currentQuestion.max) {
        setQualified(false);
        setDisqualificationReason(
          currentQuestion.maxMessage || "Value too high",
        );
        return false;
      }
    }

    return true;
  };

  // Get questions based on booking link configuration and conditional logic
  const getQuestions = () => {
    if (!bookingLink) return [];

    // Start with required fields
    const questions = [
      {
        id: "name",
        field: "name",
        type: "text",
        label: "What's your name?",
        placeholder: "Enter your full name",
        icon: User,
        required: true,
      },
    ];

    // Phone or Email (based on booking link settings)
    if (
      bookingLink.contact_field === "email" ||
      bookingLink.contact_field === "both"
    ) {
      questions.push({
        id: "email",
        field: "email",
        type: "email",
        label: "What's your work email?",
        placeholder: "your.name@company.com",
        icon: Mail,
        required: true,
        requireBusinessEmail: bookingLink.require_business_email || false,
      });
    }

    if (
      bookingLink.contact_field === "phone" ||
      bookingLink.contact_field === "both"
    ) {
      questions.push({
        id: "phone",
        field: "phone",
        type: "tel",
        label: "What's your phone number?",
        placeholder: "+1 (555) 000-0000",
        icon: Phone,
        required: true,
        allowedCountryCodes: bookingLink.allowed_country_codes || null,
      });
    }

    // Add custom qualification questions
    if (
      bookingLink.custom_questions &&
      bookingLink.custom_questions.length > 0
    ) {
      bookingLink.custom_questions.forEach((q) => {
        // Apply conditional logic using the form logic engine
        if (q.conditional_logic && q.conditional_logic.length > 0) {
          const logicResult = evaluateQuestionLogic(
            q,
            formData,
            bookingLink.custom_questions,
          );

          if (logicResult.shouldSkip || logicResult.action === "jump") {
            return; // Skip this question
          }
        }

        questions.push({
          id: q.id,
          field: q.field,
          type: q.type,
          label: q.label,
          placeholder: q.placeholder,
          icon: getIconForType(q.type),
          required: q.required,
          options: q.options,
          min: q.min,
          max: q.max,
          minMessage: q.min_message,
          maxMessage: q.max_message,
        });
      });
    }

    return questions;
  };

  const getIconForType = (type) => {
    const icons = {
      text: User,
      email: Mail,
      tel: Phone,
      company: Building2,
      website: Globe,
      number: DollarSign,
    };
    return icons[type] || User;
  };

  // Navigate to next question
  const handleNext = async () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Required",
        description: "Please fill in this field to continue",
        variant: "destructive",
      });
      return;
    }

    const questions = getQuestions();
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Qualification complete - submit for evaluation
      await submitQualification();
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit qualification for evaluation (2-step booking)
  const submitQualification = async () => {
    try {
      const response = await fetch(
        `/api/meetings/booking-links/${slug}/qualify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId,
            formData,
          }),
        },
      );

      const result = await response.json();

      if (result.qualified) {
        setQualified(true);
        toast({
          title: "Great news!",
          description: "You qualify for a meeting. Please select a time below.",
        });
      } else {
        setQualified(false);
        setDisqualificationReason(
          result.reason ||
            "Based on your responses, we may not be the best fit at this time.",
        );
      }
    } catch (error) {
      console.error("Qualification error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load available time slots when date is selected
  const loadAvailableSlots = async (date) => {
    setLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/meetings/booking-links/${slug}/availability?date=${date.toISODate()}&timezone=${DateTime.local().zoneName}`,
      );
      const slots = await response.json();
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error loading slots:", error);
      toast({
        title: "Error",
        description: "Failed to load available times",
        variant: "destructive",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setShowLeftPanel(true); // Show left panel when date is selected
    loadAvailableSlots(date);
  };

  // Handle time selection and complete booking
  const handleTimeSelect = async (time) => {
    setSelectedTime(time);

    try {
      const response = await fetch(`/api/meetings/booking-links/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          scheduled_time: time.toISO(),
          qualification_data: formData,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setBookingComplete(true);
        setBookingDetails(result);
        toast({
          title: "Booking confirmed!",
          description: "You'll receive a confirmation email shortly.",
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description: "Failed to complete booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Render questions sequentially (one at a time)
  const renderCurrentQuestion = () => {
    const questions = getQuestions();

    if (questions.length === 0) return null;

    // Convert all questions to sequential format
    const sequentialQuestions = questions.map((q) => ({
      ...q,
      title: q.label,
      type: q.type === "select" ? "multiple-choice" : q.type,
      options:
        q.type === "select" ? q.options?.map((opt) => opt.label) : q.options,
      settings: { placeholder: q.placeholder },
    }));

    return (
      <motion.div
        key="sequential-questions"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="mb-8">
          <SequentialQuestion
            questions={sequentialQuestions}
            responses={formData}
            setResponses={setFormData}
            onSubmit={() => {
              if (currentStep < questions.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                submitQualification();
              }
            }}
            onBack={handlePrevious}
            currentQuestionIndex={currentStep}
            setCurrentQuestionIndex={setCurrentStep}
            isMeetingMode={true}
            theme="light"
            brandColorPrimary="#0d9488"
            brandColorSecondary="#0f766e"
            useGradient={false}
            fontColor="#111827"
            headerBackground="#0d9488"
            onResponseChange={handleFieldChange}
            showGrouped={false} // Show questions one at a time
          />
        </div>
      </motion.div>
    );
  };

  // Render calendar selection (Step 2 - after qualification)
  const renderCalendar = () => {
    const today = DateTime.local();
    const daysToShow = 14;
    const dates = Array.from({ length: daysToShow }, (_, i) =>
      today.plus({ days: i }),
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl mx-auto"
      >
        <div className="text-center mb-8">
          <CheckCircle2 className="h-16 w-16 text-emerald-700 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            You're qualified! 🎉
          </h2>
          <p className="text-gray-600">
            Select a date and time that works for you
          </p>
        </div>

        {/* Date selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Select a date</h3>
          <div className="grid grid-cols-7 gap-3">
            {dates.map((date) => {
              const isSelected = selectedDate?.hasSame(date, "day");
              return (
                <button
                  key={date.toISODate()}
                  onClick={() => handleDateSelect(date)}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200 hover:border-teal-300"
                  }`}
                >
                  <div className="text-xs text-gray-500 uppercase">
                    {date.toFormat("EEE")}
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {date.toFormat("d")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {date.toFormat("MMM")}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slot selection */}
        {selectedDate && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Select a time on {selectedDate.toFormat("EEEE, MMMM d")}
            </h3>
            {loadingSlots ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading available times...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No available times on this date</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {availableSlots.map((slot) => {
                  const slotTime = DateTime.fromISO(slot.start);
                  const isSelected = selectedTime?.equals(slotTime);
                  return (
                    <button
                      key={slot.start}
                      onClick={() => handleTimeSelect(slotTime)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 hover:border-teal-300"
                      }`}
                    >
                      <Clock className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                      <div className="font-medium text-gray-900">
                        {slotTime.toFormat("h:mm a")}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  // Render disqualification message
  const renderDisqualified = () => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto text-center"
      >
        <Card className="p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😔</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank you for your interest
            </h2>
            <p className="text-gray-600">{disqualificationReason}</p>
          </div>
          <p className="text-sm text-gray-500">
            We've saved your information and will reach out if anything changes.
          </p>
        </Card>
      </motion.div>
    );
  };

  // Render booking confirmation
  const renderConfirmation = () => {
    if (!bookingDetails) return null;

    const scheduledTime = DateTime.fromISO(bookingDetails.scheduled_time);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto text-center"
      >
        <Card className="p-8">
          <CheckCircle2 className="h-20 w-20 text-emerald-700 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            You're all set! 🎉
          </h2>
          <p className="text-gray-600 mb-8">Your meeting has been confirmed</p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Calendar className="h-5 w-5 text-teal-600" />
              <span className="font-semibold text-gray-900">
                {scheduledTime.toFormat("EEEE, MMMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Clock className="h-5 w-5 text-teal-600" />
              <span className="font-semibold text-gray-900">
                {scheduledTime.toFormat("h:mm a ZZZZ")}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>
              ✉️ A confirmation email has been sent to{" "}
              <strong>{formData.email}</strong>
            </p>
            <p>📱 You'll receive a reminder before the meeting</p>
            {bookingDetails.meeting_link && (
              <p>
                🔗 Meeting link:{" "}
                <a
                  href={bookingDetails.meeting_link}
                  className="text-teal-600 hover:underline"
                >
                  {bookingDetails.meeting_link}
                </a>
              </p>
            )}
          </div>

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-6"
          >
            Book Another Meeting
          </Button>
        </Card>
      </motion.div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {bookingLink && !bookingComplete && (
          <div className="text-center mb-12">
            <Badge className="bg-teal-600 text-white mb-4">
              {bookingLink.duration} minute meeting
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {bookingLink.name}
            </h1>
            {bookingLink.description && (
              <p className="text-gray-600 max-w-2xl mx-auto">
                {bookingLink.description}
              </p>
            )}
          </div>
        )}

        {/* Main content */}
        {qualified === true ? (
          // Check if we still have secondary questions to ask
          (() => {
            const questions = getQuestions();
            const secondaryQuestions = questions.filter(
              (q) => !["name", "email", "phone"].includes(q.id),
            );

            // Check if all secondary questions are answered (if any exist)
            const hasSecondary = secondaryQuestions.length > 0;
            const allSecondaryAnswered = hasSecondary
              ? !secondaryQuestions.some(
                  (q) =>
                    q.required &&
                    (!formData[q.field] || formData[q.field] === ""),
                )
              : true;

            // If we have secondary questions and not all answered, show them
            if (hasSecondary && !allSecondaryAnswered) {
              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-1 lg:order-1">
                    {/* Summary of completed primary questions */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Your Information
                      </h3>
                      <div className="space-y-3">
                        {formData.name && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium text-gray-900">
                              {formData.name}
                            </span>
                          </div>
                        )}
                        {formData.email && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-gray-900">
                              {formData.email}
                            </span>
                          </div>
                        )}
                        {formData.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium text-gray-900">
                              {formData.phone}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Show secondary questions */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Additional Information
                        </h4>
                        {renderCurrentQuestion()}
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-2 lg:order-2">
                    <div className="bg-white rounded-xl shadow-sm p-6 opacity-50">
                      <p className="text-gray-500 text-center py-12">
                        Please complete the form to see available times
                      </p>
                    </div>
                  </div>
                </div>
              );
            } else {
              // All questions (primary and secondary) are answered, show calendar view
              return (
                <div
                  className={`grid grid-cols-1 gap-12 transition-all duration-300 ${showLeftPanel ? "lg:grid-cols-3" : ""}`}
                >
                  {showLeftPanel && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="lg:col-span-1 lg:order-1"
                    >
                      {/* Summary of completed questions */}
                      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Booking Details
                          </h3>
                          <button
                            onClick={() => setShowLeftPanel(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-3">
                          {formData.name && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Name:</span>
                              <span className="font-medium text-gray-900">
                                {formData.name}
                              </span>
                            </div>
                          )}
                          {formData.email && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium text-gray-900">
                                {formData.email}
                              </span>
                            </div>
                          )}
                          {formData.phone && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium text-gray-900">
                                {formData.phone}
                              </span>
                            </div>
                          )}
                          {/* Add secondary question responses if any */}
                          {(() => {
                            const questions = getQuestions();
                            const secondaryQuestions = questions.filter(
                              (q) => !["name", "email", "phone"].includes(q.id),
                            );
                            return secondaryQuestions.map((q) => {
                              if (formData[q.field]) {
                                return (
                                  <div
                                    className="flex justify-between"
                                    key={q.id}
                                  >
                                    <span className="text-gray-600">
                                      {q.label}:
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {formData[q.field]}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            });
                          })()}
                        </div>
                        {/* Selected date info */}
                        {selectedDate && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                              Selected Date
                            </h4>
                            <div className="bg-teal-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-teal-900">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">
                                  {selectedDate.toFormat("EEEE, MMMM d, yyyy")}
                                </span>
                              </div>
                              {selectedTime && (
                                <div className="flex items-center gap-2 text-teal-900 mt-2">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">
                                    {selectedTime.toFormat("h:mm a")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                  <div
                    className={
                      showLeftPanel ? "lg:col-span-2 lg:order-2" : "col-span-1"
                    }
                  >
                    {renderCalendar()}
                  </div>
                </div>
              );
            }
          })()
        ) : (
          // Before qualification: just show questions or other states
          <AnimatePresence mode="wait">
            {bookingComplete
              ? renderConfirmation()
              : qualified === false
                ? renderDisqualified()
                : renderCurrentQuestion()}
          </AnimatePresence>
        )}

        {/* Footer branding and legal links */}
        {!bookingComplete && (
          <div className="mt-12">
            <LegalFooter
              variant="booking"
              showBranding={true}
              showConsentText={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
