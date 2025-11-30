import React from 'react';
import { AlertTriangle, RefreshCw, Home, MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@components/ui/button';

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error details for debugging
    console.error('Error caught by boundary:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    });

    // Optional: Send error to logging service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.log('Would send error to tracking service:', { error, errorInfo });
    }
  };

  handleRetry = () => {
    if (this.state.retryCount < 3) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleGoHome = () => {
    window.location.href = '/app/home';
  };

  handleReload = () => {
    window.location.reload();
  };

  handleContactSupport = () => {
    const subject = `Error Report - ${this.state.errorId}`;
    const body = `I encountered an error in Axolop CRM.\n\nError ID: ${this.state.errorId}\nError: ${this.state.error?.toString()}\n\nPlease help me resolve this issue.`;
    window.open(`mailto:support@axolopcrm.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  getErrorMessage = (error) => {
    const errorString = error?.toString() || '';
    
    // Network errors
    if (errorString.includes('NetworkError') || errorString.includes('fetch')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to our servers. Please check your internet connection and try again.',
        type: 'network'
      };
    }

    // Authentication errors
    if (errorString.includes('Authentication') || errorString.includes('Unauthorized')) {
      return {
        title: 'Authentication Error',
        message: 'Your session has expired. Please sign in again to continue.',
        type: 'auth'
      };
    }

    // Permission errors
    if (errorString.includes('Permission') || errorString.includes('Forbidden')) {
      return {
        title: 'Access Denied',
        message: 'You don\'t have permission to access this feature. Contact your administrator.',
        type: 'permission'
      };
    }

    // Not found errors
    if (errorString.includes('Not Found') || errorString.includes('404')) {
      return {
        title: 'Page Not Found',
        message: 'The page you\'re looking for doesn\'t exist or has been moved.',
        type: 'notfound'
      };
    }

    // Default error
    return {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. We\'re working to fix this issue.',
      type: 'unknown'
    };
  };

  render() {
    if (this.state.hasError) {
      const errorDetails = this.getErrorMessage(this.state.error);
      const canRetry = this.state.retryCount < 3;
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            {/* Error Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{errorDetails.title}</h1>
                    <p className="text-red-100 text-sm">Error ID: {this.state.errorId}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {errorDetails.message}
                </p>

                {/* Retry Counter */}
                {this.state.retryCount > 0 && (
                  <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      Retry attempt {this.state.retryCount} of 3
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {canRetry && (
                    <Button
                      onClick={this.handleRetry}
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                      size="lg"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={this.handleGoHome}
                      variant="outline"
                      className="gap-2"
                      size="lg"
                    >
                      <Home className="h-4 w-4" />
                      Go Home
                    </Button>

                    <Button
                      onClick={this.handleReload}
                      variant="outline"
                      className="gap-2"
                      size="lg"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reload Page
                    </Button>
                  </div>

                  <Button
                    onClick={this.handleContactSupport}
                    variant="outline"
                    className="w-full gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                    size="lg"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contact Support
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                {/* Error Details (Development Only) */}
                {import.meta.env.DEV && this.state.error && (
                  <details className="mt-6">
                    <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                      Technical Details (Development)
                    </summary>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="mb-3">
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">Error:</h4>
                        <pre className="text-xs text-red-600 overflow-x-auto whitespace-pre-wrap">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                      
                      {this.state.errorInfo && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Component Stack:</h4>
                          <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need help? Visit our{' '}
                <a 
                  href="https://help.axolopcrm.com" 
                  className="text-blue-600 hover:text-blue-800 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Help Center
                </a>{' '}
                or{' '}
                <a 
                  href="mailto:support@axolopcrm.com" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export const ErrorBoundary = ({ children, fallback }) => {
  return <EnhancedErrorBoundary fallback={fallback}>{children}</EnhancedErrorBoundary>;
};

export default EnhancedErrorBoundary;