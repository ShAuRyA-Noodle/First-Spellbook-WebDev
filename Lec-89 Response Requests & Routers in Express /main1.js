/**
 * ------------------------------------------------------------------
 * Main Application Server — Express.js
 * ------------------------------------------------------------------
 *
 * This file initializes the primary Express application and
 * configures:
 * 1. Static file serving
 * 2. Modular route mounting (Blog + Shop routers)
 * 3. RESTful HTTP method handlers (GET, POST, PUT, DELETE)
 * 4. File serving for HTML templates
 * 5. JSON API endpoint
 *
 * Modular routing improves scalability by separating domain
 * features into independent route files.
 * ------------------------------------------------------------------
 */

'use strict';

const express = require('express');
const path = require('node:path');

const blogRoutes = require('./routes/blog');
const shopRoutes = require('./routes/shop');

const app = express();

/**
 * Server configuration
 */
const PORT = process.env.PORT || 3000;

/**
 * Static file middleware
 * Serves files from the "public" directory.
 */
app.use(express.static('public'));

/**
 * Mount feature-specific routers
 */
app.use('/blog', blogRoutes);
app.use('/shop', shopRoutes);

/**
 * Root route — Demonstrates RESTful handlers
 */
app.get('/', (req, res) => {
  console.log('GET request received');
  res.status(200).send('Shaurya Punj GET request response');
});

app.post('/', (req, res) => {
  console.log('POST request received');
  res.status(200).send('POST request processed successfully');
});

app.put('/', (req, res) => {
  console.log('PUT request received');
  res.status(200).send('PUT request processed successfully');
});

app.delete('/', (req, res) => {
  console.log('DELETE request received');
  res.status(200).send('DELETE request processed successfully');
});

/**
 * Serve HTML template file
 */
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

/**
 * Example JSON API endpoint
 */
app.get('/api', (req, res) => {
  res.json({
    a: 69,
    b: 96,
    c: 76,
    d: 67,
    name: ['Shaurya', 'Shreya'],
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
