#!/bin/bash

# Compile the simple server
npx tsc src/server-simple.ts --esModuleInterop --module ESNext --target ESNext --moduleResolution node --outDir dist

# Run the server
node dist/server-simple.js 