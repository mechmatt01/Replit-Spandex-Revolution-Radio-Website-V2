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
  X,
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
  themeName,
  onListenerClick,
  selectedListener,
  apiKey,
  userLocation,
}: {
  listeners: ActiveListener[];
  colors: any;
  isDarkMode: boolean;
  themeName: string;
  onListenerClick: (listener: ActiveListener) => void;
  selectedListener: ActiveListener | null;
  apiKey: string;
  userLocation?: { lat: number; lng: number };
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      console.log('=== Google Maps Loading Debug ===');
      console.log('Map ref current:', !!mapRef.current);
      console.log('API key available:', !!apiKey);
      console.log('API key value:', apiKey?.substring(0, 15) + '...');
      
      if (!mapRef.current) {
        console.log('Map ref not available');
        return;
      }
      
      if (!apiKey) {
        console.log('Google Maps API key not available');
        setMapError('Google Maps API key not configured');
        return;
      }

      try {
        console.log('Loading Google Maps with API key:', apiKey.substring(0, 10) + '...');
        
        // Load Google Maps script if not already loaded
        if (!window.google) {
          console.log('Loading Google Maps script...');
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&loading=async`;
          script.async = true;
          script.defer = true;
          
          await new Promise((resolve, reject) => {
            script.onload = () => {
              console.log('Google Maps script loaded successfully');
              // Wait a bit for all Google Maps modules to be fully loaded
              setTimeout(() => {
                if (window.google && window.google.maps && window.google.maps.Map && window.google.maps.MapTypeId && window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
                  resolve(true);
                } else {
                  console.error('Google Maps API modules not fully loaded after timeout');
                  reject(new Error('Google Maps API modules not fully loaded'));
                }
              }, 100);
            };
            script.onerror = (error) => {
              console.error('Google Maps script failed to load:', error);
              reject(error);
            };
            document.head.appendChild(script);
          });
        }

        console.log('Creating Google Map...');
        
        // Use theme-aware styling for Google Maps
        // Check if it's any dark theme or if isDarkMode is true
        const shouldUseDarkMap = isDarkMode || 
          themeName === 'classic-metal' || 
          themeName === 'black-metal' || 
          themeName === 'death-metal' || 
          themeName === 'doom-metal' || 
          themeName === 'thrash-metal' || 
          themeName === 'gothic-metal' ||
          themeName === 'dark-mode';
        
        console.log('InteractiveListenerMap theme detection:', {
          themeName,
          isDarkMode,
          shouldUseDarkMap
        });
        
        // Create map styles based on theme
        const mapStyles = shouldUseDarkMap ? [
          // Dark theme map styles
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
          { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
          { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
          { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },
        ] : [
          // Light theme map styles
          { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e0e0e0" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#696969" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
          { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
          { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
          { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },
        ];

        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 2,
          center: { lat: 20, lng: 0 },
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'cooperative',
          restriction: {
            latLngBounds: {
              north: 85,
              south: -85,
              west: -180,
              east: 180,
            },
            strictBounds: true,
          },
          minZoom: 2,
          maxZoom: 18,
        });

        console.log('Map created, adding markers...');

        // Add markers for active listeners
        const activeListeners = listeners.filter(listener => listener.isActiveListening);
        console.log(`Adding ${activeListeners.length} markers`);
        
        activeListeners.forEach((listener, index) => {
          // Create SVG content for the marker
          const markerSvg = `
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="${colors.primary}" opacity="1" stroke="${isDarkMode ? "#ffffff" : "#000000"}" stroke-width="2"/>
            </svg>
          `;
          
          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            position: { lat: listener.lat, lng: listener.lng },
            map: map,
            title: `${listener.city}, ${listener.country}`,
            content: (() => {
              const div = document.createElement('div');
              div.innerHTML = markerSvg;
              return div;
            })(),
          });

          marker.addListener("click", () => {
            console.log('Marker clicked:', listener.city);
            
            // Animate marker selection with pulsing effect
            const originalIcon = marker.getIcon();
            const selectedIcon = {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: colors.primary,
              fillOpacity: 1,
              strokeColor: isDarkMode ? "#ffffff" : "#000000",
              strokeWeight: 3,
              animation: window.google.maps.Animation.BOUNCE,
            };
            
            // Apply bounce animation
            marker.setIcon(selectedIcon);
            
            // Smooth zoom animation to the clicked location
            if (map) {
              map.panTo({ lat: listener.lat, lng: listener.lng });
              
              // Smooth zoom transition
              const currentZoom = map.getZoom();
              let targetZoom = 8;
              if (currentZoom < 8) {
                targetZoom = 8; // Zoom level 8 for a good city view
              } else if (currentZoom < 12) {
                targetZoom = 12; // Zoom closer if already at city level
              }
              
              // Animate zoom with smooth transition
              const zoomAnimation = () => {
                const startZoom = map.getZoom();
                const zoomDiff = targetZoom - startZoom;
                let progress = 0;
                
                const animateZoom = () => {
                  progress += 0.1;
                  if (progress <= 1) {
                    const currentZoomLevel = startZoom + (zoomDiff * progress);
                    map.setZoom(currentZoomLevel);
                    requestAnimationFrame(animateZoom);
                  } else {
                    map.setZoom(targetZoom);
                  }
                };
                
                if (Math.abs(zoomDiff) > 0.1) {
                  requestAnimationFrame(animateZoom);
                }
              };
              
              setTimeout(zoomAnimation, 300); // Start zoom after pan animation
            }
            
            // Reset user location selection when clicking on another listener
            setIsUserLocationSelected(false);
            
            // Restore original icon after animation
            setTimeout(() => {
              marker.setIcon(originalIcon);
            }, 2000);
            
            onListenerClick(listener);
          });
        });

        // Add user location marker if available
        if (userLocation) {
          // Create a flashing blue dot for user location
          const userMarkerCircle = new window.google.maps.Circle({
            center: { lat: userLocation.lat, lng: userLocation.lng },
            radius: 50000, // 50km radius
            map: map,
            strokeColor: "#3B82F6",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#3B82F6",
            fillOpacity: 0.35,
            clickable: true,
            zIndex: 1000,
          });

          // Create a pulsing marker for user location
          const userMarker = new window.google.maps.Marker({
            position: { lat: userLocation.lat, lng: userLocation.lng },
            map: map,
            title: "This is you!",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: "#60A5FA", // Light blue color
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 3,
            },
            zIndex: 1001,
          });

          // Create CSS animation for pulsing effect
          const pulseAnimation = document.createElement('style');
          pulseAnimation.textContent = `
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.7; }
              100% { transform: scale(1); opacity: 1; }
            }
          `;
          document.head.appendChild(pulseAnimation);

          // Apply pulsing animation to the marker
          const markerElement = userMarker.getIcon();
          setTimeout(() => {
            const markerDiv = document.querySelector(`div[title="This is you!"]`);
            if (markerDiv) {
              markerDiv.style.animation = 'pulse 2s infinite';
            }
          }, 100);

          // Create info window for user location
          const userInfoWindow = new window.google.maps.InfoWindow({
            content: `
              <div id="custom-info-window" style="
                background: ${isDarkMode ? '#1f2937' : '#ffffff'};
                color: ${isDarkMode ? '#ffffff' : '#1f2937'};
                padding: 12px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                border: 2px solid ${colors.primary};
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                min-width: 120px;
                text-align: center;
              ">
                <div style="margin-bottom: 4px;">📍 This is you!</div>
                <div style="font-size: 12px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'};">
                  Your current location
                </div>
              </div>
            `,
          });

          userMarker.addListener("click", () => {
            console.log('User location clicked - zooming in');
            // Zoom in and center on user location
            map.panTo({ lat: userLocation.lat, lng: userLocation.lng });
            map.setZoom(12);
            userInfoWindow.open(map, userMarker);
            
            // Create a dummy listener object for the user's location
            const userAsListener: ActiveListener = {
              id: "user-location",
              country: "Your Location",
              city: "Current Position",
              lat: userLocation.lat,
              lng: userLocation.lng,
              isActiveListening: true,
              lastSeen: new Date(),
              userId: "current-user"
            };
            
            // Set as selected and mark as user location
            setSelectedListener(userAsListener);
            setIsUserLocationSelected(true);
          });

          // Circle click event
          userMarkerCircle.addListener("click", () => {
            console.log('User location circle clicked - zooming in');
            map.panTo({ lat: userLocation.lat, lng: userLocation.lng });
            map.setZoom(12);
            userInfoWindow.open(map, userMarker);
            
            // Create a dummy listener object for the user's location
            const userAsListener: ActiveListener = {
              id: "user-location",
              country: "Your Location",
              city: "Current Position",
              lat: userLocation.lat,
              lng: userLocation.lng,
              isActiveListening: true,
              lastSeen: new Date(),
              userId: "current-user"
            };
            
            // Set as selected and mark as user location
            setSelectedListener(userAsListener);
            setIsUserLocationSelected(true);
          });

          // Auto-open the info window briefly to show the user
          setTimeout(() => {
            userInfoWindow.open(map, userMarker);
            setTimeout(() => {
              userInfoWindow.close();
            }, 3000);
          }, 1000);
        }

        console.log('Google Map loaded successfully with', activeListeners.length, 'markers');
        setIsMapLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setMapError(`Failed to load Google Maps: ${error.message}`);
      }
    };

    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(loadGoogleMaps, 100);
    return () => clearTimeout(timer);
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
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [isUserLocationSelected, setIsUserLocationSelected] = useState(false);

  const { colors, isDarkMode, currentTheme } = useTheme();

  // Add CSS-based fullscreen functionality
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const { data: stats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
  });

  // Fetch Google Maps API key
  const { data: config } = useQuery<{ googleMapsApiKey: string; openWeatherApiKey: string }>({
    queryKey: ["/api/config"],
    staleTime: Infinity,
    retry: 3,
    retryDelay: 1000,
  });

  // Use hardcoded API key if config is not available
  const apiKey = config?.googleMapsApiKey || "AIzaSyD684t68gySSzHi6MwBX2o9p3xK3XsMkUk";

  // Fetch weather data when user location is available
  const { data: weather, error: weatherError, isLoading: weatherLoading } = useQuery<WeatherData>({
    queryKey: ["/api/weather", userLocation?.lat, userLocation?.lng],
    enabled: !!userLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });

  // Debug weather error and user location
  useEffect(() => {
    if (weatherError) {
      console.error('Weather API error:', weatherError);
    }
    if (weather) {
      console.log('Weather data received:', weather);
    }
    console.log('User location:', userLocation);
    console.log('Weather loading:', weatherLoading);
    console.log('Weather data:', weather);
  }, [weather, weatherError, userLocation, weatherLoading]);

  // Get location name from coordinates for fallback display
  const getLocationName = (lat: number, lng: number) => {
    // For now, we'll use a simple fallback
    // In production, this could use reverse geocoding
    const cities = [
      { name: "New York, NY", lat: 40.7128, lng: -74.0060 },
      { name: "Los Angeles, CA", lat: 34.0522, lng: -118.2437 },
      { name: "Chicago, IL", lat: 41.8781, lng: -87.6298 },
      { name: "Houston, TX", lat: 29.7604, lng: -95.3698 },
      { name: "Phoenix, AZ", lat: 33.4484, lng: -112.0740 },
      { name: "Philadelphia, PA", lat: 39.9526, lng: -75.1652 },
      { name: "San Antonio, TX", lat: 29.4241, lng: -98.4936 },
      { name: "San Diego, CA", lat: 32.7157, lng: -117.1611 },
      { name: "Dallas, TX", lat: 32.7767, lng: -96.7970 },
      { name: "San Jose, CA", lat: 37.3382, lng: -121.8863 },
    ];
    
    const closest = cities.reduce((prev, curr) => {
      const prevDistance = Math.sqrt(Math.pow(lat - prev.lat, 2) + Math.pow(lng - prev.lng, 2));
      const currDistance = Math.sqrt(Math.pow(lat - curr.lat, 2) + Math.pow(lng - curr.lng, 2));
      return currDistance < prevDistance ? curr : prev;
    });
    
    return closest.name;
  };

  useEffect(() => {
    // Initialize listeners
    console.log('Initializing listeners...');
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      console.log('Setting active listeners and clearing loading...');
      setActiveListeners(generateActiveListeners());
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Get user's current location with improved detection
  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser");
        setLocationPermissionDenied(true);
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 15000, // Increased timeout
              maximumAge: 60000, // Reduced cache time for more frequent updates
            });
          }
        );

        console.log("User location found:", position.coords);
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationPermissionDenied(false);
      } catch (error) {
        console.warn("Geolocation error:", error.message);
        setLocationPermissionDenied(true);
        setUserLocation(null);
      }
    };

    getUserLocation();
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
        isFullscreen ? "fixed inset-0 z-40" : ""
      } transition-all duration-500 ease-in-out`}
      style={{
        ...(isFullscreen && {
          paddingTop: "80px", // Keep header spacing
          paddingBottom: "120px", // Space for floating player
          height: "100vh", // Full viewport height
        }),
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className={`font-orbitron font-black text-3xl md:text-4xl mb-4 ${isDarkMode ? "text-white" : "text-black"}`}
          >
            GLOBAL LISTENERS
          </h2>
          
          {/* Weather Information - Debug */}
          {(() => {
            console.log('Weather Display Debug:', {
              weatherLoading,
              weather,
              userLocation,
              weatherError,
              hasWeather: !!weather,
              hasUserLocation: !!userLocation,
              shouldShowWeatherLoading: weatherLoading && userLocation,
              shouldShowWeather: !!weather,
              shouldShowLocationOnly: !weather && !weatherLoading && userLocation
            });
            return null;
          })()}
          
          {/* Weather Information - Only show if location is available */}
          {!locationPermissionDenied && (
            <>
              {weatherLoading && userLocation && (
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Loading weather...
                    </span>
                  </div>
                </div>
              )}
              
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
              
              {/* Show location only when weather API is not available */}
              {!weather && !weatherLoading && userLocation && (
                <div className="mb-4">
                  <p
                    className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {getLocationName(userLocation.lat, userLocation.lng)}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                    <span className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                      Weather service connecting...
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Location Permission Denied Message */}
          {locationPermissionDenied && (
            <div className="mb-4">
              <p
                className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
              >
                Enable location access to see weather and your position on the map
              </p>
            </div>
          )}
          
          <p
            className={`text-lg font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            See where metal fans are tuning in from around the world in real-time.
          </p>
        </div>

        {/* Fullscreen Overlay */}
        {isFullscreen && (
          <div className="fixed inset-0 z-[9999] bg-black animate-fadeIn">
            <div className="h-full flex flex-col">
              {/* Fullscreen Header */}
              <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700 p-4 flex justify-between items-center">
                <h3 className="font-black text-xl text-white">
                  Live Listener Map - Fullscreen
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Fullscreen Map Container */}
              <div className="flex-1 relative overflow-hidden">
                {!isLoading && apiKey && (
                  <GoogleMapWithListeners
                    listeners={activeListeners}
                    colors={colors}
                    isDarkMode={true}
                    themeName={currentTheme}
                    onListenerClick={setSelectedListener}
                    selectedListener={selectedListener}
                    apiKey={apiKey}
                    userLocation={userLocation || undefined}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card
              className={`${isDarkMode ? "bg-gray-900/50 hover:bg-gray-900/70" : "bg-gray-100/50 hover:bg-gray-100/70"} transition-all duration-300 border-2`}
              style={{ borderColor: colors.primary }}
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
                      onClick={toggleFullscreen}
                      className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div
                  className={`relative ${isDarkMode ? "bg-gray-800" : "bg-gray-200"} rounded-lg h-96 overflow-hidden transition-all duration-500 ease-in-out`}
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
                      {(() => {
                        console.log('Map render - isLoading:', isLoading);
                        console.log('Map render - config:', config);
                        console.log('Map render - googleMapsApiKey:', config?.googleMapsApiKey);
                        return null;
                      })()}
                      {apiKey ? (
                        <GoogleMapWithListeners
                          listeners={activeListeners}
                          colors={colors}
                          isDarkMode={isDarkMode}
                          themeName={currentTheme}
                          onListenerClick={setSelectedListener}
                          selectedListener={selectedListener}
                          apiKey={apiKey}
                          userLocation={userLocation || undefined}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Globe className={`${isDarkMode ? "text-gray-600" : "text-gray-400"} h-16 w-16 mx-auto mb-4 opacity-50`} />
                            <p className={`font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                              Interactive map coming soon
                            </p>
                            <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                              Google Maps API key missing
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
                        <span className="font-bold">
                          {isUserLocationSelected ? "This is you!" : "Active Listener"}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}
                      >
                        {isUserLocationSelected 
                          ? "Your current location" 
                          : `Last seen: ${selectedListener.lastSeen.toLocaleTimeString()}`
                        }
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
                style={{ borderColor: colors.primary }}
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

              {/* Only show Active Locations when location permission is not denied */}
              {!locationPermissionDenied && (
                <Card
                  className={`${isDarkMode ? "bg-gray-900/50 hover:bg-gray-900/70" : "bg-gray-100/50 hover:bg-gray-100/70"} transition-all duration-300 border-2`}
                  style={{ borderColor: colors.primary }}
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
                            onClick={() => {
                              setSelectedListener(listener);
                              setIsUserLocationSelected(false);
                            }}
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
                              <MapPin 
                                className="w-4 h-4"
                                style={{ color: colors.primary }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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