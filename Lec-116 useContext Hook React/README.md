# Lec-116: The `useContext` Hook — Escaping Prop Drilling with React's Context API

> **Course:** Web Development — React
> **Project:** `video-116` (Vite + React 18)
> **Topic:** Prop drilling, `createContext`, `Context.Provider`, and the `useContext` hook — demonstrated with a live *before/after* comparison inside one project, plus a redesigned, visually-instrumented Context demo.

---

## 1. Overview: The Problem and the Solution

### The problem — prop drilling

In React, data flows **one way**: from parent to child, via props. That is simple and predictable — until a piece of state living at the *top* of the tree is needed by a component buried *deep* at the bottom.

In this project, `App` owns a counter state (`count`), and the component that actually displays it (`Component1`) sits **three levels down**:

```text
App  (owns count)
 └── Navbar        ← doesn't need count, but must pass it
      └── Button   ← doesn't need count, but must pass it
           └── Component1  ← finally uses count
```

To get `count` to `Component1` with plain props, every intermediate component (`Navbar`, `Button`) must accept a `count` prop and forward it — even though **they never use it themselves**. This is called **prop drilling**. It:

- clutters intermediate components with props they don't care about,
- makes refactoring painful (rename/move a prop and you touch every layer),
- gets dramatically worse as the tree deepens or as more values need passing (imagine also drilling `setCount`, `theme`, `user`, ...).

### The solution — Context API + `useContext`

The **Context API** lets a parent make a value available to **any** descendant, no matter how deep, without threading it through every layer:

1. **Create** a context object with `createContext()` (in `src/context/context.js`).
2. **Provide** a value by wrapping the tree in `<counterContext.Provider value={...}>` (in `App.jsx`).
3. **Consume** the value anywhere below with a hook built on `useContext(counterContext)` (in `Button.jsx`, `Component1.jsx`, and `SignalMap.jsx`).

The intermediate component (`Navbar`) no longer touches the data at all. Think of context as a broadcast wire — the Provider powers it, and any descendant can tap in, at any depth, without the wire having to be handed hop-by-hop through every component in between.

![Context API diagram](Context%20API.png)

*The diagram above (from the original CodeWithHarry lecture slide) generalizes the idea beyond this project's 4-node tree: `App.js` can have any number of children and grandchildren at any depth, and Context reaches every one of them directly — no relay required.*

---

## 2. What's New in This Pass

This project was upgraded on top of the original lecture code. Two things changed:

1. **The `src/` app was redesigned** into a small "Signal Map" teaching tool — a dark, schematic-styled UI (see §3) that makes prop-drilling-vs-context a **visible**, not just conceptual, difference: a literal wire on screen that arcs *over* `Navbar` and *into* `Button`/`Component1`, pulsing every time the count changes.
2. **The default-value / missing-Provider footgun was fixed.** The original `createContext(0)` handed out a bare number as a fallback when the Provider supplied an object — a shape mismatch that crashed with `TypeError: value.setCount is not a function` the moment a consumer rendered without a Provider. `src/context/context.js` now uses `createContext(null)` plus a `useCounter()` hook that turns "no Provider found" into a safe, warned fallback instead of a crash. See §5.2 and §8.

Nothing about the *pattern* changed — it's still create → provide → consume, `count`/`setCount` still live in `App`'s `useState`, and `public/without_context_api/` is still the untouched prop-drilling snapshot. What changed is presentation and robustness.

---

## 3. The Redesigned `src/` App

Run it (`npm run dev`) and you'll see:

- **Header** — title, a one-line explanation, and a live `count` readout + **Reset** button driven directly by `App`'s own `useState` (the Provider doesn't need `useContext` to touch its own state — only descendants do).
- **Signal map panel** — an SVG schematic of the four-node tree (`App → Navbar → Button → Component1`). A slate line shows the actual render/DOM nesting; a **gold dashed wire** arcs from the Provider up and over `Navbar`, then straight into `Button` and `Component1`. `Navbar`'s node is drawn dim/idle — no wire touches it. Every increment sends a short glow pulse down the gold wire and flashes the two "live" nodes, so the "no props passed through the middle" claim is something you *watch happen*, not just read.
- **Live component tree panel** — the actual, running `Navbar → Button → Component1` nesting, rendered as indented cards. Each card shows its depth (`D1`/`D2`/`D3`) and states plainly whether it reads props, context, or neither. `Button`'s own counter badge and `Component1`'s readout update in lockstep with the header and the signal map, because they're all reading the same context value.

Design notes (why it looks the way it does):

- **Palette** — near-black navy surfaces with a single amber/gold accent (`--signal-live`) standing in for "power on the wire," and slate (`--signal-idle`) for structural-only connections. One accent color, used with intention (only "live" context-connected things are gold), beats a decorative multi-color palette.
- **Depth strategy** — borders-only, no drop shadows: this is a technical/schematic tool, so elevation comes from small background-lightness steps (`--bg-surface-1/2/3`) and a restrained border progression (`--border-subtle` → `--border-strong`), not shadows.
- **Typography** — a system sans for prose, a monospace stack for anything that reads like a signal/data readout (depth badges, the count itself, context notes) — reinforcing the "instrumentation panel" feel.
- **Accessibility** — the count in the header and in `Component1` are `aria-live="polite"` regions; the SVG has a `role="img"` with a text `aria-label` that's regenerated with the live count on every render (so screen reader users get the same information sighted users get from the pulse); all interactive elements are real `<button>`s with visible `:focus-visible` outlines; the pulse animation is skipped under `prefers-reduced-motion: reduce`.
- **Responsive** — the two panels sit in a 2-column grid above 880px and stack to one column below it; the tree's depth indentation shrinks on small screens so it never causes horizontal scrolling.

---

## 4. The Note File: `our app.md`

This tiny file records the component hierarchy the whole lecture revolves around. Its full content, verbatim (left untouched by this pass, per the brief):

```text
App.jsx
    Navbar.jsx  
        Button.jsx
            Component1.jsx
```

Read it as an indentation tree: `App` renders `Navbar`, which renders `Button`, which renders `Component1`. The state (`count`) lives at the top; the consumer lives at the bottom — a **3-hop gap** that props must bridge in the *before* version, and that Context bridges instantly in the *after* version. This is exactly the tree drawn in the signal map panel (§3), just relabeled with depth numbers `D0`–`D3`.

---

## 5. Project Structure

```text
Lec-116 useContext Hook React/
├── Context API.png                  # Diagram of Provider → consumers data flow (embedded above)
├── README.md                        # ← these notes
├── our app.md                       # Extra note file: sketch of our component tree (see §4), untouched
├── index.html                       # Vite entry HTML (mounts #root, loads src/main.jsx)
├── package.json                     # Project "video-116" — React 18, Vite 5
├── vite.config.js                   # Standard Vite + React plugin config
├── .eslintrc.cjs                    # ESLint config — public/without_context_api is excluded (see §8)
├── public/
│   ├── vite.svg
│   └── without_context_api/         # ★ The BEFORE version (prop drilling), kept for comparison
│       ├── App.jsx                  #   App passes count down as a prop
│       └── components/
│           ├── Navbar.jsx           #   receives count only to forward it
│           ├── Button.jsx           #   receives count only to forward it
│           └── Component1.jsx       #   finally displays count
└── src/                             # ★ The AFTER version (Context API) — this is what runs
    ├── main.jsx                     # ReactDOM.createRoot + <App/> in StrictMode
    ├── App.jsx                      # Owns count state; wraps tree in counterContext.Provider
    ├── App.css                      # Layout + component styles (signal map, tree cards, buttons)
    ├── index.css                    # Design tokens (color/spacing/type) + global reset
    ├── assets/react.svg             # Unused by the redesigned UI, left in place
    ├── context/
    │   └── context.js               # createContext(null) → counterContext, + useCounter() hook
    └── components/
        ├── Navbar.jsx               # No props, no context — pure structure
        ├── Button.jsx                # useCounter() → reads count, calls setCount from depth 2
        ├── Component1.jsx            # useCounter() → reads count at depth 3
        └── SignalMap.jsx             # New: the schematic "wire skips Navbar" visualization
```

Two things to notice about this layout:

- **`public/without_context_api/` is the BEFORE snapshot.** It is *not* imported or executed by the app — it's the original prop-drilling implementation, deliberately parked in `public/` so you can open the two versions side by side and diff them. (Aside: `public/` is normally for static assets that Vite copies verbatim into the build; stashing source files here is purely a teaching convenience.) It is excluded from `npm run lint` (see §8) because it's a frozen reference, not runnable/lintable code — its relative imports (`./assets/react.svg`, `./App.css`) don't even resolve inside `public/`.
- **`our app.md` is an extra note file** — a four-line sketch of the component nesting used in this lecture, quoted verbatim in §4.

---

## 6. Concept Deep-Dive: Prop Drilling vs. Context — Side by Side

All snippets below are the **actual, verbatim source** currently in this project.

### 6.1 The root: `App.jsx`

**BEFORE — `public/without_context_api/App.jsx` (prop drilling):**

```jsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Navbar count={count}/>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
```

Key line: `<Navbar count={count}/>` — the drilling starts here, and *only* `count` is passed. The deep children can display the value but have **no way to change it** (passing `setCount` too would mean drilling a *second* prop through every layer).

**AFTER — `src/App.jsx` (Context Provider, redesigned UI):**

```jsx
import { useMemo, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import SignalMap from './components/SignalMap'
import { counterContext } from './context/context'

function App() {
  const [count, setCount] = useState(0)

  // Memoize the Provider value. useContext consumers re-render whenever this
  // reference changes (by Object.is), and `{ count, setCount }` would
  // otherwise be a brand-new object on every App render — including
  // re-renders caused by state that has nothing to do with `count`. This
  // doesn't stop consumers from re-rendering when `count` itself changes
  // (that's the whole point), it just stops *unrelated* App re-renders from
  // also forcing every consumer to re-render.
  const value = useMemo(() => ({ count, setCount }), [count])

  return (
    <counterContext.Provider value={value}>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header__top">
            <div className="app-header__brand">
              <span className="app-header__mark" aria-hidden="true">◎</span>
              <div>
                <p className="eyebrow">React · useContext</p>
                <h1>Escaping prop drilling with Context</h1>
              </div>
            </div>

            <div className="app-header__controls">
              <div className="stat">
                <span className="stat__label">count</span>
                <span className="stat__value" aria-live="polite">{count}</span>
              </div>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setCount(0)}
              >
                Reset
              </button>
            </div>
          </div>

          <p className="app-header__lede">
            One counter, owned by <code>App</code>, read and updated three
            components deep &mdash; <code>Navbar &rarr; Button &rarr; Component1</code>
            &nbsp;&mdash; without a single prop passed through the middle.
          </p>
        </header>

        <main className="layout">
          <section className="panel panel--map" aria-labelledby="map-heading">
            <h2 id="map-heading">Signal map</h2>
            <p className="panel__hint">
              The gold wire runs straight from the Provider to every
              consumer. Watch <strong>Navbar</strong> &mdash; the wire arcs
              right over it.
            </p>
            <SignalMap />
          </section>

          <section className="panel panel--tree" aria-labelledby="tree-heading">
            <h2 id="tree-heading">Live component tree</h2>
            <p className="panel__hint">
              The actual rendered tree, nested exactly as deep as the diagram.
              Click the button at depth 2 and watch depth 3 update.
            </p>
            <Navbar />
          </section>
        </main>

        <footer className="app-footer">
          <p>
            Full write-up, before/after code, and pitfalls live in{' '}
            <code>README.md</code>.
          </p>
        </footer>
      </div>
    </counterContext.Provider>
  )
}

export default App
```

Key changes versus the original Context version:

- `<Navbar/>` still takes **zero props** — that part of the lesson is unchanged.
- The whole UI is wrapped in `<counterContext.Provider value={value}>`, where `value` is `useMemo`-ized from `{count, setCount}` — an object holding both the state and its setter, so deep descendants can read *and* update the counter, without handing every unrelated App re-render a fresh object identity.
- The generic Vite boilerplate (spinning logos, "Edit src/App.jsx" card) is gone, replaced by the header stat/reset controls and the two teaching panels described in §3.

### 6.2 The context itself: `src/context/context.js`

There is no *before* counterpart for this file — it only exists in the Context version. This is the file that changed the most in this pass:

```js
import { createContext, useContext } from "react";

/**
 * counterContext carries `{ count, setCount }` down to any descendant, no
 * matter how deeply nested, without prop drilling.
 *
 * Why the default is `null` and not `0`:
 * `createContext(0)` type-matches nothing — the Provider always supplies an
 * OBJECT (`{ count, setCount }`), so a bare number default is a trap: the
 * moment a consumer renders outside the Provider, `value` would be `0` and
 * `value.setCount` would throw "setCount is not a function". `null` is an
 * honest sentinel for "no Provider was found above me", and `useCounter()`
 * below turns that sentinel into a safe fallback instead of a crash.
 */
export const counterContext = createContext(null);

// Frozen so nobody can accidentally mutate the fallback in place.
const FALLBACK_VALUE = Object.freeze({
  count: 0,
  setCount: () => {
    if (import.meta.env?.DEV) {
      console.warn(
        "[counterContext] setCount() was called with no <counterContext.Provider> " +
          "above this component, so the update was ignored. Wrap the tree in the " +
          "Provider — see src/App.jsx."
      );
    }
  },
});

/**
 * useCounter — the one sanctioned way to read the counter context.
 *
 * Consumers never call useContext(counterContext) directly; they call this
 * hook instead. That gives us one place to guard against the "forgot the
 * Provider" pitfall: rather than handing back `null` and letting every
 * consumer independently crash on `value.count` / `value.setCount(...)`,
 * missing-Provider renders get a harmless read-only fallback plus a loud
 * dev-time warning, so the failure is visible without taking the UI down.
 */
export function useCounter() {
  const value = useContext(counterContext);
  return value ?? FALLBACK_VALUE;
}
```

- `createContext(defaultValue)` returns a **context object** with a `.Provider` component attached.
- The default value used to be `0`, mismatching the object shape the Provider actually supplies. It is now `null` — a sentinel that means "nothing is providing this," not a stand-in value.
- `useCounter()` is the only way any component in this project reads the context. It resolves `useContext(counterContext) ?? FALLBACK_VALUE`, so a consumer accidentally rendered outside the Provider gets `{ count: 0, setCount: <no-op that warns> }` instead of crashing on `null.count`.
- The context object (and now the hook) is exported so the Provider (`App.jsx`) and every consumer import **the same identities** — that shared identity is how React matches consumers to providers, and how every consumer agrees on how to safely read the value.

### 6.3 The pass-through layer: `Navbar.jsx`

**BEFORE — `public/without_context_api/components/Navbar.jsx`:**

```jsx
import React from 'react'
import Button from './Button'

const Navbar = ({count}) => {
  return (
    <>
    <div>
      Navbar
    </div>
    <Button count={count}/>
    </>
  )
}

export default Navbar
```

`Navbar` never *uses* `count` — it exists in the signature purely to be forwarded to `Button`. This is prop drilling in its purest form.

**AFTER — `src/components/Navbar.jsx`:**

```jsx
import Button from './Button'

// Navbar is the pass-through layer. In the "before" version (see
// public/without_context_api/components/Navbar.jsx) this component had to
// accept a `count` prop it never used, purely to forward it to Button. Here
// it takes ZERO props and never touches counterContext — it is structurally
// between the Provider and the consumers, but data does not flow through it.
const Navbar = () => {
  return (
    <div className="tree-node tree-node--structural">
      <div className="tree-node__row">
        <span className="tree-node__depth">D1</span>
        <div className="tree-node__body">
          <p className="tree-node__name">Navbar</p>
          <p className="tree-node__meta">no props received &middot; no context read</p>
        </div>
      </div>
      <div className="tree-node__children">
        <Button />
      </div>
    </div>
  )
}

export default Navbar
```

The middleman is liberated: no props in, no props out — and now the UI says so explicitly ("no props received · no context read"), instead of leaving that fact implicit in the source.

### 6.4 The middle layer: `Button.jsx`

**BEFORE — `public/without_context_api/components/Button.jsx`:**

```jsx
import React from 'react'
import Component1 from './Component1'
const Button = ({count}) => {
  return (
    <div>
      <button><span><Component1 count={count}/></span>I am a button</button>
    </div>
  )
}

export default Button
```

Another forwarding hop — and notice this button has **no `onClick`**: with only `count` drilled down (not `setCount`), the deep button *cannot* update the state.

**AFTER — `src/components/Button.jsx`:**

```jsx
import { useCounter } from '../context/context'
import Component1 from './Component1'

// Button is two levels below App, yet it can both READ and UPDATE the
// counter — something the prop-drilled "before" version could not do,
// because only `count` was drilled down, never `setCount`.
const Button = () => {
  const { count, setCount } = useCounter()

  return (
    <div className="tree-node tree-node--consumer">
      <div className="tree-node__row">
        <span className="tree-node__depth">D2</span>
        <div className="tree-node__body">
          <p className="tree-node__name">Button</p>
          <p className="tree-node__meta">useContext(counterContext) &middot; read + write</p>
          <button
            type="button"
            className="btn btn--signal"
            onClick={() => setCount((c) => c + 1)}
          >
            Increment from depth 2
            <span className="btn__badge">{count}</span>
          </button>
        </div>
      </div>
      <div className="tree-node__children">
        <Component1 />
      </div>
    </div>
  )
}

export default Button
```

This is the payoff of putting `setCount` into the context value: a component **two levels deep can now update App's state** via `setCount((c) => c + 1)` — using the functional-updater form, which is the safe way to compute new state from previous state. Note `Component1` is now rendered as its own tree-node card (a sibling in the JSX, still logically nested under `Button`) rather than jammed inside the `<button>` element — a small accessibility/semantics cleanup, since a live counter readout doesn't belong inside a button's accessible name.

### 6.5 The leaf consumer: `Component1.jsx`

**BEFORE — `public/without_context_api/components/Component1.jsx`:**

```jsx
import React from 'react'

const Component1 = ({count}) => {
  return (
    <div>
     {count}
    </div>
  )
}

export default Component1
```

**AFTER — `src/components/Component1.jsx`:**

```jsx
import { useCounter } from '../context/context'

// Three levels below App, and it never received a single prop. It reaches
// straight past Navbar and Button to read the live value from the Provider.
const Component1 = () => {
  const { count } = useCounter()

  return (
    <div className="tree-node tree-node--consumer tree-node--leaf">
      <div className="tree-node__row">
        <span className="tree-node__depth">D3</span>
        <div className="tree-node__body">
          <p className="tree-node__name">Component1</p>
          <p className="tree-node__meta">useContext(counterContext) &middot; read only</p>
          <p className="tree-node__readout">
            <span className="tree-node__readout-label">count</span>
            <span className="tree-node__readout-value" aria-live="polite">
              {count}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Component1
```

`useCounter()` returns whatever the nearest enclosing `counterContext.Provider` passed as `value` — here, the `{count, setCount}` object — so the leaf reads `count` directly (destructured, not `value.count`, now that `useCounter()` already unwraps the context for you). Zero props travelled through `Navbar` or `Button` to make this happen.

### 6.6 New: the visualization layer, `SignalMap.jsx`

This file has no *before* counterpart and no analogue in the original lecture — it's the piece that makes §6.3–6.5's claims visible instead of just readable:

```jsx
import { useEffect, useState } from 'react'
import { useCounter } from '../context/context'

// Static description of the tree — this is presentational, it mirrors the
// real nesting in App -> Navbar -> Button -> Component1 but doesn't render
// those components itself. `connected: true` marks the nodes that actually
// call useCounter() (App is the Provider, so it's "connected" by definition).
const NODES = [
  { id: 'app', x: 70, label: 'App.jsx', depth: 'D0', role: 'Provider', note: 'owns state, createContext.Provider', connected: true },
  { id: 'navbar', x: 290, label: 'Navbar.jsx', depth: 'D1', role: 'Pass-through', note: 'no props, no context', connected: false },
  { id: 'button', x: 510, label: 'Button.jsx', depth: 'D2', role: 'Consumer', note: 'useContext, read + write', connected: true },
  { id: 'component1', x: 730, label: 'Component1.jsx', depth: 'D3', role: 'Consumer', note: 'useContext, read only', connected: true },
]

const Y = 150

// The gold "context wire" arcs up and over Navbar's position, then runs down
// into Button and across to Component1 — a literal picture of "the value
// skips the middleman" instead of hopping through it.
const WIRE_PATH = 'M70,130 C160,40 220,40 290,40 C360,40 420,130 510,130 L730,130'

const SignalMap = () => {
  const { count } = useCounter()
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    setPulsing(true)
    const timer = setTimeout(() => setPulsing(false), 650)
    return () => clearTimeout(timer)
  }, [count])

  return (
    <div className="signal-map">
      <svg
        className="signal-map__svg"
        viewBox="0 0 800 190"
        role="img"
        aria-label={`Component tree diagram. App provides the count. Navbar is a structural pass-through with no wire. Button and Component1 read the live value, currently ${count}, directly from the Provider.`}
      >
        <line x1="70" y1={Y} x2="730" y2={Y} className="signal-map__structural" />
        <path
          d={WIRE_PATH}
          className={`signal-map__wire${pulsing ? ' is-pulsing' : ''}`}
        />
        {NODES.map((node) => (
          <g key={node.id} transform={`translate(${node.x}, ${Y})`}>
            <circle
              r={node.id === 'app' ? 20 : 16}
              className={[
                'signal-map__node',
                node.connected ? 'is-live' : 'is-idle',
                pulsing && node.connected ? 'is-pulsing' : '',
              ].join(' ').trim()}
            />
          </g>
        ))}
      </svg>

      <ol className="signal-map__legend">
        {NODES.map((node) => (
          <li
            key={node.id}
            className={`signal-map__item${node.connected ? ' is-live' : ' is-idle'}`}
          >
            <span className="signal-map__depth">{node.depth}</span>
            <span className="signal-map__label">{node.label}</span>
            <span className="signal-map__note">{node.note}</span>
          </li>
        ))}
      </ol>

      <p className="signal-map__value">
        live value carried by the wire: <strong>{count}</strong>
      </p>
    </div>
  )
}

export default SignalMap
```

`SignalMap` itself calls `useCounter()` too — it's a fifth consumer, proving the point again: it lives beside `Navbar` in `App.jsx` (depth 1, a sibling, not a descendant of `Navbar`/`Button`/`Component1` at all), and it still gets the live value with zero props, because Context reach depends on **position in the Provider's subtree**, not on any particular parent-child relationship.

### 6.7 The pattern in three steps

| Step | API | Where in this project |
|---|---|---|
| 1. **Create** | `createContext(defaultValue)` | `src/context/context.js` → `export const counterContext = createContext(null)` |
| 2. **Provide** | `<counterContext.Provider value={value}>` | `src/App.jsx`, wrapping the whole returned tree, `value` built with `useMemo` |
| 3. **Consume** | `const { count, setCount } = useCounter()` | `src/components/Button.jsx`, `Component1.jsx`, `SignalMap.jsx` |

---

## 7. Full Code Walkthrough

### 7.1 Bootstrapping (shared by both versions)

**`index.html`** — Vite's entry point. The browser loads this file, which mounts an empty `<div id="root">` and pulls in the React entry module:

```html
<!doctype html>
<html lang="en" style="color-scheme: dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0a0d13" />
    <title>useContext — escaping prop drilling</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`color-scheme: dark` on `<html>` and a matching `theme-color` meta tag were added so the browser chrome (scrollbars, form control theming, mobile status bar) matches the app's dark schematic surface instead of defaulting to light.

**`src/main.jsx`** — creates the React root and renders `<App/>` inside `StrictMode` (which double-invokes renders in development to surface impure code — a reason you may see effects/logs fire twice in dev). Unchanged by this pass:

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

**`package.json`** — a stock Vite 5 + React 18 setup named `video-116`, dependencies unchanged (only existing deps and plain CSS were used for the redesign — no new packages):

```json
{
  "name": "video-116",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "eslint": "^8.56.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "vite": "^5.1.0"
  }
}
```

### 7.2 Walkthrough: the BEFORE version (prop drilling)

Trace `count`'s journey through `public/without_context_api/` (all code shown verbatim in §6):

1. **`App.jsx`** — `useState(0)` creates `count`/`setCount`. The Vite-template button in App can update it (`onClick={() => setCount((count) => count + 1)}`). To let the navbar subtree *display* it, App renders `<Navbar count={count}/>`.
2. **`components/Navbar.jsx`** — destructures `({count})` from props and immediately re-emits it: `<Button count={count}/>`. Pure forwarding; hop 1.
3. **`components/Button.jsx`** — destructures `({count})` and forwards again: `<Component1 count={count}/>`. Hop 2. Its `<button>` has no click handler — it *can't* update state, because `setCount` was never drilled down.
4. **`components/Component1.jsx`** — destructures `({count})` and finally renders `{count}`. Hop 3 — destination reached.

**Cost accounting:** 1 value × 3 hops = 3 prop declarations + 3 prop forwards, in components that don't use the value. Every extra shared value multiplies this. (Also note: these files import paths like `./assets/react.svg` and `./App.css` that don't exist inside `public/` — this copy is a frozen reference snapshot, not runnable code, which is why it's excluded from `npm run lint` too — see §8.)

### 7.3 Walkthrough: the AFTER version (Context API, redesigned)

Trace the same value through `src/`:

1. **`context/context.js`** — `createContext(null)` builds the `counterContext` object; `useCounter()` wraps `useContext(counterContext)` with a safe fallback. This file is the single source of the context's *identity* and its *safe-access contract*.
2. **`App.jsx`** — still owns the state via `useState(0)` (Context does **not** replace `useState` — it replaces the *delivery mechanism*). App wraps its output in `<counterContext.Provider value={value}>` (a `useMemo`-ized `{count, setCount}`), publishing both the value and the updater to every descendant. `<Navbar/>` is rendered prop-less; so is `<SignalMap/>`.
3. **`components/Navbar.jsx`** — completely context-unaware. Renders a labeled card and `<Button/>`. It neither imports the context nor handles any props.
4. **`components/Button.jsx`** — calls `const { count, setCount } = useCounter()` and wires `onClick={() => setCount((c) => c + 1)}`. Clicking "Increment from depth 2" updates state that lives in App — and every consumer on screen (the header stat, the signal map, Button's own badge, and Component1's readout) changes in lockstep, because they all render the same state.
5. **`components/Component1.jsx`** — calls `useCounter()` and renders `{count}` inside its own card, at depth 3.
6. **`components/SignalMap.jsx`** — also calls `useCounter()`, purely to read the live value for its `aria-label` and on-screen readout, and to know when to re-trigger the pulse animation.

**Runtime behavior:** click the header's Reset, or Button's "Increment from depth 2" — both call the same `setCount`, App re-renders, the Provider's `value` becomes a fresh memoized object (only when `count` changed), and every consumer (`Button`, `Component1`, `SignalMap`) re-renders with the new count while `Navbar` — which never subscribed — does not re-render for context reasons at all. One state, one source of truth, many consumers, one component structurally in between that's untouched by any of it.

---

## 8. Key Takeaways and Pitfalls

### Key takeaways

1. **Prop drilling** = forwarding props through components that don't use them. It's a smell that grows with tree depth.
2. Context is a **3-step pattern**: `createContext` (once, in its own module) → `<Context.Provider value={...}>` (at the owner) → a `useContext`-based hook (at every consumer).
3. Context **transports** state; it doesn't own it. The state still lives in `useState` inside `App`.
4. Put **both the value and its setter** in the `value` object (`{count, setCount}`) so deep descendants can update the state — something the drilled version here couldn't do.
5. Consumers use the **nearest Provider above them**; the `createContext(defaultValue)` argument applies only when there is no Provider at all.
6. Intermediate components (`Navbar`) become **cleaner and more reusable** because they stop carrying data that isn't theirs.
7. Context reach is about **position in the tree**, not parent/child relationships — `SignalMap` proves this by sitting beside `Navbar`, not inside it, and still reading live state.

### Pitfalls (and how this project now handles each one)

- **Every consumer re-renders on every context change.** When `value` changes (by `Object.is` comparison), *all* components calling the context hook re-render — even if they only use a part of the value that didn't change. `value={{count, setCount}}` used to build a **new object on every App render**, so consumers would re-render whenever App did, regardless of whether `count` changed. **Fixed here:** `App.jsx` now wraps the value in `useMemo(() => ({ count, setCount }), [count])`, so the object identity is stable across App re-renders that don't touch `count`. This doesn't (and can't) stop consumers from re-rendering when `count` *does* change — that's the whole point of Context — but it removes the "new object for no reason" tax. In bigger apps, go further: split contexts (state vs. dispatch) or move to a store with selectors.
- **Missing Provider → default value, and often a crash.** In the original code, removing the Provider from `App.jsx` made `useContext(counterContext)` return the default `0`; then `value.count` was `undefined` (blank UI), and clicking the button threw `TypeError: value.setCount is not a function` — a number has no `setCount`. **Fixed here:** the default is `createContext(null)`, and `useCounter()` (`src/context/context.js`) resolves `useContext(counterContext) ?? FALLBACK_VALUE`, where `FALLBACK_VALUE` is a real `{count: 0, setCount: <warns, no-ops>}` object matching the Provider's shape. A consumer rendered without a Provider now degrades gracefully (shows `0`, ignores writes, logs a dev-only warning) instead of throwing. Try it yourself: temporarily delete `<counterContext.Provider ...>` and its closing tag from `src/App.jsx` (keep the children) — `Button` and `Component1` will show `0` and the console will warn on click, with no crash.
- **Consumers must be *inside* the Provider.** A component rendered as a sibling of (or above) the Provider gets the fallback value, not the provided one. Note how `App.jsx` opens the Provider before `<div className="app-shell">` and closes it after everything, so the header stat, both panels, and every card are all inside it.
- **One shared context object.** The Provider and every consumer must import the *same* exported `counterContext` (indirectly, via `useCounter`). Calling `createContext` again elsewhere creates a different, unrelated context that will silently hand out the fallback.
- **Don't make everything context.** Global-feeling code is harder to trace and test; components that read context are implicitly coupled to their ancestors. This project uses exactly one context for exactly one cross-cutting value — that's a feature, not an oversight.

### Practice exercises

1. **Break it on purpose:** delete the `<counterContext.Provider>` wrapper (keep its children) in `src/App.jsx`. Predict what `Component1` shows and what happens when you click "Increment from depth 2" — then run it and check your prediction against the Pitfalls section above. Restore the Provider afterwards.
2. **Add a second context:** create `themeContext` in `src/context/context.js` holding `{theme, setTheme}` (`"light"`/`"dark"`). Provide it from `App`, consume it in `Navbar` to render the current theme name, and add a toggle button in `Button`. (`Navbar` currently reads neither props nor context — this exercise is the first thing that would change that.)
3. **Add a decrement:** give `Component1` its own "-1" button using `setCount((c) => c - 1)` (via `useCounter()`). Confirm the header's count and the signal map stay in sync.
4. **Observe the re-renders:** add `console.log("Navbar render")`, `console.log("Button render")`, `console.log("Component1 render")`, `console.log("SignalMap render")` at the top of each component. Click the button and explain, from the logs, which components re-render and why (remember StrictMode double-invokes renders in dev, and that `Navbar` should log far less than the others).
5. **Harden it further:** the current `useCounter()` *silently* falls back when there's no Provider (safe, but easy to miss in development). Add a stricter variant — e.g. a `useCounter({ strict: true })` option, or a separate `useStrictCounter()` — that throws `new Error("useCounter must be used within <counterContext.Provider>")` instead of falling back, and use it in one component to see the difference between "fail loud" and "fail safe" API design.

---

## 9. When to Use What: Context vs. Props vs. State Managers

| Tool | Best for | Reach | Caveats |
|---|---|---|---|
| **Props** | Data a *direct child* needs; anything local and shallow (1–2 levels) | Parent → child only | Gets painful past ~2–3 forwarding levels (prop drilling) |
| **Context API** | "Ambient" data many components at many depths need: theme, auth/user, locale, current app-wide counter/cart | Provider's entire subtree | Every consumer re-renders when `value` changes; no built-in selectors, devtools, or middleware |
| **State managers** (Redux, Zustand, Jotai, ...) | Large apps: complex/frequently-updated shared state, cross-cutting update logic, time-travel debugging, fine-grained subscriptions | Whole app | Extra dependency, boilerplate, and concepts to learn |

Rules of thumb:

- **Start with props.** They are explicit, typeable, and easiest to trace. Don't reach for Context to save one hop.
- **Consider composition first.** Sometimes passing *components* as `children` removes the middle layers without any context at all.
- **Reach for Context** when a value is genuinely *tree-wide* and read in many scattered places — exactly the theme/auth/locale shape. This lecture's counter is a minimal stand-in for those.
- **Reach for a state manager** when context values change *often* and re-render cost bites, when you need derived/selected slices of state, or when update logic outgrows "call the setter."
- These compose: real apps commonly use props for local wiring, a few Contexts for ambient values, and a store for heavy shared state.

---

## 10. How to Run

From the project folder (`Lec-116 useContext Hook React`):

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`). You'll see the header (title, live count, Reset), the Signal Map panel (the gold wire arcing over Navbar), and the Live Component Tree panel (the actual nested Navbar → Button → Component1 cards) — click "Increment from depth 2" and watch the header, the map, and the tree update together.

Other available scripts:

```bash
npm run build     # production build (verified: builds cleanly, ~150 kB JS / ~8 kB CSS before gzip)
npm run preview   # serve the production build locally
npm run lint      # ESLint — verified: 0 errors, 0 warnings against src/
```

> The `public/without_context_api/` files are reference-only and are **not** part of the running app, and are excluded from `npm run lint` — compare them side by side with `src/` in your editor.

---

## 11. Appendix: Original Vite Template Notes

The original boilerplate `README.md` that shipped with this template, preserved verbatim:

> # React + Vite
>
> This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
>
> Currently, two official plugins are available:
>
> - [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
> - [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
