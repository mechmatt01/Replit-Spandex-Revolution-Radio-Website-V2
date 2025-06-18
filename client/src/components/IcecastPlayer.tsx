import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const ICECAST_STREAM_URL = "http://168.119.74.185:9858/autodj";

interface IcecastPlayerProps {
  className?: string;
}

export default function IcecastPlayer({ className = "" }: IcecastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7); // Use 0-1 range
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsLoading(false);
      setError(null);
      console.log('Icecast stream ready');
    };

    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
      console.log('Icecast stream playing');
    };

    const handlePause = () => {
      setIsPlaying(false);
      console.log('Icecast stream paused');
    };

    const handleError = (e: any) => {
      setIsPlaying(false);
      setIsLoading(false);
      setError('Stream temporarily unavailable');
      console.error('Icecast stream error:', e);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      console.log('Loading Icecast stream...');
    };

    const handleWaiting = () => {
      setIsLoading(true);
      console.log('Buffering stream...');
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      console.log('Stream data loaded');
    };

    // Add event listeners
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('loadeddata', handleLoadedData);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('loadeddata', handleLoadedData);
    };
  }, []);

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        setIsLoading(true);
        setError(null);
        
        // Set stream URL with cache busting
        const streamUrl = `${ICECAST_STREAM_URL}?t=${Date.now()}`;
        console.log('Connecting to Icecast stream:', streamUrl);
        
        audioRef.current.src = streamUrl;
        audioRef.current.load();
        
        await audioRef.current.play();
      }
    } catch (err) {
      setIsPlaying(false);
      setIsLoading(false);
      setError('Failed to start stream');
      console.error('Play failed:', err);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100; // Convert percentage to 0-1 range
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  return (
    <div className={`flex items-center gap-4 p-4 bg-black/80 rounded-lg border border-orange-500/30 ${className}`}>
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="metadata"
      />
      
      <Button
        onClick={togglePlayback}
        disabled={isLoading}
        variant="outline"
        size="lg"
        className="bg-orange-500 hover:bg-orange-600 text-black border-orange-500 min-w-[120px]"
      >
        {isLoading ? (
          <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
        ) : isPlaying ? (
          <>
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Play Live
          </>
        )}
      </Button>

      <div className="flex items-center gap-2 min-w-[200px]">
        <Button
          onClick={toggleMute}
          variant="ghost"
          size="sm"
          className="text-orange-500 hover:text-orange-400 p-1"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        
        <Slider
          value={[isMuted ? 0 : volume * 100]}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
          className="flex-1"
        />
        
        <span className="text-orange-400 text-sm min-w-[35px]">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>

      {error && (
        <span className="text-red-400 text-sm">{error}</span>
      )}
      
      {isPlaying && !error && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-orange-400 text-sm font-medium">LIVE</span>
        </div>
      )}
    </div>
  );
}