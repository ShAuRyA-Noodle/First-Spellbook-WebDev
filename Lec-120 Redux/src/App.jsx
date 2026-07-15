import './App.css'
import Navbar from './components/Navbar'
import StoreTopology from './components/StoreTopology'
import CounterPanel from './components/CounterPanel'
import MirrorPanel from './components/MirrorPanel'
import ActivityLog from './components/ActivityLog'

function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Navbar />

      <main className="console" id="main-content">
        <section className="console__intro">
          <p className="console__kicker">Global state, made visible</p>
          <h1 className="console__heading">
            One store. Four independent subscribers.
          </h1>
          <p className="console__lede">
            Everything below reads from the same Redux store — no props are
            passed between any of these panels. Dispatch an action on the
            Control Desk and watch the Navbar badge, the Mirror Display, and
            the Dispatch Log update at the same instant.
          </p>
        </section>

        <StoreTopology />

        <div className="console__grid">
          <CounterPanel />
          <MirrorPanel />
        </div>

        <ActivityLog />

        <footer className="console__footer">
          <p>
            Built with <code>@reduxjs/toolkit</code> + <code>react-redux</code>.
            State shape:{' '}
            <code>{'{ counter: { value }, activityLog: { entries } }'}</code>
          </p>
        </footer>
      </main>
    </>
  )
}

export default App
