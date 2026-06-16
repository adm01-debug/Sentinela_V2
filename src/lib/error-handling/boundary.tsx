import { Component, ErrorInfo, ReactNode } from "react";
import { handleError } from "./handler";
import { logger } from "@/lib/logger";
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}
interface State {
  hasError: boolean;
  error: Error | null;
}
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error("[ErrorBoundary] Caught error:", error.message, error.stack);
    logger.error("[ErrorBoundary] Component stack:", info.componentStack);
    handleError(error);
    this.props.onError?.(error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{ padding: "2rem", fontFamily: "monospace" }}>
            <h2 style={{ color: "red" }}>Something went wrong</h2>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem", color: "#666" }}>
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
