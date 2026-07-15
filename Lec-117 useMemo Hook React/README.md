# Lec-117: The `useMemo` Hook in React — Memoization & Expensive Re-computation

> **Course folder:** `Lec-117 useMemo Hook React` · **Stack:** Vite 5 + React 18 · **Package name:** `video-117`

## Overview

Every time a React component's state or props change, **the entire function component runs again from top to bottom**. That's usually fine — most render logic is cheap. But what happens when your render body contains an **expensive computation**, like scanning a huge array to find one specific item?

Answer: that expensive work re-runs on **every single re-render**, even when the data it depends on hasn't changed at all. Click an unrelated button → component re-renders → the scan runs again → the UI feels sluggish.

**Memoization** is the fix. Memoization means *"cache the result of a computation, and only recompute it when its inputs change."* React ships this capability as the **`useMemo`** hook:

```js
const memoizedValue = useMemo(() => computeSomethingExpensive(a, b), [a, b])
```

This lecture's demo — **useMemo Lab** — turns that idea into an instrument panel: a linear scan over a configurable multi-million-element array, wired to a mode switch (**Memoized** vs **Naive**), a set of controls that force *unrelated* re-renders (a manual pulse, an ambient clock, an optional animation stress test), and a live readout — render count, recompute count, cache-hit rate, per-scan timing, and a scrolling waveform strip — so you can *watch* `useMemo` skip the expensive work instead of just being told it does.

---

## What You'll Learn

- Why a React function component **re-executes its whole body** on every state update.
- What an **expensive computation** looks like in practice (a linear scan with real per-item cost).
- What **memoization** is and how `useMemo(fn, deps)` implements it.
- The **`useMemo` signature**: the create function, the dependency array, and the cached return value.
- **Dependency array semantics** — when React recomputes vs. when it returns the cached value.
- **Referential equality** (`Object.is`) — why replacing the dataset with a *new* array triggers a recompute, while unrelated state updates (a pulse click, a clock tick, an animation frame) do not.
- How to **measure** the effect yourself with `performance.now()` instead of taking it on faith.
- How `useMemo` differs from **`useCallback`** and **`React.memo`**.
- When *not* to reach for `useMemo` (premature optimization).
- Common pitfalls: wrong/missing dependencies, memoizing cheap values, unguarded `Array.prototype.find` results, loose equality, and heavy work at module scope.

---

## Project Structure

```
Lec-117 useMemo Hook React/
├── index.html               # Vite entry HTML — mounts <div id="root">, loads /src/main.jsx
├── package.json              # Scripts (dev/build/lint/preview) + React 18 / Vite 5 deps
├── .eslintrc.cjs              # ESLint config (react, react-hooks, react-refresh)
├── README.md                  # ← These lecture notes
├── public/
│   └── vite.svg                # Static asset served at /vite.svg (favicon)
└── src/
    ├── main.jsx                # ReactDOM.createRoot → renders <App /> in StrictMode
    ├── App.jsx                 # ★ The useMemo Lab demo (all lecture logic lives here)
    ├── App.css                 # Instrument-panel theme: dark canvas, cyan/green/amber tokens
    ├── index.css                # Global reset + base font stack
    └── assets/
        └── react.svg              # Unused legacy asset (kept for reference, not imported anymore)
```

> `node_modules/` and `package-lock.json` exist but are irrelevant to the lesson.

---

## Concept Deep-Dives (with the actual demo code)

### 1. Nothing expensive happens at module scope

The previous version of this demo built a **30,000,000-element array** at the top of `App.jsx`, *outside* the component, which ran the instant the module was imported — before React had rendered anything. That delayed the very first paint.

This version builds nothing until the component actually renders, and only rebuilds when a control that's supposed to trigger it is used:

```js
const DATASET_PRESETS = [
  { id: 'light', label: 'Light', size: 500_000, feel: 'barely felt' },
  { id: 'medium', label: 'Medium', size: 2_000_000, feel: 'a small hitch' },
  { id: 'heavy', label: 'Heavy', size: 6_000_000, feel: 'unmistakable lag' },
]
```

`DATASET_PRESETS` is just metadata (three small objects) — cheap at module scope. The actual multi-million-element array is built **lazily, inside `useMemo`, inside the component** (see §3). The initial paint is instant regardless of which preset you eventually pick.

### 2. What "expensive" means here — a deliberate per-item cost

```js
const WORK_ITERATIONS = 40

function churn(seed) {
  let x = seed | 0
  for (let i = 0; i < WORK_ITERATIONS; i++) {
    x = (Math.imul(x, 1103515245) + 12345) | 0
  }
  return x
}
```

`churn` is a stand-in for real per-item work — parsing, hashing, formatting, whatever your actual expensive predicate does. It exists so the scan's cost is **controllable** (tunable via `WORK_ITERATIONS` and the dataset size) instead of being at the mercy of how aggressively a given JS engine can optimize a bare property comparison. Measured with this repo's dataset sizes, a full scan costs roughly:

| Preset | Size | Typical scan time* |
|---|---|---|
| Light | 500,000 | ~10 ms |
| Medium | 2,000,000 | ~40 ms |
| Heavy | 6,000,000 | ~120–150 ms |

\* Measured with `performance.now()` on a typical dev machine; your numbers will vary. That's the point — **the demo measures itself**, it doesn't ask you to trust a claim.

### 3. Building the haystack — lazily, inside `useMemo`

```js
function buildDataset(size, nonce) {
  const jitter = (nonce % 5) * 0.01
  const magicIndex = Math.max(0, Math.floor(size * (0.9 + jitter)) - 1)
  const data = new Array(size)
  for (let i = 0; i < size; i++) {
    data[i] = { index: i, isMagical: i === magicIndex }
  }
  return data
}
```

- The "magical" item sits **near the tail** (90–94% through the array, nudged by `nonce`) so a linear scan pays almost the full cost — that's the whole point of the demo.
- `nonce` isn't decorative: it's a real dependency. Clicking **Regenerate Dataset** bumps a `datasetNonce` state value, which both (a) shifts the magic position slightly so the array is genuinely different each time, and (b) — more importantly — produces a **new array reference**, which is exactly what `useMemo`'s dependency check reacts to.

This function itself is only ever called from inside a `useMemo`:

```js
const { dataset, buildMs } = useMemo(() => {
  const start = performance.now()
  const data = buildDataset(datasetSize, datasetNonce)
  return { dataset: data, buildMs: performance.now() - start }
}, [datasetSize, datasetNonce])
```

Building the array is *itself* an expensive operation (allocating millions of objects), so it gets the same treatment as the "real" lesson computation below: cached, and only redone when its own dependencies (`datasetSize`, `datasetNonce`) change — never on an unrelated render.

### 4. The expensive computation — a guarded, deliberately linear scan

```js
function findMagicalItem(dataset) {
  for (let i = 0; i < dataset.length; i++) {
    const item = dataset[i]
    churn(item.index)
    if (item.isMagical === true) return item
  }
  return undefined
}
```

Two things worth calling out:

- **`item.isMagical === true`** — strict equality. The original version of this demo used `count == 10` (loose equality) elsewhere; every comparison in this codebase now uses `===`.
- **`return undefined`** if nothing matches — and every caller is required to handle that. `Array.prototype.find` returns `undefined` on a miss; treating its result as always-truthy is a real bug waiting to happen. This demo guards it explicitly in the JSX (§8).

### 5. The mode switch — `useMemo` vs. the naive path, side by side

```js
const memoCountBefore = memoComputeCount.current
const memoized = useMemo(() => {
  memoComputeCount.current += 1
  const start = performance.now()
  const result = findMagicalItem(dataset)
  return { result, ms: performance.now() - start }
}, [dataset])
const memoDidRecompute = memoComputeCount.current !== memoCountBefore

let active
let recomputedThisRender
if (memoEnabled) {
  active = memoized
  recomputedThisRender = memoDidRecompute
} else {
  naiveComputeCount.current += 1
  const start = performance.now()
  const result = findMagicalItem(dataset)
  active = { result, ms: performance.now() - start }
  recomputedThisRender = true
}
```

This is the heart of the lesson, and it's structured so you can flip a switch and watch the difference rather than edit code and reload:

- The `useMemo` call always runs (hooks can't be conditional) — but its **factory** only re-executes when `[dataset]` changes by reference. `memoCountBefore`/`memoDidRecompute` detect, on every single render, whether that factory *actually ran this time* or whether `useMemo` just handed back the cached value.
- When **Memoized** mode is on, the UI shows `memoized` — the cached result. Clicking Pulse, watching the clock tick, or running the animation stress test does **not** touch `findMagicalItem` again.
- When **Naive** mode is on, `findMagicalItem` is called directly in the render body — **every render**, unconditionally. This is the "before" picture: the same expensive scan, now paying its full cost on every unrelated re-render.

Because both branches increment their own counter (`memoComputeCount` vs. `naiveComputeCount`), the stats panel can show you exactly how many times the scan *actually ran* under each mode — not a guess, a count.

### 6. Referential equality — proven by "Regenerate Dataset," not by chance

`useMemo`'s dependency check is `Object.is` (effectively `===`) on each entry in the array, **not** a deep comparison:

- **Pulse / clock / animation clicks:** none of them touch `dataset`. It's the same array reference as last render, so `Object.is(prevDataset, dataset)` is `true` → the memoized path returns the cached value → `findMagicalItem` does not run.
- **Regenerate Dataset / changing the size preset:** both change an input to the `useMemo` that builds `dataset` (`datasetNonce` or `datasetSize`), so a **new array** is built with a **new reference** → `Object.is` is `false` → both the array *and* (in Memoized mode) `magical` legitimately recompute.

Two consequences worth internalizing:

1. Mutating an array in place would **not** trigger a recompute — same reference. State must be replaced immutably, as `buildDataset` does (it always returns a fresh array).
2. Creating a new array/object as a dependency on *every* render would make `useMemo` useless — the dependency would "change" every time. Keep dependencies stable (state, props, other memoized values).

### 7. Measuring instead of asserting

```js
const renderStartedAt = performance.now()
// … all hooks and computation …
const totalRenderMs = performance.now() - renderStartedAt
```

Because JavaScript is single-threaded, by the time the function reaches its `return`, every synchronous computation for *this* render — including `findMagicalItem` if it ran — has already finished. So `totalRenderMs` is an accurate, self-contained measurement of this render's cost, computed fresh every render with no extra state and no risk of a render loop.

The FPS readout during the animation stress test works the same way, just across renders instead of within one:

```js
let fps = null
if (animate && prevRenderAtRef.current !== null) {
  const delta = renderStartedAt - prevRenderAtRef.current
  if (delta > 0) fps = Math.min(999, Math.round(1000 / delta))
}
prevRenderAtRef.current = renderStartedAt
```

Turn on **Run Animation Stress Test** (which drives a `requestAnimationFrame` loop, aiming for ~60 renders/sec) while in **Naive** mode on the **Heavy** preset, and the FPS readout will crater — a ~150 ms scan on every frame caps you at roughly 6–7 fps. Switch to **Memoized** with the same settings and it snaps back to a smooth, uncapped frame rate. That contrast is the entire lecture, measured, not asserted.

### 8. Guarding `undefined` — the found item might not exist

```jsx
{active.result ? (
  <p className="signal__value">
    Magical index <strong>{active.result.index.toLocaleString()}</strong>
  </p>
) : (
  <p className="signal__value signal__value--empty">
    No magical item in this dataset — try regenerating.
  </p>
)}
```

`findMagicalItem` can return `undefined` (it always finds a match with this demo's own presets, but nothing about the function's contract *guarantees* that — the guard exists so the assumption is enforced in code, not just true by construction). Reading `.index` off a possibly-`undefined` value would otherwise throw and take the whole UI down.

### 9. Render count, recompute count, and cache-hit rate

```js
const recomputeCount = memoEnabled ? memoComputeCount.current : naiveComputeCount.current
const hitRate =
  renderCount.current > 0
    ? Math.round(((renderCount.current - recomputeCount) / renderCount.current) * 100)
    : 0
```

`renderCount`, `memoComputeCount`, `naiveComputeCount`, and the waveform's `traceRef` are all `useRef`s **mutated during render**. That's intentional and called out in a comment in the source — it's deliberately-impure instrumentation written *only* to make the lesson visible, not a pattern to copy into production code (real render bodies should stay pure). A **Reset Session Stats** button (`handleResetStats`) zeroes all of it back out so you can re-run a clean comparison.

> **Dev-mode note:** `main.jsx` wraps `<App />` in `<React.StrictMode>`, which double-invokes render in development to surface impure code — exactly the kind of thing these instrumentation refs are guilty of! Expect the raw counts to run roughly 2× what a production build would show. The **ratio** between renders and recomputes (and the dramatically different cache-hit percentage between Memoized and Naive mode) is what matters, not the raw numbers — the footer says so, in the running app.

### 10. The waveform — a signature readout

```jsx
function Waveform({ trace }) {
  return (
    <div className="waveform" role="img" aria-label="…">
      {trace.map((entry) => (
        <span
          key={entry.id}
          className={`waveform__bar waveform__bar--${entry.recomputed ? 'hot' : 'cool'}`}
          style={{ height: `${entry.recomputed ? Math.min(100, 14 + entry.ms) : 6}%` }}
          title={entry.recomputed ? `Recomputed in ${formatMs(entry.ms)}` : 'Cache hit — skipped the scan'}
        />
      ))}
    </div>
  )
}
```

Every render appends one bar to a capped, scrolling trace (`TRACE_LENGTH = 60`, each entry keyed by a stable incrementing id so React reuses the right DOM node rather than reinterpreting index positions as new bars). A short green bar means "this render didn't touch the scan." A tall amber bar — height scaled by the actual measured duration — means "this render paid full price." Flip the mode switch mid-session and watch the trace visibly change color and height, live.

---

## Full Code Walkthrough — `src/App.jsx`

```jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
```

- `useEffect` drives the ambient clock and the optional animation loop; `useMemo` builds the dataset and caches the scan result; `useRef` holds the render/recompute counters and the waveform trace; `useState` holds every piece of user-facing state (preset, mode, pulse, clock, animate, frame tick, reset tick).

```jsx
const DATASET_PRESETS = [ /* … */ ]
const WORK_ITERATIONS = 40
const TRACE_LENGTH = 60

function churn(seed) { /* … */ }
function buildDataset(size, nonce) { /* … */ }
function findMagicalItem(dataset) { /* … */ }
function formatMs(ms) { /* … */ }
```

- Module-scope, but cheap: three small preset objects and five small pure functions. No megabyte-scale work happens until a function is *called*, and every call site is inside the component (directly, or inside a `useMemo` factory).

```jsx
function StatCard({ label, value, sublabel, tone }) { /* … */ }
function Waveform({ trace }) { /* … */ }
```

- Small presentational components local to this file. `tone` (`'cool'` | `'hot'` | `undefined`) drives the green/amber semantic coloring shared across the mode switch, the stat cards, and the waveform bars.

```jsx
function App() {
  const renderStartedAt = performance.now()

  const [presetId, setPresetId] = useState('light')
  const [datasetNonce, setDatasetNonce] = useState(0)
  const [memoEnabled, setMemoEnabled] = useState(true)
  const [pulse, setPulse] = useState(0)
  const [clock, setClock] = useState(() => new Date())
  const [animate, setAnimate] = useState(false)
  const [frameTick, setFrameTick] = useState(0)
  const [resetTick, setResetTick] = useState(0)
```

- `presetId` / `datasetNonce` — the *real* dependency of the lesson's `useMemo`, indirectly (via the `dataset` they produce).
- `memoEnabled` — the mode switch (Memoized vs. Naive).
- `pulse`, `clock`, `animate`/`frameTick` — three independent, unrelated re-render sources, on purpose. `clock` uses a **lazy initializer** (`() => new Date()`) so `new Date()` isn't constructed on every render, only the first.
- `resetTick` — bumped to force the stats panel to visually reset; also used as `key={resetTick}` on the stat grid.

```jsx
  const preset = DATASET_PRESETS.find((p) => p.id === presetId) ?? DATASET_PRESETS[0]
  const datasetSize = preset.size
```

- Guarded `find`: if `presetId` somehow didn't match anything, `?? DATASET_PRESETS[0]` falls back instead of leaving `preset` (and therefore `datasetSize`) `undefined`.

```jsx
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!animate) return undefined
    let frameId
    const tick = () => {
      setFrameTick((t) => t + 1)
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [animate])
```

- The clock effect runs once (`[]`) and cleans up its interval on unmount.
- The animation effect only runs its `requestAnimationFrame` loop while `animate` is `true`, and always cancels the in-flight frame on cleanup — toggling the stress test off mid-flight can't leak a runaway loop.

```jsx
  const { dataset, buildMs } = useMemo(() => {
    const start = performance.now()
    const data = buildDataset(datasetSize, datasetNonce)
    return { dataset: data, buildMs: performance.now() - start }
  }, [datasetSize, datasetNonce])
```

- The haystack, built lazily and re-built only when its own two dependencies change. See §3 above.

```jsx
  const renderCount = useRef(0)
  const memoComputeCount = useRef(0)
  const naiveComputeCount = useRef(0)
  const traceRef = useRef([])
  const traceIdRef = useRef(0)
  const prevRenderAtRef = useRef(null)

  renderCount.current += 1

  const memoCountBefore = memoComputeCount.current
  const memoized = useMemo(() => {
    memoComputeCount.current += 1
    const start = performance.now()
    const result = findMagicalItem(dataset)
    return { result, ms: performance.now() - start }
  }, [dataset])
  const memoDidRecompute = memoComputeCount.current !== memoCountBefore

  let active
  let recomputedThisRender
  if (memoEnabled) {
    active = memoized
    recomputedThisRender = memoDidRecompute
  } else {
    naiveComputeCount.current += 1
    const start = performance.now()
    const result = findMagicalItem(dataset)
    active = { result, ms: performance.now() - start }
    recomputedThisRender = true
  }
```

- The lesson's `useMemo` — `useMemo(() => findMagicalItem(dataset), [dataset])` in spirit, expanded here to also time itself and count its own executions. See §5.

```jsx
  traceIdRef.current += 1
  traceRef.current = [
    ...traceRef.current.slice(-(TRACE_LENGTH - 1)),
    { id: traceIdRef.current, ms: active.ms, recomputed: recomputedThisRender },
  ]

  const recomputeCount = memoEnabled ? memoComputeCount.current : naiveComputeCount.current
  const hitRate =
    renderCount.current > 0
      ? Math.round(((renderCount.current - recomputeCount) / renderCount.current) * 100)
      : 0

  let fps = null
  if (animate && prevRenderAtRef.current !== null) {
    const delta = renderStartedAt - prevRenderAtRef.current
    if (delta > 0) fps = Math.min(999, Math.round(1000 / delta))
  }
  prevRenderAtRef.current = renderStartedAt

  const totalRenderMs = performance.now() - renderStartedAt
```

- Every stat shown in the readout panel — trace, recompute count, hit rate, FPS, total render time — derived synchronously, in this same render, from measurements taken during it. See §7 and §9.

```jsx
  function handlePresetChange(id) { setPresetId(id) }
  function handleModeKeyDown(event) { /* Arrow-key roving between Memoized/Naive */ }
  function handlePresetKeyDown(event, index) { /* Arrow-key roving between presets */ }
  function handleRegenerate() { setDatasetNonce((n) => n + 1) }
  function handlePulse() { setPulse((p) => p + 1) }
  function handleResetStats() { /* zero every counter + traceRef, bump resetTick */ }
```

- All five state-changing handlers use plain, direct state updates (or the functional-updater form for counters, which is safe against batching). None of them reads a stale value out of a closure to decide what to do — the old version's array-swap button, which compared `count == 10` inside a closure that could observe a stale `count`, is gone entirely. Regenerating the dataset is now its own explicit, unambiguous action.

```jsx
  return (
    <div className="app">
      <header className="app__header">…</header>
      <main className="layout">
        <section className="panel controls" aria-label="Demo controls">…</section>
        <section className="panel readout" aria-label="Live readout">…</section>
      </main>
      <footer className="app__footer">…</footer>
    </div>
  )
}

export default App
```

- `controls` holds the mode switch, the dataset preset picker + Regenerate button, the three re-render triggers, and the reset button. `readout` holds the live "found" value (in an `aria-live="polite"` region, scoped narrowly so it doesn't spam a screen reader on every fast-changing render — see §11), the stat cards, and the waveform. Both are custom `role="radiogroup"`/`role="radio"` controls with full arrow-key navigation, not native `<select>` elements — see §11.

### `src/main.jsx` — the entry point (unchanged)

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

- React 18's `createRoot` API mounts `<App />` into the `#root` div from `index.html`. `<React.StrictMode>` is kept deliberately — see the dev-mode note in §9.

### Supporting files (brief)

- **`index.html`** — Vite shell + `<meta name="theme-color" content="#0a0c10">` matching the app's canvas color, and a descriptive `<title>`.
- **`src/index.css`** — global reset, `color-scheme: dark` on the root (this demo is a fixed-dark instrument panel by design, like the display on a piece of lab equipment, regardless of OS light/dark preference), base font stack.
- **`src/App.css`** — the instrument-panel theme: CSS custom properties for surfaces/borders/text hierarchy, a semantic color system (cyan = interactive, green = memoized/cache-hit, amber = naive/recompute), the mode "rocker" switch, the segmented dataset picker, stat cards, and the waveform strip.
- **`.eslintrc.cjs`** — unchanged rule set (`eslint:recommended` + `react`/`react-hooks`/`react-refresh`), plus `'react/prop-types': 'off'` — this is plain JS with no `prop-types` package installed, so PropTypes validation on the file-local `StatCard`/`Waveform` components would just be dead weight.
- **`package.json`** — `"name": "video-117"`; scripts `dev` / `build` / `lint` / `preview`; `react@^18.2.0`, `react-dom@^18.2.0`, `vite@^5.1.0`, ESLint + React plugins. No dependencies were added or removed.

### 11. A note on the UI itself

The demo is built as a small **instrumentation panel**, not a form: a two-option mode "rocker" switch, a three-option segmented dataset picker, stat cards, and a scrolling waveform trace — all custom `role="radiogroup"`/`role="radio"`/`role="switch"` controls (native `<select>` can't be styled to match, and a real radiogroup supports arrow-key navigation, which both custom controls implement via `handleModeKeyDown`/`handlePresetKeyDown`). Every button has a visible `:focus-visible` ring, hover state, and touch-friendly tap target (`touch-action: manipulation`); the layout is a responsive two-column grid that stacks to one column under 860px; and the one `aria-live="polite"` region on the page is deliberately scoped to just the found-value text, not the whole stats panel, so it doesn't narrate every render to a screen reader.

---

## `useMemo` vs `useCallback` vs `React.memo`

| | `useMemo` | `useCallback` | `React.memo` |
|---|---|---|---|
| **What it is** | Hook | Hook | Higher-order component (not a hook) |
| **What it caches** | The **return value** of a computation | The **function itself** (a stable reference) | The **rendered output** of a whole component |
| **Signature** | `useMemo(() => value, deps)` | `useCallback(fn, deps)` | `React.memo(Component, arePropsEqual?)` |
| **Recomputes / re-renders when…** | Any dep fails `Object.is` vs last render | Any dep changes → new function reference | Any prop fails shallow comparison |
| **Typical use** | Expensive derived data (like this demo's linear scan) | Passing stable callbacks to memoized children / effect deps | Skipping re-renders of pure child components |
| **Equivalent form** | — | `useCallback(fn, deps)` ≡ `useMemo(() => fn, deps)` | — |
| **This lecture's example** | `useMemo(() => findMagicalItem(dataset), [dataset])` | (not used in the demo — see Exercise 4) | (not used in the demo — see Exercise 4) |

**How they combine:** `React.memo` on a child only helps if the props you pass it are referentially stable — which is exactly what `useMemo` (for values) and `useCallback` (for functions) provide from the parent.

---

## When NOT to Use `useMemo` (Premature Optimization)

`useMemo` is an *optimization*, not a correctness tool. It has its own costs: React must store the cached value and previous deps, and compare deps on every render. Skip it when:

1. **The computation is cheap.** `a + b`, formatting a string, filtering a 20-item list — the dependency comparison can cost as much as the work itself. This demo needed a *multi-million*-element array with real per-item work to make the cost measurable and visible; your todo list does not qualify.
2. **The dependencies change on almost every render anyway.** If deps are always "new" (an inline object/array literal, for example), you pay for the comparison *and* the recompute — pure overhead. `useMemo Lab`'s own `[dataset]` dependency is stable precisely because `dataset` only changes when `buildDataset` is explicitly re-run — never as a side effect of an unrelated render.
3. **You haven't measured.** Profile first (React DevTools Profiler, `performance.now()`, `console.time`). Memoize what's provably slow, not what "feels like it might be." This demo's own stats panel — recompute count, cache-hit rate, per-scan timing — *is* that measurement, made visible instead of hidden in a profiler tab.
4. **You're using it for correctness.** React documents that it may discard the cache in some situations (e.g., future features, offscreen rendering). Your code must still work if the create function re-runs — treat `useMemo` purely as a performance hint. Nothing in this demo depends on the cache *never* being dropped; if it were, every render would still produce a correct `magical` value, just possibly a slower one.
5. **The real fix is structural.** Often you can move state down, lift expensive content into `children`, or avoid building expensive data until it's actually needed — exactly what this demo does by moving the multi-million-element array construction out of module scope and into a lazily-invoked `useMemo` (§1, §3).

Rule of thumb: **write it plain first; memoize when the profiler — or, in this demo's case, the stats panel — tells you to.**

---

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite dev server
npm run dev
```

Open the printed URL (typically `http://localhost:5173`).

**What to try:**

1. On load, the **Light** preset is selected and **Memoized** mode is on — the page paints instantly (nothing expensive happened yet).
2. Click **Pulse** a bunch of times. Watch **Renders** climb in the stat grid while **Expensive Recomputes** barely moves and **Cache Hit Rate** stays high. That's `useMemo` at work.
3. Switch the mode to **Naive**. Click **Pulse** again — now **Expensive Recomputes** tracks **Renders** 1:1, and **Cache Hit Rate** drops. Same computation, same data, only the caching strategy changed.
4. Switch the dataset preset to **Heavy**, turn on **Run Animation Stress Test** while still in **Naive** mode, and watch the fps readout crater. Switch back to **Memoized** with the animation still running — it snaps back to full speed instantly.
5. Click **Regenerate Dataset** — feel the one deliberate hitch as a brand-new array is built and (in Memoized mode) the scan legitimately re-runs, because the dependency genuinely changed this time.
6. Click **Reset Session Stats** to zero the counters and start a clean comparison.
7. **Experiment:** open `src/App.jsx` and change `WORK_ITERATIONS` or a preset's `size` — rerun the "Naive + Heavy + Animate" test and watch the fps number move with it. This is a fully tunable rig, not a fixed demo.

> Other scripts: `npm run build` (production build), `npm run preview` (serve the build), `npm run lint` (ESLint — `--max-warnings 0`, so this project's lint must be fully clean, no warnings allowed).

---

## Key Takeaways

- A state update re-runs the **whole component function** — any expensive expression in the body re-executes too, unless it's memoized.
- `useMemo(create, deps)` caches `create()`'s **return value** and only recomputes when a dep changes by **`Object.is` / referential** comparison.
- Unrelated state (a pulse click, a clock tick, an animation frame) no longer pays for unrelated computation (the linear scan) — and this demo's stat grid proves it with real counts, not a claim.
- Recomputation is triggered by **new references**, not by "deep" changes — which is why **Regenerate Dataset** exists as its own explicit action that produces a genuinely new array.
- `useMemo` caches values, `useCallback` caches functions, `React.memo` caches component output — three tools, one theme: *skip work whose inputs didn't change*.
- Memoization is a **performance hint, not a semantic guarantee** — code must remain correct if the cache is dropped.
- Expensive setup (building a huge array) belongs **lazily inside the component** (a `useMemo`, a lazy `useState` initializer), never at module scope where it blocks the very first paint.

## Common Pitfalls

- **Wrong or missing dependencies.** Writing `[]` instead of `[dataset]` here would freeze `magical` at its first value forever — after regenerating, the UI would still show the old index. Every reactive value read inside the create function belongs in the deps (`eslint-plugin-react-hooks`'s `exhaustive-deps` rule exists to catch exactly this, and this project's `npm run lint` runs with `--max-warnings 0`, so an exhaustive-deps warning fails the build).
- **Memoizing cheap values.** Wrapping trivial arithmetic in `useMemo` adds memory + comparison overhead and clutters the code for zero gain.
- **Unstable dependencies.** Passing an inline object/array literal as a dep (`[{...}]`) defeats memoization — it's a new reference every render.
- **Mutating instead of replacing.** Push-in-place would keep the same array reference, so `useMemo` (and React generally) wouldn't notice. `buildDataset` always returns a brand-new array, and it's only ever installed via `useMemo`'s own cache — never mutated after the fact.
- **Side effects inside the create function.** It runs during render and must be pure in production code — no `setState`, no subscriptions, no DOM writes (that's `useEffect`'s job). *This demo's own `useMemo` factory increments a `useRef` counter for instrumentation, which is a deliberate, called-out exception made for teaching visibility — not a pattern to copy.*
- **Unguarded `Array.prototype.find`.** `find` returns `undefined` on a miss. `findMagicalItem` documents that in its own comment, and the JSX branches on `active.result` before reading `.index` off it (§8) instead of assuming it's always there.
- **Loose equality.** The old version of this demo used `count == 10` to decide when to swap datasets — and paired it with a stale closure that could occasionally skip or double-fire on rapid clicks. This version uses `===` everywhere and replaced the implicit, closure-dependent trigger with an explicit **Regenerate Dataset** button — no ambiguity about when the "real" dependency changes.
- **Heavy work at module scope.** Building a large array the moment a file is imported blocks the first paint before React even starts. Build it lazily — inside a `useMemo`, or a lazy `useState`/`useRef` initializer — so cost is paid only when, and because, it's actually needed.

## Practice Exercises

1. **Feel the "before."** In `App.jsx`, temporarily replace the `useMemo`-wrapped call with a plain `const result = findMagicalItem(dataset)` computed unconditionally (i.e., force `memoEnabled` to always take the naive branch). Click **Pulse** 10 times on the **Heavy** preset and compare **This Render** timings to the memoized version. Then revert.
2. **Break the deps on purpose.** Change the lesson `useMemo`'s dependency array from `[dataset]` to `[]`. Click **Regenerate Dataset** — what does **Magical Index** show, and why doesn't it update? Then try `[dataset, pulse]` — how does **Expensive Recomputes** behave now across 10 pulses, and why is that worse than `[dataset]` alone?
3. **Prove referential equality.** Add a temporary button that calls `setDatasetNonce((n) => n)` (returns the *same* value, so React bails out of the update entirely) versus one that calls `setDatasetNonce((n) => n + 0)` (still the same value, same result) versus the real **Regenerate Dataset** (`n => n + 1`, a genuinely new dependency value feeding `buildDataset`). Log inside the `useMemo` factory to confirm which ones actually re-run it.
4. **Extend with `useCallback` + `React.memo`.** Extract the "found value" readout into a `<MagicalReadout value={active.result} tone={modeTone} />` child wrapped in `React.memo`. Pass any callback props via `useCallback`. Confirm with the React DevTools Profiler that Pulse clicks no longer re-render that child once its props are referentially stable.
5. **Tune the workload yourself.** `WORK_ITERATIONS` and each preset's `size` in `DATASET_PRESETS` directly control how expensive a scan is. Halve `WORK_ITERATIONS` and describe how the Heavy-preset fps readout changes during the animation stress test. Then argue, in a comment, at what point the "Light" preset becomes cheap enough that memoizing it would be premature optimization (see "When NOT to Use `useMemo`" above) — and how you'd know, using only this app's own stats panel.

---

## Appendix: Original Vite Template Notes

The original `README.md` shipped with this project (preserved verbatim):

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
