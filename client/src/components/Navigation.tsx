
import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, User, Calendar, Music, Send, Phone, MapPin, Heart, UserPlus, LogOut, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import MetalThemeSwitcher from "./MetalThemeSwitcher";
import AuthModal from "./AuthModal";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import MusicLogoPath from "@assets/MusicLogoIcon@3x.png";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const handleOpenAuthModal = (event: CustomEvent) => {
      setAuthMode(event.detail?.mode || "login");
      setIsAuthModalOpen(true);
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal as EventListener);
    return () => window.removeEventListener('openAuthModal', handleOpenAuthModal as EventListener);
  }, []);

  const { colors, gradient, toggleTheme, isDarkMode, currentTheme } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();

  const logout = () => {
    window.location.href = "/api/logout";
  };

  const menuRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const brandTextRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [navPosition, setNavPosition] = useState<number>(0);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside mobile menu button AND mobile dropdown
      if (isOpen && 
          menuRef.current && 
          !menuRef.current.contains(event.target as Node) &&
          mobileDropdownRef.current && 
          !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      // Check if click is outside desktop dropdown
      if (isDropdownOpen && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isOpen || isDropdownOpen) {
      // Use 'click' instead of 'mousedown' to allow links to work
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
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

  // Simple navigation function that works reliably
  const navigateToSection = (sectionId: string, route?: string) => {
    console.log(`Navigation: ${sectionId}, route: ${route}`);
    
    // Close menus
    setIsOpen(false);
    setIsDropdownOpen(false);

    // Handle route navigation
    if (route && route !== location) {
      setLocation(route);
      if (sectionId && sectionId !== route.replace('/', '')) {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 200);
      }
      return;
    }

    // Handle section scrolling
    if (sectionId) {
      if (location !== "/") {
        window.location.href = `/#${sectionId}`;
        return;
      }

      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    }
  };

  // Logo click handler
  const handleLogoClick = () => {
    if (location === '/') {
      // If on home page, scroll to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      // If on another page, navigate to home
      setLocation('/');
    }
  };

  // Authentication handlers
  const openLogin = () => {
    setIsOpen(false);
    setIsDropdownOpen(false);
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const openSignUp = () => {
    setIsOpen(false);
    setIsDropdownOpen(false);
    setAuthMode("register");
    setIsAuthModalOpen(true);
  };

  const goToProfile = () => {
    setIsOpen(false);
    setIsDropdownOpen(false);
    setLocation("/profile");
  };

  const handleLogout = () => {
    setIsOpen(false);
    setIsDropdownOpen(false);
    logout();
  };

  // Menu items configuration
  const menuItems = [
    { 
      id: 1, 
      label: "MUSIC", 
      icon: Music, 
      action: () => navigateToSection("music", "/music"), 
      tooltip: "Listen to live radio and music" 
    },
    { 
      id: 2, 
      label: "SCHEDULE", 
      icon: Calendar, 
      action: () => navigateToSection("schedule"), 
      tooltip: "View show schedule and programming" 
    },
    { 
      id: 3, 
      label: "SUPPORT US", 
      icon: Heart, 
      action: () => navigateToSection("subscribe"), 
      tooltip: "Support the station with premium subscriptions" 
    },
    { 
      id: 4, 
      label: "SUBMISSIONS", 
      icon: Send, 
      action: () => navigateToSection("submissions"), 
      tooltip: "Submit song requests and feedback" 
    },
    { 
      id: 5, 
      label: "CONTACT", 
      icon: Phone, 
      action: () => navigateToSection("contact"), 
      tooltip: "Get in touch with the station" 
    },
    { 
      id: 6, 
      label: "LISTEN MAP", 
      icon: MapPin, 
      action: () => navigateToSection("map"), 
      tooltip: "View live listener map worldwide" 
    },
    { 
      id: 7, 
      label: "FEATURES", 
      icon: Heart, 
      action: () => navigateToSection("features"), 
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
                className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer logo-container"
                style={{ 
                  background: gradient,
                  padding: '5px'
                }}
                onClick={handleLogoClick}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  if (img && !img.classList.contains('logo-spin-easter-egg')) {
                    img.classList.add('logo-spin-easter-egg');
                  }
                }}
              >
                <img 
                  src={MusicLogoPath} 
                  alt="Music Logo" 
                  className="w-full h-full object-contain"
                  onAnimationEnd={(e) => {
                    e.currentTarget.classList.remove('logo-spin-easter-egg');
                  }}
                />
              </div>
              <div className="flex flex-col" id="brand-text" ref={brandTextRef}>
                <div 
                  className="text-sm font-black leading-tight transition-colors duration-300" 
                  style={{ 
                    color: currentTheme === 'light-mode' ? '#1f2937' : colors.text 
                  }}
                >
                  SPANDEX SALVATION
                </div>
                <div className="text-sm font-black leading-tight" style={{ color: colors.primary }}>
                  RADIO
                </div>
              </div>
            </div>

            {/* Desktop Navigation - Centered */}
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

              {/* Desktop More Menu Dropdown */}
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

                {/* Desktop Dropdown Menu */}
                {isDropdownOpen && (
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 mt-2 py-2 rounded-xl shadow-xl border animate-in fade-in-0 slide-in-from-top-2 duration-200 backdrop-blur-md"
                    style={{
                      backgroundColor: !isDarkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)',
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
                              onClick={item.action}
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
                            >
                              <IconComponent size={16} style={{ color: colors.primary }} />
                              <span>{item.label}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left" align="center" sideOffset={5}>
                            {item.tooltip}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Right Side Controls */}
            <div className="hidden xl:flex items-center space-x-1 absolute right-4 top-1/2 transform -translate-y-1/2">
              <MetalThemeSwitcher />

              {!isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={openLogin}
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
                    onClick={openSignUp}
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
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="relative flex items-center space-x-2 p-1 rounded-full transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: 'transparent',
                        }}
                      >
                        <div className="relative">
                          {/* Profile Image */}
                          <div
                            className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg ring-2 ring-offset-2"
                            style={{
                              background: user?.profileImageUrl 
                                ? `url(${user?.profileImageUrl}) center/cover` 
                                : gradient,
                              ringColor: colors.primary,
                              ringOffsetColor: isDarkMode ? '#000000' : '#ffffff',
                            }}
                          >
                            {!user?.profileImageUrl && (
                              <User size={20} className="text-white" />
                            )}
                          </div>
                          
                          {/* Verified Badge for Subscribers */}
                          {user?.activeSubscription && (
                            <div 
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                              style={{
                                backgroundColor: colors.primary,
                                border: `2px solid ${isDarkMode ? '#000000' : '#ffffff'}`,
                              }}
                            >
                              <svg 
                                width="12" 
                                height="12" 
                                viewBox="0 0 24 24" 
                                fill="none"
                                className="text-white"
                              >
                                <path 
                                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                                  stroke="currentColor" 
                                  strokeWidth="2.5" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <ChevronDown 
                          size={16} 
                          className="transition-transform duration-200"
                          style={{ color: colors.text }}
                        />
                      </button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent 
                      align="end" 
                      className="w-64 p-2 mt-2 shadow-2xl border-2"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderColor: `${colors.primary}40`,
                      }}
                    >
                      {/* User Info */}
                      <div className="px-3 py-2 mb-2">
                        <p 
                          className="font-black text-sm"
                          style={{ color: colors.text }}
                        >
                          {user?.firstName || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p 
                          className="text-xs opacity-70"
                          style={{ color: colors.text }}
                        >
                          {user?.email}
                        </p>
                      </div>
                      
                      <DropdownMenuSeparator className="opacity-20" />
                      
                      {/* Profile */}
                      <DropdownMenuItem
                        onClick={() => setLocation("/profile?section=profile")}
                        className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200"
                        style={{
                          color: colors.text,
                        }}
                      >
                        <User size={18} style={{ color: colors.primary }} />
                        <span className="font-semibold">Profile</span>
                      </DropdownMenuItem>
                      
                      {/* Subscription Management - Only if active */}
                      {user?.activeSubscription && (
                        <DropdownMenuItem
                          onClick={() => setLocation("/profile?section=subscription")}
                          className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200"
                          style={{
                            color: colors.text,
                          }}
                        >
                          <CreditCard size={18} style={{ color: colors.primary }} />
                          <span className="font-semibold">Subscription<br/>Management</span>
                        </DropdownMenuItem>
                      )}
                      
                      {/* Submission Requests */}
                      <DropdownMenuItem
                        onClick={() => setLocation("/profile?section=submissions")}
                        className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200"
                        style={{
                          color: colors.text,
                        }}
                      >
                        <FileText size={18} style={{ color: colors.primary }} />
                        <span className="font-semibold">Submission<br/>Requests</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="opacity-20" />
                      
                      {/* Logout */}
                      <DropdownMenuItem
                        onClick={() => setShowLogoutDialog(true)}
                        className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200"
                        style={{
                          color: '#EF4444',
                        }}
                      >
                        <LogOut size={18} className="text-red-500" />
                        <span className="font-semibold">Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Mobile Controls */}
            <div className="xl:hidden flex items-center space-x-3">
              <MetalThemeSwitcher />
              <button
                ref={menuRef}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                style={{ 
                  backgroundColor: isOpen ? colors.primary : 'transparent',
                  color: isOpen ? 'white' : colors.primary 
                }}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown - Clean Rewrite */}
          {isOpen && (
            <div 
              ref={mobileDropdownRef}
              className="xl:hidden absolute top-full right-4 bg-black/90 backdrop-blur-md border rounded-xl animate-in slide-in-from-top-2 duration-300 shadow-xl" 
              style={{ 
                borderColor: colors.primary + '40',
                minWidth: '280px',
                maxWidth: '320px',
                zIndex: 9999
              }}
            >
              <div className="p-4 space-y-2">
                {/* Music Link */}
                <a
                  href="/music"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 no-underline"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  <Music size={20} style={{ color: colors.primary }} />
                  <span>MUSIC</span>
                </a>

                {/* Schedule Link */}
                <a
                  href="/#schedule"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 no-underline"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  <Calendar size={20} style={{ color: colors.primary }} />
                  <span>SCHEDULE</span>
                </a>

                {/* Support Us Link */}
                <a
                  href="/#subscribe"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 no-underline"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  <Heart size={20} style={{ color: colors.primary }} />
                  <span>SUPPORT US</span>
                </a>

                {/* Submissions Link */}
                <a
                  href="/#submissions"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 no-underline"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  <Send size={20} style={{ color: colors.primary }} />
                  <span>SUBMISSIONS</span>
                </a>

                {/* Contact Link */}
                <a
                  href="/#contact"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 no-underline"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  <Phone size={20} style={{ color: colors.primary }} />
                  <span>CONTACT</span>
                </a>

                {/* Listen Map Link */}
                <a
                  href="/#map"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 no-underline"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  <MapPin size={20} style={{ color: colors.primary }} />
                  <span>LISTEN MAP</span>
                </a>

                {/* Features Link */}
                <a
                  href="/#features"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 no-underline"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  <Heart size={20} style={{ color: colors.primary }} />
                  <span>FEATURES</span>
                </a>

                {/* Divider */}
                <div className="border-t my-3" style={{ borderColor: colors.primary + '40' }} />

                {/* Authentication Buttons */}
                {!isAuthenticated ? (
                  <>
                    <div
                      onClick={() => {
                        setTimeout(() => {
                          setAuthMode("login");
                          setIsAuthModalOpen(true);
                        }, 100);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center space-x-3 px-6 py-3 text-sm font-bold rounded-full transition-all duration-300 w-full cursor-pointer shadow-lg"
                      style={{ 
                        color: 'white',
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
                        border: 'none',
                        transform: 'scale(1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = `0 8px 25px -8px ${colors.primary}60`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 15px -4px rgba(0,0,0,0.2)';
                      }}
                    >
                      <User size={18} style={{ color: 'white' }} />
                      <span>LOGIN</span>
                    </div>
                    
                    <div
                      onClick={() => {
                        setTimeout(() => {
                          setAuthMode("register");
                          setIsAuthModalOpen(true);
                        }, 100);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center space-x-3 px-6 py-3 text-sm font-bold rounded-full transition-all duration-300 w-full cursor-pointer shadow-lg"
                      style={{ 
                        color: colors.primary,
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: `2px solid ${colors.primary}`,
                        backdropFilter: 'blur(10px)',
                        transform: 'scale(1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.background = `${colors.primary}15`;
                        e.currentTarget.style.boxShadow = `0 8px 25px -8px ${colors.primary}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.boxShadow = '0 4px 15px -4px rgba(0,0,0,0.2)';
                      }}
                    >
                      <UserPlus size={18} style={{ color: colors.primary }} />
                      <span>SIGN UP</span>
                    </div>
                  </>
                ) : (
                  <>
                    <a
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full no-underline"
                      style={{
                        color: colors.text,
                        backgroundColor: colors.primary + '20',
                        display: 'flex',
                        textDecoration: 'none'
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
                    </a>
                    
                    <a
                      href="/api/logout"
                      className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full no-underline"
                      style={{
                        color: colors.primary,
                        backgroundColor: 'transparent',
                        border: `1px solid ${colors.primary}`,
                        display: 'flex',
                        textDecoration: 'none'
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
                    </a>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent
          className="max-w-md animate-in fade-in zoom-in duration-300"
          style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: `2px solid ${colors.primary}40`,
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className="text-xl font-black"
              style={{ color: colors.text }}
            >
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription
              className="text-base"
              style={{ color: colors.text, opacity: 0.8 }}
            >
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogCancel
              className="font-semibold px-6 py-2 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.primary}40`,
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="font-semibold px-6 py-2 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: '#EF4444',
                color: 'white',
                border: '1px solid #EF4444',
              }}
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </TooltipProvider>
  );
}
