import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { type SpotifyTrack, type SpotifyPlaylist } from "@/lib/spotify";
import { useToast } from "@/hooks/use-toast";
import { useAudio } from "@/contexts/AudioContext";

interface SpotifyPlayerProps {
  onTrackChange?: (track: SpotifyTrack | null) => void;
}

export default function SpotifyPlayer({ onTrackChange }: SpotifyPlayerProps) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isPlaying, togglePlayback, volume, setVolume } = useAudio();

  // Spotify integration disabled - using radio stream only
  const isAuthenticated = false;

  useEffect(() => {
    // No Spotify authentication needed - using radio stream
    console.log('Spotify integration disabled - using radio stream only');
  }, []);

  const handleConnect = () => {
    toast({
      title: "Spotify Disabled",
      description: "Using live radio stream instead of Spotify integration.",
    });
  };

  const handleDisconnect = () => {
    toast({
      title: "Radio Stream Active",
      description: "Enjoying live metal radio streaming.",
    });
  };

  useEffect(() => {
    // No Spotify player initialization needed
    console.log('Using radio stream player instead of Spotify');
  }, []);

  const loadPlaylist = async (playlist: SpotifyPlaylist) => {
    // Playlist loading disabled - using radio stream
    toast({
      title: "Feature Disabled",
      description: "Using live radio stream with automatic track changes.",
    });
  };

  const playTrack = async (track: SpotifyTrack) => {
    // Track playing disabled - using radio stream
    toast({
      title: "Feature Disabled", 
      description: "Enjoying live radio stream with continuous music.",
    });
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto bg-black border-orange-500">
        <CardHeader>
          <CardTitle className="text-orange-500 text-center">Radio Stream Player</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-center text-sm">
            Enjoy live metal radio streaming 24/7
          </p>
          <div className="flex justify-center space-x-2">
            <Button
              onClick={togglePlayback}
              variant="outline"
              className="bg-orange-500 hover:bg-orange-600 text-black border-orange-500"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Pause" : "Play"} Radio
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-orange-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-black border-orange-500">
      <CardHeader>
        <CardTitle className="text-orange-500">Radio Stream Player</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-300">
          Live radio stream active - Spotify integration removed
        </div>
      </CardContent>
    </Card>
  );
}