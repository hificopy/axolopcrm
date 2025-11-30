import React from "react";
import ReactDOM from "react-dom/client";

console.log("🚀 No-JSX test starting");

const element = React.createElement(
  "div",
  {
    style: { padding: "20px", fontSize: "24px", color: "blue" },
  },
  "No-JSX Test - If you see this, React works without JSX!",
);

const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(element);
    console.log("✅ No-JSX test rendered successfully");
  } catch (error) {
    console.error("❌ Error rendering no-JSX test:", error);
    document.body.innerHTML =
      '<div style="background: red; color: white; padding: 20px;">No-JSX Error: ' +
      error.message +
      "</div>";
  }
} else {
  console.error("No root element found");
}
