import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';

const ProtectedRoute = ({ children, requireAdmin = true }) => {
  const { user, loading } = useSupabase();
  const location = useLocation();
  const hasBetaAccess = sessionStorage.getItem('betaAccess') === 'true';

  // If still loading, show a loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-crm-bg-light">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-blue border-t-transparent"></div>
          <p className="text-crm-text-secondary">Loading Axolop CRM...</p>
        </div>
      </div>
    );
  }

  // Check for beta access - this is required for all routes
  if (!hasBetaAccess) {
    return <Navigate to="/password" state={{ from: location }} replace />;
  }

  // Check for admin access if admin access is required
  if (requireAdmin) {
    // Admin check - for now, we'll consider DEV_USER as admin
    // In a real implementation, you'd check user roles from your auth system
    const isAdmin = (window.DEV_MODE && window.DEV_USER) || 
                   (user && user.email === 'juan@axolop.com') ||
                   (user && user.app_metadata && user.app_metadata.roles && 
                    user.app_metadata.roles.includes('admin'));
    
    if (!isAdmin) {
      // For non-admins, redirect to a permission denied page or back to beta login
      return <Navigate to="/password" state={{ from: location }} replace />;
    }
  }

  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;