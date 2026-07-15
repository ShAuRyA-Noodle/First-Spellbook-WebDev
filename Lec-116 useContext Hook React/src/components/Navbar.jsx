import Button from './Button'

// Navbar is the pass-through layer. In the "before" version (see
// public/without_context_api/components/Navbar.jsx) this component had to
// accept a `count` prop it never used, purely to forward it to Button. Here
// it takes ZERO props and never touches counterContext — it is structurally
// between the Provider and the consumers, but data does not flow through it.
const Navbar = () => {
  return (
    <div className="tree-node tree-node--structural">
      <div className="tree-node__row">
        <span className="tree-node__depth">D1</span>
        <div className="tree-node__body">
          <p className="tree-node__name">Navbar</p>
          <p className="tree-node__meta">no props received &middot; no context read</p>
        </div>
      </div>
      <div className="tree-node__children">
        <Button />
      </div>
    </div>
  )
}

export default Navbar
