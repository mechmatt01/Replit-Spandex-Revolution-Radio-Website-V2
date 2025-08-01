import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Loader2 } from "lucide-react";
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

  // Mock live stats for Firebase hosting
  const liveStats = {
    activeListeners: 42,
    countries: 12,
    totalListeners: 156
  };

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
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationPermission('denied');
            break;
          case error.TIMEOUT:
            setLocationPermission('denied');
            break;
        }
      }
    }
  }, [map]);

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
        scale: isUserLocation ? 6 : 5, // Reduced by half
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

  // Toggle fullscreen map view with smooth animation
  const toggleFullscreen = () => {
    if (!map) return;
    
    if (!isFullscreen) {
      // Store current map state
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      setMapState({ center: currentCenter, zoom: currentZoom });
      
      // Expand to fullscreen
      setIsFullscreen(true);
      
      // Force map resize after animation completes
      setTimeout(() => {
        if (map) {
          google.maps.event.trigger(map, 'resize');
          // Restore center and zoom after resize
          if (mapState.center && mapState.zoom) {
            map.setCenter(mapState.center);
            map.setZoom(mapState.zoom);
          }
        }
      }, 400); // Match animation duration
    } else {
      // Collapse from fullscreen
      setIsFullscreen(false);
      
      // Force map resize after animation completes
      setTimeout(() => {
        if (map) {
          google.maps.event.trigger(map, 'resize');
          // Restore center and zoom after resize
          if (mapState.center && mapState.zoom) {
            map.setCenter(mapState.center);
            map.setZoom(mapState.zoom);
          }
        }
      }, 400); // Match animation duration
    }
  };

  // Initialize map
  const initializeMap = useCallback(() => {
    // Prevent multiple initializations
    if (isInitializing || map) {
      console.log('Map initialization already in progress or map exists');
      return;
    }

    const ref = mapRef.current;
    if (!ref || !config?.googleMapsApiKey) {
      console.log('Map ref or API key not available');
      return;
    }
    
    // Check if ref is a valid DOM element
    if (!(ref instanceof Element)) {
      console.error('Map ref is not a valid DOM element');
      return;
    }
    
    const rect = ref.getBoundingClientRect();
    console.log('Map ref:', ref, 'Bounding rect:', rect);
    if (rect.width < 50 || rect.height < 50) {
      setMapError(true);
      setIsLoading(false);
      return;
    }

    // Set initializing flag before any async operations
    setIsInitializing(true);
    console.log('Initializing Google Maps with API key:', config.googleMapsApiKey.substring(0, 20) + '...');

    try {
      // Check if Google Maps is properly loaded
      if (!window.google || !window.google.maps) {
        console.error('Google Maps not properly loaded');
        setIsLoading(false);
        setIsInitializing(false);
        return;
      }

      // Check if map already exists in this ref
      if (ref.querySelector('.gm-style')) {
        console.log('Map already exists in this ref');
        setIsInitializing(false);
        return;
      }

      const mapInstance = new google.maps.Map(ref, {
        zoom: 2,
        center: { lat: 20, lng: 0 },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true, // Disable all default UI controls
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        styles: isDarkMode ? [
          { elementType: "geometry", stylers: [{ color: "#212121" }] },
          { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
          { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
          { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9CA3AF" }] },
          { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
          { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#BDBDBD" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
          { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
          { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1B1B1B" }] },
          { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2C2C2C" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8A8A8A" }] },
          { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
          { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3C3C3C" }] },
          { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4E4E4E" }] },
          { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
          { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
          { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3D3D3D" }] },
          // Remove bottom right information
          { featureType: "poi.business", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "geometry", stylers: [{ visibility: "off" }] }
        ] : [
          // Light mode styles - also remove bottom right information
          { featureType: "poi.business", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "geometry", stylers: [{ visibility: "off" }] }
        ]
      });

      // Add sample listener markers with animation
      const sampleListeners = [
        { id: "1", city: "New York", country: "USA", lat: 40.7128, lng: -74.006, isActive: true },
        { id: "2", city: "London", country: "UK", lat: 51.5074, lng: -0.1278, isActive: true },
        { id: "3", city: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, isActive: true },
        { id: "4", city: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050, isActive: true },
        { id: "5", city: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194, isActive: true },
      ];

      const mapMarkers: google.maps.Marker[] = [];
      const mapInfoWindows: google.maps.InfoWindow[] = [];
      const mapPulsingOverlays: google.maps.OverlayView[] = [];

      // Add user location marker if available
      if (userLocation) {
        const userMarkerData = createAnimatedMarker(
          userLocation,
          "Your Location",
          mapInstance,
          true // isUserLocation
        );
        mapMarkers.push(userMarkerData.marker);
        mapInfoWindows.push(userMarkerData.infoWindow);
        mapPulsingOverlays.push(userMarkerData.pulsingOverlay);
      }

      // Add sample listener markers
      sampleListeners.forEach((listener) => {
        try {
          const markerData = createAnimatedMarker(
            { lat: listener.lat, lng: listener.lng },
            `${listener.city}, ${listener.country}`,
            mapInstance,
            false // Not user location
          );

          mapMarkers.push(markerData.marker);
          mapInfoWindows.push(markerData.infoWindow);
          mapPulsingOverlays.push(markerData.pulsingOverlay);
        } catch (error) {
          console.error('Error creating marker:', error);
        }
      });

      setMap(mapInstance);
      setMarkers(mapMarkers);
      setIsLoading(false);
      setIsInitializing(false);
      console.log('Google Maps initialized successfully');
      
      // Force a resize after a short delay to ensure proper rendering
      setTimeout(() => {
        if (mapInstance) {
          google.maps.event.trigger(mapInstance, 'resize');
        }
      }, 100);
    } catch (error) {
      console.error("Error initializing map:", error);
      setIsLoading(false);
      setMapError(true);
      setIsInitializing(false);
    }
  }, [config?.googleMapsApiKey, isDarkMode, colors.primary, isInitializing, map, userLocation]);

  // Load Google Maps API
  useEffect(() => {
    if (!config?.googleMapsApiKey) {
      console.log('No Google Maps API key available');
      return;
    }

    // Prevent multiple script loads
    if (window.google && window.google.maps && window.google.maps.Map) {
      console.log('Google Maps already loaded, initializing...');
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        initializeMap();
      }, 100);
      return;
    }

    // Check if script is already added
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('Google Maps script already exists, waiting for load...');
      // Wait a bit and try again
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          initializeMap();
        }
      }, 1000);
      return;
    }

    console.log('Loading Google Maps script...');
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places&callback=initMap&loading=async`;
    script.async = true;
    script.defer = true;
    
    // Create a global callback function
    (window as any).initMap = () => {
      console.log('Google Maps script loaded successfully');
      setTimeout(() => {
        initializeMap();
      }, 200);
    };
    
    script.onerror = (error) => {
      console.error('Error loading Google Maps script:', error);
      setIsLoading(false);
      setMapError(true);
      setIsInitializing(false);
    };
    
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      // Add a delay to ensure the API is fully loaded
      setTimeout(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          initializeMap();
        } else {
          console.error('Google Maps API not available after script load');
          setMapError(true);
          setIsLoading(false);
          setIsInitializing(false);
        }
      }, 500);
    };
    document.head.appendChild(script);
  }, [config, initializeMap]);

  // Map control handlers
  const handleZoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || 2) + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom((map.getZoom() || 2) - 1);
    }
  };

  const handleMyLocation = () => {
    if (map && userLocation) {
      map.setCenter(userLocation);
      map.setZoom(10);
    } else {
      handleLocationPermission();
    }
  };

  const handleReset = () => {
    if (map) {
      map.setCenter({ lat: 20, lng: 0 });
      map.setZoom(2);
    }
  };

  // Handle location permission and get user location
  const handleLocationPermission = async () => {
    try {
      console.log('Requesting location permission...');
      
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes cache
        });
      });
      
      const newUserLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      console.log('User location obtained:', newUserLocation);
      setUserLocation(newUserLocation);
      
      // Store location permission
      localStorage.setItem('locationPermission', 'granted');
      setLocationPermission('granted');
      
      // Fetch weather for user location
      await fetchWeather(newUserLocation.lat, newUserLocation.lng);
      
      // If map is already initialized, add user marker and center map
      if (map) {
        console.log('Adding user location marker to existing map...');
        const userMarkerData = createAnimatedMarker(
          newUserLocation,
          "Your Location",
          map,
          true // isUserLocation
        );
        setMarkers(prev => [...prev, userMarkerData.marker]);
        
        // Center map on user location
        map.setCenter(newUserLocation);
        map.setZoom(10);
      }
    } catch (error) {
      console.error('Error getting user location:', error);
      
      // More specific error handling
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log('User denied location access');
            localStorage.setItem('locationPermission', 'denied');
            setLocationPermission('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            console.log('Location information unavailable');
            localStorage.setItem('locationPermission', 'denied');
            setLocationPermission('denied');
            break;
          case error.TIMEOUT:
            console.log('Location request timed out');
            localStorage.setItem('locationPermission', 'denied');
            setLocationPermission('denied');
            break;
          default:
            console.log('Unknown geolocation error');
            localStorage.setItem('locationPermission', 'denied');
            setLocationPermission('denied');
            break;
        }
      } else {
        localStorage.setItem('locationPermission', 'denied');
        setLocationPermission('denied');
      }
      
      // Fallback to a default location for weather
      const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York
      await fetchWeather(defaultLocation.lat, defaultLocation.lng);
    }
  };

  if (!config) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <p className={isDarkMode ? "text-white" : "text-black"}>Loading map...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-bold mb-4">Map temporarily unavailable</p>
          <p className="text-gray-600 mb-4">Google Maps API key needs domain configuration</p>
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-400 rounded-full mb-4 flex items-center justify-center">
                <span className="text-2xl">🗺️</span>
              </div>
              <p className="text-gray-600">Interactive Map</p>
              <p className="text-sm text-gray-500">Configure API key domain restrictions</p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">To fix this:</p>
                <ol className="text-xs text-blue-700 mt-2 text-left">
                  <li>1. Go to Google Cloud Console</li>
                  <li>2. Navigate to APIs & Services &gt; Credentials</li>
                  <li>3. Find your API key and click on it</li>
                  <li>4. Add these domains to restrictions:</li>
                  <li className="ml-4">• https://spandex-salvation-radio.com/</li>
                  <li className="ml-4">• https://www.spandex-salvation-radio.com/</li>
                  <li className="ml-4">• https://spandex-salvation-radio-site.web.app/</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen Overlay Background */}
      {isFullscreen && (
        <div 
          className="fixed bg-black/60 backdrop-blur-sm z-[9998] transition-all duration-500 ease-in-out"
          style={{ 
            top: '4rem', // Below navigation bar
            bottom: '5rem', // Above floating player
            left: 0,
            right: 0,
            opacity: isFullscreen ? 1 : 0
          }}
        />
      )}

      <section className={`${isDarkMode ? "bg-black" : "bg-white"} py-20`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header - Hidden when fullscreen */}
          <div className={`text-center mb-16 transition-all duration-500 ease-in-out ${
            isFullscreen ? 'opacity-0 invisible' : 'opacity-100 visible'
          }`}>
            <h2 className={`font-orbitron font-black text-3xl md:text-4xl mb-4 ${isDarkMode ? "text-white" : "text-black"}`}>
              GLOBAL LISTENERS
            </h2>
            <p className={`text-lg font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-4`}>
              See where metal fans are tuning in from around the world in real-time.
            </p>

            {/* Modern Glass Weather Display */}
            <div className="mb-6 relative max-w-lg mx-auto">
              {/* Glass/Blur Background Container */}
              <div
                className="relative rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                  background: `linear-gradient(135deg, ${adaptiveTheme.backgroundColor}80, ${adaptiveTheme.overlayColor}60)`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `0 8px 32px ${adaptiveTheme.accentColor}20, 0 0 0 1px ${adaptiveTheme.accentColor}10`
                }}
              >
                {/* Modern Glass Enable Location Overlay - Pill-shaped covering entire location field */}
                {(locationPermission === 'denied' || locationPermission === 'prompt') && (
                  <div 
                    className="absolute inset-0 z-10 flex items-center justify-center transition-all duration-500 ease-in-out"
                    style={{
                      borderRadius: '1rem', // Match parent container rounding
                      overflow: 'hidden'
                    }}
                  >
                    <Button
                      onClick={handleLocationPermission}
                      className="w-full h-full backdrop-blur-md border-0 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:backdrop-blur-lg"
                      style={{
                        // Match floating player's glass/blur styling exactly
                        background: currentTrack?.artwork && currentTrack.artwork !== 'advertisement' && adaptiveTheme && adaptiveTheme.backgroundColor
                          ? `linear-gradient(135deg, ${adaptiveTheme.backgroundColor.replace(/[\d.]+\)$/g, '0.25)')}, ${adaptiveTheme.overlayColor.replace(/[\d.]+\)$/g, '0.15)')})`
                          : 'rgba(255, 255, 255, 0.20)',
                        backdropFilter: 'blur(32px) saturate(200%)',
                        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                        boxShadow: currentTrack?.artwork && currentTrack.artwork !== 'advertisement' && adaptiveTheme && adaptiveTheme.accentColor
                          ? `0 12px 48px ${adaptiveTheme.accentColor}25, inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)`
                          : `0 12px 48px ${colors.primary}25, inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
                        color: currentTrack?.artwork && currentTrack.artwork !== 'advertisement' && adaptiveTheme && adaptiveTheme.textColor
                          ? adaptiveTheme.textColor 
                          : colors.text,
                        borderRadius: '1rem', // Pill shape to match container
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        letterSpacing: '0.025em'
                      }}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <MapPin 
                          className="w-5 h-5" 
                          style={{ 
                            color: currentTrack?.artwork && currentTrack.artwork !== 'advertisement' && adaptiveTheme && adaptiveTheme.accentColor
                              ? adaptiveTheme.accentColor
                              : colors.primary
                          }} 
                        />
                        <span className="tracking-wide">Enable Location for Weather</span>
                      </div>
                    </Button>
                  </div>
                )}

                {/* Main Content */}
                <div className="p-6 space-y-4">
                  {/* Location Header */}
                  <div className="flex items-center justify-center gap-2">
                    <MapPin 
                      className="w-5 h-5" 
                      style={{ color: adaptiveTheme.accentColor }} 
                    />
                    <span 
                      className="text-lg font-semibold tracking-wide"
                      style={{ color: adaptiveTheme.textColor }}
                    >
                      {weather?.location || "Getting your location..."}
                    </span>
                  </div>
                  
                  {/* Weather Info */}
                  <div className="flex items-center justify-center gap-4">
                    {/* Weather Icon */}
                    {weather && (
                      <div className="flex items-center justify-center">
                        {weatherLoading ? (
                          <Loader2 
                            className="w-12 h-12 animate-spin" 
                            style={{ color: adaptiveTheme.accentColor }} 
                          />
                        ) : (
                          <div className="relative">
                            <img
                              src={`/animated_weather_icons/${getWeatherIcon(weather.icon)}`}
                              alt={weather.description}
                              className="w-16 h-16 object-contain drop-shadow-lg"
                              style={{ 
                                filter: `drop-shadow(0 4px 8px ${adaptiveTheme.accentColor}30)`
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Temperature and Description */}
                    <div className="flex flex-col items-center">
                      <span 
                        className="text-2xl font-bold tracking-tight"
                        style={{ color: adaptiveTheme.textColor }}
                      >
                        {weather ? `${Math.round(weather.temperature)}°F` : "Loading..."}
                      </span>
                      <span 
                        className="text-sm font-medium opacity-80 capitalize"
                        style={{ color: adaptiveTheme.textColor }}
                      >
                        {weather?.description || "Loading weather..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Container with smooth fullscreen transition */}
          <div 
            className={`relative transition-all duration-500 ease-in-out transform ${
              isFullscreen 
                ? 'fixed z-[9999] rounded-none' 
                : 'w-full rounded-xl shadow-2xl border-2'
            }`}
            style={{ 
              borderColor: isFullscreen ? 'transparent' : colors.primary,
              backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
              top: isFullscreen ? '0' : 'auto', // Full screen - no nav offset
              bottom: isFullscreen ? '0' : 'auto', // Full screen - no player offset
              left: isFullscreen ? '0' : 'auto',
              right: isFullscreen ? '0' : 'auto',
              height: isFullscreen ? '100vh' : '26rem', // True full screen height, slightly taller normal view to crop attribution
              width: isFullscreen ? '100vw' : 'auto',
              margin: isFullscreen ? '0' : 'auto',
              overflow: 'hidden'
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-20">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-white font-semibold">Loading Map...</p>
                </div>
              </div>
            )}
            
            {/* Map Element */}
            <div 
              ref={mapRef}
              className="w-full h-full transition-all duration-500 ease-in-out"
              style={{
                backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
                overflow: "hidden"
              }}
            />

            {/* Expand/Close Button - Always in top-left of map */}
            <Button
              onClick={toggleFullscreen}
              size="sm"
              className={`absolute ${isFullscreen ? 'top-8 left-8' : 'top-4 left-4'} z-[10000] border-0 shadow-lg transition-all duration-300 hover:scale-105 ${
                isFullscreen 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 mr-1" />
                  Close
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 mr-1" />
                  Expand
                </>
              )}
            </Button>

            {/* Map Controls - Always in top-right of map */}
            <div className={`absolute top-4 right-4 flex flex-col gap-2 z-10 transition-all duration-500 ease-in-out ${
              isFullscreen ? 'scale-110' : 'scale-100'
            }`}>
              <Button onClick={handleZoomIn} size="sm" className="p-2 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button onClick={handleZoomOut} size="sm" className="p-2 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button onClick={handleMyLocation} size="sm" className="p-2 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105">
                <MapPin className="w-4 h-4" />
              </Button>
              <Button onClick={handleReset} size="sm" className="p-2 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Weather Info - No longer in fullscreen */}
          </div>

          {/* Live Statistics & Active Locations - Hidden when fullscreen */}
          <div className={`w-full max-w-7xl mx-auto mb-8 mt-8 transition-all duration-500 ease-in-out ${
            isFullscreen ? 'opacity-0 invisible' : 'opacity-100 visible'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Live Statistics Section */}
                <Card className="backdrop-blur-xl shadow-2xl border-2 transition-all duration-300 hover:shadow-3xl"
                  style={{
                    background: isDarkMode 
                      ? `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(30,30,30,0.9) 100%)`
                      : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)`,
                    borderColor: colors.primary,
                    boxShadow: `0 0 20px ${colors.primary}20`
                  }}>
                  <CardHeader className="text-center pb-2">
                    <CardTitle 
                      className="text-2xl lg:text-3xl font-black tracking-wide"
                      style={{ 
                        color: colors.primary,
                        textShadow: isDarkMode ? `0 0 10px ${colors.primary}40` : 'none'
                      }}
                    >
                      LIVE STATISTICS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-6">
                    <div className="grid grid-cols-1 gap-6">
                      
                      {/* Active Listeners */}
                      <div className="text-center p-4 rounded-xl"
                        style={{
                          background: isDarkMode 
                            ? `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.primary}05 100%)`
                            : `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}08 100%)`,
                          border: `1px solid ${colors.primary}30`
                        }}>
                        <div className={`text-sm font-semibold mb-2 tracking-wide ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          ACTIVE LISTENERS
                        </div>
                        <AnimatedCounter
                          value={liveStats?.activeListeners || 42}
                          className="text-4xl lg:text-5xl font-black"
                          style={{ 
                            color: colors.primary,
                            textShadow: isDarkMode ? `0 2px 10px ${colors.primary}60` : `0 2px 4px ${colors.primary}30`
                          }}
                        />
                        <div className="flex justify-center mt-2">
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: colors.primary, boxShadow: `0 0 8px ${colors.primary}` }}
                          />
                        </div>
                      </div>

                      {/* Countries */}
                      <div className="text-center p-4 rounded-xl"
                        style={{
                          background: isDarkMode 
                            ? `linear-gradient(135deg, ${colors.secondary}10 0%, ${colors.secondary}05 100%)`
                            : `linear-gradient(135deg, ${colors.secondary}15 0%, ${colors.secondary}08 100%)`,
                          border: `1px solid ${colors.secondary}30`
                        }}>
                        <div className={`text-sm font-semibold mb-2 tracking-wide ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          COUNTRIES
                        </div>
                        <AnimatedCounter
                          value={liveStats?.countries || 15}
                          className="text-4xl lg:text-5xl font-black"
                          style={{ 
                            color: colors.secondary,
                            textShadow: isDarkMode ? `0 2px 10px ${colors.secondary}60` : `0 2px 4px ${colors.secondary}30`
                          }}
                        />
                        <div className="flex justify-center mt-2">
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: colors.secondary, boxShadow: `0 0 8px ${colors.secondary}` }}
                          />
                        </div>
                      </div>

                      {/* Total Listeners */}
                      <div className="text-center p-4 rounded-xl"
                        style={{
                          background: isDarkMode 
                            ? `linear-gradient(135deg, ${colors.accent}10 0%, ${colors.accent}05 100%)`
                            : `linear-gradient(135deg, ${colors.accent}15 0%, ${colors.accent}08 100%)`,
                          border: `1px solid ${colors.accent}30`
                        }}>
                        <div className={`text-sm font-semibold mb-2 tracking-wide ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          TOTAL LISTENERS
                        </div>
                        <AnimatedCounter
                          value={liveStats?.totalListeners || 1247}
                          className="text-4xl lg:text-5xl font-black"
                          style={{ 
                            color: colors.accent,
                            textShadow: isDarkMode ? `0 2px 10px ${colors.accent}60` : `0 2px 4px ${colors.accent}30`
                          }}
                        />
                        <div className="flex justify-center mt-2">
                          <div 
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: colors.accent, boxShadow: `0 0 8px ${colors.accent}` }}
                          />
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>

                {/* Active Locations Section */}
                <Card className="backdrop-blur-xl shadow-2xl border-2 transition-all duration-300 hover:shadow-3xl"
                  style={{
                    background: isDarkMode 
                      ? `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(30,30,30,0.9) 100%)`
                      : `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%)`,
                    borderColor: colors.primary,
                    boxShadow: `0 0 20px ${colors.primary}20`
                  }}>
                  <CardHeader className="pb-2">
                    <CardTitle 
                      className="text-2xl lg:text-3xl font-black tracking-wide"
                      style={{ 
                        color: colors.primary,
                        textShadow: isDarkMode ? `0 0 10px ${colors.primary}40` : 'none'
                      }}
                    >
                      ACTIVE LOCATIONS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-6">
                    <div className="space-y-3">
                      {[
                        { name: "New York, USA", listeners: 4 },
                        { name: "London, UK", listeners: 19 },
                        { name: "Tokyo, Japan", listeners: 43 },
                        { name: "Berlin, Germany", listeners: 17 },
                        { name: "San Francisco, USA", listeners: 33 },
                        { name: "Sydney, Australia", listeners: 28 }
                      ].map((location, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                          style={{
                            background: isDarkMode 
                              ? `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.primary}03 100%)`
                              : `linear-gradient(135deg, ${colors.primary}12 0%, ${colors.primary}06 100%)`,
                            border: `1px solid ${colors.primary}20`
                          }}
                        >
                          <div className="flex items-center space-x-4">
                            <div 
                              className="w-3 h-3 rounded-full animate-pulse"
                              style={{ 
                                backgroundColor: colors.primary,
                                boxShadow: `0 0 12px ${colors.primary}80`
                              }}
                            />
                            <span 
                              className="font-bold text-lg"
                              style={{ 
                                color: isDarkMode ? colors.text : colors.textSecondary,
                                textShadow: isDarkMode ? `0 1px 3px rgba(0,0,0,0.5)` : 'none'
                              }}
                            >
                              {location.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <AnimatedCounter
                              value={location.listeners}
                              className="text-xl font-black px-4 py-2 rounded-full"
                              style={{
                                backgroundColor: `${colors.primary}20`,
                                color: colors.primary,
                                textShadow: isDarkMode ? `0 0 8px ${colors.primary}40` : 'none',
                                border: `1px solid ${colors.primary}40`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FullWidthGlobeMapFixed;