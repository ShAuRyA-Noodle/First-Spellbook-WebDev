import { useCounter } from '../context/context'

// Three levels below App, and it never received a single prop. It reaches
// straight past Navbar and Button to read the live value from the Provider.
const Component1 = () => {
  const { count } = useCounter()

  return (
    <div className="tree-node tree-node--consumer tree-node--leaf">
      <div className="tree-node__row">
        <span className="tree-node__depth">D3</span>
        <div className="tree-node__body">
          <p className="tree-node__name">Component1</p>
          <p className="tree-node__meta">useContext(counterContext) &middot; read only</p>
          <p className="tree-node__readout">
            <span className="tree-node__readout-label">count</span>
            <span className="tree-node__readout-value" aria-live="polite">
              {count}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Component1
