import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // In production, you might want to log this to an error reporting service
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  /**
   * Reset error state to retry rendering
   */
  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg bg-red-50 p-8 text-center">
          <div className="mb-4 text-6xl">😞</div>
          <h2 className="mb-2 text-xl font-semibold text-red-800">
            Oops! Etwas ist schiefgelaufen
          </h2>
          <p className="mb-4 text-red-600">
            Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4 max-w-md">
              <summary className="cursor-pointer text-sm text-red-500">
                Fehlerdetails anzeigen
              </summary>
              <pre className="mt-2 overflow-auto text-left text-xs text-red-400">
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleRetry}
            className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Erneut versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;