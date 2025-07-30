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
          metadata = await this.fetchIHeartMetadata('6046', 'Hot 97') || 
                    await this.fetchAlternativeMetadata('WQHTFM', 'Hot 97');
          break;
        case 'power-106':
          metadata = await this.fetchIHeartMetadata('1481', 'Power 105.1') || 
                    await this.fetchAlternativeMetadata('WWPRFM', 'Power 105.1');
          break;
        case 'hot-105':
          metadata = await this.fetchIHeartMetadata('5907', 'Hot 105') || 
                    await this.fetchAlternativeMetadata('WHQTFM', 'Hot 105');
          break;
        case 'q-93':
          metadata = await this.fetchIHeartMetadata('1037', 'Q93') || 
                    await this.fetchAlternativeMetadata('WQUEFM', 'Q93');
          break;
        case 'beat-955':
          metadata = await this.fetchStreamTheWorldMetadata('KBFBFM', '95.5 The Beat') || 
                    await this.fetchAlternativeMetadata('KBFBFM', '95.5 The Beat');
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
      console.log(`Fetching iHeart metadata for station ${stationId} (${stationName})`);
      
      // Try multiple iHeart API endpoints with enhanced debugging
      const endpoints = [
        `https://www.iheart.com/api/v3/live-meta/stream/${stationId}`,
        `https://www.iheart.com/api/v2/stations/${stationId}/current-track`,
        `https://us1-api.iheart.com/api/v1/catalog/getStation/${stationId}`,
        `https://playerservices.streamtheworld.com/api/livestream?version=1.9&mount=${this.getCallSignFromId(stationId)}&lang=en`
      ];

      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];
        try {
          console.log(`Trying iHeart endpoint ${i + 1}/${endpoints.length}: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Referer': 'https://www.iheart.com/',
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000)
          });

          console.log(`Response status: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            console.log(`Response data:`, JSON.stringify(data, null, 2));
            
            // Try different response structures
            const track = data?.nowPlaying || data?.current_track || data?.results?.livestream?.[0]?.cue || data?.data?.track || data?.data;
            
            if (track && (track.title || track.song)) {
              let artwork = track.artwork || (typeof track.album === 'object' ? track.album?.artwork : undefined);
              
              // If no artwork from API, try to fetch from iTunes
              if (!artwork && track.title && track.artist) {
                artwork = await this.fetchArtworkFromItunes(track.title, track.artist);
              }

              const metadata = {
                title: track.title || track.song || 'Unknown Track',
                artist: track.artist || 'Unknown Artist',
                album: track.album || (typeof track.album === 'object' ? track.album?.name : undefined),
                artwork,
                stationName,
                timestamp: Date.now(),
              };
              
              console.log(`Successfully extracted metadata:`, metadata);
              return metadata;
            } else {
              console.log('No valid track data found in response');
            }
          } else {
            console.log(`HTTP error: ${response.status} ${response.statusText}`);
          }
        } catch (endpointError) {
          console.log(`Endpoint ${i + 1} failed:`, endpointError.message);
          continue;
        }
      }

      console.log(`All iHeart endpoints failed for station ${stationId}`);
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
      console.log(`Fetching SomaFM metadata for channel: ${channel}`);
      
      // Try both endpoints
      const endpoints = [
        `https://somafm.com/songs/${channel}.json`,
        `https://somafm.com/nowplaying/${channel}.json`
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying SomaFM endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            signal: AbortSignal.timeout(5000)
          });

          console.log(`SomaFM response status: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            console.log(`SomaFM response data:`, JSON.stringify(data, null, 2));
            
            const track = data.songs?.[0];

            if (track && track.title) {
              let artwork = track.image;
              
              // If no artwork from SomaFM, try to fetch from iTunes
              if (!artwork && track.title && track.artist) {
                artwork = await this.fetchArtworkFromItunes(track.title, track.artist);
              }

              const metadata = {
                title: track.title || 'Unknown Track',
                artist: track.artist || 'Unknown Artist',
                album: track.album,
                artwork,
                stationName,
                timestamp: Date.now(),
              };
              
              console.log(`Successfully extracted SomaFM metadata:`, metadata);
              return metadata;
            } else {
              console.log('No valid track data found in SomaFM response');
            }
          }
        } catch (endpointError) {
          console.log(`SomaFM endpoint failed:`, endpointError.message);
          continue;
        }
      }

      console.log(`All SomaFM endpoints failed for channel ${channel}`);
      return null;
    } catch (error) {
      console.error(`SomaFM metadata fetch failed for ${channel}:`, error);
      return null;
    }
  }

  private async fetchAlternativeMetadata(callSign: string, stationName: string): Promise<StationMetadata | null> {
    try {
      console.log(`Fetching alternative metadata for ${callSign} (${stationName})`);
      
      // Try multiple alternative sources
      const endpoints = [
        `https://api.streamlicensing.com/stations/${callSign}/nowplaying`,
        `https://onlineradiobox.com/json/${callSign}/play`,
        `https://radio-api.iheart.com/api/v2/stations/${callSign}/live-meta`,
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying alternative endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000)
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`Alternative endpoint response:`, JSON.stringify(data, null, 2));
            
            // Try different response structures from alternative APIs
            const track = data?.current || data?.nowPlaying || data?.song || data?.track || data;
            
            if (track && (track.title || track.song || track.name)) {
              let artwork = track.artwork || track.image || track.cover;
              
              // Fetch artwork from iTunes if not available
              if (!artwork && track.title && track.artist) {
                artwork = await this.fetchArtworkFromItunes(track.title, track.artist);
              }

              return {
                title: track.title || track.song || track.name || 'Unknown Track',
                artist: track.artist || track.by || 'Unknown Artist',
                album: track.album,
                artwork,
                stationName,
                timestamp: Date.now(),
              };
            }
          }
        } catch (endpointError) {
          console.log(`Alternative endpoint failed:`, endpointError.message);
          continue;
        }
      }

      console.log(`All alternative endpoints failed for ${callSign}`);
      return null;
    } catch (error) {
      console.error(`Alternative metadata fetch failed for ${callSign}:`, error);
      return null;
    }
  }

  private async fetchArtworkFromItunes(title: string, artist: string): Promise<string | undefined> {
    try {
      console.log(`Fetching artwork from iTunes for: "${title}" by ${artist}`);
      
      const searchQuery = encodeURIComponent(`${title} ${artist}`);
      const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&media=music&limit=1`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(3000)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const artwork = data.results[0].artworkUrl100?.replace('100x100bb', '600x600bb');
          console.log(`Found iTunes artwork: ${artwork}`);
          return artwork;
        }
      }

      console.log('No artwork found on iTunes');
      return undefined;
    } catch (error) {
      console.log(`iTunes artwork search failed:`, error.message);
      return undefined;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export default MetadataFetcher;