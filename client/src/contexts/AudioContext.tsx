import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { type SpotifyTrack } from "@/lib/spotify";
import { radioStreamAPI, type LiveTrackInfo } from "@/lib/radioStream";
import type { NowPlaying } from "@shared/schema";

interface AudioContextType {
  currentTrack: NowPlaying | SpotifyTrack | LiveTrackInfo | null;
  isPlaying: boolean;
  volume: number;
  togglePlayback: () => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  currentTrackIndex: number;
  setSpotifyTrack: (track: SpotifyTrack | null) => void;
  spotifyTrack: SpotifyTrack | null;
  liveTrackInfo: LiveTrackInfo | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7); // Always use 0-1 range
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch current track from database
  const { data: nowPlaying } = useQuery<NowPlaying>({
    queryKey: ["/api/now-playing"],
    refetchInterval: 30000,
  });

  // Fetch live track info from radio stream
  const { data: liveTrackInfo } = useQuery<LiveTrackInfo>({
    queryKey: ["/api/radio-status"],
    refetchInterval: 10000,
  });

  // Initialize and manage audio element
  useEffect(() => {
    const initializeAudio = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadstart', handleLoadStart);
        audioRef.current.removeEventListener('canplay', handleCanPlay);
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.removeEventListener('ended', handleEnded);
      }

      // Create new audio element
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.preload = "metadata";
      audioRef.current.volume = Math.max(0, Math.min(1, volume)); // Ensure 0-1 range
      
      // Add event listeners
      audioRef.current.addEventListener('loadstart', handleLoadStart);
      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
      audioRef.current.addEventListener('error', handleError);
      audioRef.current.addEventListener('ended', handleEnded);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
      console.log('Starting to load audio stream...');
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
      console.log('Audio stream ready to play');
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
      console.log('Audio stream playing');
    };

    const handlePause = () => {
      setIsPlaying(false);
      console.log('Audio stream paused');
    };

    const handleError = (e: Event) => {
      setIsPlaying(false);
      setIsLoading(false);
      setError('Stream connection failed');
      console.error('Audio stream error:', e);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      console.log('Audio stream ended');
    };

    initializeAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadstart', handleLoadStart);
        audioRef.current.removeEventListener('canplay', handleCanPlay);
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      const safeVolume = Math.max(0, Math.min(1, volume));
      audioRef.current.volume = safeVolume;
    }
  }, [volume]);

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setIsLoading(true);
        setError(null);
        
        // Use server-side proxy for better compatibility
        const streamUrl = `/api/radio-stream?t=${Date.now()}`;
        audioRef.current.src = streamUrl;
        
        console.log('Connecting to radio stream via proxy:', streamUrl);
        
        // Load and play
        audioRef.current.load();
        await audioRef.current.play();
      }
    } catch (error) {
      setIsPlaying(false);
      setIsLoading(false);
      setError('Failed to start stream');
      console.error('Playback error:', error);
      
      // Try alternative approach
      try {
        if (audioRef.current) {
          audioRef.current.src = '';
          audioRef.current.load();
          setTimeout(async () => {
            if (audioRef.current) {
              audioRef.current.src = `http://168.119.74.185:9858/autodj?retry=${Date.now()}`;
              audioRef.current.load();
              await audioRef.current.play();
            }
          }, 1000);
        }
      } catch (retryError) {
        console.error('Retry failed:', retryError);
      }
    }
  };

  const setVolume = (newVolume: number) => {
    // Ensure volume is in 0-1 range
    const safeVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(safeVolume);
  };

  const nextTrack = () => {
    console.log('Next track not applicable for live radio stream');
  };

  const previousTrack = () => {
    console.log('Previous track not applicable for live radio stream');
  };

  // Determine current track (prioritize live stream info)
  const currentTrack = liveTrackInfo || nowPlaying || spotifyTrack;

  const value: AudioContextType = {
    currentTrack,
    isPlaying,
    volume,
    togglePlayback,
    setVolume,
    nextTrack,
    previousTrack,
    currentTrackIndex,
    setSpotifyTrack,
    spotifyTrack,
    liveTrackInfo: liveTrackInfo ?? null,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}