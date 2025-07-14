import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Play, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useRadio } from "@/contexts/RadioContext";
import type { ShowSchedule, PastShow } from "@shared/schema";

export default function Schedule() {
  const { getColors } = useTheme();
  const colors = getColors();
  const { setCurrentTrack } = useRadio();
  const [selectedPastShow, setSelectedPastShow] = useState<PastShow | null>(null);
  const [selectedWeeklyShow, setSelectedWeeklyShow] = useState<ShowSchedule | null>(null);

  const { data: weeklyShows = [] } = useQuery<ShowSchedule[]>({
    queryKey: ["/api/schedules"],
  });

  const { data: pastShows = [] } = useQuery<PastShow[]>({
    queryKey: ["/api/past-shows"],
  });

  // Filter shows for the next 7 days
  const getNext7DaysShows = (shows: ShowSchedule[]) => {
    const today = new Date();
    const next7Days = [];
    
    // Get current day of week (0 = Sunday, 1 = Monday, etc.)
    const todayDayOfWeek = today.getDay();
    
    // Create array of next 7 days with their day names
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      const dayIndex = (todayDayOfWeek + i) % 7;
      const dayName = dayNames[dayIndex];
      
      // Find shows for this day
      const dayShows = shows.filter(show => show.dayOfWeek === dayName);
      
      if (i === 0) {
        // For today, only show shows that haven't aired yet
        const currentTime = today.getHours() * 60 + today.getMinutes();
        const futureShows = dayShows.filter(show => {
          const [time, period] = show.time.split(' ');
          const [hours, minutes] = time.split(':').map(Number);
          let showTime = hours * 60 + minutes;
          
          if (period === 'PM' && hours !== 12) {
            showTime += 12 * 60;
          } else if (period === 'AM' && hours === 12) {
            showTime = minutes;
          }
          
          return showTime > currentTime;
        });
        next7Days.push(...futureShows);
      } else {
        next7Days.push(...dayShows);
      }
    }
    
    return next7Days;
  };

  const filteredWeeklyShows = getNext7DaysShows(weeklyShows);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLongDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `0:${mins.toString().padStart(2, '0')}`;
    } else {
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
  };

  const formatDateWithDuration = (date: string | Date, duration?: number) => {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    
    if (duration) {
      const hours = Math.floor(duration / 60);
      const mins = duration % 60;
      if (hours === 0) {
        return `${formattedDate}, ${mins} min`;
      } else if (mins === 0) {
        return `${formattedDate}, ${hours} hr`;
      } else {
        return `${formattedDate}, ${hours} hr ${mins} min`;
      }
    }
    
    return formattedDate;
  };

  const formatTime = (timeString: string) => {
    try {
      // Parse the time string (assuming format like "14:00" or "14:00:00")
      const [hours, minutes] = timeString.split(":").map(Number);

      // Create a date object with today's date and the specified time
      const date = new Date();
      date.setHours(hours, minutes || 0, 0, 0);

      // Format to 12-hour time in user's timezone
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch (error) {
      // Fallback to original time if parsing fails
      return timeString;
    }
  };

  const handlePastShowSelect = (show: PastShow) => {
    setSelectedPastShow(show);
    // Update current track with past show info including formatted date
    const formattedTitle = `${show.title} - ${formatLongDate(show.date)}`;
    setCurrentTrack({
      title: formattedTitle,
      artist: show.host || "Spandex Salvation Radio",
      album: "Past Show Archive",
      artwork: "",
    });
  };

  return (
    <section id="schedule" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-black text-3xl md:text-4xl mb-4 text-black dark:text-white">
            SHOW SCHEDULE
          </h2>
          <p className="text-gray-400 text-lg font-semibold">
            Catch your favorite metal shows and discover new content throughout
            the week.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Schedule */}
          <div>
            <h3
              className="font-black text-xl mb-6 text-center"
              style={{ color: "var(--color-primary)" }}
            >
              This Week's Lineup
            </h3>
            <div className="space-y-4">
              {filteredWeeklyShows.map((show) => (
                <Card
                  key={show.id}
                  className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-4"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: `${colors.primary}80`,
                    boxShadow: `0 8px 32px ${colors.primary}20`,
                    height: "160px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${colors.primary}80`;
                    e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
                  }}
                  onClick={() => setSelectedWeeklyShow(show)}
                >
                  <CardContent
                    className="p-0"
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="text-center mb-2">
                      <h4 className="font-black text-lg">
                        {show.title}
                      </h4>
                      <p className="text-gray-500 text-sm font-semibold mt-1">
                        Hosted by: {show.host}
                      </p>
                    </div>
                    <p className="text-gray-400 text-sm font-semibold mb-1 text-center flex-1">
                      {show.description}
                    </p>
                    <div
                      className="flex items-center justify-center space-x-2"
                      style={{ marginTop: "auto", paddingTop: "8px" }}
                    >
                      <Calendar className="text-gray-500 h-3 w-3" />
                      <span className="text-gray-500 text-xs font-bold">
                        {show.dayOfWeek} at {formatTime(show.time)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Past Shows Archive */}
          {pastShows.length > 0 && (
            <div>
              <h3
                className="font-black text-xl mb-6 text-center"
                style={{ color: colors.primary }}
              >
                Past Shows
              </h3>
              <div className="space-y-4">
                {pastShows.slice(0, 3).map((show) => (
                  <Card
                    key={show.id}
                    className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-6"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: `${colors.primary}80`,
                      boxShadow: `0 8px 32px ${colors.primary}20`,
                      minHeight: "fit-content",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.primary;
                      e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${colors.primary}80`;
                      e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
                    }}
                    onClick={() => handlePastShowSelect(show)}
                  >
                    <CardContent
                      className="p-0"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {/* Title */}
                      <div className="text-center">
                        <h4 
                          className="font-black text-lg"
                          style={{ color: colors.text }}
                        >
                          {show.title}
                        </h4>
                      </div>
                      
                      {/* Description */}
                      <p 
                        className="text-sm font-semibold text-center text-gray-400"
                        style={{ 
                          minHeight: "40px", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center" 
                        }}
                      >
                        {show.description || "Past episode archive"}
                      </p>
                      
                      {/* Date with Duration */}
                      <div
                        className="flex items-center justify-center space-x-2"
                        style={{ marginTop: "8px" }}
                      >
                        <Calendar className="text-gray-500 h-3 w-3" />
                        <span className="text-gray-500 text-xs font-bold">
                          {formatDateWithDuration(show.date, show.duration)}
                        </span>
                      </div>
                      
                      {/* Play Button */}
                      <Button
                        className="mx-auto px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 hover:scale-105"
                        style={{
                          backgroundColor: colors.primary,
                          color: "white",
                          border: "none",
                          width: "120px",
                          height: "36px",
                          minWidth: "120px",
                          maxWidth: "120px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.secondary || colors.primary;
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.primary;
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePastShowSelect(show);
                        }}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Play Show
                      </Button>
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
              backgroundColor: "transparent",
              width: "25%",
              minWidth: "200px",
              maxWidth: "300px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
              e.currentTarget.style.color = "white";
              e.currentTarget.style.borderColor = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.primary;
              e.currentTarget.style.borderColor = colors.primary;
            }}
          >
            VIEW ALL ARCHIVES
          </Button>
        </div>
      </div>

      {/* Weekly Show Details Modal */}
      {selectedWeeklyShow && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
          onClick={() => setSelectedWeeklyShow(null)}
        >
          <div
            className="bg-background/95 backdrop-blur-sm border-2 rounded-xl p-8 max-w-md w-full mx-4 relative"
            style={{
              borderColor: colors.primary,
              backgroundColor: colors.background,
              boxShadow: `0 25px 50px ${colors.primary}40`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedWeeklyShow(null)}
              className="absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:scale-110 flex items-center justify-center"
              style={{
                color: colors.primary,
                backgroundColor: `${colors.primary}20`,
                width: "40px",
                height: "40px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${colors.primary}20`;
                e.currentTarget.style.color = colors.primary;
              }}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="text-center space-y-4">
              {/* Title */}
              <h2 
                className="font-black text-2xl"
                style={{ color: colors.text }}
              >
                {selectedWeeklyShow.title}
              </h2>

              {/* Host */}
              <p 
                className="font-semibold text-base"
                style={{ color: colors.text }}
              >
                Hosted by: {selectedWeeklyShow.host}
              </p>

              {/* Date and Time */}
              <div className="flex items-center justify-center space-x-2">
                <Calendar 
                  className="h-4 w-4"
                  style={{ color: colors.primary }}
                />
                <span 
                  className="text-sm font-bold"
                  style={{ color: colors.text }}
                >
                  {selectedWeeklyShow.dayOfWeek} at {formatTime(selectedWeeklyShow.time)}
                </span>
              </div>

              {/* Description */}
              <p 
                className="text-gray-400 text-sm font-semibold leading-relaxed"
              >
                {selectedWeeklyShow.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
