"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { logEvent } from "@/lib/logBus";

/**
 * Invisible. Logs every route change to the console dock. Because next/link
 * performs client-side navigation, this fires via React's render cycle — no
 * full document reload, no lost React state, no re-running of the root layout.
 * (Click a plain `<a>` and you won't see a new log line here at all: the whole
 * page — including this component — gets torn down and remounted instead.)
 */
export default function RouteWatcher() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      logEvent("link", `layout mounted — now on ${pathname}`);
      return;
    }
    logEvent("link", `client-side navigation → ${pathname} (no reload, state preserved)`);
  }, [pathname]);

  return null;
}
