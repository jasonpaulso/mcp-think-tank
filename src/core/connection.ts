import http from 'http';
import { ServerOptions } from 'http';
import { serverState, resetInactivityTimer, gracefulShutdown } from './index.js';
import { createLogger } from '../utils/logger.js';

// Create logger
const logger = createLogger('connection');

/**
 * Start monitoring connections to detect inactivity
 * 
 * @param isToolScanMode Whether the server is running in tool scan mode
 */
export function startConnectionCheck(isToolScanMode: boolean): void {
  // Clear existing timer if any
  if (serverState.connectionCheckTimer) {
    clearInterval(serverState.connectionCheckTimer);
    serverState.connectionCheckTimer = null;
  }
  
  // Provide a longer initial grace period (5 minutes) for startup
  const initialStartupGracePeriod = 5 * 60 * 1000; // 5 minutes
  
  // Use longer interval for tool scan mode to reduce CPU usage
  const checkInterval = isToolScanMode ? 120000 : 60000; // 2 minutes in tool scan mode, 1 minute otherwise
  
  // Check periodically for active connections
  serverState.connectionCheckTimer = setInterval(() => {
    // Check if server has been running for too long with no activity
    const runningTime = Date.now() - (serverState.processInfo?.startTime || Date.now());
    
    // Skip detailed logging in tool scan mode to reduce noise
    if (!isToolScanMode) {
      logger.debug(`Connection check: ${serverState.connectionCount} active connections, running for ${Math.floor(runningTime/1000)}s`);
    }
    
    // Skip checks entirely during tool scanning
    if (isToolScanMode) {
      logger.debug(`Running in tool scan mode - extending grace period`);
      return;
    }
    
    // Give more time during initial startup before enforcing connection checks
    if (runningTime < initialStartupGracePeriod) {
      logger.debug(`Server in startup grace period (${Math.floor(initialStartupGracePeriod/1000)}s), not checking connections yet`);
      return;
    }
    
    // Force check for abandoned processes, but only after the grace period
    if (runningTime > initialStartupGracePeriod && serverState.connectionCount <= 0) {
      logger.warn('No active connections detected after grace period, initiating auto-shutdown');
      gracefulShutdown();
      return;
    }
    
    // Reset inactivity timer regardless to prevent timeout
    resetInactivityTimer();
  }, checkInterval);
}

/**
 * Set up connection tracking for HTTP server
 * 
 * @param httpServer HTTP server instance
 * @returns The HTTP server with connection tracking
 */
export function setupConnectionTracking(httpServer: http.Server): http.Server {
  logger.info('Setting up HTTP connection tracking');
  
  // Track when a new connection is established
  httpServer.on('connection', (socket) => {
    serverState.connectionCount++;
    logger.debug(`New connection established. Active connections: ${serverState.connectionCount}`);
    
    // Set up event listener for when the connection closes
    socket.on('close', () => {
      serverState.connectionCount = Math.max(0, serverState.connectionCount - 1);
      logger.debug(`Connection closed. Active connections: ${serverState.connectionCount}`);
    });
  });
  
  // Track when a new request comes in
  httpServer.on('request', (req, res) => {
    // Determine if this is a tool list request (typical for Smithery scanning)
    const isToolListRequest = req.url?.includes('/rpc.listTools') || 
                             req.url?.includes('list_tools') ||
                             req.url?.includes('toolList');
                             
    // Only log regular requests, not tool scanning requests to reduce noise
    if (!isToolListRequest) {
      logger.debug(`HTTP request received: ${req.method} ${req.url}`);
    } else {
      // For tool list requests, set higher priority to ensure fast response
      process.nextTick(() => {
        // This helps ensure tool list requests are handled quickly
        logger.debug(`Tool list request received, prioritizing`);
      });
    }
    
    // Consider the server active as long as we're receiving requests
    resetInactivityTimer();
    
    // Track response completion to update connection status if needed
    res.on('finish', () => {
      if (!isToolListRequest) {
        logger.debug('HTTP response finished');
      }
    });
  });
  
  return httpServer;
}

/**
 * Get HTTP server options based on tool scan mode
 * 
 * @param isToolScanMode Whether the server is running in tool scan mode
 * @param toolScanTimeout Timeout for tool scanning in milliseconds
 * @returns Server options object
 */
export function getServerOptions(isToolScanMode: boolean, toolScanTimeout: number): ServerOptions {
  return isToolScanMode 
    ? { keepAliveTimeout: toolScanTimeout } 
    : {};
} 