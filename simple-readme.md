# MCP Think Tool (Simplified)

This is a simplified version of the MCP Think Server that provides only the core "think" tool without the memory/knowledge graph functionality. This version is designed to work reliably without any external dependencies or API keys.

## What is the "think" tool?

The "think" tool provides a dedicated space for Claude to engage in structured reasoning during complex tasks. It helps Claude validate prior steps, analyze information, and make informed decisions by creating a dedicated space for thinking.

## Usage

1. **Run the server**:

   ```bash
   ./simple-think.sh
   ```

2. **Configure Claude Desktop**:

   Add to your `claude_desktop_config.json`:

   ```json
   {
     "mcpServers": {
       "think-tool": {
         "command": "/path/to/simple-think.sh"
       }
     }
   }
   ```

3. **Configure Cursor**:

   In Cursor's MCP Server settings:

   ```json
   {
     "mcpServers": {
       "think-tool": {
         "command": "/path/to/simple-think.sh",
         "type": "stdio"
       }
     }
   }
   ```

## How to use the think tool

When working with Claude, you can ask it to use the think tool for structured reasoning:

```
I need to analyze this complex algorithm problem. Could you use the think tool to break it down?
```

Claude will then call the think tool and provide structured reasoning with:

1. Problem definition
2. Relevant facts/context
3. Analysis steps
4. Conclusion/decision

## Customizing

You can modify `src/server-simple.ts` to adjust the behavior of the think tool or add new tools.

## Troubleshooting

If you encounter issues:

1. Make sure you have Node.js v16+ installed
2. Check that the paths in your configuration files are correct
3. Run the server manually to check for any errors
4. Verify that required dependencies are installed (`npm install fastmcp zod`) 