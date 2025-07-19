
/// <reference types="@types/google.maps" />
declare global {
  interface Window {
    google: typeof google;
  }
}

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
  Users,
} from "lucide-react";
import CountriesIconPath from "@assets/CountriesIcon.png";
import LiveNowIconPath from "@assets/LiveNowIcon.png";
import { useTheme, METAL_THEMES } from "@/contexts/ThemeContext";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import type { StreamStats } from "@shared/schema";
import AnimatedCounter from "./AnimatedCounter";

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

// Helper function to convert hex color to CSS filter for images
const getIconFilter = (hexColor: string) => {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // For orange/red colors
  if (r > 200 && g < 150) {
    return 'brightness(0) saturate(100%) invert(44%) sepia(78%) saturate(2392%) hue-rotate(8deg) brightness(101%) contrast(101%)';
  }
  
  // For other colors, create a custom filter
  const hue = Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180 / Math.PI;
  return `brightness(0) saturate(100%) invert(50%) sepia(100%) saturate(2000%) hue-rotate(${hue}deg) brightness(100%) contrast(101%)`;
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
  const { colors, isDarkMode, currentTheme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Intelligent theme detection for Google Maps
  const shouldUseDarkMap = () => {
    // Use light map only when in light mode (light theme)
    if (!isDarkMode) {
      console.log('Light mode detected - using light map');
      return false;
    }
    
    // All dark themes should use dark map
    console.log(`Dark mode detected (${currentTheme}) - using dark map`);
    return true;
  };
  
  const isMapDark = shouldUseDarkMap();

  // Function to update map styling when theme changes
  const updateMapStyles = (mapInstance: google.maps.Map) => {
    // Check current theme for map styling
    const shouldUseDark = shouldUseDarkMap();
    console.log('Updating map styles - Dark mode:', shouldUseDark, 'Theme:', currentTheme);
    
    // Use dark styles based on theme detection
    const darkStyles = [
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
    ];

    const lightStyles = [
      {
        featureType: "administrative",
        elementType: "geometry",
        stylers: [{ color: "#e0e0e0" }],
      },
      {
        featureType: "administrative.country",
        elementType: "labels.text.fill",
        stylers: [{ color: "#666666" }],
      },
      {
        featureType: "administrative.land_parcel",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#333333" }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#757575" }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#c5f0c5" }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9e9e9e" }],
      },
      {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [{ color: "#ffffff" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#666666" }],
      },
      {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [{ color: "#fefefe" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#f5f5f5" }],
      },
      {
        featureType: "road.highway.controlled_access",
        elementType: "geometry",
        stylers: [{ color: "#e9e9e9" }],
      },
      {
        featureType: "road.local",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9e9e9e" }],
      },
      {
        featureType: "transit",
        elementType: "labels.text.fill",
        stylers: [{ color: "#757575" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#c9c9c9" }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9e9e9e" }],
      },
    ];

    mapInstance.setOptions({
      styles: shouldUseDark ? darkStyles : lightStyles
    });
  };

  const { data: stats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
  });

  // Firebase Live Statistics with 5-second refresh
  const { data: liveStats } = useQuery<{
    activeListeners: number;
    countries: number;
    totalListeners: number;
  }>({
    queryKey: ["/api/live-stats"],
    refetchInterval: 5000, // Update every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Handle fullscreen toggle with proper map resizing - FIXED VERSION
  const toggleFullscreen = (enable: boolean) => {
    setIsFullscreen(enable);
    
    // Trigger map resize after state change without affecting body position
    setTimeout(() => {
      if (map) {
        google.maps.event.trigger(map, 'resize');
      }
    }, 50);
  };

  // Fetch Google Maps API key and config
  const { data: config, error: configError, isLoading: configLoading } = useQuery<{
    googleMapsApiKey: string;
    googleMapsSigningSecret: string;
    openWeatherApiKey: string;
    googleMapsMapId: string;
  }>({
    queryKey: ["/api/config"],
    staleTime: 0, // Don't cache config data
    gcTime: 0, // Don't cache config data (TanStack Query v5 uses gcTime)
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: 'always', // Always refetch on mount
  });

  // Debug config loading
  useEffect(() => {
    console.log('Config loading status:', { configLoading, config, configError });
  }, [configLoading, config, configError]);

  // Get user's location
  useEffect(() => {
    const getLocation = async () => {
      if ("geolocation" in navigator) {
        try {
          // Request permission first
          const permission = await navigator.permissions.query({name: 'geolocation'});
          console.log('Geolocation permission:', permission.state);
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Got location:', position.coords.latitude, position.coords.longitude);
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.error("Error getting location:", error);
              console.log("Error code:", error.code, "Message:", error.message);
              // Fallback to New York
              setUserLocation({
                lat: 40.7128,
                lng: -74.006,
              });
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 300000 // 5 minutes (reduced from 10 minutes)
            }
          );
        } catch (error) {
          console.error("Permission error:", error);
          // Fallback to New York
          setUserLocation({
            lat: 40.7128,
            lng: -74.006,
          });
        }
      } else {
        console.log("Geolocation not supported");
        // Fallback to New York
        setUserLocation({
          lat: 40.7128,
          lng: -74.006,
        });
      }
    };
    
    getLocation();
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
    console.log('=== FullWidthGlobeMap Debug ===');
    console.log('Config available:', !!config);
    console.log('API key available:', !!config?.googleMapsApiKey);
    console.log('API key value:', config?.googleMapsApiKey?.substring(0, 15) + '...');
    console.log('Map ref current:', !!mapRef.current);
    console.log('User location available:', !!userLocation);
    console.log('User location value:', userLocation);
    console.log('Is fullscreen:', isFullscreen);
    
    // Use hardcoded API key if config is not available
    const apiKey = config?.googleMapsApiKey || "AIzaSyBfRJS8dGDJqA4X5sZ6ASq267WV--C7cYw";
    const mapId = config?.googleMapsMapId || "DEMO_MAP_ID";
    
    if (!apiKey) {
      console.log('No API key available');
      return;
    }
    
    console.log('Initializing Google Maps with API key:', apiKey.substring(0, 20) + '...');
    console.log('Using Map ID:', mapId);
    console.log('Theme detection:', {
      currentTheme: currentTheme,
      isDarkMode,
      backgroundColor: METAL_THEMES[currentTheme].colors[isDarkMode ? 'dark' : 'light'].background,
      isMapDark,
      shouldUseDarkStyles: currentTheme === 'classic-metal' || isMapDark
    });
    
    // Don't reinitialize if map already exists
    if (map) return;
    
    // Always use the same map container
    const currentContainer = mapRef.current;
    if (!currentContainer) return;

    // Add CSS to hide Google attribution and keyboard shortcuts overlay
    const style = document.createElement("style");
    style.textContent = `
      .gm-style-cc,
      .gmnoprint,
      .gm-style-mtc,
      a[href*="maps.google.com"],
      a[href*="google.com/maps"],
      .gm-svpc,
      .gm-fullscreen-control,
      .gm-ui-hover-effect,
      .gm-control-active,
      .gm-style-iw,
      .gm-style-iw-c,
      .gm-style-iw-d,
      .gm-style-iw-chr,
      .gm-compass,
      .gm-zoom-control,
      .gm-rotate-control,
      .gm-scale-control,
      .gm-style-pbc,
      .gm-keyboard-shortcuts,
      .gm-style-cc:not(.gm-style-cc-hide),
      div[data-control-width],
      div[data-control-height],
      button[data-value="keyboard_shortcuts"],
      button[title*="Keyboard shortcuts"],
      button[jsaction*="keyboard"],
      [jsaction*="keyboard.open"],
      [data-value="keyboard_shortcuts"],
      .gm-style .gm-style-cc > div,
      .gm-style .gm-style-cc a,
      .gm-style .gm-style-cc span,
      .gm-bundled-control,
      .gm-bundled-control-on-bottom {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `;
    document.head.appendChild(style);

    const initializeMap = () => {
      try {
        // Check if Google Maps API is fully loaded
        if (!window.google || !window.google.maps || !window.google.maps.Map || !window.google.maps.MapTypeId) {
          console.error('Google Maps API not fully loaded');
          return;
        }
        
        // Use regular markers if advanced markers aren't available
        const useAdvancedMarkers = window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement;
        
        const mapInstance = new google.maps.Map(currentContainer, {
        zoom: 2,
        center: userLocation || { lat: 40.7128, lng: -74.0060 }, // Default to NYC
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        // Don't use mapId when we want custom styling
        styles: [], // Empty styles initially, will be set by updateMapStyles
        // Map controls
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        gestureHandling: "cooperative",
        // Disable default UI
        disableDefaultUI: true,
      });

      setMap(mapInstance);

      // Apply theme styles immediately after map creation
      updateMapStyles(mapInstance);

      // Function to add listener markers
      const addListenerMarkers = (mapInstance: google.maps.Map) => {
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

        // Filter out mock listeners that are too close to user's current location
        const filteredListeners = mockListeners.filter((listener) => {
          if (!userLocation?.lat || !userLocation?.lng) return true;
          const distance = Math.sqrt(
            Math.pow(listener.lat - userLocation.lat, 2) +
            Math.pow(listener.lng - userLocation.lng, 2)
          );
          // If distance is less than 0.1 degrees (roughly 11km), exclude it
          return distance > 0.1;
        });

        filteredListeners.forEach((listener) => {
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
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(animatedDotSvg),
              scaledSize: new google.maps.Size(20, 20),
              anchor: new google.maps.Point(10, 10),
            },
          });

          // Add click listener for zoom and popup
          marker.addListener("click", () => {
            console.log(`Marker clicked: ${listener.city}, ${listener.country}`);
            
            // Close any existing overlay
            if (currentInfoWindow.current) {
              currentInfoWindow.current.setMap(null);
            }

            // Pan and zoom to marker location
            mapInstance.panTo({ lat: listener.lat, lng: listener.lng });
            
            // Set appropriate zoom level
            const currentZoom = mapInstance.getZoom() || 2;
            if (currentZoom < 6) {
              mapInstance.setZoom(6);
            } else if (currentZoom < 8) {
              mapInstance.setZoom(8);
            }

            // Animate marker with bounce effect
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => {
              marker.setAnimation(null);
            }, 1500);

            // Create InfoWindow with simple content
            const infoWindow = new google.maps.InfoWindow();
            
            // Set content as DOM element instead of HTML string
            const contentDiv = document.createElement('div');
            contentDiv.style.padding = '12px';
            contentDiv.style.textAlign = 'center';
            contentDiv.style.minWidth = '140px';
            
            const listenerIcon = document.createElement('div');
            listenerIcon.textContent = '🎧 Active Listener';
            listenerIcon.style.fontSize = '14px';
            listenerIcon.style.marginBottom = '6px';
            
            const cityDiv = document.createElement('div');
            cityDiv.textContent = listener.city;
            cityDiv.style.fontWeight = 'bold';
            cityDiv.style.fontSize = '16px';
            cityDiv.style.color = '#e67e22';
            cityDiv.style.marginBottom = '2px';
            
            const countryDiv = document.createElement('div');
            countryDiv.textContent = listener.country;
            countryDiv.style.fontSize = '13px';
            countryDiv.style.color = '#666';
            
            contentDiv.appendChild(listenerIcon);
            contentDiv.appendChild(cityDiv);
            contentDiv.appendChild(countryDiv);
            
            infoWindow.setContent(contentDiv);
            infoWindow.open(mapInstance, marker);
            currentInfoWindow.current = infoWindow;
          });
        });
      };

      // Wait for map to be fully initialized before adding markers
      google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
        console.log('Map is fully loaded, adding markers...');
        
        // Add user location marker with pulsing animation
        if (userLocation) {
          console.log('Adding user location marker at:', userLocation);
          
          // Create pulsing blue dot for user location
          const userLocationSvg = `
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="8" fill="#2563eb" opacity="0.3">
                <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="16" cy="16" r="6" fill="#2563eb" opacity="0.6">
                <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0.3;0.6" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="16" cy="16" r="4" fill="#2563eb" opacity="1">
                <animate attributeName="opacity" values="1;0.8;1" dur="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
          `;
          
          const userMarker = new google.maps.Marker({
            position: userLocation,
            map: mapInstance,
            title: "Your Location",
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(userLocationSvg),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16),
            },
            zIndex: 1000, // Ensure it appears above other markers
          });
          
          // Add click listener for user location marker
          userMarker.addListener("click", () => {
            const userInfoWindow = new google.maps.InfoWindow({
              content: `
                <div style="
                  background: ${isDarkMode ? '#1f2937' : '#ffffff'};
                  color: ${isDarkMode ? '#ffffff' : '#1f2937'};
                  padding: 12px;
                  border-radius: 8px;
                  font-size: 14px;
                  font-weight: 600;
                  border: 2px solid #2563eb;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  min-width: 120px;
                  text-align: center;
                ">
                  <div style="margin-bottom: 4px;">📍 This is you!</div>
                  <div style="font-size: 12px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'};">Your current location</div>
                </div>
              `,
              maxWidth: 200,
            });
            
            // Close other info windows
            if (currentInfoWindow.current) {
              currentInfoWindow.current.setMap(null);
            }
            
            userInfoWindow.open(mapInstance, userMarker);
            currentInfoWindow.current = userInfoWindow;
          });
        }
        
        // Add mock listener markers
        console.log('Adding mock listener markers...');
        addListenerMarkers(mapInstance);
      });
      
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
      }
    };

    // Define global callback function
    window.initMapCallback = () => {
      console.log('Google Maps API callback triggered');
      // Give a moment for all libraries to fully initialize
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.Map && window.google.maps.MapTypeId) {
          initializeMap();
        } else {
          console.error('Google Maps API not ready after callback');
        }
      }, 50);
    };

    // Load Google Maps API if not already loaded
    if (typeof google === "undefined" || !google.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,marker&callback=initMapCallback`;
      script.async = true;
      script.defer = true;
      script.onerror = (error) => {
        console.error('Failed to load Google Maps API:', error);
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [config, userLocation]); // Only initialize once, theme changes handled separately

  // Update map styles when theme changes
  useEffect(() => {
    if (map && window.google && window.google.maps) {
      console.log('Theme changed, updating map styles. Current theme:', currentTheme);
      updateMapStyles(map);
    }
  }, [map, currentTheme, isDarkMode]);

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
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black">
          {/* Fullscreen Header */}
          <div className="absolute top-16 left-0 right-0 z-[10002] bg-black/80 backdrop-blur-md border-b border-gray-700">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white">Live Interactive Map</h2>
                {weather && (
                  <div className="flex items-center gap-3 bg-gray-900/80 rounded-lg px-4 py-2">
                    <div className="w-8 h-8">
                      <img
                        src={getWeatherIcon(weather.description, weather.icon.includes("d"))}
                        alt={weather.description}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-sm">
                      <span className="text-white font-medium">{weather.location}</span>
                      <span className="text-gray-300 ml-2">{Math.round(weather.temperature)}°F</span>
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => setIsFullscreen(false)}
                size="sm"
                className="p-2 border-0 shadow-lg bg-red-600 hover:bg-red-700 text-white"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Fullscreen Map */}
          <div 
            ref={mapRef}
            className="absolute top-32 left-0 right-0 bottom-0"
            style={{ backgroundColor: colors.cardBackground }}
          />

          {/* Fullscreen Controls */}
          <div className="absolute top-36 right-8 z-[10001] flex flex-col gap-2">
            <Button
              onClick={() => map && map.setZoom(map.getZoom() + 1)}
              size="sm"
              className="p-2 border-0 shadow-lg"
              style={{ backgroundColor: colors.primary, color: "#ffffff" }}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => map && map.setZoom(map.getZoom() - 1)}
              size="sm"
              className="p-2 border-0 shadow-lg"
              style={{ backgroundColor: colors.primary, color: "#ffffff" }}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>

          <div className="absolute top-36 left-8 z-[10001] flex flex-col gap-2">
            <Button
              onClick={() => {
                if (userLocation && map) {
                  map.panTo(userLocation);
                  map.setZoom(12);
                } else if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    const newLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setUserLocation(newLocation);
                    if (map) {
                      map.panTo(newLocation);
                      map.setZoom(12);
                    }
                  });
                }
              }}
              size="sm"
              className="p-2 border-0 shadow-lg"
              style={{ backgroundColor: colors.primary, color: "#ffffff" }}
            >
              <MapPin className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => {
                if (map) {
                  map.panTo({ lat: 40.7128, lng: -74.006 });
                  map.setZoom(2);
                }
              }}
              size="sm"
              className="p-2 border-0 shadow-lg"
              style={{ backgroundColor: colors.primary, color: "#ffffff" }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Normal Mode Container */}
      {!isFullscreen && (
        <section 
          id="globe-map" 
          className="relative py-16"
          style={{ backgroundColor: colors.background }}
          aria-label="Live Interactive Map"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 
                className="font-orbitron font-black text-4xl md:text-5xl mb-6"
                style={{ 
                  color: currentTheme === 'light-mode' ? '#000000' : colors.text 
                }}
              >
                LIVE INTERACTIVE MAP
              </h2>
              
              {/* Weather display for normal mode */}
              {weather && (
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="w-10 h-10">
                    <img
                      src={getWeatherIcon(weather.description, weather.icon.includes("d"))}
                      alt={weather.description}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-lg">
                    <span 
                      className="font-bold"
                      style={{ color: colors.text }}
                    >
                      {weather.location}
                    </span>
                    <span 
                      className="ml-2 font-semibold"
                      style={{ color: colors.textMuted }}
                    >
                      {Math.round(weather.temperature)}°F - {weather.description}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Normal Map Container */}
            <div className="relative mb-12">
              <div 
                ref={mapRef}
                className="w-full h-96 rounded-lg shadow-2xl border"
                style={{ 
                  minHeight: "400px",
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.primary 
                }}
              />
              
              {/* Expand Button */}
              <Button
                onClick={() => setIsFullscreen(true)}
                className="absolute top-4 right-4 p-2 border-0 shadow-lg"
                style={{ backgroundColor: colors.primary, color: "#ffffff" }}
                size="sm"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>

              {/* Zoom Controls */}
              <div className="absolute top-4 right-16 flex flex-col gap-2">
                <Button
                  onClick={() => map && map.setZoom(map.getZoom() + 1)}
                  size="sm"
                  className="p-2 border-0 shadow-lg"
                  style={{ backgroundColor: colors.primary, color: "#ffffff" }}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => map && map.setZoom(map.getZoom() - 1)}
                  size="sm"
                  className="p-2 border-0 shadow-lg"
                  style={{ backgroundColor: colors.primary, color: "#ffffff" }}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </div>

              {/* Location Controls */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Button
                  onClick={() => {
                    if (userLocation && map) {
                      map.panTo(userLocation);
                      map.setZoom(12);
                    } else if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((position) => {
                        const newLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                        setUserLocation(newLocation);
                        if (map) {
                          map.panTo(newLocation);
                          map.setZoom(12);
                        }
                      });
                    }
                  }}
                  size="sm"
                  className="p-2 border-0 shadow-lg"
                  style={{ backgroundColor: colors.primary, color: "#ffffff" }}
                >
                  <MapPin className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    if (map) {
                      map.panTo({ lat: 40.7128, lng: -74.006 });
                      map.setZoom(2);
                    }
                  }}
                  size="sm"
                  className="p-2 border-0 shadow-lg"
                  style={{ backgroundColor: colors.primary, color: "#ffffff" }}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Statistics Layout - positioned below map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Statistics Card */}
              <Card
                className="transition-all duration-300 border-2 hover:shadow-lg"
                style={{ 
                  backgroundColor: isDarkMode ? "#000000" : "#ffffff",
                  borderColor: colors.primary
                }}
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
                    <div className="flex flex-col items-center text-center space-y-3 transform scale-125">
                      <div className="relative">
                        <AnimatedCounter
                          value={liveStats?.activeListeners || totalListeners}
                          className="font-black text-4xl tracking-tight"
                          style={{ color: colors.primary }}
                        />
                        <div 
                          className="absolute -inset-2 bg-gradient-to-r from-transparent via-current to-transparent opacity-10 rounded-lg blur-sm"
                          style={{ background: `radial-gradient(circle, ${colors.primary}20, transparent)` }}
                        />
                      </div>
                      <TrendingUp
                        className="h-8 w-8 drop-shadow-md"
                        style={{ color: colors.primary }}
                      />
                      <span
                        className={`font-bold text-xs uppercase tracking-wide ${isDarkMode ? "text-white" : "text-black"}`}
                      >
                        Active Listeners
                      </span>
                    </div>

                    {/* Countries */}
                    <div className="flex flex-col items-center text-center space-y-3 transform scale-125">
                      <div className="relative">
                        <AnimatedCounter
                          value={liveStats?.countries || countriesWithListeners}
                          className="font-black text-4xl tracking-tight"
                          style={{ color: colors.primary }}
                        />
                        <div 
                          className="absolute -inset-2 bg-gradient-to-r from-transparent via-current to-transparent opacity-10 rounded-lg blur-sm"
                          style={{ background: `radial-gradient(circle, ${colors.primary}20, transparent)` }}
                        />
                      </div>
                      <MapPin
                        className="h-8 w-8 drop-shadow-md"
                        style={{ color: colors.primary }}
                      />
                      <span
                        className={`font-bold text-xs uppercase tracking-wide ${isDarkMode ? "text-white" : "text-black"}`}
                      >
                        Countries
                      </span>
                    </div>

                    {/* Total Listeners */}
                    <div className="flex flex-col items-center text-center space-y-3 transform scale-125">
                      <div className="relative">
                        <AnimatedCounter
                          value={liveStats?.totalListeners || stats?.currentListeners || 1247}
                          className="font-black text-4xl tracking-tight"
                          style={{ color: colors.primary }}
                        />
                        <div 
                          className="absolute -inset-2 bg-gradient-to-r from-transparent via-current to-transparent opacity-10 rounded-lg blur-sm"
                          style={{ background: `radial-gradient(circle, ${colors.primary}20, transparent)` }}
                        />
                      </div>
                      <Users
                        className="h-8 w-8 drop-shadow-md"
                        style={{ color: colors.primary }}
                      />
                      <span
                        className={`font-bold text-xs uppercase tracking-wide ${isDarkMode ? "text-white" : "text-black"}`}
                      >
                        Total Listeners
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Globe Card */}
              <Card
                className="transition-all duration-300 border-2 hover:shadow-lg"
                style={{ 
                  backgroundColor: isDarkMode ? "#000000" : "#ffffff",
                  borderColor: colors.primary
                }}
              >
                <CardContent className="p-6 h-full flex flex-col items-center justify-center">
                  <div
                    className="w-20 h-20 mb-4 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: `${colors.primary}20` }}
                  >
                    <img
                      src={CountriesIconPath}
                      alt="Countries Icon"
                      className="w-12 h-12 object-contain"
                      style={{ filter: `hue-rotate(${colors.primary === '#ff6b35' ? '0deg' : '45deg'})` }}
                    />
                  </div>
                  <h3
                    className="font-black text-xl mb-2 text-center"
                    style={{ color: colors.primary }}
                  >
                    Global Reach
                  </h3>
                  <p
                    className={`text-center text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Our metal community spans across continents, uniting headbangers from every corner of the globe.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      {liveStats?.countries || countriesWithListeners}
                    </span>
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: colors.primary }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Active Locations Card */}
              <Card
                className="transition-all duration-300 border-2 hover:shadow-lg"
                style={{ 
                  backgroundColor: isDarkMode ? "#000000" : "#ffffff",
                  borderColor: colors.primary
                }}
              >
                <CardHeader className="pb-4">
                  <CardTitle
                    className="font-black text-xl text-center"
                    style={{ color: colors.primary }}
                  >
                    Active Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {top10Listeners
                      .filter((l) => l.isActive)
                      .slice(0, 10)
                      .map((listener, index) => (
                        <div
                          key={listener.id}
                          className="flex items-center justify-between p-2 rounded transition-colors duration-200 hover:bg-opacity-10"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="font-semibold text-sm w-5 text-center"
                              style={{ color: colors.primary }}
                            >
                              #{index + 1}
                            </span>
                            <div>
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
                          <div
                            className="w-2 h-2 rounded-full animate-pulse ml-2"
                            style={{ 
                              backgroundColor: colors.primary,
                              animation: 'pulse 2s ease-in-out infinite'
                            }}
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
