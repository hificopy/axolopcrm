import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";

console.log("🚀 INDIVIDUAL CONTEXT TEST START");

function TestApp() {
  console.log("🎯 TestApp rendering");
  return React.createElement(
    "div",
    {
      style: {
        padding: "20px",
        fontSize: "24px",
        color: "purple",
        background: "lightblue",
      },
    },
    "INDIVIDUAL CONTEXT TEST",
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

// Test each context individually
async function testContexts() {
  const contexts = [
    { name: "ThemeProvider", path: "./contexts/ThemeContext" },
    { name: "DemoModeProvider", path: "./contexts/DemoModeContext" },
    {
      name: "AffiliatePopupProvider",
      path: "./contexts/AffiliatePopupContext",
    },
    { name: "SupabaseProvider", path: "./context/SupabaseContext" },
    { name: "AgencyProvider", path: "./context/AgencyContext" },
  ];

  for (const context of contexts) {
    try {
      console.log(`📦 Testing ${context.name}...`);
      const module = await import(context.path);
      const Provider = module[context.name];

      if (Provider) {
        console.log(`✅ ${context.name} imported successfully`);

        // Try to render with just this provider
        const testComponent = React.createElement(
          Provider,
          {},
          React.createElement(TestApp),
        );

        root.render(testComponent);
        console.log(`✅ ${context.name} rendered successfully`);

        // Wait 2 seconds before next test
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        console.error(`❌ ${context.name} not found in module`);
      }
    } catch (error) {
      console.error(`❌ ${context.name} failed:`, error);

      // Show error on screen
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
          `❌ ${context.name} FAILED: ${error.message}`,
        ),
      );

      // Stop testing further contexts
      return;
    }
  }

  console.log("✅ All contexts tested successfully");
}

testContexts();
