import LinkVsAnchor from "@/components/LinkVsAnchor";

export const metadata = {
  title: "Link Lab — next.lab",
  description: "See next/link's client-side navigation next to a plain <a> full reload.",
};

export default function LinkLabPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="eyebrow text-link">01 · next/link</span>
        <h1 className="text-3xl font-semibold text-lab-ink">Client-side navigation, proven live</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-lab-ink-soft">
          <code className="kbd">&lt;Link&gt;</code> renders a real <code>&lt;a&gt;</code> under the
          hood — same accessibility, same right-click-to-open-in-new-tab — but its click handler
          intercepts the navigation and swaps route content on the client instead of asking the
          browser to reload. Look at the <span className="text-lab-ink">uptime</span> badge in the
          navbar, then try both buttons below.
        </p>
      </div>

      <LinkVsAnchor />

      <div className="card-surface grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-lab-ink">What to watch</h2>
          <ul className="space-y-1.5 text-sm text-lab-ink-soft">
            <li>• Navbar <span className="kbd">uptime</span> — resets only on the raw &lt;a&gt;.</li>
            <li>• Console dock below — the &lt;a&gt; click log disappears after reload.</li>
            <li>• DevTools → Network — full document request vs. a small RSC fetch.</li>
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-lab-ink">Key facts</h2>
          <ul className="space-y-1.5 text-sm text-lab-ink-soft">
            <li>• <code className="kbd">href</code> is the only required prop.</li>
            <li>• In-viewport links prefetch automatically in production.</li>
            <li>• Disable per-link with <code className="kbd">prefetch=&#123;false&#125;</code>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
