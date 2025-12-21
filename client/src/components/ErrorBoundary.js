import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
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
            return this.props.fallback || (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-black text-white", children: _jsxs("div", { className: "text-center p-8", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Something went wrong" }), _jsx("p", { className: "mb-4", children: "The site encountered an error. Please refresh the page." }), _jsx("button", { onClick: () => window.location.reload(), className: "px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 focus:outline-none focus:ring-0", children: "Refresh Page" })] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
