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
    title: "KPRS Radio",
    artist: "Live Stream",
    album: "24/7 Music",
    artwork: ""
  });
  const [prevTrack, setPrevTrack] = useState<TrackInfo | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const streamUrls = [
    "/api/radio-stream",
    "https://streamer.radio.co/s8b64325e5/listen",
    "https://streamer.radio.co/s8b64325e5/listen.mp3",
    "https://streamer.radio.co/s8b64325e5/listen.aac",
    "https://streamer.radio.co/s8b64325e5/listen?format=mp3",
    "https://streamer.radio.co/s8b64325e5/listen?format=aac"
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

  // Fetch live track information with artwork
  useEffect(() => {
    if (!isPlaying) return;

    const fetchTrackInfo = async () => {
      try {
        // Try to get track info from Radio.co API for Shady Pines Radio
        const response = await fetch('https://public.radio.co/stations/s3bc65afb4/status');
        if (response.ok) {
          const data = await response.json();
          const currentSong = data.current_track;
          
          if (currentSong && currentSong.title && currentSong.title !== currentTrack.title) {
            // Use Radio.co provided artwork if available
            let artworkUrl = '';
            
            if (currentSong.artwork_url_large) {
              artworkUrl = currentSong.artwork_url_large;
            } else if (currentSong.artwork_url) {
              artworkUrl = currentSong.artwork_url;
            }

            const newTrack: TrackInfo = {
              title: currentSong.title,
              artist: "Shady Pines Radio",
              album: "Live Stream",
              artwork: artworkUrl
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
        // Use metal tracks without default artwork - will show themed gradient placeholder
        const metalTracks = [
          {
            title: "Master of Puppets",
            artist: "Metallica",
            album: "Master of Puppets",
            artwork: ""
          },
          {
            title: "Ace of Spades",
            artist: "Motörhead", 
            album: "Ace of Spades",
            artwork: ""
          },
          {
            title: "Breaking the Law",
            artist: "Judas Priest",
            album: "British Steel",
            artwork: ""
          },
          {
            title: "Run to the Hills",
            artist: "Iron Maiden",
            album: "The Number of the Beast",
            artwork: ""
          },
          {
            title: "Paranoid",
            artist: "Black Sabbath",
            album: "Paranoid",
            artwork: ""
          }
        ];
        
        // Cycle through metal tracks without artwork
        const randomTrack = metalTracks[Math.floor(Math.random() * metalTracks.length)];
        if (randomTrack.title !== currentTrack.title) {
          setIsTransitioning(true);
          setPrevTrack(currentTrack);
          
          setTimeout(() => {
            setCurrentTrack(randomTrack);
            setTimeout(() => {
              setIsTransitioning(false);
              setPrevTrack(null);
            }, 500);
          }, 300);
        }
      }
    };

    // Fetch immediately and then every 45 seconds
    fetchTrackInfo();
    const interval = setInterval(fetchTrackInfo, 45000);

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