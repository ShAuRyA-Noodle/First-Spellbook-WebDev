// A visual mirror of the route tree defined in src/App.jsx.
// It renders on Home (to introduce the routes) and NotFound (as a way out),
// which is why it lives here instead of inline in either page.
const routes = [
  { path: '/', element: 'Home' },
  { path: '/about', element: 'About' },
  { path: '/login', element: 'Login' },
  { path: '/user/:username', element: 'User' },
  { path: '*', element: 'NotFound' },
]

const RouteTable = () => (
  <div className="route-table" role="img" aria-label="Route table: URL path mapped to the element it renders">
    <div className="route-table-header">
      <span>path</span>
      <span>element</span>
    </div>
    {routes.map((route) => (
      <div className="route-table-row" key={route.path}>
        <span className="route-path" translate="no">{route.path}</span>
        <span className="route-arrow" aria-hidden="true">&rarr;</span>
        <span className="route-element">{route.element}</span>
      </div>
    ))}
  </div>
)

export default RouteTable
