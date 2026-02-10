/**
 * ------------------------------------------------------------------
 * Express.js Static Middleware Example
 * ------------------------------------------------------------------
 *
 * This application demonstrates:
 * 1. Serving static files using the built-in `express.static()` middleware
 * 2. Handling dynamic routes using route parameters
 *
 * Key Concepts:
 * - `app.use()` registers middleware functions in the request pipeline.
 * - `express.static('public')` exposes files inside the "public" folder
 *   so they can be accessed directly via the browser.
 *
 * Example:
 *   If the file exists:
 *       public/styles.css
 *   It becomes accessible at:
 *       http://localhost:3000/styles.css
 *
 * Static middleware is commonly used to serve:
 * - Images
 * - CSS files
 * - Client-side JavaScript bundles
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
 * Register static middleware
 * Makes the "public" directory accessible to the browser.
 */
app.use(express.static('public'));

/**
 * Root route
 */
app.get('/', (req, res) => {
  res.status(200).send('Shaurya Punj says Hi');
});

/**
 * Dynamic blog route
 */
app.get('/blog/:slug', (req, res) => {
  const { slug } = req.params;

  /**
   * In production systems, this slug would typically be used
   * to query a database and return the corresponding blog post.
   */
  res.status(200).send(`Shaurya Punj is learning ${slug}`);
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
