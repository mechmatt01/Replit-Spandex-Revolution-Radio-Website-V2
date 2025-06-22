import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, User, Calendar, Music, Send, Phone, MapPin, Heart, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MetalThemeSwitcher from "./MetalThemeSwitcher";
import AuthModal from "./AuthModal";
import VerificationModal from "./VerificationModal";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
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
  const { user, isAuthenticated, logout } = useAuth();
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
    setIsDropdownOpen(false);
  };

  const menuItems = [
    { id: 1, label: "MUSIC", icon: Music, action: () => scrollToSection("music") },
    { id: 2, label: "SCHEDULE", icon: Calendar, action: () => scrollToSection("schedule") },
    { id: 3, label: "SUBMISSIONS", icon: Send, action: () => scrollToSection("submissions") },
    { id: 4, label: "CONTACT", icon: Phone, action: () => scrollToSection("contact") },
    { id: 5, label: "LISTEN MAP", icon: MapPin, action: () => scrollToSection("map") },
    { id: 6, label: "FEATURES", icon: Heart, action: () => scrollToSection("features") },
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
                    className="absolute right-0 mt-2 py-2 rounded-xl shadow-xl border animate-in fade-in-0 slide-in-from-top-2 duration-200 bg-black/80 backdrop-blur-md"
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
                        <button
                          key={item.id}
                          onClick={item.action}
                          className="flex items-center justify-end space-x-3 px-4 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap text-right hover:rounded-lg"
                          style={{ 
                            color: colors.text,
                            width: 'auto'
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
                          <span className="text-right">{item.label}</span>
                          <IconComponent size={16} style={{ color: colors.primary }} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right side controls - Fixed to far right */}
            <div className="flex items-center space-x-3 absolute right-4 top-1/2 transform -translate-y-1/2 hidden xl:flex">
              {/* Theme toggle */}
              <MetalThemeSwitcher />

              {/* Authentication buttons */}
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'signin' } }))}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      color: colors.text,
                      border: `1px solid ${colors.primary}`,
                      backgroundColor: 'transparent'
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'signup' } }))}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: colors.primary,
                      color: 'white',
                      border: `1px solid ${colors.primary}`
                    }}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => location.href = "/profile"}
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
                        onClick={logout}
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
              <div className="hidden xl:flex items-center space-x-3">
                {!isAuthenticated ? (
                  <></>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => window.location.href = '/profile'}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                          style={{
                            backgroundColor: colors.primary + '20',
                            border: `1px solid ${colors.primary}`
                          }}
                        >
                          {user?.profileImage ? (
                            <div className="relative">
                              <img 
                                src={user.profileImage} 
                                alt="Profile" 
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              {user?.isVerified && (
                                <div 
                                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-xs"
                                  style={{ backgroundColor: colors.primary }}
                                >
                                  ✓
                                </div>
                              )}
                            </div>
                          ) : (
                            <User size={16} style={{ color: colors.primary }} />
                          )}
                          <span className="text-sm font-semibold" style={{ color: colors.text }}>
                            {user?.firstName || 'Profile'}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        View profile and settings
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={logout}
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

            </div>

            {/* Mobile controls - Right side on mobile only */}
            <div className="xl:hidden flex items-center space-x-3">
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
            <div className="xl:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-md border-t animate-in slide-in-from-top-2 duration-300" style={{ borderColor: colors.primary + '40' }}>
              <div className="px-4 py-6 space-y-3">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="flex items-center justify-between w-full px-4 py-3 text-left text-base font-semibold rounded-lg transition-all duration-200"
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
                      <span>{item.label}</span>
                      <IconComponent size={20} style={{ color: colors.primary }} />
                    </button>
                  );
                })}
                
                <div className="pt-4 mt-4 border-t" style={{ borderColor: colors.primary + '40' }}>
                  <div className="flex items-center justify-center mb-4">
                    <MetalThemeSwitcher />
                  </div>
                  
                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        setAuthMode("login");
                        setIsAuthModalOpen(true);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between w-full px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200"
                      style={{
                        color: colors.primary,
                        backgroundColor: 'transparent',
                        border: `1px solid ${colors.primary}`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.primary;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = colors.primary;
                      }}
                      role="menuitem"
                      aria-label="Sign in"
                    >
                      <span className="text-right">SIGN IN</span>
                      <User size={16} style={{ color: colors.primary }} />
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          window.location.href = '/profile';
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between w-full px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200"
                        style={{
                          color: colors.text,
                          backgroundColor: colors.primary + '20'
                        }}
                      >
                        <span>Profile</span>
                        <User size={16} style={{ color: colors.primary }} />
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between w-full px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200"
                        style={{
                          color: colors.primary,
                          backgroundColor: 'transparent',
                          border: `1px solid ${colors.primary}`
                        }}
                      >
                        <span>Sign Out</span>
                        <LogOut size={16} style={{ color: colors.primary }} />
                      </button>
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