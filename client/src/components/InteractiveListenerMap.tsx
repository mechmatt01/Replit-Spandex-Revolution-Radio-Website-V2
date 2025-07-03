import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe, MapPin, Users, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
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
  { id: "listener_001", country: "United States", city: "New York", lat: 40.7128, lng: -74.0060, isActiveListening: true, lastSeen: new Date(), userId: "user_001" },
  { id: "listener_002", country: "United Kingdom", city: "London", lat: 51.5074, lng: -0.1278, isActiveListening: true, lastSeen: new Date(), userId: "user_002" },
  { id: "listener_003", country: "Germany", city: "Berlin", lat: 52.5200, lng: 13.4050, isActiveListening: true, lastSeen: new Date(), userId: "user_003" },
  { id: "listener_004", country: "Canada", city: "Toronto", lat: 43.6532, lng: -79.3832, isActiveListening: true, lastSeen: new Date(), userId: "user_004" },
  { id: "listener_005", country: "Australia", city: "Sydney", lat: -33.8688, lng: 151.2093, isActiveListening: true, lastSeen: new Date(), userId: "user_005" },
  { id: "listener_006", country: "France", city: "Paris", lat: 48.8566, lng: 2.3522, isActiveListening: true, lastSeen: new Date(), userId: "user_006" },
  { id: "listener_007", country: "Japan", city: "Tokyo", lat: 35.6762, lng: 139.6503, isActiveListening: true, lastSeen: new Date(), userId: "user_007" },
  { id: "listener_008", country: "Brazil", city: "São Paulo", lat: -23.5505, lng: -46.6333, isActiveListening: true, lastSeen: new Date(), userId: "user_008" },
  { id: "listener_009", country: "Sweden", city: "Stockholm", lat: 59.3293, lng: 18.0686, isActiveListening: true, lastSeen: new Date(), userId: "user_009" },
  { id: "listener_010", country: "Netherlands", city: "Amsterdam", lat: 52.3676, lng: 4.9041, isActiveListening: true, lastSeen: new Date(), userId: "user_010" },
  { id: "listener_011", country: "Mexico", city: "Mexico City", lat: 19.4326, lng: -99.1332, isActiveListening: true, lastSeen: new Date(), userId: "user_011" },
  { id: "listener_012", country: "South Africa", city: "Cape Town", lat: -33.9249, lng: 18.4241, isActiveListening: true, lastSeen: new Date(), userId: "user_012" },
  { id: "listener_013", country: "India", city: "Mumbai", lat: 19.0760, lng: 72.8777, isActiveListening: true, lastSeen: new Date(), userId: "user_013" },
  { id: "listener_014", country: "Russia", city: "Moscow", lat: 55.7558, lng: 37.6176, isActiveListening: true, lastSeen: new Date(), userId: "user_014" },
  { id: "listener_015", country: "Argentina", city: "Buenos Aires", lat: -34.6118, lng: -58.3960, isActiveListening: true, lastSeen: new Date(), userId: "user_015" },
];

// Simple world map SVG paths (simplified for performance)
const WorldMapSVG = ({ className, fill, stroke }: { className?: string; fill?: string; stroke?: string }) => (
  <svg
    className={className}
    viewBox="0 0 1000 500"
    preserveAspectRatio="xMidYMid meet"
  >
    {/* North America */}
    <path
      d="M150 120 Q200 100 280 130 L320 140 Q350 120 380 140 L390 180 Q370 200 340 190 L280 200 Q220 220 180 200 Q140 180 150 120 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
    />
    
    {/* South America */}
    <path
      d="M250 260 Q280 250 300 280 L320 350 Q300 400 280 380 Q250 390 240 360 Q230 320 240 290 Q245 270 250 260 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
    />
    
    {/* Europe */}
    <path
      d="M480 120 Q520 110 550 130 L580 140 Q570 160 550 170 L520 160 Q490 150 480 120 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
    />
    
    {/* Africa */}
    <path
      d="M460 200 Q500 190 530 210 L540 280 Q520 350 500 340 Q470 350 460 320 Q450 280 460 240 Q455 220 460 200 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
    />
    
    {/* Asia */}
    <path
      d="M580 120 Q650 100 720 130 L780 140 Q820 120 850 140 L860 200 Q840 220 800 210 L750 220 Q680 240 620 220 Q580 200 580 120 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
    />
    
    {/* Australia */}
    <path
      d="M750 320 Q800 310 830 330 L840 350 Q820 370 790 360 Q760 370 750 350 Q740 340 750 320 Z"
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
    />
  </svg>
);

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
    // Simulate initial loading
    setIsLoading(true);
    setTimeout(() => {
      setActiveListeners(generateActiveListeners());
      setIsLoading(false);
    }, 1500);

    // Simulate real-time updates - listeners coming online/offline
    const interval = setInterval(() => {
      setActiveListeners(prev => {
        const updated = prev.map(listener => {
          // 90% chance to stay active, 10% chance to go offline
          const shouldStayActive = Math.random() > 0.1;
          return {
            ...listener,
            isActiveListening: shouldStayActive,
            lastSeen: shouldStayActive ? new Date() : listener.lastSeen
          };
        });

        // Occasionally add new listeners
        if (Math.random() > 0.7 && updated.length < 20) {
          const newListener: ActiveListener = {
            id: `listener_${Date.now()}`,
            country: "Random Country",
            city: "Random City", 
            lat: (Math.random() - 0.5) * 160, // -80 to 80
            lng: (Math.random() - 0.5) * 360, // -180 to 180
            isActiveListening: true,
            lastSeen: new Date(),
            userId: `user_${Date.now()}`
          };
          updated.push(newListener);
        }

        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.3, 0.5));
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Convert lat/lng to screen coordinates
  const getScreenPosition = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  const activeListenerCount = activeListeners.filter(l => l.isActiveListening).length;
  const countriesWithListeners = new Set(activeListeners.filter(l => l.isActiveListening).map(l => l.country)).size;

  return (
    <section id="map" className={`py-20 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`font-orbitron font-black text-3xl md:text-4xl mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            GLOBAL METALHEADS
          </h2>
          <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            See where metal fans are tuning in from around the world in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card 
              className={`${isDarkMode ? 'bg-gray-900/50 hover:bg-gray-900/70' : 'bg-gray-100/50 hover:bg-gray-100/70'} transition-all duration-300 border-2`}
              style={{ borderColor: `${colors.primary}40` }}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-xl" style={{ color: colors.primary }}>
                    Live Listener Map
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'}`}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'}`}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetView}
                      className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'}`}
                    >
                      Reset
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className={`${isDarkMode ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'}`}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div 
                  ref={mapRef}
                  className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg ${isFullscreen ? 'h-screen' : 'h-96'} overflow-hidden cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Loading State */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Globe className={`${isDarkMode ? 'text-gray-600' : 'text-gray-400'} h-32 w-32 opacity-30 animate-pulse mx-auto mb-4`} />
                        <div className="flex justify-center space-x-2">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-full animate-pulse"
                              style={{
                                backgroundColor: colors.primary,
                                animationDelay: `${i * 0.3}s`,
                                animationDuration: '1.5s'
                              }}
                            />
                          ))}
                        </div>
                        <p className={`mt-4 font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Loading global listeners...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* World Map */}
                  {!isLoading && (
                    <div
                      className="absolute inset-0 transition-transform duration-200"
                      style={{
                        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                        transformOrigin: 'center center'
                      }}
                    >
                      {/* Map Background */}
                      <div className="w-full h-full flex items-center justify-center">
                        <WorldMapSVG
                          className="w-full h-full max-w-4xl"
                          fill={isDarkMode ? '#374151' : '#d1d5db'}
                          stroke={isDarkMode ? '#4b5563' : '#9ca3af'}
                        />
                      </div>

                      {/* Active Listener Dots */}
                      <div className="absolute inset-0">
                        {activeListeners
                          .filter(listener => listener.isActiveListening)
                          .map((listener) => {
                            const position = getScreenPosition(listener.lat, listener.lng);
                            return (
                              <div
                                key={listener.id}
                                className="absolute cursor-pointer transition-all duration-500 ease-in-out"
                                style={{
                                  left: `${position.x}%`,
                                  top: `${position.y}%`,
                                  transform: 'translate(-50%, -50%)',
                                  opacity: listener.isActiveListening ? 1 : 0,
                                }}
                                onClick={() => setSelectedListener(listener)}
                              >
                                <div className="relative">
                                  {/* Main dot */}
                                  <div 
                                    className="w-3 h-3 rounded-full animate-pulse transition-all duration-300 hover:scale-150"
                                    style={{
                                      backgroundColor: colors.primary,
                                      boxShadow: `0 0 15px ${colors.primary}80`
                                    }}
                                  />
                                  {/* Pulsing ring */}
                                  <div 
                                    className="absolute -top-1 -left-1 w-5 h-5 rounded-full animate-ping opacity-30"
                                    style={{
                                      border: `2px solid ${colors.primary}`
                                    }}
                                  />
                                  {/* Larger outer ring */}
                                  <div 
                                    className="absolute -top-2 -left-2 w-7 h-7 rounded-full animate-pulse opacity-20"
                                    style={{
                                      border: `1px solid ${colors.primary}`,
                                      animationDelay: '0.5s',
                                      animationDuration: '2s'
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Listener Info Popup */}
                      {selectedListener && (
                        <div 
                          className={`absolute top-4 left-4 ${isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-sm rounded-lg p-4 min-w-48 shadow-xl border`}
                          style={{ borderColor: `${colors.primary}40` }}
                        >
                          <button
                            onClick={() => setSelectedListener(null)}
                            className={`absolute top-2 right-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} text-lg`}
                          >
                            ×
                          </button>
                          <h4 className={`font-black mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                            {selectedListener.city}
                          </h4>
                          <p className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedListener.country}
                          </p>
                          <div className="flex items-center" style={{ color: colors.primary }}>
                            <Users className="h-4 w-4 mr-1" />
                            <span className="font-bold">Active Listener</span>
                          </div>
                          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Last seen: {selectedListener.lastSeen.toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listener Stats */}
          <div className="space-y-6">
            <Card 
              className={`${isDarkMode ? 'bg-gray-900/50 hover:bg-gray-900/70' : 'bg-gray-100/50 hover:bg-gray-100/70'} transition-all duration-300 border-2`}
              style={{ borderColor: `${colors.primary}40` }}
            >
              <CardContent className="p-6">
                <h3 className="font-black text-xl mb-3" style={{ color: colors.primary }}>Live Statistics</h3>
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Active Listeners</span>
                    <span className="font-black text-lg" style={{ color: colors.primary }}>{activeListenerCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Countries</span>
                    <span className="font-black text-lg" style={{ color: colors.primary }}>{countriesWithListeners}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Total Listeners</span>
                    <span className="font-black text-lg" style={{ color: colors.primary }}>{stats?.totalListeners || 1847}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`${isDarkMode ? 'bg-gray-900/50 hover:bg-gray-900/70' : 'bg-gray-100/50 hover:bg-gray-100/70'} transition-all duration-300 border-2`}
              style={{ borderColor: `${colors.primary}40` }}
            >
              <CardContent className="p-6">
                <h3 className="font-black text-xl mb-4" style={{ color: colors.primary }}>Active Locations</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activeListeners
                    .filter(listener => listener.isActiveListening)
                    .slice(0, 8)
                    .map((listener, index) => (
                      <div key={listener.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-bold mr-3" style={{ color: colors.primary }}>#{index + 1}</span>
                          <div>
                            <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>{listener.city}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{listener.country}</p>
                          </div>
                        </div>
                        <div 
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: colors.primary }}
                        />
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