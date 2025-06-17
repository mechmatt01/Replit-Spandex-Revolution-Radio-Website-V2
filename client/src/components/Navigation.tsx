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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-metal-orange to-metal-red rounded-lg flex items-center justify-center">
              <Radio className="text-white h-5 w-5" />
            </div>
            <div className="flex items-center">
              <h1 className="font-orbitron font-bold text-lg text-metal-orange leading-none">
                <span className="hidden sm:inline">SPANDEX SALVATION <span className="text-gray-400">RADIO</span></span>
                <span className="sm:hidden flex flex-col">
                  <span>SPANDEX SALVATION</span>
                  <span className="text-gray-400 text-sm">RADIO</span>
                </span>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center nav-spacing">
            <button onClick={() => scrollToSection("home")} className="text-foreground font-semibold hover:text-metal-orange transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection("about")} className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection("schedule")} className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors">
              Schedule
            </button>
            <button onClick={() => scrollToSection("submissions")} className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors">
              Submissions
            </button>
            <button onClick={() => scrollToSection("contact")} className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors">
              Contact
            </button>
            <button onClick={() => scrollToSection("merch")} className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors">
              Merch
            </button>
            <button onClick={() => scrollToSection("subscribe")} className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors">
              Subscribe
            </button>
          </div>

          {/* Right Side Controls - Mobile Menu Only */}
          <div className="flex items-center space-x-4">
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
                Home
              </button>
              <button onClick={() => scrollToSection("about")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                About
              </button>
              <button onClick={() => scrollToSection("schedule")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                Schedule
              </button>
              <button onClick={() => scrollToSection("submissions")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                Submissions
              </button>
              <button onClick={() => scrollToSection("contact")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                Contact
              </button>
              <button onClick={() => scrollToSection("merch")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                Merch
              </button>
              <button onClick={() => scrollToSection("subscribe")} className="block px-3 py-2 text-muted-foreground font-semibold hover:text-metal-orange transition-colors w-full text-left">
                Subscribe
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
