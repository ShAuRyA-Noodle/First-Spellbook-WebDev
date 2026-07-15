import { useSelector } from 'react-redux'
import { usePulse } from '../hooks/usePulse'
import { formatNumber } from '../utils/formatNumber'

const formatType = (type) => (type ? type.replace('counter/', '') : '—')

/**
 * A second, entirely read-only receiver. It has no buttons, no dispatch
 * calls, no relationship to CounterPanel in the component tree — it is
 * rendered as a sibling in App.jsx. It stays in lockstep with the Control
 * Desk purely because both subscribe to the same store. This is the
 * clearest possible proof that the state is global, not local to one panel.
 */
const MirrorPanel = () => {
  const count = useSelector((state) => state.counter.value)
  const lastEntry = useSelector((state) => state.activityLog.entries[0])
  const pulsing = usePulse(count)

  return (
    <section className="panel mirror-panel" aria-labelledby="mirror-panel-heading">
      <header className="panel__header">
        <div>
          <p className="panel__eyebrow">Receiver · zero props, zero coordination</p>
          <h2 id="mirror-panel-heading" className="panel__title">
            Mirror Display
          </h2>
        </div>
        <span className="panel__tag panel__tag--muted">read-only</span>
      </header>

      <div className={`mirror-panel__readout${pulsing ? ' is-pulsing' : ''}`}>
        <span className="mirror-panel__value" aria-live="polite" aria-atomic="true">
          {formatNumber(count)}
        </span>
        <span className="mirror-panel__bars" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
      </div>

      <p className="mirror-panel__meta">
        Last signal received:{' '}
        <code translate="no">{formatType(lastEntry?.type)}</code>
      </p>
    </section>
  )
}

export default MirrorPanel
