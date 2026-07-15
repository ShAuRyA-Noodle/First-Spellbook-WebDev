"use client";

import { useEffect, useState } from "react";

const ROWS = [
  {
    key: "beforeInteractive",
    label: "beforeInteractive",
    color: "bg-script",
    note: "root layout only — runs before hydration",
  },
  {
    key: "afterInteractive",
    label: "afterInteractive (default)",
    color: "bg-link",
    note: "runs shortly after the page becomes interactive",
  },
  {
    key: "lazyOnload",
    label: "lazyOnload",
    color: "bg-image",
    note: "runs during browser idle time",
  },
];

function readTimings() {
  if (typeof window === "undefined") return {};
  return { ...(window.__NEXTLAB_TIMINGS__ || {}) };
}

/**
 * Renders the three next/script strategies as a real timeline built from actual
 * performance.now() timestamps captured by each script when it executed — not a
 * mock diagram. beforeInteractive will already have a value (it fired in the
 * root layout before this component even existed); the other two fill in live.
 */
export default function ScriptTimeline() {
  // Start empty on BOTH server and the first client render so the hydrated
  // markup matches the server-rendered markup exactly (window.__NEXTLAB_TIMINGS__
  // already has real values by the time this runs on the client — reading it in
  // the useState initializer would make the first client render diverge from
  // what the server sent, i.e. a hydration mismatch). The real values are picked
  // up a tick later, safely after hydration, inside useEffect.
  const [timings, setTimings] = useState({});

  useEffect(() => {
    setTimings(readTimings());
    const onTiming = () => setTimings(readTimings());
    window.addEventListener("nextlab:timing", onTiming);
    return () => window.removeEventListener("nextlab:timing", onTiming);
  }, []);

  const values = ROWS.map((r) => timings[r.key]).filter((v) => typeof v === "number");
  const max = values.length ? Math.max(...values, 1) : 1;

  return (
    <div className="card-surface flex flex-col gap-4 p-6">
      {ROWS.map((row) => {
        const t = timings[row.key];
        const scale = typeof t === "number" ? Math.max(0.04, t / max) : 0;
        return (
          <div key={row.key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-xs text-lab-ink">
                <span className={`h-1.5 w-1.5 rounded-full ${row.color}`} />
                {row.label}
              </span>
              <span className="font-mono text-xs tabular-nums text-lab-ink-faint">
                {typeof t === "number" ? `${Math.round(t)}ms` : "waiting…"}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-lab-overlay">
              {/* transform (scaleX), not width — keeps this animation off the layout/paint path */}
              <div
                className={`h-full w-full origin-left rounded-full ${row.color} transition-transform duration-500 ease-out motion-reduce:transition-none`}
                style={{ transform: `scaleX(${scale})` }}
              />
            </div>
            <p className="text-xs text-lab-ink-faint">{row.note}</p>
          </div>
        );
      })}
    </div>
  );
}
