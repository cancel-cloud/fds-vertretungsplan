'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.retry);
      }

      return (
        <Card className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-[rgb(var(--color-error)/0.1)] rounded-full">
              <AlertTriangle className="h-8 w-8 text-[rgb(var(--color-error))]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">
                Etwas ist schiefgelaufen
              </h3>
              <p className="text-[rgb(var(--color-text-secondary))] max-w-md">
                Es gab einen unerwarteten Fehler. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.
              </p>
              {this.state.error && process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-xs text-left bg-[rgb(var(--color-surface))] p-3 rounded border">
                  <summary className="cursor-pointer font-medium mb-2">Technische Details</summary>
                  <pre className="whitespace-pre-wrap break-words">
                    {this.state.error.message}
                    {this.state.error.stack && '\n\n' + this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={this.retry} variant="outline">
                <RefreshCw className="h-4 w-4" />
                Erneut versuchen
              </Button>
              <Button onClick={() => window.location.reload()}>
                Seite neu laden
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

interface AppErrorBoundaryProps {
  children: ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={(error, retry) => (
        <div className="min-h-screen bg-[rgb(var(--color-background))] flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-[rgb(var(--color-error)/0.1)] rounded-full">
                <AlertTriangle className="h-8 w-8 text-[rgb(var(--color-error))]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[rgb(var(--color-text))]">
                  Anwendungsfehler
                </h2>
                <p className="text-[rgb(var(--color-text-secondary))]">
                  Die Anwendung ist auf einen Fehler gestoßen und konnte nicht fortgesetzt werden.
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={retry} variant="outline">
                  <RefreshCw className="h-4 w-4" />
                  Erneut versuchen
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Neu laden
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
} 