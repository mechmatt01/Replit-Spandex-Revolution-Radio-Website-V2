import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import type { ShowSchedule, PastShow } from "@shared/schema";

export default function Schedule() {
  const { getColors } = useTheme();
  const colors = getColors();
  
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
          <h2 className="font-orbitron font-black text-3xl md:text-4xl mb-4 text-black dark:text-white">
            SHOW SCHEDULE
          </h2>
          <p className="text-gray-400 text-lg font-semibold">
            Catch your favorite metal shows and discover new content throughout the week.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Schedule */}
          <div className="lg:col-span-2">
            <h3 className="font-black text-xl mb-6" style={{ color: 'var(--color-primary)' }}>This Week's Lineup</h3>
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
          {pastShows.length > 0 && (
          <div>
            <h3 className="font-black text-xl mb-6" style={{ color: 'var(--color-primary)' }}>Past Shows</h3>
            <div className="space-y-4">
              {pastShows.slice(0, 3).map((show) => (
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
                        className="p-0 h-auto transition-colors duration-300"
                        style={{ color: 'var(--color-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--color-primary)';
                        }}
                      >
                        <Play className="mr-1 h-3 w-3" />
                        Play
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            

          </div>
          )}
        </div>
        
        {/* Centered View All Archives Button - Outside grid for full page centering */}
        <div className="mt-12 flex justify-center w-full">
          <Button 
            variant="outline"
            className="border-2 px-6 py-3 rounded-full font-bold transition-all duration-200 hover:scale-105"
            style={{
              borderColor: colors.primary,
              color: colors.primary,
              backgroundColor: 'transparent',
              width: '25%',
              minWidth: '200px',
              maxWidth: '300px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = colors.primary;
              e.currentTarget.style.borderColor = colors.primary;
            }}
          >
            VIEW ALL ARCHIVES
          </Button>
        </div>
      </div>
    </section>
  );
}
