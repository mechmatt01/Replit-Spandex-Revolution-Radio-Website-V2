import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Calendar, Clock, Play, X } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTheme } from "../contexts/ThemeContext";
import { useRadio } from "../contexts/RadioContext";
import SkeletonLoader from "./SkeletonLoader";
export default function Schedule() {
    const { getColors, currentTheme } = useTheme();
    const colors = getColors();
    const { setCurrentTrack } = useRadio();
    const [selectedPastShow, setSelectedPastShow] = useState(null);
    const [selectedWeeklyShow, setSelectedWeeklyShow] = useState(null);
    const [hoveredShow, setHoveredShow] = useState(null);
    // Use mock data for Firebase hosting
    const weeklyShows = [
        {
            id: 1,
            title: "Morning Metal",
            host: "DJ Metalhead",
            dayOfWeek: "Monday",
            time: "9:00 AM",
            duration: 120,
            description: "Start your week with the best metal hits",
            isActive: true
        },
        {
            id: 2,
            title: "Thrash Tuesday",
            host: "DJ Thrash",
            dayOfWeek: "Tuesday",
            time: "7:00 PM",
            duration: 180,
            description: "Pure thrash metal madness",
            isActive: true
        },
        {
            id: 3,
            title: "Death Metal Wednesday",
            host: "DJ Death",
            dayOfWeek: "Wednesday",
            time: "8:00 PM",
            duration: 150,
            description: "The heaviest death metal around",
            isActive: true
        }
    ];
    const pastShows = [
        {
            id: 1,
            title: "Classic Metal Hour",
            host: "DJ Classic",
            date: new Date(),
            duration: 60,
            description: "The best classic metal tracks",
            audioUrl: "/audio/classic-metal-hour.mp3"
        }
    ];
    const isLoadingShows = false;
    const isLoadingPast = false;
    // Filter shows for the next 7 days with proper chronological ordering
    const getNext7DaysShows = (shows) => {
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
                    }
                    else if (period === 'AM' && hours === 12) {
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
            }
            else {
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
    const parseTimeToMinutes = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let totalMinutes = hours * 60 + minutes;
        if (period === 'PM' && hours !== 12) {
            totalMinutes += 12 * 60;
        }
        else if (period === 'AM' && hours === 12) {
            totalMinutes = minutes;
        }
        return totalMinutes;
    };
    const filteredWeeklyShows = getNext7DaysShows(weeklyShows);
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };
    const formatLongDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) {
            return `0:${mins.toString().padStart(2, '0')}`;
        }
        else {
            return `${hours}:${mins.toString().padStart(2, '0')}`;
        }
    };
    const formatDateWithDuration = (date, duration) => {
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
            }
            else if (mins === 0) {
                return `${formattedDate}, ${hours} hr`;
            }
            else {
                return `${formattedDate}, ${hours} hr ${mins} min`;
            }
        }
        return formattedDate;
    };
    const formatTime = (timeString) => {
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
        }
        catch (error) {
            // Fallback to original time if parsing fails
            return timeString;
        }
    };
    const handlePastShowSelect = (show) => {
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
    return (_jsxs("section", { id: "schedule", className: "py-20 transition-colors duration-300", style: { backgroundColor: colors.background }, children: [_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "font-orbitron font-black text-3xl md:text-4xl mb-4", style: {
                                    color: currentTheme === 'light-mode' ? '#000000' : colors.text
                                }, children: "SHOW SCHEDULE" }), _jsx("p", { className: "text-lg font-semibold", style: { color: colors.textMuted }, children: "Catch your favorite metal shows and discover new content throughout the week." })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-black text-xl mb-6 text-center", style: { color: "var(--color-primary)" }, children: "This Week's Lineup" }), _jsx("div", { className: "space-y-4", children: isLoadingShows ? (
                                        // Show skeleton loading cards
                                        Array.from({ length: 6 }).map((_, index) => (_jsxs(Card, { className: "p-6", style: { backgroundColor: colors.card }, children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(SkeletonLoader, { width: "60%", height: "20px" }), _jsx(SkeletonLoader, { width: "40px", height: "20px" })] }), _jsx(SkeletonLoader, { width: "100%", height: "16px", className: "mb-2" }), _jsx(SkeletonLoader, { width: "80%", height: "16px", className: "mb-4" }), _jsx(SkeletonLoader, { width: "100%", height: "40px" })] }, index)))) : ((filteredWeeklyShows || []).map((show) => (_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-2 rounded-2xl overflow-hidden", children: _jsx("div", { className: "absolute inset-0 blur-xl opacity-0 transition-opacity duration-300", style: {
                                                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
                                                            opacity: hoveredShow === `weekly-${show.id}` ? 0.3 : 0,
                                                        } }) }), _jsx(Card, { className: "relative group cursor-pointer transition-all duration-300 border-2 p-4 enhanced-glow show-container shadow-none", style: {
                                                        backgroundColor: colors.background,
                                                        borderColor: colors.primary,
                                                        height: "160px",
                                                        transform: hoveredShow === `weekly-${show.id}` ? 'scale(1.05)' : 'scale(1)',
                                                        boxShadow: 'none'
                                                    }, onClick: () => setSelectedWeeklyShow(show), onMouseEnter: () => setHoveredShow(`weekly-${show.id}`), onMouseLeave: () => setHoveredShow(null), children: _jsxs(CardContent, { className: "p-0", style: {
                                                            height: "100%",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                        }, children: [_jsxs("div", { className: "text-center mb-2", children: [_jsx("h4", { className: "font-black text-lg", children: show.title }), _jsxs("p", { className: "text-gray-500 text-sm font-semibold mt-1", children: ["Hosted by: ", show.host] })] }), _jsx("p", { className: "text-gray-400 text-sm font-semibold mb-1 text-center flex-1", children: show.description }), _jsxs("div", { className: "flex items-center justify-center space-x-2", style: { marginTop: "auto", paddingTop: "8px" }, children: [_jsx(Calendar, { className: "text-gray-500 h-3 w-3" }), _jsxs("span", { className: "text-gray-500 text-xs font-bold", children: [show.dayOfWeek, " at ", formatTime(show.time)] })] })] }) })] }, show.id)))) })] }), (pastShows?.length || 0) > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-black text-xl mb-6 text-center", style: { color: colors.primary }, children: "Past Shows" }), _jsx("div", { className: "space-y-4", children: isLoadingPast ? (
                                        // Show skeleton loading cards for past shows
                                        Array.from({ length: 3 }).map((_, index) => (_jsxs(Card, { className: "p-6", style: { backgroundColor: colors.card }, children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx(SkeletonLoader, { width: "70%", height: "20px" }), _jsx(SkeletonLoader, { width: "60px", height: "30px" })] }), _jsx(SkeletonLoader, { width: "100%", height: "16px", className: "mb-2" }), _jsx(SkeletonLoader, { width: "85%", height: "16px", className: "mb-4" }), _jsx(SkeletonLoader, { width: "50%", height: "16px" })] }, index)))) : ((pastShows || []).slice(0, 3).map((show) => (_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-2 rounded-2xl overflow-hidden", children: _jsx("div", { className: "absolute inset-0 blur-xl opacity-0 transition-opacity duration-300", style: {
                                                            background: `linear-gradient(135deg, ${colors.secondary || colors.primary}, ${colors.accent || colors.primary})`,
                                                            opacity: hoveredShow === `past-${show.id}` ? 0.3 : 0,
                                                        } }) }), _jsx(Card, { className: "relative group cursor-pointer transition-all duration-300 border-2 p-4 enhanced-glow show-container shadow-none", style: {
                                                        backgroundColor: colors.background,
                                                        borderColor: colors.primary,
                                                        height: "160px",
                                                        transform: hoveredShow === `past-${show.id}` ? 'scale(1.05)' : 'scale(1)',
                                                        boxShadow: 'none'
                                                    }, onClick: () => setSelectedPastShow(show), onMouseEnter: () => setHoveredShow(`past-${show.id}`), onMouseLeave: () => setHoveredShow(null), children: _jsxs(CardContent, { className: "p-0", style: {
                                                            height: "100%",
                                                            display: "flex",
                                                            flexDirection: "row",
                                                            alignItems: "center",
                                                        }, children: [_jsxs("div", { style: {
                                                                    flex: "1",
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    height: "100%",
                                                                    justifyContent: "space-between"
                                                                }, children: [_jsxs("div", { className: "text-center mb-2", children: [_jsx("h4", { className: "font-black text-lg", style: { color: colors.text }, children: show.title }), _jsxs("p", { className: "text-gray-500 text-sm font-semibold mt-1", children: ["Hosted by: ", show.host || "Spandex Salvation Radio"] })] }), _jsx("p", { className: "text-gray-400 text-sm font-semibold text-center flex-1 flex items-center justify-center", children: show.description || "Past episode archive" }), _jsxs("div", { className: "flex items-center justify-center space-x-2", style: { marginTop: "auto", paddingTop: "8px" }, children: [_jsx(Calendar, { className: "text-gray-500 h-3 w-3" }), _jsx("span", { className: "text-gray-500 text-xs font-bold", children: formatDateWithDuration(show.date, show.duration || 0) })] })] }), _jsx("div", { style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    paddingLeft: "16px"
                                                                }, children: _jsx(Button, { className: "rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-0", style: {
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
                                                                    }, onMouseEnter: (e) => {
                                                                        e.currentTarget.style.backgroundColor = colors.secondary || colors.primary;
                                                                        e.currentTarget.style.transform = "scale(1.1)";
                                                                    }, onMouseLeave: (e) => {
                                                                        e.currentTarget.style.backgroundColor = colors.primary;
                                                                        e.currentTarget.style.transform = "scale(1)";
                                                                    }, onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handlePastShowSelect(show);
                                                                    }, children: _jsx(Play, { className: "h-5 w-5", style: { strokeLinecap: "round", strokeLinejoin: "round" }, fill: "currentColor" }) }) })] }) })] }, show.id)))) })] }))] }), _jsx("div", { className: "mt-12 flex justify-center w-full", children: _jsx(Button, { className: "px-6 py-3 rounded-full font-bold transition-all duration-300 border-0 focus:outline-none focus:ring-0", style: {
                                backgroundColor: colors.primary,
                                color: colors.primaryText || "white",
                                width: "25%",
                                minWidth: "200px",
                                maxWidth: "300px",
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = colors.primaryDark || colors.primary;
                                e.currentTarget.style.transform = "scale(1.05)";
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = colors.primary;
                                e.currentTarget.style.transform = "scale(1)";
                            }, children: "VIEW ALL ARCHIVES" }) })] }), selectedWeeklyShow && (_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4", onClick: () => setSelectedWeeklyShow(null), style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    width: '100vw',
                }, children: _jsxs("div", { className: "bg-background/95 backdrop-blur-sm border-2 rounded-xl p-8 max-w-md w-full relative show-popup-content", style: {
                        borderColor: colors.primary,
                        backgroundColor: colors.background,
                        margin: 'auto',
                        maxHeight: '90vh',
                        overflow: 'auto',
                    }, onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: () => setSelectedWeeklyShow(null), className: "absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-0", style: {
                                color: colors.primary,
                                backgroundColor: `${colors.primary}20`,
                                width: "40px",
                                height: "40px",
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = colors.primary;
                                e.currentTarget.style.color = "white";
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = `${colors.primary}20`;
                                e.currentTarget.style.color = colors.primary;
                            }, title: "Close show details", "aria-label": "Close show details", children: _jsx(X, { className: "h-5 w-5" }) }), _jsxs("div", { className: "text-center space-y-4", children: [_jsx("h2", { className: "font-black text-2xl", style: { color: colors.text }, children: selectedWeeklyShow.title }), _jsxs("p", { className: "font-semibold text-base", style: { color: colors.text }, children: ["Hosted by: ", selectedWeeklyShow.host] }), _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(Calendar, { className: "h-4 w-4", style: { color: colors.primary } }), _jsxs("span", { className: "text-sm font-bold", style: { color: colors.text }, children: [selectedWeeklyShow.dayOfWeek, " at ", formatTime(selectedWeeklyShow.time)] })] }), _jsx("p", { className: "text-gray-400 text-sm font-semibold leading-relaxed", children: selectedWeeklyShow.description })] })] }) })), selectedPastShow && (_jsx("div", { className: "fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4", onClick: () => setSelectedPastShow(null), style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    width: '100vw',
                }, children: _jsxs("div", { className: "bg-background/95 backdrop-blur-sm border-2 rounded-xl p-8 max-w-md w-full relative show-popup-content", style: {
                        borderColor: colors.primary,
                        backgroundColor: colors.background,
                        margin: 'auto',
                        maxHeight: '90vh',
                        overflow: 'auto',
                    }, onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: () => setSelectedPastShow(null), className: "absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-0", style: {
                                color: colors.primary,
                                backgroundColor: `${colors.primary}20`,
                                width: "40px",
                                height: "40px",
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = colors.primary;
                                e.currentTarget.style.color = "white";
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = `${colors.primary}20`;
                                e.currentTarget.style.color = colors.primary;
                            }, title: "Close show details", "aria-label": "Close show details", children: _jsx(X, { className: "h-5 w-5" }) }), _jsxs("div", { className: "text-center space-y-4", children: [_jsx("h2", { className: "font-black text-2xl", style: { color: colors.text }, children: selectedPastShow.title }), _jsxs("p", { className: "font-semibold text-base", style: { color: colors.text }, children: ["Hosted by: ", selectedPastShow.host] }), _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(Calendar, { className: "h-4 w-4", style: { color: colors.primary } }), _jsx("span", { className: "text-sm font-bold", style: { color: colors.text }, children: formatLongDate(selectedPastShow.date) })] }), _jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx(Clock, { className: "h-4 w-4", style: { color: colors.primary } }), _jsxs("span", { className: "text-sm font-bold", style: { color: colors.text }, children: [selectedPastShow.duration, " minutes"] })] }), _jsx("p", { className: "text-gray-400 text-sm font-semibold leading-relaxed", children: selectedPastShow.description })] })] }) }))] }));
}
