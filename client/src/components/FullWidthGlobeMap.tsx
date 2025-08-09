
/// <reference types="@types/google.maps" />
declare global {
  interface Window {
    google: typeof google;
  }
}

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

interface MarkerData {
  marker: google.maps.Marker;
  pulse: google.maps.Marker;
  infoWindow: google.maps.InfoWindow;
}

// Weather icon mapping - using correct icon names that exist in public folder
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
  '10d': 'rainy.svg',
  '10n': 'rainy.svg',
  '11d': 'thunder.svg',
  '11n': 'thunder.svg',
  '13d': 'snowy.svg',
  '13n': 'snowy.svg',
  '50d': 'fog.svg',
  '50n': 'fog.svg',
};

const FullWidthGlobeMap = () => {
  const { isDarkMode, colors } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const fullscreenMapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  
  // Weather state
  const [weather, setWeather] = useState<Weather | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | null>(null);

  // Use hardcoded config for Firebase hosting
  const config: Config = {
    googleMapsApiKey: "AIzaSyCBoEZeDucpm7p9OEDgaUGLzhn5HpItseQ",
    googleMapsSigningSecret: "",
    openWeatherApiKey: "bc23ce0746d4fc5c04d1d765589dadc5",
    googleMapsMapId: "spandex-salvation-radio-map"
  };

  // Get weather icon based on OpenWeatherMap icon code
  const getWeatherIcon = (iconCode: string): string => {
    return weatherIconMap[iconCode] || 'clear-day.svg';
  };

  // Fetch weather data
  const fetchWeather = async (lat: number, lng: number) => {
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
    }
  };

  // Create animated marker with pulse effect
  const createAnimatedMarker = (position: google.maps.LatLngLiteral, title: string, mapInstance: google.maps.Map, isUserLocation: boolean = false): MarkerData => {
    // Create the main marker
    const marker = new google.maps.Marker({
      position,
      map: mapInstance,
      title,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: isUserLocation ? 12 : 10,
        fillColor: isUserLocation ? '#4285F4' : colors.primary,
        fillOpacity: 0.8,
        strokeColor: 'white',
        strokeWeight: 2,
      },
    });

    // Create pulsing overlay
    const pulse = new google.maps.Marker({
      position,
      map: mapInstance,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: (isUserLocation ? 12 : 10) * 1.5,
        fillColor: isUserLocation ? '#4285F4' : colors.primary,
        fillOpacity: 0.3,
        strokeColor: 'transparent',
        strokeWeight: 0,
      },
    });

    // Animate the pulse
    let scale = 1;
    let opacity = 0.3;
    const animatePulse = () => {
      scale += 0.1;
      opacity -= 0.01;
      
      if (scale > 2) {
        scale = 1;
        opacity = 0.3;
      }
      
      pulse.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: (isUserLocation ? 12 : 10) * scale,
        fillColor: isUserLocation ? '#4285F4' : colors.primary,
        fillOpacity: opacity,
        strokeColor: 'transparent',
        strokeWeight: 0,
      });
      
      requestAnimationFrame(animatePulse);
    };
    
    animatePulse();

    // Create info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-3 bg-white rounded-lg shadow-lg border border-gray-200">
          <h3 class="font-bold text-gray-800 mb-2">${title}</h3>
          <p class="text-sm text-gray-600">Click to see details</p>
        </div>
      `,
      maxWidth: 200,
    });

    // Add click listener
    marker.addListener('click', () => {
      infoWindow.open(mapInstance, marker);
    });

    // Store references for cleanup
    return { marker, pulse, infoWindow };
  };

  // Initialize map with improved error handling
  const initializeMap = useCallback(async () => {
    if (isInitializing || !mapRef.current) {
      return;
    }

    setIsInitializing(true);
    setMapError(false);

    try {
      if (!window.google || !window.google.maps) {
        throw new Error('Google Maps not loaded');
      }

      // Sample listener data
      const sampleListeners = [
        { lat: 40.7128, lng: -74.0060, city: "New York", country: "USA" },
        { lat: 51.5074, lng: -0.1278, city: "London", country: "UK" },
        { lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan" },
        { lat: 52.5200, lng: 13.4050, city: "Berlin", country: "Germany" },
        { lat: 37.7749, lng: -122.4194, city: "San Francisco", country: "USA" },
        { lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia" }
      ];

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapId: config.googleMapsMapId,
        styles: isDarkMode ? [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ] : [],
        disableDefaultUI: true,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      });

      // Initialize markers array
      const mapMarkers: MarkerData[] = [];

      // Add user location marker if available
      if (userLocation) {
        const userMarkerData = createAnimatedMarker(
          userLocation,
          "Your Location",
          mapInstance,
          true // isUserLocation
        );
        mapMarkers.push(userMarkerData);
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

          mapMarkers.push(markerData);
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
  }, [config?.googleMapsApiKey, isDarkMode, colors.primary, isInitializing, userLocation]);

  // Load Google Maps API with improved error handling
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
        setMarkers(prev => [...prev, userMarkerData]);
      }
    } catch (error) {
      console.error('Error getting user location:', error);
      // Set a default location for testing
      const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York
      console.log('Setting default location for testing:', defaultLocation);
      setUserLocation(defaultLocation);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsFullscreen(false);
      document.body.style.overflow = 'auto';
    }
  };

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markers.forEach((markerData) => {
        markerData.marker.setMap(null);
        markerData.pulse.setMap(null);
        markerData.infoWindow.close();
      });
    };
  }, [markers]);

  if (mapError) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
            Failed to load map
          </div>
          <Button onClick={initializeMap} variant="outline" className="border-red-300 dark:border-red-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isFullscreen && (
        <section className="w-full py-8">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-black"} drop-shadow-lg`}>
                Live Interactive Map
              </h2>
              <p className={`text-lg ${isDarkMode ? "text-zinc-300" : "text-gray-600"} max-w-2xl mx-auto`}>
                Explore our global community of metalheads and see where the music is playing live
              </p>
            </div>

            {/* Weather Display */}
            {weather && (
              <div className="w-full max-w-4xl mx-auto mb-8">
                <Card className={`${isDarkMode ? "bg-zinc-900/50" : "bg-white/90"} backdrop-blur-xl ${isDarkMode ? "border-zinc-800/50" : "border-gray-200"} shadow-2xl`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={`/animated_weather_icons/${getWeatherIcon(weather.icon)}`}
                          alt={weather.description}
                          className="w-12 h-12 object-contain"
                        />
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                            {Math.round(weather.temperature)}°F
                          </div>
                          <div className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
                            {weather.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                          {weather.location}
                        </div>
                        <div className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}>
                          Humidity: {weather.humidity}% | Wind: {weather.windSpeed} mph
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Map Container */}
            <div className="w-full max-w-4xl mx-auto mb-8 relative">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/50 rounded-xl">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
                    <div className="text-white text-sm">Loading map...</div>
                  </div>
                </div>
              )}

              <div
                ref={mapRef}
                className={`w-full ${
                  isFullscreen ? 'h-screen' : 'h-96 md:h-[500px] lg:h-[600px]'
                } rounded-xl shadow-2xl border-2 ${
                  isDarkMode ? 'border-zinc-800/50' : 'border-gray-200'
                }`}
              />

              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                  onClick={handleZoomIn}
                  size="sm"
                  variant="secondary"
                  className={`${isDarkMode ? 'bg-zinc-800/80 hover:bg-zinc-700/80' : 'bg-white/80 hover:bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-300/50'} shadow-lg`}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleZoomOut}
                  size="sm"
                  variant="secondary"
                  className={`${isDarkMode ? 'bg-zinc-800/80 hover:bg-zinc-700/80' : 'bg-white/80 hover:bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-300/50'} shadow-lg`}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleMyLocation}
                  size="sm"
                  variant="secondary"
                  className={`${isDarkMode ? 'bg-zinc-800/80 hover:bg-zinc-700/80' : 'bg-white/80 hover:bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-300/50'} shadow-lg`}
                >
                  <MapPin className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleReset}
                  size="sm"
                  variant="secondary"
                  className={`${isDarkMode ? 'bg-zinc-800/80 hover:bg-zinc-700/80' : 'bg-white/80 hover:bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-300/50'} shadow-lg`}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  onClick={toggleFullscreen}
                  size="sm"
                  variant="secondary"
                  className={`${isDarkMode ? 'bg-zinc-800/80 hover:bg-zinc-700/80' : 'bg-white/80 hover:bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-300/50'} shadow-lg`}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Location Permission Request */}
              {locationPermission === 'denied' && (
                <div className="absolute bottom-4 left-4 right-4">
                  <Card className={`${isDarkMode ? 'bg-zinc-800/90' : 'bg-white/90'} backdrop-blur-xl border ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-300/50'} shadow-lg`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                            Location access needed
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
                            Enable location to see your position on the map
                          </div>
                        </div>
                        <Button onClick={handleLocationPermission} size="sm" variant="outline">
                          Enable
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Active Locations Section */}
            <div className="w-full max-w-4xl mx-auto">
              <Card className={`${isDarkMode ? "bg-zinc-900/50" : "bg-white/90"} backdrop-blur-xl ${isDarkMode ? "border-zinc-800/50" : "border-gray-200"} shadow-2xl`}>
                <CardHeader className="text-center">
                  <CardTitle className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"} drop-shadow-md`}>
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
                            textShadow: `0 0 4px ${colors.primary}`
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

      {/* Fullscreen Map */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="absolute top-4 right-4 z-10">
            <Button
              onClick={toggleFullscreen}
              size="sm"
              variant="secondary"
              className="bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-gray-300/50 shadow-lg"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
          <div
            ref={fullscreenMapRef}
            className="w-full h-full"
          />
        </div>
      )}
    </>
  );
};

export default FullWidthGlobeMap;
