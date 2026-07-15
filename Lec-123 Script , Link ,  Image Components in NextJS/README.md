# Lecture 123 — `Script`, `Link` & `Image` Components in Next.js

> **Course folder:** `Lec-123 Script , Link ,  Image Components in NextJS`
> **Next.js version used:** `14.1.0` (App Router) · React 18 · Tailwind CSS 3

---

## 1. Overview

Next.js is more than a React framework — it ships **built-in optimization components** that replace common HTML tags with smarter, framework-aware versions:

| HTML tag | Next.js component | Import from | What it optimizes |
|---|---|---|---|
| `<a>` | `<Link>` | `next/link` | Client-side (SPA) navigation + route **prefetching** |
| `<img>` | `<Image>` | `next/image` | Automatic resizing, modern formats (WebP/AVIF), **lazy loading**, layout-shift prevention |
| `<script>` | `<Script>` | `next/script` | Controlled loading **strategy** so third-party JS never blocks rendering |

This lecture uses **two small Next.js apps** to demonstrate these components — one "sandbox" app (`comps/`) and one "put-it-together" app (`website/`).

---

## 2. What You'll Learn

- Why `<Link>` from `next/link` beats a plain `<a>` tag (SPA navigation, no full page reload, automatic prefetching in the viewport).
- How `<Image>` from `next/image` optimizes images: lazy loading, resizing, format conversion, and the `fill` / `width` / `height` / `alt` / `src` props.
- Why **remote images must be whitelisted** in `next.config.mjs` via `images.remotePatterns` — and what error you get if you forget.
- How `<Script>` from `next/script` lets you inject JavaScript with different **loading strategies** (`beforeInteractive`, `afterInteractive`, `lazyOnload`) instead of blocking the page.
- How to **compose a layout** with reusable `Navbar` and `Footer` components so they render on every route.
- App Router fundamentals reinforced along the way: `app/layout.js`, folder-based routing (`app/about/page.js` → `/about`), per-page `metadata`, and the `@/` import alias.

---

## 3. The Two Apps in This Folder

```
Lec-123 Script , Link ,  Image Components in NextJS/
├── comps/      ← Demo app #1: Script component demo, slider with plain <img>, Navbar/Footer with <a> tags
├── website/    ← Demo app #2: a small "Facebook" site using <Link>, <Image>, <Script>, and layout composition
└── README.md   ← (this file — the lecture notes)
```

### `comps/` — the components sandbox

A scratch app used during the lecture to experiment:

- `app/about/page.js` demonstrates the **`<Script>`** component with an inline script.
- `app/page.js` builds an image **slider** with plain `<img>` tags (the "before" picture — what we later replace with `<Image>`).
- A `Navbar` component and a `Footer` (created as a *route page* and reused in the layout — an interesting quirk, see §5) use plain `<a>` tags for navigation — the "before" picture for `<Link>`.
- Routes: `/` (slider), `/about` (Script demo), `/contact`, `/footer`.

**Project tree — `comps/`:**

```
comps/
├── app/
│   ├── about/
│   │   └── page.js        ← <Script> demo (inline alert)
│   ├── contact/
│   │   └── page.js        ← simple contact page
│   ├── footer/
│   │   └── page.js        ← Footer component *written as a route page*
│   ├── favicon.ico
│   ├── globals.css        ← Tailwind directives + boilerplate theme vars
│   ├── layout.js          ← Root layout: Navbar + {children} + Footer
│   └── page.js            ← Home: image slider with plain <img>
├── components/
│   └── Navbar.js          ← nav with plain <a> tags
├── public/
│   ├── next.svg
│   └── vercel.svg
├── .eslintrc.json
├── jsconfig.json          ← "@/*" path alias
├── next.config.mjs        ← empty config (no image domains!)
├── package.json
├── postcss.config.js
├── README.md              ← untouched create-next-app boilerplate
└── tailwind.config.js
```

### `website/` — the mini site

The "real" app of the lecture: a tiny Facebook-themed site that **uses all three components properly**:

- `components/Navbar.js` navigates with **`<Link>`**.
- `app/page.js` renders a remote image with **`<Image fill>`**, whitelisted in **`next.config.mjs`**.
- `app/contact/page.js` fires an inline **`<Script>`**.
- `app/layout.js` composes **`Navbar` + page content + `Footer`** so the chrome appears on every route.
- Routes: `/` (Image demo), `/about`, `/contact` (Script demo).

**Project tree — `website/`:**

```
website/
├── app/
│   ├── about/
│   │   └── page.js        ← about page with its own metadata
│   ├── contact/
│   │   └── page.js        ← <Script> demo (inline alert) + metadata
│   ├── favicon.ico
│   ├── globals.css        ← Tailwind directives + boilerplate theme vars
│   ├── layout.js          ← Root layout: Navbar + {children} + Footer
│   └── page.js            ← Home: <Image fill> with remote image
├── components/
│   ├── Footer.js          ← footer (still uses <a> tags)
│   └── Navbar.js          ← nav using <Link> ✅
├── public/
│   ├── next.svg
│   └── vercel.svg
├── .eslintrc.json
├── jsconfig.json          ← "@/*" path alias
├── next.config.mjs        ← images.remotePatterns for www.menucool.com ✅
├── package.json
├── postcss.config.js
├── README.md              ← untouched create-next-app boilerplate
└── tailwind.config.js
```

---

## 4. Concept Deep-Dives (with the actual lecture code)

### 4.1 `<Link>` — client-side navigation + prefetching

A plain `<a href="/about">` triggers a **full page reload**: the browser throws away the current page, re-downloads HTML/CSS/JS, and re-runs everything. `<Link>` from `next/link` instead performs **SPA-style client-side navigation** — Next.js swaps only the route's content in place, preserving app state and skipping the reload.

Bonus: in production, `<Link>` **prefetches** the linked route in the background as soon as the link scrolls into the viewport, so the navigation feels instant when clicked.

**The "after" picture — `website/components/Navbar.js` (verbatim):**

```jsx
import React from 'react'
import Link from 'next/link' 

const Navbar = () => {
  return (
    <nav className='flex justify-between px-4 bg-slate-800 text-white py-4'>
        <div className="logo font-bold">Facebook</div>
        <ul className='flex gap-6'>
            <Link href='/'><li>Home</li></Link>
            <Link href='/about'><li>About</li></Link>
            <Link href='/contact'><li>Contact</li></Link>
        </ul>
    </nav>
  )
}

export default Navbar
```

**The "before" picture — `comps/components/Navbar.js` (verbatim), using `<a>`:**

```jsx
import React from 'react'

const Navbar = () => {
  return (
    <nav className='flex justify-around bg-slate-800 text-white py-4'>
        <div className="logo font-bold">Facebook</div>
        <ul className='flex gap-6'>
            <a href='/'><li>Home</li></a>
            <a href='/about'><li>About</li></a>
            <a href='/contact'><li>Contact</li></a>
        </ul>
    </nav>
  )
}

export default Navbar
```

**Try it yourself:** run each app, open DevTools → Network, and click the nav links. In `comps/` every click re-downloads the whole document (full reload). In `website/` the nav swaps content without a document reload.

Key `<Link>` facts:

- `href` is the only required prop.
- Renders a real `<a>` under the hood — so it's still accessible, right-clickable, and SEO-friendly.
- Prefetching is automatic for in-viewport links in **production** builds (disable per-link with `prefetch={false}`).
- Use `<Link>` for internal routes; keep `<a>` for external URLs.

> Note the markup style here (`<Link><li>…</li></Link>` and `<a><li>…</li></a>`): strictly speaking, valid HTML wants `<li>` as a direct child of `<ul>` (i.e. `<li><Link>…</Link></li>`). It renders fine, but flip the nesting in your own projects.

### 4.2 `<Image>` — automatic image optimization

`<Image>` from `next/image` upgrades `<img>` with:

- **Size optimization** — serves correctly-sized images per device, in modern formats (WebP/AVIF) when the browser supports them.
- **Lazy loading by default** — images outside the viewport are not downloaded until scrolled near.
- **No layout shift** — Next.js requires you to declare dimensions (`width`/`height`, or `fill` inside a sized container) so space is reserved before the image loads.

**`website/app/page.js` (verbatim):**

```jsx
import Image from "next/image";

export default function Home() {
  return (
     <div className="container my-5 size-80 bg-red-300 relative">
      <Image className="mx-auto object-cover" fill={true} src="http://www.menucool.com/slider/prod/image-slider-3.jpg" alt="" />
     </div>
  );
}
```

Props used here:

| Prop | Value in demo | Meaning |
|---|---|---|
| `src` | remote URL on `www.menucool.com` | The image source — can be a local import or a remote URL (remote requires config, see below). |
| `fill` | `true` | Instead of fixed `width`/`height`, the image stretches to fill its **nearest positioned ancestor** — that's why the wrapper `div` has `relative` and a fixed size (`size-80` = 20rem × 20rem). `object-cover` keeps the aspect ratio while cropping. |
| `alt` | `""` (empty) | Required prop. Empty is allowed for decorative images, but real content images should always describe the image for screen readers. |
| `className` | `mx-auto object-cover` | Regular styling passes straight through. |

The alternative to `fill` (not used in this demo, but the more common form) is explicit dimensions, which also prevent layout shift:

```jsx
<Image src="/photo.jpg" width={500} height={300} alt="A description" />
```

**Remote images must be whitelisted.** For security (and to stop your image-optimization endpoint being abused to proxy arbitrary URLs), Next.js refuses to optimize remote images unless the hostname is explicitly allowed. That's what this config does —

**`website/next.config.mjs` (verbatim):**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: 'www.menucool.com',
            port: '', 
          },
        ],
      },
};

export default nextConfig;
```

Without this block, the home page of `website/` would crash with:

```
Error: Invalid src prop (http://www.menucool.com/...) on `next/image`,
hostname "www.menucool.com" is not configured under images in your `next.config.js`
```

**Contrast:** `comps/` never uses `<Image>` — its slider (`comps/app/page.js`) uses plain `<img>` tags, which is why its `next.config.mjs` can stay empty:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

Plain `<img>` "just works" with any URL, but you lose lazy loading, resizing, format conversion, and layout-shift protection — and `next lint` will warn you about it (`@next/next/no-img-element`).

### 4.3 `<Script>` — third-party / inline scripts with loading strategies

Dropping a raw `<script>` tag into a React page is awkward and can block rendering. `<Script>` from `next/script` loads scripts **without blocking the page** and lets you pick *when* the script executes via the `strategy` prop.

**`comps/app/about/page.js` (verbatim):**

```jsx
import React from 'react'
import Script from 'next/script'

const page = () => {
    return (
        <div>
            <Script>
                {`alert("hello")`}
            </Script>
            I am about
        </div>
    )
}

export default page

export const metadata = {
    title: 'About - facebook.com',
    description: 'facebook is a social media platform',
}
```

**`website/app/contact/page.js` (verbatim):**

```jsx
import React from 'react'
import Script from 'next/script'

const contact = () => {
  return (
    <div>
        <Script>
            {`alert("Wecome to contact page");`}
        </Script>
      this is contact
    </div>
  )
}

export default contact

export const metadata = {
    title: "Contact Facebook - Connect with the world",
    description: "This is a page where you can contact facebook and we can connect with the world using facebook",
  };
```

Both demos pass **inline JavaScript as children** — visit `/about` (comps) or `/contact` (website) and an `alert()` pops. In real apps you'll more often load an external script:

```jsx
<Script src="https://example.com/analytics.js" strategy="lazyOnload" />
```

**The `strategy` prop — when does the script fire?**

| Strategy | When it loads | Typical use |
|---|---|---|
| `beforeInteractive` | Before any Next.js code runs and before the page hydrates. Must live in the **root layout** — it's for scripts the whole site needs first. | Bot detection, cookie-consent managers, polyfills |
| `afterInteractive` **(default)** | Early, but **after** some hydration has begun. This is what both lecture demos get since no `strategy` is passed. | Tag managers, analytics |
| `lazyOnload` | During browser **idle time**, after everything else has loaded. | Chat widgets, social embeds — anything low-priority |

Two practical notes the demos surface:

1. Inline scripts (script as children) are officially supposed to carry an **`id` prop** (e.g. `<Script id="welcome-alert">`) so Next.js can track and deduplicate them — the lecture code omits it, which triggers a warning.
2. Because `<Script>` participates in client-side navigation, a given script executes **once per script instance**, not on every re-render — another win over raw `<script>` tags.

### 4.4 Layout composition — Navbar + Footer on every page

The App Router's `app/layout.js` wraps **every route** of the app. Put shared chrome (nav, footer) there once, and each page only supplies its own content via `{children}`.

**`website/app/layout.js` (verbatim):**

```jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Facebook - Connect with the world",
  description: "This is facebook and we can connect with the world using facebook",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <div className="container mx-auto min-h-[85vh]">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
```

What to notice:

- **`@/components/...` alias** — configured in `jsconfig.json`; `@/` points at the app root, so imports don't need `../../` chains.
- **Sticky-ish footer trick** — the content wrapper gets `min-h-[85vh]` so the footer sits near the bottom even on short pages (`comps/` uses `min-h-screen` for the same idea).
- **`next/font/google`** — the Inter font is downloaded at build time and self-hosted; no external font request at runtime.
- **Layout-level `metadata`** — the default `<title>`/`<meta description>`; individual pages (`about`, `contact`) export their own `metadata` to override it per route.

---

## 5. Full Code Walkthrough

### 5.1 `comps/` — file by file

#### `comps/app/layout.js`

```jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "./footer/page";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Facebook - Connect with the world",
  description: "Facebook helps you connect with the world",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body className={inter.className}>
        <Navbar />
        <div className="container max-w-[60rem] mx-auto my-5 min-h-screen">

        {children}
        </div>
        <Footer/>
      </body>
    </html>
  );
}
```

Same shape as `website/`'s layout, with one **quirk worth studying**: `Footer` is imported from `./footer/page` — i.e. from a **route page** (`app/footer/page.js`), not from a `components/` folder. This works because a page file is just a React component, but it has two side effects:

1. The site gets a bonus `/footer` route that renders the footer *as a page*.
2. On `/footer`, the footer appears **twice** — once as the page content and once from the layout.

The `website/` app fixes this by moving `Footer` into `components/Footer.js`. Lesson: **routes live in `app/`, reusable UI lives in `components/`.**

#### `comps/app/page.js` — the slider (home page)

```jsx
'use client'
 

export default function Home() {
  

  return (
    <>
    <div className="hidden  translate-x-[0%] translate-x-[100%] translate-x-[200%]"></div>

      <div className="slider bg-red-500 overflow-hidden flex ">
        <img className="" src="http://www.menucool.com/slider/prod/image-slider-1.jpg" alt="" />
        <img className="" src="http://www.menucool.com/slider/prod/image-slider-2.jpg" alt="" />
        <img className="" src="http://www.menucool.com/slider/prod/image-slider-3.jpg" alt="" />

      </div>
    </>
  );
}
```

- Three plain `<img>` tags side by side in a flex row — the raw material for an image slider. Because they're plain `<img>`, no `next.config.mjs` whitelisting is needed — and none of Next's image optimization happens either.
- `'use client'` marks this a Client Component (needed if you later add slider state/`useEffect`; as written, nothing client-side is used yet).
- The hidden first `div` lists `translate-x-[0%] translate-x-[100%] translate-x-[200%]` — a common Tailwind trick: mentioning arbitrary-value classes *somewhere* in the source forces Tailwind's JIT compiler to generate them, so they can later be applied dynamically (e.g. from slider JS) without being purged. Note that duplicate classes on one element are pointless at runtime — this div exists purely so the classes appear in the source scan.

#### `comps/app/about/page.js`

Shown in full in §4.3 — the `<Script>` demo (`alert("hello")` on visiting `/about`) plus a per-page `metadata` export overriding the layout's title with `About - facebook.com`.

#### `comps/app/contact/page.js`

```jsx
import React from 'react'

const Contact = () => {
  return (
    <div>
      I am contact
    </div>
  )
}

export default Contact
```

Minimal server-component page — exists mainly so the navbar has three working routes.

#### `comps/app/footer/page.js`

```jsx
import React from 'react'

const Footer = () => {
  return (
    <footer className='flex justify-around bg-slate-800 text-white py-4'>
    <div className="text-center">Copyright ©️ Facebook | All rights reserved</div>
    <ul className='flex gap-2 text-sm'>
        <a href='/'><li className='text-xs'>Home</li></a>
        <a href='/about'><li className='text-xs'>About</li></a>
        <a href='/contact'><li className='text-xs'>Contact</li></a>
    </ul>
</footer>
  )
}

export default Footer
```

The footer-as-a-route quirk discussed above. Links are plain `<a>` → full page reloads.

#### `comps/components/Navbar.js`

Shown in full in §4.1 — the `<a>`-tag "before" navbar.

#### `comps/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

Untouched create-next-app boilerplate: the three Tailwind directives, light/dark CSS variables, a gradient body background, and a `text-balance` utility. (`website/app/globals.css` is byte-for-byte identical.)

#### `comps/next.config.mjs`

Empty config (shown in §4.2) — fine here because no `<Image>` is used.

#### `comps/package.json`

```json
{
  "name": "comps",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "next": "14.1.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "eslint": "^8",
    "eslint-config-next": "14.1.0"
  }
}
```

Standard scripts (`dev`/`build`/`start`/`lint`); Next 14.1.0 + Tailwind. (`website/package.json` is identical except `"name": "website"`.)

### 5.2 `website/` — file by file

#### `website/app/layout.js`

Shown in full in §4.4 — composes `Navbar` + `{children}` (in a `min-h-[85vh]` container) + `Footer`, both imported from `@/components/` (the corrected structure).

#### `website/app/page.js`

Shown in full in §4.2 — the `<Image fill>` demo inside a `relative`, fixed-size container.

#### `website/app/about/page.js`

```jsx
import React from 'react'

const about = () => {
  return (
    <div>
      About
    </div>
  )
}

export default about

export const metadata = {
    title: "About Facebook - Connect with the world",
    description: "This is about facebook and we can connect with the world using facebook",
  };
```

Minimal page whose main teaching point is the **per-route `metadata` export** — check the browser tab title change when navigating to `/about`.

#### `website/app/contact/page.js`

Shown in full in §4.3 — `<Script>` demo (alert on visiting `/contact`) + its own `metadata`.

#### `website/components/Navbar.js`

Shown in full in §4.1 — the `<Link>`-powered navbar (the whole point of the lecture's navigation section).

#### `website/components/Footer.js`

```jsx
import React from 'react'

const Footer = () => {
  return (
    <footer className='flex justify-around bg-slate-800 text-white py-4 text-xs'>
    <div className="text-center">Copyright ©️ Facebook | All rights reserved</div>
    <ul className='flex gap-2 text-sm'>
        <a href='/'><li className='text-xs'>Home</li></a>
        <a href='/about'><li className='text-xs'>About</li></a>
        <a href='/contact'><li className='text-xs'>Contact</li></a>
    </ul>
</footer>
  )
}

export default Footer
```

Nearly identical to the comps footer but properly located in `components/`. Note it **still uses `<a>` tags** — clicking footer links causes full reloads even in `website/`. Converting these to `<Link>` is left as an exercise (see §8).

#### `website/app/globals.css`, `website/next.config.mjs`, `website/package.json`

- `globals.css` — identical boilerplate to comps (see §5.1).
- `next.config.mjs` — the `images.remotePatterns` whitelist, shown verbatim in §4.2. This is the file that makes the home page's remote `<Image>` legal.
- `package.json` — identical to comps except `"name": "website"`.

---

## 6. How to Run

Each app is independent — install and run them separately (they'll both default to port 3000, so run one at a time or pass `-p`).

**Run `comps/`:**

```bash
cd "Lec-123 Script , Link ,  Image Components in NextJS/comps"
npm install
npm run dev
# open http://localhost:3000
```

Things to try: visit `/about` → the inline `<Script>` alert fires; click nav links and watch the Network tab do full document reloads (plain `<a>`); visit `/footer` and spot the double footer.

**Run `website/`:**

```bash
cd "Lec-123 Script , Link ,  Image Components in NextJS/website"
npm install
npm run dev
# open http://localhost:3000
# (or run alongside comps: npm run dev -- -p 3001)
```

Things to try: home page serves the remote image through `/_next/image` (check the Network tab — that's the optimizer at work); nav clicks are instant SPA transitions via `<Link>`; `/contact` fires the Script alert; tab titles change per route thanks to `metadata`.

Production build for either app: `npm run build && npm start`. (Prefetching on `<Link>` is only active in production mode.)

---

## 7. Key Takeaways & Pitfalls

### Takeaways

1. **`<Link>` = SPA navigation + prefetching.** Internal navigation should virtually always use `<Link>`; reserve `<a>` for external URLs.
2. **`<Image>` = free performance.** Lazy loading, responsive sizing, modern formats, zero layout shift — but you must declare dimensions (`width`/`height` or `fill` + a `relative` sized parent).
3. **Remote images require `images.remotePatterns`** in `next.config.mjs`. Local images in `public/` or static imports need no config.
4. **`<Script strategy>` controls timing**: `beforeInteractive` (critical, root layout only) → `afterInteractive` (default — analytics) → `lazyOnload` (idle time — widgets).
5. **Layout composition**: shared chrome (Navbar/Footer) lives once in `app/layout.js`; pages only render their own content. Reusable UI belongs in `components/`, not in `app/` route folders.
6. **Per-page `metadata` exports** override the layout's defaults — good for SEO per route.

### Pitfalls (several are live in this lecture's code!)

- **Unconfigured remote image domain** → runtime error `hostname "..." is not configured under images`. `website/` gets this right; if you swapped `comps/`'s `<img>` slider to `<Image>` without touching its empty `next.config.mjs`, it would blow up.
- **Using `<img>` instead of `<Image>`** (comps home page) — silently forfeits every optimization and earns a lint warning. Fine for a quick demo, wrong for production.
- **Using `<a>` instead of `<Link>` for internal routes** (comps Navbar/Footer, and even `website/components/Footer.js`) — full page reloads, lost state, no prefetching.
- **Wrong `<Script>` strategy** — e.g. loading a chat widget `beforeInteractive` delays interactivity for the whole site; loading a consent manager `lazyOnload` means it runs *after* trackers. Match the strategy to the script's urgency. Also: inline `<Script>` children should have an **`id` prop** (both demos omit it and Next warns).
- **`fill` without a positioned parent** — `<Image fill>` needs an ancestor with `position: relative` (the `website/` demo supplies `relative` + `size-80`); forget it and the image fills the viewport or errors.
- **Empty `alt=""` on meaningful images** — allowed only for decoration; both apps use empty `alt`s, which real content shouldn't.
- **Importing a route page as a shared component** (`comps` layout importing `./footer/page`) — works, but creates an unwanted `/footer` route and a duplicated footer. Put shared UI in `components/`.
- **Invalid list nesting** — `<a><li>…</li></a>` / `<Link><li>…</li></Link>` renders, but valid HTML is `<li><Link>…</Link></li>`.

---

## 8. Practice Exercises

1. **Fix the footers.** Convert `comps/app/footer/page.js` into `comps/components/Footer.js` (deleting the accidental `/footer` route from your copy), and replace every `<a>` in both apps' footers with `<Link>`. Verify in the Network tab that footer clicks no longer reload the document.
2. **Optimize the slider.** In `comps/app/page.js`, replace the three `<img>` tags with `next/image` `<Image>` components (`width={960} height={400}` or `fill` in sized wrappers). It will crash — read the error, then add the correct `images.remotePatterns` entry to `comps/next.config.mjs`.
3. **Script strategies experiment.** In `website/app/contact/page.js`, give the inline `<Script>` an `id`, then add an external script (e.g. a dummy `src`) three times with `beforeInteractive`, `afterInteractive`, and `lazyOnload`, and use the Network tab + `console.log` timestamps to observe when each loads. (Remember `beforeInteractive` belongs in the root layout.)
4. **Make the slider slide.** Use the pre-generated Tailwind classes (`translate-x-[0%]`, `translate-x-[100%]`, `translate-x-[200%]`) with `useState` + `setInterval` in the already-client `comps/app/page.js` to cycle the images every 3 seconds.
5. **Fix the semantics + a11y.** Rewrite both navbars so `<li>` wraps `<Link>` (valid HTML), and give the `website/` home `<Image>` a meaningful `alt`. Bonus: run `npm run lint` in `comps/` and clear the `no-img-element` warnings.

---

## 9. A Note on the Apps' Own README Files

Both `comps/README.md` and `website/README.md` are the **untouched, auto-generated create-next-app boilerplate** (the standard "Getting Started / run `npm run dev` / deploy on Vercel" text). They contain no lecture-specific content and have been deliberately left as-is — **this file** is the lecture's actual documentation.
