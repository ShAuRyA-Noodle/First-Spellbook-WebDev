# Lec-112: Handling Events in React

## Overview

Events are how a user interface comes alive. Every click, keystroke, hover, and form entry is an **event**, and React gives you a clean, declarative way to respond to all of them. Instead of manually calling `document.addEventListener(...)` the way you would in vanilla JavaScript, React lets you attach handlers **directly in JSX** using camelCased props such as `onClick`, `onChange`, `onMouseOver`, `onFocus`, and `onBlur`.

Under the hood, React does not hand you the browser's raw event. It wraps it in a **SyntheticEvent** — a cross-browser wrapper that behaves identically in every browser and exposes the same familiar API (`e.target`, `e.clientX`, `e.preventDefault()`, and so on). This means you write your event logic once and it works everywhere.

This lecture's project is now an **Events Playground** — a small, self-contained Vite + React app you can click, hover, focus, and type into, while a live on-screen console prints exactly what fired and why. It demonstrates the full event-handling story:

1. **Click events** — a button wired to a handler with no arguments, plus a row of buttons that pass a custom argument through an inline arrow function.
2. **Mouse events** — a hover-reactive "signal pad" using `onMouseOver` / `onMouseOut`, paired with `onFocus` / `onBlur` so keyboard users get the same feedback (hover has no keyboard equivalent).
3. **Change events + controlled inputs** — three fields (`email`, `phone`, `message`) whose values live in one React state object, updated by a **single shared `handleChange` function** using the event object, object spread, and computed property names.
4. **A live event log** — every interaction above is pushed into an on-screen console (timestamped, color-tagged by event type) instead of a blocking `alert()`, so you can *see* the event object's effects instead of just being told about them.

By the end of these notes you will understand not just *how* to wire up an event, but *why* React events work the way they do — including the classic beginner traps like `onClick={handler()}` and logging state immediately after calling a setter.

---

## What You'll Learn

- What **synthetic events** are and why React uses them instead of raw browser events.
- How to attach event handlers in JSX with **camelCase props**: `onClick`, `onMouseOver`, `onMouseOut`, `onFocus`, `onBlur`, `onChange`.
- The critical difference between **passing a handler reference** (`onClick={handleClick}`) and **calling the handler** (`onClick={handleClick()}`) — and why the second one is almost always a bug.
- How to **pass a custom argument to a handler** by wrapping the call in an inline arrow function: `onClick={() => handleClickWithAmount(5, e)}`.
- How to receive and use the **event object** (`e`) inside a handler — `e.target.name`, `e.target.value`, `e.clientX`, `e.clientY`.
- What a **controlled input** is: `value` driven by state, `onChange` writing back to state.
- How to manage **multiple form fields with one state object and one handler**, using the spread operator (`...form`) and **computed property names** (`[e.target.name]`).
- Why logging `form` right after `setForm(...)` prints the **old** value (state updates are asynchronous/batched) — and how to log the up-to-date value instead.
- Why `onMouseOver` has **no keyboard equivalent**, and how pairing it with `onFocus` / `onBlur` (plus `tabIndex`) keeps hover-driven UI accessible.

---

## Project Structure

```
Lec-112 Handling Events in React/
├── index.html              # HTML entry point; contains <div id="root"> and loads main.jsx
├── package.json            # Project metadata, scripts (dev/build/lint/preview), dependencies
├── vite.config.js          # Vite configuration with the official React plugin
├── README.md               # You are reading it — the lecture notes
├── public/                 # Static assets served as-is (e.g. vite.svg)
└── src/
    ├── main.jsx            # React entry point; mounts <App /> into #root under StrictMode
    ├── App.jsx             # ★ The lecture code — the entire Events Playground lives here
    ├── App.css             # Playground layout + component styles (panels, buttons, console)
    ├── index.css            # Design tokens (colors, spacing, type), global reset
    └── assets/             # Bundled assets (react.svg — unused by the playground itself)
```

The only file that matters for the lecture concepts is **`src/App.jsx`** — everything else is styling or standard Vite + React scaffolding.

---

## Concept Deep-Dives

### 1. Synthetic Events: React's Cross-Browser Event Wrapper

Every handler in this project receives `e`, the SyntheticEvent:

```jsx
const handleChange = (e) => {
  const { name, value } = e.target
  const nextForm = { ...form, [name]: value }
  setForm(nextForm)
  pushLog('change', `${name} -> "${value}"`)
}
```

Key points about `e`:

- It has the **same interface** as a native event: `e.target`, `e.currentTarget`, `e.clientX`/`e.clientY`, `e.preventDefault()`, `e.stopPropagation()`, etc.
- It is **normalized across browsers**, so quirks between Chrome, Firefox, Safari, and older browsers disappear.
- If you ever need the raw browser event, it's available as `e.nativeEvent`.
- React attaches its listeners through **event delegation** at the root of your app rather than on every individual DOM node, which is more efficient.

This project reads different things off `e` depending on the event: `e.target.name` / `e.target.value` for form fields, `e.clientX` / `e.clientY` for mouse position.

### 2. Attaching Handlers in JSX: camelCase Props

In plain HTML you'd write `onclick="doSomething()"` (lowercase, a string). In React JSX you write a **camelCase prop** whose value is a **JavaScript function**, wrapped in curly braces:

```jsx
<button onClick={handleClick}>Click me</button>
```

The event props this project demonstrates:

| JSX prop      | Fires when…                                              | Used on                          |
|---------------|-----------------------------------------------------------|-----------------------------------|
| `onClick`     | The user clicks the element                                | the "Click me" and `+1/+5/+10` buttons, and "Clear log" |
| `onMouseOver` | The pointer moves onto the element                          | the "Mouse Events" panel (bubbles from the signal pad) |
| `onMouseOut`  | The pointer moves off the element                           | the "Mouse Events" panel |
| `onFocus`     | The element receives keyboard/programmatic focus            | the signal pad (keyboard equivalent of hover) |
| `onBlur`      | The element loses focus                                     | the signal pad |
| `onChange`    | The value of an input changes (each keystroke in React)     | the `email`, `phone`, and `message` fields |

Note: in React, `onChange` on a text input fires on **every keystroke** (it behaves like the native `input` event), not only when the field loses focus like the native HTML `change` event.

### 3. Passing a Handler Reference vs Calling It — `onClick={handler}` vs `onClick={handler()}`

This is the single most important habit in the file:

```jsx
<button onClick={handleClick}>Click me</button>
```

Notice there are **no parentheses** after `handleClick`. We are passing the **function itself** (a reference) so that *React* can call it later, whenever the click actually happens.

Compare the two forms:

- `onClick={handleClick}` — "Hey React, here is a function. Call it **when the button is clicked**."
- `onClick={handleClick()}` — "Call `handleClick` **right now, during render**, and pass whatever it returns (here `undefined`) to `onClick`."

With the broken second form, the log entry would appear **immediately when the component renders**, and clicking the button afterwards would do nothing. Worse, if the handler updates state, calling it during render triggers a re-render, which calls it again… producing an **infinite render loop**.

### 4. Passing Arguments: the Arrow-Function Wrapper

The plain `handleClick` above takes no arguments — the reference is all you need. But the `+1 / +5 / +10` buttons all call the *same* handler with a *different* number:

```jsx
const INCREMENTS = [1, 5, 10]

const handleClickWithAmount = (amount, e) => {
  setClickCount((current) => current + amount)
  pushLog('click', `+${amount} pressed at (${e.clientX}, ${e.clientY}) via an inline arrow fn`)
}
```

```jsx
<div className="btn-row" role="group" aria-label="Increment counter">
  {INCREMENTS.map((amount) => (
    <button
      key={amount}
      type="button"
      className="btn btn-ghost"
      onClick={(e) => handleClickWithAmount(amount, e)}
    >
      +{amount}
    </button>
  ))}
</div>
```

You can't write `onClick={handleClickWithAmount(amount, e)}` — that calls it immediately during render, and `e` does not even exist yet at that point. The fix is to wrap the call in an **inline arrow function**: `(e) => handleClickWithAmount(amount, e)`. That arrow function is itself the reference React stores; the call to `handleClickWithAmount` only happens when React invokes the arrow function on click, passing React's own event object in as `e`.

### 5. `onClick` in Action: the Click Handlers

```jsx
const handleClick = () => {
  pushLog('click', 'Click me pressed (no arguments passed)')
}
```

Flow: the user clicks → React's delegated listener catches the native event → React creates a SyntheticEvent → React calls `handleClick` → a new line appears in the on-screen event log. This handler ignores the event object entirely because it doesn't need any information about the click — it just reacts to the fact that one occurred.

### 6. `onMouseOver` / `onMouseOut`, and Why They Need `onFocus` / `onBlur` Too

```jsx
const handleMouseOver = (e) => {
  setIsHovering(true)
  setHoverSource('pointer')
  setHoverPos({ x: e.clientX, y: e.clientY })
  pushLog('mouseover', `pointer entered the signal pad at (${e.clientX}, ${e.clientY})`)
}

const handleMouseOut = () => {
  setIsHovering(false)
  pushLog('mouseout', 'pointer left the signal pad')
}
```

These are attached to the whole "Mouse Events" `<section>`, so `onMouseOver` fires as soon as the pointer crosses into the panel, and `onMouseOut` fires when it leaves.

The catch: **`onMouseOver` has no keyboard equivalent.** A keyboard-only user can Tab around the page all day and never trigger it, because there is no "hover" concept without a pointer. This project deliberately treats that as a teaching moment instead of hiding it — the signal pad is also given `tabIndex={0}` plus `onFocus` / `onBlur` handlers that mirror the same UI state:

```jsx
const handleFocus = () => {
  setIsHovering(true)
  setHoverSource('keyboard')
  pushLog('focus', 'signal pad focused via keyboard (mouseover has no keyboard equivalent)')
}

const handleBlur = () => {
  setIsHovering(false)
  pushLog('blur', 'signal pad blurred')
}
```

Press Tab until the pad is focused and you'll see the same visual "signal detected" feedback a mouse user gets from hovering — just sourced from a different event pair.

### 7. `onChange`, the Event Object, and Controlled Inputs

The `email` field, verbatim (`phone` and `message` follow the identical pattern with `type="tel"` and a `<textarea>` respectively):

```jsx
<input
  id="email"
  name="email"
  type="email"
  autoComplete="off"
  spellCheck="false"
  placeholder="ada@lovelace.dev"
  value={form.email ?? ''}
  onChange={handleChange}
/>
```

These are **controlled inputs** — the gold-standard React form pattern. A controlled input has two halves:

1. **`value={...}`** — the input displays exactly what React state says it should. The DOM is no longer the source of truth; the `form` state object is.
2. **`onChange={handleChange}`** — every keystroke reports back to React, which updates state, which re-renders the input with the new value.

The data flows in a loop: **state → `value` → user types → `onChange` → `setForm` → new state → new `value`**. If you provided `value` without `onChange`, the input would be frozen (read-only), and React would warn you in the console.

Note `form.email ?? ''`. Since `form` starts as an **empty object** (`useState({})`), `form.email` is `undefined` on the first render. Passing `undefined` as `value` would make the input **uncontrolled**, and React would throw the famous warning: *"A component is changing an uncontrolled input to be controlled."* The `??` (nullish coalescing) guarantees the value is always a string — `''` until the user types something.

### 8. One Handler, Many Fields: Spread + Computed Property Names

Instead of writing a separate handler and a separate `useState` for every field, the project stores the whole form in **one state object**:

```jsx
const [form, setForm] = useState({})
```

…and updates it with **one shared handler**:

```jsx
const handleChange = (e) => {
  const { name, value } = e.target
  const nextForm = { ...form, [name]: value }
  setForm(nextForm)
  pushLog('change', `${name} -> "${value}"`)
}
```

This one line — `{ ...form, [name]: value }` — packs three big JavaScript/React ideas:

1. **Immutability via spread (`...form`)**: React state must never be mutated in place. `{...form}` creates a *brand-new object* containing all existing keys, so React can detect the change and re-render. Without the spread, typing in the phone field would **erase** whatever you'd typed in the email field, because the new object would contain only the phone key.
2. **Computed property names (`[name]`)**: the square brackets mean "use the *value* of this expression as the key." If the user typed in the input with `name="email"`, this becomes the key `"email"`; if they typed in `name="phone"`, it becomes `"phone"`. That's why one handler can serve any number of inputs — the input's own `name` attribute routes the value to the right slot in state.
3. **The event object as the data source**: `e.target` is the exact `<input>` (or `<textarea>`) element that fired the event, so `e.target.value` is always the current text of *that* field. Destructuring `const { name, value } = e.target` pulls both out in one line.

Type "a" into the email box, then "9" into the phone box, and state evolves like this:

```
{}                                  // initial
{ email: "a" }                      // after typing in email
{ email: "a", phone: "9" }          // after typing in phone
```

You can watch this exact evolution live in the **"form state (live)"** panel next to the inputs — it renders `JSON.stringify(form, null, 2)` on every render, so there is no need to open DevTools to see what state actually contains.

### 9. State Updates Are Asynchronous (the Stale-Log Trap — and the Fix)

The single most common beginner bug in this lecture used to be:

```jsx
// The old, buggy version — do not do this:
setForm({ ...form, [e.target.name]: e.target.value })
console.log(form)   // prints the OLD form, not the one you just set!
```

`setForm` does **not** change `form` immediately. It *schedules* a re-render; only on that next render does the `form` variable (a `const` captured by this closure) hold the new object. Inside the *current* call to `handleChange`, `form` is still the old snapshot. This is intentional — React batches state updates for performance — and it's one of the most common sources of beginner confusion.

The fix used throughout this project is to **build the next value in a local variable first**, pass that to the setter, and log/use *that* variable instead of the stale state:

```jsx
const handleChange = (e) => {
  const { name, value } = e.target
  const nextForm = { ...form, [name]: value }   // 1. compute the next value
  setForm(nextForm)                              // 2. schedule the state update
  pushLog('change', `${name} -> "${value}"`)      // 3. use fresh data, not stale `form`
}
```

`nextForm` (and `value`) are correct the instant they're computed — they don't depend on the asynchronous re-render the way reading `form` again in the same closure would. The event log always shows the field name and the character that was *just* typed, never a value one keystroke behind.

---

## Full Code Walkthrough: `src/App.jsx`

The file is organized top to bottom as: constants → state → the `pushLog` helper → one handler per event type → JSX. Rather than reproduce all ~280 lines here, this section walks through it section by section — open `src/App.jsx` alongside these notes.

**Imports & constants**

```jsx
import { useRef, useState } from 'react'
import './App.css'

const MAX_LOG_ENTRIES = 30
const INCREMENTS = [1, 5, 10]
```

No `reactLogo` / `viteLogo` imports — the original Vite template's unused logo imports were removed, since nothing in this UI renders them.

**State** — `form` is the controlled-input source of truth, `clickCount` is driven by the `+1/+5/+10` buttons, `isHovering` / `hoverPos` / `hoverSource` back the signal pad, and `log` / `logIdRef` back the event console:

```jsx
const [form, setForm] = useState({})

const [clickCount, setClickCount] = useState(0)

const [isHovering, setIsHovering] = useState(false)
const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })
const [hoverSource, setHoverSource] = useState(null) // 'pointer' | 'keyboard'

const [log, setLog] = useState([])
const logIdRef = useRef(0)
```

There is no leftover `count` / `setCount` from the original Vite counter template, and no commented-out `name` / `setName` scaffolding — both were removed as flagged. `clickCount` replaces the old unused counter with one that is actually wired to visible UI (the `+1/+5/+10` buttons).

**The `pushLog` helper** timestamps and prepends a new entry to the log, capping it at `MAX_LOG_ENTRIES` so the list can't grow unbounded during a long session:

```jsx
const pushLog = (type, detail) => {
  logIdRef.current += 1
  const now = new Date()
  const time = `${now.toLocaleTimeString('en-GB', { hour12: false })}.${String(
    now.getMilliseconds(),
  ).padStart(3, '0')}`
  setLog((prev) => [{ id: logIdRef.current, type, detail, time }, ...prev].slice(0, MAX_LOG_ENTRIES))
}
```

**The six handlers** — `handleClick`, `handleClickWithAmount`, `handleMouseOver`, `handleMouseOut`, `handleFocus`, `handleBlur`, `handleChange` — are covered individually in the Concept Deep-Dives above.

**The JSX** renders, top to bottom:

1. A skip link (`<a href="#main-content">`) for keyboard users.
2. A `<header>` with the title, a one-line explainer, and a small "idle / live" status indicator that pulses every time a new event is logged.
3. A `<main>` grid with three panels: **Click Events**, **Mouse Events**, and **Controlled Inputs** (which also renders the live `form` state as formatted JSON).
4. A full-width **Event Log** console at the bottom — a `role="log"` region that lists every event fired, newest first, color-tagged by type, with a "Clear log" button.

### Supporting Files (Brief)

- **`src/main.jsx`** — the boot file. It grabs `<div id="root">` from `index.html` and renders `<App />` inside `<React.StrictMode>`. Unchanged from the original — StrictMode is a development-only helper that double-invokes renders to surface impure code and does not affect event-handling behavior in production.
- **`index.html`** — the single page Vite serves. Now carries a descriptive `<title>`, a meta description, and light/dark `theme-color` tags that match the app's own color scheme.
- **`vite.config.js`** — minimal config: `plugins: [react()]` enables JSX transformation and Fast Refresh. Unchanged.
- **`package.json`** — project name `video-112`; React 18.2, Vite 5; scripts covered below. Unchanged (no new dependencies were added — everything above is plain React + CSS).
- **`src/index.css`** — the design tokens (color, spacing, type scale) for both light and dark mode, plus a minimal global reset.
- **`src/App.css`** — the playground's layout and component styles: header, panel grid, buttons, the signal pad, the form + state inspector, and the event-log console.

---

## How to Run

Prerequisite: Node.js (v18+ recommended) with npm.

1. Open a terminal in the project folder:

   ```bash
   cd "Lec-112 Handling Events in React"
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open the printed URL (typically `http://localhost:5173`) in your browser.

Things to try once it's running:

- Click **"Click me"** → a `click` entry appears in the event log.
- Click **+1 / +5 / +10** → watch the counter change and the log show the exact pixel coordinates of each click (from `e.clientX` / `e.clientY`).
- Hover the **Mouse Events** panel → the signal pad lights up and pulses. Move off → it fires `mouseout`.
- Press **Tab** until the signal pad is focused (no mouse) → the same pad lights up via `onFocus`, proving hover and focus are two different event pairs with overlapping purpose.
- Type into **email / phone / message** → watch the **"form state (live)"** JSON panel update on every keystroke, and a `change` entry appear in the log for each one.
- Click **"Clear log"** to empty the console and start fresh.

Other available scripts: `npm run build` (production build), `npm run preview` (serve the build), `npm run lint` (ESLint — configured with `--max-warnings 0`, so the project is expected to lint completely clean).

---

## Key Takeaways

1. **React event props are camelCase and take functions**: `onClick={fn}`, `onChange={fn}`, `onMouseOver={fn}` — never strings like in HTML.
2. **Pass the reference, don't call it.** `onClick={handleClick}` hands React a function to call later; `onClick={handleClick()}` runs it immediately during render.
3. **Wrap in an arrow function to pass arguments.** `onClick={() => handleClickWithAmount(5, e)}` — the arrow function is the reference; the inner call only happens when React invokes it.
4. **`e` is a SyntheticEvent** — a normalized, cross-browser wrapper. `e.target.name`, `e.target.value`, `e.clientX`, `e.clientY` are your everyday tools.
5. **Controlled inputs** pair `value` (state → UI) with `onChange` (UI → state), making React state the single source of truth.
6. **One object + one handler scales to any form**, thanks to `{...form, [name]: value}` — spread preserves the other fields, the computed key routes the new value.
7. **State setters are asynchronous.** The state variable in the current closure keeps its old value until the next render — compute the next value into a local variable and use *that*, rather than re-reading the stale state right after calling its setter.
8. **Never pass `undefined` as a controlled `value`** — default missing fields to `''` (this project uses `??`).
9. **Hover has no keyboard equivalent.** Any UI driven by `onMouseOver` should also answer to `onFocus` (and `onMouseOut` to `onBlur`) so keyboard users get equivalent feedback.

## Common Pitfalls

- **`onClick={handleClick()}`** — calling instead of passing. Fires on render, does nothing on click, and can cause infinite loops if the handler sets state.
- **`onClick={handleClickWithAmount(5)}`** — same mistake, but for a handler that takes an argument. Wrap it: `onClick={() => handleClickWithAmount(5, e)}`.
- **Forgetting the spread**: `setForm({ [name]: value })` (without `...form`) wipes out every other field each keystroke.
- **Mutating state directly**: `form.email = value` changes the object without telling React — no re-render happens. Always build a new object.
- **Reading state right after setting it**: `setForm(nextForm); console.log(form)` shows the *previous* value, because `setForm` schedules a re-render rather than mutating in place. Log the local variable you just built instead (`nextForm`), or read state in the component body where it's always current.
- **`value` without `onChange`**: the input becomes read-only and React logs a warning. Controlled inputs need both halves.
- **`undefined` initial values**: starting `form` as `{}` means `form.email` is `undefined` at first; feed the input `''` instead (via `??`) to avoid the "uncontrolled to controlled" warning.
- **Using `class` or lowercase `onclick` in JSX**: JSX needs `className` and camelCase event props.
- **Hover-only interactions**: wiring UI feedback to `onMouseOver` alone leaves keyboard users with no way to trigger it. Pair it with `onFocus` (and `onMouseOut` with `onBlur`) as this project's signal pad does.

## Practice Exercises

1. **Add a fourth field.** Add an `<input type="text" name="address" ... />` wired to the same `handleChange`, following the same `value ?? ''` pattern. Notice you don't have to touch the handler or the state-inspector panel at all — both already generalize.
2. **Break it on purpose.** Change the "Click me" button to `onClick={handleClick()}` and reload. Explain exactly what you observe (when does the log entry appear?) and why. Then change it back.
3. **Reintroduce the stale-log bug.** In `handleChange`, temporarily change `pushLog('change', ...)` to log `form.email` instead of the freshly-read `value`. Type a few characters and watch the log fall one keystroke behind. Then revert it and explain why building `nextForm` first avoids the problem.
4. **Add a new event type.** Wire `onDoubleClick` to the "Click me" button (a new handler, e.g. `handleDoubleClick`) that calls `pushLog('dblclick', ...)`. Give the new event type its own color in `App.css` by adding a `.console-entry-dblclick` rule.
5. **Try it with only a keyboard.** Unplug your mouse (or just don't touch it) and Tab through the whole page. Confirm you can reach and activate every control, and that the signal pad still gives you feedback via `onFocus`/`onBlur`.

---

## Design Notes

This version intentionally moved away from `alert()`-based feedback. Blocking dialogs interrupt the browser's event loop and only show one message at a time — they hide the fact that events carry rich data (coordinates, field names, values). The on-screen **event log console** shows that data continuously and lets multiple events queue up visibly, which is a better teaching aid for *what actually happens* when an event fires. `console.log` calls were similarly replaced by `pushLog(...)` calls that route into the same on-screen console (open your browser DevTools if you'd still like to inspect the raw event object via `e.nativeEvent`).

Controlled inputs are used throughout on purpose, even though "prefer uncontrolled inputs" is common general performance advice — the entire point of this lecture is to demonstrate the `value` + `onChange` round-trip through React state, which requires a controlled component.

---

## Appendix: Original Vite Template Notes

The original `README.md` shipped with this project is preserved below, verbatim.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
