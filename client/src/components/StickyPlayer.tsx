import { SkipBack, SkipForward, Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";

export default function StickyPlayer() {
  const { currentTrack, isPlaying, volume, togglePlayback, setVolume, nextTrack, previousTrack } = useAudio();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-border backdrop-blur-sm z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Now Playing Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-metal-orange to-metal-red rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">♪</span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-white truncate">{currentTrack.title}</h4>
              <p className="text-gray-400 text-sm truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={previousTrack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={togglePlayback}
              className="w-10 h-10 bg-metal-orange hover:bg-orange-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={nextTrack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center space-x-3">
            <Volume2 className="text-gray-400 h-4 w-4" />
            <div className="w-20 h-1 bg-gray-700 rounded-full relative">
              <div 
                className="h-1 bg-metal-orange rounded-full transition-all duration-150"
                style={{ width: `${volume}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
