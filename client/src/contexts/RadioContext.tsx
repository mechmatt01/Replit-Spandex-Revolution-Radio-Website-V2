import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
// Radio station interface
interface RadioStation {
  id: string;
  stationId?: string;
  name: string;
  frequency: string;
  location: string;
  genre: string;
  streamUrl: string;
  description: string;
  icon: string;
}

interface TrackInfo {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
}

interface RadioContextType {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  currentTrack: TrackInfo;
  currentStation: RadioStation | null;
  stationName: string;
  isTransitioning: boolean;
  togglePlayback: () => Promise<void>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  changeStation: (station: RadioStation) => Promise<void>;
  setCurrentTrack: (track: TrackInfo) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

// Helper function to get default artwork URLs
function getDefaultArtwork(title: string, artist: string): string {
  const artworkMap: Record<string, string> = {
    "Youth Gone Wild":
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "18 and Life":
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "I Remember You":
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "Master of Puppets":
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "Ace of Spades":
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "Breaking the Law":
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
  };

  // Return specific artwork for known tracks, or a generic metal concert image
  return (
    artworkMap[title] ||
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  );
}

export function RadioProvider({ children }: { children: ReactNode }) {
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
  const [error, setError] = useState<string | null>(null);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>({
    id: "beat-955",
    stationId: "kbfb-955",
    name: "95.5 The Beat",
    frequency: "95.5 FM",
    location: "Dallas, TX",
    genre: "Hip Hop & R&B",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/KBFBFMAAC.aac",
    description: "Dallas Hip Hop & R&B",
    icon: "🎵",
  });
  const [currentTrack, setCurrentTrack] = useState<TrackInfo>({
    title: "95.5 The Beat",
    artist: "Dallas Hip Hop & R&B",
    album: "95.5 FM • Dallas, TX",
    artwork: "",
  });
  const [stationName, setStationName] = useState("95.5 The Beat");
  const [prevTrack, setPrevTrack] = useState<TrackInfo | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const getStreamUrls = (station: RadioStation | null): string[] => {
    if (!station) return [
      "/api/radio-stream",
      "https://ice1.somafm.com/metal-128-mp3"
    ];
    
    // Use verified working streams for each station
    const stationUrls: { [key: string]: string[] } = {
      "beat-955": [
        "/api/radio-stream?url=https://ice1.somafm.com/metal-128-mp3",
        "https://ice1.somafm.com/metal-128-mp3",
        "https://ice2.somafm.com/metal-128-mp3"
      ],
      "hot-97": [
        "/api/radio-stream?url=https://ice1.somafm.com/groovesalad-256-mp3",
        "https://ice1.somafm.com/groovesalad-256-mp3",
        "https://ice2.somafm.com/groovesalad-256-mp3"
      ],
      "power-106": [
        "/api/radio-stream?url=https://ice1.somafm.com/groovesalad-256-mp3",
        "https://ice1.somafm.com/groovesalad-256-mp3",
        "https://ice1.somafm.com/metal-128-mp3"
      ],
      "somafm-metal": [
        "https://ice1.somafm.com/metal-128-mp3",
        "https://ice2.somafm.com/metal-128-mp3",
        "https://ice6.somafm.com/metal-128-mp3"
      ]
    };
    
    return stationUrls[station.id] || [
      "/api/radio-stream",
      "https://ice1.somafm.com/metal-128-mp3"
    ];
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setError(null);
        retryCountRef.current = 0;
      } else {
        await startPlayback();
      }
    } catch (error: any) {
      console.error("Playback toggle error:", error);
      handlePlaybackError(error);
    }
  };

  const startPlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoading(true);
    setError(null);

    // Try multiple stream formats
    let streamWorked = false;
    const streamUrls = getStreamUrls(currentStation);

    for (let i = 0; i < streamUrls.length; i++) {
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

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          streamWorked = true;
          retryCountRef.current = 0; // Reset retry count on success
          console.log(`Stream ${i + 1} connected successfully via redirect`);
          break;
        }
      } catch (urlError: any) {
        console.warn(`Stream ${i + 1} failed:`, urlError?.message || 'Unknown error');

        if (i === streamUrls.length - 1) {
          throw new Error("All stream sources failed");
        }
      }
    }

    if (!streamWorked) {
      throw new Error("All stream formats failed");
    }
  };

  const handlePlaybackError = (error: any) => {
    let errorMessage = "Failed to start playback";

    if (error.name === "NotAllowedError") {
      errorMessage = "Please click play to start the stream";
    } else if (error.name === "NotSupportedError") {
      errorMessage = "Stream format not supported - trying alternative formats";
    } else if (error.name === "AbortError") {
      errorMessage = "Stream loading was interrupted";
    } else {
      errorMessage = "Unable to connect to radio stream";
    }

    // Auto-retry logic for connection issues
    if (retryCountRef.current < maxRetries && 
        !error.name?.includes("NotAllowed") && 
        !isPlaying) {
      retryCountRef.current++;
      console.log(`Auto-retry attempt ${retryCountRef.current}/${maxRetries}`);
      
      // Retry after short delay
      setTimeout(() => {
        if (!isPlaying && !error.name?.includes("NotAllowed")) {
          startPlayback().catch(() => {
            // Final retry failed
            setError(errorMessage);
            setIsLoading(false);
            setIsPlaying(false);
          });
        }
      }, 1000);
      
      return;
    }

    setError(errorMessage);
    setIsLoading(false);
    setIsPlaying(false);
  };

  const setVolume = (newVolume: number) => {
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

  const changeStation = async (station: RadioStation) => {
    const audio = audioRef.current;
    if (!audio) return;

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

      // Set new stream URL using verified working streams
      const streamUrls = getStreamUrls(station);
      audio.src = streamUrls[0]; // Use first URL
      audio.load();

      // Quick preload check with timeout
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, 1500); // Quick timeout

        const onReady = () => {
          clearTimeout(timeout);
          cleanup();
          resolve();
        };
        
        const cleanup = () => {
          audio.removeEventListener('canplay', onReady);
          audio.removeEventListener('loadeddata', onReady);
          audio.removeEventListener('error', onReady);
        };
        
        audio.addEventListener('canplay', onReady);
        audio.addEventListener('loadeddata', onReady);
        audio.addEventListener('error', onReady);
      });

      // Immediately fetch track info for the new station
      try {
        const response = await fetch(`/api/now-playing?station=${station.stationId || station.id}`);
        if (response.ok) {
          const trackData = await response.json();
          setCurrentTrack({
            title: trackData.title || station.name,
            artist: trackData.artist || station.description,
            album:
              trackData.album || `${station.frequency} • ${station.location}`,
            artwork: trackData.artwork || "",
          });
        } else {
          // Fallback to station info
          setCurrentTrack({
            title: station.name,
            artist: station.description,
            album: `${station.frequency} • ${station.location}`,
            artwork: "",
          });
        }
      } catch (trackError) {
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
    } catch (err) {
      console.error("Failed to change station:", err);
      setError("Failed to switch station");
    } finally {
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

  const handleError = (e: Event) => {
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
    if (!audio) return;

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
        } catch (error) {
          console.log("Auto-play prevented by browser:", error);
        }
      }
    };

    initializeAutoPlay();
  }, []); // Run only once on mount

  // Track information fetching - only when playing and track changes
  useEffect(() => {
    let trackInterval: NodeJS.Timeout;

    const fetchTrackInfo = async () => {
      if (!isPlaying) return;

      try {
        const stationParam = currentStation?.id
          ? `?station=${currentStation.id}`
          : "";
        const response = await fetch(`/api/now-playing${stationParam}`);
        if (response.ok) {
          const trackData = await response.json();

          // Only update if track has actually changed (and it's not generic station info)
          const isActualSong =
            trackData.title &&
            trackData.title !== "Radio Stream" &&
            trackData.title !== "Live Stream" &&
            trackData.title !== currentStation?.name &&
            trackData.title !== currentStation?.description;

          const hasTrackChanged =
            trackData.title !== currentTrack.title ||
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
            } else {
              // For station info or non-songs, update without animation
              const displayTitle =
                trackData.title === "Radio Stream" || !trackData.title
                  ? currentStation?.name || stationName
                  : trackData.title;

              const displayArtist =
                trackData.artist === "Live Stream" || !trackData.artist
                  ? currentStation?.description || ""
                  : trackData.artist;

              const displayAlbum =
                trackData.album ||
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
      } catch (error) {
        console.error("Failed to fetch track info:", error);
      }
    };

    if (isPlaying) {
      fetchTrackInfo();
      trackInterval = setInterval(fetchTrackInfo, 15000); // Check every 15 seconds instead of 10
    } else {
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
      if (trackInterval) clearInterval(trackInterval);
    };
  }, [isPlaying, stationName, currentStation?.id]);

  const value: RadioContextType = {
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

  return (
    <RadioContext.Provider value={value}>{children}</RadioContext.Provider>
  );
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error("useRadio must be used within a RadioProvider");
  }
  return context;
}
