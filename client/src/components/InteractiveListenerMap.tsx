import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  MapPin,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Navigation,
  Activity,
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

// Interactive world map component
const WorldMapDisplay = ({
  listeners,
  colors,
  isDarkMode,
  onListenerClick,
  selectedListener,
  zoomLevel,
  panOffset,
}: {
  listeners: ActiveListener[];
  colors: any;
  isDarkMode: boolean;
  onListenerClick: (listener: ActiveListener) => void;
  selectedListener: ActiveListener | null;
  zoomLevel: number;
  panOffset: { x: number; y: number };
}) => {
  const getScreenPosition = (lat: number, lng: number) => {
    // Convert lat/lng to screen coordinates
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* World Map Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500'%3e%3cpath d='M80 80 L120 60 L180 70 L220 80 L280 90 L320 100 L350 110 L380 130 L390 150 L385 180 L370 200 L340 210 L300 220 L250 210 L200 200 L150 180 L120 160 L100 140 L85 120 L80 100 Z' fill='${isDarkMode ? '%23374151' : '%23d1d5db'}' stroke='${isDarkMode ? '%23ffffff' : '%23000000'}' stroke-width='1'/%3e%3cpath d='M220 280 L250 270 L280 275 L300 290 L310 320 L315 350 L320 380 L315 410 L300 430 L280 440 L250 435 L230 420 L215 400 L210 380 L205 360 L210 340 L215 320 L220 300 Z' fill='${isDarkMode ? '%23374151' : '%23d1d5db'}' stroke='${isDarkMode ? '%23ffffff' : '%23000000'}' stroke-width='1'/%3e%3cpath d='M460 100 L480 95 L510 100 L540 105 L570 110 L580 130 L575 150 L565 165 L550 170 L530 168 L510 165 L490 160 L470 150 L455 135 L450 120 Z' fill='${isDarkMode ? '%23374151' : '%23d1d5db'}' stroke='${isDarkMode ? '%23ffffff' : '%23000000'}' stroke-width='1'/%3e%3cpath d='M460 180 L490 175 L520 180 L540 190 L550 210 L555 240 L560 270 L555 300 L550 330 L540 360 L530 380 L510 390 L490 385 L470 380 L450 370 L440 350 L435 330 L430 300 L435 270 L440 240 L445 210 L450 190 Z' fill='${isDarkMode ? '%23374151' : '%23d1d5db'}' stroke='${isDarkMode ? '%23ffffff' : '%23000000'}' stroke-width='1'/%3e%3cpath d='M580 90 L620 85 L660 90 L700 95 L740 100 L780 105 L820 110 L850 115 L880 125 L885 150 L880 175 L870 200 L850 220 L820 235 L780 240 L740 235 L700 230 L660 225 L620 220 L590 210 L575 190 L570 170 L575 150 L580 130 L585 110 Z' fill='${isDarkMode ? '%23374151' : '%23d1d5db'}' stroke='${isDarkMode ? '%23ffffff' : '%23000000'}' stroke-width='1'/%3e%3cpath d='M720 340 L760 335 L800 340 L830 345 L850 355 L855 375 L850 390 L830 400 L800 395 L760 390 L720 385 L700 375 L695 360 L700 345 Z' fill='${isDarkMode ? '%23374151' : '%23d1d5db'}' stroke='${isDarkMode ? '%23ffffff' : '%23000000'}' stroke-width='1'/%3e%3c/svg%3e")`,
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      />
      
      {/* Listener Markers */}
      {listeners
        .filter((listener) => listener.isActiveListening)
        .map((listener) => {
          const { x, y } = getScreenPosition(listener.lat, listener.lng);
          const isSelected = selectedListener?.id === listener.id;
          
          return (
            <div
              key={listener.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px) translate(-50%, -50%)`,
                zIndex: isSelected ? 20 : 10,
              }}
              onClick={() => onListenerClick(listener)}
            >
              {/* Pulse Animation */}
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: colors.primary,
                  opacity: 0.3,
                  width: '24px',
                  height: '24px',
                  transform: 'translate(-50%, -50%)',
                }}
              />
              
              {/* Main Marker */}
              <div
                className={`relative w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                  isSelected ? 'scale-150' : 'hover:scale-125'
                }`}
                style={{
                  backgroundColor: colors.primary,
                  borderColor: isDarkMode ? '#ffffff' : '#000000',
                  boxShadow: `0 0 ${isSelected ? '20px' : '10px'} ${colors.primary}66`,
                }}
              >
                <Activity className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              {/* Tooltip */}
              {isSelected && (
                <div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-30"
                  style={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    color: isDarkMode ? '#ffffff' : '#000000',
                    border: `1px solid ${colors.primary}`,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div className="font-bold">{listener.city}</div>
                  <div className="text-xs opacity-75">{listener.country}</div>
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                    style={{ borderTopColor: colors.primary }}
                  />
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default function InteractiveListenerMap() {
  const [activeListeners, setActiveListeners] = useState<ActiveListener[]>([]);
  const [selectedListener, setSelectedListener] = useState<ActiveListener | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const mapRef = useRef<HTMLDivElement>(null);
  const { colors, isDarkMode } = useTheme();

  const { data: stats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
  });

  useEffect(() => {
    // Initialize listeners
    setIsLoading(true);
    
    try {
      const initialListeners = generateActiveListeners();
      
      const timer = setTimeout(() => {
        setActiveListeners(initialListeners);
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error loading map:', error);
      setIsLoading(false);
      setActiveListeners(generateActiveListeners());
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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.3, 0.5));
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const activeListenerCount = activeListeners.filter(
    (l) => l.isActiveListening,
  ).length;
  const countriesWithListeners = new Set(
    activeListeners.filter((l) => l.isActiveListening).map((l) => l.country),
  ).size;

  return (
    <section
      id="map"
      className={`py-20 ${isDarkMode ? "bg-black" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className={`font-orbitron font-black text-3xl md:text-4xl mb-4 ${isDarkMode ? "text-white" : "text-black"}`}
          >
            GLOBAL METALHEADS
          </h2>
          <p
            className={`text-lg font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            See where metal fans are tuning in from around the world in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
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
                      onClick={handleZoomOut}
                      className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetView}
                      className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                    >
                      Reset
                    </Button>
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
                  ref={mapRef}
                  className={`relative ${isDarkMode ? "bg-gray-800" : "bg-gray-200"} rounded-lg ${isFullscreen ? "h-screen" : "h-96"} overflow-hidden cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
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

                  {/* World Map with Interactive Listeners */}
                  {!isLoading && (
                    <WorldMapDisplay
                      listeners={activeListeners}
                      colors={colors}
                      isDarkMode={isDarkMode}
                      onListenerClick={setSelectedListener}
                      selectedListener={selectedListener}
                      zoomLevel={zoomLevel}
                      panOffset={panOffset}
                    />
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

          {/* Listener Stats */}
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
        </div>
      </div>
    </section>
  );
}