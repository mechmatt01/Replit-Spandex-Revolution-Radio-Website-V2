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
    description: "Los Angeles Hip Hop & R&B",
    icon: "⚡"
  },
  {
    id: "somafm-metal",
    name: "SomaFM Metal",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Metal",
    streamUrl: "https://ice1.somafm.com/metal-128-mp3",
    description: "Metal music from SomaFM",
    icon: "🤘"
  }
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
    changeStation
  } = useRadio();

  const { getColors, getGradient } = useTheme();
  const colors = getColors();

  const [isStationDropdownOpen, setIsStationDropdownOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<RadioStation>(radioStations[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const volumeButtonRef = useRef<HTMLDivElement>(null);
  const stationDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stationDropdownRef.current && !stationDropdownRef.current.contains(event.target as Node)) {
        setIsStationDropdownOpen(false);
      }
    };

    if (isStationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isStationDropdownOpen]);

  const handleStationChange = async (station: RadioStation) => {
    if (station.id === selectedStation.id) return;
    
    setIsTransitioning(true);
    setSelectedStation(station);
    setIsStationDropdownOpen(false);
    
    try {
      await changeStation(station);
    } catch (err) {
      console.error('Failed to switch station:', err);
    }
    
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <section 
      className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
      role="region"
      aria-label="Radio player controls"
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
              borderWidth: '2px',
              borderRadius: '12px',
              width: 'auto'
            }}
          >
            <RadioIcon className="w-3 h-3 mr-1" style={{ color: colors.primary }} />
            <span style={{ color: colors.primary }}>{selectedStation?.name || "95.5 The Beat"}</span>
            <ChevronDown 
              className={`w-3 h-3 ml-1 transition-transform duration-300 ease-in-out transform ${isStationDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
              style={{
                opacity: 0.6,
                color: colors.primary
              }}
            />
          </Button>
          
          {isStationDropdownOpen && (
            <div className="absolute mt-1 left-1/2 transform -translate-x-1/2 max-h-60 overflow-y-auto bg-black/90 backdrop-blur-lg border shadow-xl z-20 scrollbar-thin"
                 style={{
                   borderColor: colors.primary + '40',
                   borderRadius: '12px',
                   minWidth: '300px',
                 }}>
              <div className="p-2">
                {/* Always show selected station first */}
                {selectedStation && (
                  <button
                    key={selectedStation.id + '-selected'}
                    onClick={() => handleStationChange(selectedStation)}
                    className="w-full p-3 text-left rounded-md transition-all duration-300 hover:bg-muted/20 focus:outline-none"
                    style={{
                      backgroundColor: colors.primary + '20',
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
                            {selectedStation.frequency} • {selectedStation.location}
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
                                  style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
                                />
                                <path 
                                  d="M16 7.5C18.2 9.7 18.2 13.3 16 15.5" 
                                  stroke={colors.primary} 
                                  strokeWidth="1.5" 
                                  className="animate-pulse"
                                  style={{ animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.3s' }}
                                />
                                <path 
                                  d="M18 5.5C21.3 8.8 21.3 14.2 18 17.5" 
                                  stroke={colors.primary} 
                                  strokeWidth="1.5" 
                                  className="animate-pulse"
                                  style={{ animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.6s' }}
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
                {radioStations.filter(station => station.id !== selectedStation?.id).map((station) => (
                  <button
                    key={station.id}
                    onClick={() => handleStationChange(station)}
                    className="w-full p-3 text-left rounded-md transition-all duration-300 hover:bg-muted/20 focus:outline-none"
                    style={{
                      backgroundColor: 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full">
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
          <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
            <div className="w-1 h-1 bg-white rounded-full animate-pulse opacity-90"></div>
            <span className="opacity-90">LIVE</span>
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

      {/* Play/Pause Button - Always centered */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center justify-center">
          <Button
            onClick={togglePlayback}
            disabled={isLoading}
            className="font-bold py-4 px-12 rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-110 disabled:opacity-50 disabled:transform-none border-2 flex flex-col items-center justify-center"
            style={{
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
              color: 'white',
              borderColor: colors.primary,
              boxShadow: `0 10px 40px ${colors.primary}60`,
              height: '120px',
              width: '180px'
            }}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-2 border-white border-t-transparent mb-1" />
                <span className="font-semibold text-sm">CONNECTING...</span>
              </>
            ) : isPlaying ? (
              <>
                <svg className="h-24 w-24 mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                </svg>
                <span className="font-semibold text-sm">STOP</span>
              </>
            ) : (
              <>
                <svg className="h-24 w-24 mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4,1 L23,12 L4,23 Z" strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" strokeWidth="0.5" />
                </svg>
                <span className="font-semibold text-sm">PLAY LIVE</span>
              </>
            )}
          </Button>
        </div>

        {/* Volume Control - Centered below play button, with smooth fade animations */}
        {isPlaying && (
          <div 
            className="relative group transition-all duration-500 ease-in-out transform opacity-100 translate-y-0 scale-100"
            ref={volumeButtonRef}
          >
            <div className="relative flex items-center justify-center">
              {/* Volume Button - stays centered */}
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 rounded-full p-3 w-14 h-14 flex items-center justify-center transition-all duration-300"
                style={{
                  background: isMuted ? `${colors.primary}40` : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)'
                }}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <div className="relative flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="relative"
                    >
                      <path
                        d="M11 5L6 9H2v6h4l5 4V5z"
                        fill="currentColor"
                      />
                      <path 
                        d="M15.54 8.46a5 5 0 0 1 0 7.07" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                        className="animate-pulse"
                        style={{ 
                          animation: 'pulse 1.5s ease-in-out infinite',
                          animationDelay: '0s'
                        }}
                      />
                      <path 
                        d="M19.07 4.93a10 10 0 0 1 0 14.14" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                        className="animate-pulse"
                        style={{ 
                          animation: 'pulse 1.5s ease-in-out infinite',
                          animationDelay: '0.3s'
                        }}
                      />
                    </svg>
                  </div>
                )}
              </Button>
            </div>

            {/* Downward Bouncing Volume Bar - Drops from button center */}
            <div 
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 scale-y-0 opacity-0 origin-top group-hover:scale-y-100 group-hover:opacity-100 transition-all duration-500 ease-out pointer-events-none group-hover:pointer-events-auto z-50"
            >
              <div className="p-2">
                {/* Simple Volume Bar - Same style as floating player but thicker/wider */}
                <div 
                  className="relative w-48 h-6 rounded-full overflow-hidden shadow-lg"
                  style={{ 
                    background: `${colors.primary}20`,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {/* Volume fill */}
                  <div 
                    className="absolute left-0 h-full rounded-full transition-all duration-200 ease-out"
                    style={{  
                      width: `${(isMuted ? 0 : volume) * 100}%`,
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`
                    }}
                  />
                  
                  {/* Volume thumb */}
                  <div 
                    className="absolute w-6 h-6 rounded-full top-1/2 -translate-y-1/2 -translate-x-3 transition-all duration-200 shadow-lg border-2 border-white/20"
                    style={{
                      left: `${(isMuted ? 0 : volume) * 100}%`,
                      background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`
                    }}
                  />
                  
                  {/* Click area for volume control */}
                  <div 
                    className="absolute inset-0 cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const newVolume = Math.max(0, Math.min(1, x / rect.width));
                      setVolume(newVolume);
                    }}
                  />
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