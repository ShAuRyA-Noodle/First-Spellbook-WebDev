# Lec-117: The `useMemo` Hook in React — Memoization & Expensive Re-computation

> **Course folder:** `Lec-117 useMemo Hook React` · **Stack:** Vite 5 + React 18 · **Package name:** `video-117`

## Overview

Every time a React component's state or props change, **the entire function component runs again from top to bottom**. That's usually fine — most render logic is cheap. But what happens when your render body contains an **expensive computation**, like searching through an array with *30 million* elements?

Answer: that expensive work re-runs on **every single re-render**, even when the data it depends on hasn't changed at all. Click a counter button → component re-renders → 30-million-element search runs again → the UI feels sluggish.

**Memoization** is the fix. Memoization means *"cache the result of a computation, and only recompute it when its inputs change."* React ships this capability as the **`useMemo`** hook:

```js
const memoizedValue = useMemo(() => computeSomethingExpensive(a, b), [a, b])
```

This lecture's demo makes the problem — and the fix — impossible to miss: it hunts for a "magical" object inside a 30,000,000-element array, first *without* memoization (commented out in the code) and then *with* `useMemo`, and lets you feel the difference by hammering a counter button.

---

## What You'll Learn

- Why a React function component **re-executes its whole body** on every state update.
- What an **expensive computation** looks like in practice (linear search over 30M items).
- What **memoization** is and how `useMemo(fn, deps)` implements it.
- The **`useMemo` signature**: the create function, the dependency array, and the cached return value.
- **Dependency array semantics** — when React recomputes vs. when it returns the cached value.
- **Referential equality** (`Object.is`) — why replacing the `numbers` array with a *new* array triggers a recompute, while unrelated state updates (the counter) do not.
- How `useMemo` differs from **`useCallback`** and **`React.memo`**.
- When *not* to reach for `useMemo` (premature optimization).
- Common pitfalls: wrong/missing dependencies, memoizing cheap values, creating fresh objects inline.

---

## Project Structure

```
Lec-117 useMemo Hook React/
├── index.html              # Vite entry HTML — mounts <div id="root">, loads /src/main.jsx
├── package.json            # Scripts (dev/build/lint/preview) + React 18 / Vite 5 deps
├── README.md               # ← These lecture notes
├── public/
│   └── vite.svg            # Static asset served at /vite.svg
└── src/
    ├── main.jsx            # ReactDOM.createRoot → renders <App /> in StrictMode
    ├── App.jsx             # ★ The useMemo demo (all lecture logic lives here)
    ├── App.css             # Component styles (logo, card) — Vite template defaults
    ├── index.css           # Global styles / dark-light theme — Vite template defaults
    └── assets/
        └── react.svg       # React logo asset
```

> `node_modules/` and `package-lock.json` exist but are irrelevant to the lesson.

---

## Concept Deep-Dives (with the actual demo code)

### 1. The expensive data: a 30-million-element array

At the very top of `src/App.jsx` — **outside the component**, so it's built once when the module loads — the demo constructs a gigantic array of objects. Exactly one of them is "magical":

```js
const nums = new Array(30_000_000).fill(0).map((_, i)=>{
  return {
    index: i,
    isMagical: i===29_000_000
  }
})
```

- `new Array(30_000_000).fill(0)` creates 30 million slots.
- `.map((_, i) => ({ index: i, isMagical: i === 29_000_000 }))` turns each slot into an object.
- Only the element at index **29,000,000** has `isMagical: true` — and it sits near the *end* of the array, so a linear search must scan almost everything before finding it. That's the whole point: the search is deliberately slow.

### 2. What the demo computes — the expensive search

Inside `App`, the component needs to find that magical object:

```js
// const magical = numbers.find(item=>item.isMagical===true) // Expensive Computation
const magical = useMemo(() => numbers.find(item=>item.isMagical===true), [numbers])
```

The **commented-out line is the "before" picture**. `Array.prototype.find` walks the array element by element until the predicate returns `true` — here, ~29 million iterations. On typical hardware this takes a noticeable fraction of a second *every time it runs*.

### 3. The problem: every re-render recomputes — without `useMemo`

The component also has a counter:

```js
const [count, setCount] = useState(0)
const [numbers, setNumbers] = useState(nums)
```

Clicking the button calls `setCount`, which **re-renders `App`**. A re-render means the *entire function body executes again* — including that `numbers.find(...)` line. With the plain (commented-out) version:

1. Click "count is 0" → `count` becomes 1 → React re-runs `App()`.
2. `numbers.find(...)` scans ~29M elements **again**, even though `numbers` did not change.
3. The button feels laggy — every click pays the full search cost for a result we already know.

The counter has *nothing to do* with the magical number, yet the magical-number search is re-billed on every counter click. That's wasted work, and it's exactly what memoization eliminates.

### 4. The fix: `useMemo(fn, deps)` — signature and semantics

```js
const magical = useMemo(() => numbers.find(item=>item.isMagical===true), [numbers])
```

`useMemo` takes two arguments:

| Argument | In this demo | Role |
|---|---|---|
| **1. Create function** `() => ...` | `() => numbers.find(item => item.isMagical === true)` | A zero-argument function that computes and **returns** the value to cache. |
| **2. Dependency array** `deps` | `[numbers]` | The list of reactive inputs the computation reads. React watches these. |
| **Return value** | `magical` (the found object, e.g. `{ index: 29000000, isMagical: true }`) | The cached result of the create function. |

**Semantics on each render:**

- **First render:** React calls the create function, runs the expensive `find`, caches the result, returns it.
- **Later renders:** React compares each entry in `[numbers]` against its value from the previous render using **`Object.is`** (essentially `===`).
  - **All deps unchanged** → React **skips** the create function entirely and returns the **cached** `magical`. Counter clicks are now instant.
  - **Any dep changed** → React re-runs the create function, caches the new result, and returns it.

### 5. Dependency array semantics & referential equality — proven by the button

The demo's button is crafted to demonstrate *both* branches of the dependency check:

```jsx
<button onClick={() => {
  setCount((count) => count + 1);
  if(count == 10){
    setNumbers(new Array(10_000_000).fill(0).map((_, i)=>{
      return {
        index: i,
        isMagical: i===9_000_000
      }
    }))
  }

}}>
  count is {count}
</button>
```

- **Clicks 1–10:** only `setCount` runs. `numbers` is **the same array reference** as before, so `Object.is(prevNumbers, numbers)` is `true` → `useMemo` returns the cached `magical` → no 29M-element scan → the button responds instantly. This is the payoff.
- **The click when `count == 10`:** `setNumbers(...)` replaces the state with a **brand-new 10-million-element array** whose magical item lives at index **9,000,000**. A new array is a *different object in memory*, so `Object.is(prevNumbers, newNumbers)` is `false` → the dependency changed → `useMemo` **recomputes**, finds the new magical object, and the UI updates to *"Magical number is 9000000"*. You'll feel one deliberate lag spike on that click — proof the recompute really happened, and only happened when it should.

**Referential equality is the key idea here.** React does **not** deep-compare the 10M/30M elements (that would itself be expensive). It compares *references*. Two consequences:

1. Mutating an array in place (`numbers.push(...)`) would **not** trigger a recompute — same reference. State must be replaced immutably, as the demo does.
2. Creating a new array/object *every render* as a dependency would make `useMemo` useless — the dep would "change" every time. Keep dependencies stable (state, props, memoized values).

The result is rendered at the top of the JSX:

```jsx
<span>Magical number is {magical.index}</span>
```

Shows `29000000` initially, then `9000000` after the array swap.

---

## Full Code Walkthrough — `src/App.jsx` line by line

```jsx
import { useState, useMemo } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
```

- **Line 1:** Named imports of the two hooks used: `useState` (reactive state) and `useMemo` (memoized computation).
- **Lines 2–3:** Logo assets — `reactLogo` bundled from `src/assets/`, `viteLogo` served from `public/` (root-absolute `/vite.svg`).
- **Line 4:** Component-scoped styles.

```jsx
const nums = new Array(30_000_000).fill(0).map((_, i)=>{
  return {
    index: i,
    isMagical: i===29_000_000
  }
})
```

- **Module scope, not component scope** — this runs exactly once when the file is first imported (so initial page load pays this cost once, and re-renders never rebuild it). `30_000_000` uses JavaScript's numeric separators for readability. Each object is `{ index, isMagical }`; only index 29,000,000 is magical.

```jsx
function App() {
  const [count, setCount] = useState(0)
  const [numbers, setNumbers] = useState(nums)
```

- **`count`** — a totally unrelated piece of state whose only job is to force re-renders when the button is clicked.
- **`numbers`** — state initialized to the giant `nums` array. Making it *state* (rather than using `nums` directly) lets the demo later *replace* it and show the dependency array reacting.

```jsx
  // const magical = numbers.find(item=>item.isMagical===true) // Expensive Computation
  const magical = useMemo(() => numbers.find(item=>item.isMagical===true), [numbers])
```

- **Commented line:** the naive version — recomputes the ~29M-element scan on *every* render (the lecture's "before").
- **Live line:** the memoized version — computes once, then serves the cached object until `[numbers]` changes by reference (the "after").

```jsx
  return (
    <>
      <div>
        <span>Magical number is {magical.index}</span>
```

- Renders the memoized result. `magical` is the found object; `.index` is `29000000` (or `9000000` after the swap).

```jsx
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
```

- Standard Vite template chrome (logos + heading); not part of the lesson logic.

```jsx
      <div className="card">
        <button onClick={() => {
          setCount((count) => count + 1);
          if(count == 10){
            setNumbers(new Array(10_000_000).fill(0).map((_, i)=>{
              return {
                index: i,
                isMagical: i===9_000_000
              }
            }))
          }

        }}>
          count is {count}
        </button>
```

- **`setCount((count) => count + 1)`** uses the *functional updater* form — safe against stale values, and notably immune to React 18 batching quirks.
- **`if(count == 10)`** reads the `count` captured by *this render's closure* — i.e., the value shown on the button when you clicked. So the swap fires on the click made **while the button reads "count is 10"** (the 11th click). Note it uses loose equality `==` (works here since both sides are numbers, but `===` is the convention).
- **`setNumbers(new Array(10_000_000)...)`** — the new, smaller array with `isMagical` at index 9,000,000. New reference → `useMemo` dep `[numbers]` changes → one intentional recompute.

```jsx
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

- Remaining template boilerplate, closing the fragment, and the default export consumed by `main.jsx`.

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

- React 18's `createRoot` API mounts `<App />` into the `#root` div from `index.html`.
- **`<React.StrictMode>` matters for this lecture:** in development, StrictMode **double-invokes** component render functions to surface impure code. Without `useMemo`, that means the expensive `find` could run *twice per render* in dev. (`useMemo`'s create function is also treated as render-phase code and must stay pure.)

### Supporting files (brief)

- **`index.html`** — minimal Vite shell: `<div id="root">` + `<script type="module" src="/src/main.jsx">`.
- **`src/index.css`** — global template styles: dark/light `color-scheme`, centered flex `body`, button styling.
- **`src/App.css`** — `#root` layout, logo hover glows, the spinning-React-logo animation, `.card` padding.
- **`package.json`** — `"name": "video-117"`; scripts `dev` / `build` / `lint` / `preview`; `react@^18.2.0`, `react-dom@^18.2.0`, `vite@^5.1.0`, ESLint + React plugins.

---

## `useMemo` vs `useCallback` vs `React.memo`

| | `useMemo` | `useCallback` | `React.memo` |
|---|---|---|---|
| **What it is** | Hook | Hook | Higher-order component (not a hook) |
| **What it caches** | The **return value** of a computation | The **function itself** (a stable reference) | The **rendered output** of a whole component |
| **Signature** | `useMemo(() => value, deps)` | `useCallback(fn, deps)` | `React.memo(Component, arePropsEqual?)` |
| **Recomputes / re-renders when…** | Any dep fails `Object.is` vs last render | Any dep changes → new function reference | Any prop fails shallow comparison |
| **Typical use** | Expensive derived data (like this demo's 29M-element `find`) | Passing stable callbacks to memoized children / effect deps | Skipping re-renders of pure child components |
| **Equivalent form** | — | `useCallback(fn, deps)` ≡ `useMemo(() => fn, deps)` | — |
| **This lecture's example** | `useMemo(() => numbers.find(item=>item.isMagical===true), [numbers])` | (not used here) | (not used here) |

**How they combine:** `React.memo` on a child only helps if the props you pass it are referentially stable — which is exactly what `useMemo` (for values) and `useCallback` (for functions) provide from the parent.

---

## When NOT to Use `useMemo` (Premature Optimization)

`useMemo` is an *optimization*, not a correctness tool. It has its own costs: React must store the cached value and previous deps, and compare deps on every render. Skip it when:

1. **The computation is cheap.** `a + b`, formatting a string, filtering a 20-item list — the dependency comparison can cost as much as the work itself. This demo needed a *30-million*-element array to make the cost visible; your todo list does not qualify.
2. **The dependencies change on almost every render anyway.** If deps are always "new," you pay for the comparison *and* the recompute — pure overhead.
3. **You haven't measured.** Profile first (React DevTools Profiler, `console.time`). Memoize what's provably slow, not what "feels like it might be."
4. **You're using it for correctness.** React documents that it may discard the cache in some situations (e.g., future features, offscreen rendering). Your code must still work if the create function re-runs — treat `useMemo` purely as a performance hint.
5. **The real fix is structural.** Often you can move state down, lift expensive content into `children`, or compute the value once outside the component (exactly what this demo does with the module-level `nums`).

Rule of thumb: **write it plain first; memoize when the profiler tells you to.**

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

1. Wait for the initial render (building 30M objects takes a moment — that's the point).
2. Click the counter rapidly. With `useMemo` in place, clicks are snappy — the cached `magical` is reused.
3. On the click where the button reads **"count is 10"**, feel the single lag spike as `numbers` is replaced and `useMemo` legitimately recomputes; the heading flips to *"Magical number is 9000000"*.
4. **Experiment:** comment the `useMemo` line back out and uncomment the plain `find` line — now *every* click lags. That contrast is the entire lecture.

> Other scripts: `npm run build` (production build), `npm run preview` (serve the build), `npm run lint` (ESLint).

---

## Key Takeaways

- A state update re-runs the **whole component function** — any expensive expression in the body re-executes too.
- `useMemo(create, deps)` caches `create()`'s **return value** and only recomputes when a dep changes by **`Object.is` / referential** comparison.
- Unrelated state (the counter) no longer pays for unrelated computation (the magical-number search).
- Recomputation is triggered by **new references**, not by "deep" changes — which is why the demo swaps in a brand-new array to force it.
- `useMemo` caches values, `useCallback` caches functions, `React.memo` caches component output — three tools, one theme: *skip work whose inputs didn't change*.
- Memoization is a **performance hint, not a semantic guarantee** — code must remain correct if the cache is dropped.

## Common Pitfalls

- **Wrong or missing dependencies.** Writing `[]` instead of `[numbers]` here would freeze `magical` at its first value forever — after the array swap, the UI would still show `29000000`. Every reactive value read inside the create function belongs in the deps (the `eslint-plugin-react-hooks` dependency in this project's `package.json` exists to catch exactly this).
- **Memoizing cheap values.** Wrapping trivial arithmetic in `useMemo` adds memory + comparison overhead and clutters the code for zero gain.
- **Unstable dependencies.** Passing an inline object/array literal as a dep (`[{...}]`) defeats memoization — it's a new reference every render.
- **Mutating instead of replacing.** `numbers.push(x)` keeps the same reference, so `useMemo` (and React generally) won't notice. Always replace state immutably, as the demo's `setNumbers(new Array(...))` does.
- **Side effects inside the create function.** It runs during render and must be pure — no `setState`, no subscriptions, no DOM writes (that's `useEffect`'s job).
- **Loose equality in logic** (`count == 10`) — harmless here but prefer `===` to avoid coercion surprises.

## Practice Exercises

1. **Feel the "before."** Comment out the `useMemo` line and restore `const magical = numbers.find(item=>item.isMagical===true)`. Click the counter 10 times and describe the difference. Wrap the search in `console.time('find') / console.timeEnd('find')` and record the per-render cost in both versions.
2. **Break the deps on purpose.** Change the dependency array to `[]` and click until the array swap fires. What does the heading show, and why? Then set deps to `[numbers, count]` — how many times does the search run across 12 clicks, and why is that worse?
3. **Prove referential equality.** Add a second button that calls `setNumbers(prev => prev)` (same reference) and a third that calls `setNumbers([...numbers])` (shallow copy). Using a `console.log` inside the `useMemo` create function, verify which one triggers a recompute and explain the result in terms of `Object.is`.
4. **Extend with `useCallback` + `React.memo`.** Extract the magical-number display into a `<MagicalBadge value={magical} onReset={...} />` child wrapped in `React.memo`, passing `onReset` via `useCallback`. Confirm with the React DevTools Profiler that counter clicks no longer re-render the child.
5. **Derive more memoized data.** Add a `useMemo` that computes the *sum of the indexes of the first 1,000 elements* of `numbers`, with correct deps. Then argue (in a comment) whether this memoization is justified or premature — and what measurement would settle it.

---

## Appendix: Original Vite Template Notes

The original `README.md` shipped with this project (preserved verbatim):

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
