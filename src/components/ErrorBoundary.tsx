import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Lab ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 16 }}>Something went wrong in Lab.</div>;
    }
    return this.props.children;
  }
}
