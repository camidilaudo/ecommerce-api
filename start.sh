#!/bin/bash

# Function to clean up Docker containers on exit
cleanup() {
    echo -e "\nStopping Docker containers..."
    docker compose down
    exit 0
}

# Trap Ctrl+C (SIGINT) and SIGTERM to run the cleanup function
trap cleanup SIGINT SIGTERM

echo "Starting Database and Backend with Docker Compose..."
docker compose up --build -d

echo "Waiting for Backend to be ready on port 8081..."
until curl -s http://localhost:8081/api/productos > /dev/null; do
    echo -n "."
    sleep 1
done
echo -e "\nBackend is ready!"

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Starting Frontend..."
npm run dev
