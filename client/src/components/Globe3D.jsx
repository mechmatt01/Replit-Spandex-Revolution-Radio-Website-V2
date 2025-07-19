import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Play, Pause, } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
// Convert latitude/longitude to 3D sphere coordinates
const latLngToSphere = (lat, lng, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return {
        x: -(radius * Math.sin(phi) * Math.cos(theta)),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta),
    };
};
export default function Globe3D({ listeners = [], className = "", }) {
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isRotating, setIsRotating] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoveredListener, setHoveredListener] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const globeRef = useRef(null);
    const animationRef = useRef();
    const { colors, isDarkMode } = useTheme();
    const { data: stats } = useQuery({
        queryKey: ["/api/stream-stats"],
    });
    // Sample listener data - replace with real Firebase data
    const [liveListeners, setLiveListeners] = useState([
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
    // Simulate loading and dynamic listener updates
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 2000);
        // Simulate listeners coming online/offline
        const interval = setInterval(() => {
            setLiveListeners((prev) => prev.map((listener) => ({
                ...listener,
                isActive: Math.random() > 0.1, // 90% chance to stay active
                lastSeen: listener.isActive ? new Date() : listener.lastSeen,
            })));
        }, 3000);
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);
    // Mouse interaction handlers
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setIsRotating(false);
        setDragStart({ x: e.clientX, y: e.clientY });
    };
    const handleMouseMove = (e) => {
        if (!isDragging)
            return;
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
    return (<div className={`${className} ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      <Card className={`h-full ${isDarkMode ? "bg-black/50" : "bg-white/90"} backdrop-blur-md border-0`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-xl font-black ${isDarkMode ? "text-white" : "text-black"}`}>
              Global Listeners
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`} onClick={toggleRotation}>
                {isRotating ? (<Pause className="h-4 w-4"/>) : (<Play className="h-4 w-4"/>)}
              </Button>
              <Button variant="ghost" size="icon" className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`} onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4"/>
              </Button>
              <Button variant="ghost" size="icon" className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`} onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4"/>
              </Button>
              <Button variant="ghost" size="icon" className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`} onClick={handleReset}>
                <RotateCcw className="h-4 w-4"/>
              </Button>
              <Button variant="ghost" size="icon" className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`} onClick={toggleFullscreen}>
                {isFullscreen ? (<Minimize2 className="h-4 w-4"/>) : (<Maximize2 className="h-4 w-4"/>)}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 3D Globe Container */}
          <div className={`relative h-80 ${isFullscreen ? "h-screen" : ""} overflow-hidden rounded-lg`} style={{
            background: isDarkMode
                ? "radial-gradient(circle at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)"
                : "radial-gradient(circle at center, #87ceeb 0%, #4682b4 50%, #191970 100%)",
        }}>
            {/* Stars background */}
            <div className="absolute inset-0">
              {[...Array(100)].map((_, i) => (<div key={i} className="absolute w-1 h-1 bg-white rounded-full opacity-60" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
            }}/>))}
            </div>

            {/* 3D Globe */}
            <div ref={globeRef} className="absolute inset-0 flex items-center justify-center perspective-1000" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ cursor: isDragging ? "grabbing" : "grab" }}>
              <div className="relative preserve-3d" style={{
            transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging ? "none" : "transform 0.1s ease-out",
        }}>
                {/* Globe sphere */}
                <div className="relative w-64 h-64 rounded-full border-2" style={{
            background: isDarkMode
                ? "radial-gradient(circle at 30% 30%, #2d5a3d, #1e3a2e, #0f1f17)"
                : "radial-gradient(circle at 30% 30%, #4a9b5e, #2d5a3d, #1e3a2e)",
            borderColor: isDarkMode ? "#444" : "#666",
            boxShadow: isDarkMode
                ? "inset -20px -20px 50px rgba(0,0,0,0.5), 20px 20px 50px rgba(0,0,0,0.3)"
                : "inset -20px -20px 50px rgba(0,0,0,0.3), 20px 20px 50px rgba(0,0,0,0.2)",
        }}>
                  {/* Continent outlines */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    {/* Simplified continent shapes */}
                    <div className="absolute w-8 h-12 bg-green-600 rounded-full opacity-70 top-16 left-12"/>{" "}
                    {/* North America */}
                    <div className="absolute w-6 h-8 bg-green-600 rounded-full opacity-70 top-24 left-20"/>{" "}
                    {/* South America */}
                    <div className="absolute w-10 h-8 bg-green-600 rounded-full opacity-70 top-12 left-32"/>{" "}
                    {/* Europe/Africa */}
                    <div className="absolute w-12 h-10 bg-green-600 rounded-full opacity-70 top-20 left-44"/>{" "}
                    {/* Asia */}
                    <div className="absolute w-6 h-6 bg-green-600 rounded-full opacity-70 top-40 left-48"/>{" "}
                    {/* Australia */}
                  </div>

                  {/* Loading state */}
                  {isLoading && (<div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"/>
                    </div>)}

                  {/* Listener dots */}
                  {!isLoading &&
            activeListeners.map((listener) => {
                const spherePos = latLngToSphere(listener.lat, listener.lng, 128);
                const isVisible = spherePos.z > 0; // Only show dots on the visible hemisphere
                if (!isVisible)
                    return null;
                return (<div key={listener.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto" style={{
                        left: `${50 + (spherePos.x / 128) * 50}%`,
                        top: `${50 - (spherePos.y / 128) * 50}%`,
                        zIndex: Math.round(spherePos.z),
                    }} onMouseEnter={() => setHoveredListener(listener)} onMouseLeave={() => setHoveredListener(null)}>
                          <div className="w-3 h-3 rounded-full animate-pulse cursor-pointer" style={{
                        backgroundColor: colors.primary,
                        boxShadow: `0 0 10px ${colors.primary}`,
                        animation: "pulse 2s infinite",
                    }}/>

                          {/* Tooltip */}
                          {hoveredListener?.id === listener.id && (<div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap z-50 ${isDarkMode
                            ? "bg-black/90 text-white"
                            : "bg-white/90 text-black"}`} style={{ backdropFilter: "blur(10px)" }}>
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
                            </div>)}
                        </div>);
            })}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-black/5"} backdrop-blur-sm`}>
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: colors.primary }}>
                  {stats?.currentListeners || activeListeners.length}
                </div>
                <div className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                  Live Now
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-black/5"} backdrop-blur-sm`}>
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: colors.primary }}>
                  {countriesWithListeners}
                </div>
                <div className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                  Countries
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-white/5" : "bg-black/5"} backdrop-blur-sm`}>
              <div className="text-center">
                <div className="text-2xl font-black" style={{ color: colors.primary }}>
                  {stats?.totalListeners || 1847}
                </div>
                <div className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                  Total
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>);
}
