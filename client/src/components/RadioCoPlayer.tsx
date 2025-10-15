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
import AnimatedVolumeIcon from "./AnimatedVolumeIcon";
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
    description: "Heavy Metal, Hardcore, Industrial",
    icon: "🤘",
  },
  {
    id: "somafm-dronezone",
    stationId: "somafm-dronezone",
    name: "SomaFM Dronezone",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Ambient",
    streamUrl: "https://ice1.somafm.com/dronezone-128-mp3",
    description: "Atmospheric textures and deep drones",
    icon: "🌌",
  },
  {
    id: "somafm-groovesalad",
    stationId: "somafm-groovesalad",
    name: "SomaFM Groove Salad",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Ambient",
    streamUrl: "https://ice1.somafm.com/groovesalad-128-mp3",
    description: "Ambient beats and grooves",
    icon: "🥗",
  },
  {
    id: "somafm-secretagent",
    stationId: "somafm-secretagent",
    name: "SomaFM Secret Agent",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Jazz",
    streamUrl: "https://ice1.somafm.com/secretagent-128-mp3",
    description: "The soundtrack for your stylish, mysterious, dangerous life",
    icon: "🕵️",
  },
  {
    id: "somafm-sonic",
    stationId: "somafm-sonic",
    name: "SomaFM Sonic",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Electronic",
    streamUrl: "https://ice1.somafm.com/sonic-128-mp3",
    description: "Sonic textures and electronic music",
    icon: "🎧",
  },
  {
    id: "somafm-illstreet",
    stationId: "somafm-illstreet",
    name: "SomaFM Illinois Street Lounge",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Jazz",
    streamUrl: "https://ice1.somafm.com/illstreet-128-mp3",
    description: "Classic bachelor pad, cocktail hour, faux-lounge exotica",
    icon: "🍸",
  },
  {
    id: "somafm-7soul",
    stationId: "somafm-7soul",
    name: "SomaFM Seven Inch Soul",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Soul",
    streamUrl: "https://ice1.somafm.com/7soul-128-mp3",
    description: "Vintage soul tracks from the original 45 RPM vinyl",
    icon: "💿",
  },
  {
    id: "somafm-bagel",
    stationId: "somafm-bagel",
    name: "SomaFM Bagel Radio",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Jazz",
    streamUrl: "https://ice1.somafm.com/bagel-128-mp3",
    description: "Jazz, blues, and everything in between",
    icon: "🥯",
  },
  {
    id: "somafm-cliqhop",
    stationId: "somafm-cliqhop",
    name: "SomaFM Cliqhop",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Electronic",
    streamUrl: "https://ice1.somafm.com/cliqhop-128-mp3",
    description: "Blips, clicks, and cuts",
    icon: "⚡",
  },
  {
    id: "somafm-dubstep",
    stationId: "somafm-dubstep",
    name: "SomaFM Dub Step Beyond",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Dubstep",
    streamUrl: "https://ice1.somafm.com/dubstep-128-mp3",
    description: "Dubstep, Dub and Deep Electronica",
    icon: "🎵",
  },
  {
    id: "somafm-forest",
    stationId: "somafm-forest",
    name: "SomaFM Forest",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Ambient",
    streamUrl: "https://ice1.somafm.com/forest-128-mp3",
    description: "Ambient, atmospheric, and nature sounds",
    icon: "🌲",
  },
  {
    id: "somafm-indiepop",
    stationId: "somafm-indiepop",
    name: "SomaFM Indie Pop Rocks!",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Indie Pop",
    streamUrl: "https://ice1.somafm.com/indiepop-128-mp3",
    description: "Indie pop, alternative, and indie rock",
    icon: "🎸",
  },
  {
    id: "somafm-jolly",
    stationId: "somafm-jolly",
    name: "SomaFM Jolly Ol' England",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Alternative",
    streamUrl: "https://ice1.somafm.com/jolly-128-mp3",
    description: "British indie, alternative, and Britpop",
    icon: "🇬🇧",
  },
  {
    id: "somafm-lush",
    stationId: "somafm-lush",
    name: "SomaFM Lush",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Ambient",
    streamUrl: "https://ice1.somafm.com/lush-128-mp3",
    description: "Sensuous and mellow female vocals",
    icon: "🌸",
  },
  {
    id: "somafm-missioncontrol",
    stationId: "somafm-missioncontrol",
    name: "SomaFM Mission Control",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Space",
    streamUrl: "https://ice1.somafm.com/missioncontrol-128-mp3",
    description: "Celebrating NASA and Space Exploration",
    icon: "🚀",
  },
  {
    id: "somafm-n5md",
    stationId: "somafm-n5md",
    name: "SomaFM n5MD",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Electronic",
    streamUrl: "https://ice1.somafm.com/n5md-128-mp3",
    description: "Emotional, experimental, and electronic music",
    icon: "🎹",
  },
  {
    id: "somafm-poptron",
    stationId: "somafm-poptron",
    name: "SomaFM PopTron",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Electronic",
    streamUrl: "https://ice1.somafm.com/poptron-128-mp3",
    description: "Electropop and indie dance",
    icon: "🎧",
  },
  {
    id: "somafm-sf1033",
    stationId: "somafm-sf1033",
    name: "SomaFM SF 10-33",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Alternative",
    streamUrl: "https://ice1.somafm.com/sf1033-128-mp3",
    description: "Alternative rock and indie",
    icon: "🌉",
  },
  {
    id: "somafm-spacestation",
    stationId: "somafm-spacestation",
    name: "SomaFM Space Station",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Space",
    streamUrl: "https://ice1.somafm.com/spacestation-128-mp3",
    description: "Space music, ambient, and electronic",
    icon: "🛸",
  },
  {
    id: "somafm-synphaera",
    stationId: "somafm-synphaera",
    name: "SomaFM Synphaera",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Ambient",
    streamUrl: "https://ice1.somafm.com/synphaera-128-mp3",
    description: "Ambient, electronic, and atmospheric",
    icon: "🌌",
  },
  {
    id: "somafm-thetrip",
    stationId: "somafm-thetrip",
    name: "SomaFM The Trip",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Progressive",
    streamUrl: "https://ice1.somafm.com/thetrip-128-mp3",
    description: "Progressive house and trance",
    icon: "🎯",
  },
  {
    id: "somafm-thistle",
    stationId: "somafm-thistle",
    name: "SomaFM ThistleRadio",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Folk",
    streamUrl: "https://ice1.somafm.com/thistle-128-mp3",
    description: "Folk, Celtic, and traditional music",
    icon: "🏵️",
  },
  {
    id: "somafm-velvet",
    stationId: "somafm-velvet",
    name: "SomaFM Velvet Lounge",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Jazz",
    streamUrl: "https://ice1.somafm.com/velvet-128-mp3",
    description: "Lounge, jazz, and ambient",
    icon: "🍷",
  },
  {
    id: "somafm-vaporwaves",
    stationId: "somafm-vaporwaves",
    name: "SomaFM Vaporwaves",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Vaporwave",
    streamUrl: "https://ice1.somafm.com/vaporwaves-128-mp3",
    description: "Vaporwave, synthwave, and retro electronic",
    icon: "🌊",
  },
  {
    id: "somafm-winter",
    stationId: "somafm-winter",
    name: "SomaFM Winter",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Ambient",
    streamUrl: "https://ice1.somafm.com/winter-128-mp3",
    description: "Ambient, atmospheric, and winter themes",
    icon: "❄️",
  },
  {
    id: "somafm-xmas",
    stationId: "somafm-xmas",
    name: "SomaFM Xmas in Frisko",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Christmas",
    streamUrl: "https://ice1.somafm.com/xmasfrisko-128-mp3",
    description: "Holiday music and Christmas classics",
    icon: "🎄",
  },
  {
    id: "somafm-yule",
    stationId: "somafm-yule",
    name: "SomaFM Yule",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Christmas",
    streamUrl: "https://ice1.somafm.com/yule-128-mp3",
    description: "Traditional and modern holiday music",
    icon: "🎁",
  }
];

export default function RadioCoPlayer() {
  const {
    isPlaying,
    volume,
    currentTrack,
    currentStation,
    stationName,
    togglePlayback,
    setVolume,
    isLoading,
    isMuted,
    toggleMute,
    changeStation,
    isTransitioning,
    isAdPlaying,
    adInfo,
    error,
  } = useRadio();

  const { getGradient, getColors, currentTheme } = useTheme();
  const colors = getColors();
  const { toast } = useToast();

  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(
    radioStations[0] // Auto-select the first station (Hot 97)
  );
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const [volumeSliderVisible, setVolumeSliderVisible] = useState(false);
  const volumeButtonRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const stationMenuRef = useRef<HTMLDivElement>(null);

  // Initialize with current station from context
  useEffect(() => {
    if (currentStation) {
      setSelectedStation(currentStation);
    } else if (radioStations.length > 0) {
      // Auto-select the first station if none is selected
      const firstStation = radioStations[0];
      setSelectedStation(firstStation);
      // Set the station in context but don't auto-play
      changeStation(firstStation, false).catch(console.error);
    }
  }, [currentStation, changeStation]);

  const handleStationSelect = async (station: RadioStation) => {
    try {
      setSelectedStation(station);
      setIsStationMenuOpen(false);
      // Change station without auto-playing - user must manually start
      await changeStation(station, false);
      // Removed toast notification - only show the small red error text under player
    } catch (error) {
      console.error("Error changing station:", error);
      // Removed toast notification - only show the small red error text under player
    }
  };

  const handlePlayPause = async () => {
    try {
      await togglePlayback();
    } catch (error) {
      console.error("Error toggling playback:", error);
      // Removed toast notification - only show the small red error text under player
    }
  };

  const handleVolumeAreaMouseEnter = () => {
    setVolumeSliderVisible(true);
  };

  const handleVolumeAreaMouseLeave = () => {
    setVolumeSliderVisible(false);
  };

  // Auto-hide volume slider after delay
  useEffect(() => {
    if (volumeSliderVisible) {
      const timer = setTimeout(() => {
        setVolumeSliderVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [volumeSliderVisible]);

  // Close station menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stationMenuRef.current && !stationMenuRef.current.contains(event.target as Node)) {
        setIsStationMenuOpen(false);
      }
    };

    if (isStationMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStationMenuOpen]);

  // Helper function to check if text needs scrolling
  const shouldScrollText = (text: string, maxWidth: number) => {
    // Create a temporary element to measure text width
    const tempElement = document.createElement('span');
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.style.fontSize = '28px';
    tempElement.style.fontWeight = '900';
    tempElement.textContent = text;
    document.body.appendChild(tempElement);
    
    const textWidth = tempElement.offsetWidth;
    document.body.removeChild(tempElement);
    
    return textWidth > maxWidth;
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
        maxWidth: '50%',
        width: '50%',
        minWidth: '400px',
        padding: volumeSliderVisible ? '2rem 2rem 4rem 2rem' : '2rem',
        margin: '0 auto',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* Station Selection - Centered above the main player */}
      <div className="flex justify-center mb-6">
        <div className="relative" ref={stationMenuRef}>
          <Button
            onClick={() => setIsStationMenuOpen(!isStationMenuOpen)}
            variant="outline"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-0"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}10)`,
              border: `1px solid ${colors.primary}40`,
              color: colors.text,
              backdropFilter: "blur(10px)",
            }}
          >
            <RadioIcon className="w-4 h-4" />
            <span>{selectedStation ? selectedStation.name : "Select Station"}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isStationMenuOpen ? "rotate-180" : ""
              }`}
            />
          </Button>

          {isStationMenuOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9999] max-h-96 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Choose a Station
                </h3>
                
                {/* Selected station - always first */}
                {selectedStation && (
                  <button
                    onClick={() => setIsStationMenuOpen(false)}
                    className="w-full p-3 text-left rounded-md transition-all duration-300 hover:bg-muted/20 focus:outline-none focus:ring-0"
                    style={{
                      backgroundColor: `${colors.primary}20`,
                      border: `2px solid ${colors.primary}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                          color: "white",
                        }}
                      >
                        <span className="text-lg">{selectedStation.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div 
                          className="font-semibold truncate"
                          style={{ 
                            color: colors.text,
                            textShadow: currentTheme === 'light-mode' 
                              ? '0 1px 3px rgba(0, 0, 0, 0.8)' 
                              : '0 1px 2px rgba(0, 0, 0, 0.6)'
                          }}
                        >
                          {selectedStation.name}
                        </div>
                        <div 
                          className="text-xs truncate"
                          style={{ 
                            color: colors.textSecondary || '#475569',
                            textShadow: currentTheme === 'light-mode' 
                              ? '0 1px 2px rgba(0, 0, 0, 0.7)' 
                              : '0 1px 2px rgba(0, 0, 0, 0.6)'
                          }}
                        >
                          {selectedStation.frequency} •{" "}
                          {selectedStation.location}
                        </div>
                        <div 
                          className="text-xs truncate"
                          style={{ 
                            color: colors.textMuted || '#64748b',
                            opacity: 0.95,
                            textShadow: currentTheme === 'light-mode' 
                              ? '0 1px 2px rgba(0, 0, 0, 0.6)' 
                              : '0 1px 2px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          {selectedStation.description}
                        </div>
                      </div>
                      {/* Volume icon removed from dropdown to prevent duplication */}
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
                            className="font-semibold truncate"
                            style={{ 
                              color: colors.text,
                              textShadow: currentTheme === 'light-mode' 
                                ? '0 1px 3px rgba(0, 0, 0, 0.8)' 
                                : '0 1px 2px rgba(0, 0, 0, 0.6)'
                            }}
                          >
                            {station.name}
                          </div>
                          <div 
                            className="text-xs truncate"
                            style={{ 
                              color: colors.textSecondary || '#475569',
                              textShadow: currentTheme === 'light-mode' 
                                ? '0 1px 2px rgba(0, 0, 0, 0.7)' 
                                : '0 1px 2px rgba(0, 0, 0, 0.6)'
                            }}
                          >
                            {station.frequency} •{" "}
                            {station.location}
                          </div>
                          <div 
                            className="text-xs truncate"
                            style={{ 
                              color: colors.textMuted || '#64748b',
                              opacity: 0.95,
                              textShadow: currentTheme === 'light-mode' 
                                ? '0 1px 2px rgba(0, 0, 0, 0.6)' 
                                : '0 1px 2px rgba(0, 0, 0, 0.5)'
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

      {/* Current Track Display */}
      <div className="text-center space-y-4">
        {/* Album Art */}
        <div className="flex justify-center mb-6">
          <InteractiveAlbumArt
            artwork={isAdPlaying && adInfo.artwork ? adInfo.artwork : currentTrack.artwork}
            title={currentTrack.title}
            artist={currentTrack.artist}
            size="lg"
            className="w-48 h-48 shadow-2xl"
            isAd={isAdPlaying}
          />
        </div>

        {/* Track Information */}
        <div className="space-y-2">
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
                <div 
                  className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"
                ></div>
                LIVE
              </div>
            </div>
          )}

          <div className="flex justify-center mb-2 w-full">
            <div
              className={`w-full max-w-[90%] ${isTransitioning ? "song-change-shimmer" : ""}`}
              style={{ 
                textAlign: "center",
                overflow: "hidden" // Ensure no overflow
              }}
            >
              {shouldScrollText(currentTrack.title, 400) ? (
                <div 
                  className="overflow-hidden relative" 
                  style={{ 
                    width: '100%',
                    maxWidth: '100%'
                  }}
                >
                  <ScrollingText
                    text={currentTrack.title}
                    className={`font-black whitespace-nowrap`}
                    style={{ 
                      fontSize: "28px", 
                      lineHeight: "1",
                      color: isAdPlaying ? '#f87171' : colors.text,
                      textAlign: "center",
                      display: "block",
                      width: "100%"
                    }}
                    maxWidth="100%"
                    backgroundColor="transparent"
                    alignment="center"
                  />
                </div>
              ) : (
                <div 
                  className="font-black whitespace-nowrap text-center"
                  style={{ 
                    fontSize: "28px", 
                    lineHeight: "1",
                    color: isAdPlaying ? '#f87171' : colors.text,
                    textAlign: "center",
                    display: "block",
                    width: "100%"
                  }}
                >
                  {currentTrack.title}
                </div>
              )}
            </div>
          </div>

          {currentTrack.artist &&
            currentTrack.artist !== currentTrack.title &&
            currentTrack.artist !== "Live Stream" &&
            currentTrack.artist !==
              (selectedStation?.name || "95.5 The Beat") && (
              <div className="w-full overflow-hidden">
                <p 
                  className="font-black text-2xl mb-1 transition-opacity duration-500 text-center truncate"
                  style={{
                    color: isAdPlaying ? '#fca5a5' : colors.text,
                    textAlign: "center",
                    maxWidth: "100%"
                  }}
                  title={currentTrack.artist} // Show full text on hover
                >
                  {currentTrack.artist}
                </p>
              </div>
            )}

          {currentTrack.album &&
            currentTrack.album !== "New York's Hip Hop & R&B" &&
            currentTrack.album !== "Live Stream" &&
            currentTrack.album !== currentTrack.title &&
            currentTrack.album !== currentTrack.artist &&
            currentTrack.album !==
              (selectedStation?.name || "95.5 The Beat") && (
              <div className="w-full overflow-hidden">
                <p 
                  className="text-sm font-medium mb-2 transition-opacity duration-500 text-center truncate"
                  style={{
                    color: isAdPlaying ? '#fecaca' : colors.textMuted,
                    textAlign: "center",
                    maxWidth: "100%"
                  }}
                  title={currentTrack.album} // Show full text on hover
                >
                  {currentTrack.album}
                </p>
              </div>
            )}

          {/* Station Information */}
          {currentTrack.stationName && (
            <div className="w-full overflow-hidden">
              <p 
                className="text-sm font-medium mb-1 transition-opacity duration-500 text-center truncate"
                style={{ 
                  color: colors.textMuted, 
                  textAlign: "center",
                  maxWidth: "100%"
                }}
                title={`${currentTrack.stationName} • ${currentTrack.frequency}`} // Show full text on hover
              >
                {currentTrack.stationName} • {currentTrack.frequency}
              </p>
            </div>
          )}

          {/* Genre Information */}
          {currentTrack.genre && (
            <div className="w-full overflow-hidden">
              <p 
                className="text-xs font-medium transition-opacity duration-500 text-center truncate"
                style={{ 
                  color: colors.textMuted, 
                  textAlign: "center",
                  maxWidth: "100%",
                  paddingBottom: "20px" // Added padding for better spacing above the button
                }}
                title={currentTrack.genre} // Show full text on hover
              >
                {currentTrack.genre}
              </p>
            </div>
          )}

          {/* Ad Reason Display */}
          {isAdPlaying && adInfo.reason && (
            <p className="text-red-300 text-xs font-medium mt-2 transition-opacity duration-500 text-center">
              {adInfo.reason}
            </p>
          )}
        </div>
      </div>

      {/* Play/Pause Button - Always centered with proper spacing */}
      <div className="flex flex-col items-center justify-center relative">
        {/* Dynamic spacing above the button based on playing state */}
        <div 
          className="w-full"
          style={{
            marginBottom: isPlaying ? '2rem' : '1rem' // Spacing above the button
          }}
        >
          <div className="flex items-center justify-center w-full">
            <Button
              onClick={handlePlayPause}
              disabled={isLoading}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 group shadow-lg hover:shadow-xl border-0 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 4px 20px ${colors.primary}60`,
                opacity: isLoading ? 0.5 : 1, // 50% opacity when loading
                border: "none",
                outline: "none",
                cursor: isLoading ? 'not-allowed' : 'pointer',
                filter: isLoading ? 'grayscale(30%)' : 'none',
              }}
              aria-label={isLoading ? "Connecting..." : isPlaying ? "Stop radio stream" : "Play radio stream"}
            >
              {isLoading ? (
                <Loader2
                  className="h-10 w-10 animate-spin"
                  style={{ 
                    color: '#ffffff',
                    opacity: 0.5 // 50% opacity for spinner
                  }}
                />
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
                    marginLeft: '2px', // Adjust play button positioning
                  }}
                />
              )}
            </Button>
          </div>
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
              volumeSliderVisible ? 'pb-8' : 'pb-2'
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
                <AnimatedVolumeIcon
                  isMuted={isMuted}
                  volume={volume}
                  size={40}
                  className="w-10 h-10"
                  style={{
                    color: isMuted 
                      ? '#ef4444'  // Red for muted
                      : currentTheme === 'light-mode' 
                        ? '#1f2937'  // Dark gray for light mode
                        : '#ffffff', // White for dark modes
                  }}
                />
              </Button>

              {/* Volume Slider - positioned within hover area */}
              <div
                ref={volumeSliderRef}
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 ${
                  volumeSliderVisible
                    ? "pointer-events-auto"
                    : "pointer-events-none"
                }`}
                style={{
                  transformOrigin: "top center",
                  transition: "all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                  transform: volumeSliderVisible
                    ? "translateX(-50%) translateY(0px) scale(1) rotateX(0deg)"
                    : "translateX(-50%) translateY(-20px) scale(0.3) rotateX(-90deg)",
                  opacity: volumeSliderVisible ? 1 : 0,
                  filter: volumeSliderVisible ? "blur(0px)" : "blur(2px)",
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

      {/* CSS for volume wave animations */}
      <style>{`
        @keyframes volumeWave {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
}