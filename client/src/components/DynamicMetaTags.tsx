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

    // Update Open Graph color meta tag (custom)
    const ogColorMeta = document.querySelector('meta[property="og:theme-color"]');
    if (ogColorMeta) {
      ogColorMeta.setAttribute('content', colors.primary);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:theme-color');
      meta.content = colors.primary;
      document.head.appendChild(meta);
    }

    // Update background color based on theme
    const backgroundColor = isLightMode ? '#ffffff' : '#000000';
    const backgroundColorMeta = document.querySelector('meta[name="background-color"]');
    if (backgroundColorMeta) {
      backgroundColorMeta.setAttribute('content', backgroundColor);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'background-color';
      meta.content = backgroundColor;
      document.head.appendChild(meta);
    }

    // Update color scheme
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
    const ogImageUrl = `/api/og-image?theme=${isLightMode ? 'light' : 'dark'}&primary=${encodeURIComponent(colors.primary)}&secondary=${encodeURIComponent(colors.secondary)}&background=${encodeURIComponent(backgroundColor)}&text=${encodeURIComponent(isLightMode ? '#000000' : '#ffffff')}`;
    
    if (ogImageMeta) {
      ogImageMeta.setAttribute('content', ogImageUrl);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      meta.content = ogImageUrl;
      document.head.appendChild(meta);
    }

    // Update CSS custom properties for preview generation
    document.documentElement.style.setProperty('--preview-primary', colors.primary);
    document.documentElement.style.setProperty('--preview-secondary', colors.secondary);
    document.documentElement.style.setProperty('--preview-background', backgroundColor);
    document.documentElement.style.setProperty('--preview-text', isLightMode ? '#000000' : '#ffffff');

  }, [currentTheme, colors, isLightMode]);

  return null;
}