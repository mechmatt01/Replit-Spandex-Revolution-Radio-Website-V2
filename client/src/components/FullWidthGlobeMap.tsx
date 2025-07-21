
/// <reference types="@types/google.maps" />
declare global {
  interface Window {
    google: typeof google;
  }
}

import React, { useEffect, useState, useRef } from "react";
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
  const fullscreenMapRef = useRef<HTMLDivElement>(null);
  const currentInfoWindow = useRef<any>(null);
  const { colors, isDarkMode, currentTheme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Store original body styles
  const originalBodyStylesRef = useRef<{
    overflow: string;
    position: string;
    width: string;
    height: string;
    top: string;
    left: string;
    right: string;
    paddingRight: string;
  } | null>(null);

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

  // COMPLETELY REWRITTEN - Simple fullscreen toggle that works
  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    console.log(`Simple fullscreen toggle: ${isFullscreen} → ${newState}`);
    
    // Close any open info windows
    if (currentInfoWindow.current) {
      currentInfoWindow.current.close();
      currentInfoWindow.current = null;
    }

    // Update state immediately
    setIsFullscreen(newState);

    // Simple body scroll handling
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Wait for CSS transitions to complete, then trigger map resize
    setTimeout(() => {
      if (map && window.google && window.google.maps) {
        console.log('Triggering map resize after fullscreen layout change');
        window.google.maps.event.trigger(map, 'resize');
        
        // Ensure map is centered properly after resize
        setTimeout(() => {
          if (userLocation) {
            map.panTo(userLocation);
            map.setZoom(12);
          } else {
            map.panTo({ lat: 20, lng: 0 });
            map.setZoom(3);
          }
        }, 100);
      }
    }, 400); // Increased delay to ensure CSS transition completes
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

    // Add CSS to hide Google attribution and fix InfoWindow styling
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

      /* Fix InfoWindow display issues and positioning */
      .gm-style-iw {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        z-index: 9999 !important;
        transform: none !important;
      }

      .gm-style-iw-c {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 9999 !important;
        padding: 0 !important;
        margin: 0 !important;
        border-radius: 8px !important;
        overflow: visible !important;
      }

      .gm-style-iw-d {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        overflow: visible !important;
        position: relative !important;
        z-index: 9999 !important;
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .gm-style-iw-chr {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: absolute !important;
        top: 8px !important;
        right: 8px !important;
        z-index: 10000 !important;
        width: 20px !important;
        height: 20px !important;
        background: rgba(0, 0, 0, 0.7) !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: white !important;
        font-size: 14px !important;
        font-weight: bold !important;
        line-height: 1 !important;
        transition: background-color 0.2s ease !important;
      }

      .gm-style-iw-chr:hover {
        background: rgba(0, 0, 0, 0.9) !important;
      }

      .gm-style-iw-chr:after {
        content: '×' !important;
        display: block !important;
      }

      /* InfoWindow arrow/tip positioning and styling */
      .gm-style-iw-tc {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: 0 !important;
        height: 0 !important;
      }

      .gm-style-iw-tc::after {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: -8px !important;
        width: 0 !important;
        height: 0 !important;
        border-left: 8px solid transparent !important;
        border-right: 8px solid transparent !important;
        border-top: 8px solid ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
        filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1)) !important;
      }

      .gm-style-iw-tc::before {
        content: '' !important;
        position: absolute !important;
        top: -1px !important;
        left: -9px !important;
        width: 0 !important;
        height: 0 !important;
        border-left: 9px solid transparent !important;
        border-right: 9px solid transparent !important;
        border-top: 9px solid ${colors.primary} !important;
        z-index: -1 !important;
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

              // Close any existing info window
              if (currentInfoWindow.current) {
                currentInfoWindow.current.close();
                currentInfoWindow.current = null;
              }

              // Pan and zoom to marker location with slight delay for smooth transition
              setTimeout(() => {
                mapInstance.panTo({ lat: listener.lat, lng: listener.lng });

                // Set appropriate zoom level
                const currentZoom = mapInstance.getZoom() || 2;
                if (currentZoom < 6) {
                  mapInstance.setZoom(6);
                } else if (currentZoom < 8) {
                  mapInstance.setZoom(8);
                }
              }, 100);

              // Animate marker with bounce effect
              marker.setAnimation(google.maps.Animation.BOUNCE);
              setTimeout(() => {
                marker.setAnimation(null);
              }, 1500);

              // Create InfoWindow content with better styling and sizing
              const infoWindowContent = document.createElement('div');
              infoWindowContent.style.cssText = `
                background: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
                color: ${isDarkMode ? '#ffffff' : '#1f2937'} !important;
                padding: 16px 20px !important;
                border-radius: 8px !important;
                font-family: Arial, sans-serif !important;
                text-align: center !important;
                min-width: 180px !important;
                max-width: 220px !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
                border: 2px solid ${colors.primary} !important;
                font-size: 14px !important;
                line-height: 1.4 !important;
                margin: 0 !important;
              `;

              const headerDiv = document.createElement('div');
              headerDiv.textContent = '🎧 Active Listener';
              headerDiv.style.cssText = `
                font-size: 13px !important;
                margin-bottom: 8px !important;
                color: ${colors.primary} !important;
                font-weight: bold !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
              `;

              const cityDiv = document.createElement('div');
              cityDiv.textContent = listener.city;
              cityDiv.style.cssText = `
                font-weight: bold !important;
                font-size: 18px !important;
                color: ${colors.primary} !important;
                margin-bottom: 4px !important;
              `;

              const countryDiv = document.createElement('div');
              countryDiv.textContent = listener.country;
              countryDiv.style.cssText = `
                font-size: 13px !important;
                color: ${isDarkMode ? '#9ca3af' : '#6b7280'} !important;
                font-weight: 500 !important;
                margin-top: 2px !important;
              `;

              infoWindowContent.appendChild(headerDiv);
              infoWindowContent.appendChild(cityDiv);
              infoWindowContent.appendChild(countryDiv);

              // Create InfoWindow with proper configuration and positioning
              const infoWindow = new google.maps.InfoWindow({
                content: infoWindowContent,
                maxWidth: 240,
                pixelOffset: new google.maps.Size(0, -10),
                ariaLabel: `Active listener in ${listener.city}, ${listener.country}`,
                disableAutoPan: false,
                zIndex: 9999
              });

              // Add close event listeners
              infoWindow.addListener('closeclick', () => {
                currentInfoWindow.current = null;
              });

              infoWindow.addListener('domready', () => {
                // Ensure InfoWindow is visible and properly styled
                const iwOuter = document.querySelector('.gm-style-iw') as HTMLElement;
                const iwBackground = document.querySelector('.gm-style-iw-d') as HTMLElement;
                const iwContainer = document.querySelector('.gm-style-iw-c') as HTMLElement;
                const iwCloseBtn = document.querySelector('.gm-style-iw-chr') as HTMLElement;

                if (iwOuter) {
                  iwOuter.style.visibility = 'visible !important';
                  iwOuter.style.display = 'block !important';
                  iwOuter.style.opacity = '1 !important';
                }

                if (iwContainer) {
                  iwContainer.style.padding = '0 !important';
                  iwContainer.style.margin = '0 !important';
                  iwContainer.style.borderRadius = '8px !important';
                  iwContainer.style.overflow = 'visible !important';
                }

                if (iwBackground) {
                  iwBackground.style.overflow = 'visible !important';
                  iwBackground.style.background = 'transparent !important';
                  iwBackground.style.border = 'none !important';
                  iwBackground.style.borderRadius = '0 !important';
                  iwBackground.style.boxShadow = 'none !important';
                  iwBackground.style.padding = '0 !important';
                  iwBackground.style.margin = '0 !important';
                }

                if (iwCloseBtn) {
                  iwCloseBtn.style.display = 'flex !important';
                  iwCloseBtn.style.visibility = 'visible !important';
                  iwCloseBtn.style.alignItems = 'center !important';
                  iwCloseBtn.style.justifyContent = 'center !important';
                }
              });

              // Open InfoWindow with delay to ensure marker animation completes
              setTimeout(() => {
                infoWindow.open(mapInstance, marker);
                currentInfoWindow.current = infoWindow;
              }, 200);
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
            // Close any existing info window
            if (currentInfoWindow.current) {
              currentInfoWindow.current.close();
              currentInfoWindow.current = null;
            }

            // Create user location InfoWindow content with improved styling
            const userInfoContent = document.createElement('div');
            userInfoContent.style.cssText = `
              background: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
              color: ${isDarkMode ? '#ffffff' : '#1f2937'} !important;
              padding: 16px 20px !important;
              border-radius: 8px !important;
              font-size: 14px !important;
              font-weight: 600 !important;
              border: 2px solid #2563eb !important;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
              min-width: 160px !important;
              max-width: 200px !important;
              text-align: center !important;
              line-height: 1.4 !important;
              margin: 0 !important;
            `;

            const locationDiv = document.createElement('div');
            locationDiv.textContent = '📍 This is you!';
            locationDiv.style.cssText = `
              margin-bottom: 6px !important;
              font-size: 16px !important;
              font-weight: bold !important;
              color: #2563eb !important;
            `;

            const descDiv = document.createElement('div');
            descDiv.textContent = 'Your current location';
            descDiv.style.cssText = `
              font-size: 12px !important;
              color: ${isDarkMode ? '#9ca3af' : '#6b7280'} !important;
              font-weight: 500 !important;
              margin-top: 2px !important;
            `;

            userInfoContent.appendChild(locationDiv);
            userInfoContent.appendChild(descDiv);

            const userInfoWindow = new google.maps.InfoWindow({
              content: userInfoContent,
              maxWidth: 220,
              pixelOffset: new google.maps.Size(0, -10),
              ariaLabel: 'Your current location',
              disableAutoPan: false,
              zIndex: 9999
            });

            userInfoWindow.addListener('closeclick', () => {
              currentInfoWindow.current = null;
            });

            userInfoWindow.addListener('domready', () => {
              // Ensure InfoWindow is visible and properly styled
              const iwOuter = document.querySelector('.gm-style-iw') as HTMLElement;
              const iwBackground = document.querySelector('.gm-style-iw-d') as HTMLElement;
              const iwContainer = document.querySelector('.gm-style-iw-c') as HTMLElement;
              const iwCloseBtn = document.querySelector('.gm-style-iw-chr') as HTMLElement;

              if (iwOuter) {
                iwOuter.style.visibility = 'visible !important';
                iwOuter.style.display = 'block !important';
                iwOuter.style.opacity = '1 !important';
              }

              if (iwContainer) {
                iwContainer.style.padding = '0 !important';
                iwContainer.style.margin = '0 !important';
                iwContainer.style.borderRadius = '8px !important';
                iwContainer.style.overflow = 'visible !important';
              }

              if (iwBackground) {
                iwBackground.style.overflow = 'visible !important';
                iwBackground.style.background = 'transparent !important';
                iwBackground.style.border = 'none !important';
                iwBackground.style.borderRadius = '0 !important';
                iwBackground.style.boxShadow = 'none !important';
                iwBackground.style.padding = '0 !important';
                iwBackground.style.margin = '0 !important';
              }

              if (iwCloseBtn) {
                iwCloseBtn.style.display = 'flex !important';
                iwCloseBtn.style.visibility = 'visible !important';
                iwCloseBtn.style.alignItems = 'center !important';
                iwCloseBtn.style.justifyContent = 'center !important';
              }
            });

            userInfoWindow.open(mapInstance, userMarker);
            currentInfoWindow.current = userInfoWindow;
          });
        }

        // Add mock listener markers
        console.log('Adding mock listener markers...');
        addListenerMarkers(mapInstance);

        // Add map click listener to close any open info windows
        mapInstance.addListener('click', () => {
          if (currentInfoWindow.current) {
            currentInfoWindow.current.close();
            currentInfoWindow.current = null;
          }
        });
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

  // Cleanup fullscreen state on component unmount
  useEffect(() => {
    return () => {
      if (isFullscreen && originalBodyStylesRef.current) {
        document.body.style.overflow = originalBodyStylesRef.current.overflow;
        document.body.style.position = originalBodyStylesRef.current.position;
        document.body.style.width = originalBodyStylesRef.current.width;
        document.body.style.height = originalBodyStylesRef.current.height;
        document.body.style.top = originalBodyStylesRef.current.top;
        document.body.style.left = originalBodyStylesRef.current.left;
        document.body.style.right = originalBodyStylesRef.current.right;
        document.body.style.paddingRight = originalBodyStylesRef.current.paddingRight;
        document.documentElement.style.overflow = '';
      }
    };
  }, [isFullscreen]);

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

  // Handle map control button clicks with proper event prevention
  const handleMapControlClick = (action: string, event: React.MouseEvent) => {
    console.log(`${action} button clicked`);
    
    if (!map || !window.google || !window.google.maps) {
      console.log('Map not available for', action);
      return;
    }

    try {
      switch (action) {
        case 'zoomIn':
          const currentZoomIn = map.getZoom() || 2;
          const newZoomIn = Math.min(currentZoomIn + 1, 20);
          console.log(`Setting zoom from ${currentZoomIn} to ${newZoomIn}`);
          map.setZoom(newZoomIn);
          break;
          
        case 'zoomOut':
          const currentZoomOut = map.getZoom() || 2;
          const newZoomOut = Math.max(currentZoomOut - 1, 1);
          console.log(`Setting zoom from ${currentZoomOut} to ${newZoomOut}`);
          map.setZoom(newZoomOut);
          break;
          
        case 'myLocation':
          if (userLocation) {
            console.log('Panning to user location:', userLocation);
            map.panTo(userLocation);
            map.setZoom(12);
          } else {
            console.log('Requesting user location...');
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  };
                  console.log('Got new location:', newLocation);
                  setUserLocation(newLocation);
                  map.panTo(newLocation);
                  map.setZoom(12);
                },
                (error) => {
                  console.error("Error getting location:", error);
                  const defaultLocation = { lat: 40.7128, lng: -74.006 };
                  setUserLocation(defaultLocation);
                  map.panTo(defaultLocation);
                  map.setZoom(8);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 300000
                }
              );
            } else {
              console.log('Geolocation not supported, using default location');
              const defaultLocation = { lat: 40.7128, lng: -74.006 };
              setUserLocation(defaultLocation);
              map.panTo(defaultLocation);
              map.setZoom(8);
            }
          }
          break;
          
        case 'reset':
          console.log('Resetting map to world view');
          map.panTo({ lat: 20, lng: 0 });
          map.setZoom(2);
          break;
      }
    } catch (error) {
      console.error(`Error in ${action}:`, error);
    }
  };

  return (
      <section
        id="map"
        className={`${isDarkMode ? "bg-black" : "bg-white"} transition-all duration-500 ease-in-out py-20`}
      >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header for normal view */}
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

        {/* Map Container */}
        <div 
          className={`relative mb-16 transition-all duration-300 ease-in-out ${
            isFullscreen 
              ? "fixed inset-0 z-[9998] mb-0 bg-black overflow-hidden" 
              : "h-[600px] rounded-lg overflow-hidden"
          }`}
          style={isFullscreen ? {
            position: 'fixed',
            top: '4rem', // Account for navigation header
            left: 0,
            right: 0,
            bottom: 0,
            height: 'calc(100vh - 4rem)', // Only subtract navigation bar, let map cover full remaining space
            width: '100vw',
            zIndex: 9998, // Lower than floating player (z-50 = z-[50])
            background: 'black',
            overflow: 'hidden'
          } : {
            height: '600px'
          }}
        >


          <div
            ref={mapRef}
            className="map-container w-full transition-all duration-300"
            style={isFullscreen ? {
              height: '100%',
              width: '100%',
              backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
              position: "relative"
            } : {
              height: '600px',
              width: '100%',
              backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
              position: "relative",
              borderRadius: '0.75rem'
            }}
          />

          {/* Expand/Close Button */}
          <div className={`absolute transition-all duration-500 ${
            isFullscreen ? "top-4 left-6 z-[9999]" : "top-4 left-4 z-10"
          }`}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Expand button clicked, current fullscreen:', isFullscreen);
                toggleFullscreen();
              }}
              className={`p-3 border-0 shadow-xl rounded-lg transition-all duration-300 cursor-pointer select-none ${
                isFullscreen 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-gray-800 hover:bg-gray-700 text-white"
              }`}
              style={{
                minWidth: "48px",
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                outline: "none",
                userSelect: "none"
              }}
              aria-label={isFullscreen ? "Exit fullscreen map" : "Enter fullscreen map"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Map Controls */}
          <div className={`absolute transition-all duration-500 flex flex-col gap-2 ${
            isFullscreen ? "top-4 right-6 z-[9999]" : "top-4 right-4 z-10"
          }`}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMapControlClick('zoomIn', e);
              }}
              className="p-3 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-xl transition-all duration-300 rounded-lg cursor-pointer select-none"
              style={{
                minWidth: "48px",
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                outline: "none",
                userSelect: "none"
              }}
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMapControlClick('zoomOut', e);
              }}
              className="p-3 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-xl transition-all duration-300 rounded-lg cursor-pointer select-none"
              style={{
                minWidth: "48px",
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                outline: "none",
                userSelect: "none"
              }}
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMapControlClick('myLocation', e);
              }}
              className="p-3 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-xl transition-all duration-300 rounded-lg cursor-pointer select-none"
              style={{
                minWidth: "48px",
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                outline: "none",
                userSelect: "none"
              }}
              aria-label="Go to my location"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMapControlClick('reset', e);
              }}
              className="p-3 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-xl transition-all duration-300 rounded-lg cursor-pointer select-none"
              style={{
                minWidth: "48px",
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                outline: "none",
                userSelect: "none"
              }}
              aria-label="Reset map view"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statistics Layout - positioned below map */}
        {!isFullscreen && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Statistics - Left Side with Vertical Layout */}
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

          {/* Active Locations - Combined Single Box */}
          <div className="lg:col-span-2">
            <Card
              className="transition-all duration-300 border-2 h-full hover:shadow-lg"
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
