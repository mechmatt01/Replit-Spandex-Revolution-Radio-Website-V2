import { Button } from "@/components/ui/button";

export default function About() {
  const scrollToSubscribe = () => {
    const element = document.getElementById("subscribe");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="about" className="py-20 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-orbitron font-black text-3xl md:text-4xl mb-6 text-white">
              ABOUT THE REBELLION
            </h2>
            <p className="text-gray-300 text-lg font-semibold mb-6">
              Spandex Salvation Radio was born from a passion for the golden era of metal music. 
              When hair was big, guitars were loud, and the stage was set ablaze with pure rock energy.
            </p>
            <p className="text-gray-400 font-semibold mb-6">
              We're dedicated to preserving and celebrating the legendary sounds of bands like Skid Row, 
              Twisted Sister, Mötley Crüe, and countless other metal pioneers who defined a generation.
            </p>
            <div className="flex items-center space-x-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-black text-metal-orange">24/7</div>
                <div className="text-sm font-semibold text-gray-500">Live Streaming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-metal-orange">1000+</div>
                <div className="text-sm font-semibold text-gray-500">Metal Tracks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-metal-orange">50+</div>
                <div className="text-sm font-semibold text-gray-500">Countries</div>
              </div>
            </div>
            <Button 
              onClick={scrollToSubscribe}
              className="bg-metal-orange hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
            >
              Join the Revolution
            </Button>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Metal concert with band performing on stage under dramatic lighting" 
              className="rounded-xl shadow-2xl w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/50 to-transparent rounded-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
