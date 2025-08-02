import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../lib/queryClient";

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const requestLocation = async () => {
    // Allow location detection even for unauthenticated users
    setLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser");
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout
            maximumAge: 60000, // Reduced cache time for more frequent updates
          });
        },
      );

      const locationData: LocationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      // Try to get address from coordinates (optional)
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${locationData.lat}&longitude=${locationData.lng}&localityLanguage=en`,
        );

        if (response.ok) {
          const addressData = await response.json();
          locationData.address =
            `${addressData.city || addressData.locality || ""}, ${addressData.countryName || ""}`.trim();
        }
      } catch (addressError) {
        console.warn("Could not fetch address:", addressError);
      }

      setLocation(locationData);

      // Update location on server only if authenticated
      if (isAuthenticated) {
        try {
          await apiRequest("POST", "/api/user/location", {
            location: locationData,
          });
        } catch (apiError) {
          console.warn("Could not update location on server:", apiError);
        }
      }

      return locationData;
    } catch (err: any) {
      let errorMessage = "Failed to get location";

      if (err.code === 1) {
        errorMessage =
          "Location access denied. Please enable location services.";
      } else if (err.code === 2) {
        errorMessage = "Location unavailable. Please try again.";
      } else if (err.code === 3) {
        errorMessage = "Location request timed out. Please try again.";
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-request location on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && !location && !loading) {
      requestLocation().catch(console.warn);
    }
  }, [isAuthenticated]);

  return {
    location,
    loading,
    error,
    requestLocation,
  };
}
