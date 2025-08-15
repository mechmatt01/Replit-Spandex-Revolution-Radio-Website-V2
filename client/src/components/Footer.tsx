import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Radio } from "lucide-react";
import MusicLogoPath from "/MusicLogoIcon.png";
import AdminPanel from "./AdminPanel";

export default function Footer() {
  const { colors, gradient, currentTheme } = useTheme();
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer 
      className="py-12 transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
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
                <div 
                  className="text-sm font-black leading-tight" 
                  style={{ 
                    color: currentTheme === 'light-mode' ? '#000000' : colors.text 
                  }}
                >
                  SPANDEX SALVATION
                </div>
                <div className="text-sm font-black leading-tight" style={{ color: colors.primary }}>
                  RADIO
                </div>
              </div>
            </div>
            <p 
              className="text-sm"
              style={{ color: colors.textMuted }}
            >
              Your home for old-school metal music. Broadcasting the rebellion
              since 2025.
            </p>
            <button
              onClick={() => window.open('mailto:support@spandexsalvationradio.com', '_blank')}
              className="text-sm transition-colors duration-300 block mt-2 text-left p-0 m-0 bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-0"
              style={{ color: colors.textMuted }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
            >
              Email Support
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h4 
              className="font-semibold mb-4"
              style={{ 
                color: currentTheme === 'light-mode' ? '#000000' : colors.text 
              }}
            >Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("hero")}
                  className="transition-colors text-left block p-0 m-0 bg-transparent focus:outline-none focus:ring-0"
                  style={{ color: colors.textMuted }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("schedule")}
                  className="transition-colors text-left block p-0 m-0 bg-transparent border-0 focus:outline-none focus:ring-0"
                  style={{ color: colors.textMuted }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                >
                  Schedule
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("submissions")}
                  className="transition-colors text-left block p-0 m-0 bg-transparent border-0"
                  style={{ color: colors.textMuted }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                >
                  Submissions
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="transition-colors text-left block p-0 m-0 bg-transparent border-0"
                  style={{ color: colors.textMuted }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("subscribe")}
                  className="transition-colors text-left block p-0 m-0 bg-transparent border-0"
                  style={{ color: colors.textMuted }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                >
                  Subscribe
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 
              className="font-semibold mb-4"
              style={{ 
                color: currentTheme === 'light-mode' ? '#000000' : colors.text 
              }}
            >Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => window.location.href = "/help"}
                  className="transition-colors text-left block p-0 m-0 bg-transparent border-0"
                  style={{ color: colors.textMuted }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="transition-colors text-left block p-0 m-0 bg-transparent border-0"
                  style={{ color: colors.textMuted }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                >
                  Technical Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("submissions")}
                  className="transition-colors text-left block p-0 m-0 bg-transparent border-0"
                  style={{ color: colors.textMuted }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                >
                  Submit Songs
                </button>
              </li>
              <li>
                <button
                  onClick={() => window.location.href = "/guidelines"}
                  className="transition-colors text-left block p-0 m-0 bg-transparent border-0"
                  style={{ color: colors.textMuted }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                >
                  Community Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => window.location.href = "/privacy"}
                  className="transition-colors text-left block p-0 m-0 bg-transparent border-0"
                  style={{ color: colors.textMuted }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.textMuted}
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Stream Info */}
          <div>
            <h4 
              className="font-semibold mb-4"
              style={{ 
                color: currentTheme === 'light-mode' ? '#000000' : colors.text 
              }}
            >Stream Info</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <div 
                  className="flex items-center"
                  style={{ color: colors.textMuted }}
                >
                  <span 
                    className="mr-3 flex-shrink-0"
                    style={{ color: colors.primary }}
                  >
                    <Radio className="h-4 w-4" />
                  </span>
                  <span>24/7 Live Stream</span>
                </div>
              </li>
              <li>
                <div 
                  className="flex items-center"
                  style={{ color: colors.textMuted }}
                >
                  <span 
                    className="mr-3 flex-shrink-0 text-center w-4"
                    style={{ color: colors.primary }}
                  >♪</span>
                  <span>320kbps Quality</span>
                </div>
              </li>
              <li>
                <div 
                  className="flex items-center"
                  style={{ color: colors.textMuted }}
                >
                  <span 
                    className="mr-3 flex-shrink-0 text-center w-4"
                    style={{ color: colors.primary }}
                  >🌍</span>
                  <span>Global Coverage</span>
                </div>
              </li>
              <li>
                <div 
                  className="flex items-center"
                  style={{ color: colors.textMuted }}
                >
                  <span 
                    className="mr-3 flex-shrink-0 text-center w-4"
                    style={{ color: colors.primary }}
                  >🛡️</span>
                  <span>Secure & Reliable</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 text-sm">
            <div 
              className="font-semibold"
              style={{ 
                color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted 
              }}
            >
              © 2025 Spandex Salvation Radio. All rights reserved.
            </div>
            <a
              href="/terms"
              className="font-semibold transition-colors duration-300"
              style={{ 
                color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted 
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted}
            >
              Terms of Service
            </a>
            <a
              href="/privacy"
              className="font-semibold transition-colors duration-300"
              style={{ 
                color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted 
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted}
            >
              Privacy Policy
            </a>
            <a
              href="/cookies"
              className="font-semibold transition-colors duration-300"
              style={{ 
                color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted 
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted}
            >
              Cookies
            </a>
            <button
              onClick={() => setIsAdminPanelOpen(true)}
              className="font-semibold transition-colors duration-300 bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
              style={{ 
                color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted 
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
      
      {/* Admin Panel */}
      {isAdminPanelOpen && (
        <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />
      )}
    </footer>
  );
}