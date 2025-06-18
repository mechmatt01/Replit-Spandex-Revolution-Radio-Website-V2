import { Pause, Play, Volume2, VolumeX, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/contexts/AudioContext";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function StickyPlayer() {
  const { isPlaying, volume, togglePlayback, setVolume } = useAudio();
  const [albumArt, setAlbumArt] = useState<string | null>(null);

  // Fetch live radio status
  const { data: radioStatus } = useQuery({
    queryKey: ['/api/radio-status'],
    refetchInterval: 10000,
  });

  // Extract track info from live radio
  const liveTrack = radioStatus?.icestats?.source?.[0];
  const trackTitle = liveTrack?.yp_currently_playing?.split(' - ')[1] || liveTrack?.title || 'Unknown Track';
  const trackArtist = liveTrack?.yp_currently_playing?.split(' - ')[0] || 'Unknown Artist';
  const listeners = liveTrack?.listeners || 0;

  // Fetch album artwork from MusicBrainz/Cover Art Archive
  useEffect(() => {
    if (trackTitle && trackArtist) {
      const fetchAlbumArt = async () => {
        try {
          // Try MusicBrainz search first
          const searchQuery = encodeURIComponent(`${trackArtist} ${trackTitle}`);
          const mbResponse = await fetch(`https://musicbrainz.org/ws/2/recording?query=${searchQuery}&fmt=json&limit=1`);
          
          if (mbResponse.ok) {
            const mbData = await mbResponse.json();
            const recording = mbData.recordings?.[0];
            
            if (recording?.releases?.[0]?.id) {
              const releaseId = recording.releases[0].id;
              const coverResponse = await fetch(`https://coverartarchive.org/release/${releaseId}/front`);
              
              if (coverResponse.ok) {
                setAlbumArt(coverResponse.url);
                return;
              }
            }
          }
          
          // Fallback: use a gradient placeholder
          setAlbumArt(null);
        } catch (error) {
          console.log('Album art fetch failed, using default');
          setAlbumArt(null);
        }
      };

      fetchAlbumArt();
    }
  }, [trackTitle, trackArtist]);

  if (!liveTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Now Playing Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {albumArt ? (
              <img 
                src={albumArt} 
                alt={`${trackTitle} by ${trackArtist}`}
                className="w-12 h-12 rounded-lg object-cover"
                onError={() => setAlbumArt(null)}
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg flex items-center justify-center">
                <Music className="text-white h-6 w-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-foreground truncate">
                {trackTitle}
              </h4>
              <p className="text-muted-foreground text-sm truncate">
                {trackArtist} • {listeners} listeners
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center space-x-6">
            <Button
              onClick={togglePlayback}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white w-12 h-12 rounded-full"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-500 font-bold">LIVE</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center space-x-3">
            <Volume2 className="text-gray-400 h-4 w-4" />
            <div className="w-20 h-1 bg-gray-700 rounded-full relative">
              <div 
                className="h-1 bg-metal-orange rounded-full transition-all duration-150"
                style={{ width: `${volume}%` }}
              ></div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
