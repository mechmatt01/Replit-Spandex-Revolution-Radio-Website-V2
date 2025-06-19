import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useRadio } from "@/contexts/RadioContext";
import ThemedMusicLogo from "@/components/ThemedMusicLogo";

export default function RadioCoPlayer() {
  const { 
    isPlaying, 
    isLoading, 
    volume, 
    isMuted, 
    error, 
    currentTrack,
    togglePlayback, 
    setVolume, 
    toggleMute,
    audioRef 
  } = useRadio();

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
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
        <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg">
          {currentTrack.artwork ? (
            <div className="w-full h-full">
              <img 
                src={currentTrack.artwork} 
                alt={`${currentTrack.title} by ${currentTrack.artist}`}
                className="w-full h-full object-cover transition-opacity duration-500"
                onError={(e) => {
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {
                    e.currentTarget.style.display = 'none';
                    fallback.style.display = 'flex';
                  }
                }}
              />
              <div className="w-full h-full hidden items-center justify-center">
                <ThemedMusicLogo size="lg" />
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ThemedMusicLogo size="lg" />
            </div>
          )}
        </div>
      </div>

      {/* Track Info with Fade Animation */}
      <div className="text-center mb-6">
        <div className="transition-opacity duration-300">
          <h3 className="font-bold text-xl mb-2 text-foreground">
            {currentTrack.title}
          </h3>
          <p className="text-foreground font-semibold mb-1">
            {currentTrack.artist}
          </p>
          <p className="text-muted-foreground text-sm font-medium">
            {currentTrack.album} • Live Radio
          </p>
        </div>
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
            <span className="text-sm font-bold animate-pulse">LIVE</span>
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