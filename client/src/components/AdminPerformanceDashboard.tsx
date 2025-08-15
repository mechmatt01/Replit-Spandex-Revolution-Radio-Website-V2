import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Activity, 
  Clock, 
  Database, 
  Globe, 
  HardDrive, 
  Network, 
  RefreshCw, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { performanceCollector, type PerformanceEvent, type PerformanceMetrics } from '../lib/performanceCollector';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'error';
  timestamp: Date;
  description: string;
}

interface PerformanceData {
  pageLoads: PerformanceMetric[];
  apiRequests: PerformanceMetric[];
  componentRenders: PerformanceMetric[];
  errors: PerformanceMetric[];
  customTraces: PerformanceMetric[];
}

interface RealTimeMetrics {
  currentUsers: number;
  activeSessions: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
}

const AdminPerformanceDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    pageLoads: [],
    apiRequests: [],
    componentRenders: [],
    errors: [],
    customTraces: []
  });
  
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    currentUsers: 0,
    activeSessions: 0,
    averageResponseTime: 0,
    errorRate: 0,
    throughput: 0
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { getColors } = useTheme();
  const colors = getColors();

  // Convert performance events to display metrics
  const convertEventsToMetrics = (events: PerformanceEvent[], type: string): PerformanceMetric[] => {
    return events.map(event => {
      let status: 'good' | 'warning' | 'error' = 'good';
      
      // Determine status based on type and value
      if (type === 'page_load') {
        if (event.unit === 'ms') {
          if (event.value > 3000) status = 'error';
          else if (event.value > 2000) status = 'warning';
        } else if (event.unit === 'score' && event.name === 'CLS') {
          if (event.value > 0.25) status = 'error';
          else if (event.value > 0.1) status = 'warning';
        }
      } else if (type === 'api_request') {
        if (event.value > 1000) status = 'error';
        else if (event.value > 500) status = 'warning';
      } else if (type === 'component_render') {
        if (event.value > 100) status = 'error';
        else if (event.value > 50) status = 'warning';
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
    } catch (error) {
      console.error('Failed to refresh performance data:', error);
    } finally {
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

  const getStatusIcon = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="space-y-6 p-6" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
            Performance Monitoring Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time performance metrics and monitoring data
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            Last updated: {formatTimestamp(lastUpdated)}
          </Badge>
          <Button 
            onClick={refreshData} 
            disabled={isRefreshing}
            className="flex items-center gap-2"
            style={{
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
              border: 'none',
              color: 'white'
            }}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Users</p>
                <p className="text-2xl font-bold">{realTimeMetrics.currentUsers}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{realTimeMetrics.activeSessions}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{realTimeMetrics.averageResponseTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{realTimeMetrics.errorRate}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold">{realTimeMetrics.throughput}/min</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Data */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6" style={{ backgroundColor: colors.surface }}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Page Loads</TabsTrigger>
          <TabsTrigger value="api">API Requests</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="traces">Custom Traces</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Summary */}
            <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Page Load Performance</span>
                    <Badge className={getStatusColor('good')}>Good</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>API Response Times</span>
                    <Badge className={getStatusColor('warning')}>Warning</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Component Rendering</span>
                    <Badge className={getStatusColor('good')}>Good</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <Badge className={getStatusColor('good')}>Good</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {performanceData.pageLoads.slice(0, 3).map((metric, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{metric.name}</span>
                    <div className="flex items-center gap-2">
                      <span>{metric.value}{metric.unit}</span>
                      {getStatusIcon(metric.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Page Load Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceData.pageLoads.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: colors.border }}>
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{metric.value}{metric.unit}</span>
                      <Badge className={getStatusColor(metric.status)}>
                        {getStatusIcon(metric.status)}
                        {metric.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(metric.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                API Request Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceData.apiRequests.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: colors.border }}>
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{metric.value}{metric.unit}</span>
                      <Badge className={getStatusColor(metric.status)}>
                        {getStatusIcon(metric.status)}
                        {metric.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(metric.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Component Render Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceData.componentRenders.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: colors.border }}>
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{metric.value}{metric.unit}</span>
                      <Badge className={getStatusColor(metric.status)}>
                        {getStatusIcon(metric.status)}
                        {metric.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(metric.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceData.errors.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: colors.border }}>
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{metric.value}{metric.unit}</span>
                      <Badge className={getStatusColor(metric.status)}>
                        {getStatusIcon(metric.status)}
                        {metric.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(metric.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traces" className="space-y-4">
          <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Custom Performance Traces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceData.customTraces.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: colors.border }}>
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{metric.value}{metric.unit}</span>
                      <Badge className={getStatusColor(metric.status)}>
                        {getStatusIcon(metric.status)}
                        {metric.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(metric.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Firebase Console Link */}
      <Card style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">View Detailed Analytics in Firebase Console</h3>
            <p className="text-muted-foreground mb-4">
              Access comprehensive performance data, set up alerts, and configure monitoring rules
            </p>
            <Button 
              onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
              className="flex items-center gap-2 mx-auto"
              style={{
                background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                border: 'none',
                color: 'white'
              }}
            >
              <Globe className="h-4 w-4" />
              Open Firebase Console
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPerformanceDashboard;
