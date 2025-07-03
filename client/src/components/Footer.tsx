import { Radio } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import MusicLogoPath from "@assets/MusicLogoIcon@3x.png";

export default function Footer() {
  const { colors, gradient } = useTheme();
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-card py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{ 
                  background: gradient,
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
            <p className="text-muted-foreground text-sm">
              Your home for old-school metal music. Broadcasting the rebellion
              since 2025.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("hero")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block p-0 m-0 bg-transparent border-0"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("schedule")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block p-0 m-0 bg-transparent border-0"
                >
                  Schedule
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("submissions")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block p-0 m-0 bg-transparent border-0"
                >
                  Submissions
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block p-0 m-0 bg-transparent border-0"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("subscription")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block p-0 m-0 bg-transparent border-0"
                >
                  Subscribe
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => window.location.href = "/help"}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block p-0 m-0 bg-transparent border-0"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block p-0 m-0 bg-transparent border-0"
                >
                  Technical Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("submissions")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block p-0 m-0 bg-transparent border-0"
                >
                  Submit Songs
                </button>
              </li>
              <li>
                <button
                  onClick={() => window.location.href = "/guidelines"}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block p-0 m-0 bg-transparent border-0"
                >
                  Community Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => window.location.href = "/privacy"}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block p-0 m-0 bg-transparent border-0"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Stream Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Stream Info</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <div className="text-muted-foreground flex items-center">
                  <span className="text-metal-orange mr-3 flex-shrink-0">
                    <Radio className="h-4 w-4" />
                  </span>
                  <span className="-ml-7">24/7 Live Stream</span>
                </div>
              </li>
              <li>
                <div className="text-muted-foreground flex items-center">
                  <span className="text-metal-orange mr-3 flex-shrink-0 text-center w-4">♪</span>
                  <span className="-ml-7">320kbps Quality</span>
                </div>
              </li>
              <li>
                <div className="text-muted-foreground flex items-center">
                  <span className="text-metal-orange mr-3 flex-shrink-0 text-center w-4">🌍</span>
                  <span className="-ml-7">Global Coverage</span>
                </div>
              </li>
              <li>
                <div className="text-muted-foreground flex items-center">
                  <span className="text-metal-orange mr-3 flex-shrink-0 text-center w-4">🛡️</span>
                  <span className="-ml-7">Secure & Reliable</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="text-sm text-muted-foreground font-semibold mb-4 md:mb-0 flex items-center">
              © 2025 Spandex Salvation Radio. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <a
                href="/terms"
                className="font-semibold hover:text-metal-orange transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                className="font-semibold hover:text-metal-orange transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/cookies"
                className="font-semibold hover:text-metal-orange transition-colors"
              >
                Cookies
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const event = new CustomEvent("openAuthModal", {
                    detail: { mode: "admin" },
                  });
                  window.dispatchEvent(event);
                }}
                className="font-semibold hover:text-metal-orange transition-colors"
              >
                Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}