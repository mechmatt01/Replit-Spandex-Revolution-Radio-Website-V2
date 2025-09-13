import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, User, Calendar, Music, Send, Phone, MapPin, Heart, UserPlus, LogOut, CreditCard, FileText, ShoppingBag, Settings, X } from "lucide-react";
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
import UserProfile from "./UserProfile";
import Merchandise from "./Merchandise";
import { useTheme } from "../contexts/ThemeContext";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import MusicLogoPath from "/MusicLogoIcon.png";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showMerchandise, setShowMerchandise] = useState(false);

  useEffect(() => {
    const handleOpenAuthModal = (event: CustomEvent) => {
      setAuthMode(event.detail?.mode || "login");
      setIsAuthModalOpen(true);
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal as EventListener);
    return () => window.removeEventListener('openAuthModal', handleOpenAuthModal as EventListener);
  }, []);

  const { colors, gradient, toggleTheme, isDarkMode, currentTheme } = useTheme();
  const { user, signOut } = useFirebaseAuth();

  const logout = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
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
      action: () => navigateToSection("schedule", "/schedule"), 
      tooltip: "View show schedule and programming" 
    },
    { 
      id: 3, 
      label: "SUPPORT US", 
      icon: Heart, 
      action: () => navigateToSection("subscribe", "/support"), 
      tooltip: "Support the station with premium subscriptions" 
    },
    { 
      id: 4, 
      label: "SUBMISSIONS", 
      icon: Send, 
      action: () => navigateToSection("submissions", "/submissions"), 
      tooltip: "Submit song requests and feedback" 
    },
    { 
      id: 5, 
      label: "CONTACT", 
      icon: Phone, 
      action: () => navigateToSection("contact", "/contact"), 
      tooltip: "Get in touch with the station" 
    },
    { 
      id: 6, 
      label: "LISTEN MAP", 
      icon: MapPin, 
      action: () => navigateToSection("map", "/map"), 
      tooltip: "View live listener map worldwide" 
    },
    { 
      id: 7, 
      label: "FEATURES", 
      icon: Heart, 
      action: () => navigateToSection("features", "/features"), 
      tooltip: "Explore premium features and subscription tiers" 
    },
  ];

  return (
    <TooltipProvider>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm transition-colors duration-300 safe-area-inset-top">
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
                    color: colors.textMuted
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
                        className="flex items-center space-x-2 text-sm font-semibold transition-all duration-200 px-3 py-2 rounded-md hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-0"
                        style={{ 
                          color: colors.text,
                          transform: 'scale(1)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.primary + '20';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = colors.text;
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'scale(0.95)';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
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
                      className="flex items-center space-x-1 text-sm font-semibold transition-all duration-200 px-3 py-2 rounded-md hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-0"
                      style={{ 
                        color: isDropdownOpen ? 'white' : colors.text,
                        backgroundColor: isDropdownOpen ? colors.primary : 'transparent',
                        transform: 'scale(1)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isDropdownOpen) {
                          e.currentTarget.style.backgroundColor = colors.primary + '20';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDropdownOpen) {
                          e.currentTarget.style.backgroundColor = isDropdownOpen ? colors.primary : 'transparent';
                          e.currentTarget.style.color = isDropdownOpen ? 'white' : colors.text;
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'scale(0.95)';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                    >
                      <Menu size={16} style={{ color: isDropdownOpen ? 'white' : colors.primary, marginLeft: '2px' }} />
                      <span>MORE</span>
                      <ChevronDown 
                        size={16} 
                        className="transition-transform duration-300 ease-out"
                        style={{ 
                          color: colors.text,
                          transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
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
                      const dropdownTextColor = !isDarkMode ? '#000000' : colors.text;
                      return (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={item.action}
                              className="flex items-center space-x-3 px-4 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap hover:rounded-lg hover:scale-105 active:scale-95 w-full focus:outline-none focus:ring-0"
                              style={{ 
                                color: dropdownTextColor,
                                transform: 'scale(1)',
                                transition: 'all 0.2s ease'
                              } as React.CSSProperties}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.primary + '20';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = dropdownTextColor;
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                              onMouseDown={(e) => {
                                e.currentTarget.style.transform = 'scale(0.95)';
                              }}
                              onMouseUp={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
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

              {!user ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={openLogin}
                    className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-0"
                    style={{
                      color: colors.text,
                      border: `2px solid ${colors.primary}`,
                      backgroundColor: 'transparent',
                      borderRadius: '8px',
                      height: '32px',
                      minWidth: '80px',
                      transform: 'scale(1)',
                      transition: 'all 0.2s ease'
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.backgroundColor = colors.primary + '10';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.95)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                  >
                    LOGIN
                  </button>
                  <button
                    onClick={openSignUp}
                    className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none whitespace-nowrap"
                    style={{
                      backgroundColor: colors.primary,
                      color: 'white',
                      border: `2px solid ${colors.primary}`,
                      borderRadius: '8px',
                      height: '32px',
                      minWidth: '80px',
                    } as React.CSSProperties}
                  >
                    SIGN UP
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="relative flex items-center space-x-2 p-1 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none"
                        style={{
                          backgroundColor: 'transparent',
                        } as React.CSSProperties}
                      >
                        <div className="relative">
                          {/* Profile Image */}
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg ring-2 ring-offset-2 overflow-hidden profile-image-element"
                            style={{
                              '--ring-color': colors.primary,
                              '--ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
                            } as React.CSSProperties}
                          >
                            {/* Show actual profile image when available */}
                            {user?.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => {
                                  // Fallback to gradient if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            
                            {/* Show user icon as fallback when no photo URL or image fails */}
                            {!user?.photoURL && (
                              <div 
                                className="w-full h-full rounded-full flex items-center justify-center"
                                style={{ background: gradient }}
                              >
                                <User size={20} className="text-white" />
                              </div>
                            )}
                          </div>

                          {/* Verified Badge for Subscribers */}
                          {user?.displayName && (
                            <div 
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md verified-badge"
                              style={{
                                backgroundColor: colors.primary,
                                border: `2px solid ${isDarkMode ? '#000000' : colors.primary}`,
                                zIndex: 50,
                                position: 'absolute',
                                bottom: '-4px',
                                right: '-4px',
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
                      className="w-64 p-2 mt-2 shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 ease-out"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      {/* User Info */}
                      <div className="px-3 py-2 mb-2">
                        <p 
                          className="font-black text-sm"
                          style={{ color: !isDarkMode ? '#000000' : colors.text }}
                        >
                          {user?.displayName || user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p 
                          className="text-xs opacity-70"
                          style={{ color: !isDarkMode ? '#000000' : colors.text }}
                        >
                          {user?.email}
                        </p>
                      </div>

                      <DropdownMenuSeparator className="opacity-20" />

                      {/* Profile */}
                      <DropdownMenuItem
                        onClick={() => setShowUserProfile(true)}
                        className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200"
                        style={{
                          color: !isDarkMode ? '#000000' : colors.text,
                        }}
                      >
                        <User size={18} style={{ color: colors.primary }} />
                        <span className="font-semibold">Profile & Settings</span>
                      </DropdownMenuItem>

                      {/* Merchandise */}
                      <DropdownMenuItem
                        onClick={() => setShowMerchandise(true)}
                        className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200"
                        style={{
                          color: !isDarkMode ? '#000000' : colors.text,
                        }}
                      >
                        <ShoppingBag size={18} style={{ color: colors.primary }} />
                        <span className="font-semibold">Merchandise</span>
                      </DropdownMenuItem>

                      {/* Submission Requests */}
                      <DropdownMenuItem
                        onClick={() => setLocation("/profile?section=submissions")}
                        className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200"
                        style={{
                          color: !isDarkMode ? '#000000' : colors.text,
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
                className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 focus:outline-none focus:ring-0"
                style={{ 
                  backgroundColor: isOpen ? colors.primary : 'transparent',
                  color: isOpen ? 'white' : colors.primary,
                  transform: 'scale(1)',
                  transition: 'all 0.2s ease'
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  if (!isOpen) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOpen) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown - Clean Rewrite */}
          {isOpen && (
            <div 
              ref={mobileDropdownRef}
              className="xl:hidden absolute top-full right-4 bg-black/90 backdrop-blur-md border rounded-xl animate-in fade-in-0 slide-in-from-top-2 duration-300 ease-out shadow-xl" 
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
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 hover:scale-105 active:scale-95 no-underline focus:outline-none"
                  style={{ 
                    color: '#ffffff', // Always white text on dark mobile dropdown background
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none',
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  <Music size={20} style={{ color: colors.primary }} />
                  <span>MUSIC</span>
                </a>

                {/* Schedule Link */}
                <a
                  href="/schedule"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 rounded-lg focus:outline-none"
                  style={{ 
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    textDecoration: 'none',
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Calendar size={20} style={{ color: colors.primary }} />
                  <span>SCHEDULE</span>
                </a>

                {/* Merchandise Link */}
                <button
                  onClick={() => setShowMerchandise(true)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 rounded-lg focus:outline-none"
                  style={{ 
                    color: '#ffffff',
                    backgroundColor: 'transparent',
                    textDecoration: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ShoppingBag size={20} style={{ color: colors.primary }} />
                  <span>MERCHANDISE</span>
                </button>

                {/* Support Us Link */}
                <a
                  href="/support"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 hover:scale-105 active:scale-95 no-underline focus:outline-none"
                  style={{ 
                    color: '#ffffff', // Always white text on dark mobile dropdown background
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none',
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  <Heart size={20} style={{ color: colors.primary }} />
                  <span>SUPPORT US</span>
                </a>

                {/* Features Link */}
                <a
                  href="/features"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 hover:scale-105 active:scale-95 no-underline focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    color: '#ffffff', // Always white text on dark mobile dropdown background
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none',
                    '--tw-ring-color': colors.primary,
                    '--tw-ring-offset-color': '#000000',
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  <Heart size={20} style={{ color: colors.primary }} />
                  <span>FEATURES</span>
                </a>

                {/* Listen Map Link */}
                <a
                  href="/map"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 hover:scale-105 active:scale-95 no-underline focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    color: '#ffffff', // Always white text on dark mobile dropdown background
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none',
                    '--tw-ring-color': colors.primary,
                    '--tw-ring-offset-color': '#000000',
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  <MapPin size={20} style={{ color: colors.primary }} />
                  <span>LISTEN MAP</span>
                </a>

                {/* Submissions Link */}
                <a
                  href="/submissions"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 hover:scale-105 active:scale-95 no-underline focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    color: '#ffffff', // Always white text on dark mobile dropdown background
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none',
                    '--tw-ring-color': colors.primary,
                    '--tw-ring-offset-color': '#000000',
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  <Send size={20} style={{ color: colors.primary }} />
                  <span>SUBMISSIONS</span>
                </a>

                {/* Contact Link */}
                <a
                  href="/contact"
                  className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 hover:scale-105 active:scale-95 no-underline focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    color: '#ffffff', // Always white text on dark mobile dropdown background
                    backgroundColor: 'transparent',
                    display: 'flex',
                    textDecoration: 'none',
                    '--tw-ring-color': colors.primary,
                    '--tw-ring-offset-color': '#000000',
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  <Phone size={20} style={{ color: colors.primary }} />
                  <span>CONTACT</span>
                </a>

                {/* Divider */}
                <div className="border-t my-3" style={{ borderColor: colors.primary + '40' }} />

                {/* Authentication Buttons */}
                {!user ? (
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

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full no-underline focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{
                        color: colors.primary,
                        backgroundColor: 'transparent',
                        border: `1px solid ${colors.primary}`,
                        display: 'flex',
                        textDecoration: 'none',
                        '--tw-ring-color': colors.primary,
                        '--tw-ring-offset-color': '#000000',
                      } as React.CSSProperties}
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
              className="font-semibold px-6 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.primary}40`,
                '--tw-ring-color': colors.primary,
                '--tw-ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
              } as React.CSSProperties}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="font-semibold px-6 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: '#EF4444',
                color: 'white',
                border: '1px solid #EF4444',
                '--tw-ring-color': '#EF4444',
                '--tw-ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
              } as React.CSSProperties}
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

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile onClose={() => setShowUserProfile(false)} />
      )}

      {/* Merchandise Modal */}
      {showMerchandise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-7xl max-h-[90vh] overflow-hidden mx-4">
            <div className="bg-white rounded-lg shadow-xl h-full overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Spandex Salvation Merchandise</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowMerchandise(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="overflow-y-auto h-full">
                <Merchandise />
              </div>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}