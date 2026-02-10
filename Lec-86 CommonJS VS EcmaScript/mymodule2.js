/**
 * ------------------------------------------------------------------
 * CommonJS Module Export Example
 * ------------------------------------------------------------------
 *
 * This module demonstrates exporting values using the CommonJS
 * module system (`module.exports`), which is commonly used in
 * Node.js environments where ES Modules are not enabled.
 *
 * A module can export:
 * - Objects
 * - Functions
 * - Classes
 * - Strings / Numbers
 * - Any JavaScript value
 *
 * The exported value can then be imported in another file using:
 *    const value = require('./moduleFile');
 * ------------------------------------------------------------------
 */

'use strict';

/**
 * Exported module value
 * Using `const` ensures immutability and prevents accidental reassignment.
 */
const moduleMessage = 'Shaurya Punj is in module 2';

/**
 * Export module content
 */
module.exports = moduleMessage;
