# Lecture 125 — Server Actions in Next.js

## Overview

**Server Actions** are one of the most powerful features of the Next.js App Router: they let you call **server-side functions directly from your forms and components** — no API routes, no `fetch()` boilerplate, no JSON serialization code, no endpoint URLs.

You write an async function, mark it with the `"use server"` directive, and pass it straight to a form's `action` prop. When the form is submitted, Next.js transparently performs an RPC (remote procedure call): the browser sends the form data to the server, your function runs **on the server** (with full access to Node.js APIs like the filesystem, databases, and secret environment variables), and the result comes back — all without you ever writing an HTTP handler.

The demo app in this lecture (`server-actions/`) proves the point in the most visceral way possible: a plain HTML form on the page writes directly to a file on the server's disk (`harry.txt`) using Node's `fs` module. Try doing *that* from client-side JavaScript!

---

## What You'll Learn

- What Server Actions are and why they eliminate the need for hand-written API routes for mutations
- The `"use server"` directive — how to apply it **file-level** (whole module) vs **inline** (single function)
- How to bind a server function to a form with `<form action={serverAction}>`
- How the **FormData API** (`formData.get("fieldName")`) delivers your input values to the server, keyed by the `name` attribute of each input
- How server actions can use **Node.js-only APIs** — here `fs/promises` — because the code genuinely executes on the server
- How **progressive enhancement** works: a form bound directly to a server action can submit even before (or without) client-side JavaScript loading
- Calling a server action from a **client component** (`"use client"`) and combining it with client-side logic like `form.reset()`
- How Server Actions compare to traditional **API routes** and manual **client-side fetch** calls
- Common pitfalls: forgetting `"use server"`, using React hooks in server files, and what is / isn't safe regarding secrets

---

## Project Structure

```
Lec-125 Server Actions in NextJS/
├── README.md                  ← these lecture notes (you are here)
└── server-actions/            ← the Next.js demo app
    ├── actions/
    │   └── form.js            ← the SERVER ACTION ("use server" + fs write)
    ├── app/
    │   ├── page.js            ← client component with the form ("use client")
    │   ├── layout.js          ← root layout (create-next-app default, Inter font)
    │   └── globals.css        ← Tailwind directives + default gradient styles
    ├── harry.txt              ← ★ the file the server action WRITES TO
    ├── next.config.mjs        ← empty/default Next.js config
    ├── package.json           ← Next.js 14.1.0, React 18, Tailwind CSS
    └── README.md              ← untouched create-next-app boilerplate (ignore)
```

### Why `harry.txt` matters

`harry.txt` is the **smoking gun** of this lecture. Its current contents:

```
Name is Harry and Address is India
```

That text was written by the server action using Node's `fs` module the last time the form was submitted. A browser **cannot** write files to a server's disk — there is no filesystem API over HTTP. The only way this file can change when you click "Submit" is if your function is genuinely executing **on the server**, inside the Node.js process, with real filesystem access. Every time you submit the form with new values, `harry.txt` is overwritten — live proof that Server Actions are server code, not client code.

---

## Concept Deep-Dives

### 1. The `"use server"` directive

`"use server"` tells the Next.js compiler: *"the exported async functions here must run on the server — never ship their bodies to the browser."* Instead of bundling the function into client JavaScript, Next.js generates a **reference** (an opaque ID) for the client, and wires up an endpoint behind the scenes. Calling the function from the client triggers a network request to that hidden endpoint.

There are two ways to apply it:

**File-level** (what this demo uses) — the directive is the *first line of the file*, and **every exported async function in that module becomes a server action**:

```js
"use server"
import fs from "fs/promises"
export const submitAction = async (e) => {
    console.log(e.get("name"), e.get("add"))
    let a = await fs.writeFile("harry.txt", `Name is ${e.get("name")} and Address is ${e.get("add")}`) 

  }
```

**Inline** (the alternative) — the directive is the first line *inside a single function body*, typically inside a Server Component, marking just that one function:

```js
// app/some-server-page.js  (a Server Component — no "use client")
export default function Page() {
  async function submitAction(formData) {
    "use server"           // only THIS function is a server action
    // ...server-only code here...
  }
  return <form action={submitAction}>...</form>
}
```

> Rule of thumb: if a **client component** needs to import the action (as `app/page.js` does here), the action **must** live in a separate file with file-level `"use server"` — you cannot define inline server actions inside a `"use client"` file.

### 2. Binding the action: `<form action={serverAction}>`

In classic HTML, `action` is a URL string (`action="/submit.php"`). In the Next.js App Router, React extends `action` to also accept a **function**. When that function is a server action, submitting the form serializes the fields into a `FormData` object and invokes the function on the server:

```jsx
<form ref={ref} action={(e)=> {submitAction(e); ref.current.reset()}}>
```

Here the demo passes an **arrow function wrapper** that (1) calls the imported server action `submitAction(e)` and (2) resets the form fields afterwards via a `ref`. The parameter `e` is **not an event object** — it is the **`FormData`** instance React builds from the form. The simplest possible binding, with no wrapper, would be:

```jsx
<form action={submitAction}>
```

### 3. The FormData API — `formData.get("name")`

The server action receives one argument: a standard Web `FormData` object. Each form field is retrievable by the **`name` attribute** of its input (not the `id`):

```js
console.log(e.get("name"), e.get("add"))
```

...which maps directly to the inputs on the page:

```jsx
<input name="name" id="name" className="text-black mx-4" type="text" />
...
<input name="add" id="add" className="text-black mx-4" type="text" />
```

`e.get("name")` returns whatever the user typed in the Name box; `e.get("add")` returns the Address. No `JSON.parse`, no `req.body`, no body-parser middleware — the platform-standard FormData API does it all.

> Naming note: the parameter is called `e` in this demo, which *looks* like an event. A clearer name would be `formData`. Remember: **server actions receive FormData, not events.**

### 4. `fs` inside the action — real server power

Because the action executes in Node.js, it can import and use `fs/promises`:

```js
import fs from "fs/promises"
...
let a = await fs.writeFile("harry.txt", `Name is ${e.get("name")} and Address is ${e.get("add")}`) 
```

`fs.writeFile` overwrites `harry.txt` (path is relative to the process working directory — the project root when running `npm run dev`) with a template string built from the submitted values. Anything you can do in Node — query a database with Prisma, call Stripe with a secret key, send an email — you can do right here. None of this code, and none of the secrets it might use, is ever sent to the browser.

*(Small style note: `fs.writeFile` resolves to `undefined`, so capturing it in `let a` is unnecessary — a plain `await fs.writeFile(...)` would do.)*

### 5. Progressive enhancement — forms that work without client JS

When you bind a server action **directly** to a form —

```jsx
<form action={submitAction}>
```

— Next.js renders a real HTML `<form>` whose submission works **even before the client-side JavaScript bundle loads** (or on slow connections, or if JS fails entirely). The browser performs a plain form POST; Next.js routes it to your action on the server. Once React hydrates, submissions upgrade to smooth fetch-based calls without full page reloads. You get resilience for free.

**Important nuance for this demo:** because `app/page.js` wraps the action in a client-side arrow function (`(e)=> {submitAction(e); ref.current.reset()}`) inside a `"use client"` component, this particular form *does* need JavaScript to run the wrapper. You trade a bit of progressive enhancement for the convenience of client-side extras like `reset()`. The direct `action={submitAction}` form keeps the no-JS guarantee.

---

## Full Code Walkthrough

### `server-actions/actions/form.js` — the server action

```js
"use server"
import fs from "fs/promises"
export const submitAction = async (e) => {
    console.log(e.get("name"), e.get("add"))
    let a = await fs.writeFile("harry.txt", `Name is ${e.get("name")} and Address is ${e.get("add")}`) 

  }
```

Line by line:

1. `"use server"` — file-level directive. Every export of this module is a server action. This line **must** be the very first statement.
2. `import fs from "fs/promises"` — the promise-based Node filesystem module. Its presence alone proves this file can never run in a browser.
3. `export const submitAction = async (e) => {` — server actions must be **async** functions. `e` will be the `FormData` from the form.
4. `console.log(e.get("name"), e.get("add"))` — logs the submitted values. **Watch your terminal, not the browser console** — this prints where the server runs, which is the whole point.
5. `await fs.writeFile("harry.txt", ...)` — overwrites `harry.txt` in the project root with an interpolated sentence built from the two fields.

### `server-actions/app/page.js` — the form (client component)

```jsx
"use client"
import { submitAction } from "@/actions/form";
import { useRef } from "react";

export default function Home() {
  let ref = useRef()
  return (
    <div className="w-2/3 mx-auto my-12">
      <form ref={ref} action={(e)=> {submitAction(e); ref.current.reset()}}>
        <div>
          <label htmlFor="name">Name</label>
          <input name="name" id="name" className="text-black mx-4" type="text" />
        </div>
        <div>
          <label htmlFor="add">Address</label>
          <input name="add" id="add" className="text-black mx-4" type="text" />
        </div>
        <div>

        <button className="border border-white px-3">Submit</button>
        </div>
      </form>
    </div>
  );
}
```

Key points:

- `"use client"` — this page is a **client component** (it uses the `useRef` hook, which is client-only). Yet it happily imports and calls a server action. This client/server import is exactly what Server Actions make possible.
- `import { submitAction } from "@/actions/form"` — from the client's perspective this import is not the real function body; the compiler swaps it for a **serializable reference** to the server function.
- `useRef()` + `ref={ref}` — grabs a handle to the DOM `<form>` so it can be cleared after submission.
- `action={(e)=> {submitAction(e); ref.current.reset()}}` — the wrapper receives the `FormData` (`e`), forwards it to the server action, and immediately resets the form fields for a clean UX.
- A `<button>` inside a form defaults to `type="submit"`, so clicking it submits the form.

### One submission, end to end

Suppose the user types **Name = "Harry"**, **Address = "India"**, and clicks **Submit**:

1. **Browser:** React intercepts the form submission and packages the fields into a `FormData` object → `{ name: "Harry", add: "India" }`.
2. **Browser → Server (the hidden RPC):** React calls the wrapper, which calls `submitAction(e)`. Because `submitAction` is a server-action *reference*, this becomes an HTTP `POST` to the current page URL carrying the FormData plus a `Next-Action` header identifying which action to run. **You wrote zero fetch code for this.**
3. **Server:** Next.js matches the action ID, deserializes the FormData, and executes the real `submitAction` in Node.js.
4. **Server:** `console.log(...)` prints `Harry India` **in the terminal running `npm run dev`**.
5. **Server:** `await fs.writeFile("harry.txt", ...)` overwrites the file with `Name is Harry and Address is India`. Open the file — it changed. That's the proof of server execution.
6. **Server → Browser:** the action resolves; the response streams back. Meanwhile the wrapper's `ref.current.reset()` has cleared the input boxes. No page reload, no navigation — the user just sees an emptied form.

*(Subtle detail: the wrapper calls `submitAction(e)` without `await`, so `reset()` runs immediately, before the server finishes. Fine for this demo; for real apps `await` the action — or use `useFormStatus`/`useActionState` — before reacting to its completion.)*

---

## Server Actions vs API Routes vs Client Fetch

| Aspect | **Server Action** | **API Route** (`app/api/.../route.js`) | **Client `fetch()` to some endpoint** |
|---|---|---|---|
| Code you write | One async function + `"use server"` | Route handler (`export async function POST(req)`) with request/response plumbing | Handler **plus** fetch call, headers, `JSON.stringify`, error handling |
| Endpoint URL | None — invisible, auto-generated | You define and maintain `/api/...` paths | You must know/maintain the URL |
| Data in | `FormData` (or serializable args) handed to you | Manually parse `await req.json()` / `req.formData()` | Manually build the request body |
| Type/refactor safety | Direct import — rename breaks at build time | String URLs — typos fail at runtime | Same, plus response-shape drift |
| Works without client JS | Yes, when bound directly via `<form action={fn}>` | No — needs JS (unless you hand-roll HTML form posts) | No — fetch *is* client JS |
| Callable by third parties / mobile apps | Not intended — internal to your app | Yes — a public HTTP API | n/a (it's the caller) |
| Node powers (fs, DB, secrets) | Yes | Yes | No — browser sandbox |
| Best for | Form submissions & mutations inside your own Next.js app | Public APIs, webhooks, non-Next.js clients | Consuming external/third-party APIs from the browser |

**Bottom line:** for your own app's form mutations, Server Actions delete an entire layer (endpoint definition + fetch call + serialization) from your codebase.

---

## How to Run

```bash
cd server-actions
npm install
npm run dev
```

Then:

1. Open **http://localhost:3000**.
2. Type a name and an address; click **Submit**.
3. Watch the **terminal** — the server action's `console.log` prints your values there (server-side!).
4. Open **`server-actions/harry.txt`** — its contents have been overwritten with `Name is <your name> and Address is <your address>`.
5. Submit again with different values and re-open the file. It changes every time. Filesystem writes from a form, with no API route in sight.

---

## Key Takeaways

- **Server Actions = RPC for React.** You call a function; Next.js handles the network. No API route, no fetch, no JSON glue.
- `"use server"` marks server-only functions — **file-level** (top of file, all exports) or **inline** (top of one function body in a Server Component).
- Client components can **import** server actions from a `"use server"` file and pass them to `<form action={...}>` — this is the standard pattern (used in this demo).
- The action receives **`FormData`**; read fields with `.get("inputName")` — keyed by the input's `name` attribute.
- Server actions run in Node.js: `fs`, databases, and secret env vars are all available and never leak to the client. `harry.txt` changing on submit is the proof.
- Binding an action **directly** to a form gives **progressive enhancement** (works pre-hydration / without JS); wrapping it in a client arrow function (as done here for `reset()`) adds UX niceties but requires JS.
- Server logs appear in the **terminal**, not the browser console — a great sanity check for "where is this code running?"

## Pitfalls to Avoid

1. **Forgetting `"use server"`.** Without the directive, importing the function into a client component makes it plain client code — `fs` imports will blow up the build ("Module not found: Can't resolve 'fs'"), and passing it as a form `action` from the server won't serialize. If your action "runs in the browser," check this first.
2. **The directive must be the first line.** Anything above it (even an import) disables it.
3. **Using React hooks in a `"use server"` file.** `useState`, `useRef`, `useEffect` etc. are client-only. Server action files hold plain async functions — no hooks, no JSX, no component code.
4. **Confusing `"use server"` with `"use client"`.** They are not opposites of the same switch: `"use client"` marks a *component boundary* for the browser; `"use server"` marks *functions* callable from the client but executed on the server.
5. **Secrets exposure rules.** Code inside a server action is safe — it never ships to the browser, so `process.env.DATABASE_URL` or API keys are fine to *use* there. But whatever the action **returns** goes over the wire to the client — never return secrets, full DB records with sensitive columns, or internal error details. Also remember `NEXT_PUBLIC_*` env vars are *always* exposed to the client, action or not.
6. **Treating actions as trusted input.** Server actions are still network endpoints under the hood — always **validate** `formData` values on the server (this demo skips validation for brevity; real apps must not).
7. **Not awaiting the action before dependent client work.** The demo's wrapper calls `submitAction(e)` then `reset()` without awaiting — harmless here, but await completion before showing "Saved!" messages in real apps.
8. **Expecting `console.log` in the browser.** Action logs go to the server terminal.

## Practice Exercises

1. **Add a field.** Add a "Phone" input (`name="phone"`) to the form and extend the action to include it in the sentence written to `harry.txt`.
2. **Append instead of overwrite.** Change the action to use `fs.appendFile` so every submission adds a new line to `harry.txt` — turning it into a mini log of all submissions. Add a timestamp with `new Date().toISOString()`.
3. **Go fully progressive.** Rewrite `app/page.js` as a *server component* (remove `"use client"`, `useRef`, and the wrapper; bind `action={submitAction}` directly). Then disable JavaScript in your browser's DevTools and confirm the form still writes to `harry.txt`.
4. **Return feedback.** Make `submitAction` return a message like `"Saved <name>!"`, then use React's `useActionState` (or `useFormState` in older React 18/Next 14 setups) in the page to display it under the form.
5. **Inline variant.** Create a second page whose server component defines the action *inline* with `"use server"` as the first line of the function body — no separate actions file — and verify it behaves identically.

---

## A Note on the Other README

`server-actions/README.md` is the **stock create-next-app boilerplate** (getting-started text, deploy-on-Vercel links). It was left untouched and contains nothing lecture-specific — these notes, at the lecture-folder root, are the actual course material.
