import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSupabase } from "../context/SupabaseContext";
import {
  Mail,
  Lock,
  User,
  Chrome,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { localStorageGetJSON, localStorageRemove } from "../utils/safeStorage";
import SEO from "../components/SEO";
import logo from "@branding/LOGO/transparent-logo.png";
import axios from "axios";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUpWithEmail, signInWithOAuth } = useSupabase();

  // Get onboarding data from location state or localStorage
  const onboardingData = location.state || {};
  const parsedOnboarding = localStorageGetJSON("onboarding_responses", {});

  const [formData, setFormData] = useState({
    fullName: onboardingData.name || parsedOnboarding.name || "",
    email: onboardingData.email || parsedOnboarding.email || "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fromOnboarding, setFromOnboarding] = useState(
    !!onboardingData.fromOnboarding,
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Please enter your full name");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Get affiliate ref from location state (passed from onboarding)
      // No localStorage - using React Router state and Supabase only
      const affiliateRef = onboardingData.affiliateRef;

      if (affiliateRef) {
        console.log("✅ Affiliate ref received from onboarding:", affiliateRef);
      }

      // Build user metadata with onboarding data
      // No localStorage - using React Router state and Supabase only
      const userMetadata = {
        full_name: formData.fullName,
        onboarding_completed: fromOnboarding,
        recommended_plan: onboardingData.recommendedPlan || null,
      };

      // Add onboarding responses if available
      if (Object.keys(parsedOnboarding).length > 0) {
        userMetadata.onboarding_responses = parsedOnboarding;
      }

      const result = await signUpWithEmail(
        formData.email,
        formData.password,
        userMetadata,
      );

      console.log("✅ Signup result:", result);

      // Track affiliate referral in Supabase if exists
      if (affiliateRef && result.user) {
        try {
          console.log("🎯 Creating affiliate referral in Supabase...");
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:3002/api/v1"}/affiliate/create-referral`,
            {
              referral_code: affiliateRef,
              referred_user_id: result.user.id,
              referred_email: formData.email,
              status: "signup_completed",
            },
            {
              headers: {
                Authorization: `Bearer ${result.session?.access_token}`,
                "Content-Type": "application/json",
              },
            },
          );
          console.log(
            "✅ Affiliate referral tracked in Supabase:",
            response.data,
          );
        } catch (affiliateErr) {
          console.error("❌ Error tracking affiliate referral:", affiliateErr);
          // Don't fail signup if affiliate tracking fails
        }
      }

      // Supabase signup successful
      setLoading(false);
      setSuccess(true);

      // Clear onboarding data from localStorage
      localStorageRemove("onboarding_responses");
      localStorageRemove("recommended_plan");

      // Get selected plan from URL params if coming from pricing page
      const urlParams = new URLSearchParams(location.search);
      const selectedPlan = urlParams.get('plan');

      // Redirect to payment selection page after successful signup
      setTimeout(() => {
        if (selectedPlan) {
          navigate(`/select-plan?plan=${selectedPlan}`, { replace: true });
        } else {
          navigate("/select-plan", { replace: true });
        }
      }, 2000);
    } catch (err) {
      console.error("Sign up error:", err);
      setError(err.message || "Failed to create account. Please try again.");
      setLoading(false);
      setSuccess(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setOauthLoading(true);

    try {
      await signInWithOAuth("google");
    } catch (err) {
      console.error("Google sign up error:", err);
      setError(err.message || "Failed to sign up with Google.");
      setOauthLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#0F0510] p-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(233,44,146,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,120,123,0.10),transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(63,13,40,0.08),transparent_70%)]"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#3F0D28]/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-[#14787b]/15 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3F0D28]/5 via-transparent to-[#14787b]/5 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Account Created Successfully!
              </h2>
              <p className="text-gray-400 mb-4">
                Next: Select your plan to start your 14-day free trial
              </p>
              <p className="text-gray-300 mb-4">
                Your account has been created for{" "}
                <strong className="text-white">{formData.email}</strong>
              </p>
              <p className="text-sm text-gray-400">
                Setting up your personalized experience...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0F0510] p-4 overflow-hidden">
      {/* Animated background elements similar to stripe.com */}
      <div className="absolute inset-0">
        {/* Radial gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(233,44,146,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,120,123,0.10),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(63,13,40,0.08),transparent_70%)]"></div>

        {/* Moving gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#3F0D28]/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-[#14787b]/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5B1046]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>
      {/* SEO Meta Tags */}
      <SEO
        title="Sign Up for Axolop - The New Age CRM with Local AI Second Brain"
        description="Sign up for Axolop. The New Age CRM with Local AI Second Brain. All-in-one platform for sales, marketing, and automation. Free forever plan available."
        keywords="CRM sign up, Axolop signup, create CRM account, business automation signup, sales CRM, marketing CRM, free CRM"
        url="https://www.axolop.com/signup"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img
              src={logo}
              alt="Axolop"
              className="w-24 h-24 mx-auto mb-4 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-300">
            Join Axolop and streamline your workflow
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3F0D28]/5 via-transparent to-[#14787b]/5 pointer-events-none"></div>
          <div className="relative z-10">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* OAuth Sign Up */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading || oauthLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Chrome className="w-5 h-5" />
                )}
                <span>
                  {oauthLoading ? "Connecting..." : "Continue with Google"}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-400">
                  Or sign up with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Field */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F0D28] focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F0D28] focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F0D28] focus:border-transparent transition-all"
                    placeholder="At least 8 characters"
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F0D28] focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || oauthLoading}
                className="w-full relative overflow-hidden py-5 rounded-full leading-none flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(180deg, #5a1a3a 0%, #3F0D28 30%, #c41e78 70%, #ff69b4 100%)",
                  boxShadow:
                    "inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                {/* Top metallic shine band */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full pointer-events-none"></div>

                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span
                      className="relative z-10 font-black tracking-wide text-base"
                      style={{
                        backgroundImage:
                          "linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, #ffd6eb 70%, #ffb8dc 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))",
                      }}
                    >
                      Creating Account...
                    </span>
                  </>
                ) : (
                  <span
                    className="relative z-10 font-black tracking-wide text-base"
                    style={{
                      backgroundImage:
                        "linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, #ffd6eb 70%, #ffb8dc 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.3))",
                    }}
                  >
                    Create Account
                  </span>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-white hover:text-gray-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our{" "}
            <Link
              to="/terms"
              className="text-gray-400 hover:text-gray-300 underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-gray-400 hover:text-gray-300 underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
