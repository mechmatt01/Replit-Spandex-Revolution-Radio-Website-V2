// Radio.co API configuration for live metadata
export const RADIO_CO_STATION_ID = "s4d4c2d4-1234-5678-9abc-def012345678"; // Replace with actual station ID

// If you have a real Radio.co station, replace the station ID above
// The API endpoint will be: https://public.radio.co/stations/{STATION_ID}/now

export async function fetchRadioCoMetadata() {
  try {
    const response = await fetch(
      `https://public.radio.co/stations/${RADIO_CO_STATION_ID}/now`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "Hot97RadioApp/1.0",
        },
        signal: AbortSignal.timeout(3000),
      },
    );

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log("Radio.co API not available, using fallback");
  }

  return null;
}

// Commercial detection function specifically for Hot 97
export function isCommercial(metadata: any): boolean {
  const title = metadata.title?.toLowerCase() || "";
  const artist = metadata.artist?.toLowerCase() || "";

  return (
    title.includes("in a commercial") ||
    artist.includes("in a commercial") ||
    title.includes("in commercial break") ||
    artist.includes("in commercial break") ||
    title.includes("commercial break") ||
    artist.includes("commercial break") ||
    title.includes("advertisement") ||
    artist.includes("advertisement") ||
    title.includes("sponsor") ||
    artist.includes("sponsor") ||
    title.includes("commercial") ||
    artist.includes("commercial") ||
    title.includes("promo") ||
    artist.includes("promo") ||
    title.startsWith("[ad]") ||
    artist.startsWith("[ad]") ||
    title.includes("brought to you by") ||
    artist.includes("brought to you by")
  );
}

// Extract company name from commercial metadata
export function extractCompanyName(metadata: any): string {
  const title = metadata.title || "";
  const artist = metadata.artist || "";

  // Common patterns for company extraction
  const patterns = [
    /brought to you by (.+)/i,
    /sponsored by (.+)/i,
    /(.+) commercial/i,
    /(.+) advertisement/i,
    /(.+) promo/i,
  ];

  const text = `${title} ${artist}`;

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // If no pattern matches, try to extract from the longer text field
  if (
    title.length > artist.length &&
    !title.toLowerCase().includes("in a commercial")
  ) {
    return title;
  } else if (
    artist.length > title.length &&
    !artist.toLowerCase().includes("in a commercial")
  ) {
    return artist;
  }

  return "Advertisement";
}

// Get company logo from Clearbit with enhanced domain mapping
export function getClearbitLogo(companyName: string): string {
  const cleanName = companyName
    .toLowerCase()
    .replace(/(advertisement|commercial|sponsor|ad|promo|in a commercial)/g, "")
    .trim();

  // Common company domain mappings
  const domainMappings: { [key: string]: string } = {
    mcdonalds: "mcdonalds.com",
    "mcdonald's": "mcdonalds.com",
    "coca cola": "coca-cola.com",
    coke: "coca-cola.com",
    pepsi: "pepsi.com",
    nike: "nike.com",
    adidas: "adidas.com",
    apple: "apple.com",
    samsung: "samsung.com",
    verizon: "verizon.com",
    att: "att.com",
    "at&t": "att.com",
    tmobile: "t-mobile.com",
    "t-mobile": "t-mobile.com",
    geico: "geico.com",
    progressive: "progressive.com",
    "state farm": "statefarm.com",
    walmart: "walmart.com",
    target: "target.com",
    amazon: "amazon.com",
    spotify: "spotify.com",
    netflix: "netflix.com",
    uber: "uber.com",
    lyft: "lyft.com",
  };

  // Check for exact matches first
  if (domainMappings[cleanName]) {
    return `https://logo.clearbit.com/${domainMappings[cleanName]}`;
  }

  // Try to construct domain from company name
  const domain =
    cleanName
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "")
      .toLowerCase() + ".com";

  if (domain.length > 4 && cleanName.length > 0) {
    return `https://logo.clearbit.com/${domain}`;
  }

  return "";
}
