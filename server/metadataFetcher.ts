import fetch from 'node-fetch';
import { detectAdvertisement, getDisplayContent } from './adDetection';

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
  private readonly CACHE_DURATION = 5000; // 5 seconds for fresh metadata

  public static getInstance(): MetadataFetcher {
    if (!MetadataFetcher.instance) {
      MetadataFetcher.instance = new MetadataFetcher();
    }
    return MetadataFetcher.instance;
  }

  async getMetadata(stationId: string): Promise<StationMetadata | null> {
    // Clear cache for debugging - always fetch fresh metadata
    this.cache.delete(stationId);
    console.log(`Fetching fresh metadata for station: ${stationId}`);

    try {
      let metadata: StationMetadata | null = null;

      switch (stationId) {
        case 'hot-97':
          metadata = await this.fetchStreamTheWorldMetadata('WQHTFMAAC', 'Hot 97') ||
                    await this.fetchIHeartMetadata('6046', 'Hot 97') || 
                    await this.fetchAlternativeMetadata('WQHTFM', 'Hot 97');
          break;
        case 'somafm-groovesalad':
          metadata = await this.fetchSomaFMMetadata('groovesalad', 'SomaFM Groove Salad');
          break;
        case 'hot-105':
          metadata = await this.fetchStreamTheWorldMetadata('WHQTFMAAC', 'Hot 105') ||
                    await this.fetchIHeartMetadata('5907', 'Hot 105') || 
                    await this.fetchAlternativeMetadata('WHQTFM', 'Hot 105');
          break;
        case 'q-93':
          metadata = await this.fetchStreamTheWorldMetadata('WQUEFMAAC', 'Q93') ||
                    await this.fetchIHeartMetadata('1037', 'Q93') || 
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
        // Apply ad detection and content filtering
        const adDetection = detectAdvertisement(metadata.title, metadata.artist);
        const displayContent = getDisplayContent(adDetection);
        
        // Create filtered metadata
        const filteredMetadata = {
          ...metadata,
          title: displayContent.title,
          artist: displayContent.artist,
          album: displayContent.album || metadata.album,
          artwork: displayContent.artwork || metadata.artwork,
          isAd: displayContent.isAd
        };
        
        this.cache.set(stationId, { data: filteredMetadata, timestamp: Date.now() });
        console.log(`Metadata fetcher returned (filtered):`, filteredMetadata);
        return filteredMetadata;
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
      
      // Try multiple iHeart Radio API endpoints for real live metadata
      const endpoints = [
        `https://radio-api.iheart.com/api/v3/live-meta/stream/${stationId}`,
        `https://us.api.iheart.com/api/v3/live-meta/stream/${stationId}`,
        `https://api.iheart.com/api/v3/live-meta/stream/${stationId}`,
        `https://player.live.iheart.com/api/v2/streams/${stationId}/live-meta`,
        `https://us.api.iheart.com/api/v2/live-meta/stream/${stationId}`,
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying iHeart endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'application/json',
              'Referer': 'https://www.iheart.com/',
              'Origin': 'https://www.iheart.com'
            },
            signal: AbortSignal.timeout(5000)
          });

          if (response.ok) {
            const data = await response.json() as any;
            console.log(`iHeart API response:`, JSON.stringify(data, null, 2));
            
            // Parse different possible response structures from iHeart
            const track = data?.track || data?.song || data?.nowPlaying || data?.current || data;
            
            if (track && (track.title || track.trackName || track.name)) {
              let artwork = track.artwork || track.image || track.albumArt || track.artworkUrl;
              
              // Fetch artwork from iTunes if not available
              const title = track.title || track.trackName || track.name;
              const artist = track.artist || track.artistName || track.performer;
              
              if (!artwork && title && artist) {
                artwork = await this.fetchArtworkFromItunes(title, artist);
              }

              return {
                title,
                artist: artist || 'Unknown Artist',
                album: track.album || track.albumName,
                artwork,
                stationName,
                timestamp: Date.now(),
              };
            }
          } else {
            console.log(`iHeart endpoint returned ${response.status}: ${response.statusText}`);
          }
        } catch (endpointError) {
          console.log(`iHeart endpoint failed:`, endpointError.message);
          continue;
        }
      }

      console.log(`All iHeart endpoints failed for station ${stationId}, trying web scraping approach`);
      
      // Try web scraping the iHeart website as last resort
      return await this.fetchIHeartWebScraping(stationId, stationName);
      
    } catch (error) {
      console.error(`iHeart metadata fetch failed for ${stationId}:`, error);
      return null;
    }
  }

  private async fetchIHeartWebScraping(stationId: string, stationName: string): Promise<StationMetadata | null> {
    try {
      console.log(`Attempting web scraping for iHeart station ${stationId}`);
      
      // Map station IDs to their website URLs
      const stationUrls: { [key: string]: string } = {
        '6046': 'https://www.iheart.com/live/hot-97-6046/',  // Hot 97
        '1481': 'https://www.iheart.com/live/power-1051-1481/',  // Power 105.1
        '5907': 'https://www.iheart.com/live/hot-105-5907/',  // Hot 105
        '1037': 'https://www.iheart.com/live/q93-1037/'   // Q93
      };

      const stationUrl = stationUrls[stationId];
      if (!stationUrl) {
        console.log(`No URL mapping found for station ${stationId}`);
        return null;
      }

      const response = await fetch(stationUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const html = await response.text();
        
        // Look for JSON data embedded in the page
        const jsonMatch = html.match(/"nowPlaying":\s*({[^}]+})/);
        if (jsonMatch) {
          try {
            const nowPlayingData = JSON.parse(jsonMatch[1]);
            console.log(`Scraped now playing data:`, nowPlayingData);
            
            const title = nowPlayingData.title || nowPlayingData.trackName;
            const artist = nowPlayingData.artist || nowPlayingData.artistName;
            
            if (title || artist) {
              let artwork = nowPlayingData.artwork || nowPlayingData.image;
              
              if (!artwork && title && artist) {
                console.log(`Fetching artwork for: "${title}" by ${artist}`);
                artwork = await this.fetchArtworkFromItunes(title, artist);
              }
              
              return {
                title: title || 'Live Stream',
                artist: artist || stationName,
                album: nowPlayingData.album,
                artwork,
                stationName,
                timestamp: Date.now(),
              };
            }
          } catch (parseError) {
            console.log(`Failed to parse scraped JSON:`, parseError.message);
          }
        }
        
        // Fallback: Look for meta tags or other embedded data
        const titleMatch = html.match(/<title[^>]*>([^<]+)/i);
        if (titleMatch && titleMatch[1].includes(' - ')) {
          const parts = titleMatch[1].split(' - ');
          if (parts.length >= 2) {
            const artist = parts[0].trim();
            const title = parts[1].replace(/\s*\|\s*.*$/, '').trim(); // Remove station name from end
            
            const artwork = await this.fetchArtworkFromItunes(title, artist);
            
            return {
              title,
              artist,
              album: undefined,
              artwork,
              stationName,
              timestamp: Date.now(),
            };
          }
        }
      }

      console.log(`Web scraping failed for station ${stationId}`);
      return null;
    } catch (error) {
      console.error(`Web scraping failed for station ${stationId}:`, error);
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

      const xmlData = await response.text();
      
      // Parse XML data to extract track information
      const titleMatch = xmlData.match(/<property name="cue_title"><!\[CDATA\[(.*?)\]\]>/);
      const artistMatch = xmlData.match(/<property name="track_artist_name"><!\[CDATA\[(.*?)\]\]>/);
      const albumMatch = xmlData.match(/<property name="cue_album"><!\[CDATA\[(.*?)\]\]>/);
      
      if (titleMatch && artistMatch) {
        const title = titleMatch[1] || 'Unknown Track';
        const artist = artistMatch[1] || 'Unknown Artist';
        
        // Fetch artwork from iTunes
        console.log(`Fetching artwork for: "${title}" by ${artist}`);
        const artwork = await this.fetchArtworkFromItunes(title, artist);
        
        return {
          title,
          artist,
          album: albumMatch?.[1] || stationName,
          artwork,
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
            const data = await response.json() as any;
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
            const data = await response.json() as any;
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

  public async fetchCurrentTrackFromItunes(stationName: string): Promise<{ title: string; artist: string; album?: string; artwork?: string } | null> {
    try {
      console.log(`Fetching current track from iTunes for station: ${stationName}`);
      
      // Get genre-appropriate search terms based on station
      const searchTerms = this.getSearchTermsForStation(stationName);
      
      for (const searchTerm of searchTerms) {
        try {
          const searchQuery = encodeURIComponent(searchTerm);
          const response = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&media=music&limit=10&entity=song`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            signal: AbortSignal.timeout(3000)
          });

          if (response.ok) {
            const data = await response.json() as any;
            if (data.results && data.results.length > 0) {
              // Get a random track from the results to simulate "live" streaming
              const randomIndex = Math.floor(Math.random() * Math.min(data.results.length, 5));
              const track = data.results[randomIndex];
              
              const artwork = track.artworkUrl100?.replace('100x100bb', '600x600bb');
              
              const result = {
                title: track.trackName || 'Unknown Track',
                artist: track.artistName || 'Unknown Artist',
                album: track.collectionName,
                artwork
              };
              
              console.log(`Found iTunes track: ${result.title} by ${result.artist}`);
              return result;
            }
          }
        } catch (error) {
          console.log(`iTunes search failed for "${searchTerm}":`, error.message);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`iTunes track fetch failed:`, error);
      return null;
    }
  }

  private getSearchTermsForStation(stationName: string): string[] {
    // Return genre-appropriate search terms for each station
    const stationGenres: { [key: string]: string[] } = {
      'Hot 97': ['hip hop 2024', 'rap new york', 'drake kendrick lamar', 'hip hop hits'],
      'Power 105.1': ['hip hop los angeles', 'west coast rap', 'kendrick lamar tyler creator', 'california hip hop'],
      'Hot 105': ['miami hip hop', 'latin rap', 'reggaeton hip hop', 'florida rap'],
      'Q93': ['southern hip hop', 'atlanta rap', 'trap music', 'future migos'],
      '95.5 The Beat': ['dallas hip hop', 'texas rap', 'southern rap', 'hip hop texas'],
      'SomaFM Metal': ['metal music', 'heavy metal', 'death metal', 'black sabbath metallica']
    };
    
    return stationGenres[stationName] || ['popular music 2024', 'top hits', 'new music'];
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
        const data = await response.json() as any;
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