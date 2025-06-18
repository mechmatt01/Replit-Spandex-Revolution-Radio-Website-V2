import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { spotifyAPI, type SpotifyTrack } from "@/lib/spotify";
import type { NowPlaying } from "@shared/schema";

interface AudioContextType {
  currentTrack: NowPlaying | SpotifyTrack | null;
  isPlaying: boolean;
  volume: number;
  togglePlayback: () => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  currentTrackIndex: number;
  setSpotifyTrack: (track: SpotifyTrack | null) => void;
  spotifyTrack: SpotifyTrack | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch current track from API for display purposes
  const { data: liveTrack } = useQuery<NowPlaying>({
    queryKey: ["/api/now-playing"],
    refetchInterval: 10000,
  });

  // Use Spotify track if available, otherwise use live track
  const currentTrack = spotifyTrack || liveTrack || null;

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
    if (spotifyTrack && spotifyAPI.isAuthenticated()) {
      try {
        if (isPlaying) {
          await spotifyAPI.pause();
          setIsPlaying(false);
        } else {
          if (spotifyTrack.uri) {
            const success = await spotifyAPI.playTrack(spotifyTrack.uri);
            if (success) {
              setIsPlaying(true);
            }
          }
        }
      } catch (error) {
        console.error('Spotify playback error:', error);
      }
      return;
    }

    // Fall back to live stream
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      console.log('Live stream playback would start here');
      setIsPlaying(true);
      
      setTimeout(() => {
        console.log('Simulated live stream playing...');
      }, 1000);
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