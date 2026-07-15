# Lec-124: Create an API in Next.js (App Router Route Handlers)

## Overview

One of the most powerful features of Next.js is that it is a **full-stack framework**. You don't just build React pages with it — you can also build **backend API endpoints inside the same project**, with the same folder structure, running on the same dev server. There is **no need to spin up a separate Express server**, configure CORS between two ports, or deploy two apps.

In the App Router, these backend endpoints are called **Route Handlers**. You create a special file named `route.js` inside the `app/` directory, export functions named after HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, ...), and Next.js automatically wires them up as API endpoints.

This lecture's demo project (`api-routes/`) is a small **"Adding Machine"**: a client page styled like a calculator with a live paper-tape log, talking to a real backend endpoint that does the arithmetic.

- A route handler at `app/api/add/route.js` exposes:
  - **`GET /api/add`** — returns human-readable JSON docs for the endpoint.
  - **`POST /api/add`** — reads `{ a, b }` from the JSON body, validates both are finite numbers, and returns `{ success: true, result, a, b }` (or a `400` with an error message on bad input).
- A client page (`app/page.js`) renders two number inputs and an "=" key. Pressing it calls the API with `fetch()`, shows the result on an LCD-style readout, and prints every request/response pair onto a scrolling "tape" log — loading and error states included.

One project. One server. Frontend **and** backend.

---

## What You'll Learn

- What **Route Handlers** are in the Next.js App Router and how they replace the old `pages/api` API Routes.
- The **file-system convention**: `app/api/<name>/route.js` → endpoint at `/api/<name>`.
- How to handle a request by **exporting an async function named after the HTTP method** (here: `GET` and `POST`).
- How to **parse a JSON request body** with `await request.json()` — safely, inside a `try/catch`.
- How to **validate input and return a `400`** with `NextResponse.json(obj, { status: 400 })`.
- How to **send a JSON response** with `NextResponse.json()` from `next/server`.
- How a **client component** (`"use client"`) calls your own API with `fetch()`, including method, headers, and a stringified body — and handles **loading**, **success**, and **error** states.
- How to **test** the endpoint from the browser console, DevTools Network tab, and `curl`.
- Why Next.js API routes often make a **separate Express server unnecessary** — and when you might still want one.

---

## Project Structure

```
Lec-124 Create API in NextJS/
├── README.md                  ← these lecture notes (you are here)
└── api-routes/                ← the Next.js app (created with create-next-app)
    ├── README.md              ← untouched create-next-app boilerplate readme
    ├── package.json            ← Next 14.1.0, React 18, Tailwind (dev deps)
    ├── next.config.mjs        ← empty/default Next config
    ├── jsconfig.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── public/
    └── app/
        ├── layout.js          ← root layout (Inter + JetBrains Mono fonts, metadata)
        ├── page.js            ← "/" — the Adding Machine client page
        ├── globals.css        ← Tailwind directives + design tokens + component styles
        └── api/
            └── add/
                └── route.js   ← ★ the API endpoint → GET/POST /api/add
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

### 1. Exporting HTTP-method functions — `GET` and `POST`

The entire API endpoint in this project is this file — `api-routes/app/api/add/route.js`, verbatim:

```js
import { NextResponse } from "next/server";

/**
 * GET /api/add
 *
 * Route handlers don't need to expose every HTTP method — but when a
 * "GET" is left unexported, Next.js auto-replies 405 to anyone who visits
 * the URL in a browser. Here we export GET too, so visiting the endpoint
 * directly returns useful, human-readable docs instead of a bare error.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/add",
    method: "POST",
    body: { a: "number", b: "number" },
    example: { a: 2, b: 3 },
    responses: {
      200: { success: true, result: 5, a: 2, b: 3 },
      400: { success: false, error: "a and b must both be finite numbers" },
    },
  });
}

/**
 * POST /api/add
 *
 * Reads { a, b } from the JSON body, validates both are finite numbers,
 * and returns their sum. Bad input (missing fields, non-numeric values,
 * malformed JSON) gets a 400 with an explanatory error message instead
 * of crashing or silently returning NaN.
 */
export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { a, b } = body ?? {};
  const isFiniteNumber = (n) => typeof n === "number" && Number.isFinite(n);

  if (!isFiniteNumber(a) || !isFiniteNumber(b)) {
    return NextResponse.json(
      {
        success: false,
        error: "Both 'a' and 'b' are required and must be finite numbers.",
      },
      { status: 400 }
    );
  }

  const result = a + b;

  return NextResponse.json({ success: true, result, a, b }, { status: 200 });
}
```

Key idea: the **name of the exported function is the HTTP method it handles**. Because both `GET` and `POST` are exported here, `GET /api/add` returns endpoint docs and `POST /api/add` does the addition. Any other method (like `DELETE`) is rejected automatically with **`405 Method Not Allowed`** — Next.js handles that for you; you write zero boilerplate.

### 2. Parsing the request body safely: `try { await request.json() }`

```js
let body;
try {
  body = await request.json();
} catch {
  return NextResponse.json(
    { success: false, error: "Request body must be valid JSON." },
    { status: 400 }
  );
}
```

- `request` is a Web-standard [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object (Next extends it as `NextRequest`).
- `.json()` reads the raw body stream and parses it as JSON. It returns a **Promise**, so you **must `await` it**.
- If the body isn't valid JSON (empty body, malformed string, wrong `Content-Type`), `.json()` **throws** — wrapping it in `try/catch` turns a crash into a clean `400` response instead of an unhandled server error.
- The body can only be consumed **once** per request.

For other body types there are siblings: `request.text()`, `request.formData()`. For query strings you'd use `request.nextUrl.searchParams`.

### 3. Validating input and returning a `400`

```js
const { a, b } = body ?? {};
const isFiniteNumber = (n) => typeof n === "number" && Number.isFinite(n);

if (!isFiniteNumber(a) || !isFiniteNumber(b)) {
  return NextResponse.json(
    { success: false, error: "Both 'a' and 'b' are required and must be finite numbers." },
    { status: 400 }
  );
}
```

- `body ?? {}` guards against a `null` body (e.g. `POST` with literal `null` as the JSON payload) so destructuring `a`/`b` off it never throws.
- `Number.isFinite` rejects `NaN`, `Infinity`, strings, missing fields, booleans, objects — anything that isn't a real usable number. `typeof n === "number"` additionally rejects numeric *strings* like `"5"`, so `{ a: "5", b: 2 }` correctly 400s instead of silently coercing.
- The **shape** of the error response mirrors the success shape (`{ success, ... }`), so the client can always branch on `json.success` regardless of status code.

### 4. Sending a JSON response: `NextResponse.json()`

```js
return NextResponse.json({ success: true, result, a, b }, { status: 200 });
```

- `NextResponse.json(obj, init)` serializes the object, sets the `Content-Type: application/json` header, and returns a response with the given status (`200` by default).
- It's Next's enhanced version of the Web-standard `Response.json()` (which also works in route handlers), adding extras like cookie helpers and redirects.
- Status codes used in this project: **`200`** for a valid add, **`400`** for bad/missing input or unparsable JSON.

### 5. The client page: `"use client"` + `fetch` + loading/error states

The frontend is a **client component** — a calculator UI backed by real state, not a single `console.log` button. The request/response cycle, from `api-routes/app/page.js`:

```js
const handleSubmit = async (event) => {
  event.preventDefault();

  const numA = Number(a);
  const numB = Number(b);
  const inputIsValid =
    a.trim() !== "" && b.trim() !== "" && Number.isFinite(numA) && Number.isFinite(numB);

  if (!inputIsValid) {
    setStatus("error");
    setErrorMsg("Enter two valid numbers before pressing =.");
    setResult(null);
    return;
  }

  const payload = { a: numA, b: numB };
  setStatus("loading");
  setErrorMsg("");

  try {
    const response = await fetch("/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    pushEntry({ time, request: payload, response: json, statusCode: response.status, ok: response.ok && json.success === true });

    if (!response.ok || json.success !== true) {
      setStatus("error");
      setErrorMsg(json.error || `Request failed with status ${response.status}.`);
      setResult(null);
      return;
    }

    setResult(json.result);
    setStatus("success");
  } catch (err) {
    // network failure — server unreachable, etc.
    setStatus("error");
    setErrorMsg("Network error — is the dev server running?");
    setResult(null);
  }
};
```

Things to notice:

- **`"use client"` is required** at the top of `page.js` because the component uses state (`useState`) and event handlers (`onSubmit`). Server components can't do either.
- The fetch URL is **relative** (`"/api/add"`) — frontend and backend share the same origin, so there's no host to configure and **no CORS problem**. This is a huge practical win over a separate backend on another port.
- The three parts of a proper JSON POST from the browser:
  1. `method: "POST"` — matches the exported `POST` function on the server.
  2. `headers: { "Content-Type": "application/json" }` — tells the server the body is JSON.
  3. `body: JSON.stringify(payload)` — `fetch` bodies are strings/streams, so the object must be stringified.
- **Three UI states are modeled explicitly**: `idle` → `loading` (button disabled, `aria-busy`, pulsing LCD) → `success` (result shown) or `error` (message shown via `role="alert"`, LCD reads `ERR`).
- The response is checked **two ways**: `response.ok` (HTTP status in the 200 range) **and** `json.success === true` (the app-level contract). Either failing is treated as an error — this matters because a route handler could theoretically return `200` with `{ success: false }`, and the client shouldn't trust the status code alone.
- Every call — success or failure — is logged to a `entries` array and rendered as a line on the **paper tape**, so the raw request/response JSON is always visible on screen, not just in DevTools.

### 6. The supporting files

`app/layout.js` loads two fonts via `next/font/google` — Inter for UI text, JetBrains Mono for the LCD digits and tape (tabular figures, monospace), and sets page metadata:

```js
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata = {
  title: "Adding Machine — Next.js Route Handlers Demo",
  description:
    "A tiny full-stack Next.js demo: a client page that POSTs two numbers to /api/add and prints every request/response on a live paper tape.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>{children}</body>
    </html>
  );
}
```

`globals.css` defines the design tokens (light + dark, via `prefers-color-scheme`) and the component classes used by `page.js` — `.device` (the calculator shell), `.lcd`/`.lcd-digits` (the readout), `.well` (input fields), `.key-equals` (the submit button), `.tape-panel`/`.tape-entry` (the paper-tape log) — on top of the standard `@tailwind base/components/utilities` directives.

`next.config.mjs` is the default empty config:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

`package.json` pins **`next: 14.1.0`** with React 18 and the usual `dev/build/start/lint` scripts.

---

## Full Code Walkthrough: One Request, End-to-End

Let's trace exactly what happens when you type two numbers and press **=**.

**Step 0 — Setup.** `npm run dev` starts one Node process that serves *both* the page at `/` and the API at `/api/add`.

**Step 1 — The page renders.** You visit `http://localhost:3000`. `app/page.js` (a client component) renders the LCD readout (showing `0`), two number inputs pre-filled with `12` and `30`, and the amber `=` key.

**Step 2 — Type and submit.** Editing the inputs updates `a`/`b` state and the live `{a} + {b} =` formula on the LCD. Pressing **=** (or hitting Enter) fires `handleSubmit`, which calls `event.preventDefault()` so the form doesn't reload the page.

**Step 3 — Client-side validation.** Both fields are checked for non-empty, finite numeric values with `Number.isFinite(Number(a))`. If either fails, the request never leaves the browser — `status` becomes `"error"` and a message renders immediately.

**Step 4 — Build the payload and send the request.**

```js
const payload = { a: numA, b: numB }; // e.g. { a: 12, b: 30 }

const response = await fetch("/api/add", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
```

The browser issues `POST http://localhost:3000/api/add` with body `{"a":12,"b":30}`. `status` becomes `"loading"` — the button disables, the LCD shows a pulsing `····`.

**Step 5 — Next.js routes the request.** The URL segment `api/add` maps to the folder `app/api/add/`, whose `route.js` exports a `POST` function — method matches, so Next invokes it with the incoming `request`.

**Step 6 — The handler parses and validates.**

```js
let body;
try {
  body = await request.json(); // { a: 12, b: 30 }
} catch { /* ...400... */ }

const { a, b } = body ?? {};
if (!isFiniteNumber(a) || !isFiniteNumber(b)) { /* ...400... */ }
```

Both checks pass for `{ a: 12, b: 30 }`.

**Step 7 — The handler responds.**

```js
const result = a + b; // 42
return NextResponse.json({ success: true, result, a, b }, { status: 200 });
```

The server sends back `200 OK` with body:

```json
{ "success": true, "result": 42, "a": 12, "b": 30 }
```

**Step 8 — The client reads the response.**

```js
const json = await response.json();
```

`response.ok` is `true` and `json.success` is `true`, so `setResult(42)` and `setStatus("success")` run. The LCD now shows `42`.

**Step 9 — The tape prints a line.** Regardless of outcome, `pushEntry(...)` prepends a record — timestamp, the exact request payload, the exact response JSON, and the HTTP status — to the `entries` array, which renders as a new receipt-style line at the top of the tape panel. This is the round trip made visible: the same JSON that crossed the network is shown right there on the page.

> A great teaching moment: change the payload to something invalid (clear the "A" field, or use DevTools to POST `{"a":"x","b":30}`) and watch the tape print a **red, `400`** line with the server's exact error message — proof that validation happens on the server, not just in the form.

---

## Testing the Endpoint

### Browser (GET) — now returns docs, not a 405

Open `http://localhost:3000/api/add` directly in the address bar. Because this route now exports a `GET` handler too, you'll see:

```json
{
  "endpoint": "/api/add",
  "method": "POST",
  "body": { "a": "number", "b": "number" },
  "example": { "a": 2, "b": 3 },
  "responses": {
    "200": { "success": true, "result": 5, "a": 2, "b": 3 },
    "400": { "success": false, "error": "a and b must both be finite numbers" }
  }
}
```

(If a route exports *no* `GET` at all, visiting it in the browser would show **`405 Method Not Allowed`** — that's still how unexported methods behave; see Pitfalls below.)

### The app itself (POST)

1. Run the dev server and open `http://localhost:3000`.
2. The inputs are pre-filled with `12` and `30`. Press **=**.
3. The LCD shows `42`. A new line appears at the top of the **Tape** panel: the timestamp, a green `200` pill, the request `{"a":12,"b":30}`, and the response `{"success":true,"result":42,"a":12,"b":30}`.
4. Try an invalid input (clear a field, or type `-` alone) — the LCD reads `ERR`, a red message appears under it, and no network request is sent (client-side validation caught it first).

### fetch from the DevTools console (POST)

Paste this on any page of the running app — it matches the real payload shape:

```js
fetch("/api/add", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ a: 12, b: 30 }),
}).then(r => r.json()).then(console.log)
// { success: true, result: 42, a: 12, b: 30 }
```

Trigger the validation error the same way:

```js
fetch("/api/add", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ a: "x", b: 30 }),
}).then(r => r.json()).then(console.log)
// { success: false, error: "Both 'a' and 'b' are required and must be finite numbers." }
```

### curl (POST)

```bash
curl -X POST http://localhost:3000/api/add \
  -H "Content-Type: application/json" \
  -d '{"a":12,"b":30}'
# {"success":true,"result":42,"a":12,"b":30}

curl -i -X POST http://localhost:3000/api/add \
  -H "Content-Type: application/json" \
  -d '{"a":"x","b":30}'
# HTTP/1.1 400 Bad Request
# {"success":false,"error":"Both 'a' and 'b' are required and must be finite numbers."}
```

### curl (GET)

```bash
curl http://localhost:3000/api/add
# {"endpoint":"/api/add","method":"POST","body":{"a":"number","b":"number"}, ...}
```

### On Windows PowerShell

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/add -Method Post -ContentType "application/json" -Body '{"a":12,"b":30}'
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
| Response helper | `NextResponse.json({...}, { status })` | `res.status(...).json({...})` |
| Deployment | One deploy (Vercel/Node) — frontend + backend together | Two deploys, two things to monitor |
| Standards | Web-standard `Request`/`Response` objects | Express's own `req`/`res` API |
| When it wins | Apps where the API mainly serves your own frontend; rapid full-stack development | Long-lived servers: WebSockets, cron/background workers, heavy non-HTTP work, an API consumed by many separate clients/teams, or existing Express middleware ecosystems |

Rule of thumb for this course: **if your backend exists to serve your Next.js frontend, put it in route handlers.** Reach for a standalone server only when you hit a need Next can't express (persistent sockets, long-running jobs, etc.).

Side-by-side, the exact same endpoint:

```js
// Next.js — app/api/add/route.js (this project)
import { NextResponse } from "next/server";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Request body must be valid JSON." }, { status: 400 });
  }
  const { a, b } = body ?? {};
  const isFiniteNumber = (n) => typeof n === "number" && Number.isFinite(n);
  if (!isFiniteNumber(a) || !isFiniteNumber(b)) {
    return NextResponse.json({ success: false, error: "Both 'a' and 'b' are required and must be finite numbers." }, { status: 400 });
  }
  return NextResponse.json({ success: true, result: a + b, a, b }, { status: 200 });
}
```

```js
// Express equivalent — an entire extra project for the same result
const express = require("express")
const app = express()
app.use(express.json())

app.post("/api/add", (req, res) => {
  const { a, b } = req.body ?? {}
  const isFiniteNumber = (n) => typeof n === "number" && Number.isFinite(n)
  if (!isFiniteNumber(a) || !isFiniteNumber(b)) {
    return res.status(400).json({ success: false, error: "Both 'a' and 'b' are required and must be finite numbers." })
  }
  res.json({ success: true, result: a + b, a, b })
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

Then open **http://localhost:3000**, and press **=** — the LCD shows the sum and the paper tape logs the request/response. `npm run build` has been verified to produce a clean production build of this project.

(Requires Node.js 18+ for Next 14.)

---

## Key Takeaways

1. **Next.js is full-stack**: `app/api/<name>/route.js` gives you a real backend endpoint at `/api/<name>` with no extra server.
2. **The exported function name *is* the HTTP method.** `export async function POST(request)` handles POST, `export async function GET()` handles GET; unexported methods get an automatic **405**.
3. **`await request.json()`** parses the incoming JSON body — wrap it in `try/catch` since malformed bodies throw; **`NextResponse.json(obj, { status })`** sends a JSON reply with an explicit status code.
4. **Validate on the server, not just in the UI.** The client checks input before sending, but the route handler validates again and returns `400` — the API's contract holds even if called directly (curl, another app, a buggy client).
5. Route handlers run **on the server**: they're the safe place for secrets and database access.
6. The client calls its own API with a **relative URL** (`fetch("/api/add")`) — same origin, no CORS — and models **loading / success / error** as real UI states, not just a `console.log`.

## Common Pitfalls

- **Method not exported → 405.** If a route handler doesn't export a given method (e.g. no `DELETE` here), that verb returns `405 Method Not Allowed`. Export a function for every method you intend to support.
- **Forgetting `await request.json()`.** Without `await`, you get a Promise instead of the data — logs show `Promise { <pending> }` and property access returns `undefined`.
- **Not wrapping `request.json()` in `try/catch`.** A malformed or empty body makes `.json()` throw; without a `catch`, that becomes an unhandled `500` instead of a clean `400`.
- **Trusting `typeof` alone.** `typeof "5" === "string"`, not `"number"` — without an explicit numeric-string check, `{ a: "5", b: 2 }` can silently become string concatenation (`"52"`) instead of addition. This project's `isFiniteNumber` guard rejects it with a `400`.
- **Wrong file name.** The file must be `route.js` — `api.js`, `add.js`, or `index.js` inside the folder will simply 404.
- **`page.js` and `route.js` in the same folder.** Not allowed; a path resolves to either a page or a route handler, never both.
- **Missing `"use client"`** on a page that uses `useState`/`onSubmit` — Next will throw an error about hooks/event handlers in Server Components.
- **Forgetting `JSON.stringify(data)`** (or the `Content-Type` header) in the fetch — the server then can't parse the body, and `request.json()` throws.
- **Checking only `response.ok`.** A route handler could return `200` with an app-level `{ success: false, ... }` body. This project checks both `response.ok` **and** `json.success` before treating a call as successful.

## Practice Exercises

1. **Add a third operand.** Extend the `POST` handler to accept an optional `c`, defaulting to `0` when absent, and add it into the sum. Update the client form with an optional third input.
2. **Add a `subtract`/`multiply` mode.** Add an `op` field (`"add" | "subtract" | "multiply"`) to the request body, branch on it in the route handler, and add a small mode toggle to the UI. Keep the `400` validation for non-numeric `a`/`b` regardless of `op`.
3. **Persist the tape across reloads.** Store the `entries` array in `localStorage` (read on mount, write on every change) so the paper tape survives a page refresh.
4. **New resource + dynamic route.** Create `app/api/history/route.js` with an in-memory array: `GET` returns all past calculations, `POST` appends one. Add `app/api/history/[id]/route.js` with a `GET` that reads `params.id` and returns a single entry (or a `404`-shaped JSON body if not found).
5. **Rate limiting.** Add a simple in-memory counter to `POST /api/add` that returns `429` with `{ success: false, error: "Too many requests" }` after, say, 10 calls within 10 seconds from the same client. Verify with a `for` loop of `fetch` calls from the DevTools console.

---

## A Note on the Other README

`api-routes/README.md` is the **stock create-next-app boilerplate** (getting-started text, Vercel links). It was left untouched on purpose — the lecture notes live in *this* file at the lecture root.
