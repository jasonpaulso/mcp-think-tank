#!/bin/bash

# Make all test scripts executable
chmod +x test-base.sh
chmod +x test-text-embeddings.sh
chmod +x test-image-embeddings.sh

# Function to run a test and wait for timeout or user interrupt
run_test() {
    echo "Running $1..."
    echo "Press Ctrl+C to stop the test and continue to the next one"
    echo "Test will automatically continue after timeout or failure"
    
    # Run the test in background
    ./$1 &
    pid=$!
    
    # Wait for process to finish or timeout
    wait $pid
    
    # Kill any remaining node processes from the test
    pkill -f "node dist/server.js"
    
    echo "Test $1 completed"
    echo "----------------------------------------"
    echo "Waiting 5 seconds before next test..."
    sleep 5
}

# Build the project first
echo "Building project..."
npm run build

# Run each test in sequence
echo "Starting test sequence..."
echo "----------------------------------------"

run_test "test-base.sh"
run_test "test-text-embeddings.sh"
run_test "test-image-embeddings.sh"

echo "All tests completed" 