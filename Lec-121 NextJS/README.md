# Lec-121: Introduction to Next.js — Your First Next.js App

> **Course folder:** `Lec-121 NextJS/` &nbsp;|&nbsp; **Project:** `first/` &nbsp;|&nbsp; **Stack:** Next.js 14.1.0 (App Router) + React 18 + Tailwind CSS 3

---

## 1. Overview — What is Next.js and Why Does It Exist?

**Next.js** is a **full-stack React framework** built by Vercel. Plain React (e.g., a Vite or CRA app) is just a *UI library* — it gives you components and state, but leaves routing, rendering strategy, SEO, bundling optimizations, and backend APIs entirely up to you. Next.js packages all of that into one opinionated framework.

### Problems Next.js solves

(These are exactly the points listed in this lecture's own `app/about/page.js`, now styled as an editor-style numbered list.)

1. **Full Stack Solution** — You can write backend API routes and frontend pages in the *same* project. No separate Express server needed for simple backends.
2. **File-based Routing** — No `react-router-dom`, no `<Routes>`/`<Route>` config. You create a **folder** with a `page.js` inside it, and that folder name *becomes the URL*. `app/about/page.js` → `yoursite.com/about`. That's it.
3. **Additional features** — like the router from `next/navigation`, the `<Link>` component (now actually used throughout this project — see §4.3), `<Image>` optimization, font optimization (`next/font`), metadata/SEO helpers, and more.
4. **Optimized rendering** — Server-Side Rendering (SSR), Static Site Generation (SSG), and React Server Components out of the box. This project also demonstrates the **Client Component** boundary: `Navbar` and the contact form opt into interactivity with `"use client"`, while `Home` and `About` stay server-rendered.

### CSR vs SSR / SSG — the core motivation

| | **CSR** (Client-Side Rendering — plain React) | **SSR** (Server-Side Rendering — Next.js) | **SSG** (Static Site Generation — Next.js) |
|---|---|---|---|
| **What the browser first receives** | A nearly empty HTML shell (`<div id="root"></div>`) + a big JS bundle | Fully rendered HTML for the requested page, generated **per request** on the server | Fully rendered HTML generated **once at build time** |
| **When content appears** | After JS downloads, parses, and runs | Immediately (HTML already has content) | Immediately (served like a static file — fastest) |
| **SEO** | Poor/inconsistent — crawlers may see an empty page | Excellent — crawlers see real content | Excellent |
| **First load speed** | Slower (blank screen until JS runs) | Fast | Fastest |
| **Good for** | Dashboards, apps behind login | Personalized / frequently changing pages | Blogs, docs, marketing pages |

**Why SEO matters:** Search engines rank pages based on the HTML they can read. A CSR app sends essentially *no* HTML content, so search engines struggle to index it. Next.js renders real HTML on the server, so your blog posts, product pages, etc., are fully crawlable. This is a huge reason companies choose Next.js — and why this demo project is titled **"DevNotes"** in its metadata, styled as a small personal dev-journal site.

Running `npm run build` (see §6) confirms this: every route in this project — `/`, `/about`, `/contact` — is prerendered as static HTML (marked `○ (Static)` in the build output), even the pages built with client-side state.

---

## 2. What You'll Learn

- What Next.js is and the problems it solves compared to plain React (CSR vs SSR/SSG, SEO).
- Scaffolding a project with `create-next-app`.
- The **App Router** conventions: `app/` directory, `layout.js`, `page.js`, and **folder = route**.
- Creating routes by just creating folders: `/`, `/about`, `/contact`.
- The **root layout**: the `metadata` export (SEO title/description), the `viewport` export (theme color), and the `children` prop.
- Building **shared components** (`Navbar`, `Footer`) and rendering them once in the layout so they appear on *every* page.
- The difference between a **Server Component** (`app/page.js`, `app/about/page.js` — no `"use client"`, rendered on the server, zero client JS for logic) and a **Client Component** (`component/Navbar.js`, `app/contact/page.js` — `"use client"`, uses hooks like `useState`/`usePathname`).
- The **`@/` path alias** configured in `jsconfig.json`.
- How **Tailwind CSS** is wired into a Next.js project (`globals.css` directives + `tailwind.config.js` content globs) — and how to drive an entire color palette, including dark mode, from a small set of CSS variables.
- Google font loading with `next/font/google` for **two** fonts at once (Inter + JetBrains Mono), exposed to Tailwind as CSS variables.
- Client-side navigation with `next/link` and active-route styling with `usePathname` from `next/navigation`.
- A real controlled form with `useState` (`app/contact/page.js`) — the standard shape of a form before you wire it to a backend.
- Running the dev server with `npm run dev` and producing a production build with `npm run build`.

---

## 3. Project Structure

```
Lec-121 NextJS/
├── README.md                 ← ★ these lecture notes (you are here)
└── first/                    ← the Next.js app created with create-next-app
    ├── app/                  ← ★ APP ROUTER: every folder here = a URL route
    │   ├── layout.js         ← root layout: html/body, Navbar, Footer, skip link, fonts, metadata, viewport
    │   ├── page.js            ← UI for the "/" route — hero, features, "recent notes", CTA
    │   ├── globals.css       ← Tailwind directives + CSS-variable design tokens + a few utilities
    │   ├── favicon.ico        ← site favicon (special file convention)
    │   ├── about/
    │   │   └── page.js       ← UI for the "/about" route (Server Component, has its own `metadata`)
    │   └── contact/
    │       └── page.js       ← UI for the "/contact" route ("use client" — real form with useState)
    ├── component/             ← custom folder for reusable components (NOT a route — no page.js!)
    │   ├── Navbar.js          ← sticky navbar, "use client" (usePathname + useState for the mobile menu)
    │   └── Footer.js          ← shared footer, rendered once in layout.js
    ├── public/                ← static assets served from "/" (next.svg, vercel.svg)
    ├── jsconfig.json          ← "@/" path alias configuration
    ├── next.config.mjs        ← Next.js configuration (empty defaults here)
    ├── tailwind.config.js     ← Tailwind: content globs, color tokens, fonts, shadows, keyframes
    ├── postcss.config.js      ← PostCSS pipeline (tailwindcss + autoprefixer)
    ├── .eslintrc.json         ← ESLint with eslint-config-next
    ├── package.json           ← dependencies + npm scripts
    └── README.md              ← default create-next-app readme (left untouched, see §9)
```

### The App Router conventions in one breath

| Convention | Meaning |
|---|---|
| `app/` | The routing root. Everything under it maps to URLs. |
| **folder name** | A **URL segment**. `app/about/` → `/about`. Nesting folders nests URLs (`app/blog/post/` → `/blog/post`). |
| `page.js` | The file that makes a folder **publicly reachable** and defines its UI. A folder *without* a `page.js` is not a route. |
| `layout.js` | Shared UI that **wraps** pages. The root `app/layout.js` is mandatory and must render `<html>` and `<body>`. It receives pages via the `children` prop. |
| Files outside `app/` (like `component/`) | Just regular modules — they never become routes. That's why `Navbar` and `Footer` live outside `app/`. |
| `"use client"` at the top of a file | Opts that file (and everything it imports) into being a **Client Component** — required for hooks like `useState`, `useEffect`, or `usePathname`. Everything else in `app/` is a Server Component by default. |

---

## 4. Concept Deep-Dives (with the actual project code)

### 4.1 File-based routing — a folder *is* a route

In plain React you would install `react-router-dom` and write route config. In Next.js you just create a folder + `page.js`:

- `app/page.js` → `http://localhost:3000/`
- `app/about/page.js` → `http://localhost:3000/about`
- `app/contact/page.js` → `http://localhost:3000/contact`

The homepage even visualizes this — the hero section renders a little mock "file tree" card showing exactly this mapping (folder → route), styled like a code editor's file explorer.

Here is `first/app/about/page.js` (verbatim, trimmed to the routing-relevant top and the numbered list — the full file also has a pull-quote and a "built with" badge row, covered in §5):

```jsx
const problems = [
  {
    title: "Full Stack Solution",
    description:
      "Write backend route handlers and frontend pages in the same project — no separate Express server for simple APIs.",
  },
  {
    title: "File-based Routing",
    description:
      "No react-router-dom, no route config. A folder with a page.js inside it becomes a URL, automatically.",
  },
  {
    title: "Additional features",
    description:
      "The router from next/navigation, next/link, next/image, and next/font — batteries included for a real product.",
  },
  {
    title: "Optimized rendering",
    description:
      "Server-side rendering and static generation out of the box, so pages ship fast and stay crawlable.",
  },
];

const stack = ["Next.js 14", "App Router", "React 18", "Tailwind CSS"];

export const metadata = {
  title: "About",
  description:
    "Why this project uses Next.js, and the four problems it solves compared to plain React.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      {/* ...heading + intro paragraph... */}

      {/* Editor-style numbered list, echoing a code editor's line-number gutter */}
      <div className="mt-12 overflow-hidden rounded-2xl border border-line/10">
        {problems.map((problem, index) => (
          <div
            key={problem.title}
            className={`flex gap-5 px-6 py-5 ${
              index !== problems.length - 1 ? "border-b border-line/10" : ""
            }`}
          >
            <span className="select-none font-mono text-sm text-ink-faint">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink">
                {problem.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {problem.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* ...pull-quote + stack badges... */}
    </div>
  );
}
```

Notes:

- The component **must be the default export** — here it's `AboutPage`, but the router doesn't care what you name it. Only the **file name** `page.js` and the **folder name** `about/` matter.
- `AboutPage` also exports its own `metadata` (see §4.2) — Next.js merges page-level metadata over the root layout's, so the browser tab reads **"About · DevNotes"** on this route specifically.
- The four `problems` are rendered with `.map()`, not copy-pasted — a normal React pattern that works identically inside a Server Component.
- No route registration anywhere. Deleting the `about/` folder deletes the route.

### 4.2 The root layout — `metadata`, `viewport`, `children`, fonts, and global CSS

`first/app/layout.js` (verbatim):

```jsx
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: {
    default: "DevNotes — Learning Next.js, one route at a time",
    template: "%s · DevNotes",
  },
  description:
    "A small App Router site built while learning Next.js: file-based routing, shared layouts, and a couple of styled pages.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6ec" },
    { media: "(prefers-color-scheme: dark)", color: "#141210" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-paper font-sans text-ink antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
```

Line-by-line, this file demonstrates **seven** big Next.js ideas:

1. **`export const metadata`** — Next.js reads this object and generates the `<title>` and `<meta name="description">` tags for you. The `title` is now an object with `default` and `template`: the root tab reads **"DevNotes — Learning Next.js, one route at a time"**, while a page with its own `metadata = { title: "About" }` (see `about/page.js`) gets the template applied and shows **"About · DevNotes"**. This is declarative SEO — no `react-helmet` needed.
2. **`export const viewport`** — a sibling export (new in Next.js 14) for viewport-related meta that isn't really "content" metadata: here it sets `<meta name="theme-color">` to two different colors depending on `prefers-color-scheme`, so the browser chrome (e.g. a mobile address bar) matches the page background in both light and dark mode.
3. **`{ children }` prop** — the magic slot. Whatever page matches the current URL is passed into the layout as `children` and rendered inside `<main>`. The layout itself, `Navbar`, and `Footer` **do not re-render** when you navigate between pages — only `children` swaps.
4. **`<Navbar />` and `<Footer />` around `{children}`** — because the layout wraps *every* route, placing them here makes both appear on `/`, `/about`, and `/contact` automatically. Write once, shown everywhere.
5. **The skip link** (`<a href="#main-content" className="skip-link">`) — an accessibility pattern: it's visually hidden until keyboard-focused (see the `.skip-link` utility in `globals.css`, §4.5), then lets a keyboard user jump straight past the navbar to `<main id="main-content">`.
6. **`next/font/google` with two fonts** — `Inter` for body/headings and `JetBrains_Mono` for the site's "code comment" labels (`// about`, line numbers, dates). Both are downloaded **at build time** and self-hosted (no runtime request to Google, no layout shift). Each is configured with a `variable` option (`--font-inter`, `--font-mono`) instead of `.className`, so both fonts are exposed as CSS custom properties and Tailwind's `font-sans` / `font-mono` utilities (configured in `tailwind.config.js`, §4.5) pick them up.
7. **`import "./globals.css"`** — global styles (Tailwind + the color-token system) are imported exactly once, here in the root layout, and apply app-wide.

Also note: the root layout is the **only** place you render `<html>` and `<body>` — pages never do. And because `layout.js` has no `"use client"` directive, it's a Server Component — which is required, since `metadata`/`viewport` exports only work in Server Components.

### 4.3 The shared Navbar and Footer components

`first/component/Navbar.js` is the project's first real **Client Component**. Full file (verbatim):

```jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/10 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-mono text-base font-semibold tracking-tight text-ink"
          onClick={() => setOpen(false)}
        >
          devnotes
          <span className="text-accent animate-blink" aria-hidden="true">
            _
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "text-ink font-medium"
                    : "text-ink-faint hover:text-ink"
                }`}
              >
                {link.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 -bottom-[1px] h-[2px] rounded-full bg-accent"
                  />
                )}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="ml-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            Say hello
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-full border border-line/15 text-ink sm:hidden"
        >
          <span className="sr-only">Menu</span>
          <div className="flex flex-col items-center gap-[5px]" aria-hidden="true">
            <span
              className={`h-[1.5px] w-4 bg-ink transition-transform ${
                open ? "translate-y-[3.25px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[1.5px] w-4 bg-ink transition-transform ${
                open ? "-translate-y-[3.25px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-line/10 px-6 py-3 sm:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-sm ${
                      isActive
                        ? "bg-paper-dim font-medium text-ink"
                        : "text-ink-faint hover:text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
```

What's worth noticing:

- **`"use client"` at the top** — required because this component calls `usePathname()` (a hook from `next/navigation`) and `useState()`. Without it, Next.js would error: hooks only run in Client Components.
- **`usePathname()`** returns the current URL path (e.g. `/about`), which is compared against each link's `href` to decide `isActive` — that's how the active link gets a bold weight and a small underline bar under it, and how the mobile menu highlights the current page.
- **`<Link href="...">`** from `next/link` (not `next/navigation`) is used for every navigational element — clicking never triggers a full page reload; Next.js also **prefetches** linked routes in the background.
- **`useState(false)`** drives the mobile hamburger menu — a small, self-contained example of local component state that has nothing to do with routing.
- It lives in `first/component/` — **outside** `app/` — so it can never accidentally become a route (no folder in `app/`, no `page.js`).
- It is imported **once** in `app/layout.js` via the alias: `import Navbar from "@/component/Navbar";`. Because the layout wraps every page, the navbar (and its active-link state) shows correctly on `/`, `/about`, and `/contact`.

`first/component/Footer.js` (verbatim) — a **Server Component** sitting right next to a Client Component, which is completely normal in the App Router:

```jsx
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono">
          <span className="text-ink-soft">$</span> built with Next.js App
          Router · {year}
        </p>

        <nav className="flex items-center gap-5">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <Link href="/about" className="hover:text-ink">
            About
          </Link>
          <Link href="/contact" className="hover:text-ink">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}
```

`Footer` has no `"use client"` because it needs nothing interactive — `new Date().getFullYear()` runs fine on the server at request/build time. It's a good contrast to `Navbar`: both are "just components in `component/`", but one needs the client boundary and one doesn't.

### 4.4 The `@/` path alias (`jsconfig.json`)

`first/jsconfig.json` (verbatim, unchanged from the original scaffold):

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This maps `@/anything` to `<project-root>/anything`. That's why the layout can write:

```jsx
import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";
```

instead of fragile relative paths like `../component/Navbar` (which would change to `../../component/Navbar` if imported from a deeper folder). The alias is **absolute from the project root, from anywhere**. `create-next-app` sets this up when you answer "Yes" to *"Would you like to customize the default import alias (@/*)?"* — or by default. VS Code also reads `jsconfig.json` for IntelliSense/auto-imports.

### 4.5 Tailwind CSS integration — now a real design-token system

Two files make Tailwind work, and this upgrade leans on both of them a lot more than the original scaffold did.

First, `first/app/globals.css` (verbatim):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/*
  Color tokens for the whole site.
  Everything downstream (tailwind.config.js) reads these as `rgb(var(--color-x) / <alpha>)`,
  so a component never hardcodes a hex value -- it just says `bg-paper` or `text-ink-soft`
  and gets the right shade for light or dark automatically.
*/
:root {
  --color-paper: 250 246 236; /* warm notebook paper */
  --color-paper-dim: 243 236 219; /* slightly inset surface, e.g. inputs */
  --color-ink: 32 28 23; /* primary text */
  --color-ink-soft: 82 74 61; /* secondary text */
  --color-ink-faint: 140 130 111; /* tertiary / muted text */
  --color-accent: 217 87 24; /* highlighter orange */
  --color-accent-soft: 250 227 204; /* accent tint, e.g. badge backgrounds */
  --color-line: 32 28 23; /* used at low opacity for borders */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-paper: 20 18 15;
    --color-paper-dim: 28 25 21;
    --color-ink: 240 234 222;
    --color-ink-soft: 196 186 168;
    --color-ink-faint: 128 119 103;
    --color-accent: 245 141 79;
    --color-accent-soft: 61 39 20;
    --color-line: 240 234 222;
  }
}

@layer base {
  * {
    @apply border-line/10;
  }

  html {
    scroll-behavior: smooth;
    color-scheme: light dark;
  }

  body {
    @apply bg-paper text-ink;
  }

  ::selection {
    background-color: rgb(var(--color-accent) / 0.25);
    color: rgb(var(--color-ink));
  }

  :focus-visible {
    outline: 2px solid rgb(var(--color-accent));
    outline-offset: 2px;
    border-radius: 2px;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  /* A highlighter-style underline mark, used on a handful of key words. */
  .mark-accent {
    background-image: linear-gradient(
      transparent 62%,
      rgb(var(--color-accent) / 0.32) 0
    );
    background-repeat: no-repeat;
  }

  /* Skip link: hidden until keyboard-focused. */
  .skip-link {
    @apply absolute left-4 top-4 -translate-y-16 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-transform focus:translate-y-0;
    z-index: 100;
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-blink {
    animation: none;
    opacity: 1;
  }

  * {
    scroll-behavior: auto !important;
  }
}
```

- The three `@tailwind` directives are unchanged — they're still placeholders the Tailwind PostCSS plugin replaces with generated CSS.
- The **original** `globals.css` had `--foreground-rgb` / `--background-start-rgb` / `--background-end-rgb` variables used *only* by a hardcoded `body` gradient. This version generalizes that same "RGB triplet in a CSS variable" trick into a full **eight-token palette** (`paper`, `paper-dim`, `ink`, `ink-soft`, `ink-faint`, `accent`, `accent-soft`, `line`) that every component draws from via Tailwind classes — see `tailwind.config.js` below for how the variables become `bg-paper`, `text-ink-soft`, etc.
- The whole palette **flips automatically** in the `@media (prefers-color-scheme: dark)` block — no JavaScript theme toggle, no extra class on `<html>`, just different numbers for the same variable names. `color-scheme: light dark` on `<html>` (in `@layer base`) tells the browser to also darken native UI (scrollbars, form controls) to match.
- `:focus-visible` gets a visible, on-brand (accent-colored) outline everywhere, instead of the browser default or — worse — being suppressed. `::selection` is tinted with the accent color too.
- `@layer utilities` adds three custom utility classes: `.text-balance` (unchanged from the original — better line-wrapping on headings), `.mark-accent` (a highlighter-style underline behind a word, used once in the hero), and `.skip-link` (the accessibility skip-to-content link from §4.2).
- The final `@media (prefers-reduced-motion: reduce)` block disables the navbar's blinking-cursor animation and instant-jump-instead-of-smooth-scroll for users who've asked their OS to reduce motion.

Second, `first/tailwind.config.js` (verbatim):

```js
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./component/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // "Paper" = surfaces, "ink" = text, "accent" = the one highlighter color.
        // Values are CSS variables (set in globals.css) so the whole palette
        // flips for dark mode without touching a single class name.
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        "paper-dim": "rgb(var(--color-paper-dim) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--color-ink-soft) / <alpha-value>)",
        "ink-faint": "rgb(var(--color-ink-faint) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--color-accent-soft) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "dot-grid":
          "radial-gradient(rgb(var(--color-ink) / 0.16) 1px, transparent 1px)",
      },
      boxShadow: {
        card: "0 1px 2px rgb(var(--color-ink) / 0.04), 0 8px 24px -12px rgb(var(--color-ink) / 0.18)",
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: 1 },
          "50%, 100%": { opacity: 0 },
        },
      },
      animation: {
        blink: "blink 1.1s step-end infinite",
      },
    },
  },
  plugins: [],
};
```

- **`content`** tells Tailwind which files to scan for class names — Tailwind only generates CSS for classes it *finds* in these files. **This is fixed from the original scaffold**, which scanned `./pages/**` (a folder that doesn't exist in this project at all — it's App Router only) and `./components/**` (plural) even though the actual folder is `component/` (singular). That mismatch meant Tailwind classes on `Navbar.js` would have silently produced no CSS. The config now scans exactly the two folders that exist and contain classes: `./app/**` and `./component/**`.
- **`colors`** wires eight custom color names to the CSS variables from `globals.css`, using Tailwind's `rgb(var(--x) / <alpha-value>)` pattern — this is what lets `<alpha-value>` be substituted by Tailwind's opacity modifiers, so `bg-paper/85` or `border-line/10` both work and both respect dark mode automatically.
- **`fontFamily`** points `font-sans` and `font-mono` at the CSS variables `next/font` generates (`--font-inter`, `--font-mono` — set via the `variable` option in `layout.js`, §4.2), falling back to Tailwind's own default font stacks.
- **`backgroundImage.dot-grid`** is a small radial-gradient "dot" repeated via `bg-[length:16px_16px]` in the homepage hero — a graph-paper texture that reinforces the "notebook" feel without an image asset.
- **`boxShadow.card`** is the *only* shadow used anywhere in the project (on the hero's file-tree card and the contact form card) — a deliberately restrained, two-layer soft shadow instead of scattering different shadow values around.
- **`keyframes.blink` / `animation.blink`** power the blinking `_` cursor after the "devnotes" wordmark in the navbar (`animate-blink`), which is disabled for `prefers-reduced-motion` users (§ above).
- `theme.extend` still adds values **without discarding** Tailwind's defaults — the original `gradient-radial` / `gradient-conic` utilities are preserved even though this project doesn't currently use them, kept for parity with a stock `create-next-app --tailwind` project.

### 4.6 Configuration & tooling files (unchanged)

`first/next.config.mjs` (verbatim):

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

Empty = all defaults. Later you'll add things here like `images.remotePatterns`, redirects, env config, etc. (`.mjs` = ES module syntax in Node.)

`first/package.json` (verbatim — no new dependencies were added for this redesign; everything above is built with Tailwind utilities, `next/font`, and `next/navigation`, all already in the box):

```json
{
  "name": "first",
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

Only **three runtime dependencies**: `react`, `react-dom`, `next`. The framework *is* the dependency. The scripts:

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload at `http://localhost:3000` |
| `npm run build` | Production build (compiles, lints, optimizes, pre-renders every route) |
| `npm run start` | Serves the production build (run `build` first) |
| `npm run lint` | ESLint with Next.js rules — this redesign is lint-clean (`next/core-web-vitals`), including the `react/jsx-no-comment-textnodes` and `react/no-unescaped-entities` rules, which is why you'll see patterns like `{"// about"}` and `Let&rsquo;s talk` in the JSX instead of raw `// about` or `Let's talk`. |

---

## 5. Full Code Walkthrough — File by File

### `app/page.js` — the homepage (`/`)

No longer a single `<div>I am homepage</div>` — it's four stacked `<section>`s, all inside one Server Component with two small local arrays (`features`, `notes`) driving `.map()` calls:

1. **Hero** — an eyebrow line (`// hello world`), a balanced `<h1>` with one highlighted word (`.mark-accent`), a supporting paragraph, two CTAs (`Read the notes` → `/about`, `Get in touch` → `/contact`), a decorative dot-grid background, and the mock "file tree" card described in §4.1.
2. **Features** — a 3-column grid (`features.map(...)`) restating the same four Next.js selling points from the About page as short teaser cards with mono `01`/`02`/`03` numbering.
3. **Recent notes** — a fake 3-item blog index (`notes.map(...)`) with monospace dates, reinforcing the "developer's notebook" framing of the whole site.
4. **CTA band** — a closing prompt linking to `/contact`.

Nothing here is user-generated or fetched — it's all local, hardcoded data — which keeps this file a plain Server Component with **zero** client-side JavaScript needed for its own logic (the only client JS on this route comes from the shared `Navbar`).

### `app/about/page.js` — the `/about` route

Covered in §4.1. The folder `about/` creates the URL segment; `page.js` provides the UI; the four `problems` are the lecture's own theory, now rendered as a bordered, line-numbered list plus a pull-quote and a row of "built with" badges. It also exports its own `metadata` (`{ title: "About", description: "..." }`), which is merged into the root layout's `title.template` (§4.2).

### `app/contact/page.js` — the `/contact` route

The one page in this project that's a genuine **Client Component**:

```jsx
"use client";

import { useState } from "react";

const initialForm = { name: "", email: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    // No backend wired up yet — this just proves the form is a real
    // client component with state. Swap this for a fetch() to a
    // route handler (e.g. app/api/contact/route.js) later.
    setSubmitted(true);
  }

  // ...JSX below renders either the form (name/email/message,
  // all controlled inputs bound to `form` + `handleChange`) or,
  // once `submitted` is true, a success panel with a
  // "Send another message" button that resets both pieces of state.
}
```

Notes:

- **Named `ContactPage`, not `contact`** — same lesson as the original lecture code: the router only cares about the file name (`page.js`) and folder name (`contact/`), never the component's own name.
- `useState` holds two independent pieces of state: the form's field values (`form`) and whether it's been submitted (`submitted`).
- `handleChange` is a single generic handler shared by all three inputs — it reads `event.target.name` (matching each input's `name` attribute: `"name"`, `"email"`, `"message"`) and updates just that key.
- Every input is **controlled** (`value={form.x}` + `onChange={handleChange}`), the standard React form pattern.
- `handleSubmit` calls `event.preventDefault()` (stopping the browser's native full-page form submission) and flips `submitted` to `true` — there's a code comment explaining exactly where a real backend call (e.g. a `fetch()` to a Next.js **Route Handler** at `app/api/contact/route.js`) would go. That's intentionally left as an exercise (§8).
- The success panel includes `autoComplete`, `spellCheck={false}` on the email field, and `aria-live="polite"` on the swapping container so the confirmation message is announced to screen readers — small but real accessibility details worth noticing in a form.

### `app/layout.js` — the root layout

Covered in §4.2 — `metadata` + `viewport` exports, the `children` slot, the skip link, the shared `Navbar`/`Footer`, two `next/font` fonts exposed as CSS variables, and the global CSS import.

### `component/Navbar.js` and `component/Footer.js`

Covered in §4.3 — `Navbar` is a Client Component (`usePathname` + `useState`) with active-link styling and a mobile menu; `Footer` is a plain Server Component. Both live outside `app/`, are imported via the `@/` alias, and are rendered once in the layout so they appear on every page.

### `app/globals.css` and `tailwind.config.js`

Covered in §4.5 — the CSS-variable-driven color system, the two `next/font` families exposed as `font-sans`/`font-mono`, the fixed `content` globs, and the small set of custom utilities/keyframes.

### `jsconfig.json`, `next.config.mjs`, `package.json`, `postcss.config.js`, `.eslintrc.json`

Unchanged from the original scaffold — covered in §4.4 and §4.6.

### Rendering flow — putting it all together

Request `http://localhost:3000/about` and Next.js composes, **on the server**:

```
<html lang="en" class="(inter var)(mono var)">   ← from app/layout.js
  <head>…title "About · DevNotes", theme-color…</head>  ← metadata + viewport, merged with about/page.js's own metadata
  <body class="flex min-h-screen flex-col bg-paper …">
    <a class="skip-link">Skip to content</a>       ← layout.js
    <Navbar/>                                       ← client component, hydrates active-link state in the browser
    <main id="main-content">
      {children}                                    ← app/about/page.js content: heading, numbered list, quote, badges
    </main>
    <Footer/>                                        ← layout.js
  </body>
</html>
```

The browser receives real, content-filled HTML — that's SSR/SSG and the SEO win in action. View Page Source (Ctrl+U) on `/about` and you'll see every list item and every badge label right in the raw HTML, even though `Navbar` needs a little client-side JavaScript afterward to know which link is "active."

---

## 6. Setup Recap & How to Run

### How this project was created

```bash
npx create-next-app@latest
```

Answering the prompts (as this project's files reveal):

```
√ What is your project named?                        first
√ Would you like to use TypeScript?                  No   (files are .js, jsconfig.json)
√ Would you like to use ESLint?                      Yes  (.eslintrc.json)
√ Would you like to use Tailwind CSS?                Yes  (tailwind.config.js, postcss.config.js)
√ Would you like to use `src/` directory?            No   (app/ is at the root)
√ Would you like to use App Router? (recommended)    Yes  (app/ directory)
√ Would you like to customize the import alias?      @/*  (jsconfig.json)
```

Then the lecture's additions: the `about/` and `contact/` route folders, `component/Navbar.js` and `component/Footer.js` wired into the layout, and — for this redesign — a full color-token system in `globals.css`/`tailwind.config.js`, two Google fonts, and real page content for all three routes.

### How to run it

```bash
cd first
npm install      # install dependencies (creates node_modules)
npm run dev      # start the dev server
```

Open **http://localhost:3000** and visit:

- `/` → sticky navbar + hero ("Notes from learning Next.js…") + feature grid + recent notes + CTA + footer
- `/about` → the four Next.js problems as a numbered editor-style list, a pull-quote, and stack badges
- `/contact` → a real form (name / email / message) — submit it to see the client-state-driven success panel

For production: `npm run build` then `npm run start`. `npm run build` also runs ESLint (`next/core-web-vitals`) as part of the build — this project builds and lints clean.

---

## 7. Next.js vs Plain React (Vite)

| Aspect | Plain React (Vite/CRA) | Next.js |
|---|---|---|
| **Type** | UI library + bundler | Full-stack **framework** |
| **Routing** | Manual — install `react-router-dom`, define routes in code | Built-in **file-based routing** — folders + `page.js` |
| **Rendering** | CSR only (blank HTML shell + JS bundle) | SSR, SSG, ISR, React Server Components — per page. This project's `/`, `/about`, `/contact` all prerender to static HTML (`○ (Static)`), even the client-driven contact form. |
| **SEO** | Weak out of the box | Strong — real HTML + the `metadata`/`viewport` APIs, including per-page title templates (see `about/page.js`) |
| **Backend/API** | Separate server (Express etc.) | API routes / route handlers in the same project (the contact form's natural next step) |
| **Shared layout** | You compose it manually around `<Routes>` | `layout.js` convention with `children`, plus a Navbar/Footer pair rendered once |
| **Fonts** | Manual `<link>` to Google Fonts (extra request, layout shift) | `next/font` — self-hosted, zero layout shift; this project loads *two* fonts as CSS variables consumed by Tailwind |
| **Client vs. server code** | Everything is client code by default | Server Components by default; opt into client-only code per-file with `"use client"` (used here in `Navbar` and the contact form only) |
| **Image optimization** | Manual | `next/image` — resizing, lazy-load, modern formats |
| **Code splitting** | Manual (`React.lazy`) | Automatic per route |
| **Navigation** | `<Link>` from react-router | `<Link>` from `next/link` + prefetching — used throughout this project's Navbar, Footer, and CTAs |
| **Deployment** | Static host is easy; SSR is DIY | Vercel one-click; Node server or static export |
| **When to choose** | SPAs behind login, dashboards, embedded widgets | Content sites, blogs, e-commerce, anything needing SEO/full-stack |

---

## 8. Key Takeaways, Pitfalls & Exercises

### Key takeaways

1. **Next.js = React + routing + rendering + backend + optimizations.** A framework, not just a library.
2. **Folder = route, `page.js` = the page.** No router installation, no route table.
3. **`layout.js` wraps every page** via the `children` prop — perfect home for the Navbar, Footer, fonts, global CSS, and site-wide `metadata`/`viewport`.
4. **Server Components by default, Client Components by choice.** Add `"use client"` only where you need hooks or browser APIs (`Navbar`'s `usePathname`/`useState`, the contact form's `useState`) — everything else, including data-heavy pages like Home and About, stays a lighter, server-rendered component.
5. **Components that shouldn't be routes live outside `app/`** (here: `component/Navbar.js`, `component/Footer.js`).
6. **`@/` alias** (from `jsconfig.json`) = clean absolute imports from the project root.
7. **A handful of CSS variables can drive an entire theme.** `globals.css` defines eight color tokens once (light + dark), `tailwind.config.js` turns them into `bg-*`/`text-*`/`border-*` utilities, and no component ever writes a raw hex value.
8. **SSR gives you SEO and fast first paint** — the browser gets real HTML, not an empty shell, even on the page with client-side form state.

### Common pitfalls

- **Forgetting `page.js`** — a folder in `app/` without `page.js` is *not* a route (you'll get a 404).
- **Forgetting `export default`** — the page/layout component must be the **default** export or Next.js errors out.
- **Tailwind `content` glob mismatch** — the *original* version of this project scanned `./components/**` (plural, and a `./pages/**` glob for a folder that doesn't even exist) while the real folder was `component/` (singular). That's now **fixed** in `tailwind.config.js` (`"./app/**"` + `"./component/**"`), but it's a real pitfall to remember any time you add a new top-level folder with Tailwind classes in it: if it's not in `content`, its classes silently produce no CSS.
- **Missing `"use client"`** — the moment a component needs `useState`, `useEffect`, `usePathname`, `onClick`, or any other browser-only API, it needs `"use client"` at the very top of the file (see `Navbar.js` and `contact/page.js`). Forgetting it throws a build/runtime error. Conversely, a file with `metadata`/`viewport` exports (like `layout.js` or `about/page.js`) **must stay a Server Component** — those exports don't work in a `"use client"` file.
- **Adding a new custom color and forgetting dark mode** — because colors here are `rgb(var(--color-x) / <alpha-value>)`, adding a new token means adding it to *both* the `:root` block and the `@media (prefers-color-scheme: dark)` block in `globals.css` — miss the second one and dark mode falls back to the light value.
- **Using `<a>` instead of `next/link`** for internal navigation — `<a>` triggers a full page reload; `<Link>` (used throughout this project) gives instant client-side transitions and prefetching.
- **Rendering `<html>`/`<body>` anywhere except the root layout** — only `app/layout.js` may do this.
- **Editing `next.config.mjs` without restarting** — config changes require restarting `npm run dev`.
- **Straight quotes/raw `//` text inside JSX** — ESLint's `react/no-unescaped-entities` and `react/jsx-no-comment-textnodes` rules (part of `next/core-web-vitals`) will fail the build on things like `Let's talk` or a bare `// about` text node. This project works around both — `&rsquo;`/`’` for apostrophes, `{"// about"}` (wrapped in braces) for comment-look-alike labels — which is a genuinely useful pattern to know before it surprises you.

### Practice exercises

1. **Add a `/projects` route** that matches the site's visual language: create `app/projects/page.js` with an eyebrow (`// projects`), an `<h1>`, and a `.map()`-rendered grid of 3 cards (reuse the `rounded-2xl border border-line/10 p-6` card style from the Home page's features section). Confirm it appears at `http://localhost:3000/projects` with the Navbar and Footer automatically wrapping it, and add it to the `links` array in `component/Navbar.js` so it gets active-link styling too.
2. **Wire the contact form to a real backend.** Create `app/api/contact/route.js` exporting an async `POST` function that reads the request body and returns a JSON response. In `app/contact/page.js`, replace the `setSubmitted(true)` in `handleSubmit` with a `fetch("/api/contact", { method: "POST", body: JSON.stringify(form) })` call, and only flip `submitted` once the response comes back — you'll need a third piece of state (e.g. `isSubmitting`) to disable the button while the request is in flight.
3. **Give the homepage its own `metadata`.** Right now `/` inherits the root layout's default title. Add `export const metadata = { title: "Home" }` to `app/page.js` and confirm the tab now reads "Home · DevNotes" instead of the root default.
4. **Add a dynamic route.** Create `app/notes/[slug]/page.js` that reads `params.slug` and renders it. Then update the "Recent notes" array on the homepage to link each note to `/notes/<slug>` with `next/link`. What happens if you visit `/notes` without creating `app/notes/page.js`?
5. **Build a manual theme toggle.** Right now light/dark mode follows the OS via `prefers-color-scheme`. Add a button (in `Navbar`, using `useState`) that toggles a `dark` class on `<html>`, and update the color tokens in `globals.css` to also respond to `:root.dark { ... }` in addition to the media query — a common real-world pattern once you want a user-controlled toggle, not just a system preference.
6. **Prove the SSR/SEO claim.** Run the app, open `/contact`, hit **Ctrl+U** (View Page Source), and find the form's `<label>` text in the raw HTML even though the form itself needs client JS to become interactive. Then do the same on any Vite React app and compare what a search-engine crawler would see.

---

## 9. About `first/README.md`

The `README.md` **inside** `first/` is the standard boilerplate generated by `create-next-app` (Getting Started, fonts note, Vercel deploy links). It has been **preserved untouched** — these lecture notes live separately, here at the lecture-folder root, so the generated project stays exactly as the tooling created it.
