import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MapPin, Activity, Users, Globe, Loader2, Settings } from "lucide-react";
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

interface CountryListener {
  country: string;
  count: number;
}

const LiveStatsAndLocations = () => {
  const { isDarkMode, colors } = useTheme();
  const { isLiveDataEnabled, setIsLiveDataEnabled, isAdmin } = useAdmin();

  // Fetch live statistics
  const { data: liveStats, isLoading: statsLoading } = useQuery<LiveStats>({
    queryKey: ['/api/live-stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch active listeners count by country
  const { data: countryListeners = [], isLoading: listenersLoading } = useQuery<CountryListener[]>({
    queryKey: ['/api/active-listeners-by-country'],
    refetchInterval: isLiveDataEnabled ? 5000 : false, // Refresh every 5 seconds if live data enabled
    enabled: isLiveDataEnabled,
  });



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
          <CardContent className="flex-1 flex flex-col space-y-4">
            {/* Live Data Status */}
            {isLiveDataEnabled && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/30">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  LIVE DATA
                </div>
              </div>
            )}

            {/* Country List */}
            <div className="flex-1 overflow-y-auto">
              {!isLiveDataEnabled ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <Globe className="w-12 h-12 text-muted-foreground/50" />
                  <div>
                    <p className="text-sm text-muted-foreground">Enable live data to see active locations</p>
                    {isAdmin && (
                      <p className="text-xs text-muted-foreground/70 mt-1">Use admin controls above to toggle live Firebase data</p>
                    )}
                  </div>
                </div>
              ) : listenersLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Loading country data...</p>
                </div>
              ) : countryListeners.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <MapPin className="w-12 h-12 text-muted-foreground/50" />
                  <div>
                    <p className="text-sm text-muted-foreground">No active listeners found</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Users need to have isActiveListening=true and location data</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 text-center">
                    Countries with Active Listeners
                  </div>
                  {countryListeners.map((country, index) => (
                    <div 
                      key={country.country} 
                      className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/30 hover:bg-card/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-medium">{country.country}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-primary">{country.count}</span>
                        <span className="text-xs text-muted-foreground">
                          listener{country.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Summary at bottom */}
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <div className="text-center text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">
                        {countryListeners.reduce((sum, country) => sum + country.count, 0)}
                      </span> total active listeners across{' '}
                      <span className="font-semibold text-primary">
                        {countryListeners.length}
                      </span> {countryListeners.length === 1 ? 'country' : 'countries'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default LiveStatsAndLocations;