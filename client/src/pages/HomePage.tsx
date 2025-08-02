import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Schedule from "@/components/Schedule";
import Submissions from "@/components/Submissions";
import FullWidthGlobeMap from "@/components/FullWidthGlobeMapFixed";
import Contact from "@/components/Contact";
import SubscriptionCarousel from "@/components/SubscriptionCarousel";
import ShopifyEcommerce from "@/components/ShopifyEcommerce";
import FadeInView from "@/components/FadeInView";
import StaggeredAnimation from "@/components/StaggeredAnimation";



import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import StickyPlayer from "@/components/StickyPlayer";
import ChatButton from "@/components/ChatButton";
import { useTheme } from "@/contexts/ThemeContext";

export default function HomePage() {
  const [isScrollingEnabled, setIsScrollingEnabled] = useState(true);
  const { getColors, currentTheme } = useTheme();
  const colors = getColors();
  
  useEffect(() => {
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
    window.addEventListener('hashchange', handleHashNavigation);
    
    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, []);
  
  return (
    <div 
      className="min-h-screen transition-colors duration-300" 
      style={{ 
        backgroundColor: colors.background,
        color: colors.text 
      }}
    >
      <div id="main-navigation">
        <Navigation />
      </div>
      <main id="main-content">
        <Hero />
      
      <FadeInView direction="up" delay={0}>
        <Features />
      </FadeInView>
      
      <FadeInView direction="up" delay={0}>
        <About />
      </FadeInView>
      
      <FadeInView direction="up" delay={0}>
        <Schedule />
      </FadeInView>
      
      <FadeInView direction="up" delay={0}>
        <section 
          id="subscribe" 
          className="py-20 transition-colors duration-300"
          style={{ backgroundColor: colors.background }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 
                className="font-orbitron font-black text-3xl md:text-4xl mb-4"
                style={{ 
                  color: currentTheme === 'light-mode' ? '#000000' : colors.text 
                }}
              >
                Supporters Enjoy More
              </h2>
              <p 
                className="text-lg font-semibold"
                style={{ 
                  color: currentTheme === 'light-mode' ? 'rgba(0, 0, 0, 0.7)' : colors.textMuted 
                }}
              >
                Support our growth and enjoy exclusive content.
              </p>
            </div>
            <SubscriptionCarousel />
          </div>
        </section>
      </FadeInView>
      
      <FadeInView direction="up" delay={0}>
        <Submissions />
      </FadeInView>
      
      <FadeInView direction="up" delay={0}>
        <section id="map" className="py-8">
          <FullWidthGlobeMap />
        </section>
      </FadeInView>
      
      <FadeInView direction="up" delay={0}>
        <Contact />
      </FadeInView>
      
      <FadeInView direction="up" delay={0}>
        <ShopifyEcommerce />
      </FadeInView>
      
      <FadeInView direction="up" delay={0}>
        <Footer />
      </FadeInView>
      
        <StickyPlayer />
        <ChatButton />
      </main>
    </div>
  );
}
