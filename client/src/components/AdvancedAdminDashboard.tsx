import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, Radio, TrendingUp, Play, Pause, SkipForward, 
  BarChart3, PieChart, Calendar, Settings, Download,
  RefreshCw, Eye, MessageSquare, Heart, Share2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/contexts/AdminContext";
import type { StreamStats, Submission, Contact } from "@shared/schema";

interface AnalyticsData {
  totalListeners: number;
  peakListeners: number;
  averageSessionTime: number;
  topCountries: Array<{ country: string; listeners: number; percentage: number }>;
  hourlyData: Array<{ hour: number; listeners: number }>;
  weeklyData: Array<{ day: string; listeners: number; engagement: number }>;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
  referralSources: Array<{ source: string; visits: number; percentage: number }>;
}

interface SocialMediaMetrics {
  platform: string;
  followers: number;
  engagement: number;
  posts: number;
  impressions: number;
  clicks: number;
}

const mockAnalytics: AnalyticsData = {
  totalListeners: 1247,
  peakListeners: 1847,
  averageSessionTime: 34.5,
  topCountries: [
    { country: "United States", listeners: 423, percentage: 34 },
    { country: "United Kingdom", listeners: 187, percentage: 15 },
    { country: "Germany", listeners: 149, percentage: 12 },
    { country: "Canada", listeners: 124, percentage: 10 },
    { country: "Australia", listeners: 98, percentage: 8 },
  ],
  hourlyData: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    listeners: Math.floor(Math.random() * 500) + 800
  })),
  weeklyData: [
    { day: "Mon", listeners: 1156, engagement: 78 },
    { day: "Tue", listeners: 1089, engagement: 82 },
    { day: "Wed", listeners: 1234, engagement: 75 },
    { day: "Thu", listeners: 1378, engagement: 88 },
    { day: "Fri", listeners: 1567, engagement: 94 },
    { day: "Sat", listeners: 1789, engagement: 91 },
    { day: "Sun", listeners: 1432, engagement: 85 },
  ],
  deviceBreakdown: [
    { device: "Desktop", percentage: 45 },
    { device: "Mobile", percentage: 38 },
    { device: "Tablet", percentage: 17 },
  ],
  referralSources: [
    { source: "Direct", visits: 12456, percentage: 42 },
    { source: "Social Media", visits: 8934, percentage: 30 },
    { source: "Search", visits: 5678, percentage: 19 },
    { source: "Referral", visits: 2678, percentage: 9 },
  ],
};

const mockSocialMetrics: SocialMediaMetrics[] = [
  { platform: "Facebook", followers: 45230, engagement: 4.8, posts: 127, impressions: 892340, clicks: 23456 },
  { platform: "Twitter", followers: 38940, engagement: 6.2, posts: 289, impressions: 654320, clicks: 18923 },
  { platform: "Instagram", followers: 52670, engagement: 7.1, posts: 156, impressions: 1234560, clicks: 34567 },
  { platform: "YouTube", followers: 23450, engagement: 8.4, posts: 45, impressions: 567890, clicks: 15678 },
];

export default function AdvancedAdminDashboard() {
  const { isAdmin } = useAdmin();
  const [analytics, setAnalytics] = useState<AnalyticsData>(mockAnalytics);
  const [socialMetrics, setSocialMetrics] = useState<SocialMediaMetrics[]>(mockSocialMetrics);
  const [refreshing, setRefreshing] = useState(false);

  const { data: streamStats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const refreshAnalytics = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setAnalytics({
        ...mockAnalytics,
        totalListeners: Math.floor(Math.random() * 500) + 1000,
        peakListeners: Math.floor(Math.random() * 500) + 1500,
      });
      setRefreshing(false);
    }, 2000);
  };

  const exportData = (type: string) => {
    // Simulate data export
    console.log(`Exporting ${type} data...`);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="bg-dark-bg/50">
          <CardContent className="p-8 text-center">
            <h3 className="font-black text-xl text-white mb-4">Access Denied</h3>
            <p className="text-gray-400 font-semibold">You need admin privileges to view the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron font-black text-3xl text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400 font-semibold">Real-time analytics and stream management</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={refreshAnalytics}
            disabled={refreshing}
            variant="outline"
            className="bg-dark-bg/50 text-white hover:bg-dark-bg/70"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={() => exportData('analytics')}
            variant="outline"
            className="bg-dark-bg/50 text-white hover:bg-dark-bg/70"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Listeners"
          value={streamStats?.currentListeners || analytics.totalListeners}
          icon={<Users className="h-6 w-6" />}
          trend="+12%"
          color="text-metal-orange"
        />
        <StatCard
          title="Peak Today"
          value={analytics.peakListeners}
          icon={<TrendingUp className="h-6 w-6" />}
          trend="+8%"
          color="text-metal-gold"
        />
        <StatCard
          title="Avg Session"
          value={`${analytics.averageSessionTime}m`}
          icon={<Radio className="h-6 w-6" />}
          trend="+5%"
          color="text-metal-red"
        />
        <StatCard
          title="Pending Submissions"
          value={submissions.filter(s => s.status === 'pending').length}
          icon={<MessageSquare className="h-6 w-6" />}
          trend="2 new"
          color="text-blue-400"
        />
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-dark-bg/50">
          <TabsTrigger value="analytics" className="data-[state=active]:bg-metal-orange">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="streaming" className="data-[state=active]:bg-metal-orange">
            <Radio className="h-4 w-4 mr-2" />
            Streaming
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-metal-orange">
            <Share2 className="h-4 w-4 mr-2" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="management" className="data-[state=active]:bg-metal-orange">
            <Settings className="h-4 w-4 mr-2" />
            Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab analytics={analytics} />
        </TabsContent>

        <TabsContent value="streaming" className="space-y-6">
          <StreamingControlTab />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialMediaTab metrics={socialMetrics} />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <ManagementTab submissions={submissions} contacts={contacts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  color: string;
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <Card className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 font-semibold text-sm">{title}</p>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className={`text-sm font-semibold ${color}`}>{trend}</p>
          </div>
          <div className={`${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsTab({ analytics }: { analytics: AnalyticsData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Listener Chart */}
      <Card className="bg-dark-bg/50">
        <CardContent className="p-6">
          <h3 className="font-black text-white mb-4">24-Hour Listener Trend</h3>
          <div className="h-64 flex items-end space-x-1">
            {analytics.hourlyData.map((data, index) => (
              <div
                key={index}
                className="bg-metal-orange flex-1 rounded-t"
                style={{ height: `${(data.listeners / 1500) * 100}%` }}
                title={`${data.hour}:00 - ${data.listeners} listeners`}
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Countries */}
      <Card className="bg-dark-bg/50">
        <CardContent className="p-6">
          <h3 className="font-black text-white mb-4">Top Countries</h3>
          <div className="space-y-3">
            {analytics.topCountries.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-metal-orange font-bold mr-3">#{index + 1}</span>
                  <span className="text-white font-semibold">{country.country}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold">{country.listeners}</span>
                  <span className="text-gray-400 text-sm ml-2">({country.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device Breakdown */}
      <Card className="bg-dark-bg/50">
        <CardContent className="p-6">
          <h3 className="font-black text-white mb-4">Device Breakdown</h3>
          <div className="space-y-4">
            {analytics.deviceBreakdown.map((device, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300 font-semibold">{device.device}</span>
                  <span className="text-white font-bold">{device.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-metal-orange h-2 rounded-full"
                    style={{ width: `${device.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referral Sources */}
      <Card className="bg-dark-bg/50">
        <CardContent className="p-6">
          <h3 className="font-black text-white mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            {analytics.referralSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300 font-semibold">{source.source}</span>
                <div className="text-right">
                  <span className="text-white font-bold">{source.visits.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm ml-2">({source.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StreamingControlTab() {
  const [isLive, setIsLive] = useState(true);
  const [currentTrack, setCurrentTrack] = useState("Youth Gone Wild - Skid Row");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Stream Controls */}
      <Card className="bg-dark-bg/50">
        <CardContent className="p-6">
          <h3 className="font-black text-white mb-4">Stream Controls</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-semibold">Stream Status</span>
              <Badge className={isLive ? "bg-metal-red" : "bg-gray-600"}>
                {isLive ? "LIVE" : "OFFLINE"}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-metal-orange hover:bg-orange-600">
                <Play className="h-4 w-4 mr-2" />
                Play
              </Button>
              <Button variant="outline" className="bg-dark-bg/50 text-white hover:bg-dark-bg/70">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button variant="outline" className="bg-dark-bg/50 text-white hover:bg-dark-bg/70">
                <SkipForward className="h-4 w-4 mr-2" />
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Track */}
      <Card className="bg-dark-bg/50">
        <CardContent className="p-6">
          <h3 className="font-black text-white mb-4">Now Playing</h3>
          <div className="space-y-3">
            <p className="text-white font-bold">{currentTrack}</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-metal-orange h-2 rounded-full w-3/5"></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>2:34</span>
              <span>4:12</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SocialMediaTab({ metrics }: { metrics: SocialMediaMetrics[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="bg-dark-bg/50">
          <CardContent className="p-6">
            <h3 className="font-black text-white mb-4">{metric.platform}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 font-semibold">Followers</span>
                <span className="text-white font-bold">{metric.followers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-semibold">Engagement Rate</span>
                <span className="text-metal-orange font-bold">{metric.engagement}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-semibold">Posts</span>
                <span className="text-white font-bold">{metric.posts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-semibold">Impressions</span>
                <span className="text-white font-bold">{metric.impressions.toLocaleString()}</span>
              </div>
            </div>
            <Button className="w-full mt-4 bg-metal-orange hover:bg-orange-600">
              <Eye className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ManagementTab({ submissions, contacts }: { submissions: Submission[]; contacts: Contact[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Submissions */}
      <Card className="bg-dark-bg/50">
        <CardContent className="p-6">
          <h3 className="font-black text-white mb-4">Recent Submissions</h3>
          <div className="space-y-3">
            {submissions.slice(0, 5).map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-3 bg-dark-surface/50 rounded">
                <div>
                  <p className="text-white font-semibold">{submission.songTitle}</p>
                  <p className="text-gray-400 text-sm">{submission.artistName}</p>
                </div>
                <Badge variant={submission.status === 'approved' ? 'default' : 'secondary'}>
                  {submission.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Contacts */}
      <Card className="bg-dark-bg/50">
        <CardContent className="p-6">
          <h3 className="font-black text-white mb-4">Recent Contacts</h3>
          <div className="space-y-3">
            {contacts.slice(0, 5).map((contact) => (
              <div key={contact.id} className="p-3 bg-dark-surface/50 rounded">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white font-semibold">{contact.firstName} {contact.lastName}</p>
                  <span className="text-gray-400 text-xs">{contact.subject}</span>
                </div>
                <p className="text-gray-400 text-sm">{contact.email}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}