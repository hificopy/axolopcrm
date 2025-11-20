import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';
import api from '../lib/api';

const ProtectedRoute = ({ children, requireAdmin = false, skipOnboarding = false }) => {
  const { user, loading } = useSupabase();
  const location = useLocation();
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Check if user is admin (exempt from onboarding)
  const isAdmin = user && user.email === 'axolopcrm@gmail.com';

  // Check if user is Kate (special onboarding requirement)
  const isKate = user && user.email === 'kate@kateviolet.com';

  // Check onboarding status
  useEffect(() => {
    async function checkOnboarding() {
      if (!user || skipOnboarding || isAdmin) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const response = await api.get('/users/me/onboarding-status');
        setOnboardingStatus(response.data.onboarding_completed);
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        // If error, assume not completed
        setOnboardingStatus(false);
      } finally {
        setCheckingOnboarding(false);
      }
    }

    checkOnboarding();
  }, [user, skipOnboarding, isAdmin]);

  // If still loading auth, show a loading state
  if (loading || checkingOnboarding) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-300">Loading Axolop CRM...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    // Redirect to sign in, saving the attempted location
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check for admin access if required
  if (requireAdmin) {
    const isAdminUser = isAdmin ||
                   (user && user.app_metadata && user.app_metadata.roles &&
                    user.app_metadata.roles.includes('admin')) ||
                   (user && user.user_metadata && user.user_metadata.role === 'admin');

    if (!isAdminUser) {
      // Redirect non-admins to dashboard or show access denied
      return <Navigate to="/app/dashboard" state={{ accessDenied: true }} replace />;
    }
  }

  // Check if onboarding is required (skip for admin and onboarding page itself)
  if (!skipOnboarding && !isAdmin && onboardingStatus === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Special case: Kate must complete both regular and special onboarding
  if (!skipOnboarding && isKate && location.pathname !== '/onboarding') {
    // Check if Kate has completed the special onboarding via localStorage
    const kateOnboardingCompleted = localStorage.getItem('kateOnboardingCompleted');
    if (!kateOnboardingCompleted) {
      // Redirect Kate to onboarding to complete her special onboarding
      return <Navigate to="/onboarding" replace />;
    }
  }

  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;