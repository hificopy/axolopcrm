import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/context/SupabaseContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import {
  getQuestionsForIndustry,
  calculateRecommendedPlan,
  getPlanDetails,
} from "@/lib/onboarding/questionFlows";

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUpWithEmail, user } = useSupabase();
  const { enableDemoMode } = useDemoMode();

  // Check if user came from payment - if not, redirect to select-plan
  const fromPayment = searchParams.get("from");

  useEffect(() => {
    // Only allow access if coming from payment
    if (fromPayment !== "payment") {
      // If user is logged in but didn't come from payment, redirect to select-plan
      if (user) {
        navigate("/select-plan");
      } else {
        navigate("/signup");
      }
    }
  }, [fromPayment, user, navigate]);

  // Get selected plan from URL params or localStorage
  const selectedPlan =
    searchParams.get("plan") || localStorage.getItem("selected_plan") || "build";

  // Load saved progress from localStorage
  const savedProgress = localStorage.getItem("onboarding_progress");
  const savedData = savedProgress ? JSON.parse(savedProgress) : null;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    savedData?.currentQuestionIndex || 0
  );
  const [responses, setResponses] = useState(savedData?.responses || {});
  const [questions, setQuestions] = useState([]);
  const [showIntro, setShowIntro] = useState(!savedData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignup, setShowSignup] = useState(savedData?.showSignup || false);

  // Initialize with base questions
  useEffect(() => {
    // If we have saved responses with an industry, load full questions
    if (savedData?.responses?.industry) {
      const fullQuestions = getQuestionsForIndustry(savedData.responses.industry);
      setQuestions(fullQuestions);
      return;
    }

    // Start with just the base questions (industry + team size)
    const initialQuestions = [
      {
        id: "q1",
        field: "industry",
        type: "multiple-choice",
        title: "Which industry are you in?",
        subtitle: "Help us tailor your CRM experience to your specific needs",
        required: true,
        icon: "🏢",
        options: [
          "Insurance",
          "B2B Sales",
          "Coaching",
          "Marketing Agency",
          "Consulting Firm",
          "Real Estate",
        ],
      },
      {
        id: "q2",
        field: "teamSize",
        type: "multiple-choice",
        title: "How many people are on your team?",
        subtitle: "This helps us recommend the right plan for your needs",
        required: true,
        icon: "👥",
        options: [
          "Just me (Solo)",
          "2-5 people",
          "6-10 people",
          "11-25 people",
          "26+ people",
        ],
      },
    ];

    if (questions.length === 0) {
      setQuestions(initialQuestions);
    }
  }, []);

  // Update questions when industry is selected
  useEffect(() => {
    console.log("Onboarding: responses.industry =", responses.industry);
    if (responses.industry && currentQuestionIndex === 1) {
      // After answering industry (question 1), load full question set
      const newQuestions = getQuestionsForIndustry(responses.industry);
      console.log(
        "Onboarding: Got questions:",
        newQuestions.length,
        "questions",
      );
      console.log("Onboarding: First question:", newQuestions[0]?.title);
      setQuestions(newQuestions);
    }
  }, [responses.industry, currentQuestionIndex]);

  // Debug: Log current state
  useEffect(() => {
    console.log("Onboarding state:", {
      showIntro,
      questionsLength: questions.length,
      currentQuestionIndex,
      responses,
    });
  }, [showIntro, questions.length, currentQuestionIndex, responses]);

  const handleNextQuestion = () => {
    setError("");
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevQuestion = () => {
    setError("");
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleResponseChange = (field, value) => {
    setResponses((prev) => {
      const newResponses = {
        ...prev,
        [field]: value,
      };

      // Save progress to localStorage
      localStorage.setItem(
        "onboarding_progress",
        JSON.stringify({
          responses: newResponses,
          currentQuestionIndex,
          showSignup: false,
        })
      );

      return newResponses;
    });
  };

  // Save progress when moving to signup
  useEffect(() => {
    if (showSignup && Object.keys(responses).length > 0) {
      localStorage.setItem(
        "onboarding_progress",
        JSON.stringify({
          responses,
          currentQuestionIndex,
          showSignup: true,
        })
      );
    }
  }, [showSignup, responses, currentQuestionIndex]);

  const handleSkip = () => {
    // Skip directly to signup without requiring onboarding completion
    console.log("Onboarding: Skip clicked - going directly to signup");
    // Set minimal responses for signup to work
    setResponses({
      industry: "Marketing Agency",
      teamSize: "2-5 people",
    });
    setShowSignup(true);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      // Sign up user
      const { error: signUpError } = await signUpWithEmail(email, password, {
        industry: responses.industry,
        team_size: responses.teamSize,
        selected_plan: selectedPlan,
        onboarding_completed: false,
      });

      if (signUpError) {
        throw new Error(signUpError.message || "Failed to create account");
      }

      // Store onboarding responses
      localStorage.setItem("onboarding_responses", JSON.stringify(responses));
      localStorage.setItem(
        "recommended_plan",
        calculateRecommendedPlan(responses),
      );
      localStorage.setItem("selected_plan", selectedPlan);

      // Clear onboarding progress from localStorage
      localStorage.removeItem("onboarding_progress");

      // DON'T enable demo mode - user should be in trial mode after payment
      // enableDemoMode();

      // Navigate to dashboard with trial active
      navigate("/app/home?trial=active&onboarding=complete");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const recommendedPlan = calculateRecommendedPlan(responses);

    // Store responses and recommendation
    localStorage.setItem("onboarding_responses", JSON.stringify(responses));
    localStorage.setItem("recommended_plan", recommendedPlan);
    localStorage.setItem("selected_plan", selectedPlan);

    // Show signup form
    setShowSignup(true);
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Intro animation (Monday.com inspired)
  if (showIntro) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center"
      >
        <div className="text-center max-w-4xl mx-auto px-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8 inline-block"
          >
            <img
              src="/axolop-black-transparent.png"
              alt="Axolop CRM"
              className="w-32 h-32 object-contain"
            />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{ color: "#0F0810" }}
          >
            Let's Build Your Perfect CRM
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-600 mb-8"
          >
            Just 5 quick questions to get started
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-4 justify-center"
          >
            <Button
              onClick={handleSkip}
              variant="outline"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-4 rounded-xl font-medium transition-all duration-300"
            >
              Skip
            </Button>

            <Button
              onClick={() => {
                console.log(
                  "Onboarding: Get Started clicked, showing first question",
                );
                setShowIntro(false);
              }}
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>

            {selectedPlan && (
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#0F0810]/5 rounded-full border border-[#0F0810]/20">
                <span className="text-sm font-medium" style={{ color: "#0F0810" }}>
                  Selected Plan:
                </span>
                <span className="font-bold" style={{ color: "#0F0810" }}>
                  {getPlanDetails(selectedPlan).name}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (showSignup) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-4 inline-block">
                <img
                  src="/axolop-black-transparent.png"
                  alt="Axolop CRM"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#0F0810" }}>
                Create Your Account
              </h2>
              <p className="text-gray-600">Start your 14-day free trial</p>

              {selectedPlan && (
                <div className="mt-4 p-4 bg-[#0F0810]/5 rounded-lg">
                  <div className="text-center">
                    <div className="font-bold" style={{ color: "#0F0810" }}>
                      {getPlanDetails(selectedPlan).name} Plan
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {getPlanDetails(selectedPlan).description}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Min 8 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Start Your Free Trial
                  </span>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500 mt-4">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4 inline-block"
          >
            <img
              src="/axolop-black-transparent.png"
              alt="Axolop CRM"
              className="w-16 h-16 object-contain"
            />
          </motion.div>
          <p className="text-lg text-gray-600">Setting up your CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Question */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex items-center justify-center px-4 pt-20"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-2xl"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                {/* Question Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{currentQuestion.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentQuestion.title}
                    </h2>
                    {currentQuestion.subtitle && (
                      <p className="text-gray-600 mt-1">
                        {currentQuestion.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Question Options */}
                <div className="space-y-3">
                  {currentQuestion.type === "multiple-choice" && (
                    <>
                      {currentQuestion.options.map((option, index) => (
                        <motion.button
                          key={option}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          onClick={() =>
                            handleResponseChange(currentQuestion.field, option)
                          }
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                            responses[currentQuestion.field] === option
                              ? "bg-gray-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          style={
                            responses[currentQuestion.field] === option
                              ? { borderColor: "#0F0810", color: "#0F0810" }
                              : {}
                          }
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{option}</span>
                            {responses[currentQuestion.field] === option && (
                              <CheckCircle2 className="w-5 h-5" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </>
                  )}

                  {currentQuestion.type === "checkboxes" && (
                    <>
                      {currentQuestion.options.map((option, index) => (
                        <motion.div
                          key={option}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                        >
                          <input
                            type="checkbox"
                            id={option}
                            checked={
                              responses[currentQuestion.field]?.includes(
                                option,
                              ) || false
                            }
                            onChange={(e) => {
                              const currentValues =
                                responses[currentQuestion.field] || [];
                              if (e.target.checked) {
                                handleResponseChange(currentQuestion.field, [
                                  ...currentValues,
                                  option,
                                ]);
                              } else {
                                handleResponseChange(
                                  currentQuestion.field,
                                  currentValues.filter((v) => v !== option),
                                );
                              }
                            }}
                            className="w-5 h-5 rounded focus:ring-2"
                            style={{ accentColor: "#0F0810" }}
                          />
                          <label
                            htmlFor={option}
                            className="flex-1 font-medium cursor-pointer"
                          >
                            {option}
                          </label>
                        </motion.div>
                      ))}
                    </>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>

                    <Button
                      onClick={handleSkip}
                      variant="outline"
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                    >
                      Skip All
                    </Button>
                  </div>

                  <Button
                    onClick={handleNextQuestion}
                    disabled={!responses[currentQuestion.field]}
                    className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                  >
                    {currentQuestionIndex === questions.length - 1
                      ? "Complete Setup"
                      : "Next"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
