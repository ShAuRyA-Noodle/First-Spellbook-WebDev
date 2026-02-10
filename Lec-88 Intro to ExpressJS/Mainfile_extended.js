/**
 * ------------------------------------------------------------------
 * Express.js Dynamic Route Parameters Example
 * ------------------------------------------------------------------
 *
 * This example demonstrates how to define dynamic route parameters
 * in Express.js. Route parameters allow applications to capture
 * variable values directly from the URL, commonly used for:
 *
 * - Blog post slugs
 * - Product identifiers
 * - User profile routes
 *
 * Example request:
 *   GET /blog/nodejs-basics/part-1
 *
 * Extracted parameters:
 *   req.params.slug   → "nodejs-basics"
 *   req.params.second → "part-1"
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
 * Dynamic blog route
 *
 * Route parameters:
 * - slug   : Represents the blog identifier
 * - second : Represents a secondary segment (e.g., section, version)
 */
app.get('/blog/:slug/:second', (req, res) => {
  const { slug, second } = req.params;

  /**
   * In production systems, this section typically contains
   * database queries or service calls to fetch content using
   * the provided route parameters.
   */

  res.status(200).send(
    `Shaurya Punj is learning ${slug} and ${second}`
  );
});

/**
 * Start Express server
 */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
