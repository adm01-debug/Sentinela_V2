import { Component, ErrorInfo, ReactNode } from 'react';
import { handleError } from './handler';
interface Props { children: ReactNode; fallback?: ReactNode; onError?: (error: Error, info: ErrorInfo) => void; }
interface State { hasError: boolean; error: Error | null; }
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { handleError(error); this.props.onError?.(error, info); }
  render() {
    if (this.state.hasError) { return this.props.fallback || <div>Something went wrong. Please try again.</div>; }
    return this.props.children;
  }
}
