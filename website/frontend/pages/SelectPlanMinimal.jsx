/**
 * Minimal SelectPlan for debugging
 */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SelectPlanMinimal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  console.log("SelectPlanMinimal component loaded");
  console.log("SearchParams:", searchParams.toString());

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0F0510", color: "white" }}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Select Plan (Debug Version)</h1>
        <p className="text-gray-400 mb-8">
          This is a minimal version to debug the issue
        </p>

        <div className="space-x-4">
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Signup
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Go to Landing
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Current URL: {window.location.href}</p>
          <p>Plan param: {searchParams.get("plan") || "none"}</p>
        </div>
      </div>
    </div>
  );
}
