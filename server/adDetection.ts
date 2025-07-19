import OpenAI from "openai";
import { Readable } from "stream";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;

// Initialize OpenAI only if API key is available
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

interface AdDetectionResult {
  isAd: boolean;
  confidence: number;
  transcription: string;
  category?: string;
  brand?: string;
}

// Sample the radio stream and analyze for ad content
export async function detectAdContent(
  streamUrl: string,
): Promise<AdDetectionResult> {
  try {
    // Record a 10-second sample from the radio stream
    const audioSample = await captureAudioSample(streamUrl, 10000);

    // Transcribe the audio using Whisper
    const transcription = await transcribeAudio(audioSample);

    // Analyze the transcription to detect if it's an advertisement
    const adAnalysis = await analyzeForAdvertisement(transcription);

    return {
      isAd: adAnalysis.isAd,
      confidence: adAnalysis.confidence,
      transcription: transcription,
      category: adAnalysis.category,
      brand: adAnalysis.brand,
    };
  } catch (error) {
    console.error("Error in ad detection:", error);
    return {
      isAd: false,
      confidence: 0,
      transcription: "",
      category: undefined,
      brand: undefined,
    };
  }
}

// Capture a sample of audio from the radio stream
async function captureAudioSample(
  streamUrl: string,
  durationMs: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const timeout = setTimeout(() => {
      resolve(Buffer.concat(chunks));
    }, durationMs);

    // Use native fetch (Node.js 18+)
    fetch(streamUrl)
      .then((response) => {
        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();

        const pump = () => {
          return reader.read().then(({ done, value }) => {
            if (done) {
              resolve(Buffer.concat(chunks));
              return;
            }
            chunks.push(Buffer.from(value));
            return pump();
          });
        };

        pump().catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

// Transcribe audio using OpenAI Whisper
async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  if (!openai) {
    return "";
  }

  try {
    // Convert buffer to a readable stream for OpenAI API
    const audioStream = Readable.from(audioBuffer);

    const transcription = await openai.audio.transcriptions.create({
      file: audioStream as any,
      model: "whisper-1",
      response_format: "text",
      language: "en",
    });

    return transcription || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return "";
  }
}

// Analyze transcription to determine if it's an advertisement
async function analyzeForAdvertisement(transcription: string): Promise<{
  isAd: boolean;
  confidence: number;
  category?: string;
  brand?: string;
}> {
  if (!transcription || transcription.trim().length === 0) {
    return { isAd: false, confidence: 0 };
  }

  if (!openai) {
    return { isAd: quickAdDetection(transcription), confidence: 0.5 };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at identifying advertisements in radio content. Analyze the following transcription and determine if it's an advertisement or commercial break versus music/DJ content.

Consider these factors:
- Product/service mentions and promotions
- Call-to-action phrases ("Call now", "Visit today", "Limited time")
- Price mentions or deals
- Company/brand names being promoted
- Advertising jargon and marketing language
- Phone numbers, websites, or addresses
- "Sponsored by" or similar phrases

Respond with JSON in this exact format:
{
  "isAd": true/false,
  "confidence": 0.0-1.0,
  "category": "automotive/finance/retail/food/etc" (if ad),
  "brand": "brand name" (if identifiable)
}`,
        },
        {
          role: "user",
          content: transcription,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      isAd: result.isAd || false,
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      category: result.category,
      brand: result.brand,
    };
  } catch (error) {
    console.error("Error analyzing for advertisement:", error);
    return { isAd: false, confidence: 0 };
  }
}

// Common advertisement keywords for quick detection
const adKeywords = [
  "call now",
  "limited time",
  "special offer",
  "visit today",
  "don't miss",
  "sale",
  "discount",
  "percent off",
  "financing available",
  "free delivery",
  "sponsored by",
  "brought to you by",
  "commercial",
  "advertisement",
  "phone number",
  "website",
  "location",
  "store",
  "dealership",
  "capital one",
  "bank",
  "credit card",
  "interest rate",
  "apply today",
  "terms apply",
  "see website",
  "member fdic",
  "credit approval",
];

// Quick keyword-based ad detection (fallback method)
export function quickAdDetection(text: string): boolean {
  if (!text) return false;

  const lowerText = text.toLowerCase();
  const adKeywordCount = adKeywords.filter((keyword) =>
    lowerText.includes(keyword),
  ).length;

  // If 2 or more ad keywords are found, likely an advertisement
  return adKeywordCount >= 2;
}

// Enhanced metadata analysis for ad detection
export function analyzeStreamMetadata(metadata: any): {
  isAd: boolean;
  reason?: string;
} {
  if (!metadata) return { isAd: false };

  const title = (metadata.title || "").toLowerCase();
  const artist = (metadata.artist || "").toLowerCase();
  const description = (metadata.description || "").toLowerCase();
  const fullText = `${title} ${artist} ${description}`.toLowerCase();

  // Check for commercial indicators in metadata
  const commercialIndicators = [
    "commercial",
    "advertisement",
    "ad break",
    "sponsored",
    "promo",
    "jingle",
    "spot",
    "PSA",
    "public service",
  ];

  // Check for specific brand indicators
  const brandIndicators = [
    "capital one",
    "discover card",
    "chase bank",
    "wells fargo",
    "geico",
    "progressive",
    "state farm",
    "allstate",
    "mcdonalds",
    "burger king",
    "taco bell",
    "subway",
    "coca cola",
    "pepsi",
    "dr pepper",
    "mountain dew",
  ];

  // Check for financial service indicators
  const financialIndicators = [
    "apr",
    "interest rate",
    "credit score",
    "loan",
    "mortgage",
    "refinance",
    "debt consolidation",
    "personal loan",
    "auto loan",
    "member fdic",
    "credit approval",
    "terms and conditions apply",
  ];

  for (const indicator of commercialIndicators) {
    if (fullText.includes(indicator)) {
      return {
        isAd: true,
        reason: `Commercial indicator found: ${indicator}`,
      };
    }
  }

  for (const brand of brandIndicators) {
    if (fullText.includes(brand)) {
      return {
        isAd: true,
        reason: `Brand detected: ${brand}`,
      };
    }
  }

  for (const financial of financialIndicators) {
    if (fullText.includes(financial)) {
      return {
        isAd: true,
        reason: `Financial service indicator: ${financial}`,
      };
    }
  }

  // Check for common commercial patterns
  if (title.includes("call") && title.includes("now")) {
    return { isAd: true, reason: "Call-to-action detected in title" };
  }

  if (
    artist.includes("corp") ||
    artist.includes("inc") ||
    artist.includes("llc")
  ) {
    return { isAd: true, reason: "Corporate entity detected as artist" };
  }

  // Check for ad-like timing patterns (ads often have specific durations)
  if (title.includes("30") || title.includes("60") || title.includes("15")) {
    if (fullText.includes("second") || fullText.includes("sec")) {
      return { isAd: true, reason: "Ad duration pattern detected" };
    }
  }

  return { isAd: false };
}
