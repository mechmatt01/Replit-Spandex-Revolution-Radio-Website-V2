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
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [overlays, setOverlays] = useState<google.maps.OverlayView[]>([]);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [countryStats, setCountryStats] = useState<Record<string, number>>({});

  // Hardcoded config for Google Maps
  const config: Config = {
    googleMapsApiKey: "AIzaSyCBoEZeDucpm7p9OEDgaUGLzhn5HpItseQ",
  };

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
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        // Load Google Maps script if not already loaded
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (window.google && window.google.maps) {
            initializeMap();
          }
        };
        document.head.appendChild(script);
      }
    };

    loadGoogleMaps();
  }, [initializeMap, config.googleMapsApiKey]);

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
            <CardTitle className={`text-center text-xl font-black ${isDarkMode ? "text-white" : "text-black"}`}>
              LIVE STATISTICS
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center space-y-8">
            {/* Active Listeners */}
            <div className="text-center space-y-3">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-primary/20 border border-primary/30">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide block">
                    Live Now
                  </span>
                  {statsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  ) : (
                    <div className="text-4xl font-black text-primary">
                      <AnimatedCounter value={liveStats?.activeListeners || 0} />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">Active Listeners</p>
                </div>
              </div>
            </div>

            {/* Countries */}
            <div className="text-center space-y-3">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-primary/20 border border-primary/30">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide block">
                    Countries
                  </span>
                  {statsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  ) : (
                    <div className="text-4xl font-black text-primary">
                      <AnimatedCounter value={liveStats?.countries || 0} />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">With Active Listeners</p>
                </div>
              </div>
            </div>

            {/* Total Listeners */}
            <div className="text-center space-y-3">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-primary/20 border border-primary/30">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide block">
                    Total Listeners
                  </span>
                  {statsLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  ) : (
                    <div className="text-4xl font-black text-primary">
                      <AnimatedCounter value={liveStats?.totalListeners || 0} />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">All Time</p>
                </div>
              </div>
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

        {/* Right Side - Active Locations Map */}
        <Card className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm border-border/50 flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className={`text-center text-xl font-black ${isDarkMode ? "text-white" : "text-black"}`}>
              ACTIVE LOCATIONS
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4">
            {/* Map Container */}
            <div className="flex-1 relative rounded-lg overflow-hidden">
              {isMapLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Loading World Map...</p>
                </div>
              )}
              <div 
                ref={mapRef} 
                className="w-full h-full min-h-[400px]"
                style={{ background: isDarkMode ? '#212121' : '#f5f5f5' }}
              />
              
              {/* Live Data Overlay */}
              {isLiveDataEnabled && !listenersLoading && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-primary/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-primary/30">
                    <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      {activeListeners.length} Live
                    </div>
                  </div>
                </div>
              )}

              {/* Country Stats */}
              {isLiveDataEnabled && Object.keys(countryStats).length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border/50 max-h-32 overflow-y-auto">
                    <div className="text-xs font-semibold text-muted-foreground mb-2">BY COUNTRY</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(countryStats)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 6)
                        .map(([country, count]) => (
                          <div key={country} className="flex justify-between">
                            <span className="truncate">{country}</span>
                            <span className="text-primary font-semibold">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
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