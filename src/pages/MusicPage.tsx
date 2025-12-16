import { useState } from "react";
import RadioCoPlayer from "../components/RadioCoPlayer";
import Navigation from "../components/Navigation";
import StickyPlayer from "../components/StickyPlayer";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useRadio } from "../contexts/RadioContext";

type Station = "95.5 The Beat" | "Hot 97" | "Power 106" | "SomaFM Metal";

export default function MusicPage() {
  const { colors } = useTheme();
  const [currentStation, setCurrentStation] = useState<Station>("95.5 The Beat");
  const [isStationDropdownOpen, setIsStationDropdownOpen] = useState(false);
  
  const stations: Station[] = ["95.5 The Beat", "Hot 97", "Power 106", "SomaFM Metal"];

  const stationInfo: Record<Station, { name: string; description: string; frequency: string; listeners: string }> = {
    "95.5 The Beat": {
      name: "95.5 The Beat",
      description: "Dallas' Hip Hop and R&B - Playing the hottest tracks 24/7",
      frequency: "95.5 FM",
      listeners: "100K+"
    },
    "Hot 97": {
      name: "Hot 97",
      description: "New York's Hip Hop & R&B - Where Hip Hop Lives",
      frequency: "97.1 FM",
      listeners: "500K+"
    },
    "Power 106": {
      name: "Power 106",
      description: "Los Angeles' Hip Hop Station - LA's #1 for Hip Hop",
      frequency: "105.9 FM", 
      listeners: "300K+"
    },
    "SomaFM Metal": {
      name: "SomaFM Metal Detector",
      description: "From black to doom, prog to sludge, thrash to post, stoner to crossover",
      frequency: "Online",
      listeners: "50K+"
    }
  };

  const currentStationInfo = stationInfo[currentStation];

  return (
    <>
      <Navigation />
      <div id="music" className="min-h-screen bg-background pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-foreground mb-4">
              LIVE RADIO
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Stream Your Favorite Stations 24/7
            </p>
          </div>

          {/* Station Selector - Centered Above Player */}
          <div className="max-w-4xl mx-auto mb-6">
            <div className="flex justify-center">
              <div className="relative">
                <button
                  onClick={() => setIsStationDropdownOpen(!isStationDropdownOpen)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 font-semibold text-white"
                  style={{
                    backgroundColor: colors.primary,
                    border: `2px solid ${colors.primary}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                  }}
                >
                  <span>{currentStation}</span>
                  <ChevronDown 
                    size={16} 
                    style={{ 
                      transform: isStationDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }} 
                  />
                </button>

                {/* Station Dropdown */}
                {isStationDropdownOpen && (
                  <div 
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 py-2 rounded-lg shadow-xl border backdrop-blur-md z-50"
                    style={{
                      backgroundColor: colors.background === '#000000' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      borderColor: colors.primary + '40',
                      minWidth: '200px'
                    }}
                  >
                    {stations.map((station) => (
                      <button
                        key={station}
                        onClick={() => {
                          setCurrentStation(station);
                          setIsStationDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:rounded transition-colors duration-200"
                        style={{
                          color: currentStation === station ? 'white' : colors.text,
                          backgroundColor: currentStation === station ? colors.primary : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (currentStation !== station) {
                            e.currentTarget.style.backgroundColor = colors.primary + '20';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentStation !== station) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {station}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Radio Player */}
          <div className="max-w-4xl mx-auto">
            <RadioCoPlayer />
          </div>

          {/* Station Info */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-black/90 backdrop-blur-md rounded-lg p-6 border" style={{ borderColor: colors.primary + '20' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
                About {currentStationInfo.name}
              </h2>
              <p className="mb-4" style={{ color: colors.text, opacity: 0.8 }}>
                {currentStationInfo.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="font-bold text-xl" style={{ color: colors.primary }}>24/7</div>
                  <div style={{ color: colors.text, opacity: 0.6 }}>Live Broadcasting</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl" style={{ color: colors.primary }}>
                    {currentStationInfo.frequency}
                  </div>
                  <div style={{ color: colors.text, opacity: 0.6 }}>Frequency</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl" style={{ color: colors.primary }}>
                    {currentStationInfo.listeners}
                  </div>
                  <div style={{ color: colors.text, opacity: 0.6 }}>Active Listeners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Removed duplicate StickyPlayer to prevent overlapping volume indicators */}
    </>
  );
}
