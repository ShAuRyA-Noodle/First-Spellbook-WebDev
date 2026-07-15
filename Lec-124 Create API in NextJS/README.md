# Lec-124: Create an API in Next.js (App Router Route Handlers)

## Overview

One of the most powerful features of Next.js is that it is a **full-stack framework**. You don't just build React pages with it — you can also build **backend API endpoints inside the same project**, with the same folder structure, running on the same dev server. There is **no need to spin up a separate Express server**, configure CORS between two ports, or deploy two apps.

In the App Router, these backend endpoints are called **Route Handlers**. You create a special file named `route.js` inside the `app/` directory, export functions named after HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, ...), and Next.js automatically wires them up as API endpoints.

This lecture's demo project (`api-routes/`) does exactly that:

- A route handler at `app/api/add/route.js` exposes a **POST** endpoint at **`/api/add`** that reads a JSON body and echoes it back with a success flag.
- A client page (`app/page.js`) renders a button that calls this API using `fetch()` and logs the response.

One project. One server. Frontend **and** backend.

---

## What You'll Learn

- What **Route Handlers** are in the Next.js App Router and how they replace the old `pages/api` API Routes.
- The **file-system convention**: `app/api/<name>/route.js` → endpoint at `/api/<name>`.
- How to handle a request by **exporting an async function named after the HTTP method** (here: `POST`).
- How to **parse a JSON request body** with `await request.json()`.
- How to **send a JSON response** with `NextResponse.json()` from `next/server`.
- How a **client component** (`"use client"`) calls your own API with `fetch()`, including method, headers, and a stringified body.
- How to **test** the endpoint from the browser console, DevTools Network tab, and `curl`.
- Why Next.js API routes often make a **separate Express server unnecessary** — and when you might still want one.

---

## Project Structure

```
Lec-124 Create API in NextJS/
├── README.md                  ← these lecture notes (you are here)
└── api-routes/                ← the Next.js app (created with create-next-app)
    ├── README.md              ← untouched create-next-app boilerplate readme
    ├── package.json           ← Next 14.1.0, React 18, Tailwind (dev deps)
    ├── next.config.mjs        ← empty/default Next config
    ├── jsconfig.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── public/
    └── app/
        ├── layout.js          ← root layout (Inter font, imports globals.css)
        ├── page.js            ← "/" — client page that calls the API
        ├── globals.css        ← Tailwind directives + default styles
        └── api/
            └── add/
                └── route.js   ← ★ the API endpoint → POST /api/add
```

### The Route Handler Convention

| File on disk | Resulting URL |
|---|---|
| `app/api/add/route.js` | `/api/add` |
| `app/api/users/route.js` | `/api/users` (if you created it) |
| `app/api/users/[id]/route.js` | `/api/users/:id` (dynamic, if you created it) |

Rules to remember:

1. The file **must** be named `route.js` (or `route.ts`). The **folder name** becomes the URL segment — exactly like `page.js` works for pages.
2. Technically route handlers can live anywhere under `app/`, but putting them under `app/api/...` is the standard convention that keeps API URLs clearly namespaced.
3. A folder cannot have **both** a `page.js` and a `route.js` at the same path — a URL is either a page or an endpoint, never both.
4. You export **one async function per HTTP method** you want to support: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
5. Route handlers run **on the server** — safe for secrets, database calls, and API keys. `console.log` inside them prints to the **terminal**, not the browser console.

---

## Concept Deep-Dives (with the actual project code)

### 1. Exporting an HTTP-method function

The entire API endpoint in this project is this file — `api-routes/app/api/add/route.js`, verbatim:

```js
import { NextResponse } from "next/server";

export async function POST(request) {
    let data = await request.json()
    console.log(data)
    return NextResponse.json({success: true, data})
} 
```

Key idea: the **name of the exported function is the HTTP method it handles**. Because only `POST` is exported here, this endpoint only answers `POST /api/add`. Any other method (like a browser `GET`) is rejected automatically with **`405 Method Not Allowed`** — Next.js handles that for you; you write zero boilerplate.

If you also wanted `GET /api/add`, you'd simply add to the same file:

```js
// Not in the project — shown for illustration
export async function GET(request) {
    return NextResponse.json({ message: "hello from GET" })
}
```

### 2. Parsing the request body: `await request.json()`

```js
let data = await request.json()
```

- `request` is a Web-standard [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object (Next extends it as `NextRequest`).
- `.json()` reads the raw body stream and parses it as JSON.
- It returns a **Promise**, so you **must `await` it**. Forget the `await` and `data` is a pending Promise, not your payload — `console.log(data)` would print `Promise { <pending> }` and anything downstream breaks.
- The body can only be consumed **once** per request.

For other body types there are siblings: `request.text()`, `request.formData()`. For query strings you'd use `request.nextUrl.searchParams`.

### 3. Sending a JSON response: `NextResponse.json()`

```js
import { NextResponse } from "next/server";
// ...
return NextResponse.json({success: true, data})
```

- `NextResponse.json(obj)` serializes the object, sets the `Content-Type: application/json` header, and returns a `200 OK` response — all in one line.
- It's Next's enhanced version of the Web-standard `Response.json()` (which also works in route handlers), adding extras like cookie helpers and redirects.
- To customize the status code: `NextResponse.json({ error: "Bad input" }, { status: 400 })`.

### 4. The client page: `"use client"` + `fetch`

This project's frontend is a **client component** with a button and a click handler — `api-routes/app/page.js`, verbatim:

```js
"use client"
import Image from "next/image";

export default function Home() {
  const handleClick = async () => {
    let data = {
      name: "Shubham",
      role: "Coder"
    }
    let a = await fetch("/api/add", {
      method: "POST", headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    let res = await a.json()
    console.log(res)
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Next.js Api routes demo</h1>
      <button onClick={handleClick}>click me</button>
    </div>
  );
}
```

Things to notice:

- **`"use client"` is required** at the top because the component uses interactivity (`onClick`). Server components can't attach event handlers.
- The fetch URL is **relative** (`"/api/add"`) — frontend and backend share the same origin, so there's no host to configure and **no CORS problem**. This is a huge practical win over a separate backend on another port.
- The three parts of a proper JSON POST from the browser:
  1. `method: "POST"` — matches the exported `POST` function on the server.
  2. `headers: { "Content-Type": "application/json" }` — tells the server the body is JSON.
  3. `body: JSON.stringify(data)` — `fetch` bodies are strings/streams, so the object must be stringified.
- Two awaits on the client side too: one for the network response (`await fetch(...)`), one for parsing its body (`await a.json()`).

### 5. The supporting files (briefly)

`app/layout.js` is the standard root layout — it loads the Inter font and global CSS, and wraps every page. Nothing API-specific here, verbatim:

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

`globals.css` contains the Tailwind directives (`@tailwind base/components/utilities`) plus create-next-app's default gradient/dark-mode styles — that's why `className="text-xl font-bold"` works on the `<h1>`.

`next.config.mjs` is the default empty config:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

`package.json` pins **`next: 14.1.0`** with React 18 and the usual `dev/build/start/lint` scripts.

---

## Full Code Walkthrough: One Request, End-to-End

Let's trace exactly what happens when you click the button.

**Step 0 — Setup.** `npm run dev` starts one Node process that serves *both* the page at `/` and the API at `/api/add`.

**Step 1 — The page renders.** You visit `http://localhost:3000`. `app/page.js` (a client component) renders the heading and the `click me` button. `handleClick` is attached as the button's `onClick`.

**Step 2 — Click → build the payload.**

```js
let data = {
  name: "Shubham",
  role: "Coder"
}
```

A plain JS object is created in the browser.

**Step 3 — Click → send the request.**

```js
let a = await fetch("/api/add", {
  method: "POST", headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
})
```

The browser issues `POST http://localhost:3000/api/add` with the body `{"name":"Shubham","role":"Coder"}`. Execution pauses at `await` until the server replies.

**Step 4 — Next.js routes the request.** The URL segment `api/add` maps to the folder `app/api/add/`, whose `route.js` exports a `POST` function — method matches, so Next invokes it with the incoming `request`.

**Step 5 — The handler parses the body.**

```js
let data = await request.json()
console.log(data)
```

The JSON string body is parsed back into an object. `console.log(data)` prints `{ name: 'Shubham', role: 'Coder' }` — **in the terminal running `npm run dev`**, because this code runs on the server.

**Step 6 — The handler responds.**

```js
return NextResponse.json({success: true, data})
```

The server sends back `200 OK` with body:

```json
{ "success": true, "data": { "name": "Shubham", "role": "Coder" } }
```

**Step 7 — The client reads the response.**

```js
let res = await a.json()
console.log(res)
```

The response body is parsed and logged — this time in the **browser DevTools console**. Round trip complete: browser → route handler → browser.

> A great teaching moment: the same payload gets logged twice, once in the terminal (server) and once in the browser (client). Seeing *where* each `console.log` appears is the clearest way to internalize the client/server boundary.

---

## Testing the Endpoint

### Browser (GET) — expect a 405

Open `http://localhost:3000/api/add` directly in the address bar. The browser sends a **GET**, but this route only exports `POST`, so Next.js responds with **405 Method Not Allowed**. This is correct behavior and proves the method-based routing works. (If the file also exported a `GET` function, the browser would show its JSON instead.)

### The app itself (POST)

1. Run the dev server and open `http://localhost:3000`.
2. Open DevTools → Console (and the Network tab).
3. Click **click me**.
4. Browser console shows `{success: true, data: {name: 'Shubham', role: 'Coder'}}`; the terminal shows `{ name: 'Shubham', role: 'Coder' }`; the Network tab shows the `add` request with status 200.

### fetch from the DevTools console (POST)

Paste this on any page of the running app — it matches the real payload shape:

```js
fetch("/api/add", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Shubham", role: "Coder" }),
}).then(r => r.json()).then(console.log)
```

### curl (POST)

```bash
curl -X POST http://localhost:3000/api/add \
  -H "Content-Type: application/json" \
  -d '{"name":"Shubham","role":"Coder"}'
```

On Windows PowerShell:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/add -Method Post -ContentType "application/json" -Body '{"name":"Shubham","role":"Coder"}'
```

Expected response either way:

```json
{"success":true,"data":{"name":"Shubham","role":"Coder"}}
```

---

## Next.js API Routes vs. a Separate Express Server

| Aspect | Next.js Route Handlers | Separate Express Server |
|---|---|---|
| Setup | Zero extra setup — create `route.js`, done | New project: `npm init`, install express, write server bootstrap |
| Servers to run | **One** (`npm run dev` serves pages + API) | Two (Next on 3000, Express on e.g. 5000) |
| CORS | Not needed — same origin, relative `fetch("/api/add")` | Must configure `cors` middleware or a proxy |
| Routing | File-system based (`app/api/add/route.js`) | Code based (`app.post("/api/add", handler)`) |
| Body parsing | Built-in: `await request.json()` | Needs `express.json()` middleware |
| Response helper | `NextResponse.json({...})` | `res.json({...})` |
| Deployment | One deploy (Vercel/Node) — frontend + backend together | Two deploys, two things to monitor |
| Standards | Web-standard `Request`/`Response` objects | Express's own `req`/`res` API |
| When it wins | Apps where the API mainly serves your own frontend; rapid full-stack development | Long-lived servers: WebSockets, cron/background workers, heavy non-HTTP work, an API consumed by many separate clients/teams, or existing Express middleware ecosystems |

Rule of thumb for this course: **if your backend exists to serve your Next.js frontend, put it in route handlers.** Reach for a standalone server only when you hit a need Next can't express (persistent sockets, long-running jobs, etc.).

Side-by-side, the exact same endpoint:

```js
// Next.js — app/api/add/route.js (this project)
import { NextResponse } from "next/server";

export async function POST(request) {
    let data = await request.json()
    console.log(data)
    return NextResponse.json({success: true, data})
}
```

```js
// Express equivalent — an entire extra project for the same result
const express = require("express")
const app = express()
app.use(express.json())

app.post("/api/add", (req, res) => {
    console.log(req.body)
    res.json({ success: true, data: req.body })
})

app.listen(5000)
```

---

## How to Run

```bash
cd api-routes
npm install
npm run dev
```

Then open **http://localhost:3000**, open the DevTools console, and click **click me**. Watch the browser console *and* the terminal.

(Requires Node.js 18+ for Next 14.)

---

## Key Takeaways

1. **Next.js is full-stack**: `app/api/<name>/route.js` gives you a real backend endpoint at `/api/<name>` with no extra server.
2. **The exported function name *is* the HTTP method.** `export async function POST(request)` handles POST; unexported methods get an automatic **405**.
3. **`await request.json()`** parses the incoming JSON body; **`NextResponse.json(obj)`** sends a JSON reply — that's the whole request/response cycle.
4. Route handlers run **on the server**: their `console.log` goes to the terminal, and they're the safe place for secrets and database access.
5. The client calls its own API with a **relative URL** (`fetch("/api/add")`) — same origin, no CORS, and the fetch needs `method`, the `Content-Type: application/json` header, and a `JSON.stringify`-ed body.

## Common Pitfalls

- **Method not exported → 405.** Visiting `/api/add` in the browser (a GET) returns `405 Method Not Allowed` because only `POST` is exported. Export a function for every method you intend to support.
- **Forgetting `await request.json()`.** Without `await`, you get a Promise instead of the data — logs show `Promise { <pending> }` and property access returns `undefined`.
- **Wrong file name.** The file must be `route.js` — `api.js`, `add.js`, or `index.js` inside the folder will simply 404.
- **`page.js` and `route.js` in the same folder.** Not allowed; a path resolves to either a page or a route handler, never both.
- **Missing `"use client"`** on a page that uses `onClick`/state — Next will throw an error about event handlers in Server Components.
- **Forgetting `JSON.stringify(data)`** (or the `Content-Type` header) in the fetch — the server then can't parse the body, and `request.json()` throws.
- **Looking for server logs in the browser.** The `console.log(data)` inside `route.js` prints in the terminal running `npm run dev`, not in DevTools.

## Practice Exercises

1. **Add a GET handler.** In the same `app/api/add/route.js`, export a `GET` function that returns `NextResponse.json({ message: "API is alive" })`. Verify that visiting `/api/add` in the browser now shows JSON instead of a 405.
2. **Actually "add".** Change the POST handler so the client sends `{ a: 5, b: 7 }` and the server responds with `{ success: true, sum: 12 }` — live up to the endpoint's name.
3. **Validate input.** If the incoming body is missing `name` or `role`, respond with `NextResponse.json({ success: false, error: "name and role required" }, { status: 400 })`. Test the 400 with curl.
4. **Wire up a real form.** Replace the hard-coded object in `page.js` with two controlled `<input>` fields (`useState`) for name and role, submit them to `/api/add`, and render the server's response on the page instead of only logging it.
5. **New resource + dynamic route.** Create `app/api/todos/route.js` with `GET` (return an in-memory array) and `POST` (push into it), then add `app/api/todos/[id]/route.js` with a `GET` that reads `params.id`. Test all three with fetch or curl.

---

## A Note on the Other README

`api-routes/README.md` is the **stock create-next-app boilerplate** (getting-started text, Vercel links). It was left untouched on purpose — the lecture notes live in *this* file at the lecture root.
