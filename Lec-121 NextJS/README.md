# Lec-121: Introduction to Next.js — Your First Next.js App

> **Course folder:** `Lec-121 NextJS/` &nbsp;|&nbsp; **Project:** `first/` &nbsp;|&nbsp; **Stack:** Next.js 14.1.0 (App Router) + React 18 + Tailwind CSS 3

---

## 1. Overview — What is Next.js and Why Does It Exist?

**Next.js** is a **full-stack React framework** built by Vercel. Plain React (e.g., a Vite or CRA app) is just a *UI library* — it gives you components and state, but leaves routing, rendering strategy, SEO, bundling optimizations, and backend APIs entirely up to you. Next.js packages all of that into one opinionated framework.

### Problems Next.js solves

(These are exactly the points listed in this lecture's own `app/about/page.js`!)

1. **Full Stack Solution** — You can write backend API routes and frontend pages in the *same* project. No separate Express server needed for simple backends.
2. **File-based Routing** — No `react-router-dom`, no `<Routes>`/`<Route>` config. You create a **folder** with a `page.js` inside it, and that folder name *becomes the URL*. `app/about/page.js` → `yoursite.com/about`. That's it.
3. **Additional features** — like the router from `next/navigation`, the `<Link>` component, `<Image>` optimization, font optimization (`next/font`), metadata/SEO helpers, and more.
4. **Optimized rendering** — Server-Side Rendering (SSR), Static Site Generation (SSG), and React Server Components out of the box.

### CSR vs SSR / SSG — the core motivation

| | **CSR** (Client-Side Rendering — plain React) | **SSR** (Server-Side Rendering — Next.js) | **SSG** (Static Site Generation — Next.js) |
|---|---|---|---|
| **What the browser first receives** | A nearly empty HTML shell (`<div id="root"></div>`) + a big JS bundle | Fully rendered HTML for the requested page, generated **per request** on the server | Fully rendered HTML generated **once at build time** |
| **When content appears** | After JS downloads, parses, and runs | Immediately (HTML already has content) | Immediately (served like a static file — fastest) |
| **SEO** | Poor/inconsistent — crawlers may see an empty page | Excellent — crawlers see real content | Excellent |
| **First load speed** | Slower (blank screen until JS runs) | Fast | Fastest |
| **Good for** | Dashboards, apps behind login | Personalized / frequently changing pages | Blogs, docs, marketing pages |

**Why SEO matters:** Search engines rank pages based on the HTML they can read. A CSR app sends essentially *no* HTML content, so search engines struggle to index it. Next.js renders real HTML on the server, so your blog posts, product pages, etc., are fully crawlable. This is a huge reason companies choose Next.js — and why this demo project is titled **"Blog"** in its metadata.

---

## 2. What You'll Learn

- What Next.js is and the problems it solves compared to plain React (CSR vs SSR/SSG, SEO).
- Scaffolding a project with `create-next-app`.
- The **App Router** conventions: `app/` directory, `layout.js`, `page.js`, and **folder = route**.
- Creating routes by just creating folders: `/`, `/about`, `/contact`.
- The **root layout**: the `metadata` export (SEO title/description) and the `children` prop.
- Building a **shared component** (`Navbar`) and rendering it once in the layout so it appears on *every* page.
- The **`@/` path alias** configured in `jsconfig.json`.
- How **Tailwind CSS** is wired into a Next.js project (`globals.css` directives + `tailwind.config.js` content globs).
- Google font loading with `next/font/google` (Inter).
- Running the dev server with `npm run dev`.

---

## 3. Project Structure

```
Lec-121 NextJS/
├── README.md                 ← ★ these lecture notes (you are here)
└── first/                    ← the Next.js app created with create-next-app
    ├── app/                  ← ★ APP ROUTER: every folder here = a URL route
    │   ├── layout.js         ← root layout: wraps EVERY page (html/body, Navbar, fonts, metadata)
    │   ├── page.js           ← UI for the "/" route (homepage)
    │   ├── globals.css       ← global styles + Tailwind directives (imported in layout.js)
    │   ├── favicon.ico       ← site favicon (special file convention)
    │   ├── about/
    │   │   └── page.js       ← UI for the "/about" route
    │   └── contact/
    │       └── page.js       ← UI for the "/contact" route
    ├── component/            ← custom folder for reusable components (NOT a route — no page.js!)
    │   └── Navbar.js         ← shared navbar component, rendered in layout.js
    ├── public/               ← static assets served from "/" (next.svg, vercel.svg)
    ├── jsconfig.json         ← "@/" path alias configuration
    ├── next.config.mjs       ← Next.js configuration (empty defaults here)
    ├── tailwind.config.js    ← Tailwind: which files to scan + theme extensions
    ├── postcss.config.js     ← PostCSS pipeline (tailwindcss + autoprefixer)
    ├── .eslintrc.json        ← ESLint with eslint-config-next
    ├── package.json          ← dependencies + npm scripts
    └── README.md             ← default create-next-app readme (left untouched)
```

### The App Router conventions in one breath

| Convention | Meaning |
|---|---|
| `app/` | The routing root. Everything under it maps to URLs. |
| **folder name** | A **URL segment**. `app/about/` → `/about`. Nesting folders nests URLs (`app/blog/post/` → `/blog/post`). |
| `page.js` | The file that makes a folder **publicly reachable** and defines its UI. A folder *without* a `page.js` is not a route. |
| `layout.js` | Shared UI that **wraps** pages. The root `app/layout.js` is mandatory and must render `<html>` and `<body>`. It receives pages via the `children` prop. |
| Files outside `app/` (like `component/`) | Just regular modules — they never become routes. That's why the `Navbar` lives outside `app/`. |

---

## 4. Concept Deep-Dives (with the actual project code)

### 4.1 File-based routing — a folder *is* a route

In plain React you would install `react-router-dom` and write route config. In Next.js you just create a folder + `page.js`:

- `app/page.js` → `http://localhost:3000/`
- `app/about/page.js` → `http://localhost:3000/about`
- `app/contact/page.js` → `http://localhost:3000/contact`

Here is the *entire* code needed to make the `/about` route exist — verbatim from `first/app/about/page.js`:

```jsx
import React from 'react'

const page = () => {
  return (
    <div>
     <h1 className="text-xl">Problems solved by Next.js</h1>
     <ul>
        <li>Full Stack Solution</li>
        <li>File based Routing</li>
        <li>Additional features like router from next/navigation</li>
        <li>Optimized rendering</li>
     </ul>
    </div>
  )
}

export default page
```

Notes:
- The component **must be the default export**. Its *variable name* (`page`, `contact`, whatever) doesn't matter to the router — only the **file name** `page.js` and the **folder name** matter.
- `className="text-xl"` is a **Tailwind utility class** working right inside a route (see §4.6).
- No route registration anywhere. Deleting the folder deletes the route.

### 4.2 The root layout — `metadata`, `children`, fonts, and global CSS

`first/app/layout.js` (verbatim):

```jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/component/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Blog",
  description: "I am a blog",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar/>
        {children}
        </body>
    </html>
  );
}
```

Line-by-line, this small file demonstrates **five** big Next.js ideas:

1. **`export const metadata`** — Next.js reads this object and generates the `<title>` and `<meta name="description">` tags in the HTML `<head>` for you. Open the app and look at the browser tab: it says **"Blog"**. This is declarative SEO — no `react-helmet` needed. Pages can export their own `metadata` to override the layout's.
2. **`{ children }` prop** — this is the magic slot. Whatever page matches the current URL (`app/page.js` for `/`, `app/about/page.js` for `/about`, ...) is passed into the layout as `children` and rendered where `{children}` appears. The layout itself **does not re-render** when you navigate between pages — only `children` swaps.
3. **`<Navbar/>` above `{children}`** — because the layout wraps *every* route, placing the Navbar here makes it appear on `/`, `/about`, and `/contact` automatically. Write once, shown everywhere. (This is *the* pattern for navbars, footers, and sidebars.)
4. **`next/font/google`** — `Inter({ subsets: ["latin"] })` downloads the Inter font **at build time** and self-hosts it (no runtime request to Google, no layout shift). `inter.className` applies it to `<body>`.
5. **`import "./globals.css"`** — global styles (including Tailwind) are imported exactly once, here in the root layout, and apply app-wide.

Also note: the root layout is the **only** place you render `<html>` and `<body>` — pages never do.

### 4.3 The shared Navbar component

`first/component/Navbar.js` (verbatim):

```jsx
import React from 'react'

const Navbar = () => {
  return (
    <div>
      I am navbar
    </div>
  )
}

export default Navbar
```

It's intentionally a bare placeholder in this first lecture — the *lesson* is not the navbar's content, it's the **wiring**:

- It lives in `first/component/` — **outside** `app/` — so it can never accidentally become a route (no folder in `app/`, no `page.js`).
- It is imported **once** in `app/layout.js` via the alias: `import Navbar from "@/component/Navbar";`
- Because the layout wraps every page, "I am navbar" shows at the top of `/`, `/about`, and `/contact`.

> **Coming next:** in a real navbar you'd add navigation using Next.js's **`<Link>` component** instead of `<a>` tags, e.g. `import Link from "next/link"` then `<Link href="/about">About</Link>`. `<Link>` gives **client-side navigation** — the page transitions without a full browser reload, and Next.js prefetches linked routes. This lecture's code doesn't use `<Link>` yet (navigation is done by typing URLs / full page loads); it's the natural next step to upgrade this Navbar.

### 4.4 The `@/` path alias (`jsconfig.json`)

`first/jsconfig.json` (verbatim):

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
```

instead of a fragile relative path like `../component/Navbar` (which would change to `../../component/Navbar` if you imported it from a deeper folder). The alias is **absolute from the project root, from anywhere**. `create-next-app` sets this up when you answer "Yes" to *"Would you like to customize the default import alias (@/*)?"* — or by default. VS Code also reads `jsconfig.json` for IntelliSense/auto-imports.

### 4.5 Tailwind CSS integration

Two files make Tailwind work. First, `first/app/globals.css` (verbatim):

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

- The three `@tailwind` directives are placeholders that the Tailwind PostCSS plugin replaces with generated CSS (reset styles, component classes, and every utility class you actually used).
- Below them is regular global CSS: CSS variables that flip for **dark mode** via `prefers-color-scheme`, plus a gradient `body` background — this is the default `create-next-app --tailwind` styling.
- `@layer utilities` shows how to add your **own** utility class (`.text-balance`) into Tailwind's utilities layer.

Second, `first/tailwind.config.js` (verbatim):

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
```

- **`content`** tells Tailwind which files to scan for class names — Tailwind only generates CSS for classes it *finds* in these files. That's why `text-xl` in `about/page.js` works: `./app/**/*` is scanned.
- ⚠️ **Careful:** the config scans `./components/**` (plural), but this project's folder is named `component/` (singular)! It works *today* only because `Navbar.js` doesn't use any Tailwind classes yet. The moment you add `className="flex gap-4"` to the Navbar, those styles will silently **not appear**. Fix: add `"./component/**/*.{js,ts,jsx,tsx,mdx}"` to `content` (or rename the folder to `components/`). This is a classic real-world Tailwind gotcha.
- **`theme.extend`** adds custom values (here, two gradient background utilities) without discarding Tailwind's defaults.

### 4.6 Configuration & tooling files

`first/next.config.mjs` (verbatim):

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

Empty = all defaults. Later you'll add things here like `images.remotePatterns`, redirects, env config, etc. (`.mjs` = ES module syntax in Node.)

`first/package.json` (verbatim):

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
| `npm run build` | Production build (compiles, optimizes, pre-renders) |
| `npm run start` | Serves the production build (run `build` first) |
| `npm run lint` | ESLint with Next.js rules |

---

## 5. Full Code Walkthrough — File by File

### `app/page.js` — the homepage (`/`)

```jsx
import React from 'react'

const page = () => {
  return (
    <div>
      <div>I am homepage</div>
    </div>
  )
}

export default page
```

The simplest possible page: a default-exported component. Because this `page.js` sits directly in `app/`, it renders at the root URL `/`. (The `import React` line is optional in modern Next.js — JSX transform handles it — but harmless; it comes from the `rafce` VS Code snippet used to scaffold these components.)

### `app/about/page.js` — the `/about` route

Covered in §4.1. The folder `about/` creates the URL segment; `page.js` provides the UI; `text-xl` proves Tailwind works inside routes. Fittingly, the page's content is the lecture's own theory: the four problems Next.js solves.

### `app/contact/page.js` — the `/contact` route

```jsx
import React from 'react'

const contact = () => {
  return (
    <div>
      I am contact
    </div>
  )
}

export default contact
```

Deliberately named `contact` instead of `page` to prove the point: **the component's name is irrelevant** — the router only cares that the folder is `contact/`, the file is `page.js`, and the component is the default export.

### `app/layout.js` — the root layout

Covered in §4.2 — metadata export, `children` slot, shared `Navbar`, Inter font, global CSS import.

### `component/Navbar.js` — shared component

Covered in §4.3 — lives outside `app/` (not a route), imported via `@/component/Navbar`, rendered once in the layout, visible on every page.

### `app/globals.css`, `tailwind.config.js`, `jsconfig.json`, `next.config.mjs`, `package.json`

Covered in §4.4–§4.6.

### Rendering flow — putting it all together

Request `http://localhost:3000/about` and Next.js composes, **on the server**:

```
<html lang="en">                    ← from app/layout.js
  <head>…title "Blog", meta…</head> ← from the metadata export
  <body class="(inter font)">
    <Navbar/>                       ← "I am navbar" (layout, every page)
    {children}                      ← app/about/page.js content
  </body>
</html>
```

The browser receives real, content-filled HTML — that's SSR and the SEO win in action. View Page Source (Ctrl+U) and you'll see the list items right in the HTML, unlike a CSR React app.

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

Then the lecture's additions: the `about/` and `contact/` route folders, and the `component/Navbar.js` wired into the layout.

### How to run it

```bash
cd first
npm install      # install dependencies (creates node_modules)
npm run dev      # start the dev server
```

Open **http://localhost:3000** and visit:

- `/` → "I am navbar" + "I am homepage"
- `/about` → "I am navbar" + the "Problems solved by Next.js" list
- `/contact` → "I am navbar" + "I am contact"

For production: `npm run build` then `npm run start`.

---

## 7. Next.js vs Plain React (Vite)

| Aspect | Plain React (Vite/CRA) | Next.js |
|---|---|---|
| **Type** | UI library + bundler | Full-stack **framework** |
| **Routing** | Manual — install `react-router-dom`, define routes in code | Built-in **file-based routing** — folders + `page.js` |
| **Rendering** | CSR only (blank HTML shell + JS bundle) | SSR, SSG, ISR, React Server Components — per page |
| **SEO** | Weak out of the box | Strong — real HTML + `metadata` API |
| **Backend/API** | Separate server (Express etc.) | API routes / route handlers in the same project |
| **Shared layout** | You compose it manually around `<Routes>` | `layout.js` convention with `children` |
| **Fonts** | Manual `<link>` to Google Fonts (extra request, layout shift) | `next/font` — self-hosted, zero layout shift |
| **Image optimization** | Manual | `next/image` — resizing, lazy-load, modern formats |
| **Code splitting** | Manual (`React.lazy`) | Automatic per route |
| **Navigation** | `<Link>` from react-router | `<Link>` from `next/link` + prefetching |
| **Deployment** | Static host is easy; SSR is DIY | Vercel one-click; Node server or static export |
| **When to choose** | SPAs behind login, dashboards, embedded widgets | Content sites, blogs, e-commerce, anything needing SEO/full-stack |

---

## 8. Key Takeaways, Pitfalls & Exercises

### Key takeaways

1. **Next.js = React + routing + rendering + backend + optimizations.** A framework, not just a library.
2. **Folder = route, `page.js` = the page.** No router installation, no route table.
3. **`layout.js` wraps every page** via the `children` prop — perfect home for the Navbar, fonts, global CSS, and site-wide `metadata`.
4. **Components that shouldn't be routes live outside `app/`** (here: `component/Navbar.js`).
5. **`@/` alias** (from `jsconfig.json`) = clean absolute imports from the project root.
6. **Tailwind works out of the box** — directives in `globals.css`, file globs in `tailwind.config.js`, utilities like `text-xl` directly in JSX.
7. **SSR gives you SEO and fast first paint** — the browser gets real HTML, not an empty shell.

### Common pitfalls

- **Forgetting `page.js`** — a folder in `app/` without `page.js` is *not* a route (you'll get a 404).
- **Forgetting `export default`** — the page/layout component must be the **default** export or Next.js errors out.
- **Tailwind `content` glob mismatch** — this project scans `./components/**` but the folder is `component/` (singular). Tailwind classes added to `Navbar.js` will silently not work until the glob (or folder name) is fixed.
- **Putting components inside `app/` carelessly** — safe only if the folder has no `page.js`, but keeping them outside `app/` (or in a `_`-prefixed private folder) avoids confusion.
- **Using `<a>` instead of `next/link`** for internal navigation — `<a>` triggers a full page reload; `<Link>` gives instant client-side transitions.
- **Rendering `<html>`/`<body>` anywhere except the root layout** — only `app/layout.js` may do this.
- **Editing `next.config.mjs` without restarting** — config changes require restarting `npm run dev`.

### Practice exercises

1. **Add a `/services` route.** Create `app/services/page.js` with a default-exported component listing three services. Verify it appears at `http://localhost:3000/services` — with the Navbar automatically on top.
2. **Make the Navbar real.** In `component/Navbar.js`, import `Link` from `next/link` and render links to `/`, `/about`, and `/contact`. Style it with Tailwind (e.g., `flex justify-around bg-slate-800 text-white p-4`) — and first fix the `content` glob in `tailwind.config.js` (add `"./component/**/*.{js,ts,jsx,tsx,mdx}"`) so the classes actually generate. Click between pages and notice there's no full page reload.
3. **Per-page metadata.** In `app/about/page.js`, add `export const metadata = { title: "About | Blog" };` and confirm the browser tab title changes only on `/about`.
4. **Nested route.** Create `app/blog/first-post/page.js` and confirm it serves at `/blog/first-post`. What happens if you visit `/blog` without creating `app/blog/page.js`?
5. **Prove the SSR/SEO claim.** Run the app, open `/about`, hit **Ctrl+U** (View Page Source), and find the `<li>` items in the raw HTML. Then do the same on any Vite React app and compare what a search-engine crawler would see.

---

## 9. About `first/README.md`

The `README.md` **inside** `first/` is the standard boilerplate generated by `create-next-app` (Getting Started, fonts note, Vercel deploy links). It has been **preserved untouched** — these lecture notes live separately, here at the lecture-folder root, so the generated project stays exactly as the tooling created it.
