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

      <section className="section">
        <h2>What&rsquo;s actually running</h2>
        <p>
          Built with Vite, React 18, and React Router 6 &mdash; specifically the data
          router API (<code>createBrowserRouter</code> and <code>RouterProvider</code>),
          not the older JSX <code>&lt;Routes&gt;</code> form. Every page reachable from
          the navbar, plus the dynamic <code>/user/:username</code> route and the 404
          route, lives inside one route tree defined in <code>src/App.jsx</code>.
        </p>
      </section>

      <section className="section">
        <h2>Routing concepts covered</h2>
        <ul className="checklist">
          {concepts.map((concept) => (
            <li key={concept}>{concept}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>Why a layout route</h2>
        <p>
          The earlier version of this project rendered <code>&lt;Navbar /&gt;</code>{' '}
          inside every single route&rsquo;s element. It worked, but React had no way
          to know the navbar on <code>/</code> and the navbar on <code>/about</code>{' '}
          were the same component, so it unmounted and remounted it on every
          navigation. A layout route fixes that: one parent route renders the shared
          chrome and an <code>&lt;Outlet /&gt;</code>, and only the outlet&rsquo;s
          content changes underneath it.
        </p>
      </section>
    </div>
  )
}

export default About
