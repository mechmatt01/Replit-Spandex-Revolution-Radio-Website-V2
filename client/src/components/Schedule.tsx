import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Play, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useRadio } from "@/contexts/RadioContext";
import type { ShowSchedule, PastShow } from "@shared/schema";
import SkeletonLoader from "./SkeletonLoader";
import FadeInView from "./FadeInView";

export default function Schedule() {
  const { getColors, currentTheme } = useTheme();
  const colors = getColors();
  const { setCurrentTrack } = useRadio();
  const [selectedPastShow, setSelectedPastShow] = useState<PastShow | null>(null);
  const [selectedWeeklyShow, setSelectedWeeklyShow] = useState<ShowSchedule | null>(null);
  const [hoveredShow, setHoveredShow] = useState<string | null>(null);

  // Use mock data for Firebase hosting
  const weeklyShows: ShowSchedule[] = [
    {
      id: 1,
      title: "Morning Metal",
      host: "DJ Metalhead",
      dayOfWeek: "Monday",
      time: "9:00 AM",
      duration: 120,
      description: "Start your week with the best metal hits"
    },
    {
      id: 2, 
      title: "Thrash Tuesday",
      host: "DJ Thrash",
      dayOfWeek: "Tuesday",
      time: "7:00 PM",
      duration: 180,
      description: "Pure thrash metal madness"
    },
    {
      id: 3,
      title: "Death Metal Wednesday",
      host: "DJ Death",
      dayOfWeek: "Wednesday", 
      time: "8:00 PM",
      duration: 150,
      description: "The heaviest death metal around"
    }
  ];

  const pastShows: PastShow[] = [
    {
      id: 1,
      title: "Classic Metal Hour",
      host: "DJ Classic",
      date: new Date(),
      duration: 60,
      description: "The best classic metal tracks"
    }
  ];

  const isLoadingShows = false;
  const isLoadingPast = false;

  // Filter shows for the next 7 days with proper chronological ordering
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
      const dayShows = (shows || []).filter(show => show.dayOfWeek === dayName);
      
      if (i === 0) {
        // For today, only show shows that haven't aired yet
        const currentTime = today.getHours() * 60 + today.getMinutes();
        const futureShows = (dayShows || []).filter(show => {
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
        
        // Sort today's future shows by time
        futureShows.sort((a, b) => {
          const timeA = parseTimeToMinutes(a.time);
          const timeB = parseTimeToMinutes(b.time);
          return timeA - timeB;
        });
        
        next7Days.push(...futureShows);
      } else {
        // For future days, sort shows by time
        const sortedDayShows = (dayShows || []).sort((a, b) => {
          const timeA = parseTimeToMinutes(a.time);
          const timeB = parseTimeToMinutes(b.time);
          return timeA - timeB;
        });
        
        next7Days.push(...sortedDayShows);
      }
    }
    
    return next7Days;
  };

  // Helper function to parse time string to minutes
  const parseTimeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    
    if (period === 'PM' && hours !== 12) {
      totalMinutes += 12 * 60;
    } else if (period === 'AM' && hours === 12) {
      totalMinutes = minutes;
    }
    
    return totalMinutes;
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
    <section 
      id="schedule" 
      className="py-20 transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            className="font-orbitron font-black text-3xl md:text-4xl mb-4"
            style={{ 
              color: currentTheme === 'light-mode' ? '#000000' : colors.text 
            }}
          >
            SHOW SCHEDULE
          </h2>
          <p 
            className="text-lg font-semibold"
            style={{ color: colors.textMuted }}
          >
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
              {isLoadingShows ? (
                // Show skeleton loading cards
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="p-6" style={{ backgroundColor: colors.card }}>
                    <div className="flex items-center justify-between mb-4">
                      <SkeletonLoader width="60%" height="20px" />
                      <SkeletonLoader width="40px" height="20px" />
                    </div>
                    <SkeletonLoader width="100%" height="16px" className="mb-2" />
                    <SkeletonLoader width="80%" height="16px" className="mb-4" />
                    <SkeletonLoader width="100%" height="40px" />
                  </Card>
                ))
              ) : (
                (filteredWeeklyShows || []).map((show) => (
                <div key={show.id} className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-2 rounded-2xl overflow-hidden">
                    <div
                      className="absolute inset-0 blur-xl opacity-0 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
                        opacity: hoveredShow === `weekly-${show.id}` ? 0.3 : 0,
                      }}
                    />
                  </div>
                  
                  <Card
                    className="relative group cursor-pointer transition-all duration-300 border-2 p-4"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.primary,
                      boxShadow: `0 8px 32px ${colors.primary}20`,
                      height: "160px",
                      transform: hoveredShow === `weekly-${show.id}` ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onClick={() => setSelectedWeeklyShow(show)}
                    onMouseEnter={() => setHoveredShow(`weekly-${show.id}`)}
                    onMouseLeave={() => setHoveredShow(null)}
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
                </div>
                ))
              )}
            </div>
          </div>

          {/* Past Shows Archive */}
          {(pastShows?.length || 0) > 0 && (
            <div>
              <h3
                className="font-black text-xl mb-6 text-center"
                style={{ color: colors.primary }}
              >
                Past Shows
              </h3>
              <div className="space-y-4">
                {isLoadingPast ? (
                  // Show skeleton loading cards for past shows
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="p-6" style={{ backgroundColor: colors.card }}>
                      <div className="flex items-center justify-between mb-4">
                        <SkeletonLoader width="70%" height="20px" />
                        <SkeletonLoader width="60px" height="30px" />
                      </div>
                      <SkeletonLoader width="100%" height="16px" className="mb-2" />
                      <SkeletonLoader width="85%" height="16px" className="mb-4" />
                      <SkeletonLoader width="50%" height="16px" />
                    </Card>
                  ))
                ) : (
                  (pastShows || []).slice(0, 3).map((show) => (
                  <div key={show.id} className="relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-2 rounded-2xl overflow-hidden">
                      <div
                        className="absolute inset-0 blur-xl opacity-0 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${colors.secondary || colors.primary}, ${colors.accent || colors.primary})`,
                          opacity: hoveredShow === `past-${show.id}` ? 0.3 : 0,
                        }}
                      />
                    </div>
                    
                    <Card
                      className="relative group cursor-pointer transition-all duration-300 border-2 p-4"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.primary,
                        boxShadow: `0 8px 32px ${colors.primary}20`,
                        height: "160px",
                        transform: hoveredShow === `past-${show.id}` ? 'scale(1.05)' : 'scale(1)',
                      }}
                      onClick={() => setSelectedPastShow(show)}
                      onMouseEnter={() => setHoveredShow(`past-${show.id}`)}
                      onMouseLeave={() => setHoveredShow(null)}
                    >
                    <CardContent
                      className="p-0"
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      {/* Left side - Content */}
                      <div style={{
                        flex: "1",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "space-between"
                      }}>
                        {/* Title and Host */}
                        <div className="text-center mb-2">
                          <h4 className="font-black text-lg"
                            style={{ color: colors.text }}
                          >
                            {show.title}
                          </h4>
                          <p className="text-gray-500 text-sm font-semibold mt-1">
                            Hosted by: {show.host || "Spandex Salvation Radio"}
                          </p>
                        </div>
                        
                        {/* Description */}
                        <p className="text-gray-400 text-sm font-semibold text-center flex-1 flex items-center justify-center">
                          {show.description || "Past episode archive"}
                        </p>
                        
                        {/* Date with Duration */}
                        <div
                          className="flex items-center justify-center space-x-2"
                          style={{ marginTop: "auto", paddingTop: "8px" }}
                        >
                          <Calendar className="text-gray-500 h-3 w-3" />
                          <span className="text-gray-500 text-xs font-bold">
                            {formatDateWithDuration(show.date, show.duration)}
                          </span>
                        </div>
                      </div>

                      {/* Right side - Play Button */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "16px"
                      }}>
                        <Button
                          className="rounded-full transition-all duration-300 hover:scale-110"
                          style={{
                            backgroundColor: colors.primary,
                            color: "white",
                            border: "none",
                            width: "48px",
                            height: "48px",
                            minWidth: "48px",
                            maxWidth: "48px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.secondary || colors.primary;
                            e.currentTarget.style.transform = "scale(1.1)";
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
                          <Play className="h-5 w-5" style={{ strokeLinecap: "round", strokeLinejoin: "round" }} fill="currentColor" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Centered View All Archives Button - Outside grid for full page centering */}
        <div className="mt-12 flex justify-center w-full">
          <Button
            className="px-6 py-3 rounded-full font-bold transition-all duration-300 border-0"
            style={{
              backgroundColor: colors.primary,
              color: colors.primaryText || "white",
              width: "25%",
              minWidth: "200px",
              maxWidth: "300px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryDark || colors.primary;
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            VIEW ALL ARCHIVES
          </Button>
        </div>
      </div>

      {/* Weekly Show Details Modal */}
      {selectedWeeklyShow && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedWeeklyShow(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100vw',
          }}
        >
          <div
            className="bg-background/95 backdrop-blur-sm border-2 rounded-xl p-8 max-w-md w-full relative"
            style={{
              borderColor: colors.primary,
              backgroundColor: colors.background,
              boxShadow: `0 25px 50px ${colors.primary}40`,
              margin: 'auto',
              maxHeight: '90vh',
              overflow: 'auto',
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

      {/* Past Show Details Modal */}
      {selectedPastShow && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPastShow(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100vw',
          }}
        >
          <div
            className="bg-background/95 backdrop-blur-sm border-2 rounded-xl p-8 max-w-md w-full relative"
            style={{
              borderColor: colors.primary,
              backgroundColor: colors.background,
              boxShadow: `0 25px 50px ${colors.primary}40`,
              margin: 'auto',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPastShow(null)}
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
                {selectedPastShow.title}
              </h2>

              {/* Host */}
              <p 
                className="font-semibold text-base"
                style={{ color: colors.text }}
              >
                Hosted by: {selectedPastShow.host}
              </p>

              {/* Date */}
              <div className="flex items-center justify-center space-x-2">
                <Calendar 
                  className="h-4 w-4"
                  style={{ color: colors.primary }}
                />
                <span 
                  className="text-sm font-bold"
                  style={{ color: colors.text }}
                >
                  {formatLongDate(selectedPastShow.date)}
                </span>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-center space-x-2">
                <Clock 
                  className="h-4 w-4"
                  style={{ color: colors.primary }}
                />
                <span 
                  className="text-sm font-bold"
                  style={{ color: colors.text }}
                >
                  {selectedPastShow.duration} minutes
                </span>
              </div>

              {/* Description */}
              <p 
                className="text-gray-400 text-sm font-semibold leading-relaxed"
              >
                {selectedPastShow.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
