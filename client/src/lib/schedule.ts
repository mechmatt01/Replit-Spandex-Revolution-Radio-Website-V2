/** @file src/lib/schedule.ts
 * Basic schedule & helpers (Phoenix TZ). Replace with real API later.
 */
export type Show = {
  id: number;
  title: string;
  host: string;
  start: string; // ISO in America/Phoenix
  end: string;   // ISO in America/Phoenix
};

export const PHOENIX_TZ = 'America/Phoenix';

export const SHOWS: Show[] = [
  { id:1, title:'Midnight Metal', host:'DJ Nightblade', start:'2025-12-19T22:00:00', end:'2025-12-20T00:00:00' },
  { id:2, title:'Saturday Shred', host:'Axel V',        start:'2025-12-20T18:00:00', end:'2025-12-20T20:00:00' },
  { id:3, title:'Ballad Hour',     host:'Luna',         start:'2025-12-21T17:00:00', end:'2025-12-21T18:00:00' },
  { id:4, title:'Speed Riffs',     host:'Rex',          start:'2025-12-18T17:00:00', end:'2025-12-18T18:00:00' }
];

export const nowLocal = (): Date => {
  return new Date(
    new Intl.DateTimeFormat('en-US', {
      timeZone: PHOENIX_TZ, hour12:false, year:'numeric', month:'2-digit', day:'2-digit',
      hour:'2-digit', minute:'2-digit', second:'2-digit'
    }).format(new Date())
  );
};

export const isLive = (show: Show, ref: Date = nowLocal()) => {
  const s = new Date(show.start), e = new Date(show.end);
  return ref >= s && ref <= e;
};

export const upcomingSorted = (ref: Date = nowLocal()) => {
  return SHOWS
    .filter(s => new Date(s.end) > ref)
    .sort((a,b)=> new Date(a.start).getTime() - new Date(b.start).getTime());
};

export const computeNowNext = (ref: Date = nowLocal()) => {
  const up = upcomingSorted(ref);
  const now = up.find(s => isLive(s, ref)) || null;
  const next = now ? up[up.findIndex(s=>s.id===now.id)+1] || null : up[0] || null;
  return { now, next };
};

export const splitPastUpcoming = (ref: Date = nowLocal()) => {
  const upcoming = SHOWS.filter(s => new Date(s.start) >= ref).sort((a,b)=> new Date(a.start).getTime() - new Date(b.start).getTime());
  const past = SHOWS.filter(s => new Date(s.end) < ref).sort((a,b)=> new Date(b.start).getTime() - new Date(a.start).getTime());
  return { past, upcoming };
};

export const formatRange = (start: string, end: string) => {
  const s = new Date(start), e = new Date(end);
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: PHOENIX_TZ, weekday:'short', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit' });
  return `${fmt.format(s)} – ${fmt.format(e)}`;
};
