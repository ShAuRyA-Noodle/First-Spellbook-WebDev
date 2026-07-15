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
