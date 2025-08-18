import React, { useState, useEffect, useRef } from "react";
import { Volume2, Play, Square } from "lucide-react";
import { Button } from "../components/ui/button";
import { useRadio } from "../contexts/RadioContext";
import { useTheme } from "../contexts/ThemeContext";

import ScrollingText from "../components/ScrollingText";
import InteractiveAlbumArt from "../components/InteractiveAlbumArt";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";

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
    error,
  } = useRadio();

  const { user, updateListeningStatus } = useFirebaseAuth();
  const { getGradient, getColors, currentTheme } = useTheme();
  const colors = getColors();
  
    // Get theme context for styling

  const [isVisible, setIsVisible] = useState(false);
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
      const footerOffset = 200; // Approximate footer height where player should hide

      const isNearBottom = currentScrollY + windowHeight >= documentHeight - footerOffset;

      // Player is visible unless user is near bottom footer
      setIsVisible(!isNearBottom);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle play/pause with listening status update
  const handlePlayPause = async () => {
    try {
      await togglePlayback();
      
      // Update listening status based on new play state
      if (user) {
        await updateListeningStatus(!isPlaying);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  return (
    <div
      className={`fixed bottom-2 left-4 backdrop-blur-md z-50 transition-all duration-1000 ease-in-out rounded-lg shadow-2xl border-0 floating-player-no-focus sticky-player ${
        isVisible
          ? "transform translate-y-0 opacity-100"
          : "transform translate-y-full opacity-0"
      }`}
      style={{ 
        width: "320px", 
        maxWidth: "calc(100vw - 32px)",
        background: 'rgba(0, 0, 0, 0.12)',
        backdropFilter: 'blur(32px) saturate(220%)',
        WebkitBackdropFilter: 'blur(32px) saturate(220%)',
        boxShadow: `0 14px 48px ${colors.primary}25, 0 0 24px ${colors.primary}12`,
        color: colors.text,
        border: 'none',
        outline: 'none'
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
            className="w-12 h-12 shadow-none"
            isAd={isAdPlaying}
            noShadow={true}
          />

          {/* Track Info with 60% width of player box */}
          <div className="min-w-0 ml-3 focus-safe-area" style={{ width: "60%" }}>
            {/* Error Display */}
            {error && (
              <div className="mb-1 flex justify-start items-center space-x-2">
                <div
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold text-white animate-pulse"
                  style={{
                    background: `linear-gradient(45deg, #ef4444, #dc2626)`,
                    boxShadow: `0 1px 4px #ef444460`,
                  }}
                >
                  <span className="mr-1 text-xs">⚠️</span>
                  ERROR
                  <span className="ml-1 opacity-80 text-xs">
                    • {error.length > 20 ? error.substring(0, 20) + '...' : error}
                  </span>
                </div>
                <button
                  onClick={handlePlayPause}
                  className="px-2 py-0.5 text-xs font-medium rounded bg-red-600 hover:bg-red-700 text-white transition-colors focus:outline-none focus:ring-0"
                  title="Retry playback"
                >
                  RETRY
                </button>
              </div>
            )}
            
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
                className="font-semibold text-xs whitespace-nowrap"
                style={{ 
                  color: isAdPlaying ? '#f87171' : colors.text
                }}
                maxWidth="85%"
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
                <div className={`w-2 h-2 rounded-full animate-pulse relative flex-shrink-0 ${
                  isAdPlaying ? 'bg-red-600' : 'bg-red-500'
                }`}></div>
                <span className={`text-xs font-medium flex-shrink-0 ${
                  isAdPlaying ? 'text-red-600' : 'text-red-500'
                }`}>
                  {isAdPlaying ? 'AD' : 'LIVE'}
                </span>
              </div>

              {/* Volume Controls - Centered between LIVE and play button */}
              <div className="hidden sm:flex items-center justify-center flex-1 mx-2 focus-safe-area">
                <div className="flex items-center space-x-2 focus-safe-area">
                  <Volume2 
                    className="h-3 w-3 cursor-pointer transition-colors flex-shrink-0 focus:outline-none focus:ring-0" 
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
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleMute();
                      }
                    }}
                  />
                  <div 
                    className="w-16 h-1 rounded-full relative flex-shrink-0"
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
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer focus:outline-none focus:ring-0"
                      aria-label="Volume control"
                      title="Adjust volume"
                      style={{
                        outline: 'none',
                        border: 'none'
                      }}
                    />
                  </div>
                  <span 
                    className="text-xs font-medium min-w-[20px] text-center flex-shrink-0"
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
                    borderColor: colors.primary, 
                    borderTopColor: 'transparent' 
                  }}
                ></div>
              </div>
            )}
            <Button
              onClick={handlePlayPause}
              className="text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border-0 focus:outline-none focus:ring-0"
              style={{
                background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 4px 20px ${colors.primary}60`,
                opacity: isLoading ? 0.5 : 1,
                border: "none",
                outline: "none",
                '--tw-ring-color': colors.primary,
                transform: 'scale(1)',
                transition: 'all 0.3s ease'
              } as React.CSSProperties & { '--tw-ring-color': string }}
              aria-label={isLoading ? "Connecting..." : isPlaying ? "Stop radio stream" : "Play radio stream"}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = `0 6px 24px ${colors.primary}80`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = `0 4px 20px ${colors.primary}60`;
                }
              }}
              onMouseDown={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }
              }}
              onMouseUp={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
            >
              {!isLoading && (
                <>
                  {isPlaying ? (
                    <Square
                      className="h-6 w-6"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  ) : (
                    <Play
                      className="h-6 w-6"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
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
