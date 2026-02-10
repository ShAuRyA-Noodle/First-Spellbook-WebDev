/**
 * ------------------------------------------------------------------
 * File Organizer Script — Sort Files by Extension
 * ------------------------------------------------------------------
 *
 * This script scans a directory and moves files into folders
 * based on their file extensions.
 *
 * Example:
 *   file.txt   → /txt/file.txt
 *   image.png  → /png/image.png
 *
 * Key Improvements:
 * - Uses async/await for clean asynchronous execution
 * - Ensures destination folders exist before moving files
 * - Uses platform-safe path handling
 * - Skips directories and files without extensions
 * ------------------------------------------------------------------
 */

import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Base directory to organize
 */
const BASE_PATH = '/Users/shauryapunj/Desktop/Lec-93';

/**
 * Organize files by extension
 */
async function organizeFiles() {
  try {
    const items = await fs.readdir(BASE_PATH, { withFileTypes: true });

    for (const item of items) {
      // Skip directories
      if (item.isDirectory()) continue;

      const fileName = item.name;
      const extension = path.extname(fileName).slice(1);

      // Skip files without extension
      if (!extension) continue;

      const extensionFolder = path.join(BASE_PATH, extension);
      const oldPath = path.join(BASE_PATH, fileName);
      const newPath = path.join(extensionFolder, fileName);

      /**
       * Ensure destination directory exists
       */
      await fs.mkdir(extensionFolder, { recursive: true });

      /**
       * Move file
       */
      await fs.rename(oldPath, newPath);

      console.log(`Moved: ${fileName} → ${extensionFolder}/`);
    }

    console.log('File organization completed successfully.');
  } catch (error) {
    console.error('Error organizing files:', error);
  }
}

/**
 * Execute script
 */
organizeFiles();
