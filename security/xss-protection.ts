
// XSS Protection utilities
export class XSSProtection {
  // Sanitize HTML content to prevent XSS attacks
  static sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // Safe innerHTML replacement using textContent
  static setTextContent(element: HTMLElement, content: string): void {
    element.textContent = content;
  }

  // Safe HTML insertion with sanitization
  static setInnerHTML(element: HTMLElement, html: string): void {
    // Create a temporary element to sanitize
    const temp = document.createElement('div');
    temp.textContent = html;
    // Use safe DOM methods instead of innerHTML
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    while (temp.firstChild) {
      element.appendChild(temp.firstChild);
    }
  }

  // Create elements safely
  static createElement(tag: string, textContent?: string, attributes?: Record<string, string>): HTMLElement {
    const element = document.createElement(tag);
    
    if (textContent) {
      element.textContent = textContent;
    }
    
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, this.sanitizeHTML(value));
      });
    }
    
    return element;
  }

  // Validate and sanitize URLs
  static sanitizeURL(url: string): string {
    try {
      const parsedURL = new URL(url);
      // Only allow http, https, and mailto protocols
      if (['http:', 'https:', 'mailto:'].includes(parsedURL.protocol)) {
        return parsedURL.toString();
      }
      return '#';
    } catch {
      return '#';
    }
  }

  // Safe event handler attachment
  static addEventListener(element: HTMLElement, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
  }

  // Replace dangerous innerHTML operations
  static replaceInnerHTML(element: HTMLElement, content: string): void {
    // Clear existing content
    element.textContent = '';
    
    // Parse content safely
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Only append text content, no scripts or dangerous elements
    const textContent = doc.body.textContent || doc.body.innerText || '';
    element.textContent = textContent;
  }
}

// Export global safe DOM utilities
export const safeDOMOps = {
  setText: XSSProtection.setTextContent,
  setHTML: XSSProtection.setInnerHTML,
  createElement: XSSProtection.createElement,
  sanitizeURL: XSSProtection.sanitizeURL,
  addEventListener: XSSProtection.addEventListener,
  replaceHTML: XSSProtection.replaceInnerHTML
};

// Monkey patch common dangerous operations in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  
  if (originalInnerHTML) {
    Object.defineProperty(Element.prototype, 'innerHTML', {
      get: originalInnerHTML.get,
      set: function(value: string) {
        console.warn('⚠️ innerHTML usage detected. Consider using XSSProtection.setTextContent() instead.');
        if (originalInnerHTML.set) {
          originalInnerHTML.set.call(this, value);
        }
      }
    });
  }
}
