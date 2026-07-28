/**
 * App-wide route error boundary.
 *
 * Before this, only the wallet subtree had a boundary — a throw in any of the
 * app's ~45 routes unmounted the whole tree and left users on a blank white
 * screen with nothing reported. This catches those, reports them, and offers a
 * recoverable path (retry / go home) instead of a dead end.
 *
 * Keyed by route so navigating away from a broken page automatically clears
 * the error state.
 */
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reportError } from '@/lib/errorReporting';

interface Props {
  children: ReactNode;
  onReset?: () => void;
  onGoHome?: () => void;
}

interface State {
  error: Error | null;
}

class RouteErrorBoundaryInner extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError({
      source: 'react',
      error,
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  private handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  private handleGoHome = () => {
    this.setState({ error: null });
    this.props.onGoHome?.();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-lg w-full border-destructive/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive text-lg">
              <AlertTriangle className="h-5 w-5" />
              Something went wrong on this page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This page hit an unexpected error. The rest of BibleFi still works — you can retry
              or head back home. The problem has been reported automatically.
            </p>

            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Technical details
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted/50 p-2 font-mono text-[11px] whitespace-pre-wrap break-all">
                {error.message}
              </pre>
            </details>

            <div className="flex gap-2">
              <Button onClick={this.handleReset} variant="default" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                <Home className="mr-2 h-4 w-4" />
                Go home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

/**
 * Router-aware wrapper: re-keys the boundary per route so a crash on one page
 * doesn't persist after navigating elsewhere.
 */
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <RouteErrorBoundaryInner
      key={location.pathname}
      onGoHome={() => navigate('/')}
    >
      {children}
    </RouteErrorBoundaryInner>
  );
}

export default RouteErrorBoundary;
