// Radio.co API configuration for live metadata
export const RADIO_CO_STATION_ID = "s4d4c2d4-1234-5678-9abc-def012345678"; // Replace with actual station ID

// If you have a real Radio.co station, replace the station ID above
// The API endpoint will be: https://public.radio.co/stations/{STATION_ID}/now

export async function fetchRadioCoMetadata() {
  try {
    const response = await fetch(`https://public.radio.co/stations/${RADIO_CO_STATION_ID}/now`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Hot97RadioApp/1.0'
      },
      signal: AbortSignal.timeout(3000)
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Radio.co API not available, using fallback');
  }
  
  return null;
}

// Commercial detection function
export function isCommercial(metadata: any): boolean {
  const title = metadata.title?.toLowerCase() || '';
  const artist = metadata.artist?.toLowerCase() || '';
  
  return (
    title.includes("advertisement") ||
    artist.includes("advertisement") ||
    title.includes("sponsor") ||
    artist.includes("sponsor") ||
    title.includes("commercial") ||
    artist.includes("commercial") ||
    title.startsWith("[ad]") ||
    artist.startsWith("[ad]") ||
    title.includes("brought to you by") ||
    artist.includes("brought to you by")
  );
}

// Get company logo from Clearbit
export function getClearbitLogo(companyName: string): string {
  const domain = companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/(advertisement|commercial|sponsor|ad)/g, '') + '.com';
  
  if (domain.length > 4) {
    return `https://logo.clearbit.com/${domain}`;
  }
  
  return '';
}