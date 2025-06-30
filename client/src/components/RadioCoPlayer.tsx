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
        <div className="relative" ref={useRef<HTMLDivElement>(null)}>
          <button 
            onClick={() => setIsStationDropdownOpen(!isStationDropdownOpen)}
            className="w-full px-4 py-3 rounded-xl text-left transition-all duration-200 flex items-center justify-between hover:shadow-md"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}10, ${colors.secondary}05)`,
              borderRadius: '11px'
            }}
            aria-expanded={isStationDropdownOpen}
            aria-haspopup="listbox"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background: getGradient() }}
              >
                {selectedStation.icon}
              </div>
              <div>
                <div className="font-semibold text-foreground">{selectedStation.name}</div>
                <div className="text-sm text-muted-foreground">{selectedStation.description}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isPlaying && (
                <div className="flex items-center space-x-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="relative transform scale-150"
                    style={{ color: colors.primary }}
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
                        animationDelay: '0s',
                        transform: 'translateY(1px)'
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
                        animationDelay: '0.3s',
                        transform: 'translateY(1px)'
                      }}
                    />
                  </svg>
                </div>
              )}
              <ChevronDown 
                className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                  isStationDropdownOpen ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </div>
          </button>

          {/* Station Dropdown */}
          {isStationDropdownOpen && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-40 overflow-hidden backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}10)`
              }}
            >
              {radioStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => handleStationChange(station)}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 transition-all duration-200 flex items-center space-x-3 border-b border-white/10 last:border-b-0"
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ 
                      background: station.id === selectedStation.id ? getGradient() : `${colors.primary}20`,
                      filter: station.id === selectedStation.id ? 'none' : `hue-rotate(${colors.primary === '#f97316' ? '0' : '180'}deg)`
                    }}
                  >
                    {station.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{station.name}</div>
                    <div className="text-xs text-muted-foreground">{station.location}</div>
                  </div>
                  {isPlaying && station.id === selectedStation.id && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse opacity-90" style={{ color: colors.primary }}></div>
                      <span className="text-xs font-medium opacity-90" style={{ color: colors.primary }}>LIVE</span>
                    </div>
                  )}
                </button>
              ))}
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
            className="font-bold py-6 px-10 rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-110 disabled:opacity-50 disabled:transform-none text-xl border-2 flex items-center justify-center"
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
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
                <span className="font-semibold text-lg">STOP</span>
              </>
            ) : (
              <>
                <svg className="h-18 w-18 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="4,1 23,12 4,23" />
                </svg>
                <span className="font-semibold text-lg">PLAY LIVE</span>
              </>
            )}
          </Button>
        </div>

        {/* Volume Control - Centered below play button, with smooth fade animations */}
        <div 
          className={`transition-all duration-500 ease-in-out transform ${
            isPlaying 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
          }`}
        >
          <div className="flex flex-col items-center space-y-3 group" ref={volumeButtonRef}>
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

            {/* Modern Volume Dropdown - Animates upward */}
            <div 
              className="absolute bottom-full mb-3 scale-90 opacity-0 translate-y-3 group-hover:scale-100 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto z-50"
            >
              <div 
                className="rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}05)`
                }}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div 
                    className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{
                      background: `${colors.primary}20`,
                      color: colors.primary
                    }}
                  >
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </div>
                  
                  <div className="relative h-20 w-4 rounded-full overflow-hidden" style={{ background: `${colors.primary}10` }}>
                    <div 
                      className="absolute bottom-0 w-full rounded-full transition-all duration-200 ease-out"
                      style={{
                        height: `${(isMuted ? 0 : volume) * 100}%`,
                        background: `linear-gradient(180deg, ${colors.primary}, ${colors.secondary})`
                      }}
                    />
                    
                    <div 
                      className="absolute w-5 h-5 rounded-full -translate-x-0.5 transition-all duration-200 shadow-lg"
                      style={{
                        bottom: `${(isMuted ? 0 : volume) * 100 - 10}%`,
                        background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`
                      }}
                    />
                    
                    <div 
                      className="absolute inset-0 cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = rect.bottom - e.clientY;
                        const newVolume = Math.max(0, Math.min(1, y / rect.height));
                        setVolume(newVolume);
                      }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setVolume(0.5)}
                      className="text-xs px-2 py-1 rounded-lg transition-all duration-200 hover:scale-105"
                      style={{
                        background: `${colors.primary}20`,
                        color: colors.primary
                      }}
                    >
                      50%
                    </button>
                    <button 
                      onClick={() => setVolume(1)}
                      className="text-xs px-2 py-1 rounded-lg transition-all duration-200 hover:scale-105"
                      style={{
                        background: `${colors.primary}20`,
                        color: colors.primary
                      }}
                    >
                      MAX
                    </button>
                  </div>
                </div>
                
                <div 
                  className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: `8px solid ${colors.primary}15`
                  }}
                />
              </div>
            </div>
          </div>
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