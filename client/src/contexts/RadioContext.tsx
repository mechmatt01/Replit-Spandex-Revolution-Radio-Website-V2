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
  togglePlayback: () => Promise<void>;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export function RadioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<TrackInfo>({
    title: "Metal Detector Radio",
    artist: "SomaFM Metal Stream",
    album: "Live Stream"
  });
  const [prevTrack, setPrevTrack] = useState<TrackInfo | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const streamUrl = "https://ice1.somafm.com/metal-128-mp3";

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
        
        audio.src = streamUrl;
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error: any) {
      console.error("Playback error:", error);
      let errorMessage = "Failed to start playback";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Please click play to start the stream";
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "Stream format not supported";
      } else if (error.name === 'AbortError') {
        errorMessage = "Stream loading was interrupted";
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

  // Fetch live track information
  useEffect(() => {
    if (!isPlaying) return;

    const fetchTrackInfo = async () => {
      try {
        // Simulate getting track info from SomaFM metadata
        const response = await fetch('https://somafm.com/metal/songhistory.json');
        if (response.ok) {
          const data = await response.json();
          const latestTrack = data.songs?.[0];
          
          if (latestTrack && latestTrack.title !== currentTrack.title) {
            const newTrack: TrackInfo = {
              title: latestTrack.title || "Metal Detector Radio",
              artist: latestTrack.artist || "SomaFM Metal Stream",
              album: latestTrack.album || "Live Stream",
              artwork: latestTrack.artwork
            };
            
            // Trigger fade transition
            setIsTransitioning(true);
            setPrevTrack(currentTrack);
            
            setTimeout(() => {
              setCurrentTrack(newTrack);
              setTimeout(() => {
                setIsTransitioning(false);
                setPrevTrack(null);
              }, 500);
            }, 300);
          }
        }
      } catch (error) {
        // Keep current track info if fetch fails
        console.log("Using fallback track info");
      }
    };

    // Fetch immediately and then every 30 seconds
    fetchTrackInfo();
    const interval = setInterval(fetchTrackInfo, 30000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.title]);

  const value: RadioContextType = {
    isPlaying,
    volume,
    isMuted,
    isLoading,
    error,
    currentTrack,
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