import { useState, useEffect } from "react";
import { Play, Calendar, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 pt-16">
        <h1 className="font-orbitron font-black text-5xl md:text-8xl mb-2 text-white light:text-black">
          SPANDEX SALVATION RADIO
        </h1>
        <div className="mb-6">
          <p className="text-xl md:text-2xl font-bold text-metal-orange mb-1">Old School Metal</p>
          <p className="text-base md:text-lg font-semibold text-metal-orange">24/7 Live Stream</p>
        </div>
        <p className="text-lg md:text-xl font-semibold text-muted-foreground mb-6 max-w-2xl mx-auto">
          Bringing you the best of old-school metal with legendary bands like Skid Row, Twisted Sister, and more.
          <br />
          Join the hairspray rebellion!
        </p>

        {/* Live Status Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center bg-metal-red/20 rounded-full px-4 py-2">
            <div className="w-3 h-3 bg-metal-red rounded-full mr-2"></div>
            <span className="text-metal-red font-semibold text-sm">LIVE NOW</span>
          </div>
        </div>

        {/* Now Playing Card */}
        <div className="bg-card/30 backdrop-blur-sm max-w-md mx-auto mb-8 rounded-xl p-6 transition-colors duration-300">
          <div className="flex items-center mb-4">
            <Music className="text-metal-orange mr-2 h-4 w-4" />
            <span className="text-muted-foreground text-sm font-semibold">NOW PLAYING</span>
          </div>
          <h3 className="font-bold text-xl mb-1 text-foreground">
            {(() => {
              if (!currentTrack) return "Loading...";
              if ('name' in currentTrack) return currentTrack.name;
              return (currentTrack as any).title || "Loading...";
            })()}
          </h3>
          <p className="text-foreground font-semibold">
            {(() => {
              if (!currentTrack) return "Artist";
              if ('artists' in currentTrack) return currentTrack.artists[0]?.name || "Artist";
              return (currentTrack as any).artist || "Artist";
            })()}
          </p>
          <p className="text-muted-foreground text-sm font-medium">
            {(() => {
              if (!currentTrack) return "Album";
              if ('album' in currentTrack && typeof currentTrack.album === 'object' && currentTrack.album && 'name' in currentTrack.album) {
                return currentTrack.album.name;
              }
              return (currentTrack as any).album || "Album";
            })()}
          </p>
          
          {/* Audio Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-1">
              <div 
                className="bg-metal-orange h-1 rounded-full transition-all duration-1000"
                style={{ 
                  width: (() => {
                    if (!currentTrack) return '60%';
                    const track = currentTrack as any;
                    if (track.currentTime && track.duration) {
                      return `${(track.currentTime / track.duration) * 100}%`;
                    }
                    return '60%';
                  })()
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>
                {(() => {
                  if (!currentTrack) return '2:34';
                  const track = currentTrack as any;
                  if (track.currentTime) {
                    return `${Math.floor(track.currentTime / 60)}:${(track.currentTime % 60).toString().padStart(2, '0')}`;
                  }
                  return '2:34';
                })()}
              </span>
              <span>
                {(() => {
                  if (!currentTrack) return '4:12';
                  const track = currentTrack as any;
                  if (track.duration) {
                    return `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`;
                  }
                  return '4:12';
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
          <Button 
            onClick={togglePlayback}
            className="bg-metal-orange hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors"
          >
            <Play className="mr-3 h-5 w-5" />
            START STREAMING
          </Button>
          <Button 
            onClick={scrollToSchedule}
            variant="outline"
            className="border-2 border-metal-blue text-metal-blue hover:bg-metal-blue hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-colors"
          >
            <Calendar className="mr-3 h-5 w-5" />
            VIEW SCHEDULE
          </Button>
        </div>

        {/* Countdown Timer */}
        <div className="mt-12">
          <p className="text-muted-foreground mb-4 font-bold">OFFICIAL LAUNCH COUNTDOWN</p>
          <div className="flex justify-center space-x-4 text-center">
            <div className="bg-card/40 backdrop-blur-sm p-4 min-w-[80px] rounded-xl transition-colors duration-300">
              <div className="text-2xl font-bold text-metal-orange">{countdown.days}</div>
              <div className="text-xs text-muted-foreground font-semibold">DAYS</div>
            </div>
            <div className="bg-card/40 backdrop-blur-sm p-4 min-w-[80px] rounded-xl transition-colors duration-300">
              <div className="text-2xl font-bold text-metal-orange">{countdown.hours}</div>
              <div className="text-xs text-muted-foreground font-semibold">HOURS</div>
            </div>
            <div className="bg-card/40 backdrop-blur-sm p-4 min-w-[80px] rounded-xl transition-colors duration-300">
              <div className="text-2xl font-bold text-metal-orange">{countdown.minutes}</div>
              <div className="text-xs text-muted-foreground font-semibold">MINS</div>
            </div>
            <div className="bg-card/40 backdrop-blur-sm p-4 min-w-[80px] rounded-xl transition-colors duration-300">
              <div className="text-2xl font-bold text-metal-orange">{countdown.seconds}</div>
              <div className="text-xs text-muted-foreground font-semibold">SECS</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
