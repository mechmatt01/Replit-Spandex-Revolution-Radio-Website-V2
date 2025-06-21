import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Heart, 
  Share2, 
  List, 
  Music, 
  Clock, 
  Headphones,
  Radio as RadioIcon 
} from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import type { NowPlaying } from "@shared/schema";

interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  artwork?: string;
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

// Sample playlists with metal tracks
const samplePlaylists: Playlist[] = [
  {
    id: "current-stream",
    name: "Live Stream",
    description: "Currently broadcasting live",
    isActive: true,
    tracks: [
      { id: "1", title: "Youth Gone Wild", artist: "Skid Row", duration: 245, genre: "Hard Rock" },
      { id: "2", title: "18 and Life", artist: "Skid Row", duration: 223, genre: "Hard Rock" },
      { id: "3", title: "I Remember You", artist: "Skid Row", duration: 321, genre: "Hard Rock" },
    ]
  },
  {
    id: "classic-metal",
    name: "Classic Metal Hits",
    description: "The greatest metal anthems of all time",
    tracks: [
      { id: "4", title: "We're Not Gonna Take It", artist: "Twisted Sister", duration: 203, genre: "Heavy Metal" },
      { id: "5", title: "I Wanna Rock", artist: "Twisted Sister", duration: 286, genre: "Heavy Metal" },
      { id: "6", title: "Cum On Feel the Noize", artist: "Quiet Riot", duration: 285, genre: "Heavy Metal" },
      { id: "7", title: "Metal Health", artist: "Quiet Riot", duration: 317, genre: "Heavy Metal" },
      { id: "8", title: "Don't Stop Believin'", artist: "Journey", duration: 251, genre: "Rock" },
      { id: "9", title: "Every Rose Has Its Thorn", artist: "Poison", duration: 317, genre: "Hard Rock" },
      { id: "10", title: "Round and Round", artist: "Ratt", duration: 264, genre: "Hard Rock" },
    ]
  },
  {
    id: "power-ballads",
    name: "Power Ballads",
    description: "Epic ballads that defined a generation",
    tracks: [
      { id: "11", title: "Heaven", artist: "Warrant", duration: 239, genre: "Hard Rock" },
      { id: "12", title: "More Than Words", artist: "Extreme", duration: 317, genre: "Hard Rock" },
      { id: "13", title: "Love Song", artist: "Tesla", duration: 285, genre: "Hard Rock" },
      { id: "14", title: "High Enough", artist: "Damn Yankees", duration: 302, genre: "Hard Rock" },
    ]
  }
];

export default function AdvancedAudioPlayer() {
  const { currentTrack, isPlaying, volume, togglePlayback, setVolume, nextTrack, previousTrack, currentTrackIndex } = useAudio();
  const [playlists, setPlaylists] = useState<Playlist[]>(samplePlaylists);
  const [activePlaylist, setActivePlaylist] = useState<Playlist>(samplePlaylists[0]);
  const [currentPlaylistTrackIndex, setCurrentPlaylistTrackIndex] = useState(0);
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
    nextTrack();
    const nextIndex = (currentPlaylistTrackIndex + 1) % activePlaylist.tracks.length;
    setCurrentPlaylistTrackIndex(nextIndex);
  };

  const handlePrevious = () => {
    previousTrack();
    const prevIndex = currentPlaylistTrackIndex === 0 ? activePlaylist.tracks.length - 1 : currentPlaylistTrackIndex - 1;
    setCurrentPlaylistTrackIndex(prevIndex);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const seekTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const toggleRepeat = () => {
    setRepeat(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
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

  const toggleFavorite = (trackId: string) => {
    setActivePlaylist(prev => ({
      ...prev,
      tracks: prev.tracks.map(track =>
        track.id === trackId
          ? { ...track, isFavorited: !track.isFavorited }
          : track
      )
    }));
  };

  const selectPlaylist = (playlist: Playlist) => {
    setActivePlaylist(playlist);
    setCurrentPlaylistTrackIndex(0);
  };

  const selectTrack = (index: number) => {
    setCurrentPlaylistTrackIndex(index);
    if (!isPlaying) {
      togglePlayback();
    }
  };

  const shareTrack = (track: PlaylistTrack) => {
    if (navigator.share) {
      navigator.share({
        title: `${track.title} by ${track.artist}`,
        text: `Check out this track: ${track.title} by ${track.artist}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${track.title} by ${track.artist} - ${window.location.href}`);
    }
  };

  const currentTrackData = activePlaylist.tracks[currentPlaylistTrackIndex];

  return (
    <div className="space-y-6">
      

      {/* Playlist Section */}
      {showPlaylist && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Playlist Selector */}
          <Card className="bg-dark-bg/50">
            <CardContent className="p-4">
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
            </CardContent>
          </Card>

          {/* Track List */}
          <div className="lg:col-span-3">
            <Card className="bg-dark-bg/50">
              <CardContent className="p-4">
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
                        currentPlaylistTrackIndex === index
                          ? 'bg-metal-orange/20 text-metal-orange'
                          : 'bg-dark-surface/30 text-gray-300 hover:bg-dark-surface/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded flex items-center justify-center mr-3">
                        {currentPlaylistTrackIndex === index && isPlaying ? (
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
                        <p className="text-sm opacity-75 truncate">{track.artist}</p>
                      </div>

                      <div className="flex items-center space-x-3">

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
              </CardContent>
            </Card>
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