# Lecture 118 — The `useCallback` Hook in React

> **Course:** Web Development — React Series
> **Project:** `video-118` (Vite + React 18)
> **Topic:** Function identity across renders, `React.memo`, and how `useCallback` stops unnecessary child re-renders.

---

## Overview

Every time a React component re-renders, **its entire function body runs again**. That means any function you define inside a component — like a handler or a helper — is **re-created from scratch on every render**. The new function does the same thing as the old one, but it is a **brand-new object in memory**, so `newFn === oldFn` is `false`.

This matters the moment you pass such a function as a **prop to a child component**. Even if you wrap the child in `React.memo` (which skips re-rendering when props are unchanged), the memoization is defeated: the function prop is "new" on every render, so memo's shallow prop comparison fails, and the child re-renders anyway.

**`useCallback`** solves this. It caches (memoizes) the function itself between renders, returning the *same* function reference until one of its dependencies changes. Same reference → memo's prop check passes → the child skips re-rendering.

This lecture demonstrates the full story with a parent `App` component holding a counter, and a memoized `Navbar` child that logs to the console every time it renders — giving us hard evidence of when re-renders happen and when they're skipped.

---

## What You'll Learn

- Why functions defined inside a component are **re-created on every render**, and why that breaks reference equality (`===`).
- What `React.memo` does — and **why it fails** when a fresh function is passed as a prop each render.
- How `useCallback(fn, deps)` **caches a function reference** across renders.
- How the **dependency array** controls when the cached function is replaced (and why `[count]` means "re-create when `count` changes").
- The **`console.log` evidence pattern**: putting a log inside the child's body to prove whether it re-rendered.
- The classic **stale closure pitfall**: why an empty dependency array can freeze old state inside your callback.
- The relationship **`useCallback(fn, deps)` ≡ `useMemo(() => fn, deps)`**.
- When `useCallback` is worth it — and when it's just noise.

---

## Project Structure

```
Lec-118 useCallback Hook React/
├── index.html                 # Vite entry HTML — mounts #root, loads /src/main.jsx
├── package.json               # Project "video-118": React 18.2, Vite 5.1
├── README.md                  # ← You are here (lecture notes)
├── public/
│   └── vite.svg
└── src/
    ├── main.jsx               # ReactDOM.createRoot(...).render(<App />)
    ├── App.jsx                # Parent: counter state + useCallback(getAdjective)
    ├── App.css                # Vite template styles
    ├── index.css              # Global styles (dark/light theme)
    ├── assets/
    │   └── react.svg
    └── components/
        └── Navbar.jsx         # Child: memo(Navbar) + "Navbar is rendered" log
```

---

## Concept Deep-Dives

### 1. Functions are re-created on every render

A component is just a function. When state changes, React calls it again — top to bottom. So this helper (the instructor's original version, left **commented out** in `App.jsx` for comparison):

```jsx
  // const getAdjective = () => {
  //   return "another" + count
  // }
```

…would be a **different function object on every render** of `App`. Click the counter button → `setCount` → `App` re-runs → a fresh `getAdjective` is born. Its *behavior* is identical, but its *identity* is not:

```js
// Conceptually, across two renders:
render1_getAdjective === render2_getAdjective   // false — different objects!
```

React compares props with `===` (shallow comparison). Strings like `"good"` compare equal by value; **functions and objects compare by reference**. That asymmetry is the entire reason this lecture exists.

### 2. Why `memo(Navbar)` still re-renders with a fresh function prop

The child is wrapped in `memo`:

```jsx
export default memo(Navbar)
```

`memo` tells React: *"if this component's props are shallowly equal to last time, skip re-rendering it."* That works beautifully for `adjective={"good"}` — the string `"good"` equals `"good"` every render.

But with the plain (commented-out) `getAdjective`, the prop table looks like this on every parent render:

| Prop | Old value | New value | `===`? |
|---|---|---|---|
| `adjective` | `"good"` | `"good"` | ✅ equal |
| `getAdjective` | fn (render 1) | fn (render 2) | ❌ **not equal** |

One unequal prop is enough — `memo` gives up and `Navbar` re-renders. Memoizing the child was pointless without also memoizing the function you hand it. **`memo` and `useCallback` are a team.**

### 3. `useCallback(fn, deps)` — caching the function

The fix, exactly as written in `src/App.jsx`:

```jsx
  const getAdjective = useCallback(() => {
    return "another" + count
  },[count] )
```

Semantics:

- **First render:** React stores the function and returns it.
- **Later renders:** if nothing in the dependency array `[count]` changed, React returns the **same stored function** — identical reference, `===` passes, `memo(Navbar)` skips the re-render.
- **When `count` changes:** the closure would be stale (it captured the old `count`), so React deliberately creates and stores a **new** function that sees the new `count`. On that render, `Navbar` *does* re-render — correctly, because its prop genuinely changed.

So with `[count]` as the dependency: clicking the counter still re-renders `Navbar` (new function each time `count` changes), while any *other* re-render of `App` would leave `Navbar` untouched. Change the deps to `[]` and `Navbar` never re-renders from this prop again — but the callback is frozen with `count = 0` forever (see Pitfalls).

### 4. The `console.log` evidence pattern

How do we *know* whether the child re-rendered? The demo plants a log directly in the child's body — verbatim from `src/components/Navbar.jsx`:

```jsx
const Navbar = ({adjective, getAdjective}) => {
    console.log("Navbar is rendered")
```

The experiment:

1. Run the app and open DevTools → Console.
2. Click the **`count is {count}`** button in `App`.
3. **Without** `useCallback` (plain function) → `"Navbar is rendered"` prints on **every** click, despite `memo`.
4. **With** `useCallback` → the log appears only when the dependencies actually change — proof that `memo` is finally doing its job.

This is a general debugging technique: a `console.log` at the top of a component body fires once per render of that component. It's the cheapest re-render profiler you'll ever use.

---

## Full Code Walkthrough

### `src/App.jsx` (verbatim)

```jsx
import { useState, useCallback } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'

function App() {
  const [count, setCount] = useState(0)
  const [count2, setCount2] = useState(0)
  const [adjective, setAdjective] = useState("good")

  // const getAdjective = () => {
  //   return "another" + count
  // }

  const getAdjective = useCallback(() => {
    return "another" + count
  },[count] )



  return (
    <>
      <Navbar adjective={"good"} getAdjective={getAdjective} />
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

Line-by-line highlights:

- **`import { useState, useCallback } from 'react'`** — both hooks come from React itself; no extra packages.
- **Three pieces of state** are declared: `count` (the one actually wired to the button), plus `count2` and `adjective` — extra state slots the instructor set up for experimentation (e.g., proving that updating *unrelated* state re-renders `App`, and that with `useCallback` in place, `Navbar` would be spared). Note that `count2` and the `adjective` state are declared but not used in the current JSX.
- **The commented-out `getAdjective`** is the "before" picture — the naive version that gets re-created every render and defeats `memo`.
- **The live `getAdjective`** is wrapped in `useCallback` with `[count]` as deps: the function reference is stable *between* count changes and refreshed *on* count changes so it never returns a stale `"another" + count`.
- **`<Navbar adjective={"good"} getAdjective={getAdjective} />`** — two props: a string literal (always shallow-equal; note the *state* variable `adjective` isn't the one passed here) and our memoized function (now also shallow-equal between renders where `count` is unchanged).
- **`onClick={() => setCount((count) => count + 1)}`** — uses the functional updater form; each click re-renders `App`, which is exactly the pressure test for `memo` + `useCallback`.

### `src/components/Navbar.jsx` (verbatim)

```jsx
import React from 'react'
import { memo } from 'react'

const Navbar = ({adjective, getAdjective}) => {
    console.log("Navbar is rendered")
  return (
    <div>
      I am a {adjective} Navbar
      <button onClick={()=>{getAdjective()}}>{getAdjective()}</button>
    </div>
  )
}

export default memo(Navbar)
```

Highlights:

- **`import { memo } from 'react'`** — `memo` is a higher-order component: it wraps `Navbar` and short-circuits re-renders when props are shallowly equal.
- **`console.log("Navbar is rendered")`** — the render-evidence beacon discussed above.
- **`{getAdjective()}`** as the button label — the child *calls* the parent's function during render, displaying `"another0"`, `"another1"`, etc. This is why `[count]` must be in the dependency array: if the function were frozen with stale `count`, the label would be wrong.
- **`onClick={()=>{getAdjective()}}`** — invokes the callback on click as well (result unused here; in the demo it exists to show the child using the passed-in function).
- **`export default memo(Navbar)`** — the memoization happens at export time; consumers import the wrapped version without knowing the difference.

### The interplay, end to end

```
Click "count is X"  →  setCount  →  App re-renders
        │
        ├─ getAdjective: deps [count] changed → NEW function created (correct!)
        │        → Navbar prop changed → Navbar re-renders → label updates
        │
Any App re-render where count did NOT change:
        │
        ├─ getAdjective: deps unchanged → SAME cached function returned
        │        → all Navbar props shallow-equal → memo SKIPS Navbar
        │        → no "Navbar is rendered" in console  ✅
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

---

## How to Run

```bash
# from the project folder
npm install     # install React 18 + Vite 5 dependencies
npm run dev     # start the Vite dev server (default: http://localhost:5173)
```

Then open the printed local URL, open **DevTools → Console**, and click the counter button while watching for `"Navbar is rendered"`. To see the "broken" behavior, swap the `useCallback` version for the commented-out plain function in `App.jsx`.

Other scripts from `package.json`: `npm run build` (production build), `npm run preview` (serve the build), `npm run lint` (ESLint).

---

## Key Takeaways

1. **Re-render = re-run.** Everything in a component body, including function definitions, is created anew each render.
2. **Functions compare by reference.** A re-created function is never `===` its previous incarnation.
3. **`memo` alone can't save you** from function props — its shallow comparison sees a "new" prop every render.
4. **`useCallback` stabilizes function identity** across renders, letting `memo` actually skip work.
5. **Dependencies keep callbacks honest.** List every reactive value the function reads (`[count]` here) so it never serves stale data.
6. **Prove it with `console.log`** in the child's body — measure re-renders, don't guess.
7. **It's an optimization, not a correctness tool.** The app works without `useCallback`; it just does wasted work.

## Common Pitfalls

- **Empty deps → stale closures.** `useCallback(() => "another" + count, [])` locks in the `count` from the very first render — the button label would read `another0` forever. If the function reads state or props, they belong in the dependency array (the `eslint-plugin-react-hooks` dep in this project warns about exactly this).
- **Overusing `useCallback`.** Wrapping every function adds memory and complexity for nothing if the child isn't memoized (or the function is only used inside the same component). Reach for it when: (a) the function is a prop to a `memo` child, (b) it's a dependency of another hook (`useEffect`, `useMemo`), or (c) profiling shows real waste.
- **`useCallback` without `memo` on the child.** Stable props are irrelevant if the child doesn't compare props — children re-render with their parent by default.
- **Non-function props breaking memo anyway.** Passing inline objects/arrays (`style={{...}}`, `items={[...]}`) recreates them each render and defeats `memo` exactly like functions do — those need `useMemo`.
- **Wrong dependencies.** Extra deps make the cache churn needlessly; missing deps cause stale behavior. Trust the lint rule.

## Practice Exercises

1. **Break it on purpose.** Comment out the `useCallback` version of `getAdjective` and uncomment the plain one. Click the counter and count the `"Navbar is rendered"` logs. Restore `useCallback` and compare.
2. **Stale closure demo.** Change the deps to `[]`. Click the counter several times — why does the Navbar button still say `another0`? Explain in one sentence using the phrase "captured variable."
3. **Wire up `count2`.** Add a second button in `App` that increments `count2`. With `useCallback([count])` in place, verify that clicking it re-renders `App` but *not* `Navbar` (no console log). Then remove `useCallback` and watch `Navbar` re-render on `count2` clicks too.
4. **Use the `adjective` state.** Pass the `adjective` state variable to Navbar instead of the literal `"good"`, add a button that calls `setAdjective("great")`, and predict — before clicking — whether Navbar re-renders. Verify.
5. **Rewrite with `useMemo`.** Replace `useCallback(() => "another" + count, [count])` with the equivalent `useMemo` call, confirm identical behavior, then go one step further: memoize the *string* `"another" + count` itself with `useMemo` and pass that instead of a function. Which approach re-renders Navbar less?

---

## Appendix: Original Vite Template Notes

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
