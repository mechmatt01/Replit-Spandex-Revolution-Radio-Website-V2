// src/hooks/useStereoVU.ts
import { useEffect, useRef, useState } from "react";

/**
 * Read stereo VU levels (0..1) from an <audio> element using the Web Audio API.
 * Usage:
 *   const audioRef = useRef<HTMLAudioElement|null>(null);
 *   const [L, R] = useStereoVU(audioRef.current);
 */
export function useStereoVU(audioEl: HTMLAudioElement | null) {
  const [L, setL] = useState(0);
  const [R, setR] = useState(0);

  const rafRef = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioEl) return;

    // Create (or re-create) AudioContext for this element
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx: AudioContext = new Ctx();
    ctxRef.current = ctx;

    // Source from the <audio> element
    const source = ctx.createMediaElementSource(audioEl);

    // Split to L/R (handles mono too; we’ll guard below)
    const splitter = ctx.createChannelSplitter(2);
    source.connect(splitter);

    // Two analysers (or one if mono)
    const analyserL = ctx.createAnalyser();
    const analyserR = ctx.createAnalyser();
    analyserL.fftSize = analyserR.fftSize = 1024;
    analyserL.smoothingTimeConstant = analyserR.smoothingTimeConstant = 0.85;

    // Wire: splitter ch0 -> L, ch1 -> R (if no ch1, L will be reused)
    splitter.connect(analyserL, 0);
    splitter.connect(analyserR, 1);

    // Also send to speakers unless you already do elsewhere
    // (Connecting directly is fine; the element's own output can also play)
    source.connect(ctx.destination);

    // Buffers for time-domain RMS
    const bufL = new Uint8Array(analyserL.frequencyBinCount);
    const bufR = new Uint8Array(analyserR.frequencyBinCount);

    // Ballistics (fast attack, slower release)
    let dispL = 0, dispR = 0;
    const ATTACK = 0.65;   // 0..1, higher = faster rise
    const RELEASE = 0.05;  // 0..1, lower = slower fall
    const GAIN = .35;      // sensitivity (boost)

    const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

    const rmsFrom = (buf: Uint8Array) => {
      // Byte time-domain is 0..255 centered at ~128
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const s = (buf[i] - 128) / 128;
        sum += s * s;
      }
      return Math.sqrt(sum / buf.length); // ~0..1
    };

        const toDb = (x: number) => 20 * Math.log10(x + 1e-7);
    const NOISE_FLOOR_DB = -75;
    const CLIP_DB = 0;
	const SHAPE = 2.5;
    const normFromDb = (db: number) => {
      const d = Math.min(CLIP_DB, Math.max(NOISE_FLOOR_DB, db));
      return (d - NOISE_FLOOR_DB) / (CLIP_DB - NOISE_FLOOR_DB);
    };

    const tick = () => {
      analyserL.getByteTimeDomainData(bufL);
      analyserR.getByteTimeDomainData(bufR);

      let rmsL = rmsFrom(bufL);
      let rmsR = rmsFrom(bufR);

      if (rmsR < 1e-6 || Number.isNaN(rmsR)) rmsR = rmsL;

      const dbL = toDb(rmsL * GAIN);
      const dbR = toDb(rmsR * GAIN);

      const nL = normFromDb(dbL);
      const nR = normFromDb(dbR);
      // Curve: pulls the needle LEFT for low/mid levels
      const targetL = Math.pow(nL, SHAPE);
      const targetR = Math.pow(nR, SHAPE);

           // Calibration knobs — adjust without touching the math above
const CAL_SCALE = 1.25;   // lower = less movement (try 0.85 → 0.75)
const CAL_OFFSET = -0.08; // negative = shift LEFT; positive = shift RIGHT

const outL = Math.max(0, Math.min(1, targetL * CAL_SCALE + CAL_OFFSET));
const outR = Math.max(0, Math.min(1, targetR * CAL_SCALE + CAL_OFFSET));

// Ballistics (use outL/outR instead of targetL/targetR)
dispL = outL > dispL
  ? dispL + (outL - dispL) * ATTACK
  : dispL + (outL - dispL) * RELEASE;

dispR = outR > dispR
  ? dispR + (outR - dispR) * ATTACK
  : dispR + (outR - dispR) * RELEASE;


      setL(Math.max(0, Math.min(1, dispL)));
      setR(Math.max(0, Math.min(1, dispR)));

      rafRef.current = requestAnimationFrame(tick);
    };


    // Some browsers require a user gesture before AudioContext runs
    const resumeIfNeeded = () => {
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
    };
    window.addEventListener("pointerdown", resumeIfNeeded, { once: true });
    window.addEventListener("keydown", resumeIfNeeded, { once: true });

    rafRef.current = requestAnimationFrame(tick);

    // Cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointerdown", resumeIfNeeded);
      window.removeEventListener("keydown", resumeIfNeeded);
      try {
        source.disconnect();
        splitter.disconnect();
        analyserL.disconnect();
        analyserR.disconnect();
        ctx.destination.disconnect?.(); // ignore if already disconnected
      } catch {}
      ctx.close().catch(() => {});
    };
  }, [audioEl]);

  return [L, R] as const;
}

export default useStereoVU;
