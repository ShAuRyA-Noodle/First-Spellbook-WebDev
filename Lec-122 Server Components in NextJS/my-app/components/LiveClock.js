"use client";

// Client Component. This is the smallest possible proof that some work
// can only happen in the browser: a clock that ticks every second needs
// setInterval + useState, neither of which exist on the server once the
// response has been sent. Rendered inside Navbar.js (a Server Component),
// demonstrating the allowed direction: server renders client leaf.

import { useEffect, useState } from "react";

function format(date) {
  return date.toLocaleTimeString("en-GB", { hour12: false });
}

export default function LiveClock() {
  // Start as null so the server-rendered HTML and the first client
  // render match exactly (no hydration mismatch) — the clock "switches
  // on" a moment after hydration, which is itself part of the lesson.
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    console.log(
      "%c[CLIENT] LiveClock mounted in the browser — this line lives only in DevTools, never your terminal.",
      "color:#a78bfa"
    );
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-client-dim/50 px-2.5 py-1 font-mono text-[11px] text-client"
      title='"use client" — updates every second via setInterval + useState'
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-client opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-client" />
      </span>
      <span className="tabular-nums" suppressHydrationWarning>
        {now ? format(now) : "--:--:--"}
      </span>
    </span>
  );
}
