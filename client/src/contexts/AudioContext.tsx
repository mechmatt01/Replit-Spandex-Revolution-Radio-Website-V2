import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NowPlaying } from "@shared/schema";

interface AudioContextType {
  currentTrack: NowPlaying | null;
  isPlaying: boolean;
  volume: number;
  togglePlayback: () => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  currentTrackIndex: number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch current track from API for display purposes
  const { data: currentTrack } = useQuery<NowPlaying>({
    queryKey: ["/api/now-playing"],
    refetchInterval: 10000,
  });

  useEffect(() => {
    // Initialize audio element for live streaming
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.preload = 'none';
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Live stream error:', e);
        setIsPlaying(false);
      });

      audioRef.current.addEventListener('canplay', () => {
        console.log('Live stream ready to play');
      });

      audioRef.current.addEventListener('loadstart', () => {
        console.log('Loading live stream...');
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // For demonstration, we'll show the controls but note that this is a placeholder
      // Real implementation would connect to actual streaming infrastructure
      console.log('Live stream playback would start here');
      setIsPlaying(true);
      
      // Simulate playback for UI demonstration
      setTimeout(() => {
        console.log('Simulated live stream playing...');
      }, 1000);
    }
  };

  const nextTrack = () => {
    console.log('Live radio - track skipping not available');
  };

  const previousTrack = () => {
    console.log('Live radio - track skipping not available');
  };

  const value: AudioContextType = {
    currentTrack: currentTrack || null,
    isPlaying,
    volume,
    togglePlayback,
    setVolume: (newVolume: number) => setVolume(newVolume),
    nextTrack,
    previousTrack,
    currentTrackIndex,
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