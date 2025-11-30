import React from "react";
import ReactDOM from "react-dom/client";

console.log("Minimal test starting");

const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <div style={{ padding: "20px", fontSize: "24px", color: "blue" }}>
      Minimal React Test - If you see this, React works!
    </div>,
  );
  console.log("Minimal test rendered");
} else {
  console.error("No root element found");
}
