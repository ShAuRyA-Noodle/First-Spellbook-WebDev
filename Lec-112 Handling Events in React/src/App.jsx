import { useRef, useState } from 'react'
import './App.css'

const MAX_LOG_ENTRIES = 30
const INCREMENTS = [1, 5, 10]

function App() {
  // One state object drives every controlled input on the page.
  const [form, setForm] = useState({})

  // Counter used by the "pass an argument via an arrow fn" buttons.
  const [clickCount, setClickCount] = useState(0)

  // Hover state for the onMouseOver / onMouseOut demo.
  const [isHovering, setIsHovering] = useState(false)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })
  const [hoverSource, setHoverSource] = useState(null) // 'pointer' | 'keyboard'

  // The on-screen event log — a teaching aid that replaces alert()/console.log
  // with a readable, always-visible trace of every event that fires.
  const [log, setLog] = useState([])
  const logIdRef = useRef(0)

  const pushLog = (type, detail) => {
    logIdRef.current += 1
    const now = new Date()
    const time = `${now.toLocaleTimeString('en-GB', { hour12: false })}.${String(
      now.getMilliseconds(),
    ).padStart(3, '0')}`
    setLog((prev) => [{ id: logIdRef.current, type, detail, time }, ...prev].slice(0, MAX_LOG_ENTRIES))
  }

  // onClick — no arguments. The handler is passed by reference: onClick={handleClick}.
  const handleClick = () => {
    pushLog('click', 'Click me pressed (no arguments passed)')
  }

  // onClick — with an argument. Wrapping the call in an inline arrow function is the
  // standard way to pass custom data to a handler: onClick={() => fn(amount, e)}.
  const handleClickWithAmount = (amount, e) => {
    setClickCount((current) => current + amount)
    pushLog('click', `+${amount} pressed at (${e.clientX}, ${e.clientY}) via an inline arrow fn`)
  }

  // onMouseOver / onMouseOut — fire as the pointer crosses the element boundary.
  const handleMouseOver = (e) => {
    setIsHovering(true)
    setHoverSource('pointer')
    setHoverPos({ x: e.clientX, y: e.clientY })
    pushLog('mouseover', `pointer entered the signal pad at (${e.clientX}, ${e.clientY})`)
  }

  const handleMouseOut = () => {
    setIsHovering(false)
    pushLog('mouseout', 'pointer left the signal pad')
  }

  // onMouseOver has no keyboard equivalent — a keyboard-only user can never "hover".
  // Pairing onFocus/onBlur with a tabIndex on the same element gives keyboard users
  // the same feedback mouse users get.
  const handleFocus = () => {
    setIsHovering(true)
    setHoverSource('keyboard')
    pushLog('focus', 'signal pad focused via keyboard (mouseover has no keyboard equivalent)')
  }

  const handleBlur = () => {
    setIsHovering(false)
    pushLog('blur', 'signal pad blurred')
  }

  // onChange — one handler for every field, using the event object plus spread and a
  // computed property name to update only the field that changed.
  const handleChange = (e) => {
    const { name, value } = e.target
    const nextForm = { ...form, [name]: value }
    setForm(nextForm)

    // Log the freshly computed nextForm, not `form`. setForm() schedules a re-render;
    // it does not mutate `form` in this closure, so console.log(form) right here would
    // always print the *previous* render's value — one keystroke behind.
    pushLog('change', `${name} -> "${value}"`)
  }

  const clearLog = () => setLog([])

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Skip to playground
      </a>

      <header className="app-header">
        <p className="eyebrow" translate="no">
          {'// react event handling'}
        </p>
        <h1>Events Playground</h1>
        <p className="lede">
          A live lab for <code translate="no">onClick</code>, <code translate="no">onChange</code>, and{' '}
          <code translate="no">onMouseOver</code>. Every control below is wired to a real handler and
          mirrored in the event log, so you can watch React events fire as they happen.
        </p>
        <div className="status" title={`${log.length} event(s) logged`}>
          <span className="status-dot">
            <span key={log.length} className="status-dot-ping" aria-hidden="true" />
          </span>
          <span className="status-text">{log.length === 0 ? 'idle' : 'live'}</span>
        </div>
      </header>

      <main id="main-content" className="grid">
        <section className="panel" aria-labelledby="click-heading">
          <h2 id="click-heading" className="panel-title">
            <span className="panel-index">01</span> Click Events
          </h2>
          <p className="panel-desc">
            <code translate="no">onClick</code> takes a function reference. To pass extra
            data, wrap the call in an arrow function instead of invoking it directly.
          </p>

          <div className="panel-body">
            <button type="button" className="btn btn-primary" onClick={handleClick}>
              Click me
            </button>

            <div className="btn-row" role="group" aria-label="Increment counter">
              {INCREMENTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className="btn btn-ghost"
                  onClick={(e) => handleClickWithAmount(amount, e)}
                >
                  +{amount}
                </button>
              ))}
            </div>

            <p className="counter">
              Count <strong>{clickCount}</strong>
            </p>
          </div>
        </section>

        <section
          className="panel"
          aria-labelledby="hover-heading"
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <h2 id="hover-heading" className="panel-title">
            <span className="panel-index">02</span> Mouse Events
          </h2>
          <p className="panel-desc">
            <code translate="no">onMouseOver</code> and <code translate="no">onMouseOut</code>{' '}
            fire as the pointer crosses the pad below. Hover has no keyboard equivalent, so
            the pad also answers <code translate="no">onFocus</code> /{' '}
            <code translate="no">onBlur</code> — press Tab to try it.
          </p>

          <div
            className={`signal-pad${isHovering ? ' signal-pad-active' : ''}`}
            tabIndex={0}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-label="Signal pad. Hover with a mouse, or focus with the keyboard, to trigger a mouse or focus event."
          >
            <span className="signal-pad-ring" aria-hidden="true" />
            <span className="signal-pad-text">
              {isHovering
                ? hoverSource === 'keyboard'
                  ? 'signal detected via keyboard focus'
                  : `signal detected at (${hoverPos.x}, ${hoverPos.y})`
                : 'hover or focus to trigger a signal'}
            </span>
          </div>
        </section>

        <section className="panel panel-wide" aria-labelledby="form-heading">
          <h2 id="form-heading" className="panel-title">
            <span className="panel-index">03</span> Controlled Inputs
          </h2>
          <p className="panel-desc">
            <code translate="no">value</code> comes from state, <code translate="no">onChange</code>{' '}
            writes back to it. One shared handler and one state object cover every field
            below.
          </p>

          <div className="panel-body panel-body-split">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="ada@lovelace.dev"
                  value={form.email ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  placeholder="555-0100"
                  value={form.phone ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div className="field field-wide">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows="2"
                  autoComplete="off"
                  placeholder="Type to see the state update live…"
                  value={form.message ?? ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="state-inspector">
              <p className="state-inspector-label">form state (live)</p>
              <pre className="state-inspector-body">{JSON.stringify(form, null, 2)}</pre>
            </div>
          </div>
        </section>
      </main>

      <section className="console" aria-label="Event log">
        <div className="console-header">
          <h2>
            Event Log <span className="console-count">{log.length}</span>
          </h2>
          <button type="button" className="btn btn-ghost btn-small" onClick={clearLog}>
            Clear log
          </button>
        </div>

        <ul className="console-list" role="log" aria-live="polite" aria-relevant="additions">
          {log.length === 0 && (
            <li className="console-empty">
              No events yet. Click a button, hover the signal pad, or type into a field.
            </li>
          )}
          {log.map((entry) => (
            <li key={entry.id} className={`console-entry console-entry-${entry.type}`}>
              <span className="console-time">{entry.time}</span>
              <span className="console-tag" translate="no">
                {entry.type}
              </span>
              <span className="console-detail" translate="no">
                {entry.detail}
              </span>
            </li>
          ))}
        </ul>

        <div className="console-cursor" aria-hidden="true">
          <span className="console-cursor-bar" />
          waiting for next event…
        </div>
      </section>
    </div>
  )
}

export default App
