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
  const [volume, setVolumeState] = useState(0.7);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch current track from database
  const { data: nowPlaying } = useQuery<NowPlaying>({
    queryKey: ["/api/now-playing"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch live track info from radio stream
  const { data: liveTrackInfo } = useQuery<LiveTrackInfo>({
    queryKey: ["/api/radio-status"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Initialize audio element for radio stream
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("http://168.119.74.185:9858/autodj");
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.preload = "none";
      audioRef.current.volume = volume;

      // Event listeners for audio state
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('play', () => setIsPlaying(true));
        audioRef.current.removeEventListener('pause', () => setIsPlaying(false));
        audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
        audioRef.current.removeEventListener('error', () => setIsPlaying(false));
      }
    };
  }, []);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayback = async () => {
    // Use live radio stream only
    try {
      const success = await radioStreamAPI.togglePlayback();
      setIsPlaying(success);
    } catch (error) {
      console.error('Radio stream error:', error);
      setIsPlaying(false);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const nextTrack = () => {
    // For radio stream, this doesn't apply - tracks change automatically
    console.log('Next track not applicable for live radio stream');
  };

  const previousTrack = () => {
    // For radio stream, this doesn't apply - tracks change automatically
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