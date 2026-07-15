import { useSelector } from 'react-redux'
import { usePulse } from '../hooks/usePulse'

const RECEIVERS = [
  { id: 'navbar', label: 'Navbar', reads: 'counter.value' },
  { id: 'desk', label: 'Control Desk', reads: 'counter.value' },
  { id: 'mirror', label: 'Mirror Display', reads: 'counter.value + activityLog' },
  { id: 'log', label: 'Dispatch Log', reads: 'activityLog.entries' },
]

/**
 * The signature element: a live wiring diagram of the store. Every dispatch
 * sends a single pulse down every wire at once — a literal picture of "one
 * action, many subscribers notified simultaneously," which is the whole
 * thesis of this demo.
 */
const StoreTopology = () => {
  const dispatchCount = useSelector((state) => state.activityLog.nextId)
  const pulsing = usePulse(dispatchCount)

  return (
    <div className={`topology${pulsing ? ' is-active' : ''}`} aria-hidden="true">
      <div className="topology__store">
        <span className="topology__store-label">STORE</span>
        <span className="topology__store-sub">single source of truth</span>
      </div>

      <div className="topology__wires">
        {RECEIVERS.map((receiver) => (
          <div className="topology__wire" key={receiver.id}>
            <span className="topology__line">
              <span className="topology__dot-track">
                <span className="topology__dot" />
              </span>
            </span>
            <span className="topology__node">
              <span className="topology__node-label">{receiver.label}</span>
              <span className="topology__node-reads">{receiver.reads}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StoreTopology
