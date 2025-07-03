import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Play } from "lucide-react";
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
              {weeklyShows.map((show) => (
                <Card
                  key={show.id}
                  className="bg-dark-bg/50 hover:bg-dark-bg/70 transition-all duration-300 border-2"
                  style={{ borderColor: colors.primary, height: "160px" }}
                >
                  <CardContent
                    className="p-4"
                    style={{
                      height: "160px",
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
                    className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 p-4"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: `${colors.primary}40`,
                      boxShadow: `0 8px 32px ${colors.primary}20`,
                      height: "200px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.primary;
                      e.currentTarget.style.boxShadow = `0 15px 50px ${colors.primary}60`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${colors.primary}40`;
                      e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}20`;
                    }}
                    onClick={() => handlePastShowSelect(show)}
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
                        <h4 
                          className="font-black text-lg"
                          style={{ color: colors.text }}
                        >
                          {show.title}
                        </h4>
                        <p 
                          className="text-sm font-semibold mt-1"
                          style={{ color: colors.text }}
                        >
                          {formatLongDate(show.date)}
                        </p>
                      </div>
                      <p 
                        className="text-sm font-semibold mb-2 text-center flex-1 text-gray-400"
                      >
                        {show.description || "Past episode archive"}
                      </p>
                      <div className="text-center mb-2">
                        <span 
                          className="text-sm font-bold"
                          style={{ color: colors.primary }}
                        >
                          {show.duration
                            ? formatDuration(show.duration)
                            : "N/A"}
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-center"
                        style={{ marginTop: "auto", paddingTop: "8px" }}
                      >
                        <div className="flex items-center space-x-2">
                          <Play 
                            className="h-4 w-4"
                            style={{ color: colors.primary }}
                          />
                          <span 
                            className="text-xs font-bold text-gray-400"
                          >
                            Click to Play
                          </span>
                        </div>
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
    </section>
  );
}
