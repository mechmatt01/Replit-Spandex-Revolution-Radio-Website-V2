import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { SHOWS, splitPastUpcoming, isLive, formatRange, PHOENIX_TZ } from "@/lib/schedule";
import { Music, Clock } from "lucide-react";

export default function ShowsSection() {
  const { getColors } = useTheme();
  const colors = getColors();
  const [tab, setTab] = React.useState<'upcoming'|'past'>('upcoming');
  const { past, upcoming } = React.useMemo(()=> splitPastUpcoming(), []);
  const data = tab==='upcoming' ? upcoming : past;

  return (
    <section id="shows" className="py-20" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <h2 className="font-orbitron font-black text-4xl md:text-5xl" style={{ color: colors.text }}>
            Shows
          </h2>
          <div className="flex gap-3 bg-opacity-20 rounded-lg p-1" style={{ backgroundColor: `${colors.primary}20` }}>
            <Button 
              variant={tab==='upcoming'?'default':'ghost'} 
              onClick={()=>setTab('upcoming')} 
              className="font-orbitron font-bold transition-all"
              style={tab==='upcoming'?{ backgroundColor: colors.primary, color: colors.textOnPrimary}:{ color: colors.text }}
            >
              Upcoming
            </Button>
            <Button 
              variant={tab==='past'?'default':'ghost'} 
              onClick={()=>setTab('past')} 
              className="font-orbitron font-bold transition-all"
              style={tab==='past'?{ backgroundColor: colors.primary, color: colors.textOnPrimary}:{ color: colors.text }}
            >
              Past
            </Button>
          </div>
        </div>
        
        {data.length === 0 ? (
          <div className="text-center py-12">
            <Music size={48} style={{ color: colors.primary, margin: '0 auto 16px' }} />
            <p className="text-lg" style={{ color: colors.textMuted }}>No {tab} shows scheduled</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map(s => {
              const live = isLive(s);
              return (
                <Card 
                  key={s.id} 
                  className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2" 
                  style={{ 
                    backgroundColor: colors.surface, 
                    borderColor: live ? colors.primary : `${colors.primary}40`,
                    borderWidth: '2px'
                  }}
                >
                  <CardContent className="p-6">
                    {/* Header with title and live badge */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-orbitron font-bold text-lg flex-1" style={{ color: colors.text }}>
                        {s.title}
                      </h3>
                      {live && (
                        <span 
                          className="ml-2 px-3 py-1 rounded-full text-xs font-orbitron font-bold animate-pulse" 
                          style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}
                        >
                          LIVE
                        </span>
                      )}
                    </div>
                    
                    {/* Host */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold" style={{ color: colors.text }}>
                        {s.host}
                      </p>
                    </div>
                    
                    {/* Time */}
                    <div className="flex items-center gap-2 mb-6" style={{ color: colors.textMuted }}>
                      <Clock size={16} />
                      <span className="text-sm">
                        {formatRange(s.start, s.end)} <br/>({PHOENIX_TZ})
                      </span>
                    </div>
                    
                    {/* Details Button */}
                    <Button 
                      className="w-full font-orbitron font-bold transition-all hover:scale-105" 
                      style={{ 
                        backgroundColor: colors.primary, 
                        color: colors.textOnPrimary 
                      }}
                    >
                      Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
