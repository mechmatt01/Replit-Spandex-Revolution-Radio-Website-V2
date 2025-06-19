import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { useRadio } from "@/contexts/RadioContext";

export default function Hot97Player() {
  const { isPlaying, togglePlayback, volume, setVolume } = useRadio();
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        setIsLoaded(true);
        console.log("Hot 97 TuneIn player loaded");
      };
      
      iframe.addEventListener('load', handleLoad);
      return () => iframe.removeEventListener('load', handleLoad);
    }
  }, []);

  const handlePlayToggle = () => {
    togglePlayback();
    
    // Try to communicate with the TuneIn iframe
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        // Send play/pause message to TuneIn player
        iframe.contentWindow.postMessage({
          action: isPlaying ? 'pause' : 'play'
        }, 'https://tunein.com');
      } catch (error) {
        console.log('Cross-origin communication with TuneIn not available');
      }
    }
  };

  return (
    <div className="bg-black/90 backdrop-blur-md rounded-lg p-6 border border-orange-500/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Hot 97</h2>
          <p className="text-orange-400">New York's Hip Hop & R&B</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayToggle}
            className="w-16 h-16 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-black fill-current" />
            ) : (
              <Play className="w-8 h-8 text-black fill-current ml-1" />
            )}
          </button>
          
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-orange-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-orange-500"
            />
          </div>
        </div>
      </div>

      <div className="relative">
        <iframe
          ref={iframeRef}
          src="https://tunein.com/embed/player/s22162/"
          style={{ 
            width: '100%', 
            height: '100px',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          scrolling="no"
          frameBorder="0"
          allow="autoplay"
          title="Hot 97 Live Stream"
          className="rounded-lg"
        />
        
        {!isLoaded && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {isPlaying && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </div>
        </div>
      )}
    </div>
  );
}