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

// Live radio stream and metal music sources
const metalTracks = [
  {
    id: 1,
    title: "Youth Gone Wild",
    artist: "Skid Row",
    album: "Skid Row",
    audioUrl: "https://live.hunter.fm/80s_mp3_192"
  },
  {
    id: 2,
    title: "Metal Thunder",
    artist: "Thunder Squad",
    album: "Electric Storm",
    audioUrl: "https://live.hunter.fm/classic_rock_mp3_192"
  },
  {
    id: 3,
    title: "Steel Revolution",
    artist: "Iron Legion",
    album: "Battle Anthems",
    audioUrl: "https://live.hunter.fm/metal_mp3_192"
  },
  {
    id: 4,
    title: "Electric Storm",
    artist: "SoundImage",
    album: "Power Metal",
    audioUrl: "https://live.hunter.fm/hard_rock_mp3_192"
  },
  {
    id: 5,
    title: "Metal Fury",
    artist: "Loyalty Freak Music",
    album: "Rage Collection",
    audioUrl: "https://live.hunter.fm/classic_metal_mp3_192"
  }
];

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(75);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: nowPlayingData } = useQuery<NowPlaying>({
    queryKey: ["/api/now-playing"],
    refetchInterval: 30000,
  });

  // Combine local track data with server data
  const currentTrack = {
    ...metalTracks[currentTrackIndex],
    ...nowPlayingData
  } as NowPlaying;

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume / 100;
      audioRef.current.crossOrigin = "anonymous";
      
      // Handle track end
      audioRef.current.addEventListener('ended', () => {
        nextTrack();
      });
      
      // Handle errors
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setIsPlaying(false);
      });

      // Handle successful load
      audioRef.current.addEventListener('canplay', () => {
        console.log('Audio ready to play');
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

  useEffect(() => {
    if (audioRef.current) {
      const track = metalTracks[currentTrackIndex];
      audioRef.current.src = track.audioUrl;
      audioRef.current.load();
      
      // Add loading state handling
      audioRef.current.addEventListener('loadstart', () => {
        console.log(`Loading: ${track.title} by ${track.artist}`);
      });
      
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log(`Ready to play: ${track.title}`);
        if (isPlaying) {
          audioRef.current?.play().catch(error => {
            console.error('Auto-play failed:', error);
            setIsPlaying(false);
          });
        }
      });
    }
  }, [currentTrackIndex, isPlaying]);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const track = metalTracks[currentTrackIndex];
        if (!audioRef.current.src || audioRef.current.src !== track.audioUrl) {
          audioRef.current.src = track.audioUrl;
          audioRef.current.load();
        }
        
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            console.log(`Now playing: ${track.title} by ${track.artist}`);
          })
          .catch(error => {
            console.error('Playback failed:', error);
            console.error('Track URL:', track.audioUrl);
            setIsPlaying(false);
            
            // Try to fallback to a different track
            if (currentTrackIndex < metalTracks.length - 1) {
              console.log('Trying next track...');
              nextTrack();
            }
          });
      }
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % metalTracks.length;
    setCurrentTrackIndex(nextIndex);
  };

  const previousTrack = () => {
    const prevIndex = currentTrackIndex === 0 ? metalTracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        togglePlayback,
        setVolume,
        nextTrack,
        previousTrack,
        currentTrackIndex,
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
