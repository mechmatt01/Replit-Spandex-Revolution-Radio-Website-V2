import { Radio, Globe, Archive, Music, Crown, Shirt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import type { StreamStats } from "@shared/schema";

export default function Features() {
  const { data: stats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
  });
  const { getColors } = useTheme();
  const colors = getColors();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 transition-colors duration-300" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-black text-4xl md:text-5xl mb-6" style={{ color: colors.text }}>
            ROCK THE AIRWAVES
          </h2>
          <p className="text-xl font-semibold max-w-2xl mx-auto" style={{ color: colors.textMuted }}>
            Experience the ultimate old-school metal radio experience with live streaming, 
            interactive features, and exclusive content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: Live Streaming */}
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8"
            style={{
              backgroundColor: colors.card,
              borderColor: `${colors.primary}40`,
              boxShadow: `0 8px 32px ${colors.primary}20`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${colors.primary}40`;
              e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
            }}
          >
            <CardContent className="p-0">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                style={{ backgroundColor: colors.primary }}
              >
                <Radio className="text-white h-8 w-8" />
              </div>
              <h3 className="font-black text-2xl mb-4" style={{ color: colors.text }}>24/7 Live Streaming</h3>
              <p className="font-semibold mb-6 text-lg leading-relaxed" style={{ color: colors.textMuted }}>Non-stop old-school metal streaming with high-quality audio and minimal buffering.</p>
              <div className="flex items-center text-sm font-bold" style={{ color: colors.primary }}>
                <div className="w-3 h-3 rounded-full mr-3 animate-pulse" style={{ backgroundColor: colors.primary }}></div>
                <span>Currently Live</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature 2: Global Listener Map */}
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8"
            style={{
              backgroundColor: colors.card,
              borderColor: `${colors.primary}40`,
              boxShadow: `0 8px 32px ${colors.primary}20`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${colors.primary}40`;
              e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
            }}
          >
            <CardContent className="p-0">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                style={{ backgroundColor: colors.primary }}
              >
                <Globe className="text-white h-8 w-8" />
              </div>
              <h3 className="font-black text-2xl mb-4" style={{ color: colors.text }}>Global Listener Map</h3>
              <p className="font-semibold mb-6 text-lg leading-relaxed" style={{ color: colors.textMuted }}>See where metalheads around the world are tuning in from in real-time.</p>
              <div className="flex items-center text-sm font-bold" style={{ color: colors.primary }}>
                <div className="w-3 h-3 rounded-full mr-3 animate-pulse" style={{ backgroundColor: colors.primary }}></div>
                <span>{stats?.currentListeners || 1247} listeners online</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature 3: Show Archives */}
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8"
            style={{
              backgroundColor: colors.card,
              borderColor: `${colors.primary}40`,
              boxShadow: `0 8px 32px ${colors.primary}20`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${colors.primary}40`;
              e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
            }}
          >
            <CardContent className="p-0">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                style={{ backgroundColor: colors.primary }}
              >
                <Archive className="text-white h-8 w-8" />
              </div>
              <h3 className="font-black text-2xl mb-4" style={{ color: colors.text }}>Show Archives</h3>
              <p className="font-semibold mb-6 text-lg leading-relaxed" style={{ color: colors.textMuted }}>Access past shows, special episodes, and exclusive metal content on-demand.</p>
              <div className="flex items-center text-sm font-bold" style={{ color: colors.primary }}>
                <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: colors.primary }}></div>
                <span>200+ hours of content</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature 4: Song Requests */}
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8"
            style={{
              backgroundColor: colors.card,
              borderColor: `${colors.primary}40`,
              boxShadow: `0 8px 32px ${colors.primary}20`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${colors.primary}40`;
              e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
            }}
          >
            <CardContent className="p-0">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                style={{ backgroundColor: colors.primary }}
              >
                <Music className="text-white h-8 w-8" />
              </div>
              <h3 className="font-black text-2xl mb-4" style={{ color: colors.text }}>Song Requests</h3>
              <p className="font-semibold mb-6 text-lg leading-relaxed" style={{ color: colors.textMuted }}>Submit your favorite metal tracks and artist suggestions to be featured on air.</p>
              <Button 
                className="font-bold text-lg px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 border-0"
                style={{ 
                  color: colors.primary,
                  backgroundColor: 'transparent',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.primary;
                }}
                onClick={() => scrollToSection("submissions")}
              >
                Submit Request →
              </Button>
            </CardContent>
          </Card>

          {/* Feature 2: Interactive Map */}
          <Card className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-metal-orange/20 rounded-lg flex items-center justify-center mb-4">
                <Globe className="text-metal-orange h-6 w-6" />
              </div>
              <h3 className="font-black text-xl mb-3">Global Listener Map</h3>
              <p className="text-gray-400 font-semibold mb-4">See where metalheads around the world are tuning in from in real-time.</p>
              <div className="flex items-center text-gray-500 text-sm">
                <span>{stats?.currentListeners || 0} listeners online</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature 3: Show Archive */}
          <Card className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-metal-orange/20 rounded-lg flex items-center justify-center mb-4">
                <Archive className="text-metal-orange h-6 w-6" />
              </div>
              <h3 className="font-black text-xl mb-3">Show Archives</h3>
              <p className="text-gray-400 font-semibold mb-4">Access past shows, special episodes, and exclusive metal content on-demand.</p>
              <div className="flex items-center text-gray-500 text-sm">
                <span>200+ hours of content</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature 4: Song Submissions */}
          <Card className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-metal-orange/20 rounded-lg flex items-center justify-center mb-4">
                <Music className="text-metal-orange h-6 w-6" />
              </div>
              <h3 className="font-black text-xl mb-3">Song Requests</h3>
              <p className="text-gray-400 font-semibold mb-4">Submit your favorite metal tracks and artist suggestions to be featured on air.</p>
              <Button 
                variant="ghost" 
                className="text-metal-orange hover:text-orange-400 p-0 h-auto"
                onClick={() => scrollToSection("submissions")}
              >
                Submit Request →
              </Button>
            </CardContent>
          </Card>

          {/* Feature 5: Subscription */}
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8"
            style={{
              backgroundColor: colors.card,
              borderColor: `${colors.primary}40`,
              boxShadow: `0 8px 32px ${colors.primary}20`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${colors.primary}40`;
              e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
            }}
          >
            <CardContent className="p-0">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                style={{ backgroundColor: colors.primary }}
              >
                <Crown className="text-white h-8 w-8" />
              </div>
              <h3 className="font-black text-2xl mb-4" style={{ color: colors.text }}>Hairspray Rebellion</h3>
              <p className="font-semibold mb-6 text-lg leading-relaxed" style={{ color: colors.textMuted }}>Join our premium membership for exclusive content, early access, and special perks.</p>
              <Button 
                className="font-bold text-lg px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 border-0"
                style={{ 
                  color: colors.primary,
                  backgroundColor: 'transparent',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.primary;
                }}
                onClick={() => scrollToSection("subscribe")}
              >
                Learn More →
              </Button>
            </CardContent>
          </Card>

          {/* Feature 6: Merch Store */}
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-8"
            style={{
              backgroundColor: colors.card,
              borderColor: `${colors.primary}40`,
              boxShadow: `0 8px 32px ${colors.primary}20`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${colors.primary}40`;
              e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
            }}
          >
            <CardContent className="p-0">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                style={{ backgroundColor: colors.primary }}
              >
                <Shirt className="text-white h-8 w-8" />
              </div>
              <h3 className="font-black text-2xl mb-4" style={{ color: colors.text }}>Official Merch</h3>
              <p className="font-semibold mb-6 text-lg leading-relaxed" style={{ color: colors.textMuted }}>Show your metal pride with official Spandex Salvation Radio merchandise and apparel.</p>
              <Button 
                className="font-bold text-lg px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 border-0"
                style={{ 
                  color: colors.primary,
                  backgroundColor: 'transparent',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.primary;
                }}
                onClick={() => scrollToSection("merch")}
              >
                Shop Now →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
