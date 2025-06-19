import { useState, useEffect, useRef } from "react";
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
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

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
                e.currentTarget.style.backgroundColor = getGradient().split(',')[0].split('(')[1].trim() + '20';
                e.currentTarget.style.color = 'white';
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
              className="text-sm font-semibold transition-colors px-2 py-1 rounded"
              style={{ color: colors.text }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getGradient().split(',')[0].split('(')[1].trim() + '20';
                e.currentTarget.style.color = 'white';
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
              className="text-sm font-semibold transition-colors px-2 py-1 rounded"
              style={{ color: colors.text }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getGradient().split(',')[0].split('(')[1].trim() + '20';
                e.currentTarget.style.color = 'white';
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
              className="text-sm font-semibold transition-colors px-2 py-1 rounded"
              style={{ color: colors.text }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getGradient().split(',')[0].split('(')[1].trim() + '20';
                e.currentTarget.style.color = 'white';
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
              className="text-sm font-semibold transition-colors px-2 py-1 rounded"
              style={{ color: colors.text }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = getGradient().split(',')[0].split('(')[1].trim() + '20';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
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
          className="xl:hidden absolute top-1/2 right-4 p-2 rounded-md transform -translate-y-1/2 transition-colors hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation Dropdown */}
        {isOpen && (
          <div 
            ref={menuRef}
            id="mobile-menu"
            className="xl:hidden fixed top-16 left-0 right-0 bottom-0 z-40 bg-black/95 backdrop-blur-xl transition-colors duration-300"
            role="menu"
            aria-label="Mobile navigation menu"
            onClick={(e) => {
              // Close menu if clicking the background, not the menu items
              if (e.target === e.currentTarget) {
                setIsOpen(false);
              }
            }}
          >
            <div className="p-4 space-y-3">
                <button 
                  onClick={() => scrollToSection("home")}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                  role="menuitem"
                  aria-label="Navigate to home section"
                >
                  HOME
                </button>
                <Link href="/music">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ color: colors.text }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary + '20';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = colors.text;
                    }}
                    role="menuitem"
                    aria-label="Navigate to music page"
                  >
                    MUSIC
                  </button>
                </Link>
                <button 
                  onClick={() => scrollToSection("schedule")}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                  role="menuitem"
                  aria-label="Navigate to schedule section"
                >
                  SCHEDULE
                </button>
                <button 
                  onClick={() => scrollToSection("submissions")}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                  role="menuitem"
                  aria-label="Navigate to submissions section"
                >
                  SUBMISSIONS
                </button>
                <button 
                  onClick={() => scrollToSection("contact")}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                  role="menuitem"
                  aria-label="Navigate to contact section"
                >
                  CONTACT
                </button>
                <button 
                  onClick={() => scrollToSection("merch")}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                  role="menuitem"
                  aria-label="Navigate to merchandise section"
                >
                  MERCH
                </button>
                <button 
                  onClick={() => scrollToSection("subscription")}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ color: colors.text }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                  role="menuitem"
                  aria-label="Navigate to subscription section"
                >
                  SUBSCRIBE
                </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}