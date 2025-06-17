import { useState } from "react";
import { Menu, X, Radio, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { togglePlayback, isPlaying } = useAudio();

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
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C7.589 2 4 5.589 4 10v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-4.411-3.589-8-8-8zm6 16H6v-8c0-3.309 2.691-6 6-6s6 2.691 6 6v8z"/>
                <rect x="6" y="12" width="12" height="3" rx="0.5"/>
                <circle cx="9" cy="16" r="2"/>
                <circle cx="20" cy="6" r="1.5"/>
                <path d="M16 6l3-3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
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
              onClick={() => {}}
              className="hidden lg:block w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card/90"
              aria-label="Toggle theme"
            >
              <div className="w-5 h-5 bg-metal-orange rounded-full ml-[3px] mr-[3px] mt-[0px] mb-[0px] pt-[2px] pb-[2px]"></div>
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
