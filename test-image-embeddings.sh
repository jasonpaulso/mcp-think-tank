#!/bin/bash

# Test 3: Knowledge Graph + Image Embeddings
echo "Running knowledge graph + image embeddings test..."

# Enable image embeddings but disable text embeddings
export SKIP_EMBEDDINGS=true
export SKIP_IMAGE_EMBEDDINGS=false

# Voyage AI configuration - use existing API key from environment
if [ -z "$VOYAGE_API_KEY" ]; then
    echo "Error: VOYAGE_API_KEY environment variable is not set"
    exit 1
fi

export EMBEDDING_MODEL=voyage-multimodal-3
export EMBEDDING_DIMENSIONS=1024

# Set longer timeout for testing (10 minutes)
export REQUEST_TIMEOUT=600

# Run with debug logging
export DEBUG=mcp*

# Clean start - remove any existing memory file
rm -f ~/.mcp-think-server/memory.jsonl

# Run the server with error handling
echo "Starting server with knowledge graph + image embeddings..."
node dist/server.js 2>&1 | tee test-image-embeddings.log

# Check for timeout errors in the log
if grep -q "Request timeout" test-image-embeddings.log; then
    echo "Test failed due to timeout"
    exit 1
fi 