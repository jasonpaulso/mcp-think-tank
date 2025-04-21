# Nodejs_NVM_TypeScript_IDE_Setup_Guide.md

# Node.js, NVM, TypeScript, and IDE Setup Guide

![](https://img.shields.io/badge/Node.js-14.x%20%7C%2016.x-green.svg)

![](https://img.shields.io/badge/NVM-0.39.1-blue.svg)

![](https://img.shields.io/badge/TypeScript-4.x-blue.svg)

![](https://img.shields.io/badge/VS%20Code-1.60%2B-blue.svg)

![](https://img.shields.io/badge/Cursor-Supported-lightgrey.svg)

![](https://img.shields.io/badge/Last%20Update-September%202024-orange.svg)

![](https://img.shields.io/badge/license-MIT-green.svg)

This guide provides step-by-step instructions for setting up Node.js, NVM (Node Version Manager), and TypeScript on macOS, along with configuring your development environment using either Visual Studio Code (VS Code) or Cursor. This setup allows you to manage multiple Node.js versions, develop with TypeScript, and utilize advanced debugging tools.

## Table of Contents

1. [Prerequisites](about:blank#prerequisites)
2. [Install NVM (Node Version Manager)](about:blank#install-nvm-node-version-manager)
3. [Configuring Zsh with Auto-Completion](about:blank#configuring-zsh-with-auto-completion)
4. [Install Node.js using NVM](about:blank#install-nodejs-using-nvm)
5. [Install TypeScript](about:blank#install-typescript)
6. [Configure Your IDE (VS Code or Cursor)](about:blank#configure-your-ide-vs-code-or-cursor)
    - [Install Extensions](about:blank#install-extensions)
    - [Set Up Debugger](about:blank#set-up-debugger)
7. [Connecting the Tools](about:blank#connecting-the-tools)
8. [How to Use the Setup](about:blank#how-to-use-the-setup)
9. [Troubleshooting](about:blank#troubleshooting)
10. [Conclusion](about:blank#conclusion)
11. [Download](about:blank#download)

## Prerequisites

- A macOS system with administrative privileges
- Basic knowledge of the terminal
- Homebrew already installed
- Visual Studio Code (VS Code) or Cursor already installed

## Install NVM (Node Version Manager)

NVM allows you to manage multiple Node.js versions on a single system, making it easy to switch between different projects that require different Node.js versions.

1. Install NVM using Homebrew:
    
    ```bash
    brew install nvm
    ```
    
2. Create a directory for NVM in your home folder:
    
    ```bash
    mkdir ~/.nvm
    ```
    
3. Add NVM to your shell profile (`~/.zshrc` since all new macOS systems use zsh by default):
    
    ```bash
    export NVM_DIR="$HOME/.nvm"[ -s "$(brew --prefix)/opt/nvm/nvm.sh" ] && \. "$(brew --prefix)/opt/nvm/nvm.sh"  # This loads nvm[ -s "$(brew --prefix)/opt/nvm/etc/bash_completion.d/nvm" ] && \. "$(brew --prefix)/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion
    ```
    
    Let’s break down what each line does:
    
    - `export NVM_DIR="$HOME/.nvm"`: Sets the NVM directory to a folder in your home directory.
    - The next two lines use conditional statements to check if certain files exist and source them if they do:
        - `nvm.sh`: This is the main NVM script that provides the `nvm` command and its functionality.
        - `bash_completion.d/nvm`: This script enables command-line completion for NVM, making it easier to use.
4. Reload your shell profile to apply the changes:
    
    ```bash
    source ~/.zshrc
    ```
    

## Configuring Zsh with Auto-Completion

Zsh, the default shell for new macOS systems, supports advanced features like auto-completion. We’ll enhance its functionality for use with NVM.

1. **Enable general Zsh auto-completion**:
If not already enabled, add the following to your `~/.zshrc`:
    
    ```bash
    # Enable Zsh auto-completionautoload -U compinit
    compinit
    ```
    
    This enables Zsh’s powerful auto-completion system, which NVM will use.
    
2. **Verify NVM auto-completion**:
The NVM bash completion should already be loaded from the previous step. You can verify this by trying to auto-complete an NVM command:
    
    ```bash
    nvm [TAB]
    ```
    
    If auto-completion is working, you should see a list of available NVM commands.
    
3. **Reload your shell profile** to apply these changes:
    
    ```bash
    source ~/.zshrc
    ```
    
4. **Verify NVM installation**:
    
    ```bash
    nvm --version
    ```
    
    At this point, NVM should be fully integrated with your Zsh environment, allowing for smooth version management and command auto-completion.
    

## Install Node.js using NVM

Once NVM is set up, you can install Node.js:

1. Install the latest LTS version of Node.js using NVM:
    
    ```bash
    nvm install --lts
    ```
    
2. Verify the Node.js and npm installation:
    
    ```bash
    node --versionnpm --version
    ```
    
3. To switch between different Node.js versions, use:
    
    ```bash
    nvm install <version>nvm use <version>
    ```
    
    Replace `<version>` with the desired Node.js version.
    

## Install TypeScript

TypeScript is a superset of JavaScript that adds static types, making it easier to write and maintain code in large projects.

1. Install TypeScript globally using npm:
    
    ```bash
    npm install -g typescript
    ```
    
2. Verify the TypeScript installation:
    
    ```bash
    tsc --version
    ```
    

## Configure Your IDE (VS Code or Cursor)

### Install Extensions

To enhance your development experience with Node.js and TypeScript, consider installing the following extensions:

1. Open your IDE and go to the Extensions view:
    - **VS Code**: Use `Cmd+Shift+X` on macOS.
    - **Cursor**: Same on Cursor (Use `Cmd+Shift+X` on macOS.)
2. Search for and install these recommended extensions:
    - **ESLint**: Lints JavaScript and TypeScript code, helping catch errors and enforce consistent code style.
    - **Prettier - Code Formatter**: Automatically formats code to improve readability.
    - **Debugger for Node.js**: Provides debugging capabilities for Node.js applications.
    - **TypeScript Hero** or **TypeScript Extension Pack**: Enhances TypeScript support with features like auto-imports and navigation.
    - **npm**: Simplifies running npm scripts and managing packages within the IDE.

### Linting and Formatting Options

You have several options for linting and formatting your code:

1. **ESLint + Prettier**:
    - ESLint identifies patterns and potential errors in your code.
    - Prettier ensures consistent code formatting.
    - They can work together, with ESLint focusing on code quality and Prettier handling formatting.
2. **OXC (Oxidation Compiler)**:
    - A newer alternative that combines linting, formatting, and compilation for JavaScript and TypeScript.

### Pros and Cons of OXC

Pros:
- All-in-one solution for linting, formatting, and compiling
- Potentially faster than separate tools
- Built with Rust, offering performance benefits

Cons:
- Newer tool, may have less community support
- Might not have as many customization options as ESLint + Prettier
- Could be overkill for smaller projects

### Choosing the Right Tools

- For established projects or those requiring fine-grained control, ESLint + Prettier might be the better choice.
- For new projects or those prioritizing performance, OXC could be an excellent option to explore.

To use OXC, you’ll need to install it separately and may need to configure your IDE to use it instead of ESLint and Prettier. Check the OXC documentation for the most up-to-date installation and configuration instructions.

Remember, the choice between these tools often comes down to project requirements and team preferences. It’s worth experimenting with both setups to see which works best for your workflow.

### Set Up Debugger

To debug Node.js applications, configure the debugger in your chosen IDE:

1. Open your project folder in the IDE.
2. **For VS Code or Cursor**:
    - Go to the “Run and Debug” view.
    - Create or edit the `launch.json` file inside the `.vscode` folder (VS Code) or the appropriate configuration folder for Cursor. Use the following configuration:

```json
{  "version": "0.2.0",  "configurations": [    {      "type": "node",      "request": "launch",      "name": "Launch Program",      "program": "${workspaceFolder}/src/index.ts",      "preLaunchTask": "tsc: build - tsconfig.json",      "outFiles": ["${workspaceFolder}/dist/**/*.js"],      "sourceMaps": true,      "restart": true,      "internalConsoleOptions": "openOnSessionStart"    }  ]}
```

**Explanation:**

- **`program`**: The entry point file for your application (adjust this path based on your project’s structure).
- **`preLaunchTask`**: Ensures TypeScript is compiled before starting the debugging session.
- **`outFiles`**: Specifies the location of the compiled JavaScript files for the debugger to use.
- **`sourceMaps`**: Enables debugging of TypeScript files by mapping the compiled JavaScript back to the original TypeScript source.
- **`restart`**: Automatically restarts the program if it crashes or stops.
- **`internalConsoleOptions`**: Opens the internal console on session start.
1. Ensure you have a `tsconfig.json` file in your project root to configure TypeScript compilation. If not, generate one using:
    
    ```bash
    tsc --init
    ```
    

## Connecting the Tools

- **NVM** manages Node.js versions, allowing you to easily switch between versions for different projects.
- **Node.js** provides the JavaScript runtime for executing code outside of a browser.
- **TypeScript** is installed globally and provides enhanced features for JavaScript development, including static typing.
- **VS Code or Cursor** is the IDE where you write, debug, and manage your TypeScript and JavaScript code. Extensions and debugger configurations enhance this experience, and debugging tools provide in-depth development support.

## How to Use the Setup

1. **Open a Terminal** and navigate to your project directory:
    
    ```bash
    cd path/to/your/project
    ```
    
2. **Switch Node.js versions** (if necessary) using NVM:
    
    ```bash
    nvm use <version>
    ```
    
3. **Initialize a new Node.js project** (if creating a new one):
    
    ```bash
    npm init -y
    ```
    
4. **Install project dependencies**:
    
    ```bash
    npm install <package-name>
    ```
    
5. **Compile TypeScript code** using `tsc`:
    
    ```bash
    tsc
    ```
    
6. **Open the project in your IDE** (VS Code or Cursor):
    
    ```bash
    code .  # For VS Code# Or simply open Cursor and navigate to your project
    ```
    
7. **Run and Debug**: Use the “Run and Debug” pane in VS Code or the equivalent feature in Cursor to start debugging your application with the configured settings.

## Troubleshooting

- **NVM is not recognized**: Make sure you have added NVM to your shell profile correctly and reloaded it.
- **Permission errors**: Use `sudo` cautiously. You should not need `sudo` with NVM installations.
- **VS Code or Cursor does not recognize `tsc`**: Ensure TypeScript is installed globally via npm. Restart your IDE or reload the window if necessary.
- **Debugger not hitting breakpoints**: Ensure `sourceMaps` are enabled in your `launch.json` (VS Code) or equivalent settings in Cursor, and that your TypeScript is compiling correctly with source maps.

## Conclusion

You have successfully set up Node.js, NVM, TypeScript, and configured your development environment using either Visual Studio Code or Cursor on macOS. This setup enables efficient management of Node.js versions, robust TypeScript development support, and provides a powerful debugging environment.

Happy coding!