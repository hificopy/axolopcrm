import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/globals.css";

console.log("🚀 CONTEXT TEST START");

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
        color: "green",
        background: "lightyellow",
      },
    },
    "CONTEXT TEST - Testing providers...",
  );
}

// Import contexts dynamically to catch errors
let ThemeProvider,
  DemoModeProvider,
  AffiliatePopupProvider,
  SupabaseProvider,
  AgencyProvider;

try {
  console.log("📦 Importing ThemeProvider...");
  const themeModule = await import("./contexts/ThemeContext");
  ThemeProvider = themeModule.ThemeProvider;
  console.log("✅ ThemeProvider imported");
} catch (error) {
  console.error("❌ ThemeProvider import failed:", error);
}

try {
  console.log("📦 Importing DemoModeProvider...");
  const demoModule = await import("./contexts/DemoModeContext");
  DemoModeProvider = demoModule.DemoModeProvider;
  console.log("✅ DemoModeProvider imported");
} catch (error) {
  console.error("❌ DemoModeProvider import failed:", error);
}

try {
  console.log("📦 Importing AffiliatePopupProvider...");
  const affiliateModule = await import("./contexts/AffiliatePopupContext");
  AffiliatePopupProvider = affiliateModule.AffiliatePopupProvider;
  console.log("✅ AffiliatePopupProvider imported");
} catch (error) {
  console.error("❌ AffiliatePopupProvider import failed:", error);
}

try {
  console.log("📦 Importing SupabaseProvider...");
  const supabaseModule = await import("./context/SupabaseContext");
  SupabaseProvider = supabaseModule.SupabaseProvider;
  console.log("✅ SupabaseProvider imported");
} catch (error) {
  console.error("❌ SupabaseProvider import failed:", error);
}

try {
  console.log("📦 Importing AgencyProvider...");
  const agencyModule = await import("./context/AgencyContext");
  AgencyProvider = agencyModule.AgencyProvider;
  console.log("✅ AgencyProvider imported");
} catch (error) {
  console.error("❌ AgencyProvider import failed:", error);
}

// Build component tree step by step
function buildComponentTree() {
  console.log("🏗️ Building component tree...");

  let component = React.createElement(TestApp);

  // Step 1: ErrorBoundary
  component = React.createElement(ErrorBoundary, {}, component);
  console.log("✅ Added ErrorBoundary");

  // Step 2: QueryClient
  component = React.createElement(
    QueryClientProvider,
    { client: queryClient },
    component,
  );
  console.log("✅ Added QueryClientProvider");

  // Step 3: Helmet
  component = React.createElement(HelmetProvider, {}, component);
  console.log("✅ Added HelmetProvider");

  // Step 4: Router
  component = React.createElement(BrowserRouter, {}, component);
  console.log("✅ Added BrowserRouter");

  // Step 5: ThemeProvider
  if (ThemeProvider) {
    component = React.createElement(ThemeProvider, {}, component);
    console.log("✅ Added ThemeProvider");
  }

  // Step 6: DemoModeProvider
  if (DemoModeProvider) {
    component = React.createElement(DemoModeProvider, {}, component);
    console.log("✅ Added DemoModeProvider");
  }

  // Step 7: AffiliatePopupProvider
  if (AffiliatePopupProvider) {
    component = React.createElement(AffiliatePopupProvider, {}, component);
    console.log("✅ Added AffiliatePopupProvider");
  }

  // Step 8: SupabaseProvider
  if (SupabaseProvider) {
    component = React.createElement(SupabaseProvider, {}, component);
    console.log("✅ Added SupabaseProvider");
  }

  // Step 9: AgencyProvider
  if (AgencyProvider) {
    component = React.createElement(AgencyProvider, {}, component);
    console.log("✅ Added AgencyProvider");
  }

  return component;
}

// Render
const root = ReactDOM.createRoot(document.getElementById("root"));

try {
  const finalComponent = buildComponentTree();
  console.log("📦 Rendering final component tree...");
  root.render(finalComponent);
  console.log("✅ Context test rendered successfully");
} catch (error) {
  console.error("❌ Context test failed:", error);

  // Fallback
  root.render(
    React.createElement(
      "div",
      {
        style: {
          padding: "50px",
          fontSize: "32px",
          color: "red",
          background: "yellow",
        },
      },
      `❌ CONTEXT TEST FAILED: ${error.message}`,
    ),
  );
}
