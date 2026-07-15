import { useCounter } from '../context/context'
import Component1 from './Component1'

// Button is two levels below App, yet it can both READ and UPDATE the
// counter — something the prop-drilled "before" version could not do,
// because only `count` was drilled down, never `setCount`.
const Button = () => {
  const { count, setCount } = useCounter()

  return (
    <div className="tree-node tree-node--consumer">
      <div className="tree-node__row">
        <span className="tree-node__depth">D2</span>
        <div className="tree-node__body">
          <p className="tree-node__name">Button</p>
          <p className="tree-node__meta">useContext(counterContext) &middot; read + write</p>
          <button
            type="button"
            className="btn btn--signal"
            onClick={() => setCount((c) => c + 1)}
          >
            Increment from depth 2
            <span className="btn__badge">{count}</span>
          </button>
        </div>
      </div>
      <div className="tree-node__children">
        <Component1 />
      </div>
    </div>
  )
}

export default Button
