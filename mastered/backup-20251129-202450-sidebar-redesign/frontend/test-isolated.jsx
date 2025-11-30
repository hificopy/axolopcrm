import React from "react";
import ReactDOM from "react-dom/client";

console.log("🚀 ISOLATED TEST START");

// Test 1: Basic React render
try {
  const root = ReactDOM.createRoot(document.getElementById("root"));

  function TestComponent() {
    console.log("🎯 TestComponent rendering");
    return React.createElement(
      "div",
      {
        style: {
          padding: "50px",
          fontSize: "32px",
          color: "red",
          background: "yellow",
          textAlign: "center",
        },
      },
      "ISOLATED REACT TEST - If you see this, React works!",
    );
  }

  console.log("📦 About to render TestComponent");
  root.render(React.createElement(TestComponent));
  console.log("✅ TestComponent rendered successfully");
} catch (error) {
  console.error("❌ React render failed:", error);

  // Fallback: render plain HTML
  document.getElementById("root").innerHTML = `
    <div style="padding: 50px; font-size: 32px; color: red; background: yellow; text-align: center;">
      ❌ REACT FAILED: ${error.message}
    </div>
  `;
}
