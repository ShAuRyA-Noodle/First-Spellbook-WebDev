# Lecture 122 — Server Components in Next.js

> **Course folder:** `Lec-122 Server Components in NextJS` · **Demo app:** `my-app/` (Next.js 14, App Router)

---

## 1. Overview — What Are Server Components?

**React Server Components (RSC)** are components that render **only on the server**. Their code is *never* shipped to the browser. In the Next.js **App Router** (the `app/` directory), **every component is a Server Component by default** — you have to explicitly opt *out* with the `"use client"` directive when you need browser interactivity.

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
- Why **hooks (`useState`, `useEffect`) and event handlers (`onClick`) crash Server Components** — and how the demo code proves it with commented-out lines.
- How a Server Component can use **Node.js APIs directly** — this demo imports `fs/promises` and reads a file straight off the disk inside a page component.
- How to *prove* where a component runs by watching where **`console.log` output appears**: the **terminal** (server) vs the **browser DevTools console** (client).
- A practical **decision guide** for choosing Server vs Client Components.

---

## 3. Project Structure

```
Lec-122 Server Components in NextJS/
├── README.md                ← these lecture notes (you are here)
└── my-app/                  ← the Next.js 14 demo app
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css      ← Tailwind directives + boilerplate theme CSS
    │   ├── layout.js        ← Root layout (Server Component)
    │   └── page.js          ← Home page (Server Component — the star of this lecture)
    ├── components/
    │   └── Navbar.js        ← Client Component ("use client")
    ├── public/              ← static assets
    ├── data.json            ← 200 sample todos (JSONPlaceholder-style data)
    ├── jsconfig.json        ← the "@/*" import alias
    ├── next.config.mjs      ← default (empty) Next config
    ├── package.json         ← Next 14.1.0, React 18, Tailwind
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── .eslintrc.json
    ├── .gitignore           ← the file page.js reads with fs (!)
    └── README.md            ← untouched create-next-app boilerplate (see §9)
```

---

## 4. Concept Deep-Dives

### 4.1 Server Components by default in the App Router

Open `my-app/app/page.js`. There is **no `"use client"` at the top**, so this is a Server Component — automatically, with zero configuration:

```js
// import { useState, useEffect } from "react";
import fs from "fs/promises"
import Navbar from "@/components/Navbar"

export default function Home() {
  // const [count, setCount] = useState(0)
  console.log("Hey I am harry")
  let a = fs.readFile(".gitignore")
  a.then(e=>{console.log(e.toString())})
  return (
   <div>
    <Navbar/>
    I am a component 
    {/* {count} */}
    {/* <button onClick={()=> setCount(count + 1)}>Click me</button> */}
   </div>
  );
}
```

Three things in this small file are impossible in classic client-side React:

1. **`import fs from "fs/promises"`** — a Node.js core module, imported directly into a React component. This only compiles because the component never runs in a browser.
2. **`fs.readFile(".gitignore")`** — the component reads a file from the project's disk while rendering. No API route, no `fetch`, no CORS.
3. The **commented-out hook code** (`useState`, `onClick`) — deliberately left in the file by the instructor. Uncomment those lines *without* adding `"use client"` and Next.js throws:

   > *"You're importing a component that needs `useState`. It only works in a Client Component but none of its parents are marked with `"use client"`..."*

   That error message **is the lesson**: state and events belong to the client.

### 4.2 The `"use client"` directive

Now open `my-app/components/Navbar.js`:

```js
"use client"
import React from 'react'

const Navbar = () => {
  return (
    <div>
      navbar
    </div>
  )
}

export default Navbar
```

- `"use client"` must be the **very first statement** in the file (before any imports).
- It marks the **client boundary**: this file *and every module it imports* become part of the client bundle, are shipped to the browser, and hydrate there.
- **Why would Navbar need it?** A navbar is a classic interactive component — hamburger toggles, dropdowns, active-link highlighting all need `useState`/`onClick`, which require the client. In this demo the Navbar body is still a static `<div>` (the directive is there so the lecture can add interactivity, or it's left over from the counter experiment in `page.js`), but the pattern shown is the real-world one: **the page stays a Server Component, and only the small interactive leaf (`<Navbar/>`) is a Client Component.**
- Note the composition: a **Server Component (`page.js`) renders a Client Component (`<Navbar/>`)**. That direction is always allowed. The reverse — importing a server-only module into a client file — is not (see Pitfalls, §8).

### 4.3 Direct data access: `fs` in a component

The demo proves "direct data access" with the Node `fs/promises` API:

```js
import fs from "fs/promises"
...
  let a = fs.readFile(".gitignore")
  a.then(e=>{console.log(e.toString())})
```

- `fs.readFile(".gitignore")` returns a **Promise** of a `Buffer`. The `.then(...)` callback converts it to a string and logs it — and that log shows up **in the terminal running `npm run dev`**, because that is where this code executes.
- The path `".gitignore"` is resolved relative to the process working directory (the `my-app/` folder where you launched `next dev`).
- The read result is only logged, not rendered — the point is simply *"look, a React component just touched the filesystem."*

**About `data.json`:** the project ships a `data.json` at the root of `my-app/` — an array of **200 todo objects** in JSONPlaceholder format:

```json
[
    {
    "userId": 1,
    "id": 1,
    "title": "delectus aut autem",
    "completed": false
    },
    ...
]
```

It is the local stand-in for "data you'd normally fetch from an API." **In the current state of the code, `data.json` is not imported or read anywhere** — `page.js` reads `.gitignore` instead as its fs demo. The file is there as the dataset for the same technique: you would read it the same way (`fs.readFile("data.json")` + `JSON.parse`, or simply `import data from "@/data.json"`) and render the todos directly on the server — with the entire 1,200-line JSON never being sent to the client as JavaScript.

### 4.4 Async Server Components

Server Components *can* be declared `async` so you can `await` data before returning JSX. **This demo does not use one** — `Home()` is a regular synchronous function that fires the file read and handles it with `.then()`. The idiomatic upgrade (and a great exercise, see §8) would be:

```js
export default async function Home() {
  const raw = await fs.readFile("data.json")
  const todos = JSON.parse(raw.toString())
  ...
}
```

That `async` keyword on a component is legal **only** in Server Components — another capability Client Components don't have.

### 4.5 `console.log` — terminal vs browser (proof of where code runs)

The single most convincing demonstration in this lecture:

```js
  console.log("Hey I am harry")
```

Run `npm run dev`, load `http://localhost:3000`, and look:

| Where you look | What you see | Why |
|---|---|---|
| **Terminal** (where `next dev` runs) | `Hey I am harry` **and** the full contents of `.gitignore` | `page.js` is a Server Component — it executes in the Node.js process |
| **Browser DevTools console** | Nothing from `page.js`* | Its code was never sent to the browser |

If you put a `console.log` inside `Navbar.js` (a `"use client"` file), it appears in the **browser console** — and during dev it *also* appears in the terminal once, because client components are additionally pre-rendered on the server for the initial HTML. Server Component logs, however, appear **only** in the terminal, ever.

\* In dev mode Next.js may mirror some server logs to the browser for convenience, but the code itself demonstrably runs in Node — it's reading your filesystem.

---

## 5. Full Code Walkthrough, File by File

### `my-app/app/layout.js` — Root layout (Server Component)

```js
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- The mandatory root layout of the App Router: renders `<html>` and `<body>` and wraps every page as `{children}`.
- No `"use client"` → Server Component. That's why it can use two server-only features:
  - **`next/font/google`** — the Inter font is downloaded and optimized *at build time* on the server.
  - **`export const metadata`** — static metadata (page `<title>` and description) is only allowed in Server Components.

### `my-app/app/page.js` — Home page (Server Component)

Full source shown in §4.1. Line-by-line:

| Line | Meaning |
|---|---|
| `// import { useState, useEffect } from "react";` | Commented out on purpose — importing and *using* hooks here would break the Server Component. |
| `import fs from "fs/promises"` | Node.js filesystem module — only importable because this file never reaches the browser. |
| `import Navbar from "@/components/Navbar"` | Imports the Client Component. `@/` is the root alias from `jsconfig.json`. |
| `console.log("Hey I am harry")` | Prints in the **terminal**, proving server execution. |
| `let a = fs.readFile(".gitignore")` | Kicks off an async file read; `a` is a Promise. |
| `a.then(e=>{console.log(e.toString())})` | Logs the file contents (a Buffer, stringified) to the terminal. |
| `<Navbar/>` | A Server Component rendering a Client Component — the allowed direction. |
| Commented `{count}` / `<button onClick=...>` | The "what breaks a Server Component" experiment, left as evidence. |

### `my-app/components/Navbar.js` — Client Component

Full source shown in §4.2. First line `"use client"` opts this file into the client bundle. It renders a static `navbar` div; the directive positions it to receive state/handlers, which only Client Components may have.

### `my-app/data.json` — sample dataset

An array of 200 todos (`userId`, `id`, `title`, `completed`) mirroring `https://jsonplaceholder.typicode.com/todos`. Present as local data for the server-side reading demo; not referenced by the current code (see §4.3).

### `my-app/app/globals.css` — global styles

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

Standard `create-next-app` output: the three Tailwind directives, CSS variables with a dark-mode media query, a gradient body background, and one custom utility. Imported once in `layout.js`, so it applies app-wide. Not RSC-specific.

### `my-app/next.config.mjs` — Next.js config

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

Empty defaults — Server Components need **no configuration at all**; they're simply how the App Router works.

### `my-app/package.json` — dependencies & scripts

```json
{
  "name": "my-app",
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

Next **14.1.0** with React **18** — the App Router with stable Server Components. Tailwind, PostCSS, and ESLint are dev tooling.

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

Maps `@/` to the project root, which is what makes `import Navbar from "@/components/Navbar"` in `page.js` resolve to `my-app/components/Navbar.js`.

---

## 6. Decision Guide — Server Component or Client Component?

| You need to… | Use | Why |
|---|---|---|
| Fetch data from a DB, filesystem, or internal API | **Server** | Direct access, no exposed endpoint, no client JS |
| Keep API keys / secrets safe | **Server** | Server code never reaches the browser |
| Use heavy dependencies (markdown, date libs, ORMs) | **Server** | Keeps them out of the client bundle |
| Render mostly-static content (articles, lists, layouts) | **Server** | Zero hydration cost |
| Use `useState`, `useReducer`, `useEffect`, custom hooks | **Client** | Hooks require the browser runtime |
| Handle events: `onClick`, `onChange`, `onSubmit` | **Client** | Event handlers can't be serialized to the browser from the server |
| Use browser APIs: `localStorage`, `window`, geolocation | **Client** | These only exist in the browser |
| Use `useContext` / context providers | **Client** | Context is a client-side mechanism |
| Use class components or `React.Component` lifecycles | **Client** | Not supported in RSC |

**Rule of thumb:** start with a Server Component (the default). Add `"use client"` only when the framework's error message forces you to — and add it to the **smallest leaf component possible** (like `Navbar` here), not to the whole page.

---

## 7. How to Run

```bash
cd my-app
npm install
npm run dev
```

Then open **http://localhost:3000** and, crucially, **keep an eye on the terminal**:

1. The page shows `navbar` (from the Client Component) and `I am a component`.
2. The **terminal** prints `Hey I am harry` followed by the contents of `.gitignore` — server-side proof.
3. The **browser console** shows no such logs — the page's code never got there.

Bonus experiment: uncomment the `useState` import, the `count` state, and the `<button>` in `page.js` and watch Next.js refuse to compile until you either add `"use client"` or move the interactivity into a client child.

---

## 8. Key Takeaways, Pitfalls & Practice

### Key takeaways

1. In the App Router, **everything is a Server Component until you say otherwise** with `"use client"`.
2. Server Components can `import fs`, hit databases, and hold secrets — their code **never ships to the browser**, which is why bundles shrink.
3. `"use client"` marks a **boundary**, not just one component — everything that file imports becomes client code too.
4. **Server → Client composition works** (`page.js` renders `<Navbar/>`); pass data down as serializable props.
5. `console.log` location is your compass: **terminal = server, DevTools = client**.

### Common pitfalls

- **Using hooks or event handlers without `"use client"`.** `useState`, `useEffect`, `onClick` in a Server Component produce a build error — exactly what the commented lines in `page.js` would trigger. Fix: add `"use client"` to that file, or better, extract the interactive part into a small client child.
- **Importing server-only code into a client file.** Add `"use client"` to `page.js` as-is and the `import fs from "fs/promises"` breaks — `fs` doesn't exist in the browser. Server-only modules must stay behind the server boundary.
- **Putting `"use client"` at the top of every file "just in case."** This forfeits every RSC benefit; the app degrades into a classic client-rendered SPA with larger bundles.
- **Forgetting `"use client"` must be the first line** — above all imports, or it's ignored.
- **Passing non-serializable props** (functions, class instances) from a Server Component to a Client Component — only serializable data crosses the boundary.
- **Relative `fs` paths** like `".gitignore"` resolve against the process working directory, not the source file — fine in this demo, brittle in production (prefer `path.join(process.cwd(), ...)`).

### Practice exercises

1. **Break it, then fix it.** Uncomment the `useState`/`button` code in `page.js`. Read the full error. Fix it *without* adding `"use client"` to `page.js` — extract a `components/Counter.js` client component and render it from the page.
2. **Actually use `data.json`.** Convert `Home` to an **async Server Component** that does `const todos = JSON.parse((await fs.readFile("data.json")).toString())` and renders the first 10 todo titles in a `<ul>`, striking through completed ones. Confirm in DevTools → Network that no todo-fetching JS was sent to the client.
3. **Log detective.** Add `console.log("NAVBAR RUNNING")` inside `Navbar.js` and `console.log("PAGE RUNNING")` in `page.js`. Reload the page and record exactly which log appears in the terminal, the browser console, or both — then explain why.
4. **Interactive navbar.** Give `Navbar` a `useState`-powered mobile menu toggle with an `onClick` button. Note that nothing about `page.js` needs to change — the client boundary was already drawn.
5. **Boundary violation.** Move `import fs from "fs/promises"` into `Navbar.js` and try to use it. Observe the error, then explain in one sentence why the same import is legal in `page.js`.

---

## 9. About `my-app/README.md`

The `README.md` **inside `my-app/`** is the stock, auto-generated `create-next-app` boilerplate (getting-started/deploy-on-Vercel notes). It has been deliberately left untouched — **these lecture notes live here at the lecture-folder root instead** and are the document to read for this lesson.
