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
      <div className="w-full">
        <div className="flex items-center justify-between h-16" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg overflow-hidden p-1.5"
              style={{ 
                background: getGradient()
              }}
            >
              <img 
                src={MusicLogoPath} 
                alt="Music Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center">
              <h1 className="font-orbitron font-bold text-lg text-metal-orange leading-tight">
                <span className="flex flex-col">
                  <span>SPANDEX SALVATION</span>
                  <span className="text-gray-400 text-sm">RADIO</span>
                </span>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation - Responsive breakpoints */}
          <div className="hidden xl:flex items-center justify-center flex-1" style={{ marginLeft: '10px' }}>
            <div className="flex items-center gap-6 lg:gap-8">
              <button onClick={() => scrollToSection("home")} className="text-foreground font-semibold hover:text-metal-orange transition-colors">
                HOME
              </button>
              <Link href="/music" className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors">
                MUSIC
              </Link>
              <button onClick={() => scrollToSection("schedule")} className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors">
                SCHEDULE
              </button>
              <button onClick={() => scrollToSection("submissions")} className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors">
                SUBMISSIONS
              </button>
              <button onClick={() => scrollToSection("contact")} className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors">
                CONTACT
              </button>
              <button onClick={() => scrollToSection("merch")} className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors">
                MERCH
              </button>
              <button onClick={() => scrollToSection("subscribe")} className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors" style={{ marginRight: '15px' }}>
                SUBSCRIBE
              </button>
            </div>
          </div>

          {/* Right Side Controls - Mobile Menu & Metal Theme Switcher */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden hover:bg-opacity-20"
              style={{
                color: colors.text,
                backgroundColor: isOpen ? `${colors.primary}20` : 'transparent'
              }}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X style={{ color: colors.primary }} /> : <Menu style={{ color: colors.primary }} />}
            </Button>
            <MetalThemeSwitcher />
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        {isOpen && (
          <div className="xl:hidden fixed inset-0 z-40 top-16" onClick={() => setIsOpen(false)}>
            {/* Background Blur Overlay */}
            <div 
              className="absolute inset-0 backdrop-blur-lg transition-all duration-300"
              style={{ 
                backgroundColor: `${colors.background}60`,
                backdropFilter: 'blur(12px)'
              }}
            />
            
            {/* Menu Content */}
            <div 
              className="relative z-50 rounded-2xl m-4 p-6 shadow-2xl backdrop-blur-sm"
              style={{ 
                backgroundColor: `${colors.surface}95`,
                border: `1px solid ${colors.border}50`,
                boxShadow: `0 25px 50px -12px ${colors.primary}20`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    scrollToSection("home");
                    setIsOpen(false);
                  }} 
                  className="block w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-lg"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`;
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  HOME
                </button>
                <Link 
                  href="/music" 
                  className="block w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-lg" 
                  onClick={() => setIsOpen(false)}
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`;
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  MUSIC
                </Link>
                <button 
                  onClick={() => {
                    scrollToSection("schedule");
                    setIsOpen(false);
                  }} 
                  className="block w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-lg"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`;
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
                  onClick={() => {
                    scrollToSection("submissions");
                    setIsOpen(false);
                  }} 
                  className="block w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-lg"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`;
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
                  onClick={() => {
                    scrollToSection("contact");
                    setIsOpen(false);
                  }} 
                  className="block w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-lg"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`;
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
                  onClick={() => {
                    scrollToSection("merch");
                    setIsOpen(false);
                  }} 
                  className="block w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-lg"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`;
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
                  onClick={() => {
                    scrollToSection("subscribe");
                    setIsOpen(false);
                  }} 
                  className="block w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-lg"
                  style={{ 
                    color: colors.text,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`;
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
          </div>
        )}
      </div>
    </nav>
  );
}
