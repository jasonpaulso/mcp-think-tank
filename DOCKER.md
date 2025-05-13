# Running MCP Think Tank in Docker

This guide explains how to run MCP Think Tank in a Docker container and connect to it from an external MCP client.

## Building and Running the Docker Container

### Using docker-compose (recommended)

The easiest way to run MCP Think Tank in Docker is to use docker-compose:

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Using Docker Directly

You can also build and run the Docker container manually:

```bash
# Build the Docker image
docker build -t mcp-think-tank .

# Run the container
docker run -p 8000:8000 --name mcp-think-tank mcp-think-tank
```

## Connecting from an MCP Client

To connect to the MCP Think Tank server from an external client, you'll need to:

1. Ensure your client supports the `streamable-http` transport
2. Configure your client to connect to the Docker container's IP and port

### Testing Your Connection

This package includes a test script to verify that your Docker container is working correctly:

```bash
# After starting the Docker container
npm run docker:test

# You can also specify a custom host, port, and path
npm run docker:test -- 192.168.1.100 8000 /mcp
```

The test script will connect to the server, list the available tools, and make a simple test call to verify that everything is working properly.

### Example Connection Configuration

```javascript
// Example FastMCP client configuration
const fastmcp = new FastMCP({
  transportType: 'streamable-http',
  streamableHttp: {
    endpoint: 'http://localhost:8000/mcp',
    // If running on a different machine, replace localhost with the host IP
  }
});

// Now you can use the MCP Think Tank tools through the fastmcp client
const result = await fastmcp.invoke('think', { structuredReasoning: 'Your reasoning here' });
```

### Using with Cursor or Claude

For Cursor or Claude @Web, you can create a configuration like this:

```json
{
  "mcpServers": {
    "think-tank": {
      "type": "streamable-http",
      "endpoint": "http://server-ip:8000/mcp",
      "timeout": 300000
    }
  }
}
```

An example configuration is provided in `examples/client-config.json`.

## Environment Variables

You can customize the MCP Think Tank server by setting environment variables in the docker-compose.yml file:

- `MCP_PORT`: The port the server will listen on (default: 8000)
- `MCP_PATH`: The API endpoint path (default: /mcp)
- `MCP_TRANSPORT`: The transport protocol (default: streamable-http)
- `TOOL_SCAN_TIMEOUT`: Timeout for tool scanning in milliseconds (default: 30000)

## Persistent Memory Storage

To enable persistent memory storage between container restarts, uncomment the volumes section in docker-compose.yml:

```yaml
volumes:
  - ./memory:/app/memory
```

This will mount a local `memory` directory to the container's memory storage location.