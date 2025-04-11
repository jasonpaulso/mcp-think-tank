#!/bin/bash

# Compile TypeScript files
npm run build

# Run only with the think tool
export SKIP_EMBEDDINGS=true
export VOYAGE_API_KEY=dummy-key

# Run the server
node dist/server.js 