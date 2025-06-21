import OpenAI from "openai";
import fetch from "node-fetch";
import { Readable } from "stream";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AdDetectionResult {
  isAd: boolean;
  confidence: number;
  transcription: string;
  category?: string;
  brand?: string;
}

// Sample the radio stream and analyze for ad content
export async function detectAdContent(streamUrl: string): Promise<AdDetectionResult> {
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
      brand: adAnalysis.brand
    };
  } catch (error) {
    console.error('Error in ad detection:', error);
    return {
      isAd: false,
      confidence: 0,
      transcription: '',
      category: undefined,
      brand: undefined
    };
  }
}

// Capture a sample of audio from the radio stream
async function captureAudioSample(streamUrl: string, durationMs: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const timeout = setTimeout(() => {
      resolve(Buffer.concat(chunks));
    }, durationMs);

    fetch(streamUrl)
      .then(response => {
        if (!response.body) {
          throw new Error('No response body');
        }
        
        response.body.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        
        response.body.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      })
      .catch(error => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

// Transcribe audio using OpenAI Whisper
async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    // Convert buffer to a readable stream for OpenAI API
    const audioStream = Readable.from(audioBuffer);
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream as any,
      model: "whisper-1",
      response_format: "text",
      language: "en"
    });
    
    return transcription || '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return '';
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
}`
        },
        {
          role: "user",
          content: transcription
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      isAd: result.isAd || false,
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      category: result.category,
      brand: result.brand
    };
  } catch (error) {
    console.error('Error analyzing for advertisement:', error);
    return { isAd: false, confidence: 0 };
  }
}

// Common advertisement keywords for quick detection
const adKeywords = [
  'call now', 'limited time', 'special offer', 'visit today', 'don\'t miss',
  'sale', 'discount', 'percent off', 'financing available', 'free delivery',
  'sponsored by', 'brought to you by', 'commercial', 'advertisement',
  'phone number', 'website', 'location', 'store', 'dealership'
];

// Quick keyword-based ad detection (fallback method)
export function quickAdDetection(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  const adKeywordCount = adKeywords.filter(keyword => 
    lowerText.includes(keyword)
  ).length;
  
  // If 2 or more ad keywords are found, likely an advertisement
  return adKeywordCount >= 2;
}

// Enhanced metadata analysis for ad detection
export function analyzeStreamMetadata(metadata: any): { isAd: boolean; reason?: string } {
  if (!metadata) return { isAd: false };
  
  const title = (metadata.title || '').toLowerCase();
  const artist = (metadata.artist || '').toLowerCase();
  const description = (metadata.description || '').toLowerCase();
  
  // Check for commercial indicators in metadata
  const commercialIndicators = [
    'commercial', 'advertisement', 'ad break', 'sponsored',
    'promo', 'jingle', 'spot', 'PSA', 'public service'
  ];
  
  for (const indicator of commercialIndicators) {
    if (title.includes(indicator) || artist.includes(indicator) || description.includes(indicator)) {
      return { 
        isAd: true, 
        reason: `Commercial indicator found: ${indicator}` 
      };
    }
  }
  
  // Check for common commercial patterns
  if (title.includes('call') && title.includes('now')) {
    return { isAd: true, reason: 'Call-to-action detected in title' };
  }
  
  if (artist.includes('corp') || artist.includes('inc') || artist.includes('llc')) {
    return { isAd: true, reason: 'Corporate entity detected as artist' };
  }
  
  return { isAd: false };
}