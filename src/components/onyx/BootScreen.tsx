import { useEffect, useState } from "react";
import { Emblem } from "./Emblem";

const KEY = "onyx-booted";

export function BootScreen() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem(KEY)) return;
    setShow(true);
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(100, Math.round(((t - start) / 2200) * 100));
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else dismiss();
    };
    raf = requestAnimationFrame(tick);
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  function dismiss() {
    sessionStorage.setItem(KEY, "1");
    setLeaving(true);
    setTimeout(() => setShow(false), 700);
  }

  if (!show) return null;
  return (
    <div
      onClick={dismiss}
      className={`fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-background transition-all duration-700 ease-out ${leaving ? "scale-110 opacity-0" : "scale-100 opacity-100"}`}
    >
      <div className="relative flex h-64 w-64 items-center justify-center">
        <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-primary/40" />
        <div className="absolute inset-6 animate-spin-rev rounded-full border-t-2 border-r-2 border-gold-glow/70" />
        <div className="absolute inset-12 animate-spin-slow rounded-full border-b-2 border-primary-glow/60" />
        <div className="absolute h-24 w-24 animate-core-pulse rounded-full bg-primary-glow/40 blur-md" />
        <Emblem size={72} />
      </div>
      <div className="mt-8 font-mono text-4xl font-bold text-chassis">{pct}%</div>
      <div className="mt-2 font-mono text-xs tracking-[0.3em] text-primary">// INITIALIZING ONYX PROTOCOL</div>
      <div className="mt-6 h-1 w-56 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary-glow" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-6 font-mono text-[10px] text-muted-foreground">CLICK OR PRESS SPACE TO SKIP</div>
    </div>
  );
}
