import Script from "next/script";
import ScriptTimeline from "@/components/ScriptTimeline";

export const metadata = {
  title: "Script Lab — next.lab",
  description: "beforeInteractive, afterInteractive and lazyOnload timed on one timeline.",
};

export default function ScriptLabPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="eyebrow text-script">03 · next/script</span>
        <h1 className="text-3xl font-semibold text-lab-ink">Three strategies, one timeline</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-lab-ink-soft">
          Every <code className="kbd">&lt;Script&gt;</code> on this page stamps
          <code className="kbd">performance.now()</code> onto{" "}
          <code className="kbd">window.__NEXTLAB_TIMINGS__</code> the moment it runs, instead of
          popping an <code>alert()</code>. The bars below are built from those real
          timestamps — <code className="kbd">beforeInteractive</code> already ran (in the root
          layout, before this page even hydrated); the other two fill in as they fire.
        </p>
      </div>

      <ScriptTimeline />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-surface flex flex-col gap-2 border-l-2 border-l-script p-5">
          <span className="eyebrow text-script">beforeInteractive</span>
          <p className="text-sm text-lab-ink-soft">
            Must live in the root layout (see <code className="kbd">app/layout.js</code>). Use it
            for code the whole app needs before anything else — bot detection, consent managers,
            polyfills.
          </p>
        </div>
        <div className="card-surface flex flex-col gap-2 border-l-2 border-l-link p-5">
          <span className="eyebrow text-link">afterInteractive</span>
          <p className="text-sm text-lab-ink-soft">
            The default when no <code className="kbd">strategy</code> is passed. Good for
            analytics and tag managers — early, but doesn&apos;t block hydration.
          </p>
        </div>
        <div className="card-surface flex flex-col gap-2 border-l-2 border-l-image p-5">
          <span className="eyebrow text-image">lazyOnload</span>
          <p className="text-sm text-lab-ink-soft">
            Loads during idle time, after everything else. Right for low-priority widgets — chat
            bubbles, embeds — that shouldn&apos;t compete for bandwidth.
          </p>
        </div>
      </div>

      {/*
        strategy="afterInteractive" (the default) — inline script, so it needs an
        `id` prop for Next.js to track and dedupe it across re-renders.
      */}
      <Script id="nextlab-after-interactive" strategy="afterInteractive">
        {`
          window.__NEXTLAB_TIMINGS__ = window.__NEXTLAB_TIMINGS__ || {};
          window.__NEXTLAB_TIMINGS__.afterInteractive = performance.now();
          window.__NEXTLAB_BUFFER__ = window.__NEXTLAB_BUFFER__ || [];
          var msg = "afterInteractive fired at " + Math.round(performance.now()) + "ms — inline, default strategy";
          window.__NEXTLAB_BUFFER__.push({ category: "script", message: msg, t: performance.now() });
          window.dispatchEvent(new CustomEvent("nextlab:log", { detail: { category: "script", message: msg, t: performance.now() } }));
          window.dispatchEvent(new CustomEvent("nextlab:timing"));
        `}
      </Script>

      {/*
        strategy="lazyOnload" — an external file this time (public/scripts/lazy-widget.js),
        to show the more common `src` form alongside the inline demos above.
      */}
      <Script id="nextlab-lazy-widget" src="/scripts/lazy-widget.js" strategy="lazyOnload" />
    </div>
  );
}
