#!/bin/bash

# Test 2: Knowledge Graph + Text Embeddings
echo "Running knowledge graph + text embeddings test..."

# Enable text embeddings but disable image embeddings
export SKIP_EMBEDDINGS=false
export SKIP_IMAGE_EMBEDDINGS=true

# Voyage AI configuration - use existing API key from environment
if [ -z "$VOYAGE_API_KEY" ]; then
    echo "Error: VOYAGE_API_KEY environment variable is not set"
    exit 1
fi

export EMBEDDING_MODEL=voyage-3-large
export EMBEDDING_DIMENSIONS=1024

# Set longer timeout for testing (10 minutes)
export REQUEST_TIMEOUT=600

# Run with debug logging
export DEBUG=mcp*

# Clean start - remove any existing memory file
rm -f ~/.mcp-think-server/memory.jsonl

# Run the server with error handling
echo "Starting server with knowledge graph + text embeddings..."
node dist/server.js 2>&1 | tee test-text-embeddings.log

# Check for timeout errors in the log
if grep -q "Request timeout" test-text-embeddings.log; then
    echo "Test failed due to timeout"
    exit 1
fi 