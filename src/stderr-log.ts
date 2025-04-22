// src/stderr-log.ts - Console redirection utility
export function stderrLog() {
  // Redirect console.log to console.error before anything else uses it
  /* eslint-disable no-global-assign */
  console.log = (...args: unknown[]) => console.error(...args);
} 