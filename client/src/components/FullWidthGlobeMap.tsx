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

// Animated weather icons
import clearDayIcon from "@assets/animated_weather_icons/clear-day.svg";
import clearNightIcon from "@assets/animated_weather_icons/clear-night.svg";
import cloudy1DayIcon from "@assets/animated_weather_icons/cloudy-1-day.svg";
import cloudy1NightIcon from "@assets/animated_weather_icons/cloudy-1-night.svg";
import cloudy2DayIcon from "@assets/animated_weather_icons/cloudy-2-day.svg";
import cloudy2NightIcon from "@assets/animated_weather_icons/cloudy-2-night.svg";
import cloudy3DayIcon from "@assets/animated_weather_icons/cloudy-3-day.svg";
import cloudy3NightIcon from "@assets/animated_weather_icons/cloudy-3-night.svg";
import cloudyIcon from "@assets/animated_weather_icons/cloudy.svg";
import dustIcon from "@assets/animated_weather_icons/dust.svg";
import fogDayIcon from "@assets/animated_weather_icons/fog-day.svg";
import fogNightIcon from "@assets/animated_weather_icons/fog-night.svg";
import fogIcon from "@assets/animated_weather_icons/fog.svg";
import frostDayIcon from "@assets/animated_weather_icons/frost-day.svg";
import frostNightIcon from "@assets/animated_weather_icons/frost-night.svg";
import frostIcon from "@assets/animated_weather_icons/frost.svg";
import hailIcon from "@assets/animated_weather_icons/hail.svg";
import hazeDayIcon from "@assets/animated_weather_icons/haze-day.svg";
import hazeNightIcon from "@assets/animated_weather_icons/haze-night.svg";
import hazeIcon from "@assets/animated_weather_icons/haze.svg";
import hurricaneIcon from "@assets/animated_weather_icons/hurricane.svg";
import isolatedThunderstormsDayIcon from "@assets/animated_weather_icons/isolated-thunderstorms-day.svg";
import isolatedThunderstormsNightIcon from "@assets/animated_weather_icons/isolated-thunderstorms-night.svg";
import isolatedThunderstormsIcon from "@assets/animated_weather_icons/isolated-thunderstorms.svg";
import rainAndSleetMixIcon from "@assets/animated_weather_icons/rain-and-sleet-mix.svg";
import rainAndSnowMixIcon from "@assets/animated_weather_icons/rain-and-snow-mix.svg";
import rainy1DayIcon from "@assets/animated_weather_icons/rainy-1-day.svg";
import rainy1NightIcon from "@assets/animated_weather_icons/rainy-1-night.svg";
import rainy1Icon from "@assets/animated_weather_icons/rainy-1.svg";
import rainy2DayIcon from "@assets/animated_weather_icons/rainy-2-day.svg";
import rainy2NightIcon from "@assets/animated_weather_icons/rainy-2-night.svg";
import rainy2Icon from "@assets/animated_weather_icons/rainy-2.svg";
import rainy3DayIcon from "@assets/animated_weather_icons/rainy-3-day.svg";
import rainy3NightIcon from "@assets/animated_weather_icons/rainy-3-night.svg";
import rainy3Icon from "@assets/animated_weather_icons/rainy-3.svg";
import scatteredThunderstormsDayIcon from "@assets/animated_weather_icons/scattered-thunderstorms-day.svg";
import scatteredThunderstormsNightIcon from "@assets/animated_weather_icons/scattered-thunderstorms-night.svg";
import scatteredThunderstormsIcon from "@assets/animated_weather_icons/scattered-thunderstorms.svg";
import severeThunderstormIcon from "@assets/animated_weather_icons/severe-thunderstorm.svg";
import snowAndSleetMixIcon from "@assets/animated_weather_icons/snow-and-sleet-mix.svg";
import snowy1DayIcon from "@assets/animated_weather_icons/snowy-1-day.svg";
import snowy1NightIcon from "@assets/animated_weather_icons/snowy-1-night.svg";
import snowy1Icon from "@assets/animated_weather_icons/snowy-1.svg";
import snowy2DayIcon from "@assets/animated_weather_icons/snowy-2-day.svg";
import snowy2NightIcon from "@assets/animated_weather_icons/snowy-2-night.svg";
import snowy2Icon from "@assets/animated_weather_icons/snowy-2.svg";
import snowy3DayIcon from "@assets/animated_weather_icons/snowy-3-day.svg";
import snowy3NightIcon from "@assets/animated_weather_icons/snowy-3-night.svg";
import snowy3Icon from "@assets/animated_weather_icons/snowy-3.svg";
import thunderstormsIcon from "@assets/animated_weather_icons/thunderstorms.svg";
import tornadoIcon from "@assets/animated_weather_icons/tornado.svg";
import tropicalStormIcon from "@assets/animated_weather_icons/tropical-storm.svg";
import windIcon from "@assets/animated_weather_icons/wind.svg";

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

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

// Weather condition mapping to animated icons
const getWeatherIcon = (condition: string, isDay: boolean) => {
  const conditionLower = condition.toLowerCase();
  
  // Clear conditions
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return isDay ? clearDayIcon : clearNightIcon;
  }
  
  // Cloudy conditions
  if (conditionLower.includes('partly cloudy') || conditionLower.includes('few clouds')) {
    return isDay ? cloudy1DayIcon : cloudy1NightIcon;
  }
  if (conditionLower.includes('scattered clouds') || conditionLower.includes('broken clouds')) {
    return isDay ? cloudy2DayIcon : cloudy2NightIcon;
  }
  if (conditionLower.includes('overcast') || conditionLower.includes('cloudy')) {
    return isDay ? cloudy3DayIcon : cloudy3NightIcon;
  }
  
  // Rain conditions
  if (conditionLower.includes('light rain') || conditionLower.includes('drizzle')) {
    return isDay ? rainy1DayIcon : rainy1NightIcon;
  }
  if (conditionLower.includes('moderate rain') || conditionLower.includes('rain')) {
    return isDay ? rainy2DayIcon : rainy2NightIcon;
  }
  if (conditionLower.includes('heavy rain') || conditionLower.includes('downpour')) {
    return isDay ? rainy3DayIcon : rainy3NightIcon;
  }
  
  // Snow conditions
  if (conditionLower.includes('light snow')) {
    return isDay ? snowy1DayIcon : snowy1NightIcon;
  }
  if (conditionLower.includes('moderate snow') || conditionLower.includes('snow')) {
    return isDay ? snowy2DayIcon : snowy2NightIcon;
  }
  if (conditionLower.includes('heavy snow') || conditionLower.includes('blizzard')) {
    return isDay ? snowy3DayIcon : snowy3NightIcon;
  }
  
  // Thunderstorm conditions
  if (conditionLower.includes('thunderstorm') || conditionLower.includes('thunder')) {
    if (conditionLower.includes('severe')) return severeThunderstormIcon;
    if (conditionLower.includes('isolated')) return isDay ? isolatedThunderstormsDayIcon : isolatedThunderstormsNightIcon;
    if (conditionLower.includes('scattered')) return isDay ? scatteredThunderstormsDayIcon : scatteredThunderstormsNightIcon;
    return thunderstormsIcon;
  }
  
  // Fog conditions
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return isDay ? fogDayIcon : fogNightIcon;
  }
  
  // Haze conditions
  if (conditionLower.includes('haze')) {
    return isDay ? hazeDayIcon : hazeNightIcon;
  }
  
  // Dust conditions
  if (conditionLower.includes('dust') || conditionLower.includes('sand')) {
    return dustIcon;
  }
  
  // Wind conditions
  if (conditionLower.includes('wind')) {
    return windIcon;
  }
  
  // Extreme conditions
  if (conditionLower.includes('tornado')) return tornadoIcon;
  if (conditionLower.includes('hurricane')) return hurricaneIcon;
  if (conditionLower.includes('tropical storm')) return tropicalStormIcon;
  if (conditionLower.includes('hail')) return hailIcon;
  if (conditionLower.includes('frost')) return isDay ? frostDayIcon : frostNightIcon;
  
  // Mixed conditions
  if (conditionLower.includes('rain') && conditionLower.includes('snow')) return rainAndSnowMixIcon;
  if (conditionLower.includes('rain') && conditionLower.includes('sleet')) return rainAndSleetMixIcon;
  if (conditionLower.includes('snow') && conditionLower.includes('sleet')) return snowAndSleetMixIcon;
  
  // Default fallback
  return isDay ? clearDayIcon : clearNightIcon;
};

export default function FullWidthGlobeMap() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const { colors, isDarkMode } = useTheme();

  const { data: stats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
  });

  // Fetch Google Maps API key and config
  const { data: config } = useQuery<{ 
    googleMapsApiKey: string; 
    googleMapsSigningSecret: string;
    openWeatherApiKey: string; 
  }>({
    queryKey: ["/api/config"],
    staleTime: Infinity,
  });

  // Get user's location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to New York
          setUserLocation({
            lat: 40.7128,
            lng: -74.0060,
          });
        }
      );
    } else {
      // Fallback to New York
      setUserLocation({
        lat: 40.7128,
        lng: -74.0060,
      });
    }
  }, []);

  // Fetch weather data when user location is available
  const { data: weather, error: weatherError, isLoading: weatherLoading } = useQuery<WeatherData>({
    queryKey: ["/api/weather", userLocation?.lat, userLocation?.lng],
    queryFn: async () => {
      if (!userLocation) throw new Error("No location available");
      const response = await fetch(`/api/weather?lat=${userLocation.lat}&lon=${userLocation.lng}`);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!userLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });

  // Initialize Google Maps when API key is available
  useEffect(() => {
    if (!config?.googleMapsApiKey || !mapRef.current || !userLocation) return;

    // Add CSS to hide Google attribution
    const style = document.createElement("style");
    style.textContent = `
      .gm-style-cc,
      .gmnoprint,
      .gm-style-mtc,
      a[href*="maps.google.com"],
      a[href*="google.com/maps"],
      .gm-svpc,
      .gm-fullscreen-control {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    const initializeMap = () => {
      const mapInstance = new google.maps.Map(mapRef.current!, {
        zoom: 2,
        center: userLocation,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: isDarkMode ? [
          {
            "elementType": "geometry",
            "stylers": [{"color": "#212121"}]
          },
          {
            "elementType": "labels.icon",
            "stylers": [{"visibility": "off"}]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#757575"}]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#212121"}]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [{"color": "#757575"}]
          },
          {
            "featureType": "administrative.country",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#9e9e9e"}]
          },
          {
            "featureType": "administrative.land_parcel",
            "stylers": [{"visibility": "off"}]
          },
          {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#bdbdbd"}]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#757575"}]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{"color": "#181818"}]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#616161"}]
          },
          {
            "featureType": "poi.park",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#1b1b1b"}]
          },
          {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#2c2c2c"}]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#8a8a8a"}]
          },
          {
            "featureType": "road.arterial",
            "elementType": "geometry",
            "stylers": [{"color": "#373737"}]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{"color": "#3c3c3c"}]
          },
          {
            "featureType": "road.highway.controlled_access",
            "elementType": "geometry",
            "stylers": [{"color": "#4e4e4e"}]
          },
          {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#616161"}]
          },
          {
            "featureType": "transit",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#757575"}]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{"color": "#000000"}]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#3d3d3d"}]
          }
        ] : [],
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
        gestureHandling: "cooperative",
        disableDefaultUI: false,
        keyboardShortcuts: false,
        clickableIcons: false,
      });

      setMap(mapInstance);

      // Add mock listener markers
      const mockListeners = [
        { lat: 40.7128, lng: -74.0060, city: "New York", country: "USA" },
        { lat: 34.0522, lng: -118.2437, city: "Los Angeles", country: "USA" },
        { lat: 51.5074, lng: -0.1278, city: "London", country: "UK" },
        { lat: 48.8566, lng: 2.3522, city: "Paris", country: "France" },
        { lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan" },
        { lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia" },
        { lat: 55.7558, lng: 37.6173, city: "Moscow", country: "Russia" },
        { lat: 39.9042, lng: 116.4074, city: "Beijing", country: "China" },
        { lat: 19.0760, lng: 72.8777, city: "Mumbai", country: "India" },
        { lat: -23.5505, lng: -46.6333, city: "São Paulo", country: "Brazil" },
      ];

      mockListeners.forEach((listener) => {
        const marker = new google.maps.Marker({
          position: { lat: listener.lat, lng: listener.lng },
          map: mapInstance,
          title: `${listener.city}, ${listener.country}`,
          icon: {
            url: LiveNowIconPath,
            scaledSize: new google.maps.Size(20, 20),
          },
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: black; font-weight: bold;">
              <h3>${listener.city}, ${listener.country}</h3>
              <p>🎵 Currently listening to metal!</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstance, marker);
        });
      });
    };

    // Load Google Maps API if not already loaded
    if (typeof google === "undefined" || !google.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=geometry`;
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [config, userLocation, isDarkMode]);

  // Generate mock listener data
  const activeListeners: ListenerData[] = [
    { id: "1", city: "New York", country: "USA", lat: 40.7128, lng: -74.0060, isActive: true, lastSeen: new Date() },
    { id: "2", city: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437, isActive: true, lastSeen: new Date() },
    { id: "3", city: "London", country: "UK", lat: 51.5074, lng: -0.1278, isActive: true, lastSeen: new Date() },
    { id: "4", city: "Paris", country: "France", lat: 48.8566, lng: 2.3522, isActive: true, lastSeen: new Date() },
    { id: "5", city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, isActive: true, lastSeen: new Date() },
    { id: "6", city: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, isActive: true, lastSeen: new Date() },
    { id: "7", city: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173, isActive: true, lastSeen: new Date() },
    { id: "8", city: "Beijing", country: "China", lat: 39.9042, lng: 116.4074, isActive: true, lastSeen: new Date() },
    { id: "9", city: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777, isActive: true, lastSeen: new Date() },
    { id: "10", city: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333, isActive: true, lastSeen: new Date() },
  ];

  const totalListeners = activeListeners.length;
  const countriesWithListeners = new Set(activeListeners.map((l) => l.country)).size;
  const top10Listeners = activeListeners.slice(0, 10);

  return (
    <section
      id="map"
      className={`${isDarkMode ? "bg-black" : "bg-white"} transition-all duration-500 ease-in-out ${
        isFullscreen ? "fixed inset-0 z-50 bg-black/80 backdrop-blur-md" : "py-20"
      }`}
    >
      <div className={`${isFullscreen ? "h-full p-[5px]" : "max-w-full mx-auto px-4 sm:px-6 lg:px-8"}`}>
        {/* Header */}
        <div className={`text-center ${isFullscreen ? "mb-4 pt-[10px]" : "mb-16"}`}>
          <h2
            className={`font-orbitron font-black text-3xl md:text-4xl mb-4 ${isDarkMode ? "text-white" : "text-black"}`}
          >
            LIVE INTERACTIVE MAP
          </h2>
          
          {!isFullscreen && (
            <>
              <p
                className={`text-lg font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-4`}
              >
                See where metal fans are tuning in from around the world in
                real-time.
              </p>
              
              {/* Weather Information Display */}
              {weather && (
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-1">
                    <MapPin className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                    <span className={`text-lg font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {weather.location}
                    </span>
                    <span className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-black"} mx-1`}>
                      {Math.round(weather.temperature)}°F
                    </span>
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {weather.description}
                    </span>
                    <img
                      src={getWeatherIcon(weather.description, weather.icon.includes('d'))}
                      alt={weather.description}
                      className="w-10 h-10 ml-1"
                    />
                  </div>
                </div>
              )}
              
              {/* Loading state for weather */}
              {weatherLoading && (
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                    <span className={`text-lg font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Loading weather...
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Map Container */}
        <div className={`relative ${isFullscreen ? "h-[calc(100vh-80px)]" : "h-[600px]"} ${isFullscreen ? "mb-0" : "mb-16"}`}>
          <div
            ref={mapRef}
            className={`w-full h-full ${isFullscreen ? "rounded-lg" : "rounded-lg"} map-container`}
            style={{ 
              minHeight: "400px",
              backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
            }}
          />
          
          {/* Custom Map Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <Button
              onClick={() => {
                if (window.google && mapRef.current) {
                  const map = mapRef.current.firstChild as any;
                  if (map && map.getZoom) {
                    map.setZoom(map.getZoom() + 1);
                  }
                }
              }}
              size="sm"
              className={`p-2 ${isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-50 text-black"} border-0 shadow-lg`}
              style={{ 
                backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#000000"
              }}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => {
                if (window.google && mapRef.current) {
                  const map = mapRef.current.firstChild as any;
                  if (map && map.getZoom) {
                    map.setZoom(map.getZoom() - 1);
                  }
                }
              }}
              size="sm"
              className={`p-2 ${isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-50 text-black"} border-0 shadow-lg`}
              style={{ 
                backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#000000"
              }}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => {
                if (window.google && mapRef.current) {
                  const map = mapRef.current.firstChild as any;
                  if (map && map.panTo) {
                    map.panTo({ lat: 40.7128, lng: -74.0060 });
                    map.setZoom(2);
                  }
                }
              }}
              size="sm"
              className={`p-2 ${isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-50 text-black"} border-0 shadow-lg`}
              style={{ 
                backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#000000"
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Fullscreen Toggle */}
          <Button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`absolute top-4 left-4 z-10 p-2 border-0 shadow-lg ${
              isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-50 text-black"
            }`}
            style={{ 
              backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
              color: isDarkMode ? "#ffffff" : "#000000"
            }}
            size="sm"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Statistics Cards - Original 3-Column Layout */}
        {!isFullscreen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Live Statistics */}
            <Card className={`${isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-white/50 border-gray-200"} backdrop-blur-md`}>
              <CardHeader className="pb-3">
                <CardTitle className={`font-orbitron font-black text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                  Live Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={LiveNowIconPath} alt="Live" className="w-5 h-5" />
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Active Listeners
                    </span>
                  </div>
                  <span className={`font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                    {totalListeners}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={CountriesIconPath} alt="Countries" className="w-5 h-5" />
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Countries
                    </span>
                  </div>
                  <span className={`font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                    {countriesWithListeners}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Active Locations */}
            <Card className={`${isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-white/50 border-gray-200"} backdrop-blur-md`}>
              <CardHeader className="pb-3">
                <CardTitle className={`font-orbitron font-black text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                  Active Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {top10Listeners.map((listener) => (
                    <div key={listener.id} className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {listener.city}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                          Live
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card className={`${isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-white/50 border-gray-200"} backdrop-blur-md`}>
              <CardHeader className="pb-3">
                <CardTitle className={`font-orbitron font-black text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                  Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Peak Hours
                    </span>
                  </div>
                  <span className={`font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                    8-10 PM
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Avg. Session
                    </span>
                  </div>
                  <span className={`font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                    2.5 hrs
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}