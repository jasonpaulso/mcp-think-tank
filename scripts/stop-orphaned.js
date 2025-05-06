#!/usr/bin/env node

/* eslint-disable */
/**
 * This utility script finds and stops any orphaned MCP Think Tank processes.
 * Can be run directly or via npm script.
 */

const { execSync } = require('child_process');
const os = require('os');

// Different commands for different platforms
const commands = {
  win32: {
    find: 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH',
    parse: (output) => {
      const lines = output.split('\n');
      const processes = [];
      for (const line of lines) {
        if (line.includes('mcp-think-tank')) {
          const match = line.match(/"([^"]+)"/g);
          if (match && match.length > 1) {
            const pid = match[1].replace(/"/g, '');
            processes.push(parseInt(pid, 10));
          }
        }
      }
      return processes;
    },
    kill: (pid) => `taskkill /F /PID ${pid}`
  },
  darwin: {
    find: 'ps -ef | grep "mcp-think-tank" | grep -v grep',
    parse: (output) => {
      const lines = output.split('\n');
      const processes = [];
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 1) {
          processes.push(parseInt(parts[1], 10));
        }
      }
      return processes;
    },
    kill: (pid) => `kill -9 ${pid}`
  },
  linux: {
    find: 'ps -ef | grep "mcp-think-tank" | grep -v grep',
    parse: (output) => {
      const lines = output.split('\n');
      const processes = [];
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 1) {
          processes.push(parseInt(parts[1], 10));
        }
      }
      return processes;
    },
    kill: (pid) => `kill -9 ${pid}`
  }
};

const platform = os.platform();
const command = commands[platform] || commands.linux;

try {
  console.log('Searching for orphaned MCP Think Tank processes...');
  
  // Find processes
  let output;
  try {
    output = execSync(command.find, { encoding: 'utf8' });
  } catch (e) {
    // Command might fail if no processes found
    output = '';
  }
  
  // Parse PIDs
  const pids = command.parse(output);
  
  if (pids.length === 0) {
    console.log('No orphaned MCP Think Tank processes found.');
    process.exit(0);
  }
  
  console.log(`Found ${pids.length} orphaned processes. Stopping...`);
  
  // Kill each process
  for (const pid of pids) {
    try {
      console.log(`Stopping process ${pid}...`);
      execSync(command.kill(pid));
      console.log(`Process ${pid} stopped successfully.`);
    } catch (e) {
      console.error(`Failed to stop process ${pid}: ${e.message}`);
    }
  }
  
  console.log('Operation completed.');
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exit(1);
}