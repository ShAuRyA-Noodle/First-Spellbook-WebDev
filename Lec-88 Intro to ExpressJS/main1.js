/**
 * ------------------------------------------------------------------
 * Basic Node.js HTTP Server — Development Notes
 * ------------------------------------------------------------------
 *
 * Development Utilities:
 * - Nodemon:
 *   Automatically restarts the Node.js server whenever file changes
 *   are detected, improving development workflow.
 *   Usage:
 *       npx nodemon filename.js
 *   Stop the running server in the terminal using:
 *       Ctrl + C
 *
 * Express.js:
 * - Express is a lightweight and flexible web application framework
 *   built on top of Node.js.
 * - It simplifies routing, middleware handling, and server setup,
 *   making it suitable for building production-level backend systems
 *   and web APIs.
 * - Installation:
 *       npm install express
 *   (Specific version example: npm install express@4)
 *
 * This example demonstrates creating a basic HTTP server using the
 * built-in Node.js `http` module (without Express).
 * ------------------------------------------------------------------
 */

'use strict';

const { createServer } = require('node:http');

/**
 * Server configuration
 * Environment variables allow flexible configuration across
 * development, staging, and production environments.
 */
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 3000;

/**
 * Request handler
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
const requestHandler = (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // HTML response sent to the client
  res.end('<h1>Welcome to Shaurya Punj Server</h1>');
};

/**
 * Create and start the server
 */
const server = createServer(requestHandler);

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

/**
 * Graceful shutdown handling
 */
process.on('SIGINT', () => {
  console.log('\nStopping server...');
  server.close(() => {
    console.log('Server stopped successfully.');
    process.exit(0);
  });
});
