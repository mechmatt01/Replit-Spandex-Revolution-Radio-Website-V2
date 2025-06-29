import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRadio } from "@/contexts/RadioContext";
import { useTheme } from "@/contexts/ThemeContext";
import ScrollingText from "@/components/ScrollingText";
import InteractiveAlbumArt from "@/components/InteractiveAlbumArt";
import { useState, useEffect } from "react";

export default function StickyPlayer() {
  const { isPlaying, volume, currentTrack, stationName, isTransitioning, togglePlayback, setVolume } = useRadio();
  const { getGradient, getColors } = useTheme();
  const colors = getColors();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value) / 100;
    setVolume(newVolume);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const footerOffset = 200; // Approximate footer height

      // Check if near bottom of page
      const isNearBottom = (currentScrollY + windowHeight) >= (documentHeight - footerOffset);

      if (isNearBottom) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or near top
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`fixed bottom-2 left-4 bg-card/95 backdrop-blur-sm z-40 transition-all duration-500 rounded-2xl shadow-lg ${
      isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-full opacity-0'
    }`} style={{ width: '320px', maxWidth: 'calc(100vw - 32px)' }}>
      <div className="w-full px-3 py-2 relative">
        {/* Compact floating player layout */}
        <div className="flex items-center justify-between mb-2">
          {/* Album Art */}
          <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <InteractiveAlbumArt 
              artwork={currentTrack.artwork}
              title={currentTrack.title}
              artist={currentTrack.artist}
              size="sm"
              className="w-12 h-12"
            />
          </div>

          {/* Track Info with 60% width of player box */}
          <div className={`min-w-0 ml-3 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`} style={{ width: '60%' }}>
            <div className="w-full">
              <ScrollingText 
                text={currentTrack.title !== stationName ? currentTrack.title : stationName}
                className="font-semibold text-foreground text-sm"
                maxWidth="100%"
                isFloating={true}
                backgroundColor="hsl(var(--background))"
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center space-x-1">
                {/* LIVE indicator with red dot - restored */}
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-500 font-medium">LIVE</span>
              </div>
              
              {/* Volume Controls - Centered between LIVE and play button */}
              <div className="hidden sm:flex items-center justify-center flex-1 mx-2">
                <div className="flex items-center space-x-1">
                  <Volume2 className="text-gray-400 h-3 w-3" />
                  <div className="w-16 h-1 bg-gray-700 rounded-full relative">
                    <div 
                      className="h-1 rounded-full transition-all duration-150"
                      style={{ 
                        width: `${volume * 100}%`,
                        background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`
                      }}
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
                  <span className="text-xs text-gray-400 font-medium min-w-[20px] text-center">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Play Button */}
          <Button
            onClick={togglePlayback}
            className="text-white w-10 h-10 rounded-full focus:outline-none focus:ring-2 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
            style={{
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 4px 20px ${colors.primary}60`
            }}
            aria-label={isPlaying ? "Pause radio stream" : "Play radio stream"}
          >
            {isPlaying ? (
              <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            ) : (
              <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="7,4 20,12 7,20" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}