# Lec-115: React Router — Client-Side Routing in a React SPA

> **Stack:** Vite + React 18 + `react-router-dom` **v6.22.0** (exact range from `package.json`: `"react-router-dom": "^6.22.0"`)

## Overview

A traditional multi-page website asks the server for a brand-new HTML document every time you click a link — the browser flashes white, all JavaScript state is destroyed, and everything re-downloads. A **Single Page Application (SPA)** loads **one** HTML file (`index.html`) exactly once, and from then on JavaScript swaps components in and out of the page as the URL changes.

**React Router** is the library that makes this possible. It:

1. **Intercepts navigation** (clicks on `<Link>`/`<NavLink>`) so the browser never performs a full page reload.
2. **Updates the URL** in the address bar using the browser's History API — so back/forward buttons, bookmarks, and sharing links all still work.
3. **Matches the current URL against your route table** and renders the React component tree you registered for that path.

In this lecture project we build a tiny app with four routes — `/`, `/login`, `/about`, and a **dynamic** route `/user/:username` — using the modern **Data Router API**: `createBrowserRouter` + `RouterProvider`.

---

## What You'll Learn

- What client-side routing is and why SPAs need a router at all.
- How to define a route table with **`createBrowserRouter`** and mount it with **`RouterProvider`**.
- The difference between **`<a href>`** (full page reload) and **`<Link>` / `<NavLink>`** (instant SPA navigation).
- How **`NavLink`** knows which link is "active" and how to style it (`isActive`).
- **Dynamic route segments** (`/user/:username`) and reading them with the **`useParams`** hook.
- How routing works under the hood: the History API, route matching, and re-rendering.
- Common production pitfalls: 404s on refresh, `<a>` tags killing your state, params always being strings.

---

## Project Structure

```
Lec-115 React Router Routing/
├── index.html                  # The ONE html page of the SPA (has <div id="root">)
├── package.json                # Scripts + deps (react-router-dom ^6.22.0)
├── README.md                   # ← you are here
└── src/
    ├── main.jsx                # Entry point: mounts <App /> into #root
    ├── App.jsx                 # Router table: createBrowserRouter + RouterProvider
    ├── App.css                 # (empty in this project)
    ├── index.css               # Global styles: navbar layout + .red active class
    └── components/
        ├── Navbar.jsx          # NavLink-based navigation (shared across pages)
        ├── Home.jsx            # Rendered at "/"
        ├── About.jsx           # Rendered at "/about"
        ├── Login.jsx           # Rendered at "/login"
        └── User.jsx            # Rendered at "/user/:username" — uses useParams()
```

> **Note:** `node_modules/` and `package-lock.json` exist too but are install artifacts, not lecture content.

---

## Concept Deep-Dives

### 1. `createBrowserRouter` + `RouterProvider` (the Data Router API)

React Router v6.4+ introduced a new way to declare routes: instead of JSX (`<BrowserRouter><Routes><Route/>...`), you build the route table as a **plain JavaScript array of objects**, and hand it to a provider. This is what our `App.jsx` actually uses:

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
```

```jsx
  const router = createBrowserRouter([
    {
      path: "/",
      element: <><Navbar /><Home /></>
    },
    {
      path: "/login",
      element: <><Navbar /><Login /></>
    },
    {
      path: "/about",
      element: <><Navbar /><About /></>
    },
    {
      path: "/user/:username",
      element: <><Navbar /><User /></>
    },
  ])
```

Each object is a **route record**:

| Key | Meaning |
|---|---|
| `path` | The URL pattern to match (`:username` is a dynamic segment — see below). |
| `element` | The JSX to render when the pattern matches. Here every route renders `<Navbar />` plus its page inside a fragment `<>...</>`, so the navbar appears on every page. |

Then the whole app is just the provider:

```jsx
      <RouterProvider router={router} />
```

`RouterProvider` subscribes to URL changes and renders whichever route record currently matches. **Nothing outside `RouterProvider` ever changes during navigation.**

> **Design note (nested layouts):** This project repeats `<Navbar />` in every route on purpose, to keep the mental model simple. React Router also supports **nested/layout routes** — one parent route renders `<Navbar />` + an `<Outlet />`, and children (`Home`, `About`, ...) render into the outlet. This project does **not** use nesting; it's the natural next refactor (see Exercises).

### 2. `Link` / `NavLink` vs `<a>` — SPA navigation vs full reload

A plain anchor tag:

```html
<a href="/about">About</a>
```

tells the **browser** to navigate. The browser throws away the current page, makes an HTTP request, and re-boots your entire React app. All state is lost. This is exactly what a SPA must avoid.

React Router's `<Link to="/about">` renders an `<a>` under the hood, but attaches a click handler that calls `event.preventDefault()`, pushes the new URL via the History API, and lets React swap components — **zero network round-trip, zero reload, state preserved**.

`<NavLink>` is `Link` with one superpower: it *knows whether its own `to` matches the current URL*, so you can style the active menu item. Its `className` prop can be a **function** that receives `{ isActive, isPending }`. From our `Navbar.jsx`:

```jsx
        <NavLink className={(e)=>{return e.isActive?"red": "" }} to="/"><li>Home</li></NavLink>
```

When the URL is `/`, `e.isActive` is `true`, so the link gets the class `red`, which `index.css` styles:

```css
.red{
  background-color: red;
  color: white
}
```

Click "About" and the router re-evaluates every `NavLink`: the About link becomes red, Home loses the class. Automatic active-tab highlighting, no manual state.

> The parameter is named `e` in this code, but it is **not** an event — it's a render-props object `{ isActive, isPending }`. The idiomatic spelling is `className={({ isActive }) => isActive ? "red" : ""}`.

### 3. Dynamic route params — `:username` + `useParams()`

The route `path: "/user/:username"` contains a **dynamic segment**. The colon means "match anything in this slot and capture it under the name `username`". So `/user/shaurya`, `/user/rohan`, `/user/42` all match this one route.

Inside the rendered component, the captured value is read with the `useParams` hook — verbatim from `User.jsx`:

```jsx
import { useParams } from 'react-router-dom'

const User = () => {
    const params = useParams()
  return (
    <div>
      I am user {params.username}
    </div>
  )
}
```

Visit `http://localhost:5173/user/shaurya` → the page renders **"I am user shaurya"**. The key on the params object (`params.username`) is exactly the name after the colon in the path.

> **Params are always strings.** `/user/42` gives you `"42"`, not `42`. Convert with `Number(params.id)` when you need arithmetic or a numeric DB lookup.

### 4. Exact dependency versions

From `package.json`:

```json
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
```

`^6.22.0` means "6.22.0 or any newer 6.x" — everything in these notes is React Router **v6** API (v6.4+ data-router style). Dev tooling is Vite `^5.1.0` with `@vitejs/plugin-react`.

---

## Full Code Walkthrough

### `index.html` — the only page that ever loads

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

The whole app lives inside `<div id="root">`. No matter which route you're on, this file never changes — that's the "single page" in SPA.

### `src/main.jsx` — boot the React app

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

Standard Vite/React 18 entry: create a root on `#root`, render `<App />` in `StrictMode`. Global styles come from `index.css` (imported here, not in App).

### `src/App.jsx` — the router table

```jsx
import './App.css'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './components/Login'
import About from './components/About'
import User from './components/User'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <><Navbar /><Home /></>
    },
    {
      path: "/login",
      element: <><Navbar /><Login /></>
    },
    {
      path: "/about",
      element: <><Navbar /><About /></>
    },
    {
      path: "/user/:username",
      element: <><Navbar /><User /></>
    },
  ])
  return (
    <>
      
      <RouterProvider router={router} />

    </>
  )
}

export default App
```

Reading it top to bottom:

1. **Imports** — every page component, plus the two router pieces.
2. **`createBrowserRouter([...])`** — the four route records described above. Each `element` is a fragment pairing `<Navbar />` with the page, so navigation chrome is consistent everywhere.
3. **`<RouterProvider router={router} />`** — the entire render output of `App`. From this point on, React Router owns what's on screen.

> Minor nit: the `router` is created *inside* the component body, so it's re-created on every `App` render. Here `App` renders once so it's harmless, but the tidier pattern is to define `const router = createBrowserRouter(...)` **outside** the component (module scope).

### `src/components/Navbar.jsx` — active-aware navigation

```jsx
import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
    
  return (
    <div>
      <nav>
        <NavLink className={(e)=>{return e.isActive?"red": "" }} to="/"><li>Home</li></NavLink>
        <NavLink className={(e)=>{return e.isActive?"red": "" }} to="/about"><li>About</li></NavLink>
        <NavLink className={(e)=>{return e.isActive?"red": "" }} to="/login"><li>Login</li></NavLink>
      </nav>
    </div>
  )
}

export default Navbar
```

- Three `NavLink`s target the three static routes. There is no navbar entry for `/user/:username` — you visit it by typing the URL, which is a great way to *prove* the dynamic matching works.
- The `className` function returns `"red"` only for the link whose `to` matches the current location.
- HTML pedantry: an `<li>` should live inside a `<ul>`/`<ol>`, and here the `<li>` is *inside* the anchor. Browsers render it fine and the CSS (`li { list-style: none; padding: 23px; }`) makes them look like nav buttons — but the semantic structure would be `<ul><li><NavLink>...</NavLink></li></ul>`.

### `src/components/Home.jsx`

```jsx
import React from 'react'

const Home = () => {
  return (
    <div>
      I am Home
    </div>
  )
}

export default Home
```

### `src/components/About.jsx`

```jsx
import React from 'react'

const About = () => {
  return (
    <div>
      About
    </div>
  )
}

export default About
```

### `src/components/Login.jsx`

```jsx
import React from 'react'

const Login = () => {
  return (
    <div>
      Login
    </div>
  )
}

export default Login
```

Three deliberately minimal "page" components — the point of the lecture is the *routing*, not the pages. Each one only renders when its route matches.

### `src/components/User.jsx` — reading URL params

```jsx
import React from 'react'
import { useParams } from 'react-router-dom'

const User = () => {
    const params = useParams()
  return (
    <div>
      I am user {params.username}
    </div>
  )
}

export default User
```

`useParams()` returns an object of every dynamic segment captured by the matched route. For `/user/harry` → `{ username: "harry" }` → the page reads "I am user harry". One component, infinite URLs.

### `src/index.css` — global styles (imported in `main.jsx`)

```css
nav{
  display: flex;
  gap: 34px;
  background-color: black;
  color: white;
}

li{
  list-style: none;
  padding: 23px;
}

a li {
  color: white;
}

*{
  padding: 0;
  margin: 0;
}

.red{
  background-color: red;
  color: white
}
```

Flexbox lays the links out horizontally on a black bar; `.red` is the active-link highlight that `NavLink` toggles.

### `src/App.css`

Imported by `App.jsx` but **empty** in this project — all styling lives in `index.css`.

---

## How Routing Works Under the Hood

1. **One document, forever.** The server sends `index.html` once. React boots, `RouterProvider` reads the current `window.location.pathname`, and renders the matching route's `element`.

2. **The History API.** Browsers expose `history.pushState(state, "", url)` — it changes the address bar **without** triggering a network request or reload. `createBrowserRouter` builds on exactly this. When you click a `<Link>`:
   - the click's default behavior (`<a>` navigation) is prevented,
   - `pushState` writes the new URL into the address bar and the session history stack,
   - the router fires its listeners.
   Back/forward buttons emit a `popstate` event, which the router also listens for — so browser history "just works" even though no pages were ever loaded.

3. **Matching.** The router compares the new pathname against every `path` in the route table. Static segments (`/about`) must match literally; dynamic segments (`:username`) match any single segment and capture its value. Ranking prefers more specific routes, so `/login` wins over a hypothetical `/:page`. The captured values become the object `useParams()` returns.

4. **Re-render, not reload.** Once matched, the router updates its internal state, and React reconciles: `RouterProvider`'s children change from `<><Navbar /><Home /></>` to `<><Navbar /><About /></>`. Only the changed part of the DOM is touched. Component state elsewhere in the tree, module-level caches, and open WebSocket connections all survive — because the page never reloaded.

5. **Active-link tracking.** Every `NavLink` subscribes to the current location via context. On each navigation, each one re-runs its `className` function with a fresh `isActive`, which is simply "does my `to` match the current URL".

**Full reload (`<a>`)**: browser → server → new HTML → re-download JS → re-boot React → state gone.
**SPA navigation (`<Link>`)**: `pushState` → match → re-render. Milliseconds, no flash, state intact.

---

## How to Run

```bash
cd "Lec-115 React Router Routing"
npm install
npm run dev
```

Vite prints a local URL (typically `http://localhost:5173`). Things to try:

1. Click **Home / About / Login** — watch the Network tab: **no document requests**, and the active tab turns red.
2. Type `http://localhost:5173/user/yourname` directly — the dynamic route renders "I am user yourname".
3. Compare: replace a `NavLink` with a raw `<a href>` temporarily and watch the full-page flash. (Then put it back!)

Other scripts from `package.json`: `npm run build` (production bundle), `npm run preview` (serve the build), `npm run lint`.

---

## Key Takeaways

- A SPA has **one** HTML file; the router decides which components render for which URL.
- **`createBrowserRouter`** takes an array of `{ path, element }` records; **`RouterProvider`** renders the match.
- Use **`Link`/`NavLink`** for internal navigation — never `<a>` — to avoid full reloads and state loss.
- **`NavLink`**'s `className` can be a function of `{ isActive }` for automatic active-tab styling.
- **`:param`** in a path creates a dynamic segment; **`useParams()`** reads it inside the component.
- Under the hood it's just `history.pushState` + URL pattern matching + a React re-render.

## Common Pitfalls

1. **Using `<a href="...">` for internal links.** Works, but triggers a full reload: state wiped, app re-booted, UX flash. Reserve `<a>` for *external* URLs; use `Link`/`NavLink` inside the app.
2. **404 on refresh in production.** `npm run dev` handles this for you, but on a real static host, refreshing at `/about` makes the browser request `/about` from the *server*, which only has `index.html` → 404. Fix: configure the server to rewrite all routes to `index.html` (SPA fallback), e.g. Netlify `_redirects` `/* /index.html 200`, or nginx `try_files $uri /index.html;`.
3. **Assuming params are typed.** `useParams()` values are **always strings** (`"42"`, not `42`). Convert explicitly before comparing to numbers or hitting a database, and validate — `/user/💥` matches too.
4. **Rendering the router without a catch-all.** This project defines no `path: "*"` route or `errorElement`, so an unknown URL like `/xyz` shows React Router's default error screen. Real apps add a 404 route.
5. **Repeating layout in every route.** Copy-pasting `<Navbar />` into each `element` works but doesn't scale; nested routes with `<Outlet />` are the intended pattern.

## Practice Exercises

1. **Add a 404 page.** Create `NotFound.jsx` and register `{ path: "*", element: <><Navbar /><NotFound /></> }`. Verify `/does-not-exist` shows it.
2. **Refactor to a layout route.** Make a `Layout` component that renders `<Navbar />` and `<Outlet />`; convert the route table to one parent with four `children`, removing the duplicated `<Navbar />`.
3. **Two params.** Add `/user/:username/:postId` and render both values from `useParams()`. Confirm both are strings with `typeof`.
4. **Programmatic navigation.** In `Login.jsx`, add a button that calls `useNavigate()` to send the user to `/` (simulating "login successful → go home").
5. **Prove the reload difference.** Add a `useState` counter in `Navbar`. Increment it, navigate with `NavLink` (counter survives? why/why not — note Navbar remounts per route here!), then try with `<a>` and explain what you observe.

---

## Appendix: Original Vite Template Notes

The original boilerplate `README.md` shipped with this project, preserved verbatim:

> # React + Vite
>
> This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
>
> Currently, two official plugins are available:
>
> - [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
> - [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
