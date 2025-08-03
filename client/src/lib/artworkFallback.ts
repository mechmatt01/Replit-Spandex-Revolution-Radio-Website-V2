interface ArtworkSearchResult {
  url: string;
  source: string;
  quality: 'high' | 'medium' | 'low';
}

interface SpotifyTrack {
  name: string;
  artists: Array<{ name: string }>;
  album: { images: Array<{ url: string; height: number }> };
}

interface iTunesTrack {
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  artworkUrl512?: string;
}

export class ArtworkFallbackService {
  private static instance: ArtworkFallbackService;
  private cache = new Map<string, ArtworkSearchResult>();

  static getInstance(): ArtworkFallbackService {
    if (!ArtworkFallbackService.instance) {
      ArtworkFallbackService.instance = new ArtworkFallbackService();
    }
    return ArtworkFallbackService.instance;
  }

  // Check if artwork is a playlist cover or generic image
  private isPlaylistCover(artworkUrl: string): boolean {
    const playlistKeywords = [
      'playlist', 'mix', 'dj', 'radio', 'station', 'live', 'stream',
      'broadcast', 'show', 'program', 'session', 'set'
    ];
    
    const url = artworkUrl.toLowerCase();
    return playlistKeywords.some(keyword => url.includes(keyword));
  }

  // Check if artwork is generic/default
  private isGenericArtwork(artworkUrl: string): boolean {
    const genericPatterns = [
      'default', 'placeholder', 'unknown', 'no-artwork',
      'music-note', 'album-cover', 'generic'
    ];
    
    const url = artworkUrl.toLowerCase();
    return genericPatterns.some(pattern => url.includes(pattern));
  }

  // Search Spotify for artwork
  private async searchSpotify(title: string, artist: string): Promise<ArtworkSearchResult | null> {
    try {
      // Note: This would require Spotify API credentials
      // For now, we'll use a mock implementation
      const searchQuery = encodeURIComponent(`${title} ${artist}`);
      const response = await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=1`, {
        headers: {
          'Authorization': 'Bearer YOUR_SPOTIFY_TOKEN' // Would need to be configured
        }
      });

      if (response.ok) {
        const data = await response.json();
        const track = data.tracks?.items?.[0] as SpotifyTrack;
        
        if (track?.album?.images?.length > 0) {
          const bestImage = track.album.images[0]; // Highest quality
          return {
            url: bestImage.url,
            source: 'spotify',
            quality: bestImage.height >= 640 ? 'high' : 'medium'
          };
        }
      }
    } catch (error) {
      console.warn('Spotify artwork search failed:', error);
    }
    return null;
  }

  // Search iTunes for artwork
  private async searchiTunes(title: string, artist: string): Promise<ArtworkSearchResult | null> {
    try {
      const searchQuery = encodeURIComponent(`${title} ${artist}`);
      const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&media=music&entity=song&limit=1`);
      
      if (response.ok) {
        const data = await response.json();
        const track = data.results?.[0] as iTunesTrack;
        
        if (track?.artworkUrl512 || track?.artworkUrl100) {
          // Replace the URL to get higher quality artwork
          const artworkUrl = (track.artworkUrl512 || track.artworkUrl100)
            .replace('100x100', '512x512')
            .replace('60x60', '512x512');
          
          return {
            url: artworkUrl,
            source: 'itunes',
            quality: 'high'
          };
        }
      }
    } catch (error) {
      console.warn('iTunes artwork search failed:', error);
    }
    return null;
  }

  // Search Last.fm for artwork
  private async searchLastFM(title: string, artist: string): Promise<ArtworkSearchResult | null> {
    try {
      const searchQuery = encodeURIComponent(`${title} ${artist}`);
      const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&track=${searchQuery}&artist=${encodeURIComponent(artist)}&api_key=YOUR_LASTFM_KEY&format=json`);
      
      if (response.ok) {
        const data = await response.json();
        const track = data.track;
        
        if (track?.album?.image?.[2]?.['#text']) {
          return {
            url: track.album.image[2]['#text'],
            source: 'lastfm',
            quality: 'medium'
          };
        }
      }
    } catch (error) {
      console.warn('Last.fm artwork search failed:', error);
    }
    return null;
  }

  // Generate AI artwork using a placeholder service
  private async generateAIArtwork(title: string, artist: string): Promise<ArtworkSearchResult | null> {
    try {
      // This would integrate with an AI service like DALL-E, Midjourney, or similar
      // For now, we'll use a placeholder that could be replaced with actual AI integration
      const prompt = `Album cover art for "${title}" by ${artist}, modern design, vibrant colors`;
      
      // Placeholder for AI integration
      console.log('AI artwork generation requested for:', prompt);
      
      // Return a generated placeholder URL (this would be replaced with actual AI service)
      return {
        url: `https://via.placeholder.com/512/1f2937/ffffff?text=${encodeURIComponent(`${title}\nby ${artist}`)}`,
        source: 'ai-generated',
        quality: 'medium'
      };
    } catch (error) {
      console.warn('AI artwork generation failed:', error);
    }
    return null;
  }

  // Main method to get artwork with fallbacks
  async getArtworkWithFallback(
    originalArtwork: string | undefined,
    title: string,
    artist: string
  ): Promise<string | null> {
    // If no original artwork, try fallbacks immediately
    if (!originalArtwork || originalArtwork === 'advertisement') {
      return this.searchFallbackArtwork(title, artist);
    }

    // Check if current artwork is a playlist cover or generic
    if (this.isPlaylistCover(originalArtwork) || this.isGenericArtwork(originalArtwork)) {
      console.log('Detected playlist/generic artwork, searching for better alternative');
      const fallback = await this.searchFallbackArtwork(title, artist);
      return fallback || originalArtwork;
    }

    // Test if original artwork loads successfully
    try {
      const response = await fetch(originalArtwork, { method: 'HEAD' });
      if (!response.ok) {
        console.log('Original artwork failed to load, trying fallbacks');
        const fallback = await this.searchFallbackArtwork(title, artist);
        return fallback || originalArtwork;
      }
    } catch (error) {
      console.log('Original artwork failed to load, trying fallbacks');
      const fallback = await this.searchFallbackArtwork(title, artist);
      return fallback || originalArtwork;
    }

    return originalArtwork;
  }

  // Search for fallback artwork from multiple sources
  private async searchFallbackArtwork(title: string, artist: string): Promise<string | null> {
    const cacheKey = `${title}-${artist}`.toLowerCase();
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return cached.url;
    }

    // Try multiple sources in order of preference
    const sources = [
      () => this.searchiTunes(title, artist),
      () => this.searchSpotify(title, artist),
      () => this.searchLastFM(title, artist),
      () => this.generateAIArtwork(title, artist)
    ];

    for (const source of sources) {
      try {
        const result = await source();
        if (result) {
          // Cache the result
          this.cache.set(cacheKey, result);
          return result.url;
        }
      } catch (error) {
        console.warn('Artwork source failed:', error);
      }
    }

    return null;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export const artworkFallbackService = ArtworkFallbackService.getInstance(); 