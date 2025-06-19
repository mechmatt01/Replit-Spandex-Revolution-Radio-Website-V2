import { Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRadio } from "@/contexts/RadioContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemedMusicLogo from "@/components/ThemedMusicLogo";
import ScrollingText from "@/components/ScrollingText";
import InteractiveAlbumArt from "@/components/InteractiveAlbumArt";

export default function StickyPlayer() {
  const { isPlaying, volume, currentTrack, togglePlayback, setVolume } = useRadio();
  const { getGradient } = useTheme();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value) / 100;
    setVolume(newVolume);
  };

  // Debug logging
  console.log('StickyPlayer - isPlaying:', isPlaying, 'currentTrack:', currentTrack);

  // Only show when radio is playing
  if (!isPlaying) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm z-50 transition-colors duration-300 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Now Playing Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0 max-w-md">
            <InteractiveAlbumArt 
              artwork={currentTrack.artwork}
              title={currentTrack.title}
              artist={currentTrack.artist}
              size="sm"
            />
            <div className="min-w-0 flex-1 transition-opacity duration-300">
              <div className="w-full max-w-xs">
                <ScrollingText 
                  text={currentTrack.title}
                  className="font-semibold text-foreground"
                  maxWidth="100%"
                  isFloating={true}
                />
              </div>
              <p className="text-muted-foreground text-sm truncate">
                {currentTrack.artist} • {currentTrack.album}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-500 font-bold animate-pulse">LIVE</span>
            </div>
            
            <Button
              onClick={togglePlayback}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white w-12 h-12 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-center relative"
              aria-label={isPlaying ? "Pause radio stream" : "Play radio stream"}
            >
              {isPlaying ? (
                <div className="flex items-center justify-center">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-6 bg-white rounded-sm"></div>
                    <div className="w-1.5 h-6 bg-white rounded-sm"></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center ml-0.5">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                </div>
              )}
            </Button>

            {/* Volume Control */}
            <div className="hidden md:flex items-center space-x-4">
              <Volume2 className="text-gray-400 h-4 w-4" />
              <div className="w-20 h-1 bg-gray-700 rounded-full relative">
                <div 
                  className="h-1 bg-[var(--color-primary)] rounded-full transition-all duration-150"
                  style={{ width: `${volume * 100}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume * 100}
                  onChange={handleVolumeChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
