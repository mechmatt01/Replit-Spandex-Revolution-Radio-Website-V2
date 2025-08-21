import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import FullWidthGlobeMap from "../components/FullWidthGlobeMap";
import FadeInView from "../components/FadeInView";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { useRadio } from "../contexts/RadioContext";
import Navigation from "../components/Navigation";

export default function MapPage() {
  const { currentTheme, colors } = useTheme();
  const { isAuthenticated, user } = useFirebaseAuth();
  const radioContext = useRadio();

  return (
    <div 
      className="min-h-screen transition-colors duration-300" 
      style={{ 
        backgroundColor: colors.background,
        color: colors.text 
      }}
    >
      <div id="main-navigation">
        <Navigation />
      </div>
      
      <main id="main-content" className="pt-16">
        <section className="py-20 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 
                className="font-orbitron font-black text-3xl md:text-4xl mb-4"
                style={{ 
                  color: colors.text
                }}
              >
                LIVE INTERACTIVE MAP
              </h1>
              <p 
                className="text-lg"
                style={{ color: colors.textMuted }}
              >
                Explore our global community of metalheads and see where the music is playing live.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8">
          <FullWidthGlobeMap />
        </section>
      </main>
    </div>
  );
}
