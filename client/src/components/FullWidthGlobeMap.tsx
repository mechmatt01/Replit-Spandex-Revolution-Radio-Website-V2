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
import cloudy1DayIcon from "@assets/animated_weather_icons/cloudy-day-1.svg";
import cloudy1NightIcon from "@assets/animated_weather_icons/cloudy-night-1.svg";
import cloudy2DayIcon from "@assets/animated_weather_icons/cloudy-day-2.svg";
import cloudy2NightIcon from "@assets/animated_weather_icons/cloudy-night-2.svg";
import cloudy3DayIcon from "@assets/animated_weather_icons/cloudy-day-3.svg";
import cloudy3NightIcon from "@assets/animated_weather_icons/cloudy-night-3.svg";
import cloudyIcon from "@assets/animated_weather_icons/cloudy.svg";
import fogIcon from "@assets/animated_weather_icons/fog.svg";
import hazeIcon from "@assets/animated_weather_icons/haze.svg";
import hurricaneIcon from "@assets/animated_weather_icons/hurricane.svg";
import isolatedThunderstormsIcon from "@assets/animated_weather_icons/isolated-thunderstorms.svg";
import rainAndSleetMixIcon from "@assets/animated_weather_icons/rain-and-sleet-mix.svg";
import rainAndSnowMixIcon from "@assets/animated_weather_icons/rain-and-snow-mix.svg";
import rainy1DayIcon from "@assets/animated_weather_icons/rainy-1-day.svg";
import rainy1NightIcon from "@assets/animated_weather_icons/rainy-1-night.svg";
import rainy1Icon from "@assets/animated_weather_icons/rainy-1.svg";
import rainy2Icon from "@assets/animated_weather_icons/rainy-2.svg";
import rainy3Icon from "@assets/animated_weather_icons/rainy-3.svg";
import scatteredThunderstormsIcon from "@assets/animated_weather_icons/scattered-thunderstorms.svg";
import severeThunderstormIcon from "@assets/animated_weather_icons/severe-thunderstorm.svg";
import snowAndSleetMixIcon from "@assets/animated_weather_icons/snow-and-sleet-mix.svg";
import snowy1Icon from "@assets/animated_weather_icons/snowy-1.svg";
import snowy2Icon from "@assets/animated_weather_icons/snowy-2.svg";
import snowy3Icon from "@assets/animated_weather_icons/snowy-3.svg";
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
  if (conditionLower.includes("clear") || conditionLower.includes("sunny")) {
    return isDay ? clearDayIcon : clearNightIcon;
  }

  // Cloudy conditions
  if (
    conditionLower.includes("partly cloudy") ||
    conditionLower.includes("few clouds")
  ) {
    return isDay ? cloudy1DayIcon : cloudy1NightIcon;
  }
  if (
    conditionLower.includes("scattered clouds") ||
    conditionLower.includes("broken clouds")
  ) {
    return isDay ? cloudy2DayIcon : cloudy2NightIcon;
  }
  if (
    conditionLower.includes("overcast") ||
    conditionLower.includes("cloudy")
  ) {
    return isDay ? cloudy3DayIcon : cloudy3NightIcon;
  }

  // Rain conditions
  if (
    conditionLower.includes("light rain") ||
    conditionLower.includes("drizzle")
  ) {
    return isDay ? rainy1DayIcon : rainy1NightIcon;
  }
  if (
    conditionLower.includes("moderate rain") ||
    conditionLower.includes("rain")
  ) {
    return rainy2Icon;
  }
  if (
    conditionLower.includes("heavy rain") ||
    conditionLower.includes("downpour")
  ) {
    return rainy3Icon;
  }

  // Snow conditions
  if (conditionLower.includes("light snow")) {
    return snowy1Icon;
  }
  if (
    conditionLower.includes("moderate snow") ||
    conditionLower.includes("snow")
  ) {
    return snowy2Icon;
  }
  if (
    conditionLower.includes("heavy snow") ||
    conditionLower.includes("blizzard")
  ) {
    return snowy3Icon;
  }

  // Thunderstorm conditions
  if (
    conditionLower.includes("thunderstorm") ||
    conditionLower.includes("thunder")
  ) {
    if (conditionLower.includes("severe")) return severeThunderstormIcon;
    if (conditionLower.includes("isolated")) return isolatedThunderstormsIcon;
    if (conditionLower.includes("scattered")) return scatteredThunderstormsIcon;
    return isolatedThunderstormsIcon;
  }

  // Fog conditions
  if (conditionLower.includes("fog") || conditionLower.includes("mist")) {
    return fogIcon;
  }

  // Haze conditions
  if (conditionLower.includes("haze")) {
    return hazeIcon;
  }

  // Dust conditions
  if (conditionLower.includes("dust") || conditionLower.includes("sand")) {
    return cloudyIcon;
  }

  // Wind conditions
  if (conditionLower.includes("wind")) {
    return windIcon;
  }

  // Extreme conditions
  if (conditionLower.includes("tornado")) return tornadoIcon;
  if (conditionLower.includes("hurricane")) return hurricaneIcon;
  if (conditionLower.includes("tropical storm")) return tropicalStormIcon;
  if (conditionLower.includes("hail")) return cloudyIcon;
  if (conditionLower.includes("frost")) return cloudyIcon;

  // Mixed conditions
  if (conditionLower.includes("rain") && conditionLower.includes("snow"))
    return rainAndSnowMixIcon;
  if (conditionLower.includes("rain") && conditionLower.includes("sleet"))
    return rainAndSleetMixIcon;
  if (conditionLower.includes("snow") && conditionLower.includes("sleet"))
    return snowAndSleetMixIcon;

  // Default fallback
  return isDay ? clearDayIcon : clearNightIcon;
};

export default function FullWidthGlobeMap() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const currentInfoWindow = useRef<any>(null);
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
            lng: -74.006,
          });
        },
      );
    } else {
      // Fallback to New York
      setUserLocation({
        lat: 40.7128,
        lng: -74.006,
      });
    }
  }, []);

  // Fetch weather data when user location is available
  const {
    data: weather,
    error: weatherError,
    isLoading: weatherLoading,
  } = useQuery<WeatherData>({
    queryKey: ["/api/weather", userLocation?.lat, userLocation?.lng],
    queryFn: async () => {
      if (!userLocation) throw new Error("No location available");
      const response = await fetch(
        `/api/weather?lat=${userLocation.lat}&lon=${userLocation.lng}`,
      );
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
        styles: isDarkMode
          ? [
              {
                elementType: "geometry",
                stylers: [{ color: "#212121" }],
              },
              {
                elementType: "labels.icon",
                stylers: [{ visibility: "off" }],
              },
              {
                elementType: "labels.text.fill",
                stylers: [{ color: "#757575" }],
              },
              {
                elementType: "labels.text.stroke",
                stylers: [{ color: "#212121" }],
              },
              {
                featureType: "administrative",
                elementType: "geometry",
                stylers: [{ color: "#757575" }],
              },
              {
                featureType: "administrative.country",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9e9e9e" }],
              },
              {
                featureType: "administrative.land_parcel",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#bdbdbd" }],
              },
              {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#757575" }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#181818" }],
              },
              {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#616161" }],
              },
              {
                featureType: "poi.park",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#1b1b1b" }],
              },
              {
                featureType: "road",
                elementType: "geometry.fill",
                stylers: [{ color: "#2c2c2c" }],
              },
              {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#8a8a8a" }],
              },
              {
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [{ color: "#373737" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#3c3c3c" }],
              },
              {
                featureType: "road.highway.controlled_access",
                elementType: "geometry",
                stylers: [{ color: "#4e4e4e" }],
              },
              {
                featureType: "road.local",
                elementType: "labels.text.fill",
                stylers: [{ color: "#616161" }],
              },
              {
                featureType: "transit",
                elementType: "labels.text.fill",
                stylers: [{ color: "#757575" }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#000000" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#3d3d3d" }],
              },
            ]
          : [],
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
        gestureHandling: "cooperative",
        disableDefaultUI: false,
        keyboardShortcuts: false,
        clickableIcons: false,
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

      setMap(mapInstance);

      // Add mock listener markers
      const mockListeners = [
        { lat: 40.7128, lng: -74.006, city: "New York", country: "USA" },
        { lat: 34.0522, lng: -118.2437, city: "Los Angeles", country: "USA" },
        { lat: 51.5074, lng: -0.1278, city: "London", country: "UK" },
        { lat: 48.8566, lng: 2.3522, city: "Paris", country: "France" },
        { lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan" },
        { lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia" },
        { lat: 55.7558, lng: 37.6173, city: "Moscow", country: "Russia" },
        { lat: 39.9042, lng: 116.4074, city: "Beijing", country: "China" },
        { lat: 19.076, lng: 72.8777, city: "Mumbai", country: "India" },
        { lat: -23.5505, lng: -46.6333, city: "São Paulo", country: "Brazil" },
      ];

      mockListeners.forEach((listener) => {
        // Create animated theme-colored dot SVG
        const animatedDotSvg = `
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="6" fill="${colors.primary}" opacity="0.8">
              <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="12" cy="12" r="4" fill="${colors.primary}">
              <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>
          </svg>
        `;

        const marker = new google.maps.Marker({
          position: { lat: listener.lat, lng: listener.lng },
          map: mapInstance,
          title: `${listener.city}, ${listener.country}`,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(animatedDotSvg)}`,
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12),
          },
        });

        // Create custom overlay instead of InfoWindow
        class CustomOverlay extends google.maps.OverlayView {
          private position: google.maps.LatLng;
          private content: string;
          private div?: HTMLDivElement;
          private listener: ListenerData;

          constructor(
            position: google.maps.LatLng,
            content: string,
            listener: ListenerData,
          ) {
            super();
            this.position = position;
            this.content = content;
            this.listener = listener;
          }

          onAdd() {
            const div = document.createElement("div");
            div.style.cssText = `
              position: absolute;
              background: #1f2937;
              color: #ffffff;
              border-radius: 12px;
              padding: 16px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.3);
              border: 2px solid #ff6b35;
              min-width: 200px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              z-index: 1000;
              pointer-events: auto;
              opacity: 0;
              transform: translateY(10px);
              transition: opacity 0.3s ease, transform 0.3s ease;
            `;

            div.innerHTML = `
              <button class="close-overlay" style="
                position: absolute;
                top: -2px;
                right: -2px;
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 20px;
                font-weight: bold;
                line-height: 1;
                padding: 0;
                border-radius: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
              ">×</button>
              <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                padding-right: 16px;
              ">
                <div style="
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background: #ff6b35;
                  animation: pulse 2s infinite;
                "></div>
                <h3 style="
                  margin: 0;
                  font-size: 16px;
                  font-weight: 700;
                  color: #ff6b35;
                ">${this.listener.city}, ${this.listener.country}</h3>
              </div>
              <p style="
                margin: 0;
                font-size: 14px;
                color: #e5e5e5;
                font-weight: 500;
              ">🎵 Currently listening to metal!</p>
              <div style="
                margin-top: 12px;
                padding: 8px;
                background: #374151;
                border-radius: 8px;
                font-size: 12px;
                color: #d1d5db;
              ">
                Live listener • Active now
              </div>
            `;

            this.div = div;

            // Add close button functionality
            const closeButton = div.querySelector(
              ".close-overlay",
            ) as HTMLButtonElement;
            closeButton.addEventListener("mouseenter", () => {
              closeButton.style.background = "transparent";
            });
            closeButton.addEventListener("mouseleave", () => {
              closeButton.style.background = "transparent";
            });
            closeButton.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              this.setMap(null);
              if (currentInfoWindow.current === this) {
                currentInfoWindow.current = null;
              }
            });

            // Add pulse animation style
            const pulseStyle = document.createElement("style");
            pulseStyle.innerHTML = `
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
              }
            `;
            document.head.appendChild(pulseStyle);

            // Add to map
            const panes = this.getPanes();
            if (panes) {
              panes.overlayMouseTarget.appendChild(div);
            }

            // Animate in
            setTimeout(() => {
              div.style.opacity = "1";
              div.style.transform = "translateY(0)";
            }, 10);
          }

          draw() {
            if (this.div) {
              const overlayProjection = this.getProjection();
              if (overlayProjection) {
                const position = overlayProjection.fromLatLngToDivPixel(
                  this.position,
                );
                if (position) {
                  this.div.style.left = position.x - 100 + "px";
                  this.div.style.top = position.y - 120 + "px";
                }
              }
            }
          }

          onRemove() {
            if (this.div && this.div.parentNode) {
              this.div.parentNode.removeChild(this.div);
              this.div = undefined;
            }
          }
        }

        marker.addListener("click", () => {
          // Close any existing overlay
          if (currentInfoWindow.current) {
            currentInfoWindow.current.setMap(null);
          }

          // Create and open new overlay
          const overlay = new CustomOverlay(
            new google.maps.LatLng(listener.lat, listener.lng),
            "",
            {
              ...listener,
              id: listener.id || `listener-${Date.now()}`,
              isActive: listener.isActive || true,
              lastSeen: listener.lastSeen || new Date(),
            },
          );
          overlay.setMap(mapInstance);
          currentInfoWindow.current = overlay;
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
    {
      id: "1",
      city: "New York",
      country: "USA",
      lat: 40.7128,
      lng: -74.006,
      isActive: true,
      lastSeen: new Date(),
    },
    {
      id: "2",
      city: "Los Angeles",
      country: "USA",
      lat: 34.0522,
      lng: -118.2437,
      isActive: true,
      lastSeen: new Date(),
    },
    {
      id: "3",
      city: "London",
      country: "UK",
      lat: 51.5074,
      lng: -0.1278,
      isActive: true,
      lastSeen: new Date(),
    },
    {
      id: "4",
      city: "Paris",
      country: "France",
      lat: 48.8566,
      lng: 2.3522,
      isActive: true,
      lastSeen: new Date(),
    },
    {
      id: "5",
      city: "Tokyo",
      country: "Japan",
      lat: 35.6762,
      lng: 139.6503,
      isActive: true,
      lastSeen: new Date(),
    },
    {
      id: "6",
      city: "Sydney",
      country: "Australia",
      lat: -33.8688,
      lng: 151.2093,
      isActive: true,
      lastSeen: new Date(),
    },
    {
      id: "7",
      city: "Moscow",
      country: "Russia",
      lat: 55.7558,
      lng: 37.6173,
      isActive: true,
      lastSeen: new Date(),
    },
    {
      id: "8",
      city: "Beijing",
      country: "China",
      lat: 39.9042,
      lng: 116.4074,
      isActive: true,
      lastSeen: new Date(),
    },
    {
      id: "9",
      city: "Mumbai",
      country: "India",
      lat: 19.076,
      lng: 72.8777,
      isActive: true,
      lastSeen: new Date(),
    },
    {
      id: "10",
      city: "São Paulo",
      country: "Brazil",
      lat: -23.5505,
      lng: -46.6333,
      isActive: true,
      lastSeen: new Date(),
    },
  ];

  const totalListeners = activeListeners.length;
  const countriesWithListeners = new Set(activeListeners.map((l) => l.country))
    .size;
  const top10Listeners = activeListeners.slice(0, 10);

  return (
    <section
      id="map"
      className={`${isDarkMode ? "bg-black" : "bg-white"} transition-all duration-500 ease-in-out ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
          : "py-20"
      }`}
    >
      <div
        className={`${isFullscreen ? "h-full p-[5px]" : "max-w-full mx-auto px-4 sm:px-6 lg:px-8"}`}
      >
        {/* Header for non-fullscreen */}
        {!isFullscreen && (
          <div className="text-center mb-16">
            <h2
              className={`font-orbitron font-black text-3xl md:text-4xl mb-4 ${isDarkMode ? "text-white" : "text-black"}`}
            >
              GLOBAL LISTENERS
            </h2>
            <p
              className={`text-lg font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-4`}
            >
              See where metal fans are tuning in from around the world in
              real-time.
            </p>

            {/* Weather Information Display */}
            {weather && (
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapPin
                    className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  />
                  <span
                    className={`text-lg font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {weather.location}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <img
                    src={getWeatherIcon(
                      weather.description,
                      weather.icon.includes("d"),
                    )}
                    alt={weather.description}
                    className="w-12 h-12 flex-shrink-0"
                    style={{ width: "48px", height: "48px" }}
                  />
                  <span
                    className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-black"}`}
                  >
                    {Math.round(weather.temperature)}°F
                  </span>
                  <span
                    className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {weather.description}
                  </span>
                </div>
              </div>
            )}

            {/* Loading state for weather */}
            {weatherLoading && (
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2">
                  <MapPin
                    className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  />
                  <span
                    className={`text-lg font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Loading weather...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fullscreen Header Above Map */}
        {isFullscreen && (
          <div className="text-center mb-6 pt-4">
            <h2
              className={`font-orbitron font-black text-3xl md:text-4xl mb-6 ${isDarkMode ? "text-white" : "text-black"}`}
            >
              GLOBAL LISTENERS
            </h2>

            {/* Weather Display Above Map in Fullscreen */}
            {weather && (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapPin
                    className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  />
                  <span
                    className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {weather.location}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <img
                    src={getWeatherIcon(
                      weather.description,
                      weather.icon.includes("d"),
                    )}
                    alt={weather.description}
                    className="flex-shrink-0"
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "contain",
                    }}
                  />
                  <span
                    className={`text-base font-bold ${isDarkMode ? "text-white" : "text-black"}`}
                  >
                    {Math.round(weather.temperature)}°F
                  </span>
                  <span
                    className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {weather.description}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map Container */}
        <div
          className={`relative ${isFullscreen ? "fixed inset-0 z-50" : "h-[600px]"} ${isFullscreen ? "mb-0" : "mb-16"}`}
        >
          <div
            ref={mapRef}
            className={`w-full ${isFullscreen ? "rounded-lg mx-8" : "rounded-lg"} map-container`}
            style={{
              minHeight: "400px",
              backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
              height: isFullscreen ? "calc(100vh - 10px)" : "100%",
              marginTop: isFullscreen ? "10px" : "0",
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
                color: isDarkMode ? "#ffffff" : "#000000",
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
                color: isDarkMode ? "#ffffff" : "#000000",
              }}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => {
                if (window.google && mapRef.current) {
                  const map = mapRef.current.firstChild as any;
                  if (map && map.panTo) {
                    map.panTo({ lat: 40.7128, lng: -74.006 });
                    map.setZoom(2);
                  }
                }
              }}
              size="sm"
              className={`p-2 ${isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-50 text-black"} border-0 shadow-lg`}
              style={{
                backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                color: isDarkMode ? "#ffffff" : "#000000",
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Fullscreen Toggle */}
          <Button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`absolute top-4 left-4 z-10 p-2 border-0 shadow-lg ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-white hover:bg-gray-50 text-black"
            }`}
            style={{
              backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
              color: isDarkMode ? "#ffffff" : "#000000",
            }}
            size="sm"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Statistics Layout - Hide in fullscreen mode */}
        {!isFullscreen && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Statistics - Left Side with Vertical Layout */}
            <Card
              className={`${isDarkMode ? "bg-gray-900/50 hover:bg-gray-900/70" : "bg-gray-100/50 hover:bg-gray-100/70"} transition-all duration-300 border-2`}
              style={{ borderColor: `${colors.primary}40` }}
            >
              <CardContent className="p-6 h-full flex flex-col">
                <h3
                  className="font-black text-xl mb-6 text-center"
                  style={{ color: colors.primary }}
                >
                  Live Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4 flex-1 items-center">
                  {/* Active Listeners */}
                  <div className="flex flex-col items-center text-center space-y-2 transform scale-115">
                    <span
                      className="font-black text-2xl"
                      style={{ color: colors.primary }}
                    >
                      {totalListeners}
                    </span>
                    <TrendingUp
                      className="h-7 w-7"
                      style={{ color: colors.primary }}
                    />
                    <span
                      className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      Active Listeners
                    </span>
                  </div>

                  {/* Countries */}
                  <div className="flex flex-col items-center text-center space-y-2 transform scale-115">
                    <span
                      className="font-black text-2xl"
                      style={{ color: colors.primary }}
                    >
                      {countriesWithListeners}
                    </span>
                    <img
                      src={CountriesIconPath}
                      alt="Countries"
                      className="h-7 w-7"
                      style={{
                        filter: `brightness(0) saturate(100%) invert(44%) sepia(78%) saturate(2392%) hue-rotate(8deg) brightness(101%) contrast(101%)`,
                      }}
                    />
                    <span
                      className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      Countries
                    </span>
                  </div>

                  {/* Total Listeners */}
                  <div className="flex flex-col items-center text-center space-y-2 transform scale-115">
                    <span
                      className="font-black text-2xl"
                      style={{ color: colors.primary }}
                    >
                      {stats?.currentListeners || 42}
                    </span>
                    <img
                      src={LiveNowIconPath}
                      alt="Total Listeners"
                      className="h-7 w-7"
                      style={{
                        filter: `brightness(0) saturate(100%) invert(44%) sepia(78%) saturate(2392%) hue-rotate(8deg) brightness(101%) contrast(101%)`,
                      }}
                    />
                    <span
                      className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      Total Listeners
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Locations - Combined Single Box */}
            <div className="lg:col-span-2">
              <Card
                className={`${isDarkMode ? "bg-gray-900/50 hover:bg-gray-900/70" : "bg-gray-100/50 hover:bg-gray-100/70"} transition-all duration-300 border-2 h-full`}
                style={{ borderColor: `${colors.primary}40` }}
              >
                <CardContent className="p-6 h-full flex flex-col">
                  <h3
                    className="font-black text-xl mb-6 text-center"
                    style={{ color: colors.primary }}
                  >
                    Active Locations
                  </h3>
                  <div className="grid grid-cols-2 gap-5 flex-1 items-center">
                    {/* First Column (1-5) */}
                    <div className="space-y-3 transform scale-115">
                      {top10Listeners
                        .filter((l) => l.isActive)
                        .slice(0, 5)
                        .map((listener, index) => (
                          <div
                            key={listener.id}
                            className="flex items-center p-3 rounded transition-colors duration-200 hover:bg-opacity-10"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <span
                                className="font-black text-base w-7 text-center"
                                style={{ color: colors.primary }}
                              >
                                #{index + 1}
                              </span>
                              <MapPin
                                className="h-6 w-6"
                                style={{ color: colors.primary }}
                              />
                              <div className="flex-1">
                                <div
                                  className={`font-semibold text-base ${isDarkMode ? "text-white" : "text-black"}`}
                                >
                                  {listener.city}
                                </div>
                                <div
                                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                                >
                                  {listener.country}
                                </div>
                              </div>
                            </div>
                            <MapPin
                              className="w-4 h-4 ml-2"
                              style={{ color: colors.primary }}
                            />
                          </div>
                        ))}
                    </div>

                    {/* Second Column (6-10) */}
                    <div className="space-y-3 transform scale-115">
                      {top10Listeners
                        .filter((l) => l.isActive)
                        .slice(5, 10)
                        .map((listener, index) => (
                          <div
                            key={listener.id}
                            className="flex items-center p-3 rounded transition-colors duration-200 hover:bg-opacity-10"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <span
                                className="font-black text-base w-7 text-center"
                                style={{ color: colors.primary }}
                              >
                                #{index + 6}
                              </span>
                              <MapPin
                                className="h-6 w-6"
                                style={{ color: colors.primary }}
                              />
                              <div className="flex-1">
                                <div
                                  className={`font-semibold text-base ${isDarkMode ? "text-white" : "text-black"}`}
                                >
                                  {listener.city}
                                </div>
                                <div
                                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                                >
                                  {listener.country}
                                </div>
                              </div>
                            </div>
                            <MapPin
                              className="w-4 h-4 ml-2"
                              style={{ color: colors.primary }}
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
