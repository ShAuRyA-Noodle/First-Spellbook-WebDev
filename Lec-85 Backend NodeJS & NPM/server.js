/**
 * ------------------------------------------------------------------
 * Node.js Package Usage Example — Slug Generation Utility
 * ------------------------------------------------------------------
 * This script demonstrates how to use a third-party npm package
 * (`slugify`) inside a Node.js backend project.
 *
 * Key Concepts:
 * - Node.js enables server-side JavaScript execution.
 * - npm (Node Package Manager) is used to install and manage
 *   third-party libraries required by backend applications.
 * - The `slugify` package converts human-readable strings into
 *   URL-friendly identifiers (commonly known as "slugs").
 *
 * Example use cases:
 * - Blog URLs (e.g., "My First Post" → "my-first-post")
 * - Product URLs in e-commerce platforms
 * - SEO-friendly routing identifiers
 * ------------------------------------------------------------------
 */

'use strict';

/**
 * Import external dependency
 * `slugify` must be installed using:
 *   npm install slugify
 */
const slugify = require('slugify');

/**
 * Application entry point
 * Keeping executable logic inside a main function
 * improves clarity and scalability for larger systems.
 */
function main() {
  console.log('Hello Shaurya Punj');

  /**
   * Generate a URL-friendly slug using the default separator ("-")
   */
  const defaultSlug = slugify('some string');
  console.log('Default slug:', defaultSlug);

  /**
   * Generate a slug using a custom separator ("_")
   * Options can be extended further for lowercase,
   * strict mode, locale handling, etc.
   */
  const customSlug = slugify('some string', {
    replacement: '_',
    lower: true,
    strict: true,
  });

  console.log('Custom slug:', customSlug);
}

/**
 * Execute program
 */
main();
