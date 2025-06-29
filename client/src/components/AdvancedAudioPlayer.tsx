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
  Radio as RadioIcon,
  ChevronDown
} from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useRadio } from "@/contexts/RadioContext";
import type { NowPlaying } from "@shared/schema";
import type { RadioStation } from "@/components/StationSelector";

// Radio stations data
const radioStations: RadioStation[] = [
  {
    id: "beat-955",
    name: "95.5 The Beat",
    frequency: "95.5 FM",
    location: "Dallas, TX",
    genre: "Hip Hop & R&B",
    streamUrl: "https://24883.live.streamtheworld.com/KBFBFMAAC",
    description: "Dallas Hip Hop & R&B"
  },
  {
    id: "hot-97",
    name: "Hot 97",
    frequency: "97.1 FM", 
    location: "New York, NY",
    genre: "Hip Hop & R&B",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac",
    description: "New York's Hip Hop & R&B"
  },
  {
    id: "power-106",
    name: "Power 106",
    frequency: "105.9 FM",
    location: "Los Angeles, CA", 
    genre: "Hip Hop & R&B",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/KPWRFMAAC.aac",
    description: "LA's #1 for Hip Hop"
  },
  {
    id: "soma-metal",
    name: "SomaFM Metal",
    frequency: "Online",
    location: "San Francisco, CA",
    genre: "Metal",
    streamUrl: "https://ice1.somafm.com/metal-128-mp3",
    description: "Heavy Metal & Hard Rock"
  },
  {
    id: "spandex-salvation",
    name: "Spandex Salvation Radio",
    frequency: "Online",
    location: "Global",
    genre: "Classic Metal",
    streamUrl: "/api/radio-stream",
    description: "Old School Metal 24/7"
  }
];

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
  const { currentStation, changeStation } = useRadio();
  const [playlists, setPlaylists] = useState<Playlist[]>(samplePlaylists);
  const [activePlaylist, setActivePlaylist] = useState<Playlist>(samplePlaylists[0]);
  const [showStationSelector, setShowStationSelector] = useState(false);
  const stationDropdownRef = useRef<HTMLDivElement>(null);
  const [currentPlaylistTrackIndex, setCurrentPlaylistTrackIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [repeat, setRepeat] = useState<'none' | 'all' | 'one'>('none');
  const [shuffle, setShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Station selector event handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stationDropdownRef.current && !stationDropdownRef.current.contains(event.target as Node)) {
        setShowStationSelector(false);
      }
    };

    if (showStationSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStationSelector]);

  const handleStationChange = async (station: RadioStation) => {
    await changeStation(station);
    setShowStationSelector(false);
  };

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
      {/* Main Player Section */}
      <Card className="bg-dark-bg/50 border-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Album Art Section with Station Selector */}
            <div className="flex-shrink-0 relative">
              {/* Album Art */}
              <div className="w-48 h-48 bg-gradient-to-br from-metal-orange via-metal-red to-purple-600 rounded-lg p-1 relative">
                {/* Station Selector Button - Half on top of album artwork */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="relative" ref={stationDropdownRef}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStationSelector(!showStationSelector)}
                      className="bg-dark-bg/90 backdrop-blur-sm border-gray-700 hover:bg-dark-bg/95 transition-all duration-200 text-xs px-3 py-1 text-white shadow-lg"
                    >
                      <RadioIcon className="w-3 h-3 mr-1" />
                      {currentStation?.name || "95.5 The Beat"}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                    
                    {showStationSelector && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-80 bg-dark-bg/95 backdrop-blur-md border border-gray-700 rounded-md shadow-lg z-30">
                        <div className="p-2 max-h-60 overflow-y-auto">
                          {radioStations.map((station) => (
                            <button
                              key={station.id}
                              onClick={() => handleStationChange(station)}
                              className={`w-full p-3 text-left rounded-md transition-all duration-200 ${
                                station.id === (currentStation?.id || "beat-955")
                                  ? 'bg-metal-orange/20 border border-metal-orange/20' 
                                  : 'hover:bg-gray-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex-shrink-0">
                                  <RadioIcon className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="font-semibold text-sm text-white truncate">
                                      {station.name}
                                    </div>
                                    {station.id === (currentStation?.id || "beat-955") && (
                                      <Volume2 className="w-4 h-4 text-metal-orange flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-400 truncate">
                                    {station.frequency} • {station.location}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {station.description}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* LIVE Indicator - Positioned below station selector */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                </div>
                
                <div className="w-full h-full bg-dark-surface rounded-lg flex items-center justify-center relative overflow-hidden">
                  {nowPlaying && (
                    <div className="absolute inset-0 bg-gradient-to-br from-metal-orange/20 via-metal-red/20 to-purple-600/20" />
                  )}
                  <Music className="h-20 w-20 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Track Info and Controls */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white mb-2">
                  {(nowPlaying as any)?.title || "Spandex Salvation Radio"}
                </h2>
                <p className="text-gray-400 text-lg font-semibold">
                  {(nowPlaying as any)?.artist || "Old School Metal 24/7"}
                </p>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  className="text-gray-400 hover:text-white"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-metal-orange to-metal-red text-white hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  className="text-gray-400 hover:text-white"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-32"
                />
                <span className="text-sm text-gray-400 w-8">{Math.round(volume)}</span>
              </div>

              {/* Additional Controls */}
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="text-gray-400 hover:text-white"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playlist Section - Mobile Optimized */}
      {showPlaylist && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Playlist Selector */}
          <Card className="bg-dark-bg/50">
            <CardContent className="p-3 sm:p-4">
              <h3 className="font-black text-white mb-3 sm:mb-4 text-sm sm:text-base">Playlists</h3>
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
                      className={`flex items-center p-2 sm:p-3 rounded-lg cursor-pointer transition-colors touch-manipulation ${
                        currentPlaylistTrackIndex === index
                          ? 'bg-metal-orange/20 text-metal-orange'
                          : 'bg-dark-surface/30 text-gray-300 hover:bg-dark-surface/50 active:bg-dark-surface/70'
                      }`}
                    >
                      <div className="w-8 h-8 rounded flex items-center justify-center mr-3">
                        {currentPlaylistTrackIndex === index && isPlaying ? (
                          
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="6" width="12" height="12" rx="1" />
                          </svg>
                          
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