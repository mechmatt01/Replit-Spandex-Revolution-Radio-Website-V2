import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, Radio, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRadio } from "@/contexts/RadioContext";
import { useTheme } from "@/contexts/ThemeContext";
import ScrollingText from "./ScrollingText";
import InteractiveAlbumArt from "./InteractiveAlbumArt";

interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  location: string;
  genre: string;
  streamUrl: string;
  description: string;
}

const radioStations: RadioStation[] = [
  {
    id: "beat-955",
    name: "95.5 The Beat",
    frequency: "95.5 FM",
    location: "Dallas, TX",
    genre: "Hip Hop & R&B",
    streamUrl: "https://24883.live.streamtheworld.com/KBFBFMAAC",
    description: "Dallas Hip Hop & R&B"
  },
  {
    id: "hot-97",
    name: "Hot 97",
    frequency: "97.1 FM", 
    location: "New York, NY",
    genre: "Hip Hop & R&B",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac",
    description: "New York's Hip Hop & R&B"
  },
  {
    id: "power-106",
    name: "Power 106",
    frequency: "105.9 FM",
    location: "Los Angeles, CA", 
    genre: "Hip Hop & R&B",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/KPWRFMAAC.aac",
    description: "LA's #1 for Hip Hop"
  },
  {
    id: "soma-metal",
    name: "SomaFM Metal",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Metal",
    streamUrl: "https://ice1.somafm.com/metal-128-mp3",
    description: "Heavy Metal & Hard Rock"
  },
  {
    id: "spandex-salvation",
    name: "Spandex Salvation Radio",
    frequency: "Online",
    location: "Global",
    genre: "Classic Metal",
    streamUrl: "/api/radio-stream",
    description: "Old School Metal 24/7"
  }
];

export default function EnhancedRadioPlayer() {
  const { 
    isPlaying, 
    volume, 
    currentTrack, 
    currentStation,
    isLoading, 
    error,
    togglePlayback, 
    setVolume,
    changeStation
  } = useRadio();
  
  const { colors, getGradient } = useTheme();
  const [showStationSelector, setShowStationSelector] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStationSelector(false);
      }
    };

    if (showStationSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStationSelector]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value) / 100;
    setVolume(newVolume);
  };

  const handleStationChange = async (station: RadioStation) => {
    await changeStation(station);
    setShowStationSelector(false);
  };

  const PlayButton = () => (
    <Button
      onClick={togglePlayback}
      disabled={isLoading}
      size="lg"
      className="w-16 h-16 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
      style={{
        background: getGradient(),
        border: 'none',
        color: 'white'
      }}
    >
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-6 h-6" />
      ) : (
        <Play className="w-6 h-6 ml-1" />
      )}
    </Button>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Player Card */}
      <Card className="bg-card/90 backdrop-blur-sm border-border/50 overflow-hidden">
        <CardContent className="p-0">
          {/* Header with Station Info */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500">
                <Radio className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {currentStation?.name || "95.5 The Beat"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentStation?.frequency} • {currentStation?.location}
                </div>
              </div>
            </div>
          </div>

          {/* Player Content */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Album Art Section */}
              <div className="flex-shrink-0">
                <div className="relative">
                  {/* Station Selector and LIVE Indicator */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2">
                    {/* Station Selector Dropdown */}
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStationSelector(!showStationSelector)}
                        className="bg-card/90 backdrop-blur-sm border-border/50 hover:bg-card/95 transition-all duration-200 text-xs px-3 py-1"
                        style={{
                          borderColor: colors.primary + '40'
                        } as React.CSSProperties}
                      >
                        <Radio className="w-3 h-3 mr-1" />
                        {currentStation?.name || "95.5 The Beat"}
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </Button>
                      
                      {showStationSelector && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-80 bg-card/95 backdrop-blur-md border border-border/50 rounded-md shadow-lg z-20">
                          <div className="p-2 max-h-60 overflow-y-auto">
                            {radioStations.map((station) => (
                              <button
                                key={station.id}
                                onClick={() => handleStationChange(station)}
                                className={`w-full p-3 text-left rounded-md transition-all duration-200 ${
                                  station.id === (currentStation?.id || "beat-955")
                                    ? 'bg-primary/10 border border-primary/20' 
                                    : 'hover:bg-muted/50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex-shrink-0">
                                    <Radio className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <div className="font-semibold text-sm text-foreground truncate">
                                        {station.name}
                                      </div>
                                      {station.id === (currentStation?.id || "beat-955") && (
                                        <Volume2 className="w-4 h-4 text-primary flex-shrink-0" />
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
                    
                    {/* LIVE Indicator */}
                    <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      LIVE
                    </div>
                  </div>
                  
                  <InteractiveAlbumArt
                    artwork={currentTrack.artwork}
                    title={currentTrack.title}
                    artist={currentTrack.artist}
                    isPlaying={isPlaying}
                    size="lg"
                  />
                </div>
              </div>

              {/* Track Info and Controls */}
              <div className="flex-1 min-w-0 text-center lg:text-left">
                {/* Track Information */}
                <div className="mb-6">
                  <div className="mb-4">
                    {isPlaying ? (
                      <ScrollingText 
                        text={currentTrack.title} 
                        className="text-2xl font-bold text-foreground"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-center text-foreground">
                        {currentTrack.title}
                      </h2>
                    )}
                  </div>
                  
                  {currentTrack.album && currentTrack.album !== currentTrack.title && (
                    <div className="mb-2">
                      {isPlaying ? (
                        <ScrollingText 
                          text={currentTrack.album}
                          className="text-lg text-muted-foreground"
                        />
                      ) : (
                        <p className="text-lg text-center text-muted-foreground">
                          {currentTrack.album}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    {isPlaying ? (
                      <ScrollingText 
                        text={currentTrack.artist}
                        className="text-base text-muted-foreground"
                      />
                    ) : (
                      <p className="text-base text-center text-muted-foreground">
                        {currentTrack.artist}
                      </p>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-6">
                  {/* Play Button */}
                  <div className="flex justify-center">
                    <PlayButton />
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3 w-full max-w-xs">
                    <Volume2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(volume * 100)}
                      onChange={handleVolumeChange}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${volume * 100}%, var(--muted) ${volume * 100}%, var(--muted) 100%)`
                      }}
                    />
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {Math.round(volume * 100)}
                    </span>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-destructive text-sm text-center">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}