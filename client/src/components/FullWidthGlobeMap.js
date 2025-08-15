import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/// <reference types="@types/google.maps" />
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
// Weather icon mapping - using correct icon names that exist in public folder
const weatherIconMap = {
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
    const mapRef = useRef(null);
    const fullscreenMapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mapError, setMapError] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [markers, setMarkers] = useState([]);
    // Weather state
    const [weather, setWeather] = useState(null);
    const [locationPermission, setLocationPermission] = useState(null);
    // Use hardcoded config for Firebase hosting
    const config = useMemo(() => ({
        googleMapsApiKey: "AIzaSyCBoEZeDucpm7p9OEDgaUGLzhn5HpItseQ",
        googleMapsSigningSecret: "",
        openWeatherApiKey: "bc23ce0746d4fc5c04d1d765589dadc5",
        googleMapsMapId: "spandex-salvation-radio-map"
    }), []);
    // Get weather icon based on OpenWeatherMap icon code
    const getWeatherIcon = useCallback((iconCode) => {
        return weatherIconMap[iconCode] || 'clear-day.svg';
    }, []);
    // Fetch weather data
    const fetchWeather = useCallback(async (lat, lng) => {
        try {
            const response = await fetch(`/api/weather?lat=${lat}&lon=${lng}`);
            if (response.ok) {
                const weatherData = await response.json();
                setWeather(weatherData);
            }
            else {
                console.error('Failed to fetch weather data');
                // Fallback to mock data
                setWeather({
                    location: "New York, NY",
                    temperature: 72,
                    description: "Partly Cloudy",
                    icon: "02d",
                    humidity: 65,
                    windSpeed: 8,
                    feelsLike: 74
                });
            }
        }
        catch (error) {
            console.error('Error fetching weather:', error);
            // Fallback to mock data
            setWeather({
                location: "New York, NY",
                temperature: 72,
                description: "Partly Cloudy",
                icon: "02d",
                humidity: 65,
                windSpeed: 8,
                feelsLike: 74
            });
        }
    }, []);
    // Sample listener data
    const sampleListeners = useMemo(() => [
        { lat: 40.7128, lng: -74.0060, city: "New York", country: "USA" },
        { lat: 51.5074, lng: -0.1278, city: "London", country: "UK" },
        { lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan" },
        { lat: 52.5200, lng: 13.4050, city: "Berlin", country: "Germany" },
        { lat: 37.7749, lng: -122.4194, city: "San Francisco", country: "USA" },
        { lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia" }
    ], []);
    // Create animated marker with pulse effect
    const createAnimatedMarker = useCallback((position, title, mapInstance, isUserLocation = false) => {
        // Create main marker
        const marker = new google.maps.Marker({
            position,
            map: mapInstance,
            title,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: isUserLocation ? 8 : 6,
                fillColor: isUserLocation ? colors.primary : '#ff4444',
                fillOpacity: 0.9,
                strokeColor: isUserLocation ? colors.primary : '#ffffff',
                strokeWeight: 2,
            },
            zIndex: isUserLocation ? 1000 : 1,
        });
        // Create pulse effect marker
        const pulse = new google.maps.Marker({
            position,
            map: mapInstance,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: isUserLocation ? 12 : 10,
                fillColor: isUserLocation ? colors.primary : '#ff4444',
                fillOpacity: 0.3,
                strokeColor: isUserLocation ? colors.primary : '#ff4444',
                strokeWeight: 1,
            },
            zIndex: isUserLocation ? 999 : 0,
        });
        // Create info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
        <div style="padding: 8px; text-align: center; font-family: Arial, sans-serif;">
          <div style="font-weight: bold; margin-bottom: 4px; color: #333;">${title}</div>
          <div style="font-size: 12px; color: #666;">
            ${isUserLocation ? 'Your Location' : 'Active Listener'}
          </div>
        </div>
      `,
        });
        // Add click event to marker
        marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
        });
        // Animate pulse effect
        const animatePulse = () => {
            let scale = isUserLocation ? 12 : 10;
            let opacity = 0.3;
            let growing = true;
            const animate = () => {
                if (growing) {
                    scale += 0.2;
                    opacity -= 0.01;
                    if (scale >= (isUserLocation ? 20 : 18)) {
                        growing = false;
                    }
                }
                else {
                    scale -= 0.2;
                    opacity += 0.01;
                    if (scale <= (isUserLocation ? 12 : 10)) {
                        growing = true;
                    }
                }
                pulse.setIcon({
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: Math.max(0, scale),
                    fillColor: isUserLocation ? colors.primary : '#ff4444',
                    fillOpacity: Math.max(0, Math.min(1, opacity)),
                    strokeColor: isUserLocation ? colors.primary : '#ff4444',
                    strokeWeight: 1,
                });
                requestAnimationFrame(animate);
            };
            animate();
        };
        animatePulse();
        return { marker, pulse, infoWindow };
    }, [colors.primary]);
    // Initialize map function wrapped in useCallback to prevent infinite loops
    const initializeMap = useCallback(() => {
        if (!mapRef.current || isInitializing || map) {
            return;
        }
        setIsInitializing(true);
        console.log('Initializing Google Maps...');
        try {
            const mapInstance = new google.maps.Map(mapRef.current, {
                center: { lat: 20, lng: 0 },
                zoom: 2,
                mapId: config.googleMapsMapId,
                // Remove styles when mapId is present to avoid the warning
                disableDefaultUI: true,
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                gestureHandling: 'greedy',
                backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            });
            // Initialize markers array
            const mapMarkers = [];
            // Add user location marker if available
            if (userLocation) {
                const userMarkerData = createAnimatedMarker(userLocation, "Your Location", mapInstance, true // isUserLocation
                );
                mapMarkers.push(userMarkerData);
            }
            // Add sample listener markers
            sampleListeners.forEach((listener) => {
                try {
                    const markerData = createAnimatedMarker({ lat: listener.lat, lng: listener.lng }, `${listener.city}, ${listener.country}`, mapInstance, false // Not user location
                    );
                    mapMarkers.push(markerData);
                }
                catch (error) {
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
        }
        catch (error) {
            console.error("Error initializing map:", error);
            setIsLoading(false);
            setMapError(true);
            setIsInitializing(false);
        }
    }, [config.googleMapsMapId, isDarkMode, userLocation, sampleListeners, isInitializing, map, createAnimatedMarker]);
    // Load Google Maps API with improved error handling
    useEffect(() => {
        if (!config?.googleMapsApiKey || map || isInitializing) {
            return;
        }
        // Prevent multiple script loads
        if (window.google && window.google.maps && window.google.maps.Map) {
            console.log('Google Maps already loaded, initializing...');
            // Add a small delay to ensure DOM is ready
            const timeoutId = setTimeout(() => {
                initializeMap();
            }, 100);
            return () => clearTimeout(timeoutId);
        }
        // Check if script is already added
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            console.log('Google Maps script already exists, waiting for load...');
            // Wait a bit and try again
            const timeoutId = setTimeout(() => {
                if (window.google && window.google.maps && window.google.maps.Map && !map) {
                    initializeMap();
                }
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
        console.log('Loading Google Maps script...');
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places&callback=initMap&loading=async`;
        script.async = true;
        script.defer = true;
        // Create a global callback function
        window.initMap = () => {
            console.log('Google Maps script loaded successfully');
            const timeoutId = setTimeout(() => {
                if (!map) {
                    initializeMap();
                }
            }, 200);
            // Store timeout ID for cleanup
            window.initMapTimeoutId = timeoutId;
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
            const timeoutId = setTimeout(() => {
                if (window.google && window.google.maps && window.google.maps.Map && !map) {
                    initializeMap();
                }
                else {
                    console.error('Google Maps API not available after script load');
                    setMapError(true);
                    setIsLoading(false);
                    setIsInitializing(false);
                }
            }, 500);
            // Store timeout ID for cleanup
            window.scriptLoadTimeoutId = timeoutId;
        };
        document.head.appendChild(script);
        // Cleanup function
        return () => {
            // Clear any pending timeouts
            if (window.initMapTimeoutId) {
                clearTimeout(window.initMapTimeoutId);
                delete window.initMapTimeoutId;
            }
            if (window.scriptLoadTimeoutId) {
                clearTimeout(window.scriptLoadTimeoutId);
                delete window.scriptLoadTimeoutId;
            }
            // Remove the global callback function
            if (window.initMap) {
                delete window.initMap;
            }
        };
    }, [config.googleMapsApiKey, map, isInitializing, initializeMap]);
    // Cleanup effect for component unmount
    useEffect(() => {
        return () => {
            // Clean up map instance
            if (map) {
                // Clear all markers
                markers.forEach(markerData => {
                    markerData.marker.setMap(null);
                    markerData.pulse.setMap(null);
                    markerData.infoWindow.close();
                });
                // Clear the map
                setMap(null);
                setMarkers([]);
            }
            // Clear any pending timeouts
            if (window.initMapTimeoutId) {
                clearTimeout(window.initMapTimeoutId);
                delete window.initMapTimeoutId;
            }
            if (window.scriptLoadTimeoutId) {
                clearTimeout(window.scriptLoadTimeoutId);
                delete window.scriptLoadTimeoutId;
            }
            // Remove the global callback function
            if (window.initMap) {
                delete window.initMap;
            }
        };
    }, [map, markers]);
    // Map control handlers
    const handleZoomIn = useCallback(() => {
        if (map) {
            map.setZoom((map.getZoom() || 2) + 1);
        }
    }, [map]);
    const handleZoomOut = useCallback(() => {
        if (map) {
            map.setZoom((map.getZoom() || 2) - 1);
        }
    }, [map]);
    const handleMyLocation = useCallback(() => {
        if (map && userLocation) {
            map.setCenter(userLocation);
            map.setZoom(10);
        }
        else {
            handleLocationPermission();
        }
    }, [map, userLocation]);
    const handleReset = useCallback(() => {
        if (map) {
            map.setCenter({ lat: 20, lng: 0 });
            map.setZoom(2);
        }
    }, [map]);
    // Handle location permission and get user location
    const handleLocationPermission = useCallback(async () => {
        try {
            console.log('Requesting location permission...');
            const position = await new Promise((resolve, reject) => {
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
                const userMarkerData = createAnimatedMarker(newUserLocation, "Your Location", map, true // isUserLocation
                );
                setMarkers(prev => [...prev, userMarkerData]);
            }
        }
        catch (error) {
            console.error('Error getting user location:', error);
            // Set a default location for testing
            const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York
            console.log('Setting default location for testing:', defaultLocation);
            setUserLocation(defaultLocation);
        }
    }, [map, createAnimatedMarker]);
    // Toggle fullscreen mode
    const toggleFullscreen = useCallback(() => {
        if (!isFullscreen) {
            setIsFullscreen(true);
            document.body.style.overflow = 'hidden';
        }
        else {
            setIsFullscreen(false);
            document.body.style.overflow = 'auto';
        }
    }, [isFullscreen]);
    if (mapError) {
        return (_jsx("div", { className: "w-full h-96 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-red-600 dark:text-red-400 text-lg font-semibold mb-2", children: "Failed to load map" }), _jsx(Button, { onClick: initializeMap, variant: "outline", className: "border-red-300 dark:border-red-700", children: "Try Again" })] }) }));
    }
    return (_jsxs(_Fragment, { children: [!isFullscreen && (_jsx("section", { className: "w-full py-8", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h2", { className: `text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-black"} drop-shadow-lg`, children: "Live Interactive Map" }), _jsx("p", { className: `text-lg ${isDarkMode ? "text-zinc-300" : "text-gray-600"} max-w-2xl mx-auto`, children: "Explore our global community of metalheads and see where the music is playing live" })] }), weather && (_jsx("div", { className: "w-full max-w-4xl mx-auto mb-8", children: _jsx(Card, { className: `${isDarkMode ? "bg-zinc-900/50" : "bg-white/90"} backdrop-blur-xl ${isDarkMode ? "border-zinc-800/50" : "border-gray-200"} shadow-2xl`, children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-center gap-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: `/animated_weather_icons/${getWeatherIcon(weather.icon)}`, alt: weather.description, className: "w-12 h-12 object-contain" }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: `text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`, children: [Math.round(weather.temperature), "\u00B0F"] }), _jsx("div", { className: `text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`, children: weather.description })] })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: `text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`, children: weather.location }), _jsxs("div", { className: `text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`, children: ["Humidity: ", weather.humidity, "% | Wind: ", weather.windSpeed, " mph"] })] })] }) }) }) })), _jsxs("div", { className: "w-full max-w-4xl mx-auto mb-8 relative", children: [isLoading && (_jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center bg-gray-900/50 rounded-xl", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "w-8 h-8 animate-spin text-white mx-auto mb-2" }), _jsx("div", { className: "text-white text-sm", children: "Loading map..." })] }) })), _jsx("div", { ref: mapRef, className: `w-full ${isFullscreen ? 'h-screen' : 'h-96 md:h-[500px] lg:h-[600px]'} rounded-2xl shadow-2xl border-2 ${isDarkMode ? 'border-zinc-800/50' : 'border-gray-200'} overflow-hidden`, style: {
                                        boxShadow: `0 25px 50px -12px ${isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.25)'}`,
                                    } }), _jsx("div", { className: "absolute top-4 left-4 flex flex-col gap-2", children: _jsx(Button, { onClick: toggleFullscreen, size: "sm", variant: "secondary", className: `${isDarkMode ? 'bg-zinc-800/80 hover:bg-zinc-700/80' : 'bg-white/80 hover:bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-300/50'} shadow-lg`, children: _jsx(Maximize2, { className: "w-4 h-4" }) }) }), _jsxs("div", { className: "absolute top-4 right-4 flex flex-col gap-2", children: [_jsx(Button, { onClick: handleZoomIn, size: "sm", variant: "secondary", className: `${isDarkMode ? 'bg-zinc-800/80 hover:bg-zinc-700/80' : 'bg-white/80 hover:bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-300/50'} shadow-lg`, children: _jsx(ZoomIn, { className: "w-4 h-4" }) }), _jsx(Button, { onClick: handleZoomOut, size: "sm", variant: "secondary", className: `${isDarkMode ? 'bg-zinc-800/80 hover:bg-zinc-700/80' : 'bg-white/80 hover:bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-300/50'} shadow-lg`, children: _jsx(ZoomOut, { className: "w-4 h-4" }) }), _jsx(Button, { onClick: handleMyLocation, size: "sm", variant: "secondary", className: `${isDarkMode ? 'bg-zinc-800/80 hover:bg-zinc-700/80' : 'bg-white/80 hover:bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-300/50'} shadow-lg`, children: _jsx(MapPin, { className: "w-4 h-4" }) }), _jsx(Button, { onClick: handleReset, size: "sm", variant: "secondary", className: `${isDarkMode ? 'bg-zinc-800/80 hover:bg-zinc-700/80' : 'bg-white/80 hover:bg-white/90'} backdrop-blur-sm border ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-300/50'} shadow-lg`, children: _jsx(RotateCcw, { className: "w-4 h-4" }) })] }), locationPermission === 'denied' && (_jsx("div", { className: "absolute bottom-4 left-4 right-4", children: _jsx(Card, { className: `${isDarkMode ? 'bg-zinc-800/90' : 'bg-white/90'} backdrop-blur-xl border ${isDarkMode ? 'border-zinc-700/50' : 'border-gray-300/50'} shadow-lg`, children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm", children: [_jsx("div", { className: `font-medium ${isDarkMode ? 'text-white' : 'text-black'}`, children: "Location access needed" }), _jsx("div", { className: `text-xs ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`, children: "Enable location to see your position on the map" })] }), _jsx(Button, { onClick: handleLocationPermission, size: "sm", variant: "outline", children: "Enable" })] }) }) }) }))] })] }) })), isFullscreen && (_jsxs("div", { className: "fixed inset-0 z-50 bg-black", children: [_jsx("div", { className: "absolute top-4 right-4 z-10", children: _jsx(Button, { onClick: toggleFullscreen, size: "sm", variant: "secondary", className: "bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-gray-300/50 shadow-lg", children: _jsx(Minimize2, { className: "w-4 h-4" }) }) }), _jsx("div", { ref: fullscreenMapRef, className: "w-full h-full" })] }))] }));
};
export default FullWidthGlobeMap;
