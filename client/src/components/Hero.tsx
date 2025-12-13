import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "../components/ui/button";
import RadioCoPlayer from "../components/RadioCoPlayer";
import { useTheme } from "../contexts/ThemeContext";

const HeroComponent = React.memo(function HeroComponent() {
  const { isDarkMode, getColors, currentTheme } = useTheme();
  const colors = getColors();

  const scrollToSchedule = useCallback(() => {
    document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const launchDate = useMemo(
    () => new Date("2025-08-10T12:00:00").getTime(),
    []
  );

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [launchDate]);

  // we KEEP these two overlays
  const backgroundOverlayStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${colors.background}80, ${colors.background}40)`,
    }),
    [colors.background]
  );

  const centerOverlayStyle = useMemo(
    () => ({
      background: `radial-gradient(circle at center, transparent 0%, ${colors.background}90 70%, ${colors.background} 100%)`,
    }),
    [colors.background]
  );

  const countdownLabelStyle = useMemo(
    () => ({
      color: currentTheme === "light-mode" ? "#374151" : colors.textMuted,
    }),
    [currentTheme, colors.textMuted]
  );

  const countdownDescriptionStyle = useMemo(
    () => ({
      color: currentTheme === "light-mode" ? "#212936" : colors.textMuted,
    }),
    [currentTheme, colors.textMuted]
  );

  return (
    <>
      <style>
        {`
          @keyframes customPulse {
            0%, 100% {
              opacity: 0.6;
              transform: scale(1);
            }
            50% {
              opacity: 0.3;
              transform: scale(1.1);
            }
          }
        `}
      </style>

      {/* OUTER HERO WRAPPER */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* background stack */}
        <div className="absolute inset-0 -top-16">
          {/* bg image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 dark:opacity-20 light:opacity-35"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
            }}
          ></div>

          <div
            className="absolute inset-0 transition-all duration-300"
            style={backgroundOverlayStyle}
          ></div>

          <div
            className="absolute inset-0 transition-all duration-300"
            style={centerOverlayStyle}
          ></div>
        </div>

        {/* INNER CONTENT WRAPPER */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 pt-12">
          {/* LOGO */}
          <div className="flex flex-col items-center justify-center mb-8">
            <img
              src="/images/ssr-logo-main.png"
              alt="Spandex Salvation Radio"
              className="w-[320px] md:w-[620px] lg:w-[820px] max-w-full object-contain select-none drop-shadow-[0_0_20px_rgba(0,0,0,0.35)]"
            />
          </div>

          {/* GLAM INTRO TEXT */}
          <p
            className="font-kalam text-[#ff2a2a] text-2xl md:text-3xl leading-relaxed max-w-5xl mx-auto text-center mt-6 drop-shadow-[0_0_6px_rgba(0,0,0,0.6)]"
          >
            From smoky clubs to empty highways, their echoes still
            <br />
            haunt the night. These are the forgotten anthems of a
            <br />
            louder age — kept alive here, under the neon cross of
            <br />
            Spandex Salvation, where the dreams never die.
          </p>

         {/* SLOGAN */}
<div className="mt-9 mb-10 flex justify-center">
  <p
    className="font-kalam text-[#ff2a2a] text-3xl md:text-4xl text-center italic drop-shadow-[0_0_14px_rgba(255,0,0,0.35)]"
    style={{ lineHeight: 1.05 }}
  >
    “All Glam. No Shame.”
  </p>
</div>

          {/* COUNTDOWN */}
          <div
            className="mb-8 flex flex-col items-center"
            role="timer"
            aria-label="Live broadcast countdown"
          >
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-3 flex justify-center" aria-hidden="true">
                <div
                  className="w-4 h-4 bg-gradient-to-r from-red-500 to-primary rounded-full shadow-lg"
                  style={{ animation: "customPulse 2s ease-in-out infinite" }}
                ></div>
              </div>
              <div className="text-center w-full">
                <span className="text-transparent bg-gradient-to-r from-red-500 to-primary bg-clip-text text-xl font-black tracking-wider">
                  LIVE IN
                </span>
              </div>
            </div>

            <div className="flex justify-center items-center space-x-4 text-center mb-4 w-full max-w-md mx-auto">
              <div className="flex-1 flex flex-col items-center justify-center p-3 min-w-[80px] transition-colors duration-300">
                <div className="text-3xl font-bold text-red-500 mb-2 text-center w-full leading-none">
                  {countdown.days}
                </div>
                <div
                  className="text-xs font-semibold text-center w-full leading-tight"
                  style={countdownLabelStyle}
                >
                  DAYS
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-3 min-w-[80px] transition-colors duration-300">
                <div className="text-3xl font-bold text-red-500 mb-2 text-center w-full leading-none">
                  {countdown.hours}
                </div>
                <div
                  className="text-xs font-semibold text-center w-full leading-tight"
                  style={countdownLabelStyle}
                >
                  HOURS
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-3 min-w-[80px] transition-colors duration-300">
                <div className="text-3xl font-bold text-red-500 mb-2 text-center w-full leading-none">
                  {countdown.minutes}
                </div>
                <div
                  className="text-xs font-semibold text-center w-full leading-tight"
                  style={countdownLabelStyle}
                >
                  MINS
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-3 min-w-[80px] transition-colors duration-300">
                <div className="text-3xl font-bold text-red-500 mb-2 text-center w-full leading-none">
                  {countdown.seconds}
                </div>
                <div
                  className="text-xs font-semibold text-center w-full leading-tight"
                  style={countdownLabelStyle}
                >
                  SECS
                </div>
              </div>
            </div>

            <div className="text-center w-full">
              <p
                className="text-sm font-semibold opacity-80"
                style={countdownDescriptionStyle}
              >
                First Broadcast Countdown
              </p>
            </div>
          </div>

          {/* RADIO PLAYER */}
          <div className="flex flex-col items-center justify-center space-y-6 mb-12 mt-8">
            <RadioCoPlayer />
          </div>

          {/* bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent transition-colors duration-300"></div>
        </div>
        {/* ✅ this closes the INNER content wrapper */}

      </div>
      {/* ✅ this closes the OUTER hero wrapper */}
    </>
  );
});

export default HeroComponent;
