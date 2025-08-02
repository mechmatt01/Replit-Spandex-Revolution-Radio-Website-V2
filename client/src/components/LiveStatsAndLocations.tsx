import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MapPin, Activity, Users, Globe, Loader2, RotateCcw, Settings } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAdmin } from "@/contexts/AdminContext";
import { useQuery } from "@tanstack/react-query";
import { AnimatedCounter } from "./AnimatedCounter";

// Types
interface LiveStats {
  activeListeners: number;
  countries: number;
  totalListeners: number;
}

interface ActiveListener {
  id: string;
  location: {
    lat: number;
    lng: number;
    country: string;
    city?: string;
  };
  isActiveListening: boolean;
}

interface Config {
  googleMapsApiKey: string;
}

const LiveStatsAndLocations = () => {
  const { isDarkMode, colors } = useTheme();
  const { isLiveDataEnabled, setIsLiveDataEnabled, isAdmin } = useAdmin();
  const [countryStats, setCountryStats] = useState<Record<string, number>>({});

  // Fetch live statistics
  const { data: liveStats, isLoading: statsLoading } = useQuery<LiveStats>({
    queryKey: ['/api/live-stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch active listeners with locations
  const { data: activeListeners = [], isLoading: listenersLoading } = useQuery<ActiveListener[]>({
    queryKey: ['/api/active-listeners'],
    refetchInterval: isLiveDataEnabled ? 5000 : false, // Refresh every 5 seconds if live data enabled
    enabled: isLiveDataEnabled,
  });

  // Update country stats when active listeners change
  useEffect(() => {
    if (!isLiveDataEnabled) return;

    const newCountryStats: Record<string, number> = {};

    // Count by country from active listeners
    activeListeners.forEach(listener => {
      if (listener.location && listener.isActiveListening && listener.location.country) {
        const country = listener.location.country;
        newCountryStats[country] = (newCountryStats[country] || 0) + 1;
      }
    });

    setCountryStats(newCountryStats);
  }, [activeListeners, isLiveDataEnabled]);

  return (
    <div className="w-full space-y-6">
      {/* Admin Toggle */}
      {isAdmin && (
        <Card className="bg-card/90 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4" />
              Admin Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Live Firebase Data</p>
                <p className="text-xs text-muted-foreground">
                  Enable real-time data from Firebase users collection
                </p>
              </div>
              <Switch
                checked={isLiveDataEnabled}
                onCheckedChange={setIsLiveDataEnabled}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        {/* Left Side - Live Statistics */}
        <Card className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-border/50 flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className={`flex items-center gap-2 text-xl font-black ${isDarkMode ? "text-white" : "text-black"}`}>
              <Activity className="w-6 h-6 text-primary" />
              LIVE STATISTICS
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center space-y-8">
            {/* Active Listeners */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Live Now
                </span>
              </div>
              {statsLoading ? (
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              ) : (
                <div className="text-4xl font-black text-primary">
                  <AnimatedCounter value={liveStats?.activeListeners || 0} />
                </div>
              )}
              <p className="text-sm text-muted-foreground">Active Listeners</p>
            </div>

            {/* Countries */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Countries
                </span>
              </div>
              {statsLoading ? (
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              ) : (
                <div className="text-4xl font-black text-primary">
                  <AnimatedCounter value={liveStats?.countries || 0} />
                </div>
              )}
              <p className="text-sm text-muted-foreground">With Active Listeners</p>
            </div>

            {/* Total Listeners */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Listeners
                </span>
              </div>
              {statsLoading ? (
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              ) : (
                <div className="text-4xl font-black text-primary">
                  <AnimatedCounter value={liveStats?.totalListeners || 0} />
                </div>
              )}
              <p className="text-sm text-muted-foreground">All Time</p>
            </div>

            {/* Live Data Status */}
            {isLiveDataEnabled && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  LIVE DATA
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Side - Active Locations List */}
        <Card className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-border/50 flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className={`flex items-center gap-2 text-xl font-black ${isDarkMode ? "text-white" : "text-black"}`}>
              <MapPin className="w-6 h-6 text-primary" />
              ACTIVE LOCATIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {isLiveDataEnabled ? (
              listenersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : Object.keys(countryStats).length > 0 ? (
                <div className="space-y-4">
                  {/* Country List */}
                  <div className="space-y-3">
                    {Object.entries(countryStats)
                      .filter(([, count]) => count > 0)
                      .sort(([,a], [,b]) => b - a)
                      .map(([country, count]) => (
                        <div key={country} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/20">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                            <span className="font-semibold">{country}</span>
                          </div>
                          <div className="text-primary font-black text-xl">
                            {count}
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  {/* Live Status */}
                  <div className="text-center pt-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      LIVE DATA
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No active listeners detected</p>
                  <p className="text-sm text-muted-foreground/70">Waiting for live data...</p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Live data disabled</p>
                <p className="text-sm text-muted-foreground/70">Enable admin mode to view active locations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default LiveStatsAndLocations;