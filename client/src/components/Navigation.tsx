import { useState, useEffect, useRef } from "react";
import { Menu, X, Radio, Sun, Moon, Music, Calendar, Send, Mail, ShoppingBag, CreditCard, ChevronDown, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAudio } from "@/contexts/AudioContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import MetalThemeSwitcher from "@/components/MetalThemeSwitcher";
import AuthModal from "@/components/AuthModal";
import { Link } from "wouter";
import MusicLogoPath from "@assets/MusicLogoIcon@3x_1750324989907.png";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const { togglePlayback, isPlaying } = useAudio();
  const { getColors, getGradient } = useTheme();
  const { user, isAuthenticated } = useAuth();
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
                    className="absolute right-0 mt-2 py-2 rounded-lg shadow-xl border animate-in fade-in-0 slide-in-from-top-2 duration-200 bg-black/80 backdrop-blur-md"
                    style={{
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
                          className="flex items-center justify-end space-x-3 w-full px-4 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap text-right"
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
              {/* Auth buttons / User profile */}
              <div className="hidden xl:flex items-center space-x-3">
                {!isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = "/#/login"}
                      className="text-sm"
                    >
                      SIGN IN
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.location.href = "/#/login"}
                      className="text-sm"
                    >
                      SIGN UP
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link href="/profile" className="relative">
                      <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                        <AvatarImage src={user?.profileImageUrl || ""} />
                        <AvatarFallback className="text-xs">
                          {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {user?.subscriptionStatus === "active" && (
                        <Badge className="absolute -bottom-1 -right-1 p-0 w-4 h-4 rounded-full flex items-center justify-center">
                          <span className="text-xs">★</span>
                        </Badge>
                      )}
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => window.location.href = "/api/logout"}
                      className="text-sm"
                    >
                      LOGOUT
                    </Button>
                  </div>
                )}
              </div>
              
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
              className="xl:hidden absolute top-full right-0 shadow-xl border animate-in slide-in-from-top-2 duration-300 bg-black/80 backdrop-blur-md rounded-lg"
              style={{
                borderColor: colors.primary + '40',
                width: 'fit-content',
                minWidth: '200px'
              }}
            >
              <div className="px-2 py-2 space-y-1">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="flex items-center justify-end space-x-3 w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 whitespace-nowrap text-right"
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
                      role="menuitem"
                      aria-label={`Navigate to ${item.label.toLowerCase()} section`}
                    >
                      <span className="text-right">{item.label}</span>
                      <IconComponent size={16} style={{ color: colors.primary }} />
                    </button>
                  );
                })}
                
                {/* Mobile Authentication */}
                <div className="border-t" style={{ borderColor: colors.primary + '20' }}>
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-2 text-xs font-medium text-center" style={{ color: colors.text }}>
                        Welcome, {user.firstName}
                      </div>
                      <button
                        onClick={() => window.location.href = "/profile"}
                        className="flex items-center justify-end space-x-3 w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 whitespace-nowrap text-right"
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
                        role="menuitem"
                        aria-label="View profile"
                      >
                        <span className="text-right">PROFILE</span>
                        <User size={16} style={{ color: colors.primary }} />
                      </button>
                      <button
                        onClick={() => window.location.href = "/api/logout"}
                        className="flex items-center justify-end space-x-3 w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 whitespace-nowrap text-right"
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
                        role="menuitem"
                        aria-label="Sign out"
                      >
                        <span className="text-right">LOGOUT</span>
                        <LogOut size={16} style={{ color: colors.primary }} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        window.location.href = "/#/login";
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-end space-x-3 w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 whitespace-nowrap text-right"
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
                      role="menuitem"
                      aria-label="Sign in"
                    >
                      <span className="text-right">SIGN IN</span>
                      <User size={16} style={{ color: colors.primary }} />
                    </button>
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
    </TooltipProvider>
  );
}