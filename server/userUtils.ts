// Utility functions for user management

/**
 * Generates a random 10-character alphanumeric user ID
 */
export function generateUserId(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates username from email or name with fallback
 */
export function generateUsername(
  email?: string,
  firstName?: string,
  googleId?: string,
): string {
  if (email) {
    return email.split("@")[0];
  }
  if (firstName) {
    return firstName.toLowerCase();
  }
  if (googleId) {
    return `user_${googleId}`;
  }
  return `user_${Date.now()}`;
}

/**
 * Formats phone number to international format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Add +1 if it's a 10-digit US number
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // Add + if missing for international numbers
  if (cleaned.length > 10 && !phone.startsWith("+")) {
    return `+${cleaned}`;
  }

  return cleaned;
}

/**
 * Validates location coordinates
 */
export function validateLocation(location: any): boolean {
  if (!location || typeof location !== "object") {
    return false;
  }

  const { lat, lng } = location;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return false;
  }

  // Check if coordinates are within valid ranges
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return false;
  }

  return true;
}
