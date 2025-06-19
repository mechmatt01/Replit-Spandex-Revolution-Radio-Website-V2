import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinalRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [volume]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      audio.src = '';
      audio.load();
    } else {
      setIsLoading(true);
      
      try {
        // Use our server proxy endpoint with cache busting
        const streamUrl = `/api/radio-stream?t=${Date.now()}`;
        audio.src = streamUrl;
        audio.volume = volume;
        audio.load();
        
        // Wait a moment for the stream to buffer
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (error) {
        console.error('Playback failed:', error);
        setIsLoading(false);
        // If proxy fails, try direct stream
        try {
          audio.src = 'http://168.119.74.185:9858/autodj';
          audio.load();
          await audio.play();
        } catch (directError) {
          console.error('Direct stream also failed:', directError);
          setIsLoading(false);
        }
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const openInNewWindow = () => {
    window.open('http://168.119.74.185:9858/autodj', '_blank', 'width=400,height=300,toolbar=no,menubar=no');
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/20">
      <div className="flex items-center justify-center space-x-6">
        {/* HTML5 Audio Element */}
        <audio 
          ref={audioRef} 
          src="http://168.119.74.185:9858/autodj"
          preload="none"
          crossOrigin="anonymous"
        />

        {/* Play/Pause Button */}
        <Button
          onClick={togglePlayback}
          disabled={isLoading}
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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

        {/* Alternative Stream Button */}
        <Button
          onClick={openInNewWindow}
          variant="outline"
          className="border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white py-3 px-4 rounded-xl transition-all duration-300"
        >
          <Radio className="h-5 w-5 mr-2" />
          <span className="font-semibold">STREAM</span>
        </Button>

        {/* Live Indicator */}
        {isPlaying && (
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

      {/* Stream Info */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Live Metal Radio • 24/7 Old School Classics</p>
        <p className="text-xs mt-1">If audio doesn't play automatically, use the STREAM button</p>
      </div>
    </div>
  );
}