import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Auto-redirect to home after 10 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/app/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/app/home');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-crm-bg-light">
      <div className="max-w-md w-full px-6 text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary opacity-20">404</div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-crm-text-primary mb-4">
            Page Not Found
          </h1>
          <p className="text-crm-text-secondary mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-crm-text-tertiary font-mono bg-crm-bg-secondary px-4 py-2 rounded-lg break-all">
            {location.pathname}
          </p>
        </div>

        {/* Auto-redirect notice */}
        <div className="mb-6 p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-primary">
            Redirecting to home in <span className="font-bold">{countdown}</span> seconds...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-crm-bg-secondary hover:bg-crm-bg-tertiary text-crm-text-primary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            to="/app/home"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-8 border-t border-crm-border">
          <p className="text-sm text-crm-text-secondary mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              to="/app/inbox"
              className="px-4 py-2 text-sm bg-crm-bg-secondary hover:bg-crm-bg-tertiary text-crm-text-primary rounded-lg transition-colors"
            >
              Inbox
            </Link>
            <Link
              to="/app/contacts"
              className="px-4 py-2 text-sm bg-crm-bg-secondary hover:bg-crm-bg-tertiary text-crm-text-primary rounded-lg transition-colors"
            >
              Contacts
            </Link>
            <Link
              to="/app/pipeline"
              className="px-4 py-2 text-sm bg-crm-bg-secondary hover:bg-crm-bg-tertiary text-crm-text-primary rounded-lg transition-colors"
            >
              Pipeline
            </Link>
            <Link
              to="/app/settings"
              className="px-4 py-2 text-sm bg-crm-bg-secondary hover:bg-crm-bg-tertiary text-crm-text-primary rounded-lg transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
