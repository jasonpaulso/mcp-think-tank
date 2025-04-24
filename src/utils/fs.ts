import * as fs from 'fs';

/**
 * Creates a directory and any parent directories if they don't exist
 * @param dirPath - The path to create
 */
export function createDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    // Directory created, no logging
  }
} 