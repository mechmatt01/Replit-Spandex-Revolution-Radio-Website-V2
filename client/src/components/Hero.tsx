import { useState, useEffect } from "react";
import { Play, Calendar, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import RadioCoPlayer from "@/components/RadioCoPlayer";
import CountdownTimer from "./CountdownTimer";
import { useTheme } from "../contexts/ThemeContext";

export default function Hero() {
  const { isDarkMode, getColors } = useTheme();
  const colors = getColors();
  
  const scrollToSchedule = () => {
    document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth' });
  };
  
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

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-16 pt-16">
      {/* Background */}
      <div className="absolute inset-0 -top-16 bg-gradient-to-b from-background via-card to-background transition-colors duration-300">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-20 light:opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80 transition-colors duration-300"></div>
      </div>
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 pt-16">
        <h1 className="font-orbitron font-black text-5xl md:text-8xl mb-2 text-black dark:text-white">
          SPANDEX SALVATION RADIO
        </h1>
        <div className="mb-6">
          <p className="text-xl md:text-2xl font-bold text-metal-orange mb-1">Old School Metal</p>
          <p className="text-base md:text-lg font-semibold text-metal-orange">24/7 Live Stream</p>
        </div>

        {/* Countdown Timer */}
        <div className="mt-8 mb-8">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-bold text-3xl">ON AIR IN...</span>
          </div>
          <div className="flex justify-center space-x-4 text-center">
            <div className="bg-card/40 backdrop-blur-sm p-4 min-w-[90px] rounded-xl transition-colors duration-300 flex flex-col items-center">
              <div className="text-3xl font-bold text-red-500 mb-1 animate-pulse">{countdown.days}</div>
              <div className="text-xs text-muted-foreground font-semibold">DAYS</div>
            </div>
            <div className="bg-card/40 backdrop-blur-sm p-4 min-w-[90px] rounded-xl transition-colors duration-300 flex flex-col items-center">
              <div className="text-3xl font-bold text-red-500 mb-1 animate-pulse">{countdown.hours}</div>
              <div className="text-xs text-muted-foreground font-semibold">HOURS</div>
            </div>
            <div className="bg-card/40 backdrop-blur-sm p-4 min-w-[90px] rounded-xl transition-colors duration-300 flex flex-col items-center">
              <div className="text-3xl font-bold text-red-500 mb-1 animate-pulse">{countdown.minutes}</div>
              <div className="text-xs text-muted-foreground font-semibold">MINS</div>
            </div>
            <div className="bg-card/40 backdrop-blur-sm p-4 min-w-[90px] rounded-xl transition-colors duration-300 flex flex-col items-center">
              <div className="text-3xl font-bold text-red-500 mb-1 animate-pulse">{countdown.seconds}</div>
              <div className="text-xs text-muted-foreground font-semibold">SECS</div>
            </div>
          </div>
        </div>

        <p className="text-lg md:text-xl font-semibold text-muted-foreground mb-6 max-w-2xl mx-auto text-center">
          Bringing you the best of old-school metal with legendary<br />
          bands like Skid Row, Twisted Sister, and more.<br />
          Join the hairspray rebellion!
        </p>

        {/* Live Radio Player */}
        <div className="flex flex-col items-center justify-center space-y-6 mb-12 mt-8">
          <RadioCoPlayer />
          <Button 
            onClick={scrollToSchedule}
            variant="outline"
            className="border-2 px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 hover:scale-105"
            style={{
              borderColor: colors.primary,
              color: colors.primary,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.primary;
              e.currentTarget.style.borderColor = colors.primary;
            }}
          >
            <Calendar className="mr-3 h-5 w-5" />
            VIEW SCHEDULE
          </Button>
        </div>


      </div>
      
      {/* Fade to Background Color */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent transition-colors duration-300"></div>
    </section>
  );
}
