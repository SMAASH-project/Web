import React from "react";

interface Props {
  children: React.ReactNode;
  /** Optional custom fallback. Defaults to a minimal error card. */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Class-based error boundary — catches render errors in any child and shows a
 * graceful fallback instead of crashing the whole app.
 *
 * Wrap individual lazy-loaded routes so an error in one page doesn't take
 * down the entire application.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-lg font-medium text-white/80">Something went wrong on this page.</p>
          {this.state.error?.message && (
            <p className="max-w-md font-mono text-sm break-words text-white/40">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2 text-sm text-white/60 underline underline-offset-4 transition-colors hover:text-white/90"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
