import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@branding/LOGO/transparent-logo.png";
import background from "@branding/banner/background.png";

// UNIQUE_IDENTIFIER_V1_20251114_BETA_LOGIN_REBUILD
const BetaLogin = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [logoMovedUp, setLogoMovedUp] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate initial loading for 3 seconds
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setLogoMovedUp(true); // Move logo up after loading
    }, 3000);

    // Show tagline and password prompt after logo moves up
    const appearanceTimer = setTimeout(() => {
      setShowTagline(true);
      setShowPasswordPrompt(true);
    }, 4500); // 3s loading + 1s logo move animation + 0.5s delay

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(appearanceTimer);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (password === "katewife") {
      // Set a session variable or local storage to remember login state
      sessionStorage.setItem("betaAccess", "true");
      navigate("/inbox"); // Go directly to CRM dashboard
    } else {
      setError("Incorrect password. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for futuristic effect */}
      <div className="absolute inset-0 bg-black opacity-70 z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-white p-8 max-w-2xl w-full">
        {/* Logo and Loading Animation */}
        <div
          className={`relative transition-all duration-1000 ease-out ${
            logoMovedUp ? "translate-y-12" : "translate-y-90"
          }`}
        >
          <img
            src={logo}
            alt="Axolop CRM Logo"
            className={`w-40 h-40 object-contain relative z-20 ${
              isLoading ? "animate-pulse-slow" : ""
            }`}
          />
          {isLoading && <div className="futuristic-loader"></div>}
        </div>

        {/* Tagline */}
        <h1
          className={`text-white text-4xl md:text-5xl font-bold text-center mt-8 mb-12 animate-fade-in-up transition-opacity duration-500 ${showTagline ? "opacity-100 visible" : "opacity-0 invisible"}`}
        >
          The Break Up With Your Tools CRM™
        </h1>

        {/* Password Prompt */}
        <div
          className={`bg-gradient-to-br from-[#101010] to-[#2a0a07] p-8 rounded-2xl shadow-2xl border border-[#7b1c14] w-full max-w-md transform transition-all duration-500 ease-out scale-95 relative overflow-hidden transition-opacity duration-500 ${showPasswordPrompt ? "opacity-100 visible animate-scale-in" : "opacity-0 invisible"}`}
        >
          {/* Futuristic Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div
              className="absolute inset-0 bg-[size:20px_20px] opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #7b1c14 1px, transparent 1px), linear-gradient(to bottom, #7b1c14 1px, transparent 1px)",
              }}
            ></div>
            <div
              className="absolute inset-0 bg-[size:40px_40px] opacity-5"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #a03a2e 1px, transparent 1px), linear-gradient(to bottom, #a03a2e 1px, transparent 1px)",
              }}
            ></div>
          </div>

          <div className="relative z-10">
            <p className="text-center text-gray-300 mb-6 text-lg font-light tracking-wide">
              Secure Beta Access
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-900 text-red-300 rounded-lg text-sm border border-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider"
                >
                  Quantum Key
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 bg-[#0a0a0a] border border-[#7b1c14] rounded-lg focus:ring-2 focus:ring-[#a03a2e] focus:border-transparent outline-none transition-all text-white placeholder-gray-500 shadow-inner-lg text-lg font-mono"
                  placeholder="Enter your quantum access key"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#7b1c14] to-[#a03a2e] hover:from-[#a03a2e] hover:to-[#7b1c14] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg tracking-wide"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying Access...
                  </>
                ) : (
                  "Unlock Axolop Now"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-600 text-center">
                This is a private beta for authorized users only.
              </p>
              <p className="text-xs text-gray-700 text-center mt-1">
                Axolop CRM v1.0.0-alpha
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaLogin;

