/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.weather = onRequest(async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }
    const apiKey = process.env.OPENWEATHER_API_KEY || "bc23ce0746d4fc5c04d1d765589dadc5";
    // Use dynamic import for node-fetch (ESM)
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    // Get current weather data
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      return res.status(weatherResponse.status).json({ error: errorText });
    }
    const weatherData = await weatherResponse.json();
    // Get location name from reverse geocoding
    const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    const geoResponse = await fetch(geoUrl);
    let locationName = "Unknown Location";
    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      if (geoData.length > 0) {
        const location = geoData[0];
        locationName = location.state
          ? `${location.name}, ${location.state}`
          : `${location.name}, ${location.country}`;
      }
    } else {
      locationName = `Lat: ${parseFloat(lat).toFixed(2)}, Lon: ${parseFloat(lon).toFixed(2)}`;
    }
    const weatherInfo = {
      location: locationName,
      temperature: Math.round(weatherData.main.temp),
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind?.speed || 0,
      feelsLike: Math.round(weatherData.main.feels_like),
    };
    res.json(weatherInfo);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch weather data: ${error.message}` });
  }
});
