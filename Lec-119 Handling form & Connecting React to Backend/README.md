# Lecture 119 — Handling Forms & Connecting React to a Backend

> **The big idea:** Until now our React apps lived entirely in the browser. In this lecture we close the loop of full-stack development — a **React form** (managed by `react-hook-form`) collects and validates user input, then ships it as JSON via `fetch()` to an **Express server** running on a different port, which parses the body and responds. This is the fundamental request/response pattern behind every login page, signup form, and checkout flow on the web.

---

## What You'll Learn

- How to manage forms in React with **`react-hook-form`** instead of hand-rolled `useState` per input
- Registering inputs with `register()` and attaching **validation rules** (`required`, `minLength`, `maxLength`) with custom error messages
- Displaying per-field validation errors from `formState.errors`
- Writing an **async submit handler** and using `isSubmitting` to show a loading state and disable the submit button
- Simulating network latency with a Promise-based `delay()` helper
- Sending data to a server with **`fetch()`** — `POST` method, `Content-Type: application/json` header, `JSON.stringify()` body
- Building a minimal **Express** backend: `GET`/`POST` route handlers, `app.listen`, reading `req.body`
- Why the browser blocks cross-origin requests and how the **`cors`** middleware fixes it
- Parsing incoming JSON on the server with **`body-parser`**
- Using `setError()` to surface **server-driven / form-level errors** (e.g., "user is blocked") — shown here in commented-out form
- Running frontend and backend **simultaneously in two terminals**

---

## Project Structure

```
Lec-119 Handling form & Connecting React to Backend/
├── backend/
│   └── server.js          ← Express server (port 3000): CORS + JSON parsing + GET/POST routes
├── src/
│   ├── App.jsx            ← The form: react-hook-form + fetch POST to the backend
│   ├── App.css            ← .red error styling + Vite boilerplate styles
│   ├── index.css          ← Global Vite boilerplate styles
│   └── main.jsx           ← React entry point (StrictMode + createRoot)
├── index.html             ← Vite HTML shell (#root + module script)
├── package.json           ← Scripts + deps (react-hook-form, express, cors, body-parser)
└── README.md              ← You are here
```

Note how this project is unusual (and convenient for a lecture): the **backend dependencies live in the same `package.json`** as the frontend. `express`, `cors`, and `body-parser` sit right next to `react` and `react-hook-form` in `dependencies`, so a single `npm install` at the project root sets up both halves.

```json
"dependencies": {
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.50.1"
  },
```

Also note `"type": "module"` in `package.json` — that's why `backend/server.js` can use ES `import` syntax (`import express from "express"`) instead of CommonJS `require()`.

---

## Concept Deep-Dives

### 1. `react-hook-form` — forms without a `useState` per field

The classic React approach is "controlled inputs": one `useState` per field plus `onChange` handlers everywhere. `react-hook-form` replaces all of that with a single hook. Every keystroke does **not** re-render the component — the library tracks inputs via refs, which is why it's fast.

We destructure four things from `useForm()`:

```jsx
const {
    register,
    handleSubmit,
    setError,    
    formState: { errors, isSubmitting },
  } = useForm();
```

| Item | What it does |
|---|---|
| `register` | Wires an input into the form. Returns props (`name`, `ref`, `onChange`, `onBlur`) that you spread onto the input with `{...register(...)}`. Also accepts validation rules. |
| `handleSubmit` | A wrapper for your submit function. It **prevents the default page reload**, runs validation, and only calls your handler if everything passes. |
| `setError` | Lets you manually inject an error — perfect for errors that only the *server* can know about (bad credentials, blocked user). |
| `errors` | An object keyed by field name; each entry holds the failing rule's `message`. |
| `isSubmitting` | `true` while your async submit handler's Promise is pending — free loading-state management. |

### 2. Registering inputs + validation rules (verbatim from `src/App.jsx`)

**Username** — three rules, each with a custom message:

```jsx
<input placeholder='username' {...register("username", { required: {value: true, message: "This field is required"}, minLength: {value: 3, message: "Min length is 3"}, maxLength: {value: 8, message: "Max length is 8"} })} type="text"   />
{errors.username && <div className='red'>{errors.username.message}</div>}
```

**Password** — a single `minLength` rule (note: no `required`, so an empty password passes validation):

```jsx
<input placeholder='password'  {...register("password", {minLength: {value: 7, message: "Min length of password is 7"},})} type="password"/>
{errors.password && <div className='red'>{errors.password.message}</div>}
```

Key points:

- The **first argument** to `register` is the field name — it becomes the key in the submitted `data` object (`data.username`, `data.password`).
- Each rule uses the **object form** `{value, message}` so a human-readable message travels with the rule.
- The error display pattern is always the same: `errors.<field> && <render the message>`. If validation fails, `handleSubmit` never calls `onSubmit` — it just populates `errors` and re-renders.
- The `.red` class comes from `src/App.css`:

```css
.red{
  color: red;
  font-size: 12px;
}
```

### 3. The async submit handler + `fetch` POST

This is the heart of the lecture — the exact moment React "talks" to the backend:

```jsx
const onSubmit = async (data) => {
    // await delay(2) // simulating network delay
    let r = await fetch("http://localhost:3000/", {method: "POST",  headers: {
      "Content-Type": "application/json", 
    }, body: JSON.stringify(data)})
    let res = await r.text()
    console.log(data, res)
    // if(data.username !== "shubham"){
    //   setError("myform", {message: "Your form is not in good order because credentials are invalid"})
    // }
    // if(data.username === "rohan"){
    //   setError("blocked", {message: "Sorry this user is blocked"})
    // }
  }
```

Dissecting the `fetch` call — every part matters:

1. **URL** — `http://localhost:3000/` is the Express server, a *different origin* than the Vite dev server (which runs on port 5173). Cross-origin = CORS territory (see §6).
2. **`method: "POST"`** — fetch defaults to GET; without this the Express `app.post` route would never fire.
3. **`headers: { "Content-Type": "application/json" }`** — tells the server "the body is JSON". Without it, `body-parser`'s JSON middleware ignores the body and `req.body` arrives as `{}` (undefined data on the server — a classic bug).
4. **`body: JSON.stringify(data)`** — HTTP bodies are text/bytes, not JavaScript objects. `data` here is the validated form values object that `handleSubmit` passes in, e.g. `{username: "shubham", password: "secret123"}`.
5. **`await r.text()`** — the server replies with plain text (`'Hello World!'`), so we read it with `.text()`. If the server returned JSON, we'd use `r.json()` instead.

The **commented-out `setError` calls** demonstrate server-style errors. Notice they use field names that don't belong to any input — `"myform"` and `"blocked"` — turning them into *form-level* errors rendered near the submit button:

```jsx
{errors.myform && <div className='red'>{errors.myform.message}</div>}
{errors.blocked && <div className='red'>{errors.blocked.message}</div>}
```

### 4. Simulated network delay

Real servers are slow; localhost is instant. To *see* the loading state, the lecture includes a Promise-ified `setTimeout`:

```jsx
const delay = (d)=>{
    return new Promise((resolve, reject)=>{
      setTimeout(() => {
        resolve()
      }, d * 1000);
    })
  }
```

Uncomment `// await delay(2)` inside `onSubmit` and submission takes an extra 2 seconds — long enough to watch `isSubmitting` do its job.

### 5. `isSubmitting` — free loading UX

Because `onSubmit` is `async`, `react-hook-form` knows exactly when it starts and finishes. While the Promise is pending, `isSubmitting` is `true`, and we use it in **two places**:

```jsx
{isSubmitting && <div>Loading...</div>}
```

```jsx
<input disabled={isSubmitting} type="submit" value="Submit" />
```

Show a spinner *and* disable the button so the user can't double-submit. No `useState`, no manual `setLoading(true)/setLoading(false)` bookkeeping.

### 6. The Express backend (`backend/server.js`, complete and verbatim)

The entire server is 21 lines:

```js
import express  from "express"
import cors from "cors"
import bodyParser from "body-parser"
const app = express()
const port = 3000

app.use(cors()) 
app.use(bodyParser.json())

app.get('/', (req, res) => { 
    res.send('Hello World!')
})

app.post('/', (req, res) => { 
    console.log(req.body)
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
```

**Middleware (the `app.use` lines) — order at the top, before routes:**

- **`app.use(cors())`** — the browser enforces the *same-origin policy*: JavaScript on `http://localhost:5173` may not read responses from `http://localhost:3000` unless the server opts in. The `cors` middleware adds the `Access-Control-Allow-Origin: *` header to every response, telling the browser "any origin may read this". Remove this line and the fetch fails with the infamous red CORS error in the console — **even though the server received and processed the request**.
- **`app.use(bodyParser.json())`** — parses incoming request bodies whose `Content-Type` is `application/json` and attaches the result to `req.body`. Without it, `req.body` is `undefined`. (Fun fact: since Express 4.16 you can use the built-in `express.json()` instead — this lecture uses the standalone `body-parser` package, which is the same code under the hood.)

**Routes:**

- **`app.get('/')`** — a sanity-check route. Open `http://localhost:3000/` in the browser and you should see `Hello World!`. If you don't, the server isn't running — check this *before* debugging the frontend.
- **`app.post('/')`** — the route our form hits. It logs the parsed JSON body to the **server terminal** (`console.log(req.body)` — this appears in the terminal running node, *not* the browser console) and sends back the text `'Hello World!'`.

**`app.listen(port, ...)`** — boots the server on port 3000 and prints a confirmation. Frontend (5173) and backend (3000) are two separate processes on two separate ports.

---

## Full Code Walkthrough

### `src/main.jsx` — the entry point

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Standard Vite scaffold: mount `<App />` into the `<div id="root">` declared in `index.html`. `StrictMode` double-invokes some functions in development to surface bugs — it does not affect our form logic.

### `src/App.jsx` — top to bottom

```jsx
import { useState } from 'react' 
import './App.css'
import { useForm } from "react-hook-form"
```

(`useState` is imported but never used — a leftover; `react-hook-form` made it unnecessary.)

**Step 1 — hook setup.** `useForm()` gives us `register`, `handleSubmit`, `setError`, and the live `formState` slices `errors` and `isSubmitting` (§1).

**Step 2 — helpers.** `delay(d)` wraps `setTimeout` in a Promise so it can be `await`-ed (§4).

**Step 3 — `onSubmit(data)`.** Only ever called with *valid* data, because `handleSubmit` gates it. POSTs the data as JSON to `localhost:3000`, awaits the text response, and logs both (§3).

**Step 4 — the JSX.**

```jsx
<form action="" onSubmit={handleSubmit(onSubmit)}>
```

This line is the most commonly misread one in the file: we don't pass `onSubmit` directly to the form. We pass **`handleSubmit(onSubmit)`** — `handleSubmit` is a higher-order function that returns the real event handler. That returned handler calls `event.preventDefault()`, runs every registered validation rule, and either (a) fills `errors` and stops, or (b) collects all field values into one object and calls our `onSubmit(data)`.

Then, in order: username input + its error, password input + its error, the submit button (disabled while submitting), and the two form-level error slots (`myform`, `blocked`).

### `backend/server.js` — route by route

1. **Imports & setup** — `express` (web framework), `cors` (cross-origin headers), `body-parser` (JSON body parsing); create the `app`; pick port `3000`.
2. **`app.use(cors())`** — every response gets CORS headers; the browser will allow our 5173-origin frontend to read them.
3. **`app.use(bodyParser.json())`** — every incoming JSON request gets parsed into `req.body` before route handlers run.
4. **`GET /`** — health check; responds `'Hello World!'`.
5. **`POST /`** — receives the form. `console.log(req.body)` prints something like `{ username: 'shubham', password: 'secret123' }` in the backend terminal, then responds with plain text. (A real app would validate again, hash the password, save to a database, and return JSON.)
6. **`app.listen`** — start listening; log `Example app listening on port 3000`.

---

## The Request Lifecycle (submit → response → UI)

```
┌──────────────────────────  BROWSER (http://localhost:5173)  ──────────────────────────┐
│                                                                                       │
│  1. User types username/password, clicks Submit                                       │
│           │                                                                           │
│           ▼                                                                           │
│  2. handleSubmit(onSubmit) intercepts the submit event                                │
│        • preventDefault()  → no page reload                                           │
│        • runs validation rules (required / minLength / maxLength)                     │
│           │                                                                           │
│           ├── FAIL ──► errors.username / errors.password populated                    │
│           │            ► red <div> messages render. STOP. (No network request!)       │
│           │                                                                           │
│           └── PASS ──► 3. onSubmit(data) called; isSubmitting = true                  │
│                           • "Loading..." renders, Submit button disabled              │
│                           • (optional) await delay(2) — simulated latency             │
│                           │                                                           │
│                           ▼                                                           │
│  4. fetch("http://localhost:3000/", { method: "POST",                                 │
│           headers: { "Content-Type": "application/json" },                            │
│           body: JSON.stringify(data) })                                               │
└───────────────────────────────│───────────────────────────────────────────────────────┘
                                │  HTTP POST across origins (5173 → 3000)
                                ▼
┌──────────────────────────  EXPRESS SERVER (http://localhost:3000)  ───────────────────┐
│  5. cors() middleware        → stamps Access-Control-Allow-Origin on the response     │
│  6. bodyParser.json()        → parses raw JSON text into req.body object              │
│  7. app.post('/') handler    → console.log(req.body) in the SERVER terminal           │
│                              → res.send('Hello World!')                               │
└───────────────────────────────│───────────────────────────────────────────────────────┘
                                │  HTTP 200 response, body: "Hello World!"
                                ▼
┌──────────────────────────  BACK IN THE BROWSER  ──────────────────────────────────────┐
│  8. Browser checks CORS headers → allowed → hands response to our JS                  │
│  9. await r.text()  → "Hello World!"                                                  │
│ 10. console.log(data, res) → form data + server reply in the BROWSER console          │
│ 11. onSubmit's Promise resolves → isSubmitting = false                                │
│        • "Loading..." disappears, Submit button re-enabled                            │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## How to Run

You need **two terminals** — one process per port.

**Step 0 — install dependencies (once).** Because `express`, `cors`, and `body-parser` are listed in the root `package.json`, a single install at the project root covers both frontend and backend:

```bash
npm install
```

(If you ever split the backend into its own folder with its own `package.json`, you'd run `npm install express cors body-parser` there instead.)

**Terminal 1 — the backend:**

```bash
node backend/server.js
```

You should see: `Example app listening on port 3000`. Sanity-check by visiting `http://localhost:3000/` — you should see `Hello World!`.

**Terminal 2 — the frontend:**

```bash
npm run dev
```

Vite serves the React app at `http://localhost:5173/`. Open it, fill the form, and watch:

- **Browser console:** the submitted `data` object and the server's `"Hello World!"` reply.
- **Backend terminal:** `req.body` printed by the POST handler.

> Tip: the backend does **not** hot-reload. After editing `server.js`, stop it (Ctrl+C) and run `node backend/server.js` again (or use `node --watch backend/server.js` / `nodemon`).

---

## Key Takeaways

1. **`react-hook-form` = less code, better forms.** One hook replaces per-field `useState`, gives you validation, error objects, and submission state for free — with fewer re-renders than controlled inputs.
2. **`handleSubmit` is a gatekeeper.** Your `onSubmit` only ever sees *valid* data, and the default page reload is prevented automatically.
3. **A `fetch` POST needs three things:** `method: "POST"`, the `Content-Type: application/json` header, and a `JSON.stringify()`-ed body. Miss any one and things silently break.
4. **Middleware runs before routes.** `cors()` (lets the browser accept the response) and `bodyParser.json()` (fills `req.body`) must be `app.use`-d before your handlers need them.
5. **Two consoles, two worlds.** `console.log` in `App.jsx` prints in the *browser DevTools*; `console.log` in `server.js` prints in the *terminal*. Knowing which log lives where is half of full-stack debugging.
6. **Client-side validation is UX, not security.** Anyone can bypass the browser and POST directly to your server — always re-validate on the backend in real apps.

## Common Pitfalls

- **CORS error in the console** (`...has been blocked by CORS policy...`): you forgot `app.use(cors())` on the server, or you added it after restarting mattered — remember to restart node after editing `server.js`. Note the request often still *reaches* the server; it's the browser refusing to hand your JS the *response*.
- **`req.body` is `undefined` / empty `{}` on the server:** either the JSON body-parsing middleware (`bodyParser.json()` or `express.json()`) is missing, or the frontend forgot the `"Content-Type": "application/json"` header.
- **"Failed to fetch" / connection refused:** the backend simply isn't running. Terminal 1 first, always.
- **Form reloads the page on submit:** you passed `onSubmit` directly (`onSubmit={onSubmit}`) instead of wrapping it: `onSubmit={handleSubmit(onSubmit)}`.
- **Validation never fires:** you forgot to spread `register` onto the input (`{...register("username", {...})}`) — an unregistered input is invisible to `react-hook-form`.
- **Users double-submit:** you showed a loader but forgot `disabled={isSubmitting}` on the submit button.
- **Number vs object rule confusion:** `minLength: 3` works but shows no message; use `minLength: {value: 3, message: "..."}` for good validation UX.

## Practice Exercises

1. **Add an email field** registered with a `pattern` rule (`pattern: {value: /^\S+@\S+$/, message: "Invalid email"}`) and render its error in red like the others.
2. **Make the server judge the data.** In `app.post('/')`, if `req.body.username === "rohan"`, respond with `res.status(403).json({error: "Sorry this user is blocked"})`. On the frontend, check `r.status`, parse the JSON, and surface the message with `setError("blocked", {message: ...})` — i.e., bring the commented-out `setError` lines to life, but driven by the *server's* answer.
3. **Return JSON instead of text.** Change the POST handler to `res.json({received: req.body, status: "ok"})` and update the frontend to use `await r.json()`; render the echoed data below the form with `useState`.
4. **Feel the latency.** Uncomment `await delay(2)` and confirm the Loading indicator and disabled button behave; then add a `try/catch` around the fetch so a stopped server shows a friendly error instead of an unhandled rejection.
5. **Break it on purpose (best way to learn):** remove `app.use(cors())` and read the exact browser error; restore it, then remove `bodyParser.json()` and observe what `console.log(req.body)` prints. Write down both symptoms — you *will* see them again in real projects.

---

## Appendix: Original Vite Template Notes

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
