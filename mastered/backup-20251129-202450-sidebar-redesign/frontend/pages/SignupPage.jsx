import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/context/SupabaseContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { getPlanDetails } from "@/lib/onboarding/questionFlows";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUpWithEmail } = useSupabase();
  const { enableDemoMode } = useDemoMode();
  const [selectedPlan, setSelectedPlan] = useState("build");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: account, 2: success

  // Get plan from URL params
  useEffect(() => {
    const plan =
      searchParams.get("plan") ||
      localStorage.getItem("selected_plan") ||
      "build";
    setSelectedPlan(plan);
  }, [searchParams]);

  const plan = getPlanDetails(selectedPlan);

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
      const { data, error: signUpError } = await signUpWithEmail(
        email,
        password,
        {
          selected_plan: selectedPlan,
          onboarding_completed: false,
        },
      );

      if (signUpError) {
        throw new Error(signUpError.message || "Failed to create account");
      }

      // Store plan selection
      localStorage.setItem("selected_plan", selectedPlan);

      // Enable demo mode until trial is activated
      enableDemoMode();

      // Show success
      setStep(2);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToTrial = () => {
    navigate("/app/home?onboarding=complete&trial=pending");
  };

  if (step === 2) {
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
          className="w-full max-w-md text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <div className="bg-green-100 rounded-full p-4 inline-block mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Account Created!
              </h2>
              <p className="text-gray-600">
                Welcome to Axolop CRM! Your account is ready.
              </p>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-[#3F0D28]/5 to-[#ff6b4a]/5 rounded-lg">
              <div className="text-center">
                <div className="font-bold text-[#3F0D28]">
                  {plan.name} Plan Selected
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {plan.description}
                </div>
              </div>
            </div>

            <Button
              onClick={handleContinueToTrial}
              className="w-full bg-gradient-to-r from-[#3F0D28] to-[#ff6b4a] hover:from-[#8b2c24] hover:to-[#ff7b5a] text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Continue to Dashboard
              </span>
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              You'll be prompted to start your 14-day free trial
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

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
        {/* Back button */}
        <button
          onClick={() => navigate("/pricing")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Pricing
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-[#3F0D28] to-[#ff6b4a] p-4 rounded-full inline-block mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-600">Start your 14-day free trial</p>

            <div className="mt-4 p-4 bg-gradient-to-r from-[#3F0D28]/5 to-[#ff6b4a]/5 rounded-lg">
              <div className="text-center">
                <div className="font-bold text-[#3F0D28]">{plan.name} Plan</div>
                <div className="text-sm text-gray-600 mt-1">
                  {plan.description}
                </div>
                <div className="text-lg font-bold text-[#3F0D28] mt-2">
                  {plan.price}/month
                </div>
              </div>
            </div>
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
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F0D28] focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F0D28] focus:border-transparent"
                  placeholder="Min 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F0D28] focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#3F0D28] to-[#ff6b4a] hover:from-[#8b2c24] hover:to-[#ff7b5a] text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-300"
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
