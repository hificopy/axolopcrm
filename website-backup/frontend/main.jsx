import React from "react";
import ReactDOM from "react-dom/client";

// Simple bypass test
const rootElement = document.getElementById("root");

if (rootElement) {
  // Clear any existing content
  rootElement.innerHTML = "";

  // Add a visible element with inline styles (bypassing all CSS)
  const testElement = document.createElement("div");
  testElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    color: white;
    padding: 40px;
    font-size: 32px;
    font-family: Arial, sans-serif;
    z-index: 999999;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;
  testElement.textContent = "🎯 AXOLOP CRM IS LOADING! 🎯";

  rootElement.appendChild(testElement);

  console.log("✅ Bypass test element added");

  // Now try React
  try {
    const reactElement = React.createElement(
      "div",
      {
        style: {
          position: "fixed",
          bottom: "20px",
          left: "20px",
          background: "#761b14",
          color: "white",
          padding: "20px",
          fontSize: "18px",
          borderRadius: "8px",
          fontFamily: "Arial, sans-serif",
        },
      },
      "✅ React Component Rendered Successfully!",
    );

    ReactDOM.createRoot(rootElement).render(reactElement);
    console.log("✅ React component rendered");
  } catch (error) {
    console.error("❌ React error:", error);
  }
} else {
  console.error("❌ Root element not found");
}
