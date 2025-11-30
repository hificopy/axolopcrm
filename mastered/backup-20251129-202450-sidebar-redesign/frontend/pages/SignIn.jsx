import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSupabase } from "../context/SupabaseContext";
import {
  Mail,
  Lock,
  Chrome,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import SEO from "../components/SEO";
import logo from "@branding/LOGO/transparent-logo.png";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    signInWithEmail,
    signInWithOAuth,
    user,
    loading: authLoading,
    isInitialized,
  } = useSupabase();

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || "",
  );
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("[SignIn] handleSubmit called");
    console.log("[SignIn] signInWithEmail available:", !!signInWithEmail);
    console.log("[SignIn] signInWithOAuth available:", !!signInWithOAuth);
    console.log("[SignIn] formData:", formData);

    // Check if Supabase is available and initialized
    if (!signInWithEmail || !signInWithOAuth || authLoading || !isInitialized) {
      console.error("[SignIn] Supabase not ready:", {
        signInWithEmail: !!signInWithEmail,
        signInWithOAuth: !!signInWithOAuth,
        authLoading,
        isInitialized,
      });
      setError("Authentication system is initializing. Please wait...");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("[SignIn] Attempting sign in with:", formData.email);
      const result = await signInWithEmail(formData.email, formData.password);
      console.log("[SignIn] Sign in result:", result);

      // ProtectedRoute will handle proper routing based on user status
      // Just navigate to a protected route to trigger the routing logic
      navigate("/app/home");
    } catch (err) {
      console.error("Sign in error:", err);
      setError(
        err.message || "Failed to sign in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Check if Supabase is available
    if (!signInWithOAuth) {
      setError("Authentication system is initializing. Please try again.");
      return;
    }

    setError("");
    setOauthLoading(true);

    try {
      await signInWithOAuth("google");
      // Supabase will redirect to Google OAuth, then back to your app
    } catch (err) {
      console.error("Google sign in error:", err);
      setError(err.message || "Failed to sign in with Google.");
      setOauthLoading(false);
    }
  };

  // Show loading screen while Supabase initializes
  if (authLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0510]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing authentication...</p>
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
        <div
          className="absolute top-0 left-0 w-96 h-96 bg-[#3F0D28]/20 rounded-full blur-3xl animate-pulse"
          style={{ animation: "float 20s ease-in-out infinite" }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-[#14787b]/15 rounded-full blur-3xl animate-pulse"
          style={{ animation: "float 25s ease-in-out infinite reverse" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5B1046]/10 rounded-full blur-3xl animate-pulse"
          style={{ animation: "float 30s ease-in-out infinite" }}
        ></div>
      </div>

      {/* SEO Meta Tags */}
      <SEO
        title="Sign In to Axolop - The New Age CRM with Local AI Second Brain"
        description="Sign in to your Axolop account. The New Age CRM with Local AI Second Brain. All-in-one platform for sales, marketing, and automation."
        keywords="CRM sign in, Axolop login, CRM login, business automation login, sales CRM, marketing CRM"
        url="https://www.axolop.com/signin"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <img
              src={logo}
              alt="Axolop"
              className="w-24 h-24 mx-auto mb-4 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your Axolop account</p>
        </div>

        {/* Sign In Card */}
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3F0D28]/5 via-transparent to-[#14787b]/5 pointer-events-none"></div>
          <div className="relative z-10">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-200">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* OAuth Sign In */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
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
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-white hover:text-gray-300 transition-colors"
                >
                  Forgot password?
                </Link>
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
                      Signing In...
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
                    Sign In
                  </span>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-white hover:text-gray-300 font-medium transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{" "}
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

export default SignIn;
