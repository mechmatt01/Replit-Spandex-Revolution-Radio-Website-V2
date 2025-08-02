import React, { Component } from 'react';
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback || (<div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="mb-4">The site encountered an error. Please refresh the page.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
              Refresh Page
            </button>
          </div>
        </div>);
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
