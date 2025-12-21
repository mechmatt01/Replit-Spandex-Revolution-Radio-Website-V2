import AmpPanel from "../components/AmpPanel";
import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";
import Overview3 from "../components/Overview3";
import About from "../components/About";
import ShowsSection from "../components/ShowsSection";
import Submissions from "../components/Submissions";
import FullWidthGlobeMap from "../components/FullWidthGlobeMap";
import StatsAndLocations from "../components/StatsAndLocations";
import Contact from "../components/Contact";
import ShopifyEcommerce from "../components/ShopifyEcommerce";
import Footer from "../components/Footer";
import StickyPlayer from "../components/StickyPlayer";
import LiveChat from "../components/LiveChat";
import ChatButton from "../components/ChatButton";
import { useTheme } from "../contexts/ThemeContext";
import { computeNowNext } from "../lib/schedule";
import { measurePageLoad } from "../lib/performance";
// import FadeInView from "../components/FadeInView";
import SubscriptionCarousel from "../components/SubscriptionCarousel";
import UserProfile from "../components/UserProfile";

export default function HomePage() {
  const isLiveNow = (() => { const { now } = computeNowNext(); return !!now; })();
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const { currentTheme, getColors } = useTheme();
  const colors = getColors();

  // Measure page load performance
  useEffect(() => {
    measurePageLoad("home_page");

    // Handle hash navigation on page load
    const handleHashNavigation = () => {
      const hash = window.location.hash.substring(1); // Remove the #
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    };

    handleHashNavigation();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashNavigation);

    return () => {
      window.removeEventListener("hashchange", handleHashNavigation);
    };
  }, []);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        // 👉 your leather background
        backgroundImage: "url('/images/black-leather.jpg')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        // keep theme text color
        color: colors.text,
      }}
    >
      <div id="main-navigation">
        <Navigation />
      </div>

      <main id="main-content">
        <Hero />

        {/* Temporarily disabled FadeInView to fix scroll issues */}
        <Overview3 />

        <About />

        <ShowsSection />

        <section
          id="subscribe"
          className="py-20 transition-colors duration-300"
          // make this a little transparent so leather shows through
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2
                className="font-orbitron font-black text-3xl md:text-4xl mb-4"
                style={{
                  color:
                    currentTheme === "light-mode" ? "#000000" : colors.text,
                }}
              >
                Supporters Enjoy More
              </h2>
              <p
                className="text-lg font-semibold"
                style={{
                  color:
                    currentTheme === "light-mode"
                      ? "rgba(0, 0, 0, 0.7)"
                      : colors.textMuted,
                }}
              >
                Support our growth and enjoy exclusive content.
              </p>
            </div>
            <SubscriptionCarousel
              onSubscribe={() => setShowSubscriptionPlans(true)}
            />
          </div>
        </section>

        <Submissions />

        <section id="map" className="py-8">
         <div id="live-map-header" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
  <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4">Live Map</h2>
</div>
<FullWidthGlobeMap />

        </section>

        <StatsAndLocations />

        <Contact />

        <ShopifyEcommerce />

        <Footer />

        <StickyPlayer />
      </main>

      {/* Subscription Plans Modal */}
      {showSubscriptionPlans && (
        <UserProfile
          isOpen={true}
          onClose={() => setShowSubscriptionPlans(false)}
          initialShowSubscriptionPlans={true}
        />
      )}

      {/* if you really want the floating chat: */}
      {showLiveChat && (
        <LiveChat
          isEnabled={showLiveChat}
          onToggle={() => setShowLiveChat(false)}
        />
      )}
          <AmpPanel />
    </div>
  );
}
