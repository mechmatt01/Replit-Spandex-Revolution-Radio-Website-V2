import { useState, useEffect } from "react";
import { Play, Pause, Volume2, Settings, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRadio } from "@/contexts/RadioContext";
import { useTheme } from "@/contexts/ThemeContext";
import StationSelector from "./StationSelector";
import ScrollingText from "./ScrollingText";
import InteractiveAlbumArt from "./InteractiveAlbumArt";
import type { RadioStation } from "./StationSelector";

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
      {/* Station Selector */}
      {showStationSelector && (
        <Card className="bg-card/90 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Select Radio Station</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStationSelector(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>
            <StationSelector
              currentStation={currentStation?.id || "beat-955"}
              onStationChange={handleStationChange}
            />
          </CardContent>
        </Card>
      )}

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStationSelector(!showStationSelector)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Player Content */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Album Art Section */}
              <div className="flex-shrink-0">
                <div className="relative">
                  {/* LIVE Indicator - Always visible */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
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