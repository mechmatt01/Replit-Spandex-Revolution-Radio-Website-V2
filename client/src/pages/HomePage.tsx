import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Schedule from "@/components/Schedule";
import Submissions from "@/components/Submissions";
import InteractiveMap from "@/components/InteractiveMap";
import Contact from "@/components/Contact";
import Subscription from "@/components/Subscription";
import Merch from "@/components/Merch";
import AdminPanel from "@/components/AdminPanel";
import Footer from "@/components/Footer";
import StickyPlayer from "@/components/StickyPlayer";
import ThemeToggle from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navigation />
      <Hero />
      <Features />
      <About />
      <Schedule />
      <Submissions />
      <InteractiveMap />
      <Contact />
      <Subscription />
      <Merch />
      <AdminPanel />
      <Footer />
      <StickyPlayer />
      <ThemeToggle />
    </div>
  );
}
