// Spotify Web API integration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "60a088cba7d14e8888e34e92d40f8c41";
// Use development URL for now since that's what we're running on
const REDIRECT_URI = window.location.origin + "/music";
const SCOPES = [
  "user-read-private",
  "user-read-email",
  "playlist-read-public",
  "playlist-read-private",
  "streaming"
].join(" ");

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  preview_url: string | null;
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: { total: number };
  images: { url: string }[];
}

class SpotifyAPI {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private player: any = null;
  private deviceId: string | null = null;

  constructor() {
    // Check for existing tokens in localStorage
    this.accessToken = localStorage.getItem('spotify_access_token');
    this.refreshToken = localStorage.getItem('spotify_refresh_token');
  }

  // Generate Spotify authorization URL
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      show_dialog: 'true'
    });
    
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async getAccessToken(code: string): Promise<boolean> {
    try {
      console.log('Exchanging code for token:', code);
      const response = await fetch('/api/spotify/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code,
          redirect_uri: REDIRECT_URI
        })
      });

      if (response.ok) {
        const text = await response.text();
        if (!text || text.trim() === '') {
          console.error('Empty response from Spotify token endpoint');
          return false;
        }
        
        try {
          const data = JSON.parse(text);
          console.log('Token exchange successful');
          this.accessToken = data.access_token;
          this.refreshToken = data.refresh_token;
        
          localStorage.setItem('spotify_access_token', this.accessToken!);
          localStorage.setItem('spotify_refresh_token', this.refreshToken!);
          
          return true;
        } catch (parseError) {
          console.error('Failed to parse Spotify response:', parseError, 'Response:', text);
          return false;
        }
      } else {
        const errorData = await response.text();
        console.error('Token exchange failed:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
    return false;
  }

  // Refresh access token
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch('/api/spotify/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        localStorage.setItem('spotify_access_token', this.accessToken!);
        return true;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
    return false;
  }

  // Make authenticated Spotify API request
  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the request with new token
        return this.apiRequest(endpoint, options);
      } else {
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  }

  // Get user's playlists
  async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
    const data = await this.apiRequest('/me/playlists?limit=20');
    return data.items;
  }

  // Get playlist tracks
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const data = await this.apiRequest(`/playlists/${playlistId}/tracks?limit=50`);
    return data.items.map((item: any) => item.track);
  }

  // Search for tracks
  async searchTracks(query: string, type: string = 'track', limit: number = 20): Promise<SpotifyTrack[]> {
    const params = new URLSearchParams({
      q: query,
      type,
      limit: limit.toString()
    });
    
    const data = await this.apiRequest(`/search?${params.toString()}`);
    return data.tracks?.items || [];
  }

  // Get metal/rock playlists
  async getMetalPlaylists(): Promise<SpotifyPlaylist[]> {
    try {
      // Search for metal playlists instead of browsing categories
      const data = await this.apiRequest('/search?q=metal%20rock%20heavy&type=playlist&limit=20');
      return data.playlists?.items || [];
    } catch (error) {
      console.error('Error fetching metal playlists:', error);
      return [];
    }
  }

  // Initialize Spotify Web Playback SDK
  async initializePlayer(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Spotify) {
        this.setupPlayer();
        resolve(true);
        return;
      }

      // Load Spotify Web Playback SDK
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        this.setupPlayer();
        resolve(true);
      };
    });
  }

  private setupPlayer() {
    if (!this.accessToken) return;

    const token = this.accessToken;
    
    this.player = new window.Spotify.Player({
      name: 'Metal Radio Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(token);
      },
      volume: 0.5
    });

    // Error handling
    this.player.addListener('initialization_error', ({ message }: any) => {
      console.error('Failed to initialize:', message);
    });

    this.player.addListener('authentication_error', ({ message }: any) => {
      console.error('Failed to authenticate:', message);
    });

    this.player.addListener('account_error', ({ message }: any) => {
      console.error('Failed to validate Spotify account:', message);
    });

    this.player.addListener('playback_error', ({ message }: any) => {
      console.error('Failed to perform playback:', message);
    });

    // Playback status updates
    this.player.addListener('player_state_changed', (state: any) => {
      if (!state) return;
      
      console.log('Player state changed:', state);
    });

    // Ready
    this.player.addListener('ready', ({ device_id }: any) => {
      console.log('Ready with Device ID', device_id);
      this.deviceId = device_id;
    });

    // Not Ready
    this.player.addListener('not_ready', ({ device_id }: any) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    this.player.connect().then((success: boolean) => {
      if (success) {
        console.log('The Web Playback SDK successfully connected to Spotify!');
      }
    });
  }

  // Play a track using the Web API (more reliable than SDK)
  async playTrack(uri: string): Promise<boolean> {
    try {
      const body: any = {
        uris: [uri],
        position_ms: 0
      };

      // If we have a device ID, use it
      if (this.deviceId) {
        body.device_id = this.deviceId;
      }

      const response = await this.apiRequest('/me/player/play', {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      return true;
    } catch (error) {
      console.error('Error playing track:', error);
      // Fallback: try without device ID
      try {
        await this.apiRequest('/me/player/play', {
          method: 'PUT',
          body: JSON.stringify({
            uris: [uri],
            position_ms: 0
          })
        });
        return true;
      } catch (fallbackError) {
        console.error('Fallback play also failed:', fallbackError);
        return false;
      }
    }
  }

  // Pause playback
  async pause(): Promise<boolean> {
    try {
      await this.apiRequest('/me/player/pause', { method: 'PUT' });
      return true;
    } catch (error) {
      console.error('Error pausing:', error);
      return false;
    }
  }

  // Resume playback
  async resume(): Promise<boolean> {
    try {
      await this.apiRequest('/me/player/play', { method: 'PUT' });
      return true;
    } catch (error) {
      console.error('Error resuming:', error);
      return false;
    }
  }

  // Get current playback state
  async getCurrentPlayback(): Promise<any> {
    try {
      return await this.apiRequest('/me/player');
    } catch (error) {
      console.error('Error getting playback state:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Logout
  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    
    if (this.player) {
      this.player.disconnect();
      this.player = null;
    }
  }
}

// Extend Window interface for Spotify SDK
declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

export const spotifyAPI = new SpotifyAPI();