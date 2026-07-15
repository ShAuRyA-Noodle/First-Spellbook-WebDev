# Lecture 123 — `Script`, `Link` & `Image` Components in Next.js

> **Course folder:** `Lec-123 Script , Link ,  Image Components in NextJS`
> **Next.js version used:** `14.1.0` (App Router) · React 18 · Tailwind CSS 3

---

## 1. Overview

Next.js ships **built-in optimization components** that replace common HTML tags with smarter, framework-aware versions:

| HTML tag | Next.js component | Import from | What it optimizes |
|---|---|---|---|
| `<a>` | `<Link>` | `next/link` | Client-side (SPA) navigation + route **prefetching** |
| `<img>` | `<Image>` | `next/image` | Automatic resizing, lazy loading, **priority** hints, layout-shift prevention |
| `<script>` | `<Script>` | `next/script` | Controlled loading **strategy** so third-party JS never blocks rendering |

This lecture ships **two small, fully-built Next.js apps** that put those three components on display in very different ways:

- **`comps/` — "next.lab"** — a dark, developer-tool-styled *playground*. Every page is a hands-on lab for one component, and a persistent **console dock** at the bottom of the screen live-logs every Link navigation, Image load, and Script firing in real time — so the optimization is something you *watch happen*, not something you take on faith.
- **`website/` — "Studio Lumen"** — a warm, editorial *real site* (an architectural photography studio) that uses the same three components the way a production app actually would: a shared layout with `Navbar`/`Footer`, a hero `<Image priority>`, a lazy-loaded photo grid, and two `<Script>` widgets that visibly turn "on" once they load.

---

## 2. What You'll Learn

- Why `<Link>` beats a plain `<a>` tag — client-side navigation, no full reload, automatic prefetching — and how to *prove* it's happening without opening DevTools (watch a counter that only resets on a real reload).
- How `<Image>` optimizes images: the `priority` prop for above-the-fold images vs. the default lazy behavior for everything else, and the required `fill` + positioned-parent (or `width`/`height`) pattern.
- Why **local images in `public/` are the safest choice** for `next/image` (no remote hostname to whitelist, works offline) — and why even *local* SVGs need an explicit opt-in (`images.dangerouslyAllowSVG`) in `next.config.mjs`.
- How `<Script>` lets you pick *when* code runs via the `strategy` prop — `beforeInteractive`, `afterInteractive`, `lazyOnload` — and how to prove the difference with **real, measured timestamps** instead of three `alert()` popups.
- How to compose a **layout** with reusable `Navbar`/`Footer` components so chrome renders once and content swaps underneath it.
- A few real-world landmines: **hydration mismatches** (reading `window` in a `useState` initializer), Tailwind's **content-scanning** blind spot (classes referenced only from a file outside `content: [...]` never ship), and animating **`transform`/`opacity`** instead of layout-triggering properties like `width`.

---

## 3. The Two Apps in This Folder

```
Lec-123 Script , Link ,  Image Components in NextJS/
├── comps/      ← Demo app #1: "next.lab" — a dev-tool-styled playground with a live console
├── website/    ← Demo app #2: "Studio Lumen" — a real, cohesive site using all three components
└── README.md   ← (this file — the lecture notes)
```

### `comps/` — "next.lab"

A dark, monospace-accented playground built to make the three components *observable*. Three labs, one home page, one signature feature tying them together:

- **The console dock** (`components/ConsoleDock.js`) — fixed to the bottom of every page, it live-logs every Link navigation, Image load, and Script firing, timestamped in seconds since the page mounted. It's fed by a tiny pub/sub (`lib/logBus.js`) that any component — React or a raw inline `<script>` — can push into.
- **The uptime badge** (in `components/Navbar.js`) — a counter that starts when the root layout mounts. Client-side `<Link>` navigation never resets it; a plain `<a>` always does, because a full reload remounts everything. That's the visible proof `<Link>` avoided a reload.
- Routes: `/` (overview + priority hero image), `/link-lab` (`<Link>` vs `<a>`), `/image-lab` (priority vs. lazy `<Image>`), `/script-lab` (all three `<Script>` strategies on one real timeline).

**Project tree — `comps/`:**

```
comps/
├── app/
│   ├── image-lab/
│   │   └── page.js        ← priority hero + lazy 6-tile grid, timestamped on load
│   ├── link-lab/
│   │   └── page.js        ← <Link> vs <a>, same destination, watch the uptime badge
│   ├── script-lab/
│   │   └── page.js        ← beforeInteractive / afterInteractive / lazyOnload timeline
│   ├── favicon.ico
│   ├── globals.css        ← dark "lab" theme tokens, focus rings, reduced-motion overrides
│   ├── layout.js          ← root layout: beforeInteractive <Script>, Navbar, ConsoleDock
│   └── page.js             ← Home: priority hero <Image> + 3 lab cards
├── components/
│   ├── ConsoleDock.js      ← the signature live log panel
│   ├── ImageTile.js        ← <Image> wrapper that timestamps onLoad into the console
│   ├── LabCard.js          ← accent-colored card linking to each lab
│   ├── LinkVsAnchor.js     ← the <Link> vs <a> comparison widget
│   ├── Navbar.js           ← <Link> nav + the uptime badge
│   ├── RouteWatcher.js     ← invisible: logs every client-side route change
│   └── ScriptTimeline.js   ← renders window.__NEXTLAB_TIMINGS__ as a live bar chart
├── lib/
│   └── logBus.js           ← window-CustomEvent pub/sub shared by React + raw <script>s
├── public/
│   ├── images/              ← hero.svg + 6 tile-NN.svg (hand-authored, local, offline-safe)
│   └── scripts/
│       └── lazy-widget.js  ← external file loaded with strategy="lazyOnload"
├── .eslintrc.json
├── jsconfig.json           ← "@/*" path alias
├── next.config.mjs         ← images.dangerouslyAllowSVG (+ remotePatterns example, commented)
├── package.json
├── postcss.config.js
├── README.md               ← untouched create-next-app boilerplate
└── tailwind.config.js      ← lab color tokens (link/image/script accents), Inter + JetBrains Mono
```

### `website/` — "Studio Lumen"

A small, cohesive site for a fictional architectural-photography studio — warm paper tones, a serif display face, a recurring "contact sheet" motif (numbered frames, hairline borders) that ties the brand together:

- `components/Navbar.js` / `components/Footer.js` — shared chrome via `<Link>`, composed once in `app/layout.js`.
- `app/page.js` — a `priority` hero `<Image>` and a lazy-loaded 6-image "contact sheet" gallery (`components/GalleryFrame.js`).
- `app/about/page.js` — a lazy banner image and the studio's process.
- `app/contact/page.js` — a real (non-functional) enquiry form, plus two `<Script>` demos: an `afterInteractive` "availability" status and a `lazyOnload` "booking assistant" widget, each with a **visible** on/off state change instead of an `alert()`.
- Routes: `/` (Image demo), `/about`, `/contact` (Script demo).

**Project tree — `website/`:**

```
website/
├── app/
│   ├── about/
│   │   └── page.js        ← lazy banner image + studio process, own metadata
│   ├── contact/
│   │   └── page.js        ← afterInteractive + lazyOnload <Script> demos, own metadata
│   ├── favicon.ico
│   ├── globals.css        ← warm "paper" theme tokens, film-grain texture, focus rings
│   ├── layout.js          ← root layout: Navbar + {children} + Footer
│   └── page.js             ← Home: priority hero <Image> + lazy contact-sheet gallery
├── components/
│   ├── ContactForm.js      ← client component, local state, no real submission
│   ├── Footer.js           ← <Link> nav, dynamic © year
│   ├── GalleryFrame.js     ← numbered "contact sheet" frame around next/image
│   └── Navbar.js           ← <Link> nav with active-route underline
├── public/
│   ├── images/              ← hero-studio.svg, about-banner.svg, gallery-01..06.svg
│   └── scripts/
│       └── booking-widget.js ← external file loaded with strategy="lazyOnload"
├── .eslintrc.json
├── jsconfig.json           ← "@/*" path alias
├── next.config.mjs         ← images.dangerouslyAllowSVG (+ remotePatterns example, commented)
├── package.json
├── postcss.config.js
├── README.md               ← untouched create-next-app boilerplate
└── tailwind.config.js      ← studio color tokens (paper/ink/clay), Fraunces + Work Sans
```

---

## 4. Concept Deep-Dives (with the actual current code)

### 4.1 `<Link>` — client-side navigation, proven live

A plain `<a href="/about">` triggers a **full page reload**. `<Link>` performs **SPA-style client-side navigation** instead — Next.js swaps only the route's content, preserving app state and skipping the reload. In production it also **prefetches** in-viewport routes automatically.

`comps/` makes this provable without DevTools: an **uptime counter** in the navbar starts when the root layout mounts and only resets on a real document reload.

**`comps/components/Navbar.js` — the uptime badge (verbatim excerpt):**

```jsx
/**
 * The uptime counter is the whole point of this navbar: it starts when the ROOT
 * LAYOUT mounts and never resets during client-side navigation, because
 * next/link swaps only the route segment — the layout (and this component)
 * stays mounted. Click a plain `<a>` instead (see /link-lab) and the browser
 * does a full document reload, which remounts everything and snaps this back
 * to 0. That reset *is* the visible proof that `<Link>` avoided a reload.
 */
function useUptime() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => {
      setSeconds(Math.floor((performance.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return seconds;
}
```

**`comps/components/LinkVsAnchor.js` (verbatim)** — the same destination, reached two ways:

```jsx
"use client";

import Link from "next/link";
import { logEvent } from "@/lib/logBus";

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
```

Both buttons go to `/image-lab`. Click **`<Link>`** and the uptime badge keeps counting — no reload. Click **`<a>`** and it snaps back to `0`.

`comps/components/RouteWatcher.js` reinforces the same point from the other direction — it logs every client-side route change to the console dock, and (because it's invisible, mounted once in the layout) that log line only appears for `<Link>` navigations:

```jsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { logEvent } from "@/lib/logBus";

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
```

`website/components/Navbar.js` shows the more typical, production-shaped usage — active-route styling, no extra instrumentation:

```jsx
<Link
  href={item.href}
  className={`focus-ring relative rounded-sm pb-1 text-sm transition-colors ${
    active ? "text-ink" : "text-ink-soft hover:text-ink"
  }`}
>
  {item.label}
  <span
    className={`absolute inset-x-0 -bottom-0.5 h-px bg-clay transition-opacity ${
      active ? "opacity-100" : "opacity-0"
    }`}
  />
</Link>
```

Key `<Link>` facts:

- `href` is the only required prop; it renders a real `<a>` under the hood, so it stays accessible and SEO-friendly.
- Prefetching is automatic for in-viewport links in **production** builds only — disable per-link with `prefetch={false}`.
- Use `<Link>` for internal routes; keep `<a>` for external URLs (or, as in `comps/link-lab`, for deliberately demonstrating the contrast).

### 4.2 `<Image>` — priority vs. lazy, timestamped

`<Image>` upgrades `<img>` with size optimization, modern formats, **lazy loading by default**, and layout-shift prevention (it requires you to declare dimensions — `width`/`height`, or `fill` inside a sized, `relative` container).

Both apps use **local SVGs in `public/images/`** — the safest option per the lecture: no remote hostname to whitelist, and the demo keeps working offline.

**`comps/components/ImageTile.js` (verbatim)** — wraps `<Image>` with an `onLoad` handler that timestamps the load into the console dock:

```jsx
"use client";

import { useRef } from "react";
import Image from "next/image";
import { logEvent } from "@/lib/logBus";

export default function ImageTile({ src, alt, label, priority = false, className = "" }) {
  const loggedRef = useRef(false);

  return (
    <div className={`relative overflow-hidden rounded-lg border border-lab-border bg-lab-raised ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes="(min-width: 1024px) 33vw, 50vw"
        className="object-cover"
        onLoad={() => {
          if (loggedRef.current) return;
          loggedRef.current = true;
          logEvent(
            "image",
            `${label} loaded (${priority ? "priority — eager" : "default — lazy"}) at ${Math.round(
              performance.now()
            )}ms`
          );
        }}
      />
      <span className="absolute left-2 top-2 rounded border border-lab-border bg-lab-bg/80 px-1.5 py-0.5 font-mono text-[10px] text-lab-ink-soft backdrop-blur">
        {priority ? "priority" : "lazy"}
      </span>
    </div>
  );
}
```

`comps/app/image-lab/page.js` puts one **`priority`** hero above a scroll-forcing spacer, then a grid of six tiles with **no `priority` prop** (the default, lazy, behavior) — scroll down and watch each tile's load get logged the instant it happens:

```jsx
<ImageTile
  src={heroImg}
  alt="Abstract diagram of Link, Image and Script nodes wired together in an optimization pipeline"
  label="Featured hero"
  priority
  className="aspect-[21/9]"
/>
```

```jsx
{TILES.map((src, i) => (
  <ImageTile
    key={i}
    src={src}
    alt={`Abstract optimization node artwork, tile ${i + 1} of ${TILES.length}`}
    label={`Tile ${String(i + 1).padStart(2, "0")}`}
    className="aspect-[4/3]"
  />
))}
```

`website/app/page.js` uses the same `priority` vs. default split in a production-shaped page — a `priority` hero, then a lazy-loaded "contact sheet" gallery:

```jsx
{/*
  priority — the hero is the first thing visible on the page, so we skip
  lazy-loading and let Next.js fetch it eagerly.
*/}
<Image
  src={heroImg}
  alt="Warm, hazy coastal hillside at dusk with a distant architectural silhouette"
  fill
  priority
  sizes="100vw"
  className="object-cover"
/>
```

**`website/components/GalleryFrame.js` (verbatim)** — the recurring "contact sheet" motif, one frame per photo, no `priority`:

```jsx
import Image from "next/image";

export default function GalleryFrame({ src, alt, index, total, caption, priority = false }) {
  return (
    <figure className="group flex flex-col gap-2">
      <div className="relative aspect-[4/5] overflow-hidden border border-ink-ghost">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="frame-number">
          {String(index).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
        <span className="truncate text-xs text-ink-faint">{caption}</span>
      </figcaption>
    </figure>
  );
}
```

**Local SVGs still need an opt-in.** `next/image` runs *every* image — including local, statically-imported ones — through its optimizer, and the optimizer refuses SVG by default (an SVG can carry embedded scripts). Both apps' `next.config.mjs` opt back in for their own trusted, hand-authored assets:

**`comps/next.config.mjs` (verbatim; `website/next.config.mjs` is the same shape with a website-specific comment):**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // This lab renders its diagrams as local SVGs (public/images/*.svg) imported
    // with next/image's static-import form, e.g. `import hero from "@/public/images/hero.svg"`.
    // next/image runs every image — including local ones — through its optimizer,
    // and the optimizer refuses SVG by default (it can carry embedded scripts).
    // These two flags opt back in safely for our own trusted, hand-authored assets.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // If you swap any of these local SVGs for a REMOTE photo later, next/image will
    // refuse to load it until the hostname is whitelisted here, e.g.:
    // remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
```

Without `dangerouslyAllowSVG`, every `<Image src={someSvg} />` in either app would 400 at the `/_next/image` optimizer endpoint. Without a `remotePatterns` entry for a *remote* image's hostname (see the commented example above), you'd instead get:

```
Error: Invalid src prop (https://example.com/photo.jpg) on `next/image`,
hostname "example.com" is not configured under images in your `next.config.js`
```

### 4.3 `<Script>` — three strategies, one real timeline

Dropping a raw `<script>` into a React page can block rendering. `<Script>` from `next/script` loads scripts **without blocking the page**, and the `strategy` prop controls *when* it runs:

| Strategy | When it loads | Typical use |
|---|---|---|
| `beforeInteractive` | Before any Next.js code runs and before the page hydrates. Must live in the **root layout**. | Bot detection, cookie-consent managers, polyfills |
| `afterInteractive` **(default)** | Early, but after hydration begins. | Tag managers, analytics |
| `lazyOnload` | During browser **idle time**, after everything else. | Chat widgets, social embeds, low-priority widgets |

`comps/script-lab` proves the ordering with **real timestamps**, not three `alert()` calls. Every script stamps `performance.now()` onto `window.__NEXTLAB_TIMINGS__` the instant it runs:

**`comps/app/layout.js` — the `beforeInteractive` script (verbatim excerpt; the only strategy that *must* live in the root layout):**

```jsx
<Script id="nextlab-before-interactive" strategy="beforeInteractive">
  {`
    window.__NEXTLAB_TIMINGS__ = window.__NEXTLAB_TIMINGS__ || {};
    window.__NEXTLAB_TIMINGS__.beforeInteractive = performance.now();
    window.__NEXTLAB_BUFFER__ = window.__NEXTLAB_BUFFER__ || [];
    var msg = "beforeInteractive fired at " + Math.round(performance.now()) + "ms — before hydration";
    window.__NEXTLAB_BUFFER__.push({ category: "script", message: msg, t: performance.now() });
    window.dispatchEvent(new CustomEvent("nextlab:log", { detail: { category: "script", message: msg, t: performance.now() } }));
    window.dispatchEvent(new CustomEvent("nextlab:timing"));
  `}
</Script>
```

**`comps/app/script-lab/page.js` — `afterInteractive` (inline, the default) and `lazyOnload` (external file, verbatim excerpt):**

```jsx
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
```

**`comps/public/scripts/lazy-widget.js` (verbatim):**

```js
(function () {
  window.__NEXTLAB_TIMINGS__ = window.__NEXTLAB_TIMINGS__ || {};
  window.__NEXTLAB_TIMINGS__.lazyOnload = performance.now();

  window.__NEXTLAB_BUFFER__ = window.__NEXTLAB_BUFFER__ || [];
  var msg =
    "lazyOnload fired at " + Math.round(performance.now()) + "ms — external file, idle time";
  window.__NEXTLAB_BUFFER__.push({ category: "script", message: msg, t: performance.now() });
  window.dispatchEvent(
    new CustomEvent("nextlab:log", { detail: { category: "script", message: msg, t: performance.now() } })
  );
  window.dispatchEvent(new CustomEvent("nextlab:timing"));
})();
```

`components/ScriptTimeline.js` then renders `window.__NEXTLAB_TIMINGS__` as a live bar chart — `beforeInteractive` already has a value when the component mounts (it ran before hydration); the other two bars fill in as their scripts fire. See §5.1 for the full component and a note on the hydration bug this pattern can introduce if you're not careful.

`website/app/contact/page.js` shows the same three-strategy idea in a *realistic* shape: instead of a console log, each script flips a status pill from "loading" to "ready" — a **visible UI effect**, which is what a real third-party widget would do:

```jsx
{/*
  strategy="afterInteractive" (the default — no strategy prop needed, but
  named for clarity) — an inline script with an id, since Next.js needs one
  to track and dedupe inline script children.
*/}
<Script id="lumen-availability" strategy="afterInteractive">
  {`
    var el = document.getElementById("availability-status");
    if (el) {
      el.textContent = "Open for enquiries — checked just now";
      el.classList.add("pill-ready");
    }
  `}
</Script>

{/*
  strategy="lazyOnload" — external file (public/scripts/booking-widget.js),
  loaded during idle time since a booking widget is the lowest-priority
  thing on this page.
*/}
<Script id="lumen-booking-widget" src="/scripts/booking-widget.js" strategy="lazyOnload" />
```

**`website/public/scripts/booking-widget.js` (verbatim):**

```js
(function () {
  var pill = document.getElementById("booking-widget-status");
  if (!pill) return;
  pill.textContent = "Booking assistant connected — loaded via lazyOnload";
  // Toggle a plain, hand-written CSS class (defined in globals.css) rather than a
  // Tailwind utility class: this file lives in public/scripts/, outside Tailwind's
  // content scan, so any *new* utility class named only here would ship with no
  // matching styles in the compiled CSS.
  pill.classList.add("pill-ready");
})();
```

Two facts both apps put into practice: an inline `<Script>` (children, not `src`) needs an **`id` prop** so Next.js can track and dedupe it; and because `<Script>` participates in client-side navigation, a given script instance runs **once**, not on every re-render.

### 4.4 Layout composition — Navbar + Footer (or Navbar + console dock) on every page

`app/layout.js` wraps every route. Shared chrome goes there once; each page supplies only its own content via `{children}`.

**`website/app/layout.js` (verbatim)** — the textbook shape: `Navbar` + `{children}` + `Footer`:

```jsx
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-worksans" });

export const metadata = {
  title: "Studio Lumen — Architectural Photography",
  description:
    "Studio Lumen is an architectural photography studio working in available light, shot on location, based on the coast and working worldwide.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="flex min-h-screen flex-col bg-paper font-sans text-ink antialiased">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
```

**`comps/app/layout.js` (verbatim)** — the same idea, plus the `beforeInteractive` script and the console dock instead of a footer (see §7 for why):

```jsx
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ConsoleDock from "@/components/ConsoleDock";
import RouteWatcher from "@/components/RouteWatcher";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jbMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jbmono" });

export const metadata = {
  title: "next.lab — Link, Image & Script components",
  description:
    "A hands-on playground for next/link, next/image and next/script, with a live console that logs every optimization in real time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jbMono.variable}`}>
      <body className="min-h-screen bg-lab-bg font-sans text-lab-ink antialiased">
        <Script id="nextlab-before-interactive" strategy="beforeInteractive">
          {/* — see §4.3 for the full script body — */}
        </Script>

        <RouteWatcher />
        <Navbar />

        <main className="mx-auto min-h-[calc(100vh-8.5rem)] max-w-6xl px-6 pb-24 pt-10">
          {children}
        </main>

        <ConsoleDock />
      </body>
    </html>
  );
}
```

What to notice in both:

- **`@/` import alias** — from `jsconfig.json`'s `"paths": { "@/*": ["./*"] }`; used for components (`@/components/Navbar`), the log bus (`@/lib/logBus`), and even images (`@/public/images/hero.svg`).
- **`next/font/google`** — each app downloads its own font family at build time and self-hosts it (no runtime request to Google Fonts). `comps/` pairs **Inter** (UI) with **JetBrains Mono** (timestamps, labels, code); `website/` pairs **Fraunces** (serif display) with **Work Sans** (body) — a deliberately different type pairing for a deliberately different product.
- **Layout-level `metadata`** — the default `<title>`/description; `about`, `contact`, `link-lab`, `image-lab` and `script-lab` all export their own `metadata` to override it per route.

---

## 5. Signature Features (what makes each app more than a template)

### 5.1 `comps/` — the live console dock + timeline

The console dock (`components/ConsoleDock.js`) and the script timeline (`components/ScriptTimeline.js`) are both fed by `lib/logBus.js` — a tiny `window.CustomEvent` pub/sub that works from **anywhere**, including a raw inline `<script>` string that has no access to React imports:

```js
// comps/lib/logBus.js
export const LOG_EVENT = "nextlab:log";

export function logEvent(category, message) {
  if (typeof window === "undefined") return;
  const detail = { category, message, t: performance.now() };
  window.__NEXTLAB_BUFFER__ = window.__NEXTLAB_BUFFER__ || [];
  window.__NEXTLAB_BUFFER__.push(detail);
  window.dispatchEvent(new CustomEvent(LOG_EVENT, { detail }));
}

export function subscribe(handler) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(LOG_EVENT, handler);
  return () => window.removeEventListener(LOG_EVENT, handler);
}

export function drainBuffer() {
  if (typeof window === "undefined") return [];
  return window.__NEXTLAB_BUFFER__ || [];
}
```

Two subtleties worth studying (both are real bugs that were caught and fixed while building this app — worth re-deriving yourself as an exercise, see §8):

1. **The buffer.** A `beforeInteractive` script runs *before* `ConsoleDock` has mounted to add an event listener — so `logEvent` also pushes onto `window.__NEXTLAB_BUFFER__`, and `ConsoleDock` drains that buffer on mount before subscribing live. Without it, the very first log line (`beforeInteractive fired…`) would be silently lost.
2. **Hydration safety in `ScriptTimeline`.** `window.__NEXTLAB_TIMINGS__.beforeInteractive` already has a real value by the time React hydrates on the client — but the *server* render always produces `{}` (there's no `window` on the server). If `ScriptTimeline` read `window` inside its `useState` initializer, the client's first render would differ from the server-rendered HTML it's hydrating onto: a hydration mismatch. The fix is to start both server and first-client renders from the same empty state, and only read `window` a tick later, inside `useEffect`:

```jsx
// comps/components/ScriptTimeline.js (verbatim excerpt)
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
  // ...
}
```

The timeline bars themselves animate with `transform: scaleX(...)`, not `width` — per the Web Interface Guidelines rule "animate only `transform` and `opacity`," since animating `width` triggers layout on every frame.

### 5.2 `website/` — the contact sheet + status pills

`GalleryFrame.js` (see §4.2) is reused on the home page's "Selected work" grid — every photo gets a hairline border and a `01/06`-style frame number in **tabular figures**, echoing a photographer's literal contact sheet. The same visual language (numbered frames, thin borders, small caps captions) recurs on `/about`.

The two `<Script>` demos on `/contact` (§4.3) don't log to a console — they flip a status pill's text and background from a neutral "loading" state to a highlighted "ready" state, using a **hand-written CSS class** (`.pill-ready` in `globals.css`) instead of a Tailwind utility class. That's deliberate: `public/scripts/booking-widget.js` lives outside Tailwind's `content: [...]` scan, so a Tailwind class referenced *only* in that file would compile away to nothing.

---

## 6. How to Run

Each app is independent — install and run them separately (they both default to port 3000).

**Run `comps/`:**

```bash
cd "Lec-123 Script , Link ,  Image Components in NextJS/comps"
npm install
npm run dev
# open http://localhost:3000
```

Things to try: watch the **uptime** badge in the navbar while clicking around; open `/link-lab` and compare `<Link>` vs. `<a>`; open `/image-lab`, scroll, and watch the console log each lazy tile the instant it loads; open `/script-lab` and watch the timeline fill in as `afterInteractive` and `lazyOnload` fire.

**Run `website/`:**

```bash
cd "Lec-123 Script , Link ,  Image Components in NextJS/website"
npm install
npm run dev
# open http://localhost:3000
# (or run alongside comps: npm run dev -- -p 3001)
```

Things to try: the home page hero loads instantly (`priority`); scroll to the "Selected work" grid and watch six lazy images resolve; visit `/contact` and watch the two status pills change from a neutral "loading" state to "ready" as their `<Script>`s fire; submit the enquiry form to see the (local-only) success state.

Production build for either app: `npm run build && npm start`. (Prefetching on `<Link>` is only active in production mode; both apps were verified with `npm run build` — see §7 for what to expect.)

---

## 7. Key Takeaways & Pitfalls

### Takeaways

1. **`<Link>` = SPA navigation + prefetching.** Prove it without DevTools: watch anything that lives in the persistent layout (a timer, a mounted-once console) — it survives `<Link>` navigation and resets on a real `<a>` reload.
2. **`<Image>` = free performance, with one required decision per image**: is it above the fold (`priority`) or not (the lazy default)? Getting this backwards either delays your hero or wastes bandwidth on off-screen images.
3. **Local images in `public/` are the safest default** — no remote hostname to whitelist, works offline. They still go through the optimizer, though: local **SVGs** need `images.dangerouslyAllowSVG` (plus the CSP flags) in `next.config.mjs`, or every `<Image>` referencing one 400s.
4. **`<Script strategy>` controls timing**: `beforeInteractive` (root layout only) → `afterInteractive` (default — analytics) → `lazyOnload` (idle time — widgets). Inline scripts need an `id`.
5. **Layout composition**: shared chrome lives once in `app/layout.js`; pages render only their own content. Reusable UI belongs in `components/`, never in an `app/` route folder (see the pitfall below — this used to be a live bug in `comps/`).
6. **Per-page `metadata` exports** override the layout's defaults — check the browser tab title while navigating between routes in either app.

### Pitfalls (real ones, caught and fixed while building this lecture)

- **A route page imported as a shared component.** An earlier version of `comps/app/layout.js` imported its footer from `app/footer/page.js` — a *route* file, not a `components/` file. It rendered fine, but silently created an unwanted `/footer` route, and that route showed the footer twice (once as page content, once from the layout). The fix — and the current shape of both apps — is the rule stated above: routes live in `app/`, reusable UI lives in `components/`. `comps/` no longer has a footer at all; its console dock (§5.1) does that job instead, by design.
- **Unconfigured SVG in `next/image`.** Even a **local**, statically-imported SVG is routed through the image optimizer, which blocks SVG by default. Forgetting `images.dangerouslyAllowSVG` in `next.config.mjs` breaks every `<Image>` in both apps with a 400 from `/_next/image` — confirmed by testing with the flag removed.
- **Unconfigured *remote* image domain** would be the same failure with a different message: `hostname "..." is not configured under images`. Neither app hits this today (both are 100% local images), but the commented example in each `next.config.mjs` shows the fix if you add one later.
- **Reading `window` inside a `useState` initializer** in a component that's also server-rendered — `ScriptTimeline`'s first pass at this bug would have produced a React hydration-mismatch warning, because the server has no `window.__NEXTLAB_TIMINGS__` to read. See §5.1 for the fix (defer the read to `useEffect`).
- **A Tailwind class that only appears in a file Tailwind never scans.** `public/scripts/booking-widget.js` toggles a "ready" state via `classList.add`, but that file sits outside `tailwind.config.js`'s `content: [...]` globs — any *new* utility class named only there compiles to nothing. Fixed by writing `.pill-ready` as plain CSS in `globals.css` instead of relying on Tailwind's scanner.
- **Animating `width` instead of `transform`.** An earlier version of the script timeline bars animated CSS `width`, which forces layout on every frame. They now animate `transform: scaleX(...)` from a fixed-width track — same visual result, off the layout path.
- **Missing an inline `<Script>`'s `id` prop.** Next.js needs it to track and dedupe inline script children; every inline `<Script>` in both apps now sets one (`nextlab-before-interactive`, `nextlab-after-interactive`, `lumen-availability`, …).
- **`fill` without a positioned, sized parent.** Every `<Image fill>` in both apps sits inside a `relative` wrapper with an explicit `aspect-[...]` (or fixed size) — drop either one and the image collapses or overflows.

---

## 8. Practice Exercises

1. **Reproduce the hydration bug, then fix it.** In `comps/components/ScriptTimeline.js`, change `useState({})` back to `useState(readTimings)` (reading `window` immediately). Run `npm run build && npm start`, open `/script-lab`, and check the browser console for a hydration-mismatch warning. Revert the change and confirm it's gone.
2. **Break the SVG image on purpose.** Remove `dangerouslyAllowSVG` from `comps/next.config.mjs`, restart the dev server, and visit `/image-lab`. Read the resulting error, then put the config back.
3. **Add a fourth lab image and make it remote.** Pick any photo URL, add its hostname to `images.remotePatterns` in `comps/next.config.mjs` (uncomment and edit the example already in the file), and add it as a new, non-priority tile in `/image-lab`. Confirm it loads — and confirm removing the `remotePatterns` entry reproduces the "hostname is not configured" error.
4. **Give the footer links real `<Link>`s.** `website/components/Footer.js` already uses `<Link>` — but if you were converting *`comps/`*'s old anchor-tag footer (see the pitfall in §7), this is where you'd do it: swap every `<a href="...">` for `<Link href="...">` and confirm in the Network tab that footer clicks no longer trigger a full document reload.
5. **Make the console dock persist across a reload.** Right now the log resets on any full page reload (it's stored in React state). Try backing it with `sessionStorage` instead of `window.__NEXTLAB_BUFFER__` alone, and reconcile it with the buffer-draining logic in `ConsoleDock`'s first `useEffect`.
6. **Add a fourth `<Script>` strategy comparison point.** `next/script` also supports `strategy="worker"` (experimental, runs off the main thread via Partytown). Research what it needs, and add a fourth row to `ScriptTimeline`'s `ROWS` array explaining why it can't be measured the same way as the other three (hint: it doesn't share `window` with the main thread).

---

## 9. A Note on the Apps' Own README Files

Both `comps/README.md` and `website/README.md` are the **untouched, auto-generated create-next-app boilerplate** (the standard "Getting Started / run `npm run dev` / deploy on Vercel" text). They contain no lecture-specific content and have been deliberately left as-is — **this file** is the lecture's actual documentation.

## 10. Build Status

Both apps were verified end-to-end while writing this lecture:

- `npm install && npm run build` — clean compile, lint pass, and static prerender of every route, in **both** `comps/` and `website/`.
- `npm run build && npm start`, then smoke-tested with `curl` — every route in both apps returns `200`, the local SVG images resolve through `/_next/image` with a `200` and `image/svg+xml`, both `public/scripts/*.js` files serve directly, and the `.pill-ready` class is present in the compiled CSS for `website/`.
