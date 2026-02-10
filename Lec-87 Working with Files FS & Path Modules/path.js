/**
 * ------------------------------------------------------------------
 * Node.js Path Module — File Path Utilities
 * ------------------------------------------------------------------
 *
 * The built-in `path` module provides utilities for working with
 * file and directory paths in a platform-independent manner.
 *
 * Common use cases:
 * - Extracting file extensions
 * - Determining directory paths
 * - Getting file names
 * - Safely constructing file system paths
 *
 * Using the `path` module instead of manual string manipulation
 * ensures compatibility across operating systems (Windows, macOS, Linux).
 * ------------------------------------------------------------------
 */

import path from 'node:path';

/**
 * Example file path
 */
const filePath =
  '/Users/shauryapunj/Desktop/Web Development 2nd Half/Lec-87/shaurya.txt';

/**
 * Extract the file extension
 */
console.log('File extension:', path.extname(filePath));

/**
 * Extract the directory path
 */
console.log('Directory name:', path.dirname(filePath));

/**
 * Extract the base file name (file + extension)
 */
console.log('Base file name:', path.basename(filePath));

/**
 * Safely construct a full path using `path.join()`
 * Ensures correct path separators across operating systems.
 */
const constructedPath = path.join(
  '/Users',
  'shauryapunj',
  'Desktop',
  'shaurya.txt'
);

console.log('Constructed path:', constructedPath);
