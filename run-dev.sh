#!/bin/bash

# Set environment variables
export SKIP_EMBEDDINGS=true
export VOYAGE_API_KEY=dummy-key

# Run with ts-node to bypass compilation errors
npx ts-node --esm src/server.ts 