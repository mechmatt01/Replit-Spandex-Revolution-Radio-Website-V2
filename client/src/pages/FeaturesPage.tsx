import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import FadeInView from "../components/FadeInView";

export default function FeaturesPage() {
  const { getColors, currentTheme } = useTheme();
  const colors = getColors();

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: colors.background,
        color: colors.text
      }}
    >
      <main id="main-content">
        <FadeInView direction="up" delay={0}>
          <section
            id="features"
            className="py-20 transition-colors duration-300"
            style={{ backgroundColor: colors.background }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h1
                  className="font-orbitron font-black text-4xl md:text-5xl mb-4"
                  style={{
                    color: currentTheme === 'light-mode' ? '#000000' : colors.text
                  }}
                >
                  Features
                </h1>
                <p
                  className="text-lg font-semibold"
                  style={{
                    color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted
                  }}
                >
                  Explore our premium features and subscription tiers.
                </p>
              </div>
              {/* Features content will be imported from the main Features component */}
              <div className="text-center">
                <p className="text-lg" style={{ color: colors.textMuted }}>
                  Features content will be displayed here.
                </p>
              </div>
            </div>
          </section>
        </FadeInView>
      </main>
    </div>
  );
}
