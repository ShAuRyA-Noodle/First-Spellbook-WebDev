import Link from "next/link";

const features = [
  {
    number: "01",
    title: "File-based routing",
    description:
      "A folder is a route. app/about/page.js is served at /about — no router config, no route table to maintain.",
  },
  {
    number: "02",
    title: "Shared layouts",
    description:
      "layout.js wraps every page once. The navbar and footer you’re looking at right now are written a single time.",
  },
  {
    number: "03",
    title: "Rendering that’s fast by default",
    description:
      "Pages render on the server, so the browser gets real HTML immediately — good for first paint and for search engines.",
  },
];

const notes = [
  {
    date: "2026.07.02",
    title: "Folders are routes now",
    excerpt:
      "Coming from React Router, the App Router’s folder = route convention felt like magic the first time it clicked.",
  },
  {
    date: "2026.07.08",
    title: "One layout, every page",
    excerpt:
      "Moved the navbar out of every page and into layout.js. Deleted a lot of repeated markup in the process.",
  },
  {
    date: "2026.07.14",
    title: "Tailwind + the @/ alias",
    excerpt:
      "Wiring Tailwind’s content globs to the right folders, and cleaning up imports with the @/ path alias.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-dot-grid bg-[length:16px_16px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"
        />

        <div className="relative mx-auto grid max-w-5xl gap-12 px-6 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <p className="font-mono text-sm text-accent">{"// hello world"}</p>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Notes from learning{" "}
              <span className="mark-accent">Next.js</span>, one route at a
              time.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              This site is the lecture demo itself — a small App Router
              project with a real layout, a real navbar, and pages that
              write about what they&rsquo;re built with.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/about"
                className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
              >
                Read the notes
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-line/20 px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-line/40"
              >
                Get in touch
              </Link>
            </div>
          </div>

          {/* Signature: a mock "file tree" card echoing the app/ folder structure */}
          <div className="rounded-2xl border border-line/10 bg-paper-dim shadow-card">
            <div
              className="flex items-center gap-1.5 border-b border-line/10 px-4 py-3"
              aria-hidden="true"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-ink-faint/30" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-faint/30" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-faint/30" />
              <span className="ml-2 font-mono text-xs text-ink-faint">
                app/
              </span>
            </div>
            <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-7 text-ink-soft">
              <code>
                <span className="text-ink-faint">├─ </span>page.js
                <span className="text-accent">{"        → /"}</span>
                {"\n"}
                <span className="text-ink-faint">├─ </span>about/page.js
                <span className="text-accent">{"  → /about"}</span>
                {"\n"}
                <span className="text-ink-faint">└─ </span>contact/page.js
                <span className="text-accent">{"→ /contact"}</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line/10">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="font-mono text-sm text-accent">{"// what’s inside"}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
            Problems this project solves
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="rounded-2xl border border-line/10 p-6"
              >
                <span className="font-mono text-sm text-ink-faint">
                  {feature.number}
                </span>
                <h3 className="mt-3 text-base font-semibold text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent notes */}
      <section className="border-t border-line/10">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <p className="font-mono text-sm text-accent">{"// recent notes"}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
            Latest from the journal
          </h2>

          <div className="mt-10 divide-y divide-line/10 border-y border-line/10">
            {notes.map((note) => (
              <article
                key={note.title}
                className="flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <span className="font-mono text-xs text-ink-faint sm:w-28 sm:shrink-0">
                  {note.date}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    {note.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {note.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-line/10">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Have a question about this build?
            </h2>
            <p className="mt-2 text-ink-soft">
              Happy to talk routing, layouts, or Tailwind setup.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 rounded-full bg-accent px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            Contact me
          </Link>
        </div>
      </section>
    </div>
  );
}
