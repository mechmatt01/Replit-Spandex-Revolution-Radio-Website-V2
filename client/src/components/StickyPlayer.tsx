
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Pause, Volume2, VolumeX, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useRadio } from '@/contexts/RadioContext';
import { cn } from '@/lib/utils';
import InteractiveAlbumArt from './InteractiveAlbumArt';
import AdLogo from './AdLogo';

export default function StickyPlayer() {
  const { 
    isPlaying, 
    volume, 
    setVolume, 
    togglePlayback 
  } = useRadio();
  
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch current track with more frequent updates for live metadata
  const { data: currentTrack, refetch } = useQuery({
    queryKey: ['/api/now-playing'],
    queryFn: async () => {
      const response = await fetch('/api/now-playing');
      if (!response.ok) throw new Error('Failed to fetch track');
      return response.json();
    },
    refetchInterval: isPlaying ? 5000 : 30000, // More frequent updates when playing
    staleTime: 0 // Always consider data stale for live updates
  });

  // Auto-refresh metadata when track changes or ads are detected
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        refetch();
      }, 3000); // Check every 3 seconds for metadata changes
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, refetch]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTrackText = (track: any) => {
    if (!track) return "Hot 97 • New York's Hip Hop & R&B";
    
    if (track.isAd) {
      return `${track.title} • ${track.artist}`;
    }
    
    return `${track.artist} • ${track.title}`;
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* Mobile-optimized sticky player */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t transition-all duration-300",
        "md:hidden", // Only show on mobile
        isExpanded ? "h-64" : "h-16"
      )}>
        {/* Compact player bar */}
        <div 
          className="flex items-center justify-between p-3 h-16 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Track info and artwork */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Album artwork */}
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 flex-shrink-0">
              {currentTrack.isAd ? (
                <AdLogo 
                  brandName={currentTrack.title} 
                  className="w-full h-full"
                />
              ) : currentTrack.artwork ? (
                <img 
                  src={currentTrack.artwork} 
                  alt="Album Art"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Track text with scrolling */}
            <div className="flex-1 min-w-0">
              <div className="overflow-hidden">
                <div className={cn(
                  "whitespace-nowrap text-sm font-medium",
                  formatTrackText(currentTrack).length > 30 && "animate-scroll"
                )}>
                  {formatTrackText(currentTrack)}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={currentTrack.isAd ? "destructive" : "secondary"} 
                  className="text-xs px-1 py-0 h-4"
                >
                  {currentTrack.isAd ? "AD" : "LIVE"}
                </Badge>
                <span className="text-xs text-muted-foreground">Hot 97</span>
              </div>
            </div>
          </div>

          {/* Play/Pause button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayback();
            }}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Expanded controls */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 bg-background/98">
            {/* Large artwork and track info */}
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 flex-shrink-0">
                {currentTrack.isAd ? (
                  <AdLogo 
                    brandName={currentTrack.title} 
                    className="w-full h-full"
                  />
                ) : currentTrack.artwork ? (
                  <img 
                    src={currentTrack.artwork} 
                    alt="Album Art"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Radio className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">
                  {currentTrack.title || "Hot 97"}
                </h3>
                <p className="text-muted-foreground truncate">
                  {currentTrack.artist || "New York's Hip Hop & R&B"}
                </p>
                {currentTrack.album && (
                  <p className="text-sm text-muted-foreground/70 truncate">
                    {currentTrack.album}
                  </p>
                )}
              </div>
            </div>

            {/* Volume control */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="w-8 h-8"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="flex-1"
              />
              
              <span className="text-sm text-muted-foreground w-8">
                {Math.round((isMuted ? 0 : volume) * 100)}
              </span>
            </div>

            {/* Live indicator */}
            <div className="flex items-center justify-center">
              <Badge variant={currentTrack.isAd ? "destructive" : "default"} className="px-3 py-1">
                {currentTrack.isAd ? "Commercial Break" : "🔴 LIVE"}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Desktop sticky player (existing design) */}
      <div className={cn(
        "fixed bottom-6 right-6 z-50 bg-background/95 backdrop-blur-lg rounded-xl border shadow-lg transition-all duration-300",
        "hidden md:block", // Only show on desktop
        isExpanded ? "w-80 p-4" : "w-72 p-3"
      )}>
        <div 
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Desktop layout */}
          <div className="flex items-center space-x-3">
            {/* Album artwork */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 flex-shrink-0">
              {currentTrack.isAd ? (
                <AdLogo 
                  brandName={currentTrack.title} 
                  className="w-full h-full"
                />
              ) : currentTrack.artwork ? (
                <InteractiveAlbumArt 
                  src={currentTrack.artwork} 
                  alt="Album Art"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white" />
                </div>
              )}
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <div className="overflow-hidden">
                <div className={cn(
                  "whitespace-nowrap text-sm font-medium",
                  formatTrackText(currentTrack).length > 25 && "animate-scroll"
                )}>
                  {formatTrackText(currentTrack)}
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant={currentTrack.isAd ? "destructive" : "secondary"} 
                  className="text-xs px-1 py-0 h-4"
                >
                  {currentTrack.isAd ? "AD" : "LIVE"}
                </Badge>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayback();
                }}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Expanded desktop controls */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t space-y-3">
              {/* Volume control */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="w-8 h-8"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                
                <span className="text-sm text-muted-foreground w-8">
                  {Math.round((isMuted ? 0 : volume) * 100)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add scrolling animation styles */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
      `}</style>
    </>
  );
}
