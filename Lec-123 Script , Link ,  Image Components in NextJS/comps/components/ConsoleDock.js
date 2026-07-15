"use client";

import { useEffect, useRef, useState } from "react";
import { subscribe, drainBuffer } from "@/lib/logBus";

const CATEGORY_STYLE = {
  link: { label: "LINK", text: "text-link", dot: "bg-link" },
  image: { label: "IMAGE", text: "text-image", dot: "bg-image" },
  script: { label: "SCRIPT", text: "text-script", dot: "bg-script" },
  system: { label: "SYSTEM", text: "text-lab-ink-soft", dot: "bg-lab-ink-ghost" },
};

const MAX_LOGS = 60;

/**
 * The lab's signature element: a persistent devtools-style console docked to the
 * bottom of every page. Link navigations, Image load events, and Script strategy
 * firings all funnel into it through lib/logBus.js, so you can *see* the three
 * optimization components working without opening the browser's real devtools.
 */
export default function ConsoleDock() {
  const [logs, setLogs] = useState([]);
  const [open, setOpen] = useState(true);
  const listRef = useRef(null);

  useEffect(() => {
    // Replay anything a beforeInteractive <Script> already logged before this
    // component ever mounted, so that event isn't silently lost.
    const buffered = drainBuffer();
    if (buffered.length) {
      setLogs(buffered.map((d, i) => ({ ...d, id: i + 1 })));
    }
    const unsubscribe = subscribe((e) => {
      setLogs((prev) => {
        const next = [...prev, { ...e.detail, id: prev.length + 1 }];
        return next.length > MAX_LOGS ? next.slice(next.length - MAX_LOGS) : next;
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs, open]);

  const counts = logs.reduce(
    (acc, l) => ({ ...acc, [l.category]: (acc[l.category] || 0) + 1 }),
    {}
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-lab-border bg-lab-surface/95 shadow-dock backdrop-blur">
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex w-full items-center justify-between gap-3 px-4 py-2 text-left"
        aria-expanded={open}
        aria-controls="nextlab-console-log"
      >
        <span className="flex items-center gap-2 font-mono text-xs text-lab-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-image pulse-dot" />
          console
          <span className="hidden text-lab-ink-ghost sm:inline">
            — live log of Link / Image / Script events
          </span>
        </span>

        <span className="flex items-center gap-3 font-mono text-[11px] text-lab-ink-faint">
          {["link", "image", "script"].map((c) => (
            <span key={c} className={`flex items-center gap-1 ${CATEGORY_STYLE[c].text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${CATEGORY_STYLE[c].dot}`} />
              {counts[c] || 0}
            </span>
          ))}
          <span className="kbd">{open ? "hide ▾" : "show ▴"}</span>
        </span>
      </button>

      {open && (
        <div id="nextlab-console-log" className="border-t border-lab-border">
          <div ref={listRef} className="max-h-40 overflow-y-auto px-4 py-2">
            {logs.length === 0 ? (
              <p className="py-3 font-mono text-xs text-lab-ink-ghost">
                waiting for events — visit /link-lab, /image-lab or /script-lab and interact
                with the demos.
              </p>
            ) : (
              <ul className="space-y-1">
                {logs.map((l) => {
                  const style = CATEGORY_STYLE[l.category] || CATEGORY_STYLE.system;
                  return (
                    <li
                      key={l.id}
                      className="log-in flex items-baseline gap-2 font-mono text-[12px] leading-relaxed"
                    >
                      <span className="tabular-nums text-lab-ink-ghost">
                        {(l.t / 1000).toFixed(2).padStart(6, "0")}s
                      </span>
                      <span className={`w-14 shrink-0 ${style.text}`}>{style.label}</span>
                      <span className="text-lab-ink-soft">{l.message}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-lab-border px-4 py-1.5">
            <p className="font-mono text-[10px] text-lab-ink-ghost">
              next.lab · Lecture 123 · Script / Link / Image components
            </p>
            <button
              onClick={() => setLogs([])}
              className="focus-ring rounded px-2 py-1 font-mono text-[10px] text-lab-ink-faint hover:text-lab-ink"
              aria-label="Clear console log"
            >
              clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
