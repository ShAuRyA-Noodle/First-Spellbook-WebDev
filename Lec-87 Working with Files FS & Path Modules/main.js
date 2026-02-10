/**
 * ------------------------------------------------------------------
 * Node.js File System Operations — Synchronous vs Asynchronous
 * ------------------------------------------------------------------
 *
 * This module demonstrates:
 * 1. Synchronous file writing (blocking operation)
 * 2. Asynchronous file writing (non-blocking operation)
 * 3. Reading files asynchronously
 * 4. Appending content to an existing file
 *
 * Key Concepts:
 * - Synchronous operations block the event loop until completion.
 * - Asynchronous operations allow other code to execute while the
 *   operation is processed in the background.
 * - In production systems, asynchronous APIs are generally preferred
 *   for better scalability and performance.
 * ------------------------------------------------------------------
 */

'use strict';

const fs = require('node:fs');

/**
 * Application entry point
 */
function main() {
  console.log('Process started');

  /**
   * Synchronous file write (Blocking Operation)
   * The execution will pause until the file is created and data is written.
   */
  fs.writeFileSync(
    'shaurya.txt',
    'Shaurya Punj has created the first file using Node.js.'
  );

  /**
   * Asynchronous file write (Non-Blocking Operation)
   * The callback executes once the file operation completes.
   */
  fs.writeFile(
    'shauryapunj.txt',
    'Shaurya Punj has created the second file using Node.js.',
    (writeError) => {
      if (writeError) {
        console.error('Error writing file:', writeError);
        return;
      }

      console.log('Second file successfully created.');

      /**
       * Read file after it has been successfully written
       */
      fs.readFile('shauryapunj.txt', (readError, data) => {
        if (readError) {
          console.error('Error reading file:', readError);
          return;
        }

        console.log('File content:', data.toString());
      });
    }
  );

  console.log('Process continues without waiting (non-blocking execution).');

  /**
   * Append additional content to an existing file
   */
  fs.appendFile(
    'shaurya.txt',
    '\nAdditional content appended using Node.js.',
    (appendError) => {
      if (appendError) {
        console.error('Error appending file:', appendError);
        return;
      }

      console.log('Content successfully appended to shaurya.txt');
    }
  );
}

/**
 * Execute program
 */
main();
