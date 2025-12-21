import { Radio, Globe, Archive, Music, Crown, Shirt } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../contexts/ThemeContext";
import type { StreamStats } from "@shared/schema";
import { Calendar, MapPin, ShoppingBag, Users } from "lucide-react";
import StaggeredAnimation from "./StaggeredAnimation";
import SkeletonLoader from "./SkeletonLoader";
import { useState } from "react";

export default function Features() {
  const { data: stats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
  });
  const { getColors, isDarkMode, currentTheme } = useTheme();
  const colors = getColors();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  // Use primary color for borders to ensure theme consistency
  const borderColor = colors.primary;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to radio player at top of page
  const scrollToRadioPlayer = () => {
    const heroSection = document.getElementById("home");
    if (heroSection) {
      const radioPlayer = heroSection.querySelector(
        '[role="region"][aria-label="Radio player controls"]',
      );
      if (radioPlayer) {
        (radioPlayer as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <section
      id="features"
      className="py-20 transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
      aria-label="Platform features"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Spandex Law heading */}
        <div className="text-center mb-16">
          <h2
            className="font-salt text-4xl md:text-5xl tracking-wide mb-6 uppercase drop-shadow-[0_0_14px_rgba(255,0,0,0.45)]"
            style={{ color: "#ff2a2a" }} // force red
          >
            SPANDEX LAW #213
          </h2>

          <p
            className="font-patrick text-2xl md:text-3xl leading-relaxed max-w-3xl mx-auto text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]"
          >
            Never trust a drummer who shows up early.
          </p>

          <div className="mt-8 w-48 h-[2px] mx-auto bg-gradient-to-r from-transparent via-[#ff2a2a] to-transparent opacity-70" />
        </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: 24/7 Live Streaming */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-2 rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 blur-xl opacity-0 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${
                    colors.secondary || colors.primary
                  })`,
                  opacity: hoveredFeature === "streaming" ? 0.3 : 0,
                }}
              />
            </div>

            <Card
              className="relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8 flex flex-col h-full enhanced-glow feature-container shadow-none"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.primary,
                borderWidth: "2px",
                borderStyle: "solid",
                transform:
                  hoveredFeature === "streaming" ? "scale(1.05)" : "scale(1)",
                boxShadow: "none",
              }}
              onClick={scrollToRadioPlayer}
              onMouseEnter={() => setHoveredFeature("streaming")}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <CardContent className="p-0 flex flex-col h-full">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Radio className="text-white h-8 w-8" />
                </div>
                <h3
                  className="font-black text-2xl mb-4 h-16 flex items-center text-left"
                  style={{ color: colors.text }}
                >
                  24/7 Live Streaming
                </h3>
                <p
                  className="font-semibold text-lg leading-relaxed mb-6 flex-grow text-left"
                  style={{ color: colors.textMuted, minHeight: "4.5rem" }}
                >
                  Non-stop old-school metal streaming with high-quality audio
                  and minimal buffering.
                </p>
                <div
                  className="flex items-center text-sm font-bold mt-auto text-left"
                  style={{ color: colors.primary }}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-3 animate-pulse"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span>Currently Live</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature 2: Show Archives */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-2 rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 blur-xl opacity-0 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${
                    colors.accent || colors.primary
                  })`,
                  opacity: hoveredFeature === "archives" ? 0.3 : 0,
                }}
              />
            </div>

            <Card
              className="relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8 flex flex-col h-full enhanced-glow feature-container shadow-none"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.primary,
                borderWidth: "2px",
                borderStyle: "solid",
                transform:
                  hoveredFeature === "archives" ? "scale(1.05)" : "scale(1)",
                boxShadow: "none",
              }}
              onClick={() => scrollToSection("schedule")}
              onMouseEnter={() => setHoveredFeature("archives")}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <CardContent className="p-0 flex flex-col h-full">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Archive className="text-white h-8 w-8" />
                </div>
                <h3
                  className="font-black text-2xl mb-4 h-16 flex items-center text-left"
                  style={{ color: colors.text }}
                >
                  Show Archives
                </h3>
                <p
                  className="font-semibold text-lg leading-relaxed mb-6 flex-grow text-left"
                  style={{ color: colors.textMuted, minHeight: "4.5rem" }}
                >
                  Access past shows, special episodes, and exclusive metal
                  content on-demand.
                </p>
                <div
                  className="flex items-center text-sm font-bold mt-auto text-left"
                  style={{ color: colors.primary }}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-3 animate-pulse"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span>200+ hours of content</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature 3: Global Listener Map */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-2 rounded-2xl overflow-hidden">
              <div
                className="absolute inset-0 blur-xl opacity-0 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${
                    colors.secondary || colors.primary
                  }, ${colors.primary})`,
                  opacity: hoveredFeature === "map" ? 0.3 : 0,
                }}
              />
            </div>

            <Card
              className="relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8 flex flex-col h-full enhanced-glow feature-container shadow-none"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.primary,
                borderWidth: "2px",
                borderStyle: "solid",
                transform:
                  hoveredFeature === "map" ? "scale(1.05)" : "scale(1)",
                boxShadow: "none",
              }}
              onClick={() => scrollToSection("map")}
              onMouseEnter={() => setHoveredFeature("map")}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <CardContent className="p-0 flex flex-col h-full">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Globe className="text-white h-8 w-8" />
                </div>
                <h3
                  className="font-black text-2xl mb-4 h-16 flex items-center text-left"
                  style={{ color: colors.text }}
                >
                  Global Listener Map
                </h3>
                <p
                  className="font-semibold text-lg leading-relaxed mb-6 flex-grow text-left"
                  style={{ color: colors.textMuted, minHeight: "4.5rem" }}
                >
                  See where metalheads around the world are tuning in from in
                  real-time.
                </p>
                <div
                  className="flex items-center text-sm font-bold mt-auto text-left"
                  style={{ color: colors.primary }}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-3 animate-pulse"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span>{stats?.currentListeners || 42} listeners online</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
