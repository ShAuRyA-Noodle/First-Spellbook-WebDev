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
