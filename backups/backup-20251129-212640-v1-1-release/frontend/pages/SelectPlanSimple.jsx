/**
 * Simplified SelectPlan for debugging
 */
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

console.log("SelectPlan.jsx: Starting module import");

export default function SelectPlan() {
  console.log("SelectPlan: Component rendering");

  try {
    const [searchParams] = useSearchParams();
    const [isYearly, setIsYearly] = useState(true);
    const navigate = useNavigate();

    console.log("SelectPlan: Hooks initialized");

    const preSelectedPlan = searchParams.get("plan");

    console.log("SelectPlan: Pre-selected plan:", preSelectedPlan);

    // Simple render without authentication for now
    return (
      <div
        className="min-h-screen text-white"
        style={{ background: "#0F0510" }}
      >
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            Select Your Plan
          </h1>

          <div className="max-w-md mx-auto space-y-4">
            <div className="p-6 border border-gray-700 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Sales Plan</h2>
              <p className="text-gray-400 mb-4">
                $67/month or $54/month (yearly)
              </p>
              <button
                onClick={() => alert("Plan selected!")}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Select Sales Plan
              </button>
            </div>

            <div className="text-center">
              <Link to="/" className="text-blue-400 hover:text-blue-300">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("SelectPlan: Error rendering:", error);
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0F0510", color: "white" }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Error Loading Page
          </h1>
          <p className="text-gray-400 mb-4">{error.message}</p>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }
}
