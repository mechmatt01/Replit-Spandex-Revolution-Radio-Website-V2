
// Secure storage utility for handling sensitive data
export class SecureStorage {
  private static encryptionKey: string | null = null;

  // Initialize encryption key from environment
  private static getEncryptionKey(): string {
    if (!this.encryptionKey) {
      this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-dev-key-change-in-production';
    }
    return this.encryptionKey;
  }

  // Simple XOR encryption for sensitive data
  static encrypt(data: string): string {
    const key = this.getEncryptionKey();
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const dataChar = data.charCodeAt(i);
      encrypted += String.fromCharCode(dataChar ^ keyChar);
    }
    return btoa(encrypted); // Base64 encode
  }

  // Decrypt XOR encrypted data
  static decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      const encrypted = atob(encryptedData); // Base64 decode
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        const keyChar = key.charCodeAt(i % key.length);
        const encryptedChar = encrypted.charCodeAt(i);
        decrypted += String.fromCharCode(encryptedChar ^ keyChar);
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  // Sanitize data for DOM insertion to prevent XSS
  static sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // Safe DOM element creation
  static createElement(tag: string, textContent?: string, attributes?: Record<string, string>): HTMLElement {
    const element = document.createElement(tag);
    
    if (textContent) {
      element.textContent = textContent; // Use textContent instead of innerHTML
    }
    
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, this.sanitizeHTML(value));
      });
    }
    
    return element;
  }
}

// Export utility functions for secure DOM manipulation
export const safeDOMUtils = {
  // Safe innerHTML replacement
  setTextContent: (element: HTMLElement, content: string) => {
    element.textContent = content;
  },
  
  // Safe attribute setting
  setAttribute: (element: HTMLElement, name: string, value: string) => {
    element.setAttribute(name, SecureStorage.sanitizeHTML(value));
  },
  
  // Safe element creation and append
  createAndAppend: (parent: HTMLElement, tag: string, textContent?: string) => {
    const element = SecureStorage.createElement(tag, textContent);
    parent.appendChild(element);
    return element;
  }
};
