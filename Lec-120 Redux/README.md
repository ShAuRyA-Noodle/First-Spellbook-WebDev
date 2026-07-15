# Lec-120: Redux — Global State Management with Redux Toolkit

> **Course project:** A Vite + React counter app powered by **Redux Toolkit** and **React-Redux**.
> One number lives in a single global store, and *two completely unrelated components* (`App` and `Navbar`) read and stay in sync with it automatically.

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
- How to build the app-wide store with **`configureStore`** and register slice reducers under named keys.
- How to make the store available to every component using **`<Provider>`** in `main.jsx`.
- How components **read** global state with **`useSelector`** and **update** it with **`useDispatch`**.
- How two independent components (`App` and `Navbar`) staying in sync *proves* the state is truly global.
- The complete one-way Redux data flow: click → dispatch → reducer → new state → re-render.
- When to reach for Redux vs. React's built-in Context API.

---

## 3. Project Structure

```
Lec-120 Redux/
├── index.html                      # Vite entry HTML — <div id="root"> + module script
├── package.json                    # Scripts + deps (@reduxjs/toolkit, react-redux)
├── vite.config.js                  # Vite config (React plugin)
├── public/                         # Static assets (vite.svg)
└── src/
    ├── main.jsx                    # App entry — wraps <App /> in Redux <Provider>
    ├── App.jsx                     # Counter UI — dispatches increment/decrement/multiply
    ├── App.css                     # Component styles (Vite template)
    ├── index.css                   # Global styles (Vite template)
    ├── assets/                     # react.svg
    ├── components/
    │   └── Navbar.jsx              # Reads the SAME counter state — proof of global state
    └── redux/
        ├── store.js                # configureStore — the single global store
        └── counter/
            └── counterSlice.js     # createSlice — state + reducers + auto action creators
```

Notice the convention: Redux code lives in its own `src/redux/` folder, with each feature ("counter") getting its own subfolder and slice file. As the app grows you'd add `src/redux/todos/todosSlice.js`, `src/redux/user/userSlice.js`, etc.

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
    },
})
```

The state shape this creates is `{ counter: { value: 0 } }`.

### 4.2 Slice

**Definition:** A "slice" is one feature's portion of the store — its initial state plus the reducer functions that update it, bundled together. The store is a pie; each feature owns a slice of it.

**In this project** (`src/redux/counter/counterSlice.js`):

```js
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
```

### 4.3 Reducer

**Definition:** A function that takes the current `state` (and optionally an `action`) and computes the **next** state. Reducers are the *only* place state changes are described. They must be pure — no API calls, no randomness.

**In this project** — a case reducer inside the slice:

```js
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1
    },
```

### 4.4 Action

**Definition:** A plain object describing *what happened*, e.g. `{ type: 'counter/increment' }`. You never build these by hand with RTK — `createSlice` generates an **action creator** function for every case reducer:

**In this project** (`src/redux/counter/counterSlice.js`):

```js
// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount, multiply } = counterSlice.actions
```

Calling `increment()` returns `{ type: 'counter/increment' }`. Calling `incrementByAmount(5)` returns `{ type: 'counter/incrementByAmount', payload: 5 }`.

### 4.5 Dispatch

**Definition:** The *only* way to change the store: you `dispatch(action)`. The store runs the action through the reducers to compute new state. In React, the `useDispatch` hook gives you the dispatch function.

**In this project** (`src/App.jsx`):

```js
  const dispatch = useDispatch()
```

```jsx
        <button onClick={() => dispatch(decrement())}>-</button>
```

### 4.6 Selector

**Definition:** A function that *extracts* a specific value from the global state. The `useSelector` hook runs your selector and **subscribes** the component: whenever that value changes, the component re-renders.

**In this project** — used in *two different files*:

`src/App.jsx`:

```js
  const count = useSelector((state) => state.counter.value)
```

`src/components/Navbar.jsx`:

```js
  const count = useSelector((state) => state.counter.value)
```

The path `state.counter.value` reads as: from the whole store state → the `counter` key (named in `store.js`) → the `value` field (named in `initialState`).

---

## 5. Concept Deep-Dives

### 5.1 `createSlice` — state + logic in one place

The heart of Redux Toolkit. Here is the **entire** slice file, verbatim (`src/redux/counter/counterSlice.js`):

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
    multiply: (state)=>{
        state.value *=2
    }
  },
})

// Action creators are generated for each case reducer function
export const { increment, decrement, incrementByAmount, multiply } = counterSlice.actions

export default counterSlice.reducer
```

Piece by piece:

- **`name: 'counter'`** — the slice's identity. It becomes the prefix of every generated action type: `counter/increment`, `counter/decrement`, `counter/incrementByAmount`, `counter/multiply`. This is what you'll see in Redux DevTools.
- **`initialState`** — the state this slice starts with: `{ value: 0 }`. Note that it's an *object*, not a bare number — this makes it easy to add fields later.
- **`reducers: { ... }`** — one "case reducer" per way the state can change. Each receives the current `state`; reducers that need extra data (like `incrementByAmount`) also receive the `action` and read `action.payload`.
- **The Immer magic** — `state.value += 1` *looks* like mutation, which classic Redux forbids. But `createSlice` wraps every case reducer with the **Immer** library: `state` here is a *draft proxy*. Immer records what you "changed" on the draft and produces a brand-new immutable state object behind the scenes. You get the safety of immutability with the readability of mutation. (Read the comment in the code above — it says exactly this.)
- **Two exports, two audiences:**
  - `counterSlice.actions` (named exports) → for **components**, which dispatch them.
  - `counterSlice.reducer` (default export) → for the **store**, which registers it.

### 5.2 `configureStore` — assembling the store

The **entire** store file, verbatim (`src/redux/store.js`):

```js
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from "./counter/counterSlice"

export const store = configureStore({
    reducer: {
        counter: counterReducer,
    },
})

// https://stackoverflow.com/questions/54385323/what-is-a-difference-between-action-reducer-and-store-in-redux
```

- `counterReducer` is the slice file's **default export** (`counterSlice.reducer`). The import name is arbitrary; default exports can be named anything at the import site.
- The `reducer: { counter: counterReducer }` object is a map of *state keys* to *slice reducers*. The key `counter` is why selectors read `state.counter.value`. **Rename the key here and every selector path changes.**
- `configureStore` also silently gives you good defaults classic Redux made you wire up by hand: Redux DevTools support, and middleware that warns about accidental state mutation and non-serializable values in development.
- Adding a second feature is one line: `reducer: { counter: counterReducer, todos: todosReducer }` → state becomes `{ counter: {...}, todos: {...} }`.

### 5.3 `<Provider>` — plugging the store into React

The **entire** entry file, verbatim (`src/main.jsx`):

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
- It uses React Context *internally* to make the `store` reachable by every descendant component. Because it wraps `<App />` at the very top, **every** component in the app can call `useSelector`/`useDispatch` with zero prop passing.
- If you forget the `Provider`, `useSelector` throws: *"could not find react-redux context value; please ensure the component is wrapped in a `<Provider>`"* — one of the most common beginner errors.

### 5.4 `useSelector` + `useDispatch` — the component side

The **entire** main component, verbatim (`src/App.jsx`):

```jsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment, multiply } from './redux/counter/counterSlice'

function App() { 
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()

  return (
    <>
      <Navbar />
      <div>
        <button onClick={() => dispatch(decrement())}>-</button>
        Currently count is {count}
        <button onClick={() => dispatch(increment())}>+</button>
        <button onClick={() => dispatch(multiply())}>*</button>
      </div>

    </>
  )
}

export default App
```

Two hooks do all the work:

- **`useSelector((state) => state.counter.value)`** — *reading*. Receives the whole store state, returns just the piece this component cares about. It also **subscribes**: when `state.counter.value` changes, React-Redux re-renders `App`.
- **`useDispatch()`** — *writing*. Returns the store's `dispatch` function. Note the button handler is `() => dispatch(increment())`, **not** `dispatch(increment())` — you must pass a function to `onClick`, otherwise it dispatches once on render.
- Notice `increment()` is *called* inside dispatch. `increment` is an action **creator**; calling it produces the action object `{ type: 'counter/increment' }`, and *that object* is what gets dispatched.
- Notice what's **absent**: no `useState` for the count, no props passed to `<Navbar />`. All shared state concerns are handled by Redux.

### 5.5 Navbar — the proof that state is global

The **entire** Navbar, verbatim (`src/components/Navbar.jsx`):

```jsx
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

const Navbar = () => {
  const count = useSelector((state) => state.counter.value)

  return (
    <div>
      I am a navbar and counter is {count}
    </div>
  )
}

export default Navbar
```

This is the "aha" moment of the lecture:

- `Navbar` receives **zero props** — check `App.jsx`: it's rendered as bare `<Navbar />`.
- Yet it displays the *exact same* count as `App`, using the *exact same* selector: `(state) => state.counter.value`.
- Click **+** in `App` and the text in `Navbar` updates *instantly*, because both components are independently subscribed to the same slice of the same store.
- With plain `useState`, making this work would require lifting the count into a common parent and drilling it into both components as props. With Redux, any component — no matter how deeply nested, no matter where in the tree — connects to the state directly.

**Same state, many readers, no props. That is global state management.**

---

## 6. Full Code Walkthrough (Bottom-Up)

Follow the data from definition to display:

### Step 1 — `counterSlice.js`: define the state and how it changes

```js
const initialState = {
  value: 0,
}
```

The slice declares its starting state and four ways to change it (`increment`, `decrement`, `incrementByAmount`, `multiply`). It exports the action creators (for components) and the reducer (for the store):

```js
export const { increment, decrement, incrementByAmount, multiply } = counterSlice.actions

export default counterSlice.reducer
```

### Step 2 — `store.js`: register the slice in the global store

```js
import counterReducer from "./counter/counterSlice"

export const store = configureStore({
    reducer: {
        counter: counterReducer,
    },
})
```

The slice reducer is mounted at the `counter` key. Global state is now `{ counter: { value: 0 } }`.

### Step 3 — `main.jsx`: hand the store to React

```jsx
    <Provider store={store}>
    <App />
    </Provider>
```

Every component under `<App />` can now access the store through hooks.

### Step 4 — `App.jsx`: read + write the state

```js
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()
```

`App` reads the count and wires three buttons to three dispatches:

```jsx
        <button onClick={() => dispatch(decrement())}>-</button>
        Currently count is {count}
        <button onClick={() => dispatch(increment())}>+</button>
        <button onClick={() => dispatch(multiply())}>*</button>
```

### Step 5 — `Navbar.jsx`: an independent second reader

```js
  const count = useSelector((state) => state.counter.value)
```

No props, no parent coordination — it subscribes on its own and always shows the current value.

**Run it:** the page shows `I am a navbar and counter is 0` above `- Currently count is 0 + *`. Click **+** twice → both read **2**. Click ***** → both read **4** (the `multiply` reducer runs `state.value *= 2`). Click **-** → both read **3**.

---

## 7. The Redux Data Flow (One-Way Loop)

What happens when you click the **+** button, step by step:

```
 ┌──────────────────────────────────────────────────────────────────────┐
 │                                                                      │
 │  1. USER EVENT                                                       │
 │     User clicks the "+" button in App.jsx                           │
 │            │                                                         │
 │            ▼                                                         │
 │  2. DISPATCH                                                         │
 │     onClick runs: dispatch(increment())                              │
 │     increment() builds the action: { type: 'counter/increment' }     │
 │            │                                                         │
 │            ▼                                                         │
 │  3. REDUCER                                                          │
 │     The store routes the action to the counter slice reducer.        │
 │     Case reducer runs:  state.value += 1                             │
 │     (Immer turns this draft "mutation" into a NEW immutable state)   │
 │            │                                                         │
 │            ▼                                                         │
 │  4. NEW STATE                                                        │
 │     Store state: { counter: { value: 0 } } → { counter: { value: 1 }}│
 │            │                                                         │
 │            ▼                                                         │
 │  5. NOTIFY SUBSCRIBERS                                               │
 │     react-redux re-runs every useSelector.                           │
 │     App's selector:    state.counter.value → 1 (changed!)            │
 │     Navbar's selector: state.counter.value → 1 (changed!)            │
 │            │                                                         │
 │            ▼                                                         │
 │  6. RE-RENDER                                                        │
 │     Both App and Navbar re-render with count = 1.                    │
 │     UI now shows the new value — and waits for the next event. ──────┘
 │
 └── strictly one-way: View → Action → Reducer → Store → View
```

Compressed to one line:

```
click → dispatch(increment()) → reducer (state.value += 1 via Immer) → new store state → subscribed components (App + Navbar) re-render
```

Key properties of this loop:

- **Predictable:** state can *only* change via dispatched actions running through reducers — never `state.counter.value = 99` from a component.
- **Traceable:** every change has a named action (`counter/increment`) you can watch in Redux DevTools, replay, and time-travel through.
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
| **Debugging** | React DevTools only | Redux DevTools: full action log, state diffs, time travel |
| **Middleware / async** | Roll your own | Built-in middleware pipeline (thunks included in RTK by default) |
| **Boilerplate** | Minimal for one value; grows messy with many contexts | Slightly more upfront (slice + store), then scales cleanly |

**Rule of thumb:** if you're sharing a couple of rarely-changing values, Context is enough. If many components read and write shared state that changes often — carts, auth sessions, cached server data, this counter pattern at scale — Redux Toolkit pays for its setup many times over. They also aren't rivals: this very project uses Context *inside* `react-redux`'s `Provider` to deliver the store.

---

## 9. How to Run

From the `Lec-120 Redux` folder:

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite dev server
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). You should see the Navbar line and the counter row. Click **+**, **-**, and ***** and watch **both** components update together.

Other scripts from `package.json`:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
```

---

## 10. Key Takeaways

1. **One store, single source of truth.** All shared state lives in one place, created by `configureStore`.
2. **Slices organize by feature.** `createSlice` bundles a feature's `name`, `initialState`, and `reducers`, and auto-generates action creators and action types (`counter/increment`).
3. **"Mutation" in reducers is safe — because it isn't mutation.** Immer converts your draft edits (`state.value += 1`) into new immutable state. This *only* works inside `createSlice`/`createReducer`.
4. **Two exports per slice:** named action creators for components, default reducer for the store.
5. **`Provider` bridges Redux and React.** Wrap the app once in `main.jsx`; every descendant gets hook access.
6. **`useSelector` reads, `useDispatch` writes.** Components never touch the store object directly.
7. **The store key defines the selector path.** `reducer: { counter: ... }` in `store.js` is why selectors say `state.counter.value`.
8. **Global state means zero props.** `Navbar` shows the live count without receiving anything from `App` — that's the whole point.

### Common Pitfalls

- **Forgetting `<Provider>`** in `main.jsx` → runtime error: "could not find react-redux context value."
- **Dispatching the action creator instead of the action:** `dispatch(increment)` (missing `()`) does nothing useful — you must dispatch the *object* the creator returns: `dispatch(increment())`.
- **Calling dispatch directly in `onClick`:** `onClick={dispatch(increment())}` runs on every render (and can loop). Always wrap: `onClick={() => dispatch(increment())}`.
- **Selecting too much:** `useSelector((state) => state)` re-renders the component on *every* state change anywhere. Select the smallest value you need (`state.counter.value`).
- **Both returning *and* mutating in a case reducer.** With Immer, either mutate the draft (`state.value += 1`) **or** return a brand-new state — never both in the same reducer.
- **Trying Immer-style mutation outside RTK** (e.g., in component code or a hand-rolled reducer) — the draft magic only exists inside `createSlice`/`createReducer`.
- **Mismatched paths after renaming.** If you rename the `counter` key in `store.js` or the `value` field in `initialState`, every selector using `state.counter.value` silently returns `undefined`.

### Practice Exercises

1. **Use the unused action.** `incrementByAmount` is defined in the slice and exported, but no component dispatches it. Add a button in `App.jsx` — e.g. `+5` — that runs `dispatch(incrementByAmount(5))`, and confirm the payload flows through `action.payload`.
2. **Add a `reset` reducer.** In `counterSlice.js`, add `reset: (state) => { state.value = 0 }`, export it from `counterSlice.actions`, and wire a "Reset" button. Watch the `counter/reset` action appear in Redux DevTools.
3. **Add a second reader.** Create `src/components/Footer.jsx` that shows `Footer sees: {count}` using its own `useSelector`, and render it below the buttons in `App.jsx` — three independent subscribers, one state.
4. **Add a second slice.** Create `src/redux/theme/themeSlice.js` with `initialState = { dark: true }` and a `toggleTheme` reducer; register it in `store.js` as `theme: themeReducer`; read `state.theme.dark` in `Navbar` to render "Dark mode: on/off" with a toggle button.
5. **Break it on purpose (then fix it).** Temporarily remove `<Provider store={store}>` from `main.jsx`, read the exact error `useSelector` throws, then restore it. Next, change the store key from `counter` to `myCounter` and observe what the selectors return — then update the selectors to match.

---

## 11. Appendix: Original Vite Template Notes

*The original `README.md` from the Vite scaffold, preserved verbatim:*

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
