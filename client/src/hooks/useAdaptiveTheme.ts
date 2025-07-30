import { useState, useEffect, useCallback } from 'react';

interface AdaptiveTheme {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  overlayColor: string;
  isLight: boolean;
  contrastRatio: number;
}

interface ColorAnalysis {
  dominant: string;
  vibrant: string;
  muted: string;
  lightness: number;
  saturation: number;
  isWarm: boolean;
}

export function useAdaptiveTheme(artworkUrl?: string) {
  const [adaptiveTheme, setAdaptiveTheme] = useState<AdaptiveTheme>({
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    textColor: '#ffffff',
    accentColor: '#f97316',
    overlayColor: 'rgba(0, 0, 0, 0.08)',
    isLight: false,
    contrastRatio: 21
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  // Calculate relative luminance for WCAG contrast
  const getRelativeLuminance = (r: number, g: number, b: number): number => {
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  };

  // Calculate contrast ratio between two colors
  const getContrastRatio = (color1: [number, number, number], color2: [number, number, number]): number => {
    const l1 = getRelativeLuminance(color1[0], color1[1], color1[2]);
    const l2 = getRelativeLuminance(color2[0], color2[1], color2[2]);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  };

  // Get optimal text color for accessibility
  const getOptimalTextColor = (backgroundColor: [number, number, number]): string => {
    const whiteContrast = getContrastRatio(backgroundColor, [255, 255, 255]);
    const blackContrast = getContrastRatio(backgroundColor, [0, 0, 0]);
    
    // WCAG AAA requires 7:1 for normal text, AA requires 4.5:1
    if (whiteContrast >= 7) return '#ffffff';
    if (blackContrast >= 7) return '#000000';
    if (whiteContrast >= 4.5) return '#ffffff';
    if (blackContrast >= 4.5) return '#000000';
    
    // Fallback to highest contrast
    return whiteContrast > blackContrast ? '#ffffff' : '#000000';
  };

  // Analyze color properties
  const analyzeColor = (r: number, g: number, b: number): ColorAnalysis => {
    // Convert to HSL
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const diff = max - min;
    
    const lightness = (max + min) / 2;
    const saturation = diff === 0 ? 0 : diff / (1 - Math.abs(2 * lightness - 1));
    
    // Determine if color is warm (red/orange/yellow dominant)
    const isWarm = r > b && (r > g || Math.abs(r - g) < 30);
    
    return {
      dominant: `rgb(${r}, ${g}, ${b})`,
      vibrant: `rgb(${Math.min(255, r * 1.2)}, ${Math.min(255, g * 1.1)}, ${Math.min(255, b * 1.1)})`,
      muted: `rgb(${Math.max(0, r * 0.7)}, ${Math.max(0, g * 0.7)}, ${Math.max(0, b * 0.7)})`,
      lightness,
      saturation,
      isWarm
    };
  };

  // Extract colors from image
  const extractColorsFromImage = useCallback(async (imageUrl: string): Promise<ColorAnalysis | null> => {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              resolve(null);
              return;
            }

            // Resize for performance
            const size = 50;
            canvas.width = size;
            canvas.height = size;
            
            ctx.drawImage(img, 0, 0, size, size);
            
            const imageData = ctx.getImageData(0, 0, size, size);
            const data = imageData.data;
            
            // Sample colors and find dominant
            const colorCounts: { [key: string]: number } = {};
            let totalR = 0, totalG = 0, totalB = 0;
            let pixelCount = 0;
            
            for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];
              
              if (a > 128) { // Skip transparent pixels
                totalR += r;
                totalG += g;
                totalB += b;
                pixelCount++;
                
                // Group similar colors
                const colorKey = `${Math.floor(r / 32)}-${Math.floor(g / 32)}-${Math.floor(b / 32)}`;
                colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
              }
            }
            
            if (pixelCount === 0) {
              resolve(null);
              return;
            }
            
            // Calculate average color
            const avgR = Math.round(totalR / pixelCount);
            const avgG = Math.round(totalG / pixelCount);
            const avgB = Math.round(totalB / pixelCount);
            
            resolve(analyzeColor(avgR, avgG, avgB));
            
          } catch (error) {
            console.warn('Error analyzing image colors:', error);
            resolve(null);
          }
        };
        
        img.onerror = () => resolve(null);
        img.src = imageUrl;
        
      } catch (error) {
        console.warn('Error loading image for color analysis:', error);
        resolve(null);
      }
    });
  }, []);

  // Generate adaptive theme from color analysis
  const generateAdaptiveTheme = useCallback((colorAnalysis: ColorAnalysis): AdaptiveTheme => {
    const [r, g, b] = hexToRgb(colorAnalysis.dominant.replace('rgb(', '').replace(')', '').split(',').map(n => parseInt(n.trim())).map(n => n.toString(16).padStart(2, '0')).join(''));
    
    // Very low opacity for glass-like effect
    const backgroundOpacity = colorAnalysis.lightness > 0.6 ? 0.12 : 0.08;
    const backgroundColor = `rgba(${r}, ${g}, ${b}, ${backgroundOpacity})`;
    
    // Get optimal text color
    const textColor = getOptimalTextColor([r, g, b]);
    
    // Create accent color - more vibrant version
    const accentR = Math.min(255, Math.max(0, colorAnalysis.isWarm ? r * 1.2 : r * 1.1));
    const accentG = Math.min(255, Math.max(0, g * 1.1));
    const accentB = Math.min(255, Math.max(0, colorAnalysis.isWarm ? b * 0.8 : b * 1.2));
    const accentColor = `rgb(${Math.round(accentR)}, ${Math.round(accentG)}, ${Math.round(accentB)})`;
    
    // Create very subtle overlay for glass effect
    const overlayOpacity = colorAnalysis.lightness > 0.5 ? 0.08 : 0.05;
    const overlayColor = textColor === '#ffffff' 
      ? `rgba(0, 0, 0, ${overlayOpacity})`
      : `rgba(255, 255, 255, ${overlayOpacity})`;
    
    const contrastRatio = getContrastRatio([r, g, b], textColor === '#ffffff' ? [255, 255, 255] : [0, 0, 0]);
    
    return {
      backgroundColor,
      textColor,
      accentColor,
      overlayColor,
      isLight: colorAnalysis.lightness > 0.5,
      contrastRatio
    };
  }, []);

  // Main function to analyze artwork and set theme
  const analyzeArtwork = useCallback(async (artworkUrl: string) => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      const colorAnalysis = await extractColorsFromImage(artworkUrl);
      
      if (colorAnalysis) {
        const newTheme = generateAdaptiveTheme(colorAnalysis);
        
        // Ensure minimum contrast ratio for accessibility
        if (newTheme.contrastRatio >= 4.5) {
          setAdaptiveTheme(newTheme);
        } else {
          // Fallback to high contrast glass theme
          setAdaptiveTheme({
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            textColor: '#ffffff',
            accentColor: colorAnalysis.isWarm ? '#f97316' : '#3b82f6',
            overlayColor: 'rgba(0, 0, 0, 0.08)',
            isLight: false,
            contrastRatio: 21
          });
        }
      }
    } catch (error) {
      console.warn('Error in adaptive theme analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, generateAdaptiveTheme, extractColorsFromImage]);

  // Effect to analyze artwork when URL changes
  useEffect(() => {
    if (artworkUrl && artworkUrl !== '' && artworkUrl !== 'advertisement') {
      // Add small delay to avoid too frequent updates
      const timeoutId = setTimeout(() => {
        analyzeArtwork(artworkUrl);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Reset to default glass theme
      setAdaptiveTheme({
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        textColor: '#ffffff',
        accentColor: '#f97316',
        overlayColor: 'rgba(0, 0, 0, 0.05)',
        isLight: false,
        contrastRatio: 21
      });
    }
  }, [artworkUrl, analyzeArtwork]);

  return {
    adaptiveTheme,
    isAnalyzing,
    analyzeArtwork
  };
}