import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SimpleStreamPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.crossOrigin = "anonymous";
    audio.preload = "none";

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleError = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setError('Stream connection failed');
    };

    const handleAbort = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('abort', handleAbort);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('abort', handleAbort);
    };
  }, [volume]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        setIsLoading(true);
        setError(null);
        
        // Use server proxy to avoid CORS issues
        audio.src = '/api/radio-stream';
        audio.volume = volume;
        
        await audio.play();
      }
    } catch (err) {
      setIsPlaying(false);
      setIsLoading(false);
      setError('Unable to start stream');
      console.error('Playback error:', err);
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
      {/* Audio Element */}
      <audio ref={audioRef} />

      {/* Play/Pause Button */}
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

      {/* Live Indicator */}
      {isPlaying && (
        <div className="flex items-center space-x-2 text-red-500">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold">LIVE</span>
        </div>
      )}

      {/* Volume Control */}
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

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}