import React, { useState, useEffect } from "react";
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

  // Initialize Google Maps
  const initializeMap = useCallback(() => {
    if (!mapRef.current || map) return;
    
    setIsMapLoading(true);
    
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 20, lng: 0 }, // Center on world
      zoom: 2,
      styles: isDarkMode ? [
        { elementType: "geometry", stylers: [{ color: "#212121" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
        { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
        { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: colors.primary }] },
        { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
        { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
        { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
        { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
        { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
      ] : [
        { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: colors.primary }] }
      ],
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
    });

    setMap(mapInstance);
    setIsMapLoading(false);
  }, [isDarkMode, colors.primary, map]);

  // Create pulsing markers for active listeners
  const createPulsingMarker = useCallback((position: google.maps.LatLngLiteral, listener: ActiveListener) => {
    if (!map) return null;

    // Create marker
    const marker = new google.maps.Marker({
      position,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: colors.primary,
        fillOpacity: 0.8,
        scale: 6,
        strokeColor: colors.primary,
        strokeWeight: 2,
      },
    });

    // Create pulsing overlay
    const pulsingOverlay = new google.maps.OverlayView();
    pulsingOverlay.setMap(map);
    
    pulsingOverlay.onAdd = function() {
      const div = document.createElement('div');
      div.className = 'pulsing-listener-dot';
      div.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${colors.primary};
        animation: livePulse 2s ease-in-out infinite;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 10;
        opacity: 0.7;
        box-shadow: 0 0 10px 2px ${colors.primary}40;
      `;
      
      // Add fade-in animation
      div.style.animation = 'fadeInPulse 0.5s ease-in, livePulse 2s ease-in-out infinite 0.5s';
      
      this.div_ = div;
      const panes = this.getPanes();
      panes.overlayImage.appendChild(div);
    };
    
    pulsingOverlay.draw = function() {
      const projection = this.getProjection();
      const point = projection.fromLatLngToDivPixel(position);
      if (point) {
        this.div_.style.left = point.x + 'px';
        this.div_.style.top = point.y + 'px';
      }
    };

    // Create info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="color: ${isDarkMode ? '#fff' : '#000'}; padding: 8px;">
          <strong>${listener.location.city || listener.location.country}</strong><br/>
          <small>🎵 Listening Live</small>
        </div>
      `,
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    return { marker, overlay: pulsingOverlay, infoWindow };
  }, [map, colors.primary, isDarkMode]);

  // Update markers when active listeners change
  useEffect(() => {
    if (!map || !isLiveDataEnabled) return;

    // Clear existing markers and overlays
    markers.forEach(marker => marker.setMap(null));
    overlays.forEach(overlay => overlay.setMap(null));
    
    const newMarkers: google.maps.Marker[] = [];
    const newOverlays: google.maps.OverlayView[] = [];
    const newCountryStats: Record<string, number> = {};

    // Create markers for active listeners
    activeListeners.forEach(listener => {
      if (listener.location && listener.isActiveListening) {
        const position = {
          lat: listener.location.lat,
          lng: listener.location.lng,
        };

        const markerData = createPulsingMarker(position, listener);
        if (markerData) {
          newMarkers.push(markerData.marker);
          newOverlays.push(markerData.overlay);
        }

        // Count by country
        const country = listener.location.country;
        newCountryStats[country] = (newCountryStats[country] || 0) + 1;
      }
    });

    setMarkers(newMarkers);
    setOverlays(newOverlays);
    setCountryStats(newCountryStats);
  }, [activeListeners, map, isLiveDataEnabled, createPulsingMarker]);

  // Initialize Google Maps when component mounts
  useEffect(() => {
    if (window.google && window.google.maps) {
      initializeMap();
    }
  }, [initializeMap]);

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
          <CardContent className="flex-1 flex flex-col">
            {/* Loading State */}
            {(listenersLoading && isLiveDataEnabled) && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {/* Live Data Status */}
            {isLiveDataEnabled && (
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  LIVE DATA - {activeListeners.length} Active
                </div>
              </div>
            )}

            {/* Countries List */}
            <div className="flex-1 space-y-3">
              {isLiveDataEnabled && Object.keys(countryStats).length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-muted-foreground mb-3">
                    LISTENERS BY COUNTRY
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {Object.entries(countryStats)
                      .sort(([,a], [,b]) => b - a)
                      .map(([country, count]) => (
                        <div 
                          key={country} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                            <span className="font-medium">{country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-bold text-lg">
                              {count}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {count === 1 ? 'listener' : 'listeners'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : !isLiveDataEnabled ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <Globe className="w-12 h-12 text-muted-foreground/50" />
                  <div className="space-y-2">
                    <p className="text-muted-foreground font-medium">Live Data Disabled</p>
                    <p className="text-sm text-muted-foreground/70">
                      Enable live data in admin mode to see active locations
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <MapPin className="w-12 h-12 text-muted-foreground/50" />
                  <div className="space-y-2">
                    <p className="text-muted-foreground font-medium">No Active Listeners</p>
                    <p className="text-sm text-muted-foreground/70">
                      No listeners are currently active with location data
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Total Summary */}
            {isLiveDataEnabled && Object.keys(countryStats).length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Countries:</span>
                  <span className="font-semibold text-primary">{Object.keys(countryStats).length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Total Active:</span>
                  <span className="font-semibold text-primary">
                    {Object.values(countryStats).reduce((sum, count) => sum + count, 0)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes livePulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.4; }
        }
        
        @keyframes fadeInPulse {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
        }
        
        .pulsing-listener-dot {
          transition: opacity 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LiveStatsAndLocations;