/**
 * ------------------------------------------------------------------
 * Express Application Starter
 * ------------------------------------------------------------------
 *
 * This file initializes a basic Express.js server configured
 * for production-ready scalability.
 *
 * Features:
 * - Environment-based port configuration
 * - Structured route handling
 * - Graceful shutdown handling
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
  res.status(200).send('Hello World!');
});

/**
 * Start server
 */
const server = app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

/**
 * Graceful shutdown handling
 */
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed successfully.');
    process.exit(0);
  });
});
