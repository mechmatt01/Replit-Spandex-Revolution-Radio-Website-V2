// Secure storage utility for API keys and sensitive data
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

export class SecureStorage {
  private static encryptData(text: string): string {
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      // Return original text if encryption fails
      return text;
    }
  }

  private static decryptData(text: string): string {
    try {
      const textParts = text.split(':');
      if (textParts.length < 2) {
        return text; // Not encrypted
      }
      const iv = Buffer.from(textParts.shift()!, 'hex');
      const encryptedText = textParts.join(':');
      const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      // Return original text if decryption fails
      return text;
    }
  }

  public static getApiKey(keyName: string): string {
    const key = process.env[keyName];
    if (!key) {
      console.warn(`API key ${keyName} not found in environment`);
      return '';
    }

    try {
      return this.decryptData(key);
    } catch (error) {
      // If decryption fails, assume it's already plain text (for development)
      return key;
    }
  }

  public static setApiKey(keyName: string, value: string): string {
    return this.encryptData(value);
  }
}