import { Component, type ErrorInfo, type ReactNode } from 'react';
import { gameStore } from '../../game/store';
import { Button } from './button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? ` - ${this.props.label}` : ''}]`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  handleResetSave = () => {
    gameStore.resetSave();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-6 gap-4 text-center" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          <div className="text-destructive text-lg">⚠ ERROR</div>
          <div className="text-muted-foreground text-xs max-w-md leading-relaxed">
            {this.state.error?.message || 'Algo deu errado.'}
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" size="sm" onClick={this.handleRetry}>
              RETRY
            </Button>
            <Button variant="destructive" size="sm" onClick={this.handleResetSave}>
              RESET SAVE
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
