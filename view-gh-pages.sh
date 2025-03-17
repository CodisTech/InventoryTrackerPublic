#!/bin/bash

# This script helps you preview the GitHub Pages content locally
# It uses a simple HTTP server to serve the content

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparing to preview GitHub Pages content locally...${NC}"

# Check if gh-pages directory exists
if [ ! -d "gh-pages" ]; then
  echo -e "${YELLOW}GitHub Pages content not found. Building it now...${NC}"
  node github-pages-deploy.js
  
  if [ ! -d "gh-pages" ]; then
    echo -e "${RED}Failed to build GitHub Pages content${NC}"
    exit 1
  fi
fi

# Change to the gh-pages directory
cd gh-pages

# Find an available port
PORT=8000
while netstat -tuln | grep ":$PORT " > /dev/null; do
  PORT=$((PORT+1))
done

echo -e "${GREEN}Starting local server on port $PORT${NC}"
echo -e "${GREEN}Open your browser and navigate to: http://localhost:$PORT${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"

# Start a simple HTTP server
# Try python3 first, fall back to python, then to npx
if command -v python3 > /dev/null; then
  python3 -m http.server $PORT
elif command -v python > /dev/null; then
  python -m SimpleHTTPServer $PORT
else
  cd ..
  npx http-server gh-pages -p $PORT
fi