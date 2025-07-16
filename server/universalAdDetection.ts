import { detectAdContent, quickAdDetection } from './adDetection';
import { storage } from './storage';
import type { RadioStation } from '@shared/schema';

interface UniversalAdDetectionResult {
  isAd: boolean;
  confidence: number;
  transcription?: string;
  category?: string;
  brand?: string;
  stationId: string;
  timestamp: Date;
}

interface StreamMetadata {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration?: number;
  isLive?: boolean;
  stationId: string;
}

/**
 * Universal Advertisement Detection System
 * Works with any radio station streaming URL and API format
 */
export class UniversalAdDetector {
  private adDetectionCache = new Map<string, UniversalAdDetectionResult>();
  private cacheTimeout = 30000; // 30 seconds cache

  /**
   * Detect advertisements for any radio station
   */
  async detectAdsForStation(stationId: string, metadata?: StreamMetadata): Promise<UniversalAdDetectionResult> {
    const cacheKey = `${stationId}_${metadata?.title || 'unknown'}_${metadata?.artist || 'unknown'}`;
    
    // Check cache first
    if (this.adDetectionCache.has(cacheKey)) {
      const cached = this.adDetectionCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp.getTime() < this.cacheTimeout) {
        return cached;
      }
    }

    try {
      const station = await storage.getRadioStationByStationId(stationId);
      if (!station) {
        return this.createFallbackResult(stationId, false);
      }

      // Quick text-based detection first
      const quickResult = this.performQuickDetection(metadata, station);
      if (quickResult.isAd) {
        this.cacheResult(cacheKey, quickResult);
        return quickResult;
      }

      // Advanced audio detection for deeper analysis
      const audioResult = await this.performAudioDetection(station, metadata);
      this.cacheResult(cacheKey, audioResult);
      return audioResult;

    } catch (error) {
      console.error(`Universal ad detection failed for station ${stationId}:`, error);
      return this.createFallbackResult(stationId, false);
    }
  }

  /**
   * Quick text-based advertisement detection
   */
  private performQuickDetection(metadata?: StreamMetadata, station?: RadioStation): UniversalAdDetectionResult {
    if (!metadata) {
      return this.createFallbackResult(station?.stationId || 'unknown', false);
    }

    const textToAnalyze = `${metadata.title} ${metadata.artist} ${metadata.album || ''}`.toLowerCase();
    
    // Common advertisement keywords and patterns
    const adKeywords = [
      'commercial', 'advertisement', 'promo', 'sponsored', 'ad break',
      'brought to you by', 'this message', 'call now', 'visit us',
      'limited time', 'special offer', 'don\'t miss', 'hurry',
      'mcdonalds', 'coca cola', 'pepsi', 'nike', 'apple',
      'geico', 'progressive', 'state farm', 'allstate',
      'verizon', 'at&t', 'sprint', 't-mobile',
      'ford', 'chevrolet', 'toyota', 'honda'
    ];

    // Station-specific commercial patterns
    const commercialPatterns = [
      /in\s+a\s+commercial/i,
      /commercial\s+break/i,
      /we'll\s+be\s+right\s+back/i,
      /stay\s+tuned/i,
      /advertisement/i,
      /sponsored\s+by/i
    ];

    // Check for ad keywords
    const hasAdKeywords = adKeywords.some(keyword => textToAnalyze.includes(keyword));
    const hasCommercialPattern = commercialPatterns.some(pattern => pattern.test(textToAnalyze));

    const isAd = hasAdKeywords || hasCommercialPattern;
    const confidence = isAd ? 0.85 : 0.15;

    // Extract brand if detected
    let brand = undefined;
    if (isAd) {
      brand = this.extractBrand(textToAnalyze);
    }

    return {
      isAd,
      confidence,
      category: isAd ? 'text_based' : undefined,
      brand,
      stationId: station?.stationId || 'unknown',
      timestamp: new Date()
    };
  }

  /**
   * Advanced audio-based advertisement detection
   */
  private async performAudioDetection(station: RadioStation, metadata?: StreamMetadata): Promise<UniversalAdDetectionResult> {
    try {
      // Use existing audio detection system
      const audioResult = await detectAdContent(station.streamUrl, {
        stationId: station.stationId,
        apiType: station.apiType,
        apiUrl: station.apiUrl || undefined
      });

      return {
        isAd: audioResult.isAd,
        confidence: audioResult.confidence,
        transcription: audioResult.transcription,
        category: audioResult.category,
        brand: audioResult.brand,
        stationId: station.stationId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Audio detection failed:', error);
      return this.createFallbackResult(station.stationId, false);
    }
  }

  /**
   * Fetch metadata for any station type
   */
  async fetchStationMetadata(station: RadioStation): Promise<StreamMetadata | null> {
    try {
      switch (station.apiType) {
        case 'triton':
          return await this.fetchTritonMetadata(station);
        case 'streamtheworld':
          return await this.fetchStreamTheWorldMetadata(station);
        case 'somafm':
          return await this.fetchSomaFMMetadata(station);
        case 'custom':
          return await this.fetchCustomMetadata(station);
        case 'auto':
          return await this.autoDetectAndFetchMetadata(station);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Failed to fetch metadata for station ${station.stationId}:`, error);
      return null;
    }
  }

  /**
   * Fetch metadata from Triton Digital API
   */
  private async fetchTritonMetadata(station: RadioStation): Promise<StreamMetadata | null> {
    if (!station.apiUrl) return null;

    try {
      const response = await fetch(station.apiUrl, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      const track = data.tracks?.[0];

      if (!track) return null;

      return {
        title: track.title || 'Unknown',
        artist: track.artist || 'Unknown',
        album: track.album,
        artwork: track.artwork,
        duration: track.duration,
        isLive: true,
        stationId: station.stationId
      };
    } catch (error) {
      console.error('Triton metadata fetch failed:', error);
      return null;
    }
  }

  /**
   * Fetch metadata from StreamTheWorld API
   */
  private async fetchStreamTheWorldMetadata(station: RadioStation): Promise<StreamMetadata | null> {
    if (!station.apiUrl) return null;

    try {
      const response = await fetch(station.apiUrl, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) return null;

      const jsContent = await response.text();
      const metadataMatch = jsContent.match(/nowplaying.*?=.*?({.*?})/);
      
      if (!metadataMatch) return null;

      const data = JSON.parse(metadataMatch[1]);

      return {
        title: data.title || 'Unknown',
        artist: data.artist || 'Unknown',
        album: data.album,
        artwork: data.artwork,
        isLive: true,
        stationId: station.stationId
      };
    } catch (error) {
      console.error('StreamTheWorld metadata fetch failed:', error);
      return null;
    }
  }

  /**
   * Fetch metadata from SomaFM API
   */
  private async fetchSomaFMMetadata(station: RadioStation): Promise<StreamMetadata | null> {
    try {
      const response = await fetch(`https://somafm.com/songs/${station.stationId}.json`, {
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) return null;

      const data = await response.json();
      const track = data.songs?.[0];

      if (!track) return null;

      return {
        title: track.title || 'Unknown',
        artist: track.artist || 'Unknown',
        album: track.album,
        isLive: true,
        stationId: station.stationId
      };
    } catch (error) {
      console.error('SomaFM metadata fetch failed:', error);
      return null;
    }
  }

  /**
   * Fetch metadata from custom API
   */
  private async fetchCustomMetadata(station: RadioStation): Promise<StreamMetadata | null> {
    if (!station.apiUrl) return null;

    try {
      const response = await fetch(station.apiUrl, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();

      // Try to map common field names
      const title = data.title || data.song || data.track || data.nowPlaying?.title || 'Unknown';
      const artist = data.artist || data.performer || data.nowPlaying?.artist || 'Unknown';
      const album = data.album || data.nowPlaying?.album;

      return {
        title,
        artist,
        album,
        isLive: true,
        stationId: station.stationId
      };
    } catch (error) {
      console.error('Custom metadata fetch failed:', error);
      return null;
    }
  }

  /**
   * Auto-detect API type and fetch metadata
   */
  private async autoDetectAndFetchMetadata(station: RadioStation): Promise<StreamMetadata | null> {
    // Try different API types in order of popularity
    const apiTypes = ['triton', 'streamtheworld', 'custom', 'somafm'];
    
    for (const apiType of apiTypes) {
      const tempStation = { ...station, apiType };
      
      try {
        const metadata = await this.fetchStationMetadata(tempStation);
        if (metadata) {
          // Update station with detected API type
          await storage.updateRadioStation(station.id, { apiType: apiType as "custom" | "triton" | "streamtheworld" | "somafm" | "auto" });
          return metadata;
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  }

  /**
   * Extract brand name from text
   */
  private extractBrand(text: string): string | undefined {
    const brandPatterns = [
      /mcdonalds?/i,
      /coca[\s-]?cola/i,
      /pepsi/i,
      /nike/i,
      /apple/i,
      /geico/i,
      /progressive/i,
      /state\s+farm/i,
      /allstate/i,
      /verizon/i,
      /at&t/i,
      /sprint/i,
      /t[\s-]?mobile/i,
      /ford/i,
      /chevrolet/i,
      /toyota/i,
      /honda/i
    ];

    for (const pattern of brandPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return undefined;
  }

  /**
   * Create fallback result
   */
  private createFallbackResult(stationId: string, isAd: boolean): UniversalAdDetectionResult {
    return {
      isAd,
      confidence: 0.5,
      stationId,
      timestamp: new Date()
    };
  }

  /**
   * Cache detection result
   */
  private cacheResult(key: string, result: UniversalAdDetectionResult): void {
    this.adDetectionCache.set(key, result);
    
    // Clean up old cache entries
    setTimeout(() => {
      this.adDetectionCache.delete(key);
    }, this.cacheTimeout);
  }

  /**
   * Clear all cached results
   */
  clearCache(): void {
    this.adDetectionCache.clear();
  }
}

// Export singleton instance
export const universalAdDetector = new UniversalAdDetector();