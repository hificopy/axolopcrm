import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/globals.css";

console.log("🚀 STEP-BY-STEP TEST START");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Test component
function TestApp() {
  console.log("🎯 TestApp rendering");
  return React.createElement(
    "div",
    {
      style: {
        padding: "20px",
        fontSize: "24px",
        color: "blue",
        background: "lightgray",
      },
    },
    "STEP-BY-STEP TEST - React works!",
  );
}

// Step 1: Basic React + ErrorBoundary
function Step1() {
  console.log("📍 Step 1: Basic React + ErrorBoundary");
  return React.createElement(ErrorBoundary, {}, React.createElement(TestApp));
}

// Step 2: Add QueryClient
function Step2() {
  console.log("📍 Step 2: Add QueryClient");
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(Step1),
  );
}

// Step 3: Add Helmet
function Step3() {
  console.log("📍 Step 3: Add Helmet");
  return React.createElement(HelmetProvider, {}, React.createElement(Step2));
}

// Step 4: Add Router
function Step4() {
  console.log("📍 Step 4: Add Router");
  return React.createElement(BrowserRouter, {}, React.createElement(Step3));
}

// Try each step incrementally
const root = ReactDOM.createRoot(document.getElementById("root"));

console.log("📦 Testing Step 1...");
try {
  root.render(React.createElement(Step1));
  console.log("✅ Step 1 successful");

  setTimeout(() => {
    console.log("📦 Testing Step 2...");
    try {
      root.render(React.createElement(Step2));
      console.log("✅ Step 2 successful");

      setTimeout(() => {
        console.log("📦 Testing Step 3...");
        try {
          root.render(React.createElement(Step3));
          console.log("✅ Step 3 successful");

          setTimeout(() => {
            console.log("📦 Testing Step 4...");
            try {
              root.render(React.createElement(Step4));
              console.log("✅ Step 4 successful - All basic providers work!");
            } catch (error) {
              console.error("❌ Step 4 failed:", error);
            }
          }, 1000);
        } catch (error) {
          console.error("❌ Step 3 failed:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("❌ Step 2 failed:", error);
    }
  }, 1000);
} catch (error) {
  console.error("❌ Step 1 failed:", error);
}
