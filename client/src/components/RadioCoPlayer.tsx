import { Play, Pause, Volume2, VolumeX, Music, Radio as RadioIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useRadio } from "@/contexts/RadioContext";
import { useTheme } from "@/contexts/ThemeContext";
import ThemedMusicLogo from "@/components/ThemedMusicLogo";
import ScrollingText from "@/components/ScrollingText";
import InteractiveAlbumArt from "@/components/InteractiveAlbumArt";
import { useState, useRef, useEffect } from "react";
import type { RadioStation } from "@/components/StationSelector";

const radioStations: RadioStation[] = [
  {
    id: "beat-955",
    name: "95.5 The Beat",
    frequency: "95.5 FM",
    location: "Dallas, TX",
    description: "Hip Hop & R&B",
    genre: "Hip Hop",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/KBFB_FMAAC.aac"
  },
  {
    id: "hot-97",
    name: "Hot 97",
    frequency: "97.1 FM",
    location: "New York, NY",
    description: "Hip Hop & R&B",
    genre: "Hip Hop",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFM_SC"
  },
  {
    id: "power-106",
    name: "Power 106",
    frequency: "105.9 FM",
    location: "Los Angeles, CA",
    description: "Hip Hop & R&B",
    genre: "Hip Hop",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/KPWRFMAAC_SC"
  },
  {
    id: "soma-metal",
    name: "SomaFM Metal",
    frequency: "Online",
    location: "San Francisco, CA",
    description: "Heavy Metal & Hard Rock",
    genre: "Metal",
    streamUrl: "https://ice1.somafm.com/metal-128-mp3"
  }
];

export default function RadioCoPlayer() {
  const { 
    isPlaying, 
    volume, 
    setVolume, 
    togglePlayback,
    currentTrack,
    error, 
    isLoading,
    currentStation,
    changeStation 
  } = useRadio();
  
  const { getColors, isDarkMode } = useTheme();
  const colors = getColors();
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showStationSelector, setShowStationSelector] = useState(false);
  const stationDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close station selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stationDropdownRef.current && !stationDropdownRef.current.contains(event.target as Node)) {
        setShowStationSelector(false);
      }
    };

    if (showStationSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showStationSelector]);

  const handlePlayPause = () => {
    togglePlayback();
  };

  const handleStationChange = async (station: RadioStation) => {
    setIsTransitioning(true);
    await changeStation(station);
    setShowStationSelector(false);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
  };

  // Create themed radio icon component matching navigation bar style
  const ThemedRadioIcon = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
    const { getGradient } = useTheme();
    const gradient = getGradient();

    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-12 h-12", 
      lg: "w-16 h-16"
    };

    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8"
    };

    return (
      <div 
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center shadow-md`}
        style={{ 
          background: gradient,
          border: `2px solid ${colors.primary}`
        }}
      >
        <Music 
          className={`${iconSizes[size]} text-white`}
        />
      </div>
    );
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
            className="bg-card/90 backdrop-blur-sm border-border/50 hover:bg-card/95 transition-all duration-200 text-xs px-3 py-1"
            style={{
              borderColor: colors.primary + '40'
            } as React.CSSProperties}
          >
            <RadioIcon className="w-3 h-3 mr-1" />
            {currentStation?.name || "95.5 The Beat"}
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          
          {showStationSelector && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-80 bg-black/90 dark:bg-black/95 backdrop-blur-lg rounded-md shadow-xl z-20">
              <div className="p-2 max-h-60 overflow-y-auto">
                {radioStations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => handleStationChange(station)}
                    className={`w-full p-3 text-left rounded-md transition-all duration-200 ${
                      station.id === (currentStation?.id || "beat-955")
                        ? 'bg-primary/20' 
                        : 'hover:bg-muted/50'
                    }`}
                    style={station.id === (currentStation?.id || "beat-955") ? {
                      backgroundColor: colors.primary + '20'
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <ThemedRadioIcon size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm truncate text-foreground">
                            {station.name}
                          </div>
                          {station.id === (currentStation?.id || "beat-955") && (
                            <Volume2 className="w-4 h-4 flex-shrink-0" style={{ color: colors.primary }} />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {station.frequency} • {station.location}
                        </div>
                        <div className="text-xs text-muted-foreground/80 truncate">
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
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <InteractiveAlbumArt 
            artwork={currentTrack?.artwork}
            title={currentTrack?.title || currentStation?.name || "95.5 The Beat"}
            artist={currentTrack?.artist || currentStation?.description || "Hip Hop & R&B"}
            isPlaying={isPlaying}
            size="lg"
          />
          
          {/* LIVE Indicator - positioned to overlap 50% on top of album artwork */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <div 
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg border-2"
              style={{
                backgroundColor: colors.primary,
                color: 'white',
                borderColor: 'white'
              }}
            >
              <div className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: '#ff0000' }}
                />
                LIVE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Track Info */}
      <div className="mb-6 text-center">
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <ScrollingText 
            text={currentTrack?.title || currentStation?.name || "95.5 The Beat"}
            className="text-xl font-bold mb-1"
          />
          <ScrollingText 
            text={currentTrack?.artist || currentStation?.description || "Hip Hop & R&B"}
            className="text-lg text-muted-foreground mb-1"
          />
          {currentTrack?.album && (
            <ScrollingText 
              text={currentTrack.album}
              className="text-sm text-muted-foreground/80"
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-6">
        {/* Play/Pause Button */}
        <Button
          onClick={handlePlayPause}
          disabled={isLoading}
          size="lg"
          className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          style={{
            backgroundColor: colors.primary,
            color: 'white'
          }}
          aria-label={isPlaying ? "Pause radio" : "Play radio"}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-0.5" />
          )}
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
          className="w-8 h-8 p-0 hover:bg-muted/50"
          aria-label={volume > 0 ? "Mute" : "Unmute"}
        >
          {volume > 0 ? (
            <Volume2 className="w-4 h-4" style={{ color: colors.primary }} />
          ) : (
            <VolumeX className="w-4 h-4" style={{ color: colors.primary }} />
          )}
        </Button>
        
        <div className="flex-1">
          <Slider
            value={[volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-full"
            aria-label="Volume control"
          />
        </div>
        
        <span className="text-xs text-muted-foreground w-8 text-right">
          {Math.round(volume * 100)}%
        </span>
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