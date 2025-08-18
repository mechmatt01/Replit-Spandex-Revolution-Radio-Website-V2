import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Radio as RadioIcon,
  ChevronDown,
  Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { useRadio } from "../contexts/RadioContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/use-toast";

import ThemedMusicLogo from "../components/ThemedMusicLogo";
import ScrollingText from "../components/ScrollingText";
import InteractiveAlbumArt from "../components/InteractiveAlbumArt";
import { AdLogo } from "../components/AdLogo";
import { useState, useRef, useEffect } from "react";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { measureAsyncOperation, measureSyncOperation } from '../lib/performance';

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
// import MusicLogoPath from "../../attached_assets/MusicLogoIcon.png";

// Radio stations data with authentic streaming URLs for current top charts hip-hop, rap, and pop music
const radioStations: RadioStation[] = [
  {
    id: "hot-97",
    stationId: "hot-97",
    name: "Hot 97",
    frequency: "97.1 FM",
    location: "New York, NY", 
    genre: "Hip Hop & R&B",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac",
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
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WWPRFMAAC.aac",
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
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WMIBFMAAC.aac",
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
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQUE-FMAAC.aac",
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

  const { user, updateListeningStatus } = useFirebaseAuth();
  const { getColors, getGradient, currentTheme } = useTheme();
  const colors = getColors();
  const { toast } = useToast();

  // Debug mode state
  const [isDebugMode, setIsDebugMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('debug-mode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });


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

  // Sync selectedStation with currentStation from context
  useEffect(() => {
    if (currentStation) {
      setSelectedStation(currentStation);
    }
  }, [currentStation]);

  // Handle station selection
  const handleStationSelect = async (station: RadioStation) => {
    try {
      setIsTransitioning(true);
      setSelectedStation(station);
      setIsStationDropdownOpen(false);
      
      // Actually change the radio station
      await changeStation(station);
      
      // Show success feedback
      if (isDebugMode) {
        toast({
          title: "Station Changed",
          description: `Now playing ${station.name}`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Failed to change station:', error);
      // Revert selection on error
      setSelectedStation(currentStation || radioStations[0]);
      toast({
        title: "Station Change Failed",
        description: "Failed to switch to the selected station",
        variant: "error",
      });
    } finally {
      setIsTransitioning(false);
    }
  };
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
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

  const handlePlay = async () => {
    if (!audioRef.current) return;
    
    try {
      await measureAsyncOperation('radio_player_play', async () => {
        await audioRef.current!.play();
        setHasError(false);
      }, { action: 1 });
    } catch (error) {
      console.error('Error playing audio:', error);
      setHasError(true);
    }
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    
    measureSyncOperation('radio_player_pause', () => {
      audioRef.current!.pause();
    }, { action: 1 });
  };

  const handleStationChange = async (newStation: RadioStation) => {
    try {
      setIsTransitioning(true);
      setSelectedStation(newStation);
      setIsStationDropdownOpen(false);
      
      // Actually change the radio station
      await changeStation(newStation);
      
      // Show success feedback
      if (isDebugMode) {
        toast({
          title: "Station Changed",
          description: `Now playing ${newStation.name}`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Failed to change station:', error);
      // Revert selection on error
      setSelectedStation(currentStation || radioStations[0]);
      toast({
        title: "Station Change Failed",
        description: "Failed to switch to the selected station",
        variant: "error",
      });
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <section 
      className="backdrop-blur-md rounded-2xl shadow-xl transition-all duration-1000 ease-in-out mx-auto overflow-visible radio-player-container" 
      role="region" 
      aria-label="Radio player controls"
      style={{
        background: currentTrack?.artwork && currentTrack.artwork !== 'advertisement'
          ? `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}20)`
          : 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(40px) saturate(250%)',
        border: `1px solid ${colors.primary}20`,
        boxShadow: `0 20px 40px -12px ${colors.primary}20, 0 8px 32px -8px rgba(0,0,0,0.3)`,
        maxWidth: '600px',
        padding: isVolumeSliderVisible ? '2rem 2rem 4rem 2rem' : '2rem',
        margin: '0 auto',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* Station Selector */}
      <div className="mb-6">
        <div className="relative" ref={stationDropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStationDropdownOpen(!isStationDropdownOpen)}
            className="bg-card/95 backdrop-blur-sm hover:bg-card/100 transition-all duration-200 text-xs px-3 py-1"
            style={{
              borderColor: colors.primary,
              borderWidth: "2px",
              borderRadius: "12px",
              width: "auto",
              '--tw-ring-color': colors.primary,
            } as React.CSSProperties & { '--tw-ring-color': string }}
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
              className="absolute mt-1 left-1/2 transform -translate-x-1/2 max-h-60 overflow-y-auto shadow-xl z-20 scrollbar-thin"
              style={{
                background: 'rgba(0, 0, 0, 0.98)',
                backdropFilter: 'blur(32px) saturate(220%)',
                WebkitBackdropFilter: 'blur(32px) saturate(220%)',
                borderColor: colors.primary + "60",
                borderRadius: "12px",
                minWidth: "300px",
                border: '2px solid',
                boxShadow: `0 12px 48px ${colors.primary}30, 0 0 0 1px rgba(255, 255, 255, 0.15), 0 0 24px rgba(0, 0, 0, 0.3)`,
              }}
            >
              <div className="p-2">
                {/* Always show selected station first */}
                {selectedStation && (
                  <button
                    key={selectedStation.id + "-selected"}
                    onClick={() => handleStationSelect(selectedStation)}
                    className="w-full p-3 text-left rounded-md transition-all duration-300 hover:bg-muted/20 focus:outline-none focus:ring-0"
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
                          <div 
                            className="font-semibold text-sm truncate"
                            style={{ 
                              color: colors.text || '#ffffff',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                              fontWeight: '600'
                            }}
                          >
                            {selectedStation.name}
                          </div>
                          <div 
                            className="text-xs truncate"
                            style={{ 
                              color: colors.textMuted || '#e5e7eb',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)'
                            }}
                          >
                            {selectedStation.frequency} •{" "}
                            {selectedStation.location}
                          </div>
                          <div 
                            className="text-xs truncate"
                            style={{ 
                              color: colors.textMuted || '#d1d5db',
                              opacity: 0.9,
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                            }}
                          >
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
                      onClick={() => handleStationSelect(station)}
                      className="w-full p-3 text-left rounded-md transition-all duration-300 hover:bg-muted/20 focus:outline-none focus:ring-0"
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
                          <div 
                            className="font-semibold text-sm truncate"
                            style={{ 
                              color: colors.text || '#ffffff',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)',
                              fontWeight: '600'
                            }}
                          >
                            {station.name}
                          </div>
                          <div 
                            className="text-xs truncate"
                            style={{ 
                              color: colors.textMuted || '#e5e7eb',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                            }}
                          >
                            {station.frequency} • {station.location}
                          </div>
                          <div 
                            className="text-xs truncate"
                            style={{ 
                              color: colors.textMuted || '#d1d5db',
                              opacity: 0.9,
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
                            }}
                          >
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

        {/* Compact LIVE Indicator - properly positioned near the top of album artwork */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
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
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/10">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse relative"></div>
                LIVE
              </div>
            </div>
          )}

          <div className="flex justify-center mb-2 w-full overflow-hidden">
            <div
              className={`w-full max-w-[90%] ${isTransitioning ? "song-change-shimmer" : ""}`}
            >
              <ScrollingText
                text={currentTrack.title}
                className={`font-black whitespace-nowrap text-center`}
                style={{ 
                  fontSize: "28px", 
                  lineHeight: "1",
                  color: isAdPlaying ? '#f87171' : colors.text,
                  textAlign: "center"
                }}
                maxWidth="90%"
                backgroundColor="transparent"
                alignment="center"
              />
            </div>
          </div>

          {currentTrack.artist &&
            currentTrack.artist !== currentTrack.title &&
            currentTrack.artist !== "Live Stream" &&
            currentTrack.artist !==
              (selectedStation?.name || "95.5 The Beat") && (
              <p 
                className="font-black text-2xl mb-1 transition-opacity duration-500 text-center"
                style={{
                  color: isAdPlaying ? '#fca5a5' : colors.text,
                  textAlign: "center"
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
                className="text-sm font-medium mb-2 transition-opacity duration-500 text-center"
                style={{
                  color: isAdPlaying ? '#fecaca' : colors.textMuted,
                  textAlign: "center"
                }}
              >
                {currentTrack.album}
              </p>
            )}

          {/* Station Information */}
          {currentTrack.stationName && (
            <p 
              className="text-sm font-medium mb-1 transition-opacity duration-500 text-center"
              style={{ color: colors.textMuted, textAlign: "center" }}
            >
              {currentTrack.stationName} • {currentTrack.frequency}
            </p>
          )}

          {/* Genre Information */}
          {currentTrack.genre && (
            <p 
              className="text-xs font-medium transition-opacity duration-500 text-center"
              style={{ color: colors.textMuted, textAlign: "center" }}
            >
              {currentTrack.genre}
            </p>
          )}

          {/* Ad Reason Display */}
          {isAdPlaying && adInfo.reason && (
            <p className="text-red-300 text-xs font-medium mt-2 transition-opacity duration-500 text-center">
              {adInfo.reason}
            </p>
          )}
        </div>
      </div>

      {/* Play/Pause Button - Always centered */}
      <div className="flex flex-col items-center justify-center space-y-4 relative">
        <div className="flex items-center justify-center w-full">
          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group shadow-lg hover:shadow-xl border-0 focus:outline-none focus:ring-0"
            style={{
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 4px 20px ${colors.primary}60`,
              opacity: isLoading ? 0.5 : 1,
              border: "none",
              outline: "none",
            }}
            aria-label={isLoading ? "Connecting..." : isPlaying ? "Stop radio stream" : "Play radio stream"}
          >
            {isLoading ? (
              <div 
                className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
                style={{ 
                  borderLeftColor: colors.primary,
                  borderRightColor: colors.primary,
                  borderBottomColor: colors.primary,
                  borderTopColor: 'transparent' 
                }}
              ></div>
            ) : isPlaying ? (
              <Square
                className="h-10 w-10"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="2"
              />
            ) : (
              <Play
                className="h-10 w-10"
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="2"
                style={{
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
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
            <div className={`relative flex items-center justify-center transition-all duration-300 ${
              isVolumeSliderVisible ? 'pb-8' : 'pb-2'
            }`}>
              {/* Volume Button - stays centered */}
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="sm"
                className="rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-0"
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
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="relative"
                    >
                      {/* Speaker icon - centered */}
                      <path
                        d="M11 5L6 9H2v6h4l5 4V5z"
                        fill="currentColor"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      {/* First wave - properly positioned */}
                      <path
                        d="M15.5 8.5a3 3 0 0 1 0 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="animate-pulse"
                        style={{
                          animation: "pulse 1.5s ease-in-out infinite",
                          animationDelay: "0s",
                        }}
                      />
                      {/* Second wave - properly positioned */}
                      <path
                        d="M19 6.5a7 7 0 0 1 0 11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="animate-pulse"
                        style={{
                          animation: "pulse 1.5s ease-in-out infinite",
                          animationDelay: "0.6s",
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