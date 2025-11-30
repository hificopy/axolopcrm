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
import SEO from "../components/SEO";
import logo from "@branding/LOGO/transparent-logo.png";
import axios from "axios";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUpWithEmail, signInWithOAuth } = useSupabase();

  // Get onboarding data from location state or localStorage
  const onboardingData = location.state || {};
  const storedOnboarding = localStorage.getItem("onboarding_responses");
  const parsedOnboarding = storedOnboarding ? JSON.parse(storedOnboarding) : {};

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
      const userMetadata = {
        full_name: formData.fullName,
        onboarding_completed: fromOnboarding,
        recommended_plan:
          onboardingData.recommendedPlan ||
          localStorage.getItem("recommended_plan"),
      };

      // Add onboarding responses if available
      if (storedOnboarding) {
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
      localStorage.removeItem("onboarding_responses");
      localStorage.removeItem("recommended_plan");

      // Redirect to onboarding page after successful signup
      setTimeout(() => {
        navigate("/onboarding", { replace: true });
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Account Created Successfully!
            </h2>
            <p className="text-gray-400 mb-4">
              Your account has been created for{" "}
              <strong className="text-white">{formData.email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Setting up your personalized experience...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      {/* SEO Meta Tags */}
      <SEO
        title="Sign Up for Axolop - The New Age CRM with Local AI Second Brain"
        description="Sign up for Axolop. The New Age CRM with Local AI Second Brain. All-in-one platform for sales, marketing, and automation. Free forever plan available."
        keywords="CRM sign up, Axolop signup, create CRM account, business automation signup, sales CRM, marketing CRM, free CRM"
        url="https://www.axolop.com/signup"
      />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Axolop"
            className="w-24 h-24 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-400">
            Join Axolop and streamline your workflow
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* OAuth Sign Up */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading || oauthLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 shadow-sm"
            >
              {oauthLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
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
                  className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || oauthLoading}
              className="w-full bg-gradient-to-r from-[#761B14] via-[#d4463c] to-[#761B14] hover:from-[#d4463c] hover:to-[#761B14] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#761B14]/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-[#14787b] hover:text-[#1fb5b9] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our{" "}
            <a href="#" className="text-gray-400 hover:text-gray-300 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-gray-400 hover:text-gray-300 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
