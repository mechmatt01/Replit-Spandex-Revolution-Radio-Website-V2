import React, { useMemo, useCallback } from "react";
import { useScrollVelocity } from "../hooks/use-scroll-velocity";
import { useIntersectionObserver } from "../hooks/use-intersection-observer";
import { useTheme } from "../contexts/ThemeContext";

export default function About() {
  const { velocity } = useScrollVelocity();
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const { currentTheme, isDarkMode, colors } = useTheme();

  // Memoize expensive calculations
  const scrollIntensity = useMemo(() => {
    return Math.min(Math.abs(velocity) / 1000, 1);
  }, [velocity]);

  const parallaxOffset = useMemo(() => {
    return scrollIntensity * 20;
  }, [scrollIntensity]);

  // Memoize theme-based styles
  const themeStyles = useMemo(() => {
    const baseStyles = {
      background: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      color: isDarkMode ? '#ffffff' : '#000000',
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
    };

    return {
      ...baseStyles,
      accentColor: colors.accent
    };
  }, [isDarkMode, colors.accent]);

  // Memoize content sections to prevent unnecessary re-renders
  const contentSections = useMemo(() => [
    {
      title: "About Spandex Salvation Radio",
      content: "Your ultimate destination for the heaviest metal, hardest rock, and most intense music from around the world. We're not just a radio station - we're a movement, a community, and a way of life for metalheads everywhere."
    },
    {
      title: "What We Do",
      content: "We broadcast 24/7, bringing you the best in metal, rock, punk, and alternative music. From classic heavy metal to modern deathcore, from underground black metal to mainstream rock anthems - we've got it all."
    },
    {
      title: "Our Mission",
      content: "To unite metalheads worldwide through the power of music, to discover and promote emerging artists, and to keep the spirit of metal alive and thriving for generations to come."
    }
  ], []);

  // Memoize the render function for content sections
  const renderContentSection = useCallback((section: typeof contentSections[0], index: number) => (
    <div
      key={section.title}
      className="mb-8 p-6 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:scale-105"
      style={{
        background: themeStyles.background,
        color: themeStyles.color,
        borderColor: themeStyles.borderColor,
        transform: `translateY(${parallaxOffset * (index + 1)}px)`
      }}
    >
      <h3 
        className="text-2xl font-bold mb-4"
        style={{ color: themeStyles.accentColor }}
      >
        {section.title}
      </h3>
      <p className="text-lg leading-relaxed">
        {section.content}
      </p>
    </div>
  ), [themeStyles, parallaxOffset]);

  return (
    <section
      ref={ref}
      className="py-16 px-4 min-h-screen flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${themeStyles.background}, ${themeStyles.background}dd)`,
        transform: `translateY(${parallaxOffset}px)`
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 
          className="font-orbitron font-black text-4xl md:text-5xl mb-8"
          style={{ 
            color: currentTheme === 'light-mode' ? '#000000' : colors.text 
          }}
        >
          About Us
        </h2>
        
        <div className="space-y-6">
          {contentSections.map((section, index) => 
            renderContentSection(section, index)
          )}
        </div>

        <div className="mt-12 p-8 rounded-xl border backdrop-blur-md transition-all duration-500 hover:scale-105"
             style={{
               background: themeStyles.background,
               borderColor: themeStyles.borderColor,
               transform: `translateY(${parallaxOffset * 2}px)`
             }}>
          <p className="text-xl font-semibold mb-4" style={{ color: themeStyles.accentColor }}>
            Join the Metal Revolution
          </p>
          <p className="text-lg">
            Whether you're a lifelong metalhead or just discovering the genre, 
            Spandex Salvation Radio is your gateway to the most intense, 
            powerful, and authentic metal music experience.
          </p>
        </div>
      </div>
    </section>
  );
}
