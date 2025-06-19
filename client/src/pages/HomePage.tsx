import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Schedule from "@/components/Schedule";
import Submissions from "@/components/Submissions";
import InteractiveMap from "@/components/InteractiveMap";
import InteractiveListenerMap from "@/components/InteractiveListenerMap";
import Contact from "@/components/Contact";
import Subscription from "@/components/Subscription";
import StripePaymentProcessor from "@/components/StripePaymentProcessor";
import Merch from "@/components/Merch";
import ShopifyEcommerce from "@/components/ShopifyEcommerce";
import AdminPanel from "@/components/AdminPanel";
import AdvancedAdminDashboard from "@/components/AdvancedAdminDashboard";
import AdvancedAudioPlayer from "@/components/AdvancedAudioPlayer";
import Footer from "@/components/Footer";
import StickyPlayer from "@/components/StickyPlayer";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navigation />
      <Hero />
      <AdvancedAudioPlayer />
      <Features />
      <About />
      <Schedule />
      <Submissions />
      <InteractiveMap />
      <InteractiveListenerMap />
      <Contact />
      <Subscription />
      <section id="subscribe" className="py-20 bg-dark-surface">
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
      <Merch />
      <ShopifyEcommerce />
      <AdminPanel />
      <AdvancedAdminDashboard />
      <Footer />

    </div>
  );
}
