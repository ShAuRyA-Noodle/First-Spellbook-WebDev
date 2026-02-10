/**
 * ------------------------------------------------------------------
 * Shop Routes Module
 * ------------------------------------------------------------------
 *
 * This router module manages all routes related to the shop
 * functionality of the application. Separating routes into
 * independent modules improves scalability and code organization,
 * especially in large production systems.
 *
 * Example mounting in main application:
 *   const shopRoutes = require('./routes/shop.routes');
 *   app.use('/shop', shopRoutes);
 * ------------------------------------------------------------------
 */

'use strict';

const express = require('express');

const router = express.Router();

/**
 * Shop home route
 * GET /shop/
 */
router.get('/', (req, res) => {
  res.status(200).send('Shop home page');
});

/**
 * About shop route
 * GET /shop/about
 */
router.get('/about', (req, res) => {
  res.status(200).send('About shop');
});

/**
 * Dynamic shopping cart route
 * GET /shop/shopcart/:slug
 *
 * Route parameter:
 * - slug : Represents a product identifier or category slug
 */
router.get('/shopcart/:slug', (req, res) => {
  const { slug } = req.params;

  /**
   * In production systems, this slug is typically used to
   * retrieve product or cart-related information from the database.
   */
  res.status(200).send(`Continue shopping for: ${slug}`);
});

/**
 * Export router
 */
module.exports = router;
