#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Check if a timeout value was provided as an argument
TIMEOUT=${1:-300}
echo "Starting server with ${TIMEOUT} second timeout..."

# Set environment variables with explicit values to prevent timeouts
export REQUEST_TIMEOUT=$TIMEOUT
export VOYAGE_API_KEY=${VOYAGE_API_KEY:-"pa-vh5Pm8TWfcFalS_OBiwDiF-8M3R9InrkzIMiJcLqvJ6"}

# Print environment setup
echo "Using environment variables:"
echo "  * REQUEST_TIMEOUT: $REQUEST_TIMEOUT seconds"
echo "  * VOYAGE_API_KEY: ${VOYAGE_API_KEY:0:5}... (masked)"

# Set NODE_OPTIONS to increase Node.js timeout limits
export NODE_OPTIONS="--max-old-space-size=4096"

# Run the server with progress reporting
echo "Starting server..."
npm run start -- --request-timeout=$TIMEOUT

# The script will continue running until terminated 