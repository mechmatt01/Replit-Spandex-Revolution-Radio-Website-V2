import { useQuery } from "@tanstack/react-query";
import { Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { StreamStats } from "@shared/schema";

export default function InteractiveMap() {
  const { data: stats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
  });

  return (
    <section className="py-20 bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 text-white">
            GLOBAL METAL COMMUNITY
          </h2>
          <p className="text-gray-400 text-lg">
            See where metalheads around the world are rocking out to our stream.
          </p>
        </div>

        {/* Map Placeholder */}
        <Card className="bg-dark-bg border-dark-border mb-8">
          <CardContent className="p-8">
            <div className="relative h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
              {/* World map placeholder with listener dots */}
              <div className="text-center">
                <Globe className="text-6xl text-metal-orange mb-4 opacity-50 w-16 h-16 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">Interactive Listener Map</h3>
                <p className="text-gray-400 mb-4">Real-time visualization of global listeners</p>
                <p className="text-sm text-gray-500">(Map integration coming with full launch)</p>
              </div>
              
              {/* Simulated listener dots */}
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-metal-orange rounded-full animate-pulse"></div>
              <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-metal-orange rounded-full animate-pulse"></div>
              <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-metal-orange rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-metal-orange rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-metal-orange mb-2">
              {stats?.currentListeners || 1247}
            </div>
            <div className="text-gray-400 text-sm">Current Listeners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-metal-orange mb-2">
              {stats?.countries || 52}
            </div>
            <div className="text-gray-400 text-sm">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-metal-orange mb-2">
              {stats?.totalListeners ? `${(stats.totalListeners / 1000).toFixed(1)}K` : "45.2K"}
            </div>
            <div className="text-gray-400 text-sm">Total Listeners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-metal-orange mb-2">
              {stats?.uptime || "99.9%"}
            </div>
            <div className="text-gray-400 text-sm">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}
