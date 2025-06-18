import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmbeddedRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sourceRef = useRef<HTMLSourceElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    
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
      setError('Connection failed');
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setError(null);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [volume]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    const source = sourceRef.current;
    if (!audio || !source) return;

    try {
      if (isPlaying) {
        audio.pause();
        source.src = '';
        audio.load();
      } else {
        setIsLoading(true);
        setError(null);
        
        // Set the stream URL
        source.src = '/api/radio-stream';
        audio.load();
        
        // Attempt to play
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (err) {
      setIsPlaying(false);
      setIsLoading(false);
      setError('Playback failed');
      console.error('Audio error:', err);
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 space-y-6">
        {/* Audio Element with Server Proxy */}
        <audio ref={audioRef} preload="none">
          <source ref={sourceRef} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <Radio className="h-6 w-6 text-[var(--color-primary)]" />
            <h3 className="text-xl font-bold text-foreground">Live Radio Stream</h3>
          </div>
          <p className="text-muted-foreground">
            Spandex Salvation Radio • 24/7 Old School Metal
          </p>
        </div>

        {/* Live Indicator */}
        {isPlaying && (
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-500 font-bold text-sm uppercase tracking-wider">
              Broadcasting Live
            </span>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* Main Controls */}
        <div className="flex flex-col items-center space-y-4">
          <Button
            onClick={togglePlayback}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
            <span className="ml-3 text-lg font-semibold">
              {isLoading ? 'CONNECTING...' : isPlaying ? 'STOP RADIO' : 'PLAY LIVE RADIO'}
            </span>
          </Button>

          {/* Volume Control */}
          <div className="flex items-center space-x-4 w-full max-w-xs">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${volume * 100}%, var(--muted) ${volume * 100}%, var(--muted) 100%)`
              }}
            />
            <span className="text-sm text-muted-foreground min-w-[3rem]">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
              <Radio className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Stream Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Streaming directly in your browser</p>
          <p className="text-xs mt-1">High-quality audio stream via secure proxy</p>
        </div>
      </div>
    </div>
  );
}