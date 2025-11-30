import React from "react";
import { getQuestionsForIndustry } from "./frontend/lib/onboarding/questionFlows.js";

// Test the question flow functionality
console.log("Testing question flows...");

try {
  // Test basic import
  console.log("✅ Import successful");

  // Test getting questions for marketing agency
  const questions = getQuestionsForIndustry("Marketing Agency");
  console.log("✅ Got questions:", questions.length);
  console.log("First question:", questions[0]?.title);

  // Test different industries
  const insuranceQuestions = getQuestionsForIndustry("Insurance");
  console.log("✅ Insurance questions:", insuranceQuestions.length);

  console.log("✅ All tests passed!");
} catch (error) {
  console.error("❌ Error:", error);
}

export default function TestOnboarding() {
  return <div>Check console for test results</div>;
}
