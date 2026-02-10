/**
 * ------------------------------------------------------------------
 * Birds Routes Module — Router-Level Middleware Example
 * ------------------------------------------------------------------
 *
 * This module demonstrates:
 * 1. Creating an Express Router
 * 2. Applying router-specific middleware
 * 3. Defining feature-specific routes
 *
 * Router-level middleware is useful when certain logic (logging,
 * authentication, validation, etc.) should only apply to a specific
 * feature domain instead of the entire application.
 *
 * Example mounting:
 *   const birdsRoutes = require('./routes/birds.routes');
 *   app.use('/birds', birdsRoutes);
 * ------------------------------------------------------------------
 */

'use strict';

const express = require('express');

const router = express.Router();

/**
 * Router-specific middleware
 * Logs the request timestamp for every request handled
 * by this router.
 */
const requestTimeLogger = (req, res, next) => {
  console.log('Request Time:', new Date().toISOString());
  next();
};

/**
 * Apply middleware to all routes in this router
 */
router.use(requestTimeLogger);

/**
 * Birds home route
 * GET /birds/
 */
router.get('/', (req, res) => {
  res.status(200).send('Birds home page');
});

/**
 * About birds route
 * GET /birds/about
 */
router.get('/about', (req, res) => {
  res.status(200).send('About birds');
});

/**
 * Export router
 */
module.exports = router;
