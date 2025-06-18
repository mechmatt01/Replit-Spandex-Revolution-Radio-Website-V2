import { useState, useEffect } from "react";
import { Play, Calendar, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";
import { useQuery } from "@tanstack/react-query";
import IframeRadioPlayer from "@/components/IframeRadioPlayer";
import IcecastPlayer from "@/components/IcecastPlayer";

export default function Hero() {
  const { currentTrack, togglePlayback } = useAudio();
  
  // Fetch live radio status for track info
  const { data: radioStatus } = useQuery({
    queryKey: ['/api/radio-status'],
    refetchInterval: 10000,
  });

  // Extract live track info
  const liveTrack = (radioStatus as any)?.icestats?.source?.[0];
  const liveTrackInfo = liveTrack ? {
    title: liveTrack.yp_currently_playing?.split(' - ')[1] || liveTrack.title || 'Unknown Track',
    artist: liveTrack.yp_currently_playing?.split(' - ')[0] || 'Unknown Artist',
    listeners: liveTrack.listeners || 0
  } : null;
  
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

        {/* Live Now Playing Card */}
        <div className="bg-card/40 backdrop-blur-sm w-full max-w-lg mx-auto mb-8 rounded-xl p-4 sm:p-6 lg:p-8 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center">
              <Music className="text-metal-orange mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-muted-foreground text-xs sm:text-sm font-semibold">NOW PLAYING</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-500 font-bold">LIVE</span>
            </div>
          </div>
          
          {/* Album Art */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg flex items-center justify-center shadow-lg">
              <Music className="text-white h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
            </div>
          </div>
          
          {/* Track Info */}
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="font-bold text-lg sm:text-xl lg:text-2xl mb-2 text-foreground">
              {liveTrackInfo?.title || 'Loading track...'}
            </h3>
            <p className="text-foreground font-semibold mb-1 text-sm sm:text-base">
              {liveTrackInfo?.artist || 'Loading artist...'}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium">
              Live Radio • {liveTrackInfo?.listeners || 0} listeners
            </p>
          </div>
          
          {/* Live Stream Progress */}
          <div className="mt-4 sm:mt-6">
            <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
              <div 
                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] h-1.5 sm:h-2 rounded-full animate-pulse"
                style={{ width: '100%' }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span className="flex items-center">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                STREAMING LIVE
              </span>
              <span className="hidden sm:inline">24/7 • Old School Metal</span>
              <span className="sm:hidden">24/7</span>
            </div>
          </div>
        </div>

        {/* Live Radio Player */}
        <div className="flex flex-col items-center justify-center space-y-6 mb-12">
          <IframeRadioPlayer />
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
