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
    <div className="w-full space-y-8">
      {/* Admin Toggle */}
      {isAdmin && (
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-2 rounded-2xl overflow-hidden">
            <div
              className="absolute inset-0 blur-xl opacity-0 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
                opacity: 0.3,
              }}
            />
          </div>
          
          <Card className="relative bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm flex flex-col enhanced-glow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-black" style={{ color: colors.text }}>
                <Settings className="w-4 h-4" style={{ color: colors.primary }} />
                Admin Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium" style={{ color: colors.text }}>Live Firebase Data</p>
                  <p className="text-xs" style={{ color: colors.textMuted }}>
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
        </div>
      )}

      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[700px]">
        {/* Left Side - Live Statistics */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-2 rounded-2xl overflow-hidden">
            <div
              className="absolute inset-0 blur-xl opacity-0 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
                opacity: 0.3,
              }}
            />
          </div>
          
          <Card className="relative bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm flex flex-col enhanced-glow h-full">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl font-black" style={{ color: colors.text }}>
                {isLiveDataEnabled && <Activity className="w-7 h-7" style={{ color: colors.primary }} />}
                LIVE STATISTICS
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center space-y-12">
              {isLiveDataEnabled ? (
                <>
                  {/* Active Listeners */}
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Users className="w-6 h-6" style={{ color: colors.primary }} />
                      <span className="text-sm font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                        Live Now
                      </span>
                    </div>
                    {statsLoading ? (
                      <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: colors.primary }} />
                    ) : (
                      <div className="text-6xl font-black" style={{ color: colors.primary }}>
                        <AnimatedCounter value={liveStats?.activeListeners || 0} />
                      </div>
                    )}
                    <p className="text-base font-semibold" style={{ color: colors.textMuted }}>Active Listeners</p>
                  </div>

                  {/* Countries */}
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Globe className="w-6 h-6" style={{ color: colors.primary }} />
                      <span className="text-sm font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                        Countries
                      </span>
                    </div>
                    {statsLoading ? (
                      <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: colors.primary }} />
                    ) : (
                      <div className="text-6xl font-black" style={{ color: colors.primary }}>
                        <AnimatedCounter value={liveStats?.countries || 0} />
                      </div>
                    )}
                    <p className="text-base font-semibold" style={{ color: colors.textMuted }}>With Active Listeners</p>
                  </div>

                  {/* Total Listeners */}
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Users className="w-6 h-6" style={{ color: colors.primary }} />
                      <span className="text-sm font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>
                        Total Listeners
                      </span>
                    </div>
                    {statsLoading ? (
                      <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: colors.primary }} />
                    ) : (
                      <div className="text-6xl font-black" style={{ color: colors.primary }}>
                        <AnimatedCounter value={liveStats?.totalListeners || 0} />
                      </div>
                    )}
                    <p className="text-base font-semibold" style={{ color: colors.textMuted }}>All Time</p>
                  </div>

                  {/* Live Data Status */}
                  <div className="text-center pt-6">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-bold" style={{ 
                      backgroundColor: `${colors.primary}20`,
                      color: colors.primary 
                    }}>
                      <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }}></div>
                      LIVE DATA
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 mx-auto mb-6" style={{ color: colors.textMuted }} />
                  <p className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Live data disabled</p>
                  <p className="text-sm" style={{ color: colors.textMuted }}>Enable admin panel to view real-time statistics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Active Locations List */}
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-2 rounded-2xl overflow-hidden">
            <div
              className="absolute inset-0 blur-xl opacity-0 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
                opacity: 0.3,
              }}
            />
          </div>
          
          <Card className="relative bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm flex flex-col enhanced-glow h-full">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl font-black" style={{ color: colors.text }}>
                {isLiveDataEnabled && <MapPin className="w-7 h-7" style={{ color: colors.primary }} />}
                ACTIVE LOCATIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              {isLiveDataEnabled ? (
                listenersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin" style={{ color: colors.primary }} />
                  </div>
                ) : Object.keys(countryStats).length > 0 ? (
                  <div className="space-y-6">
                    {/* Country List */}
                    <div className="space-y-4">
                      {Object.entries(countryStats)
                        .filter(([, count]) => count > 0)
                        .sort(([,a], [,b]) => b - a)
                        .map(([country, count]) => (
                          <div key={country} className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-105" style={{ 
                            backgroundColor: `${colors.primary}10`,
                            border: `1px solid ${colors.primary}20`
                          }}>
                            <div className="flex items-center gap-4">
                              <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }}></div>
                              <span className="font-bold text-lg" style={{ color: colors.text }}>{country}</span>
                            </div>
                            <div className="text-3xl font-black" style={{ color: colors.primary }}>
                              {count}
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    {/* Live Status */}
                    <div className="text-center pt-6">
                      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-bold" style={{ 
                        backgroundColor: `${colors.primary}20`,
                        color: colors.primary 
                      }}>
                        <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }}></div>
                        LIVE DATA
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto mb-6" style={{ color: colors.textMuted }} />
                    <p className="text-lg font-semibold mb-2" style={{ color: colors.text }}>No active listeners detected</p>
                    <p className="text-sm" style={{ color: colors.textMuted }}>Waiting for live data...</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 mx-auto mb-6" style={{ color: colors.textMuted }} />
                  <p className="text-lg font-semibold mb-2" style={{ color: colors.text }}>Live data disabled</p>
                  <p className="text-sm" style={{ color: colors.textMuted }}>Enable admin mode to view active locations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveStatsAndLocations; 