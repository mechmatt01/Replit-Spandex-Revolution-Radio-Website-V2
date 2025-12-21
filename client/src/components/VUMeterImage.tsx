import { useState, useEffect, useRef } from "react";

type Props = {
  imgSrc: string;
  size?: number;
  level?: number; // 0–1 for future audio hookup
  glow?: boolean;
};

export default function VUMeterImage({ imgSrc, size = 140, level, glow = true }: Props) {
  // Lean left + smaller sweep
  const minDeg = -150;
  const maxDeg = 65;
  const bias   = -0.00;

  const [angle, setAngle] = useState(minDeg);

// Peak LED (edge trigger + hold that actually finishes)
const [peakOn, setPeakOn] = useState(false);
const prevV = useRef(0);
const holdTimer = useRef<number | null>(null);

// tune these
const PEAK_THRESHOLD = 0.56; // 0.98–0.995 typical
const PEAK_HOLD_MS   = 600;

useEffect(() => {
  const v = Math.max(0, Math.min(1, level ?? 0));
  const crossedUp = prevV.current < PEAK_THRESHOLD && v >= PEAK_THRESHOLD;

  if (crossedUp) {
    setPeakOn(true);
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setPeakOn(false), PEAK_HOLD_MS);
  }

  prevV.current = v;
}, [level]);

// clear timer only on unmount
useEffect(() => {
  return () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
  };
}, []);




   // Drive angle from level (no extra RAF loop)
  useEffect(() => {
    const v = Math.max(0, Math.min(1, (level ?? 0) + bias));
    const target = minDeg + (maxDeg - minDeg) * v;
    setAngle(target);
  }, [level]);

  const cx = size / 1.95;
  const cy = size * 0.50; // pivot point

  return (
   <div
  style={{
    width: size,
    height: size * 0.7,
    position: "relative",
    overflow: "hidden",
    boxShadow: "inset 0 0 6px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.8)", // bezel glow
	borderRadius: size * 0.10,
    backgroundColor: "#111", // dark edge background
  }}
>
   <img
  src={imgSrc}
  alt="VU Meter"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "contain",
    position: "absolute",
    top: 0,
    left: 0,
	zIndex: 0,
    pointerEvents: "none",
  }}
/>

{/* Peak LED (top-right, near +3) */}
<div
  aria-hidden
  style={{
    position: "absolute",
    right: size * 0.06,
    top: size * 0.16,
    width: size * 0.11,
    height: size * 0.11,
    borderRadius: "50%",
    zIndex: 9999, // sits above image & glow
    background: peakOn
      ? "radial-gradient(circle at 35% 35%, #ffefef 0%, #ff4d4d 40%, #c00000 70%, #600000 100%)"
      : "radial-gradient(circle at 35% 35%, #2a2a2a 0%, #1a1a1a 60%, #0d0d0d 100%)",
    boxShadow: peakOn
      ? "0 0 16px 3px rgba(255, 0, 0, 0.85)"
      : "inset 0 0 2px rgba(0,0,0,0.85)",
    opacity: peakOn ? 1 : 0.6,
    transition: "opacity 120ms ease, box-shadow 120ms ease",
    pointerEvents: "none",
  }}
/>


{/* Warm backlight glow */}
<div
  className="vu-glow"
  style={{
    position: "absolute",
    inset: 0,
    background:
  "radial-gradient(circle at 50% 60%, rgba(255,190,90,0.32) 0%, rgba(255,140,50,0.45) 40%, rgba(0,0,0,0.6) 85%)",    mixBlendMode: "screen",
    opacity: glow ? 1 : 0,
    transition: "opacity 1.2s ease-in-out",
    pointerEvents: "none",
  }}
/>

      <svg
        width={size}
        height={size * 0.7}
        style={{ position: "relative",
		zIndex: 4,
		}}
      >
	  {/* LED circle inside SVG (top-right area). Adjust cx/cy to place it over +3 mark. */}
{true && ( /* use peakOn here when verified: peakOn && (...) */
 <circle
  cx={size * 0.86}
  cy={size * 0.16}
  r={size * 0.035}
  fill={peakOn ? "#ff3b3b" : "rgba(0,0,0,0.38)"} // or your face color
  opacity={peakOn ? 1 : 0.6}
/>

)}

        <g transform={`rotate(${angle} ${cx} ${cy})`}>
        <line
  x1={cx}
  y1={cy}
  x2={cx + size * 0.37}
  y2={cy}
  stroke="black"
  strokeWidth={1.3}
  strokeLinecap="round"
  //style={{ filter: "drop-shadow(0 0 0.8px rgba(255,0,0,0.4))" }}

          />
          {/* Needle hub */}
  <circle cx={cx} cy={cy} r={2.8} fill="#111" stroke="#444" strokeWidth="0.6" />
        </g>
      </svg>
    </div>
  );
}
