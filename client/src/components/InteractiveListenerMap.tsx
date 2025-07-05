import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  MapPin,
  Users,
  Maximize2,
  Minimize2,
  Activity,
  Loader2,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  CloudLightning,
  Thermometer,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StreamStats } from "@shared/schema";
import { useTheme } from "@/contexts/ThemeContext";

interface ActiveListener {
  id: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  isActiveListening: boolean;
  lastSeen: Date;
  userId: string;
}

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

// Generate realistic active listeners with Firebase-style data
const generateActiveListeners = (): ActiveListener[] => [
  {
    id: "listener_001",
    country: "United States",
    city: "New York",
    lat: 40.7128,
    lng: -74.006,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_001",
  },
  {
    id: "listener_002",
    country: "United Kingdom",
    city: "London",
    lat: 51.5074,
    lng: -0.1278,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_002",
  },
  {
    id: "listener_003",
    country: "Germany",
    city: "Berlin",
    lat: 52.52,
    lng: 13.405,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_003",
  },
  {
    id: "listener_004",
    country: "Canada",
    city: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_004",
  },
  {
    id: "listener_005",
    country: "Australia",
    city: "Sydney",
    lat: -33.8688,
    lng: 151.2093,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_005",
  },
  {
    id: "listener_006",
    country: "France",
    city: "Paris",
    lat: 48.8566,
    lng: 2.3522,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_006",
  },
  {
    id: "listener_007",
    country: "Japan",
    city: "Tokyo",
    lat: 35.6762,
    lng: 139.6503,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_007",
  },
  {
    id: "listener_008",
    country: "Brazil",
    city: "São Paulo",
    lat: -23.5505,
    lng: -46.6333,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_008",
  },
  {
    id: "listener_009",
    country: "Sweden",
    city: "Stockholm",
    lat: 59.3293,
    lng: 18.0686,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_009",
  },
  {
    id: "listener_010",
    country: "Netherlands",
    city: "Amsterdam",
    lat: 52.3676,
    lng: 4.9041,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_010",
  },
  {
    id: "listener_011",
    country: "Mexico",
    city: "Mexico City",
    lat: 19.4326,
    lng: -99.1332,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_011",
  },
  {
    id: "listener_012",
    country: "South Africa",
    city: "Cape Town",
    lat: -33.9249,
    lng: 18.4241,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_012",
  },
  {
    id: "listener_013",
    country: "India",
    city: "Mumbai",
    lat: 19.076,
    lng: 72.8777,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_013",
  },
  {
    id: "listener_014",
    country: "Russia",
    city: "Moscow",
    lat: 55.7558,
    lng: 37.6176,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_014",
  },
  {
    id: "listener_015",
    country: "Argentina",
    city: "Buenos Aires",
    lat: -34.6118,
    lng: -58.396,
    isActiveListening: true,
    lastSeen: new Date(),
    userId: "user_015",
  },
];

// Google Maps component that loads dynamically
const GoogleMapWithListeners = ({
  listeners,
  colors,
  isDarkMode,
  onListenerClick,
  selectedListener,
  apiKey,
}: {
  listeners: ActiveListener[];
  colors: any;
  isDarkMode: boolean;
  onListenerClick: (listener: ActiveListener) => void;
  selectedListener: ActiveListener | null;
  apiKey: string;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (!mapRef.current || !apiKey) return;

      try {
        // Load Google Maps script
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
          script.async = true;
          script.defer = true;
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Create map
        const mapStyles = isDarkMode ? [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
        ] : [];

        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 2,
          center: { lat: 20, lng: 0 },
          styles: mapStyles,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Add markers for listeners
        listeners
          .filter(listener => listener.isActiveListening)
          .forEach(listener => {
            const marker = new window.google.maps.Marker({
              position: { lat: listener.lat, lng: listener.lng },
              map: map,
              title: `${listener.city}, ${listener.country}`,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: colors.primary,
                fillOpacity: 1,
                strokeColor: isDarkMode ? "#ffffff" : "#000000",
                strokeWeight: 2,
              },
            });

            marker.addListener("click", () => {
              onListenerClick(listener);
            });
          });

        setIsMapLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setMapError('Failed to load Google Maps');
      }
    };

    loadGoogleMaps();
  }, [apiKey, listeners, colors, isDarkMode, onListenerClick]);

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Globe className={`${isDarkMode ? "text-gray-600" : "text-gray-400"} h-16 w-16 mx-auto mb-4 opacity-50`} />
          <p className={`font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {mapError}
          </p>
        </div>
      </div>
    );
  }

  if (!isMapLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
};

// Weather Icon Component
const WeatherIcon = ({ iconCode, className = "w-6 h-6" }: { iconCode: string; className?: string }) => {
  // Map OpenWeather icon codes to Lucide icons
  const iconMap: { [key: string]: any } = {
    "01d": Sun, // clear sky day
    "01n": Sun, // clear sky night
    "02d": Cloud, // few clouds day
    "02n": Cloud, // few clouds night
    "03d": Cloud, // scattered clouds day
    "03n": Cloud, // scattered clouds night
    "04d": Cloud, // broken clouds day
    "04n": Cloud, // broken clouds night
    "09d": CloudDrizzle, // shower rain day
    "09n": CloudDrizzle, // shower rain night
    "10d": CloudRain, // rain day
    "10n": CloudRain, // rain night
    "11d": CloudLightning, // thunderstorm day
    "11n": CloudLightning, // thunderstorm night
    "13d": CloudSnow, // snow day
    "13n": CloudSnow, // snow night
    "50d": Cloud, // mist day
    "50n": Cloud, // mist night
  };

  const IconComponent = iconMap[iconCode] || Cloud;
  
  return <IconComponent className={className} />;
};

export default function InteractiveListenerMap() {
  const [activeListeners, setActiveListeners] = useState<ActiveListener[]>([]);
  const [selectedListener, setSelectedListener] = useState<ActiveListener | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const { colors, isDarkMode } = useTheme();

  const { data: stats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
  });

  // Fetch Google Maps API key
  const { data: config } = useQuery<{ googleMapsApiKey: string; openWeatherApiKey: string }>({
    queryKey: ["/api/config"],
    staleTime: Infinity,
  });

  // Fetch weather data when user location is available
  const { data: weather } = useQuery<WeatherData>({
    queryKey: ["/api/weather", userLocation?.lat, userLocation?.lng],
    enabled: !!userLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    // Initialize listeners
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setActiveListeners(generateActiveListeners());
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Fallback to a default location (New York)
          setUserLocation({
            lat: 40.7128,
            lng: -74.006,
          });
        }
      );
    } else {
      // Fallback to a default location (New York)
      setUserLocation({
        lat: 40.7128,
        lng: -74.006,
      });
    }
  }, []);

  // Real-time updates
  useEffect(() => {
    if (isLoading) return;

    const interval = setInterval(() => {
      setActiveListeners((prev) => {
        const updated = prev.map((listener) => {
          const shouldStayActive = Math.random() > 0.1;
          return {
            ...listener,
            isActiveListening: shouldStayActive,
            lastSeen: shouldStayActive ? new Date() : listener.lastSeen,
          };
        });

        // Add new listeners occasionally
        if (Math.random() > 0.7 && updated.length < 20) {
          const newListener: ActiveListener = {
            id: `listener_${Date.now()}`,
            country: "Random Country",
            city: "Random City",
            lat: (Math.random() - 0.5) * 160,
            lng: (Math.random() - 0.5) * 360,
            isActiveListening: true,
            lastSeen: new Date(),
            userId: `user_${Date.now()}`,
          };
          updated.push(newListener);
        }

        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const activeListenerCount = activeListeners.filter(
    (l) => l.isActiveListening,
  ).length;
  const countriesWithListeners = new Set(
    activeListeners.filter((l) => l.isActiveListening).map((l) => l.country),
  ).size;

  return (
    <section
      id="map"
      className={`py-20 ${isDarkMode ? "bg-black" : "bg-white"} ${
        isFullscreen ? "fixed inset-0 z-40 pt-24" : ""
      }`}
      style={{
        ...(isFullscreen && {
          paddingBottom: "120px", // Space for floating player
        }),
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className={`font-orbitron font-black text-3xl md:text-4xl mb-4 ${isDarkMode ? "text-white" : "text-black"}`}
          >
            LIVE INTERACTIVE MAP
          </h2>
          
          {/* Weather Information */}
          {weather && (
            <div className="mb-4">
              <p
                className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                {weather.location}
              </p>
              <div className="flex items-center justify-center gap-2">
                <WeatherIcon 
                  iconCode={weather.icon} 
                  className={`w-6 h-6 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`} 
                />
                <span
                  className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-black"}`}
                >
                  {weather.temperature}°F
                </span>
              </div>
            </div>
          )}
          
          <p
            className={`text-lg font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            See where metal fans are tuning in from around the world in real-time.
          </p>
        </div>

        <div className={`grid ${isFullscreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"} gap-8`}>
          {/* Interactive Map */}
          <div className={isFullscreen ? "col-span-1" : "lg:col-span-2"}>
            <Card
              className={`${isDarkMode ? "bg-gray-900/50 hover:bg-gray-900/70" : "bg-gray-100/50 hover:bg-gray-100/70"} transition-all duration-300 border-2`}
              style={{ borderColor: `${colors.primary}40` }}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3
                    className="font-black text-xl"
                    style={{ color: colors.primary }}
                  >
                    Live Listener Map
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div
                  className={`relative ${isDarkMode ? "bg-gray-800" : "bg-gray-200"} rounded-lg ${
                    isFullscreen ? "h-[calc(100vh-240px)]" : "h-96"
                  } overflow-hidden`}
                >
                  {/* Loading State */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="text-center">
                        <Globe
                          className={`${isDarkMode ? "text-gray-600" : "text-gray-400"} h-32 w-32 opacity-30 animate-pulse mx-auto mb-4`}
                        />
                        <div className="flex justify-center space-x-2">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-full animate-pulse"
                              style={{
                                backgroundColor: colors.primary,
                                animationDelay: `${i * 0.3}s`,
                                animationDuration: "1.5s",
                              }}
                            />
                          ))}
                        </div>
                        <p
                          className={`mt-4 font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Loading global listeners...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Google Maps or Fallback */}
                  {!isLoading && (
                    <>
                      {config?.googleMapsApiKey ? (
                        <GoogleMapWithListeners
                          listeners={activeListeners}
                          colors={colors}
                          isDarkMode={isDarkMode}
                          onListenerClick={setSelectedListener}
                          selectedListener={selectedListener}
                          apiKey={config.googleMapsApiKey}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Globe className={`${isDarkMode ? "text-gray-600" : "text-gray-400"} h-16 w-16 mx-auto mb-4 opacity-50`} />
                            <p className={`font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                              Interactive map coming soon
                            </p>
                            <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                              Global listener tracking enabled
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Selected Listener Info */}
                  {selectedListener && (
                    <div
                      className="absolute bottom-4 left-4 p-4 rounded-lg shadow-lg border z-20"
                      style={{
                        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                        borderColor: colors.primary,
                      }}
                    >
                      <button
                        onClick={() => setSelectedListener(null)}
                        className={`absolute top-2 right-2 ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"} text-lg`}
                      >
                        ×
                      </button>
                      <h4
                        className={`font-black mb-2 ${isDarkMode ? "text-white" : "text-black"}`}
                      >
                        {selectedListener.city}
                      </h4>
                      <p
                        className={`font-semibold text-sm mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {selectedListener.country}
                      </p>
                      <div
                        className="flex items-center"
                        style={{ color: colors.primary }}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        <span className="font-bold">Active Listener</span>
                      </div>
                      <p
                        className={`text-xs mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                      >
                        Last seen: {selectedListener.lastSeen.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listener Stats - Hide in fullscreen mode */}
          {!isFullscreen && (
            <div className="space-y-6">
              <Card
                className={`${isDarkMode ? "bg-gray-900/50 hover:bg-gray-900/70" : "bg-gray-100/50 hover:bg-gray-100/70"} transition-all duration-300 border-2`}
                style={{ borderColor: `${colors.primary}40` }}
              >
                <CardContent className="p-6">
                  <h3
                    className="font-black text-xl mb-3"
                    style={{ color: colors.primary }}
                  >
                    Live Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
                      >
                        Active Listeners
                      </span>
                      <span
                        className="font-black text-lg"
                        style={{ color: colors.primary }}
                      >
                        {activeListenerCount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
                      >
                        Countries
                      </span>
                      <span
                        className="font-black text-lg"
                        style={{ color: colors.primary }}
                      >
                        {countriesWithListeners}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
                      >
                        Total Listeners
                      </span>
                      <span
                        className="font-black text-lg"
                        style={{ color: colors.primary }}
                      >
                        {stats?.currentListeners || 42}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`${isDarkMode ? "bg-gray-900/50 hover:bg-gray-900/70" : "bg-gray-100/50 hover:bg-gray-100/70"} transition-all duration-300 border-2`}
                style={{ borderColor: `${colors.primary}40` }}
              >
                <CardContent className="p-6">
                  <h3
                    className="font-black text-xl mb-3"
                    style={{ color: colors.primary }}
                  >
                    Active Locations
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activeListeners
                      .filter((l) => l.isActiveListening)
                      .map((listener) => (
                        <div
                          key={listener.id}
                          className={`flex items-center justify-between p-2 rounded transition-colors duration-200 cursor-pointer ${
                            selectedListener?.id === listener.id
                              ? "bg-opacity-20"
                              : "hover:bg-opacity-10"
                          }`}
                          style={{
                            backgroundColor: selectedListener?.id === listener.id 
                              ? colors.primary 
                              : 'transparent',
                          }}
                          onClick={() => setSelectedListener(listener)}
                        >
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" style={{ color: colors.primary }} />
                            <div>
                              <div
                                className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-black"}`}
                              >
                                {listener.city}
                              </div>
                              <div
                                className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {listener.country}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div
                              className="w-2 h-2 rounded-full animate-pulse"
                              style={{ backgroundColor: colors.primary }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

declare global {
  interface Window {
    google: any;
  }
}