#!/bin/bash
# Start Unified Fusion OS Backend and Frontend

# Ensure we are in the script's directory
cd "$(dirname "$0")"

# Kill port 3001 (Server) and 3010 (Client) if running
fuser -k 3001/tcp
fuser -k 3010/tcp

# Start Server
echo "Starting Unified Server..."
cd server
node index.js &
SERVER_PID=$!
cd ..

# Start Client
echo "Starting Unified Client..."
cd client
npm run dev -- --port 3010 &
CLIENT_PID=$!
cd ..

echo "Unified App running."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3010"

# Wait for process
wait $SERVER_PID $CLIENT_PID
