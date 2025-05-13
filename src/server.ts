// src/server.ts
// Import console redirections first to ensure all logging is properly handled
import './utils/console.js';

import { FastMCP } from 'fastmcp';
import { registerMemoryTools } from './memory/tools.js';
import { registerThinkTool } from './think/tools.js';
import { registerTaskTools } from './tasks/tools.js';
import { registerUtilityTools } from './utils/tools.js';
import { registerResearchTools } from './research/index.js';
import { createDirectory } from './utils/fs.js';
import path from 'path';
import * as os from 'os';
import { config } from './config.js';
import { taskStorage } from './tasks/storage.js';
import { wrapFastMCP, ensureDependencies } from './tools/FastMCPAdapter.js';
import fs from 'fs';
import http from 'http';
import { ServerOptions } from 'http';

// Safely log errors to stderr without interfering with stdout JSON
const safeErrorLog = (message: string) => {
  process.stderr.write(`${message}\n`);
};

// Ensure all dependencies are installed
await ensureDependencies();

// Get configuration from environment
const _REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '300', 10);
const _TOOL_SCAN_TIMEOUT = parseInt(process.env.TOOL_SCAN_TIMEOUT || '30000', 10); // New timeout for tool scanning

// Create necessary directories
const memoryPath = process.env.MEMORY_PATH || path.join(os.homedir(), '.mcp-think-tank/memory.jsonl');
createDirectory(path.dirname(memoryPath));

// Detect if tool scanning is in progress
const isToolScanMode = process.env.SMITHERY_TOOL_SCAN === 'true' || 
                        process.argv.includes('--tool-scan') ||
                        process.argv.includes('--scan-tools');

// Create FastMCP server
const server = new FastMCP({
  name: "MCP Think Tank",
  version: config.version as `${number}.${number}.${number}`, // Cast to the expected format
  // Add instructions field for better tool scanning behavior
  instructions: isToolScanMode 
    ? "MCP Think Tank provides tools for structured reasoning, knowledge graph memory, and web research. All tools support lazy loading." 
    : undefined
});

// Wrap FastMCP server with ToolManager before registering any tools
wrapFastMCP(server);

// Register all tools - use lazy loading pattern for better compatibility
registerMemoryTools(server);
registerThinkTool(server);
registerTaskTools(server);
registerUtilityTools(server);
registerResearchTools(server);

// --- Add FastMCP handshake resources/templates for Cursor compatibility ---
server.addResource({
  uri: 'status://health',
  name: 'Health',
  mimeType: 'text/plain',
  load: async () => ({ text: 'ok' })
});

server.addResourceTemplate({
  uriTemplate: 'task://{id}',
  name: 'Task JSON',
  mimeType: 'application/json',
  arguments: [{ name: 'id', description: 'Task ID' }],
  load: async ({ id }) => ({ text: JSON.stringify({ id }) })
});

// Track active connections
let connectionCount = 0;
let inactivityTimer: NodeJS.Timeout | null = null;
let connectionCheckTimer: NodeJS.Timeout | null = null;
let serverStartTime = Date.now();
let httpServer: http.Server | null = null;

// Keep track of the process ID for cleanup
const processId = process.pid;
safeErrorLog(`MCP Think Tank server started with PID: ${processId}`);

// Create PID file to track running instances
const pidFilePath = path.join(os.homedir(), '.mcp-think-tank', `server-${processId}.pid`);
try {
  createDirectory(path.dirname(pidFilePath));
  fs.writeFileSync(pidFilePath, `${processId}`);
  safeErrorLog(`Created PID file: ${pidFilePath}`);
} catch (error) {
  safeErrorLog(`Failed to create PID file: ${error}`);
}

// Auto shutdown after 30 minutes of inactivity by default, can be overridden with AUTO_SHUTDOWN_MS
const autoShutdownMs = process.env.AUTO_SHUTDOWN_MS ? 
                      parseInt(process.env.AUTO_SHUTDOWN_MS, 10) : 
                      process.env.AUTO_SHUTDOWN === 'true' ? 30 * 60 * 1000 : 30 * 60 * 1000; // Default: 30 minutes

// Reset inactivity timer
function resetInactivityTimer() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  
  if (autoShutdownMs > 0) {
    inactivityTimer = setTimeout(() => {
      safeErrorLog(`Server inactive for ${autoShutdownMs}ms, shutting down...`);
      gracefulShutdown();
    }, autoShutdownMs);
  }
}

// Periodically check for active connections
function startConnectionCheck() {
  // Clear existing timer if any
  if (connectionCheckTimer) {
    clearInterval(connectionCheckTimer);
    connectionCheckTimer = null;
  }
  
  // Provide a longer initial grace period (5 minutes) for startup
  const initialStartupGracePeriod = 5 * 60 * 1000; // 5 minutes
  
  // Use longer interval for tool scan mode to reduce CPU usage
  const checkInterval = isToolScanMode ? 120000 : 60000; // 2 minutes in tool scan mode, 1 minute otherwise
  
  // Check every 60 seconds for active connections
  connectionCheckTimer = setInterval(() => {
    // Check if server has been running for too long with no activity
    const runningTime = Date.now() - serverStartTime;
    
    // Skip detailed logging in tool scan mode to reduce noise
    if (!isToolScanMode) {
      safeErrorLog(`Connection check: ${connectionCount} active connections, running for ${Math.floor(runningTime/1000)}s`);
    }
    
    // Skip checks entirely during tool scanning
    if (isToolScanMode) {
      safeErrorLog(`Running in tool scan mode - extending grace period`);
      return;
    }
    
    // Give more time during initial startup before enforcing connection checks
    if (runningTime < initialStartupGracePeriod) {
      safeErrorLog(`Server in startup grace period (${Math.floor(initialStartupGracePeriod/1000)}s), not checking connections yet`);
      return;
    }
    
    // Force check for abandoned processes, but only after the grace period
    if (runningTime > initialStartupGracePeriod && connectionCount <= 0) {
      safeErrorLog('No active connections detected after grace period, initiating auto-shutdown');
      gracefulShutdown();
      return;
    }
    
    // Reset inactivity timer regardless to prevent timeout
    resetInactivityTimer();
  }, checkInterval);
}

// Graceful shutdown function
function gracefulShutdown() {
  safeErrorLog('Shutting down MCP Think Tank server...');
  
  // Clear any pending timeouts in task storage
  if (taskStorage && typeof taskStorage.clearAllTimeouts === 'function') {
    taskStorage.clearAllTimeouts();
  }
  
  // Clear inactivity timer if exists
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  
  // Clear connection check timer if exists
  if (connectionCheckTimer) {
    clearInterval(connectionCheckTimer);
    connectionCheckTimer = null;
  }
  
  // Remove PID file
  try {
    fs.unlinkSync(pidFilePath);
    safeErrorLog(`Removed PID file: ${pidFilePath}`);
  } catch (error) {
    safeErrorLog(`Failed to remove PID file: ${error}`);
  }
  
  // Gracefully stop the server (if needed)
  try {
    // Ensure all pending operations are completed
    // FastMCP doesn't currently have a stop method, but we can add safe cleanup here
    
    // Save any pending tasks
    taskStorage.saveImmediately();
    
    safeErrorLog('Server shut down successfully');
    process.exit(0);
  } catch (err) {
    safeErrorLog(`Error during shutdown: ${err}`);
    process.exit(1);
  }
}

// Set up signal handlers for clean shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Add event handler for client disconnect
process.on('disconnect', () => {
  safeErrorLog('Parent process disconnected, shutting down...');
  gracefulShutdown();
});

// Function to capture HTTP server reference and setup connection tracking
function setupConnectionTracking(httpServer: http.Server) {
  safeErrorLog('Setting up HTTP connection tracking');
  
  // Track when a new connection is established
  httpServer.on('connection', (socket) => {
    connectionCount++;
    safeErrorLog(`New connection established. Active connections: ${connectionCount}`);
    
    // Set up event listener for when the connection closes
    socket.on('close', () => {
      connectionCount = Math.max(0, connectionCount - 1);
      safeErrorLog(`Connection closed. Active connections: ${connectionCount}`);
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
      safeErrorLog(`HTTP request received: ${req.method} ${req.url}`);
    } else {
      // For tool list requests, set higher priority to ensure fast response
      process.nextTick(() => {
        // This helps ensure tool list requests are handled quickly
        safeErrorLog(`Tool list request received, prioritizing`);
      });
    }
    
    // Consider the server active as long as we're receiving requests
    resetInactivityTimer();
    
    // Track response completion to update connection status if needed
    res.on('finish', () => {
      if (!isToolListRequest) {
        safeErrorLog('HTTP response finished');
      }
    });
  });
  
  return httpServer;
}

// Start the server with error handling
try {
  // Determine transport type from environment variable, defaulting to streamable-http
  const transportType = process.env.MCP_TRANSPORT || "streamable-http";

  if (transportType === "stdio") {
    // Only use STDIO if explicitly requested
    safeErrorLog(`Warning: STDIO transport is deprecated and will be removed in a future version. Please switch to streamable-http transport.`);
    server.start();
    safeErrorLog(`MCP Think Tank server v${config.version} started successfully with STDIO transport`);
  } else if (transportType === "http" || transportType === "streamable-http") {
    // Handle HTTP/streamable-HTTP transport
    // Ensure the endpoint path starts with a slash
    let endpointPath = process.env.MCP_PATH || "/mcp";
    if (!endpointPath.startsWith('/')) {
      endpointPath = `/${endpointPath}`;
    }
    
    // Set up port and host
    const port = parseInt(process.env.MCP_PORT || "8000", 10);
    const host = process.env.MCP_HOST || "127.0.0.1";
    
    // Add keep-alive settings for better connection stability
    const serverOptions: ServerOptions = isToolScanMode 
      ? { keepAliveTimeout: _TOOL_SCAN_TIMEOUT } 
      : {};
    
    // Use a compatible configuration for FastMCP 1.27.6
    const serverConfig: any = {
      transportType: "sse", // FastMCP TypeScript type expects "sse" but we use it for streamable-http
      sse: {
        port,
        endpoint: endpointPath as `/${string}`,
        host, // FastMCP 1.27.6 supports host in the configuration
        createServer: (requestListener: http.RequestListener) => {
          // Create HTTP server and capture reference for connection tracking
          httpServer = http.createServer(serverOptions, requestListener);
          return setupConnectionTracking(httpServer);
        }
      }
    };
    
    server.start(serverConfig);
    
    safeErrorLog(`MCP Think Tank server v${config.version} started successfully with streamable-HTTP transport at ${host}:${port}${endpointPath}`);
  } else {
    safeErrorLog(`Unsupported transport type: ${transportType}. Defaulting to streamable-HTTP transport.`);
    // Fall back to streamable-HTTP
    const port = parseInt(process.env.MCP_PORT || "8000", 10);
    const endpointPath = process.env.MCP_PATH || "/mcp";
    const host = process.env.MCP_HOST || "127.0.0.1";

    // Add keep-alive settings for better connection stability
    const serverOptions: ServerOptions = isToolScanMode 
      ? { keepAliveTimeout: _TOOL_SCAN_TIMEOUT } 
      : {};

    // Use a compatible configuration for FastMCP 1.27.6
    const serverConfig: any = {
      transportType: "sse", // FastMCP TypeScript type expects "sse" but we use it for streamable-http
      sse: {
        port,
        endpoint: endpointPath.startsWith('/') ? endpointPath as `/${string}` : `/${endpointPath}` as `/${string}`,
        host, // FastMCP 1.27.6 supports host in the configuration
        createServer: (requestListener: http.RequestListener) => {
          // Create HTTP server and capture reference for connection tracking
          httpServer = http.createServer(serverOptions, requestListener);
          return setupConnectionTracking(httpServer);
        }
      }
    };
    
    server.start(serverConfig);
    
    safeErrorLog(`MCP Think Tank server v${config.version} started successfully with streamable-HTTP transport at ${host}:${port}${endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`}`);
  }
  
  resetInactivityTimer(); // Start inactivity timer
  startConnectionCheck(); // Start connection monitoring
} catch (e) {
  safeErrorLog(`Startup failed: ${e}`);
  process.exit(1);
}

// Error handling
process.on('uncaughtException', (error: Error) => {
  safeErrorLog(`Uncaught exception: ${error.stack || error.message}`);
  // For severe errors, consider shutting down to prevent zombie processes
  if (error.message.includes('EADDRINUSE') || error.message.includes('port already in use')) {
    safeErrorLog('Critical error detected, shutting down server...');
    gracefulShutdown();
  }
});

process.on('unhandledRejection', (reason: unknown) => {
  safeErrorLog(`Unhandled rejection: ${reason instanceof Error ? reason.stack || reason.message : reason}`);
});

// Create a cleanup script to kill orphaned processes
const cleanupScript = `
#!/bin/bash

# Find and kill orphaned MCP Think Tank processes
echo "Checking for orphaned MCP Think Tank processes..."
pid_files=$(find ${os.homedir()}/.mcp-think-tank -name "server-*.pid" 2>/dev/null)

if [ -z "$pid_files" ]; then
  echo "No PID files found."
  exit 0
fi

for pid_file in $pid_files; do
  pid=$(cat $pid_file)
  if ps -p $pid > /dev/null; then
    # Check if process is older than 1 hour
    process_start=$(ps -o lstart= -p $pid)
    process_time=$(date -d "$process_start" +%s)
    current_time=$(date +%s)
    elapsed_time=$((current_time - process_time))
    
    if [ $elapsed_time -gt 3600 ]; then
      echo "Killing orphaned process $pid (running for over 1 hour)"
      kill -9 $pid
      rm $pid_file
    else
      echo "Process $pid is still active and not orphaned"
    fi
  else
    echo "Removing stale PID file for non-existent process $pid"
    rm $pid_file
  fi
done
`;

// Write cleanup script
const cleanupScriptPath = path.join(os.homedir(), '.mcp-think-tank', 'cleanup.sh');
try {
  fs.writeFileSync(cleanupScriptPath, cleanupScript, { mode: 0o755 });
  safeErrorLog(`Created cleanup script: ${cleanupScriptPath}`);
} catch (error) {
  safeErrorLog(`Failed to create cleanup script: ${error}`);
}