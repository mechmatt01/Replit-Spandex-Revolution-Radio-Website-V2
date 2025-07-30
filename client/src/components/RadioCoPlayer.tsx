import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio as RadioIcon,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useRadio } from "@/contexts/RadioContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAdaptiveTheme } from "@/hooks/useAdaptiveTheme";
import ThemedMusicLogo from "@/components/ThemedMusicLogo";
import ScrollingText from "@/components/ScrollingText";
import InteractiveAlbumArt from "@/components/InteractiveAlbumArt";
import { useState, useRef, useEffect } from "react";

// RadioStation interface moved to RadioContext
interface RadioStation {
  id: string;
  stationId?: string;
  name: string;
  frequency: string;
  location: string;
  genre: string;
  streamUrl: string;
  description: string;
  icon: string;
}
import MusicLogoPath from "@assets/MusicLogoIcon@3x.png";

// Radio stations data with authentic streaming URLs for current top charts hip-hop, rap, and pop music
const radioStations: RadioStation[] = [
  {
    id: "hot-97",
    stationId: "hot-97",
    name: "Hot 97",
    frequency: "97.1 FM",
    location: "New York, NY", 
    genre: "Hip Hop & R&B",
    streamUrl: "https://stream.revma.ihrhls.com/zc6046",
    description: "New York's #1 Hip Hop & R&B",
    icon: "🔥",
  },
  {
    id: "power-106",
    stationId: "power-106",
    name: "Power 105.1",
    frequency: "105.1 FM",
    location: "New York, NY",
    genre: "Hip Hop & R&B",
    streamUrl: "https://stream.revma.ihrhls.com/zc1481",
    description: "New York's Power 105.1",
    icon: "⚡",
  },
  {
    id: "beat-955",
    stationId: "beat-955",
    name: "95.5 The Beat",
    frequency: "95.5 FM",
    location: "Dallas, TX",
    genre: "Hip Hop & R&B", 
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/KBFBFMAAC.aac",
    description: "Dallas' #1 Hip Hop & R&B",
    icon: "🎵",
  },
  {
    id: "hot-105",
    stationId: "hot-105",
    name: "Hot 105",
    frequency: "105.1 FM",
    location: "Miami, FL",
    genre: "Urban R&B",
    streamUrl: "https://stream.revma.ihrhls.com/zc5907",
    description: "Miami's Today's R&B and Old School",
    icon: "🌴",
  },
  {
    id: "q-93",
    stationId: "q-93",
    name: "Q93",
    frequency: "93.3 FM",
    location: "New Orleans, LA",
    genre: "Hip Hop & R&B",
    streamUrl: "https://stream.revma.ihrhls.com/zc1037",
    description: "New Orleans Hip Hop & R&B",
    icon: "🎺",
  },
  {
    id: "somafm-metal",
    stationId: "somafm-metal",
    name: "SomaFM Metal",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Metal",
    streamUrl: "https://ice1.somafm.com/metal-128-mp3",
    description: "Heavy Metal & Hard Rock",
    icon: "🤘",
  },
];

export default function RadioCoPlayer() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    error,
    togglePlayback,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    changeStation,
    currentStation,
    isAdPlaying,
    adInfo,
  } = useRadio();

  const { getColors, getGradient, currentTheme } = useTheme();
  const colors = getColors();
  
  // Adaptive theme for current track artwork
  const { adaptiveTheme, isAnalyzing } = useAdaptiveTheme(
    currentTrack?.artwork && currentTrack.artwork !== 'advertisement' 
      ? currentTrack.artwork 
      : undefined
  );

  const [isStationDropdownOpen, setIsStationDropdownOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<RadioStation>(
    radioStations[0], // Hot 97 is now the first station
  );
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);

  // Initialize selected station with first station on mount
  useEffect(() => {
    const firstStation = radioStations[0];
    if (firstStation && !selectedStation) {
      setSelectedStation(firstStation);
    }
  }, []);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const volumeButtonRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const stationDropdownRef = useRef<HTMLDivElement>(null);
  const volumeHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        stationDropdownRef.current &&
        !stationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStationDropdownOpen(false);
      }
    };

    if (isStationDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isStationDropdownOpen]);

  // Enhanced volume slider hover handlers with proper debouncing
  const handleVolumeAreaMouseEnter = () => {
    if (volumeHoverTimeoutRef.current) {
      clearTimeout(volumeHoverTimeoutRef.current);
      volumeHoverTimeoutRef.current = null;
    }
    setIsVolumeSliderVisible(true);
  };

  const handleVolumeAreaMouseLeave = () => {
    volumeHoverTimeoutRef.current = setTimeout(() => {
      setIsVolumeSliderVisible(false);
    }, 150); // Small delay to prevent flickering
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (volumeHoverTimeoutRef.current) {
        clearTimeout(volumeHoverTimeoutRef.current);
      }
    };
  }, []);

  const handleStationChange = async (station: RadioStation) => {
    if (station.id === selectedStation.id) return;

    console.log(
      `Attempting to change station to: ${station.name} (${station.streamUrl})`,
    );

    setIsTransitioning(true);
    setSelectedStation(station);
    setIsStationDropdownOpen(false);

    try {
      await changeStation(station);
      // Immediately auto-play the new station after switching
      await togglePlayback();
    } catch (err) {
      console.error("Failed to switch station:", err);
    }

    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <section
      className="backdrop-blur-md rounded-2xl p-6 shadow-xl transition-all duration-700 ease-in-out border-0"
      role="region"
      aria-label="Radio player controls"
      style={{
        background: currentTrack?.artwork && currentTrack.artwork !== 'advertisement' 
          ? `linear-gradient(135deg, ${adaptiveTheme.backgroundColor.replace(/[\d.]+\)$/g, '0.08)')}, ${adaptiveTheme.overlayColor.replace(/[\d.]+\)$/g, '0.05)')})`
          : 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        boxShadow: currentTrack?.artwork && currentTrack.artwork !== 'advertisement'
          ? `0 8px 32px ${adaptiveTheme.accentColor}15, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
          : `0 8px 32px ${colors.primary}15, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
        color: currentTrack?.artwork && currentTrack.artwork !== 'advertisement' 
          ? adaptiveTheme.textColor 
          : colors.text,
        border: 'none'
      }}
    >
      {/* Hidden Audio Element */}
      <audio
        ref={useRadio().audioRef}
        preload="none"
        crossOrigin="anonymous"
        aria-label="Live radio stream"
      />

      {/* Station Selector */}
      <div className="mb-6">
        <div className="relative" ref={stationDropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStationDropdownOpen(!isStationDropdownOpen)}
            className="bg-card/90 backdrop-blur-sm hover:bg-card/95 transition-all duration-200 text-xs px-3 py-1"
            style={{
              borderColor: colors.primary,
              borderWidth: "2px",
              borderRadius: "12px",
              width: "auto",
            }}
          >
            <RadioIcon
              className="w-3 h-3 mr-1"
              style={{ color: colors.primary }}
            />
            <span style={{ color: colors.primary }}>
              {selectedStation?.name || "95.5 The Beat"}
            </span>
            <ChevronDown
              className={`w-3 h-3 ml-1 transition-transform duration-300 ease-in-out transform ${isStationDropdownOpen ? "rotate-180" : "rotate-0"}`}
              style={{
                opacity: 0.6,
                color: colors.primary,
              }}
            />
          </Button>

          {isStationDropdownOpen && (
            <div
              className="absolute mt-1 left-1/2 transform -translate-x-1/2 max-h-60 overflow-y-auto bg-black/90 backdrop-blur-lg border shadow-xl z-20 scrollbar-thin"
              style={{
                borderColor: colors.primary + "40",
                borderRadius: "12px",
                minWidth: "300px",
              }}
            >
              <div className="p-2">
                {/* Always show selected station first */}
                {selectedStation && (
                  <button
                    key={selectedStation.id + "-selected"}
                    onClick={() => handleStationChange(selectedStation)}
                    className="w-full p-3 text-left rounded-md transition-all duration-300 hover:bg-muted/20 focus:outline-none"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}25)`,
                      border: `1px solid ${colors.primary}80`,
                      boxShadow: `0 2px 8px ${colors.primary}20`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full">
                        <span className="text-lg">{selectedStation.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0 flex items-center">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-white truncate">
                            {selectedStation.name}
                          </div>
                          <div className="text-xs text-gray-300 truncate">
                            {selectedStation.frequency} •{" "}
                            {selectedStation.location}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {selectedStation.description}
                          </div>
                        </div>
                        {isPlaying && (
                          <div className="flex items-center justify-center w-9 h-9">
                            {/* Playing Indicator */}
                            <div className="flex items-center justify-center h-full">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M11 5L6 9H2V15H6L11 19V5Z"
                                  fill={colors.primary}
                                />
                                {/* Animated sound waves */}
                                <path
                                  d="M14 9.5C15.1 10.6 15.1 12.4 14 13.5"
                                  stroke={colors.primary}
                                  strokeWidth="1.5"
                                  className="animate-pulse"
                                  style={{
                                    animation:
                                      "pulse 1.5s ease-in-out infinite",
                                  }}
                                />
                                <path
                                  d="M16 7.5C18.2 9.7 18.2 13.3 16 15.5"
                                  stroke={colors.primary}
                                  strokeWidth="1.5"
                                  className="animate-pulse"
                                  style={{
                                    animation:
                                      "pulse 1.5s ease-in-out infinite",
                                    animationDelay: "0.3s",
                                  }}
                                />
                                <path
                                  d="M18 5.5C21.3 8.8 21.3 14.2 18 17.5"
                                  stroke={colors.primary}
                                  strokeWidth="1.5"
                                  className="animate-pulse"
                                  style={{
                                    animation:
                                      "pulse 1.5s ease-in-out infinite",
                                    animationDelay: "0.6s",
                                  }}
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )}

                {/* Other stations */}
                {radioStations
                  ?.filter((station) => station.id !== selectedStation?.id)
                  .map((station) => (
                    <button
                      key={station.id}
                      onClick={() => handleStationChange(station)}
                      className="w-full p-3 text-left rounded-md transition-all duration-300 hover:bg-muted/20 focus:outline-none"
                      style={{
                        backgroundColor: "transparent",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-full"
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}20)`,
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <span className="text-lg">{station.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-white truncate">
                            {station.name}
                          </div>
                          <div className="text-xs text-gray-300 truncate">
                            {station.frequency} • {station.location}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {station.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Album Art with LIVE Indicator Overlay */}
      <div className="flex justify-center mb-6 relative">
        <div
          className={`transition-all duration-1000 transform ${
            isTransitioning
              ? "opacity-0 scale-75 rotate-12 blur-md"
              : "opacity-100 scale-100 rotate-0 blur-0"
          }`}
          style={{
            transformOrigin: "center",
            filter: isTransitioning
              ? "blur(4px) saturate(0.3)"
              : isAdPlaying
              ? "blur(0px) saturate(1.2) hue-rotate(0deg)"
              : "blur(0px) saturate(1)",
            animation: isTransitioning
              ? "none"
              : isAdPlaying
              ? "adPulse 2s ease-in-out infinite"
              : "albumReveal 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <InteractiveAlbumArt
            artwork={isAdPlaying && adInfo.artwork ? adInfo.artwork : currentTrack.artwork}
            title={currentTrack.title}
            artist={currentTrack.artist}
            size="lg"
            isAd={isAdPlaying}
          />
        </div>

        {/* Compact LIVE Indicator - 50% overlapping top of album artwork */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
            isAdPlaying 
              ? 'bg-red-600 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="w-1 h-1 bg-white rounded-full animate-pulse opacity-90"></div>
            <span className="opacity-90">
              {isAdPlaying ? 'AD' : 'LIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Track Info with Cool Animation */}
      <div className="text-center mb-6">
        <div
          className="text-center transition-all duration-1000"
          style={{
            opacity: isTransitioning ? 0.3 : 1,
            transform: isTransitioning ? "scale(0.95)" : "scale(1)",
            filter: isTransitioning ? "blur(2px)" : "blur(0px)",
            animation: isTransitioning
              ? "none"
              : "slideInFromBottom 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          }}
        >
          {/* Ad Detection Badge */}
          {isAdPlaying && (
            <div className="mb-3 flex justify-center">
              <div
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white animate-pulse"
                style={{
                  background: `linear-gradient(45deg, #ff4444, #cc0000)`,
                  boxShadow: `0 2px 8px #ff444460`,
                }}
              >
                <span className="mr-1">📢</span>
                ADVERTISEMENT
                {adInfo.company && (
                  <span className="ml-1 opacity-80">
                    • {adInfo.company}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Live Metadata Indicator */}
          {currentTrack.lastUpdated && (
            <div className="mb-2 flex justify-center">
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                LIVE
              </div>
            </div>
          )}

          <div className="flex justify-center mb-2 w-full overflow-hidden">
            <div
              className={`w-full max-w-full ${isTransitioning ? "song-change-shimmer" : ""}`}
            >
              <ScrollingText
                text={currentTrack.title}
                className={`font-black whitespace-nowrap`}
                style={{ 
                  fontSize: "32px", 
                  lineHeight: "1",
                  color: currentTrack?.artwork && currentTrack.artwork !== 'advertisement' 
                    ? adaptiveTheme.textColor 
                    : (isAdPlaying ? '#f87171' : colors.text)
                }}
                maxWidth="100%"
                backgroundColor="transparent"
              />
            </div>
          </div>
          
          {currentTrack.artist &&
            currentTrack.artist !== currentTrack.title &&
            currentTrack.artist !== "Live Stream" &&
            currentTrack.artist !==
              (selectedStation?.name || "95.5 The Beat") && (
              <p 
                className="font-black text-2xl mb-1 transition-opacity duration-500"
                style={{
                  color: currentTrack?.artwork && currentTrack.artwork !== 'advertisement' 
                    ? adaptiveTheme.textColor 
                    : (isAdPlaying ? '#fca5a5' : colors.text)
                }}
              >
                {currentTrack.artist}
              </p>
            )}
          
          {currentTrack.album &&
            currentTrack.album !== "New York's Hip Hop & R&B" &&
            currentTrack.album !== "Live Stream" &&
            currentTrack.album !== currentTrack.title &&
            currentTrack.album !== currentTrack.artist &&
            currentTrack.album !==
              (selectedStation?.name || "95.5 The Beat") && (
              <p 
                className="text-sm font-medium mb-2 transition-opacity duration-500"
                style={{
                  color: currentTrack?.artwork && currentTrack.artwork !== 'advertisement' 
                    ? (adaptiveTheme.isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)')
                    : (isAdPlaying ? '#fecaca' : colors.textMuted)
                }}
              >
                {currentTrack.album}
              </p>
            )}
          
          {/* Station Information */}
          {currentTrack.stationName && (
            <p className="text-muted-foreground text-sm font-medium mb-1 transition-opacity duration-500">
              {currentTrack.stationName} • {currentTrack.frequency}
            </p>
          )}
          
          {/* Genre Information */}
          {currentTrack.genre && (
            <p className="text-muted-foreground text-xs font-medium transition-opacity duration-500">
              {currentTrack.genre}
            </p>
          )}

          {/* Ad Reason Display */}
          {isAdPlaying && adInfo.reason && (
            <p className="text-red-300 text-xs font-medium mt-2 transition-opacity duration-500">
              {adInfo.reason}
            </p>
          )}
        </div>
      </div>

      {/* Play/Pause Button - Always centered */}
      <div className="flex flex-col items-center justify-center space-y-4 relative">
        <div className="flex items-center justify-center w-full">
          <Button
            onClick={togglePlayback}
            disabled={isLoading}
            className="font-bold py-6 px-10 rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-110 disabled:opacity-50 disabled:transform-none text-xl flex items-center justify-center mx-auto relative"
            style={{
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
              color: "white",
              boxShadow: `0 10px 40px ${colors.primary}60`,
              position: "relative",
              zIndex: 1,
            }}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3" />
                <span className="font-semibold text-lg">CONNECTING...</span>
              </>
            ) : isPlaying ? (
              <svg
                className="h-16 w-16"
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
                style={{
                  animation: "pulse 2s ease-in-out infinite",
                }}
              >
                <path d="M8 5c0-.6.4-1 1-1 .2 0 .5.1.7.3l9 7c.8.6.8 1.8 0 2.4l-9 7c-.2.2-.5.3-.7.3-.6 0-1-.4-1-1V5z" />
              </svg>
            )}
          </Button>
        </div>

        {/* Volume Control - Centered below play button, with proper hover area */}
        {isPlaying && (
          <div
            className="relative transition-all duration-500 ease-in-out transform opacity-100 translate-y-0 scale-100"
            ref={volumeButtonRef}
            onMouseEnter={handleVolumeAreaMouseEnter}
            onMouseLeave={handleVolumeAreaMouseLeave}
          >
            {/* Extended hover area that includes button and slider */}
            <div className="relative flex items-center justify-center pb-16">
              {/* Volume Button - stays centered */}
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="sm"
                className="rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
                style={{
                  color: isMuted 
                    ? '#ef4444'  // Red for muted
                    : currentTheme === 'light-mode' 
                      ? '#1f2937'  // Dark gray for light mode
                      : '#ffffff', // White for dark modes
                  background:
                    isMuted || volume === 0
                      ? `${colors.primary}40`
                      : currentTheme === 'light-mode'
                        ? "rgba(0, 0, 0, 0.05)"
                        : "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(20px)",
                  padding: "5px",
                  width: "auto",
                  height: "auto",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = currentTheme === 'light-mode' 
                    ? 'rgba(0, 0, 0, 0.1)' 
                    : 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 
                    isMuted || volume === 0
                      ? `${colors.primary}40`
                      : currentTheme === 'light-mode'
                        ? "rgba(0, 0, 0, 0.05)"
                        : "rgba(255, 255, 255, 0.05)";
                }}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <div className="transition-all duration-300 ease-in-out">
                    <VolumeX className="w-10 h-10" />
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center transition-all duration-300 ease-in-out">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="relative"
                    >
                      <path
                        d="M11 5L6 9H2v6h4l5 4V5z"
                        fill="currentColor"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      <path
                        d="M15.54 8.46a5 5 0 0 1 0 7.07"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="animate-pulse"
                        style={{
                          animation: "pulse 1.5s ease-in-out infinite",
                          animationDelay: "0s",
                        }}
                      />
                      <path
                        d="M19.07 4.93a10 10 0 0 1 0 14.14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="animate-pulse"
                        style={{
                          animation: "pulse 1.5s ease-in-out infinite",
                          animationDelay: "0.3s",
                        }}
                      />
                    </svg>
                  </div>
                )}
              </Button>

              {/* Volume Slider - positioned within hover area */}
              <div
                ref={volumeSliderRef}
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 ${
                  isVolumeSliderVisible
                    ? "pointer-events-auto"
                    : "pointer-events-none"
                }`}
                style={{
                  transformOrigin: "top center",
                  transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                  transform: isVolumeSliderVisible
                    ? "translateX(-50%) translateY(0px) scale(1) rotateX(0deg)"
                    : "translateX(-50%) translateY(-20px) scale(0.3) rotateX(-90deg)",
                  opacity: isVolumeSliderVisible ? 1 : 0,
                  filter: isVolumeSliderVisible ? "blur(0px)" : "blur(2px)",
                  perspective: "200px",
                }}
              >
                {/* Volume slider - exact same as floating player but bigger */}
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-32 h-2 rounded-full relative"
                    style={{
                      backgroundColor: currentTheme === 'light-mode' 
                        ? '#d1d5db'  // Light gray for light mode
                        : '#374151'  // Dark gray for dark modes
                    }}
                  >
                    <div
                      className="h-2 rounded-full transition-all duration-150"
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
                      onChange={(e) => {
                        const newVolume = parseInt(e.target.value) / 100;
                        setVolume(newVolume);
                        if (isMuted && newVolume > 0) {
                          toggleMute(); // Unmute when adjusting volume
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Volume control"
                      title="Adjust volume"
                    />
                  </div>
                  <span 
                    className="text-xs font-medium min-w-[30px] text-center"
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
        )}
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