export * from './ToolManager.js';
export * from './FastMCPAdapter.js';

// Add the async-mutex package for fallback concurrency protection if using worker threads
export const getMutex = async () => {
  try {
    // Try to import async-mutex
    const { Mutex } = await import('async-mutex');
    return new Mutex();
  } catch (error) {
    // Return a simple fallback if the package is not available
    return {
      acquire: async () => {
        // Simple mutex implementation
        const release = () => {}; // No-op since we're not actually locking anything
        return release;
      }
    };
  }
}; 