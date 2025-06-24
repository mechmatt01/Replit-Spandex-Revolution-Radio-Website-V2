import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

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
  stationName: string;
  isTransitioning: boolean;
  togglePlayback: () => Promise<void>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

// Helper function to get default artwork URLs
function getDefaultArtwork(title: string, artist: string): string {
  const artworkMap: Record<string, string> = {
    "Youth Gone Wild": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "18 and Life": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "I Remember You": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "Master of Puppets": "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "Ace of Spades": "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "Breaking the Law": "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  };
  
  // Return specific artwork for known tracks, or a generic metal concert image
  return artworkMap[title] || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400";
}

export function RadioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<TrackInfo>({
    title: "95.5 The Beat",
    artist: "Dallas Hip Hop & R&B",
    album: "Dallas Hip Hop & R&B",
    artwork: ""
  });
  const [stationName, setStationName] = useState("95.5 The Beat");
  const [prevTrack, setPrevTrack] = useState<TrackInfo | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const streamUrls = [
    "https://24883.live.streamtheworld.com/KBFBFMAAC",
    "https://14923.live.streamtheworld.com/KBFBFMAAC", 
    "https://18243.live.streamtheworld.com/KBFBFMAAC",
    "/api/radio-stream"
  ];

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setError(null);
      } else {
        setIsLoading(true);
        setError(null);
        
        // Try multiple stream formats
        let streamWorked = false;
        
        for (let i = 0; i < streamUrls.length; i++) {
          try {
            const url = streamUrls[i];
            console.log(`Attempting to play stream ${i + 1}/${streamUrls.length}: ${url}`);
            
            audio.src = url;
            audio.load();
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              await playPromise;
              streamWorked = true;
              break;
            }
          } catch (urlError: any) {
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
    } catch (error: any) {
      console.error("Playback error:", error);
      let errorMessage = "Failed to start playback";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Please click play to start the stream";
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "Stream format not supported - trying alternative formats";
      } else if (error.name === 'AbortError') {
        errorMessage = "Stream loading was interrupted";
      } else {
        errorMessage = "Unable to connect to radio stream";
      }
      
      setError(errorMessage);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
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

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [volume, isMuted]);

  // Fetch track information more frequently when playing
  useEffect(() => {
    if (!isPlaying) return;
    
    const fetchTrackInfo = async () => {
      try {
        // Get station info and track info from our APIs
        const [statusResponse, nowPlayingResponse] = await Promise.all([
          fetch('/api/radio-status'),
          fetch('/api/now-playing')
        ]);
        
        let currentStationName = "Hot 97";
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          currentStationName = statusData.station || "Hot 97";
          setStationName(currentStationName);
        }
        
        if (nowPlayingResponse.ok) {
          const nowPlayingData = await nowPlayingResponse.json();
          console.log('Raw API response:', nowPlayingData);
          
          // Always update the track data regardless of previous state to ensure freshness
          const newTrack = {
            title: nowPlayingData.title || currentStationName,
            artist: nowPlayingData.artist || "New York's Hip Hop & R&B", 
            album: nowPlayingData.album || "Hot 97 FM",
            artwork: nowPlayingData.artwork || ""
          };
          
          console.log('Setting new track:', newTrack);
          setCurrentTrack(newTrack);
        }
      } catch (error) {
        console.error('Failed to fetch track info:', error);
        // Don't update on error to prevent unnecessary transitions
      }
    };

    // Fetch track info every 10 seconds when playing to reduce server load
    fetchTrackInfo();
    const interval = setInterval(fetchTrackInfo, 10000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const value: RadioContextType = {
    isPlaying,
    volume,
    isMuted,
    isLoading,
    error,
    currentTrack,
    stationName,
    isTransitioning,
    togglePlayback,
    setVolume,
    toggleMute,
    audioRef,
  };

  return (
    <RadioContext.Provider value={value}>
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error('useRadio must be used within a RadioProvider');
  }
  return context;
}