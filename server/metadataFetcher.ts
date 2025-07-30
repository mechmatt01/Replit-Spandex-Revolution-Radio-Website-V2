import fetch from 'node-fetch';

interface StationMetadata {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  stationName: string;
  timestamp: number;
}

interface IHeartNowPlayingResponse {
  success: boolean;
  data?: {
    song?: string;
    artist?: string;
    album?: string;
    artwork?: string;
    track?: {
      title?: string;
      artist?: string;
      album?: {
        name?: string;
        artwork?: string;
      };
    };
  };
}

class MetadataFetcher {
  private static instance: MetadataFetcher;
  private cache: Map<string, { data: StationMetadata; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  public static getInstance(): MetadataFetcher {
    if (!MetadataFetcher.instance) {
      MetadataFetcher.instance = new MetadataFetcher();
    }
    return MetadataFetcher.instance;
  }

  async getMetadata(stationId: string): Promise<StationMetadata | null> {
    // Check cache first
    const cached = this.cache.get(stationId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      let metadata: StationMetadata | null = null;

      switch (stationId) {
        case 'hot-97':
          metadata = await this.fetchIHeartMetadata('6046', 'Hot 97');
          break;
        case 'power-106':
          metadata = await this.fetchIHeartMetadata('1481', 'Power 105.1');
          break;
        case 'hot-105':
          metadata = await this.fetchIHeartMetadata('5907', 'Hot 105');
          break;
        case 'q-93':
          metadata = await this.fetchIHeartMetadata('1037', 'Q93');
          break;
        case 'beat-955':
          metadata = await this.fetchStreamTheWorldMetadata('KBFBFM', '95.5 The Beat');
          break;
        case 'somafm-metal':
          metadata = await this.fetchSomaFMMetadata('metal', 'SomaFM Metal');
          break;
        default:
          return null;
      }

      if (metadata) {
        this.cache.set(stationId, { data: metadata, timestamp: Date.now() });
      }

      return metadata;
    } catch (error) {
      console.error(`Failed to fetch metadata for ${stationId}:`, error);
      return null;
    }
  }

  private async fetchIHeartMetadata(stationId: string, stationName: string): Promise<StationMetadata | null> {
    try {
      // Try multiple iHeart API endpoints
      const endpoints = [
        `https://www.iheart.com/api/v3/live-meta/stream/${stationId}`,
        `https://www.iheart.com/api/v2/stations/${stationId}/current-track`,
        `https://us1-api.iheart.com/api/v1/catalog/getStation/${stationId}`,
        `https://playerservices.streamtheworld.com/api/livestream?version=1.9&mount=${this.getCallSignFromId(stationId)}&lang=en`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://www.iheart.com/',
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(3000)
          });

          if (response.ok) {
            const data = await response.json();
            
            // Try different response structures
            const track = data?.nowPlaying || data?.current_track || data?.results?.livestream?.[0]?.cue || data?.data?.track || data?.data;
            
            if (track && (track.title || track.song)) {
              return {
                title: track.title || track.song || 'Unknown Track',
                artist: track.artist || 'Unknown Artist',
                album: track.album || (typeof track.album === 'object' ? track.album?.name : undefined),
                artwork: track.artwork || (typeof track.album === 'object' ? track.album?.artwork : undefined),
                stationName,
                timestamp: Date.now(),
              };
            }
          }
        } catch (endpointError) {
          // Continue to next endpoint
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error(`iHeart metadata fetch failed for ${stationId}:`, error);
      return null;
    }
  }

  private getCallSignFromId(stationId: string): string {
    const callSigns: { [key: string]: string } = {
      '6046': 'WQHTFMAAC',  // Hot 97
      '1481': 'WWPRFMAAC',  // Power 105.1
      '5907': 'WHQTFMAAC',  // Hot 105
      '1037': 'WQUEFMAAC'   // Q93
    };
    return callSigns[stationId] || 'UNKNOWN';
  }

  private async fetchStreamTheWorldMetadata(callSign: string, stationName: string): Promise<StationMetadata | null> {
    try {
      const response = await fetch(`https://np.tritondigital.com/public/nowplaying?mountName=${callSign}&numberToFetch=1&eventType=track`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const nowPlaying = data.nowplaying?.[0];

      if (nowPlaying) {
        return {
          title: nowPlaying.cue_title || 'Unknown Track',
          artist: nowPlaying.cue_artist || 'Unknown Artist',
          album: nowPlaying.cue_album,
          artwork: nowPlaying.cue_image_url,
          stationName,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error(`StreamTheWorld metadata fetch failed for ${callSign}:`, error);
      return null;
    }
  }

  private async fetchSomaFMMetadata(channel: string, stationName: string): Promise<StationMetadata | null> {
    try {
      const response = await fetch(`https://somafm.com/songs/${channel}.json`, {
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const track = data.songs?.[0];

      if (track) {
        return {
          title: track.title || 'Unknown Track',
          artist: track.artist || 'Unknown Artist',
          album: track.album,
          artwork: track.image,
          stationName,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error(`SomaFM metadata fetch failed for ${channel}:`, error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default MetadataFetcher;