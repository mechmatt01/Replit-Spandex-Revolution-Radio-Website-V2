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
    genre: "Hip-Hop & R&B",
    streamUrl: "https://14923.live.streamtheworld.com/KBFBFMAAC",
    description: "Dallas' Home for Hip-Hop and R&B",
    icon: "🎵"
  },
  {
    id: "hot-97",
    name: "Hot 97",
    frequency: "97.1 FM",
    location: "New York, NY",
    genre: "Hip-Hop",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac",
    description: "New York's Hip-Hop & R&B",
    icon: "🔥"
  },
  {
    id: "power-106",
    name: "Power 106",
    frequency: "105.9 FM",
    location: "Los Angeles, CA",
    genre: "Hip-Hop",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/KPWRFMAAC.aac",
    description: "LA's #1 for Hip-Hop",
    icon: "⚡"
  },
  {
    id: "soma-metal",
    name: "SomaFM Metal",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Metal",
    streamUrl: "https://ice1.somafm.com/metal-128-mp3",
    description: "From black to doom, viking to thrash",
    icon: "🤘"
  }
];

export default function RadioCoPlayer() {
  const { 
    isPlaying, 
    isLoading, 
    volume, 
    isMuted, 
    currentTrack, 
    error, 
    stationName,
    isTransitioning,
    togglePlayback, 
    setVolume, 
    toggleMute
  } = useRadio();
  
  const { getGradient, getColors } = useTheme();
  const colors = getColors();
  const volumeButtonRef = useRef<HTMLDivElement>(null);

  return (
    <section className="flex flex-col items-center justify-center space-y-8 px-8 py-12 text-center">

      {/* Now Playing Info */}
      <div className="flex flex-col items-center justify-center space-y-4 w-full max-w-md">
        <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <InteractiveAlbumArt
            artwork={currentTrack.artwork || MusicLogoPath}
            title={currentTrack.title || "Live Stream"}
            artist={currentTrack.artist || stationName}
            isPlaying={isPlaying}
            size="lg"
            className="w-64 h-64 mx-auto"
          />
        </div>

        <div className="text-center space-y-2">
          <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <ScrollingText 
              text={currentTrack.title !== "Live Stream" ? currentTrack.title : stationName}
              className="text-3xl font-black text-foreground"
              maxWidth="400px"
              backgroundColor="transparent"
            />
          </div>
          
          {currentTrack.artist !== "Live Stream" && currentTrack.artist !== stationName && (
            <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <ScrollingText 
                text={currentTrack.artist}
                className="text-xl font-semibold text-muted-foreground"
                maxWidth="350px"
                backgroundColor="transparent"
              />
            </div>
          )}
          
          {currentTrack.title !== "Live Stream" && currentTrack.artist !== "Live Stream" && (
            <p className="text-muted-foreground text-sm font-medium">
              Live Stream
            </p>
          )}
        </div>
      </div>

      {/* Play/Pause Button - Always centered */}
      <div className="flex flex-col items-center justify-center space-y-2">
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
                  <path d="M6 4l12 8-12 8V4z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="currentColor" style={{borderRadius: '3px'}} />
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