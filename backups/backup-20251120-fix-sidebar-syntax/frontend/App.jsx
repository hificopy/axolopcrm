import { useSupabase } from './context/SupabaseContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import Onboarding from './pages/Onboarding';

// Main pages
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Leads from './pages/Leads';
import Contacts from './pages/Contacts';
import Opportunities from './pages/Opportunities';
import Pipeline from './pages/Pipeline';
import Activities from './pages/Activities';
import History from './pages/History';
import Calls from './pages/Calls';
import Calendar from './pages/Calendar';
import Meetings from './pages/Meetings';
import TodoList from './pages/TodoList';
import SecondBrain from './pages/SecondBrain';
import Profile from './pages/Profile';
import More from './pages/More';
import CustomFieldsSettings from './pages/CustomFieldsSettings';

// Settings pages
import Settings from './pages/Settings';
import AccountSettings from './pages/AccountSettings';
import BillingSettings from './pages/BillingSettings';
import OrganizationSettings from './pages/OrganizationSettings';
import CommunicationSettings from './pages/CommunicationSettings';
import IntegrationsSettings from './pages/IntegrationsSettings';
import CustomizationSettings from './pages/CustomizationSettings';

// Forms pages
import Forms from './pages/Forms';
import FormBuilder from './pages/FormBuilder';
import FormPreview from './pages/FormPreview';
import FormAnalytics from './pages/FormAnalytics';
import FormIntegrations from './pages/FormIntegrations';

// Marketing & Automation
import EmailMarketing from './pages/EmailMarketing';
import CreateCampaign from './pages/CreateCampaign';
import WorkflowBuilder from './pages/WorkflowBuilder';
import WorkflowsPage from './pages/WorkflowsPage';

// Support pages
import Tickets from './pages/Tickets';
import KnowledgeBase from './pages/KnowledgeBase';
import CustomerPortal from './pages/CustomerPortal';
import SupportAnalytics from './pages/SupportAnalytics';

// Other pages
import AffiliatePortal from './pages/AffiliatePortal';
import BookingEmbed from './pages/BookingEmbed';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';

function App() {
  const { user, loading } = useSupabase();
  const isLoading = loading;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-crm-bg-light dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-blue border-t-transparent"></div>
          <p className="text-crm-text-secondary dark:text-gray-400">Loading Axolop CRM...</p>
        </div>
      </div>
    );
  }

  // For localhost development, we'll render without ProtectedRoute
  const isLocalhost = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';

  return (
    <div className="app">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/book/:slug" element={<BookingEmbed />} />
        <Route path="/booking/:bookingId" element={<BookingEmbed />} />
        <Route path="/forms/preview/:formId" element={<FormPreview />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Main app routes with /app prefix */}
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<Navigate to="/app/home" replace />} />

          {/* Conditionally render routes with or without ProtectedRoute based on environment */}
          {isLocalhost ? (
            <>
              <Route path="home" element={<Dashboard />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="leads" element={<Leads />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="opportunities" element={<Opportunities />} />
              <Route path="pipeline" element={<Pipeline />} />
              <Route path="activities" element={<Activities />} />
              <Route path="history" element={<History />} />
              <Route path="calls" element={<Calls />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="meetings" element={<Meetings />} />
              <Route path="todos" element={<TodoList />} />
              <Route path="more" element={<More />} />
              <Route path="second-brain" element={<SecondBrain />} />
              <Route path="profile" element={<Profile />} />

              {/* Marketing & Automation */}
              <Route path="email-marketing" element={<EmailMarketing />} />
              <Route path="email-marketing/create" element={<CreateCampaign />} />
              <Route path="workflows" element={<WorkflowsPage />} />
              <Route path="workflows/builder/:workflowId?" element={<WorkflowBuilder />} />

              {/* Forms */}
              <Route path="forms" element={<Forms />} />
              <Route path="forms/builder/:formId?" element={<FormBuilder />} />
              <Route path="forms/preview/:formId" element={<FormPreview />} />
              <Route path="forms/analytics/:formId" element={<FormAnalytics />} />
              <Route path="forms/integrations/:formId" element={<FormIntegrations />} />

              {/* Support */}
              <Route path="tickets" element={<Tickets />} />
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="customer-portal" element={<CustomerPortal />} />
              <Route path="support-analytics" element={<SupportAnalytics />} />

              {/* Other */}
              <Route path="affiliate" element={<AffiliatePortal />} />
            </>
          ) : (
            <>
              <Route path="home" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
              <Route path="leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
              <Route path="contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
              <Route path="opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
              <Route path="pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
              <Route path="activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
              <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="calls" element={<ProtectedRoute><Calls /></ProtectedRoute>} />
              <Route path="calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
              <Route path="todos" element={<ProtectedRoute><TodoList /></ProtectedRoute>} />
              <Route path="more" element={<ProtectedRoute><More /></ProtectedRoute>} />
              <Route path="second-brain" element={<ProtectedRoute><SecondBrain /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Marketing & Automation */}
              <Route path="email-marketing" element={<ProtectedRoute><EmailMarketing /></ProtectedRoute>} />
              <Route path="email-marketing/create" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />
              <Route path="workflows" element={<ProtectedRoute><WorkflowsPage /></ProtectedRoute>} />
              <Route path="workflows/builder/:workflowId?" element={<ProtectedRoute><WorkflowBuilder /></ProtectedRoute>} />

              {/* Forms */}
              <Route path="forms" element={<ProtectedRoute><Forms /></ProtectedRoute>} />
              <Route path="forms/builder/:formId?" element={<ProtectedRoute><FormBuilder /></ProtectedRoute>} />
              <Route path="forms/preview/:formId" element={<ProtectedRoute><FormPreview /></ProtectedRoute>} />
              <Route path="forms/analytics/:formId" element={<ProtectedRoute><FormAnalytics /></ProtectedRoute>} />
              <Route path="forms/integrations/:formId" element={<ProtectedRoute><FormIntegrations /></ProtectedRoute>} />

              {/* Support */}
              <Route path="tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
              <Route path="knowledge-base" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
              <Route path="customer-portal" element={<ProtectedRoute><CustomerPortal /></ProtectedRoute>} />
              <Route path="support-analytics" element={<ProtectedRoute><SupportAnalytics /></ProtectedRoute>} />

              {/* Other */}
              <Route path="affiliate" element={<ProtectedRoute><AffiliatePortal /></ProtectedRoute>} />
            </>
          )}

          {/* Settings sub-routes */}
          <Route path="settings" element={isLocalhost ? <Settings /> : <ProtectedRoute><Settings /></ProtectedRoute>}>
            <Route index element={<Navigate to="/app/settings/organization/general" replace />} />
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
            <Route path="custom-fields" element={isLocalhost ? <CustomFieldsSettings /> : <ProtectedRoute><CustomFieldsSettings /></ProtectedRoute>} />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
