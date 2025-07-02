import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StreamStats } from "@shared/schema";

interface Listener {
  id: string;
  country: string;
  city: string;
  lat: number;
  lng: number;
  count: number;
}

// Simulated listener data for demonstration
const generateListenerData = (): Listener[] => [
  { id: "1", country: "United States", city: "New York", lat: 40.7128, lng: -74.0060, count: 143 },
  { id: "2", country: "United Kingdom", city: "London", lat: 51.5074, lng: -0.1278, count: 89 },
  { id: "3", country: "Germany", city: "Berlin", lat: 52.5200, lng: 13.4050, count: 76 },
  { id: "4", country: "Canada", city: "Toronto", lat: 43.6532, lng: -79.3832, count: 67 },
  { id: "5", country: "Australia", city: "Sydney", lat: -33.8688, lng: 151.2093, count: 54 },
  { id: "6", country: "France", city: "Paris", lat: 48.8566, lng: 2.3522, count: 43 },
  { id: "7", country: "Japan", city: "Tokyo", lat: 35.6762, lng: 139.6503, count: 38 },
  { id: "8", country: "Brazil", city: "São Paulo", lat: -23.5505, lng: -46.6333, count: 32 },
  { id: "9", country: "Sweden", city: "Stockholm", lat: 59.3293, lng: 18.0686, count: 29 },
  { id: "10", country: "Netherlands", city: "Amsterdam", lat: 52.3676, lng: 4.9041, count: 24 },
];

export default function InteractiveListenerMap() {
  const [listeners, setListeners] = useState<Listener[]>([]);
  const [selectedListener, setSelectedListener] = useState<Listener | null>(null);
  const [colors, setColors] = useState({
    text: 'white',
    primary: 'orange',
  });

  const { data: stats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
  });

  useEffect(() => {
    // Initialize listener data
    setListeners(generateListenerData());

    // Simulate real-time updates
    const interval = setInterval(() => {
      setListeners(prev => prev.map(listener => ({
        ...listener,
        count: Math.max(1, listener.count + Math.floor(Math.random() * 10) - 5)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalListeners = listeners.reduce((sum, listener) => sum + listener.count, 0);

  return (
    <section id="map" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-black text-3xl md:text-4xl mb-4 text-white">
            GLOBAL METALHEADS
          </h2>
          <p className="text-gray-400 text-lg font-semibold">
            See where metal fans are tuning in from around the world in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Visualization */}
          <div className="lg:col-span-2">
            <Card className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
              <CardContent className="p-6">
                <div className="relative bg-gray-900 rounded-lg h-96 overflow-hidden">
                  {/* World Map SVG Background */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Globe className="text-gray-600 h-32 w-32 opacity-30" />
                  </div>

                  {/* Listener Dots */}
                  <div className="absolute inset-0">
                    {listeners.map((listener) => (
                      <div
                        key={listener.id}
                        className="absolute cursor-pointer"
                        style={{
                          left: `${((listener.lng + 180) / 360) * 100}%`,
                          top: `${((90 - listener.lat) / 180) * 100}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={() => setSelectedListener(listener)}
                      >
                        <div className="relative">
                          <div 
                            className="w-3 h-3 bg-metal-orange rounded-full animate-pulse"
                            style={{
                              boxShadow: `0 0 ${Math.min(listener.count / 5, 20)}px rgba(255, 165, 0, 0.6)`
                            }}
                          ></div>
                          <div className="absolute -top-1 -left-1 w-5 h-5 border-2 border-metal-orange rounded-full animate-ping opacity-30"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Listener Info Popup */}
                  {selectedListener && (
                    <div className="absolute top-4 left-4 bg-dark-bg/90 rounded-lg p-4 min-w-48">
                      <h4 className="font-black text-white mb-2">{selectedListener.city}</h4>
                      <p className="text-gray-400 font-semibold text-sm mb-1">{selectedListener.country}</p>
                      <div className="flex items-center text-metal-orange">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="font-bold">{selectedListener.count} listeners</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listener Stats */}
          <div className="space-y-6">
            <Card className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-black text-xl mb-3 text-metal-orange">Live Statistics</h3>
                
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold" style={{ color: colors.text }}>Total Listeners</span>
                    <span className="font-black text-lg" style={{ color: colors.primary }}>{stats?.currentListeners || totalListeners}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold" style={{ color: colors.text }}>Countries</span>
                    <span className="font-black text-lg" style={{ color: colors.primary }}>{listeners.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold" style={{ color: colors.text }}>Peak Today</span>
                    <span className="font-black text-lg" style={{ color: colors.primary }}>{stats?.peakListeners || 1847}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="font-black text-xl mb-4 text-metal-orange">Top Locations</h3>
                <div className="space-y-3">
                  {listeners
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map((listener, index) => (
                      <div key={listener.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-metal-orange font-bold mr-3">#{index + 1}</span>
                          <div>
                            <p className="text-white font-semibold text-sm">{listener.city}</p>
                            <p className="text-gray-400 text-xs">{listener.country}</p>
                          </div>
                        </div>
                        <span className="text-metal-orange font-bold">{listener.count}</span>
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