import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import ActiveLocations from "./ActiveLocations";
import LiveStatistics from "./LiveStatistics";

export default function StatsAndLocations() {
  const { getColors, currentTheme } = useTheme();
  const colors = getColors();
  const [activeTab, setActiveTab] = useState<"stats" | "locations">("stats");

  return (
    <section 
      className="py-16 transition-colors duration-300"
      style={{ 
        backgroundColor: colors.background,
        border: 'none' // Remove borders completely
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            className="font-orbitron font-black text-3xl md:text-4xl mb-4"
            style={{ 
              color: currentTheme === 'light-mode' ? '#000000' : colors.text 
            }}
          >
            Real-Time Dashboard
          </h2>
          <p 
            className="text-lg font-semibold max-w-2xl mx-auto"
            style={{ 
              color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted 
            }}
          >
            Monitor live listener activity and global engagement across all platforms
          </p>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="md:hidden mb-6">
          <div 
            className="flex rounded-lg p-1 relative"
            style={{ 
              backgroundColor: colors.cardBackground,
              border: 'none' // Remove borders
            }}
          >
            {/* Animated background slider */}
            <div
              className="absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-out"
              style={{
                backgroundColor: colors.accent,
                left: activeTab === "stats" ? "4px" : "calc(50% + 2px)",
                width: "calc(50% - 4px)",
                zIndex: 1
              }}
            />
            
            <button
              onClick={() => setActiveTab("stats")}
              className="flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 relative z-10 focus:outline-none focus:ring-0"
              style={{
                color: activeTab === "stats" ? colors.background : colors.textMuted,
                border: 'none' // Remove borders
              }}
            >
              Live Statistics
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className="flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 relative z-10 focus:outline-none focus:ring-0"
              style={{
                color: activeTab === "locations" ? colors.background : colors.textMuted,
                border: 'none' // Remove borders
              }}
            >
              Active Locations
            </button>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 gap-8">
          <LiveStatistics />
          <ActiveLocations />
        </div>

        {/* Mobile Single Column Layout */}
        <div className="md:hidden">
          {activeTab === "stats" && <LiveStatistics />}
          {activeTab === "locations" && <ActiveLocations />}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div 
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full"
            style={{ 
              backgroundColor: colors.cardBackground,
              border: 'none' // Remove borders
            }}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: '#10B981',
                flexShrink: 0
              }}
            ></div>
            <span 
              className="text-sm font-semibold leading-none"
              style={{ color: colors.text }}
            >
              Real-time data • Updates every 30 seconds
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}