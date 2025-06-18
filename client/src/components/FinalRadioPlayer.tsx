import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinalRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Use effect to handle audio setup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial properties
    audio.crossOrigin = "anonymous";
    audio.preload = "none";
    audio.volume = volume;

    // Event handlers
    const handlePlay = () => {
      setIsPlaying(true);
      setError(null);
      console.log('Radio playing');
    };

    const handlePause = () => {
      setIsPlaying(false);
      console.log('Radio paused');
    };

    const handleError = (e: any) => {
      setIsPlaying(false);
      setError('Stream connection failed');
      console.error('Radio error:', e);
    };

    const handleCanPlay = () => {
      setError(null);
      console.log('Radio ready');
    };

    // Add listeners
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [volume]);

  const handlePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        audio.src = '';
      } else {
        setError(null);
        // Set stream URL with cache busting
        audio.src = `http://168.119.74.185:9858/autodj?cb=${Date.now()}`;
        audio.load();
        await audio.play();
      }
    } catch (err) {
      setIsPlaying(false);
      setError('Unable to play stream');
      console.error('Play error:', err);
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
      {/* Hidden audio element */}
      <audio ref={audioRef} />
      
      {/* Player Interface */}
      <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 space-y-6">
        {/* Main Play Button */}
        <div className="flex flex-col items-center space-y-4">
          <Button
            onClick={handlePlay}
            size="lg"
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 mr-3" />
            ) : (
              <Play className="h-6 w-6 mr-3" />
            )}
            <span className="text-lg font-semibold">
              {isPlaying ? 'STOP RADIO' : 'PLAY LIVE RADIO'}
            </span>
          </Button>
          
          {/* Live Indicator */}
          {isPlaying && (
            <div className="flex items-center space-x-3 text-red-500">
              <Radio className="h-5 w-5 animate-pulse" />
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold uppercase tracking-wider">Broadcasting Live</span>
            </div>
          )}
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center space-x-4">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 max-w-xs">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${volume * 100}%, var(--muted) ${volume * 100}%, var(--muted) 100%)`
              }}
            />
          </div>
          <span className="text-sm text-muted-foreground min-w-[3rem]">
            {Math.round(volume * 100)}%
          </span>
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
          <p>Spandex Salvation Radio • 24/7 Old School Metal</p>
          <p className="text-xs mt-1">Direct stream from http://168.119.74.185:9858</p>
        </div>
      </div>
    </div>
  );
}