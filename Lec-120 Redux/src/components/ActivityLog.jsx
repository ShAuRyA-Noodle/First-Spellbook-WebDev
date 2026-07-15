import { useDispatch, useSelector } from 'react-redux'
import { clearLog } from '../redux/activityLog/activityLogSlice'

const ActivityLog = () => {
  // A THIRD slice-reading pattern: this panel doesn't care about
  // state.counter at all. It reads state.activityLog, a completely
  // separate slice that itself listens in on the counter slice's actions.
  // Same store, different corner of the state tree.
  const entries = useSelector((state) => state.activityLog.entries)
  const dispatch = useDispatch()

  return (
    <section className="panel activity-log" aria-labelledby="activity-log-heading">
      <header className="panel__header">
        <div>
          <p className="panel__eyebrow">Wiretap · every dispatched action</p>
          <h2 id="activity-log-heading" className="panel__title">
            Dispatch Log
          </h2>
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--small"
          onClick={() => dispatch(clearLog())}
          disabled={entries.length === 0}
        >
          Clear
        </button>
      </header>

      {entries.length === 0 ? (
        <p className="activity-log__empty">
          No actions dispatched yet. Press a button on the Control Desk.
        </p>
      ) : (
        <ol className="activity-log__list" aria-live="polite">
          {entries.map((entry, index) => (
            <li key={entry.id} className="activity-log__row">
              <span className="activity-log__index">
                {String(entries.length - index).padStart(2, '0')}
              </span>
              <span className="activity-log__type" translate="no">
                {entry.type}
              </span>
              <span className="activity-log__payload" translate="no">
                {entry.payload !== null ? `payload: ${entry.payload}` : ''}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default ActivityLog
