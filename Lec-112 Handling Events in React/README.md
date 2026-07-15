# Lec-112: Handling Events in React

## Overview

Events are how a user interface comes alive. Every click, keystroke, hover, and form entry is an **event**, and React gives you a clean, declarative way to respond to all of them. Instead of manually calling `document.addEventListener(...)` the way you would in vanilla JavaScript, React lets you attach handlers **directly in JSX** using camelCased props such as `onClick`, `onChange`, and `onMouseOver`.

Under the hood, React does not hand you the browser's raw event. It wraps it in a **SyntheticEvent** — a cross-browser wrapper that behaves identically in every browser and exposes the same familiar API (`e.target`, `e.preventDefault()`, `e.target.value`, and so on). This means you write your event logic once and it works everywhere.

This lecture's project is a small but dense Vite + React app that demonstrates the complete event-handling story:

1. **Click events** — a button wired to a handler function.
2. **Mouse events** — a hover handler on a `<div>` (left commented out in the code so the alert doesn't fire constantly while testing).
3. **Change events + controlled inputs** — two text inputs (`email` and `phone`) whose values live in React state, updated by a **single shared `handleChange` function** using the event object, object spread, and computed property names.

By the end of these notes you will understand not just *how* to wire up an event, but *why* React events work the way they do — including the classic beginner traps like `onClick={handler()}` and logging state immediately after calling a setter.

---

## What You'll Learn

- What **synthetic events** are and why React uses them instead of raw browser events.
- How to attach event handlers in JSX with **camelCase props**: `onClick`, `onMouseOver`, `onChange`.
- The critical difference between **passing a handler reference** (`onClick={handleClick}`) and **calling the handler** (`onClick={handleClick()}`) — and why the second one is almost always a bug.
- How to receive and use the **event object** (`e`) inside a handler, especially `e.target.name` and `e.target.value`.
- What a **controlled input** is: `value` driven by state, `onChange` writing back to state.
- How to manage **multiple form fields with one state object and one handler**, using the spread operator (`...form`) and **computed property names** (`[e.target.name]`).
- Why `console.log(form)` right after `setForm(...)` prints the **old** value (state updates are asynchronous/batched).
- How to update state from events with `useState`.

---

## Project Structure

```
Lec-112 Handling Events in React/
├── index.html              # HTML entry point; contains <div id="root"> and loads main.jsx
├── package.json            # Project metadata, scripts (dev/build/lint/preview), dependencies
├── vite.config.js          # Vite configuration with the official React plugin
├── README.md               # You are reading it — the lecture notes
├── public/                 # Static assets served as-is (e.g. vite.svg)
└── src/
    ├── main.jsx            # React entry point; mounts <App /> into #root under StrictMode
    ├── App.jsx             # ★ The lecture code — all event handling lives here
    ├── App.css             # Component-level styles (Vite template defaults)
    ├── index.css           # Global styles, incl. the .red class used by the hover demo
    └── assets/             # Bundled assets (react.svg)
```

The only file that matters for the lecture concepts is **`src/App.jsx`** — everything else is standard Vite + React scaffolding.

---

## Concept Deep-Dives

### 1. Synthetic Events: React's Cross-Browser Event Wrapper

When you write this in `App.jsx`:

```jsx
const handleChange = (e) => {
    // setName(e.target.value)
    setForm({...form, [e.target.name]:e.target.value})
    console.log(form)
  }
```

…the `e` that React passes to your function is **not** the native DOM event. It is a `SyntheticEvent` — React's normalized wrapper around the native event. Key points:

- It has the **same interface** as a native event: `e.target`, `e.currentTarget`, `e.preventDefault()`, `e.stopPropagation()`, etc.
- It is **normalized across browsers**, so quirks between Chrome, Firefox, Safari, and older browsers disappear.
- If you ever need the raw browser event, it's available as `e.nativeEvent`.
- React attaches its listeners through **event delegation** at the root of your app rather than on every individual DOM node, which is more efficient.

In this project, the synthetic event is used in `handleChange` to read two things off the input element that fired the event:

- `e.target.name` → the input's `name` attribute (`'email'` or `'phone'`)
- `e.target.value` → whatever text the user has typed so far

### 2. Attaching Handlers in JSX: camelCase Props

In plain HTML you'd write `onclick="doSomething()"` (lowercase, a string). In React JSX you write a **camelCase prop** whose value is a **JavaScript function**, wrapped in curly braces:

```jsx
<button onClick={handleClick}>Click me</button>
```

The three event props this lecture demonstrates:

| JSX prop      | Fires when…                                   | Used on            |
|---------------|-----------------------------------------------|--------------------|
| `onClick`     | The user clicks the element                   | the `<button>`     |
| `onMouseOver` | The pointer moves onto the element            | the red `<div>` (commented out) |
| `onChange`    | The value of an input changes (each keystroke in React) | both `<input>` fields |

Note: in React, `onChange` on a text input fires on **every keystroke** (it behaves like the native `input` event), not only when the field loses focus like the native HTML `change` event.

### 3. Passing a Handler Reference vs Calling It — `onClick={handler}` vs `onClick={handler()}`

This is the single most important line in the file:

```jsx
<button onClick={handleClick}>Click me</button>
```

Notice there are **no parentheses** after `handleClick`. We are passing the **function itself** (a reference) so that *React* can call it later, whenever the click actually happens.

Compare the two forms:

- `onClick={handleClick}` ✅ — "Hey React, here is a function. Call it **when the button is clicked**."
- `onClick={handleClick()}` ❌ — "Call `handleClick` **right now, during render**, and pass whatever it returns (here `undefined`) to `onClick`."

With the broken second form, the alert would pop up **immediately when the component renders**, and clicking the button afterwards would do nothing. Worse, if the handler updates state, calling it during render triggers a re-render, which calls it again… producing an **infinite render loop**.

**What if you need to pass arguments?** This project's handlers don't take custom arguments, so the plain reference is perfect. But when you *do* need to pass something, you can't write `onClick={doThing("hello")}` (that calls it immediately). The standard pattern is to wrap the call in an **arrow function**, which is itself just a reference that React invokes on click:

```jsx
onClick={() => doThing("hello")}
```

The arrow function is the reference; the call to `doThing("hello")` only happens when React invokes that arrow function.

### 4. `onClick` in Action: the Click Handler

The handler definition (verbatim from `App.jsx`):

```jsx
const handleClick = () => {
    alert("Hey I am clicked")
  }
```

And where it's wired up:

```jsx
<div className="button">
        <button onClick={handleClick}>Click me</button>
      </div>
```

Flow: the user clicks → React's delegated listener catches the native event → React creates a SyntheticEvent → React calls `handleClick` → the browser shows the alert `"Hey I am clicked"`. The handler here ignores the event object because it doesn't need any information about the event — it just reacts to the fact that a click occurred.

### 5. `onMouseOver`: Mouse Events (the Commented-Out Demo)

The lecture also demonstrates a hover handler:

```jsx
const handleMouseOver = () => {
    alert("Hey I am a mouse over")
  }
```

It was attached to a red `<div>`, which is currently **commented out** in the JSX:

```jsx
{/* <div className="red" onMouseOver={handleMouseOver}>
        I am a red div
      </div> */}
```

(Also note the JSX comment syntax: `{/* ... */}` — you cannot use plain `<!-- -->` HTML comments inside JSX.)

The `.red` class it references is defined globally in `src/index.css`:

```css
.red{
  background-color: red;
  color: white;
  height: 233px;
  width: 344px;
}
```

Why is it commented out? Because `onMouseOver` fires **every time the pointer enters the element** (and, unlike `onMouseEnter`, it also bubbles from children). An `alert()` on hover is extremely annoying while developing — every stray mouse movement over the div blocks the page with a popup. It's left in the source as a teaching artifact: uncomment it, hover over the red box, and you'll see `"Hey I am a mouse over"`. Then comment it right back.

### 6. `onChange`, the Event Object, and Controlled Inputs

The two inputs (verbatim):

```jsx
<input type="text" name='email' value={form.email?form.email:"" } onChange={handleChange} />
      <input type="text" name='phone' value={form.phone?form.phone:"" } onChange={handleChange} /> 
```

These are **controlled inputs** — the gold-standard React form pattern. A controlled input has two halves:

1. **`value={...}`** — the input displays exactly what React state says it should. The DOM is no longer the source of truth; the `form` state object is.
2. **`onChange={handleChange}`** — every keystroke reports back to React, which updates state, which re-renders the input with the new value.

The data flows in a loop: **state → `value` → user types → `onChange` → `setForm` → new state → new `value`**. If you provided `value` without `onChange`, the input would be frozen (read-only), and React would warn you in the console.

Note the ternary in the `value` prop: `form.email ? form.email : ""`. Since `form` starts as an **empty object** (`useState({})`), `form.email` is `undefined` on the first render. Passing `undefined` as `value` would make the input **uncontrolled**, and React would throw the famous warning: *"A component is changing an uncontrolled input to be controlled."* The ternary guarantees the value is always a string — `""` until the user types something.

### 7. One Handler, Many Fields: Spread + Computed Property Names

Instead of writing a separate handler and a separate `useState` for every field, the lecture stores the whole form in **one state object**:

```jsx
const [form, setForm] = useState({})
```

…and updates it with **one shared handler**:

```jsx
const handleChange = (e) => {
    // setName(e.target.value)
    setForm({...form, [e.target.name]:e.target.value})
    console.log(form)
  }
```

This one line — `setForm({...form, [e.target.name]:e.target.value})` — packs three big JavaScript/React ideas:

1. **Immutability via spread (`...form`)**: React state must never be mutated in place. `{...form}` creates a *brand-new object* containing all existing keys, so React can detect the change and re-render. Without the spread, typing in the phone field would **erase** whatever you'd typed in the email field, because the new object would contain only the phone key.
2. **Computed property names (`[e.target.name]`)**: the square brackets mean "use the *value* of this expression as the key." If the user typed in the input with `name='email'`, this becomes the key `"email"`; if they typed in `name='phone'`, it becomes `"phone"`. That's why one handler can serve any number of inputs — the input's own `name` attribute routes the value to the right slot in state.
3. **The event object as the data source**: `e.target` is the exact `<input>` element that fired the event, so `e.target.value` is always the current text of *that* field.

Type "a" into the email box and then "9" into the phone box, and state evolves like this:

```
{}                                  // initial
{ email: "a" }                      // after typing in email
{ email: "a", phone: "9" }          // after typing in phone
```

The commented-out lines show the *simpler* version taught first — one string of state per field:

```jsx
// const [name, setName] = useState("Harry")
```

```jsx
// setName(e.target.value)
```

That works fine for one input, but scales terribly: ten fields would mean ten `useState` calls and ten handlers. The object-based `form` pattern replaces all of that with one state and one handler.

### 8. State Updates from Events Are Asynchronous (the `console.log` Surprise)

Look closely at `handleChange` again:

```jsx
setForm({...form, [e.target.name]:e.target.value})
    console.log(form)
```

If you type "a" into the email field and check the console, it prints `{}` — **not** `{ email: "a" }`. Type "ab" and it prints `{ email: "a" }`. The log is always **one keystroke behind**.

Why? `setForm` does **not** change `form` immediately. It *schedules* a re-render; only on that next render does the `form` variable (a `const` captured by this closure) hold the new object. Inside the current handler, `form` is still the old snapshot. This is intentional — React batches state updates for performance — and it's one of the most common sources of beginner confusion. If you need to see the freshly computed value, log the object you passed to the setter, or log `form` in the component body (it runs on every render).

---

## Full Code Walkthrough: `src/App.jsx` Line by Line

Here is the entire file, followed by a line-by-line commentary:

```jsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  // const [name, setName] = useState("Harry")
  const [form, setForm] = useState({})

  const handleClick = () => {
    alert("Hey I am clicked")
  }

  const handleMouseOver = () => {
    alert("Hey I am a mouse over")
  }

  const handleChange = (e) => {
    // setName(e.target.value)
    setForm({...form, [e.target.name]:e.target.value})
    console.log(form)
  }

  return (
    <>
      <div className="button">
        <button onClick={handleClick}>Click me</button>
      </div>

      {/* <div className="red" onMouseOver={handleMouseOver}>
        I am a red div
      </div> */}

      <input type="text" name='email' value={form.email?form.email:"" } onChange={handleChange} />
      <input type="text" name='phone' value={form.phone?form.phone:"" } onChange={handleChange} /> 
    </>
  )
}

export default App
```

| Line(s) | Code | Explanation |
|---------|------|-------------|
| 1 | `import { useState } from 'react'` | Named import of the `useState` hook — the tool that lets a function component hold state between renders. |
| 2 | `import reactLogo from './assets/react.svg'` | Leftover from the Vite template. Imports the React logo as an asset URL. **Not used** in the JSX below. |
| 3 | `import viteLogo from '/vite.svg'` | Also template leftover. The leading `/` means it comes from the `public/` folder. **Not used** either. |
| 4 | `import './App.css'` | Pulls in the component's stylesheet as a side-effect import. |
| 6 | `function App() {` | The component itself — a plain JavaScript function that returns JSX. |
| 7 | `const [count, setCount] = useState(0)` | State from the original template counter. **Declared but never used** in this lecture's UI — a harmless leftover. |
| 8 | `// const [name, setName] = useState("Harry")` | Commented-out state from the *first* version of the lesson: a single string state controlling a single input. Kept to show the progression to the object-based approach. |
| 9 | `const [form, setForm] = useState({})` | The star of the show: **one object holds the entire form**. It starts empty; keys (`email`, `phone`) appear as the user types. |
| 11–13 | `const handleClick = () => { alert("Hey I am clicked") }` | Click handler, defined as an arrow function stored in a `const`. Ignores the event object; just fires an alert. |
| 15–17 | `const handleMouseOver = () => { alert("Hey I am a mouse over") }` | Hover handler for the red div demo. Currently unused because its div is commented out (lines 31–33). |
| 19–23 | `const handleChange = (e) => { ... }` | The shared change handler. Takes the synthetic event `e`, builds a new form object with spread + computed key, schedules the state update, then logs the (still old) `form`. |
| 25 | `return (` | Beginning of the JSX the component renders. |
| 26 / 37 | `<>` … `</>` | A **Fragment** — lets the component return multiple sibling elements (`div`, two `input`s) without adding a wrapper node to the DOM. |
| 27–29 | `<div className="button"><button onClick={handleClick}>Click me</button></div>` | The click demo. Note `className` (not `class` — `class` is a reserved word in JavaScript) and the handler passed **by reference, without parentheses**. |
| 31–33 | `{/* <div className="red" onMouseOver={handleMouseOver}> ... */}` | The hover demo, commented out with JSX comment syntax so alerts don't fire on every mouse movement. Uncomment to try it; the `.red` styles live in `index.css`. |
| 35 | `<input type="text" name='email' value={form.email?form.email:"" } onChange={handleChange} />` | Controlled email input. `name='email'` is what `e.target.name` reads; the ternary keeps `value` a string (never `undefined`). |
| 36 | `<input type="text" name='phone' value={form.phone?form.phone:"" } onChange={handleChange} />` | Controlled phone input — identical wiring, different `name`, **same handler**. This is the payoff of the computed-property pattern. |
| 41 | `export default App` | Default export so `main.jsx` can import and render the component. |

### Supporting Files (Brief)

- **`src/main.jsx`** — the boot file. It grabs `<div id="root">` from `index.html` and renders `<App />` inside `<React.StrictMode>`:

  ```jsx
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  ```

  StrictMode is a development-only helper that double-invokes renders to surface impure code. It does not affect event handling behavior in production.

- **`index.html`** — the single page Vite serves. Contains `<div id="root"></div>` and `<script type="module" src="/src/main.jsx"></script>`.
- **`vite.config.js`** — minimal config: `plugins: [react()]` enables JSX transformation and Fast Refresh.
- **`package.json`** — project name `video-112`; React 18.2, Vite 5; scripts covered below.
- **`src/App.css` / `src/index.css`** — mostly Vite template styling; `index.css` additionally defines the `.red` class for the hover demo.

---

## How to Run

Prerequisite: Node.js (v18+ recommended) with npm.

1. Open a terminal in the project folder:

   ```bash
   cd "Lec-112 Handling Events in React"
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open the printed URL (typically `http://localhost:5173`) in your browser.

Things to try once it's running:

- Click **"Click me"** → alert appears.
- Type into the **email** and **phone** inputs while the DevTools console is open → watch the `form` object grow (and notice it's always one keystroke behind — see Deep-Dive #8).
- Uncomment the red div (lines 31–33 of `App.jsx`) → hover it → alert appears. Re-comment it before continuing.

Other available scripts: `npm run build` (production build), `npm run preview` (serve the build), `npm run lint` (ESLint).

---

## Key Takeaways

1. **React event props are camelCase and take functions**: `onClick={fn}`, `onChange={fn}`, `onMouseOver={fn}` — never strings like in HTML.
2. **Pass the reference, don't call it.** `onClick={handleClick}` hands React a function to call later; `onClick={handleClick()}` runs it immediately during render.
3. **`e` is a SyntheticEvent** — a normalized, cross-browser wrapper. `e.target.name` and `e.target.value` are your form-handling workhorses.
4. **Controlled inputs** pair `value` (state → UI) with `onChange` (UI → state), making React state the single source of truth.
5. **One object + one handler scales to any form**, thanks to `{...form, [e.target.name]: e.target.value}` — spread preserves the other fields, the computed key routes the new value.
6. **State setters are asynchronous.** The state variable in the current closure keeps its old value until the next render; don't expect `console.log(form)` right after `setForm(...)` to show the update.
7. **Never pass `undefined` as a controlled `value`** — default missing fields to `""` (the code uses a ternary for this).

## Common Pitfalls

- **`onClick={handleClick()}`** — calling instead of passing. Fires on render, does nothing on click, and can cause infinite loops if the handler sets state.
- **Forgetting the spread**: `setForm({[e.target.name]: e.target.value})` (without `...form`) wipes out every other field each keystroke.
- **Mutating state directly**: `form.email = e.target.value` changes the object without telling React — no re-render happens. Always build a new object.
- **Reading state right after setting it**: `console.log(form)` after `setForm(...)` shows the *previous* value. This is expected, not a bug.
- **`value` without `onChange`**: the input becomes read-only and React logs a warning. Controlled inputs need both halves.
- **`undefined` initial values**: starting `form` as `{}` means `form.email` is `undefined` at first; feed the input `""` instead (via the ternary) to avoid the "uncontrolled to controlled" warning.
- **Using `class` or lowercase `onclick` in JSX**: JSX needs `className` and camelCase event props.
- **HTML comments in JSX**: `<!-- -->` breaks; use `{/* ... */}` like the red-div block does.

## Practice Exercises

1. **Restore the hover demo.** Uncomment the red `<div>` in `App.jsx`, but replace the `alert` in `handleMouseOver` with a `console.log` so it doesn't block the page. Then try switching `onMouseOver` to `onMouseOut` and observe the difference.
2. **Break it on purpose.** Change the button to `onClick={handleClick()}` and reload. Explain exactly what you observe and why. Then change it back.
3. **Add a third field.** Add an `<input type="text" name='address' ... />` wired to the same `handleChange`, following the same `value` ternary pattern. Notice you don't have to touch the handler at all.
4. **Display the state.** Render `<p>Email: {form.email}</p>` and `<p>Phone: {form.phone}</p>` below the inputs so the state is visible live as you type — no console needed.
5. **Fix the stale log.** Change `handleChange` so the console always shows the *up-to-date* form. (Hint: build the new object in a variable first — `const newForm = {...form, [e.target.name]: e.target.value}` — then pass it to `setForm` and log it. Or log `form` in the component body instead.)

---

## Appendix: Original Vite Template Notes

The original `README.md` shipped with this project is preserved below, verbatim.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
