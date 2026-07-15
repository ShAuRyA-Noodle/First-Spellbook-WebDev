import express from "express"
import cors from "cors"

const app = express()
const PORT = process.env.PORT || 3000

// --- Middleware (must be registered before routes that need them) ---
app.use(cors()) // allow the Vite dev server (a different origin) to read our responses
app.use(express.json()) // parse JSON request bodies into req.body (built into Express 4.16+)

// --- Validation rules, mirrored (not duplicated 1:1) from the frontend ---
// The client validates for UX; the server validates because it's the only
// copy of the rules nobody can bypass with devtools.
const USERNAME_MIN = 3
const USERNAME_MAX = 20
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/
const PASSWORD_MIN = 7
const BLOCKED_USERNAMES = ["blocked", "admin"]

function validateSignup(body) {
  const errors = {}
  const username = typeof body?.username === "string" ? body.username.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!username) {
    errors.username = "Username is required."
  } else if (username.length < USERNAME_MIN) {
    errors.username = `Username must be at least ${USERNAME_MIN} characters.`
  } else if (username.length > USERNAME_MAX) {
    errors.username = `Username must be at most ${USERNAME_MAX} characters.`
  } else if (!USERNAME_PATTERN.test(username)) {
    errors.username = "Username can only contain letters, numbers, and underscores."
  }

  if (!password) {
    errors.password = "Password is required."
  } else if (password.length < PASSWORD_MIN) {
    errors.password = `Password must be at least ${PASSWORD_MIN} characters.`
  }

  return { errors, username, password }
}

// --- Routes ---

// Health check — hit this in a browser to confirm the API is up.
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Signup API is running.",
    timestamp: new Date().toISOString(),
  })
})

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

app.post("/api/signup", (req, res) => {
  const { errors, username } = validateSignup(req.body)

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Please fix the highlighted fields.",
      errors, // { username?: string, password?: string }
    })
  }

  if (BLOCKED_USERNAMES.includes(username.toLowerCase())) {
    return res.status(403).json({
      success: false,
      message: `Sorry, "${username}" is a reserved username and can't be used.`,
    })
  }

  console.log("New signup:", { username })

  return res.status(201).json({
    success: true,
    message: `Account created for "${username}".`,
    user: { username },
  })
})

// Anything else (wrong method, wrong path, typo'd endpoint) — JSON 404, not an HTML stack trace.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `No route for ${req.method} ${req.originalUrl}`,
  })
})

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`)
})
