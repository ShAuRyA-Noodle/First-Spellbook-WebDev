/**
 * ------------------------------------------------------------------
 * Example Module — Named and Default Exports (ES Modules)
 * ------------------------------------------------------------------
 *
 * This module demonstrates:
 * 1. Named exports — multiple values exported using their identifiers.
 * 2. Default export — a primary object exported as the main module value.
 *
 * Key Concepts:
 * - Named exports must be imported using their exact names.
 *   Example:
 *      import { a, b } from './module.js';
 *
 * - Default exports can be imported using any local identifier.
 *   Example:
 *      import config from './module.js';
 *
 * This pattern is commonly used in production systems where:
 * - Named exports provide utility constants or helper functions
 * - Default export provides the module's primary configuration object
 * ------------------------------------------------------------------
 */

/**
 * Named exports (immutable constants)
 */
export const a = 20;
export const b = 30;
export const c = 40;
export const d = 50;
export const e = 890;
export const f = 70;

/**
 * Primary module object (default export)
 * Using `const` ensures the reference remains immutable.
 */
const moduleConfig = {
  x: 67,
  y: 98,
};

/**
 * Default export
 */
export default moduleConfig;
