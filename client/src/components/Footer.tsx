
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
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("schedule")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block"
                >
                  Schedule
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("submissions")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block"
                >
                  Submissions
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("subscription")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block"
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
                <a
                  href="/help"
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block"
                >
                  Help Center
                </a>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block"
                >
                  Technical Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("submissions")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block"
                >
                  Submit Songs
                </button>
              </li>
              <li>
                <a
                  href="/guidelines"
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block"
                >
                  Community Guidelines
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left block"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Stream Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Stream Info</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-muted-foreground flex items-center">
                  <span className="text-metal-orange mr-2">
                    <Radio className="h-4 w-4" />
                  </span>
                  24/7 Live Stream
                </span>
              </li>
              <li>
                <span className="text-muted-foreground flex items-center">
                  <span className="text-metal-orange mr-2">♪</span>
                  320kbps Quality
                </span>
              </li>
              <li>
                <span className="text-muted-foreground flex items-center">
                  <span className="text-metal-orange mr-2">🌍</span>
                  Global Coverage
                </span>
              </li>
              <li>
                <span className="text-muted-foreground flex items-center">
                  <span className="text-metal-orange mr-2">🛡️</span>
                  Secure & Reliable
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <p className="text-sm text-muted-foreground font-semibold">
              © 2025 Spandex Salvation Radio. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mt-4 md:mt-0">
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
              <button
                onClick={() => {
                  const event = new CustomEvent("openAuthModal", {
                    detail: { mode: "admin" },
                  });
                  window.dispatchEvent(event);
                }}
                className="font-semibold hover:text-metal-orange transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
