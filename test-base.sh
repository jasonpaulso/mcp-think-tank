#!/bin/bash

# Test 1: Base Knowledge Graph Only
echo "Running base knowledge graph test..."

# Disable all embedding features
export SKIP_EMBEDDINGS=true
export VOYAGE_API_KEY=dummy-key
export SKIP_IMAGE_EMBEDDINGS=true

# Set longer timeout for testing (10 minutes)
export REQUEST_TIMEOUT=600

# Run with debug logging
export DEBUG=mcp*

# Clean start - remove any existing memory file
rm -f ~/.mcp-think-server/memory.jsonl

# Run the server with error handling
echo "Starting server with base knowledge graph only..."
node dist/server.js 2>&1 | tee test-base.log

# Check for timeout errors in the log
if grep -q "Request timeout" test-base.log; then
    echo "Test failed due to timeout"
    exit 1
fi 