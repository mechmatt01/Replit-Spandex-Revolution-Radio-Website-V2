// Ad detection system for filtering content and displaying appropriate logos
// Blocks political content and detects commercials
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
/**
 * Detects if content is an advertisement and determines appropriate display
 */
export function detectAdvertisement(title, artist) {
    const titleLower = title.toLowerCase();
    const artistLower = artist.toLowerCase();
    const combinedContent = `${titleLower} ${artistLower}`;
    // Check for blocked content first
    for (const blocked of BLOCKED_CONTENT) {
        if (combinedContent.includes(blocked.toLowerCase())) {
            console.log(`Blocked content detected: ${title} by ${artist}`);
            return {
                isAd: true,
                isBlocked: true,
                adType: 'blocked',
                originalTitle: title,
                originalArtist: artist
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
                    brandName: brandInfo.name,
                    brandLogo: brandInfo.logo,
                    adType: 'commercial',
                    originalTitle: title,
                    originalArtist: artist
                };
            }
        }
        // Generic commercial detected
        console.log(`Generic commercial detected: ${title} by ${artist}`);
        return {
            isAd: true,
            isBlocked: false,
            adType: 'commercial',
            originalTitle: title,
            originalArtist: artist
        };
    }
    // Regular music content
    return {
        isAd: false,
        isBlocked: false,
        adType: 'music',
        originalTitle: title,
        originalArtist: artist
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
