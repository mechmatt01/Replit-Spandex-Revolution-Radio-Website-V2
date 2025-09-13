// Enhanced radio streaming with multiple fallback methods
export interface LiveTrackInfo {
  title: string;
  artist: string;
  album?: string;
  listeners: number;
  bitrate: number;
  server_name: string;
  server_description: string;
  genre: string;
}

class RadioStreamAPI {
  private audioElement: HTMLAudioElement | null = null;
  private isInitialized = false;
  private streamUrls = [
    "http://168.119.74.185:9858/autodj",
    "http://168.119.74.185:9858/stream",
    "http://168.119.74.185:9858/live",
  ];
  private currentUrlIndex = 0;

  async initializeStream(): Promise<boolean> {
    if (this.isInitialized && this.audioElement) {
      return true;
    }

    try {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = "anonymous";
      this.audioElement.preload = "none";
      this.audioElement.volume = 0.7;

      // Set up comprehensive error handling
      this.audioElement.addEventListener(
        "error",
        this.handleStreamError.bind(this),
      );
      this.audioElement.addEventListener("loadstart", () =>
        console.log("Stream loading started"),
      );
      this.audioElement.addEventListener("canplay", () =>
        console.log("Stream ready to play"),
      );
      this.audioElement.addEventListener("playing", () =>
        console.log("Stream is playing"),
      );
      this.audioElement.addEventListener("waiting", () =>
        console.log("Stream buffering"),
      );
      this.audioElement.addEventListener("stalled", () =>
        console.log("Stream stalled"),
      );

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize stream:", error);
      return false;
    }
  }

  private handleStreamError(event: Event) {
    console.error("Stream error occurred:", event);

    // Try next URL in the list
    if (this.currentUrlIndex < (this.streamUrls?.length || 0) - 1) {
      this.currentUrlIndex++;
      console.log(
        `Trying fallback stream: ${this.streamUrls[this.currentUrlIndex]}`,
      );
      this.tryPlayWithUrl(this.streamUrls[this.currentUrlIndex]);
    } else {
      console.error("All stream URLs failed");
      this.currentUrlIndex = 0; // Reset for next attempt
    }
  }

  private async tryPlayWithUrl(url: string): Promise<void> {
    if (!this.audioElement) return;

    try {
      this.audioElement.src = `${url}?t=${Date.now()}`;
      this.audioElement.load();
      await this.audioElement.play();
    } catch (error) {
      console.error(`Failed to play with URL ${url}:`, error);
      throw error;
    }
  }

  async togglePlayback(): Promise<boolean> {
    await this.initializeStream();

    if (!this.audioElement) {
      console.error("Audio element not available");
      return false;
    }

    try {
      if (this.audioElement.paused) {
        // Start playing
        await this.tryPlayWithUrl(this.streamUrls[this.currentUrlIndex]);
        return true;
      } else {
        // Pause
        this.audioElement.pause();
        return false;
      }
    } catch (error) {
      console.error("Playback toggle failed:", error);
      return false;
    }
  }

  async startStream(): Promise<boolean> {
    await this.initializeStream();

    if (!this.audioElement) return false;

    try {
      await this.tryPlayWithUrl(this.streamUrls[this.currentUrlIndex]);
      return true;
    } catch (error) {
      console.error("Failed to start stream:", error);
      return false;
    }
  }

  stopStream(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = "";
    }
  }

  setVolume(volume: number): void {
    if (this.audioElement) {
      // Ensure volume is in valid range
      const safeVolume = Math.max(0, Math.min(1, volume));
      this.audioElement.volume = safeVolume;
    }
  }

  isPlaying(): boolean {
    return this.audioElement ? !this.audioElement.paused : false;
  }

  getCurrentVolume(): number {
    return this.audioElement ? this.audioElement.volume : 0.7;
  }

  destroy(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = "";
      this.audioElement = null;
    }
    this.isInitialized = false;
  }

  // Get enhanced stream status with artwork
  async getStreamStatus(): Promise<LiveTrackInfo | null> {
    try {
      // Return default stream info since we can't fetch from server
          return {
        title: "Live Radio Stream",
        artist: "Spandex Salvation Radio",
        album: "Live Metal Radio",
        listeners: 0,
            bitrate: 128,
        server_name: "Spandex Salvation Radio",
        server_description: "Live Metal Radio",
        genre: "Metal",
        };
    } catch (error) {
      console.error("Failed to get stream status:", error);
      return null;
    }
  }
}

export const radioStreamAPI = new RadioStreamAPI();

// Helper function to check if browser supports audio streaming
export function checkAudioSupport(): boolean {
  const audio = document.createElement("audio");
  return !!(
    audio.canPlayType &&
    (audio.canPlayType("audio/mpeg").replace(/no/, "") ||
      audio.canPlayType("audio/mp3").replace(/no/, ""))
  );
}

// Alternative streaming approach using MediaSource API (experimental)
export class AdvancedRadioStream {
  private mediaSource: MediaSource | null = null;
  private sourceBuffer: SourceBuffer | null = null;
  private audioElement: HTMLAudioElement | null = null;

  async initializeAdvancedStream(): Promise<boolean> {
    if (!("MediaSource" in window)) {
      console.log("MediaSource API not supported, falling back to basic audio");
      return false;
    }

    try {
      this.mediaSource = new MediaSource();
      this.audioElement = new Audio();
      this.audioElement.src = URL.createObjectURL(this.mediaSource);

      return new Promise((resolve) => {
        this.mediaSource!.addEventListener("sourceopen", () => {
          try {
            this.sourceBuffer = this.mediaSource!.addSourceBuffer("audio/mpeg");
            resolve(true);
          } catch (error) {
            console.error("Failed to add source buffer:", error);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error("Failed to initialize advanced stream:", error);
      return false;
    }
  }

  async streamAudioData(url: string): Promise<void> {
    if (!this.sourceBuffer) return;

    try {
      const response = await fetch(url);
      const reader = response.body?.getReader();

      if (!reader) throw new Error("No readable stream");

      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read();

        if (done) {
          this.mediaSource?.endOfStream();
          return;
        }

        if (this.sourceBuffer && !this.sourceBuffer.updating) {
          this.sourceBuffer.appendBuffer(value);
        }

        return pump();
      };

      await pump();
    } catch (error) {
      console.error("Streaming error:", error);
    }
  }
}
