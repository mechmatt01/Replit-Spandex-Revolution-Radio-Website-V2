// Live Radio Stream Integration
const RADIO_STREAM_URL = "http://168.119.74.185:9858/autodj";
const RADIO_STATUS_URL = "http://168.119.74.185:9858/status-json.xsl";

export interface LiveTrackInfo {
  title: string;
  artist: string;
  album?: string;
  listeners: number;
  bitrate: number;
  genre: string;
  serverName: string;
  isLive: boolean;
}

export interface RadioStatus {
  icestats: {
    server_id: string;
    host: string;
    source: Array<{
      title?: string;
      yp_currently_playing?: string;
      listeners: number;
      bitrate: number;
      genre: string;
      server_name: string;
      server_description: string;
      listenurl: string;
      stream_start: string;
    }>;
  };
}

class RadioStreamAPI {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;

  // Get current track and stream info
  async getCurrentTrack(): Promise<LiveTrackInfo | null> {
    try {
      const response = await fetch(`/api/radio-status`);
      if (!response.ok) {
        throw new Error('Failed to fetch radio status');
      }
      
      const data: RadioStatus = await response.json();
      const mainSource = data.icestats.source.find(s => s.listenurl?.includes('/autodj'));
      
      if (!mainSource) {
        return null;
      }

      // Parse title and artist from the title field
      const fullTitle = mainSource.title || mainSource.yp_currently_playing || "Unknown Track";
      const [artist, title] = fullTitle.includes(' - ') 
        ? fullTitle.split(' - ', 2)
        : ["Unknown Artist", fullTitle];

      return {
        title: title.trim(),
        artist: artist.trim(),
        listeners: mainSource.listeners,
        bitrate: mainSource.bitrate,
        genre: mainSource.genre,
        serverName: mainSource.server_name,
        isLive: true
      };
    } catch (error) {
      console.error('Error fetching radio status:', error);
      return null;
    }
  }

  // Initialize audio player
  initializePlayer(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.crossOrigin = "anonymous";
      this.audio.preload = 'none';
      
      this.audio.addEventListener('error', (e) => {
        console.error('Radio stream error:', e);
        this.isPlaying = false;
      });

      this.audio.addEventListener('canplay', () => {
        console.log('Radio stream ready to play');
      });

      this.audio.addEventListener('loadstart', () => {
        console.log('Loading radio stream...');
      });
    }
    return this.audio;
  }

  // Start playing the live stream
  async play(): Promise<boolean> {
    try {
      // Open radio stream in new window/tab to avoid CORS issues
      window.open(RADIO_STREAM_URL, '_blank');
      this.isPlaying = true;
      console.log('Radio stream opened in new tab');
      return true;
    } catch (error) {
      console.error('Failed to open radio stream:', error);
      this.isPlaying = false;
      return false;
    }
  }

  // Stop playing the stream
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.isPlaying = false;
      console.log('Radio stream stopped');
    }
  }

  // Toggle playback
  async togglePlayback(): Promise<boolean> {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      return await this.play();
    }
  }

  // Get current playing state
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Set volume
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }
}

export const radioStreamAPI = new RadioStreamAPI();