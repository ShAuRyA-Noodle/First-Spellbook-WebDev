"use client";

import Link from "next/link";
import { logEvent } from "@/lib/logBus";

/**
 * Both buttons go to the exact same destination — /image-lab. The only
 * difference is the tag. Watch the "uptime" badge in the navbar:
 *  - <Link>  → uptime keeps counting (client-side navigation, no reload)
 *  - <a>     → uptime snaps back to 0 (the browser reloaded the whole document)
 */
export default function LinkVsAnchor() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="card-surface flex flex-col gap-3 border-l-2 border-l-link p-5">
        <span className="eyebrow text-link">next/link</span>
        <p className="text-sm text-lab-ink-soft">
          Client-side navigation. Prefetches this route in the background when the link
          enters the viewport (production builds only).
        </p>
        <Link
          href="/image-lab"
          onClick={() => logEvent("link", "clicked <Link href=\"/image-lab\"> — SPA navigation")}
          className="focus-ring mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-link px-4 py-2.5 text-sm font-medium text-lab-bg transition-opacity hover:opacity-90"
        >
          Go via &lt;Link&gt; →
        </Link>
      </div>

      <div className="card-surface flex flex-col gap-3 border-l-2 border-l-lab-borderStrong p-5">
        <span className="eyebrow text-lab-ink-faint">plain &lt;a&gt;</span>
        <p className="text-sm text-lab-ink-soft">
          A full browser navigation: the document unloads, every script re-runs, and the
          console history you see below is thrown away.
        </p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/image-lab"
          onClick={() => logEvent("link", "clicked <a href=\"/image-lab\"> — full reload incoming")}
          className="focus-ring mt-auto inline-flex items-center justify-center gap-2 rounded-md border border-lab-borderStrong px-4 py-2.5 text-sm font-medium text-lab-ink-soft transition-colors hover:bg-lab-raised"
        >
          Go via &lt;a&gt; →
        </a>
      </div>
    </div>
  );
}
