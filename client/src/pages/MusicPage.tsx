import RadioCoPlayer from "@/components/RadioCoPlayer";
import Navigation from "@/components/Navigation";
import StickyPlayer from "@/components/StickyPlayer";

export default function MusicPage() {
  return (
    <>
      <Navigation />
      <div id="music" className="min-h-screen bg-background pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-foreground mb-4">
              HOT 97 FM
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              New York's Hip Hop & R&B - Live 24/7
            </p>
          </div>

          {/* Hot 97 Player */}
          <div className="max-w-4xl mx-auto">
            <RadioCoPlayer />
          </div>

          {/* Station Info */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-black/90 backdrop-blur-md rounded-lg p-6 border border-orange-500/20">
              <h2 className="text-2xl font-bold text-white mb-4">About Hot 97</h2>
              <p className="text-gray-300 mb-4">
                Hot 97 is New York City's premier hip hop and R&B radio station. Broadcasting live 24/7, 
                Hot 97 brings you the latest hits, exclusive interviews, and the hottest tracks from your 
                favorite artists.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-orange-400 font-bold text-xl">24/7</div>
                  <div className="text-gray-400">Live Broadcasting</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-400 font-bold text-xl">97.1 FM</div>
                  <div className="text-gray-400">New York Frequency</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-400 font-bold text-xl">Hip Hop</div>
                  <div className="text-gray-400">& R&B Music</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StickyPlayer />
    </>
  );
}