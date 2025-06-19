import https from "https";
import type { Express, Request, Response } from "express";

export function setupRadioProxy(app: Express) {
  // Radio stream proxy to handle CORS and format issues
  app.get("/api/radio-stream", (req: Request, res: Response) => {
    const streamUrls = [
      // Hot 97 TuneIn stream URLs
      "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC_SC",
      "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFM_SC",
      "https://ice24.securenetsystems.net/WQHT",
      "https://stream.revma.ihrhls.com/zc181",
      // Fallback to working stream
      "https://ice1.somafm.com/metal-128-mp3"
    ];

    let currentStreamIndex = 0;

    const tryNextStream = () => {
      if (currentStreamIndex >= streamUrls.length) {
        if (!res.headersSent) {
          res.status(503).json({ error: "All stream sources unavailable" });
        }
        return;
      }

      const streamUrl = streamUrls[currentStreamIndex];
      console.log(`Trying KPRS stream ${currentStreamIndex + 1}: ${streamUrl}`);

      const request = https.get(streamUrl, (response) => {
        if (response.statusCode === 200 && !res.headersSent) {
          // Set headers for audio streaming
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Accept-Ranges', 'bytes');

          // Pipe the stream directly
          response.pipe(res);

          response.on('error', (error) => {
            console.error(`Stream ${currentStreamIndex + 1} error:`, error);
            if (!res.headersSent) {
              currentStreamIndex++;
              tryNextStream();
            }
          });
        } else {
          console.log(`Stream ${currentStreamIndex + 1} failed with status ${response.statusCode}`);
          currentStreamIndex++;
          tryNextStream();
        }
      });

      request.on('error', (error) => {
        console.error(`Stream ${currentStreamIndex + 1} request error:`, error);
        currentStreamIndex++;
        tryNextStream();
      });

      request.setTimeout(5000, () => {
        console.log(`Stream ${currentStreamIndex + 1} timeout`);
        request.destroy();
        currentStreamIndex++;
        tryNextStream();
      });
    };

    tryNextStream();
  });
}