import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, User, Calendar, Music, Send, Phone, MapPin, Heart, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";
import MetalThemeSwitcher from "./MetalThemeSwitcher";

import AuthModal from "./AuthModal";
import VerificationModal from "./VerificationModal";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import MusicLogoPath from "@assets/MusicLogoIcon@3x_1750324989907.png";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");





  useEffect(() => {
    const handleOpenAuthModal = (event: CustomEvent) => {
      setAuthMode(event.detail?.mode || "login");
      setIsAuthModalOpen(true);
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal as EventListener);
    return () => window.removeEventListener('openAuthModal', handleOpenAuthModal as EventListener);
  }, []);

  const { colors, gradient, toggleTheme, isDarkMode } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();

  const logout = () => {
    window.location.href = "/api/logout";
  };
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const brandTextRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [navPosition, setNavPosition] = useState<number>(0);
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

  // Calculate center position based on screen width only, ignoring other elements
  useEffect(() => {
    const calculateCenterPosition = () => {
      if (navRef.current) {
        const screenWidth = window.innerWidth;
        const navWidth = navRef.current.offsetWidth || 400; // fallback

        // Calculate true center of screen
        const centerX = screenWidth / 2;

        // Position nav so its center is at screen center
        const leftPosition = centerX - (navWidth / 2);

        setNavPosition(leftPosition);
        console.log('Navigation centered at screen center:', leftPosition, 'px from left');
      }
    };

    // Calculate on mount and resize
    calculateCenterPosition();
    const timer = setTimeout(calculateCenterPosition, 100);

    window.addEventListener('resize', calculateCenterPosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateCenterPosition);
    };
  }, []);

  const [location, setLocation] = useLocation();

  const navigateToSection = (sectionId: string, route?: string) => {
    // Close all menus first
    setIsOpen(false);
    setIsDropdownOpen(false);

    // If we need to go to a different route
    if (route && route !== location) {
      setLocation(route);
      // Wait for page to load then scroll to section
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    } else {
      // Same page, just scroll to section
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  };

  // Direct navigation functions for clarity
  const goToMusic = () => {
    console.log('Navigating to music page...');
    setIsOpen(false);
    setIsDropdownOpen(false);
    setLocation("/music");
  };

  const goToHomeSection = (sectionId: string) => {
    console.log(`Navigating to home section: ${sectionId}`);
    setIsOpen(false);
    setIsDropdownOpen(false);
    if (location !== "/") {
      setLocation("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    } else {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  };

  const menuItems = [
    { 
      id: 1, 
      label: "MUSIC", 
      icon: Music, 
      action: () => {
        console.log('Music action triggered');
        goToMusic();
      }, 
      tooltip: "Listen to live radio and music" 
    },
    { 
      id: 2, 
      label: "SCHEDULE", 
      icon: Calendar, 
      action: () => {
        console.log('Schedule action triggered');
        goToHomeSection("schedule");
      }, 
      tooltip: "View show schedule and programming" 
    },
    { 
      id: 3, 
      label: "SUBMISSIONS", 
      icon: Send, 
      action: () => {
        console.log('Submissions action triggered');
        goToHomeSection("submissions");
      }, 
      tooltip: "Submit song requests and feedback" 
    },
    { 
      id: 4, 
      label: "CONTACT", 
      icon: Phone, 
      action: () => {
        console.log('Contact action triggered');
        goToHomeSection("contact");
      }, 
      tooltip: "Get in touch with the station" 
    },
    { 
      id: 5, 
      label: "LISTEN MAP", 
      icon: MapPin, 
      action: () => {
        console.log('Listen Map action triggered');
        goToHomeSection("map");
      }, 
      tooltip: "View live listener map worldwide" 
    },
    { 
      id: 6, 
      label: "FEATURES", 
      icon: Heart, 
      action: () => {
        console.log('Features action triggered');
        goToHomeSection("features");
      }, 
      tooltip: "Explore premium features and subscription tiers" 
    },
  ];

  return (
    <TooltipProvider>
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm transition-colors duration-300">
        <div className="w-full relative">
          <div className="xl:relative flex justify-between items-center h-16" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
            {/* Logo & Brand - Left side */}
            <div className="flex items-center space-x-4">
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{ 
                  background: gradient,
                  padding: '5px'
                }}
              >
                <img 
                  src={MusicLogoPath} 
                  alt="Music Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col" id="brand-text" ref={brandTextRef}>
                <div className="text-sm font-black leading-tight" style={{ color: colors.text }}>
                  SPANDEX SALVATION
                </div>
                <div className="text-sm font-black leading-tight" style={{ color: colors.primary }}>
                  RADIO
                </div>
              </div>
            </div>

            {/* Desktop Navigation - Absolutely positioned at true screen center */}
            <div 
              ref={navRef}
              className="hidden xl:flex items-center space-x-4 absolute"
              style={{ 
                left: `${navPosition}px`,
                top: '50%',
                transform: 'translateY(-50%)',
                transition: 'left 0.3s ease'
              }}
            >
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
                      {item.tooltip}
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
                      <Menu size={16} style={{ color: isDropdownOpen ? 'white' : colors.primary, marginLeft: '2px' }} />
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
                    className="absolute left-1/2 transform -translate-x-1/2 mt-2 py-2 rounded-xl shadow-xl border animate-in fade-in-0 slide-in-from-top-2 duration-200 bg-black/80 backdrop-blur-md"
                    style={{
                      borderColor: colors.primary + '40',
                      width: 'auto',
                      minWidth: 'max-content',
                      zIndex: 50
                    }}
                  >
                    {menuItems.slice(3).map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log(`Desktop dropdown clicked: ${item.label}`);
                                try {
                                  item.action();
                                } catch (error) {
                                  console.error('Navigation error:', error);
                                }
                              }}
                              className="flex items-center space-x-3 px-4 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap hover:rounded-lg w-full"
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
                              aria-label={`Navigate to ${item.label.toLowerCase()}`}
                            >
                              <IconComponent size={16} style={{ color: colors.primary }} />
                              <span>{item.label}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            {item.tooltip}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right side controls - Fixed to far right */}
            <div className="flex items-center space-x-1 absolute right-4 top-1/2 transform -translate-y-1/2 hidden xl:flex">
              {/* Theme toggle */}
              <MetalThemeSwitcher />

              {/* Authentication buttons */}
              {!isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setIsAuthModalOpen(true);
                    }}
                    className="px-2 py-1 text-sm font-semibold rounded-md transition-all duration-200 hover:scale-105"
                    style={{
                      color: colors.text,
                      border: `1px solid ${colors.primary}`,
                      backgroundColor: 'transparent',
                      height: '24px',
                      minWidth: '80px'
                    }}
                  >
                    LOGIN
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode("register");
                      setIsAuthModalOpen(true);
                    }}
                    className="px-2 py-1 text-sm font-semibold rounded-md transition-all duration-200 hover:scale-105 whitespace-nowrap"
                    style={{
                      backgroundColor: colors.primary,
                      color: 'white',
                      border: `1px solid ${colors.primary}`,
                      height: '24px',
                      minWidth: '80px'
                    }}
                  >
                    SIGN UP
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setLocation("/profile")}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: 'transparent',
                          border: `1px solid ${colors.primary}`
                        }}
                      >
                        <User size={16} style={{ color: colors.primary }} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      View profile and settings
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => logout()}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: 'transparent',
                          border: `1px solid ${colors.primary}`
                        }}
                      >
                        <LogOut size={16} style={{ color: colors.primary }} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Sign out
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Mobile controls - Right side on mobile only */}
            <div className="xl:hidden flex items-center space-x-3">
              {/* Theme toggle - always visible in mobile */}
              <MetalThemeSwitcher />

              {/* Mobile menu button */}
              <button
                ref={menuRef}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg transition-colors duration-200"
                style={{ 
                  backgroundColor: isOpen ? colors.primary : 'transparent',
                  color: isOpen ? 'white' : colors.primary 
                }}
                aria-label="Toggle mobile menu"
                aria-expanded={isOpen}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="xl:hidden absolute top-full right-4 bg-black/90 backdrop-blur-md border rounded-xl animate-in slide-in-from-top-2 duration-300 shadow-xl" style={{ 
              borderColor: colors.primary + '40',
              width: 'auto',
              minWidth: 'max-content',
              maxWidth: 'calc(100vw - 2rem)'
            }}>
              <div className="px-4 py-6 space-y-3">
                {/* Render all menu items in mobile */}
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(`Mobile dropdown clicked: ${item.label}`);
                            try {
                              item.action();
                            } catch (error) {
                              console.error('Navigation error:', error);
                            }
                          }}
                          type="button"
                          className="flex items-center space-x-3 px-4 py-3 text-left text-base font-semibold rounded-lg transition-all duration-200 whitespace-nowrap w-full cursor-pointer"
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
                          aria-label={`Navigate to ${item.label.toLowerCase()}`}
                        >
                          <IconComponent size={20} style={{ color: colors.primary }} />
                          <span>{item.label}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.tooltip}</TooltipContent>
                    </Tooltip>
                  );
                })}

                <div className="pt-4 mt-4 border-t space-y-3" style={{ borderColor: colors.primary + '40' }}>
                  {!isAuthenticated ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Mobile login clicked');
                              setAuthMode("login");
                              setIsAuthModalOpen(true);
                              setIsOpen(false);
                            }}
                            type="button"
                            className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer"
                            style={{
                              color: colors.text,
                              backgroundColor: 'transparent',
                              border: `1px solid ${colors.primary}`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.primary + '20';
                              e.currentTarget.style.color = 'white';
                              const icon = e.currentTarget.querySelector('svg');
                              if (icon) icon.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = colors.text;
                              const icon = e.currentTarget.querySelector('svg');
                              if (icon) icon.style.color = colors.primary;
                            }}
                            role="menuitem"
                            aria-label="Login"
                          >
                            <User size={16} style={{ color: colors.primary }} />
                            <span>LOGIN</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          Sign in to your account
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Mobile signup clicked');
                              setAuthMode("register");
                              setIsAuthModalOpen(true);
                              setIsOpen(false);
                            }}
                            type="button"
                            className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer"
                            style={{
                              color: 'white',
                              backgroundColor: colors.primary,
                              border: `1px solid ${colors.primary}`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.primary + 'CC';
                              e.currentTarget.style.color = 'white';
                              const icon = e.currentTarget.querySelector('svg');
                              if (icon) icon.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = colors.primary;
                              e.currentTarget.style.color = 'white';
                              const icon = e.currentTarget.querySelector('svg');
                              if (icon) icon.style.color = 'white';
                            }}
                            role="menuitem"
                            aria-label="Sign up"
                          >
                            <UserPlus size={16} style={{ color: 'white' }} />
                            <span>SIGN UP</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          Create a new account
                        </TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              setLocation('/profile');
                              setIsOpen(false);
                            }}
                            type="button"
                            className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer w-full"
                            style={{
                              color: colors.text,
                              backgroundColor: colors.primary + '20'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.primary + '30';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = colors.primary + '20';
                              e.currentTarget.style.color = colors.text;
                            }}
                          >
                            <User size={16} style={{ color: colors.primary }} />
                            <span>PROFILE</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          View profile and settings
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              logout();
                              setIsOpen(false);
                            }}
                            type="button"
                            className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer w-full"
                            style={{
                              color: colors.primary,
                              backgroundColor: 'transparent',
                              border: `1px solid ${colors.primary}`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.primary + '20';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = colors.primary;
                            }}
                          >
                            <LogOut size={16} style={{ color: colors.primary }} />
                            <span>SIGN OUT</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          Sign out of your account
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      <VerificationModal />
    </TooltipProvider>
  );
}