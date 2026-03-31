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
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
          <p className="text-white/80 text-lg font-medium">
            Something went wrong on this page.
          </p>
          {this.state.error?.message && (
            <p className="text-white/40 text-sm font-mono max-w-md break-words">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-2 text-sm text-white/60 underline underline-offset-4 hover:text-white/90 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
