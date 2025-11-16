import { useSupabase } from './context/SupabaseContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Inbox from './pages/Inbox';
import Leads from './pages/Leads';
import Contacts from './pages/Contacts';
import Pipeline from './pages/Pipeline';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';
import BillingSettings from './pages/BillingSettings';
import Settings from './pages/Settings';
import OrganizationSettings from './pages/OrganizationSettings';
import CommunicationSettings from './pages/CommunicationSettings';
import IntegrationsSettings from './pages/IntegrationsSettings';
import CustomizationSettings from './pages/CustomizationSettings';
import Forms from './pages/Forms';
import FormBuilder from './pages/FormBuilder';
import FormPreview from './pages/FormPreview';
import FormAnalytics from './pages/FormAnalytics';
import FormIntegrations from './pages/FormIntegrations';
import Tickets from './pages/Tickets';
import KnowledgeBase from './pages/KnowledgeBase';
import CustomerPortal from './pages/CustomerPortal';
import SupportAnalytics from './pages/SupportAnalytics';
import EmailMarketing from './pages/EmailMarketing';
import WorkflowBuilder from './pages/WorkflowBuilder';
import CreateCampaign from './pages/CreateCampaign';
import Dashboard from './pages/Dashboard';
import BetaLogin from './pages/BetaLogin';
import NotFound from './pages/NotFound';

// Under Construction Mode - set to true to redirect all pages to password page
const UNDER_CONSTRUCTION = false; // Simple toggle: true = redirect to password page, false = show normal app
const DEV_MODE = true; // Enable dev mode to bypass all authentication for localhost
const DEV_USER = {
  email: 'juan@axolop.com',
  name: 'Juan D. Romero',
  role: 'CEO',
  permissions: ['all']
};

function App() {
  const { user, loading, signInWithOAuth } = useSupabase();
  // Check for beta access in session storage
  const hasBetaAccess = sessionStorage.getItem('betaAccess') === 'true';
  const isLoading = loading && !DEV_MODE && !hasBetaAccess;
  
  // If in DEV_MODE, bypass all auth and go directly to app
  if (DEV_MODE) {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <div className="app">
            <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="leads" element={<Leads />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />}>
              <Route index element={<Navigate to="organization/general" replace />} />
              <Route path="account" element={<AccountSettings />} />
              <Route path="billing" element={<BillingSettings />} />
              <Route path="organization" element={<OrganizationSettings />}>
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<OrganizationSettings />} />
                <Route path="team" element={<OrganizationSettings />} />
                <Route path="permissions" element={<OrganizationSettings />} />
              </Route>
              <Route path="communication" element={<CommunicationSettings />}>
                <Route index element={<Navigate to="email" replace />} />
                <Route path="phone" element={<CommunicationSettings />} />
                <Route path="dialer" element={<CommunicationSettings />} />
                <Route path="outcomes" element={<CommunicationSettings />} />
                <Route path="notetaker" element={<CommunicationSettings />} />
                <Route path="email" element={<CommunicationSettings />} />
                <Route path="templates" element={<CommunicationSettings />} />
                <Route path="sendas" element={<CommunicationSettings />} />
              </Route>
              <Route path="customization" element={<CustomizationSettings />}>
                <Route index element={<Navigate to="fields" replace />} />
                <Route path="fields" element={<CustomizationSettings />} />
                <Route path="links" element={<CustomizationSettings />} />
                <Route path="scheduling" element={<CustomizationSettings />} />
                <Route path="statuses" element={<CustomizationSettings />} />
                <Route path="ai" element={<CustomizationSettings />} />
              </Route>
              <Route path="integrations" element={<IntegrationsSettings />}>
                <Route index element={<Navigate to="integrations" replace />} />
                <Route path="integrations" element={<IntegrationsSettings />} />
                <Route path="accounts" element={<IntegrationsSettings />} />
                <Route path="developer" element={<IntegrationsSettings />} />
              </Route>
            </Route>
            <Route path="forms" element={<Forms />} />
            <Route path="forms/builder/:formId?" element={<FormBuilder />} />
            <Route path="forms/preview/:formId" element={<FormPreview />} />
            <Route path="forms/analytics/:formId" element={<FormAnalytics />} />
            <Route path="forms/integrations/:formId" element={<FormIntegrations />} />
            {/* Service Category Routes */}
            <Route path="tickets" element={<Tickets />} />
            <Route path="knowledge-base" element={<KnowledgeBase />} />
            <Route path="customer-portal" element={<CustomerPortal />} />
            <Route path="support-analytics" element={<SupportAnalytics />} />
            <Route path="email-marketing" element={<EmailMarketing />} />
            <Route path="email-marketing/workflows/create" element={<WorkflowBuilder />} />
            <Route path="email-marketing/workflows/:workflowId" element={<WorkflowBuilder />} />
            <Route path="email-marketing/campaigns/create" element={<CreateCampaign />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </div>
    </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // Redirect all routes to password page when under construction mode is on
  if (UNDER_CONSTRUCTION && !hasBetaAccess && window.location.pathname !== '/password') {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <Routes>
          <Route path="*" element={<Navigate to="/password" replace />} />
          <Route path="/password" element={<BetaLogin />} />
        </Routes>
      </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // Check if user is authenticated with Supabase
  const isAuthenticated = !!user;

  // Development mode bypass
  if (DEV_MODE) {
    // Skip Auth0 and go straight to the app
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <div className="app">
            <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="leads" element={<Leads />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />}>
              <Route index element={<Navigate to="organization/general" replace />} />
              <Route path="account" element={<AccountSettings />} />
              <Route path="billing" element={<BillingSettings />} />
              <Route path="organization" element={<OrganizationSettings />}>
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<OrganizationSettings />} />
                <Route path="team" element={<OrganizationSettings />} />
                <Route path="permissions" element={<OrganizationSettings />} />
              </Route>
              <Route path="communication" element={<CommunicationSettings />}>
                <Route index element={<Navigate to="email" replace />} />
                <Route path="phone" element={<CommunicationSettings />} />
                <Route path="dialer" element={<CommunicationSettings />} />
                <Route path="outcomes" element={<CommunicationSettings />} />
                <Route path="notetaker" element={<CommunicationSettings />} />
                <Route path="email" element={<CommunicationSettings />} />
                <Route path="templates" element={<CommunicationSettings />} />
                <Route path="sendas" element={<CommunicationSettings />} />
              </Route>
              <Route path="customization" element={<CustomizationSettings />}>
                <Route index element={<Navigate to="fields" replace />} />
                <Route path="fields" element={<CustomizationSettings />} />
                <Route path="links" element={<CustomizationSettings />} />
                <Route path="scheduling" element={<CustomizationSettings />} />
                <Route path="statuses" element={<CustomizationSettings />} />
                <Route path="ai" element={<CustomizationSettings />} />
              </Route>
              <Route path="integrations" element={<IntegrationsSettings />}>
                <Route index element={<Navigate to="integrations" replace />} />
                <Route path="integrations" element={<IntegrationsSettings />} />
                <Route path="accounts" element={<IntegrationsSettings />} />
                <Route path="developer" element={<IntegrationsSettings />} />
              </Route>
            </Route>
            <Route path="forms" element={<Forms />} />
            <Route path="forms/builder/:formId?" element={<FormBuilder />} />
            <Route path="forms/preview/:formId" element={<FormPreview />} />
            <Route path="forms/analytics/:formId" element={<FormAnalytics />} />
            <Route path="forms/integrations/:formId" element={<FormIntegrations />} />
            {/* Service Category Routes */}
            <Route path="tickets" element={<Tickets />} />
            <Route path="knowledge-base" element={<KnowledgeBase />} />
            <Route path="customer-portal" element={<CustomerPortal />} />
            <Route path="support-analytics" element={<SupportAnalytics />} />
            <Route path="email-marketing" element={<EmailMarketing />} />
            <Route path="email-marketing/workflows/create" element={<WorkflowBuilder />} />
            <Route path="email-marketing/workflows/:workflowId" element={<WorkflowBuilder />} />
            <Route path="email-marketing/campaigns/create" element={<CreateCampaign />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </div>
    </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <ErrorBoundary>
        <div className="flex h-screen items-center justify-center bg-crm-bg-light">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-blue border-t-transparent"></div>
          <p className="text-crm-text-secondary">Loading Axolop CRM...</p>
        </div>
      </div>
      </ErrorBoundary>
    );
  }

  // Check if user has beta access before showing the main application
  if (!hasBetaAccess && window.location.pathname !== '/password') {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <Routes>
          <Route path="*" element={<Navigate to="/password" replace />} />
          <Route path="/password" element={<BetaLogin />} />
        </Routes>
      </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="app">
          <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
            <Route path="leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>}>
              <Route index element={<Navigate to="organization/general" replace />} />
              <Route path="account" element={<AccountSettings />} />
              <Route path="billing" element={<BillingSettings />} />
              <Route path="organization" element={<OrganizationSettings />}>
                <Route index element={<Navigate to="general" replace />} />
                <Route path="general" element={<OrganizationSettings />} />
                <Route path="team" element={<OrganizationSettings />} />
                <Route path="permissions" element={<OrganizationSettings />} />
              </Route>
              <Route path="communication" element={<CommunicationSettings />}>
                <Route index element={<Navigate to="email" replace />} />
                <Route path="phone" element={<CommunicationSettings />} />
                <Route path="dialer" element={<CommunicationSettings />} />
                <Route path="outcomes" element={<CommunicationSettings />} />
                <Route path="notetaker" element={<CommunicationSettings />} />
                <Route path="email" element={<CommunicationSettings />} />
                <Route path="templates" element={<CommunicationSettings />} />
                <Route path="sendas" element={<CommunicationSettings />} />
              </Route>
              <Route path="customization" element={<CustomizationSettings />}>
                <Route index element={<Navigate to="fields" replace />} />
                <Route path="fields" element={<CustomizationSettings />} />
                <Route path="links" element={<CustomizationSettings />} />
                <Route path="scheduling" element={<CustomizationSettings />} />
                <Route path="statuses" element={<CustomizationSettings />} />
                <Route path="ai" element={<CustomizationSettings />} />
              </Route>
              <Route path="integrations" element={<IntegrationsSettings />}>
                <Route index element={<Navigate to="integrations" replace />} />
                <Route path="integrations" element={<IntegrationsSettings />} />
                <Route path="accounts" element={<IntegrationsSettings />} />
                <Route path="developer" element={<IntegrationsSettings />} />
              </Route>
            </Route>
            <Route path="forms" element={<Forms />} />
            <Route path="forms/builder/:formId?" element={<FormBuilder />} />
            <Route path="forms/preview/:formId" element={<FormPreview />} />
            <Route path="forms/analytics/:formId" element={<FormAnalytics />} />
            <Route path="forms/integrations/:formId" element={<FormIntegrations />} />
            {/* Service Category Routes */}
            <Route path="tickets" element={<Tickets />} />
            <Route path="knowledge-base" element={<KnowledgeBase />} />
            <Route path="customer-portal" element={<CustomerPortal />} />
            <Route path="support-analytics" element={<SupportAnalytics />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/password" element={<BetaLogin />} />
        </Routes>
      </div>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
