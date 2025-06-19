import { useState, useEffect } from "react";
import { Play, Calendar, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import RadioCoPlayer from "@/components/RadioCoPlayer";

export default function Hero() {
  
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
        <h1 className="font-orbitron font-black text-5xl md:text-8xl mb-2 text-white dark:text-white">
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

        {/* Live Radio Player */}
        <div className="flex flex-col items-center justify-center space-y-6 mb-12 mt-8">
          <RadioCoPlayer />
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
        <div className="mt-12 mb-16">
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
      
      {/* Fade to Background Color */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent transition-colors duration-300"></div>
    </section>
  );
}
