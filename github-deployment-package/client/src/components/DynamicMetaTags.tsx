import { useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function DynamicMetaTags() {
  const { currentTheme, getColors } = useTheme();
  const colors = getColors();
  const isLightMode = currentTheme === "light-mode";

  useEffect(() => {
    // Update theme-color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", colors.primary);
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = colors.primary;
      document.head.appendChild(meta);
    }

    // Generate dynamic favicon based on current theme - disc logo design
    const favicon = document.querySelector(
      'link[rel="icon"]',
    ) as HTMLLinkElement;
    const faviconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary}" />
            <stop offset="100%" style="stop-color:${colors.secondary}" />
          </linearGradient>
          <linearGradient id="discGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.95" />
            <stop offset="50%" style="stop-color:#e8e8e8;stop-opacity:0.85" />
            <stop offset="100%" style="stop-color:#d0d0d0;stop-opacity:0.75" />
          </linearGradient>
        </defs>
        
        <!-- Background circle with theme gradient -->
        <circle cx="16" cy="16" r="16" fill="url(#bgGrad)"/>
        
        <!-- Music disc -->
        <circle cx="16" cy="16" r="11" fill="url(#discGrad)"/>
        
        <!-- Center hole -->
        <circle cx="16" cy="16" r="4" fill="${isLightMode ? "#1a1a1a" : "#0a0a0a"}"/>
        
        <!-- Inner ring details -->
        <circle cx="16" cy="16" r="8" stroke="${isLightMode ? "#666666" : "#999999"}" stroke-width="0.5" fill="none" opacity="0.6"/>
        <circle cx="16" cy="16" r="6" stroke="${isLightMode ? "#888888" : "#bbbbbb"}" stroke-width="0.3" fill="none" opacity="0.4"/>
        
        <!-- Shine effect -->
        <path d="M 9 9 A 9 9 0 0 1 23 9" stroke="white" stroke-width="1.2" fill="none" opacity="0.5"/>
        <path d="M 11 11 A 7 7 0 0 1 21 11" stroke="white" stroke-width="0.8" fill="none" opacity="0.3"/>
      </svg>
    `;

    // Create URL-encoded SVG for favicon
    const encodedFaviconSvg = encodeURIComponent(faviconSvg);
    const faviconDataUrl = `data:image/svg+xml,${encodedFaviconSvg}`;

    // Update all favicon links
    const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
    faviconLinks.forEach((link) => {
      (link as HTMLLinkElement).href = faviconDataUrl;
    });

    // Ensure we have a main favicon link
    if (!document.querySelector('link[rel="icon"]')) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      link.href = faviconDataUrl;
      document.head.appendChild(link);
    }

    // Update color scheme meta tag
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
      colorSchemeMeta.setAttribute("content", isLightMode ? "light" : "dark");
    } else {
      const meta = document.createElement("meta");
      meta.name = "color-scheme";
      meta.content = isLightMode ? "light" : "dark";
      document.head.appendChild(meta);
    }

    // Update Open Graph image URL with theme parameters
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    const textColor = isLightMode ? "#000000" : "#ffffff";
    const bgColor = isLightMode ? "#ffffff" : "#000000";
    const baseUrl = window.location.origin;

    // Include theme name in URL for better cache control
    const themeName = currentTheme.replace("-mode", "").replace("-", "_");
    const ogImageUrl = `${baseUrl}/api/og-image?theme=${themeName}&primary=${encodeURIComponent(colors.primary)}&secondary=${encodeURIComponent(colors.secondary)}&background=${encodeURIComponent(bgColor)}&text=${encodeURIComponent(textColor)}&v=${Date.now()}`;

    if (ogImageMeta) {
      ogImageMeta.setAttribute("content", ogImageUrl);
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:image");
      meta.content = ogImageUrl;
      document.head.appendChild(meta);
    }

    // Update Twitter card image
    const twitterImageMeta = document.querySelector(
      'meta[name="twitter:image"]',
    );
    if (twitterImageMeta) {
      twitterImageMeta.setAttribute("content", ogImageUrl);
    } else {
      const meta = document.createElement("meta");
      meta.name = "twitter:image";
      meta.content = ogImageUrl;
      document.head.appendChild(meta);
    }

    // Force refresh of social media previews by updating URL
    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    const currentUrl =
      window.location.href.split("?")[0] +
      `?theme=${themeName}&v=${Date.now()}`;
    if (ogUrlMeta) {
      ogUrlMeta.setAttribute("content", currentUrl);
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:url");
      meta.content = currentUrl;
      document.head.appendChild(meta);
    }

    // Update CSS custom properties for preview generation
    document.documentElement.style.setProperty(
      "--preview-primary",
      colors.primary,
    );
    document.documentElement.style.setProperty(
      "--preview-secondary",
      colors.secondary,
    );
    document.documentElement.style.setProperty("--preview-background", bgColor);
    document.documentElement.style.setProperty("--preview-text", textColor);
  }, [currentTheme, colors, isLightMode]);

  return null;
}
