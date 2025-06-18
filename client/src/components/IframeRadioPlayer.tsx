import { useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IframeRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-4">
        <Button
          onClick={togglePlayback}
          className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          <span className="ml-2 font-semibold">
            {isPlaying ? 'PAUSE' : 'PLAY LIVE'}
          </span>
        </Button>

        {isPlaying && (
          <div className="flex items-center space-x-2 text-red-500">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold">LIVE</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Hidden iframe for audio streaming */}
      {isPlaying && (
        <iframe
          src="http://168.119.74.185:9858/autodj"
          className="hidden"
          title="Radio Stream"
          allow="autoplay"
        />
      )}
      
      {/* HTML5 Audio with direct stream */}
      {isPlaying && (
        <audio
          controls
          autoPlay
          ref={(audio) => {
            if (audio) {
              audio.volume = volume;
            }
          }}
          className="w-full max-w-md"
          style={{ height: '40px' }}
        >
          <source src="http://168.119.74.185:9858/autodj" type="audio/mpeg" />
          <source src="http://168.119.74.185:9858/autodj.mp3" type="audio/mpeg" />
          <source src="http://168.119.74.185:9858/stream" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}