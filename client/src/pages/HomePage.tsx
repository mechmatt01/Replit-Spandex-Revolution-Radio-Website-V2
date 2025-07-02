import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Schedule from "@/components/Schedule";
import Submissions from "@/components/Submissions";
import FullWidthGlobeMap from "@/components/FullWidthGlobeMap";
import Contact from "@/components/Contact";
import StripePaymentProcessor from "@/components/StripePaymentProcessor";
import ShopifyEcommerce from "@/components/ShopifyEcommerce";

import { useState } from "react";
import Footer from "@/components/Footer";
import StickyPlayer from "@/components/StickyPlayer";
import ChatButton from "@/components/ChatButton";


export default function HomePage() {

  return (
    <div className="min-h-screen bg-black dark:bg-black text-white dark:text-white transition-colors duration-300">
      <Navigation />
      <Hero />
      <Features />
      <About />
      <Schedule />
      <Submissions />
      <FullWidthGlobeMap />
      <Contact />
      <section id="subscribe" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-black text-3xl md:text-4xl mb-4 text-white">
              PREMIUM SUBSCRIPTIONS
            </h2>
            <p className="text-gray-400 text-lg font-semibold">
              Support the station and unlock exclusive content with secure Stripe payments.
            </p>
          </div>
          <StripePaymentProcessor />
        </div>
      </section>
      <ShopifyEcommerce />
      <Footer />
      <StickyPlayer />
      <ChatButton />
    </div>
  );
}
