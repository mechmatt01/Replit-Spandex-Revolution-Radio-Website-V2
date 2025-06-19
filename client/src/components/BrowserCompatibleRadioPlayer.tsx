import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Radio, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrowserCompatibleRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setConnectionError(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setConnectionError(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setConnectionError(false);
    };

    const handleError = (e: Event) => {
      setIsPlaying(false);
      setIsLoading(false);
      setConnectionError(true);
      console.error('Audio error:', e);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setConnectionError(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [volume]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      setIsLoading(true);
      setConnectionError(false);
      
      // Set a timeout to handle long loading times
      const loadTimeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setConnectionError(true);
        }
      }, 10000); // 10 second timeout

      audio.play().then(() => {
        clearTimeout(loadTimeout);
      }).catch((error) => {
        clearTimeout(loadTimeout);
        setIsLoading(false);
        setConnectionError(true);
        console.error('Play failed:', error);
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const openDirectStream = () => {
    window.open('http://168.119.74.185:9858/autodj', '_blank');
  };

  const openPlayerWindow = () => {
    const playerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Spandex Salvation Radio - Live Stream</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: #111; 
            color: #fff; 
            text-align: center; 
            padding: 20px; 
          }
          audio { 
            width: 100%; 
            margin: 20px 0; 
          }
          h1 { color: #ff6b35; }
        </style>
      </head>
      <body>
        <h1>🎸 Spandex Salvation Radio 🎸</h1>
        <p>Live 24/7 Old School Metal</p>
        <audio controls autoplay>
          <source src="http://168.119.74.185:9858/autodj" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
        <p>Now playing live from our radio station!</p>
      </body>
      </html>
    `;
    
    const blob = new Blob([playerHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'width=500,height=400,toolbar=no,menubar=no,location=no');
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/20">
      <div className="flex items-center justify-center space-x-6 flex-wrap gap-4">
        {/* HTML5 Audio Element */}
        <audio 
          ref={audioRef} 
          src="http://168.119.74.185:9858/autodj"
          preload="metadata"
          crossOrigin="anonymous"
        />

        {/* Play/Pause Button */}
        <Button
          onClick={togglePlayback}
          disabled={isLoading}
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70"
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

        {/* Player Window Button */}
        <Button
          onClick={openPlayerWindow}
          variant="outline"
          className="border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white py-3 px-4 rounded-xl transition-all duration-300"
        >
          <Radio className="h-5 w-5 mr-2" />
          <span className="font-semibold">PLAYER</span>
        </Button>

        {/* Direct Stream Button */}
        <Button
          onClick={openDirectStream}
          variant="outline"
          className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-3 px-4 rounded-xl transition-all duration-300"
        >
          <ExternalLink className="h-5 w-5 mr-2" />
          <span className="font-semibold">DIRECT</span>
        </Button>

        {/* Live Indicator */}
        {isPlaying && !isLoading && (
          <div className="flex items-center space-x-2 text-red-500">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold">LIVE</span>
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

      {/* Connection Error */}
      {connectionError && (
        <div className="mt-4 text-center">
          <p className="text-red-500 text-sm mb-2">
            Connection issues detected. Try the PLAYER or DIRECT buttons above.
          </p>
        </div>
      )}

      {/* Stream Info */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Live Metal Radio • 24/7 Old School Classics</p>
        <p className="text-xs mt-1">
          Multiple streaming options: Embedded player, popup window, or direct stream
        </p>
      </div>
    </div>
  );
}