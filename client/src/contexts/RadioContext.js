import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useRef, useEffect, useCallback, } from "react";
import { useFirebaseAuth } from "./FirebaseAuthContext";
import { useToast } from "../hooks/use-toast";
const RadioContext = createContext(undefined);
// Helper function to get default artwork URLs
function getDefaultArtwork(title, artist) {
    const artworkMap = {
        "Youth Gone Wild": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        "18 and Life": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        "I Remember You": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        "Master of Puppets": "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        "Ace of Spades": "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        "Breaking the Law": "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    };
    // Return specific artwork for known tracks, or a generic metal concert image
    return (artworkMap[title] ||
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400");
}
export function RadioProvider({ children }) {
    const { updateListeningStatus } = useFirebaseAuth();
    const { toast } = useToast();
    // Debug mode - get from localStorage to avoid context issues
    const [isDebugMode, setIsDebugMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('debug-mode');
            return saved ? JSON.parse(saved) : false;
        }
        return false;
    });
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolumeState] = useState(() => {
        // Load volume from localStorage or default to 0.7
        if (typeof window !== 'undefined') {
            const savedVolume = localStorage.getItem('radio-volume');
            return savedVolume ? parseFloat(savedVolume) : 0.7;
        }
        return 0.7;
    });
    const [isMuted, setIsMuted] = useState(() => {
        // Load muted state from localStorage or default to false
        if (typeof window !== 'undefined') {
            const savedMuted = localStorage.getItem('radio-muted');
            return savedMuted === 'true';
        }
        return false;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentStation, setCurrentStation] = useState({
        id: "hot-97",
        stationId: "hot-97",
        name: "Hot 97",
        frequency: "97.1 FM",
        location: "New York, NY",
        genre: "Hip Hop & R&B",
        streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac",
        description: "New York's #1 Hip Hop & R&B",
        icon: "🔥",
    });
    const [currentTrack, setCurrentTrack] = useState({
        title: "Hot 97",
        artist: "New York's Hip Hop & Urban Contemporary",
        album: "97.1 FM • New York, NY",
        artwork: "",
        isAd: false,
        stationName: "Hot 97",
        frequency: "97.1 FM",
        location: "New York, NY",
        genre: "Hip Hop & Urban Contemporary",
        lastUpdated: new Date(),
    });
    const [isAdPlaying, setIsAdPlaying] = useState(false);
    const [adInfo, setAdInfo] = useState({});
    const [metadataPollingInterval, setMetadataPollingInterval] = useState(null);
    const [stationName, setStationName] = useState("Hot 97");
    const [prevTrack, setPrevTrack] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const audioRef = useRef(null);
    const retryCountRef = useRef(0);
    const maxRetries = 3;
    // Get stream URLs for a station
    const getStreamUrls = (station) => {
        if (!station)
            return [];
        const baseUrl = station.streamUrl;
        // Use the radio proxy to avoid CORS issues
        const proxyUrl = `/api/radio-stream?url=${encodeURIComponent(baseUrl)}`;
        // Return both proxy and direct URLs as fallback
        return [proxyUrl, baseUrl];
    };
    const startPlayback = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio)
            return;
        // Prevent multiple simultaneous playback attempts
        if (isLoading) {
            console.log('Playback already in progress, skipping...');
            return;
        }
        setIsLoading(true);
        setError(null);
        // Try multiple stream formats
        let streamWorked = false;
        const streamUrls = getStreamUrls(currentStation);
        if (!streamUrls || (streamUrls?.length || 0) === 0) {
            throw new Error("No stream URLs available");
        }
        for (let i = 0; i < (streamUrls?.length || 0); i++) {
            try {
                const url = streamUrls[i];
                console.log(`Trying radio stream ${i + 1}: ${url}`);
                // Reset audio element
                audio.pause();
                audio.currentTime = 0;
                audio.src = url;
                audio.load();
                // Wait for the audio to be ready with optimized timeout
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error("Stream loading timeout"));
                    }, 3000); // Faster timeout for quicker retry
                    const onCanPlay = () => {
                        clearTimeout(timeout);
                        cleanup();
                        resolve(true);
                    };
                    const onError = () => {
                        clearTimeout(timeout);
                        cleanup();
                        reject(new Error("Stream loading error"));
                    };
                    const cleanup = () => {
                        audio.removeEventListener('canplaythrough', onCanPlay);
                        audio.removeEventListener('loadeddata', onCanPlay);
                        audio.removeEventListener('error', onError);
                    };
                    // Listen to both canplaythrough and loadeddata for faster response
                    audio.addEventListener('canplaythrough', onCanPlay);
                    audio.addEventListener('loadeddata', onCanPlay);
                    audio.addEventListener('error', onError);
                });
                // Check if user has interacted with the page before attempting to play
                if (document.visibilityState === 'visible' && !document.hidden) {
                    try {
                        // Ensure audio is ready before attempting to play
                        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
                            const playPromise = audio.play();
                            if (playPromise !== undefined) {
                                await playPromise;
                                streamWorked = true;
                                retryCountRef.current = 0; // Reset retry count on success
                                console.log(`Stream ${i + 1} connected successfully`);
                                break;
                            }
                        }
                        else {
                            console.log('Audio not ready, waiting for canplay event...');
                            // Wait for canplay event
                            await new Promise((resolve, reject) => {
                                const timeout = setTimeout(() => {
                                    reject(new Error("Audio ready timeout"));
                                }, 5000);
                                const onCanPlay = () => {
                                    clearTimeout(timeout);
                                    cleanup();
                                    resolve(true);
                                };
                                const onError = () => {
                                    clearTimeout(timeout);
                                    cleanup();
                                    reject(new Error("Audio ready error"));
                                };
                                const cleanup = () => {
                                    audio.removeEventListener('canplay', onCanPlay);
                                    audio.removeEventListener('error', onError);
                                };
                                audio.addEventListener('canplay', onCanPlay);
                                audio.addEventListener('error', onError);
                            });
                            // Try to play again after waiting
                            const playPromise = audio.play();
                            if (playPromise !== undefined) {
                                await playPromise;
                                streamWorked = true;
                                retryCountRef.current = 0;
                                console.log(`Stream ${i + 1} connected successfully after waiting`);
                                break;
                            }
                        }
                    }
                    catch (playError) {
                        console.warn(`Play attempt ${i + 1} failed:`, playError);
                        if (playError.name === 'NotAllowedError') {
                            throw new Error("Autoplay not allowed. Please click the play button.");
                        }
                        continue; // Try next stream URL
                    }
                }
                else {
                    console.log('Page not visible, skipping play attempt');
                    continue;
                }
            }
            catch (error) {
                console.warn(`Stream ${i + 1} failed:`, error);
                if (i === (streamUrls?.length || 0) - 1) {
                    // Last stream failed, throw error
                    throw error;
                }
                continue; // Try next stream URL
            }
        }
        if (!streamWorked) {
            throw new Error("All stream URLs failed");
        }
    }, [isLoading, currentStation]);
    const handlePlaybackError = useCallback((error) => {
        console.error("Playback error:", error);
        setIsLoading(false);
        setIsPlaying(false);
        let errorMessage = "Playback failed";
        if (error?.name === 'NotAllowedError') {
            errorMessage = "Autoplay not allowed. Please click the play button.";
        }
        else if (error?.message?.includes('timeout')) {
            errorMessage = "Connection timeout. Please try again.";
        }
        else if (error?.message?.includes('CORS')) {
            errorMessage = "Stream access denied. Please try again.";
        }
        else if (error?.message) {
            errorMessage = error.message;
        }
        setError(errorMessage);
        if (isDebugMode) {
            toast({
                title: "Playback Error",
                description: errorMessage,
                variant: "error",
            });
        }
        // Increment retry count
        retryCountRef.current += 1;
        // Auto-retry if under max retries
        if (retryCountRef.current < maxRetries) {
            console.log(`Auto-retrying playback (${retryCountRef.current}/${maxRetries})...`);
            setTimeout(() => {
                if (!isPlaying && !isLoading) {
                    startPlayback().catch(console.error);
                }
            }, 2000 * retryCountRef.current); // Exponential backoff
        }
    }, [isDebugMode, toast, isPlaying, isLoading, startPlayback]);
    const setVolume = useCallback((newVolume) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolumeState(clampedVolume);
        // Update audio element volume
        const audio = audioRef.current;
        if (audio) {
            audio.volume = isMuted ? 0 : clampedVolume;
        }
        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('radio-volume', clampedVolume.toString());
        }
    }, [isMuted]);
    const toggleMute = useCallback(() => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        // Update audio element volume
        const audio = audioRef.current;
        if (audio) {
            audio.volume = newMuted ? 0 : volume;
        }
        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('radio-muted', newMuted.toString());
        }
    }, [isMuted, volume]);
    const changeStation = useCallback(async (station) => {
        console.log(`[RadioContext] Changing station to: ${station.name}`);
        // Stop current playback
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.src = '';
        }
        // Reset state
        setIsPlaying(false);
        setIsLoading(false);
        setError(null);
        retryCountRef.current = 0;
        // Update station
        setCurrentStation(station);
        setStationName(station.name);
        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('last-selected-station', station.id);
        }
        // Start playback for new station
        try {
            await startPlayback();
        }
        catch (error) {
            console.error('[RadioContext] Failed to start playback for new station:', error);
            // Don't throw here, let the user manually start playback
        }
    }, [startPlayback]);
    // Audio event handlers
    const handlePlay = useCallback(async () => {
        console.log("Audio play event triggered");
        setIsPlaying(true);
        setIsLoading(false);
        setError(null);
        // Update listening status to true when user starts playing
        try {
            await updateListeningStatus(true);
            if (isDebugMode) {
                toast({
                    title: "Now Playing",
                    description: `You're now listening to ${currentStation?.name || 'Spandex Salvation Radio'}`,
                    variant: "default",
                });
            }
        }
        catch (error) {
            console.error('Error updating listening status:', error);
            if (isDebugMode) {
                toast({
                    title: "Status Update Failed",
                    description: "Failed to update listening status",
                    variant: "error",
                });
            }
        }
    }, [updateListeningStatus, isDebugMode, toast, currentStation?.name]);
    const handlePause = useCallback(async () => {
        console.log("Audio pause event triggered");
        setIsPlaying(false);
        setIsLoading(false);
        // Update listening status to false when user pauses
        try {
            await updateListeningStatus(false);
            if (isDebugMode) {
                toast({
                    title: "Playback Stopped",
                    description: "Playback has been stopped",
                    variant: "default",
                });
            }
        }
        catch (error) {
            console.error('Error updating listening status:', error);
            if (isDebugMode) {
                toast({
                    title: "Status Update Failed",
                    description: "Failed to update listening status",
                    variant: "error",
                });
            }
        }
    }, [updateListeningStatus, isDebugMode, toast]);
    const handleLoadStart = useCallback(() => {
        console.log("Audio loadstart event triggered");
        setIsLoading(true);
        setError(null);
    }, []);
    const handleCanPlay = useCallback(() => {
        console.log("Audio canplay event triggered");
        // Don't set loading to false here, wait for play event
    }, []);
    const handleCanPlayThrough = useCallback(() => {
        console.log("Audio canplaythrough event triggered");
        // Don't set loading to false here, wait for play event
    }, []);
    const handleError = useCallback((e) => {
        console.error("Audio error:", e);
        setIsLoading(false);
        setIsPlaying(false);
        const audio = audioRef.current;
        if (audio && audio.src && !audio.paused) {
            setError("Unable to connect to radio stream");
            if (isDebugMode) {
                toast({
                    title: "Connection Error",
                    description: "Unable to connect to radio stream",
                    variant: "error",
                });
            }
        }
    }, [isDebugMode, toast]);
    const handleStalled = useCallback(() => {
        console.log("Audio stalled event triggered");
        // Keep loading state if stalled
    }, []);
    const handleWaiting = useCallback(() => {
        console.log("Audio waiting event triggered");
        setIsLoading(true);
    }, []);
    // Set up audio event listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio)
            return;
        // Prevent multiple initializations
        if (audio.dataset.initialized === 'true')
            return;
        audio.dataset.initialized = 'true';
        audio.volume = isMuted ? 0 : volume;
        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("loadstart", handleLoadStart);
        audio.addEventListener("canplay", handleCanPlay);
        audio.addEventListener("canplaythrough", handleCanPlayThrough);
        audio.addEventListener("error", handleError);
        audio.addEventListener("stalled", handleStalled);
        audio.addEventListener("waiting", handleWaiting);
        return () => {
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("loadstart", handleLoadStart);
            audio.removeEventListener("canplay", handleCanPlay);
            audio.removeEventListener("canplaythrough", handleCanPlayThrough);
            audio.removeEventListener("error", handleError);
            audio.removeEventListener("stalled", handleStalled);
            audio.removeEventListener("waiting", handleWaiting);
        };
    }, [volume, isMuted, handlePlay, handlePause, handleLoadStart, handleCanPlay, handleCanPlayThrough, handleError, handleStalled, handleWaiting]);
    // Auto-play first station on mount (try immediately, then fallback to user interaction)
    useEffect(() => {
        let isInitialized = false;
        const tryImmediateAutoPlay = async () => {
            if (isInitialized)
                return;
            isInitialized = true;
            try {
                if (!isPlaying && !error && currentStation) {
                    console.log("[RadioContext] Attempting immediate auto-play on mount.");
                    await startPlayback();
                }
            }
            catch (error) {
                console.log("[RadioContext] Immediate auto-play failed, will wait for user interaction.");
            }
        };
        const initializeAutoPlay = async () => {
            // Try immediate auto-play first
            await tryImmediateAutoPlay();
            // If immediate auto-play fails, set up user interaction listener
            const handleFirstInteraction = async () => {
                try {
                    if (!isPlaying && !error && currentStation) {
                        console.log("[RadioContext] User interaction detected, attempting auto-play.");
                        await startPlayback();
                    }
                }
                catch (error) {
                    console.error("[RadioContext] Auto-play on user interaction failed:", error);
                }
                // Remove the listener after first interaction
                document.removeEventListener('click', handleFirstInteraction);
                document.removeEventListener('keydown', handleFirstInteraction);
                document.removeEventListener('touchstart', handleFirstInteraction);
            };
            // Add listeners for user interaction
            document.addEventListener('click', handleFirstInteraction, { once: true });
            document.addEventListener('keydown', handleFirstInteraction, { once: true });
            document.addEventListener('touchstart', handleFirstInteraction, { once: true });
        };
        initializeAutoPlay();
    }, []);
    // Auto-play functionality - simplified to prevent conflicts
    useEffect(() => {
        let isInitialized = false;
        const initializeAutoPlay = async () => {
            if (isInitialized)
                return;
            isInitialized = true;
            try {
                // Check if user has previously selected a station
                const lastStationId = localStorage.getItem('last-selected-station');
                const shouldAutoPlay = localStorage.getItem('auto-play-enabled') !== 'false';
                if (shouldAutoPlay && currentStation && !isPlaying) {
                    console.log('[RadioContext] Auto-playing station:', currentStation.name);
                    // Small delay to ensure everything is loaded
                    setTimeout(async () => {
                        if (!isPlaying && !isInitialized) {
                            try {
                                await startPlayback();
                            }
                            catch (error) {
                                console.error('[RadioContext] Auto-play failed:', error);
                            }
                        }
                    }, 1000);
                }
            }
            catch (error) {
                console.error('[RadioContext] Auto-play initialization error:', error);
            }
        };
        // Initialize auto-play after a short delay
        const timer = setTimeout(initializeAutoPlay, 2000);
        return () => {
            clearTimeout(timer);
            isInitialized = true;
        };
    }, [currentStation]);
    // Save last selected station
    useEffect(() => {
        if (currentStation) {
            localStorage.setItem('last-selected-station', currentStation.id);
        }
    }, [currentStation]);
    // Track information - show station info only when NOT playing or as initial state
    useEffect(() => {
        if (!isPlaying) {
            // When stopped, show station name
            setCurrentTrack({
                title: stationName || (currentStation?.name || "Spandex Salvation Radio"),
                artist: "",
                album: "",
                artwork: "",
            });
        }
        // Note: When playing, live metadata fetching will handle track updates
    }, [isPlaying, stationName, currentStation]);
    // Metadata polling function
    const fetchLiveMetadata = useCallback(async (station) => {
        if (!station || !isPlaying)
            return;
        console.log(`[RadioContext] Fetching metadata for station: ${station.name} (${station.id})`);
        try {
            // Use the correct now-playing endpoint with station parameter
            const metadataEndpoint = `/api/now-playing?station=${station.stationId || station.id}`;
            console.log(`[RadioContext] Calling metadata endpoint: ${metadataEndpoint}`);
            const response = await fetch(metadataEndpoint);
            console.log(`[RadioContext] Metadata response status: ${response.status}`);
            const contentType = response.headers.get("content-type");
            console.log(`[RadioContext] Metadata response content-type: ${contentType}`);
            if (!response.ok) {
                console.warn(`[RadioContext] Metadata endpoint returned error: ${response.status} ${response.statusText}`);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            if (!contentType || !contentType.includes("application/json")) {
                console.warn("[RadioContext] Metadata endpoint did not return JSON:", metadataEndpoint);
                // Fallback to static metadata
                const fallbackTrack = {
                    title: station.name,
                    artist: station.description,
                    album: `${station.frequency} • ${station.location}`,
                    artwork: getDefaultArtwork(station.name, station.description),
                    isAd: false,
                    stationName: station.name,
                    frequency: station.frequency,
                    location: station.location,
                    genre: station.genre,
                    lastUpdated: new Date(),
                };
                setCurrentTrack(fallbackTrack);
                console.log(`[RadioContext] Using fallback metadata: "${fallbackTrack.title}" by ${fallbackTrack.artist}`);
                return;
            }
            const metadata = await response.json();
            console.log(`[RadioContext] Received metadata:`, metadata);
            const newTrackInfo = {
                title: metadata.title || station.name,
                artist: metadata.artist || station.description,
                album: metadata.album || `${station.frequency} • ${station.location}`,
                artwork: metadata.artwork || getDefaultArtwork(metadata.title || station.name, metadata.artist || station.description),
                isAd: metadata.isAd || false,
                adCompany: metadata.adCompany,
                adReason: metadata.adReason,
                stationName: station.name,
                frequency: station.frequency,
                location: station.location,
                genre: station.genre,
                lastUpdated: new Date(),
            };
            // Update track info
            setCurrentTrack(newTrackInfo);
            // Update ad detection state
            setIsAdPlaying(metadata.isAd || false);
            setAdInfo({
                company: metadata.adCompany,
                reason: metadata.adReason,
                artwork: metadata.isAd ? metadata.artwork : undefined,
            });
            console.log(`[RadioContext] Live metadata updated: "${newTrackInfo.title}" by ${newTrackInfo.artist}${newTrackInfo.isAd ? ' (Advertisement)' : ''}`);
            if (newTrackInfo.isAd) {
                console.log(`[RadioContext] Ad detected: ${newTrackInfo.adCompany || 'Unknown Company'} - ${newTrackInfo.adReason || 'Various indicators'}`);
            }
        }
        catch (error) {
            console.error('[RadioContext] Failed to fetch live metadata:', error);
            // Use fallback metadata when server is unavailable
            const fallbackTrack = {
                title: station.name,
                artist: station.description,
                album: `${station.frequency} • ${station.location}`,
                artwork: getDefaultArtwork(station.name, station.description),
                isAd: false,
                stationName: station.name,
                frequency: station.frequency,
                location: station.location,
                genre: station.genre,
                lastUpdated: new Date(),
            };
            setCurrentTrack(fallbackTrack);
            console.log(`[RadioContext] Using fallback metadata due to error: "${fallbackTrack.title}" by ${fallbackTrack.artist}`);
        }
    }, [isPlaying]);
    // Start metadata polling when playing
    useEffect(() => {
        if (isPlaying && currentStation) {
            // Initial fetch
            fetchLiveMetadata(currentStation);
            // Set up polling interval (every 10 seconds)
            const interval = setInterval(() => {
                fetchLiveMetadata(currentStation);
            }, 10000);
            setMetadataPollingInterval(interval);
            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            };
        }
        else {
            // Clear interval when not playing
            if (metadataPollingInterval) {
                clearInterval(metadataPollingInterval);
                setMetadataPollingInterval(null);
            }
        }
    }, [isPlaying, currentStation, fetchLiveMetadata]);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (metadataPollingInterval) {
                clearInterval(metadataPollingInterval);
            }
        };
    }, [metadataPollingInterval]);
    const togglePlayback = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio)
            return;
        try {
            if (isPlaying) {
                audio.pause();
                setError(null);
                retryCountRef.current = 0;
            }
            else {
                await startPlayback();
            }
        }
        catch (error) {
            console.error("Playback toggle error:", error);
            handlePlaybackError(error);
        }
    }, [isPlaying, startPlayback, handlePlaybackError]);
    // setCurrentTrack is already stable from useState, no need for useCallback
    const value = {
        isPlaying,
        volume,
        isMuted,
        isLoading,
        error,
        currentTrack,
        currentStation,
        stationName,
        isTransitioning,
        isAdPlaying,
        adInfo,
        togglePlayback,
        setVolume,
        toggleMute,
        changeStation,
        setCurrentTrack,
        audioRef,
    };
    return (_jsxs(RadioContext.Provider, { value: value, children: [_jsx("audio", { ref: audioRef, preload: "none", crossOrigin: "anonymous", "aria-label": "Live radio stream", style: { display: 'none' } }), children] }));
}
export function useRadio() {
    const context = useContext(RadioContext);
    if (context === undefined) {
        throw new Error("useRadio must be used within a RadioProvider");
    }
    return context;
}
