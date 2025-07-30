import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

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

// Weather icon mapping
const weatherIconMap: { [key: string]: string } = {
  '01d': 'clear-day.svg',
  '01n': 'clear-night.svg',
  '02d': 'partly-cloudy-day.svg',
  '02n': 'partly-cloudy-night.svg',
  '03d': 'cloudy-day-1.svg',
  '03n': 'cloudy-night-1.svg',
  '04d': 'cloudy-day-2.svg',
  '04n': 'cloudy-night-2.svg',
  '09d': 'rainy-1-day.svg',
  '09n': 'rainy-1-night.svg',
  '10d': 'rainy-2.svg',
  '10n': 'rainy-3.svg',
  '11d': 'thunder.svg',
  '11n': 'thunder.svg',
  '13d': 'snowy-1.svg',
  '13n': 'snowy-2.svg',
  '50d': 'fog.svg',
  '50n': 'fog.svg',
};

const FullWidthGlobeMapFixed = () => {
  const { isDarkMode, colors } = useTheme();
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
    // Check if we have stored location permission
    const storedPermission = localStorage.getItem('locationPermission');
    if (storedPermission) {
      setLocationPermission(storedPermission as 'granted' | 'denied');
    }

    // Try to get user location
    requestUserLocation();
  }, [requestUserLocation]);

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

  // Toggle fullscreen map view
  const toggleFullscreen = () => {
    if (!map) return;
    
    if (!isFullscreen) {
      // Store current map state
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      setMapState({ center: currentCenter, zoom: currentZoom });
      
      // Expand to fullscreen
      setIsFullscreen(true);
      
      // Force map resize after state change
      setTimeout(() => {
        if (map) {
          google.maps.event.trigger(map, 'resize');
        }
      }, 100);
    } else {
      // Restore map state
      if (mapState) {
        map.setCenter(mapState.center);
        map.setZoom(mapState.zoom);
      }
      
      // Collapse from fullscreen
      setIsFullscreen(false);
      
      // Force map resize after state change
      setTimeout(() => {
        if (map) {
          google.maps.event.trigger(map, 'resize');
        }
      }, 100);
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
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });
      
      const newUserLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      console.log('User location obtained:', newUserLocation);
      setUserLocation(newUserLocation);
      
      // If map is already initialized, add user marker
      if (map) {
        console.log('Adding user location marker to existing map...');
        const userMarkerData = createAnimatedMarker(
          newUserLocation,
          "Your Location",
          map,
          true // isUserLocation
        );
        setMarkers(prev => [...prev, userMarkerData.marker]);
        // setInfoWindows(prev => [...prev, userMarkerData.infoWindow]); // This line was removed as per the new_code
        // setPulsingOverlays(prev => [...prev, userMarkerData.pulsingOverlay]); // This line was removed as per the new_code
      }
    } catch (error) {
      console.error('Error getting user location:', error);
      // Set a default location for testing
      const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York
      console.log('Setting default location for testing:', defaultLocation);
      setUserLocation(defaultLocation);
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
      {/* Normal view container */}
      {!isFullscreen && (
        <section className={`${isDarkMode ? "bg-black" : "bg-white"} py-20`}>
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className={`font-orbitron font-black text-3xl md:text-4xl mb-4 ${isDarkMode ? "text-white" : "text-black"}`}>
                GLOBAL LISTENERS
              </h2>
              <p className={`text-lg font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-4`}>
                See where metal fans are tuning in from around the world in real-time.
              </p>

              {/* Weather Display with Animated Icons */}
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapPin className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
                  <span className={`text-lg font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {weather?.location || "Loading location..."}
                  </span>
                  {locationPermission === 'denied' && (
                    <Button
                      onClick={handleLocationPermission}
                      size="sm"
                      className="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                    >
                      Enable Location
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  {/* Weather Icon */}
                  {weather && (
                    <div className="flex items-center justify-center">
                      {weatherLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      ) : (
                        <img
                          src={`/animated_weather_icons/${getWeatherIcon(weather.icon)}`}
                          alt={weather.description}
                          className="w-12 h-12 object-contain animate-pulse"
                          style={{ filter: isDarkMode ? 'brightness(0.8)' : 'none' }}
                        />
                      )}
                    </div>
                  )}
                  
                  {/* Temperature and Description */}
                  <div className="flex flex-col items-center">
                    <span className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                      {weather ? `${Math.round(weather.temperature)}°F` : "Loading..."}
                    </span>
                    <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {weather?.description || "Loading weather..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-2xl border-2" style={{ borderColor: colors.primary }}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-20">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-white font-semibold">Loading Map...</p>
                  </div>
                </div>
              )}
              <div 
                ref={mapRef}
                className={`${
                  isFullscreen 
                    ? 'fixed inset-0 z-[99999] h-screen' 
                    : 'h-96 rounded-xl'
                } transition-all duration-500 ease-in-out`}
                style={{
                  backgroundColor: isDarkMode ? "#1f2937" : "#f9fafb",
                  overflow: "hidden"
                }}
              />

              {/* Expand/Close Button */}
              <Button
                onClick={toggleFullscreen}
                size="sm"
                className="absolute top-4 left-4 z-10 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-lg transition-all duration-300 hover:scale-105"
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

              {/* Map Controls */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
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
            </div>

            {/* Live Statistics Section */}
            <div className="w-full max-w-4xl mx-auto mb-8 mt-8">
              <Card className={`${isDarkMode ? "bg-zinc-900/50" : "bg-white/90"} backdrop-blur-xl ${isDarkMode ? "border-zinc-800/50" : "border-gray-200"} shadow-2xl`}>
                <CardHeader className="text-center">
                  <CardTitle className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`} style={{ textShadow: isDarkMode ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none' }}>
                    Live Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1 space-y-0">
                    <div className="flex-1 text-center">
                      <div className={`text-sm font-medium ${isDarkMode ? "text-zinc-400" : "text-gray-600"} mb-1`}>Active Listeners</div>
                      <div className={`text-3xl md:text-4xl lg:text-5xl font-bold ${isDarkMode ? "text-white" : "text-black"}`} style={{ textShadow: isDarkMode ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none' }}>
                        {liveStats?.activeListeners || 42}
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className={`text-sm font-medium ${isDarkMode ? "text-zinc-400" : "text-gray-600"} mb-1`}>Countries</div>
                      <div className={`text-3xl md:text-4xl lg:text-5xl font-bold ${isDarkMode ? "text-white" : "text-black"}`} style={{ textShadow: isDarkMode ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none' }}>
                        {liveStats?.countries || 15}
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className={`text-sm font-medium ${isDarkMode ? "text-zinc-400" : "text-gray-600"} mb-1`}>Total Listeners</div>
                      <div className={`text-3xl md:text-4xl lg:text-5xl font-bold ${isDarkMode ? "text-white" : "text-black"}`} style={{ textShadow: isDarkMode ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none' }}>
                        {liveStats?.totalListeners || 1247}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Locations Section */}
            <div className="w-full max-w-4xl mx-auto">
              <Card className={`${isDarkMode ? "bg-zinc-900/50" : "bg-white/90"} backdrop-blur-xl ${isDarkMode ? "border-zinc-800/50" : "border-gray-200"} shadow-2xl`}>
                <CardHeader className="text-center">
                  <CardTitle className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`} style={{ textShadow: isDarkMode ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none' }}>
                    Active Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["New York, USA", "London, UK", "Tokyo, Japan", "Berlin, Germany", "San Francisco, USA", "Sydney, Australia"].map((location, index) => (
                      <div key={index} className={`flex items-center justify-between p-4 ${isDarkMode ? "bg-zinc-800/30" : "bg-gray-100/50"} rounded-lg border ${isDarkMode ? "border-zinc-700/50" : "border-gray-300/50"}`}>
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full animate-pulse"
                            style={{
                              backgroundColor: colors.primary,
                              boxShadow: `0 0 4px ${colors.primary}`
                            }}
                          />
                          <span className={`${isDarkMode ? "text-white" : "text-black"} font-medium`}>{location}</span>
                        </div>
                        <div 
                          className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-black"}`}
                          style={{
                            textShadow: isDarkMode ? `0 0 4px ${colors.primary}` : 'none'
                          }}
                        >
                          {Math.floor(Math.random() * 50) + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Fullscreen Overlay with smooth animation */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[99999] bg-black animate-in fade-in duration-300">
          {/* Fullscreen Header with blur effect */}
          <div className="absolute top-0 left-0 right-0 z-[100000] bg-black/90 backdrop-blur-md border-b border-gray-700 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white">Live Interactive Map</h2>
                {weather && (
                  <div className="flex items-center gap-3 bg-gray-900/80 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={`/animated_weather_icons/${getWeatherIcon(weather.icon)}`}
                        alt={weather.description}
                        className="w-6 h-6 object-contain"
                      />
                      <div className="text-sm">
                        <span className="text-white font-medium">{weather.location}</span>
                        <span className="text-gray-300 ml-2">{Math.round(weather.temperature)}°F</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fullscreen Map Controls */}
          <div className="absolute top-20 right-6 z-[100001] flex flex-col gap-2 animate-in slide-in-from-right duration-300">
            <Button onClick={handleZoomIn} size="sm" className="p-3 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-xl scale-110 transition-all duration-300 hover:scale-125">
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button onClick={handleZoomOut} size="sm" className="p-3 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-xl scale-110 transition-all duration-300 hover:scale-125">
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button onClick={handleMyLocation} size="sm" className="p-3 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-xl scale-110 transition-all duration-300 hover:scale-125">
              <MapPin className="w-5 h-5" />
            </Button>
            <Button onClick={handleReset} size="sm" className="p-3 bg-gray-800 hover:bg-gray-700 text-white border-0 shadow-xl scale-110 transition-all duration-300 hover:scale-125">
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default FullWidthGlobeMapFixed;