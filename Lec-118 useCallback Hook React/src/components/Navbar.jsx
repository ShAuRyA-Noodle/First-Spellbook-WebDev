import { memo, useEffect, useRef } from 'react'
import './Navbar.css'

const Navbar = ({ adjective, getAdjective }) => {
  // A plain ref — not state — so reading it never itself triggers a render.
  // It only goes up when this function body actually runs.
  const renderCountRef = useRef(0)
  renderCountRef.current += 1
  const renderCount = renderCountRef.current

  useEffect(() => {
    // No dependency array: this runs once per commit of THIS component,
    // i.e. once per real render. When memo() skips a render, the component
    // body — and this effect — never runs at all, so the badge above only
    // ever counts renders that actually happened.
    console.log(`[Navbar] render #${renderCount}`)
  })

  const tag = getAdjective()

  return (
    <section className="navbar-probe" aria-label="Navbar render probe">
      <span key={renderCount} className="probe-flash" aria-hidden="true" />

      <header className="probe-head">
        <span className="probe-led" aria-hidden="true" />
        <span className="probe-title">Navbar</span>
        <span className="probe-sub">memo()</span>
      </header>

      <div className="probe-readout" aria-live="polite">
        <span className="probe-count">{renderCount}</span>
        <span className="probe-count-label">render{renderCount === 1 ? '' : 's'} so far</span>
      </div>

      <p className="probe-copy">
        I am a <strong>{adjective}</strong> Navbar
      </p>

      <button
        type="button"
        className="probe-tag-btn"
        aria-label={`Log current signal to console: ${tag}`}
        onClick={() => console.log(`[Navbar] getAdjective() → "${getAdjective()}" (no render caused)`)}
      >
        <span className="probe-tag-label">signal</span>
        <span className="probe-tag-value">{tag}</span>
      </button>
    </section>
  )
}

const MemoizedNavbar = memo(Navbar)

export default MemoizedNavbar
