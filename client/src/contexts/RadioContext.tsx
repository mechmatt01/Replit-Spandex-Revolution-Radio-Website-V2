import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useFirebaseAuth } from "./FirebaseAuthContext";
import { useToast } from "../hooks/use-toast";

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
  isAd?: boolean;
  adCompany?: string;
  adReason?: string;
  stationName?: string;
  frequency?: string;
  location?: string;
  genre?: string;
  lastUpdated?: Date;
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
  isAdPlaying: boolean;
  adInfo: {
    company?: string;
    reason?: string;
    artwork?: string;
  };
  togglePlayback: () => Promise<void>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  changeStation: (station: RadioStation, autoPlay?: boolean) => Promise<void>;
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

  // Core state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('radio-volume');
      return saved ? parseFloat(saved) : 0.7;
    }
    return 0.7;
  });
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('radio-muted');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adInfo, setAdInfo] = useState<{
    company?: string;
    reason?: string;
    artwork?: string;
  }>({});

  // Station and track state
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [stationName, setStationName] = useState("Spandex Salvation Radio");
  const [currentTrack, setCurrentTrack] = useState<TrackInfo>({
    title: "Spandex Salvation Radio",
    artist: "Live Stream",
    album: "Heavy Metal & Hard Rock",
    artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
  });

  // Refs and intervals
  const audioRef = useRef<HTMLAudioElement>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const [metadataPollingInterval, setMetadataPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const audioKeepAliveInterval = useRef<NodeJS.Timeout | null>(null);
  const [userStopped, setUserStopped] = useState(false); // Track if user manually stopped playback

  // Helper function to get multiple stream URLs for a station
  const getStreamUrls = useCallback((station: RadioStation | null): string[] => {
    if (!station) return [];
    
    // For SomaFM stations, try multiple formats
    if (station.id.startsWith('somafm-')) {
      return [
        station.streamUrl,
        station.streamUrl.replace('-128-mp3', '-64-mp3'),
        station.streamUrl.replace('-128-mp3', '-32-mp3'),
      ];
    }
    
    // For other stations, return the main URL
    return [station.streamUrl];
  }, []);

  // Start playback function with improved error handling and stability
  const startPlayback = useCallback(async () => {
    if (!currentStation) {
      throw new Error("No station selected");
    }

    if (isLoading) {
      console.log("Already loading, skipping startPlayback call");
      return;
    }

    console.log(`[RadioContext] Starting playback for station: ${currentStation.name}`);
    setIsLoading(true);
    setError(null);
    setUserStopped(false); // Reset user stopped flag when starting playback

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
        const audio = audioRef.current;
        if (!audio) {
          throw new Error("Audio element not available");
        }

        audio.pause();
        audio.currentTime = 0;
        
        // Small delay to ensure old stream is completely cleared
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`[RadioContext] Setting audio source to: ${url}`);
        audio.src = url;
        audio.load();
        console.log(`[RadioContext] Audio source after load: ${audio.src}`);

        // Wait for the audio to be ready with optimized timeout
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Stream loading timeout"));
          }, 5000); // Increased timeout for better stability

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
                setIsPlaying(true); // Set playing state to true
                setIsLoading(false); // Stop loading when audio starts playing
                console.log(`Stream ${i + 1} connected successfully`);
                
                // Start keep-alive mechanism to prevent audio from stopping
                startAudioKeepAlive();
                
                break;
              }
            } else {
              console.log('Audio not ready, waiting for canplay event...');
              // Wait for canplay event
              await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                  reject(new Error("Audio ready timeout"));
                }, 8000); // Increased timeout

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
                setIsPlaying(true);
                setIsLoading(false);
                console.log(`Stream ${i + 1} connected successfully after waiting`);
                
                // Start keep-alive mechanism
                startAudioKeepAlive();
                
                break;
              }
            }
          } catch (playError: any) {
            console.warn(`Play attempt ${i + 1} failed:`, playError);
            if (playError.name === 'NotAllowedError') {
              throw new Error("Autoplay not allowed. Please click the play button.");
            }
            continue; // Try next stream URL
          }
        } else {
          console.log('Page not visible, skipping play attempt');
          continue;
        }
      } catch (error: any) {
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
  }, [isLoading, currentStation, getStreamUrls]);

  // Audio keep-alive mechanism to prevent stopping after 30 seconds
  const startAudioKeepAlive = useCallback(() => {
    // Clear any existing interval
    if (audioKeepAliveInterval.current) {
      clearInterval(audioKeepAliveInterval.current);
    }

    // Set up keep-alive interval
    audioKeepAliveInterval.current = setInterval(() => {
      const audio = audioRef.current;
      // Only run keep-alive if we're actually supposed to be playing AND user hasn't stopped
      if (audio && isPlaying && !audio.paused && !userStopped) {
        // Check if audio is still playing, if not, restart it
        if (audio.readyState === 0 || audio.ended) {
          console.log('[RadioContext] Audio stopped unexpectedly, restarting...');
          audio.load();
          audio.play().catch(console.error);
        }
        
        // Ensure volume is maintained
        audio.volume = isMuted ? 0 : volume;
      }
    }, 15000); // Check every 15 seconds
  }, [isPlaying, isMuted, volume]);

  // Stop audio keep-alive
  const stopAudioKeepAlive = useCallback(() => {
    if (audioKeepAliveInterval.current) {
      clearInterval(audioKeepAliveInterval.current);
      audioKeepAliveInterval.current = null;
    }
  }, []);

  const handlePlaybackError = useCallback((error: any) => {
    console.error("Playback error:", error);
    setIsLoading(false);
    setIsPlaying(false);
    stopAudioKeepAlive();
    
    let errorMessage = "Playback failed";
    
    if (error?.name === 'NotAllowedError') {
      errorMessage = "Autoplay not allowed. Please click the play button.";
    } else if (error?.message?.includes('timeout')) {
      errorMessage = "Connection timeout. Please try again.";
    } else if (error?.message?.includes('CORS')) {
      errorMessage = "Stream access denied. Please try again.";
    } else if (error?.message) {
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
    
    // Auto-retry if under max retries AND user hasn't manually stopped
    if (retryCountRef.current < maxRetries && !isPlaying && !userStopped) {
      console.log(`Auto-retrying playback (${retryCountRef.current}/${maxRetries})...`);
      setTimeout(() => {
        // Only retry if user hasn't manually stopped and we're not currently playing
        if (!isPlaying && !isLoading && !userStopped) {
          startPlayback().catch(console.error);
        }
      }, 2000 * retryCountRef.current); // Exponential backoff
    }
  }, [isDebugMode, toast, isPlaying, isLoading, startPlayback, stopAudioKeepAlive]);

  const setVolume = useCallback((newVolume: number) => {
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

  const changeStation = useCallback(async (station: RadioStation, autoPlay: boolean = false) => {
    console.log(`[RadioContext] Changing station to: ${station.name}, autoPlay: ${autoPlay}`);
    
    // Stop current playback and completely clear audio
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      audio.load(); // Force reload to clear any buffered data
      
      // Remove all event listeners to prevent conflicts
      audio.removeEventListener('canplaythrough', () => {});
      audio.removeEventListener('loadeddata', () => {});
      audio.removeEventListener('error', () => {});
      audio.removeEventListener('play', () => {});
      audio.removeEventListener('pause', () => {});
      
      // Force garbage collection of the old audio stream
      if (audio.src) {
        audio.src = '';
      }
    }
    
    // Stop keep-alive
    stopAudioKeepAlive();
    
    // Reset state
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    retryCountRef.current = 0;
    
    // Update station
    setCurrentStation(station);
    setStationName(station.name);
    
    // Update track information for the new station
    setCurrentTrack(prev => ({
      ...prev,
      title: `${station.name} - Live Stream`,
      artist: station.description,
      album: `${station.frequency} • ${station.location}`,
      stationName: station.name,
      frequency: station.frequency,
      location: station.location,
      genre: station.genre,
      lastUpdated: new Date(),
    }));
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('last-selected-station', station.id);
    }
    
    // Only start playback if autoPlay is true
    if (autoPlay) {
      try {
        await startPlayback();
      } catch (error) {
        console.error('[RadioContext] Failed to start playback for new station:', error);
        setIsLoading(false); // Stop loading on error
        // Don't throw here, let the user manually start playback
      }
    }
  }, [startPlayback, stopAudioKeepAlive]);

  // Audio event handlers
  const handlePlay = useCallback(async () => {
    console.log("Audio play event triggered");
    setIsPlaying(true);
    setIsLoading(false);
    setError(null);
    
    // Start keep-alive when playing starts
    startAudioKeepAlive();
    
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
    } catch (error) {
      console.error('Error updating listening status:', error);
      if (isDebugMode) {
        toast({
          title: "Status Update Failed",
          description: "Failed to update listening status",
          variant: "error",
        });
      }
    }
  }, [updateListeningStatus, isDebugMode, toast, currentStation?.name, startAudioKeepAlive]);

  const handlePause = useCallback(async () => {
    console.log("Audio pause event triggered");
    setIsPlaying(false);
    setIsLoading(false);
    
    // Stop keep-alive when paused
    stopAudioKeepAlive();
    
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
    } catch (error) {
      console.error('Error updating listening status:', error);
      if (isDebugMode) {
        toast({
          title: "Status Update Failed",
          description: "Failed to update listening status",
          variant: "error",
        });
      }
    }
  }, [updateListeningStatus, isDebugMode, toast, stopAudioKeepAlive]);

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

  const handleError = useCallback((e: Event) => {
    console.error("Audio error:", e);
    setIsLoading(false);
    setIsPlaying(false);
    stopAudioKeepAlive();
    
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
  }, [isDebugMode, toast, stopAudioKeepAlive]);

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
    if (!audio) return;

    // Prevent multiple initializations
    if (audio.dataset.initialized === 'true') return;
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
      if (isInitialized) return;
      isInitialized = true;
      
      try {
        if (!isPlaying && !error && currentStation) {
          console.log("[RadioContext] Attempting immediate auto-play on mount.");
          await startPlayback();
        }
      } catch (error) {
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
        } catch (error) {
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
      if (isInitialized) return;
      isInitialized = true;
      
      try {
        // Check if user has previously selected a station
        const lastStationId = localStorage.getItem('last-selected-station');
        const shouldAutoPlay = localStorage.getItem('auto-play-enabled') !== 'false';
        
        // Always try to auto-play if we have a current station AND user hasn't stopped
        if (shouldAutoPlay && currentStation && !isPlaying && !userStopped) {
          console.log('[RadioContext] Auto-playing station:', currentStation.name);
          
          // Set loading state first
          setIsLoading(true);
          
          // Small delay to ensure everything is loaded
          setTimeout(async () => {
            if (!isPlaying && currentStation && !userStopped) {
              try {
                await startPlayback();
                console.log('[RadioContext] Auto-play successful');
              } catch (error) {
                console.error('[RadioContext] Auto-play failed:', error);
                setIsLoading(false);
              }
            }
          }, 1500); // Increased delay for better loading sequence
        }
      } catch (error) {
        console.error('[RadioContext] Auto-play initialization error:', error);
        setIsLoading(false);
      }
    };

    // Initialize auto-play after a short delay
    const timer = setTimeout(initializeAutoPlay, 1000); // Reduced from 2000ms
    
    return () => {
      clearTimeout(timer);
      isInitialized = true;
    };
  }, [currentStation, isPlaying, startPlayback]);

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
  const fetchLiveMetadata = useCallback(async (station: RadioStation | null) => {
    if (!station || !isPlaying) return;
    
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
        const fallbackTrack: TrackInfo = {
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
        
      const newTrackInfo: TrackInfo = {
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
    } catch (error) {
      console.error('[RadioContext] Failed to fetch live metadata:', error);
      
      // Use fallback metadata when server is unavailable
      const fallbackTrack: TrackInfo = {
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

  // Start metadata polling when playing or when station changes
  useEffect(() => {
    if (currentStation) {
      // Initial fetch for station information - ALWAYS fetch metadata when station changes
      fetchLiveMetadata(currentStation);
      
      // Set up polling interval (every 10 seconds) - ALWAYS poll for live data
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
  }, [currentStation, fetchLiveMetadata]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (metadataPollingInterval) {
        clearInterval(metadataPollingInterval);
      }
      stopAudioKeepAlive();
    };
  }, [metadataPollingInterval, stopAudioKeepAlive]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        // Stop playback completely
        console.log('Stopping playback...');
        audio.pause();
        audio.src = '';
        audio.load(); // Force reload to clear any buffered data
        setIsPlaying(false);
        setIsLoading(false);
        setError(null);
        retryCountRef.current = 0;
        setUserStopped(true); // Mark that user manually stopped playback
        
        // Stop keep-alive
        stopAudioKeepAlive();
        
        // Clear any existing timeouts or intervals
        if (metadataPollingInterval) {
          clearInterval(metadataPollingInterval);
          setMetadataPollingInterval(null);
        }
        
        // Update listening status to false when user stops
        try {
          await updateListeningStatus(false);
          if (isDebugMode) {
            toast({
              title: "Playback Stopped",
              description: "Playback has been stopped",
              variant: "default",
            });
          }
        } catch (error) {
          console.error('Error updating listening status:', error);
        }
      } else {
        // Start playback
        console.log('Starting playback...');
        setIsLoading(true);
        setError(null);
        await startPlayback();
      }
    } catch (error: any) {
      console.error("Playback toggle error:", error);
      setIsLoading(false);
      handlePlaybackError(error);
    }
  }, [isPlaying, startPlayback, handlePlaybackError, updateListeningStatus, isDebugMode, toast, metadataPollingInterval, stopAudioKeepAlive]);

  // setCurrentTrack is already stable from useState, no need for useCallback

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
    isAdPlaying,
    adInfo,
    togglePlayback,
    setVolume,
    toggleMute,
    changeStation,
    setCurrentTrack,
    audioRef,
  };

  return (
    <RadioContext.Provider value={value}>
      {/* Hidden Audio Element - Always available */}
      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
        aria-label="Live radio stream"
        style={{ display: 'none' }}
      />
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error("useRadio must be used within a RadioProvider");
  }
  return context;
}