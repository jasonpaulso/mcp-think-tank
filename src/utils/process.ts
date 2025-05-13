import path from 'path';
import fs from 'fs';
import * as os from 'os';
import { createLogger } from './logger.js';
import { createDirectory } from './fs.js';

const logger = createLogger('process');

/**
 * Process info interface
 */
export interface ProcessInfo {
  pid: number;
  startTime: number;
  pidFilePath: string;
}

/**
 * Initialize process tracking
 * 
 * @returns Process information
 */
export function initializeProcess(): ProcessInfo {
  const processInfo: ProcessInfo = {
    pid: process.pid,
    startTime: Date.now(),
    pidFilePath: path.join(os.homedir(), '.mcp-think-tank', `server-${process.pid}.pid`)
  };
  
  // Create PID file
  try {
    createDirectory(path.dirname(processInfo.pidFilePath));
    fs.writeFileSync(processInfo.pidFilePath, `${processInfo.pid}`);
    logger.info(`Server process started with PID: ${processInfo.pid}`);
    logger.debug(`Created PID file: ${processInfo.pidFilePath}`);
  } catch (error) {
    logger.error(`Failed to create PID file: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return processInfo;
}

/**
 * Clean up process resources
 * 
 * @param processInfo Process information
 */
export function cleanupProcess(processInfo: ProcessInfo): void {
  // Remove PID file
  try {
    if (fs.existsSync(processInfo.pidFilePath)) {
      fs.unlinkSync(processInfo.pidFilePath);
      logger.debug(`Removed PID file: ${processInfo.pidFilePath}`);
    }
  } catch (error) {
    logger.error(`Failed to remove PID file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create cleanup script for orphaned processes
 */
export function createCleanupScript(): void {
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
    logger.info(`Created cleanup script: ${cleanupScriptPath}`);
  } catch (error) {
    logger.error(`Failed to create cleanup script: ${error instanceof Error ? error.message : String(error)}`);
  }
} 