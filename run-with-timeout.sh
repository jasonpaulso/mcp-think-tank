#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Check if a timeout value was provided as an argument
TIMEOUT=${1:-300}
echo "Starting server with ${TIMEOUT} second timeout..."

# Run with timeout
REQUEST_TIMEOUT=$TIMEOUT VOYAGE_API_KEY=${VOYAGE_API_KEY:-test_key} npm run start -- --request-timeout=$TIMEOUT

# The script will continue running until terminated 