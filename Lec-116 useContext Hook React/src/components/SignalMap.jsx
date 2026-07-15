import { useEffect, useState } from 'react'
import { useCounter } from '../context/context'

// Static description of the tree — this is presentational, it mirrors the
// real nesting in App -> Navbar -> Button -> Component1 but doesn't render
// those components itself. `connected: true` marks the nodes that actually
// call useCounter() (App is the Provider, so it's "connected" by definition).
const NODES = [
  { id: 'app', x: 70, label: 'App.jsx', depth: 'D0', role: 'Provider', note: 'owns state, createContext.Provider', connected: true },
  { id: 'navbar', x: 290, label: 'Navbar.jsx', depth: 'D1', role: 'Pass-through', note: 'no props, no context', connected: false },
  { id: 'button', x: 510, label: 'Button.jsx', depth: 'D2', role: 'Consumer', note: 'useContext, read + write', connected: true },
  { id: 'component1', x: 730, label: 'Component1.jsx', depth: 'D3', role: 'Consumer', note: 'useContext, read only', connected: true },
]

const Y = 150

// The gold "context wire" arcs up and over Navbar's position, then runs down
// into Button and across to Component1 — a literal picture of "the value
// skips the middleman" instead of hopping through it.
const WIRE_PATH = 'M70,130 C160,40 220,40 290,40 C360,40 420,130 510,130 L730,130'

const SignalMap = () => {
  const { count } = useCounter()
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    setPulsing(true)
    const timer = setTimeout(() => setPulsing(false), 650)
    return () => clearTimeout(timer)
  }, [count])

  return (
    <div className="signal-map">
      <svg
        className="signal-map__svg"
        viewBox="0 0 800 190"
        role="img"
        aria-label={`Component tree diagram. App provides the count. Navbar is a structural pass-through with no wire. Button and Component1 read the live value, currently ${count}, directly from the Provider.`}
      >
        <line x1="70" y1={Y} x2="730" y2={Y} className="signal-map__structural" />
        <path
          d={WIRE_PATH}
          className={`signal-map__wire${pulsing ? ' is-pulsing' : ''}`}
        />
        {NODES.map((node) => (
          <g key={node.id} transform={`translate(${node.x}, ${Y})`}>
            <circle
              r={node.id === 'app' ? 20 : 16}
              className={[
                'signal-map__node',
                node.connected ? 'is-live' : 'is-idle',
                pulsing && node.connected ? 'is-pulsing' : '',
              ].join(' ').trim()}
            />
          </g>
        ))}
      </svg>

      <ol className="signal-map__legend">
        {NODES.map((node) => (
          <li
            key={node.id}
            className={`signal-map__item${node.connected ? ' is-live' : ' is-idle'}`}
          >
            <span className="signal-map__depth">{node.depth}</span>
            <span className="signal-map__label">{node.label}</span>
            <span className="signal-map__note">{node.note}</span>
          </li>
        ))}
      </ol>

      <p className="signal-map__value">
        live value carried by the wire: <strong>{count}</strong>
      </p>
    </div>
  )
}

export default SignalMap
