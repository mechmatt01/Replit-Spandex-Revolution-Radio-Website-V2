// Temporary manual ad detection override for Capital One
export function forceDetectCapitalOneAd(): boolean {
  // This function can be used to manually override ad detection
  // when we know an ad is playing but metadata doesn't reflect it
  const currentTime = new Date();
  
  // You can manually trigger this by calling the /api/force-ad-detection endpoint
  return false; // Default to false unless manually triggered
}

export function createAdTrackInfo(brand: string = "Capital One"): any {
  return {
    id: 1,
    title: `${brand} Commercial`,
    artist: "Advertisement",
    album: "Commercial Break",
    duration: 30,
    artwork: null,
    isAd: true,
    adConfidence: 1.0,
    adReason: `Manually detected ${brand} advertisement`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}