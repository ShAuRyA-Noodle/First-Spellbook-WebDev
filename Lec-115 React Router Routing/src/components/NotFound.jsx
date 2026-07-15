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
      <p className="lede">
        {error
          ? 'Something threw while rendering, and this is the errorElement catching it.'
          : 'The router checked every path in the table below and none of them matched. That’s expected — it’s exactly what the catch-all path: "*" route is for.'}
      </p>

      {error && (
        <pre className="error-detail">{error.statusText || error.message || String(error)}</pre>
      )}

      <div className="hero-actions">
        <Link className="btn btn-accent" to="/">Back to Home</Link>
      </div>

      <div className="section">
        <p className="section-label">Known routes</p>
        <RouteTable />
      </div>
    </div>
  )
}

export default NotFound
