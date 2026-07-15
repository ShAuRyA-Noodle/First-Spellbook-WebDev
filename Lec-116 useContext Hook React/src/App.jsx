import { useMemo, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import SignalMap from './components/SignalMap'
import { counterContext } from './context/context'

function App() {
  const [count, setCount] = useState(0)

  // Memoize the Provider value. useContext consumers re-render whenever this
  // reference changes (by Object.is), and `{ count, setCount }` would
  // otherwise be a brand-new object on every App render — including
  // re-renders caused by state that has nothing to do with `count`. This
  // doesn't stop consumers from re-rendering when `count` itself changes
  // (that's the whole point), it just stops *unrelated* App re-renders from
  // also forcing every consumer to re-render.
  const value = useMemo(() => ({ count, setCount }), [count])

  return (
    <counterContext.Provider value={value}>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header__top">
            <div className="app-header__brand">
              <span className="app-header__mark" aria-hidden="true">◎</span>
              <div>
                <p className="eyebrow">React · useContext</p>
                <h1>Escaping prop drilling with Context</h1>
              </div>
            </div>

            <div className="app-header__controls">
              <div className="stat">
                <span className="stat__label">count</span>
                <span className="stat__value" aria-live="polite">{count}</span>
              </div>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setCount(0)}
              >
                Reset
              </button>
            </div>
          </div>

          <p className="app-header__lede">
            One counter, owned by <code>App</code>, read and updated three
            components deep &mdash; <code>Navbar &rarr; Button &rarr; Component1</code>
            &nbsp;&mdash; without a single prop passed through the middle.
          </p>
        </header>

        <main className="layout">
          <section className="panel panel--map" aria-labelledby="map-heading">
            <h2 id="map-heading">Signal map</h2>
            <p className="panel__hint">
              The gold wire runs straight from the Provider to every
              consumer. Watch <strong>Navbar</strong> &mdash; the wire arcs
              right over it.
            </p>
            <SignalMap />
          </section>

          <section className="panel panel--tree" aria-labelledby="tree-heading">
            <h2 id="tree-heading">Live component tree</h2>
            <p className="panel__hint">
              The actual rendered tree, nested exactly as deep as the diagram.
              Click the button at depth 2 and watch depth 3 update.
            </p>
            <Navbar />
          </section>
        </main>

        <footer className="app-footer">
          <p>
            Full write-up, before/after code, and pitfalls live in{' '}
            <code>README.md</code>.
          </p>
        </footer>
      </div>
    </counterContext.Provider>
  )
}

export default App
