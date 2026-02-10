/**
 * ------------------------------------------------------------------
 * Express.js Server — EJS Templating Example
 * ------------------------------------------------------------------
 *
 * This server demonstrates:
 * 1. Configuring EJS as the template engine
 * 2. Rendering dynamic templates using `res.render()`
 * 3. Passing variables from the server to view templates
 * 4. Dynamic route rendering using route parameters
 *
 * The EJS view engine enables server-side rendering (SSR),
 * allowing dynamic content generation before sending HTML
 * to the client.
 * ------------------------------------------------------------------
 */

'use strict';

const express = require('express');
const path = require('node:path');

const app = express();

/**
 * Server configuration
 */
const PORT = process.env.PORT || 3000;

/**
 * Configure EJS view engine
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Home page route
 */
app.get('/', (req, res) => {
  const siteName = 'Lover Boy';
  const searchText = 'Find';
  const arr = ['Akshita', 45, 34, 56, 78, 90];

  /**
   * Render index.ejs and pass dynamic variables
   */
  res.render('index', {
    siteName,
    searchText,
    arr,
  });
});

/**
 * Dynamic blog post route
 */
app.get('/blog/:slug', (req, res) => {
  const { slug } = req.params;

  /**
   * In production applications:
   * - The slug is typically used to fetch blog content
   *   from a database.
   */
  const blogTitle = `Blog: ${slug}`;
  const blogContent =
    'Dynamic blog content rendered using Express and EJS templates.';

  res.render('blogpost', {
    blogTitle,
    blogContent,
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
