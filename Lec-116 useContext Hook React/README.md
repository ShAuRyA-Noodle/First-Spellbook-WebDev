# Lec-116: The `useContext` Hook — Escaping Prop Drilling with React's Context API

> **Course:** Web Development — React
> **Project:** `video-116` (Vite + React 18)
> **Topic:** Prop drilling, `createContext`, `Context.Provider`, and the `useContext` hook — demonstrated with a live *before/after* comparison inside one project.

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
3. **Consume** the value anywhere below with `useContext(counterContext)` (in `Button.jsx` and `Component1.jsx`).

The intermediate components (`Navbar`) no longer touch the data at all. Think of context as a "teleporter" or "broadcast channel" for data — the Provider broadcasts, and any descendant can tune in.

![Context API diagram](Context%20API.png)

*The diagram above visualizes the idea: instead of props hopping down every rung of the ladder, the Provider makes the value directly reachable from any consumer in its subtree.*

---

## 2. What You'll Learn

- What **prop drilling** is, why it happens, and why it hurts maintainability.
- How to create a context with **`createContext()`** and what the **default value** argument means.
- How to expose state to a subtree with **`<Context.Provider value={...}>`**.
- How to read context in any descendant with the **`useContext()`** hook.
- How to share **both state and its updater** (`{count, setCount}`) through a single context, so deep children can *update* parent state too.
- How to compare the *before* (prop drilling) and *after* (Context API) versions of the exact same app.
- **When** Context is the right tool — versus plain props, component composition, or a state manager (Redux/Zustand/Jotai).
- Common pitfalls: consumers re-rendering on every context change, and the "forgot the Provider" bug.

---

## 3. Project Structure

```text
Lec-116 useContext Hook React/
├── Context API.png                  # Diagram of Provider → consumers data flow (embedded above)
├── README.md                        # ← these lecture notes
├── our app.md                       # Extra note file: sketch of our component tree (see §4)
├── index.html                       # Vite entry HTML (mounts #root, loads src/main.jsx)
├── package.json                     # Project "video-116" — React 18, Vite 5
├── vite.config.js                   # Standard Vite + React plugin config
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
    ├── App.css / index.css          # Vite template styles
    ├── assets/react.svg
    ├── context/
    │   └── context.js               # createContext → exports counterContext
    └── components/
        ├── Navbar.jsx               # No props at all anymore!
        ├── Button.jsx               # useContext → calls setCount from deep in the tree
        └── Component1.jsx           # useContext → reads count directly
```

Two things to notice about this layout:

- **`public/without_context_api/` is the BEFORE snapshot.** It is *not* imported or executed by the app — it's the original prop-drilling implementation, deliberately parked in `public/` so you can open the two versions side by side and diff them. (Aside: `public/` is normally for static assets that Vite copies verbatim into the build; stashing source files here is purely a teaching convenience.)
- **`our app.md` is an extra note file** — a four-line sketch of the component nesting used in this lecture. Its content is quoted verbatim in the next section.

---

## 4. The Note File: `our app.md`

This tiny file records the component hierarchy the whole lecture revolves around. Its full content, verbatim:

```text
App.jsx
    Navbar.jsx  
        Button.jsx
            Component1.jsx
```

Read it as an indentation tree: `App` renders `Navbar`, which renders `Button`, which renders `Component1`. The state (`count`) lives at the top; the consumer lives at the bottom — a **3-hop gap** that props must bridge in the *before* version, and that Context bridges instantly in the *after* version.

---

## 5. Concept Deep-Dive: Prop Drilling vs. Context — Side by Side

All snippets below are the **actual, verbatim source** from this project.

### 5.1 The root: `App.jsx`

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

**AFTER — `src/App.jsx` (Context Provider):**

```jsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import { counterContext } from './context/context'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <counterContext.Provider value={{count, setCount}}>
    <Navbar/>
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
      </counterContext.Provider>
    </>
  )
}

export default App
```

Key changes:

- `<Navbar/>` now takes **zero props**.
- The whole UI is wrapped in `<counterContext.Provider value={{count, setCount}}>` — note the value is an **object holding both the state and its setter**, so deep descendants can read *and* update the counter.
- The double braces in `value={{count, setCount}}` are: outer `{}` = JSX expression, inner `{}` = object literal using ES6 shorthand (equivalent to `{count: count, setCount: setCount}`).

### 5.2 The context itself: `src/context/context.js`

There is no *before* counterpart for this file — it only exists in the Context version:

```js
import { createContext } from "react";

export const counterContext = createContext(0)
```

- `createContext(defaultValue)` returns a **context object** with a `.Provider` component attached.
- The argument (`0` here) is the **default value** — what `useContext(counterContext)` returns **only when there is no matching Provider above the consumer**. It is *not* an "initial state"; once a Provider is mounted, its `value` prop always wins.
- The context object is exported so both the Provider (`App.jsx`) and every consumer can import **the same object identity** — that shared identity is how React matches consumers to providers.

⚠️ Note the type mismatch baked into this demo: the default is the *number* `0`, but the Provider supplies an *object* `{count, setCount}`. See Pitfalls (§8) for why that matters.

### 5.3 The pass-through layer: `Navbar.jsx`

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
import React from 'react'
import Button from './Button'

const Navbar = () => {
  return (
    <>
    <div>
      Navbar
    </div>
    <Button/>
    </>
  )
}

export default Navbar
```

The middleman is liberated: no props in, no props out. If you later rename `count` or add ten more shared values, `Navbar` doesn't change at all.

### 5.4 The middle layer: `Button.jsx`

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
import React, {useContext} from 'react'
import Component1 from './Component1'
import { counterContext } from '../context/context'

const Button = () => {
  const value = useContext(counterContext)
  return (
    <div>
      <button onClick={() => value.setCount((count) => count + 1)}><span><Component1/></span>I am a button</button>
    </div>
  )
}

export default Button
```

This is the payoff of putting `setCount` into the context value: a component **three levels deep can now update App's state** via `value.setCount((count) => count + 1)` — using the functional-updater form, which is the safe way to compute new state from previous state.

### 5.5 The leaf consumer: `Component1.jsx`

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
import React, { useContext } from 'react'
import { counterContext } from '../context/context'


const Component1 = () => {
  const value = useContext(counterContext)
  return (
    <div>
    {value.count}
    </div>
  )
}

export default Component1
```

`useContext(counterContext)` returns whatever the nearest enclosing `counterContext.Provider` passed as `value` — here, the `{count, setCount}` object — so the leaf reads `value.count` directly. Zero props travelled through `Navbar` or `Button` to make this happen.

### 5.6 The pattern in three steps

| Step | API | Where in this project |
|---|---|---|
| 1. **Create** | `createContext(defaultValue)` | `src/context/context.js` → `export const counterContext = createContext(0)` |
| 2. **Provide** | `<counterContext.Provider value={{count, setCount}}>` | `src/App.jsx`, wrapping the whole returned tree |
| 3. **Consume** | `const value = useContext(counterContext)` | `src/components/Button.jsx` and `src/components/Component1.jsx` |

---

## 6. Full Code Walkthrough

### 6.1 Bootstrapping (shared by both versions)

**`index.html`** — Vite's entry point. The browser loads this file, which mounts an empty `<div id="root">` and pulls in the React entry module:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**`src/main.jsx`** — creates the React root and renders `<App/>` inside `StrictMode` (which double-invokes renders in development to surface impure code — a reason you may see effects/logs fire twice in dev):

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

**`package.json`** — a stock Vite 5 + React 18 setup named `video-116`. The scripts you'll actually use are `dev` (development server with HMR) and `build`:

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

### 6.2 Walkthrough: the BEFORE version (prop drilling)

Trace `count`'s journey through `public/without_context_api/` (all code shown verbatim in §5):

1. **`App.jsx`** — `useState(0)` creates `count`/`setCount`. The Vite-template button in App can update it (`onClick={() => setCount((count) => count + 1)}`). To let the navbar subtree *display* it, App renders `<Navbar count={count}/>`.
2. **`components/Navbar.jsx`** — destructures `({count})` from props and immediately re-emits it: `<Button count={count}/>`. Pure forwarding; hop 1.
3. **`components/Button.jsx`** — destructures `({count})` and forwards again: `<Component1 count={count}/>`. Hop 2. Its `<button>` has no click handler — it *can't* update state, because `setCount` was never drilled down.
4. **`components/Component1.jsx`** — destructures `({count})` and finally renders `{count}`. Hop 3 — destination reached.

**Cost accounting:** 1 value × 3 hops = 3 prop declarations + 3 prop forwards, in components that don't use the value. Every extra shared value multiplies this. (Also note: these files import paths like `./assets/react.svg` and `./App.css` that don't exist inside `public/` — this copy is a frozen reference snapshot, not runnable code.)

### 6.3 Walkthrough: the AFTER version (Context API)

Trace the same value through `src/`:

1. **`context/context.js`** — `createContext(0)` builds the `counterContext` object and exports it. This file is the single source of the context's *identity*.
2. **`App.jsx`** — still owns the state via `useState(0)` (Context does **not** replace `useState` — it replaces the *delivery mechanism*). App wraps its output in `<counterContext.Provider value={{count, setCount}}>`, publishing both the value and the updater to every descendant. `<Navbar/>` is rendered prop-less.
3. **`components/Navbar.jsx`** — completely context-unaware. Renders a `div` and `<Button/>`. It neither imports the context nor handles any props.
4. **`components/Button.jsx`** — calls `const value = useContext(counterContext)` and wires `onClick={() => value.setCount((count) => count + 1)}`. Clicking "I am a button" deep in the tree updates state that lives in App — and both counters on screen (App's card button and Component1's number) change in lockstep, because they render the same state.
5. **`components/Component1.jsx`** — calls `useContext(counterContext)` and renders `{value.count}`. Nested inside Button's `<span>`, it shows the live count *inside* the button label.

**Runtime behavior:** click either App's `count is N` button or the navbar's `I am a button` — both call the same `setCount`, App re-renders, the Provider's `value` becomes a fresh object, and every consumer (`Button`, `Component1`) re-renders with the new count. One state, one source of truth, many consumers.

---

## 7. When to Use What: Context vs. Props vs. State Managers

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

## 8. Key Takeaways and Pitfalls

### Key takeaways

1. **Prop drilling** = forwarding props through components that don't use them. It's a smell that grows with tree depth.
2. Context is a **3-step pattern**: `createContext` (once, in its own module) → `<Context.Provider value={...}>` (at the owner) → `useContext(Context)` (at every consumer).
3. Context **transports** state; it doesn't own it. The state still lives in `useState` inside `App`.
4. Put **both the value and its setter** in the `value` object (`{count, setCount}`) so deep descendants can update the state — something the drilled version here couldn't do.
5. Consumers use the **nearest Provider above them**; the `createContext(defaultValue)` argument applies only when there is no Provider at all.
6. Intermediate components (`Navbar`) become **cleaner and more reusable** because they stop carrying data that isn't theirs.

### Pitfalls

- **Every consumer re-renders on every context change.** When `value` changes (by `Object.is` comparison), *all* components calling `useContext(counterContext)` re-render — even if they only use a part of the value that didn't change. Also, `value={{count, setCount}}` builds a **new object each App render**, so consumers re-render whenever App does, regardless of whether `count` changed. Fine here; in bigger apps, memoize the value (`useMemo(() => ({count, setCount}), [count])`), split contexts (state vs. dispatch), or move to a store with selectors.
- **Missing Provider → default value, and often a crash.** Remove the Provider from `App.jsx` and `useContext(counterContext)` returns the default `0`. Then `value.count` is `undefined` (blank UI), and clicking the button throws `TypeError: value.setCount is not a function` — because a number has no `setCount`. This demo's default (`0`, a number) doesn't even match the provided shape (an object) — a classic footgun. Safer patterns: `createContext(null)` plus a custom hook that throws a clear error when the context is `null`, or a default object matching the real shape.
- **Consumers must be *inside* the Provider.** A component rendered as a sibling of (or above) the Provider gets the default value, not the provided one. Note how `App.jsx` opens the Provider *before* `<Navbar/>` and closes it after everything.
- **One shared context object.** Provider and consumers must import the *same* exported `counterContext`. Calling `createContext` again elsewhere creates a different, unrelated context that will silently hand out defaults.
- **Don't make everything context.** Global-feeling code is harder to trace and test; components that read context are implicitly coupled to their ancestors.

### Practice exercises

1. **Break it on purpose:** delete the `<counterContext.Provider>` wrapper (keep its children) in `src/App.jsx`. Predict what `Component1` shows and what happens when you click "I am a button" — then run it and check your prediction against the Pitfalls section. Restore the Provider afterwards.
2. **Add a second context:** create `themeContext` in `src/context/context.js` holding `{theme, setTheme}` (`"light"`/`"dark"`). Provide it from `App`, consume it in `Navbar` to render the current theme name, and add a toggle button in `Button`.
3. **Add a decrement:** give `Component1` its own "-1" button using `value.setCount((count) => count - 1)`. Confirm App's `count is N` button stays in sync.
4. **Observe the re-renders:** add `console.log("Navbar render")`, `console.log("Button render")`, `console.log("Component1 render")` at the top of each component. Click the buttons and explain, from the logs, which components re-render and why (remember StrictMode double-invokes renders in dev).
5. **Harden the context:** change the default to `createContext(null)` and write a custom hook `useCounter()` in `context.js` that calls `useContext(counterContext)` and throws `new Error("useCounter must be used within counterContext.Provider")` when the value is `null`. Refactor `Button` and `Component1` to use it.

---

## 9. How to Run

From the project folder (`Lec-116 useContext Hook React`):

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`). You'll see the Navbar text, the "I am a button" button with the live count embedded inside it, and the standard Vite counter card — click either button and watch both counters update together.

Other available scripts: `npm run build` (production build), `npm run preview` (serve the build), `npm run lint` (ESLint).

> The `public/without_context_api/` files are reference-only and are **not** part of the running app — compare them side by side with `src/` in your editor.

---

## 10. Appendix: Original Vite Template Notes

The original boilerplate `README.md` that shipped with this template, preserved verbatim:

> # React + Vite
>
> This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
>
> Currently, two official plugins are available:
>
> - [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
> - [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
