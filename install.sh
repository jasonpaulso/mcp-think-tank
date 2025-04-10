#!/bin/bash
# Simple installation script for Think Tool MCP Server

echo "Installing Think Tool MCP Server..."

# Create directory for the server
INSTALL_DIR="$HOME/.think-mcp-server"
mkdir -p "$INSTALL_DIR"

# Clone the repository
git clone https://github.com/flight505/think-mcp-server.git "$INSTALL_DIR/repo" 2>/dev/null || 
  (cd "$INSTALL_DIR/repo" && git pull)

# Install dependencies and build
cd "$INSTALL_DIR/repo"
npm install
npm run build

# Create executable script
EXEC_PATH="$HOME/.local/bin/think-mcp-server"
mkdir -p "$(dirname "$EXEC_PATH")"

cat > "$EXEC_PATH" << 'EOF'
#!/bin/bash
cd "$HOME/.think-mcp-server/repo"
node dist/server.js
EOF

chmod +x "$EXEC_PATH"

# Add to PATH if needed
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc" 2>/dev/null || true
  echo "Added ~/.local/bin to PATH in .bashrc and .zshrc"
  echo "Please restart your terminal or run 'source ~/.bashrc' to update your PATH"
fi

echo ""
echo "Installation complete!"
echo ""
echo "Usage:"
echo "  Run 'think-mcp-server' to start the server"
echo ""
echo "Claude Desktop Configuration:"
echo "  Edit: ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)"
echo "  Edit: %APPDATA%\\Claude\\claude_desktop_config.json (Windows)"
echo ""
echo "Add the following to your config:"
echo '{
  "mcpServers": {
    "think-tool": {
      "command": "think-mcp-server"
    }
  }
}'
echo ""
echo "Cursor Configuration:"
echo "  Settings > MCP Servers > Add New Server"
echo "  Name: think-tool"
echo "  Command: think-mcp-server"
echo "" 