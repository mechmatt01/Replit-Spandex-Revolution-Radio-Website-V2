import { useState } from "react";
import { Menu, X, Radio, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";
import { useTheme } from "@/contexts/ThemeContext";
import RadioLogoPath from "@assets/RadioLogo_1750204824630.png";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { togglePlayback, isPlaying } = useAudio();
  const { theme, toggleTheme } = useTheme();

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
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden" style={{ padding: '5px' }}>
              <img 
                src={RadioLogoPath} 
                alt="Radio Logo" 
                className="w-full h-full object-cover"
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

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center flex-1" style={{ marginLeft: '10px' }}>
            <div className="flex items-center gap-8">
              <button onClick={() => scrollToSection("home")} className="text-foreground font-semibold hover:text-metal-orange transition-colors">
                HOME
              </button>
              <button onClick={() => scrollToSection("about")} className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors">
                ABOUT
              </button>
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

          {/* Right Side Controls - Theme Toggle and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden lg:block w-12 h-12 rounded-full bg-orange-500/20 hover:bg-orange-500/30 border-2 border-orange-500"
              aria-label="Toggle theme"
              title={`Current theme: ${theme}`}
            >
              {theme === "dark" ? (
                <Sun size={24} color="#ff6633" fill="#ff6633" strokeWidth={2} />
              ) : (
                <Moon size={24} color="#ff6633" fill="#ff6633" strokeWidth={2} />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-card/95 backdrop-blur-sm transition-colors duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button onClick={() => scrollToSection("home")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                HOME
              </button>
              <button onClick={() => scrollToSection("about")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                ABOUT
              </button>
              <button onClick={() => scrollToSection("schedule")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                SCHEDULE
              </button>
              <button onClick={() => scrollToSection("submissions")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                SUBMISSIONS
              </button>
              <button onClick={() => scrollToSection("contact")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                CONTACT
              </button>
              <button onClick={() => scrollToSection("merch")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                MERCH
              </button>
              <button onClick={() => scrollToSection("subscribe")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                SUBSCRIBE
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
