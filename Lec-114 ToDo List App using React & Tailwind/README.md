# Lec-114 — iTask: A ToDo List App with React, Tailwind CSS & Framer Motion

> **Lecture notes** for the "ToDo List App using React & Tailwind" project — a complete, browser-persistent task manager built with **Vite + React 18**, styled with **Tailwind CSS 3** plus a custom "Squid Game"-inspired neon theme, animated with **Framer Motion**, and using **uuid** for stable keys and **react-icons** for the edit/delete buttons.

---

## 1. Project Overview

**iTask** ("Player Task Management System") is a single-page todo application. Everything lives in one main component (`App.jsx`) plus a small `Navbar` component. The app lets you:

- **Add** a task (minimum 4 characters, via button click or the Enter key)
- **Edit** a task (pulls the text back into the input for re-saving)
- **Delete** a task
- **Toggle completion** with a checkbox (completed tasks get a line-through)
- **Show / hide completed tasks** with a custom animated toggle switch
- **See progress** via a live `done / total` counter and an animated gradient progress bar
- **Persist everything** across page reloads using `localStorage`

There is no backend and no router — this lecture is entirely about **React state, list rendering, controlled inputs, and browser persistence**, wrapped in a heavily-styled UI.

---

## 2. What You'll Learn

- **`useState`** — managing three pieces of state: the input text, the todos array, and a UI filter flag
- **`useEffect`** — loading saved todos from `localStorage` exactly once on mount (empty dependency array)
- **Controlled inputs** — binding `value` + `onChange` so React owns the input text
- **Immutable state updates** — using spread (`[...todos]`), `filter`, `find`, and `findIndex` instead of mutating arrays
- **The `saveToLS(updated)` pattern** — passing the *new* array explicitly to avoid the classic stale-closure bug
- **`localStorage` persistence** — `JSON.stringify` on save, `JSON.parse` on load
- **`uuid`** — generating stable unique `key`s for list items (never use array index for dynamic lists)
- **Conditional rendering** — line-through on completed tasks, an empty-state message, and a "Show Completed" filter
- **Derived state** — computing `doneCount` / `totalCount` on every render instead of storing them
- **Tailwind utility classes** — layout with `flex`, `gap`, `rounded-*`, `space-y-*`, responsive `md:` prefixes
- **Custom Tailwind theme** — extending `colors`, `keyframes`, and `animation` in `tailwind.config.js`
- **react-icons** — importing individual icons (`FaEdit`, `AiFillDelete`) so only what you use gets bundled
- **Framer Motion** — variants, `initial`/`animate`/`exit`, `AnimatePresence` for exit animations, `whileHover`/`whileTap` micro-interactions
- **Event handling patterns** — reading `e.target.name` to identify which checkbox was toggled, `onKeyDown` for Enter-to-submit

---

## 3. Project Structure

```
Lec-114 ToDo List App using React & Tailwind/
├── node_modules/            # dependencies (never edit; not covered here)
├── public/
│   └── vite.svg             # favicon served as-is
├── src/
│   ├── assets/
│   │   └── react.svg        # unused Vite template asset
│   ├── components/
│   │   └── Navbar.jsx       # animated sticky navbar (logo + links)
│   ├── App.css              # leftover Vite template styles (NOT imported anywhere)
│   ├── App.jsx              # ★ the entire todo app: state, handlers, UI
│   ├── index.css            # Tailwind directives + the custom Squid Game theme CSS
│   └── main.jsx             # React entry point (createRoot + StrictMode)
├── .eslintrc.cjs            # ESLint config from the Vite React template
├── .gitignore
├── harry todo.zip           # 📦 instructor's reference copy of the finished project
├── index.html               # Vite HTML shell — <div id="root"> + module script
├── package.json             # scripts + dependencies (name: "video-114")
├── package-lock.json        # exact dependency tree (generated; don't edit)
├── postcss.config.js        # wires Tailwind + Autoprefixer into Vite's CSS pipeline
├── tailwind.config.js       # content globs + custom squid colors/keyframes
└── vite.config.js           # minimal Vite config with the React plugin
```

> **Note:** `harry todo.zip` is the instructor's reference copy of the original lecture project. Keep it for comparison; the live source in `src/` is what these notes walk through.

---

## 4. Concept Deep-Dives (with the actual code)

### 4.1 State with `useState` — three slices, three jobs

```jsx
const [todo, setTodo]               = useState('')
const [todos, setTodos]             = useState([])
const [showFinished, setShowFinished] = useState(true)
```

| State | Type | Purpose |
|---|---|---|
| `todo` | `string` | the *current text in the input box* (a single, in-progress task) |
| `todos` | `array` | the full list — each item is `{ id, todo, isCompleted }` |
| `showFinished` | `boolean` | UI filter: whether completed tasks are visible |

Naming matters in this lecture: **`todo` (singular) is the draft, `todos` (plural) is the list.** They are deliberately separate — typing in the input re-renders only because `todo` changes; the list itself is untouched until you hit SAVE.

Each todo object has exactly three fields:

```jsx
{ id: uuidv4(), todo: todo.trim(), isCompleted: false }
```

### 4.2 Controlled input — React owns the text box

```jsx
<input
  className="squid-input flex-1 rounded-lg px-4 py-2 text-sm"
  type="text"
  placeholder="Enter your task…"
  value={todo}
  onChange={e => setTodo(e.target.value)}
  onKeyDown={handleKeyDown}
/>
```

- `value={todo}` — the DOM input always displays React state, never its own internal value.
- `onChange` — every keystroke calls `setTodo(e.target.value)`, updating state, which re-renders and pushes the new value back into the input. That round-trip is what "controlled" means.
- Because the input is controlled, clearing it after adding is just `setTodo('')` — no DOM manipulation needed.
- **Bonus payoff:** other UI can react to the draft text live. The SAVE button disables itself using the same state:

```jsx
<motion.button
  onClick={handleAdd}
  disabled={todo.trim().length <= 3}
  ...
>
```

And Enter-to-submit is a two-line handler:

```jsx
const handleKeyDown = (e) => { if (e.key === 'Enter') handleAdd() }
```

### 4.3 `localStorage` persistence — the `saveToLS(updated)` pattern

**Loading (once, on mount):**

```jsx
/* load from localStorage */
useEffect(() => {
  const stored = localStorage.getItem('todos')
  if (stored) setTodos(JSON.parse(stored))
}, [])
```

- The empty dependency array `[]` means "run once after the first render."
- `localStorage.getItem` returns a **string or `null`** — hence the `if (stored)` guard *before* `JSON.parse` (parsing `null` or garbage would throw or produce `null`).

**Saving (after every mutation):**

```jsx
/* fixed: always pass the updated array to avoid stale-closure bug */
const saveToLS = (updated) => {
  localStorage.setItem('todos', JSON.stringify(updated))
}
```

The crucial design decision — flagged by the in-code comment itself — is that `saveToLS` **takes the new array as a parameter** instead of reading `todos` from the closure. Why? Because `setTodos(updated)` does **not** update the `todos` variable in the currently-running function; state updates are asynchronous and only visible on the *next* render. A naive version like:

```jsx
// ❌ the classic bug (NOT in this code — shown for contrast)
setTodos(updated)
saveToLS()            // reads the OLD `todos` from the closure → saves stale data
```

would always persist the *previous* list. The fix used everywhere in this app:

```jsx
const updated = /* compute new array */
setTodos(updated)     // update React state
saveToLS(updated)     // persist the SAME new array
```

`localStorage` only stores strings, so the array is serialized with `JSON.stringify` on the way in and revived with `JSON.parse` on the way out.

### 4.4 Adding a task — `handleAdd`

```jsx
const handleAdd = () => {
  if (todo.trim().length <= 3) return
  const updated = [...todos, { id: uuidv4(), todo: todo.trim(), isCompleted: false }]
  setTodos(updated)
  setTodo('')
  saveToLS(updated)
}
```

Step by step:

1. **Guard clause** — tasks of 3 characters or fewer (after trimming whitespace) are rejected. Note this mirrors the button's `disabled` condition, so validation exists in *both* the UI and the handler (defense in depth — the handler is also reachable via Enter).
2. **Immutable append** — `[...todos, newItem]` builds a *brand-new* array. Never `todos.push(...)`: React compares references, and pushing into the same array would not trigger a re-render.
3. **`uuidv4()`** gives the item a globally-unique `id` used later as the React `key` and for edit/delete/toggle lookups.
4. **`setTodo('')`** clears the controlled input.
5. **`saveToLS(updated)`** persists the same new array (see 4.3).

### 4.5 Deleting a task — `handleDelete`

```jsx
const handleDelete = (_, id) => {
  const updated = todos.filter(i => i.id !== id)
  setTodos(updated)
  saveToLS(updated)
}
```

- `filter` returns a **new array** containing every item whose `id` is *not* the one being deleted — immutable removal in one line.
- The first parameter `_` is the click event, deliberately ignored (the underscore is a convention for "unused"). The call site passes both: `onClick={e => handleDelete(e, item.id)}`.

### 4.6 Editing a task — `handleEdit` (the "recycle" pattern)

```jsx
const handleEdit = (_, id) => {
  const target = todos.find(i => i.id === id)
  setTodo(target.todo)
  const updated = todos.filter(i => i.id !== id)
  setTodos(updated)
  saveToLS(updated)
}
```

This lecture's edit is intentionally simple: **edit = remove + refill the input**.

1. `find` locates the item by `id`.
2. Its text is loaded into the input via `setTodo(target.todo)` — the controlled input instantly displays it.
3. The item is *removed from the list* (same `filter` as delete).
4. The user modifies the text and presses SAVE, which runs `handleAdd` and re-inserts it as a fresh item (with a **new** uuid).

Trade-off to understand: this is easy to implement and reuses `handleAdd`, but the task briefly lives *only* in the input box — if the user clears the input or reloads mid-edit, that task is gone (it was already removed and the removal persisted). A production app would edit in place; see the exercises.

### 4.7 Toggling completion — `handleCheckbox` and `e.target.name`

```jsx
const handleCheckbox = (e) => {
  const id    = e.target.name
  const index = todos.findIndex(i => i.id === id)
  const updated = [...todos]
  updated[index] = { ...updated[index], isCompleted: !updated[index].isCompleted }
  setTodos(updated)
  saveToLS(updated)
}
```

Clever trick: each checkbox carries its todo's id in its **`name` attribute**, so one shared handler can identify which row fired:

```jsx
<input
  type="checkbox"
  name={item.id}
  checked={item.isCompleted}
  onChange={handleCheckbox}
  className="w-4 h-4 flex-shrink-0"
/>
```

The update is doubly immutable:
- `[...todos]` — a **new array** (so React sees a changed reference), and
- `{ ...updated[index], isCompleted: !updated[index].isCompleted }` — a **new object** for the changed row (so nothing inside the old state is mutated).

The checkbox itself is *controlled* too: `checked={item.isCompleted}` + `onChange`.

### 4.8 `uuid` for keys

```jsx
import { v4 as uuidv4 } from 'uuid'
...
const updated = [...todos, { id: uuidv4(), todo: todo.trim(), isCompleted: false }]
```

and in the render:

```jsx
{todos.map((item, index) =>
  (showFinished || !item.isCompleted) ? (
    <motion.div
      key={item.id}
      ...
```

React uses `key` to match old and new list items between renders. **Array index would break here** — deleting item 2 would shift every later index, causing React to reuse the wrong DOM nodes (and Framer Motion to animate the wrong rows). A uuid stays glued to its item for its whole life. Note `index` *is* still used in this app — but only for the cosmetic "player number" label (`001`, `002`, …), never as the key.

### 4.9 Conditional rendering — filter, line-through, empty state

**Show/hide completed tasks.** The filter is applied inline inside `map` (items are rendered or replaced with `null`):

```jsx
{todos.map((item, index) =>
  (showFinished || !item.isCompleted) ? (
    <motion.div ... >
```

Read it aloud: *render the row if we're showing finished tasks, OR if this task isn't finished.* The toggle itself is a styled div, not a native checkbox, flipped with a functional state update:

```jsx
<div
  className={`toggle-track ${showFinished ? 'on' : 'off'}`}
  onClick={() => setShowFinished(v => !v)}
>
  <div className="toggle-thumb" />
</div>
```

(`setShowFinished(v => !v)` — the updater-function form — is the safe way to toggle, since it always receives the latest value.)

**Line-through and dimming on completed tasks** — style driven directly by data:

```jsx
<motion.span
  animate={{
    color: item.isCompleted
      ? 'rgba(240,240,240,0.25)'
      : 'rgba(240,240,240,0.9)',
  }}
  transition={{ duration: 0.3 }}
  className="text-sm truncate"
  style={{
    textDecoration: item.isCompleted ? 'line-through' : 'none',
  }}
>
  {item.todo}
</motion.span>
```

The row container also swaps CSS classes off the same flag:

```jsx
className={`todo-row flex items-center justify-between p-3 ${
  item.isCompleted ? 'done-task' : 'active-task'
}`}
```

**Empty state** — shown when the *filtered* list is empty (note it re-runs the same filter, so hiding all finished tasks correctly triggers it):

```jsx
{todos.filter(t => showFinished || !t.isCompleted).length === 0 && (
  <motion.div ... >
    <span style={{ fontSize: '2.5rem' }}>{GEO.circle}</span>
    <p className="section-label mt-3">NO TASKS REMAINING</p>
  </motion.div>
)}
```

**Progress bar** — rendered only when there are tasks (guarding against division by zero):

```jsx
{totalCount > 0 && (
  ...
  animate={{ width: `${(doneCount / totalCount) * 100}%` }}
```

### 4.10 Derived state — compute, don't store

```jsx
const doneCount  = todos.filter(t => t.isCompleted).length
const totalCount = todos.length
```

The counter (`{doneCount} / {totalCount} DONE`) and the progress-bar width are **calculated fresh on every render** from `todos`. There is no `useState` for them — storing them would create two sources of truth that could drift apart. Rule of thumb: *if you can compute it from existing state, don't store it.*

### 4.11 Tailwind CSS — utilities + a custom theme

**Pipeline.** `src/index.css` starts with the three Tailwind directives, which the PostCSS pipeline (see `postcss.config.js`) expands into real CSS at build time:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```js
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Content scanning.** Tailwind only generates classes it can *see* in your files, so the config lists where to look:

```js
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
```

**Utilities in action** — a typical line from `App.jsx`:

```jsx
className="squid-card w-full max-w-lg rounded-2xl p-6 md:p-8"
```

- `w-full max-w-lg` — fluid width, capped
- `rounded-2xl` — large border radius
- `p-6 md:p-8` — responsive padding (bigger from the `md` breakpoint up)
- `squid-card` — a *custom* class defined in `index.css`, mixed freely with utilities

Other utility patterns worth spotting in the code: `flex gap-2` (input row), `space-y-2 overflow-y-auto pr-1` (scrollable task list), `sticky top-0 z-50` (navbar), `flex-1 min-w-0` + `truncate` (text ellipsis inside flexbox), `flex-shrink-0` (icons never squash).

**Theme extension.** `tailwind.config.js` extends the theme with a `squid` color palette, custom `keyframes`, and named `animation` shorthands:

```js
colors: {
  squid: {
    pink:    '#ff2d78',
    teal:    '#00ffcc',
    dark:    '#0a0a0f',
    card:    '#12121f',
    deep:    '#1a1a2e',
    red:     '#ff1744',
    guard:   '#e91e63',
    dim:     'rgba(240,240,240,0.6)',
  }
},
```

These would enable classes like `bg-squid-pink` or `animate-flicker`. (Heads-up: the current JSX mostly styles the theme via inline `style` props and handwritten CSS classes in `index.css` instead — see "anomalies" in the pitfalls section.)

**Custom theme CSS.** All the neon glow, rotating background rings, scanline, toggle switch, and card styling live as plain CSS in `index.css` — e.g. the neon heading effect:

```css
.neon-text {
  text-shadow:
    0 0 8px  var(--pink),
    0 0 20px var(--pink),
    0 0 40px rgba(255, 45, 120, 0.5);
}
```

This is a good real-world lesson: Tailwind handles *layout and spacing*, while intricate visual effects (multi-layer shadows, keyframe choreography, pseudo-elements) often stay in regular CSS.

### 4.12 react-icons — icons as components

```jsx
import { FaEdit } from 'react-icons/fa'
import { AiFillDelete } from 'react-icons/ai'
```

Used inside the action buttons:

```jsx
<FaEdit size={11} />
...
<AiFillDelete size={11} />
```

Each icon is just a React component rendering an inline SVG. Importing from the specific icon-pack path (`react-icons/fa` = Font Awesome, `react-icons/ai` = Ant Design) keeps the bundle small — you ship only the icons you import. They inherit `color` from CSS and accept a `size` prop.

### 4.13 Framer Motion — declarative animation

This build goes beyond the plain lecture version and animates almost everything. The key APIs used:

**Variants** — named animation states defined once, referenced by name:

```jsx
const itemVariants = {
  hidden:  { opacity: 0, x: -60, scale: 0.93 },
  visible: { opacity: 1, x: 0,   scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, x: 80,  scale: 0.9,
    transition: { duration: 0.25 } },
}
```

**`AnimatePresence`** — the only way to animate elements *out* of the DOM. Rows slide right and fade when deleted, and `layout` makes remaining rows glide into place:

```jsx
<AnimatePresence mode="popLayout">
  {todos.map((item, index) =>
    (showFinished || !item.isCompleted) ? (
      <motion.div
        key={item.id}
        layout
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
```

(This is another reason stable uuid keys matter — `AnimatePresence` tracks enter/exit by `key`.)

**Micro-interactions** — gesture props on the buttons; note how they're conditionally disabled along with the button:

```jsx
whileHover={todo.trim().length > 3 ? { scale: 1.05 } : {}}
whileTap={todo.trim().length > 3 ? { scale: 0.95 } : {}}
```

**Animating from state** — the progress bar tweens its width whenever the derived values change:

```jsx
initial={{ width: 0 }}
animate={{ width: `${(doneCount / totalCount) * 100}%` }}
transition={{ duration: 0.6, ease: 'easeOut' }}
```

---

## 5. Full Code Walkthrough

### 5.1 `src/main.jsx` — the entry point

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

- Grabs `<div id="root">` from `index.html` and mounts `<App />` with the React 18 `createRoot` API.
- Importing `./index.css` here is what pulls Tailwind + the theme CSS into the bundle.
- `<React.StrictMode>` double-invokes renders and effects **in development only** to surface impure code. The load-from-storage effect runs twice in dev — harmless here, since setting the same parsed list twice is idempotent.

### 5.2 `index.html` — the shell

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>iTask - Your Task Planner</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Vite serves this file directly; the `<script type="module">` is the door into the whole React app.

### 5.3 `src/App.jsx` — function by function

**Module scope — imports and constants.**

```jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import { FaEdit } from 'react-icons/fa'
import { AiFillDelete } from 'react-icons/ai'
import { v4 as uuidv4 } from 'uuid'

/* ── Squid Game geometric symbols ── */
const GEO = { circle: '○', triangle: '△', square: '□' }
```

`GEO` and the three variant objects (`pageVariants`, `itemVariants`, `sectionVariants`) are defined **outside the component** — they never change, so recreating them on every render would be wasted work.

**`BgGeo()` — decorative background component.** A purely presentational component: a fixed, `pointer-events: none` layer of rotating rings, a floating triangle/squares, and a scanline sweep. All motion comes from CSS keyframes in `index.css` (`rotateSlow`, `floatY`, `scanline`); the JSX only positions them with inline styles:

```jsx
<div
  className="geo-ring"
  style={{ width: 520, height: 520, top: '-80px', left: '-120px' }}
/>
```

Lesson: extract purely-visual chunks into their own component so the "real" component stays readable.

**`App()` — state and effects.** Covered in depth above:
- three `useState` slices (§4.1)
- one `useEffect` to hydrate from `localStorage` (§4.3)

**Handlers.**

| Function | Trigger | What it does |
|---|---|---|
| `saveToLS(updated)` | called by every mutator | `localStorage.setItem('todos', JSON.stringify(updated))` |
| `handleAdd()` | SAVE button / Enter | guard (len > 3) → append `{id, todo, isCompleted:false}` → clear input → save |
| `handleEdit(_, id)` | pencil icon | `find` item → text into input → `filter` it out of list → save |
| `handleDelete(_, id)` | trash icon | `filter` item out → save |
| `handleCheckbox(e)` | row checkbox | id from `e.target.name` → `findIndex` → copy array + copy object with flipped `isCompleted` → save |
| `handleKeyDown(e)` | input keydown | `if (e.key === 'Enter') handleAdd()` |

**Derived values.**

```jsx
const doneCount  = todos.filter(t => t.isCompleted).length
const totalCount = todos.length
```

**The render, top to bottom.**

1. `<BgGeo />` — fixed background layer (z-index 0).
2. `<Navbar />` — sticky animated header (z-index 50).
3. **Main card** — a `motion.div` with `pageVariants` (fades/slides in on load), class `squid-card w-full max-w-lg rounded-2xl p-6 md:p-8`, `minHeight: '82vh'`.
4. **Header** — the ○ △ □ symbol trio staggered in via mapped `motion.span`s with increasing `delay`s, then the flickering `iTASK` neon `<h1>` (`fontSize: 'clamp(1.8rem, 5vw, 2.6rem)'` — fluid typography) and subtitle.
5. **Add Task panel** — section label, the controlled input (§4.2), and the SAVE `motion.button` with `disabled`/`whileHover`/`whileTap` (§4.13).
6. **Filter row** — custom toggle switch (§4.9) + `Show Completed` label + `{doneCount} / {totalCount} DONE` counter.
7. **Progress bar** — conditional on `totalCount > 0`, animated width, pink→teal gradient (§4.9, §4.13).
8. **Tasks list** — `▶ YOUR TASKS` label; a `space-y-2 overflow-y-auto` container capped at `maxHeight: '42vh'`; the empty-state block; then `AnimatePresence` wrapping `todos.map(...)`. Each row: zero-padded player number (`String(index + 1).padStart(3, '0')`), controlled checkbox, truncating task text with conditional line-through, and the edit/delete icon buttons.
9. **Footer** — the ○/△/□ legend, faded in last (`delay: 1.1`).

```jsx
export default App
```

### 5.4 `src/components/Navbar.jsx`

```jsx
import { motion } from 'framer-motion'

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-3"
      style={{
        background: 'rgba(8, 8, 15, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 45, 120, 0.2)',
        boxShadow: '0 0 30px rgba(255, 45, 120, 0.07)',
      }}
    >
```

- **Slides down** from above the viewport on mount (`initial` → `animate`).
- `sticky top-0 z-50` keeps it pinned above the scrolling content; the semi-transparent background + `backdropFilter: 'blur(12px)'` create the frosted-glass effect.
- The **logo** pairs the mini ○ △ □ trio with an `iTASK` wordmark whose `textShadow` is animated through a keyframe *array* — Framer Motion tweens through the three values in a 3-second infinite loop:

```jsx
animate={{
  textShadow: [
    '0 0 8px rgba(255,45,120,0.4)',
    '0 0 18px rgba(255,45,120,0.8)',
    '0 0 8px rgba(255,45,120,0.4)',
  ],
}}
transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
```

- The **nav links** are data-driven — an array of `{ label, color }` mapped to `motion.li` elements, each with its own `whileHover` accent color:

```jsx
{[
  { label: 'HOME',  color: 'rgba(255,45,120,0.7)' },
  { label: 'TASKS', color: 'rgba(0,255,204,0.7)'  },
].map(({ label, color }) => (
  <motion.li
    key={label}
    whileHover={{ color, scale: 1.05 }}
    className="cursor-pointer text-xs font-bold tracking-widest transition-colors"
    style={{ color: 'rgba(240,240,240,0.4)' }}
  >
    {label}
  </motion.li>
))}
```

The links are display-only (no router in this project).

### 5.5 Config files at a glance

**`vite.config.js`** — the minimum viable config; the React plugin enables JSX transform + Fast Refresh:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

**`package.json`** (project name `video-114`) — the scripts you'll actually run:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview"
},
"dependencies": {
  "framer-motion": "^12.38.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-icons": "^5.0.1",
  "uuid": "^9.0.1"
}
```

Tailwind, PostCSS, and Autoprefixer live in `devDependencies` — they run at build time and ship zero runtime JS.

**`src/App.css`** — untouched Vite template styles (`#root`, `.logo`, `.card`, `.read-the-docs`). It is **not imported by any file** in this project, so it has no effect; the real styling lives in `index.css`.

---

## 6. State-Flow Diagram

Every mutation follows the exact same loop. Trace "user checks a checkbox" through it:

```
                        ┌───────────────────────────────────────────┐
                        │                USER ACTION                 │
                        │  type / SAVE / Enter / ✎ / 🗑 / ☑ / toggle │
                        └──────────────────────┬────────────────────┘
                                               │ event fires
                                               ▼
        ┌───────────────────────────────────────────────────────────────┐
        │                           HANDLER                              │
        │ handleAdd · handleEdit · handleDelete · handleCheckbox         │
        │                                                                │
        │  const updated = /* NEW array via spread / filter / copy */    │
        └───────────┬──────────────────────────────────┬────────────────┘
                    │                                  │
          setTodos(updated)                    saveToLS(updated)
                    │                                  │
                    ▼                                  ▼
        ┌───────────────────────┐        ┌──────────────────────────────┐
        │      REACT STATE      │        │         localStorage          │
        │  todos → new array    │        │ 'todos' → JSON.stringify(...) │
        └───────────┬───────────┘        └──────────────┬───────────────┘
                    │ state changed → React schedules    │
                    ▼ a re-render                        │ survives reload
        ┌───────────────────────────────┐               │
        │           RE-RENDER            │               ▼
        │ • recompute doneCount/total    │   ┌──────────────────────────┐
        │ • todos.map(...) rebuilds rows │   │   NEXT PAGE LOAD          │
        │ • line-through / filter /      │   │ useEffect([]) →           │
        │   progress bar all re-derive   │   │ JSON.parse → setTodos →   │
        │ • Framer Motion animates diffs │   │ re-render with saved list │
        └───────────────────────────────┘   └──────────────────────────┘
```

Key insight: the UI is **never updated directly**. Handlers only produce a new `todos` array; the line-through, counter, progress bar, and empty state all *fall out* of the render being a pure function of state. `saveToLS` runs on the same `updated` array so storage and state can never disagree.

(The input has its own mini-loop: keystroke → `setTodo` → re-render → `value={todo}`.)

---

## 7. How to Run

```bash
# 1. install dependencies
npm install

# 2. start the dev server (Vite, with hot reload)
npm run dev
```

Open the printed URL (typically `http://localhost:5173`). Also available:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint over all .js/.jsx files
```

To reset the app's data: DevTools → Application → Local Storage → delete the `todos` key (or run `localStorage.removeItem('todos')` in the console).

---

## 8. Key Takeaways

1. **One state array, many views.** The list, the counter, the progress bar, the empty state, and the strikethroughs are all derived from `todos` — a single source of truth.
2. **Never mutate state.** Every handler builds a *new* array (`[...todos, x]`, `filter`, copied array + copied object). React detects changes by reference.
3. **`setState` is asynchronous** — that's the entire reason for the `saveToLS(updated)` parameter pattern. Compute the new value once, hand it to both React and localStorage.
4. **Controlled components** make validation (`disabled`), clearing (`setTodo('')`), and the edit-refill trick trivial.
5. **Stable keys (uuid)** are load-bearing here twice over: correct list reconciliation *and* correct `AnimatePresence` exit animations.
6. **`useEffect` with `[]`** is the standard "hydrate from storage on mount" idiom — guard the `JSON.parse`.
7. **Tailwind for structure, custom CSS for spectacle** — a pragmatic split you'll see in real codebases.

## 9. Common Pitfalls

- **Mutating state directly.** `todos.push(item)` or `todos[i].isCompleted = true` keeps the same reference → React skips the re-render (or renders stale data later). Always create new arrays/objects, as every handler here does.
- **Stale state after `setTodos`.** Reading `todos` immediately after calling `setTodos` gives you the *old* value — state updates apply on the next render. Symptom: localStorage always "one step behind." Cure: the `saveToLS(updated)` pattern (§4.3), or functional updates like `setShowFinished(v => !v)`.
- **`JSON.parse` on `null` / corrupted data.** `localStorage.getItem` returns `null` when the key is absent — parse only inside the `if (stored)` guard. For extra safety in your own apps, wrap the parse in `try/catch` (a user-edited or corrupted value throws and would crash the mount).
- **Index as `key`.** Works until you delete/reorder — then rows swap identities, checkboxes appear to "jump," and exit animations play on the wrong row. Use the uuid.
- **Forgetting that edit removes the todo.** In this design, an in-progress edit exists only in the input box; clearing the input (or refreshing) discards the task permanently, and re-saving assigns a new id.
- **Validation drift.** The `length <= 3` rule appears in both the button `disabled` prop and inside `handleAdd`. Change one and not the other and the UI lies about what's allowed.
- **Quirks in this codebase worth knowing (report-only, nothing to fix for the lecture):** `src/App.css` is dead code (never imported); the `squid` colors and `animation` shorthands in `tailwind.config.js` are defined but the JSX styles the theme via `index.css` classes and inline styles instead (the keyframes are effectively duplicated in both files, with slightly different timings); and the header's `animation: 'flicker 10s infinite'` inline style works only because the `@keyframes flicker` in `index.css` exists.

## 10. Practice Exercises

1. **True in-place edit.** Rewrite `handleEdit` so it does *not* delete the item: add an `isEditing` flag (or an `editingId` state) and render an inline input inside the row; on save, `map` over `todos` replacing just that item's text while keeping its `id`.
2. **Harden persistence.** Wrap the `JSON.parse` in `try/catch` (falling back to `[]`), and refactor saving into a single `useEffect(() => { ... }, [todos])` so you can delete every manual `saveToLS` call. Compare the trade-offs of the two approaches.
3. **Clear-completed + counts.** Add a "Clear Completed" button that filters out all `isCompleted` items in one immutable update, and show how many were removed.
4. **Sort & timestamps.** Add a `createdAt: Date.now()` field in `handleAdd`, then add a toggle to sort by newest-first vs. oldest-first — without ever calling `todos.sort()` on the state array directly (hint: `[...todos].sort(...)`).
5. **Make the Tailwind theme earn its keep.** Replace the inline hex colors in `App.jsx`/`Navbar.jsx` with the `squid-*` palette classes (`text-squid-pink`, `bg-squid-card`, `animate-flicker`, …) from `tailwind.config.js`, and delete the now-redundant duplicate keyframes from `index.css`.

---

## Appendix: Original Vite Template Notes

> The README that shipped with this project (Vite boilerplate), preserved verbatim:

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
