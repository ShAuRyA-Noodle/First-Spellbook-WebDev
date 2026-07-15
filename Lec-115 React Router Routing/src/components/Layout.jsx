import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

// The layout route: Navbar and Footer render exactly once, no matter which
// child route matches. Only <Outlet /> swaps as the URL changes, which is
// what keeps the navbar from remounting on every navigation.
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
