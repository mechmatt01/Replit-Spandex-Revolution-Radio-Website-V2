import { useState, useEffect } from "react";
import { Play, Calendar, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAudio } from "@/contexts/AudioContext";

export default function Hero() {
  const { currentTrack, togglePlayback } = useAudio();
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const launchDate = new Date("2025-07-14T00:00:00").getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSchedule = () => {
    const element = document.getElementById("schedule");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background transition-colors duration-300">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-20 light:opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80 transition-colors duration-300"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="font-orbitron font-black text-4xl md:text-7xl mb-4 bg-gradient-to-r from-metal-orange to-metal-gold bg-clip-text text-transparent">
          SPANDEX SALVATION RADIO
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-2">Old School Metal • 24/7 Live Stream</p>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Bringing you the best of old-school metal with legendary bands like Skid Row, Twisted Sister, and more. 
          Join the hairspray rebellion!
        </p>

        {/* Live Status Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center bg-metal-red/20 border border-metal-red/50 rounded-full px-4 py-2">
            <div className="w-3 h-3 bg-metal-red rounded-full animate-pulse mr-2"></div>
            <span className="text-metal-red font-semibold text-sm">LIVE NOW</span>
          </div>
        </div>

        {/* Now Playing Card */}
        <Card className="bg-card/80 border-border backdrop-blur-sm max-w-md mx-auto mb-8 transition-colors duration-300">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Music className="text-metal-orange mr-2 h-4 w-4" />
              <span className="text-muted-foreground text-sm">NOW PLAYING</span>
            </div>
            <h3 className="font-bold text-lg mb-1 text-foreground">{currentTrack?.title || "Loading..."}</h3>
            <p className="text-foreground">{currentTrack?.artist || "Artist"}</p>
            <p className="text-muted-foreground text-sm">{currentTrack?.album || "Album"}</p>
            
            {/* Audio Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-1">
                <div 
                  className="bg-metal-orange h-1 rounded-full transition-all duration-1000"
                  style={{ 
                    width: currentTrack && currentTrack.currentTime && currentTrack.duration ? 
                      `${(currentTrack.currentTime / currentTrack.duration) * 100}%` : 
                      '60%' 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>
                  {currentTrack && currentTrack.currentTime ? 
                    `${Math.floor(currentTrack.currentTime / 60)}:${(currentTrack.currentTime % 60).toString().padStart(2, '0')}` : 
                    '2:34'
                  }
                </span>
                <span>
                  {currentTrack && currentTrack.duration ? 
                    `${Math.floor(currentTrack.duration / 60)}:${(currentTrack.duration % 60).toString().padStart(2, '0')}` : 
                    '4:12'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
          <Button 
            onClick={togglePlayback}
            className="bg-metal-orange hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 animate-glow"
          >
            <Play className="mr-3 h-5 w-5" />
            START STREAMING
          </Button>
          <Button 
            onClick={scrollToSchedule}
            variant="outline"
            className="border-2 border-metal-gold text-metal-gold hover:bg-metal-gold hover:text-background px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
          >
            <Calendar className="mr-3 h-5 w-5" />
            VIEW SCHEDULE
          </Button>
        </div>

        {/* Countdown Timer */}
        <div className="mt-12">
          <p className="text-muted-foreground mb-4">OFFICIAL LAUNCH COUNTDOWN</p>
          <div className="flex justify-center space-x-4 text-center">
            <Card className="bg-card border-border p-4 min-w-[80px] transition-colors duration-300">
              <div className="text-2xl font-bold text-metal-orange">{countdown.days}</div>
              <div className="text-xs text-muted-foreground">DAYS</div>
            </Card>
            <Card className="bg-card border-border p-4 min-w-[80px] transition-colors duration-300">
              <div className="text-2xl font-bold text-metal-orange">{countdown.hours}</div>
              <div className="text-xs text-muted-foreground">HOURS</div>
            </Card>
            <Card className="bg-card border-border p-4 min-w-[80px] transition-colors duration-300">
              <div className="text-2xl font-bold text-metal-orange">{countdown.minutes}</div>
              <div className="text-xs text-muted-foreground">MINS</div>
            </Card>
            <Card className="bg-card border-border p-4 min-w-[80px] transition-colors duration-300">
              <div className="text-2xl font-bold text-metal-orange">{countdown.seconds}</div>
              <div className="text-xs text-muted-foreground">SECS</div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
