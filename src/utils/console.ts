/**
 * This module ensures console output doesn't interfere with JSON communication over stdio.
 * 
 * In production, we need to handle console output carefully because:
 * - In debug mode: console.log redirects to console.error
 * - In production mode: console.log is suppressed to avoid interfering with stdio
 * 
 * Note: This is crucial since any stray output directly to stdout will break the JSON parsing.
 */

// Completely suppress console.log in production to avoid any JSON interference
console.log = () => {};

/**
 * Always redirect console.log to stderr
 * This overrides console.log to write to stderr instead of stdout
 * This is critical for FastMCP tools as stdout is used for structured communication
 */

// Store original error and warn functions
const originalError = console.error;
const originalWarn = console.warn;

// Make sure error output goes to stderr
console.error = originalError;

// For warning messages
console.warn = originalWarn;

// Ensure info messages are redirected to stderr or suppressed
console.info = () => {};

// For debug messages
console.debug = () => {};

export {};
