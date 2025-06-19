import { Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRadio } from "@/contexts/RadioContext";
import ThemedMusicLogo from "@/components/ThemedMusicLogo";
import ScrollingText from "@/components/ScrollingText";

export default function StickyPlayer() {
  const { isPlaying, volume, currentTrack, togglePlayback, setVolume } = useRadio();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value) / 100;
    setVolume(newVolume);
  };

  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Now Playing Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-lg">
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
                    <ThemedMusicLogo size="sm" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ThemedMusicLogo size="sm" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 transition-opacity duration-300">
              <ScrollingText 
                text={currentTrack.title}
                className="font-semibold text-foreground"
                maxWidth="100%"
              />
              <p className="text-muted-foreground text-sm truncate">
                {currentTrack.artist} • {currentTrack.album}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={togglePlayback}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white w-12 h-12 rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-500 font-bold animate-pulse">LIVE</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center space-x-4 ml-8">
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
  );
}
