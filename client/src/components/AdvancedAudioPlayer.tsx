import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, Share2, Download, List,
  Music, Clock, Radio as RadioIcon, Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useAudio } from "@/contexts/AudioContext";
import type { NowPlaying } from "@shared/schema";

interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork?: string;
  year?: number;
  genre?: string;
  isPlaying?: boolean;
  isFavorited?: boolean;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: PlaylistTrack[];
  artwork?: string;
  isActive?: boolean;
}

// Sample playlist data
const samplePlaylists: Playlist[] = [
  {
    id: "current-stream",
    name: "Live Stream",
    description: "Currently broadcasting on Spandex Salvation Radio",
    isActive: true,
    tracks: [
      { id: "1", title: "Youth Gone Wild", artist: "Skid Row", album: "Skid Row", duration: 211, year: 1989, genre: "Hard Rock" },
      { id: "2", title: "I Remember You", artist: "Skid Row", album: "Skid Row", duration: 321, year: 1989, genre: "Hard Rock" },
      { id: "3", title: "18 and Life", artist: "Skid Row", album: "Skid Row", duration: 243, year: 1989, genre: "Hard Rock" },
      { id: "4", title: "We're Not Gonna Take It", artist: "Twisted Sister", album: "Stay Hungry", duration: 203, year: 1984, genre: "Heavy Metal" },
      { id: "5", title: "I Wanna Rock", artist: "Twisted Sister", album: "Stay Hungry", duration: 184, year: 1984, genre: "Heavy Metal" },
    ]
  },
  {
    id: "hair-metal-classics",
    name: "Hair Metal Classics",
    description: "The biggest hits from the golden age of hair metal",
    tracks: [
      { id: "6", title: "Pour Some Sugar on Me", artist: "Def Leppard", album: "Hysteria", duration: 263, year: 1988, genre: "Hard Rock" },
      { id: "7", title: "Sweet Child O' Mine", artist: "Guns N' Roses", album: "Appetite for Destruction", duration: 356, year: 1987, genre: "Hard Rock" },
      { id: "8", title: "Home Sweet Home", artist: "Mötley Crüe", album: "Theatre of Pain", duration: 236, year: 1985, genre: "Hard Rock" },
      { id: "9", title: "Every Rose Has Its Thorn", artist: "Poison", album: "Open Up and Say... Ahh!", duration: 317, year: 1988, genre: "Hard Rock" },
      { id: "10", title: "Round and Round", artist: "Ratt", album: "Out of the Cellar", duration: 264, year: 1984, genre: "Hard Rock" },
    ]
  },
  {
    id: "power-ballads",
    name: "Power Ballads",
    description: "Epic ballads that defined a generation",
    tracks: [
      { id: "11", title: "Heaven", artist: "Warrant", album: "Dirty Rotten Filthy Stinking Rich", duration: 239, year: 1989, genre: "Hard Rock" },
      { id: "12", title: "More Than Words", artist: "Extreme", album: "Pornograffitti", duration: 317, year: 1990, genre: "Hard Rock" },
      { id: "13", title: "Love Song", artist: "Tesla", album: "The Great Radio Controversy", duration: 285, year: 1989, genre: "Hard Rock" },
      { id: "14", title: "High Enough", artist: "Damn Yankees", album: "Damn Yankees", duration: 302, year: 1990, genre: "Hard Rock" },
    ]
  }
];

export default function AdvancedAudioPlayer() {
  const { currentTrack, isPlaying, volume, togglePlayback, setVolume } = useAudio();
  const [playlists, setPlaylists] = useState<Playlist[]>(samplePlaylists);
  const [activePlaylist, setActivePlaylist] = useState<Playlist>(samplePlaylists[0]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [repeat, setRepeat] = useState<'none' | 'all' | 'one'>('none');
  const [shuffle, setShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: nowPlaying } = useQuery<NowPlaying>({
    queryKey: ["/api/now-playing"],
    refetchInterval: 10000,
  });

  // Update current track when nowPlaying changes
  useEffect(() => {
    if (nowPlaying && activePlaylist.id === 'current-stream') {
      setActivePlaylist(prev => {
        const updatedTracks = prev.tracks.map((track, index) => ({
          ...track,
          isPlaying: index === 0 && isPlaying,
          ...(index === 0 && {
            title: nowPlaying.title,
            artist: nowPlaying.artist,
            album: nowPlaying.album || track.album,
          })
        }));
        
        return { ...prev, tracks: updatedTracks };
      });
    }
  }, [nowPlaying, isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    togglePlayback();
  };

  const handleNext = () => {
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * activePlaylist.tracks.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      const nextIndex = (currentTrackIndex + 1) % activePlaylist.tracks.length;
      setCurrentTrackIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      setCurrentTime(0);
    } else {
      const prevIndex = currentTrackIndex === 0 
        ? activePlaylist.tracks.length - 1 
        : currentTrackIndex - 1;
      setCurrentTrackIndex(prevIndex);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
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

  const toggleRepeat = () => {
    setRepeat(current => {
      switch (current) {
        case 'none': return 'all';
        case 'all': return 'one';
        case 'one': return 'none';
        default: return 'none';
      }
    });
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const selectTrack = (trackIndex: number) => {
    setCurrentTrackIndex(trackIndex);
  };

  const selectPlaylist = (playlist: Playlist) => {
    setActivePlaylist(playlist);
    setCurrentTrackIndex(0);
    setShowPlaylist(false);
  };

  const toggleFavorite = (trackId: string) => {
    const updatedPlaylists = playlists.map(playlist => ({
      ...playlist,
      tracks: playlist.tracks.map(track => 
        track.id === trackId 
          ? { ...track, isFavorited: !track.isFavorited }
          : track
      )
    }));
    setPlaylists(updatedPlaylists);
    
    if (activePlaylist) {
      const updatedActivePlaylist = updatedPlaylists.find(p => p.id === activePlaylist.id);
      if (updatedActivePlaylist) {
        setActivePlaylist(updatedActivePlaylist);
      }
    }
  };

  const shareTrack = (track: PlaylistTrack) => {
    const shareText = `🎵 Now listening to "${track.title}" by ${track.artist} on Spandex Salvation Radio! 🤘`;
    if (navigator.share) {
      navigator.share({
        title: `${track.title} - ${track.artist}`,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
    }
  };

  const currentTrackData = activePlaylist.tracks[currentTrackIndex];

  return (
    <div className="space-y-6">
      {/* Main Player */}
      <div className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300 p-6 rounded-lg border border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Track Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-metal-orange to-metal-red rounded-lg flex items-center justify-center">
                <Music className="text-white h-8 w-8" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-white truncate">
                  {currentTrackData?.title || nowPlaying?.title || "No track selected"}
                </h3>
                <p className="text-gray-400 font-semibold truncate">
                  {currentTrackData?.artist || nowPlaying?.artist || "Unknown Artist"}
                </p>
                <p className="text-gray-500 text-sm truncate">
                  {currentTrackData?.album || nowPlaying?.album || "Unknown Album"}
                </p>
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleShuffle}
                  className={`text-white hover:text-metal-orange ${shuffle ? 'text-metal-orange' : ''}`}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="text-white hover:text-metal-orange"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                
                <Button
                  onClick={handlePlayPause}
                  className="bg-metal-orange hover:bg-orange-600 text-white w-12 h-12 rounded-full"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="text-white hover:text-metal-orange"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRepeat}
                  className={`text-white hover:text-metal-orange ${repeat !== 'none' ? 'text-metal-orange' : ''}`}
                >
                  <Repeat className="h-4 w-4" />
                  {repeat === 'one' && <span className="absolute -top-1 -right-1 text-xs">1</span>}
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md">
                <Slider
                  value={[duration ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  className="w-full"
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Volume & Actions */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFavorite(currentTrackData?.id || '')}
                className={`text-white hover:text-metal-orange ${currentTrackData?.isFavorited ? 'text-metal-orange' : ''}`}
              >
                <Heart className={`h-4 w-4 ${currentTrackData?.isFavorited ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => currentTrackData && shareTrack(currentTrackData)}
                className="text-white hover:text-metal-orange"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:text-metal-orange"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                  max={100}
                  step={1}
                />
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPlaylist(!showPlaylist)}
                className="text-white hover:text-metal-orange"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
      </Card>

      {/* Playlist Section */}
      {showPlaylist && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Playlist Selector */}
          <div className="bg-dark-bg/50 rounded-lg border border-gray-800 p-4"></div>
              <h3 className="font-black text-white mb-4">Playlists</h3>
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => selectPlaylist(playlist)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activePlaylist.id === playlist.id
                        ? 'bg-metal-orange/20 text-metal-orange'
                        : 'bg-dark-surface/50 text-gray-300 hover:bg-dark-surface/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{playlist.name}</p>
                        <p className="text-xs opacity-75">{playlist.tracks.length} tracks</p>
                      </div>
                      {playlist.isActive && (
                        <Badge className="bg-metal-red text-white">
                          <RadioIcon className="h-3 w-3 mr-1" />
                          LIVE
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
          </div>

          {/* Track List */}
          <div className="lg:col-span-3">
            <div className="bg-dark-bg/50 rounded-lg border border-gray-800 p-4"></div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-black text-white">{activePlaylist.name}</h3>
                    <p className="text-gray-400 font-semibold text-sm">{activePlaylist.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Headphones className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 font-semibold text-sm">
                      {activePlaylist.tracks.length} tracks
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {activePlaylist.tracks.map((track, index) => (
                    <div
                      key={track.id}
                      onClick={() => selectTrack(index)}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        currentTrackIndex === index
                          ? 'bg-metal-orange/20 text-metal-orange'
                          : 'bg-dark-surface/30 text-gray-300 hover:bg-dark-surface/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded flex items-center justify-center mr-3">
                        {currentTrackIndex === index && isPlaying ? (
                          <div className="flex space-x-1">
                            <div className="w-1 h-4 bg-metal-orange animate-pulse"></div>
                            <div className="w-1 h-4 bg-metal-orange animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1 h-4 bg-metal-orange animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        ) : (
                          <span className="text-gray-500 font-semibold text-sm">{index + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{track.title}</p>
                        <p className="text-sm opacity-75 truncate">{track.artist} • {track.album}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        {track.year && (
                          <span className="text-xs opacity-50">{track.year}</span>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 opacity-50" />
                          <span className="text-sm opacity-75">{formatTime(track.duration)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track.id);
                          }}
                          className={`h-8 w-8 ${track.isFavorited ? 'text-metal-orange' : 'text-gray-400'} hover:text-metal-orange`}
                        >
                          <Heart className={`h-4 w-4 ${track.isFavorited ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareTrack(track);
                          }}
                          className="h-8 w-8 text-gray-400 hover:text-metal-orange"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          if (repeat === 'one') {
            audioRef.current?.play();
          } else {
            handleNext();
          }
        }}
      />
    </div>
  );
}