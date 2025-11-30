import { useState, useEffect } from "react";
import { useSupabase } from "./context/SupabaseContext";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import { Toaster } from "./components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";
import { ContextMenuProvider } from "./components/ui/ContextMenuProvider";
import AppBootstrap from "./components/AppBootstrap";
import {
  LazyDashboard,
  LazyContacts,
  LazyLeads,
  LazyOpportunities,
  LazyEmailMarketing,
  LazyCalendar,
  LazyForms,
  LazyWorkflows,
  LazySettings,
  withSuspense,
  ComponentLoader,
  preloadCriticalComponents,
} from "./utils/lazy-loading.jsx";

// Auth pages
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Onboarding from "./pages/Onboarding";
import SelectPlan from "./pages/SelectPlan";
import PaymentSuccess from "./pages/PaymentSuccess";

// Main pages - lazy loaded for performance
import Inbox from "./pages/Inbox";
import Pipeline from "./pages/Pipeline";
import UnifiedPipeline from "./pages/UnifiedPipeline";
import Activities from "./pages/Activities";
import Conversations from "./pages/Conversations";
import Calls from "./pages/Calls";
import TodoList from "./pages/TodoList";
import SecondBrain from "./pages/SecondBrain";
import AgencyManagement from "./pages/AgencyManagement";
import AgencyAnalytics from "./pages/AgencyAnalytics";
import ActivityLogPage from "./pages/ActivityLogPage";
import Profile from "./pages/Profile";
import CustomFieldsSettings from "./pages/CustomFieldsSettings";

// Settings pages
import AccountSettings from "./pages/AccountSettings";
import BillingSettings from "./pages/BillingSettings";
import AppRouter from "./components/AppRouter";
import CommunicationSettings from "./pages/CommunicationSettings";
import IntegrationsSettings from "./pages/IntegrationsSettings";
import CustomizationSettings from "./pages/CustomizationSettings";
import AgencySettings from "./pages/AgencySettings";
import RolesSettings from "./pages/RolesSettings";

// Forms pages
import FormBuilder from "./pages/FormBuilder";
import FormPreview from "./pages/FormPreview";
import FormAnalytics from "./pages/FormAnalytics";
import FormIntegrations from "./pages/FormIntegrations";
import PublicFormView from "./pages/PublicFormView";

// Marketing & Automation
import CreateCampaign from "./pages/CreateCampaign";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import WorkflowsPage from "./pages/WorkflowsPage";

// Support pages
import Tickets from "./pages/Tickets";
import KnowledgeBase from "./pages/KnowledgeBase";
import CustomerPortal from "./pages/CustomerPortal";
import SupportAnalytics from "./pages/SupportAnalytics";

// Other pages
import AffiliatePortal from "./pages/AffiliatePortal";
import BetaAccess from "./pages/BetaAccess";
import BookingEmbed from "./pages/BookingEmbed";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import GDPRPage from "./pages/GDPRPage";
import DataProcessingAgreement from "./pages/DataProcessingAgreement";
import ServiceLevelAgreement from "./pages/ServiceLevelAgreement";
import SecurityPractices from "./pages/SecurityPractices";
import NotFound from "./pages/NotFound";
import TooltipTest from "./pages/TooltipTest";
import TestUserType from "./pages/TestUserType";
import InvitePage from "./pages/InvitePage";
import TestPage from "./pages/TestPage";

// Public pages
import {
  About,
  Pricing,
  Contact,
  AffiliatePublic,
  Ambassador,
  Community,
  Academy,
  HelpCenter,
} from "./pages/public";
import Roadmap from "./pages/public/Roadmap";
import Blog from "./pages/public/Blog";
import Changelog from "./pages/public/Changelog";
import Status from "./pages/public/Status";
import Integrations from "./pages/public/Integrations";
import Careers from "./pages/public/Careers";

// Use Case pages
import Insurance from "./pages/public/use-cases/Insurance";
import CallCenters from "./pages/public/use-cases/CallCenters";
import MarketingAgencies from "./pages/public/use-cases/MarketingAgencies";
import RealEstate from "./pages/public/use-cases/RealEstate";
import B2BSales from "./pages/public/use-cases/B2BSales";
import Consulting from "./pages/public/use-cases/Consulting";

// Feature pages
import {
  FeatureLeads,
  FeaturePipeline,
  FeatureContacts,
  FeatureAnalytics,
  FeatureEmail,
  FeatureForms,
  FeatureAutomation,
  FeatureTickets,
  FeatureKnowledgeBase,
  FeaturePortal,
  FeatureSecondBrain,
  FeatureAIAssistant,
  FeatureMeetingsAI,
  FeatureWorkflows,
  FeatureSequences,
  FeatureTriggers,
} from "./pages/public/features";

// New feature pages
import FeatureFunnels from "./pages/public/features/FeatureFunnels";
import FeatureCalls from "./pages/public/features/FeatureCalls";
import FeatureCalendar from "./pages/public/features/FeatureCalendar";
import FeatureProjects from "./pages/public/features/FeatureProjects";
import FeatureMindMaps from "./pages/public/features/FeatureMindMaps";
import FeatureReports from "./pages/public/features/FeatureReports";
import FeatureIntegrations from "./pages/public/features/FeatureIntegrations";
import FeatureMobile from "./pages/public/features/FeatureMobile";
import FeatureSecurity from "./pages/public/features/FeatureSecurity";
import FeatureChat from "./pages/public/features/FeatureChat";

function App() {
  const location = useLocation();

  // Check if current route is public (doesn't need auth or bootstrap)
  const isPublicRoute = !location.pathname.startsWith("/app");

  // For localhost development, we'll render without ProtectedRoute
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Preload critical components after app mounts
  useEffect(() => {
    if (!isPublicRoute) {
      // Preload critical components for authenticated users
      preloadCriticalComponents();
    }
  }, [isPublicRoute]);

  return (
    <ErrorBoundary>
      <ContextMenuProvider>
        <div className="app">
          {isPublicRoute ? (
            // Public routes - NO LOADING SCREENS, INSTANT LOAD
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/select-plan" element={<SelectPlan />} />
              <Route
                path="/select-plan-debug"
                element={<SelectPlanMinimal />}
              />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/book/:slug" element={<BookingEmbed />} />
              <Route path="/booking/:bookingId" element={<BookingEmbed />} />
              <Route path="/forms/preview/:formId" element={<FormPreview />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/gdpr" element={<GDPRPage />} />
              <Route path="/dpa" element={<DataProcessingAgreement />} />
              <Route path="/sla" element={<ServiceLevelAgreement />} />
              <Route path="/security" element={<SecurityPractices />} />

              {/* New Public Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/affiliate-program" element={<AffiliatePublic />} />
              <Route path="/ambassador" element={<Ambassador />} />
              <Route path="/community" element={<Community />} />
              <Route path="/academy" element={<Academy />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/status" element={<Status />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/careers" element={<Careers />} />

              {/* Use Case Pages */}
              <Route path="/use-cases/insurance" element={<Insurance />} />
              <Route path="/use-cases/call-centers" element={<CallCenters />} />
              <Route
                path="/use-cases/marketing-agencies"
                element={<MarketingAgencies />}
              />
              <Route path="/use-cases/real-estate" element={<RealEstate />} />
              <Route path="/use-cases/b2b-sales" element={<B2BSales />} />
              <Route path="/use-cases/consulting" element={<Consulting />} />

              {/* Feature Pages - Sales Tools */}
              <Route path="/features/leads" element={<FeatureLeads />} />
              <Route path="/features/pipeline" element={<FeaturePipeline />} />
              <Route path="/features/contacts" element={<FeatureContacts />} />
              <Route path="/features/funnels" element={<FeatureFunnels />} />
              <Route path="/features/calls" element={<FeatureCalls />} />
              <Route path="/features/calendar" element={<FeatureCalendar />} />
              <Route
                path="/features/analytics"
                element={<FeatureAnalytics />}
              />

              {/* Feature Pages - Marketing Tools */}
              <Route path="/features/email" element={<FeatureEmail />} />
              <Route path="/features/forms" element={<FeatureForms />} />
              <Route
                path="/features/automation"
                element={<FeatureAutomation />}
              />

              {/* Feature Pages - Business Tools */}
              <Route path="/features/chat" element={<FeatureChat />} />
              <Route path="/features/projects" element={<FeatureProjects />} />
              <Route path="/features/reports" element={<FeatureReports />} />
              <Route
                path="/features/integrations"
                element={<FeatureIntegrations />}
              />
              <Route path="/features/mobile" element={<FeatureMobile />} />
              <Route path="/features/security" element={<FeatureSecurity />} />

              {/* Feature Pages - Service Tools */}
              <Route path="/features/tickets" element={<FeatureTickets />} />
              <Route
                path="/features/knowledge-base"
                element={<FeatureKnowledgeBase />}
              />
              <Route path="/features/portal" element={<FeaturePortal />} />

              {/* Feature Pages - AI Tools */}
              <Route
                path="/features/second-brain"
                element={<FeatureSecondBrain />}
              />
              <Route
                path="/features/ai-assistant"
                element={<FeatureAIAssistant />}
              />
              <Route path="/features/mind-maps" element={<FeatureMindMaps />} />
              <Route
                path="/features/meetings-ai"
                element={<FeatureMeetingsAI />}
              />

              {/* Feature Pages - Automation */}
              <Route
                path="/features/workflows"
                element={<FeatureWorkflows />}
              />
              <Route
                path="/features/sequences"
                element={<FeatureSequences />}
              />
              <Route path="/features/triggers" element={<FeatureTriggers />} />

              {/* Agency invite link route */}
              <Route
                path="/invite/:agencySlug/:inviteCode"
                element={<InvitePage />}
              />

              {/* Public form route - using /f/ prefix to avoid routing conflicts */}
              <Route
                path="/f/:agencyAlias/:formSlug"
                element={<PublicFormView />}
              />
              {/* Legacy route redirect - for backwards compatibility */}
              <Route
                path="/form/:agencyAlias/:formSlug"
                element={
                  <Navigate
                    to={`/f/${window.location.pathname.split("/form/")[1] || ""}`}
                    replace
                  />
                }
              />

              {/* Test route */}
              <Route path="/test" element={<TestPage />} />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          ) : (
            // Authenticated app routes - WRAPPED IN APPBOOTSTRAP
            <AppBootstrap>
              <Routes location={location}>
                {/* Main app routes with /app prefix */}
                <Route path="/app" element={<MainLayout />}>
                  <Route index element={<Navigate to="/app/home" replace />} />

                  {/* Conditionally render routes with or without ProtectedRoute based on environment */}
                  {isLocalhost ? (
                    <>
                      <Route
                        path="home"
                        element={withSuspense(LazyDashboard)}
                      />
                      <Route path="inbox" element={<Inbox />} />
                      <Route path="leads" element={withSuspense(LazyLeads)} />
                      <Route
                        path="contacts"
                        element={withSuspense(LazyContacts)}
                      />
                      <Route
                        path="opportunities"
                        element={withSuspense(LazyOpportunities)}
                      />
                      <Route path="pipeline" element={<Pipeline />} />
                      <Route path="activities" element={<Activities />} />
                      <Route path="conversations" element={<Conversations />} />
                      <Route path="calls" element={<Calls />} />
                      <Route
                        path="calendar"
                        element={withSuspense(LazyCalendar)}
                      />
                      <Route path="todos" element={<TodoList />} />
                      <Route path="second-brain" element={<SecondBrain />} />
                      <Route path="profile" element={<Profile />} />

                      {/* Marketing & Automation */}
                      <Route
                        path="email-marketing"
                        element={withSuspense(LazyEmailMarketing)}
                      />
                      <Route
                        path="email-marketing/create"
                        element={<CreateCampaign />}
                      />
                      <Route
                        path="workflows"
                        element={withSuspense(LazyWorkflows)}
                      />
                      <Route
                        path="workflows/builder/:workflowId?"
                        element={<WorkflowBuilder />}
                      />

                      {/* Forms */}
                      <Route path="forms" element={withSuspense(LazyForms)} />
                      <Route
                        path="forms/builder/:formId?"
                        element={<FormBuilder />}
                      />
                      <Route
                        path="forms/preview/:formId"
                        element={<FormPreview />}
                      />
                      <Route
                        path="forms/analytics/:formId"
                        element={<FormAnalytics />}
                      />
                      <Route
                        path="forms/integrations/:formId"
                        element={<FormIntegrations />}
                      />

                      {/* Support */}
                      <Route path="tickets" element={<Tickets />} />
                      <Route
                        path="knowledge-base"
                        element={<KnowledgeBase />}
                      />
                      <Route
                        path="customer-portal"
                        element={<CustomerPortal />}
                      />
                      <Route
                        path="support-analytics"
                        element={<SupportAnalytics />}
                      />

                      {/* Other */}
                      <Route path="affiliate" element={<AffiliatePortal />} />
                      <Route path="beta-access" element={<BetaAccess />} />
                      <Route path="tooltip-test" element={<TooltipTest />} />
                      <Route path="test-user-type" element={<TestUserType />} />
                    </>
                  ) : (
                    <>
                      <Route
                        path="home"
                        element={
                          <ProtectedRoute>
                            {withSuspense(LazyDashboard)}
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="inbox"
                        element={
                          <ProtectedRoute>
                            <Inbox />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="leads"
                        element={
                          <ProtectedRoute>
                            {withSuspense(LazyLeads)}
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="contacts"
                        element={
                          <ProtectedRoute>
                            {withSuspense(LazyContacts)}
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="opportunities"
                        element={
                          <ProtectedRoute>
                            {withSuspense(LazyOpportunities)}
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="pipeline"
                        element={
                          <ProtectedRoute>
                            <Pipeline />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="activities"
                        element={
                          <ProtectedRoute>
                            <Activities />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="conversations"
                        element={
                          <ProtectedRoute>
                            <Conversations />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="calls"
                        element={
                          <ProtectedRoute>
                            <Calls />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="calendar"
                        element={
                          <ProtectedRoute>
                            {withSuspense(LazyCalendar)}
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="todos"
                        element={
                          <ProtectedRoute>
                            <TodoList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="second-brain"
                        element={
                          <ProtectedRoute>
                            <SecondBrain />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />

                      {/* Agency Management */}
                      <Route
                        path="agency-management"
                        element={
                          <ProtectedRoute>
                            <AgencyManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="agency-analytics"
                        element={
                          <ProtectedRoute>
                            <AgencyAnalytics />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="activity-log"
                        element={
                          <ProtectedRoute>
                            <ActivityLogPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Marketing & Automation */}
                      <Route
                        path="email-marketing"
                        element={
                          <ProtectedRoute>
                            {withSuspense(LazyEmailMarketing)}
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="email-marketing/create"
                        element={
                          <ProtectedRoute>
                            <CreateCampaign />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="workflows"
                        element={
                          <ProtectedRoute>
                            {withSuspense(LazyWorkflows)}
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="workflows/builder/:workflowId?"
                        element={
                          <ProtectedRoute>
                            <WorkflowBuilder />
                          </ProtectedRoute>
                        }
                      />

                      {/* Forms */}
                      <Route
                        path="forms"
                        element={
                          <ProtectedRoute>
                            {withSuspense(LazyForms)}
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="forms/builder/:formId?"
                        element={
                          <ProtectedRoute>
                            <FormBuilder />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="forms/preview/:formId"
                        element={
                          <ProtectedRoute>
                            <FormPreview />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="forms/analytics/:formId"
                        element={
                          <ProtectedRoute>
                            <FormAnalytics />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="forms/integrations/:formId"
                        element={
                          <ProtectedRoute>
                            <FormIntegrations />
                          </ProtectedRoute>
                        }
                      />

                      {/* Support */}
                      <Route
                        path="tickets"
                        element={
                          <ProtectedRoute>
                            <Tickets />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="knowledge-base"
                        element={
                          <ProtectedRoute>
                            <KnowledgeBase />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="customer-portal"
                        element={
                          <ProtectedRoute>
                            <CustomerPortal />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="support-analytics"
                        element={
                          <ProtectedRoute>
                            <SupportAnalytics />
                          </ProtectedRoute>
                        }
                      />

                      {/* Other */}
                      <Route
                        path="affiliate"
                        element={
                          <ProtectedRoute>
                            <AffiliatePortal />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="beta-access"
                        element={
                          <ProtectedRoute>
                            <BetaAccess />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="test-user-type"
                        element={
                          <ProtectedRoute>
                            <TestUserType />
                          </ProtectedRoute>
                        }
                      />
                    </>
                  )}

                  {/* Settings sub-routes */}
                  <Route
                    path="settings"
                    element={
                      isLocalhost ? (
                        withSuspense(LazySettings)
                      ) : (
                        <ProtectedRoute>
                          {withSuspense(LazySettings)}
                        </ProtectedRoute>
                      )
                    }
                  >
                    <Route index element={<Navigate to="account" replace />} />
                    <Route path="account" element={<AccountSettings />} />
                    <Route path="billing" element={<AppRouter />} />
                    <Route path="agency" element={<AgencySettings />}>
                      <Route
                        index
                        element={<Navigate to="general" replace />}
                      />
                      <Route path="general" element={<AgencySettings />} />
                      <Route path="team" element={<AgencySettings />} />
                      <Route path="permissions" element={<AgencySettings />} />
                    </Route>
                    {/* Redirect old organization routes to agency */}
                    <Route
                      path="organization/*"
                      element={
                        <Navigate to="/app/settings/agency/general" replace />
                      }
                    />
                    <Route
                      path="communication"
                      element={<CommunicationSettings />}
                    >
                      <Route index element={<Navigate to="email" replace />} />
                      <Route path="phone" element={<CommunicationSettings />} />
                      <Route
                        path="dialer"
                        element={<CommunicationSettings />}
                      />
                      <Route
                        path="outcomes"
                        element={<CommunicationSettings />}
                      />
                      <Route
                        path="notetaker"
                        element={<CommunicationSettings />}
                      />
                      <Route path="email" element={<CommunicationSettings />} />
                      <Route
                        path="templates"
                        element={<CommunicationSettings />}
                      />
                      <Route
                        path="sendas"
                        element={<CommunicationSettings />}
                      />
                    </Route>
                    <Route
                      path="customization"
                      element={<CustomizationSettings />}
                    >
                      <Route index element={<Navigate to="fields" replace />} />
                      <Route
                        path="fields"
                        element={<CustomizationSettings />}
                      />
                      <Route path="links" element={<CustomizationSettings />} />
                      <Route
                        path="scheduling"
                        element={<CustomizationSettings />}
                      />
                      <Route
                        path="statuses"
                        element={<CustomizationSettings />}
                      />
                      <Route path="ai" element={<CustomizationSettings />} />
                    </Route>
                    <Route
                      path="integrations"
                      element={<IntegrationsSettings />}
                    >
                      <Route
                        index
                        element={<Navigate to="integrations" replace />}
                      />
                      <Route
                        path="integrations"
                        element={<IntegrationsSettings />}
                      />
                      <Route
                        path="accounts"
                        element={<IntegrationsSettings />}
                      />
                      <Route
                        path="developer"
                        element={<IntegrationsSettings />}
                      />
                    </Route>
                    <Route
                      path="custom-fields"
                      element={
                        isLocalhost ? (
                          <CustomFieldsSettings />
                        ) : (
                          <ProtectedRoute>
                            <CustomFieldsSettings />
                          </ProtectedRoute>
                        )
                      }
                    />
                    <Route
                      path="agency"
                      element={
                        isLocalhost ? (
                          <AgencySettings />
                        ) : (
                          <ProtectedRoute>
                            <AgencySettings />
                          </ProtectedRoute>
                        )
                      }
                    />
                    <Route
                      path="roles"
                      element={
                        isLocalhost ? (
                          <RolesSettings />
                        ) : (
                          <ProtectedRoute>
                            <RolesSettings />
                          </ProtectedRoute>
                        )
                      }
                    />
                  </Route>
                </Route>
              </Routes>
            </AppBootstrap>
          )}
          <Toaster />
        </div>
      </ContextMenuProvider>
    </ErrorBoundary>
  );
}

export default App;
