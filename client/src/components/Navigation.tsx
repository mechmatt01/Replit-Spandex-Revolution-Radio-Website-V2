import { useState, useEffect, useRef } from "react";
import { Menu, X, Radio, Sun, Moon, Music, Calendar, Send, Mail, ShoppingBag, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";
import { useTheme } from "@/contexts/ThemeContext";
import MetalThemeSwitcher from "@/components/MetalThemeSwitcher";
import { Link } from "wouter";
import MusicLogoPath from "@assets/MusicLogoIcon@3x_1750324989907.png";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { togglePlayback, isPlaying } = useAudio();
  const { getColors, getGradient } = useTheme();
  const colors = getColors();
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isOpen || isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, isDropdownOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
    setIsDropdownOpen(false);
  };

  const menuItems = [
    { id: 'music', label: 'MUSIC', icon: Music, action: () => window.location.href = '/music' },
    { id: 'schedule', label: 'SCHEDULE', icon: Calendar, action: () => scrollToSection('schedule') },
    { id: 'submissions', label: 'SUBMISSIONS', icon: Send, action: () => scrollToSection('submissions') },
    { id: 'contact', label: 'CONTACT', icon: Mail, action: () => scrollToSection('contact') },
    { id: 'merch', label: 'MERCH', icon: ShoppingBag, action: () => scrollToSection('merch') },
    { id: 'subscribe', label: 'SUBSCRIBE', icon: CreditCard, action: () => scrollToSection('subscription') }
  ];

  return (
    <TooltipProvider>
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
            <div className="hidden xl:flex items-center space-x-4">
              {menuItems.slice(0, 3).map((item) => {
                const IconComponent = item.icon;
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={item.action}
                        className="flex items-center space-x-2 text-sm font-semibold transition-all duration-200 px-3 py-2 rounded-md hover:shadow-md"
                        style={{ color: colors.text }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.primary + '20';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = colors.text;
                        }}
                        aria-label={`Navigate to ${item.label.toLowerCase()}`}
                      >
                        <IconComponent size={16} style={{ color: colors.primary }} />
                        <span>{item.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Navigate to {item.label.toLowerCase()} section
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              
              {/* More Menu Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-1 text-sm font-semibold transition-all duration-200 px-3 py-2 rounded-md hover:shadow-md"
                      style={{ 
                        color: isDropdownOpen ? 'white' : colors.text,
                        backgroundColor: isDropdownOpen ? colors.primary : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!isDropdownOpen) {
                          e.currentTarget.style.backgroundColor = colors.primary + '20';
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDropdownOpen) {
                          e.currentTarget.style.backgroundColor = isDropdownOpen ? colors.primary : 'transparent';
                          e.currentTarget.style.color = isDropdownOpen ? 'white' : colors.text;
                        }
                      }}
                      aria-label="More navigation options"
                      aria-expanded={isDropdownOpen}
                    >
                      <Menu size={16} style={{ color: isDropdownOpen ? 'white' : colors.primary }} />
                      <span>MORE</span>
                      <ChevronDown 
                        size={14} 
                        style={{ 
                          color: isDropdownOpen ? 'white' : colors.primary,
                          transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }} 
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    View more navigation options
                  </TooltipContent>
                </Tooltip>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 py-2 rounded-lg shadow-xl border animate-in fade-in-0 slide-in-from-top-2 duration-200"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.95)',
                      backdropFilter: 'blur(16px)',
                      borderColor: colors.primary + '40',
                      width: 'fit-content',
                      maxWidth: 'none',
                      zIndex: 50
                    }}
                  >
                    {menuItems.slice(3).map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          className="flex items-center justify-between px-4 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap"
                          style={{ 
                            color: colors.text,
                            minWidth: 'max-content'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.primary;
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = colors.text;
                          }}
                          aria-label={`Navigate to ${item.label.toLowerCase()}`}
                        >
                          <span className="text-right">{item.label}</span>
                          <IconComponent size={16} style={{ color: colors.primary }} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              <MetalThemeSwitcher />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="xl:hidden p-2 rounded-md transition-colors duration-200"
                style={{ 
                  color: colors.text,
                  backgroundColor: isOpen ? colors.primary : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isOpen) {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOpen) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }
                }}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <X size={24} style={{ color: isOpen ? 'white' : colors.primary }} />
                ) : (
                  <Menu size={24} style={{ color: colors.primary }} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isOpen && (
            <div 
              ref={menuRef}
              className="xl:hidden absolute top-full left-0 right-0 shadow-xl border-t animate-in slide-in-from-top-2 duration-300"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.98)',
                backdropFilter: 'blur(20px)',
                borderColor: colors.primary + '30'
              }}
            >
              <div className="px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="flex items-center space-x-3 w-full text-left px-4 py-3 text-lg font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{ 
                        color: colors.text
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.primary + '20';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = colors.text;
                      }}
                      role="menuitem"
                      aria-label={`Navigate to ${item.label.toLowerCase()} section`}
                    >
                      <IconComponent size={20} style={{ color: colors.primary }} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>
    </TooltipProvider>
  );
}