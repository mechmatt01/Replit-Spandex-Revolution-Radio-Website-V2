import { useState } from "react";
import { Menu, X, Radio, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";
import { useTheme } from "@/contexts/ThemeContext";
import MetalThemeSwitcher from "@/components/MetalThemeSwitcher";
import { Link } from "wouter";
import MusicLogoPath from "@assets/MusicLogoIcon@3x_1750324989907.png";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { togglePlayback, isPlaying } = useAudio();
  const { getColors, getGradient } = useTheme();
  const colors = getColors();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm transition-colors duration-300">
      <div className="w-full relative">
        <div className="flex items-center justify-between h-16" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{ 
                background: getGradient(),
                padding: '5px'
              }}
            >
              <img 
                src={MusicLogoPath} 
                alt="Music Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-black leading-tight" style={{ color: colors.text }}>
                SPANDEX SALVATION
              </div>
              <div className="text-sm font-black leading-tight" style={{ color: colors.primary }}>
                RADIO
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection("home")}
              className="text-sm font-semibold transition-colors"
              style={{ color: colors.text }}
            >
              HOME
            </button>
            <Link href="/music">
              <button className="text-sm font-semibold transition-colors" style={{ color: colors.text }}>
                MUSIC
              </button>
            </Link>
            <button 
              onClick={() => scrollToSection("schedule")}
              className="text-sm font-semibold transition-colors px-2 py-1 rounded"
              style={{ color: colors.text }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = getGradient().split(',')[0].split('(')[1].trim();
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text;
              }}
            >
              SCHEDULE
            </button>
            <button 
              onClick={() => scrollToSection("submissions")}
              className="text-sm font-semibold transition-colors px-2 py-1 rounded"
              style={{ color: colors.text }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = getGradient().split(',')[0].split('(')[1].trim();
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text;
              }}
            >
              SUBMISSIONS
            </button>
            <button 
              onClick={() => scrollToSection("contact")}
              className="text-sm font-semibold transition-colors px-2 py-1 rounded"
              style={{ color: colors.text }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = getGradient().split(',')[0].split('(')[1].trim();
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text;
              }}
            >
              CONTACT
            </button>
            <button 
              onClick={() => scrollToSection("merch")}
              className="text-sm font-semibold transition-colors px-2 py-1 rounded"
              style={{ color: colors.text }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = getGradient().split(',')[0].split('(')[1].trim();
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text;
              }}
            >
              MERCH
            </button>
            <button 
              onClick={() => scrollToSection("subscription")}
              className="text-sm font-semibold transition-colors px-2 py-1 rounded"
              style={{ color: colors.text }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = getGradient().split(',')[0].split('(')[1].trim();
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.text;
              }}
            >
              SUBSCRIBE
            </button>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4 xl:space-x-4 mr-0 xl:mr-0 h-full">
            <div className="mr-12 xl:mr-0 flex items-center h-full">
              <MetalThemeSwitcher />
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="xl:hidden absolute top-1/2 right-4 p-2 rounded-md transform -translate-y-1/2 transition-colors hover:bg-opacity-20"
          style={{ 
            color: colors.text,
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${getGradient().split(',')[0].split('(')[1]}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation Dropdown */}
        {isOpen && (
          <>
            {/* Background Blur Overlay */}
            <div 
              className="xl:hidden fixed inset-0 z-30 backdrop-blur-md transition-opacity duration-300"
              style={{ 
                backgroundColor: `${colors.background}40`,
                backdropFilter: 'blur(8px)'
              }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Content - Attached to nav bar */}
            <div 
              className="xl:hidden absolute top-full right-0 z-40 w-64 bg-card/80 backdrop-blur-sm transition-colors duration-300 rounded-b-2xl shadow-xl border-t-0"
              style={{ 
                borderLeft: `1px solid ${colors.border}30`,
                borderRight: `1px solid ${colors.border}30`,
                borderBottom: `1px solid ${colors.border}30`
              }}
            >
              <div className="p-4 space-y-3">
                <button 
                  onClick={() => scrollToSection("home")}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  HOME
                </button>
                <Link href="/music">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
                    style={{ color: colors.text }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary + '20';
                      e.currentTarget.style.color = colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = colors.text;
                    }}
                  >
                    MUSIC
                  </button>
                </Link>
                <button 
                  onClick={() => scrollToSection("schedule")}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  SCHEDULE
                </button>
                <button 
                  onClick={() => scrollToSection("submissions")}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  SUBMISSIONS
                </button>
                <button 
                  onClick={() => scrollToSection("contact")}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  CONTACT
                </button>
                <button 
                  onClick={() => scrollToSection("merch")}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  MERCH
                </button>
                <button 
                  onClick={() => scrollToSection("subscription")}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  SUBSCRIBE
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}