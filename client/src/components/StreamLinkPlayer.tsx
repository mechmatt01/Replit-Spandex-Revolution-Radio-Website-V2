import { useState } from "react";
import { Play, ExternalLink, Radio, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StreamLinkPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);

  const streamUrls = [
    {
      name: "Direct Stream (MP3)",
      url: "http://168.119.74.185:9858/autodj.mp3",
      description: "High quality MP3 stream"
    },
    {
      name: "Direct Stream (Auto)",
      url: "http://168.119.74.185:9858/autodj",
      description: "Auto-format stream"
    },
    {
      name: "Main Stream",
      url: "http://168.119.74.185:9858/stream",
      description: "Primary broadcast stream"
    }
  ];

  const openStreamInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card/40 backdrop-blur-sm rounded-xl p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <Radio className="h-6 w-6 text-[var(--color-primary)]" />
            <h3 className="text-xl font-bold text-foreground">Live Radio Stream</h3>
          </div>
          <p className="text-muted-foreground">
            Spandex Salvation Radio • 24/7 Old School Metal
          </p>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center justify-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-500 font-bold text-sm uppercase tracking-wider">
            Broadcasting Live
          </span>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Click below to open the live radio stream in your media player
          </p>
          
          {/* Primary Stream Button */}
          <Button
            onClick={() => openStreamInNewTab(streamUrls[0].url)}
            size="lg"
            className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:from-[var(--color-secondary)] hover:to-[var(--color-accent)] text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Play className="h-5 w-5 mr-3" />
            <span className="text-lg">LISTEN LIVE</span>
            <ExternalLink className="h-4 w-4 ml-3" />
          </Button>
        </div>

        {/* Alternative Streams */}
        <div className="space-y-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'} alternative stream formats
          </button>
          
          {isExpanded && (
            <div className="space-y-2">
              {streamUrls.map((stream, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground">{stream.name}</h4>
                    <p className="text-xs text-muted-foreground">{stream.description}</p>
                  </div>
                  <Button
                    onClick={() => openStreamInNewTab(stream.url)}
                    variant="outline"
                    size="sm"
                    className="ml-3"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Play
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stream Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Stream opens in your default media player</p>
          <p>Compatible with VLC, Windows Media Player, iTunes, and most browsers</p>
          <p className="font-mono">{streamUrls[0].url}</p>
        </div>
      </div>
    </div>
  );
}