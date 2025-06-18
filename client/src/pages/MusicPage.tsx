import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { Radio, Music, Headphones } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import type { SpotifyTrack } from "@/lib/spotify";

export default function MusicPage() {
  const [activeMode, setActiveMode] = useState<"live" | "spotify">("live");
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null);
  const { currentTrack, isPlaying, togglePlayback } = useAudio();

  useEffect(() => {
    // Check URL for Spotify auth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
      setActiveMode("spotify");
    }
  }, []);

  const handleSpotifyTrackChange = (track: SpotifyTrack | null) => {
    setSpotifyTrack(track);
    if (track) {
      setActiveMode("spotify");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-foreground mb-4">
            SPANDEX SALVATION RADIO
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Stream the heaviest metal 24/7 or connect your Spotify for personalized playlists
          </p>
          
          {/* Mode Selector */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant={activeMode === "live" ? "default" : "outline"}
              onClick={() => setActiveMode("live")}
              className="flex items-center gap-2"
            >
              <Radio className="h-4 w-4" />
              Live Radio
              {activeMode === "live" && <Badge variant="secondary">LIVE</Badge>}
            </Button>
            <Button
              variant={activeMode === "spotify" ? "default" : "outline"}
              onClick={() => setActiveMode("spotify")}
              className="flex items-center gap-2"
            >
              <Music className="h-4 w-4" />
              Spotify Streaming
              {spotifyTrack && <Badge variant="secondary">Connected</Badge>}
            </Button>
          </div>
        </div>

        <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as "live" | "spotify")}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Live Radio Stream
            </TabsTrigger>
            <TabsTrigger value="spotify" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Spotify Music
            </TabsTrigger>
          </TabsList>

          {/* Live Radio Tab */}
          <TabsContent value="live" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-metal-orange" />
                  Live Radio Stream
                  <Badge variant="destructive" className="ml-auto">LIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentTrack ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-foreground">
                        {(() => {
                          if ('name' in currentTrack) return currentTrack.name;
                          return (currentTrack as any).title;
                        })()}
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        by {(() => {
                          if ('artists' in currentTrack) return currentTrack.artists[0]?.name;
                          return (currentTrack as any).artist;
                        })()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Album: {(() => {
                          if ('album' in currentTrack && typeof currentTrack.album === 'object' && currentTrack.album) {
                            return currentTrack.album.name;
                          }
                          return (currentTrack as any).album;
                        })()}
                      </p>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button
                        size="lg"
                        onClick={togglePlayback}
                        className="bg-metal-orange hover:bg-metal-orange/80 text-white px-8 py-3"
                      >
                        {isPlaying ? "Pause Live Stream" : "Play Live Stream"}
                      </Button>
                    </div>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      <p>Broadcasting live from the depths of metal hell</p>
                      <p>24/7 non-stop heavy metal, classic rock, and hair metal</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Loading Live Stream...</h3>
                    <p className="text-muted-foreground">
                      Connecting to Spandex Salvation Radio
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Stream Features */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">No Interruptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Pure metal music without commercials or DJ chatter
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Curated Playlists</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Hand-picked classics from the golden age of metal
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">High Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Crystal clear audio streaming at 320kbps
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Spotify Tab */}
          <TabsContent value="spotify" className="space-y-6">
            <SpotifyPlayer onTrackChange={handleSpotifyTrackChange} />
            
            {/* Spotify Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Premium Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    • Access to millions of metal tracks
                  </p>
                  <p className="text-muted-foreground">
                    • Create custom playlists
                  </p>
                  <p className="text-muted-foreground">
                    • Skip tracks and control playback
                  </p>
                  <p className="text-muted-foreground">
                    • High-quality streaming
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">
                    • Active Spotify Premium subscription
                  </p>
                  <p className="text-muted-foreground">
                    • Spotify app installed on your device
                  </p>
                  <p className="text-muted-foreground">
                    • Modern web browser with Web Playback SDK support
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-muted-foreground">
            Experience the ultimate metal music platform with both live radio and on-demand streaming
          </p>
        </div>
      </div>
    </div>
  );
}