# Lecture 122 — Server Components in Next.js

> **Course folder:** `Lec-122 Server Components in NextJS` · **Demo app:** `my-app/` (Next.js 14, App Router)

---

## 1. Overview — What Are Server Components?

**React Server Components (RSC)** are components that render **only on the server**. Their code is *never* shipped to the browser. In the Next.js **App Router** (the `app/` directory), **every component is a Server Component by default** — you have to explicitly opt *out* with the `"use client"` directive when you need browser interactivity.

The demo app is now a small but complete **"RSC Lab"**: a single page that reads a 200-row dataset on the server, hands it to one interactive client island, and visually marks every place the render environment switches — so the Server/Client split is something you can *see*, not just read about.

### Why do Server Components exist?

| Benefit | What it means |
|---|---|
| **Zero JS to the client** | The component's JavaScript never leaves the server. The browser receives rendered output, not the code that produced it. |
| **Direct data access** | Server Components can talk directly to the filesystem (`fs`), databases, or internal APIs — no `fetch` round-trip from the browser, no exposed API endpoint needed. |
| **Smaller bundles** | Heavy dependencies (parsers, ORMs, markdown libraries…) stay on the server and never bloat the client bundle. |
| **Security** | Secrets, tokens, and DB credentials used inside a Server Component are never exposed to the browser. |
| **Faster first paint** | Less JavaScript to download, parse, and execute means quicker interactive pages. |

The mental model:

```
┌─────────────────────────── Server ───────────────────────────┐
│  Server Components run here (fs, DB, secrets, big libraries) │
│  → output is serialized and streamed to the browser          │
└───────────────────────────────┬───────────────────────────────┘
                                │  HTML + minimal RSC payload
┌───────────────────────────────▼───────────────────────────────┐
│  Browser: only "use client" components hydrate & run JS here  │
│  (useState, useEffect, onClick, browser APIs)                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. What You'll Learn

- Why every component in the Next.js `app/` router is a **Server Component by default**.
- What the **`"use client"`** directive does and exactly *where* it must go (first line of the file).
- Why **hooks (`useState`, `useEffect`) and event handlers (`onClick`) crash Server Components** — and how a commented-out block in `page.js` proves it.
- How an **async Server Component** reads data straight off disk with Node's `fs/promises`, computes stats, and passes the result down to a Client Component as a plain prop.
- Why **`export const dynamic = "force-dynamic"`** matters — without it Next.js would statically render this page once at build time and the server logs would never repeat.
- How to *prove* where a component runs by watching where **`console.log` output appears**: the **terminal** (server) vs the **browser DevTools console** (client).
- How a **Server Component can render a Client Component leaf** (`Navbar.js` → `LiveClock.js`) without becoming a Client Component itself.
- A practical **decision guide** for choosing Server vs Client Components.

---

## 3. Project Structure

```
Lec-122 Server Components in NextJS/
├── README.md                    ← these lecture notes (you are here)
└── my-app/                      ← the Next.js 14 demo app
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css          ← Tailwind directives + the "control room" token palette
    │   ├── layout.js            ← Root layout (Server Component): Navbar + main + Footer
    │   └── page.js               ← Home page (Server Component, async — the star of this lecture)
    ├── components/
    │   ├── Navbar.js             ← Server Component (sticky) that renders a Client leaf
    │   ├── Footer.js             ← Server Component
    │   ├── Badge.js               ← Server Component — "SERVER"/"CLIENT" tag used everywhere
    │   ├── BoundaryDivider.js    ← Server Component — the dashed seam marking each boundary
    │   ├── StatCard.js            ← Server Component — presentational stat tile
    │   ├── ExplainerSection.js   ← Server Component — static Server-vs-Client field guide
    │   ├── LiveClock.js          ← Client Component ("use client") — ticking clock in the navbar
    │   └── TaskExplorer.js       ← Client Component ("use client") — search/filter/paginate island
    ├── public/                  ← static assets
    ├── data.json                ← 200 sample todos (JSONPlaceholder-style data), read on the server
    ├── jsconfig.json            ← the "@/*" import alias
    ├── next.config.mjs          ← default (empty) Next config
    ├── package.json             ← Next 14.1.0, React 18, Tailwind
    ├── postcss.config.js
    ├── tailwind.config.js       ← extends Tailwind with the token palette + Inter/JetBrains Mono
    ├── .eslintrc.json
    ├── .gitignore
    └── README.md                ← untouched create-next-app boilerplate (see §9)
```

---

## 4. Concept Deep-Dives

### 4.1 Server Components by default in the App Router

Open `my-app/app/page.js`. There is **no `"use client"` at the top**, so this is a Server Component — automatically, with zero configuration. It's also declared `async`, which is *only* legal for Server Components:

```js
import fs from "fs/promises";
import path from "path";
// ...component imports...

export const dynamic = "force-dynamic";

export default async function Home() {
  const requestId = Math.random().toString(36).slice(2, 8);
  const startedAt = Date.now();

  console.log(
    `\n[SERVER] app/page.js rendering — request ${requestId} at ${new Date().toISOString()}`
  );

  const dataPath = path.join(process.cwd(), "data.json");
  const raw = await fs.readFile(dataPath, "utf-8");
  const tasks = JSON.parse(raw);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const userIds = [...new Set(tasks.map((t) => t.userId))].sort((a, b) => a - b);
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  console.log(
    `[SERVER] parsed ${totalTasks} tasks for ${userIds.length} users from data.json`
  );
  console.log(
    `[SERVER] request ${requestId} finished in ${Date.now() - startedAt}ms — this block only ever prints in your terminal, never in the browser DevTools console.\n`
  );

  // Server Components cannot hold state or handle events. Uncomment this
  // block *without* adding "use client" to this file and Next.js will
  // refuse to build — that error message is the lesson (see Exercise 1).
  //
  // import { useState } from "react";
  // const [count, setCount] = useState(0); // <-- breaks the Server Component
  // <button onClick={() => setCount(count + 1)}>{count}</button>

  return ( /* ...JSX described in §5... */ );
}
```

Four things in this file are impossible in classic client-side React:

1. **`import fs from "fs/promises"`** and **`import path from "path"`** — Node.js core modules, imported directly into a React component. This only compiles because the component never runs in a browser.
2. **`async function Home()`** — a Server Component can be `async` and `await` data before returning JSX. Client Components cannot do this; a component function can't return a Promise to React on the client.
3. **`fs.readFile(dataPath, "utf-8")`** — the component reads a file from the project's disk while rendering, using `path.join(process.cwd(), "data.json")` so the path resolves correctly regardless of where `next dev`/`next start` is launched from. No API route, no `fetch`, no CORS.
4. The **commented-out hook block** at the bottom, left in deliberately. Uncomment those lines *without* adding `"use client"` and Next.js throws:

   > *"You're importing a component that needs `useState`. It only works in a Client Component but none of its parents are marked with `"use client"`..."*

   That error message **is the lesson**: state and events belong to the client.

### 4.2 `export const dynamic = "force-dynamic"` — why the page must opt out of caching

```js
export const dynamic = "force-dynamic";
```

Next.js's App Router **statically renders** Server Components by default when it detects nothing request-specific is used (no `cookies()`, `headers()`, or dynamic `searchParams`). This page only reads a local JSON file — nothing request-specific — so *without* this line, Next.js would render it **once at build time**, cache the HTML, and every `console.log` above would fire exactly once, ever. Refreshing the browser would show you the same cached page and teach you nothing about per-request server execution.

`export const dynamic = "force-dynamic"` tells Next.js: *render this on the server, from scratch, on every single request.* That's what makes the `requestId` and timestamp change — and the terminal log reappear — every time you reload `http://localhost:3000`.

### 4.3 The `"use client"` directive

Open `my-app/components/LiveClock.js` — the smallest client island in the app:

```js
"use client";

import { useEffect, useState } from "react";

function format(date) {
  return date.toLocaleTimeString("en-GB", { hour12: false });
}

export default function LiveClock() {
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

  return (/* ...renders a ticking HH:MM:SS badge... */);
}
```

- `"use client"` must be the **very first statement** in the file (before any imports).
- It marks the **client boundary**: this file *and every module it imports* become part of the client bundle, are shipped to the browser, and hydrate there.
- **Why does `LiveClock` need it?** `setInterval` and `useState` only exist once the component is running in a browser tab — a server response is sent once and finished; it can't keep "ticking." This is the purest possible argument for `"use client"`: a value that must update on a timer, in the browser, forever.
- The `now` state starts as `null` and is only set inside `useEffect` (which never runs on the server) — this keeps the server-rendered HTML and the first client render identical, avoiding a hydration mismatch. The clock visibly "switches on" a beat after the page loads, which is itself part of the lesson.

`LiveClock` is rendered from `my-app/components/Navbar.js`, which has **no** `"use client"` directive:

```js
// Server Component (no "use client" at the top).
import Badge from "@/components/Badge";
import LiveClock from "@/components/LiveClock";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 ...">
      {/* ...logo, nav links... */}
      <Badge kind="server">Server</Badge>
      <LiveClock />
    </header>
  );
}
```

That's the composition rule made concrete: **a Server Component (`Navbar.js`) renders a Client Component (`<LiveClock/>`)**. That direction is always allowed — Next.js only ships the JS for `LiveClock` itself (plus React's hydration runtime), not for the rest of the navbar. The reverse — importing a server-only module like `fs` into a client file — is not allowed (see Pitfalls, §8).

The same pattern repeats for the page's other interactive island, `my-app/components/TaskExplorer.js`:

```js
"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/Badge";

export default function TaskExplorer({ tasks, userIds }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [userId, setUserId] = useState("all");
  const [visibleCount, setVisibleCount] = useState(18);
  const [interactions, setInteractions] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((task) => {
      if (status === "completed" && !task.completed) return false;
      if (status === "pending" && task.completed) return false;
      if (userId !== "all" && task.userId !== Number(userId)) return false;
      if (q && !task.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, query, status, userId]);

  // ...search input, status segmented control, user <select>,
  // "Show more" pagination, and a live "Client interactions" counter...
}
```

`TaskExplorer` receives the *already-fetched* `tasks` array as a **prop** from the Server Component that rendered it (`app/page.js`). It never fetches anything itself — it only filters, sorts, and paginates data it was handed, entirely in the browser, with `useMemo` recomputing the filtered list on every keystroke.

### 4.4 Direct data access: `fs` in an async Server Component

`my-app/app/page.js` now genuinely uses `data.json` (the earlier version of this demo read `.gitignore` instead and left `data.json` unused — that's fixed):

```js
const dataPath = path.join(process.cwd(), "data.json");
const raw = await fs.readFile(dataPath, "utf-8");
const tasks = JSON.parse(raw);
```

- `path.join(process.cwd(), "data.json")` builds an **absolute path** from the current working directory (the `my-app/` folder where `next dev`/`next start` runs), which is more robust than a bare relative string like `"data.json"` — see Pitfalls §8 for why that distinction matters.
- `fs.readFile(dataPath, "utf-8")` is `await`-ed directly, since `Home` is `async` — no `.then()` chaining needed.
- `JSON.parse(raw)` turns the 200-row array into plain JS objects, which are then: (a) reduced to stats (`totalTasks`, `completedTasks`, `pendingTasks`, `userIds`, `completionRate`) rendered directly in server-generated HTML via `<StatCard/>`, and (b) passed whole into `<TaskExplorer tasks={tasks} userIds={userIds} />` as **serializable props** — plain arrays/objects/strings/numbers, exactly what's allowed to cross the server → client boundary.
- None of the code that reads and parses `data.json` — the `fs` import, the `path` import, the parsing logic — is ever sent to the browser. Only the resulting `tasks` array (as data, not code) crosses over.

### 4.5 Async Server Components

`Home()` in `app/page.js` is declared `async function Home()` and uses `await fs.readFile(...)` directly — no `.then()` callback needed. That `async` keyword on a component is legal **only** in Server Components; a Client Component's function body cannot be `async` because React on the client needs to call it synchronously to get JSX back immediately.

### 4.6 `console.log` — terminal vs browser (proof of where code runs)

The single most convincing demonstration in this lecture:

```js
console.log(
  `\n[SERVER] app/page.js rendering — request ${requestId} at ${new Date().toISOString()}`
);
```

...versus, inside `LiveClock.js`:

```js
console.log(
  "%c[CLIENT] LiveClock mounted in the browser — this line lives only in DevTools, never your terminal.",
  "color:#a78bfa"
);
```

Run `npm run dev`, load `http://localhost:3000`, and look:

| Where you look | What you see | Why |
|---|---|---|
| **Terminal** (where `next dev` runs) | `[SERVER] app/page.js rendering — request <id> ...`, `[SERVER] parsed 200 tasks for 10 users ...`, `[SERVER] request <id> finished in Nms ...` — a **new request id every reload** | `page.js` is a Server Component with `force-dynamic` — it re-executes in the Node.js process on every request |
| **Browser DevTools console** | `[CLIENT] LiveClock mounted in the browser ...` (styled in violet) | `LiveClock.js` is a Client Component — its code shipped to the browser and its log only fires there |

If you refresh the page, the terminal prints a brand-new `[SERVER] ...` block with a new `requestId`. The `[CLIENT] LiveClock mounted...` line, by contrast, only ever appears in DevTools — even a hard refresh won't put it in the terminal, because that code never runs in Node at all past the very first (empty) HTML shell.

---

## 5. Full Code Walkthrough, File by File

### `my-app/app/layout.js` — Root layout (Server Component)

```js
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  title: "Server vs Client Components · RSC Lab",
  description:
    "A hands-on Next.js App Router demo that makes the server/client component boundary observable — watch the terminal, watch the browser, see the difference.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-ink-primary antialiased">
        <a href="#overview" className="sr-only focus:not-sr-only ...">
          Skip to content
        </a>
        <Navbar />
        <main className="flex-1 bg-grid">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- No `"use client"` → Server Component. That's why it can use two server-only features: **`next/font/google`** (both Inter and JetBrains Mono are downloaded and optimized *at build time*) and **`export const metadata`** (only allowed in Server Components).
- Two fonts, exposed as CSS variables (`--font-inter`, `--font-mono`) and mapped in `tailwind.config.js` to `font-sans` / `font-mono` — Inter for UI text, JetBrains Mono for the terminal-style badges, stats, and code blocks throughout the page.
- A **skip-to-content link** (visually hidden until focused) for keyboard users, then the sticky `<Navbar/>`, a `<main>` with a faint `bg-grid` texture, and `<Footer/>` — all three are Server Components.

### `my-app/app/page.js` — Home page (Server Component, async)

Full source and line-by-line reasoning in §4.1–§4.6. The JSX renders, in order: a hero section with two "look here" callouts (terminal vs DevTools), a `<BoundaryDivider/>`, a server-computed stats grid (`<StatCard/>` × 4), another `<BoundaryDivider kind="client"/>`, the `<TaskExplorer/>` client island, a final `<BoundaryDivider/>`, and the static `<ExplainerSection/>`.

### `my-app/components/Navbar.js` — Server Component

Sticky header (`position: sticky; top: 0`), rendered entirely on the server. Contains the logo, three anchor links to the page's sections (`#overview`, `#ledger`, `#guide`), a `<Badge kind="server">Server</Badge>` tag, and the one Client Component it composes: `<LiveClock/>`. Full source and reasoning in §4.3.

### `my-app/components/Footer.js` — Server Component

```js
import Badge from "@/components/Badge";

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-panel-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Badge kind="server">Server Component</Badge>
          <p className="font-mono text-xs text-ink-tertiary">components/Footer.js</p>
        </div>
        <p className="text-xs text-ink-tertiary">
          Lecture 122 · Rendered on the server, shipped as plain HTML — no client JavaScript for this footer.
        </p>
      </div>
    </footer>
  );
}
```

Purely static markup — no directive needed. Labels itself with the same `<Badge/>` used everywhere else, so the pattern ("what am I looking at?") stays consistent site-wide.

### `my-app/components/Badge.js` — Server Component

A small reusable pill: colored dot + uppercase monospace label, in one of three "kinds" — `server` (phosphor green), `client` (violet), `warn` (amber). Every section of the page wears one of these, so the render environment is never ambiguous. Pure markup, no `"use client"` needed even though it's used *inside* Client Components (`TaskExplorer.js`) — a component with no state/handlers/browser APIs stays server-renderable content wherever it's imported; when imported into a Client Component's module graph it simply gets bundled for the client too, without needing its own directive.

### `my-app/components/BoundaryDivider.js` — Server Component

The page's signature element: a dashed horizontal seam with a centered label chip (e.g. *"Server render ends — Client Component begins below"*). It appears three times on the page, at every point the render environment changes, functioning as a literal, visual "you are here" marker for the server/client boundary.

### `my-app/components/StatCard.js` — Server Component

A presentational tile (`label`, `value`, `hint`, `accent`) fed numbers that were computed in `app/page.js` — `totalTasks`, `completedTasks`, `pendingTasks`, `userIds.length`. No state, no props from the browser, nothing that needs hydration.

### `my-app/components/ExplainerSection.js` — Server Component

A static "field guide": a comparison table (need → server/client → why) and two side-by-side code snippets (a trimmed `app/page.js` and `components/TaskExplorer.js`) shown as plain `<pre>` blocks — no syntax-highlighting library, just Tailwind. Zero client JavaScript.

### `my-app/components/LiveClock.js` — Client Component

Full source and reasoning in §4.3. The smallest possible "why does this *need* the browser" demo: a clock that ticks every second via `setInterval`.

### `my-app/components/TaskExplorer.js` — Client Component

Full source and reasoning in §4.3–§4.4. Receives `tasks` (200 items) and `userIds` (10 ids) as props from the server. Owns five pieces of state: `query`, `status`, `userId`, `visibleCount`, and `interactions` (a running count of every filter/search/pagination action, displayed live — proof the component is truly interactive in the browser, not just server-rendered text). Filtering runs through `useMemo` so it only recomputes when `tasks`, `query`, `status`, or `userId` actually change.

### `my-app/data.json` — sample dataset

An array of 200 todos (`userId` 1–10, `id`, `title`, `completed`) mirroring `https://jsonplaceholder.typicode.com/todos`. Unlike the previous version of this demo, `data.json` **is** now read and rendered — by `app/page.js`, via `fs.readFile` + `JSON.parse` — and its contents drive both the server-computed stats grid and the client-side task ledger.

### `my-app/app/globals.css` — global styles & design tokens

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --canvas: 9 10 12;
  --panel-0: 14 16 19;
  --panel-1: 19 22 26;
  --panel-2: 25 29 34;

  --text-primary: 237 240 243;
  --text-secondary: 163 171 181;
  --text-tertiary: 118 126 138;
  --text-muted: 82 89 99;

  --border: 255 255 255;
  --border-strong: 255 255 255;
  --border-emphasis: 255 255 255;

  --server: 61 220 151;   /* phosphor green — stdout / server accent */
  --server-dim: 15 41 32;

  --client: 167 139 250;  /* violet — hydration / client accent */
  --client-dim: 33 27 58;

  --warn: 251 191 36;     /* amber — pitfalls / warnings */
  --warn-dim: 46 35 10;
}
```

- No longer the boilerplate light/dark-media-query gradient — replaced with a committed dark "control room console" palette: near-black canvas, three levels of panel elevation, a four-step text hierarchy (primary/secondary/tertiary/muted), a three-step border hierarchy, and two accent "diodes" (server green, client violet) plus an amber warning tone.
- Utilities: `.border-hairline` / `-strong` / `-emphasis` (low-opacity borders that barely show until you look for structure), `.bg-grid` (a faint graph-paper texture for `<main>`), and a `prefers-reduced-motion` block that disables the pulsing-dot animations for users who've asked for less motion.
- Imported once in `layout.js`, so it applies app-wide.

### `my-app/tailwind.config.js` — Tailwind configuration

```js
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [ /* pages, components, app globs — unchanged */ ],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        panel: { 0: "...", 1: "...", 2: "..." },
        ink: { primary: "...", secondary: "...", tertiary: "...", muted: "..." },
        server: { DEFAULT: "...", dim: "..." },
        client: { DEFAULT: "...", dim: "..." },
        warn: { DEFAULT: "...", dim: "..." },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};
```

Maps every CSS variable from `globals.css` into Tailwind utility classes (`bg-canvas`, `text-ink-secondary`, `bg-server-dim/60`, `ring-client/25`, etc.) using the `rgb(var(--x) / <alpha-value>)` pattern, which lets Tailwind's opacity modifiers (`/60`, `/25`, `/30`...) work on every custom color. Still **only Tailwind** — no UI kit, no icon library, no extra runtime dependency.

### `my-app/next.config.mjs` — Next.js config

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

Unchanged, empty defaults — Server Components need **no configuration at all**; they're simply how the App Router works. `export const dynamic = "force-dynamic"` in §4.2 is a per-route export, not a config file setting.

### `my-app/package.json` — dependencies & scripts

```json
{
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

Unchanged from the original scaffold — Next **14.1.0** with React **18**. No new npm packages were added for this upgrade; every visual element is Tailwind utilities plus hand-rolled inline SVG icons.

### `my-app/jsconfig.json` — import alias

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Unchanged. Maps `@/` to the project root, which is what makes `import Navbar from "@/components/Navbar"` (and every other `@/components/...` / `@/data.json` import across the new files) resolve correctly.

---

## 6. Decision Guide — Server Component or Client Component?

| You need to… | Use | Why |
|---|---|---|
| Fetch data from a DB, filesystem, or internal API | **Server** | Direct access, no exposed endpoint, no client JS (`app/page.js` + `fs.readFile`) |
| Keep API keys / secrets safe | **Server** | Server code never reaches the browser |
| Use heavy dependencies (markdown, date libs, ORMs) | **Server** | Keeps them out of the client bundle |
| Render mostly-static content (articles, lists, layouts) | **Server** | Zero hydration cost (`Navbar.js` shell, `Footer.js`, `ExplainerSection.js`) |
| `await` a Promise directly in the component body | **Server** | Only Server Components can be declared `async` (`Home()` in `page.js`) |
| Use `useState`, `useReducer`, `useEffect`, custom hooks | **Client** | Hooks require the browser runtime (`TaskExplorer.js`, `LiveClock.js`) |
| Handle events: `onClick`, `onChange`, `onSubmit` | **Client** | Event handlers can't be serialized to the browser from the server |
| Use browser APIs: `localStorage`, `window`, `setInterval` | **Client** | These only exist in the browser (`LiveClock.js`'s ticking clock) |
| Use `useContext` / context providers | **Client** | Context is a client-side mechanism |
| Use class components or `React.Component` lifecycles | **Client** | Not supported in RSC |

**Rule of thumb:** start with a Server Component (the default). Add `"use client"` only when the framework's error message forces you to — and add it to the **smallest leaf component possible** (like `LiveClock` inside `Navbar`, or `TaskExplorer` inside the page), not to the whole page.

---

## 7. How to Run

```bash
cd my-app
npm install
npm run dev
```

Then open **http://localhost:3000** and, crucially, **keep an eye on the terminal**:

1. The page loads a sticky navbar (with a live ticking clock), a hero section, a server-computed stats grid, an interactive task ledger, and a static field guide.
2. The **terminal** prints a fresh `[SERVER]` block — with a new request id — on every single reload, because `app/page.js` exports `dynamic = "force-dynamic"`.
3. The **browser DevTools console** shows a violet `[CLIENT] LiveClock mounted...` line once the page hydrates — that line never appears in the terminal.
4. Type in the task ledger's search box, toggle the status filter, or pick a user — the **"Client interactions" counter** climbs and the list re-filters instantly, with **no new terminal output at all**.

To verify a production build (also confirms the route is correctly marked dynamic):

```bash
npm run build
```

Look for `Route (app)` → `/` marked `λ (Dynamic)` in the build output — that's `force-dynamic` doing its job.

Bonus experiment: uncomment the `useState` block left in `page.js` (see §4.1) and watch Next.js refuse to compile until you either add `"use client"` or move the interactivity into a client child.

---

## 8. Key Takeaways, Pitfalls & Practice

### Key takeaways

1. In the App Router, **everything is a Server Component until you say otherwise** with `"use client"`.
2. Server Components can `import fs`, `await` promises directly, hit databases, and hold secrets — their code **never ships to the browser**, which is why bundles shrink.
3. `"use client"` marks a **boundary**, not just one component — everything that file imports becomes client code too.
4. **Server → Client composition works** (`Navbar.js` renders `<LiveClock/>`, `page.js` renders `<TaskExplorer/>`); pass data down as serializable props (the `tasks` array crosses the wire as data, never as the code that fetched it).
5. Pages that read local/dynamic data but don't use `cookies()`/`headers()` can get **statically cached** by default — `export const dynamic = "force-dynamic"` opts back into per-request rendering when you want to observe it live.
6. `console.log` location is your compass: **terminal = server, DevTools = client**.

### Common pitfalls

- **Using hooks or event handlers without `"use client"`.** `useState`, `useEffect`, `onClick` in a Server Component produce a build error — exactly what the commented lines in `page.js` would trigger. Fix: add `"use client"` to that file, or better, extract the interactive part into a small client child (that's what `TaskExplorer.js` and `LiveClock.js` already do).
- **Importing server-only code into a client file.** Add `import fs from "fs/promises"` to `TaskExplorer.js` or `LiveClock.js` and it breaks — `fs` doesn't exist in the browser. Server-only modules must stay behind the server boundary.
- **Putting `"use client"` at the top of every file "just in case."** This forfeits every RSC benefit; the app degrades into a classic client-rendered SPA with larger bundles. Notice how small the client surface actually is here: two files (`LiveClock.js`, `TaskExplorer.js`) out of eight components.
- **Forgetting `"use client"` must be the first line** — above all imports, or it's ignored.
- **Passing non-serializable props** (functions, class instances) from a Server Component to a Client Component — only serializable data crosses the boundary. `tasks` and `userIds` are plain arrays of plain objects/numbers, which is exactly why they can be passed straight from `page.js` into `<TaskExplorer/>`.
- **Relative `fs` paths resolve against the process working directory, not the source file.** The earlier version of this demo used `fs.readFile(".gitignore")`, which happened to work but was brittle. The current code fixes this with `path.join(process.cwd(), "data.json")` — an explicit, robust absolute path.
- **Assuming a Server Component always re-runs.** Without `export const dynamic = "force-dynamic"`, Next.js may statically render a page like this once and cache it — meaning the `console.log` calls (and the `requestId`) would stop changing on reload, which is exactly the confusing behavior this line prevents.

### Practice exercises

1. **Break it, then fix it.** Uncomment the `useState`/`button` block in `page.js`. Read the full error. Fix it *without* adding `"use client"` to `page.js` — extract a small `components/Counter.js` client component and render it from the page instead.
2. **Cache it back on.** Remove `export const dynamic = "force-dynamic";` from `page.js`, run `npm run build && npm run start`, and reload the page several times. Confirm the terminal only logs once. Explain in one sentence why, then put the line back.
3. **Log detective.** Add `console.log("NAVBAR RUNNING")` inside `Navbar.js` and `console.log("EXPLAINER RUNNING")` in `ExplainerSection.js`. Reload the page and record exactly which log appears in the terminal, the browser console, or both — then explain why.
4. **A second client island.** Add a "Mark all visible as complete" button to `TaskExplorer.js` that flips `completed` to `true` on every currently-visible task (client-only state, no server call). Confirm the change disappears on reload — why does it, given there's no database involved?
5. **Boundary violation.** Move `import fs from "fs/promises"` into `TaskExplorer.js` and try to use it. Observe the build error, then explain in one sentence why the same import is legal in `page.js`.
6. **Add a third stat.** In `page.js`, compute `const usersWithAllComplete = userIds.filter(id => tasks.filter(t => t.userId === id).every(t => t.completed)).length;` and render it as a fifth `<StatCard/>`. Confirm it's computed server-side by checking that no todo-filtering JS for this new stat appears in the client bundle (DevTools → Network → the `/_next/static` chunk for the page).

---

## 9. About `my-app/README.md`

The `README.md` **inside `my-app/`** is the stock, auto-generated `create-next-app` boilerplate (getting-started/deploy-on-Vercel notes). It has been deliberately left untouched — **these lecture notes live here at the lecture-folder root instead** and are the document to read for this lesson.
