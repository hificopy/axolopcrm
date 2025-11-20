import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Refresh the page
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-crm-bg-light p-6">
          <div className="max-w-2xl w-full">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-crm-text-primary mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-crm-text-secondary mb-2">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-crm-bg-secondary rounded-lg overflow-auto max-h-64">
                <h2 className="text-sm font-semibold text-crm-text-primary mb-2">
                  Error Details (Development Only)
                </h2>
                <pre className="text-xs text-red-600 overflow-x-auto">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="text-xs text-crm-text-secondary cursor-pointer hover:text-crm-text-primary">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-crm-text-tertiary mt-2 overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-crm-bg-secondary hover:bg-crm-bg-tertiary text-crm-text-primary rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-crm-border text-center">
              <p className="text-sm text-crm-text-secondary">
                If this problem persists, please contact our support team at{' '}
                <a
                  href="mailto:support@axolop.com"
                  className="text-primary hover:underline"
                >
                  support@axolop.com
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

export default ErrorBoundary;