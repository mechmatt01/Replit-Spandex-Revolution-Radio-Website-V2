import { useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function DynamicMetaTags() {
  const { currentTheme, getColors } = useTheme();
  const colors = getColors();
  const isLightMode = currentTheme === "light-mode";
  
  // Derive background and text colors from theme
  const bgColor = isLightMode ? "#ffffff" : "#000000";
  const textColor = isLightMode ? "#000000" : "#ffffff";

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

    // Use static MusicLogoIcon.png for favicon
    const baseUrl = window.location.origin;
    const faviconUrl = `${baseUrl}/MusicLogoIcon.png`;

    // Update all favicon links to use the static logo
    const faviconLinks = document.querySelectorAll('link[rel*="icon"]');
    faviconLinks.forEach((link) => {
      (link as HTMLLinkElement).href = faviconUrl;
      (link as HTMLLinkElement).type = "image/png";
    });

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

    // Update Open Graph image URL to use static MusicLogoIcon.png
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    const baseUrl = window.location.origin;
    const ogImageUrl = `${baseUrl}/MusicLogoIcon.png`;

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

    // Update Open Graph URL to current page URL
    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    const currentUrl = window.location.href.split("?")[0];
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
    // Set default background and text colors for preview generation
    document.documentElement.style.setProperty("--preview-background", bgColor);
    document.documentElement.style.setProperty("--preview-text", textColor);
  }, [currentTheme, colors, isLightMode, bgColor, textColor]);

  return null;
}
