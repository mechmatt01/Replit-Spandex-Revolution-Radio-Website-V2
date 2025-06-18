import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { spotify, type SpotifyTrack } from "@/lib/spotify";
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
  const [volume, setVolume] = useState(50);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null);
  const [liveTrackInfo, setLiveTrackInfo] = useState<LiveTrackInfo | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch live radio stream track info
  useQuery({
    queryKey: ["/api/radio-status"],
    queryFn: async () => {
      try {
        const trackInfo = await radioStreamAPI.getCurrentTrack();
        if (trackInfo) {
          setLiveTrackInfo(trackInfo);
        }
        return trackInfo;
      } catch (error) {
        console.error('Error fetching radio track:', error);
        return null;
      }
    },
    refetchInterval: 10000,
  });

  // Fetch fallback track from API for display purposes
  const { data: fallbackTrack } = useQuery<NowPlaying>({
    queryKey: ["/api/now-playing"],
    refetchInterval: 10000,
  });

  // Use priority: Spotify track > Live radio track > fallback track
  const currentTrack = spotifyTrack || liveTrackInfo || fallbackTrack || null;

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

  const togglePlayback = async () => {
    // If we have a Spotify track, use Spotify API
    // Removed Spotify functionality - using Icecast streaming only

    // Use live radio stream
    try {
      const success = await radioStreamAPI.togglePlayback();
      setIsPlaying(success);
      if (success) {
        console.log('Live radio stream started');
      } else {
        console.log('Live radio stream stopped');
      }
    } catch (error) {
      console.error('Live radio stream error:', error);
      setIsPlaying(false);
    }
  };

  const nextTrack = () => {
    if (spotifyTrack) {
      console.log('Spotify track skipping - would need playlist context');
    } else {
      console.log('Live radio - track skipping not available');
    }
  };

  const previousTrack = () => {
    if (spotifyTrack) {
      console.log('Spotify track skipping - would need playlist context');
    } else {
      console.log('Live radio - track skipping not available');
    }
  };

  const value: AudioContextType = {
    currentTrack,
    isPlaying,
    volume,
    togglePlayback,
    setVolume: (newVolume: number) => setVolume(newVolume),
    nextTrack,
    previousTrack,
    currentTrackIndex,
    setSpotifyTrack,
    spotifyTrack,
    liveTrackInfo,
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