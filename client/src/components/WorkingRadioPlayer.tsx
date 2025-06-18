import { useState, useRef } from "react";
import { Play, Pause, Volume2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkingRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        setError(null);
        
        // Direct stream connection
        const streamUrl = "http://168.119.74.185:9858/autodj";
        audio.src = streamUrl;
        audio.volume = volume;
        
        // Handle events inline
        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
          setError(null);
        };
        
        audio.onpause = () => {
          setIsPlaying(false);
          setIsLoading(false);
        };
        
        audio.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
          setError('Stream unavailable');
        };
        
        audio.onloadstart = () => {
          setIsLoading(true);
        };
        
        audio.oncanplay = () => {
          setIsLoading(false);
        };
        
        // Start playback
        audio.play().catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
          setError('Playback failed');
        });
      }
    } catch (err) {
      setIsPlaying(false);
      setIsLoading(false);
      setError('Audio error');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <audio ref={audioRef} preload="none" />

      <Button
        onClick={togglePlayback}
        disabled={isLoading}
        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
        <span className="ml-2 font-semibold">
          {isLoading ? 'CONNECTING...' : isPlaying ? 'PAUSE' : 'PLAY LIVE'}
        </span>
      </Button>

      {isPlaying && (
        <div className="flex items-center space-x-2 text-red-500">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold">LIVE</span>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}