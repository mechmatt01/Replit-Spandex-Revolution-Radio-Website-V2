import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function DynamicMetaTags() {
  const { currentTheme, getColors } = useTheme();
  const colors = getColors();
  const isLightMode = currentTheme === 'light-mode';

  useEffect(() => {
    // Update theme-color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', colors.primary);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = colors.primary;
      document.head.appendChild(meta);
    }

    // Generate dynamic favicon based on current theme
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    const faviconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary}" />
            <stop offset="100%" style="stop-color:${colors.secondary}" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" fill="${isLightMode ? '#ffffff' : '#000000'}" rx="4"/>
        <rect x="2" y="2" width="28" height="28" fill="url(#grad)" rx="3"/>
        <path d="M8 12h16v2H8zm0 4h12v2H8zm0 4h16v2H8z" fill="${isLightMode ? '#000000' : '#ffffff'}" opacity="0.8"/>
        <circle cx="22" cy="8" r="3" fill="#ff0000">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
    
    const faviconBlob = new Blob([faviconSvg], { type: 'image/svg+xml' });
    const faviconUrl = URL.createObjectURL(faviconBlob);
    
    if (favicon) {
      favicon.href = faviconUrl;
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = faviconUrl;
      document.head.appendChild(link);
    }

    // Update color scheme meta tag
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
      colorSchemeMeta.setAttribute('content', isLightMode ? 'light' : 'dark');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'color-scheme';
      meta.content = isLightMode ? 'light' : 'dark';
      document.head.appendChild(meta);
    }

    // Update Open Graph image URL with theme parameters
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    const textColor = isLightMode ? '#000000' : '#ffffff';
    const bgColor = isLightMode ? '#ffffff' : '#000000';
    const baseUrl = window.location.origin;
    
    // Include theme name in URL for better cache control
    const themeName = currentTheme.replace('-mode', '').replace('-', '_');
    const ogImageUrl = `${baseUrl}/api/og-image?theme=${themeName}&primary=${encodeURIComponent(colors.primary)}&secondary=${encodeURIComponent(colors.secondary)}&background=${encodeURIComponent(bgColor)}&text=${encodeURIComponent(textColor)}&v=${Date.now()}`;
    
    if (ogImageMeta) {
      ogImageMeta.setAttribute('content', ogImageUrl);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      meta.content = ogImageUrl;
      document.head.appendChild(meta);
    }

    // Update Twitter card image
    const twitterImageMeta = document.querySelector('meta[name="twitter:image"]');
    if (twitterImageMeta) {
      twitterImageMeta.setAttribute('content', ogImageUrl);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'twitter:image';
      meta.content = ogImageUrl;
      document.head.appendChild(meta);
    }

    // Force refresh of social media previews by updating URL
    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    const currentUrl = window.location.href.split('?')[0] + `?theme=${themeName}&v=${Date.now()}`;
    if (ogUrlMeta) {
      ogUrlMeta.setAttribute('content', currentUrl);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:url');
      meta.content = currentUrl;
      document.head.appendChild(meta);
    }

    // Update CSS custom properties for preview generation
    document.documentElement.style.setProperty('--preview-primary', colors.primary);
    document.documentElement.style.setProperty('--preview-secondary', colors.secondary);
    document.documentElement.style.setProperty('--preview-background', bgColor);
    document.documentElement.style.setProperty('--preview-text', textColor);

  }, [currentTheme, colors, isLightMode]);

  return null;
}