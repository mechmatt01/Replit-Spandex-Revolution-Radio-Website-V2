// Enhanced Ad detection system using Gemini AI for intelligent content analysis
// Blocks political content and detects commercials with AI-powered analysis
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || 'AIzaSyCH8m8CBVBbiyS_Cu4kjlIpg3vzTRMspbQ');

// Known commercial keywords and brand mappings
const COMMERCIAL_BRANDS = {
    'gain': { name: 'Gain', logo: 'https://logos-world.net/wp-content/uploads/2022/01/Gain-Logo.png' },
    'mcdonalds': { name: 'McDonald\'s', logo: 'https://logos-world.net/wp-content/uploads/2020/04/McDonalds-Logo.png' },
    'nike': { name: 'Nike', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png' },
    'coca cola': { name: 'Coca-Cola', logo: 'https://logos-world.net/wp-content/uploads/2020/05/Coca-Cola-Logo.png' },
    'pepsi': { name: 'Pepsi', logo: 'https://logos-world.net/wp-content/uploads/2020/05/Pepsi-Logo.png' },
    'walmart': { name: 'Walmart', logo: 'https://logos-world.net/wp-content/uploads/2020/05/Walmart-Logo.png' },
    'amazon': { name: 'Amazon', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Amazon-Logo.png' },
    'apple': { name: 'Apple', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png' },
    'google': { name: 'Google', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Google-Logo.png' },
    'spotify': { name: 'Spotify', logo: 'https://logos-world.net/wp-content/uploads/2020/06/Spotify-Logo.png' },
    'ford': { name: 'Ford', logo: 'https://logos-world.net/wp-content/uploads/2020/08/Ford-Logo.png' },
    'chevrolet': { name: 'Chevrolet', logo: 'https://logos-world.net/wp-content/uploads/2020/08/Chevrolet-Logo.png' },
    'toyota': { name: 'Toyota', logo: 'https://logos-world.net/wp-content/uploads/2020/08/Toyota-Logo.png' },
    'verizon': { name: 'Verizon', logo: 'https://logos-world.net/wp-content/uploads/2020/09/Verizon-Logo.png' },
    'att': { name: 'AT&T', logo: 'https://logos-world.net/wp-content/uploads/2020/09/ATT-Logo.png' },
    't-mobile': { name: 'T-Mobile', logo: 'https://logos-world.net/wp-content/uploads/2020/09/T-Mobile-Logo.png' }
};

// Blocked content that should be filtered out
const BLOCKED_CONTENT = [
    'trump 2024',
    'maga',
    'make america great again',
    'political advertisement',
    'campaign ad'
];

// Commercial indicators
const COMMERCIAL_KEYWORDS = [
    'commercial',
    'advertisement',
    'ad break',
    'sponsored by',
    'brought to you by',
    'in a commercial',
    'promo',
    'promotion'
];

// AI-powered ad detection using Gemini
async function detectAdvertisementWithAI(title, artist, album, additionalContext = '') {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Analyze this radio content and determine if it's an advertisement, commercial, or regular music content.

Content to analyze:
- Title: "${title}"
- Artist: "${artist}"
- Album: "${album}"
- Additional Context: "${additionalContext}"

Please analyze this content and respond with a JSON object in this exact format:
{
    "isAd": true/false,
    "confidence": 0.0-1.0,
    "adType": "commercial" | "promotion" | "sponsorship" | "music" | "radio_host" | "unknown",
    "reason": "Brief explanation of why this is classified as an ad or not",
    "brandName": "Brand name if commercial detected, null otherwise",
    "adCategory": "Category of advertisement if applicable",
    "isBlocked": true/false
}

Consider these factors:
1. Commercial language, promotional phrases, or brand mentions
2. Radio host announcements vs. music content
3. Sponsored content or promotional material
4. Regular song titles and artist names
5. Political or inappropriate content

Respond only with the JSON object, no additional text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const aiAnalysis = JSON.parse(jsonMatch[0]);
            console.log('AI Ad Detection Result:', aiAnalysis);
            return aiAnalysis;
        }
        
        throw new Error('Invalid AI response format');
    } catch (error) {
        console.error('AI ad detection failed:', error);
        // Fallback to rule-based detection
        return null;
    }
}

/**
 * Enhanced advertisement detection combining AI analysis with rule-based detection
 */
export async function detectAdvertisement(title, artist, album = '', additionalContext = '') {
    console.log(`Analyzing content for ads: "${title}" by "${artist}" from "${album}"`);
    
    // First, try AI-powered detection
    try {
        const aiResult = await detectAdvertisementWithAI(title, artist, album, additionalContext);
        if (aiResult && aiResult.confidence > 0.7) {
            console.log(`AI detected ad with ${aiResult.confidence * 100}% confidence:`, aiResult.reason);
            return {
                isAd: aiResult.isAd,
                isBlocked: aiResult.isBlocked || false,
                adType: aiResult.adType || 'unknown',
                brandName: aiResult.brandName || null,
                adCategory: aiResult.adCategory || null,
                confidence: aiResult.confidence,
                reason: aiResult.reason,
                originalTitle: title,
                originalArtist: artist,
                originalAlbum: album
            };
        }
    } catch (error) {
        console.warn('AI detection failed, falling back to rule-based detection:', error);
    }
    
    // Fallback to rule-based detection
    const titleLower = title.toLowerCase();
    const artistLower = artist.toLowerCase();
    const albumLower = album.toLowerCase();
    const combinedContent = `${titleLower} ${artistLower} ${albumLower}`;
    
    // Check for blocked content first
    for (const blocked of BLOCKED_CONTENT) {
        if (combinedContent.includes(blocked.toLowerCase())) {
            console.log(`Blocked content detected: ${title} by ${artist}`);
            return {
                isAd: true,
                isBlocked: true,
                adType: 'blocked',
                confidence: 0.9,
                reason: `Contains blocked content: ${blocked}`,
                originalTitle: title,
                originalArtist: artist,
                originalAlbum: album
            };
        }
    }
    
    // Check for commercial indicators
    const isCommercial = COMMERCIAL_KEYWORDS.some(keyword => combinedContent.includes(keyword.toLowerCase()));
    if (isCommercial) {
        // Try to identify specific brand
        for (const [brandKey, brandInfo] of Object.entries(COMMERCIAL_BRANDS)) {
            if (combinedContent.includes(brandKey.toLowerCase())) {
                console.log(`Brand commercial detected: ${brandInfo.name}`);
                return {
                    isAd: true,
                    isBlocked: false,
                    adType: 'commercial',
                    brandName: brandInfo.name,
                    brandLogo: brandInfo.logo,
                    confidence: 0.85,
                    reason: `Contains commercial keyword and brand: ${brandInfo.name}`,
                    originalTitle: title,
                    originalArtist: artist,
                    originalAlbum: album
                };
            }
        }
        // Generic commercial detected
        console.log(`Generic commercial detected: ${title} by ${artist}`);
        return {
            isAd: true,
            isBlocked: false,
            adType: 'commercial',
            confidence: 0.8,
            reason: 'Contains commercial keywords',
            originalTitle: title,
            originalArtist: artist,
            originalAlbum: album
        };
    }
    
    // Check for radio host patterns
    const radioHostPatterns = [
        'dj', 'disc jockey', 'radio host', 'announcer', 'broadcaster',
        'station break', 'news', 'weather', 'traffic', 'sports'
    ];
    
    const isRadioHost = radioHostPatterns.some(pattern => combinedContent.includes(pattern.toLowerCase()));
    if (isRadioHost) {
        console.log(`Radio host content detected: ${title} by ${artist}`);
        return {
            isAd: false,
            isBlocked: false,
            adType: 'radio_host',
            confidence: 0.75,
            reason: 'Radio host or station content',
            originalTitle: title,
            originalArtist: artist,
            originalAlbum: album
        };
    }
    
    // Regular music content
    console.log(`Regular music content: ${title} by ${artist}`);
    return {
        isAd: false,
        isBlocked: false,
        adType: 'music',
        confidence: 0.9,
        reason: 'Regular music content',
        originalTitle: title,
        originalArtist: artist,
        originalAlbum: album
    };
}
/**
 * Gets appropriate display content based on ad detection
 */
export function getDisplayContent(detection) {
    if (detection.isBlocked) {
        // Return generic music info for blocked content
        return {
            title: 'Live Stream',
            artist: 'On Air',
            album: 'Radio Broadcast',
            artwork: null, // Will use default music icon
            isAd: false // Hide that it was blocked content
        };
    }
    if (detection.isAd && detection.brandName && detection.brandLogo) {
        // Show brand commercial
        return {
            title: `${detection.brandName} Commercial`,
            artist: 'Advertisement',
            album: 'Commercial Break',
            artwork: detection.brandLogo,
            isAd: true
        };
    }
    if (detection.isAd) {
        // Generic commercial
        return {
            title: 'Commercial Break',
            artist: 'Advertisement',
            album: 'Radio Commercial',
            artwork: null, // Will use ad symbol
            isAd: true
        };
    }
    // Regular music - return original content
    return {
        title: detection.originalTitle,
        artist: detection.originalArtist,
        album: null, // Will be filled by iTunes lookup
        artwork: null, // Will be filled by iTunes lookup
        isAd: false
    };
}
/**
 * Enhanced Clearbit logo lookup for brand detection
 */
export async function getClearbitLogo(brandName) {
    try {
        const domain = getBrandDomain(brandName);
        if (!domain)
            return null;
        const logoUrl = `https://logo.clearbit.com/${domain}`;
        // Test if logo exists with basic fetch
        const response = await fetch(logoUrl, {
            method: 'HEAD'
        });
        if (response.ok) {
            console.log(`Clearbit logo found for ${brandName}: ${logoUrl}`);
            return logoUrl;
        }
        return null;
    }
    catch (error) {
        console.log(`Clearbit logo lookup failed for ${brandName}:`, error);
        return null;
    }
}
/**
 * Maps brand names to their primary domains for Clearbit lookup
 */
function getBrandDomain(brandName) {
    const domainMap = {
        'gain': 'gain.com',
        'mcdonalds': 'mcdonalds.com',
        'nike': 'nike.com',
        'coca-cola': 'coca-cola.com',
        'pepsi': 'pepsi.com',
        'walmart': 'walmart.com',
        'amazon': 'amazon.com',
        'apple': 'apple.com',
        'google': 'google.com',
        'spotify': 'spotify.com',
        'ford': 'ford.com',
        'chevrolet': 'chevrolet.com',
        'toyota': 'toyota.com',
        'verizon': 'verizon.com',
        'att': 'att.com',
        't-mobile': 't-mobile.com'
    };
    return domainMap[brandName.toLowerCase()] || null;
}
export default {
    detectAdvertisement,
    getDisplayContent,
    getClearbitLogo
};
