import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Demonstrates programmatic navigation: useNavigate() pushes a new URL
// (built from user input) instead of a <Link> pointing at a fixed one.
// Reused on Home (discover a profile) and User (switch to another one).
const UsernameJump = ({ label = 'Jump to a profile' }) => {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()
    const handle = value.trim()
    if (!handle) return
    navigate(`/user/${encodeURIComponent(handle)}`)
    setValue('')
  }

  return (
    <form className="jump-form" onSubmit={handleSubmit}>
      <label className="jump-label" htmlFor="jump-username">{label}</label>
      <div className="jump-row">
        <span className="jump-prefix" aria-hidden="true">/user/</span>
        <input
          id="jump-username"
          className="jump-input"
          type="text"
          placeholder="any-handle"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          spellCheck="false"
        />
        <button type="submit" className="btn btn-accent" disabled={!value.trim()}>
          Go
        </button>
      </div>
    </form>
  )
}

export default UsernameJump
