import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Add error handling for debugging
window.addEventListener("error", (event) => {
  console.error("🔥 Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("🔥 Unhandled promise rejection:", event.reason);
});

console.log("🚀 Main.jsx is loading!");
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { SupabaseProvider } from "./context/SupabaseContext";
import { AgencyProvider } from "./context/AgencyContext";
import { RolesProvider } from "./context/RolesContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DemoModeProvider } from "./contexts/DemoModeContext";
import { AffiliatePopupProvider } from "./contexts/AffiliatePopupContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <DemoModeProvider>
          <AffiliatePopupProvider>
            <SupabaseProvider>
              <AgencyProvider>
                <RolesProvider>
                  <BrowserRouter>
                    <QueryClientProvider client={queryClient}>
                      <ErrorBoundary>
                        <App />
                      </ErrorBoundary>
                    </QueryClientProvider>
                  </BrowserRouter>
                </RolesProvider>
              </AgencyProvider>
            </SupabaseProvider>
          </AffiliatePopupProvider>
        </DemoModeProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
