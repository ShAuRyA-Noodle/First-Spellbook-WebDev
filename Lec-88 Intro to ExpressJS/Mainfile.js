/**
 * ------------------------------------------------------------------
 * Express.js Routing Example — Basic and Dynamic Routes
 * ------------------------------------------------------------------
 *
 * This application demonstrates:
 * 1. Basic route handling (static paths)
 * 2. Dynamic route parameters
 * 3. Query parameter extraction
 *
 * Key Concepts:
 * - app.get(path, handler) registers a handler for HTTP GET requests.
 * - Route parameters (e.g., :slug) capture dynamic values from URLs.
 * - Query parameters are accessed via `req.query`.
 *
 * Example:
 *   URL:
 *   http://127.0.0.1:3000/blog/drums?mode=dark&region=in
 *
 *   req.params → { slug: 'drums' }
 *   req.query  → { mode: 'dark', region: 'in' }
 * ------------------------------------------------------------------
 */

'use strict';

const express = require('express');

const app = express();

/**
 * Server configuration
 */
const PORT = process.env.PORT || 3000;

/**
 * Root route
 */
app.get('/', (req, res) => {
  res.status(200).send('Shaurya Punj says Hi');
});

/**
 * Static routes
 */
app.get('/about', (req, res) => {
  res.status(200).send('About Shaurya Punj');
});

app.get('/contact', (req, res) => {
  res.status(200).send('Contact information');
});

app.get('/blog', (req, res) => {
  res.status(200).send('Shaurya Punj Blog Home');
});

/**
 * Example static blog pages
 */
app.get('/blog/intro-to-express', (req, res) => {
  res.status(200).send('Learning Express.js');
});

app.get('/blog/intro-to-node', (req, res) => {
  res.status(200).send('Learning Node.js');
});

/**
 * Dynamic blog route
 * Captures the blog slug and optionally uses query parameters.
 */
app.get('/blog/:slug', (req, res) => {
  const { slug } = req.params;
  const queryParams = req.query;

  console.log('Route parameters:', req.params);
  console.log('Query parameters:', queryParams);

  /**
   * In production systems:
   * - The slug is typically used to query a database
   *   (e.g., findBlogBySlug(slug))
   */
  res.status(200).send(`Shaurya Punj is learning ${slug}`);
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
