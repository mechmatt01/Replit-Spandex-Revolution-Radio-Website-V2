import { createContext, useContext, useState, useRef, useEffect, } from "react";
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
        id: "beat-955",
        name: "95.5 The Beat",
        frequency: "95.5 FM",
        location: "Dallas, TX",
        genre: "Hip Hop & R&B",
        streamUrl: "https://24883.live.streamtheworld.com/KBFBFMAAC",
        description: "Dallas Hip Hop & R&B",
        icon: "🎵",
    });
    const [currentTrack, setCurrentTrack] = useState({
        title: "95.5 The Beat",
        artist: "Dallas Hip Hop & R&B",
        album: "95.5 FM • Dallas, TX",
        artwork: "",
    });
    const [stationName, setStationName] = useState("95.5 The Beat");
    const [prevTrack, setPrevTrack] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const audioRef = useRef(null);
    const streamUrls = [
        "/api/radio-stream",
        "https://ice1.somafm.com/metal-128-mp3",
    ];
    const togglePlayback = async () => {
        const audio = audioRef.current;
        if (!audio)
            return;
        try {
            if (isPlaying) {
                audio.pause();
                setError(null);
            }
            else {
                setIsLoading(true);
                setError(null);
                // Try multiple stream formats
                let streamWorked = false;
                for (let i = 0; i < streamUrls.length; i++) {
                    try {
                        const url = streamUrls[i];
                        console.log(`Attempting to play stream ${i + 1}/${streamUrls.length}: ${url}`);
                        // Reset audio element
                        audio.pause();
                        audio.currentTime = 0;
                        audio.src = url;
                        audio.load();
                        // Wait for the audio to be ready
                        await new Promise((resolve, reject) => {
                            const timeout = setTimeout(() => {
                                reject(new Error("Stream loading timeout"));
                            }, 10000);
                            audio.oncanplaythrough = () => {
                                clearTimeout(timeout);
                                resolve(true);
                            };
                            audio.onerror = () => {
                                clearTimeout(timeout);
                                reject(new Error("Stream loading error"));
                            };
                        });
                        const playPromise = audio.play();
                        if (playPromise !== undefined) {
                            await playPromise;
                            streamWorked = true;
                            console.log(`Stream ${i + 1} working successfully`);
                            break;
                        }
                    }
                    catch (urlError) {
                        console.warn(`Stream ${i + 1} failed:`, urlError);
                        if (i === streamUrls.length - 1) {
                            // Last URL failed, throw error
                            throw urlError;
                        }
                    }
                }
                if (!streamWorked) {
                    throw new Error("All stream formats failed");
                }
            }
        }
        catch (error) {
            console.error("Playback error:", error);
            let errorMessage = "Failed to start playback";
            if (error.name === "NotAllowedError") {
                errorMessage = "Please click play to start the stream";
            }
            else if (error.name === "NotSupportedError") {
                errorMessage =
                    "Stream format not supported - trying alternative formats";
            }
            else if (error.name === "AbortError") {
                errorMessage = "Stream loading was interrupted";
            }
            else {
                errorMessage = "Unable to connect to radio stream";
            }
            setError(errorMessage);
            setIsLoading(false);
            setIsPlaying(false);
        }
    };
    const setVolume = (newVolume) => {
        setVolumeState(newVolume);
        // Save volume to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('radio-volume', newVolume.toString());
        }
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : newVolume;
        }
    };
    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        // Save muted state to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('radio-muted', newMuted.toString());
        }
        if (audioRef.current) {
            audioRef.current.volume = newMuted ? 0 : volume;
        }
    };
    const changeStation = async (station) => {
        const audio = audioRef.current;
        if (!audio)
            return;
        try {
            setIsLoading(true);
            setError(null);
            // Stop current playback
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            }
            // Update station info
            setCurrentStation(station);
            setStationName(station.name);
            // Set new stream URL through proxy with station-specific URL
            const proxyUrl = `/api/radio-stream?url=${encodeURIComponent(station.streamUrl)}`;
            audio.src = proxyUrl;
            // Preload the new stream
            audio.load();
            // Wait for the stream to be ready
            await new Promise((resolve) => {
                const onCanPlay = () => {
                    audio.removeEventListener('canplay', onCanPlay);
                    audio.removeEventListener('error', onError);
                    resolve();
                };
                const onError = () => {
                    audio.removeEventListener('canplay', onCanPlay);
                    audio.removeEventListener('error', onError);
                    resolve(); // Still resolve to continue with track info fetching
                };
                audio.addEventListener('canplay', onCanPlay);
                audio.addEventListener('error', onError);
                // Timeout fallback
                setTimeout(() => {
                    audio.removeEventListener('canplay', onCanPlay);
                    audio.removeEventListener('error', onError);
                    resolve();
                }, 2000);
            });
            // Immediately fetch track info for the new station
            try {
                const response = await fetch(`/api/now-playing?station=${station.id}`);
                if (response.ok) {
                    const trackData = await response.json();
                    setCurrentTrack({
                        title: trackData.title || station.name,
                        artist: trackData.artist || station.description,
                        album: trackData.album || `${station.frequency} • ${station.location}`,
                        artwork: trackData.artwork || "",
                    });
                }
                else {
                    // Fallback to station info
                    setCurrentTrack({
                        title: station.name,
                        artist: station.description,
                        album: `${station.frequency} • ${station.location}`,
                        artwork: "",
                    });
                }
            }
            catch (trackError) {
                console.error("Failed to fetch initial track info:", trackError);
                // Fallback to station info
                setCurrentTrack({
                    title: station.name,
                    artist: station.description,
                    album: `${station.frequency} • ${station.location}`,
                    artwork: "",
                });
            }
            console.log(`Station changed to: ${station.name} (${station.streamUrl})`);
        }
        catch (err) {
            console.error("Failed to change station:", err);
            setError("Failed to switch station");
        }
        finally {
            setIsLoading(false);
        }
    };
    // Audio event handlers
    const handlePlay = () => {
        setIsPlaying(true);
        setIsLoading(false);
        setError(null);
    };
    const handlePause = () => {
        setIsPlaying(false);
        setIsLoading(false);
    };
    const handleLoadStart = () => {
        setIsLoading(true);
        setError(null);
    };
    const handleCanPlay = () => {
        setIsLoading(false);
    };
    const handleError = (e) => {
        console.error("Audio error:", e);
        setIsLoading(false);
        setIsPlaying(false);
        const audio = audioRef.current;
        if (audio && audio.src && !audio.paused) {
            setError("Unable to connect to radio stream");
        }
    };
    // Set up audio event listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio)
            return;
        audio.volume = isMuted ? 0 : volume;
        audio.addEventListener("play", handlePlay);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("loadstart", handleLoadStart);
        audio.addEventListener("canplay", handleCanPlay);
        audio.addEventListener("error", handleError);
        return () => {
            audio.removeEventListener("play", handlePlay);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("loadstart", handleLoadStart);
            audio.removeEventListener("canplay", handleCanPlay);
            audio.removeEventListener("error", handleError);
        };
    }, [volume, isMuted]);
    // Auto-play functionality - start playing when component mounts
    useEffect(() => {
        const initializeAutoPlay = async () => {
            // Only auto-play if not already playing and no error
            if (!isPlaying && !error) {
                try {
                    // Small delay to ensure audio element is ready
                    setTimeout(() => {
                        togglePlayback();
                    }, 1000);
                }
                catch (error) {
                    console.log("Auto-play prevented by browser:", error);
                }
            }
        };
        initializeAutoPlay();
    }, []); // Run only once on mount
    // Track information fetching - only when playing and track changes
    useEffect(() => {
        let trackInterval;
        const fetchTrackInfo = async () => {
            if (!isPlaying)
                return;
            try {
                const stationParam = currentStation?.id
                    ? `?station=${currentStation.id}`
                    : "";
                const response = await fetch(`/api/now-playing${stationParam}`);
                if (response.ok) {
                    const trackData = await response.json();
                    // Only update if track has actually changed (and it's not generic station info)
                    const isActualSong = trackData.title &&
                        trackData.title !== "Radio Stream" &&
                        trackData.title !== "Live Stream" &&
                        trackData.title !== currentStation?.name &&
                        trackData.title !== currentStation?.description;
                    const hasTrackChanged = trackData.title !== currentTrack.title ||
                        trackData.artist !== currentTrack.artist;
                    if (hasTrackChanged) {
                        // Only trigger cool animation for actual song changes
                        if (isActualSong && currentTrack.title !== currentStation?.name) {
                            setIsTransitioning(true);
                            // Wait for transition to start, then update content
                            setTimeout(() => {
                                setCurrentTrack({
                                    title: trackData.title,
                                    artist: trackData.artist || "",
                                    album: trackData.album || "",
                                    artwork: trackData.artwork || "",
                                });
                            }, 350); // Half of transition duration
                            // End transition after animation completes
                            setTimeout(() => setIsTransitioning(false), 1200);
                        }
                        else {
                            // For station info or non-songs, update without animation
                            const displayTitle = trackData.title === "Radio Stream" || !trackData.title
                                ? currentStation?.name || stationName
                                : trackData.title;
                            const displayArtist = trackData.artist === "Live Stream" || !trackData.artist
                                ? currentStation?.description || ""
                                : trackData.artist;
                            const displayAlbum = trackData.album ||
                                (currentStation
                                    ? `${currentStation.frequency} • ${currentStation.location}`
                                    : "");
                            setCurrentTrack({
                                title: displayTitle,
                                artist: displayArtist,
                                album: displayAlbum,
                                artwork: trackData.artwork || "",
                            });
                        }
                    }
                }
            }
            catch (error) {
                console.error("Failed to fetch track info:", error);
            }
        };
        if (isPlaying) {
            fetchTrackInfo();
            trackInterval = setInterval(fetchTrackInfo, 15000); // Check every 15 seconds instead of 10
        }
        else {
            // When stopped, show station name only if no track is set
            if (currentTrack.title === "" || currentTrack.title === stationName) {
                setCurrentTrack({
                    title: stationName,
                    artist: "",
                    album: "",
                    artwork: "",
                });
            }
        }
        return () => {
            if (trackInterval)
                clearInterval(trackInterval);
        };
    }, [isPlaying, stationName, currentStation?.id]);
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
        togglePlayback,
        setVolume,
        toggleMute,
        changeStation,
        setCurrentTrack,
        audioRef,
    };
    return (<RadioContext.Provider value={value}>{children}</RadioContext.Provider>);
}
export function useRadio() {
    const context = useContext(RadioContext);
    if (context === undefined) {
        throw new Error("useRadio must be used within a RadioProvider");
    }
    return context;
}
