/**
 * Enhanced App Router with Payment Wall
 *
 * Handles payment wall redirection and route protection
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { useAccountStatus } from "../hooks/useAccountStatus";
import PaymentWall from "../components/billing/PaymentWall";
import PaymentWarningBanner from "../components/billing/PaymentWarningBanner";

// Import your existing app components
import Dashboard from "../pages/Dashboard";
import BillingSettings from "../pages/BillingSettings";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";
import Leads from "../pages/Leads";
import Contacts from "../pages/Contacts";
import Opportunities from "../pages/Opportunities";
import Calendar from "../pages/Calendar";
import Forms from "../pages/Forms";
import EmailMarketing from "../pages/EmailMarketing";
import Reports from "../pages/Reports";

// Protected Route Component
function ProtectedRoute({ children, allowedInPaymentWall = false }) {
  const { needsPaymentWall } = useAccountStatus();

  // If payment wall is active and this route is not allowed, redirect to billing
  if (needsPaymentWall() && !allowedInPaymentWall) {
    return <Navigate to="/app/settings/billing" replace />;
  }

  return children;
}

export default function AppRouter() {
  const { needsPaymentWall } = useAccountStatus();

  // Show payment wall if account is locked
  if (needsPaymentWall()) {
    return <PaymentWall />;
  }

  // Normal app with warning banner if needed
  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentWarningBanner />

      <Routes>
        {/* Protected Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/leads"
          element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/contacts"
          element={
            <ProtectedRoute>
              <Contacts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/opportunities"
          element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/forms"
          element={
            <ProtectedRoute>
              <Forms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/email-campaigns"
          element={
            <ProtectedRoute>
              <EmailMarketing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Settings Routes - Billing is always accessible */}
        <Route
          path="/app/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/settings/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/settings/billing"
          element={
            <ProtectedRoute allowedInPaymentWall={true}>
              <BillingSettings />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </div>
  );
}
