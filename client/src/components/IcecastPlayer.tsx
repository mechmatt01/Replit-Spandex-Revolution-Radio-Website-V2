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
  const [volume, setVolume] = useState(70);
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
      setError('Failed to load radio stream');
      console.error('Icecast stream error:', e);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      console.log('Loading Icecast stream...');
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
    };

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

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        // Reset audio source to ensure fresh connection
        audio.src = ICECAST_STREAM_URL;
        audio.load();
        await audio.play();
      }
    } catch (error) {
      console.error('Playback error:', error);
      setError('Playback failed');
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    if (newVolume[0] > 0) {
      setIsMuted(false);
    }
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <audio
        ref={audioRef}
        preload="none"
        style={{ display: 'none' }}
      />
      
      {/* Play/Pause Button */}
      <Button
        onClick={togglePlayback}
        disabled={isLoading}
        size="lg"
        className="bg-metal-orange hover:bg-metal-orange/90 text-black font-bold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
      >
        {isLoading ? (
          <div className="w-6 h-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
        ) : isPlaying ? (
          <Pause className="h-6 w-6 mr-2" />
        ) : (
          <Play className="h-6 w-6 mr-2" />
        )}
        {isLoading ? 'Loading...' : isPlaying ? 'Pause Live' : 'Play Live'}
      </Button>

      {/* Volume Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="text-foreground hover:text-metal-orange"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        
        <div className="w-20">
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
        
        <span className="text-xs text-muted-foreground w-8">
          {isMuted ? '0' : volume}%
        </span>
      </div>

      {/* Status */}
      {error && (
        <span className="text-red-500 text-xs">{error}</span>
      )}
      
      {isPlaying && !error && (
        <div className="flex items-center space-x-1 text-green-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">LIVE</span>
        </div>
      )}
    </div>
  );
}