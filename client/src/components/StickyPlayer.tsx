import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRadio } from "@/contexts/RadioContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAdaptiveTheme } from "@/hooks/useAdaptiveTheme";
import ScrollingText from "@/components/ScrollingText";
import InteractiveAlbumArt from "@/components/InteractiveAlbumArt";
import { useState, useEffect } from "react";

export default function StickyPlayer() {
  const {
    isPlaying,
    volume,
    currentTrack,
    stationName,
    togglePlayback,
    setVolume,
    isLoading,
    isMuted,
    toggleMute,
    isAdPlaying,
    adInfo,
  } = useRadio();
  const { getGradient, getColors, currentTheme } = useTheme();
  const colors = getColors();
  
  // Adaptive theme for current track artwork
  const { adaptiveTheme, isAnalyzing } = useAdaptiveTheme(
    currentTrack?.artwork && currentTrack.artwork !== 'advertisement' 
      ? currentTrack.artwork 
      : undefined
  );
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value) / 100;
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      toggleMute();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const footerOffset = 200; // Approximate footer height

      // Check if near bottom of page
      const isNearBottom =
        currentScrollY + windowHeight >= documentHeight - footerOffset;

      if (isNearBottom) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or near top
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`fixed bottom-2 left-4 backdrop-blur-md z-50 transition-all duration-700 rounded-2xl shadow-2xl border-0 floating-player-no-focus ${
        isVisible
          ? "transform translate-y-0 opacity-100"
          : "transform translate-y-full opacity-0"
      }`}
      style={{ 
        width: "320px", 
        maxWidth: "calc(100vw - 32px)",
        background: currentTrack?.artwork && currentTrack.artwork !== 'advertisement' 
          ? `linear-gradient(135deg, ${adaptiveTheme.backgroundColor.replace(/[\d.]+\)$/g, '0.12)')}, ${adaptiveTheme.overlayColor.replace(/[\d.]+\)$/g, '0.08)')})`
          : 'rgba(0, 0, 0, 0.12)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        boxShadow: currentTrack?.artwork && currentTrack.artwork !== 'advertisement'
          ? `0 12px 40px ${adaptiveTheme.accentColor}20, inset 0 1px 0 rgba(255, 255, 255, 0.15)`
          : `0 12px 40px ${colors.primary}20, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
        color: currentTrack?.artwork && currentTrack.artwork !== 'advertisement' 
          ? adaptiveTheme.textColor 
          : colors.text,
        border: 'none'
      }}
      role="region"
      aria-label="Floating audio player"
      aria-live="polite"
    >
      <div className="w-full px-3 py-2 relative">
        {/* Compact floating player layout */}
        <div className="flex items-center justify-between mb-2">
          {/* Album Art */}
          <InteractiveAlbumArt
            artwork={isAdPlaying && adInfo.artwork ? adInfo.artwork : currentTrack.artwork}
            title={currentTrack.title}
            artist={currentTrack.artist}
            size="sm"
            className="w-12 h-12"
            isAd={isAdPlaying}
          />

          {/* Track Info with 60% width of player box */}
          <div className="min-w-0 ml-3 focus-safe-area" style={{ width: "60%" }}>
            {/* Ad Detection Badge */}
            {isAdPlaying && (
              <div className="mb-1 flex justify-start">
                <div
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold text-white animate-pulse"
                  style={{
                    background: `linear-gradient(45deg, #ff4444, #cc0000)`,
                    boxShadow: `0 1px 4px #ff444460`,
                  }}
                >
                  <span className="mr-1 text-xs">📢</span>
                  AD
                  {adInfo.company && (
                    <span className="ml-1 opacity-80 text-xs">
                      • {adInfo.company}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="w-full overflow-hidden">
              <ScrollingText
                text={
                  currentTrack.title !== stationName
                    ? currentTrack.title
                    : stationName
                }
                className="font-semibold text-sm whitespace-nowrap"
                style={{ 
                  color: isAdPlaying ? '#f87171' : colors.text
                }}
                maxWidth="100%"
                isFloating={true}
                backgroundColor="transparent"
                alignment="left"
              />
            </div>
            
            {/* Artist Information */}
            {currentTrack.artist && 
             currentTrack.artist !== currentTrack.title &&
             currentTrack.artist !== stationName && (
              <div 
                className="text-xs truncate mt-0.5"
                style={{
                  color: colors.textMuted
                }}
              >
                {currentTrack.artist}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center space-x-1">
                {/* LIVE/AD indicator */}
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  isAdPlaying ? 'bg-red-600' : 'bg-red-500'
                }`}></div>
                <span className={`text-xs font-medium ${
                  isAdPlaying ? 'text-red-600' : 'text-red-500'
                }`}>
                  {isAdPlaying ? 'AD' : 'LIVE'}
                </span>
              </div>

              {/* Volume Controls - Centered between LIVE and play button */}
              <div className="hidden sm:flex items-center justify-center flex-1 mx-2 focus-safe-area">
                <div className="flex items-center space-x-2 focus-safe-area">
                  <Volume2 
                    className="h-3 w-3 cursor-pointer transition-colors" 
                    style={{
                      color: isMuted 
                        ? '#ef4444'  // Red for muted
                        : currentTheme === 'light-mode' 
                          ? '#4b5563'  // Gray for light mode
                          : '#9ca3af'  // Light gray for dark modes
                    }}
                    onMouseEnter={(e) => {
                      if (!isMuted) {
                        e.currentTarget.style.color = currentTheme === 'light-mode' 
                          ? '#374151' 
                          : '#d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isMuted 
                        ? '#ef4444'
                        : currentTheme === 'light-mode' 
                          ? '#4b5563'
                          : '#9ca3af';
                    }}
                    onClick={toggleMute}
                  />
                  <div 
                    className="w-16 h-1 rounded-full relative"
                    style={{
                      backgroundColor: currentTheme === 'light-mode' 
                        ? '#d1d5db'  // Light gray for light mode
                        : '#374151'  // Dark gray for dark modes
                    }}
                  >
                    <div
                      className="h-1 rounded-full transition-all duration-150"
                      style={{
                        width: `${(isMuted ? 0 : volume) * 100}%`,
                        background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                      }}
                    ></div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(isMuted ? 0 : volume) * 100}
                      onChange={handleVolumeChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Volume control"
                      title="Adjust volume"
                    />
                  </div>
                  <span 
                    className="text-xs font-medium min-w-[20px] text-center"
                    style={{
                      color: currentTheme === 'light-mode' 
                        ? '#6b7280'  // Gray for light mode
                        : '#9ca3af'  // Light gray for dark modes
                    }}
                  >
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Play Button */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ 
                    borderColor: currentTrack?.artwork && currentTrack.artwork !== 'advertisement' 
                      ? adaptiveTheme.accentColor
                      : colors.primary, 
                    borderTopColor: 'transparent' 
                  }}
                ></div>
              </div>
            )}
            <Button
              onClick={togglePlayback}
              className="text-white w-10 h-10 rounded-full   flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border-0"
              style={{
                background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 4px 20px ${colors.primary}60`,
                opacity: isLoading ? 0.5 : 1,
                border: "none",
                outline: "none",
                '--tw-ring-color': colors.primary,
              } as React.CSSProperties & { '--tw-ring-color': string }}
              aria-label={isPlaying ? "Pause radio stream" : "Play radio stream"}
              disabled={isLoading}
            >
              {!isLoading && (
                <>
                  {isPlaying ? (
                    <svg
                      className="h-15 w-15"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="16"
                        height="16"
                        rx="4"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-15 w-15"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5c0-.6.4-1 1-1 .2 0 .5.1.7.3l9 7c.8.6.8 1.8 0 2.4l-9 7c-.2.2-.5.3-.7.3-.6 0-1-.4-1-1V5z" />
                    </svg>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
