import { useSelector } from 'react-redux'
import { usePulse } from '../hooks/usePulse'
import { formatNumber } from '../utils/formatNumber'

const Navbar = () => {
  // Navbar renders nowhere near CounterPanel or MirrorPanel in the tree,
  // receives zero props, and still stays perfectly in sync — because all
  // three read the exact same `state.counter.value` from the one store.
  const count = useSelector((state) => state.counter.value)
  const pulsing = usePulse(count)

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <span className="navbar__mark" aria-hidden="true">
            <span className="navbar__mark-dot" />
          </span>
          <span className="navbar__title">Redux Console</span>
          <span className="navbar__subtitle">Lec-120</span>
        </div>

        <div
          className={`navbar__readout${pulsing ? ' is-pulsing' : ''}`}
          title="This badge subscribes to the store independently of the panels below"
        >
          <span className="navbar__live" aria-hidden="true" />
          <span className="navbar__readout-label" translate="no">
            store.counter.value
          </span>
          <span
            className="navbar__readout-value"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatNumber(count)}
          </span>
        </div>
      </div>
    </header>
  )
}

export default Navbar
