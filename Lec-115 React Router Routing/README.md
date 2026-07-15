# Lec-115: React Router — Client-Side Routing in a React SPA

> **Stack:** Vite + React 18 + `react-router-dom` **v6.22.0** (exact range from `package.json`: `"react-router-dom": "^6.22.0"`)

## Overview

A traditional multi-page website asks the server for a brand-new HTML document every time you click a link — the browser flashes white, all JavaScript state is destroyed, and everything re-downloads. A **Single Page Application (SPA)** loads **one** HTML file (`index.html`) exactly once, and from then on JavaScript swaps components in and out of the page as the URL changes.

**React Router** is the library that makes this possible. It:

1. **Intercepts navigation** (clicks on `<Link>`/`<NavLink>`) so the browser never performs a full page reload.
2. **Updates the URL** in the address bar using the browser's History API — so back/forward buttons, bookmarks, and sharing links all still work.
3. **Matches the current URL against your route table** and renders the React component tree you registered for that path.

This project is a small, real-looking app — "React Router Lab" — built around five routes: `/`, `/about`, `/login`, a **dynamic** route `/user/:username`, and a catch-all 404, all wired through the modern **Data Router API**: `createBrowserRouter` + `RouterProvider`, with a **layout route** so the navbar renders exactly once.

---

## What You'll Learn

- What client-side routing is and why SPAs need a router at all.
- How to define a route table with **`createBrowserRouter`** and mount it with **`RouterProvider`**.
- How a **layout route** + **`<Outlet />`** keeps shared chrome (navbar, footer) from remounting on every navigation.
- The difference between **`<a href>`** (full page reload) and **`<Link>` / `<NavLink>`** (instant SPA navigation).
- How **`NavLink`** knows which link is "active" and how to style it with the `{ isActive }` render prop.
- **Dynamic route segments** (`/user/:username`) and reading them with the **`useParams`** hook.
- **Programmatic navigation** with **`useNavigate`** (typing a handle and pressing "Go").
- Handling unmatched URLs with a **catch-all `path: "*"`** route and an **`errorElement`**.
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
    ├── App.jsx                 # Router table: createBrowserRouter + RouterProvider (module scope)
    ├── index.css                # The entire design system: tokens, layout, every component's styles
    ├── data/
    │   └── users.js             # Sample "directory" of users the dynamic route links to
    └── components/
        ├── Layout.jsx           # Layout route: <Navbar /> + <Outlet /> + <Footer /> — renders once
        ├── Navbar.jsx           # nav > ul > li > NavLink, active styling, live "route console"
        ├── Footer.jsx           # Small footer shown on every page
        ├── Home.jsx             # Rendered at "/" — hero, feature grid, user directory
        ├── About.jsx            # Rendered at "/about"
        ├── Login.jsx            # Rendered at "/login" — styled, non-functional form
        ├── User.jsx             # Rendered at "/user/:username" — uses useParams()
        ├── NotFound.jsx         # Rendered at "*" and as the router's errorElement
        ├── RouteTable.jsx       # Visual mirror of the route tree (used on Home + NotFound)
        └── UsernameJump.jsx     # Reusable "type a handle → navigate" form (useNavigate)
```

> **Note:** `node_modules/` and `package-lock.json` exist too but are install artifacts, not lecture content. `src/App.css` from the original template has been removed — it was empty and its import was dead weight; every style now lives in `index.css`.

---

## Concept Deep-Dives

### 1. `createBrowserRouter` + `RouterProvider`, with a layout route

React Router v6.4+ introduced a new way to declare routes: instead of JSX (`<BrowserRouter><Routes><Route/>...`), you build the route table as a **plain JavaScript array of objects**, and hand it to a provider. Here's the actual `App.jsx`:

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import About from './components/About'
import Login from './components/Login'
import User from './components/User'
import NotFound from './components/NotFound'

// Defined once at module scope, not inside App() — otherwise a fresh router
// (and a fresh history listener) would be created on every render.
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'login', element: <Login /> },
      { path: 'user/:username', element: <User /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
```

What changed from a flat route table, and why it matters:

| Key | Meaning |
|---|---|
| `path: '/'` (parent) | Matches the whole app. Its `element` — `<Layout />` — is a **layout route**: it renders shared chrome once and an `<Outlet />` for whichever child matches. |
| `children` | Each child's `path` is **relative** to the parent (`'about'`, not `'/about'`), and its `element` renders *inside* the parent's `<Outlet />`. |
| `index: true` | The child that renders at the parent's own path (`/`) with no extra segment — this is `Home`. |
| `path: '*'` | The **catch-all**. Matches any URL that didn't match a route above it — renders `NotFound`. |
| `errorElement` | Catches errors *thrown* while rendering (or in a loader/action) anywhere under this route, and renders `NotFound` instead of a blank white screen. |

`router` is declared with `const router = createBrowserRouter([...])` **outside** the `App` function, at module scope. It's built exactly once when the module loads, not on every render — the earlier version of this project rebuilt it inside the component body every time `App` re-rendered.

### 2. Layout routes + `<Outlet />` — the navbar renders once

This is the headline fix. Previously every route's `element` was `<><Navbar /><Home /></>`, `<><Navbar /><About /></>`, and so on — four separate `<Navbar />` elements. React had no way to know these were "the same" navbar across navigations, so it **unmounted and remounted** it every time you clicked a link.

Now there is exactly one `<Navbar />`, inside `Layout.jsx`:

```jsx
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = () => {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content" className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
```

`<Outlet />` is a placeholder: React Router renders whichever child route matched *there*, and only there. `Layout` itself never unmounts while you navigate between `/`, `/about`, `/login`, or `/user/:username` — so `Navbar` and `Footer` persist across every navigation.

### 3. `Link` / `NavLink` vs `<a>` — SPA navigation vs full reload

A plain anchor tag:

```html
<a href="/about">About</a>
```

tells the **browser** to navigate. The browser throws away the current page, makes an HTTP request, and re-boots your entire React app. All state is lost. This is exactly what a SPA must avoid.

React Router's `<Link to="/about">` renders an `<a>` under the hood, but attaches a click handler that calls `event.preventDefault()`, pushes the new URL via the History API, and lets React swap components — **zero network round-trip, zero reload, state preserved**.

`<NavLink>` is `Link` with one superpower: it *knows whether its own `to` matches the current URL*, so you can style the active menu item. Its `className` prop can be a **function** that receives `{ isActive, isPending }`. From the real `Navbar.jsx`:

```jsx
import { Link, NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/login', label: 'Login' },
]

const Navbar = () => {
  const location = useLocation()

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">/</span>
          <span className="brand-name">react-router-lab</span>
        </Link>

        <nav aria-label="Primary">
          <ul className="nav-links">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="route-console" aria-hidden="true">
          <span className="console-prefix">route&nbsp;&rarr;</span>
          <span className="console-path" translate="no">{location.pathname}</span>
          <span className="console-caret" />
        </div>
      </div>
    </header>
  )
}

export default Navbar
```

Three things worth calling out, since the earlier version got them wrong:

- **The `className` callback parameter is `{ isActive }`, not `e`.** It was never an event — it's a render-props object React Router hands you (`{ isActive, isPending }`). Destructuring it by name makes that obvious at the call site.
- **Valid HTML structure.** `<nav>` wraps a real `<ul>`, each item is a real `<li>`, and the clickable `NavLink` lives *inside* the `<li>` — not the other way around (`<NavLink><li>...</li></NavLink>`, which the original code did).
- **`end={true}` on the Home link.** Without `end`, `NavLink to="/"` would match *every* path (since every path starts with `/`) and stay permanently highlighted. `end` restricts it to an exact match.

The `route-console` strip is a small teaching aid unique to this project: it shows the router's own `location.pathname` live, in monospace, like a terminal prompt — a constant, visible reminder that "the URL is the current state."

### 4. Dynamic route params — `:username` + `useParams()`

The route `path: 'user/:username'` contains a **dynamic segment**. The colon means "match anything in this slot and capture it under the name `username`". So `/user/ada`, `/user/rohan`, `/user/42` all match this one route. From `User.jsx`:

```jsx
import { Link, useParams } from 'react-router-dom'
import users from '../data/users'
import UsernameJump from './UsernameJump'

const User = () => {
  const { username } = useParams()
  const profile = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase(),
  )
  // ...renders profile, or a "no preset profile" fallback, plus quick links
  // to other sample users and a UsernameJump form to try any handle.
}
```

Visit `http://localhost:5173/user/ada` → the captured `username` is `"ada"`, which matches an entry in `src/data/users.js`, so a real profile card renders. Visit `/user/anything-else` → the route still matches (dynamic segments match *any* string), but there's no preset bio, so a fallback message explains that the router matched anyway.

> **Reachable from the UI, not just the address bar.** The earlier version only had static `NavLink`s for `/`, `/about`, and `/login` — you could only reach `/user/:username` by typing a URL. Now `Home` renders a directory of example users (`Ada Lovelace`, `Grace Hopper`, `Alan Turing`, `Katherine Johnson`, `Margaret Hamilton`) as real `<Link>`s to `/user/<handle>`, and `User` itself offers "try another profile" chips plus a jump form.

### 5. Programmatic navigation — `useNavigate()`

`UsernameJump.jsx` (used on both `Home` and `User`) is a small form that turns typed text into a route change:

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const UsernameJump = ({ label = 'Jump to a profile' }) => {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    const handle = value.trim()
    if (!handle) return
    navigate(`/user/${encodeURIComponent(handle)}`)
    setValue('')
  }

  return (
    <form className="jump-form" onSubmit={handleSubmit}>
      {/* label + prefixed input + "Go" button */}
    </form>
  )
}

export default UsernameJump
```

`useNavigate()` returns a function you call imperatively — no `<Link>` needed — to push a new URL. This is the tool for "after this action, go there": form submissions, wizard steps, redirect-after-login flows.

### 6. Catch-all route + `errorElement` — `NotFound.jsx`

```jsx
import { Link, useLocation, useRouteError } from 'react-router-dom'
import RouteTable from './RouteTable'

// Doubles as the router's errorElement (for thrown render/loader errors) and
// as the element for the catch-all path: "*" route (for unmatched URLs).
// useRouteError() only returns something in the first case.
const NotFound = () => {
  const location = useLocation()
  const error = useRouteError()

  return (
    <div className="page notfound-page">
      <p className="eyebrow">404</p>
      <h1>route &rarr; {location.pathname} matched nothing</h1>
      {/* ...explains what happened, shows error.message when thrown via
          errorElement, links back to "/", and reprints the route table */}
    </div>
  )
}

export default NotFound
```

This one component is registered **twice** in `App.jsx`: as `errorElement` on the parent route (catches JavaScript errors thrown anywhere in the tree) and as the `element` for `path: '*'` (catches URLs that matched nothing at all). `useRouteError()` only returns a value in the first case — it's a plain `useContext` read, so calling it when there's no error simply returns `undefined`, which is why the same component can safely serve both roles.

### 7. Exact dependency versions

From `package.json`:

```json
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0"
  },
```

`^6.22.0` means "6.22.0 or any newer 6.x" — everything in these notes is React Router **v6** API (v6.4+ data-router style, including layout routes and `errorElement`). Dev tooling is Vite `^5.1.0` with `@vitejs/plugin-react`.

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
    <meta name="description" content="React Router Lab — a small multi-page SPA built with Vite, React 18, and react-router-dom v6 to teach client-side routing." />
    <title>React Router Lab · Lecture 115</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

The whole app lives inside `<div id="root">`. No matter which route you're on, this file never changes — that's the "single page" in SPA. (Title and description were updated to describe the actual app; everything else is untouched Vite boilerplate.)

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

Unchanged from the original — standard Vite/React 18 entry: create a root on `#root`, render `<App />` in `StrictMode`. Global styles come from `index.css` (imported here, not in `App`).

### `src/App.jsx` — the route tree

See [Concept Deep-Dive #1](#1-createbrowserrouter--routerprovider-with-a-layout-route) above for the full listing — it's quoted there verbatim.

### `src/components/Layout.jsx` — shared chrome, once

See [Concept Deep-Dive #2](#2-layout-routes--outlet--the-navbar-renders-once) above.

### `src/components/Navbar.jsx` — active-aware navigation

See [Concept Deep-Dive #3](#3-link--navlink-vs-a--spa-navigation-vs-full-reload) above.

### `src/components/Footer.jsx`

```jsx
const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>React Router Lab &mdash; Lecture 115</p>
        <p className="footer-stack">React 18 &middot; React Router 6 &middot; Vite</p>
        <p>&copy; {year}</p>
      </div>
    </footer>
  )
}

export default Footer
```

Rendered once by `Layout`, alongside `Navbar` — new in this version (the original had no footer).

### `src/components/Home.jsx` — the landing page

```jsx
import { Link } from 'react-router-dom'
import RouteTable from './RouteTable'
import UsernameJump from './UsernameJump'
import users from '../data/users'

const features = [
  {
    kicker: '01 · Layout route',
    title: 'One navbar, every page',
    body: 'Layout.jsx renders <Navbar /> and an <Outlet /> once. Only the outlet’s content swaps when you navigate — the navbar never remounts.',
  },
  {
    kicker: '02 · Active links',
    title: 'NavLink knows where it is',
    body: 'Each NavLink reads { isActive } from React Router and adds a class automatically — no manual state, no manual comparisons.',
  },
  {
    kicker: '03 · Dynamic segments',
    title: ':username matches anything',
    body: 'The route /user/:username matches /user/ada, /user/grace, or any string — useParams() hands the captured value straight to the component.',
  },
  {
    kicker: '04 · Catch-all',
    title: 'Unknown paths land somewhere real',
    body: 'A path: "*" route paired with an errorElement means a typo in the URL renders a real page, not a blank screen.',
  },
]

const Home = () => {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Lecture 115 &middot; React Router</p>
          <h1>Every click here is just a URL match.</h1>
          <p className="lede">
            This whole site is one HTML document. React Router intercepts navigation,
            updates the address bar with the History API, and swaps the matching
            route&rsquo;s element in and out &mdash; no reload, no flash, no lost state.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-accent" to="/about">Read the concepts</Link>
            <Link className="btn btn-ghost" to="/login">Open the login demo</Link>
          </div>
        </div>

        <div className="hero-visual">
          <p className="hero-visual-label">src/App.jsx &mdash; the route table</p>
          <RouteTable />
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>How the pieces fit</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <p className="feature-kicker">{feature.kicker}</p>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Open a profile</h2>
          <p>Every card below is a real link to /user/:username &mdash; pick one, or type your own.</p>
        </div>

        <div className="user-grid">
          {users.map((user) => (
            <Link className="user-card" to={`/user/${user.username}`} key={user.username}>
              <span
                className="avatar"
                style={{
                  backgroundColor: `${user.color}22`,
                  color: user.color,
                  borderColor: `${user.color}55`,
                }}
              >
                {user.name.split(' ').map((part) => part[0]).join('')}
              </span>
              <span className="user-card-body">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
                <span className="user-handle" translate="no">/user/{user.username}</span>
              </span>
            </Link>
          ))}
        </div>

        <UsernameJump label="Or jump to any handle" />
      </section>
    </div>
  )
}

export default Home
```

Three real sections: a hero that states the app's thesis and mirrors `App.jsx`'s route table as a visual (via `RouteTable`), a feature grid explaining the four routing concepts this project demonstrates, and a directory of example users that makes `/user/:username` clickable instead of something you have to already know about.

### `src/components/About.jsx`

```jsx
const concepts = [
  'createBrowserRouter + RouterProvider — the data router API',
  'Layout routes with <Outlet /> so shared chrome renders once',
  'NavLink and its { isActive, isPending } render prop',
  'Dynamic segments (:username) read with useParams()',
  'Programmatic navigation with useNavigate()',
  'A catch-all path: "*" route plus an errorElement',
]

const About = () => {
  return (
    <div className="page about-page">
      <header className="page-header">
        <p className="eyebrow">About</p>
        <h1>A small sandbox for a big idea</h1>
        <p className="lede">
          This project exists to make one concept concrete: in a single-page app,
          the URL is just state, and the router&rsquo;s only job is turning that state
          into the right components.
        </p>
      </header>
      {/* "What's actually running", a checklist of routing concepts covered,
          and a short explanation of why the project moved to a layout route */}
    </div>
  )
}

export default About
```

Real, specific content — what the project is, what it demonstrates, and why the earlier per-route `<Navbar />` approach was replaced. (Full JSX omitted here for brevity; see the file for the complete three sections.)

### `src/components/Login.jsx` — styled, deliberately non-functional

```jsx
import { useState } from 'react'

const Login = () => {
  const [status, setStatus] = useState('idle') // idle | submitting | done
  const [showHint, setShowHint] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setStatus('submitting')
    window.setTimeout(() => setStatus('done'), 700)
  }

  return (
    <div className="page login-page">
      <div className="auth-card">
        <p className="eyebrow">Demo only</p>
        <h1>Sign in</h1>
        {/* email + password fields, "remember me", a "Forgot password?"
            toggle, and a submit button that cycles idle → submitting → done */}
      </div>
    </div>
  )
}

export default Login
```

There's no backend — but the form still behaves like a real one: native `type="email"`/`type="password"` inputs, a `required` + `minLength` constraint, a disabled-while-submitting button, and an honest inline message ("nothing was sent") instead of pretending to log anyone in.

### `src/components/User.jsx` — reading URL params

```jsx
import { Link, useParams } from 'react-router-dom'
import users from '../data/users'
import UsernameJump from './UsernameJump'

const User = () => {
  const { username } = useParams()
  const profile = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase(),
  )
  const others = users.filter((user) => user.username !== profile?.username).slice(0, 4)

  return (
    <div className="page">
      <p className="eyebrow" translate="no">/user/{username}</p>

      {profile ? (
        <div className="profile-card">
          {/* avatar, name, role, bio — from src/data/users.js */}
        </div>
      ) : (
        <div className="profile-card profile-card-empty">
          <h1>No preset profile for &ldquo;{username}&rdquo;</h1>
          <p>
            There&rsquo;s no bio on file for this handle, but the route still
            matched &mdash; that&rsquo;s the point. <code>useParams()</code> handed
            the router &ldquo;{username}&rdquo; straight through, no extra work required.
          </p>
        </div>
      )}

      <div className="section">
        <p className="section-label">Try another profile</p>
        <div className="chip-row">
          {others.map((user) => (
            <Link className="chip" to={`/user/${user.username}`} key={user.username} translate="no">
              {user.username}
            </Link>
          ))}
        </div>
        <UsernameJump label="Or jump to any handle" />
      </div>
    </div>
  )
}

export default User
```

`useParams()` returns an object of every dynamic segment captured by the matched route. For `/user/ada` → `{ username: "ada" }`. The component looks that value up in `src/data/users.js`; a match renders a real profile, a miss still proves the router matched by showing the raw captured string. One component, infinite URLs.

### `src/components/NotFound.jsx` — the 404 / error page

See [Concept Deep-Dive #6](#6-catch-all-route--errorelement--notfoundjsx) above for the full listing.

### `src/components/RouteTable.jsx` and `src/components/UsernameJump.jsx`

Two small reusable pieces:

- **`RouteTable`** — a static, monospace list of `{ path, element }` pairs that visually mirrors the real route tree in `App.jsx`. Rendered on `Home` (to introduce the routes) and `NotFound` (as a way to find a valid one).
- **`UsernameJump`** — the `useNavigate()`-powered "type a handle, press Go" form described in [Concept Deep-Dive #5](#5-programmatic-navigation--usenavigate). Reused on `Home` and `User` rather than duplicated.

### `src/data/users.js`

```js
const users = [
  { username: 'ada', name: 'Ada Lovelace', role: 'Analyst, Analytical Engine', /* ...bio, color */ },
  { username: 'grace', name: 'Grace Hopper', role: 'Compiler Pioneer, US Navy', /* ... */ },
  { username: 'alan', name: 'Alan Turing', role: 'Mathematician, Bletchley Park', /* ... */ },
  { username: 'katherine', name: 'Katherine Johnson', role: 'Physicist, NASA', /* ... */ },
  { username: 'margaret', name: 'Margaret Hamilton', role: 'Lead Software Engineer, Apollo', /* ... */ },
]

export default users
```

The sample "directory" that `Home`'s user grid and `User`'s profile lookup both read from. Five real historical figures in computing, each with a `username`, `name`, `role`, `bio`, and an identity `color` used to tint their avatar.

### `src/index.css` — the whole design system

`App.css` (empty in the original project) has been deleted; every style now lives in `index.css`, imported once in `main.jsx`. It defines:

- **Design tokens** as CSS custom properties on `:root` — surface colors (`--bg`, `--bg-elevated`, `--bg-inset`), a border-opacity progression (`--border`, `--border-soft`, `--border-strong`, `--border-focus`), a four-level text hierarchy (`--text-primary` → `--text-muted`), one accent color (`--accent`, amber — used for links, active states, and focus rings), a spacing scale (`--space-1` … `--space-8`), and two font stacks (`--font-sans` for prose, `--font-mono` for anything that looks like a path or code).
- **A borders-only depth strategy** — no box-shadows anywhere; hierarchy comes from the border-opacity scale and whisper-quiet background shifts between `--bg` → `--bg-elevated` → `--bg-inset`, consistent with the "routing console" theme (paths, terminals, route tables).
- Every component class referenced above: `.navbar`, `.route-console`, `.hero`, `.route-table`, `.feature-grid`, `.user-grid`, `.auth-card`, `.profile-card`, `.chip`, `.jump-form`, and so on.
- **Responsive breakpoints** at `860px` (hero and grids collapse to one column, the live route-console hides to save space) and `620px` (tighter nav, tighter page padding).
- **Accessibility details**: a `.skip-link` that's visually hidden until focused, a global `:focus-visible` ring, `prefers-reduced-motion` handling that disables the console's blinking caret and all transitions, and `text-wrap: balance` on headings.

---

## How Routing Works Under the Hood

1. **One document, forever.** The server sends `index.html` once. React boots, `RouterProvider` reads the current `window.location.pathname`, matches it against the route tree, and renders the matched branch — starting with the parent `Layout` route, then whichever child's `element` fills its `<Outlet />`.

2. **The History API.** Browsers expose `history.pushState(state, "", url)` — it changes the address bar **without** triggering a network request or reload. `createBrowserRouter` builds on exactly this. When you click a `<Link>`:
   - the click's default behavior (`<a>` navigation) is prevented,
   - `pushState` writes the new URL into the address bar and the session history stack,
   - the router fires its listeners.
   Back/forward buttons emit a `popstate` event, which the router also listens for — so browser history "just works" even though no pages were ever loaded.

3. **Matching.** The router compares the new pathname against the route tree. Static segments (`about`, `login`) must match literally; dynamic segments (`:username`) match any single segment and capture its value; `*` matches anything nothing else matched. Ranking prefers more specific routes, so `login` wins over a hypothetical `:page` at the same level. The captured values become the object `useParams()` returns.

4. **Re-render, not reload — and only the outlet moves.** Once matched, the router updates its internal state, and React reconciles. Because `Layout` (with its `Navbar` and `Footer`) sits *above* the `<Outlet />` in the tree and its own identity never changes between navigations, React leaves it mounted — only the subtree inside `<Outlet />` swaps from `<Home />` to `<About />` and so on. Component state elsewhere in the tree, module-level caches, and open WebSocket connections all survive, because neither the page nor the layout ever unmounted.

5. **Active-link tracking.** Every `NavLink` subscribes to the current location via context. On each navigation, each one re-runs its `className` function with a fresh `{ isActive }`, which is simply "does my `to` match the current URL" (respecting `end` for exact matches).

6. **The unhappy path.** If the pathname matches nothing in the tree, the `path: '*'` route renders `NotFound`. If something instead *throws* while rendering (or in a future loader/action), the nearest `errorElement` up the tree — here, the one on the parent `/` route — renders instead, and `useRouteError()` exposes what was thrown.

**Full reload (`<a>`)**: browser → server → new HTML → re-download JS → re-boot React → state gone.
**SPA navigation (`<Link>`)**: `pushState` → match → re-render only the outlet. Milliseconds, no flash, layout and state intact.

---

## How to Run

```bash
cd "Lec-115 React Router Routing"
npm install
npm run dev
```

Vite prints a local URL (typically `http://localhost:5173`). Things to try:

1. Click **Home / About / Login** — watch the Network tab: **no document requests**, the active tab highlights, and the navbar never flickers or resets.
2. On Home, click one of the example profile cards (or type a handle into "Or jump to any handle") — you land on `/user/<handle>` without ever typing a URL by hand.
3. Visit a handle that isn't in the sample directory, e.g. `/user/yourname` — the route still matches; the page explains why.
4. Visit something nonsensical, e.g. `/does-not-exist` — you get the styled 404 page (with a way back), not a blank screen.
5. Compare: replace a `NavLink` with a raw `<a href>` temporarily and watch the full-page flash. (Then put it back!)

Other scripts from `package.json`: `npm run build` (production bundle), `npm run preview` (serve the build), `npm run lint`.

> **Note:** `.eslintrc.cjs` now turns off the `react/prop-types` rule — this project has no TypeScript and no `prop-types` package, and `UsernameJump` takes a `label` prop, so the rule was disabled project-wide rather than adding a dependency for one optional string prop.

---

## Key Takeaways

- A SPA has **one** HTML file; the router decides which components render for which URL.
- **`createBrowserRouter`** takes an array of route records (which can nest via `children`); **`RouterProvider`** renders the match. Build the router **once, at module scope**.
- A **layout route** (`element: <Layout />` with `children`) plus **`<Outlet />`** renders shared chrome exactly once — it doesn't remount as you navigate between children.
- Use **`Link`/`NavLink`** for internal navigation — never `<a>` — to avoid full reloads and state loss.
- **`NavLink`**'s `className` is a function of **`{ isActive }`** (not an event) for automatic active-tab styling; use `end` to avoid `/` matching everything.
- **`:param`** in a path creates a dynamic segment; **`useParams()`** reads it inside the component.
- **`useNavigate()`** lets you navigate imperatively — from a form submit, a button, or after some async action finishes.
- A **`path: "*"`** route plus an **`errorElement`** means unmatched URLs and thrown errors both land on a real page instead of a blank one.
- Under the hood it's just `history.pushState` + URL pattern matching + a React re-render of the matched subtree.

## Common Pitfalls

1. **Using `<a href="...">` for internal links.** Works, but triggers a full reload: state wiped, app re-booted, UX flash. Reserve `<a>` for *external* URLs; use `Link`/`NavLink` inside the app.
2. **404 on refresh in production.** `npm run dev` handles this for you, but on a real static host, refreshing at `/about` makes the browser request `/about` from the *server*, which only has `index.html` → 404. Fix: configure the server to rewrite all routes to `index.html` (SPA fallback), e.g. Netlify `_redirects` `/* /index.html 200`, or nginx `try_files $uri /index.html;`.
3. **Assuming params are typed.** `useParams()` values are **always strings** (`"42"`, not `42`). Convert explicitly before comparing to numbers or hitting a database, and validate — `/user/💥` matches too.
4. **Repeating layout per route instead of using a layout route.** This is what the earlier version of this project did (`<><Navbar /><Home /></>` in every route), and it's why the navbar used to remount on every navigation. A parent route with `children` and an `<Outlet />` fixes it — this is exactly what `Layout.jsx` now does.
5. **Rebuilding the router on every render.** `createBrowserRouter(...)` inside the component body creates a new router (and a new internal history subscription) every time that component re-renders. Define it at module scope, as `App.jsx` now does.
6. **`className={(e) => ...}` on NavLink.** The parameter is a render-props object (`{ isActive, isPending }`), not a DOM event — naming it `e` invites someone to reach for `e.target` or `e.preventDefault()`, neither of which exist on it. Destructure it: `className={({ isActive }) => ...}`.
7. **No catch-all route.** Without a `path: "*"` entry, an unknown URL like `/xyz` shows React Router's default (unstyled) error screen instead of your app's own 404 page.

## Practice Exercises

1. **Add a second dynamic segment.** Extend the route to `user/:username/:postId`, add a link somewhere that points at it, and render both values from `useParams()`. Confirm both are strings with `typeof`.
2. **Persist "remember me."** In `Login.jsx`, read/write the checkbox's checked state to `localStorage` so it's remembered across a refresh — a good excuse to practice `useEffect`.
3. **Redirect after "login."** Change `Login.jsx`'s `handleSubmit` to call `useNavigate()` and send the user to `/` once `status` becomes `'done'`, simulating "login successful → go home."
4. **Give `NotFound` a real thrown error to catch.** Temporarily make `Home.jsx` throw (`if (Math.random() < 1) throw new Error('boom')`) and reload — confirm the `errorElement` path renders `NotFound` with the error message visible, then remove it.
5. **Sort or filter the directory.** Add a search input above `Home`'s user grid that filters `users` by name as you type — no routing changes required, just local component state.
6. **Prove the layout-route fix.** Add a `useState` counter inside `Navbar` with a visible increment button. Click it, then navigate with `NavLink` — the counter survives, because `Navbar` never unmounts. Temporarily move `<Navbar />` back inside each route's own `element` (like the original code) and watch the counter reset on every navigation.

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
