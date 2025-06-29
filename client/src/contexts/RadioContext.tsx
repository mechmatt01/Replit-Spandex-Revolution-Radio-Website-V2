import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
// Radio station interface
interface RadioStation {
  id: string;
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
  const [currentStation, setCurrentStation] = useState<RadioStation | null>({
    id: "beat-955",
    name: "95.5 The Beat",
    frequency: "95.5 FM",
    location: "Dallas, TX",
    genre: "Hip Hop & R&B",
    streamUrl: "https://24883.live.streamtheworld.com/KBFBFMAAC",
    description: "Dallas Hip Hop & R&B",
    icon: "🎵"
  });
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
    "/api/radio-stream",
    "https://ice1.somafm.com/metal-128-mp3"
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
            
            // Reset audio element
            audio.pause();
            audio.currentTime = 0;
            audio.src = url;
            audio.load();
            
            // Wait for the audio to be ready
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Stream loading timeout'));
              }, 10000);
              
              audio.oncanplaythrough = () => {
                clearTimeout(timeout);
                resolve(true);
              };
              
              audio.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Stream loading error'));
              };
            });
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              await playPromise;
              streamWorked = true;
              console.log(`Stream ${i + 1} working successfully`);
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

  const changeStation = async (station: RadioStation) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Pause current playback
      if (isPlaying) {
        audio.pause();
      }

      // Update station info
      setCurrentStation(station);
      setStationName(station.name);
      setCurrentTrack({
        title: station.name,
        artist: station.description,
        album: station.genre,
        artwork: ""
      });

      // Set new stream URL
      audio.src = station.streamUrl;
      audio.load();

      // Resume playback if it was playing
      if (isPlaying) {
        await audio.play();
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to change station:', error);
      setError('Failed to change station');
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
    currentStation,
    stationName,
    isTransitioning,
    togglePlayback,
    setVolume,
    toggleMute,
    changeStation,
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