import { useState } from 'react'

// Styled, but intentionally non-functional: there is no backend to call.
// Submit still runs through a real "submitting → done" state cycle so the
// form doesn't feel dead, without pretending to authenticate anyone.
const Login = () => {
  const [status, setStatus] = useState('idle') // idle | submitting | done
  const [showHint, setShowHint] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setStatus('submitting')
    window.setTimeout(() => setStatus('done'), 700)
  }

  return (
    <div className="page login-page">
      <div className="auth-card">
        <p className="eyebrow">Demo only</p>
        <h1>Sign in</h1>
        <p className="lede">
          This form doesn&rsquo;t talk to a server &mdash; it&rsquo;s here to prove a
          real page can live behind a route, not just a component floating in space.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Email</span>
            <input type="email" name="email" placeholder="you@example.com" required />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input type="password" name="password" placeholder="••••••••" required minLength={6} />
          </label>

          <div className="field-row">
            <label className="checkbox">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="link-button"
              onClick={() => setShowHint((prev) => !prev)}
            >
              Forgot password?
            </button>
          </div>

          {showHint && (
            <p className="hint">There&rsquo;s no backend here &mdash; this link doesn&rsquo;t go anywhere either.</p>
          )}

          <button className="btn btn-accent btn-block" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Signing in…' : 'Sign in'}
          </button>

          {status === 'done' && (
            <p className="form-note" role="status">
              Demo only &mdash; nothing was sent, and no session was created.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login
