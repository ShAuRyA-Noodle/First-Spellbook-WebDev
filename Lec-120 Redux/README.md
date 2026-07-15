# Lec-120: Redux — Global State Management with Redux Toolkit

> **Course project:** A Vite + React **Redux Console** powered by **Redux Toolkit** and **React-Redux**.
> One number lives in a single global store. **Four independent components** — a Navbar badge, a Control Desk, a read-only Mirror Display, and a Dispatch Log — all read from that same store and stay in sync automatically, with zero props passed between any of them.

---

## 1. Overview: Why Does Redux Exist?

### The problem: state that many components need

In plain React, state lives *inside* a component (`useState`). If a deeply nested component needs that state, you must pass it down through props — through every intermediate component, even ones that don't care about it. This is called **prop drilling**, and in a large app it becomes painful:

- Intermediate components receive props they never use.
- Moving a component means rewiring the prop chain.
- Sibling components (like a `Navbar` and a page body) can't easily share state at all — you have to "lift state up" to a common ancestor, which quickly becomes the root of the app.

### The solution: a single global store

**Redux** solves this by moving shared state *out of the component tree* into one central, app-wide object called the **store**. Any component, anywhere in the tree, can:

1. **Read** any piece of that state (subscribe to it), and
2. **Request changes** to it (dispatch actions),

without a single prop being passed. State updates flow in **one predictable direction** (action → reducer → new state → re-render), which makes apps easier to debug and reason about.

### Redux Toolkit: the modern standard

"Classic" Redux required a lot of boilerplate: hand-written action type constants, action creator functions, switch-statement reducers, and immutable update spreads. **Redux Toolkit (RTK)** — the `@reduxjs/toolkit` package — is the *official, recommended* way to write Redux today. It gives you:

| Old Redux pain | Redux Toolkit fix |
|---|---|
| Action type string constants | `createSlice` auto-generates them (`"counter/increment"`) |
| Hand-written action creators | Auto-generated from your reducer names |
| Switch-statement reducers | Plain functions in a `reducers` object |
| Careful immutable spreads (`{...state}`) | **Immer** lets you write `state.value += 1` safely |
| Manual store setup + devtools wiring | `configureStore` does it in one call |
| One slice reacting to another slice's action | `extraReducers` + `builder.addCase` |

This project uses exactly two Redux libraries (see `package.json`):

```json
"dependencies": {
    "@reduxjs/toolkit": "^2.2.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-redux": "^9.1.0"
}
```

- **`@reduxjs/toolkit`** — the Redux logic layer (`createSlice`, `configureStore`).
- **`react-redux`** — the React bindings (`<Provider>`, `useSelector`, `useDispatch`) that connect the store to components.

---

## 2. What You'll Learn

- Why global state management exists and what problem Redux solves (prop drilling, shared state between siblings).
- The core Redux vocabulary: **store, slice, reducer, action, dispatch, selector**.
- How to define state logic with **`createSlice`** — and why "mutating" `state.value += 1` is actually safe (Immer).
- How to add a **payload action** (`incrementByAmount`) and read `action.payload` inside a reducer.
- How to build the app-wide store with **`configureStore`** and register *multiple* slice reducers under named keys.
- How to make the store available to every component using **`<Provider>`** in `main.jsx`.
- How components **read** global state with **`useSelector`** and **update** it with **`useDispatch`**.
- How **four** independent components (`Navbar`, `CounterPanel`, `MirrorPanel`, `ActivityLog`) staying in sync *proves* the state is truly global.
- How one slice can react to *another* slice's actions with **`extraReducers`** / `builder.addCase` — the same "global" idea applied inside the reducer layer, not just the component layer.
- The complete one-way Redux data flow: click → dispatch → reducer(s) → new store state → every subscribed component re-renders.
- When to reach for Redux vs. React's built-in Context API.

---

## 3. Project Structure

```
Lec-120 Redux/
├── index.html                          # Vite entry HTML — <div id="root"> + module script
├── package.json                        # Scripts + deps (@reduxjs/toolkit, react-redux)
├── vite.config.js                      # Vite config (React plugin)
├── public/                             # Static assets (vite.svg)
└── src/
    ├── main.jsx                        # App entry — wraps <App /> in Redux <Provider>
    ├── App.jsx                         # Composes the console: Navbar, topology, panels, log
    ├── App.css                         # Console layout + component styles
    ├── index.css                       # Design tokens (colors, spacing, type) + resets
    ├── assets/                         # react.svg (unused by the new UI, left in place)
    ├── hooks/
    │   └── usePulse.js                 # Shared "flash on change" hook — the broadcast effect
    ├── utils/
    │   └── formatNumber.js             # Intl.NumberFormat wrapper for displayed counts
    ├── components/
    │   ├── Navbar.jsx                  # Reads counter.value — subscriber #1
    │   ├── StoreTopology.jsx           # Live wiring diagram of the store (signature element)
    │   ├── CounterPanel.jsx            # Control Desk — dispatches every counter action
    │   ├── MirrorPanel.jsx             # Read-only subscriber #2 — proof of global state
    │   └── ActivityLog.jsx             # Renders the activityLog slice — a dispatch history
    └── redux/
        ├── store.js                    # configureStore — the single global store
        ├── counter/
        │   └── counterSlice.js         # createSlice — state + reducers + auto action creators
        └── activityLog/
            └── activityLogSlice.js     # A second slice that listens to the FIRST slice's actions
```

Notice the convention: Redux code lives in its own `src/redux/` folder, with each feature getting its own subfolder and slice file. This project now has **two** features — `counter` and `activityLog` — which is exactly how you'd keep scaling: `src/redux/todos/todosSlice.js`, `src/redux/user/userSlice.js`, and so on.

---

## 4. Core Vocabulary (with the Actual Project Code)

Every term below is defined first, then shown **verbatim** where it appears in this project.

### 4.1 Store

**Definition:** The single JavaScript object that holds the *entire* application state. There is exactly **one** store per app — the "single source of truth."

**In this project** (`src/redux/store.js`):

```js
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    activityLog: activityLogReducer,
  },
})
```

The state shape this creates is `{ counter: { value: 0 }, activityLog: { entries: [], nextId: 1 } }`.

### 4.2 Slice

**Definition:** A "slice" is one feature's portion of the store — its initial state plus the reducer functions that update it, bundled together. The store is a pie; each feature owns a slice of it.

**In this project**, there are now two slices. The first (`src/redux/counter/counterSlice.js`):

```js
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
```

The second (`src/redux/activityLog/activityLogSlice.js`) — a slice that mostly reacts to *another* slice's actions rather than defining many of its own:

```js
export const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState,
  reducers: {
    clearLog: (state) => {
      state.entries = []
    },
  },
  extraReducers: (builder) => {
```

### 4.3 Reducer

**Definition:** A function that takes the current `state` (and optionally an `action`) and computes the **next** state. Reducers are the *only* place state changes are described. They must be pure — no API calls, no randomness.

**In this project** — a case reducer inside the counter slice:

```js
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1
    },
```

And a reducer in the activity log slice that runs *whenever a counter action is dispatched*, even though it lives in a completely different slice:

```js
function logEntry(state, action) {
  state.entries.unshift({
    id: state.nextId,
    type: action.type,
    payload: action.payload ?? null,
  })
  state.nextId += 1
  if (state.entries.length > MAX_ENTRIES) {
    state.entries.length = MAX_ENTRIES
  }
}
```

### 4.4 Action

**Definition:** A plain object describing *what happened*, e.g. `{ type: 'counter/increment' }`. You never build these by hand with RTK — `createSlice` generates an **action creator** function for every case reducer:

**In this project** (`src/redux/counter/counterSlice.js`):

```js
// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount, multiply, reset } =
  counterSlice.actions
```

Calling `increment()` returns `{ type: 'counter/increment' }`. Calling `incrementByAmount(5)` returns `{ type: 'counter/incrementByAmount', payload: 5 }`. The `activityLog` slice's `logEntry` reducer reads that exact `action.payload` off the same action object — it's the same action, seen by a second reducer.

### 4.5 Dispatch

**Definition:** The *only* way to change the store: you `dispatch(action)`. The store runs the action through **every** registered reducer (not just "the relevant one") to compute new state. In React, the `useDispatch` hook gives you the dispatch function.

**In this project** (`src/components/CounterPanel.jsx`):

```js
const dispatch = useDispatch()
```

```jsx
<button
  type="button"
  className="btn btn--negative"
  onClick={() => dispatch(decrement())}
  aria-label="Decrement counter by 1"
>
```

One `dispatch(decrement())` call runs the `counter` slice's `decrement` reducer **and** the `activityLog` slice's `logEntry` reducer (via `extraReducers`) in the same tick. That's the store routing one action through its whole reducer tree.

### 4.6 Selector

**Definition:** A function that *extracts* a specific value from the global state. The `useSelector` hook runs your selector and **subscribes** the component: whenever that value changes, the component re-renders.

**In this project** — used in *four different components*:

`src/components/Navbar.jsx`:

```js
const count = useSelector((state) => state.counter.value)
```

`src/components/CounterPanel.jsx`:

```js
const count = useSelector((state) => state.counter.value)
```

`src/components/MirrorPanel.jsx` — reading from *both* slices:

```js
const count = useSelector((state) => state.counter.value)
const lastEntry = useSelector((state) => state.activityLog.entries[0])
```

`src/components/ActivityLog.jsx`:

```js
const entries = useSelector((state) => state.activityLog.entries)
```

The path `state.counter.value` reads as: from the whole store state → the `counter` key (named in `store.js`) → the `value` field (named in `initialState`). Same pattern for `state.activityLog.entries`.

---

## 5. Concept Deep-Dives

### 5.1 `createSlice` — state + logic in one place

The **entire** counter slice file, verbatim (`src/redux/counter/counterSlice.js`):

```js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: 0,
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
    multiply: (state) => {
      state.value *= 2
    },
    reset: (state) => {
      state.value = 0
    },
  },
})

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount, multiply, reset } =
  counterSlice.actions

export default counterSlice.reducer
```

Piece by piece:

- **`name: 'counter'`** — the slice's identity. It becomes the prefix of every generated action type: `counter/increment`, `counter/decrement`, `counter/incrementByAmount`, `counter/multiply`, `counter/reset`. This is what you'll see in Redux DevTools, and it's also exactly what the Dispatch Log panel prints.
- **`initialState`** — the state this slice starts with: `{ value: 0 }`. Note that it's an *object*, not a bare number — this makes it easy to add fields later.
- **`reducers: { ... }`** — one "case reducer" per way the state can change. `increment`, `decrement`, `multiply`, and `reset` take no extra data; `incrementByAmount` also receives the `action` and reads `action.payload`.
- **The Immer magic** — `state.value += 1` *looks* like mutation, which classic Redux forbids. But `createSlice` wraps every case reducer with the **Immer** library: `state` here is a *draft proxy*. Immer records what you "changed" on the draft and produces a brand-new immutable state object behind the scenes. You get the safety of immutability with the readability of mutation.
- **Two exports, two audiences:**
  - `counterSlice.actions` (named exports) → for **components**, which dispatch them.
  - `counterSlice.reducer` (default export) → for the **store**, which registers it.

### 5.2 A second slice that listens to the first: `extraReducers`

The **entire** activity log slice file, verbatim (`src/redux/activityLog/activityLogSlice.js`):

```js
import { createSlice } from '@reduxjs/toolkit'
import {
  increment,
  decrement,
  incrementByAmount,
  multiply,
  reset,
} from '../counter/counterSlice'

// This slice never dispatches its own "write" actions from the UI (besides
// clearLog). Instead it listens in on the COUNTER slice's actions via
// extraReducers, and keeps its own record of what happened. Two independent
// slices reacting to one dispatched action is the same "single store, many
// subscribers" idea as Navbar + CounterPanel reading the same value — just
// applied to reducers instead of components.
const MAX_ENTRIES = 8

const initialState = {
  entries: [],
  nextId: 1,
}

function logEntry(state, action) {
  state.entries.unshift({
    id: state.nextId,
    type: action.type,
    payload: action.payload ?? null,
  })
  state.nextId += 1
  if (state.entries.length > MAX_ENTRIES) {
    state.entries.length = MAX_ENTRIES
  }
}

export const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState,
  reducers: {
    clearLog: (state) => {
      state.entries = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(increment, logEntry)
      .addCase(decrement, logEntry)
      .addCase(incrementByAmount, logEntry)
      .addCase(multiply, logEntry)
      .addCase(reset, logEntry)
  },
})

export const { clearLog } = activityLogSlice.actions

export default activityLogSlice.reducer
```

Why this matters, beyond just "a log feature":

- **`reducers: { clearLog }`** defines this slice's *own* action — the only one a component ever dispatches directly (`dispatch(clearLog())`).
- **`extraReducers`** lets a slice respond to action types it does **not** own. `builder.addCase(increment, logEntry)` says: "whenever the `counter/increment` action (imported straight from `counterSlice`) is dispatched, run `logEntry` against *this* slice's state." No import of a string like `"counter/increment"` — you pass the actual action creator, and RTK matches on its `.type`.
- This is a second, deeper proof of "global store": it's not just that two *components* can read the same value — it's that two *slices*, which know nothing about each other's state, can both react to the same *dispatched action*. The store is the one thing tying them together.
- `state.entries.length = MAX_ENTRIES` is a valid Immer draft operation — truncating an array by assigning `.length` works the same as `Array.prototype.length = n` and Immer tracks it correctly.

### 5.3 `configureStore` — assembling the store

The **entire** store file, verbatim (`src/redux/store.js`):

```js
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counter/counterSlice'
import activityLogReducer from './activityLog/activityLogSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    activityLog: activityLogReducer,
  },
})

// https://stackoverflow.com/questions/54385323/what-is-a-difference-between-action-reducer-and-store-in-redux
```

- `counterReducer` and `activityLogReducer` are each slice file's **default export**. The import name is arbitrary; default exports can be named anything at the import site.
- The `reducer: { counter: ..., activityLog: ... }` object is a map of *state keys* to *slice reducers*. The keys are why selectors read `state.counter.value` and `state.activityLog.entries`. **Rename a key here and every selector using that path breaks.**
- `configureStore` also silently gives you good defaults classic Redux made you wire up by hand: Redux DevTools support, and middleware that warns about accidental state mutation and non-serializable values in development.
- Adding a *third* feature is one line, exactly like adding the second one was: `reducer: { counter: ..., activityLog: ..., theme: themeReducer }`.

### 5.4 `<Provider>` — plugging the store into React

The **entire** entry file, verbatim (`src/main.jsx`, unchanged from the original scaffold):

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {store} from "./redux/store.js"
import { Provider } from 'react-redux'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
    <App />
    </Provider>
  </React.StrictMode>,
)
```

- `Provider` comes from **`react-redux`** (the bindings library), not from Redux Toolkit itself.
- It uses React Context *internally* to make the `store` reachable by every descendant component. Because it wraps `<App />` at the very top, **every** component in the app — `Navbar`, `CounterPanel`, `MirrorPanel`, `ActivityLog`, `StoreTopology` — can call `useSelector`/`useDispatch` with zero prop passing.
- If you forget the `Provider`, `useSelector` throws: *"could not find react-redux context value; please ensure the component is wrapped in a `<Provider>`"* — one of the most common beginner errors.
- Nothing here changed when the app grew from one slice to two, or from two subscribers to four. `Provider` doesn't know or care how many slices exist — it just hands out the one `store` object.

### 5.5 `App.jsx` — composing the console

The **entire** App component, verbatim (`src/App.jsx`):

```jsx
import './App.css'
import Navbar from './components/Navbar'
import StoreTopology from './components/StoreTopology'
import CounterPanel from './components/CounterPanel'
import MirrorPanel from './components/MirrorPanel'
import ActivityLog from './components/ActivityLog'

function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar />

      <main className="console" id="main-content">
        <section className="console__intro">
          <p className="console__kicker">Global state, made visible</p>
          <h1 className="console__heading">
            One store. Four independent subscribers.
          </h1>
          <p className="console__lede">
            Everything below reads from the same Redux store — no props are
            passed between any of these panels. Dispatch an action on the
            Control Desk and watch the Navbar badge, the Mirror Display, and
            the Dispatch Log update at the same instant.
          </p>
        </section>

        <StoreTopology />

        <div className="console__grid">
          <CounterPanel />
          <MirrorPanel />
        </div>

        <ActivityLog />

        <footer className="console__footer">
          <p>
            Built with <code>@reduxjs/toolkit</code> + <code>react-redux</code>.
            State shape:{' '}
            <code>{'{ counter: { value }, activityLog: { entries } }'}</code>
          </p>
        </footer>
      </main>
    </>
  )
}

export default App
```

Notice what `App` does **not** do: it never reads `state.counter.value` itself, and it never passes a `count` prop to any child. Its only job is layout — every panel fetches what it needs directly from the store via its own `useSelector` call. This is the structural payoff of Redux: `App` can rearrange, add, or remove panels without touching any data-fetching logic.

The `<a className="skip-link" href="#main-content">` and `id="main-content"` on `<main>` aren't Redux-related — they're a standard accessibility pattern (a keyboard user can jump straight past the Navbar into the console) — but they're part of the real file, so they're included here verbatim too.

### 5.6 `Navbar` — the first proof that state is global

The **entire** Navbar, verbatim (`src/components/Navbar.jsx`):

```jsx
import { useSelector } from 'react-redux'
import { usePulse } from '../hooks/usePulse'
import { formatNumber } from '../utils/formatNumber'

const Navbar = () => {
  // Navbar renders nowhere near CounterPanel or MirrorPanel in the tree,
  // receives zero props, and still stays perfectly in sync — because all
  // three read the exact same `state.counter.value` from the one store.
  const count = useSelector((state) => state.counter.value)
  const pulsing = usePulse(count)

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <span className="navbar__mark" aria-hidden="true">
            <span className="navbar__mark-dot" />
          </span>
          <span className="navbar__title">Redux Console</span>
          <span className="navbar__subtitle">Lec-120</span>
        </div>

        <div
          className={`navbar__readout${pulsing ? ' is-pulsing' : ''}`}
          title="This badge subscribes to the store independently of the panels below"
        >
          <span className="navbar__live" aria-hidden="true" />
          <span className="navbar__readout-label" translate="no">
            store.counter.value
          </span>
          <span
            className="navbar__readout-value"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatNumber(count)}
          </span>
        </div>
      </div>
    </header>
  )
}

export default Navbar
```

This is the "aha" moment of the lecture, unchanged in spirit from the original demo:

- `Navbar` receives **zero props** — check `App.jsx`: it's rendered as bare `<Navbar />`, a sibling of `<main>`, not a descendant of any panel.
- Yet it displays the *exact same* count as the Control Desk and Mirror Display, using the *exact same* selector: `(state) => state.counter.value`.
- Click **+** on the Control Desk and the badge in the Navbar updates *instantly*, because all three components are independently subscribed to the same slice of the same store.
- `usePulse(count)` (see §5.9) adds a purely cosmetic glow when the value changes — it does not affect the Redux logic at all. It's there so the sync is visible, not just true.
- `formatNumber(count)` runs the value through `Intl.NumberFormat` instead of interpolating the raw number — harmless at `4`, but it keeps large values (say, after a big `incrementByAmount`) readable and locale-correct. `aria-atomic="true"` makes the `aria-live` region announce the *whole* new value, not just the changed digit.

**Same state, many readers, no props. That is global state management.**

### 5.7 `CounterPanel` — the transmitter

The **entire** Control Desk component, verbatim (`src/components/CounterPanel.jsx`):

```jsx
import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  decrement,
  increment,
  incrementByAmount,
  multiply,
  reset,
} from '../redux/counter/counterSlice'
import { usePulse } from '../hooks/usePulse'
import { formatNumber } from '../utils/formatNumber'

const CounterPanel = () => {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()
  const pulsing = usePulse(count)

  const [amount, setAmount] = useState(5)
  const [error, setError] = useState(null)
  const amountInputRef = useRef(null)

  const handleAmountSubmit = (event) => {
    event.preventDefault()
    const parsed = Number(amount)

    if (!Number.isFinite(parsed) || parsed === 0) {
      setError('Enter a non-zero number to dispatch incrementByAmount.')
      amountInputRef.current?.focus()
      return
    }

    setError(null)
    dispatch(incrementByAmount(parsed))
  }

  return (
    <section className="panel counter-panel" aria-labelledby="counter-panel-heading">
      <header className="panel__header">
        <div>
          <p className="panel__eyebrow">Transmitter · dispatches actions</p>
          <h2 id="counter-panel-heading" className="panel__title">
            Control Desk
          </h2>
        </div>
        <span className="panel__tag" translate="no">
          counter
        </span>
      </header>

      <div className={`counter-panel__readout${pulsing ? ' is-pulsing' : ''}`}>
        <span className="counter-panel__value" aria-live="polite" aria-atomic="true">
          {formatNumber(count)}
        </span>
        <span className="counter-panel__value-caption" translate="no">
          state.counter.value
        </span>
      </div>

      <div className="counter-panel__row" role="group" aria-label="Adjust counter by one">
        <button
          type="button"
          className="btn btn--negative"
          onClick={() => dispatch(decrement())}
          aria-label="Decrement counter by 1"
        >
          <span aria-hidden="true">&minus;</span>
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => dispatch(reset())}
        >
          Reset
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => dispatch(multiply())}
          aria-label="Double the counter"
        >
          &times;2
        </button>
        <button
          type="button"
          className="btn btn--positive"
          onClick={() => dispatch(increment())}
          aria-label="Increment counter by 1"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <form className="counter-panel__amount" onSubmit={handleAmountSubmit} noValidate>
        <label className="counter-panel__amount-label" htmlFor="amount-input" translate="no">
          incrementByAmount(payload)
        </label>
        <div className="counter-panel__amount-controls">
          <input
            id="amount-input"
            name="amount"
            type="number"
            inputMode="decimal"
            autoComplete="off"
            className="input"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value)
              if (error) setError(null)
            }}
            aria-describedby={error ? 'amount-hint amount-error' : 'amount-hint'}
            aria-invalid={error ? 'true' : undefined}
            ref={amountInputRef}
          />
          <button type="submit" className="btn btn--accent">
            Add Amount
          </button>
        </div>
        <p id="amount-hint" className="counter-panel__amount-hint">
          Sends <code translate="no">incrementByAmount({amount || 0})</code> —
          the payload travels with the action.
        </p>
        {error && (
          <p id="amount-error" className="counter-panel__amount-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  )
}

export default CounterPanel
```

Key points:

- **`useDispatch()`** — *writing*. Returns the store's `dispatch` function. Every button handler is `() => dispatch(actionCreator())`, **not** `dispatch(actionCreator())` — you must pass a *function* to `onClick`, otherwise it dispatches once on every render.
- **`amount` and `error` are `useState`, not Redux.** They're ephemeral, local-only UI state (what's currently typed in the box, and whether the last submit attempt failed) that nobody else in the app needs to read. Only the *result* of a successful submit — the dispatched `incrementByAmount(amount)` action — touches the global store. This is the standard rule of thumb: local, single-component state stays in `useState`; state that's shared or must survive the component stays in Redux.
- **`incrementByAmount(parsed)`** is called with a plain number; the generated action creator wraps it as `{ type: 'counter/incrementByAmount', payload: parsed }`. Compare this to `increment()`, which takes no argument because that reducer doesn't need `action.payload`.
- **Inline validation, not silent failure.** Submitting `0` or a non-numeric value no longer just does nothing — it sets `error`, renders an `role="alert"` message next to the field, and moves focus back to the input via `amountInputRef`. This has nothing to do with Redux (invalid input never reaches `dispatch`), but it's the difference between a form that fails silently and one that tells you why.
- All five counter actions live in one panel — this is deliberately the *only* place in the whole app that dispatches counter actions, making CounterPanel the "transmitter" and every other panel a "receiver."

### 5.8 `MirrorPanel` and `ActivityLog` — two more receivers

`MirrorPanel` (`src/components/MirrorPanel.jsx`) is the second, deliberately minimal proof of global state: it renders no buttons at all and dispatches nothing.

```jsx
const MirrorPanel = () => {
  const count = useSelector((state) => state.counter.value)
  const lastEntry = useSelector((state) => state.activityLog.entries[0])
  const pulsing = usePulse(count)
  // ...renders formatNumber(count) and formatType(lastEntry?.type), nothing else
}
```

It reads `state.counter.value` — same value, same path, same store as `CounterPanel` — *and* it reads `state.activityLog.entries[0]` to show the type of the most recent action, pulling from the **second** slice. It sits in `App.jsx` as a plain sibling of `CounterPanel` inside `console__grid`; neither panel has a reference to the other.

`ActivityLog` (`src/components/ActivityLog.jsx`) reads only the second slice:

```jsx
const entries = useSelector((state) => state.activityLog.entries)
const dispatch = useDispatch()
// ...
<button onClick={() => dispatch(clearLog())}>Clear</button>
```

It's the one panel that dispatches an action *not* defined in `counterSlice` — `clearLog()`, defined in `activityLogSlice`'s own `reducers`. This demonstrates that a component isn't tied to "the counter slice" or "the activityLog slice" — it just imports whichever action creators it needs and calls `useSelector`/`useDispatch` against the one store.

### 5.9 `usePulse` — making the broadcast visible

The **entire** hook, verbatim (`src/hooks/usePulse.js`):

```js
import { useEffect, useRef, useState } from 'react'

export function usePulse(value, duration = 480) {
  const [pulsing, setPulsing] = useState(false)
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    setPulsing(true)
    const timer = setTimeout(() => setPulsing(false), duration)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return pulsing
}
```

This is plain React — no Redux inside it — but it's what turns "the state is technically in sync" into "you can *see* the state is in sync." `Navbar`, `CounterPanel`, and `MirrorPanel` each call `usePulse(count)` independently; because they all receive the *same* new `count` value on the *same* render pass (React-Redux batches this), all three flash at once. `StoreTopology` calls `usePulse(dispatchCount)` (watching `state.activityLog.nextId`) to trigger the traveling-dot animation described below.

### 5.10 `StoreTopology` — the signature element

`StoreTopology` (`src/components/StoreTopology.jsx`) is a small, purely decorative (`aria-hidden="true"`) wiring diagram: a `STORE` node on one side, four labeled nodes on the other (`Navbar`, `Control Desk`, `Mirror Display`, `Dispatch Log`), connected by lines. It watches `state.activityLog.nextId` — which increments on *every* dispatched counter action, because every one of those actions passes through `activityLogSlice`'s `logEntry` reducer — and uses `usePulse` to flash a signal-colored dot down every wire simultaneously whenever that number changes.

The idea: instead of only *telling* you "one store, many subscribers," the diagram *shows* one pulse leaving the store and arriving at all four nodes at once, every time you click a button. It's marked `aria-hidden="true"` because it's redundant with information already available (and properly labeled) in the panels themselves — a screen reader user doesn't lose anything by skipping it.

---

## 6. Full Code Walkthrough (Bottom-Up)

Follow the data from definition to display:

### Step 1 — `counterSlice.js`: define the state and how it changes

```js
const initialState = {
  value: 0,
}
```

The slice declares its starting state and five ways to change it (`increment`, `decrement`, `incrementByAmount`, `multiply`, `reset`). It exports the action creators (for components) and the reducer (for the store):

```js
export const { increment, decrement, incrementByAmount, multiply, reset } =
  counterSlice.actions

export default counterSlice.reducer
```

### Step 2 — `activityLogSlice.js`: a second slice, reacting to the first

```js
export const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState,
  reducers: {
    clearLog: (state) => { state.entries = [] },
  },
  extraReducers: (builder) => {
    builder
      .addCase(increment, logEntry)
      .addCase(decrement, logEntry)
      .addCase(incrementByAmount, logEntry)
      .addCase(multiply, logEntry)
      .addCase(reset, logEntry)
  },
})
```

Every counter action also updates this slice's `entries` array — proof that "global" applies at the reducer level too.

### Step 3 — `store.js`: register both slices in the global store

```js
import counterReducer from './counter/counterSlice'
import activityLogReducer from './activityLog/activityLogSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    activityLog: activityLogReducer,
  },
})
```

Global state is now `{ counter: { value: 0 }, activityLog: { entries: [], nextId: 1 } }`.

### Step 4 — `main.jsx`: hand the store to React

```jsx
<Provider store={store}>
<App />
</Provider>
```

Every component under `<App />` can now access the store through hooks — no matter how many slices exist.

### Step 5 — `App.jsx`: compose, don't fetch

```jsx
<Navbar />
<main className="console">
  <StoreTopology />
  <div className="console__grid">
    <CounterPanel />
    <MirrorPanel />
  </div>
  <ActivityLog />
</main>
```

`App` never calls `useSelector` itself. It just arranges five components that each independently connect to the store.

### Step 6 — `CounterPanel.jsx`: the only place that dispatches counter actions

```js
const count = useSelector((state) => state.counter.value)
const dispatch = useDispatch()
```

```jsx
<button onClick={() => dispatch(decrement())} aria-label="Decrement counter by 1">
<button onClick={() => dispatch(reset())}>Reset</button>
<button onClick={() => dispatch(multiply())}>&times;2</button>
<button onClick={() => dispatch(increment())} aria-label="Increment counter by 1">
```

...plus a form that dispatches `incrementByAmount(amount)` with a numeric payload.

### Step 7 — `Navbar.jsx` and `MirrorPanel.jsx`: independent readers

```js
const count = useSelector((state) => state.counter.value)
```

Neither receives props, neither knows `CounterPanel` exists, both always show the current value.

**Run it:** the page loads showing `0` in the Navbar badge, the Control Desk, and the Mirror Display, with an empty Dispatch Log. Click **+** twice → all three counters read **2**, and the log shows two `counter/increment` entries. Click **×2** → all three read **4**. Type `10` in the amount box and click **Add Amount** → all three read **14**, and the log's newest row shows `counter/incrementByAmount` with `payload: 10`. Click **Reset** → everything drops back to **0**, logged as `counter/reset`.

---

## 7. The Redux Data Flow (One-Way Loop)

What happens when you click the **+** button on the Control Desk, step by step:

```
 ┌──────────────────────────────────────────────────────────────────────┐
 │                                                                      │
 │  1. USER EVENT                                                       │
 │     User clicks "+" in CounterPanel.jsx                             │
 │            │                                                         │
 │            ▼                                                         │
 │  2. DISPATCH                                                         │
 │     onClick runs: dispatch(increment())                              │
 │     increment() builds the action: { type: 'counter/increment' }     │
 │            │                                                         │
 │            ▼                                                         │
 │  3. REDUCERS (plural)                                                │
 │     The store routes the action to EVERY registered reducer:         │
 │       - counter slice's case reducer runs: state.value += 1          │
 │       - activityLog slice's extraReducer runs: logEntry(state, act.) │
 │     (Immer turns each draft "mutation" into a NEW immutable state)   │
 │            │                                                         │
 │            ▼                                                         │
 │  4. NEW STATE                                                        │
 │     { counter: { value: 0 }, activityLog: { entries: [] } }          │
 │       → { counter: { value: 1 }, activityLog: { entries: [...] } }   │
 │            │                                                         │
 │            ▼                                                         │
 │  5. NOTIFY SUBSCRIBERS                                               │
 │     react-redux re-runs every useSelector across the whole app.      │
 │     Navbar's selector:        state.counter.value      → 1 (changed) │
 │     CounterPanel's selector:  state.counter.value      → 1 (changed) │
 │     MirrorPanel's selectors:  state.counter.value,                   │
 │                                state.activityLog.entries[0] (changed)│
 │     ActivityLog's selector:   state.activityLog.entries   (changed)  │
 │     StoreTopology's selector: state.activityLog.nextId    (changed)  │
 │            │                                                         │
 │            ▼                                                         │
 │  6. RE-RENDER                                                        │
 │     All five components re-render with their own fresh slice of      │
 │     state. usePulse() flashes each one. UI now shows the new value   │
 │     — and waits for the next event. ─────────────────────────────────┘
 │
 └── strictly one-way: View → Action → Reducers → Store → View
```

Compressed to one line:

```
click → dispatch(increment()) → counter reducer + activityLog extraReducer (via Immer) → new store state → every subscribed component (Navbar, CounterPanel, MirrorPanel, ActivityLog, StoreTopology) re-renders
```

Key properties of this loop:

- **Predictable:** state can *only* change via dispatched actions running through reducers — never `state.counter.value = 99` from a component.
- **Traceable:** every change has a named action (`counter/increment`) you can watch in Redux DevTools *and* in this app's own Dispatch Log panel, built entirely from the same actions.
- **Fan-out, not fan-in:** one dispatch can be observed by an unlimited number of reducers and an unlimited number of components — the store doesn't need to know who's listening.
- **Efficient:** a component only re-renders if the value *its own selector* returns actually changed.

---

## 8. Redux vs. Context API

React's built-in Context (which `Provider` itself uses under the hood!) can also share state without prop drilling. So when do you need Redux?

| Aspect | React Context (+ useState/useReducer) | Redux Toolkit |
|---|---|---|
| **What it is** | A dependency-injection mechanism — a way to *pass* a value down the tree | A full state *management* system — store, actions, reducers, middleware, devtools |
| **Setup** | Built into React, zero dependencies | Two packages (`@reduxjs/toolkit`, `react-redux`) |
| **Best for** | Low-frequency, simple values: theme, locale, current user | Frequently-updated, complex, app-wide state touched by many components |
| **Re-render behavior** | *Every* consumer of a context re-renders when its value changes | `useSelector` components re-render only when their *selected slice* changes |
| **Update logic** | Scattered wherever you call setters | Centralized in slice reducers — one place to look |
| **Cross-feature reactions** | You wire this by hand (lift state, pass callbacks) | `extraReducers` lets one slice react to another slice's actions natively — see `activityLogSlice` |
| **Debugging** | React DevTools only | Redux DevTools: full action log, state diffs, time travel |
| **Middleware / async** | Roll your own | Built-in middleware pipeline (thunks included in RTK by default) |
| **Boilerplate** | Minimal for one value; grows messy with many contexts | Slightly more upfront (slice + store), then scales cleanly |

**Rule of thumb:** if you're sharing a couple of rarely-changing values, Context is enough. If many components read and write shared state that changes often — carts, auth sessions, cached server data, or this counter pattern at scale — Redux Toolkit pays for its setup many times over. They also aren't rivals: this very project uses Context *inside* `react-redux`'s `Provider` to deliver the store.

---

## 9. How to Run

From the `Lec-120 Redux` folder:

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite dev server
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). You should see the Navbar, an intro strip, the live store-topology diagram, the Control Desk and Mirror Display side by side, and an empty Dispatch Log. Click **+**, **&minus;**, **×2**, **Reset**, or submit an amount, and watch **all** the panels update together.

Other scripts from `package.json`:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
```

This project has been verified against both:

```bash
npm run lint   # 0 errors, 0 warnings
npm run build  # vite build succeeds, emits dist/
```

---

## 10. Key Takeaways

1. **One store, single source of truth.** All shared state lives in one place, created by `configureStore`.
2. **Slices organize by feature.** `createSlice` bundles a feature's `name`, `initialState`, and `reducers`, and auto-generates action creators and action types (`counter/increment`).
3. **"Mutation" in reducers is safe — because it isn't mutation.** Immer converts your draft edits (`state.value += 1`) into new immutable state. This *only* works inside `createSlice`/`createReducer`.
4. **Two exports per slice:** named action creators for components, default reducer for the store.
5. **`extraReducers` lets slices react to each other.** `activityLogSlice` never dispatches counter actions — it just listens for them via `builder.addCase(increment, logEntry)`.
6. **`Provider` bridges Redux and React.** Wrap the app once in `main.jsx`; every descendant gets hook access, no matter how many panels you add later.
7. **`useSelector` reads, `useDispatch` writes.** Components never touch the store object directly.
8. **The store key defines the selector path.** `reducer: { counter: ..., activityLog: ... }` in `store.js` is why selectors say `state.counter.value` and `state.activityLog.entries`.
9. **Global state means zero props.** `Navbar`, `MirrorPanel`, and `ActivityLog` all show live, correct data without receiving anything from `App` or from each other — that's the whole point.

### Common Pitfalls

- **Forgetting `<Provider>`** in `main.jsx` → runtime error: "could not find react-redux context value."
- **Dispatching the action creator instead of the action:** `dispatch(increment)` (missing `()`) does nothing useful — you must dispatch the *object* the creator returns: `dispatch(increment())`.
- **Calling dispatch directly in `onClick`:** `onClick={dispatch(increment())}` runs on every render (and can loop). Always wrap: `onClick={() => dispatch(increment())}`.
- **Selecting too much:** `useSelector((state) => state)` re-renders the component on *every* state change anywhere. Select the smallest value you need (`state.counter.value`, not the whole `state`).
- **Both returning *and* mutating in a case reducer.** With Immer, either mutate the draft (`state.value += 1`) **or** return a brand-new state — never both in the same reducer.
- **Trying Immer-style mutation outside RTK** (e.g., in component code or a hand-rolled reducer) — the draft magic only exists inside `createSlice`/`createReducer`.
- **Mismatched paths after renaming.** If you rename the `counter` key in `store.js` or the `value` field in `initialState`, every selector using `state.counter.value` silently returns `undefined`.
- **Matching action creators, not strings, in `extraReducers`.** `builder.addCase(increment, ...)` works because `increment` is the actual action creator (RTK reads its `.type` off it). Passing the raw string `'counter/increment'` also works but is easy to typo — prefer importing the action creator, as `activityLogSlice.js` does.
- **Doing non-deterministic work inside a reducer.** `logEntry` uses `state.nextId++` for ordering instead of `Date.now()` or `Math.random()` precisely so the reducer stays a pure function of `(state, action)` — this keeps Redux DevTools time-travel debugging trustworthy.

### Practice Exercises

1. **Add a fifth action.** Add a `double` case reducer that's identical to `multiply` but only fires when the count is positive (hint: read `state.value` before branching). Wire a button for it in `CounterPanel` and confirm it shows up correctly in the Dispatch Log.
2. **Make the log smarter.** `activityLogSlice`'s `logEntry` only stores `type` and `payload`. Extend it to also store the *resulting* `counter.value` after the action — you'll need a `listenerMiddleware` or to read `getState()` from a thunk, since a slice's own reducer can't see another slice's post-update state. Research RTK's `createListenerMiddleware` to do this properly.
3. **Add a third slice.** Create `src/redux/theme/themeSlice.js` with `initialState = { dark: true }` and a `toggleTheme` reducer; register it in `store.js` as `theme: themeReducer`; read `state.theme.dark` in `Navbar` to swap a data attribute on `<html>` for a manual light/dark toggle (independent of the `prefers-color-scheme` support already in `index.css`).
4. **Add a fifth subscriber.** Create `src/components/Footer.jsx` that renders `Footer sees: {count}` using its own `useSelector`, and mount it inside `App.jsx`'s `<main>` — a fifth independent reader, same store.
5. **Break it on purpose (then fix it).** Temporarily remove `<Provider store={store}>` from `main.jsx`, read the exact error `useSelector` throws, then restore it. Next, change the store key from `counter` to `myCounter` in `store.js` and observe what every selector using `state.counter.value` returns — then update all the selectors to match.

---

## 11. Appendix: Original Vite Template Notes

*The original `README.md` from the Vite scaffold, preserved verbatim:*

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
