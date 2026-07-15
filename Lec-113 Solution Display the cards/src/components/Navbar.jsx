const NAV_LINKS = ['Home', 'About', 'Contact Us']

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

// A two-tier "newspaper masthead": brand + live date on top, section links
// below. Presentational only — no props, no state — same spirit as the
// original Navbar, just given a distinct point of view instead of a plain
// nav bar.
const Navbar = () => {
  const today = DATE_FORMATTER.format(new Date())

  return (
    <header className="masthead">
      <div className="masthead__top">
        <div>
          <p className="masthead__eyebrow">Vol. 1 · Live Feed</p>
          <h1 className="masthead__title">The Placeholder Dispatch</h1>
          <p className="masthead__tagline">Bulletins fetched fresh from JSONPlaceholder</p>
        </div>
        <div className="masthead__meta">
          <span className="masthead__date">{today}</span>
        </div>
      </div>

      <nav className="masthead__nav" aria-label="Primary">
        <ul className="masthead__nav-list">
          {NAV_LINKS.map((label, index) => (
            <li key={label} className={index === 0 ? 'masthead__nav-item--active' : undefined}>
              <button type="button" className="masthead__nav-link">
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
