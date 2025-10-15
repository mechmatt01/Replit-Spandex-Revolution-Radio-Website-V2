import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Activity, Clock, Database, Globe, HardDrive, Network, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { performanceCollector } from '../lib/performanceCollector';
const AdminPerformanceDashboard = () => {
    const [performanceData, setPerformanceData] = useState({
        pageLoads: [],
        apiRequests: [],
        componentRenders: [],
        errors: [],
        customTraces: []
    });
    const [realTimeMetrics, setRealTimeMetrics] = useState({
        currentUsers: 0,
        activeSessions: 0,
        averageResponseTime: 0,
        errorRate: 0,
        throughput: 0
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const { getColors } = useTheme();
    const colors = getColors();
    // Convert performance events to display metrics
    const convertEventsToMetrics = (events, type) => {
        return events.map(event => {
            let status = 'good';
            // Determine status based on type and value
            if (type === 'page_load') {
                if (event.unit === 'ms') {
                    if (event.value > 3000)
                        status = 'error';
                    else if (event.value > 2000)
                        status = 'warning';
                }
                else if (event.unit === 'score' && event.name === 'CLS') {
                    if (event.value > 0.25)
                        status = 'error';
                    else if (event.value > 0.1)
                        status = 'warning';
                }
            }
            else if (type === 'api_request') {
                if (event.value > 1000)
                    status = 'error';
                else if (event.value > 500)
                    status = 'warning';
            }
            else if (type === 'component_render') {
                if (event.value > 100)
                    status = 'error';
                else if (event.value > 50)
                    status = 'warning';
            }
            return {
                name: event.name,
                value: event.value,
                unit: event.unit,
                status,
                timestamp: event.timestamp,
                description: `${type.replace('_', ' ')} performance metric`
            };
        });
    };
    const refreshData = async () => {
        setIsRefreshing(true);
        try {
            // Get real performance data from the collector
            const metrics = performanceCollector.getMetrics();
            const summary = performanceCollector.getMetricsSummary();
            // Convert events to display metrics
            const pageLoads = Array.from(metrics.pageLoads.values()).flat();
            const apiRequests = Array.from(metrics.apiRequests.values()).flat();
            const componentRenders = Array.from(metrics.componentRenders.values()).flat();
            const errors = Array.from(metrics.errors.values()).flat();
            const customTraces = Array.from(metrics.customTraces.values()).flat();
            setPerformanceData({
                pageLoads: convertEventsToMetrics(pageLoads, 'page_load'),
                apiRequests: convertEventsToMetrics(apiRequests, 'api_request'),
                componentRenders: convertEventsToMetrics(componentRenders, 'component_render'),
                errors: convertEventsToMetrics(errors, 'error'),
                customTraces: convertEventsToMetrics(customTraces, 'custom_trace')
            });
            // Calculate real-time metrics
            const uniqueSessions = new Set(pageLoads.map(e => e.sessionId)).size;
            const avgResponseTime = apiRequests.length > 0
                ? apiRequests.reduce((sum, e) => sum + e.value, 0) / apiRequests.length
                : 0;
            const errorCount = errors.length;
            const totalEvents = summary.totalEvents;
            const errorRate = totalEvents > 0 ? (errorCount / totalEvents) * 100 : 0;
            setRealTimeMetrics({
                currentUsers: uniqueSessions,
                activeSessions: uniqueSessions,
                averageResponseTime: Math.round(avgResponseTime),
                errorRate: Math.round(errorRate * 100) / 100,
                throughput: Math.round(totalEvents / 10) // Events per 10 seconds
            });
            setLastUpdated(new Date());
        }
        catch (error) {
            console.error('Failed to refresh performance data:', error);
        }
        finally {
            setIsRefreshing(false);
        }
    };
    useEffect(() => {
        // Subscribe to performance data updates
        const unsubscribe = performanceCollector.subscribe((metrics) => {
            // Auto-refresh data when new metrics arrive
            refreshData();
        });
        // Load initial data
        refreshData();
        // Set up auto-refresh every 30 seconds
        const interval = setInterval(refreshData, 30000);
        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);
    const getStatusIcon = (status) => {
        switch (status) {
            case 'good':
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
            case 'warning':
                return _jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-500" });
            case 'error':
                return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'good':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
        }
    };
    const formatTimestamp = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
    return (_jsxs("div", { className: "space-y-6 p-6", style: { backgroundColor: colors.background, color: colors.text }, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", style: { color: colors.text }, children: "Performance Monitoring Dashboard" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Real-time performance metrics and monitoring data" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Badge, { variant: "outline", className: "text-sm", children: ["Last updated: ", formatTimestamp(lastUpdated)] }), _jsxs(Button, { onClick: refreshData, disabled: isRefreshing, className: "flex items-center gap-2", style: {
                                    background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                                    border: 'none',
                                    color: 'white'
                                }, children: [_jsx(RefreshCw, { className: `h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}` }), "Refresh"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: [_jsx(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Current Users" }), _jsx("p", { className: "text-2xl font-bold", children: realTimeMetrics.currentUsers })] }), _jsx(Globe, { className: "h-8 w-8 text-blue-500" })] }) }) }), _jsx(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Active Sessions" }), _jsx("p", { className: "text-2xl font-bold", children: realTimeMetrics.activeSessions })] }), _jsx(Activity, { className: "h-8 w-8 text-green-500" })] }) }) }), _jsx(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Avg Response" }), _jsxs("p", { className: "text-2xl font-bold", children: [realTimeMetrics.averageResponseTime, "ms"] })] }), _jsx(Clock, { className: "h-8 w-8 text-purple-500" })] }) }) }), _jsx(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Error Rate" }), _jsxs("p", { className: "text-2xl font-bold", children: [realTimeMetrics.errorRate, "%"] })] }), _jsx(AlertTriangle, { className: "h-8 w-8 text-red-500" })] }) }) }), _jsx(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: "Throughput" }), _jsxs("p", { className: "text-2xl font-bold", children: [realTimeMetrics.throughput, "/min"] })] }), _jsx(TrendingUp, { className: "h-8 w-8 text-orange-500" })] }) }) })] }), _jsxs(Tabs, { defaultValue: "overview", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-6", style: { backgroundColor: colors.surface }, children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "pages", children: "Page Loads" }), _jsx(TabsTrigger, { value: "api", children: "API Requests" }), _jsx(TabsTrigger, { value: "components", children: "Components" }), _jsx(TabsTrigger, { value: "errors", children: "Errors" }), _jsx(TabsTrigger, { value: "traces", children: "Custom Traces" })] }), _jsx(TabsContent, { value: "overview", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), "Performance Summary"] }) }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Page Load Performance" }), _jsx(Badge, { className: getStatusColor('good'), children: "Good" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "API Response Times" }), _jsx(Badge, { className: getStatusColor('warning'), children: "Warning" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Component Rendering" }), _jsx(Badge, { className: getStatusColor('good'), children: "Good" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Error Rate" }), _jsx(Badge, { className: getStatusColor('good'), children: "Good" })] })] }) })] }), _jsxs(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-5 w-5" }), "Recent Activity"] }) }), _jsx(CardContent, { className: "space-y-3", children: performanceData.pageLoads.slice(0, 3).map((metric, index) => (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { children: metric.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { children: [metric.value, metric.unit] }), getStatusIcon(metric.status)] })] }, index))) })] })] }) }), _jsx(TabsContent, { value: "pages", className: "space-y-4", children: _jsxs(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Globe, { className: "h-5 w-5" }), "Page Load Performance"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: performanceData.pageLoads.map((metric, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", style: { borderColor: colors.border }, children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: metric.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: metric.description })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "text-lg font-bold", children: [metric.value, metric.unit] }), _jsxs(Badge, { className: getStatusColor(metric.status), children: [getStatusIcon(metric.status), metric.status] }), _jsx("span", { className: "text-xs text-muted-foreground", children: formatTimestamp(metric.timestamp) })] })] }, index))) }) })] }) }), _jsx(TabsContent, { value: "api", className: "space-y-4", children: _jsxs(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Network, { className: "h-5 w-5" }), "API Request Performance"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: performanceData.apiRequests.map((metric, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", style: { borderColor: colors.border }, children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: metric.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: metric.description })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "text-lg font-bold", children: [metric.value, metric.unit] }), _jsxs(Badge, { className: getStatusColor(metric.status), children: [getStatusIcon(metric.status), metric.status] }), _jsx("span", { className: "text-xs text-muted-foreground", children: formatTimestamp(metric.timestamp) })] })] }, index))) }) })] }) }), _jsx(TabsContent, { value: "components", className: "space-y-4", children: _jsxs(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(HardDrive, { className: "h-5 w-5" }), "Component Render Performance"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: performanceData.componentRenders.map((metric, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", style: { borderColor: colors.border }, children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: metric.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: metric.description })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "text-lg font-bold", children: [metric.value, metric.unit] }), _jsxs(Badge, { className: getStatusColor(metric.status), children: [getStatusIcon(metric.status), metric.status] }), _jsx("span", { className: "text-xs text-muted-foreground", children: formatTimestamp(metric.timestamp) })] })] }, index))) }) })] }) }), _jsx(TabsContent, { value: "errors", className: "space-y-4", children: _jsxs(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5" }), "Error Monitoring"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: performanceData.errors.map((metric, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", style: { borderColor: colors.border }, children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: metric.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: metric.description })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "text-lg font-bold", children: [metric.value, metric.unit] }), _jsxs(Badge, { className: getStatusColor(metric.status), children: [getStatusIcon(metric.status), metric.status] }), _jsx("span", { className: "text-xs text-muted-foreground", children: formatTimestamp(metric.timestamp) })] })] }, index))) }) })] }) }), _jsx(TabsContent, { value: "traces", className: "space-y-4", children: _jsxs(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Database, { className: "h-5 w-5" }), "Custom Performance Traces"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: performanceData.customTraces.map((metric, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", style: { borderColor: colors.border }, children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: metric.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: metric.description })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "text-lg font-bold", children: [metric.value, metric.unit] }), _jsxs(Badge, { className: getStatusColor(metric.status), children: [getStatusIcon(metric.status), metric.status] }), _jsx("span", { className: "text-xs text-muted-foreground", children: formatTimestamp(metric.timestamp) })] })] }, index))) }) })] }) })] }), _jsx(Card, { style: { backgroundColor: colors.surface, borderColor: colors.border }, children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: "View Detailed Analytics in Firebase Console" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Access comprehensive performance data, set up alerts, and configure monitoring rules" }), _jsxs(Button, { onClick: () => window.open('https://console.firebase.google.com/', '_blank'), className: "flex items-center gap-2 mx-auto", style: {
                                    background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                                    border: 'none',
                                    color: 'white'
                                }, children: [_jsx(Globe, { className: "h-4 w-4" }), "Open Firebase Console"] })] }) }) })] }));
};
export default AdminPerformanceDashboard;
