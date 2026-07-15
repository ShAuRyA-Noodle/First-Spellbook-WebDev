# Lecture 125 — Server Actions in Next.js

## Overview

**Server Actions** are one of the most powerful features of the Next.js App Router: they let you call **server-side functions directly from your forms** — no API routes, no `fetch()` boilerplate, no JSON serialization code, no endpoint URLs.

You write an async function, mark it with the `"use server"` directive, and pass it straight to a form's `action` prop. When the form is submitted, Next.js transparently performs an RPC (remote procedure call): the browser sends the form data to the server, your function runs **on the server** (with full access to Node.js APIs like the filesystem, databases, and secret environment variables), and the result comes back — all without you ever writing an HTTP handler.

The demo app in this lecture (`server-actions/`) proves the point in the most visceral way possible: a form on the page writes directly to a file on the server's disk (`harry.txt`) using Node's `fs` module. Try doing *that* from client-side JavaScript!

This version of the demo goes one step further than a bare proof-of-concept: it's built as a small, two-panel "Client / Server" console. The left panel is the ordinary human-facing form; the right panel is a live terminal-style view of `harry.txt`, updated straight from the server after every write. Submitting the form is visually a signal travelling from the client card to the server card — the UI *is* the mental model.

---

## What You'll Learn

- What Server Actions are and why they eliminate the need for hand-written API routes for mutations
- The `"use server"` directive — how to apply it **file-level** (whole module) vs **inline** (single function)
- How to bind a server function to a form with `<form action={formAction}>`
- How the **FormData API** (`formData.get("fieldName")`) delivers your input values to the server, keyed by the `name` attribute of each input
- How server actions can use **Node.js-only APIs** — here `fs/promises` — because the code genuinely executes on the server
- How **progressive enhancement** works: a form bound to a server action can submit even before (or without) client-side JavaScript loading
- Building pending/result UI with **`useActionState`** (owns the state + the action) and **`useFormStatus`** (reads pending status from a descendant of the `<form>`, without prop-drilling)
- Reading files directly inside a **Server Component** (`app/page.js`) — no `"use server"` needed, because the component never leaves the server
- Calling `revalidatePath()` so a statically-rendered route picks up the mutation
- Server-side **validation** and returning field-level errors back into the form
- Common pitfalls: forgetting `"use server"`, using React hooks in server files, confusing `useActionState` with `useFormStatus`, and what is/isn't safe regarding secrets

---

## Project Structure

```
Lec-125 Server Actions in NextJS/
├── README.md                         ← these lecture notes (you are here)
└── server-actions/                   ← the Next.js demo app
    ├── actions/
    │   └── form.js                   ← the SERVER ACTION ("use server" + fs.appendFile)
    ├── app/
    │   ├── page.js                   ← Server Component: reads harry.txt, renders the page
    │   ├── layout.js                 ← root layout — Inter + JetBrains Mono, metadata, viewport
    │   └── globals.css               ← Tailwind directives + the demo's design tokens
    ├── components/
    │   └── submission-console.jsx    ← "use client" island: useActionState + useFormStatus
    ├── harry.txt                     ← ★ the file the server action WRITES TO
    ├── next.config.mjs               ← empty/default Next.js config
    ├── tailwind.config.js            ← design tokens mapped to Tailwind utilities
    ├── eslint.config.mjs             ← flat ESLint config (Next.js 16 dropped `next lint`)
    ├── package.json                  ← Next.js 16, React 19, Tailwind CSS 3
    └── README.md                     ← untouched create-next-app boilerplate (ignore)
```

### Why `harry.txt` matters

`harry.txt` is the **smoking gun** of this lecture. Its baseline contents ship as:

```
# harry.txt
# Written by the Server Action in actions/form.js via Node's fs module.
# Every form submission appends one line below with fs.appendFile — proof
# the handler actually runs on the server, not in the browser.

[2026-07-15T09:00:00.000Z] Name: Harry — Address: India
```

A browser **cannot** write files to a server's disk — there is no filesystem API over HTTP. The only way this file can grow when you click **Send to Server** is if your function is genuinely executing **on the server**, inside the Node.js process, with real filesystem access. Every submission **appends** a new timestamped line via `fs.appendFile` — so `harry.txt` becomes a running log of every submission the server has ever received, and the "Server" panel on the page renders that exact log, live.

---

## Concept Deep-Dives

### 1. The `"use server"` directive

`"use server"` tells the Next.js compiler: *"the exported async functions here must run on the server — never ship their bodies to the browser."* Instead of bundling the function into client JavaScript, Next.js generates a **reference** (an opaque ID) for the client, and wires up an endpoint behind the scenes. Calling the function from the client triggers a network request to that hidden endpoint.

There are two ways to apply it:

**File-level** (what this demo uses) — the directive is the *first line of the file*, and **every exported async function in that module becomes a server action**:

```js
"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

const LOG_PATH = path.join(process.cwd(), "harry.txt");

export async function submitEntry(prevState, formData) {
  // ...server-only code here...
}
```

**Inline** (the alternative) — the directive is the first line *inside a single function body*, typically inside a Server Component, marking just that one function:

```js
// app/some-server-page.js  (a Server Component — no "use client")
export default function Page() {
  async function submitAction(formData) {
    "use server";        // only THIS function is a server action
    // ...server-only code here...
  }
  return <form action={submitAction}>...</form>;
}
```

> Rule of thumb: if a **client component** needs to import the action (as `components/submission-console.jsx` does here), the action **must** live in a separate file with file-level `"use server"` — you cannot define inline server actions inside a `"use client"` file.

### 2. Binding the action: `useActionState` + `<form action={formAction}>`

In classic HTML, `action` is a URL string (`action="/submit.php"`). In the Next.js App Router, React extends `action` to also accept a **function**. When that function is (or wraps) a server action, submitting the form serializes the fields into a `FormData` object and invokes the function on the server.

This demo doesn't pass the server action to `action` directly — it wraps it with React's `useActionState` hook, which is the idiomatic way to track a server action's result and pending status in a client component:

```jsx
// components/submission-console.jsx
"use client";
import { useActionState } from "react";

export default function SubmissionConsole({ action, initialState }) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form id="submission-form" action={formAction} aria-busy={isPending}>
      {/* inputs */}
    </form>
  );
}
```

`useActionState(action, initialState)` returns three things:

1. `state` — whatever the action last returned (or `initialState` before the first submit).
2. `formAction` — a wrapped version of `action` you pass straight to `<form action={...}>`.
3. `isPending` — `true` while a submission is in flight.

Crucially, **`formAction` is still bound to a real server action reference**, so the form keeps its progressive-enhancement guarantee (see §5) even though it's wrapped by a hook.

The action itself receives **two** arguments now, not one: `(prevState, formData)`. That's the `useActionState` calling convention — the action must accept the previous state as its first parameter.

### 3. The FormData API — `formData.get("name")`

The server action's second argument is a standard Web `FormData` object. Each form field is retrievable by the **`name` attribute** of its input (not the `id`):

```js
export async function submitEntry(prevState, formData) {
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  // ...
}
```

...which maps directly to the inputs rendered by `Field` in `components/submission-console.jsx`:

```jsx
<input id="name" name="name" type="text" autoComplete="name" />
<input id="address" name="address" type="text" autoComplete="street-address" />
```

`formData.get("name")` returns whatever the user typed in the Name box; `formData.get("address")` returns the Address. No `JSON.parse`, no `req.body`, no body-parser middleware — the platform-standard FormData API does it all.

### 4. `fs` inside the action — real server power

Because the action executes in Node.js, it can import and use `fs/promises`:

```js
const timestamp = new Date().toISOString();
const line = `[${timestamp}] Name: ${name} — Address: ${address}\n`;

await fs.appendFile(LOG_PATH, line, "utf8");
const fileContents = await fs.readFile(LOG_PATH, "utf8");

revalidatePath("/");
```

`fs.appendFile` adds a new line to `harry.txt` (path resolved with `path.join(process.cwd(), "harry.txt")` — the project root, regardless of whether you're running `next dev` or a built `next start`). The action then reads the file straight back so it can hand the fresh contents to the client, and calls `revalidatePath("/")` so Next.js knows the data behind `/` changed. Anything you can do in Node — query a database with Prisma, call Stripe with a secret key, send an email — you can do right here. None of this code, and none of the secrets it might use, is ever sent to the browser.

### 5. Progressive enhancement — forms that work without client JS

When a `<form>`'s `action` is a server action reference (directly, or via `useActionState`'s returned `formAction`), Next.js renders a real HTML `<form>` whose submission works **even before the client-side JavaScript bundle loads** (or on slow connections, or if JS fails entirely). Inspect the rendered markup and you'll find hidden inputs like `$ACTION_REF_1` and `$ACTION_1:0` — that's the server action reference and the serialized previous state, both baked into the HTML so a plain browser POST can find and invoke the right function with the right prior state. The browser performs a standard `multipart/form-data POST`; Next.js routes it to your action on the server and re-renders the page with the result. Once React hydrates, submissions upgrade to smooth fetch-based calls without full page reloads. You get resilience for free — and it was **verified for this exact demo**: replaying that raw hidden-field POST with `curl`/`fetch` (no browser JS involved at all) appended a new line to `harry.txt`, proving the no-JS path genuinely works.

### 6. `useFormStatus` — pending status without prop-drilling

`SubmissionConsole` already knows `isPending` from `useActionState`. But the actual `<button>` lives inside a separate `SubmitButton` component so it can be a clean, reusable unit — and that component has no direct access to `SubmissionConsole`'s state. That's exactly the case `useFormStatus` exists for: it reads the pending status of the **nearest ancestor `<form>`**, no matter how deep the component is nested inside it:

```jsx
// components/submission-console.jsx
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Sending to Server…" : "Send to Server"}
    </button>
  );
}
```

**Rule of thumb:** the component that *calls* `useActionState` owns the full result (data, errors, pending). Components *nested inside* that `<form>` that only care about "is this form submitting right now?" use `useFormStatus` instead of receiving `isPending` as a prop.

---

## Full Code Walkthrough

### `server-actions/actions/form.js` — the server action

```js
"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

const LOG_PATH = path.join(process.cwd(), "harry.txt");
const MAX_NAME_LENGTH = 80;
const MAX_ADDRESS_LENGTH = 120;

export async function submitEntry(prevState, formData) {
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  const errors = {};
  if (!name) errors.name = "Name is required.";
  else if (name.length > MAX_NAME_LENGTH)
    errors.name = `Keep it under ${MAX_NAME_LENGTH} characters.`;
  if (!address) errors.address = "Address is required.";
  else if (address.length > MAX_ADDRESS_LENGTH)
    errors.address = `Keep it under ${MAX_ADDRESS_LENGTH} characters.`;

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Fix the highlighted fields — nothing was written to disk.",
      errors,
      values: { name, address },
      entry: null,
      fileContents: prevState.fileContents,
      submissionCount: prevState.submissionCount,
    };
  }

  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] Name: ${name} — Address: ${address}\n`;

  await fs.appendFile(LOG_PATH, line, "utf8");
  const fileContents = await fs.readFile(LOG_PATH, "utf8");
  revalidatePath("/");

  return {
    status: "success",
    message: `Saved. fs.appendFile wrote ${line.length} bytes to harry.txt on the server.`,
    errors: {},
    values: { name: "", address: "" },
    entry: { name, address, timestamp },
    fileContents,
    submissionCount: prevState.submissionCount + 1,
  };
}
```

Line by line:

1. `"use server"` — file-level directive. Every export of this module is a server action. This line **must** be the very first statement.
2. `fs from "fs/promises"`, `path`, and `revalidatePath from "next/cache"` — Node/Next-only imports, proof this file never runs in a browser.
3. `export async function submitEntry(prevState, formData)` — server actions must be **async**. `prevState` is whatever `useActionState` last stored; `formData` is the submitted `FormData`.
4. **Validation** — `name`/`address` are trimmed and checked for presence and max length. Nothing trusts the browser's HTML `required` attribute alone.
5. **On error** — return a `status: "error"` object with per-field `errors`, echoing back the file contents/count unchanged. Nothing was written.
6. **On success** — build a timestamped log line, `fs.appendFile` it, read the file back, call `revalidatePath("/")`, and return `status: "success"` with the fresh `fileContents` and an incremented `submissionCount`.

### `server-actions/app/page.js` — the Server Component

```jsx
import fs from "fs/promises";
import path from "path";
import { submitEntry } from "@/actions/form";
import SubmissionConsole from "@/components/submission-console";

const LOG_PATH = path.join(process.cwd(), "harry.txt");
const ENTRY_LINE = /^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\]/;

async function readLog() {
  try {
    return await fs.readFile(LOG_PATH, "utf8");
  } catch {
    return "";
  }
}

function countEntries(contents) {
  return contents.split("\n").filter((line) => ENTRY_LINE.test(line)).length;
}

export default async function Home() {
  const fileContents = await readLog();
  const submissionCount = countEntries(fileContents);

  const initialState = {
    status: "idle",
    message: "",
    errors: {},
    values: { name: "", address: "" },
    entry: null,
    fileContents,
    submissionCount,
  };

  return (
    <main>
      {/* header copy */}
      <SubmissionConsole action={submitEntry} initialState={initialState} />
      {/* footer copy */}
    </main>
  );
}
```

Key points:

- **No `"use client"` here.** `page.js` is a Server Component, so it can `await fs.readFile(...)` directly — no `"use server"` required. `"use server"` is only needed when a *client* component must call a function that runs on the server; a Server Component is already on the server, so calling Node APIs is completely ordinary.
- It reads `harry.txt` **before render**, computes `submissionCount`, and packages both into `initialState` — the value `useActionState` will use until the first submission resolves.
- It imports the server action (`submitEntry`) and passes it as a prop into the client island (`SubmissionConsole`) — this is exactly what makes Server Actions "just work" across the client/server boundary: from the client's perspective, that import is a serializable reference, not real function code.

### `server-actions/components/submission-console.jsx` — the client island

This is the only `"use client"` file in the app — everything that needs interactivity (hooks, refs, live pending state) lives here, and nothing more:

```jsx
"use client";
import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Sending to Server…" : "Send to Server"}
    </button>
  );
}

export default function SubmissionConsole({ action, initialState }) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formRef = useRef(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status, state.entry]);

  useEffect(() => {
    if (state.status === "error") {
      // focus the first invalid field
    }
  }, [state]);

  return (
    <form id="submission-form" ref={formRef} action={formAction} aria-busy={isPending}>
      {/* Client panel: labeled inputs + <SubmitButton /> + live status text */}
      {/* Wire: a connector that pulses only while isPending is true */}
      {/* Server panel: harry.txt's contents, rendered from state.fileContents */}
    </form>
  );
}
```

Key points:

- `useActionState(action, initialState)` is called **once**, at the top of the component that owns the form. Its three return values (`state`, `formAction`, `isPending`) drive everything below it.
- The form is only reset (`formRef.current?.reset()`) **after** `state.status === "success"` — i.e. after the server confirms the write. Nothing is cleared optimistically.
- On `state.status === "error"`, an effect moves focus to the first invalid field, so the error is immediately visible/announced instead of requiring the user to hunt for it.
- The "Server" panel doesn't re-fetch anything — it renders `state.fileContents` directly, which the action already read fresh off disk and returned as part of its response.
- `SubmitButton` is a separate component using `useFormStatus()` precisely because it doesn't have (and shouldn't need) direct access to `SubmissionConsole`'s `isPending`.

### One submission, end to end

Suppose the user types **Name = "Harry"**, **Address = "India"**, and clicks **Send to Server**:

1. **Browser:** React intercepts the form submission and packages the fields into a `FormData` object → `{ name: "Harry", address: "India" }`.
2. **Browser → Server (the hidden RPC):** because the form's `action` is `useActionState`'s `formAction` — itself wired to the `submitEntry` server-action reference — submitting becomes an HTTP `POST` to the current page URL carrying the FormData plus the action's identifying reference. **You wrote zero fetch code for this.** `isPending` flips to `true`; the submit button shows "Sending to Server…" and the wire connector between the two cards starts pulsing.
3. **Server:** Next.js matches the action reference, deserializes the FormData, and executes the real `submitEntry(prevState, formData)` in Node.js.
4. **Server:** validation passes, so a timestamped line is built and `await fs.appendFile("harry.txt", line)` runs — the actual proof of server execution.
5. **Server:** `await fs.readFile("harry.txt")` reads the file back, `revalidatePath("/")` invalidates the cached route, and the action returns `{ status: "success", fileContents, submissionCount, ... }`.
6. **Server → Browser:** the new `state` streams back. `isPending` flips to `false`, the "Server" panel's `<pre>`-style log re-renders with the new line (with a brief `rise-in` highlight), the submission counter increments, the client's status text turns green with the confirmation message, and an effect clears the input fields.

*(Contrast with the original single-field demo: submissions here are `await`ed properly by React itself — `useActionState` doesn't resolve `isPending` back to `false` or update `state` until the action's promise settles, so there's no race between "form appears to reset" and "server actually finished.")*

---

## Server Actions vs API Routes vs Client Fetch

| Aspect | **Server Action** | **API Route** (`app/api/.../route.js`) | **Client `fetch()` to some endpoint** |
|---|---|---|---|
| Code you write | One async function + `"use server"` | Route handler (`export async function POST(req)`) with request/response plumbing | Handler **plus** fetch call, headers, `JSON.stringify`, error handling |
| Endpoint URL | None — invisible, auto-generated | You define and maintain `/api/...` paths | You must know/maintain the URL |
| Data in | `FormData` (or serializable args) handed to you as the function's argument(s) | Manually parse `await req.json()` / `req.formData()` | Manually build the request body |
| Pending/result UI | `useActionState` (state + pending in one hook) or `useFormStatus` (pending only, any descendant) | You wire your own `isLoading` state around the fetch call | Same — hand-rolled loading/error state |
| Type/refactor safety | Direct import — rename breaks at build time | String URLs — typos fail at runtime | Same, plus response-shape drift |
| Works without client JS | Yes — real `<form>` POST, verified by replaying the raw hidden-field submission with no browser JS at all | No — needs JS (unless you hand-roll HTML form posts) | No — fetch *is* client JS |
| Cache invalidation | `revalidatePath` / `revalidateTag`, called right where the mutation happens | You decide/own invalidation, often via the same tools | Same — separate, manual concern |
| Callable by third parties / mobile apps | Not intended — internal to your app | Yes — a public HTTP API | n/a (it's the caller) |
| Node powers (fs, DB, secrets) | Yes | Yes | No — browser sandbox |
| Best for | Form submissions & mutations inside your own Next.js app | Public APIs, webhooks, non-Next.js clients | Consuming external/third-party APIs from the browser |

**Bottom line:** for your own app's form mutations, Server Actions delete an entire layer (endpoint definition + fetch call + serialization + manual loading state) from your codebase — and `useActionState`/`useFormStatus` give you the pending/result UI that layer used to require, for free.

---

## How to Run

```bash
cd server-actions
npm install
npm run dev
```

Then:

1. Open **http://localhost:3000**.
2. Type a name and an address in the **Client** panel; click **Send to Server**.
3. Watch the button switch to "Sending to Server…" and the connector between the two panels pulse while the request is in flight.
4. Watch the **Server** panel — a new line appears in the log, and the "Entries logged" counter increments. That log is `harry.txt`'s live contents.
5. Open **`server-actions/harry.txt`** in an editor — the new line is really there on disk.
6. Submit again with different values; the file keeps growing, one line per submission — a real log built entirely from a form and `fs.appendFile`, no API route in sight.
7. Try it with JavaScript disabled (DevTools → ⋮ → More tools → Sensors/Rendering → "Disable JavaScript" in Chromium, or `about:config` → `javascript.enabled` in Firefox) — the form still writes to disk, via a plain HTML POST and a full-page response.

To verify the production build:

```bash
npm run build
npm run start
```

---

## Key Takeaways

- **Server Actions = RPC for React.** You call a function; Next.js handles the network. No API route, no fetch, no JSON glue.
- `"use server"` marks server-only functions — **file-level** (top of file, all exports) or **inline** (top of one function body in a Server Component).
- A **Server Component** (`app/page.js`) can use Node APIs like `fs` directly — `"use server"` is not needed there, only when a *client* component needs to call server code.
- Client components import server actions and pass them to **`useActionState(action, initialState)`**, which returns `[state, formAction, isPending]` — bind `formAction` to `<form action={...}>`.
- **`useFormStatus()`** reads the pending status of the nearest ancestor `<form>` from any descendant component — use it to avoid prop-drilling `isPending` into reusable pieces like a submit button.
- The action receives **`(prevState, formData)`** with `useActionState`; read fields with `formData.get("inputName")`, keyed by the input's `name` attribute.
- Server actions run in Node.js: `fs`, databases, and secret env vars are all available and never leak to the client. `harry.txt` growing on every submit is the proof.
- Binding an action (directly or via `useActionState`) to a real `<form>` gives **progressive enhancement** — this demo's no-JS path was verified by replaying the form's raw hidden fields with a plain HTTP POST.
- Server logs and file writes happen on the **server process**, not in the browser — a great sanity check for "where is this code running?"

## Pitfalls to Avoid

1. **Forgetting `"use server"`.** Without the directive, importing the function into a client component makes it plain client code — `fs` imports will blow up the build ("Module not found: Can't resolve 'fs'"), and passing it as a form `action` won't serialize correctly. If your action "runs in the browser," check this first.
2. **The directive must be the first line.** Anything above it (even an import) disables it.
3. **Using React hooks in a `"use server"` file.** `useState`, `useRef`, `useEffect`, etc. are client-only. Server action files hold plain async functions — no hooks, no JSX, no component code.
4. **Confusing `"use server"` with `"use client"`.** They are not opposites of the same switch: `"use client"` marks a *component boundary* for the browser; `"use server"` marks *functions* callable from the client but executed on the server.
5. **Mixing up `useActionState` and `useFormStatus`.** `useActionState` is called once, by the component that owns the `<form>` and needs the full result (`state`) plus `formAction`. `useFormStatus` is for components *nested inside* that form that only need `pending` — calling `useFormStatus` outside a `<form>`, or expecting it to read a sibling form's state, won't work.
6. **Forgetting the `prevState` parameter.** An action passed to `useActionState` must accept `(prevState, formData)` — a plain `(formData) => {}` action (the pattern used with a bare `<form action={fn}>`, no hook) will receive the wrong first argument if you switch to `useActionState` without updating its signature.
7. **Secrets exposure rules.** Code inside a server action is safe — it never ships to the browser, so `process.env.DATABASE_URL` or API keys are fine to *use* there. But whatever the action **returns** goes over the wire to the client — never return secrets, full DB records with sensitive columns, or internal error details. Also remember `NEXT_PUBLIC_*` env vars are *always* exposed to the client, action or not.
8. **Treating actions as trusted input.** Server actions are still network endpoints under the hood — always **validate** `formData` values on the server, as `actions/form.js` does with its length/required checks. Never rely on the client's HTML `required`/`maxLength` attributes alone.
9. **Resetting UI before the action resolves.** Clear inputs / show "Saved!" only after `state` reflects success (as the `useEffect` watching `state.entry` does here) — never optimistically, or you risk showing success before (or if) the write actually happens.
10. **Forgetting `revalidatePath`/`revalidateTag`.** If a route can be statically cached (this one is — `next build` prerenders `/`), a mutation without revalidation can leave stale data on the next full navigation, even though the action's own returned `state` looks fresh in the current session.

## Practice Exercises

1. **Add a field.** Add a "Phone" input (`name="phone"`) to the form, validate it in `submitEntry`, and extend the log line format to include it.
2. **Switch back to overwrite.** Change `fs.appendFile` to `fs.writeFile` so each submission replaces `harry.txt` instead of growing it. What does the "Server" panel show now, and why might append be the more compelling teaching choice?
3. **Go fully progressive.** Create a second page (`app/no-js/page.js`) that renders a minimal server component form bound `action={submitEntry}` **without** `useActionState` or `useFormStatus` at all. Disable JavaScript and confirm it still writes to `harry.txt` — then compare the UX to the version with pending/result UI.
4. **Add optimistic UI.** Explore React's `useOptimistic` to show the newly submitted line in the "Server" panel *immediately*, before the action resolves — then reconcile it with the real server response. What has to be true for this to be safe here?
5. **Inline variant.** Create a third page whose server component defines an action *inline* with `"use server"` as the first line of the function body — no separate actions file — and verify it behaves identically to the imported version.
6. **Rate-limit submissions.** Add a simple in-memory counter/timestamp check inside `submitEntry` that rejects more than N submissions per minute, returning a `status: "error"` state — a taste of why "actions are network endpoints" (see Pitfall 8) matters.

---

## A Note on the Other README

`server-actions/README.md` is the **stock create-next-app boilerplate** (getting-started text, deploy-on-Vercel links). It was left untouched and contains nothing lecture-specific — these notes, at the lecture-folder root, are the actual course material.
