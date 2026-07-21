import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>
                        <p className="text-xs text-gray-400 mb-6 bg-gray-50 p-2 rounded break-all">
                            {this.state.error?.message}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
                            aria-label="Refresh page"
                            title="Refresh page"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
