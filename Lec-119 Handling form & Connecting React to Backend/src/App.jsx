import { useState } from "react"
import { useForm } from "react-hook-form"
import "./App.css"

const API_BASE = "http://localhost:3000"
const SIGNUP_ENDPOINT = `${API_BASE}/api/signup`

// Turns a JS value into HTML-escaped, syntax-tinted JSON for the console panel.
// Escaping & < > first means dangerouslySetInnerHTML below can never render a
// tag from user-typed content (e.g. a username of "<b>hi</b>") — it can only
// ever render text inside our own <span> wrappers.
function highlightJson(value) {
  if (value === null || value === undefined) return null
  const escaped = JSON.stringify(value, null, 2)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
  return escaped.replace(
    /"([^"\\]*(?:\\.[^"\\]*)*)"(\s*:)?/g,
    (_match, content, colon) =>
      colon
        ? `<span class="console__key">"${content}"</span>${colon}`
        : `<span class="console__string">"${content}"</span>`
  )
}

function Spinner() {
  return (
    <svg className="spinner" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" strokeWidth="3" className="spinner__track" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" strokeWidth="3" strokeLinecap="round" className="spinner__head" />
    </svg>
  )
}

function App() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" })

  // Local state powers the "Request Inspector" panel — it mirrors exactly
  // what left the browser and exactly what came back, which is the whole
  // point of this lecture: making the network call visible, not magic.
  const [requestState, setRequestState] = useState("idle") // idle | sending | success | error
  const [lastPayload, setLastPayload] = useState(null)
  const [lastResponse, setLastResponse] = useState(null)
  const [lastLatency, setLastLatency] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")

  const onSubmit = async (data) => {
    setRequestState("sending")
    setLastPayload(data)
    setLastResponse(null)
    setSuccessMessage("")
    const startedAt = performance.now()

    try {
      const response = await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const body = await response.json()
      setLastLatency(Math.round(performance.now() - startedAt))
      setLastResponse({ status: response.status, statusText: response.statusText, body })

      if (!response.ok) {
        if (body.errors) {
          Object.entries(body.errors).forEach(([field, message]) => {
            setError(field, { type: "server", message })
          })
        } else {
          setError("root.serverError", {
            type: "server",
            message: body.message || "Something went wrong on the server.",
          })
        }
        setRequestState("error")
        return
      }

      setRequestState("success")
      setSuccessMessage(body.message || "Account created successfully.")
      reset()
    } catch (networkError) {
      setLastLatency(Math.round(performance.now() - startedAt))
      setError("root.serverError", {
        type: "network",
        message: "Could not reach the server. Is it running on http://localhost:3000?",
      })
      setRequestState("error")
    }
  }

  const statusMeta = {
    idle: { dot: "idle", label: "Waiting for a submission" },
    sending: { dot: "sending", label: "Sending request…" },
    success: {
      dot: "success",
      label: lastResponse ? `${lastResponse.status} ${lastResponse.statusText}` : "Success",
    },
    error: {
      dot: "error",
      label: lastResponse ? `${lastResponse.status} ${lastResponse.statusText}` : "Network error",
    },
  }[requestState]

  return (
    <div className="page">
      <div className="page__eyebrow">React + Express</div>
      <h1 className="page__title">Create your account</h1>
      <p className="page__lede">
        Client-side validation runs first with <code>react-hook-form</code>; the submit posts JSON to
        an Express API which validates again and answers with a status code your UI reacts to.
      </p>

      <main className="layout">
        <section className="card" aria-labelledby="form-heading">
          <h2 id="form-heading" className="card__heading">
            Sign up
          </h2>

          {requestState === "success" && successMessage && (
            <div className="banner banner--success" role="status">
              <span className="banner__icon" aria-hidden="true">
                &#10003;
              </span>
              <span>{successMessage}</span>
            </div>
          )}

          {errors.root?.serverError && (
            <div className="banner banner--error" role="alert">
              <span className="banner__icon" aria-hidden="true">
                !
              </span>
              <span>{errors.root.serverError.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="e.g. ada_lovelace"
                autoComplete="username"
                spellCheck="false"
                aria-invalid={errors.username ? "true" : "false"}
                aria-describedby={errors.username ? "username-error" : undefined}
                {...register("username", {
                  required: "Username is required.",
                  minLength: { value: 3, message: "Must be at least 3 characters." },
                  maxLength: { value: 20, message: "Must be at most 20 characters." },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Only letters, numbers, and underscores.",
                  },
                })}
              />
              {errors.username && (
                <p className="field-error" id="username-error" role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="At least 7 characters"
                autoComplete="new-password"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password", {
                  required: "Password is required.",
                  minLength: { value: 7, message: "Must be at least 7 characters." },
                })}
              />
              {errors.password && (
                <p className="field-error" id="password-error" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="hint">
            Try username <code>blocked</code> to see the server reject a request that passes
            client-side validation, or stop the backend to see a network error.
          </p>
        </section>

        <aside className="console" aria-label="Live request inspector">
          <div className="console__header">
            <span className={`status-dot status-dot--${statusMeta.dot}`} aria-hidden="true" />
            <span className="console__status-label">{statusMeta.label}</span>
            {lastLatency !== null && <span className="console__latency">{lastLatency}ms</span>}
          </div>

          <div className="console__prompt">
            <span className="console__method">POST</span> /api/signup
          </div>

          {lastPayload === null ? (
            <p className="console__empty">
              Fill out the form and submit — the exact request and response will render here.
              <span className="console__cursor" aria-hidden="true" />
            </p>
          ) : (
            <>
              <div className="console__block">
                <span className="console__label">Request body sent</span>
                <pre className="console__pre" translate="no">
                  <code dangerouslySetInnerHTML={{ __html: highlightJson(lastPayload) }} />
                </pre>
              </div>

              <div className="console__block">
                <span className="console__label">
                  Response received
                  {lastResponse && (
                    <span className={`badge badge--${requestState === "success" ? "success" : "error"}`}>
                      {lastResponse.status}
                    </span>
                  )}
                </span>
                <pre className="console__pre" translate="no">
                  <code
                    dangerouslySetInnerHTML={{
                      __html: lastResponse ? highlightJson(lastResponse.body) : "waiting…",
                    }}
                  />
                </pre>
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App
