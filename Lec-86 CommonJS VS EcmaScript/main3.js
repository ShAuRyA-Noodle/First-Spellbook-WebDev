/**
 * ------------------------------------------------------------------
 * CommonJS Module Import Example
 * ------------------------------------------------------------------
 *
 * This file demonstrates how to import modules using the
 * CommonJS module system in Node.js.
 *
 * Requirements:
 * - The project must NOT have `"type": "module"` in package.json,
 *   or it should be explicitly set to `"type": "commonjs"`.
 * - CommonJS uses `require()` for importing modules and
 *   `module.exports` for exporting values.
 *
 * This import loads the exported content from `mymodule2.js`.
 * The imported value can be an object, function, class, or any
 * data structure exported via `module.exports`.
 * ------------------------------------------------------------------
 */

'use strict';

/**
 * Import module using CommonJS `require()`
 */
const myModule = require('./mymodule2.js');

/**
 * Application entry point
 */
function main() {
  console.log('Imported module content:', myModule);
}

/**
 * Execute program
 */
main();
