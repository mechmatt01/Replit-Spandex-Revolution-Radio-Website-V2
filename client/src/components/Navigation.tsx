import { useState } from "react";
import { Menu, X, Radio } from "lucide-react";
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
    <nav className="sticky top-0 z-50 bg-card/80 border-b border-border backdrop-blur-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-metal-orange to-metal-red rounded-lg flex items-center justify-center">
              <Radio className="text-white text-lg" />
            </div>
            <div>
              <h1 className="font-orbitron font-bold text-lg text-metal-orange">SPANDEX SALVATION</h1>
              <p className="text-xs text-gray-400 -mt-1">RADIO</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection("home")} className="text-white hover:text-metal-orange transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection("about")} className="text-gray-300 hover:text-metal-orange transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection("schedule")} className="text-gray-300 hover:text-metal-orange transition-colors">
              Schedule
            </button>
            <button onClick={() => scrollToSection("submissions")} className="text-gray-300 hover:text-metal-orange transition-colors">
              Submissions
            </button>
            <button onClick={() => scrollToSection("contact")} className="text-gray-300 hover:text-metal-orange transition-colors">
              Contact
            </button>
            <button onClick={() => scrollToSection("merch")} className="text-gray-300 hover:text-metal-orange transition-colors">
              Merch
            </button>
            <button onClick={() => scrollToSection("subscribe")} className="text-gray-300 hover:text-metal-orange transition-colors">
              Subscribe
            </button>
          </div>

          {/* Live Stream Control */}
          <div className="flex items-center space-x-4">
            <Button 
              onClick={togglePlayback}
              className="bg-metal-orange hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 animate-glow"
            >
              <Radio className="mr-2 h-4 w-4" />
              {isPlaying ? "PAUSE" : "TUNE IN LIVE"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-dark-border bg-dark-surface">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button onClick={() => scrollToSection("home")} className="block px-3 py-2 text-gray-300 hover:text-metal-orange transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection("about")} className="block px-3 py-2 text-gray-300 hover:text-metal-orange transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection("schedule")} className="block px-3 py-2 text-gray-300 hover:text-metal-orange transition-colors">
                Schedule
              </button>
              <button onClick={() => scrollToSection("submissions")} className="block px-3 py-2 text-gray-300 hover:text-metal-orange transition-colors">
                Submissions
              </button>
              <button onClick={() => scrollToSection("contact")} className="block px-3 py-2 text-gray-300 hover:text-metal-orange transition-colors">
                Contact
              </button>
              <button onClick={() => scrollToSection("merch")} className="block px-3 py-2 text-gray-300 hover:text-metal-orange transition-colors">
                Merch
              </button>
              <button onClick={() => scrollToSection("subscribe")} className="block px-3 py-2 text-gray-300 hover:text-metal-orange transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
