import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ShowSchedule, PastShow } from "@shared/schema";

export default function Schedule() {
  const { data: weeklyShows = [] } = useQuery<ShowSchedule[]>({
    queryKey: ["/api/schedules"],
  });

  const { data: pastShows = [] } = useQuery<PastShow[]>({
    queryKey: ["/api/past-shows"],
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <section id="schedule" className="py-20 bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-black text-3xl md:text-4xl mb-4 text-white">
            SHOW SCHEDULE
          </h2>
          <p className="text-gray-400 text-lg font-semibold">
            Catch your favorite metal shows and discover new content throughout the week.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Schedule */}
          <div className="lg:col-span-2">
            <h3 className="font-black text-xl mb-6 text-metal-orange">This Week's Lineup</h3>
            <div className="space-y-4">
              {weeklyShows.map((show) => (
                <Card key={show.id} className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-black text-lg">{show.title}</h4>
                      <span className="text-metal-orange text-sm font-bold">{show.time}</span>
                    </div>
                    <p className="text-gray-400 text-sm font-semibold mb-2">{show.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs font-semibold">Hosted by: {show.host}</span>
                      <div className="flex items-center space-x-2">
                        <Calendar className="text-gray-500 h-3 w-3" />
                        <span className="text-gray-500 text-xs">{show.dayOfWeek}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Past Shows Archive */}
          <div>
            <h3 className="font-black text-xl mb-6 text-metal-gold">Past Shows</h3>
            <div className="space-y-4">
              {pastShows.slice(0, 5).map((show) => (
                <Card key={show.id} className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300">
                  <CardContent className="p-4">
                    <h4 className="font-black mb-2">{show.title}</h4>
                    <p className="text-gray-400 text-sm font-semibold mb-2">{formatDate(show.date)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs font-semibold">
                        {show.duration ? formatDuration(show.duration) : "N/A"}
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-metal-orange hover:text-orange-400 p-0 h-auto"
                      >
                        <Play className="mr-1 h-3 w-3" />
                        Play
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button 
              variant="outline"
              className="w-full mt-6 border-metal-gold text-metal-gold hover:bg-metal-gold hover:text-dark-bg font-semibold transition-all duration-300"
            >
              View All Archives
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
