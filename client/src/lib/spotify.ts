// Radio streaming only - Spotify integration removed

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

// Minimal stub class to maintain interface compatibility
export class SpotifyAPI {
  isAuthenticated = false;
  
  getAuthUrl(): string { return ''; }
  exchangeCodeForToken(): Promise<boolean> { return Promise.resolve(false); }
  refreshAccessToken(): Promise<boolean> { return Promise.resolve(false); }
  getUserPlaylists(): Promise<SpotifyPlaylist[]> { return Promise.resolve([]); }
  getPlaylistTracks(): Promise<SpotifyTrack[]> { return Promise.resolve([]); }
  searchTracks(): Promise<SpotifyTrack[]> { return Promise.resolve([]); }
  getMetalPlaylists(): Promise<SpotifyPlaylist[]> { return Promise.resolve([]); }
  initializePlayer(): Promise<boolean> { return Promise.resolve(false); }
  playTrack(): Promise<boolean> { return Promise.resolve(false); }
  pause(): Promise<boolean> { return Promise.resolve(false); }
  resume(): Promise<boolean> { return Promise.resolve(false); }
  getCurrentPlayback(): Promise<any> { return Promise.resolve(null); }
  logout(): void { }
}

export const spotify = new SpotifyAPI();