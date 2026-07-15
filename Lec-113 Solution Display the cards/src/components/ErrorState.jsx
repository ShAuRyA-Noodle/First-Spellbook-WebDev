// Visible, actionable failure state for the feed. `role="alert"` means
// screen readers announce it as soon as it mounts, and the retry button
// hands control straight back to the person reading it.
const ErrorState = ({ message, onRetry }) => (
  <div className="error-state" role="alert">
    <p className="error-state__label">Stop Press</p>
    <h3 className="error-state__title">Your Dispatches Didn’t Load</h3>
    <p className="error-state__message">{message}</p>
    <button type="button" className="error-state__retry" onClick={onRetry}>
      Try Again
    </button>
  </div>
)

export default ErrorState
