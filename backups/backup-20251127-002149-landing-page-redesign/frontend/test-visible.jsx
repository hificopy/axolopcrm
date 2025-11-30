import React from "react";
import ReactDOM from "react-dom/client";

console.log("🚀 VISIBLE TEST START");

try {
  const root = ReactDOM.createRoot(document.getElementById("root"));

  function VisibleTest() {
    console.log("🎯 VisibleTest rendering");

    // Use inline styles that override everything
    const containerStyle = {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "brightred",
      color: "white",
      fontSize: "48px",
      zIndex: "999999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      fontFamily: "monospace",
      padding: "20px",
      boxSizing: "border-box",
      overflow: "hidden",
      margin: "0",
      border: "none",
      outline: "10px solid blue",
      visibility: "visible",
      opacity: "1",
    };

    return React.createElement("div", { style: containerStyle }, [
      React.createElement("h1", { key: "title" }, "🔥 VISIBLE TEST 🔥"),
      React.createElement(
        "div",
        { key: "time", style: { fontSize: "24px", marginTop: "20px" } },
        `Time: ${new Date().toLocaleTimeString()}`,
      ),
      React.createElement(
        "div",
        { key: "url", style: { fontSize: "18px", marginTop: "10px" } },
        `URL: ${window.location.href}`,
      ),
      React.createElement(
        "button",
        {
          key: "button",
          onClick: () => alert("Button clicked!"),
          style: {
            fontSize: "20px",
            padding: "10px 20px",
            marginTop: "20px",
            backgroundColor: "yellow",
            color: "black",
            border: "2px solid black",
            cursor: "pointer",
          },
        },
        "CLICK ME",
      ),
    ]);
  }

  console.log("📦 About to render VisibleTest");
  root.render(React.createElement(VisibleTest));
  console.log("✅ VisibleTest rendered successfully");

  // Also add content directly to DOM as fallback
  setTimeout(() => {
    const rootEl = document.getElementById("root");
    if (rootEl && !rootEl.children.length) {
      console.log("❌ React failed to render, adding fallback content");
      rootEl.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: orange; color: white; font-size: 48px; display: flex; align-items: center; justify-content: center; z-index: 999999;">
          ❌ FALLBACK CONTENT - React failed to render
        </div>
      `;
    }
  }, 2000);
} catch (error) {
  console.error("❌ Visible test failed:", error);

  // Immediate fallback
  document.getElementById("root").innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: red; color: white; font-size: 48px; display: flex; align-items: center; justify-content: center; z-index: 999999;">
      ❌ CRITICAL ERROR: ${error.message}
    </div>
  `;
}
