/**
 * ------------------------------------------------------------------
 * ES Module Import Example
 * ------------------------------------------------------------------
 * This file demonstrates how to import both:
 *   1. Named exports
 *   2. Default exports
 * from another module using modern ES Module syntax.
 *
 * Notes:
 * - Named exports must be imported using their exact exported name.
 * - Default exports can be imported using any identifier name.
 * - ES Modules require `"type": "module"` in package.json
 *   or the use of the `.mjs` extension.
 * ------------------------------------------------------------------
 */

/**
 * Import a named export
 * The variable `a` must be exported in `mymodule.js`
 * using: export const a = ...
 */
import { a } from './mymodule.js';

/**
 * Import the default export
 * Default exports can be assigned any local identifier name.
 * The imported value typically represents the primary object,
 * function, or configuration exported by the module.
 */
import defaultModule from './mymodule.js';

/**
 * Application entry point
 * Encapsulating execution logic inside a main function
 * improves maintainability and scalability.
 */
function main() {
  console.log('Named export value:', a);
  console.log('Default export object:', defaultModule);
}

main();
