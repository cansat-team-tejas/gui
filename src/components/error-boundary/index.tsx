/**
 * Error Boundary Component
 * Catches React errors and provides fallback UI
 */
import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center h-full p-8 bg-red-50 border border-red-200">
            <div className="text-red-600 text-lg font-bold mb-4">
              Something went wrong
            </div>
            <div className="text-red-500 text-sm mb-4 text-center max-w-md">
              {this.state.error?.message || "An unexpected error occurred"}
            </div>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
