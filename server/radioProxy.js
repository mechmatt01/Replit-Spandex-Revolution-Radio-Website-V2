import https from "https";
import http from "http";
export function setupRadioProxy(app) {
    // Radio stream proxy to handle CORS and format issues
    app.get("/api/radio-stream", (req, res) => {
        // Get the station URL from query parameter, fallback to default streams
        const requestedStream = req.query.url;
        // Station-specific fallback URLs with better working streams
        const stationFallbacks = {
            "https://playerservices.streamtheworld.com/api/livestream-redirect/KBFBFMAAC.aac": [
                "https://24883.live.streamtheworld.com/KBFBFMAAC",
                "https://14923.live.streamtheworld.com/KBFBFMAAC",
                "https://playerservices.streamtheworld.com/api/livestream-redirect/KBFBFM.mp3",
                "https://ice1.somafm.com/metal-128-mp3",
            ],
            "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFMAAC.aac": [
                "https://n07.radiojar.com/4wqmj9krs5mtv",
                "https://n1ca-ice-cast.streamon.fm/Hot97_SC",
                "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFM.mp3",
                "https://ice1.somafm.com/metal-128-mp3",
            ],
            "https://playerservices.streamtheworld.com/api/livestream-redirect/KPWRFMAAC.aac": [
                "https://n30.radiojar.com/ggd4cs6rs5mtv",
                "https://playerservices.streamtheworld.com/api/livestream-redirect/KPWRFM.mp3",
                "https://ice1.somafm.com/metal-128-mp3",
            ],
            "https://ice1.somafm.com/metal-128-mp3": [
                "https://ice1.somafm.com/metal-128-mp3",
                "https://ice2.somafm.com/metal-128-mp3",
                "https://ice6.somafm.com/metal-128-mp3",
            ],
        };
        const streamUrls = requestedStream
            ? stationFallbacks[requestedStream] || [
                requestedStream,
                requestedStream +
                    (requestedStream.includes("?") ? "&" : "?") +
                    "nocache=" +
                    Date.now(),
                requestedStream.replace(".aac", ".mp3"),
                // Final fallback
                "https://ice1.somafm.com/metal-128-mp3",
            ]
            : [
                // Default streams if no URL provided
                "https://playerservices.streamtheworld.com/api/livestream-redirect/KBFBFMAAC.aac",
                "https://24883.live.streamtheworld.com/KBFBFMAAC",
                "https://ice1.somafm.com/metal-128-mp3",
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
            console.log(`Trying radio stream ${currentStreamIndex + 1}: ${streamUrl}`);
            // Choose the appropriate module based on protocol
            const isHttps = streamUrl.startsWith("https://");
            const requestModule = isHttps ? https : http;
            const request = requestModule.get(streamUrl, (response) => {
                // Handle redirects for streaming services
                if ((response.statusCode === 301 || response.statusCode === 302) &&
                    response.headers.location) {
                    console.log(`Stream ${currentStreamIndex + 1} redirected to: ${response.headers.location}`);
                    const redirectUrl = response.headers.location;
                    const redirectModule = redirectUrl.startsWith("https://")
                        ? https
                        : http;
                    const redirectRequest = redirectModule.get(redirectUrl, (redirectResponse) => {
                        if (redirectResponse.statusCode === 200 && !res.headersSent) {
                            // Set headers for audio streaming
                            res.setHeader("Content-Type", "audio/mpeg");
                            res.setHeader("Access-Control-Allow-Origin", "*");
                            res.setHeader("Access-Control-Allow-Methods", "GET");
                            res.setHeader("Cache-Control", "no-cache");
                            res.setHeader("Accept-Ranges", "bytes");
                            // Pipe the stream directly
                            redirectResponse.pipe(res);
                            console.log(`Stream ${currentStreamIndex + 1} connected successfully via redirect`);
                            redirectResponse.on("error", (error) => {
                                console.error(`Redirect stream ${currentStreamIndex + 1} error:`, error);
                                if (!res.headersSent) {
                                    currentStreamIndex++;
                                    tryNextStream();
                                }
                            });
                        }
                        else {
                            console.log(`Redirect stream ${currentStreamIndex + 1} failed with status ${redirectResponse.statusCode}`);
                            currentStreamIndex++;
                            tryNextStream();
                        }
                    });
                    redirectRequest.on("error", (error) => {
                        console.error(`Redirect request ${currentStreamIndex + 1} error:`, error);
                        currentStreamIndex++;
                        tryNextStream();
                    });
                    redirectRequest.setTimeout(10000, () => {
                        console.log(`Redirect stream ${currentStreamIndex + 1} timeout`);
                        redirectRequest.destroy();
                        currentStreamIndex++;
                        tryNextStream();
                    });
                }
                else if (response.statusCode === 200 && !res.headersSent) {
                    // Set headers for audio streaming
                    res.setHeader("Content-Type", "audio/mpeg");
                    res.setHeader("Access-Control-Allow-Origin", "*");
                    res.setHeader("Access-Control-Allow-Methods", "GET");
                    res.setHeader("Cache-Control", "no-cache");
                    res.setHeader("Accept-Ranges", "bytes");
                    // Pipe the stream directly
                    response.pipe(res);
                    console.log(`Stream ${currentStreamIndex + 1} connected successfully`);
                    response.on("error", (error) => {
                        console.error(`Stream ${currentStreamIndex + 1} error:`, error);
                        if (!res.headersSent) {
                            currentStreamIndex++;
                            tryNextStream();
                        }
                    });
                }
                else {
                    console.log(`Stream ${currentStreamIndex + 1} failed with status ${response.statusCode}`);
                    currentStreamIndex++;
                    tryNextStream();
                }
            });
            request.on("error", (error) => {
                console.error(`Stream ${currentStreamIndex + 1} request error:`, error);
                currentStreamIndex++;
                tryNextStream();
            });
            request.setTimeout(10000, () => {
                console.log(`Stream ${currentStreamIndex + 1} timeout`);
                request.destroy();
                currentStreamIndex++;
                tryNextStream();
            });
        };
        tryNextStream();
    });
}
