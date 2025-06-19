import { Pause, Play, Volume2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRadio } from "@/contexts/RadioContext";

export default function StickyPlayer() {
  const { isPlaying, volume, togglePlayback } = useRadio();
  
  // Stream info
  const trackTitle = "Metal Detector Radio";
  const trackArtist = "SomaFM Metal Stream";

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    // Volume control handled by RadioContext
  };

  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Now Playing Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg flex items-center justify-center">
              <Music className="text-white h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-foreground truncate">
                {trackTitle}
              </h4>
              <p className="text-muted-foreground text-sm truncate">
                {trackArtist}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center space-x-6">
            <Button
              onClick={togglePlayback}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white w-12 h-12 rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-500 font-bold">LIVE</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center space-x-3">
            <Volume2 className="text-gray-400 h-4 w-4" />
            <div className="w-20 h-1 bg-gray-700 rounded-full relative">
              <div 
                className="h-1 bg-[var(--color-primary)] rounded-full transition-all duration-150"
                style={{ width: `${volume * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
