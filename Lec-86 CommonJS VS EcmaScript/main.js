/**
 * ------------------------------------------------------------------
 * Node.js HTTP Server using ES Modules (ESM)
 * ------------------------------------------------------------------
 *
 * Node.js supports two module systems:
 *
 * 1. CommonJS (CJS)
 *    - Uses: require(), module.exports
 *    - Default in older Node.js projects
 *
 * 2. ECMAScript Modules (ESM)
 *    - Uses: import / export
 *    - Enabled by setting `"type": "module"` in package.json
 *
 * Once ESM mode is enabled, the `require()` function is no longer
 * available, and modules must be imported using the `import` syntax.
 *
 * The built-in `http` module is used here to create a basic HTTP
 * server that returns an HTML response.
 * ------------------------------------------------------------------
 */

import http from 'node:http';

/**
 * Application configuration
 * Environment variables are preferred in production environments,
 * allowing configuration without modifying source code.
 */
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 3000;

/**
 * HTTP request handler
 *
 * @param {http.IncomingMessage} req - Incoming HTTP request
 * @param {http.ServerResponse} res  - HTTP response object
 *
 * Sends a simple HTML response to the client.
 */
const requestHandler = (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // Returning an HTML response instead of plain text
  res.end('<h1>Shaurya Punj</h1>');
};

/**
 * Create server instance
 */
const server = http.createServer(requestHandler);

/**
 * Start server
 */
server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

/**
 * Graceful shutdown handling
 * Ensures server closes properly when the process is terminated.
 */
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down server...');
  server.close(() => {
    console.log('Server successfully stopped.');
    process.exit(0);
  });
});
