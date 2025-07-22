import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// Types
interface StreamStats {
  id: number;
  currentListeners: number;
  totalListeners: number;
  peakListeners: number;
  countries: number;
  topCountries: string[];
  averageListenTime: number;
  isLive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Weather {
  location: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

interface Config {
  googleMapsApiKey: string;
  googleMapsSigningSecret: string;
  openWeatherApiKey: string;
  googleMapsMapId: string;
}

const FullWidthGlobeMapFixed = () => {
  const { isDarkMode, colors } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

  // Fetch Google Maps API key and config
  const { data: config } = useQuery<Config>({
    queryKey: ["/api/config"],
  });

  // Fetch weather data with default coordinates (New York)
  const { data: weather } = useQuery<Weather>({
    queryKey: ["/api/weather", { lat: 40.7128, lon: -74.006 }],
    queryFn: async () => {
      const response = await fetch("/api/weather?lat=40.7128&lon=-74.006");
      if (!response.ok) {
        throw new Error("Weather API failed");
      }
      return response.json();
    },
    refetchInterval: 600000, // 10 minutes
    enabled: true, // Always fetch weather
  });

  // Firebase Live Statistics
  const { data: liveStats } = useQuery<{
    activeListeners: number;
    countries: number;
    totalListeners: number;
  }>({
    queryKey: ["/api/live-stats"],
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Resize map after toggle
    setTimeout(() => {
      if (map) {
        google.maps.event.trigger(map, 'resize');
      }
    }, 100);
  };

  // Initialize map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !config?.googleMapsApiKey) return;
    if (map) return; // Don't recreate if map already exists

    console.log('Initializing Google Maps with API key:', config.googleMapsApiKey.substring(0, 20) + '...');

    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
        zoom: 2,
        center: { lat: 20, lng: 0 },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: isDarkMode ? [
          { elementType: "geometry", stylers: [{ color: "#212121" }] },
          { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
          { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
          { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9CA3AF" }] },
          { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
          { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#BDBDBD" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
          { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
          { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1B1B1B" }] },
          { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2C2C2C" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8A8A8A" }] },
          { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
          { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3C3C3C" }] },
          { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4E4E4E" }] },
          { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
          { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
          { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3D3D3D" }] }
        ] : []
      });

      // Add sample listener markers
      const sampleListeners = [
        { id: "1", city: "New York", country: "USA", lat: 40.7128, lng: -74.006, isActive: true },
        { id: "2", city: "London", country: "UK", lat: 51.5074, lng: -0.1278, isActive: true },
        { id: "3", city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, isActive: true },
        { id: "4", city: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050, isActive: true },
        { id: "5", city: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194, isActive: true },
      ];

      sampleListeners.forEach((listener) => {
        const marker = new google.maps.Marker({
          position: { lat: listener.lat, lng: listener.lng },
          map: mapInstance,
          title: `${listener.city}, ${listener.country}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: colors.primary,
            fillOpacity: 0.8,
            strokeColor: colors.primary,
            strokeWeight: 2,
          },
        });

        // Add click handler for marker
        marker.addListener("click", () => {
          mapInstance.panTo({ lat: listener.lat, lng: listener.lng });
          mapInstance.setZoom(10);
        });
      });

      setMap(mapInstance);
      console.log('Google Maps initialized successfully');
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [config?.googleMapsApiKey, isDarkMode, colors.primary]);

  // Load Google Maps API
  useEffect(() => {
    if (!config?.googleMapsApiKey) {
      console.log('No Google Maps API key available');
      return;
    }

    const loadGoogleMaps = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        console.log('Google Maps already loaded, initializing...');
        initializeMap();
        return;
      }

      // Check if script is already added
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script already exists, waiting for load...');
        return;
      }

      console.log('Loading Google Maps script...');
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Maps script loaded successfully');
        initializeMap();
      };
      script.onerror = (error) => {
        console.error('Error loading Google Maps script:', error);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [config, initializeMap]);

  // Map control handlers
  const handleZoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || 2) + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom(Math.max((map.getZoom() || 2) - 1, 1));
    }
  };

  const handleMyLocation = () => {
    if (userLocation && map) {
      map.panTo(userLocation);
      map.setZoom(12);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          if (map) {
            map.panTo(newLocation);
            map.setZoom(12);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleReset = () => {
    if (map) {
      map.panTo({ lat: 20, lng: 0 });
      map.setZoom(2);
    }
  };

  if (!config) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <p className={isDarkMode ? "text-white" : "text-black"}>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Normal view container */}
      {!isFullscreen && (
        <section className={`${isDarkMode ? "bg-black" : "bg-white"} py-20`}>
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className={`font-orbitron font-black text-3xl md:text-4xl mb-4 ${isDarkMode ? "text-white" : "text-black"}`}>
                GLOBAL LISTENERS
              </h2>
              <p className={`text-lg font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-4`}>
                See where metal fans are tuning in from around the world in real-time.
              </p>

              {/* Weather Display */}
              {weather && (
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                    <span className={`text-lg font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {weather.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                      {Math.round(weather.temperature)}°F
                    </span>
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {weather.description}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Map Container */}
            <div className="relative h-[600px] rounded-lg overflow-hidden mb-16">
              <div
                ref={mapRef}
                className="w-full h-full"
                style={{ backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb" }}
              />

              {/* Expand Button */}
              <Button
                onClick={toggleFullscreen}
                size="sm"
                className="absolute top-4 left-4 z-10 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-lg"
              >
                <Maximize2 className="w-4 h-4 mr-1" />
                Expand
              </Button>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <Button onClick={handleZoomIn} size="sm" className="p-2 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-lg">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button onClick={handleZoomOut} size="sm" className="p-2 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-lg">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button onClick={handleMyLocation} size="sm" className="p-2 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-lg">
                  <MapPin className="w-4 h-4" />
                </Button>
                <Button onClick={handleReset} size="sm" className="p-2 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-lg">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Statistics */}
              <Card className="transition-all duration-300 border-2 hover:shadow-lg" style={{ 
                backgroundColor: isDarkMode ? "#000000" : "#ffffff",
                borderColor: colors.primary
              }}>
                <CardHeader>
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                    Live Statistics
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Active Listeners</span>
                    <span className={`font-bold text-2xl ${isDarkMode ? "text-white" : "text-black"}`} style={{ color: colors.primary }}>
                      {liveStats?.activeListeners || 42}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Countries</span>
                    <span className={`font-bold text-2xl ${isDarkMode ? "text-white" : "text-black"}`} style={{ color: colors.primary }}>
                      {liveStats?.countries || 15}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Total Listeners</span>
                    <span className={`font-bold text-2xl ${isDarkMode ? "text-white" : "text-black"}`} style={{ color: colors.primary }}>
                      {liveStats?.totalListeners || 1247}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Active Locations */}
              <Card className="lg:col-span-2 transition-all duration-300 border-2 hover:shadow-lg" style={{ 
                backgroundColor: isDarkMode ? "#000000" : "#ffffff",
                borderColor: colors.primary
              }}>
                <CardHeader>
                  <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                    Active Locations
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {["New York, USA", "London, UK", "Tokyo, Japan", "Berlin, Germany", "San Francisco, USA", "Sydney, Australia"].map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: isDarkMode ? "#1a1a1a" : "#f8f9fa" }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                          <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{location}</span>
                        </div>
                        <span className={`text-xs font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {Math.floor(Math.random() * 10) + 1} listeners
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black">
          {/* Fullscreen Header */}
          <div className="absolute top-0 left-0 right-0 z-[10000] bg-black/90 backdrop-blur-md border-b border-gray-700">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white">Live Interactive Map</h2>
                {weather && (
                  <div className="flex items-center gap-3 bg-gray-900/80 rounded-lg px-4 py-2">
                    <div className="text-sm">
                      <span className="text-white font-medium">{weather.location}</span>
                      <span className="text-gray-300 ml-2">{Math.round(weather.temperature)}°F</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fullscreen Map Container */}
          <div
            ref={mapRef}
            className="w-full h-full"
            style={{
              marginTop: "72px",
              height: "calc(100vh - 72px)",
              backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb"
            }}
          />

          {/* Close Button */}
          <Button
            onClick={toggleFullscreen}
            size="sm"
            className="absolute top-20 left-6 z-[10001] bg-red-600 hover:bg-red-700 text-white border-0 shadow-xl"
          >
            <Minimize2 className="w-5 h-5 mr-1" />
            Close
          </Button>

          {/* Fullscreen Map Controls */}
          <div className="absolute top-20 right-6 z-[10001] flex flex-col gap-2">
            <Button onClick={handleZoomIn} size="sm" className="p-3 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-xl scale-110">
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button onClick={handleZoomOut} size="sm" className="p-3 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-xl scale-110">
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button onClick={handleMyLocation} size="sm" className="p-3 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-xl scale-110">
              <MapPin className="w-5 h-5" />
            </Button>
            <Button onClick={handleReset} size="sm" className="p-3 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-xl scale-110">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default FullWidthGlobeMapFixed;