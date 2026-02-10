/**
 * ------------------------------------------------------------------
 * Node.js File System Operations using fs/promises (Async/Await)
 * ------------------------------------------------------------------
 *
 * This module demonstrates performing file operations using the
 * modern Promise-based File System API provided by Node.js.
 *
 * Operations performed:
 * 1. Read an existing file
 * 2. Write new content to the file
 * 3. Append additional content
 *
 * Using async/await improves readability, avoids callback hell,
 * and represents the standard approach in modern production systems.
 * ------------------------------------------------------------------
 */

import fs from 'node:fs/promises';

/**
 * Application entry point
 */
async function main() {
  try {
    /**
     * Read file content
     */
    const originalContent = await fs.readFile('shaurya.txt', 'utf-8');
    console.log('Original file content:', originalContent);

    /**
     * Overwrite file with new content
     */
    await fs.writeFile(
      'shaurya.txt',
      'Hello Shaurya, this file was edited using fs/promises.'
    );

    console.log('File successfully updated.');

    /**
     * Append additional content to the same file
     */
    await fs.appendFile(
      'shaurya.txt',
      '\nAdditional content appended using fs/promises.'
    );

    console.log('Content successfully appended.');

  } catch (error) {
    /**
     * Centralized error handling
     */
    console.error('File operation failed:', error);
  }
}

/**
 * Execute program
 */
main();
