// src/stderr-log.ts - Console redirection utility
// eslint-disable-next-line no-global-assign
export function stderrLog() {
  // Redirect console.log to console.error before anything else uses it
  /* eslint-disable no-global-assign */
  console.log = (...args: unknown[]) => console.error(...args);
} 