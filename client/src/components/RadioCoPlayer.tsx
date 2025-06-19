import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function RadioCoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Using a known working internet radio stream for testing
  const streamUrl = "https://ice1.somafm.com/metal-128-mp3";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial volume
    audio.volume = isMuted ? 0 : volume;

    const handleLoadStart = () => {
      console.log("Audio loading started");
      setIsLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      console.log("Audio can play");
      setIsLoading(false);
    };

    const handleCanPlayThrough = () => {
      console.log("Audio can play through");
      setIsLoading(false);
    };

    const handlePlay = () => {
      console.log("Audio playing");
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };

    const handlePause = () => {
      console.log("Audio paused");
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      // Only show error if we're not intentionally stopping/pausing
      if (audio.src && !audio.paused) {
        setError("Unable to connect to radio stream");
      }
    };

    const handleWaiting = () => {
      console.log("Audio waiting/buffering");
      setIsLoading(true);
    };

    const handlePlaying = () => {
      console.log("Audio playing smoothly");
      setIsLoading(false);
    };

    const handleStalled = () => {
      console.log("Audio stalled");
      setIsLoading(true);
    };

    const handleSuspend = () => {
      console.log("Audio suspended");
      setIsLoading(false);
    };

    // Add event listeners
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
  }, [volume, isMuted]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setError(null); // Clear any errors when pausing
      } else {
        setIsLoading(true);
        setError(null);
        
        // Set the stream URL directly
        audio.src = streamUrl;
        
        // Try to play without explicit load() call
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error: any) {
      console.error("Playback error:", error);
      let errorMessage = "Failed to start playback";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Please click play to start the stream";
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "Stream format not supported";
      } else if (error.name === 'AbortError') {
        errorMessage = "Stream loading was interrupted";
      }
      
      setError(errorMessage);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume;
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : volume;
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border/20">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
      />

      {/* Album Art */}
      <div className="flex justify-center mb-6">
        <div className="w-32 h-32 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl flex items-center justify-center shadow-lg">
          <Music className="text-white h-12 w-12" />
        </div>
      </div>

      {/* Track Info */}
      <div className="text-center mb-6">
        <h3 className="font-bold text-xl mb-2 text-foreground">
          Metal Detector Radio
        </h3>
        <p className="text-foreground font-semibold mb-1">
          SomaFM Metal Stream
        </p>
        <p className="text-muted-foreground text-sm font-medium">
          Live Radio • Metal Genre
        </p>
      </div>

      <div className="flex items-center justify-center space-x-6">
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlayback}
          disabled={isLoading}
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          ) : isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
          <span className="ml-3 font-semibold text-lg">
            {isLoading ? 'CONNECTING...' : isPlaying ? 'STOP' : 'PLAY LIVE'}
          </span>
        </Button>

        {/* Volume Controls */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="sm"
            className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] p-2"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1"
          />
          
          <span className="text-[var(--color-primary)] text-sm font-semibold min-w-[40px]">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

        {/* Live Indicator */}
        {isPlaying && (
          <div className="flex items-center space-x-2 text-red-500">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold">LIVE</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 text-center text-red-400 text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
}