// tests/integration-test.js
import { spawn, ChildProcess } from 'child_process';
import { expect, describe, test, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';

/**
 * Integration test for MCP Think Tank server
 * This uses FastMCP's dev mode to test the server's functionality
 * without requiring installation to Cursor or Claude Desktop
 */

// Define response type
interface MCPResponse {
  id: string;
  type: string;
  result: {
    status: string;
    [key: string]: any;
  };
}

// Helper function to run the MCP server in dev mode
function runMCPServer(): ChildProcess {
  const serverProcess = spawn('node', ['--loader', 'ts-node/esm', 'src/server.ts'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Handle server output for debugging
  serverProcess.stdout.on('data', (data: Buffer) => {
    console.log(`[Server stdout]: ${data}`);
  });
  
  serverProcess.stderr.on('data', (data: Buffer) => {
    console.log(`[Server stderr]: ${data}`);
  });
  
  return serverProcess;
}

// Helper function to simulate an MCP client request
async function sendMCPRequest(serverProcess: ChildProcess, toolName: string, params: Record<string, any> = {}): Promise<MCPResponse> {
  return new Promise((resolve, reject) => {
    if (!serverProcess.stdout || !serverProcess.stdin) {
      reject(new Error('Server process streams are not available'));
      return;
    }
    
    // Format the request according to MCP protocol
    const request = {
      type: 'request',
      id: 'test-request-' + Date.now(),
      operation: {
        type: 'callTool',
        tool: toolName,
        parameters: params
      }
    };
    
    let responseData = '';
    
    // Listen for the response
    serverProcess.stdout.on('data', (data: Buffer) => {
      responseData += data.toString();
      
      try {
        // Try to parse the response
        const responseLines = responseData.trim().split('\n');
        for (const line of responseLines) {
          if (line.trim()) {
            const response = JSON.parse(line) as MCPResponse;
            if (response.id === request.id && response.type === 'response') {
              resolve(response);
            }
          }
        }
      } catch (error) {
        // Not a complete JSON response yet, continue collecting data
      }
    });
    
    // Send the request to the server
    serverProcess.stdin.write(JSON.stringify(request) + '\n');
    
    // Set a timeout to prevent hanging tests
    setTimeout(() => {
      reject(new Error('MCP request timed out'));
    }, 5000);
  });
}

// Tests for the MCP server
describe('MCP Think Tank Server Integration Tests', () => {
  let serverProcess: ChildProcess | null = null;
  
  beforeAll(() => {
    // Start the MCP server
    serverProcess = runMCPServer();
    
    // Give the server some time to initialize
    return new Promise(resolve => setTimeout(resolve, 1000));
  });
  
  afterAll(() => {
    // Clean up the server process
    if (serverProcess) {
      serverProcess.kill();
    }
  });
  
  test('Server responds to think tool', async () => {
    if (!serverProcess) throw new Error('Server process not started');
    
    const response = await sendMCPRequest(serverProcess, 'think', {
      structuredReasoning: 'Test reasoning'
    });
    
    expect(response).toBeDefined();
    expect(response.result).toBeDefined();
    expect(response.result.status).toBe('success');
  });
  
  test('Server responds to list_tasks tool', async () => {
    if (!serverProcess) throw new Error('Server process not started');
    
    const response = await sendMCPRequest(serverProcess, 'list_tasks', {});
    
    expect(response).toBeDefined();
    expect(response.result).toBeDefined();
    expect(response.result.status).toBe('success');
  });
  
  // Add more tests for other tools as needed
}); 