// Test auto-collapse functionality
import { useAutoCollapseSidebar } from "./frontend/hooks/useAutoCollapseSidebar.js";

// Mock React hooks for testing
const mockState = { isSidebarCollapsed: false };
const mockSetState = (state) => {
  console.log("Setting state:", state);
};

// Test the hook
try {
  const autoCollapse = useAutoCollapseSidebar(
    mockState.isSidebarCollapsed,
    mockSetState,
  );
  console.log("✅ Hook works:", autoCollapse);
  console.log("📦 Available methods:", Object.keys(autoCollapse));
} catch (error) {
  console.error("❌ Hook failed:", error.message);
}
