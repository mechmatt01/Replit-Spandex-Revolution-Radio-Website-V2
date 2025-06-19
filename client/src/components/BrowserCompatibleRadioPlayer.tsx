import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrowserCompatibleRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Multiple stream formats for maximum browser compatibility
  const streamUrls = [
    // Server proxy first for CORS handling
    '/api/radio-stream',
    // Direct streams as fallback (may have CORS issues)
    'http://168.119.74.185:9858/autodj.mp3',
    'http://168.119.74.185:9858/autodj'
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial volume
    audio.volume = volume;
    audio.preload = 'none';

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
      console.log('Stream ready to play');
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
      console.log('Stream playing');
    };

    const handlePause = () => {
      setIsPlaying(false);
      console.log('Stream paused');
    };

    const handleError = (e: Event) => {
      console.error('Stream error:', e);
      handleStreamError();
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      console.log('Loading stream...');
    };

    const handleWaiting = () => {
      setIsLoading(true);
      console.log('Buffering...');
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setError(null);
      console.log('Stream playing smoothly');
    };

    // Add event listeners
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [volume]);

  const handleStreamError = () => {
    const nextIndex = currentStreamIndex + 1;
    
    if (nextIndex < streamUrls.length) {
      console.log(`Trying stream format ${nextIndex + 1}...`);
      setCurrentStreamIndex(nextIndex);
      setIsLoading(true);
      setError(null);
      
      // Try next stream format
      const audio = audioRef.current;
      if (audio) {
        audio.src = streamUrls[nextIndex];
        audio.load();
        if (isPlaying) {
          audio.play().catch(() => {
            handleStreamError();
          });
        }
      }
    } else {
      // All formats failed
      setIsPlaying(false);
      setIsLoading(false);
      setError('Unable to connect to radio stream');
      console.error('All stream formats failed');
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        setIsLoading(true);
        setError(null);
        
        // Ensure we have the current stream URL
        audio.src = streamUrls[currentStreamIndex];
        audio.volume = volume;
        
        // Reset and load
        audio.load();
        
        // Attempt to play
        await audio.play();
      }
    } catch (err) {
      console.error('Playback failed:', err);
      handleStreamError();
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
      <audio
        ref={audioRef}
        src={streamUrls[currentStreamIndex]}
        crossOrigin="anonymous"
        preload="none"
      />

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
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${volume * 100}%, var(--muted) ${volume * 100}%, var(--muted) 100%)`
          }}
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