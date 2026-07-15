import { useCallback, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'

const ADJECTIVES = ['good', 'great', 'chill', 'sharp', 'bold']

// Pure helper — lives outside the component so it never needs to be a dependency.
function buildAdjectiveTag(adjective, count) {
  return `${adjective} · #${count}`
}

let logIdSeed = 0

function App() {
  const [count, setCount] = useState(0)
  const [adjective, setAdjective] = useState(ADJECTIVES[0])
  const [unrelatedTicks, setUnrelatedTicks] = useState(0)
  const [memoOn, setMemoOn] = useState(true)
  const [log, setLog] = useState([])

  // The memoized callback: stable reference unless count or adjective change.
  const memoizedGetAdjective = useCallback(
    () => buildAdjectiveTag(adjective, count),
    [count, adjective],
  )
  // The "naive" callback: a brand-new function every single App render,
  // regardless of what changed — this is the pre-useCallback behavior.
  const freshGetAdjective = () => buildAdjectiveTag(adjective, count)

  const getAdjective = memoOn ? memoizedGetAdjective : freshGetAdjective

  // --- Activity log -----------------------------------------------------
  // Each handler predicts its own outcome using the *exact* rule memo()
  // uses internally (Object.is on every prop). No effect/observer needed —
  // we already know, synchronously, whether `adjective` or `getAdjective`
  // is about to change identity.
  const pushLog = (label, outcome) => {
    setLog((entries) => [{ id: ++logIdSeed, label, outcome }, ...entries].slice(0, 6))
  }

  const handleCount = () => {
    setCount((c) => c + 1)
    // count is always inside getAdjective's dependencies (memoized or not),
    // so this always changes its identity — useCallback ON or OFF.
    pushLog(`Count → ${count + 1}`, 'fired')
  }

  const handleAdjective = (word) => {
    if (word === adjective) return
    setAdjective(word)
    // Same reasoning as count: adjective is always a real dependency.
    pushLog(`Adjective → “${word}”`, 'fired')
  }

  const handleUnrelated = () => {
    setUnrelatedTicks((t) => t + 1)
    // Doesn't touch count or adjective. With useCallback ON, the memoized
    // function keeps its reference → memo sees identical props → skipped.
    // With useCallback OFF, a fresh function is created on *every* App
    // render no matter the cause → memo sees a changed prop → fires anyway.
    pushLog(`Unrelated tick → ${unrelatedTicks + 1}`, memoOn ? 'skipped' : 'fired')
  }

  const handleReset = () => {
    const depsWillChange = count !== 0 || adjective !== ADJECTIVES[0]
    setCount(0)
    setAdjective(ADJECTIVES[0])
    setUnrelatedTicks(0)
    pushLog('Reset', !memoOn || depsWillChange ? 'fired' : 'skipped')
  }

  const toggleMemo = () => {
    const next = !memoOn
    setMemoOn(next)
    // Switching modes swaps which function object gets passed down — the
    // two closures are never reference-equal, so this always fires once.
    pushLog(`useCallback → ${next ? 'ON' : 'OFF'}`, 'fired')
  }

  return (
    <div className="lab">
      <a className="skip-link" href="#main-content">
        Skip to demo
      </a>

      <header className="lab-header">
        <p className="lab-eyebrow">React Hooks Lab · Lecture 118</p>
        <h1 className="lab-title">useCallback Signal Bench</h1>
        <p className="lab-subtitle">
          <code>getAdjective</code> depends on <strong>count</strong> and{' '}
          <strong>adjective</strong>. The <strong>unrelated</strong> control does not. Watch
          the probe on the right — with <code>useCallback</code> on, only the real
          dependencies should make it fire.
        </p>
        <ul className="legend" aria-hidden="true">
          <li>
            <span className="legend-swatch signal-count" /> count
          </li>
          <li>
            <span className="legend-swatch signal-adjective" /> adjective
          </li>
          <li>
            <span className="legend-swatch signal-unrelated" /> unrelated
          </li>
        </ul>
      </header>

      <main className="lab-main" id="main-content">
        <section className="panel panel-controls" aria-label="Controls">
          <div className="switch-row">
            <button
              type="button"
              role="switch"
              aria-checked={memoOn}
              aria-label="Toggle useCallback memoization"
              className={`switch ${memoOn ? 'is-on' : 'is-off'}`}
              onClick={toggleMemo}
            >
              <span className="switch-track">
                <span className="switch-thumb" />
              </span>
            </button>
            <div className="switch-text">
              <span className="switch-label">useCallback</span>
              <span className="switch-state" aria-live="polite">
                {memoOn ? 'ON — callback memoized' : 'OFF — new function every render'}
              </span>
            </div>
          </div>

          <div className="control-row">
            <div className="control-text">
              <span className="control-label">
                Count <span className="control-tag signal-count">dependency</span>
              </span>
              <p className="control-help">
                In <code>[count, adjective]</code>. Should re-render the probe.
              </p>
            </div>
            <button
              type="button"
              className="stepper signal-count"
              aria-label={`Increment count, currently ${count}`}
              onClick={handleCount}
            >
              <span className="stepper-value">{count}</span>
              <span className="stepper-plus" aria-hidden="true">
                +1
              </span>
            </button>
          </div>

          <div className="control-row">
            <div className="control-text">
              <span className="control-label">
                Adjective <span className="control-tag signal-adjective">dependency</span>
              </span>
              <p className="control-help">
                In <code>[count, adjective]</code>. Should re-render the probe.
              </p>
            </div>
            <div className="chip-group" role="group" aria-label="Adjective">
              {ADJECTIVES.map((word) => (
                <button
                  key={word}
                  type="button"
                  aria-pressed={adjective === word}
                  className={`chip signal-adjective ${adjective === word ? 'is-active' : ''}`}
                  onClick={() => handleAdjective(word)}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          <div className="control-row">
            <div className="control-text">
              <span className="control-label">
                Unrelated <span className="control-tag signal-unrelated">not a dependency</span>
              </span>
              <p className="control-help">
                Re-renders <code>App</code> only. The probe should stay still.
              </p>
            </div>
            <button
              type="button"
              className="stepper signal-unrelated"
              aria-label={`Add unrelated tick, currently ${unrelatedTicks}`}
              onClick={handleUnrelated}
            >
              <span className="stepper-value">{unrelatedTicks}</span>
              <span className="stepper-plus" aria-hidden="true">
                +1
              </span>
            </button>
          </div>

          <button type="button" className="reset-btn" onClick={handleReset}>
            Reset Demo State
          </button>
        </section>

        <section className="panel panel-observation" aria-label="Observation">
          <Navbar adjective={adjective} getAdjective={getAdjective} />

          <div className="log-panel">
            <h2 className="log-title">Activity Log</h2>
            <ul className="log-feed" aria-live="polite">
              {log.length === 0 && (
                <li className="log-empty">No actions yet — try a control on the left.</li>
              )}
              {log.map((entry) => (
                <li key={entry.id} className={`log-entry outcome-${entry.outcome}`}>
                  <span className="log-dot" aria-hidden="true" />
                  <span className="log-label">{entry.label}</span>
                  <span className="log-outcome">
                    {entry.outcome === 'fired' ? 'Re-rendered' : 'Skipped'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="lab-footer">
        <p>
          Edit <code>src/App.jsx</code> and <code>src/components/Navbar.jsx</code> — Vite HMR
          keeps this running.
        </p>
      </footer>
    </div>
  )
}

export default App
