import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SimpleRadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
      console.log('✓ Radio stream playing successfully');
    };

    const handlePause = () => {
      setIsPlaying(false);
      console.log('Radio stream paused');
    };

    const handleError = (e: any) => {
      setIsPlaying(false);
      setIsLoading(false);
      setError('Stream connection failed');
      console.error('Radio stream error:', e);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
      console.log('Loading radio stream...');
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      console.log('Radio stream ready');
    };

    // Add all event listeners
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        setIsLoading(true);
        setError(null);
        
        // Try different stream formats for better browser compatibility
        const streamUrls = [
          'http://168.119.74.185:9858/autodj.mp3',
          'http://168.119.74.185:9858/autodj',
          'http://168.119.74.185:9858/stream.mp3'
        ];
        
        let streamWorking = false;
        
        for (const streamUrl of streamUrls) {
          try {
            audio.src = `${streamUrl}?t=${Date.now()}`;
            audio.volume = volume;
            
            console.log(`Testing stream: ${streamUrl}`);
            
            // Load the stream first to check format
            audio.load();
            
            // Wait for canplay event before attempting to play
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('Stream load timeout'));
              }, 5000);
              
              audio.addEventListener('canplay', () => {
                clearTimeout(timeout);
                resolve(true);
              }, { once: true });
              
              audio.addEventListener('error', () => {
                clearTimeout(timeout);
                reject(new Error('Stream load error'));
              }, { once: true });
            });
            
            await audio.play();
            streamWorking = true;
            console.log(`✓ Stream working: ${streamUrl}`);
            break;
          } catch (err) {
            console.log(`✗ Stream ${streamUrl} failed:`, err);
            continue;
          }
        }
        
        if (!streamWorking) {
          throw new Error('No compatible stream format found');
        }
      }
    } catch (err: any) {
      console.error('Playback failed:', err);
      setIsPlaying(false);
      setIsLoading(false);
      
      // Provide specific error message
      if (err.name === 'NotAllowedError') {
        setError('Please interact with the page first, then try again');
      } else if (err.name === 'NotSupportedError') {
        setError('Audio format not supported by browser');
      } else {
        setError('Failed to connect to radio stream');
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-black via-gray-900 to-black rounded-lg border border-orange-500/30">
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="none"
      />
      
      <Button
        onClick={togglePlayback}
        disabled={isLoading}
        size="lg"
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold px-6"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
            Loading...
          </div>
        ) : isPlaying ? (
          <>
            <Pause className="w-5 h-5 mr-2" />
            Pause Live Radio
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            Play Live Radio
          </>
        )}
      </Button>

      <div className="flex items-center gap-3">
        <Volume2 className="w-5 h-5 text-orange-400" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <span className="text-orange-400 text-sm font-medium min-w-[35px]">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {isPlaying && !error && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-orange-400 font-semibold">LIVE ON AIR</span>
        </div>
      )}

      {error && (
        <span className="text-red-400 text-sm font-medium">{error}</span>
      )}
    </div>
  );
}