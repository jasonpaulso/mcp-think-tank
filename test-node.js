// test-node.js
console.log('Node version:', process.version);

// Try an ESM import
import { promises as fs } from 'fs';

// Async function to test ESM features
async function testFile() {
  try {
    const data = await fs.readFile('package.json', 'utf8');
    console.log('Successfully read package.json with ESM imports');
  } catch (err) {
    console.error('Error reading file:', err);
  }
}

testFile(); 