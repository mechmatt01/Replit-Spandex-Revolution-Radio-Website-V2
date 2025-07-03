import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  MapPin,
  TrendingUp,
} from "lucide-react";
import CountriesIconPath from "@assets/CountriesIcon.png";
import LiveNowIconPath from "@assets/LiveNowIcon.png";
import { useTheme } from "@/contexts/ThemeContext";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import type { StreamStats } from "@shared/schema";

interface ListenerData {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  isActive: boolean;
  lastSeen: Date;
  username?: string;
}

// Convert latitude/longitude to 3D sphere coordinates
const latLngToSphere = (lat: number, lng: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
};

export default function FullWidthGlobeMap() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isRotating, setIsRotating] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredListener, setHoveredListener] = useState<ListenerData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const globeRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const { colors, isDarkMode } = useTheme();
  
  // Add intersection observers for fade-in animations
  const { ref: statsRef, isVisible: statsVisible } = useIntersectionObserver();
  const { ref: locationsRef, isVisible: locationsVisible } = useIntersectionObserver();

  const { data: stats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
  });

  // Extended sample listener data - 15 locations for the top 10 display
  const [liveListeners, setLiveListeners] = useState<ListenerData[]>([
    {
      id: "1",
      city: "New York",
      country: "USA",
      lat: 40.7128,
      lng: -74.006,
      isActive: true,
      lastSeen: new Date(),
      username: "MetalHead92",
    },
    {
      id: "2",
      city: "London",
      country: "UK",
      lat: 51.5074,
      lng: -0.1278,
      isActive: true,
      lastSeen: new Date(),
      username: "RockLover",
    },
    {
      id: "3",
      city: "Tokyo",
      country: "Japan",
      lat: 35.6762,
      lng: 139.6503,
      isActive: true,
      lastSeen: new Date(),
      username: "MetalSamurai",
    },
    {
      id: "4",
      city: "Sydney",
      country: "Australia",
      lat: -33.8688,
      lng: 151.2093,
      isActive: true,
      lastSeen: new Date(),
      username: "OzMetalFan",
    },
    {
      id: "5",
      city: "Berlin",
      country: "Germany",
      lat: 52.52,
      lng: 13.405,
      isActive: true,
      lastSeen: new Date(),
      username: "TeutonRocker",
    },
    {
      id: "6",
      city: "São Paulo",
      country: "Brazil",
      lat: -23.5558,
      lng: -46.6396,
      isActive: true,
      lastSeen: new Date(),
      username: "BrazilMetal",
    },
    {
      id: "7",
      city: "Mumbai",
      country: "India",
      lat: 19.076,
      lng: 72.8777,
      isActive: true,
      lastSeen: new Date(),
      username: "IndianRocker",
    },
    {
      id: "8",
      city: "Moscow",
      country: "Russia",
      lat: 55.7558,
      lng: 37.6173,
      isActive: true,
      lastSeen: new Date(),
      username: "RussianMetal",
    },
    {
      id: "9",
      city: "Toronto",
      country: "Canada",
      lat: 43.6532,
      lng: -79.3832,
      isActive: true,
      lastSeen: new Date(),
      username: "CanadianRocker",
    },
    {
      id: "10",
      city: "Stockholm",
      country: "Sweden",
      lat: 59.3293,
      lng: 18.0686,
      isActive: true,
      lastSeen: new Date(),
      username: "NordicMetal",
    },
    {
      id: "11",
      city: "Mexico City",
      country: "Mexico",
      lat: 19.4326,
      lng: -99.1332,
      isActive: true,
      lastSeen: new Date(),
      username: "MexicanMetal",
    },
    {
      id: "12",
      city: "Cape Town",
      country: "South Africa",
      lat: -33.9249,
      lng: 18.4241,
      isActive: true,
      lastSeen: new Date(),
      username: "AfricanRock",
    },
    {
      id: "13",
      city: "Paris",
      country: "France",
      lat: 48.8566,
      lng: 2.3522,
      isActive: true,
      lastSeen: new Date(),
      username: "FrenchMetal",
    },
    {
      id: "14",
      city: "Buenos Aires",
      country: "Argentina",
      lat: -34.6118,
      lng: -58.396,
      isActive: true,
      lastSeen: new Date(),
      username: "ArgentinaMetal",
    },
    {
      id: "15",
      city: "Amsterdam",
      country: "Netherlands",
      lat: 52.3676,
      lng: 4.9041,
      isActive: true,
      lastSeen: new Date(),
      username: "DutchRocker",
    },
  ]);

  // Auto-rotation animation
  useEffect(() => {
    if (isRotating && !isDragging) {
      const animate = () => {
        setRotation((prev) => ({
          ...prev,
          y: prev.y + 0.5,
        }));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRotating, isDragging]);

  // Simulate loading and dynamic listener updates with smooth animations
  useEffect(() => {
    console.log("Globe loading started...");
    setIsLoading(true);

    const timer = setTimeout(() => {
      console.log("Globe loading complete!");
      setIsLoading(false);
    }, 2000);

    // Simulate listeners coming online/offline with smoother transitions
    const interval = setInterval(() => {
      setLiveListeners((prev) => {
        const updated = prev.map((listener) => ({
          ...listener,
          isActive: Math.random() > 0.15, // 85% chance to stay active
          lastSeen: listener.isActive ? new Date() : listener.lastSeen,
        }));

        // Sort by activity and last seen time for consistent ordering
        return updated.sort((a, b) => {
          if (a.isActive !== b.isActive) return b.isActive ? 1 : -1;
          return b.lastSeen.getTime() - a.lastSeen.getTime();
        });
      });
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsRotating(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotation((prev) => ({
      x: Math.max(-90, Math.min(90, prev.x + deltaY * 0.5)),
      y: prev.y + deltaX * 0.5,
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(3, prev + 0.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, prev - 0.2));
  const handleReset = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
    setIsRotating(true);
  };
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);
  const toggleRotation = () => setIsRotating((prev) => !prev);

  const activeListeners = liveListeners.filter((l) => l.isActive);
  const countriesWithListeners = new Set(activeListeners.map((l) => l.country))
    .size;
  const top10Listeners = activeListeners.slice(0, 10);

  return (
    <section
      id="map"
      className={`py-20 ${isDarkMode ? "bg-black" : "bg-white"}`}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className={`font-orbitron font-black text-3xl md:text-4xl mb-4 ${isDarkMode ? "text-white" : "text-black"}`}
          >
            GLOBAL METALHEADS
          </h2>
          <p
            className={`text-lg font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            See where metal fans are tuning in from around the world in
            real-time.
          </p>
        </div>

        {/* Full Width Globe Map */}
        <div className={`${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
          <Card
            className={`w-full mb-8 ${isDarkMode ? "bg-black/50" : "bg-white/90"} backdrop-blur-md border-0`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle
                  className="text-2xl font-black"
                  style={{ color: colors.primary }}
                >
                  Live Listener Map
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                    onClick={toggleRotation}
                  >
                    {isRotating ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="2" />
                        <rect x="14" y="4" width="4" height="16" rx="2" />
                      </svg>
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                    onClick={handleZoomOut}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                    onClick={handleZoomIn}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 3D Globe Container */}
              <div
                className={`relative h-96 ${isFullscreen ? "h-screen" : ""} overflow-hidden rounded-lg`}
                style={{
                  background: isDarkMode
                    ? "radial-gradient(circle at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)"
                    : "radial-gradient(circle at center, #87ceeb 0%, #4682b4 50%, #191970 100%)",
                }}
              >
                {/* Stars background */}
                <div className="absolute inset-0">
                  {[...Array(100)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                      }}
                    />
                  ))}
                </div>

                {/* 3D Globe */}
                <div
                  ref={globeRef}
                  className="absolute inset-0 flex items-center justify-center perspective-1000"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: isDragging ? "grabbing" : "grab" }}
                >
                  <div
                    className="relative preserve-3d"
                    style={{
                      transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                      transition: isDragging
                        ? "none"
                        : "transform 0.1s ease-out",
                    }}
                  >
                    {/* Globe sphere */}
                    <div
                      className="relative w-80 h-80 rounded-full border-2"
                      style={{
                        background: isDarkMode
                          ? "radial-gradient(circle at 30% 30%, #2d5a3d, #1e3a2e, #0f1f17)"
                          : "radial-gradient(circle at 30% 30%, #4a9b5e, #2d5a3d, #1e3a2e)",
                        borderColor: isDarkMode ? "#444" : "#666",
                        boxShadow: isDarkMode
                          ? "inset -20px -20px 50px rgba(0,0,0,0.5), 20px 20px 50px rgba(0,0,0,0.3)"
                          : "inset -20px -20px 50px rgba(0,0,0,0.3), 20px 20px 50px rgba(0,0,0,0.2)",
                      }}
                    >
                      {/* Continent outlines - larger for bigger globe */}
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className="absolute w-12 h-16 bg-green-600 rounded-full opacity-70 top-20 left-16" />{" "}
                        {/* North America */}
                        <div className="absolute w-8 h-12 bg-green-600 rounded-full opacity-70 top-32 left-24" />{" "}
                        {/* South America */}
                        <div className="absolute w-14 h-12 bg-green-600 rounded-full opacity-70 top-16 left-40" />{" "}
                        {/* Europe/Africa */}
                        <div className="absolute w-16 h-14 bg-green-600 rounded-full opacity-70 top-24 left-56" />{" "}
                        {/* Asia */}
                        <div className="absolute w-8 h-8 bg-green-600 rounded-full opacity-70 top-52 left-60" />{" "}
                        {/* Australia */}
                      </div>

                      {/* Loading state */}
                      {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin w-12 h-12 border-2 border-white border-t-transparent rounded-full" />
                        </div>
                      ) : null}

                      {/* Listener dots */}
                      {!isLoading &&
                        activeListeners.map((listener) => {
                          const spherePos = latLngToSphere(
                            listener.lat,
                            listener.lng,
                            160,
                          );
                          const isVisible = spherePos.z > 0; // Only show dots on the visible hemisphere

                          if (!isVisible) return null;

                          return (
                            <div
                              key={listener.id}
                              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                              style={{
                                left: `${50 + (spherePos.x / 160) * 50}%`,
                                top: `${50 - (spherePos.y / 160) * 50}%`,
                                zIndex: Math.round(spherePos.z),
                              }}
                              onMouseEnter={() => setHoveredListener(listener)}
                              onMouseLeave={() => setHoveredListener(null)}
                            >
                              <div
                                className="w-4 h-4 rounded-full animate-pulse cursor-pointer"
                                style={{
                                  backgroundColor: colors.primary,
                                  boxShadow: `0 0 15px ${colors.primary}`,
                                  animation: "pulse 2s infinite",
                                }}
                              />

                              {/* Tooltip */}
                              {hoveredListener?.id === listener.id && (
                                <div
                                  className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap z-50 ${
                                    isDarkMode
                                      ? "bg-black/90 text-white"
                                      : "bg-white/90 text-black"
                                  }`}
                                  style={{ backdropFilter: "blur(10px)" }}
                                >
                                  <div className="font-semibold">
                                    {listener.username || "Anonymous"}
                                  </div>
                                  <div>
                                    {listener.city}, {listener.country}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    Last seen:{" "}
                                    {listener.lastSeen.toLocaleTimeString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics and Active Locations Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Statistics - 33% width */}
          <div className="lg:col-span-1" ref={statsRef}>
            <Card
              className={`h-full ${isDarkMode ? "bg-black/50" : "bg-white/90"} backdrop-blur-md border-0 transition-all duration-600 ${
                statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              <CardHeader>
                <CardTitle
                  className="text-xl font-black text-center"
                  style={{ color: colors.primary }}
                >
                  Live Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={`p-4 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-black/5"} backdrop-blur-sm`}
                >
                  <div className="text-center">
                    <div
                      className="text-3xl font-black"
                      style={{ color: colors.primary }}
                    >
                      {stats?.currentListeners || activeListeners.length}
                    </div>
                    <div
                      className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      Live Now
                    </div>
                    <div className="flex justify-center mt-2">
                      <img
                        src={LiveNowIconPath}
                        alt="Live Now"
                        className="h-7 w-7"
                        style={{
                          filter: `brightness(0) saturate(100%) invert(47%) sepia(97%) saturate(1352%) hue-rotate(346deg) brightness(100%) contrast(91%)`,
                        }}
                        onLoad={() => console.log("LiveNow icon loaded")}
                        onError={(e) =>
                          console.error("LiveNow icon failed to load:", e)
                        }
                      />
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-black/5"} backdrop-blur-sm`}
                >
                  <div className="text-center">
                    <div
                      className="text-3xl font-black"
                      style={{ color: colors.primary }}
                    >
                      {countriesWithListeners}
                    </div>
                    <div
                      className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      Countries
                    </div>
                    <div className="flex justify-center mt-2">
                      <img
                        src={CountriesIconPath}
                        alt="Countries"
                        className="h-7 w-7"
                        style={{
                          filter: `brightness(0) saturate(100%) invert(47%) sepia(97%) saturate(1352%) hue-rotate(346deg) brightness(100%) contrast(91%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-black/5"} backdrop-blur-sm`}
                >
                  <div className="text-center">
                    <div
                      className="text-3xl font-black"
                      style={{ color: colors.primary }}
                    >
                      {stats?.totalListeners || 1847}
                    </div>
                    <div
                      className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      Total Listeners
                    </div>
                    <div className="flex justify-center mt-2">
                      <TrendingUp
                        className="h-7 w-7"
                        style={{ color: colors.primary }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Locations - 67% width in two columns */}
          <div className="lg:col-span-2" ref={locationsRef}>
            <Card
              className={`h-full ${isDarkMode ? "bg-black/50" : "bg-white/90"} backdrop-blur-md border-0 transition-all duration-600 ${
                locationsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              <CardHeader>
                <CardTitle
                  className="text-xl font-black text-center"
                  style={{ color: colors.primary }}
                >
                  Active Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Column - #1-#5 */}
                  <div className="space-y-3">
                    {top10Listeners.slice(0, 5).map((listener, index) => (
                      <div
                        key={listener.id}
                        className={`flex items-center p-3 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-black/5"} backdrop-blur-sm hover:bg-opacity-20 transition-all duration-500 transform hover:scale-105`}
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: "slideInFromLeft 0.5s ease-out forwards",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mr-3 transition-all duration-300 flex-shrink-0"
                          style={{
                            backgroundColor: colors.primary,
                            color: "white",
                          }}
                        >
                          #{index + 1}
                        </div>
                        <MapPin
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          style={{ color: colors.primary }}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-semibold text-sm truncate ${isDarkMode ? "text-white" : "text-black"}`}
                          >
                            {listener.city}, {listener.country}
                          </div>
                          <div
                            className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {listener.username} •{" "}
                            {listener.lastSeen.toLocaleTimeString()}
                          </div>
                        </div>
                        <div
                          className="w-2 h-2 rounded-full animate-pulse flex-shrink-0 ml-2"
                          style={{ backgroundColor: colors.primary }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Second Column - #6-#10 */}
                  <div className="space-y-3">
                    {top10Listeners.slice(5, 10).map((listener, index) => (
                      <div
                        key={listener.id}
                        className={`flex items-center p-3 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-black/5"} backdrop-blur-sm hover:bg-opacity-20 transition-all duration-500 transform hover:scale-105`}
                        style={{
                          animationDelay: `${(index + 5) * 100}ms`,
                          animation: "slideInFromRight 0.5s ease-out forwards",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mr-3 transition-all duration-300 flex-shrink-0"
                          style={{
                            backgroundColor: colors.primary,
                            color: "white",
                          }}
                        >
                          #{index + 6}
                        </div>
                        <MapPin
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          style={{ color: colors.primary }}
                        />
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-semibold text-sm truncate ${isDarkMode ? "text-white" : "text-black"}`}
                          >
                            {listener.city}, {listener.country}
                          </div>
                          <div
                            className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {listener.username} •{" "}
                            {listener.lastSeen.toLocaleTimeString()}
                          </div>
                        </div>
                        <div
                          className="w-2 h-2 rounded-full animate-pulse flex-shrink-0 ml-2"
                          style={{ backgroundColor: colors.primary }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
