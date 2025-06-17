import { Radio, Globe, Archive, Music, Crown, Shirt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { StreamStats } from "@shared/schema";

export default function Features() {
  const { data: stats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
  });

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-black text-3xl md:text-4xl mb-4 text-white">
            ROCK THE AIRWAVES
          </h2>
          <p className="text-gray-400 text-lg font-semibold max-w-2xl mx-auto">
            Experience the ultimate old-school metal radio experience with live streaming, 
            interactive features, and exclusive content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: Live Streaming */}
          <Card className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-metal-orange/20 rounded-lg flex items-center justify-center mb-4">
                <Radio className="text-metal-orange h-6 w-6" />
              </div>
              <h3 className="font-black text-xl mb-3">24/7 Live Streaming</h3>
              <p className="text-gray-400 font-semibold mb-4">Non-stop old-school metal streaming with high-quality audio and minimal buffering.</p>
              <div className="flex items-center text-metal-orange text-sm">
                <div className="w-2 h-2 bg-metal-orange rounded-full animate-pulse mr-2"></div>
                <span>Currently Live</span>
              </div>
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
          <Card className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-metal-gold/20 rounded-lg flex items-center justify-center mb-4">
                <Crown className="text-metal-gold h-6 w-6" />
              </div>
              <h3 className="font-black text-xl mb-3">Hairspray Rebellion</h3>
              <p className="text-gray-400 font-semibold mb-4">Join our premium membership for exclusive content, early access, and special perks.</p>
              <Button 
                variant="ghost" 
                className="text-metal-gold hover:text-yellow-400 p-0 h-auto"
                onClick={() => scrollToSection("subscribe")}
              >
                Learn More →
              </Button>
            </CardContent>
          </Card>

          {/* Feature 6: Merch Store */}
          <Card className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-metal-red/20 rounded-lg flex items-center justify-center mb-4">
                <Shirt className="text-metal-red h-6 w-6" />
              </div>
              <h3 className="font-black text-xl mb-3">Official Merch</h3>
              <p className="text-gray-400 font-semibold mb-4">Show your metal pride with official Spandex Salvation Radio merchandise and apparel.</p>
              <Button 
                variant="ghost" 
                className="text-metal-red hover:text-red-400 p-0 h-auto"
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
