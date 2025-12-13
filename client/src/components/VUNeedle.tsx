import { useEffect, useRef, useState } from "react";

type Props = {
  side?: "left" | "right";
  size?: number;            // overall size in px
  level?: number;           // 0..1 signal level (optional if not wired yet)
  glow?: boolean;           // add subtle LED edge glow
};

export default function VUNeedle({ side = "left", size = 85, level, glow = true }: Props) {
  // If no real level provided, do a gentle idle wiggle so it feels alive.
  const [idle, setIdle] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (level !== undefined) return; // external level will drive the needle
    const tick = () => {
      setIdle(prev => {
        // very small random motion around ~0.15
        const base = 0.12;
        const jitter = (Math.random() - 0.5) * 0.02;
        const next = Math.max(0, Math.min(0.22, base + jitter + prev * 0.92));
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [level]);

  // meter geometry
  const w = size;
  const h = size * 0.55;
  const cx = w / 2;
  const cy = h * 0.9;
  const radius = Math.min(w, h * 1.6) * 0.68;

  // Neve-ish VU needle sweep: about -20 to +3 across ~105 degrees
  const minDeg = -52;  // far left
  const maxDeg =  52;  // far right

  // choose value to display
  const value = level !== undefined ? level : idle;
  const clamped = Math.max(0, Math.min(1, value));
  const angle = minDeg + (maxDeg - minDeg) * clamped;

  // ticks: rough -20 .. +3 marks
  const tickDefs = [
    { v: 0.00, label: "-20" },
    { v: 0.20, label: "-10" },
    { v: 0.40, label: "-5"  },
    { v: 0.60, label: "0"   },
    { v: 0.76, label: "+1"  },
    { v: 0.88, label: "+2"  },
    { v: 1.00, label: "+3"  },
  ];

  const toXY = (deg: number, r: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  return (
   <div
  style={{
    width: w * 0.85,
    height: h * 0.85,
    borderRadius: 12,
    padding: 6,
    background:
      "radial-gradient(100% 100% at 50% 20%, #2b2b2b 0%, #0f0f0f 90%)",
    border: "2px solid #444",
    boxShadow:
      "inset 0 3px 6px rgba(255,255,255,0.05), inset 0 -3px 8px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.6)",
    position: "relative",
  }}

      aria-label={`${side} vintage VU meter`}
    >
      {/* Bezel / frame */}
      <div
        style={{
          position: "absolute",
          inset: 6,
          borderRadius: 12,
          background:
            "radial-gradient(120% 120% at 20% -10%, #3b3b3b 0%, #1e1e1e 55%, #0f0f0f 100%)",
          boxShadow: "inset 0 1px 2px rgba(255,255,255,0.08)",
        }}
      />

      {/* Glass glare */}
      <div
        style={{
          position: "absolute",
          inset: 6,
          borderRadius: 12,
          background:
          "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0) 60%)",          pointerEvents: "none",
        }}
      />

      {/* Scale plate */}
      <svg width={w} height={h} style={{ position: "relative" }}>
        {/* cream plate */}
        <rect
  x={4}
  y={4}
  width={w - 16}
  height={h - 16}
  rx={4}
  fill="#f4e4b0"
  opacity="0.9"
/>

        {/* red zone arc */}
<path
  d={describeArc(cx, cy, radius * 0.78, 28, maxDeg)}
  stroke="#cc1e1e"
  strokeWidth={4}
  fill="none"
  opacity="0.9"
  style={{ filter: "drop-shadow(0 0 1px rgba(255,60,40,0.6))" }}
/>
        {/* main arc baseline */}
<path
  d={describeArc(cx, cy, radius * 0.78, minDeg, maxDeg)}
  stroke="#000"
  strokeWidth={3}
  fill="none"
  opacity="0.6"
/>

        {/* tick marks + labels */}
        {tickDefs.map((t, i) => {
          const d = minDeg + (maxDeg - minDeg) * t.v;
          const inner = toXY(d, radius * 0.70);
          const outer = toXY(d, radius * 0.80);
          const lab = toXY(d, radius * 0.60);
          const isRed = d > 30;
          return (
            <g key={i}>
              <line
                x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke={isRed ? "#b91c1c" : "#111"} strokeWidth={2}
                opacity={isRed ? 0.9 : 0.7}
              />
              <text
                x={lab.x}
                y={lab.y}
                fontSize="10"
                fontWeight={800}
                textAnchor="middle"
                fill={isRed ? "#b91c1c" : "#111"}
              >
                {t.label}
              </text>
            </g>
          );
        })}

        {/* VU legend */}
        <text
          x={cx}
          y={h * 0.55}
          fontSize="16"
          fontWeight={900}
          textAnchor="middle"
          letterSpacing="2"
          fill="#111"
        >
          VU
        </text>

        {/* needle pivot */}
        <circle cx={cx} cy={cy} r={4} fill="#222" />
        {/* needle */}
        <g transform={`rotate(${angle} ${cx} ${cy})`}>
          <line
            x1={cx}
            y1={cy}
            x2={cx + radius * 0.78}
            y2={cy}
            stroke="#ff3b2b"
         strokeWidth={3}
         style={{
         filter: "drop-shadow(0 0 3px rgba(255,60,40,0.4))",
          }}
          />
          {/* needle cap */}
          <circle cx={cx} cy={cy} r={6} fill="#333" stroke="#111" strokeWidth={2} />
        </g>
      </svg>
    </div>
  );
}

/** SVG arc helper (degrees) */
function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, endDeg);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const largeArcFlag = endDeg - startDeg <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}
function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * Math.PI / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
