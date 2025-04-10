@echo off
echo Installing Think Tool MCP Server...

:: Create installation directory
set INSTALL_DIR=%USERPROFILE%\.think-mcp-server
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Clone or update the repository
if not exist "%INSTALL_DIR%\repo\.git" (
  echo Cloning repository...
  git clone https://github.com/flight505/think-mcp-server.git "%INSTALL_DIR%\repo"
) else (
  echo Updating repository...
  cd "%INSTALL_DIR%\repo"
  git pull
)

:: Install dependencies and build
cd "%INSTALL_DIR%\repo"
call npm install
call npm run build

:: Create executable batch file
set EXEC_DIR=%USERPROFILE%\AppData\Local\think-mcp-server\bin
if not exist "%EXEC_DIR%" mkdir "%EXEC_DIR%"

echo @echo off > "%EXEC_DIR%\think-mcp-server.bat"
echo cd /d "%INSTALL_DIR%\repo" >> "%EXEC_DIR%\think-mcp-server.bat"
echo node dist/server.js >> "%EXEC_DIR%\think-mcp-server.bat"

:: Add to PATH
setx PATH "%PATH%;%EXEC_DIR%"

echo.
echo Installation complete!
echo.
echo Usage:
echo   Run 'think-mcp-server' to start the server
echo.
echo Claude Desktop Configuration:
echo   Edit: %%APPDATA%%\Claude\claude_desktop_config.json
echo.
echo Add the following to your config:
echo {
echo   "mcpServers": {
echo     "think-tool": {
echo       "command": "think-mcp-server"
echo     }
echo   }
echo }
echo.
echo Cursor Configuration:
echo   Settings ^> MCP Servers ^> Add New Server
echo   Name: think-tool
echo   Command: think-mcp-server
echo.

pause 