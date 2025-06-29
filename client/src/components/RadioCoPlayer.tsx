import { Play, Pause, Volume2, VolumeX, Radio as RadioIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useRadio } from "@/contexts/RadioContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemedMusicLogo from "@/components/ThemedMusicLogo";
import ScrollingText from "@/components/ScrollingText";
import InteractiveAlbumArt from "@/components/InteractiveAlbumArt";
import { useState, useRef, useEffect } from "react";
// RadioStation interface moved to RadioContext
interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  location: string;
  genre: string;
  streamUrl: string;
  description: string;
  icon: string;
}
import MusicLogoPath from "@assets/MusicLogoIcon@3x_1750324989907.png";

// Radio stations data
const radioStations: RadioStation[] = [
  {
    id: "beat-955",
    name: "95.5 The Beat",
    frequency: "95.5 FM",
    location: "Dallas, TX",
    genre: "Hip Hop & R&B",
    streamUrl: "https://24883.live.streamtheworld.com/KBFBFMAAC",
    description: "Dallas Hip Hop & R&B",
    icon: "🎵"
  },
  {
    id: "hot-97",
    name: "Hot 97",
    frequency: "97.1 FM", 
    location: "New York, NY",
    genre: "Hip Hop & R&B",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac",
    description: "New York's Hip Hop & R&B",
    icon: "🔥"
  },
  {
    id: "power-106",
    name: "Power 106",
    frequency: "105.9 FM",
    location: "Los Angeles, CA", 
    genre: "Hip Hop & R&B",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/KPWRFMAAC.aac",
    description: "LA's #1 for Hip Hop",
    icon: "⚡"
  },
  {
    id: "soma-metal",
    name: "SomaFM Metal",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Metal",
    streamUrl: "https://ice1.somafm.com/metal-128-mp3",
    description: "Heavy Metal & Hard Rock",
    icon: "🤘"
  },
  {
    id: "spandex-salvation",
    name: "Spandex Salvation Radio",
    frequency: "Online",
    location: "Global",
    genre: "Classic Metal",
    streamUrl: "/api/radio-stream",
    description: "Old School Metal 24/7",
    icon: "🎸"
  }
];

export default function RadioCoPlayer() {
  const { 
    isPlaying, 
    isLoading, 
    volume, 
    isMuted, 
    error, 
    currentTrack,
    currentStation,
    isTransitioning,
    togglePlayback, 
    setVolume, 
    toggleMute,
    changeStation,
    audioRef 
  } = useRadio();
  const { getColors, getGradient } = useTheme();
  const colors = getColors();

  const [showStationSelector, setShowStationSelector] = useState(false);
  const stationDropdownRef = useRef<HTMLDivElement>(null);

  // Station selector event handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stationDropdownRef.current && !stationDropdownRef.current.contains(event.target as Node)) {
        setShowStationSelector(false);
      }
    };

    const handleScroll = () => {
      if (showStationSelector && stationDropdownRef.current) {
        // Only close if dropdown is completely out of view
        const rect = stationDropdownRef.current.getBoundingClientRect();
        const isOutOfView = rect.bottom < 0 || rect.top > window.innerHeight;

        if (isOutOfView) {
          setShowStationSelector(false);
        }
      }
    };

    if (showStationSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [showStationSelector]);

  const handleStationChange = async (station: RadioStation) => {
    try {
      await changeStation(station);
      setShowStationSelector(false);
    } catch (error) {
      console.error('Failed to change station:', error);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
  };

  // Get theme-aware filter for radio icons based on current theme
  const getIconFilter = () => {
    // Use CSS custom property to dynamically match theme
    const root = document.documentElement;
    const primaryHsl = getComputedStyle(root).getPropertyValue('--primary').trim();

    // Map common theme colors to appropriate filters
    const themeFilters: { [key: string]: string } = {
      // Classic Metal (Orange)
      '24.6 95% 53.1%': 'brightness(0) saturate(100%) invert(58%) sepia(82%) saturate(1500%) hue-rotate(24deg) brightness(1.1)',
      // Black Metal (Red)  
      '0 84.2% 60.2%': 'brightness(0) saturate(100%) invert(38%) sepia(98%) saturate(2500%) hue-rotate(343deg) brightness(1.2)',
      // Death Metal (Purple)
      '271.5 91% 65.1%': 'brightness(0) saturate(100%) invert(65%) sepia(87%) saturate(1800%) hue-rotate(250deg) brightness(1.1)',
      // Power Metal (Blue)
      '213.1 93.9% 67.8%': 'brightness(0) saturate(100%) invert(58%) sepia(96%) saturate(2000%) hue-rotate(200deg) brightness(1.1)',
      // Doom Metal (Green)
      '158.1 64.4% 51.6%': 'brightness(0) saturate(100%) invert(69%) sepia(56%) saturate(1500%) hue-rotate(120deg) brightness(1.1)',
      // Thrash Metal (Pink)
      '323.4 86% 58%': 'brightness(0) saturate(100%) invert(58%) sepia(87%) saturate(2000%) hue-rotate(315deg) brightness(1.1)',
      // Gothic Metal (Amber)
      '43.3 96.4% 56.3%': 'brightness(0) saturate(100%) invert(71%) sepia(95%) saturate(1200%) hue-rotate(15deg) brightness(1.1)'
    };

    return themeFilters[primaryHsl] || themeFilters['24.6 95% 53.1%']; // Default to orange
  };

  return (
    <section 
      className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
      role="region"
      aria-label="Radio player controls"
    >
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
        aria-label="Live radio stream"
      />

      {/* Station Selector Button */}
      <div className="flex justify-center mb-6">
        <div className="relative" ref={stationDropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStationSelector(!showStationSelector)}
            className="bg-card/90 backdrop-blur-sm transition-all duration-200 text-xs px-3 py-1 min-w-fit whitespace-nowrap"
            style={{
              borderColor: colors.primary,
              borderWidth: '2px',
              borderRadius: '9px',
              width: 'auto'
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary + '20';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
          >
            <RadioIcon className="w-3 h-3 mr-1" style={{ color: colors.primary }} />
            <span style={{ color: colors.primary }}>{currentStation?.name || "95.5 The Beat"}</span>
            <ChevronDown 
              className="w-3 h-3 ml-1 transition-transform duration-300 ease-in-out"
              style={{ 
                opacity: 0.6,
                color: colors.primary,
                transform: showStationSelector ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </Button>

          {showStationSelector && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 border shadow-xl z-20 scrollbar-thin"
                 style={{ 
                   borderColor: colors.primary + '40',
                   width: 'fit-content',
                   minWidth: '300px',
                   maxHeight: '288px',
                   overflowY: 'auto',
                   borderRadius: '12px',
                   background: 'rgba(0, 0, 0, 0.85)',
                   backdropFilter: 'blur(8px)',
                   WebkitBackdropFilter: 'blur(8px)'
                 }}>
              <div className="p-2">
                {radioStations
                  .sort((a, b) => {
                    // Sort with current station first
                    if (a.id === (currentStation?.id || "beat-955")) return -1;
                    if (b.id === (currentStation?.id || "beat-955")) return 1;
                    return 0;
                  })
                  .map((station, index) => (
                  <button
                    key={station.id}
                    onClick={() => handleStationChange(station)}
                    className="w-full p-3 text-left rounded-md transition-all duration-300 hover:bg-muted/20 focus:outline-none"
                    style={{
                      backgroundColor: station.id === (currentStation?.id || "beat-955") ? colors.primary + '30' : 'transparent',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      if (station.id !== (currentStation?.id || "beat-955")) {
                        e.currentTarget.style.backgroundColor = colors.primary + '15';
                        // Set text color based on theme brightness
                        const isLightTheme = colors.background === '#ffffff' || colors.background === '#f8f8f8' || colors.background === '#fafafa';
                        e.currentTarget.style.color = isLightTheme ? '#000000' : '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = station.id === (currentStation?.id || "beat-955") ? colors.primary + '30' : 'transparent';
                      e.currentTarget.style.color = '';
                    }}
                  >
                    <div className="flex items-center gap-3" style={{ paddingRight: '5px' }}>
                      <div 
                        className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-all duration-300"
                        style={{ 
                          background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`
                        }}
                      >
                        <span className="text-lg">{station.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0 flex items-center">
                        <div className="flex-1">
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
                        <div className="flex items-center justify-center ml-1 w-8 h-9 flex-shrink-0">
                          {station.id === (currentStation?.id || "beat-955") && (
                            <div className="relative flex items-center justify-center h-full">
                              <svg 
                                className="w-6 h-6" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                {/* Speaker body */}
                                <path 
                                  d="M11 5L6 9H2V15H6L11 19V5Z" 
                                  fill={colors.primary} 
                                />
                                {/* Animated sound waves - moved down 1.75px for alignment, only animate when playing */}
                                <path 
                                  d="M14 9.75C15.1 10.85 15.1 12.65 14 13.75" 
                                  stroke={colors.primary} 
                                  strokeWidth="1.5" 
                                  strokeLinecap="round"
                                  className={isPlaying ? "animate-pulse" : ""}
                                  style={isPlaying ? { 
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                    animationDelay: '0s'
                                  } : {}}
                                />
                                <path 
                                  d="M16 7.75C18.2 9.95 18.2 13.55 16 15.75" 
                                  stroke={colors.primary} 
                                  strokeWidth="1.5" 
                                  strokeLinecap="round"
                                  className={isPlaying ? "animate-pulse" : ""}
                                  style={isPlaying ? { 
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                    animationDelay: '0.3s'
                                  } : {}}
                                />
                                <path 
                                  d="M18 5.75C21.3 9.05 21.3 14.45 18 17.75" 
                                  stroke={colors.primary} 
                                  strokeWidth="1.5" 
                                  strokeLinecap="round"
                                  className={isPlaying ? "animate-pulse" : ""}
                                  style={isPlaying ? { 
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                    animationDelay: '0.6s'
                                  } : {}}
                                />
                              </svg>
                            </div>
                          )}
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
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <InteractiveAlbumArt 
            artwork={currentTrack.artwork}
            title={currentTrack.title}
            artist={currentTrack.artist}
            size="md"
          />
        </div>

        {/* Compact LIVE Indicator - 50% overlapping top of album artwork */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold" style={{ boxShadow: 'none' }}>
            <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
            LIVE
          </div>
        </div>
      </div>

      {/* Track Info with Fade Animation */}
      <div className="text-center mb-6">
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex justify-center mb-2">
            <ScrollingText 
              text={currentTrack.title}
              className="font-bold text-foreground"
              style={{ fontSize: '22px' }}
              maxWidth="75%"
              backgroundColor="hsl(var(--background))"
            />
          </div>
          {currentTrack.album && 
           currentTrack.album !== "New York's Hip Hop & R&B" && 
           currentTrack.album !== "Live Stream" && 
           currentTrack.album !== currentTrack.title && 
           currentTrack.album !== currentTrack.artist && (
            <p className="text-foreground font-semibold text-lg mb-1 transition-opacity duration-500">
              {currentTrack.album}
            </p>
          )}
          {currentTrack.artist && currentTrack.artist !== currentTrack.title && currentTrack.artist !== "Live Stream" && (
            <p className="text-foreground font-medium text-base mb-2 transition-opacity duration-500">
              {currentTrack.artist}
            </p>
          )}
          {currentTrack.title !== "Live Stream" && currentTrack.artist !== "Live Stream" && (
            <p className="text-muted-foreground text-sm font-medium">
              Live Stream
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlayback}
          disabled={isLoading}
          className="font-bold py-6 px-10 rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-110 disabled:opacity-50 disabled:transform-none text-xl border-2 flex items-center"
          style={{
            background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
            color: 'white',
            borderColor: colors.primary,
            boxShadow: `0 10px 40px ${colors.primary}60`
          }}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3" />
              <span className="font-semibold text-lg">CONNECTING...</span>
            </>
          ) : isPlaying ? (
            <>
              <svg className="h-18 w-18 mr-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
              <span className="font-semibold text-lg">STOP</span>
            </>
          ) : (
            <>
              <svg className="h-18 w-18 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="7,4 20,12 7,20" />
              </svg>
              <span className="font-semibold text-lg">PLAY LIVE</span>
            </>
          )}
        </Button>

        {/* Volume Controls */}
        <div className="flex items-center justify-center gap-3 w-full max-w-[375px]">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="sm"
            className="p-1 transition-colors duration-200"
            style={{
              color: colors.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.secondary;
              e.currentTarget.style.backgroundColor = colors.primary + '20';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.primary;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>

          <div className="flex-1" style={{ paddingLeft: '3px', paddingRight: '3px', minWidth: '180px' }}>
            <div className="w-full h-2 bg-gray-700 rounded-full relative">
              <div 
                className="h-2 rounded-full transition-all duration-150"
                style={{ 
                  width: `${(isMuted ? 0 : volume) * 100}%`,
                  background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`
                }}
              ></div>
              {/* Custom thumb */}
              <div 
                className="absolute top-1/2 w-4 h-4 rounded-full transition-all duration-150 transform -translate-y-1/2 cursor-pointer shadow-lg"
                style={{ 
                  left: `calc(${(isMuted ? 0 : volume) * 100}% - 8px)`,
                  background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                  boxShadow: `0 2px 8px ${colors.primary}40`
                }}
              ></div>
              <input
                type="range"
                min="0"
                max="100"
                value={(isMuted ? 0 : volume) * 100}
                onChange={(e) => handleVolumeChange([parseInt(e.target.value)])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <span className="text-sm font-semibold min-w-[35px] text-center" style={{ color: colors.primary }}>
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

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