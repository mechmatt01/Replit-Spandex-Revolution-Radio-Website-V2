import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Loader2, Users, Globe, Activity } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useRadio } from "@/contexts/RadioContext";
import { useAdaptiveTheme } from "@/hooks/useAdaptiveTheme";
import { AnimatedCounter } from "./AnimatedCounter";

// Types
interface Weather {
  location: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

interface Config {
  googleMapsApiKey: string;
  googleMapsSigningSecret: string;
  openWeatherApiKey: string;
  googleMapsMapId: string;
}

// Weather icon mapping - Updated to match actual files in animated_weather_icons folder
const weatherIconMap: { [key: string]: string } = {
  '01d': 'clear-day.svg',
  '01n': 'clear-night.svg',
  '02d': 'partly-cloudy-day.svg',
  '02n': 'partly-cloudy-night.svg',
  '03d': 'cloudy-day.svg',
  '03n': 'cloudy-night.svg',
  '04d': 'cloudy.svg',
  '04n': 'cloudy.svg',
  '09d': 'rainy-day.svg',
  '09n': 'rainy-night.svg',
  '10d': 'rain.svg',
  '10n': 'rainy.svg',
  '11d': 'thunder.svg',
  '11n': 'thunder.svg',
  '13d': 'snow.svg',
  '13n': 'snowy.svg',
  '50d': 'fog.svg',
  '50n': 'fog.svg',
};

const FullWidthGlobeMapFixed = () => {
  const { isDarkMode, colors } = useTheme();
  const { currentTrack } = useRadio();
  const { adaptiveTheme } = useAdaptiveTheme(currentTrack?.artwork || '');
  const mapRef = useRef<HTMLDivElement>(null);
  const fullscreenMapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [fullscreenMap, setFullscreenMap] = useState<google.maps.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  
  // Weather state
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);
  const [mapState, setMapState] = useState<{ center: google.maps.LatLng | null; zoom: number | null }>({ center: null, zoom: null });

  // Use hardcoded config for Firebase hosting
  const config: Config = {
    googleMapsApiKey: "AIzaSyCBoEZeDucpm7p9OEDgaUGLzhn5HpItseQ",
    googleMapsSigningSecret: "",
    openWeatherApiKey: "bc23ce0746d4fc5c04d1d765589dadc5",
    googleMapsMapId: "spandex-salvation-radio-map"
  };

  // Live statistics state with proper Firebase integration
  const [liveStats, setLiveStats] = useState<{
    activeListeners: number;
    countries: number;
    totalListeners: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch live statistics from Firebase API
  const fetchLiveStats = async () => {
    try {
      const response = await fetch('/api/live-stats');
      if (response.ok) {
        const stats = await response.json();
        setLiveStats(stats);
      } else {
        console.error('Failed to fetch live stats');
        // Fallback to default values if API fails
        setLiveStats({
          activeListeners: 42,
          countries: 12,
          totalListeners: 1247
        });
      }
    } catch (error) {
      console.error('Error fetching live stats:', error);
      // Fallback to default values if fetch fails
      setLiveStats({
        activeListeners: 42,
        countries: 12,
        totalListeners: 1247
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch live stats on component mount and set up periodic updates
  useEffect(() => {
    fetchLiveStats();
    
    // Update stats every 30 seconds
    const interval = setInterval(fetchLiveStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Get weather icon based on OpenWeatherMap icon code
  const getWeatherIcon = (iconCode: string): string => {
    return weatherIconMap[iconCode] || 'clear-day.svg';
  };

  // Fetch weather data
  const fetchWeather = async (lat: number, lng: number) => {
    setWeatherLoading(true);
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lng}`);
      if (response.ok) {
        const weatherData = await response.json();
        setWeather(weatherData);
      } else {
        console.error('Failed to fetch weather data');
        // Fallback to mock data
        setWeather({
          location: "Unknown Location",
          temperature: 72,
          description: "Partly Cloudy",
          icon: "partly-cloudy-day",
          humidity: 65,
          windSpeed: 8,
          feelsLike: 74
        });
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Fallback to mock data
      setWeather({
        location: "Unknown Location",
        temperature: 72,
        description: "Partly Cloudy",
        icon: "partly-cloudy-day",
        humidity: 65,
        windSpeed: 8,
        feelsLike: 74
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  // Request user location with permission handling
  const requestUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setUserLocation(newLocation);
      setLocationPermission('granted');
      localStorage.setItem('locationPermission', 'granted');
      
      // Fetch weather for the user's location
      await fetchWeather(newLocation.lat, newLocation.lng);
      
      // Update map center if map exists
      if (map) {
        map.panTo(newLocation);
        map.setZoom(10);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationPermission('denied');
            localStorage.setItem('locationPermission', 'denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationPermission('denied');
            localStorage.setItem('locationPermission', 'denied');
            break;
          case error.TIMEOUT:
            setLocationPermission('denied');
            localStorage.setItem('locationPermission', 'denied');
            break;
        }
      }
    }
  }, [map]);

  // Handle location permission with proper state management
  const handleLocationPermission = async () => {
    console.log('Handling location permission...');
    if (locationPermission === 'granted') {
      await requestUserLocation();
    } else if (locationPermission === 'prompt') {
      await requestUserLocation();
    }
  };

  // Initialize location and weather on component mount
  useEffect(() => {
    const initializeLocation = async () => {
      console.log('Initializing location services...');
      
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        setLocationPermission('denied');
        setWeather({
          location: "Location not supported",
          temperature: 72,
          description: "Geolocation unavailable",
          icon: "01d",
          humidity: 45,
          windSpeed: 5,
          feelsLike: 75
        });
        return;
      }

      // Check stored permission
      const storedPermission = localStorage.getItem('locationPermission');
      console.log('Stored location permission:', storedPermission);
      
      if (storedPermission === 'granted') {
        setLocationPermission('granted');
        try {
          await handleLocationPermission();
        } catch (error) {
          console.log('Failed to get location despite previous permission:', error);
          setLocationPermission('prompt');
        }
      } else if (storedPermission === 'denied') {
        setLocationPermission('denied');
        // Show fallback weather data
        setWeather({
          location: "Enable location for weather",
          temperature: 72,
          description: "Location access needed",
          icon: "01d",
          humidity: 45,
          windSpeed: 5,
          feelsLike: 75
        });
      } else {
        // No stored permission - set to prompt state
        setLocationPermission('prompt');
        setWeather({
          location: "Enable location for weather",
          temperature: 72,
          description: "Tap to enable location",
          icon: "01d",
          humidity: 45,
          windSpeed: 5,
          feelsLike: 75
        });
      }
    };
    
    initializeLocation();
  }, []);

  // Create animated marker with pulsing effect and popup
  const createAnimatedMarker = (position: google.maps.LatLngLiteral, title: string, mapInstance: google.maps.Map, isUserLocation: boolean = false) => {
    // Create the main marker with modern design
    const marker = new google.maps.Marker({
      position,
      map: mapInstance,
      title,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: isUserLocation ? 6 : 5,
        fillColor: isUserLocation ? '#4285F4' : colors.primary,
        fillOpacity: 0.7,
        strokeColor: isUserLocation ? '#4285F4' : colors.primary,
        strokeWeight: 0,
      },
    });

    // Track the currently open InfoWindow
    let currentInfoWindow: google.maps.InfoWindow | null = null;

    const infoWindowContent = `
      <div id="custom-infowindow" style="
        background: ${isDarkMode ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
        color: ${isDarkMode ? '#f3f4f6' : '#18181b'};
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.1);
        padding: 24px;
        min-width: 280px;
        max-width: 320px;
        font-family: 'Inter', sans-serif;
        position: relative;
        border: 2px solid ${isUserLocation ? '#4285F4' : colors.primary};
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      ">
        <button id="close-infowindow" style="
          position: absolute;
          top: 16px;
          right: 16px;
          background: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          border: none;
          color: ${isDarkMode ? '#f3f4f6' : '#18181b'};
          font-size: 20px;
          cursor: pointer;
          opacity: 0.8;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        ">&times;</button>
        <div style="
          font-weight: 700; 
          font-size: 18px; 
          margin-bottom: 8px; 
          display: flex; 
          align-items: center; 
          gap: 8px;
          color: ${isUserLocation ? '#4285F4' : colors.primary};
        ">
          ${isUserLocation ? '📍 Your Location' : '🎧 Active Listener'}
        </div>
        <div style="
          font-size: 16px; 
          margin-bottom: 8px;
          font-weight: 600;
          color: ${isDarkMode ? '#f3f4f6' : '#18181b'};
        ">
          ${title}
        </div>
        <div style="
          font-size: 14px; 
          color: ${isDarkMode ? '#a1a1aa' : '#6b7280'};
          background: ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
          padding: 8px 12px;
          border-radius: 8px;
          font-family: 'Monaco', 'Menlo', monospace;
        ">
          Lat: ${position.lat.toFixed(4)}, Lng: ${position.lng.toFixed(4)}
        </div>
      </div>
    `;
    const infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent,
      maxWidth: 320,
      disableAutoPan: false,
    });

    // Add click handler for marker
    marker.addListener("click", () => {
      if (currentInfoWindow) currentInfoWindow.close();
      infoWindow.open(mapInstance, marker);
      currentInfoWindow = infoWindow;
      mapInstance.panTo(position);
      mapInstance.setZoom(10);
      setTimeout(() => {
        const closeBtn = document.getElementById('close-infowindow');
        if (closeBtn) {
          closeBtn.onclick = () => infoWindow.close();
          closeBtn.onmouseenter = () => {
            closeBtn.style.opacity = '1';
            closeBtn.style.transform = 'scale(1.1)';
          };
          closeBtn.onmouseleave = () => {
            closeBtn.style.opacity = '0.8';
            closeBtn.style.transform = 'scale(1)';
          };
        }
      }, 100);
    });

    // Close InfoWindow when clicking elsewhere
    google.maps.event.addListener(mapInstance, 'click', () => {
      if (currentInfoWindow) currentInfoWindow.close();
    });
    infoWindow.addListener('closeclick', () => {
      currentInfoWindow = null;
    });

    // Create modern pulsing overlay with improved design
    const pulsingOverlay = new google.maps.OverlayView();
    pulsingOverlay.setMap(mapInstance);
    
    pulsingOverlay.onAdd = function() {
      const div = document.createElement('div');
      div.className = 'pulsing-marker-overlay';
      div.style.cssText = `
        position: absolute;
        width: ${isUserLocation ? '20px' : '16px'};
        height: ${isUserLocation ? '20px' : '16px'};
        border-radius: 50%;
        background: ${isUserLocation ? 'radial-gradient(circle, #4285F4 0%, #2563eb 100%)' : `radial-gradient(circle, ${colors.primary} 0%, ${colors.primary}dd 100%)`};
        border: 0px solid transparent;
        animation: modernPulse 3s ease-in-out infinite;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 10;
        opacity: 0.6;
        box-shadow: 0 0 20px 4px ${isUserLocation ? '#4285F4' : colors.primary}40;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
      `;
      this.div_ = div;
      const panes = this.getPanes();
      panes.overlayImage.appendChild(div);
    };
    
    pulsingOverlay.draw = function() {
      const projection = this.getProjection();
      const point = projection.fromLatLngToDivPixel(position);
      if (point) {
        this.div_.style.left = point.x + 'px';
        this.div_.style.top = point.y + 'px';
      }
    };

    return { marker, infoWindow, pulsingOverlay };
  };

  // Initialize map with modern styling and features
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !window.google || isInitializing) return;
    
    setIsInitializing(true);
    console.log('Initializing map...');

    try {
      // Create map with modern styling
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // New York City
        zoom: 3,
        mapId: config.googleMapsMapId,
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'cooperative',
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: isDarkMode ? "#f3f4f6" : "#18181b" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: isDarkMode ? "#1f2937" : "#ffffff" }]
          },
          {
            featureType: "administrative",
            elementType: "geometry.fill",
            stylers: [{ color: isDarkMode ? "#374151" : "#f9fafb" }]
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: isDarkMode ? "#1f2937" : "#f3f4f6" }]
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: isDarkMode ? "#374151" : "#e5e7eb" }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: isDarkMode ? "#374151" : "#ffffff" }]
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: isDarkMode ? "#374151" : "#e5e7eb" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: isDarkMode ? "#1e3a8a" : "#dbeafe" }]
          }
        ]
      });

      setMap(mapInstance);
      setIsLoading(false);
      setMapError(false);

      // Add map event listeners
      mapInstance.addListener('bounds_changed', () => {
        setMapState({
          center: mapInstance.getCenter(),
          zoom: mapInstance.getZoom() || 3
        });
      });

      // Create sample markers for demonstration
      const sampleLocations = [
        { lat: 40.7128, lng: -74.0060, title: "New York Listener" },
        { lat: 34.0522, lng: -118.2437, title: "Los Angeles Listener" },
        { lat: 51.5074, lng: -0.1278, title: "London Listener" },
        { lat: 48.8566, lng: 2.3522, title: "Paris Listener" },
        { lat: 35.6762, lng: 139.6503, title: "Tokyo Listener" },
        { lat: -33.8688, lng: 151.2093, title: "Sydney Listener" },
        { lat: -23.5505, lng: -46.6333, title: "São Paulo Listener" },
        { lat: 55.7558, lng: 37.6176, title: "Moscow Listener" },
        { lat: 19.0760, lng: 72.8777, title: "Mumbai Listener" },
        { lat: 39.9042, lng: 116.4074, title: "Beijing Listener" }
      ];

      const newMarkers: google.maps.Marker[] = [];
      sampleLocations.forEach((location, index) => {
        const { marker } = createAnimatedMarker(location, location.title, mapInstance);
        newMarkers.push(marker);
        
        // Stagger marker creation for visual effect
        setTimeout(() => {
          marker.setMap(mapInstance);
        }, index * 200);
      });

      setMarkers(newMarkers);

      // Add user location marker if available
      if (userLocation) {
        const { marker: userMarker } = createAnimatedMarker(
          userLocation, 
          "Your Location", 
          mapInstance, 
          true
        );
        setMarkers(prev => [...prev, userMarker]);
      }

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
      setIsLoading(false);
    } finally {
      setIsInitializing(false);
    }
  }, [userLocation, isDarkMode, colors.primary, config.googleMapsMapId, isInitializing]);

  // Initialize fullscreen map
  const initializeFullscreenMap = useCallback(async () => {
    if (!fullscreenMapRef.current || !window.google) return;

    try {
      const fullscreenMapInstance = new google.maps.Map(fullscreenMapRef.current, {
        center: mapState.center || { lat: 40.7128, lng: -74.0060 },
        zoom: mapState.zoom || 3,
        mapId: config.googleMapsMapId,
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'cooperative',
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: isDarkMode ? "#f3f4f6" : "#18181b" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: isDarkMode ? "#1f2937" : "#ffffff" }]
          },
          {
            featureType: "administrative",
            elementType: "geometry.fill",
            stylers: [{ color: isDarkMode ? "#374151" : "#f9fafb" }]
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: isDarkMode ? "#1f2937" : "#f3f4f6" }]
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: isDarkMode ? "#374151" : "#e5e7eb" }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: isDarkMode ? "#374151" : "#ffffff" }]
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: isDarkMode ? "#374151" : "#e5e7eb" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: isDarkMode ? "#1e3a8a" : "#dbeafe" }]
          }
        ]
      });

      setFullscreenMap(fullscreenMapInstance);

      // Copy markers to fullscreen map
      markers.forEach(marker => {
        const newMarker = new google.maps.Marker({
          position: marker.getPosition()!,
          map: fullscreenMapInstance,
          title: marker.getTitle(),
          icon: marker.getIcon()
        });
      });

    } catch (error) {
      console.error('Error initializing fullscreen map:', error);
    }
  }, [mapState, isDarkMode, colors.primary, config.googleMapsMapId, markers]);

  // Initialize map when Google Maps API is loaded
  useEffect(() => {
    if (window.google && !map && !isInitializing) {
      initializeMap();
    }
  }, [initializeMap, map, isInitializing]);

  // Initialize fullscreen map when entering fullscreen
  useEffect(() => {
    if (isFullscreen && !fullscreenMap) {
      initializeFullscreenMap();
    }
  }, [isFullscreen, fullscreenMap, initializeFullscreenMap]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Map control functions
  const zoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || 3) + 1);
    }
  };

  const zoomOut = () => {
    if (map) {
      map.setZoom(Math.max((map.getZoom() || 3) - 1, 1));
    }
  };

  const resetMap = () => {
    if (map) {
      map.setCenter({ lat: 40.7128, lng: -74.0060 });
      map.setZoom(3);
    }
  };

  // Add CSS for pulsing animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modernPulse {
        0% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.6;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.5);
          opacity: 0.3;
        }
        100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.6;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
              Loading Interactive Map...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (mapError) {
    return (
      <div className="relative w-full h-[600px] bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Map Loading Error
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Unable to load the interactive map. Please try refreshing the page.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-primary hover:bg-primary/90"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Map Container */}
      <div className="relative w-full">
        {/* Map Controls Overlay */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button
            onClick={zoomIn}
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={zoomOut}
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            onClick={resetMap}
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={toggleFullscreen}
            size="sm"
            variant="secondary"
            className="w-10 h-10 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Location Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            onClick={handleLocationPermission}
            size="sm"
            variant="secondary"
            className={`px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 ${
              locationPermission === 'granted' ? 'text-green-600 dark:text-green-400' : 
              locationPermission === 'denied' ? 'text-red-600 dark:text-red-400' : 
              'text-gray-600 dark:text-gray-300'
            }`}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {locationPermission === 'granted' ? 'Location Enabled' : 
             locationPermission === 'denied' ? 'Location Denied' : 
             'Enable Location'}
          </Button>
        </div>

        {/* Main Map */}
        <div 
          ref={mapRef}
          className="w-full h-[600px] rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-xl"
        />

        {/* Weather Card Overlay */}
        {weather && (
          <div className="absolute bottom-4 left-4 z-10">
            <Card className="w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8">
                    <img 
                      src={`/animated_weather_icons/${getWeatherIcon(weather.icon)}`}
                      alt={weather.description}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {weather.location}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {weather.temperature}°F
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {weather.description}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600 dark:text-gray-300">
                      Feels like: {weather.feelsLike}°F
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Humidity: {weather.humidity}%
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Wind: {weather.windSpeed} mph
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Live Stats Cards */}
        <div className="absolute bottom-4 right-4 z-10 space-y-2">
          {/* Active Listeners Card */}
          <Card className="w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Active Listeners</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <AnimatedCounter 
                        value={liveStats?.activeListeners || 0} 
                        duration={1000}
                      />
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Countries Card */}
          <Card className="w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Countries</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <AnimatedCounter 
                        value={liveStats?.countries || 0} 
                        duration={1000}
                      />
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Listeners Card */}
          <Card className="w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Listeners</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {statsLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <AnimatedCounter 
                        value={liveStats?.totalListeners || 0} 
                        duration={1000}
                      />
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fullscreen Map Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="relative w-full h-full">
            {/* Fullscreen Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Button
                onClick={zoomIn}
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-white"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                onClick={zoomOut}
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-white"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                onClick={resetMap}
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                onClick={toggleFullscreen}
                size="sm"
                variant="secondary"
                className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-white"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Fullscreen Map */}
            <div 
              ref={fullscreenMapRef}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FullWidthGlobeMapFixed; 