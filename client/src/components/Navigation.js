import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, User, Calendar, Music, Send, Phone, MapPin, Heart, UserPlus, LogOut, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import MetalThemeSwitcher from "./MetalThemeSwitcher";
import AuthModal from "./AuthModal";
import { useTheme } from "../contexts/ThemeContext";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import MusicLogoPath from "/MusicLogoIcon.png";
export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState("login");
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    useEffect(() => {
        const handleOpenAuthModal = (event) => {
            setAuthMode(event.detail?.mode || "login");
            setIsAuthModalOpen(true);
        };
        window.addEventListener('openAuthModal', handleOpenAuthModal);
        return () => window.removeEventListener('openAuthModal', handleOpenAuthModal);
    }, []);
    const { colors, gradient, toggleTheme, isDarkMode, currentTheme } = useTheme();
    const { user, signOut } = useFirebaseAuth();
    const logout = async () => {
        try {
            await signOut();
            window.location.href = "/";
        }
        catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/";
        }
    };
    const menuRef = useRef(null);
    const dropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);
    const brandTextRef = useRef(null);
    const navRef = useRef(null);
    const [navPosition, setNavPosition] = useState(0);
    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside mobile menu button AND mobile dropdown
            if (isOpen &&
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                mobileDropdownRef.current &&
                !mobileDropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
            // Check if click is outside desktop dropdown
            if (isDropdownOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)) {
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
    const navigateToSection = (sectionId, route) => {
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
        }
        else {
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
    return (_jsxs(TooltipProvider, { children: [_jsx("nav", { className: "fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm transition-colors duration-300 safe-area-inset-top", children: _jsxs("div", { className: "w-full relative", children: [_jsxs("div", { className: "xl:relative flex justify-between items-center h-16", style: { paddingLeft: '15px', paddingRight: '15px' }, children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "flex items-center justify-center w-8 h-8 rounded-full cursor-pointer logo-container", style: {
                                                background: gradient,
                                                padding: '5px'
                                            }, onClick: handleLogoClick, onMouseEnter: (e) => {
                                                const img = e.currentTarget.querySelector('img');
                                                if (img && !img.classList.contains('logo-spin-easter-egg')) {
                                                    img.classList.add('logo-spin-easter-egg');
                                                }
                                            }, children: _jsx("img", { src: MusicLogoPath, alt: "Music Logo", className: "w-full h-full object-contain", onAnimationEnd: (e) => {
                                                    e.currentTarget.classList.remove('logo-spin-easter-egg');
                                                } }) }), _jsxs("div", { className: "flex flex-col", id: "brand-text", ref: brandTextRef, children: [_jsx("div", { className: "text-sm font-black leading-tight transition-colors duration-300", style: {
                                                        color: colors.textMuted
                                                    }, children: "SPANDEX SALVATION" }), _jsx("div", { className: "text-sm font-black leading-tight", style: { color: colors.primary }, children: "RADIO" })] })] }), _jsxs("div", { ref: navRef, className: "hidden xl:flex items-center space-x-4 absolute", style: {
                                        left: `${navPosition}px`,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        transition: 'left 0.3s ease'
                                    }, children: [menuItems.slice(0, 3).map((item) => {
                                            const IconComponent = item.icon;
                                            return (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs("button", { onClick: item.action, className: "flex items-center space-x-2 text-sm font-semibold transition-all duration-200 px-3 py-2 rounded-md hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-0", style: {
                                                                color: colors.text,
                                                                transform: 'scale(1)',
                                                                transition: 'all 0.2s ease'
                                                            }, onMouseEnter: (e) => {
                                                                e.currentTarget.style.backgroundColor = colors.primary + '20';
                                                                e.currentTarget.style.color = 'white';
                                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                            }, onMouseLeave: (e) => {
                                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                                e.currentTarget.style.color = colors.text;
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                            }, onMouseDown: (e) => {
                                                                e.currentTarget.style.transform = 'scale(0.95)';
                                                            }, onMouseUp: (e) => {
                                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                            }, children: [_jsx(IconComponent, { size: 16, style: { color: colors.primary } }), _jsx("span", { children: item.label })] }) }), _jsx(TooltipContent, { side: "bottom", children: item.tooltip })] }, item.id));
                                        }), _jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs("button", { onClick: () => setIsDropdownOpen(!isDropdownOpen), className: "flex items-center space-x-1 text-sm font-semibold transition-all duration-200 px-3 py-2 rounded-md hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-0", style: {
                                                                    color: isDropdownOpen ? 'white' : colors.text,
                                                                    backgroundColor: isDropdownOpen ? colors.primary : 'transparent',
                                                                    transform: 'scale(1)',
                                                                    transition: 'all 0.2s ease'
                                                                }, onMouseEnter: (e) => {
                                                                    if (!isDropdownOpen) {
                                                                        e.currentTarget.style.backgroundColor = colors.primary + '20';
                                                                        e.currentTarget.style.color = 'white';
                                                                        e.currentTarget.style.transform = 'scale(1.05)';
                                                                    }
                                                                }, onMouseLeave: (e) => {
                                                                    if (!isDropdownOpen) {
                                                                        e.currentTarget.style.backgroundColor = isDropdownOpen ? colors.primary : 'transparent';
                                                                        e.currentTarget.style.color = isDropdownOpen ? 'white' : colors.text;
                                                                        e.currentTarget.style.transform = 'scale(1)';
                                                                    }
                                                                }, onMouseDown: (e) => {
                                                                    e.currentTarget.style.transform = 'scale(0.95)';
                                                                }, onMouseUp: (e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                                }, children: [_jsx(Menu, { size: 16, style: { color: isDropdownOpen ? 'white' : colors.primary, marginLeft: '2px' } }), _jsx("span", { children: "MORE" }), _jsx(ChevronDown, { size: 16, className: "transition-transform duration-300 ease-out", style: {
                                                                            color: colors.text,
                                                                            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                                                        } })] }) }), _jsx(TooltipContent, { side: "bottom", children: "View more navigation options" })] }), isDropdownOpen && (_jsx("div", { className: "absolute left-1/2 transform -translate-x-1/2 mt-2 py-2 rounded-xl shadow-xl border animate-in fade-in-0 slide-in-from-top-2 duration-200 backdrop-blur-md", style: {
                                                        backgroundColor: !isDarkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)',
                                                        borderColor: colors.primary + '40',
                                                        width: 'auto',
                                                        minWidth: 'max-content',
                                                        zIndex: 50
                                                    }, children: menuItems.slice(3).map((item) => {
                                                        const IconComponent = item.icon;
                                                        const dropdownTextColor = !isDarkMode ? '#000000' : colors.text;
                                                        return (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs("button", { onClick: item.action, className: "flex items-center space-x-3 px-4 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap hover:rounded-lg hover:scale-105 active:scale-95 w-full focus:outline-none focus:ring-0", style: {
                                                                            color: dropdownTextColor,
                                                                            transform: 'scale(1)',
                                                                            transition: 'all 0.2s ease'
                                                                        }, onMouseEnter: (e) => {
                                                                            e.currentTarget.style.backgroundColor = colors.primary + '20';
                                                                            e.currentTarget.style.color = 'white';
                                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                                        }, onMouseLeave: (e) => {
                                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                                            e.currentTarget.style.color = dropdownTextColor;
                                                                            e.currentTarget.style.transform = 'scale(1)';
                                                                        }, onMouseDown: (e) => {
                                                                            e.currentTarget.style.transform = 'scale(0.95)';
                                                                        }, onMouseUp: (e) => {
                                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                                        }, children: [_jsx(IconComponent, { size: 16, style: { color: colors.primary } }), _jsx("span", { children: item.label })] }) }), _jsx(TooltipContent, { side: "left", align: "center", sideOffset: 5, children: item.tooltip })] }, item.id));
                                                    }) }))] })] }), _jsxs("div", { className: "hidden xl:flex items-center space-x-1 absolute right-4 top-1/2 transform -translate-y-1/2", children: [_jsx(MetalThemeSwitcher, {}), !user ? (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("button", { onClick: openLogin, className: "px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-0", style: {
                                                        color: colors.text,
                                                        border: `2px solid ${colors.primary}`,
                                                        backgroundColor: 'transparent',
                                                        borderRadius: '8px',
                                                        height: '32px',
                                                        minWidth: '80px',
                                                        transform: 'scale(1)',
                                                        transition: 'all 0.2s ease'
                                                    }, onMouseEnter: (e) => {
                                                        e.currentTarget.style.transform = 'scale(1.05)';
                                                        e.currentTarget.style.backgroundColor = colors.primary + '10';
                                                    }, onMouseLeave: (e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }, onMouseDown: (e) => {
                                                        e.currentTarget.style.transform = 'scale(0.95)';
                                                    }, onMouseUp: (e) => {
                                                        e.currentTarget.style.transform = 'scale(1.05)';
                                                    }, children: "LOGIN" }), _jsx("button", { onClick: openSignUp, className: "px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none whitespace-nowrap", style: {
                                                        backgroundColor: colors.primary,
                                                        color: 'white',
                                                        border: `2px solid ${colors.primary}`,
                                                        borderRadius: '8px',
                                                        height: '32px',
                                                        minWidth: '80px',
                                                    }, children: "SIGN UP" })] })) : (_jsx("div", { className: "flex items-center", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs("button", { className: "relative flex items-center space-x-2 p-1 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none", style: {
                                                                backgroundColor: 'transparent',
                                                            }, children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg ring-2 ring-offset-2", style: {
                                                                                background: user?.photoURL
                                                                                    ? `url(${user.photoURL}) center/cover`
                                                                                    : gradient,
                                                                                '--ring-color': colors.primary,
                                                                                '--ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
                                                                            }, children: !user?.photoURL && (_jsx(User, { size: 20, className: "text-white" })) }), user?.displayName && (_jsx("div", { className: "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md", style: {
                                                                                backgroundColor: colors.primary,
                                                                                border: `2px solid ${isDarkMode ? '#000000' : colors.primary}`,
                                                                            }, children: _jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", className: "text-white", children: _jsx("path", { d: "M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) }))] }), _jsx(ChevronDown, { size: 16, className: "transition-transform duration-200", style: { color: colors.text } })] }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-64 p-2 mt-2 shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 ease-out", style: {
                                                            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                                            backdropFilter: 'blur(10px)',
                                                        }, children: [_jsxs("div", { className: "px-3 py-2 mb-2", children: [_jsx("p", { className: "font-black text-sm", style: { color: !isDarkMode ? '#000000' : colors.text }, children: user?.displayName || user?.email?.split('@')[0] || 'User' }), _jsx("p", { className: "text-xs opacity-70", style: { color: !isDarkMode ? '#000000' : colors.text }, children: user?.email })] }), _jsx(DropdownMenuSeparator, { className: "opacity-20" }), _jsxs(DropdownMenuItem, { onClick: () => setLocation("/profile?section=profile"), className: "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200", style: {
                                                                    color: !isDarkMode ? '#000000' : colors.text,
                                                                }, children: [_jsx(User, { size: 18, style: { color: colors.primary } }), _jsx("span", { className: "font-semibold", children: "Profile" })] }), _jsxs(DropdownMenuItem, { onClick: () => setLocation("/profile?section=submissions"), className: "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200", style: {
                                                                    color: !isDarkMode ? '#000000' : colors.text,
                                                                }, children: [_jsx(FileText, { size: 18, style: { color: colors.primary } }), _jsxs("span", { className: "font-semibold", children: ["Submission", _jsx("br", {}), "Requests"] })] }), _jsx(DropdownMenuSeparator, { className: "opacity-20" }), _jsxs(DropdownMenuItem, { onClick: () => setShowLogoutDialog(true), className: "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200", style: {
                                                                    color: '#EF4444',
                                                                }, children: [_jsx(LogOut, { size: 18, className: "text-red-500" }), _jsx("span", { className: "font-semibold", children: "Logout" })] })] })] }) }))] }), _jsxs("div", { className: "xl:hidden flex items-center space-x-3", children: [_jsx(MetalThemeSwitcher, {}), _jsx("button", { ref: menuRef, onClick: () => setIsOpen(!isOpen), className: "p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 focus:outline-none focus:ring-0", style: {
                                                backgroundColor: isOpen ? colors.primary : 'transparent',
                                                color: isOpen ? 'white' : colors.primary,
                                                transform: 'scale(1)',
                                                transition: 'all 0.2s ease'
                                            }, onMouseEnter: (e) => {
                                                if (!isOpen) {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                }
                                            }, onMouseLeave: (e) => {
                                                if (!isOpen) {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }
                                            }, onMouseDown: (e) => {
                                                e.currentTarget.style.transform = 'scale(0.95)';
                                            }, onMouseUp: (e) => {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }, "aria-label": isOpen ? "Close navigation menu" : "Open navigation menu", children: _jsx(Menu, { size: 24 }) })] })] }), isOpen && (_jsx("div", { ref: mobileDropdownRef, className: "xl:hidden absolute top-full right-4 bg-black/90 backdrop-blur-md border rounded-xl animate-in fade-in-0 slide-in-from-top-2 duration-300 ease-out shadow-xl", style: {
                                borderColor: colors.primary + '40',
                                minWidth: '280px',
                                maxWidth: '320px',
                                zIndex: 9999
                            }, children: _jsxs("div", { className: "p-4 space-y-2", children: [_jsxs("a", { href: "/music", className: "flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 hover:scale-105 active:scale-95 no-underline focus:outline-none", style: {
                                            color: '#ffffff', // Always white text on dark mobile dropdown background
                                            backgroundColor: 'transparent',
                                            display: 'flex',
                                            textDecoration: 'none',
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = colors.primary + '20';
                                            e.currentTarget.style.color = 'white';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#ffffff';
                                        }, children: [_jsx(Music, { size: 20, style: { color: colors.primary } }), _jsx("span", { children: "MUSIC" })] }), _jsxs("a", { href: "/schedule", className: "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 rounded-lg focus:outline-none", style: {
                                            color: '#ffffff',
                                            backgroundColor: 'transparent',
                                            textDecoration: 'none',
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = colors.primary + '20';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }, children: [_jsx(Calendar, { size: 20, style: { color: colors.primary } }), _jsx("span", { children: "SCHEDULE" })] }), _jsxs("a", { href: "/support", className: "flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 hover:scale-105 active:scale-95 no-underline focus:outline-none", style: {
                                            color: '#ffffff', // Always white text on dark mobile dropdown background
                                            backgroundColor: 'transparent',
                                            display: 'flex',
                                            textDecoration: 'none',
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = colors.primary + '20';
                                            e.currentTarget.style.color = 'white';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#ffffff';
                                        }, children: [_jsx(Heart, { size: 20, style: { color: colors.primary } }), _jsx("span", { children: "SUPPORT US" })] }), _jsxs("a", { href: "/features", className: "flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 hover:scale-105 active:scale-95 no-underline focus:outline-none focus:ring-2 focus:ring-offset-2", style: {
                                            color: '#ffffff', // Always white text on dark mobile dropdown background
                                            backgroundColor: 'transparent',
                                            display: 'flex',
                                            textDecoration: 'none',
                                            '--tw-ring-color': colors.primary,
                                            '--tw-ring-offset-color': '#000000',
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = colors.primary + '20';
                                            e.currentTarget.style.color = 'white';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#ffffff';
                                        }, children: [_jsx(Heart, { size: 20, style: { color: colors.primary } }), _jsx("span", { children: "FEATURES" })] }), _jsxs("a", { href: "/map", className: "flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 hover:scale-105 active:scale-95 no-underline focus:outline-none focus:ring-2 focus:ring-offset-2", style: {
                                            color: '#ffffff', // Always white text on dark mobile dropdown background
                                            backgroundColor: 'transparent',
                                            display: 'flex',
                                            textDecoration: 'none',
                                            '--tw-ring-color': colors.primary,
                                            '--tw-ring-offset-color': '#000000',
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = colors.primary + '20';
                                            e.currentTarget.style.color = 'white';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#ffffff';
                                        }, children: [_jsx(MapPin, { size: 20, style: { color: colors.primary } }), _jsx("span", { children: "LISTEN MAP" })] }), _jsxs("a", { href: "/submissions", className: "flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 hover:scale-105 active:scale-95 no-underline focus:outline-none focus:ring-2 focus:ring-offset-2", style: {
                                            color: '#ffffff', // Always white text on dark mobile dropdown background
                                            backgroundColor: 'transparent',
                                            display: 'flex',
                                            textDecoration: 'none',
                                            '--tw-ring-color': colors.primary,
                                            '--tw-ring-offset-color': '#000000',
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = colors.primary + '20';
                                            e.currentTarget.style.color = 'white';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#ffffff';
                                        }, children: [_jsx(Send, { size: 20, style: { color: colors.primary } }), _jsx("span", { children: "SUBMISSIONS" })] }), _jsxs("a", { href: "/contact", className: "flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full hover:bg-opacity-20 hover:scale-105 active:scale-95 no-underline focus:outline-none focus:ring-2 focus:ring-offset-2", style: {
                                            color: '#ffffff', // Always white text on dark mobile dropdown background
                                            backgroundColor: 'transparent',
                                            display: 'flex',
                                            textDecoration: 'none',
                                            '--tw-ring-color': colors.primary,
                                            '--tw-ring-offset-color': '#000000',
                                        }, onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = colors.primary + '20';
                                            e.currentTarget.style.color = 'white';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#ffffff';
                                        }, children: [_jsx(Phone, { size: 20, style: { color: colors.primary } }), _jsx("span", { children: "CONTACT" })] }), _jsx("div", { className: "border-t my-3", style: { borderColor: colors.primary + '40' } }), !user ? (_jsxs(_Fragment, { children: [_jsxs("div", { onClick: () => {
                                                    setTimeout(() => {
                                                        setAuthMode("login");
                                                        setIsAuthModalOpen(true);
                                                    }, 100);
                                                    setIsOpen(false);
                                                }, className: "flex items-center justify-center space-x-3 px-6 py-3 text-sm font-bold rounded-full transition-all duration-300 w-full cursor-pointer shadow-lg", style: {
                                                    color: 'white',
                                                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
                                                    border: 'none',
                                                    transform: 'scale(1)'
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.boxShadow = `0 8px 25px -8px ${colors.primary}60`;
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px -4px rgba(0,0,0,0.2)';
                                                }, children: [_jsx(User, { size: 18, style: { color: 'white' } }), _jsx("span", { children: "LOGIN" })] }), _jsxs("div", { onClick: () => {
                                                    setTimeout(() => {
                                                        setAuthMode("register");
                                                        setIsAuthModalOpen(true);
                                                    }, 100);
                                                    setIsOpen(false);
                                                }, className: "flex items-center justify-center space-x-3 px-6 py-3 text-sm font-bold rounded-full transition-all duration-300 w-full cursor-pointer shadow-lg", style: {
                                                    color: colors.primary,
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    border: `2px solid ${colors.primary}`,
                                                    backdropFilter: 'blur(10px)',
                                                    transform: 'scale(1)'
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.background = `${colors.primary}15`;
                                                    e.currentTarget.style.boxShadow = `0 8px 25px -8px ${colors.primary}40`;
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px -4px rgba(0,0,0,0.2)';
                                                }, children: [_jsx(UserPlus, { size: 18, style: { color: colors.primary } }), _jsx("span", { children: "SIGN UP" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("a", { href: "/profile", className: "flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full no-underline", style: {
                                                    color: colors.text,
                                                    backgroundColor: colors.primary + '20',
                                                    display: 'flex',
                                                    textDecoration: 'none'
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.backgroundColor = colors.primary + '30';
                                                    e.currentTarget.style.color = 'white';
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                                                    e.currentTarget.style.color = colors.text;
                                                }, children: [_jsx(User, { size: 16, style: { color: colors.primary } }), _jsx("span", { children: "PROFILE" })] }), _jsxs("button", { onClick: handleLogout, className: "flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full no-underline focus:outline-none focus:ring-2 focus:ring-offset-2", style: {
                                                    color: colors.primary,
                                                    backgroundColor: 'transparent',
                                                    border: `1px solid ${colors.primary}`,
                                                    display: 'flex',
                                                    textDecoration: 'none',
                                                    '--tw-ring-color': colors.primary,
                                                    '--tw-ring-offset-color': '#000000',
                                                }, onMouseEnter: (e) => {
                                                    e.currentTarget.style.backgroundColor = colors.primary + '20';
                                                    e.currentTarget.style.color = 'white';
                                                }, onMouseLeave: (e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = colors.primary;
                                                }, children: [_jsx(LogOut, { size: 16, style: { color: colors.primary } }), _jsx("span", { children: "SIGN OUT" })] })] }))] }) }))] }) }), _jsx(AlertDialog, { open: showLogoutDialog, onOpenChange: setShowLogoutDialog, children: _jsxs(AlertDialogContent, { className: "max-w-md animate-in fade-in zoom-in duration-300", style: {
                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        border: `2px solid ${colors.primary}40`,
                    }, children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { className: "text-xl font-black", style: { color: colors.text }, children: "Confirm Logout" }), _jsx(AlertDialogDescription, { className: "text-base", style: { color: colors.text, opacity: 0.8 }, children: "Are you sure you want to log out of your account?" })] }), _jsxs(AlertDialogFooter, { className: "flex gap-3", children: [_jsx(AlertDialogCancel, { className: "font-semibold px-6 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2", style: {
                                        backgroundColor: 'transparent',
                                        color: colors.text,
                                        border: `1px solid ${colors.primary}40`,
                                        '--tw-ring-color': colors.primary,
                                        '--tw-ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
                                    }, children: "Cancel" }), _jsx(AlertDialogAction, { onClick: handleLogout, className: "font-semibold px-6 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2", style: {
                                        backgroundColor: '#EF4444',
                                        color: 'white',
                                        border: '1px solid #EF4444',
                                        '--tw-ring-color': '#EF4444',
                                        '--tw-ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
                                    }, children: "Logout" })] })] }) }), _jsx(AuthModal, { isOpen: isAuthModalOpen, onClose: () => setIsAuthModalOpen(false), initialMode: authMode })] }));
}
