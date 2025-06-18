import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { spotifyAPI, type SpotifyTrack, type SpotifyPlaylist } from "@/lib/spotify";
import { useToast } from "@/hooks/use-toast";
import { useAudio } from "@/contexts/AudioContext";

interface SpotifyPlayerProps {
  onTrackChange?: (track: SpotifyTrack | null) => void;
}

export default function SpotifyPlayer({ onTrackChange }: SpotifyPlayerProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [localIsPlaying, setLocalIsPlaying] = useState(false);

  // Sync local playing state with global context
  useEffect(() => {
    setLocalIsPlaying(isPlaying && !!spotifyTrack);
  }, [isPlaying, spotifyTrack]);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setSpotifyTrack, isPlaying } = useAudio();

  useEffect(() => {
    // Check if user is already authenticated
    setIsAuthenticated(spotifyAPI.isAuthenticated());
    
    // Check for authorization code in URL (after redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !spotifyAPI.isAuthenticated()) {
      handleAuthCallback(code);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      initializeSpotify();
    }
  }, [isAuthenticated]);

  const handleAuthCallback = async (code: string) => {
    setIsLoading(true);
    try {
      const success = await spotifyAPI.getAccessToken(code);
      if (success) {
        setIsAuthenticated(true);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        toast({
          title: "Connected to Spotify",
          description: "You can now stream music from Spotify!"
        });
      } else {
        toast({
          title: "Authentication Failed",
          description: "Could not connect to Spotify. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Spotify.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSpotify = async () => {
    setIsLoading(true);
    try {
      // Initialize the Web Playback SDK
      await spotifyAPI.initializePlayer();
      
      // Load metal/rock playlists
      const metalPlaylists = await spotifyAPI.getMetalPlaylists();
      setPlaylists(metalPlaylists);
      
      if (metalPlaylists.length > 0) {
        await loadPlaylist(metalPlaylists[0]);
      }
    } catch (error) {
      console.error('Spotify initialization error:', error);
      toast({
        title: "Initialization Error",
        description: "Could not initialize Spotify player.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlaylist = async (playlist: SpotifyPlaylist) => {
    setIsLoading(true);
    try {
      const playlistTracks = await spotifyAPI.getPlaylistTracks(playlist.id);
      setTracks(playlistTracks);
      setCurrentPlaylist(playlist);
      
      if (playlistTracks.length > 0) {
        setCurrentTrack(playlistTracks[0]);
        setSpotifyTrack(playlistTracks[0]);
        onTrackChange?.(playlistTracks[0]);
      }
    } catch (error) {
      console.error('Playlist loading error:', error);
      toast({
        title: "Playlist Error",
        description: "Could not load playlist tracks.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    console.log('Starting Spotify login...');
    console.log('Current origin:', window.location.origin);
    console.log('Redirect URI:', window.location.origin + '/music');
    const authUrl = spotifyAPI.getAuthUrl();
    console.log('Auth URL:', authUrl);
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    spotifyAPI.logout();
    setIsAuthenticated(false);
    setCurrentTrack(null);
    setSpotifyTrack(null);
    setPlaylists([]);
    setTracks([]);
    setLocalIsPlaying(false);
    onTrackChange?.(null);
  };

  const togglePlayback = async () => {
    if (!currentTrack) return;

    try {
      if (isPlaying) {
        const success = await spotifyAPI.pause();
        if (success) {
          setLocalIsPlaying(false);
        }
      } else {
        if (currentTrack.uri) {
          const success = await spotifyAPI.playTrack(currentTrack.uri);
          if (success) {
            setLocalIsPlaying(true);
          }
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      toast({
        title: "Playback Error",
        description: "Could not control playback. Make sure Spotify is open and try again.",
        variant: "destructive"
      });
    }
  };

  const playTrack = async (track: SpotifyTrack) => {
    try {
      if (track.uri) {
        const success = await spotifyAPI.playTrack(track.uri);
        if (success) {
          setCurrentTrack(track);
          setSpotifyTrack(track);
          setLocalIsPlaying(true);
          onTrackChange?.(track);
        }
      }
    } catch (error) {
      console.error('Track play error:', error);
      toast({
        title: "Playback Error",
        description: "Could not play this track.",
        variant: "destructive"
      });
    }
  };

  const nextTrack = () => {
    if (!tracks.length || !currentTrack) return;
    
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const previousTrack = () => {
    if (!tracks.length || !currentTrack) return;
    
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    playTrack(tracks[prevIndex]);
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Connect to Spotify</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Connect your Spotify account to stream real metal music
          </p>
          <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Setup Required:</strong> Add this exact URL to your Spotify app's redirect URIs:
            </p>
            <code className="block mt-2 p-2 bg-gray-800 text-green-400 rounded text-xs break-all">
              {window.location.origin}/music
            </code>
            <p className="text-xs mt-2 text-yellow-700 dark:text-yellow-300">
              Go to: Spotify Dashboard → Your App → Edit Settings → Redirect URIs → Add URI
            </p>
          </div>
          <Button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? "Connecting..." : "Connect Spotify"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Track Display */}
      {currentTrack && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              {currentTrack.album.images[0] && (
                <img 
                  src={currentTrack.album.images[0].url} 
                  alt={currentTrack.album.name}
                  className="w-16 h-16 rounded-md"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{currentTrack.name}</h3>
                <p className="text-muted-foreground">
                  {currentTrack.artists.map(a => a.name).join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">{currentTrack.album.name}</p>
              </div>
            </div>
            
            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-4 mt-4">
              <Button variant="ghost" size="icon" onClick={previousTrack}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={togglePlayback}
                className="w-12 h-12"
              >
                {localIsPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={nextTrack}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playlist Selection */}
      {playlists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Metal Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant={currentPlaylist?.id === playlist.id ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => loadPlaylist(playlist)}
                  disabled={isLoading}
                >
                  {playlist.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Track List */}
      {tracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {currentPlaylist?.name || "Tracks"}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="ml-auto"
              >
                Disconnect
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer hover:bg-muted ${
                    currentTrack?.id === track.id ? "bg-muted" : ""
                  }`}
                  onClick={() => playTrack(track)}
                >
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Play className="h-3 w-3" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{track.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artists.map(a => a.name).join(", ")}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.floor(track.duration_ms / 60000)}:
                    {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}