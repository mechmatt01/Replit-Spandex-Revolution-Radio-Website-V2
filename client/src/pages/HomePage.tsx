import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Schedule from "@/components/Schedule";
import Submissions from "@/components/Submissions";
import FullWidthGlobeMap from "@/components/FullWidthGlobeMap";
import Contact from "@/components/Contact";
import SubscriptionCarousel from "@/components/SubscriptionCarousel";
import ShopifyEcommerce from "@/components/ShopifyEcommerce";

import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import StickyPlayer from "@/components/StickyPlayer";
import ChatButton from "@/components/ChatButton";

export default function HomePage() {
  const [isScrollingEnabled, setIsScrollingEnabled] = useState(true);
  
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
    <div className="min-h-screen bg-black dark:bg-black text-white dark:text-white transition-colors duration-300">
      <Navigation />
      <Hero />
      <Features />
      <About />
      <Schedule />
      <section id="subscribe" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-black text-3xl md:text-4xl mb-4 text-white">
              Supporters Enjoy More
            </h2>
            <p className="text-gray-400 text-lg font-semibold">
              Support our growth and enjoy exclusive content.
            </p>
          </div>
          <SubscriptionCarousel />
        </div>
      </section>
      <Submissions />
      <FullWidthGlobeMap />
      <Contact />
      <ShopifyEcommerce />
      <Footer />
      <StickyPlayer />
      <ChatButton />
    </div>
  );
}
