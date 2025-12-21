import ThemeModal from "./ThemeModal";
import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, User, Calendar, Music, Send, Phone, MapPin, Heart, UserPlus, LogOut, CreditCard, ShoppingBag } from "lucide-react";
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
// import MetalThemeSwitcher from "./MetalThemeSwitcher";
import AuthModal from "./AuthModal";
import UserProfile from "./UserProfile";
import { useTheme } from "../contexts/ThemeContext";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import MusicLogoPath from "/MusicLogoIcon.png";
import VUNeedle from "./VUNeedle";
import VUMeterImage from "./VUMeterImage";
import VUMeterFace from "../assets/vumeter.png";
import { useStereoVU } from "../hooks/useStereoVU";
import toggleUp from "@/assets/ui/toggle_up.svg";
import toggleDown from "@/assets/ui/toggle_down.svg";
import { NowPlayingText } from "./NowPlayingText";
import React from "react";

// ==== SSR Amp Panel Assets ====
import panelBg from "../assets/ui/panel_bg.png";
import knobSvg from "../assets/ui/knob.svg";
import ledOn from "../assets/ui/led_red_on.svg";
import ledOff from "../assets/ui/led_red_off.svg";
import toggleBase from "../assets/ui/toggle_base.svg";
import toggleHandle from "../assets/ui/toggle_handle.svg";
import pillNow from "../assets/ui/pill_nowplaying.png";
import pillNext from "../assets/ui/pill_upcoming.png";


/* =========================================
   ROTARY KNOB (SVG rotation + drag control)
   ========================================= */
type KnobProps = {
  size?: number;
  imgSrc: string;
  value: number;
  onChange: (v: number) => void;
  minDeg?: number;
  maxDeg?: number;
  label?: string;
  onDoubleClick?: () => void;
};

function RotKnob({
  size = 30,
  imgSrc,
  value,
  onChange,
  minDeg = -115,
  maxDeg = 120,
  label,
  onDoubleClick
  
}: KnobProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const deg = minDeg + (maxDeg - minDeg) * value;

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  React.useEffect(() => {
    if (!dragging) return;

    const handleMove = (ev: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const tp = (ev as TouchEvent).touches?.[0];
      const x = tp?.clientX ?? (ev as MouseEvent).clientX;
      const y = tp?.clientY ?? (ev as MouseEvent).clientY;

      const angle = Math.atan2(y - cy, x - cx);
      const degFromTop = (angle * 180) / Math.PI - 90;
      const clamped = Math.max(minDeg, Math.min(maxDeg, degFromTop));
      const v = (clamped - minDeg) / (maxDeg - minDeg);
      onChange(Number.isFinite(v) ? v : 0);
    };

    const stop = () => setDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove as any);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };
  }, [dragging, minDeg, maxDeg, onChange]);

  return (
    <div className="flex flex-col items-center select-none">
      <div
        ref={ref}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        onDoubleClick={onDoubleClick}
        className="relative hover:drop-shadow-[0_0_8px_rgba(255,0,0,.35)]"
        style={{
          width: size,
          height: size,
          transform: `rotate(${deg}deg)`,
          transition: dragging ? "none" : "transform 120ms ease-out",
          cursor: "grab",
        }}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={Number(value.toFixed(2))}
        aria-label={label || "knob"}
      >
        <img src={imgSrc} alt={label || "knob"} className="pointer-events-none w-full h-full" />
      </div>
      {label && (
        <div className="mt-1 text-[10px] uppercase tracking-widest text-white/80">{label}</div>
      )}
    </div>
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

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
  // const brandTextRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [navPosition, setNavPosition] = useState<number>(0);
// 🎧 Audio + VU Meters
const AUDIO_SRC = "https://streams.radio.co/sb88c742f0/listen";
const audioRef = useRef<HTMLAudioElement | null>(null);
const [levelL, levelR] = useStereoVU(audioRef.current);
// Power control for radio playback
const [isPowered, setIsPowered] = useState(false);
const [volume, setVolume] = useState(0.9);

const togglePower = () => {
	   console.log("TOGGLE CLICKED. isPowered was:", isPowered);
	     // 1) Flip UI immediately so the handle/LED update no matter what
  setIsPowered(p => !p);
 // 2) Then try to start/stop audio, but never block the UI
  const audio = audioRef.current;
  if (!audio) return;

  if (!isPowered) {
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(err => console.warn("audio.play() rejected:", err));
    }
  } else {
    audio.pause();
  }
};

// === Amp Panel Knobs ===
const [kSchedule, setKSchedule] = useState(0.5);
const [kMerch, setKMerch] = useState(0.6);
const [kArchives, setKArchives] = useState(0.4);
const [kLogin, setKLogin] = useState(0.7);

// Apply volume to hidden player
useEffect(() => {
   if (audioRef.current) audioRef.current.volume = volume;
}, [volume]);

// --- Keyboard Volume Control ------------------------------
useEffect(() => {
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  const step = 0.04;  // tweak up/down sensitivity

  const onKeyDown = (e: KeyboardEvent) => {
    // ignore edits in input fields
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setVolume(v => clamp(v + step));
    } 
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setVolume(v => clamp(v - step));
    }
  };

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, []);
// -----------------------------------------------------------

// ===== Toggle Handle Geometry =====
const TOGGLE_SIZE = 20;
const HANDLE_OFFSETS = {
  up:   { x: 0.37, y: -7.5},   // ON position
  down: { x: 0.37, y: 8.5 },   // OFF position
};

const { x, y } = isPowered ? HANDLE_OFFSETS.up : HANDLE_OFFSETS.down;

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
<nav
 className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm transition-colors duration-300 safe-area-inset-top"  style={{
    backgroundColor: "#cfd3d6", // very light fallback so you SEE it change
    backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.65)), url('/textures/nav-steel-light.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    // 👇 turn OFF blending so the image shows 1:1
    backgroundBlendMode: "normal",
    borderBottom: "1px solid rgba(255,87,34,0.25)",
    boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
  }}
>






        <div className="w-full relative">
          <div className="xl:relative flex justify-between items-center h-16" style={{ paddingLeft: '15px', paddingRight: '15px' }}>

{/* LEFT VU */}
<div className="flex items-center absolute left-4 top-1/2 -translate-y-1/2 z-20">
  <VUMeterImage imgSrc={VUMeterFace} size={75} level={levelL} glow />
</div>

{/* ===== Center: Now Pill | Amp Panel | Next Pill ===== */}
<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center gap-6 max-w-[min(1180px,calc(100%-260px))]">

  {/* NOW PLAYING PILL */}
  <div className="hidden sm:block relative" style={{ width: 325, height: 55 }}>
<img src={pillNow} className="w-full h-full rounded-[15px] pointer-events-none" />    
<div className="absolute inset-0 flex flex-col items-center justify-center">
<div className="text-[10px] tracking-[0.28em] uppercase text-white/80 mb-[2px]">        Now Playing
      </div>
<div id="nowPlayingText" className="text-sm font-semibold text-white px-3 truncate max-w-[290px]">        Sweet Oblivion — Crashdïet
      </div>
    </div>
  </div>

{/* AMP PANEL */}
<div
className="relative"  style={{ width: 450, height: 55 }}
>
  {/* Panel background (with ticks/labels baked in) */}
  <img
    src={panelBg}
    alt="Amp Panel"
    className="absolute inset-0 w-full h-full pointer-events-none"
	draggable={false}
  />

  {/* Power LED */}
  <img
    src={isPowered ? ledOn : ledOff}
    alt=""
    className="absolute"
    style={{
      left: 16,
      top: 22,
      width: 16,
      height: 16,
      filter: isPowered ? "drop-shadow(0 0 6px rgba(255,0,0,.7))" : "none",
    }}
  />

  {/* === POWER TOGGLE === */}
<div                      /* (A) toggle container */
  className="absolute"
  style={{ left: 43, top: 10, width: 30, height: 30, zIndex: 20, pointerEvents: "auto" }}
>
  {/* base (non-clickable) */}
  <img
    src={toggleBase}
    className="absolute inset-0 w-full h-full pointer-events-none select-none"
    style={{ filter: "brightness(0.85)" }}
    draggable={false}
  />

  {/* clickable handle wrapper (bigger hitbox) */}
<div
  id="power-toggle"
  onClick={togglePower}
  role="button"
  aria-pressed={isPowered}
  tabIndex={0}
  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePower(); }
  }}
  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 outline-none focus:outline-none"
  style={{ width: 36, height: 36, cursor: "pointer", zIndex: 50 }}
>
  {/* actual handle image */}
  <img
    src={isPowered ? toggleUp : toggleDown}
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
    style={{
      width: TOGGLE_SIZE,
      height: TOGGLE_SIZE,
      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      transition: "transform 150ms ease-out",
      filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.6))",
    }}
    alt="Power toggle"
    draggable={false}
  />
</div>
</div> {/* <-- closes the toggle container started on line 486 */}



  {/* Rotating knobs */}
  <div className="absolute" style={{ left: 125.5, top: 11 }}>
    <RotKnob imgSrc={knobSvg} value={volume} onChange={setVolume} />  
  </div>
  <div className="absolute" style={{ left: 180.5, top: 11 }}>
    <RotKnob
      imgSrc={knobSvg}
      value={kSchedule}
      onChange={setKSchedule}
      //label="Schedule"
      onDoubleClick={() => window.location.assign("/schedule")}
    />
  </div>
  <div className="absolute" style={{ left: 235.5, top: 11 }}>
    <RotKnob
      imgSrc={knobSvg}
      value={kMerch}
      onChange={setKMerch}
      //label="Merch"
      onDoubleClick={() => window.location.assign("/merch")}
    />
  </div>
  <div className="absolute" style={{ left: 290.5, top: 11 }}>
    <RotKnob
      imgSrc={knobSvg}
      value={kArchives}
      onChange={setKArchives}
      //label="Archives"
      onDoubleClick={() => window.location.assign("/archives")}
    />
  </div>
  <div className="absolute" style={{ left: 346, top: 11 }}>
    <RotKnob
      imgSrc={knobSvg}
      value={kLogin}
      onChange={setKLogin}
      //label="Login"
      onDoubleClick={() => window.location.assign("/login")}
    />
  </div>

{/* Peak LED */}
{/*
<span
  className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full transition-colors ${
    Math.max(levelL ?? 0, levelR ?? 0) > 0.78
      ? "bg-amber-400 shadow-[0_0_8px_2px_rgba(255,193,7,.6)]"
      : "bg-gray-600"
  }`}
  title="Peak"
/>
*/}




</div>
  {/* NEXT UP PILL */}
  <div className="hidden sm:block relative" style={{ width: 325, height: 55 }}>
<img src={pillNext} className="w-full h-full rounded-[15px] pointer-events-none" />    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="text-[10px] tracking-[0.28em] uppercase text-white/80 mb-[2px]">Next Up</div>
<div id="nextUpText" className="text-sm font-semibold text-white px-3 truncate max-w-[290px]">“Leather Saints” — Wildstreet</div>    </div>
  </div>
</div>



{/* RIGHT VU */}
<div className="flex items-center absolute right-4 top-1/2 -translate-y-1/2 z-20">  
<VUMeterImage imgSrc={VUMeterFace} size={75} level={levelR} glow />
</div>

			 {/* Logo & Brand - Left side */}
			 {/*           
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
			 */}

            {/* Desktop Navigation - Centered — hidden */}
{false && (
  <div
    ref={navRef}
    className="hidden xl:flex items-center absolute"
    style={{ left: `${navPosition}px`, top: '50%', transform: 'translateY(-50%)' }}
  >
    {/* existing menu mapping + dropdown */}
  </div>
)}


            {/* Desktop Right Side Controls — hidden */}
{false && (
  <div className="hidden xl:flex items-center space-x-1 absolute right-4 top-1/2 transform -translate-y-1/2">
    {/* <MetalThemeSwitcher /> */}

    {!user ? (
      <div className="flex items-center space-x-3">
        {/* LOGIN / SIGN UP buttons... */}
      </div>
    ) : (
      <div className="flex items-center">
        {/* Dropdown, profile, logout... */}
      </div>
    )}
  </div>
)}
		
            {/* Mobile Controls */}
            <div className="xl:hidden flex items-center space-x-3">
			{/* <MetalThemeSwitcher /> */}
              <button
                ref={menuRef}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 focus:outline-none focus:ring-0"
                style={{ 
                 backgroundColor: 'transparent',
                 color: 'inherit',
                 transform: 'scale(1)',
                 transition: 'all 0.2s ease',
                 border: '2px solid #ff2a2a',
                 borderRadius: '8px',
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
                <Menu size={24} style={{ color: '#ff2a2a' }} />
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

                {/* Past Orders Link */}
                <button
                  onClick={() => setShowUserProfile(true)}
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
                  <span>PAST ORDERS</span>
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
                    <button
                      onClick={() => setShowUserProfile(true)}
                      className="flex items-center space-x-3 px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 w-full no-underline focus:outline-none"
                      style={{
                        color: colors.text,
                        backgroundColor: colors.primary + '20',
                        display: 'flex',
                        textDecoration: 'none',
                        border: 'none',
                        cursor: 'pointer'
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
		
		
		{/* Hidden player feeding the VU meters */}
<audio
  ref={audioRef}
  id="ssr-player"
  // src="/audio/test.mp3"  // test meters
  src={AUDIO_SRC}
  crossOrigin="anonymous"
  preload="auto"
  controls
  // style={{ position: "fixed", bottom: 10, left: 10, zIndex: 9999 }}
  style={{ display: "none" }}
/>

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
    </TooltipProvider>
  );

}