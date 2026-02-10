/**
 * ------------------------------------------------------------
 * Basic HTTP Server (Production-Ready Structure)
 * ------------------------------------------------------------
 * This module initializes a lightweight HTTP server using Node.js.
 * The server listens on a configurable host and port and returns
 * a simple plaintext response for all incoming requests.
 *
 * Environment variables:
 *  - HOST: Server hostname (default: 127.0.0.1)
 *  - PORT: Server port (default: 3000)
 *
 * This structure is intentionally designed to scale easily into
 * larger production systems by centralizing configuration and
 * keeping responsibilities clearly separated.
 * ------------------------------------------------------------
 */

const http = require('node:http');

/**
 * Server configuration
 * Using environment variables allows the application
 * to run seamlessly across development, staging, and
 * production environments without code modification.
 */
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 3000;

/**
 * Request handler
 *
 * @param {http.IncomingMessage} request  - Incoming HTTP request object
 * @param {http.ServerResponse} response  - HTTP response object used to send data back to the client
 *
 * This function defines how the server responds to every
 * incoming request. Currently, it returns a simple plaintext
 * message with HTTP status 200 (OK).
 */
const requestHandler = (request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.end('Shaurya Punj says Hi\n');
};

/**
 * Create HTTP server instance
 * The server delegates all incoming traffic to the requestHandler.
 */
const server = http.createServer(requestHandler);

/**
 * Start listening for incoming connections
 */
server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

/**
 * Graceful shutdown handling
 * Ensures the server closes cleanly when the process is terminated,
 * which is essential for professional production deployments.
 */
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed successfully.');
    process.exit(0);
  });
});
