import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useRadio } from "@/contexts/RadioContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemedMusicLogo from "@/components/ThemedMusicLogo";
import ScrollingText from "@/components/ScrollingText";
import InteractiveAlbumArt from "@/components/InteractiveAlbumArt";

export default function RadioCoPlayer() {
  const { 
    isPlaying, 
    isLoading, 
    volume, 
    isMuted, 
    error, 
    currentTrack,
    isTransitioning,
    togglePlayback, 
    setVolume, 
    toggleMute,
    audioRef 
  } = useRadio();
  const { getColors, getGradient } = useTheme();
  const colors = getColors();

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
  };

  return (
    <section 
      className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
      role="region"
      aria-label="Radio player controls"
    >
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
        aria-label="Live radio stream"
      />

      {/* Live Indicator */}
      <div className="flex items-center justify-center space-x-2 text-red-500 mb-4">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-bold animate-pulse">LIVE</span>
      </div>

      {/* Album Art with Fade Transition */}
      <div className="flex justify-center mb-6">
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <InteractiveAlbumArt 
            artwork={currentTrack.artwork}
            title={currentTrack.title}
            artist={currentTrack.artist}
            size="md"
          />
        </div>
      </div>

      {/* Track Info with Fade Animation */}
      <div className="text-center mb-6">
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex justify-center mb-2">
            <ScrollingText 
              text={currentTrack.title}
              className="font-bold text-foreground"
              style={{ fontSize: '22px' }}
              maxWidth="75%"
              backgroundColor="hsl(var(--background))"
            />
          </div>
          {currentTrack.album && 
           currentTrack.album !== "New York's Hip Hop & R&B" && 
           currentTrack.album !== "Live Stream" && 
           currentTrack.album !== currentTrack.title && 
           currentTrack.album !== currentTrack.artist && (
            <p className="text-foreground font-semibold text-lg mb-1 transition-opacity duration-500">
              {currentTrack.album}
            </p>
          )}
          {currentTrack.artist && currentTrack.artist !== currentTrack.title && currentTrack.artist !== "Live Stream" && (
            <p className="text-foreground font-medium text-base mb-2 transition-opacity duration-500">
              {currentTrack.artist}
            </p>
          )}
          {currentTrack.title !== "Live Stream" && currentTrack.artist !== "Live Stream" && (
            <p className="text-muted-foreground text-sm font-medium">
              Live Stream
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlayback}
          disabled={isLoading}
          className="font-bold py-6 px-10 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-110 disabled:opacity-50 disabled:transform-none text-xl border-2"
          style={{
            background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
            color: 'white',
            borderColor: colors.primary,
            boxShadow: `0 10px 40px ${colors.primary}60`
          }}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          ) : isPlaying ? (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          ) : (
            <Play className="h-6 w-6" />
          )}
          <span className="ml-3 font-semibold text-lg">
            {isLoading ? 'CONNECTING...' : isPlaying ? 'STOP' : 'PLAY LIVE'}
          </span>
        </Button>

        {/* Volume Controls */}
        <div className="flex items-center justify-center gap-3 w-full max-w-[250px]">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="sm"
            className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] p-1"
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

      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 text-center text-red-400 text-sm font-medium">
          {error}
        </div>
      )}
    </section>
  );
}