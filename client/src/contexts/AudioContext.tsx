import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(75);

  const { data: currentTrack } = useQuery<NowPlaying>({
    queryKey: ["/api/now-playing"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const nextTrack = () => {
    // In a real implementation, this would skip to the next track
    console.log("Next track requested");
  };

  const previousTrack = () => {
    // In a real implementation, this would go to the previous track
    console.log("Previous track requested");
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack: currentTrack || null,
        isPlaying,
        volume,
        togglePlayback,
        setVolume,
        nextTrack,
        previousTrack,
      }}
    >
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
