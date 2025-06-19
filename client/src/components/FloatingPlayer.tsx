import { Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRadio } from "@/contexts/RadioContext";
import ScrollingText from "@/components/ScrollingText";
import InteractiveAlbumArt from "@/components/InteractiveAlbumArt";
import { useEffect } from "react";

export default function FloatingPlayer() {
  const { isPlaying, volume, currentTrack, togglePlayback, setVolume } = useRadio();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value) / 100;
    setVolume(newVolume);
  };

  // Manage body class for content spacing when player is active
  useEffect(() => {
    if (isPlaying) {
      document.body.classList.add('player-active');
    } else {
      document.body.classList.remove('player-active');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('player-active');
    };
  }, [isPlaying]);

  // Only show when radio is playing
  if (!isPlaying) {
    return null;
  }

  return (
    <>
      <div
        id="floating-player"
        style={{
          position: 'fixed',
          bottom: '0px',
          left: '0px',
          right: '0px',
          zIndex: 2147483647,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '12px 16px',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Now Playing Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0, maxWidth: '300px' }}>
              <InteractiveAlbumArt 
                artwork={currentTrack.artwork}
                title={currentTrack.title}
                artist={currentTrack.artist}
                size="sm"
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ width: '100%', maxWidth: '240px' }}>
                  <ScrollingText 
                    text={currentTrack.title}
                    className="font-semibold text-white"
                    maxWidth="100%"
                    isFloating={true}
                  />
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentTrack.artist} • {currentTrack.album}
                </p>
              </div>
            </div>

            {/* Player Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>LIVE</span>
              </div>
              
              <Button
                onClick={togglePlayback}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label={isPlaying ? "Pause radio stream" : "Play radio stream"}
              >
                {isPlaying ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: '6px', height: '24px', backgroundColor: 'white', borderRadius: '2px' }}></div>
                      <div style={{ width: '6px', height: '24px', backgroundColor: 'white', borderRadius: '2px' }}></div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '2px' }}>
                    <div style={{ 
                      width: 0, 
                      height: 0, 
                      borderLeft: '8px solid white', 
                      borderTop: '6px solid transparent', 
                      borderBottom: '6px solid transparent' 
                    }}></div>
                  </div>
                )}
              </Button>

              {/* Volume Control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Volume2 style={{ color: 'rgba(255, 255, 255, 0.7)', width: '16px', height: '16px' }} />
                <div style={{ width: '80px', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '2px', position: 'relative' }}>
                  <div 
                    style={{ 
                      height: '4px', 
                      backgroundColor: 'var(--color-primary)', 
                      borderRadius: '2px', 
                      transition: 'all 150ms',
                      width: `${volume * 100}%`
                    }}
                  ></div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={handleVolumeChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </>
  );
}