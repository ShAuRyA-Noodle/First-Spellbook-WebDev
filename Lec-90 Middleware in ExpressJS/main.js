/**
 * ------------------------------------------------------------------
 * Express Middleware Pipeline Example
 * ------------------------------------------------------------------
 *
 * This application demonstrates:
 * 1. Static middleware usage
 * 2. Custom global middleware for logging and request modification
 * 3. Middleware chaining using `next()`
 * 4. Modular router mounting
 *
 * Middleware executes in the order it is registered. Each middleware
 * function can:
 *   - Modify the request/response
 *   - Terminate the request by sending a response
 *   - Pass control to the next middleware using `next()`
 * ------------------------------------------------------------------
 */

'use strict';

const express = require('express');
const fs = require('node:fs');
const path = require('node:path');

const blogRoutes = require('./routes/blog');

const app = express();

/**
 * Server configuration
 */
const PORT = process.env.PORT || 3000;

/**
 * Mount blog router
 */
app.use('/blog', blogRoutes);

/**
 * Static middleware
 * Serves files from the "public" directory.
 */
app.use(express.static('public'));

/**
 * Middleware 1 — Request logging and metadata attachment
 * Logs request headers and method and stores metadata in request object.
 */
app.use((req, res, next) => {
  console.log('Request Headers:', req.headers);

  // Attach custom request metadata
  req.customMessage = 'Request processed by Middleware 1';

  // Append request log to file
  const logEntry = `${new Date().toISOString()} - ${req.method}\n`;
  fs.appendFileSync(path.join(__dirname, 'logs.txt'), logEntry);

  console.log(logEntry.trim());

  next();
});

/**
 * Middleware 2 — Modify request metadata
 */
app.use((req, res, next) => {
  req.customMessage = 'Request updated by Middleware 2';
  console.log('Middleware 2 executed');
  next();
});

/**
 * Route handlers
 */
app.get('/', (req, res) => {
  res.status(200).send('Shaurya Punj');
});

app.get('/about', (req, res) => {
  res.status(200).send(`About Shaurya Punj — ${req.customMessage}`);
});

app.get('/home', (req, res) => {
  res.status(200).send('Home: Shaurya Punj');
});

app.get('/contact', (req, res) => {
  res.status(200).send('Contact Shaurya Punj');
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
