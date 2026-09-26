/**
 * ------------------------------------------------------------------
 * Blog Routes Module
 * ------------------------------------------------------------------
 *
 * This router module defines all routes related to blog functionality.
 * Separating routes into dedicated modules improves maintainability,
 * scalability, and readability in large Express.js applications.
 *
 * Example mounting in main app:
 *   const blogRoutes = require('./routes/blog.routes');
 *   app.use('/blog', blogRoutes);
 * ------------------------------------------------------------------
 */

'use strict';

const express = require('express');

const router = express.Router();

/**
 * Blog home route
 * GET /blog/
 */
router.get('/', (req, res) => {
  res.status(200).send('Blog home page');
});

/**
 * About blog route
 * GET /blog/about
 */
router.get('/about', (req, res) => {
  res.status(200).send('About blog');
});

/**
 * Dynamic blog post route
 * GET /blog/blogpost/:slug
 *
 * Route parameter:
 * - slug : Unique identifier for the blog post
 */
router.get('/blogpost/:slug', (req, res) => {
  const { slug } = req.params;

  /**
   * In production systems, this slug would typically be used
   * to query a database (e.g., findPostBySlug(slug)).
   */
  res.status(200).send(`Fetch the blog post for: ${slug}`);
});

/**
 * Export router
 */
module.exports = router;
