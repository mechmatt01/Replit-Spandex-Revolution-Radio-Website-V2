import { Radio, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
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
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-metal-orange to-metal-red rounded-lg flex items-center justify-center">
                <Radio className="text-white text-lg h-5 w-5" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg text-metal-orange">
                  SPANDEX SALVATION
                </h3>
                <p className="text-xs text-muted-foreground -mt-1">RADIO</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Your home for old-school metal music. Broadcasting the rebellion
              since 2025.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="w-8 h-8 bg-card/50 rounded-lg flex items-center justify-center hover:bg-metal-orange/20 transition-colors"
              >
                <Facebook className="text-metal-orange h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-card/50 rounded-lg flex items-center justify-center hover:bg-metal-orange/20 transition-colors"
              >
                <Twitter className="text-metal-orange h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-card/50 rounded-lg flex items-center justify-center hover:bg-metal-orange/20 transition-colors"
              >
                <Instagram className="text-metal-orange h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-card/50 rounded-lg flex items-center justify-center hover:bg-metal-orange/20 transition-colors"
              >
                <Youtube className="text-metal-orange h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("home")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("schedule")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left"
                >
                  Schedule
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("subscribe")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left"
                >
                  Subscribe
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left"
                >
                  Technical Support
                </a>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("submissions")}
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left"
                >
                  Submit Songs
                </button>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left"
                >
                  Community Guidelines
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-metal-orange transition-colors text-left"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Stream Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Stream Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Radio className="text-metal-orange mr-2 h-4 w-4" />
                24/7 Live Stream
              </div>
              <div className="flex items-center text-muted-foreground">
                <span className="text-metal-orange mr-2">♪</span>
                320kbps Quality
              </div>
              <div className="flex items-center text-muted-foreground">
                <span className="text-metal-orange mr-2">🌍</span>
                Global Coverage
              </div>
              <div className="flex items-center text-muted-foreground">
                <span className="text-metal-orange mr-2">🛡️</span>
                Secure & Reliable
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-muted-foreground text-sm font-semibold mb-4 md:mb-0">
            © 2025 Spandex Salvation Radio. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <a
              href="#"
              className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors"
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
              className="text-muted-foreground font-semibold hover:text-metal-orange transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
