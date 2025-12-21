import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { SHOWS, splitPastUpcoming, isLive, formatRange, PHOENIX_TZ } from "@/lib/schedule";

export default function ShowsSection() {
  const { getColors } = useTheme();
  const colors = getColors();
  const [tab, setTab] = React.useState<'upcoming'|'past'>('upcoming');
  const { past, upcoming } = React.useMemo(()=> splitPastUpcoming(), []);
  const data = tab==='upcoming' ? upcoming : past;

  return (
    <section id="shows" className="py-16" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl" style={{ color: colors.text }}>Shows</h2>
          <div className="flex gap-2">
            <Button variant={tab==='upcoming'?'default':'outline'} onClick={()=>setTab('upcoming')} style={tab==='upcoming'?{ backgroundColor: colors.primary, color: colors.textOnPrimary}:{}}>
              Upcoming
            </Button>
            <Button variant={tab==='past'?'default':'outline'} onClick={()=>setTab('past')} style={tab==='past'?{ backgroundColor: colors.primary, color: colors.textOnPrimary}:{}}>
              Past
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map(s => {
            const live = isLive(s);
            return (
              <Card key={s.id} className="shadow-none" style={{ backgroundColor: colors.surface, borderColor: colors.primary }}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold" style={{ color: colors.text }}>{s.title}</h3>
                    {live && <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: colors.primary, color: colors.textOnPrimary }}>LIVE</span>}
                  </div>
                  <div className="text-sm mb-3" style={{ color: colors.textMuted }}>{s.host}</div>
                  <div className="text-sm mb-4" style={{ color: colors.textMuted }}>{formatRange(s.start, s.end)} ({PHOENIX_TZ})</div>
                  <Button variant="ghost" style={{ color: colors.primary }}>Details</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
