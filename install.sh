#!/bin/bash
# Simple installation script for Think Tank MCP Server

echo "Installing Think Tank MCP Server with optimized settings..."

# Create directory for the server
INSTALL_DIR="$HOME/.mcp-think-tank"
mkdir -p "$INSTALL_DIR"

# Clone or update the repository
if [ ! -d "$INSTALL_DIR/repo/.git" ]; then
  echo "Cloning repository..."
  git clone https://github.com/flight505/mcp-think-tank.git "$INSTALL_DIR/repo"
else
  echo "Updating repository..."
  cd "$INSTALL_DIR/repo"
  git pull
fi

# Install dependencies and build
cd "$INSTALL_DIR/repo"
npm install
npm run build

# Create bin directory for executable
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

# Create executable shell script
cat > "$BIN_DIR/mcp-think-tank" << EOF
#!/bin/bash
cd "$INSTALL_DIR/repo"
# Use extended timeout (5 minutes default, can be overridden with REQUEST_TIMEOUT env var)
REQUEST_TIMEOUT=\${REQUEST_TIMEOUT:-300}
node dist/server.js --request-timeout="\$REQUEST_TIMEOUT" "\$@"
EOF

# Make executable
chmod +x "$BIN_DIR/mcp-think-tank"

# Check if BIN_DIR is in PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  echo "Adding $BIN_DIR to PATH in your shell profile"
  
  # Determine which shell profile to use
  SHELL_PROFILE="$HOME/.bash_profile"
  if [ -f "$HOME/.zshrc" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
  elif [ -f "$HOME/.bashrc" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
  fi

  # Add to PATH
  echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$SHELL_PROFILE"
  echo "Please restart your terminal or run: source $SHELL_PROFILE"
fi

echo ""
echo "Installation complete!"
echo ""
echo "Usage:"
echo "  Run 'mcp-think-tank' to start the server"
echo "  You can specify request timeout: REQUEST_TIMEOUT=600 mcp-think-tank"
echo ""
echo "Claude Desktop Configuration:"
echo "  Edit: ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)"
echo "  Edit: %APPDATA%\\Claude\\claude_desktop_config.json (Windows)"
echo ""
echo "Add the following to your config:"
echo '{
  "mcpServers": {
    "think-tool": {
      "command": "mcp-think-tank",
      "env": {
        "REQUEST_TIMEOUT": "300"
      }
    }
  }
}'
echo ""
echo "Cursor Configuration:"
echo "  Settings > MCP Servers > Add New Server"
echo "  Name: think-tool"
echo "  Command: mcp-think-tank"
echo "" 