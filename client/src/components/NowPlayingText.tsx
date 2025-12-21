export function NowPlayingText({ fetchUrl, now, intervalMs = 15000 }: {
fetchUrl?: string;
now?: Track | null;
intervalMs?: number;
}) {
const [track, setTrack] = useState<Track | null>(now ?? null);
const timerRef = useRef<number | null>(null);


useEffect(() => {
if (!fetchUrl) return;


let aborted = false;
const load = async () => {
try {
const payload = await fetchNowPlaying(fetchUrl);
if (!aborted) setTrack(payload.now ?? null);
} catch (e) {
console.error("nowplaying fetch error", e);
}
};


load();
timerRef.current = window.setInterval(load, Math.max(5000, intervalMs));


return () => {
aborted = true;
if (timerRef.current) window.clearInterval(timerRef.current);
};
}, [fetchUrl, intervalMs]);


useEffect(() => {
if (!fetchUrl && now) setTrack(now);
}, [fetchUrl, now]);


return <>{formatTrack(track)}</>;
}