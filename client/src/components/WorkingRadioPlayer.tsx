import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Radio, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkingRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.crossOrigin = "anonymous";

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
      console.log('Audio loading started');
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
      console.log('Audio can play');
    };

    const handleCanPlayThrough = () => {
      setIsLoading(false);
      setError(null);
      console.log('Audio can play through');
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
      console.log('Audio playing');
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
      console.log('Audio paused');
    };

    const handleError = (e: Event) => {
      const audioError = (e.target as HTMLAudioElement)?.error;
      setIsPlaying(false);
      setIsLoading(false);
      
      let errorMessage = 'Connection failed';
      if (audioError) {
        switch (audioError.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Stream aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio format error';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Stream not supported';
            break;
          default:
            errorMessage = 'Unknown error';
        }
      }
      
      setError(errorMessage);
      console.error('Audio error:', errorMessage, audioError);
    };

    const handleWaiting = () => {
      setIsLoading(true);
      console.log('Audio waiting/buffering');
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setError(null);
      console.log('Audio playing smoothly');
    };

    const handleStalled = () => {
      setIsLoading(true);
      console.log('Audio stalled');
    };

    const handleSuspend = () => {
      setIsLoading(false);
      console.log('Audio suspended');
    };

    // Add all event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('suspend', handleSuspend);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('suspend', handleSuspend);
    };
  }, [volume]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        audio.load();
        setIsPlaying(false);
        setIsLoading(false);
      } else {
        setIsLoading(true);
        setError(null);
        setConnectionAttempts(prev => prev + 1);
        
        // Use our server proxy endpoint
        const streamUrl = `/api/radio-stream?t=${Date.now()}`;
        console.log('Attempting to connect to stream:', streamUrl);
        
        audio.src = streamUrl;
        audio.volume = volume;
        audio.load();
        
        // Attempt to play with promise handling
        try {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            await playPromise;
            console.log('Stream started successfully');
          }
        } catch (playError) {
          console.error('Play promise rejected:', playError);
          throw playError;
        }
      }
    } catch (err) {
      setIsPlaying(false);
      setIsLoading(false);
      setError('Unable to connect to stream');
      console.error('Toggle playback error:', err);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const retryConnection = () => {
    setError(null);
    setConnectionAttempts(0);
    if (!isPlaying) {
      togglePlayback();
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/20">
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        preload="none"
        controls={false}
      />

      <div className="flex items-center justify-center space-x-6">
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlayback}
          disabled={isLoading}
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          <span className="ml-2 font-semibold">
            {isLoading ? 'CONNECTING...' : isPlaying ? 'STOP' : 'PLAY LIVE'}
          </span>
        </Button>

        {/* Live Indicator */}
        {isPlaying && !isLoading && (
          <div className="flex items-center space-x-2 text-red-500">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold">LIVE</span>
          </div>
        )}

        {/* Connection Status */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-blue-500">
            <Radio className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Connecting to stream...</span>
          </div>
        )}

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${volume * 100}%, var(--muted) ${volume * 100}%, var(--muted) 100%)`
            }}
          />
          <span className="text-sm text-muted-foreground min-w-[3rem]">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Error Display with Retry */}
      {error && (
        <div className="mt-4 flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2 text-red-500 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button
            onClick={retryConnection}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Debug Info */}
      {connectionAttempts > 0 && (
        <div className="mt-2 text-center text-xs text-muted-foreground">
          Connection attempts: {connectionAttempts}
        </div>
      )}
    </div>
  );
}