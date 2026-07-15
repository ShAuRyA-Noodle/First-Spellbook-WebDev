# Lecture 118 — The `useCallback` Hook in React

> **Course:** Web Development — React Series
> **Project:** `video-118` (Vite + React 18)
> **Topic:** Function identity across renders, `React.memo`, and how `useCallback` stops unnecessary child re-renders — demonstrated on an interactive **useCallback Signal Bench**.

---

## Overview

Every time a React component re-renders, **its entire function body runs again**. That means any function you define inside a component — like a handler or a helper — is **re-created from scratch on every render**. The new function does the same thing as the old one, but it is a **brand-new object in memory**, so `newFn === oldFn` is `false`.

This matters the moment you pass such a function as a **prop to a child component**. Even if you wrap the child in `React.memo` (which skips re-rendering when props are unchanged), the memoization is defeated: the function prop is "new" on every render, so memo's shallow prop comparison fails, and the child re-renders anyway.

**`useCallback`** solves this. It caches (memoizes) the function itself between renders, returning the *same* function reference until one of its dependencies changes. Same reference → memo's prop check passes → the child skips re-rendering.

This project turns that story into a hands-on instrument panel. `App` holds **three independent controls** and a **useCallback on/off switch**; `Navbar` is a memoized "probe" that visualizes its own render count, flashes when it actually renders, and logs every render to the console. An **Activity Log** on screen states, in plain English, whether each action fired a re-render or was skipped — so the optimization isn't something you have to take on faith, it's something you watch happen.

---

## What You'll Learn

- Why functions defined inside a component are **re-created on every render**, and why that breaks reference equality (`===`).
- What `React.memo` does — and **why it fails** when a fresh function is passed as a prop each render.
- How `useCallback(fn, deps)` **caches a function reference** across renders.
- How the **dependency array** controls when the cached function is replaced (and why `[count, adjective]` means "re-create when either changes").
- How to build an **observable proof**: a render-count badge, a flash animation, and an activity log that predicts fired-vs-skipped using the same reference check `memo` uses internally.
- The classic **stale closure pitfall**: why an empty dependency array can freeze old state inside your callback.
- The relationship **`useCallback(fn, deps)` ≡ `useMemo(() => fn, deps)`**.
- When `useCallback` is worth it — and when it's just noise.

---

## Project Structure

```
Lec-118 useCallback Hook React/
├── index.html                 # Vite entry HTML — mounts #root, theme-color meta, loads /src/main.jsx
├── package.json               # Project "video-118": React 18.2, Vite 5.1
├── README.md                  # ← You are here (lecture notes)
├── public/
│   └── vite.svg
└── src/
    ├── main.jsx               # ReactDOM.createRoot(...).render(<App />) — no StrictMode, on purpose
    ├── App.jsx                # Parent: 3 controls + useCallback toggle + Activity Log
    ├── App.css                # Design tokens' layout: header, panels, controls, log feed
    ├── index.css               # :root design tokens (dark default, light via prefers-color-scheme), reset
    └── components/
        ├── Navbar.jsx          # Child: memo(Navbar) — the render "probe"
        └── Navbar.css          # Probe card styles, incl. the render-flash keyframe
```

Note: `src/assets/react.svg` remains on disk from the original Vite template but is no longer imported anywhere — the boilerplate Vite/React logos were replaced by the Signal Bench UI.

---

## Concept Deep-Dives

### 1. Functions are re-created on every render

A component is just a function. When state changes, React calls it again — top to bottom. This project makes that visible with **two** versions of the same callback, both defined every render, verbatim from `src/App.jsx`:

```jsx
  // The memoized callback: stable reference unless count or adjective change.
  const memoizedGetAdjective = useCallback(
    () => buildAdjectiveTag(adjective, count),
    [count, adjective],
  )
  // The "naive" callback: a brand-new function every single App render,
  // regardless of what changed — this is the pre-useCallback behavior.
  const freshGetAdjective = () => buildAdjectiveTag(adjective, count)

  const getAdjective = memoOn ? memoizedGetAdjective : freshGetAdjective
```

`freshGetAdjective` is a **different function object on every render** of `App` — click *any* control, even the unrelated one, and a fresh one is born. Its *behavior* is identical to the memoized version, but its *identity* is not:

```js
// Conceptually, across two renders where nothing relevant changed:
render1_freshGetAdjective === render2_freshGetAdjective   // false — different objects!
render1_memoizedGetAdjective === render2_memoizedGetAdjective // true — same object, cached
```

React compares props with `===` (shallow comparison). Strings like `"good"` compare equal by value; **functions and objects compare by reference**. That asymmetry is the entire reason this lecture exists — and the **useCallback toggle switch** in the UI lets you flip between the two behaviors live.

### 2. Why `memo(Navbar)` still re-renders with a fresh function prop

The child is wrapped in `memo`:

```jsx
const MemoizedNavbar = memo(Navbar)
```

`memo` tells React: *"if this component's props are shallowly equal to last time, skip re-rendering it."* That works beautifully for the `adjective` string prop — `"good"` equals `"good"` every render, value comparison.

But with `freshGetAdjective` (useCallback switched **OFF**), the prop table looks like this on *every single* parent render, even ones caused by the deliberately unrelated control:

| Prop | Old value | New value | `===`? |
|---|---|---|---|
| `adjective` | `"good"` | `"good"` | ✅ equal |
| `getAdjective` | fn (render N) | fn (render N+1) | ❌ **not equal** |

One unequal prop is enough — `memo` gives up and `Navbar` re-renders. Memoizing the child was pointless without also memoizing the function you hand it. **`memo` and `useCallback` are a team.**

### 3. `useCallback(fn, deps)` — caching the function

The fix, exactly as written in `src/App.jsx`:

```jsx
const memoizedGetAdjective = useCallback(
  () => buildAdjectiveTag(adjective, count),
  [count, adjective],
)
```

Semantics:

- **First render:** React stores the function and returns it.
- **Later renders:** if nothing in the dependency array `[count, adjective]` changed, React returns the **same stored function** — identical reference, `===` passes, `memo(Navbar)` skips the re-render.
- **When `count` or `adjective` changes:** the old closure would be stale (it captured old values), so React deliberately creates and stores a **new** function that sees the new values. On that render, `Navbar` *does* re-render — correctly, because its prop genuinely changed.

The **Unrelated** control in the UI increments `unrelatedTicks`, a piece of state that `getAdjective` never reads and that is never passed to `Navbar`. Clicking it re-renders `App` (React always re-renders the component whose state changed) but, with the toggle **ON**, `memoizedGetAdjective`'s dependencies are untouched — same reference goes to `Navbar` — `memo` skips it. **This is the entire lecture, made visible.**

### 4. The evidence: a badge, a flash, and a log — not just `console.log`

The original demo relied on a single `console.log` inside the child. This version keeps that (it's still the cheapest re-render profiler you'll ever use) but adds two more layers of proof, verbatim from `src/components/Navbar.jsx`:

```jsx
const renderCountRef = useRef(0)
renderCountRef.current += 1
const renderCount = renderCountRef.current

useEffect(() => {
  // No dependency array: this runs once per commit of THIS component,
  // i.e. once per real render. When memo() skips a render, the component
  // body — and this effect — never runs at all, so the badge above only
  // ever counts renders that actually happened.
  console.log(`[Navbar] render #${renderCount}`)
})
```

`renderCountRef` is a **plain ref, not state** — reading or incrementing it never itself causes a render, so it can safely count renders from inside the render it's counting. It only goes up when `Navbar`'s function body actually executes, which is precisely what `memo` controls. The number is displayed live as the `probe-count` badge, and a `key={renderCount}` span (`.probe-flash`) remounts on every real render, replaying a CSS keyframe glow — a visual "it just fired" cue with zero extra state and zero extra renders.

The third layer, in `src/App.jsx`, is the **Activity Log**. Rather than watching the child to find out what happened, each handler *predicts* its own outcome using the exact rule `memo` uses internally — reference equality on every prop:

```jsx
const handleUnrelated = () => {
  setUnrelatedTicks((t) => t + 1)
  // Doesn't touch count or adjective. With useCallback ON, the memoized
  // function keeps its reference → memo sees identical props → skipped.
  // With useCallback OFF, a fresh function is created on *every* App
  // render no matter the cause → memo sees a changed prop → fires anyway.
  pushLog(`Unrelated tick → ${unrelatedTicks + 1}`, memoOn ? 'skipped' : 'fired')
}
```

The experiment, end to end:

1. Run the app and open DevTools → Console (optional — the on-screen log already shows it).
2. With **useCallback ON**, click **Count** or an **Adjective** chip → the probe badge increments, a "Re-rendered" entry appears, `[Navbar] render #N` prints.
3. Click **Unrelated** several times → the probe badge does **not** move, "Skipped" entries pile up, no new console lines.
4. Flip the **useCallback** switch **OFF** and click **Unrelated** again → now the probe **does** re-render every time — the exact "broken" behavior `useCallback` exists to prevent.

---

## Full Code Walkthrough

### `src/App.jsx` (verbatim)

```jsx
import { useCallback, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'

const ADJECTIVES = ['good', 'great', 'chill', 'sharp', 'bold']

// Pure helper — lives outside the component so it never needs to be a dependency.
function buildAdjectiveTag(adjective, count) {
  return `${adjective} · #${count}`
}

let logIdSeed = 0

function App() {
  const [count, setCount] = useState(0)
  const [adjective, setAdjective] = useState(ADJECTIVES[0])
  const [unrelatedTicks, setUnrelatedTicks] = useState(0)
  const [memoOn, setMemoOn] = useState(true)
  const [log, setLog] = useState([])

  // The memoized callback: stable reference unless count or adjective change.
  const memoizedGetAdjective = useCallback(
    () => buildAdjectiveTag(adjective, count),
    [count, adjective],
  )
  // The "naive" callback: a brand-new function every single App render,
  // regardless of what changed — this is the pre-useCallback behavior.
  const freshGetAdjective = () => buildAdjectiveTag(adjective, count)

  const getAdjective = memoOn ? memoizedGetAdjective : freshGetAdjective

  // --- Activity log -----------------------------------------------------
  // Each handler predicts its own outcome using the *exact* rule memo()
  // uses internally (Object.is on every prop). No effect/observer needed —
  // we already know, synchronously, whether `adjective` or `getAdjective`
  // is about to change identity.
  const pushLog = (label, outcome) => {
    setLog((entries) => [{ id: ++logIdSeed, label, outcome }, ...entries].slice(0, 6))
  }

  const handleCount = () => {
    setCount((c) => c + 1)
    // count is always inside getAdjective's dependencies (memoized or not),
    // so this always changes its identity — useCallback ON or OFF.
    pushLog(`Count → ${count + 1}`, 'fired')
  }

  const handleAdjective = (word) => {
    if (word === adjective) return
    setAdjective(word)
    // Same reasoning as count: adjective is always a real dependency.
    pushLog(`Adjective → “${word}”`, 'fired')
  }

  const handleUnrelated = () => {
    setUnrelatedTicks((t) => t + 1)
    // Doesn't touch count or adjective. With useCallback ON, the memoized
    // function keeps its reference → memo sees identical props → skipped.
    // With useCallback OFF, a fresh function is created on *every* App
    // render no matter the cause → memo sees a changed prop → fires anyway.
    pushLog(`Unrelated tick → ${unrelatedTicks + 1}`, memoOn ? 'skipped' : 'fired')
  }

  const handleReset = () => {
    const depsWillChange = count !== 0 || adjective !== ADJECTIVES[0]
    setCount(0)
    setAdjective(ADJECTIVES[0])
    setUnrelatedTicks(0)
    pushLog('Reset', !memoOn || depsWillChange ? 'fired' : 'skipped')
  }

  const toggleMemo = () => {
    const next = !memoOn
    setMemoOn(next)
    // Switching modes swaps which function object gets passed down — the
    // two closures are never reference-equal, so this always fires once.
    pushLog(`useCallback → ${next ? 'ON' : 'OFF'}`, 'fired')
  }

  return (
    // ...header, controls panel, and observation panel — see src/App.jsx
  )
}

export default App
```

Line-by-line highlights:

- **`import { useCallback, useState } from 'react'`** — no `useEffect`/`useRef` needed in `App`; the activity log is computed synchronously in each handler, not observed after the fact.
- **Five pieces of state**: `count` and `adjective` are the two *real* dependencies; `unrelatedTicks` is deliberately irrelevant; `memoOn` drives the on/off comparison; `log` is the on-screen evidence feed. Every one of them is wired to a visible control — there is no dead state left over.
- **`buildAdjectiveTag`** is a module-level pure function, not a closure — it needs no dependency array of its own, and both callback variants call it identically.
- **`memoizedGetAdjective`** vs **`freshGetAdjective`** are the "after" and "before" pictures side by side, both defined on every render; `getAdjective` picks one based on the `memoOn` switch. This is the single line that turns the whole app into a live A/B comparison: `const getAdjective = memoOn ? memoizedGetAdjective : freshGetAdjective`.
- **`pushLog`** appends to a capped (6-entry) activity feed. Each handler calls it with a `label` and a **predicted** `outcome` (`'fired'` or `'skipped'`), computed from the same rule `memo` uses internally — reference equality on `adjective` and `getAdjective`. `handleCount`/`handleAdjective` always predict `'fired'` because those values are genuine dependencies; `handleUnrelated` predicts based on `memoOn`; `handleReset` and `toggleMemo` reason about the specific case at hand (see inline comments).
- **`<Navbar adjective={adjective} getAdjective={getAdjective} />`** — the exact two-prop shape from the original lecture, now backed by real, user-driven state instead of a hardcoded `"good"` literal.

### `src/components/Navbar.jsx` (verbatim)

```jsx
import { memo, useEffect, useRef } from 'react'
import './Navbar.css'

const Navbar = ({ adjective, getAdjective }) => {
  // A plain ref — not state — so reading it never itself triggers a render.
  // It only goes up when this function body actually runs.
  const renderCountRef = useRef(0)
  renderCountRef.current += 1
  const renderCount = renderCountRef.current

  useEffect(() => {
    // No dependency array: this runs once per commit of THIS component,
    // i.e. once per real render. When memo() skips a render, the component
    // body — and this effect — never runs at all, so the badge above only
    // ever counts renders that actually happened.
    console.log(`[Navbar] render #${renderCount}`)
  })

  const tag = getAdjective()

  return (
    <section className="navbar-probe" aria-label="Navbar render probe">
      <span key={renderCount} className="probe-flash" aria-hidden="true" />

      <header className="probe-head">
        <span className="probe-led" aria-hidden="true" />
        <span className="probe-title">Navbar</span>
        <span className="probe-sub">memo()</span>
      </header>

      <div className="probe-readout" aria-live="polite">
        <span className="probe-count">{renderCount}</span>
        <span className="probe-count-label">render{renderCount === 1 ? '' : 's'} so far</span>
      </div>

      <p className="probe-copy">
        I am a <strong>{adjective}</strong> Navbar
      </p>

      <button
        type="button"
        className="probe-tag-btn"
        aria-label={`Log current signal to console: ${tag}`}
        onClick={() => console.log(`[Navbar] getAdjective() → "${getAdjective()}" (no render caused)`)}
      >
        <span className="probe-tag-label">signal</span>
        <span className="probe-tag-value">{tag}</span>
      </button>
    </section>
  )
}

const MemoizedNavbar = memo(Navbar)

export default MemoizedNavbar
```

Highlights:

- **No `import React from 'react'`** — the project's ESLint config extends `plugin:react/jsx-runtime`, which uses the automatic JSX transform. That import was dead weight in the original file (and in the original `main.jsx`); both are cleaned up here.
- **`renderCountRef`** — a `useRef`, deliberately *not* `useState`. If this were state, incrementing it would itself schedule another render, double-counting. A ref just tracks a number across renders without participating in the render cycle.
- **`useEffect(() => { ... })`** with **no dependency array** is the one place in this codebase that intentionally runs after *every* commit — that's exactly "once per real render," which is what makes the console log (and, indirectly, the flash) accurate.
- **`<span key={renderCount} className="probe-flash" />`** — changing a element's `key` forces React to unmount the old node and mount a fresh one. That replays the CSS keyframe animation on the new node every time `renderCount` changes, with no extra state, no `setTimeout`, and no risk of double-counting renders.
- **`{getAdjective()}`** as `tag` — the child *calls* the parent's function during render, displaying e.g. `"chill · #3"`. This is why `[count, adjective]` must be in the dependency array: if the function were frozen with stale values, the label would be wrong.
- **The `probe-tag-btn` click handler** calls `getAdjective()` again and logs the result — on purpose, to prove a separate point: *calling* the cached function does not cause a render. Only receiving a *new function reference as a prop* does.
- **`const MemoizedNavbar = memo(Navbar); export default MemoizedNavbar`** — assigning to a named variable before exporting (rather than `export default memo(Navbar)`) keeps Vite's Fast Refresh happy and gives the wrapped component a debuggable name in React DevTools.

### The interplay, end to end

```
Click "Count +1" or an adjective chip → setCount/setAdjective → App re-renders
        │
        ├─ getAdjective: a real dependency changed → NEW function reference (ON or OFF)
        │        → Navbar prop changed → Navbar re-renders → badge/flash/log all fire
        │
Click "Unrelated +1" with useCallback ON:
        │
        ├─ memoizedGetAdjective: deps [count, adjective] unchanged → SAME cached function
        │        → all Navbar props shallow-equal → memo SKIPS Navbar
        │        → badge doesn't move, no flash, no new console line  ✅
        │
Click "Unrelated +1" with useCallback OFF:
        │
        ├─ freshGetAdjective: brand-new function every App render, regardless of cause
        │        → Navbar prop "changed" (new reference) → memo can't skip → Navbar re-renders
        │        → badge increments even though nothing Navbar cares about changed  ❌
```

Remove either half and the optimization dies:
- **`useCallback` without `memo`:** the child re-renders anyway (parents re-render children by default; stable props don't matter if nobody checks them).
- **`memo` without `useCallback`:** the fresh function prop fails the shallow comparison every time.

---

## `useCallback` vs `useMemo`

They are two views of the same caching machinery:

```jsx
// These are equivalent:
const fn = useCallback(() => { doThing(a, b) }, [a, b])
const fn = useMemo(() => () => { doThing(a, b) }, [a, b])
```

| | `useCallback(fn, deps)` | `useMemo(factory, deps)` |
|---|---|---|
| Caches… | **the function itself** | **the return value** of the factory |
| Returns | `fn` (uncalled) | `factory()`'s result |
| Use for | stable handler/callback props | expensive computed values (filtered lists, derived data) |

Mnemonic: **`useCallback` memoizes the recipe; `useMemo` memoizes the dish.** In fact, `useCallback(fn, deps)` is literally `useMemo(() => fn, deps)` — a convenience wrapper so you don't have to write a function that returns a function.

In this project, `memoizedGetAdjective` could be rewritten with `useMemo` as:

```jsx
const memoizedGetAdjective = useMemo(
  () => () => buildAdjectiveTag(adjective, count),
  [count, adjective],
)
```

Same identity-caching behavior, just spelled with the more general hook. (See Exercise 3.)

---

## How to Run

```bash
# from the project folder
npm install     # install React 18 + Vite 5 dependencies
npm run dev     # start the Vite dev server (default: http://localhost:5173)
```

Then open the printed local URL. Try each control on the left, watch the probe card and Activity Log on the right, and flip the **useCallback** switch to compare the "with" and "without" behavior live. Open DevTools → Console for the raw `[Navbar] render #N` evidence.

Other scripts from `package.json`: `npm run build` (production build), `npm run preview` (serve the build), `npm run lint` (ESLint — passes clean with `--max-warnings 0`).

---

## Key Takeaways

1. **Re-render = re-run.** Everything in a component body, including function definitions, is created anew each render.
2. **Functions compare by reference.** A re-created function is never `===` its previous incarnation.
3. **`memo` alone can't save you** from function props — its shallow comparison sees a "new" prop every render.
4. **`useCallback` stabilizes function identity** across renders, letting `memo` actually skip work.
5. **Dependencies keep callbacks honest.** List every reactive value the function reads (`[count, adjective]` here) so it never serves stale data.
6. **Prove it, don't guess it.** A `useRef` render counter, a keyed flash animation, and a log that mirrors `memo`'s own comparison rule turn "trust me" into something you can watch.
7. **It's an optimization, not a correctness tool.** The app works without `useCallback`; it just does wasted work — which is exactly what the toggle switch and the Unrelated control make visible.

## Common Pitfalls

- **Empty deps → stale closures.** `useCallback(() => buildAdjectiveTag(adjective, count), [])` would lock in the values from the very first render — the probe's signal tag would read `good · #0` forever. If the function reads state or props, they belong in the dependency array (`eslint-plugin-react-hooks`, included in this project, warns about exactly this).
- **Overusing `useCallback`.** Wrapping every function adds memory and complexity for nothing if the child isn't memoized (or the function is only used inside the same component). Reach for it when: (a) the function is a prop to a `memo` child, (b) it's a dependency of another hook (`useEffect`, `useMemo`), or (c) profiling shows real waste.
- **`useCallback` without `memo` on the child.** Stable props are irrelevant if the child doesn't compare props — children re-render with their parent by default.
- **Non-function props breaking memo anyway.** Passing inline objects/arrays (`style={{...}}`, `items={[...]}`) recreates them each render and defeats `memo` exactly like functions do — those need `useMemo`.
- **Wrong dependencies.** Extra deps make the cache churn needlessly; missing deps cause stale behavior. Trust the lint rule.
- **`useEffect` with no dependency array is a sharp tool.** `Navbar`'s render-logging effect deliberately omits the array to run every render — that's correct *there* because it only reports on renders that already happened. Don't reach for this pattern to synchronize state between components (setting state in such an effect can cause extra render passes or even loops); this project's Activity Log intentionally avoids that by predicting outcomes synchronously in the event handlers instead.
- **`<React.StrictMode>` would muddy this demo.** `src/main.jsx` mounts `<App />` without it on purpose — StrictMode double-invokes render (and this effect) in development, which would double every render count and desync the "one click, one badge tick" story. Feel free to add it back for a non-demo project; just expect the numbers here to double if you do.

## Practice Exercises

1. **Break it on purpose.** Flip the **useCallback** switch OFF and click **Unrelated** five times. Confirm the probe's render badge climbs by 5 and the Activity Log shows five "Re-rendered" rows. Flip it back ON and repeat — the badge should not move at all.
2. **Stale closure demo.** Temporarily change `memoizedGetAdjective`'s dependency array from `[count, adjective]` to `[]`. Click **Count** several times — why does the probe's signal tag stay frozen at `good · #0`? Explain in one sentence using the phrase "captured variable," then revert the change.
3. **Rewrite with `useMemo`.** Replace `memoizedGetAdjective` with the `useMemo`-based version shown in the *`useCallback` vs `useMemo`* section above. Confirm the demo behaves identically.
4. **Add a fourth signal.** Add a new piece of state (e.g. a `theme` toggle) that is *not* read by `buildAdjectiveTag` and *not* passed to `Navbar`. Wire up a control for it and predict, before clicking, whether the probe fires. Verify against the Activity Log.
5. **Make `handleReset` earn its "skipped" branch.** With useCallback ON, click **Count** or an adjective chip once, then immediately click **Reset**. The log should show "Re-rendered" (because `depsWillChange` was `true`). Now click **Reset** again immediately — it should log "Skipped" this time. Explain why, referencing `depsWillChange`.

---

## Appendix: Original Vite Template Notes

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
