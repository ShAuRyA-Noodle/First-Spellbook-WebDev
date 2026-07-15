# Lecture 119 — Handling Forms & Connecting React to a Backend

> **The big idea:** Until now our React apps lived entirely in the browser. In this lecture we close the loop of full-stack development — a **React form** (managed by `react-hook-form`) collects and validates user input, then ships it as JSON via `fetch()` to an **Express server** running on a different port, which validates it *again*, decides a status code, and answers with JSON that the UI renders back on screen. This is the fundamental request/response pattern behind every login page, signup form, and checkout flow on the web.

The demo is a small signup form with a twist: next to the form sits a **live "Request Inspector"** panel that mirrors, in real time, exactly what JSON left the browser and exactly what JSON came back from Express — status code, latency, and body included. The goal is to make the network call *visible*, not something that only shows up as a mystery in the Network tab.

---

## What You'll Learn

- How to manage forms in React with **`react-hook-form`** instead of hand-rolled `useState` per input
- Registering inputs with `register()` and attaching **validation rules** (`required`, `minLength`, `maxLength`, `pattern`) with custom error messages
- Displaying per-field validation errors from `formState.errors`, wired to inputs with `aria-invalid` / `aria-describedby` for accessibility
- Writing an **async submit handler**, using `isSubmitting` for a disabled/loading button state, and `reset()` to clear the form after success
- Sending data to a server with **`fetch()`** — `POST` method, `Content-Type: application/json` header, `JSON.stringify()` body
- **Reading the JSON response on both sides of a success/failure branch**, not just logging it — success banners, error banners, and `setError()` populated from what the *server* said
- Using `setError("root.serverError", …)` for form-level errors that don't belong to one input (bad server response, blocked user, network failure)
- Building a small but real **Express** backend: `express.json()`, a validation function, meaningful status codes (`400`, `403`, `201`, `404`), and a consistent JSON response shape
- Why the browser blocks cross-origin requests and how the **`cors`** middleware fixes it
- Running frontend and backend **simultaneously in two terminals**
- Why **client-side validation is UX, not security** — the server re-validates everything

---

## Project Structure

```
Lec-119 Handling form & Connecting React to Backend/
├── backend/
│   └── server.js          ← Express server (port 3000): CORS + JSON parsing + validated /api/signup route
├── src/
│   ├── App.jsx             ← The form + the Request Inspector console: react-hook-form + fetch POST
│   ├── App.css              ← Form card, banners, inputs, buttons, and console panel styles
│   ├── index.css            ← Design tokens (colors, spacing, radii) + base reset
│   └── main.jsx              ← React entry point (StrictMode + createRoot)
├── index.html              ← Vite HTML shell (#root + module script)
├── package.json            ← Scripts + deps (react-hook-form, express, cors)
└── README.md                ← You are here
```

Note how this project is unusual (and convenient for a lecture): the **backend dependencies live in the same `package.json`** as the frontend. `express` and `cors` sit right next to `react` and `react-hook-form` in `dependencies`, so a single `npm install` at the project root sets up both halves.

```json
"dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.50.1"
  },
```

Also note `"type": "module"` in `package.json` — that's why `backend/server.js` can use ES `import` syntax (`import express from "express"`) instead of CommonJS `require()`.

> **Changed from the original lecture:** `body-parser` has been removed from `dependencies`. Express has shipped its own JSON body parser (`express.json()`) since v4.16 — pulling in the standalone `body-parser` package is redundant with the version used here, so `backend/server.js` now uses the built-in middleware and `package.json` only lists what's actually imported.

---

## Concept Deep-Dives

### 1. `react-hook-form` — forms without a `useState` per field

The classic React approach is "controlled inputs": one `useState` per field plus `onChange` handlers everywhere. `react-hook-form` replaces all of that with a single hook. Every keystroke does **not** re-render the component — the library tracks inputs via refs, which is why it's fast.

We destructure five things from `useForm()`:

```jsx
const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" })
```

| Item | What it does |
|---|---|
| `register` | Wires an input into the form. Returns props (`name`, `ref`, `onChange`, `onBlur`) that you spread onto the input with `{...register(...)}`. Also accepts validation rules. |
| `handleSubmit` | A wrapper for your submit function. It **prevents the default page reload**, runs validation, and only calls your handler if everything passes. |
| `reset` | Clears the form back to its default (empty) values — called here after a successful signup. |
| `setError` | Lets you manually inject an error — perfect for errors that only the *server* can know about (validation the server disagrees with, a blocked user, a network failure). |
| `errors` | An object keyed by field name (plus a special `root` key for form-level errors); each entry holds the failing rule's `message`. |
| `isSubmitting` | `true` while your async submit handler's Promise is pending — free loading-state management. |

`mode: "onBlur"` is new versus the original lecture: it re-validates a field as soon as you leave it (not only on submit), so mistakes surface earlier.

### 2. Registering inputs + validation rules (verbatim from `src/App.jsx`)

**Username** — four rules, each with a custom message. This fixes the original bug in reverse (that one was missing `required` on password) by making sure *every* rule that should be required, is:

```jsx
{...register("username", {
                  required: "Username is required.",
                  minLength: { value: 3, message: "Must be at least 3 characters." },
                  maxLength: { value: 20, message: "Must be at most 20 characters." },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Only letters, numbers, and underscores.",
                  },
                })}
```

**Password** — now correctly has **both** `required` and `minLength` (the original lecture code had `minLength` with no `required`, so an empty password silently passed validation — that bug is fixed here):

```jsx
{...register("password", {
                  required: "Password is required.",
                  minLength: { value: 7, message: "Must be at least 7 characters." },
                })}
```

Key points:

- The **first argument** to `register` is the field name — it becomes the key in the submitted `data` object (`data.username`, `data.password`) and must match the key the backend's `validateSignup()` reads.
- `required` can be a plain string (shorthand for `{ value: true, message: "..." }`) — used here for brevity.
- Each error is rendered next to its field with `errors.<field> && <render the message>`, and each input also gets `aria-invalid` and `aria-describedby` pointing at that error's `id` so assistive tech announces it:

```jsx
<input
                id="username"
                type="text"
                placeholder="e.g. ada_lovelace"
                autoComplete="username"
                spellCheck="false"
                aria-invalid={errors.username ? "true" : "false"}
                aria-describedby={errors.username ? "username-error" : undefined}
                {...register("username", { /* …rules above… */ })}
              />
              {errors.username && (
                <p className="field-error" id="username-error" role="alert">
                  {errors.username.message}
                </p>
              )}
```

If validation fails, `handleSubmit` never calls `onSubmit` — it just populates `errors` and re-renders. No network request is made.

### 3. The async submit handler + `fetch` POST (the honest version)

This is the heart of the lecture — the exact moment React "talks" to the backend, and now actually *does* something with what comes back, instead of just logging it:

```jsx
const onSubmit = async (data) => {
    setRequestState("sending")
    setLastPayload(data)
    setLastResponse(null)
    setSuccessMessage("")
    const startedAt = performance.now()

    try {
      const response = await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const body = await response.json()
      setLastLatency(Math.round(performance.now() - startedAt))
      setLastResponse({ status: response.status, statusText: response.statusText, body })

      if (!response.ok) {
        if (body.errors) {
          Object.entries(body.errors).forEach(([field, message]) => {
            setError(field, { type: "server", message })
          })
        } else {
          setError("root.serverError", {
            type: "server",
            message: body.message || "Something went wrong on the server.",
          })
        }
        setRequestState("error")
        return
      }

      setRequestState("success")
      setSuccessMessage(body.message || "Account created successfully.")
      reset()
    } catch (networkError) {
      setLastLatency(Math.round(performance.now() - startedAt))
      setError("root.serverError", {
        type: "network",
        message: "Could not reach the server. Is it running on http://localhost:3000?",
      })
      setRequestState("error")
    }
  }
```

Dissecting it — every part matters:

1. **URL** — `SIGNUP_ENDPOINT` resolves to `http://localhost:3000/api/signup`, a *different origin* than the Vite dev server (which runs on port 5173). Cross-origin = CORS territory (see §6).
2. **`method: "POST"`** — fetch defaults to GET; without this the Express `app.post` route would never fire.
3. **`headers: { "Content-Type": "application/json" }`** — tells the server "the body is JSON". Without it, `express.json()` ignores the body and `req.body` arrives as `{}` (undefined data on the server — a classic bug).
4. **`body: JSON.stringify(data)`** — HTTP bodies are text/bytes, not JavaScript objects. `data` here is the validated form values object that `handleSubmit` passes in, e.g. `{username: "ada_lovelace", password: "secret123"}`.
5. **`await response.json()`** — the server always replies with **JSON now** (never plain text — see §6), so both success and error branches parse the same way with `.json()`.
6. **`if (!response.ok)`** — `fetch` does **not** throw on 4xx/5xx responses; you must check `response.ok` (true only for 200–299) yourself. This is the single most common `fetch` mistake, and the demo exists specifically to make it visible.
7. **Field errors vs. form-level errors** — if the server responds with a `body.errors` map (e.g. `{ username: "..." }`), each one is fed straight into `setError(field, …)` and renders under the matching input. Otherwise a single `setError("root.serverError", …)` renders as a banner near the top of the card — this is the honest replacement for the original lecture's commented-out, unreachable `myform`/`blocked` error slots.
8. **`try/catch`** — if the backend isn't running at all, `fetch` *rejects* (a real thrown error, distinct from a 4xx/5xx response), which is caught here and shown as a "could not reach the server" banner instead of an unhandled promise rejection.

The **Request Inspector** panel (§5) renders `lastPayload` and `lastResponse` live, so you can watch this exact contract on screen instead of only in DevTools.

### 4. `isSubmitting` — free loading UX

Because `onSubmit` is `async`, `react-hook-form` knows exactly when it starts and finishes. While the Promise is pending, `isSubmitting` is `true`, and the submit button uses it to disable itself and swap its label for a spinner:

```jsx
<button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
```

Disabling the button *and* changing its label prevents double-submits and gives clear feedback — no manual `setLoading(true)/setLoading(false)` bookkeeping required.

### 5. The Request Inspector — the signature piece

Alongside the form sits a dark, terminal-styled panel (`<aside className="console">`) that always shows the literal traffic: a status dot + label + latency, the `POST /api/signup` line, the exact JSON `body` that was sent, and the exact JSON the server answered with (syntax-tinted, status-code badge included). Before the first submit it shows an empty state with a blinking cursor. This is deliberately styled dark regardless of light/dark theme — like a terminal window — because it's the one part of the UI meant to feel like a device, not a form.

Local `useState` (now actually used — see the callout at the end of §7) drives it:

```jsx
const [requestState, setRequestState] = useState("idle") // idle | sending | success | error
  const [lastPayload, setLastPayload] = useState(null)
  const [lastResponse, setLastResponse] = useState(null)
  const [lastLatency, setLastLatency] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
```

### 6. The Express backend (`backend/server.js`, complete and verbatim)

```js
import express from "express"
import cors from "cors"

const app = express()
const PORT = process.env.PORT || 3000

// --- Middleware (must be registered before routes that need them) ---
app.use(cors()) // allow the Vite dev server (a different origin) to read our responses
app.use(express.json()) // parse JSON request bodies into req.body (built into Express 4.16+)

// --- Validation rules, mirrored (not duplicated 1:1) from the frontend ---
// The client validates for UX; the server validates because it's the only
// copy of the rules nobody can bypass with devtools.
const USERNAME_MIN = 3
const USERNAME_MAX = 20
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/
const PASSWORD_MIN = 7
const BLOCKED_USERNAMES = ["blocked", "admin"]

function validateSignup(body) {
  const errors = {}
  const username = typeof body?.username === "string" ? body.username.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!username) {
    errors.username = "Username is required."
  } else if (username.length < USERNAME_MIN) {
    errors.username = `Username must be at least ${USERNAME_MIN} characters.`
  } else if (username.length > USERNAME_MAX) {
    errors.username = `Username must be at most ${USERNAME_MAX} characters.`
  } else if (!USERNAME_PATTERN.test(username)) {
    errors.username = "Username can only contain letters, numbers, and underscores."
  }

  if (!password) {
    errors.password = "Password is required."
  } else if (password.length < PASSWORD_MIN) {
    errors.password = `Password must be at least ${PASSWORD_MIN} characters.`
  }

  return { errors, username, password }
}

// --- Routes ---

// Health check — hit this in a browser to confirm the API is up.
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Signup API is running.",
    timestamp: new Date().toISOString(),
  })
})

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

app.post("/api/signup", (req, res) => {
  const { errors, username } = validateSignup(req.body)

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Please fix the highlighted fields.",
      errors, // { username?: string, password?: string }
    })
  }

  if (BLOCKED_USERNAMES.includes(username.toLowerCase())) {
    return res.status(403).json({
      success: false,
      message: `Sorry, "${username}" is a reserved username and can't be used.`,
    })
  }

  console.log("New signup:", { username })

  return res.status(201).json({
    success: true,
    message: `Account created for "${username}".`,
    user: { username },
  })
})

// Anything else (wrong method, wrong path, typo'd endpoint) — JSON 404, not an HTML stack trace.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `No route for ${req.method} ${req.originalUrl}`,
  })
})

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})
```

**Middleware (the `app.use` lines) — order at the top, before routes:**

- **`app.use(cors())`** — the browser enforces the *same-origin policy*: JavaScript on `http://localhost:5173` may not read responses from `http://localhost:3000` unless the server opts in. The `cors` middleware adds the `Access-Control-Allow-Origin: *` header to every response, telling the browser "any origin may read this". Remove this line and the fetch fails with the infamous red CORS error in the console — **even though the server received and processed the request**.
- **`app.use(express.json())`** — parses incoming request bodies whose `Content-Type` is `application/json` and attaches the result to `req.body`. Without it, `req.body` is `undefined`. This lecture now uses Express's **built-in** JSON parser (available since Express 4.16) instead of the separate `body-parser` package the original version imported — same behavior, one less dependency.

**Routes and status codes — the part that makes this a *real* API instead of a toy:**

- **`GET /`** — a sanity-check route returning JSON (`{ status: "ok", message: "...", timestamp: "..." }`) instead of the plain-text `'Hello World!'` from the original lecture. Open `http://localhost:3000/` in the browser to confirm the server is up.
- **`GET /api/health`** — a minimal machine-readable health check.
- **`POST /api/signup`** — the route the form hits:
  - `validateSignup(req.body)` re-runs the same kind of checks the frontend already ran (required, length, pattern) — **never trust client-side validation alone**. If anything fails, responds **`400 Bad Request`** with `{ success: false, message, errors }`, where `errors` is a `{ fieldName: "message" }` map the frontend maps directly onto `setError`.
  - If the username is on `BLOCKED_USERNAMES` (try `blocked` or `admin`), responds **`403 Forbidden`** — a request that was *technically valid* but the server still refuses, demonstrating that "passed client validation" and "accepted by the server" are two different things.
  - Otherwise responds **`201 Created`** with `{ success: true, message, user: { username } }`.
- **`app.use((req, res) => …)`** (no path) — catches every request that didn't match a route above and answers **`404`** with JSON, so a typo'd endpoint fails loudly and readably instead of returning Express's default HTML error page.
- **`app.listen`** — boots the server on port 3000 (or `process.env.PORT` if set) and prints a confirmation.

### 7. `src/App.jsx` — top to bottom

```jsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import "./App.css"
```

`useState` is imported and **used** now — it drives the Request Inspector's `requestState` / `lastPayload` / `lastResponse` / `lastLatency` / `successMessage` (§5). The original lecture imported `useState` and never called it; that dead import is gone because the import is no longer dead.

**Step 1 — hook setup.** `useForm({ mode: "onBlur" })` gives us `register`, `handleSubmit`, `reset`, `setError`, and the live `formState` slices `errors` and `isSubmitting` (§1).

**Step 2 — `onSubmit(data)`.** Only ever called with data that passed *client-side* validation, because `handleSubmit` gates it. POSTs the data as JSON to `/api/signup`, parses the JSON response either way, and branches on `response.ok` to update the console panel, populate `errors` from the server, or show a success banner and reset the form (§3).

**Step 3 — the JSX.**

```jsx
<form onSubmit={handleSubmit(onSubmit)} noValidate>
```

We don't pass `onSubmit` directly to the form. We pass **`handleSubmit(onSubmit)`** — `handleSubmit` is a higher-order function that returns the real event handler. That returned handler calls `event.preventDefault()`, runs every registered validation rule, and either (a) fills `errors` and stops, or (b) collects all field values into one object and calls our `onSubmit(data)`. `noValidate` turns off the *browser's* built-in validation UI so only `react-hook-form`'s messages show.

Then, in order: a success banner (only after a successful submit), a server-error banner (only when `errors.root.serverError` is set), the username field + its error, the password field + its error, the submit button, a hint about the `blocked` username, and the Request Inspector `<aside>`.

---

## The Request Lifecycle (submit → response → UI)

```
┌──────────────────────────  BROWSER (http://localhost:5173)  ──────────────────────────┐
│                                                                                       │
│  1. User types username/password, clicks "Create account"                            │
│           │                                                                           │
│           ▼                                                                           │
│  2. handleSubmit(onSubmit) intercepts the submit event                                │
│        • preventDefault()  → no page reload                                           │
│        • runs validation rules (required / minLength / maxLength / pattern)           │
│           │                                                                           │
│           ├── FAIL ──► errors.username / errors.password populated                    │
│           │            ► inline field errors render. STOP. (No network request!)      │
│           │                                                                           │
│           └── PASS ──► 3. onSubmit(data) called; isSubmitting = true                  │
│                           • submit button shows spinner + "Creating account…"         │
│                           • Request Inspector: status dot → "sending", body shown      │
│                           │                                                           │
│                           ▼                                                           │
│  4. fetch("http://localhost:3000/api/signup", { method: "POST",                       │
│           headers: { "Content-Type": "application/json" },                            │
│           body: JSON.stringify(data) })                                               │
└───────────────────────────────│───────────────────────────────────────────────────────┘
                                │  HTTP POST across origins (5173 → 3000)
                                ▼
┌──────────────────────────  EXPRESS SERVER (http://localhost:3000)  ───────────────────┐
│  5. cors()             → stamps Access-Control-Allow-Origin on the response            │
│  6. express.json()     → parses raw JSON text into req.body object                     │
│  7. app.post('/api/signup')                                                            │
│        • validateSignup(req.body)                                                      │
│        • FAIL required/length/pattern  → 400 { success:false, message, errors }        │
│        • username is "blocked"/"admin" → 403 { success:false, message }                │
│        • otherwise                      → 201 { success:true, message, user }          │
└───────────────────────────────│───────────────────────────────────────────────────────┘
                                │  HTTP response, JSON body, one of the three shapes above
                                ▼
┌──────────────────────────  BACK IN THE BROWSER  ──────────────────────────────────────┐
│  8. Browser checks CORS headers → allowed → hands response to our JS                  │
│  9. await response.json()  → parsed body, regardless of status code                   │
│ 10. Request Inspector updates: status dot, status code badge, latency, response JSON  │
│           │                                                                           │
│           ├── response.ok === false                                                   │
│           │      • body.errors present  → setError(field, …) per field                │
│           │      • otherwise            → setError("root.serverError", …) → banner    │
│           │                                                                           │
│           └── response.ok === true                                                    │
│                  • success banner shown with body.message                             │
│                  • reset() clears the form                                            │
│                                                                                        │
│ 11. onSubmit's Promise resolves → isSubmitting = false                                │
│        • spinner disappears, submit button re-enabled                                 │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

*(If the backend isn't running at all, step 4 rejects instead of resolving — the `catch` block runs, latency is still recorded, and a "Could not reach the server" banner appears via `setError("root.serverError", …)`.)*

---

## How to Run

You need **two terminals** — one process per port.

**Step 0 — install dependencies (once).** Because `express` and `cors` are listed in the root `package.json`, a single install at the project root covers both frontend and backend:

```bash
npm install
```

(If you ever split the backend into its own folder with its own `package.json`, you'd run `npm install express cors` there instead.)

**Terminal 1 — the backend:**

```bash
node backend/server.js
```

You should see: `API server listening on http://localhost:3000`. Sanity-check by visiting `http://localhost:3000/` — you should see JSON like `{"status":"ok","message":"Signup API is running.","timestamp":"..."}`.

**Terminal 2 — the frontend:**

```bash
npm run dev
```

Vite serves the React app at `http://localhost:5173/`. Open it, fill the form, and watch:

- **The Request Inspector panel:** the exact JSON sent and the exact JSON received, live, with status code and latency.
- **Backend terminal:** `New signup: { username: '...' }` printed by the POST handler on success.
- **Try it broken on purpose:** submit with username `blocked` (403 banner), submit with empty fields (client-side errors, no request sent), or stop the backend and submit anyway (network-error banner).

> Tip: the backend does **not** hot-reload. After editing `server.js`, stop it (Ctrl+C) and run `node backend/server.js` again (or use `node --watch backend/server.js` / `nodemon`).

---

## Key Takeaways

1. **`react-hook-form` = less code, better forms.** One hook replaces per-field `useState`, gives you validation, error objects, and submission state for free — with fewer re-renders than controlled inputs.
2. **`handleSubmit` is a gatekeeper.** Your `onSubmit` only ever sees *valid* data, and the default page reload is prevented automatically.
3. **`fetch` does not throw on 4xx/5xx.** Always check `response.ok` before treating a response as success — a `catch` block only ever runs for genuine network failures.
4. **The client and server should speak the same JSON shape.** This app's contract is `{ success, message, errors?, user? }` on every response — the frontend's `if (body.errors) …` branch only works because the backend promises that shape.
5. **Middleware runs before routes.** `cors()` (lets the browser accept the response) and `express.json()` (fills `req.body`) must be `app.use`-d before your handlers need them.
6. **Two consoles, two worlds.** `console.log` in `App.jsx` prints in the *browser DevTools*; `console.log` in `server.js` prints in the *terminal*. Knowing which log lives where is half of full-stack debugging.
7. **Client-side validation is UX, not security.** Anyone can bypass the browser and POST directly to your server — `validateSignup()` on the backend is what actually protects the data, and it runs on *every* request regardless of what the browser already checked.

## Common Pitfalls

- **CORS error in the console** (`...has been blocked by CORS policy...`): you forgot `app.use(cors())` on the server, or you edited `server.js` without restarting `node`. Note the request often still *reaches* the server; it's the browser refusing to hand your JS the *response*.
- **`req.body` is `undefined` / empty `{}` on the server:** either `express.json()` is missing from the middleware chain, or the frontend forgot the `"Content-Type": "application/json"` header.
- **"Failed to fetch" / connection refused:** the backend simply isn't running. Terminal 1 first, always. This is exactly what the network-error banner in this demo is built to catch.
- **Treating a 400/403 response as success:** `fetch` resolves its promise for *any* HTTP response, including errors. Skipping the `if (!response.ok)` check means your error branch never runs and the UI silently claims success on a rejected signup.
- **Form reloads the page on submit:** you passed `onSubmit` directly (`onSubmit={onSubmit}`) instead of wrapping it: `onSubmit={handleSubmit(onSubmit)}`.
- **Validation never fires:** you forgot to spread `register` onto the input (`{...register("username", {...})}`) — an unregistered input is invisible to `react-hook-form`.
- **Users double-submit:** you showed a loader but forgot `disabled={isSubmitting}` on the submit button.
- **A required field with no `required` rule:** the original version of this lecture's password field had `minLength` but no `required`, so an empty password passed validation. Always ask "should this field be allowed to be empty?" for every input you register.

## Practice Exercises

1. **Add an email field.** Register it with `required` and a `pattern` rule (`pattern: {value: /^\S+@\S+$/, message: "Invalid email"}`), render its error the same way `username`/`password` do, add it to `validateSignup()` on the server, and include it in the request body shown by the Request Inspector.
2. **Add a second blocked-username-style rule server-side.** For example, reject passwords equal to the username (`403`, with a message like "Password can't match your username") and confirm the banner renders correctly on the client without any frontend changes beyond what already exists.
3. **Add a "Copy as curl" button** to the Request Inspector that copies a `curl -X POST http://localhost:3000/api/signup -H "Content-Type: application/json" -d '...'` command built from `lastPayload` to the clipboard — useful for testing the API outside the browser.
4. **Make latency visible without a fast localhost.** Add an artificial delay to `app.post('/api/signup', …)` on the server (`await new Promise(r => setTimeout(r, 1500))` before responding) and confirm the spinner, disabled button, and "sending…" status dot all hold for the full delay.
5. **Break it on purpose (best way to learn):** comment out `app.use(cors())` and read the exact browser error; restore it, then comment out `app.use(express.json())` and observe what `console.log(req.body)` prints inside `validateSignup`. Write down both symptoms — you *will* see them again in real projects.

---

## Appendix: Original Vite Template Notes

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
