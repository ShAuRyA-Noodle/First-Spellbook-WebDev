# Lec-114 — iTask: A ToDo List App with React, Tailwind CSS & Framer Motion

> **Lecture notes** for the "ToDo List App using React & Tailwind" project — a complete, browser-persistent task manager built with **Vite + React 18**, styled with **Tailwind CSS 3** using a custom warm, low-lit design system, animated with **Framer Motion**, using **uuid** for stable keys, and **react-icons** for iconography.

---

## 1. Project Overview

**iTask** is a single-page todo application. State and persistence live in a custom hook (`useTodos`), composed together in `App.jsx` out of small, focused components. The app lets you:

- **Add** a task (via the Add button or the Enter key — a real `<form>`, not manual key-handling)
- **Edit** a task **in place** — double-click (or the pencil icon) turns the row into an editable field; `Enter` saves, `Escape` cancels, clicking away saves
- **Delete** a task, with a smooth exit animation
- **Toggle completion** with a custom checkbox whose tick draws itself
- **Filter** the list — **All / Active / Completed** — via a segmented control with a sliding highlight
- **Clear completed** tasks in one click (only shown when there's something to clear)
- **See progress** via a live remaining-task count (in the footer and in the navbar) and a slim animated progress bar
- **Persist everything** across page reloads using `localStorage`, with a guarded, crash-proof load

There is no backend and no router — this lecture is entirely about **React state, custom hooks, component composition, list rendering, controlled inputs, and browser persistence**.

---

## 2. What You'll Learn

- **Custom hooks** — `useTodos` packages all todo state + CRUD logic + persistence behind a clean `{ todos, addTodo, editTodo, deleteTodo, toggleTodo, clearCompleted }` API
- **`useState` with a lazy initializer** — `useState(loadTodos)` reads `localStorage` *once*, synchronously, before the first render, instead of rendering empty and then "flashing" in the saved list
- **Functional state updates** — every mutation uses `setTodos(prev => ...)`, so handlers always operate on the latest state, never a stale closure
- **`useEffect` for persistence** — one effect, keyed on `[todos]`, writes to `localStorage` after *every* change, so there's no `saveToLS(...)` call to remember at each call site
- **Guarding `JSON.parse`** — `try/catch` plus an `Array.isArray` check means a corrupted or hand-edited `localStorage` value can never crash the app
- **Component composition** — `App` renders `Navbar`, `TodoInput`, `FilterTabs`, `TodoList` → `TodoItem` → `CheckToggle`, `EmptyState` — each with one job and a small prop surface
- **Lifting state up** — `App` owns the todos and the filter; children receive data and callbacks as props and never touch `localStorage` or global state directly
- **Controlled inputs** — both the "add" input and the inline "edit" input are fully React-controlled
- **Derived state** — `activeCount`, `completedCount`, `counts`, `visibleTodos`, and `progress` are all *computed on every render* (via `useMemo` where the work is non-trivial), never stored redundantly
- **Stable list keys** — every todo gets an id from `uuidv4()` (the `uuid` package, already a dependency in `package.json`) as its React `key`, so reordering/removing never mixes up rows
- **`AnimatePresence` + `layout`** — Framer Motion animates rows in, out, and *around* each other automatically when the list changes
- **`layoutId` shared-element animation** — the active filter tab's highlight is one element that Framer Motion glides between positions, rather than three static backgrounds
- **`pathLength` SVG animation** — the checkbox's tick is drawn stroke-by-stroke by animating an SVG `<path>`'s `pathLength` from 0 to 1
- **Tailwind design tokens** — a small, named color system (`surface`, `ink`, `line`, `accent`, `success`, `destructive`) extended in `tailwind.config.js`, instead of one-off hex values scattered through JSX

---

## 3. Project Structure

```
Lec-114 ToDo List App using React & Tailwind/
├── node_modules/              # dependencies (never edit; not covered here)
├── public/
│   └── vite.svg                # favicon served as-is
├── src/
│   ├── assets/
│   │   └── react.svg            # unused Vite template asset
│   ├── components/
│   │   ├── Navbar.jsx           # sticky top bar: logo + live status pill
│   │   ├── TodoInput.jsx        # the add-task form (input + Add button)
│   │   ├── FilterTabs.jsx       # All / Active / Completed segmented control
│   │   ├── TodoList.jsx         # maps visible todos to TodoItem, or shows EmptyState
│   │   ├── TodoItem.jsx         # one row: checkbox, text/edit field, edit + delete actions
│   │   ├── CheckToggle.jsx      # the signature self-drawing checkbox
│   │   └── EmptyState.jsx       # copy + icon for "nothing to show" per filter
│   ├── hooks/
│   │   └── useTodos.js          # ★ all todo state, CRUD, and localStorage persistence
│   ├── App.css                  # unused leftover from the Vite template (not imported)
│   ├── App.jsx                  # ★ composition root: layout, derived state, wiring
│   ├── index.css                # Tailwind directives + the handful of document-level styles
│   └── main.jsx                 # React entry point (createRoot + StrictMode)
├── .eslintrc.cjs                # ESLint config (Vite template + `react/prop-types` off)
├── .gitignore
├── harry todo.zip              # 📦 instructor's reference copy of the finished project
├── index.html                   # Vite HTML shell — <div id="root"> + module script
├── package.json                 # scripts + dependencies (name: "video-114")
├── package-lock.json             # exact dependency tree (generated; don't edit)
├── postcss.config.js             # wires Tailwind + Autoprefixer into Vite's CSS pipeline
├── tailwind.config.js             # custom color tokens, one shadow, one keyframe
└── vite.config.js                # minimal Vite config with the React plugin
```

> **Note:** `harry todo.zip` is the instructor's reference copy of the original lecture project. Keep it for comparison; the live source in `src/` is what these notes walk through.

---

## 4. The Design System (`tailwind.config.js`)

Rather than reaching for Tailwind's default grays and a random accent, this app defines a small **named palette** that all traces back to what the interface is trying to feel like: a task list kept the way you'd keep a planner on a desk at dusk — warm, quiet, one deliberate accent (a brass-like amber), color used only where it means something.

```js
colors: {
  surface: {
    0: '#161310',      // page canvas
    1: '#1e1a15',      // panel / card
    2: '#27221b',      // hover state / popover elevation
    inset: '#100d0a',  // inputs — sit a touch below their surroundings
  },
  ink: {
    primary: '#f6f0e4',
    secondary: 'rgb(246 240 228 / 0.66)',
    tertiary: 'rgb(246 240 228 / 0.44)',
    muted: 'rgb(246 240 228 / 0.28)',
  },
  line: {
    subtle: 'rgb(246 240 228 / 0.06)',
    DEFAULT: 'rgb(246 240 228 / 0.10)',
    strong: 'rgb(246 240 228 / 0.18)',
  },
  accent: {
    DEFAULT: '#dd9a3d',
    hover: '#eaac54',
    subtle: 'rgb(221 154 61 / 0.14)',
  },
  success: {
    DEFAULT: '#87a373',
    subtle: 'rgb(135 163 115 / 0.16)',
  },
  destructive: {
    DEFAULT: '#d97361',
    subtle: 'rgb(217 115 97 / 0.14)',
  },
},
```

A few rules this project follows consistently, worth calling out because they're what separates "styled" from "designed":

- **One brand accent** (`accent`, amber) — used for the Add button, the active filter pill, and focus rings. It is *not* reused for "success" or reused twice with two different meanings.
- **Semantic colors are semantic** — `success` (sage green) appears *only* on the completed checkmark; `destructive` (muted red) appears *only* on the delete button, and only on hover/focus. Neither is a second "brand" color.
- **Text has four levels** — `ink-primary` (task text), `ink-secondary`, `ink-tertiary` (labels, counts), `ink-muted` (completed/placeholder text) — not just "white text" and "gray text."
- **Borders are whisper-quiet** — `line-subtle` / `line` / `line-strong` are low-opacity overlays on the warm background, not solid grays. You feel the structure; you don't see harsh lines.
- **Inputs sit *below* their surroundings** — `surface-inset` is the darkest surface in the system, used only for the text input and the filter-tab track, so they read as "type here," not as another card.

---

## 5. Concept Deep-Dives (with the actual code)

### 5.1 `useTodos` — one hook owns state, CRUD, and persistence

```js
const STORAGE_KEY = 'todos'

function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('Saved todos were corrupted, starting with an empty list.', error)
    return []
  }
}

export function useTodos() {
  const [todos, setTodos] = useState(loadTodos)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const addTodo = useCallback((text) => {
    setTodos(prev => [...prev, { id: uuidv4(), text, completed: false }])
  }, [])

  const editTodo = useCallback((id, text) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, text } : t)))
  }, [])

  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos(prev => prev.filter(t => !t.completed))
  }, [])

  return { todos, addTodo, editTodo, deleteTodo, toggleTodo, clearCompleted }
}
```

Why this shape, step by step:

1. **`useState(loadTodos)` — a *lazy initializer*.** Passing a function (not calling it — `useState(loadTodos)`, not `useState(loadTodos())`) tells React "only run this once, on the very first render." `loadTodos()` itself reads and parses `localStorage` synchronously, so the very first render already has the saved list. Compare this to the old pattern of `useState([])` + a `useEffect(() => setTodos(...), [])` — that version renders an *empty* list for one frame, then re-renders with the real data. The lazy-initializer version skips that flash entirely.
2. **One `useEffect` does all the saving.** It depends on `[todos]`, so it re-runs after *any* change — add, edit, delete, toggle, or clear — and writes the current array to `localStorage`. Every mutation function below only has to call `setTodos`; none of them need to remember to also persist.
3. **Every mutator uses the `prev => ...` functional form.** `setTodos(prev => [...prev, newItem])` always operates on React's *latest* committed state, not on whatever `todos` happened to be when the function was defined. This is what makes the whole hook immune to stale-closure bugs, even if multiple updates fire in the same tick.
4. **Every update is immutable.** `[...prev, newItem]` (add), `prev.map(...)` (edit/toggle — always returning a *new* object for the changed item via `{ ...t, ... }`), `prev.filter(...)` (delete/clear). `todos.push(...)` or `todos[i].completed = true` never appear anywhere in this codebase — mutating the array or an item in place would keep the same object reference and React would have no way to know a re-render is needed.

### 5.2 Guarding `localStorage.getItem` + `JSON.parse`

```js
function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('Saved todos were corrupted, starting with an empty list.', error)
    return []
  }
}
```

Three layers of defense, because `localStorage` is just a string store with no schema:

- `localStorage.getItem` can return `null` (nothing saved yet) — `if (!stored) return []` short-circuits before `JSON.parse` ever sees it.
- `JSON.parse` **throws** on malformed JSON (e.g. someone hand-edited devtools storage, or a future version of the app saved a different shape) — the `try/catch` turns that crash into a console warning and an empty list instead of a white screen.
- Even *valid* JSON might not be an array (`"true"`, `"{}"`, a stray string) — `Array.isArray(parsed) ? parsed : []` guards against calling `.map`/`.filter` on something that isn't a list later.

### 5.3 `App.jsx` — the composition root

```jsx
function App() {
  const { todos, addTodo, editTodo, deleteTodo, toggleTodo, clearCompleted } = useTodos()
  const [filter, setFilter] = useState('all')

  const activeCount = useMemo(() => todos.filter((t) => !t.completed).length, [todos])
  const completedCount = todos.length - activeCount
  const counts = { all: todos.length, active: activeCount, completed: completedCount }

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.completed)
    if (filter === 'completed') return todos.filter((t) => t.completed)
    return todos
  }, [todos, filter])

  const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0

  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar activeCount={activeCount} totalCount={todos.length} />
      <main className="mx-auto flex w-full max-w-xl flex-col px-4 py-10 sm:py-14">
        {/* header, TodoInput, progress bar, FilterTabs, TodoList, footer */}
      </main>
    </div>
  )
}
```

`App` itself renders **no todo markup** — it holds two pieces of state (`todos`, via the hook, and `filter`), derives everything else, and hands data + callbacks down as props. This is "lifting state up": `TodoItem` doesn't know `localStorage` exists, and `TodoInput` doesn't know how the list is filtered — they just call the functions they're given.

- `activeCount` is wrapped in `useMemo` because it re-filters the whole array — cheap here, but the pattern is the right habit for lists that could grow large.
- `counts` feeds `FilterTabs` so each tab can show a live number (`All 4`, `Active 2`, `Completed 2`).
- `visibleTodos` is the *only* place filtering happens — `TodoList` and everything below it just renders whatever array it's handed.
- `progress` guards against division by zero (`todos.length > 0 ? ... : 0`) the same way the old progress bar did — an empty list has 0% progress, not `NaN`%.

### 5.4 Adding a task — `TodoInput.jsx`

```jsx
function TodoInput({ onAdd }) {
  const [value, setValue] = useState('')
  const [invalid, setInvalid] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setInvalid(true)
      return
    }
    onAdd(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <motion.input
        animate={invalid ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        value={value}
        onChange={handleChange}
        type="text"
        placeholder="What needs to get done?"
        aria-label="New task"
        className={`min-w-0 flex-1 rounded-lg border bg-surface-inset px-3.5 py-2.5 text-sm text-ink-primary outline-none transition-colors duration-200 placeholder:text-ink-muted ${
          invalid ? 'border-destructive/60' : 'border-line focus:border-accent/60'
        }`}
      />
      <motion.button
        whileTap={{ scale: 0.96 }}
        type="submit"
        className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-surface-0 transition-colors duration-200 hover:bg-accent-hover"
      >
        <FiPlus size={16} strokeWidth={2.5} />
        <span className="hidden sm:inline">Add</span>
      </motion.button>
    </form>
  )
}
```

- **A real `<form onSubmit>`** replaces the old input + `onKeyDown={e => e.key === 'Enter' && handleAdd()}` pattern. Wrapping the input and the button in a `<form>` means the browser fires `submit` for *both* pressing Enter in the field *and* clicking the button — one handler, both interactions, and it's the platform's native behavior rather than a hand-rolled key listener.
- **Validation guard:** empty (or whitespace-only) input never becomes a todo. Instead of a silent no-op, `setInvalid(true)` triggers a small `x` keyframe shake on the input (via `motion.input`'s `animate` prop) — the input tells you *why* nothing happened.
- `onAdd` is a prop — `TodoInput` has no idea todos exist elsewhere in the app; it just reports "the user submitted this text."

### 5.5 Editing a task in place — `TodoItem.jsx`

```jsx
function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const startEditing = () => {
    setDraft(todo.text)
    setIsEditing(true)
  }

  const commitEdit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== todo.text) onEdit(todo.id, trimmed)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setDraft(todo.text)
    setIsEditing(false)
  }

  return (
    /* ...outer <motion.li> and <CheckToggle> omitted for brevity... */
    isEditing ? (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitEdit()
          if (e.key === 'Escape') cancelEdit()
        }}
        onBlur={commitEdit}
        className="min-w-0 flex-1 rounded-md border border-accent/50 bg-surface-inset px-2 py-1 text-sm text-ink-primary outline-none"
      />
    ) : (
      <button
        type="button"
        onDoubleClick={startEditing}
        title="Double-click to edit"
        className={`min-w-0 flex-1 truncate text-left text-sm transition-colors duration-200 ${
          todo.completed ? 'text-ink-muted line-through' : 'text-ink-primary'
        }`}
      >
        {todo.text}
      </button>
    )
    /* ...action buttons omitted for brevity... */
  )
}
```

This is a deliberate improvement over the earlier "recycle" pattern (delete the item, dump its text back into the *add* input, let the user resubmit it as a brand-new item). That approach meant a task briefly didn't exist at all mid-edit — reload the page while editing, and it was just gone. Here, editing is **local UI state on the row itself**:

- `isEditing` toggles the row between "reading" (a `<button>` showing the text, double-click or the pencil icon to edit) and "editing" (a controlled `<input>`).
- `draft` is a *separate* piece of state from `todo.text` — you can type freely without touching the real list until you commit.
- `commitEdit` only calls `onEdit` (which updates the real `todos` array) if the trimmed draft is non-empty **and** actually changed — no-op edits and empty edits don't touch state.
- Three ways to leave edit mode: `Enter` and `onBlur` both call `commitEdit`; `Escape` calls `cancelEdit`, which resets `draft` back to the original text and discards changes.
- `useEffect(() => { if (isEditing) inputRef.current?.focus() }, [isEditing])` autofocuses the field the instant it appears, so you never click twice.

### 5.6 Deleting, toggling, and stable keys

```jsx
<TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
```

```js
const deleteTodo = useCallback((id) => {
  setTodos(prev => prev.filter(t => t.id !== id))
}, [])

const toggleTodo = useCallback((id) => {
  setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)))
}, [])
```

- `key={todo.id}` — every todo's `id` comes from `uuidv4()` at creation time and never changes. React uses `key` to match old and new elements across renders; **array index would break here** — deleting the second item would shift every later index down by one, and React would reuse the wrong DOM node for the wrong task (and Framer Motion would animate the wrong row exiting).
- Deleting is a `filter` (new array, minus one item). Toggling is a `map` that returns a **new object** (`{ ...t, completed: !t.completed }`) for the matching item and the *same* reference for every other item — so React only re-renders the one row that actually changed.

### 5.7 Filtering — `FilterTabs.jsx` + derived `visibleTodos`

```jsx
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
]

function FilterTabs({ filter, onChange, counts }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface-inset p-1">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={filter === key}
          className="relative rounded-md px-3 py-1.5 text-xs font-medium"
        >
          {filter === key && (
            <motion.span
              layoutId="filter-pill"
              className="absolute inset-0 rounded-md border border-accent/40 bg-accent-subtle"
              transition={{ type: 'spring', stiffness: 500, damping: 34 }}
            />
          )}
          <span
            className={`relative z-10 flex items-center gap-1.5 transition-colors duration-150 ${
              filter === key ? 'text-accent' : 'text-ink-tertiary hover:text-ink-secondary'
            }`}
          >
            {label}
            <span className="tabular-nums text-[10px] opacity-70">{counts[key]}</span>
          </span>
        </button>
      ))}
    </div>
  )
}
```

`filter` is a single piece of state in `App` (`'all' | 'active' | 'completed'`), passed down along with an `onChange` callback. The interesting bit is the **highlight pill**: instead of three buttons each with their own always-rendered background, only the *active* button ever renders the `motion.span` with `layoutId="filter-pill"`. When you click a different tab, that `motion.span` disappears from one button and appears in another on the very next render — Framer Motion recognizes the shared `layoutId` and animates a smooth slide between the two positions instead of a hard cut. This is the same "shared element transition" technique used for tab bars in most native and premium web apps.

Filtering itself happens once, in `App.jsx`:

```js
const visibleTodos = useMemo(() => {
  if (filter === 'active') return todos.filter((t) => !t.completed)
  if (filter === 'completed') return todos.filter((t) => t.completed)
  return todos
}, [todos, filter])
```

### 5.8 The signature control — `CheckToggle.jsx`

```jsx
function CheckToggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border transition-colors duration-200 ${
        checked
          ? 'border-success/50 bg-success-subtle'
          : 'border-line-strong bg-transparent hover:border-accent/60'
      }`}
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3 text-success" fill="none">
        <motion.path
          d="M3 8.5L6.2 11.5L13 4.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </svg>
    </button>
  )
}
```

This replaces the native `<input type="checkbox">` with a custom `role="checkbox"` button — necessary because a browser checkbox can't be styled to look like this, and doing it as a real element (not a `<div>`) keeps it keyboard-accessible (`Tab` + `Space`/`Enter` work automatically) and screen-reader friendly (`role="checkbox"` + `aria-checked`).

The tick itself is one `<motion.path>` whose `d` attribute draws a checkmark. Framer Motion's `pathLength` prop is the trick: animating it from `0` to `1` is mathematically the same as animating an SVG `stroke-dasharray`/`stroke-dashoffset` pair by hand (the classic "line-drawing" CSS technique) — Framer Motion just computes the path's total length and handles the dash math for you. The result reads as the tick being *drawn*, not popped in — it's the one moment of physicality in an otherwise calm interface, and it only appears where it means something (completion).

### 5.9 Rendering the list, empty states, and exit animations — `TodoList.jsx`

```jsx
function TodoList({ todos, filter, onToggle, onDelete, onEdit }) {
  if (todos.length === 0) {
    return <EmptyState filter={filter} />
  }

  return (
    <ul className="flex flex-col">
      <AnimatePresence initial={false} mode="popLayout">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </AnimatePresence>
    </ul>
  )
}
```

- `todos` here is already `visibleTodos` from `App` — `TodoList` doesn't know about the concept of a "filter" beyond forwarding it to `EmptyState` for copy purposes ("Nothing here yet" vs. "All caught up" vs. "No completed tasks" — see `EmptyState.jsx`).
- `AnimatePresence` is what lets Framer Motion animate an *exit* — normally, once React removes an element from the tree it's gone instantly; `AnimatePresence` delays the actual unmount until each item's `exit` variant (defined in `TodoItem.jsx`'s `rowVariants`) finishes.
- `mode="popLayout"` makes the *other* rows slide smoothly into the gap left by a deleted row, instead of jumping.
- Every `TodoItem` also has the `layout` prop, which tells Framer Motion "if this element's position on screen changes for *any* reason (a sibling was added/removed/resized), animate to the new position" — this is what makes re-filtering (e.g. switching from "All" to "Active") feel like the list reflowing, not repainting.

### 5.10 The navbar — real state, not decoration

```jsx
function Navbar({ activeCount, totalCount }) {
  const allDone = totalCount > 0 && activeCount === 0

  let statusLabel = `${activeCount} left`
  if (totalCount === 0) statusLabel = 'No tasks yet'
  else if (allDone) statusLabel = 'All done'

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-20 border-b border-line-subtle bg-surface-0/85 backdrop-blur-sm"
    >
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-accent/30 bg-accent-subtle text-accent">
            <FiCheck size={14} strokeWidth={2.5} />
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink-primary">iTask</span>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium tabular-nums transition-colors duration-300 ${
            allDone ? 'border-success/40 bg-success-subtle text-success' : 'border-line text-ink-tertiary'
          }`}
        >
          {statusLabel}
        </span>
      </div>
    </motion.nav>
  )
}
```

The previous navbar had two nav links (`HOME`, `TASKS`) that didn't go anywhere — decorative nav in a single-page app with nothing to navigate to. This version replaces them with something that's actually true at every moment: a status pill fed by `activeCount`/`totalCount` props from `App`, which reads "No tasks yet" on a fresh list, "`N` left" while there's work outstanding, and "All done" (styled in the `success` color) the moment the last task is checked off. It's a small example of **props flowing down** for a component that needs to reflect state it doesn't own.

---

## 6. State Flow

```
useTodos()                         (src/hooks/useTodos.js)
  ├─ todos            ──────────────┐
  ├─ addTodo(text)                  │
  ├─ editTodo(id, text)             │  App.jsx owns this + `filter`
  ├─ deleteTodo(id)                 │  and derives activeCount /
  ├─ toggleTodo(id)                 │  completedCount / counts /
  └─ clearCompleted()               │  visibleTodos / progress
                                     ▼
        ┌────────────────────────────────────────────┐
        │                    App                       │
        └────────────────────────────────────────────┘
          │            │             │            │
          ▼            ▼             ▼            ▼
       Navbar      TodoInput     FilterTabs     TodoList
   (activeCount,   (onAdd)     (filter, onChange, (visibleTodos,
    totalCount)                    counts)         onToggle/onDelete/onEdit)
                                                        │
                                                        ▼
                                                    TodoItem (×N)
                                                        │
                                                        ▼
                                                    CheckToggle
```

Data only ever flows **down** as props; every child talks back **up** by calling a callback it was handed (`onAdd`, `onToggle`, `onDelete`, `onEdit`, `onChange`). No component other than `useTodos` ever reads or writes `localStorage`, and no component other than `App` decides what "visible" means.

---

## 7. Running the Project

```bash
npm install     # first time only — installs framer-motion, react-icons, uuid, Tailwind, Vite, etc.
npm run dev      # starts the Vite dev server with hot-module reload
npm run build    # production build → dist/
npm run preview  # serves the production build locally
npm run lint     # ESLint over every .js/.jsx file, zero warnings allowed
```

No new dependencies were introduced during this upgrade — `framer-motion`, `react-icons`, and `uuid` were already present in `package.json` and already installed in `node_modules`, so a plain `npm install` (if you haven't already run it) is all that's needed before `npm run dev`.

> **Windows path gotcha (unrelated to this app's code):** if this folder lives at a path containing an `&` character — like `...\React & Tailwind\` — npm's generated `node_modules\.bin\vite.cmd`/`.ps1` shims can fail to resolve on some Windows setups, throwing `Cannot find module '...\vite\bin\vite.js'` when you run `npm run dev`/`build`. This is an npm/Windows shell-escaping quirk, not a bug in the app. Workarounds: run Vite directly with `node ./node_modules/vite/bin/vite.js dev` (or `build`), or move/rename the project folder to a path without `&`.

---

## 8. Pitfalls Fixed in This Version

| Pitfall | Where it used to live | Fix |
|---|---|---|
| **Stale-closure risk in persistence** | A manual `saveToLS(updated)` call had to be remembered at *every* call site | One `useEffect(() => save(todos), [todos])` in `useTodos` — persistence can't be forgotten because it isn't opted into per-handler |
| **No `localStorage` guard** | `if (stored) setTodos(JSON.parse(stored))` — throws on corrupted data | `loadTodos()` wraps the read + parse in `try/catch` and validates the result is an array |
| **Empty-list flash on load** | `useState([])` + `useEffect` to load meant one render with no data | `useState(loadTodos)` lazy initializer loads synchronously before the first paint |
| **Direct mutation risk** | Any future edit to a checkbox-style handler that does `todos[i].x = y` | Every mutator in `useTodos` returns a brand-new array/object (`map`/`filter`/spread) — there is no code path that mutates in place |
| **Array index as key** | N/A here — already used `uuid` — but worth re-stating | `key={todo.id}` from `uuidv4()`, stable for the todo's whole lifetime |
| **Edit = delete + refill input** | Old `handleEdit` removed the item and dumped its text into the *add* input | `TodoItem` edits in place with local `isEditing`/`draft` state; the item never leaves the list |
| **No "Active"/"Completed"-only view** | Only a "show/hide completed" boolean toggle | Full three-way `FilterTabs` (`all` / `active` / `completed`), each with a live count |
| **No bulk cleanup** | — | `clearCompleted()` in the hook + a footer button, hidden when there's nothing to clear |
| **Decorative, non-functional navbar links** | `HOME` / `TASKS` `<li>`s with no click behavior | Replaced with a status pill bound to real `activeCount`/`totalCount` props |
| **`react/prop-types` lint noise** | N/A (no props before) | Since this project is plain JS/JSX with no PropTypes usage, `react/prop-types` is turned off in `.eslintrc.cjs` rather than adding an unused dependency |

---

## 9. Exercises

1. **Persist the filter.** Right now `filter` resets to `'all'` on reload. Store it in `localStorage` (or the URL) the same way `todos` are stored.
2. **Keyboard shortcut to focus the input.** Add a `useEffect` + `keydown` listener on `document` so pressing `/` focuses the add-input (common in productivity apps) — remember to `preventDefault()` and to remove the listener on unmount.
3. **Undo delete.** When `deleteTodo` fires, hold the deleted item for a few seconds (e.g. in a `lastDeleted` state) and show a small "Undo" affordance before it's gone for good.
4. **Reorder via drag.** Framer Motion supports `Reorder.Group`/`Reorder.Item` — swap `TodoList`'s `<ul>`/`AnimatePresence` for `Reorder.Group` and persist the new order.
5. **Due dates.** Add an optional `dueDate` field to each todo, show it in `TodoItem`, and sort/highlight overdue items — a good exercise in extending an existing data shape without breaking the functions that don't care about it.
6. **Extract `useLocalStorage`.** Generalize `useTodos`'s load/save logic into a reusable `useLocalStorage(key, initialValue)` hook, then build `useTodos` on top of it.

---

## Appendix A: Original Vite React Template Notes

This project started from the standard `npm create vite@latest -- --template react` scaffold. Its default `README.md` read:

> # React + Vite
>
> This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
>
> Currently, two official plugins are available:
>
> - `@vitejs/plugin-react` uses Babel for Fast Refresh
> - `@vitejs/plugin-react-swc` uses SWC for Fast Refresh
>
> ## Expanding the ESLint configuration
>
> If you are developing a production application, we recommend using TypeScript and enabling type-aware lint rules. Check out the TS template for information on how to integrate TypeScript and `typescript-eslint` in your project.

This project uses the **Babel** variant of the React plugin (`@vitejs/plugin-react` in `vite.config.js`, not the SWC one) and stays in plain JavaScript/JSX rather than migrating to TypeScript — consistent with the rest of this lecture series.

### Appendix B: Vite Template Leftovers Still in This Repo

- `src/App.css` — originally the default template stylesheet (a spinning-logo keyframe, `.card`, `.read-the-docs`). It was never imported by `App.jsx`, so this upgrade trimmed it down to a one-line comment explaining that — rather than leave dead, misleading CSS in the tree. All real styling goes through Tailwind utility classes plus `src/index.css`. Safe to delete entirely if you want a leaner tree.
- `src/assets/react.svg` — the default React logo asset from the template, unused by the app.
- `public/vite.svg` — served as the favicon (`index.html`'s `<link rel="icon">`); swap it for your own icon if you want to rebrand.
