import React from "react";

export default function TestPage() {
  return (
    <div style={{ padding: "20px", fontSize: "24px", color: "red" }}>
      <h1>TEST PAGE - If you see this, React is working!</h1>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>Window location: {window.location.href}</p>
    </div>
  );
}
