#!/bin/bash

# Deploy GitHub Pages script
# This script pushes the generated gh-pages content to the GitHub repository

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting GitHub Pages deployment...${NC}"

# Configuration
REPO_URL="https://github.com/CodisTech/InventoryTrackerSandbox.git"
GH_PAGES_BRANCH="gh-pages"
GH_PAGES_DIR="gh-pages"
TEMP_DIR="gh-pages-temp"

# Check for GITHUB_TOKEN
if [ -z "$GITHUB_TOKEN" ]; then
  echo -e "${RED}Error: GITHUB_TOKEN environment variable is not set${NC}"
  echo "Please set the GITHUB_TOKEN environment variable with a valid GitHub personal access token"
  exit 1
fi

# First, generate the GitHub Pages content
echo -e "${YELLOW}Building GitHub Pages content...${NC}"
node github-pages-deploy.js

if [ ! -d "$GH_PAGES_DIR" ]; then
  echo -e "${RED}Error: GitHub Pages directory '$GH_PAGES_DIR' not found${NC}"
  exit 1
fi

# Create a temporary directory for the git repo
echo -e "${YELLOW}Preparing git repository...${NC}"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Clone the gh-pages branch
cd $TEMP_DIR
git init
git remote add origin $REPO_URL
git config user.name "GitHub Pages Deployment"
git config user.email "noreply@github.com"

# Create gh-pages branch if it doesn't exist
git checkout -b $GH_PAGES_BRANCH

# Remove all files to ensure clean state
rm -rf ./*

# Copy all files from the generated gh-pages directory
echo -e "${YELLOW}Copying GitHub Pages content...${NC}"
cp -r ../$GH_PAGES_DIR/* ./

# Add .nojekyll file
touch .nojekyll

# Commit changes
git add .
git commit -m "Deploy GitHub Pages content"

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push -f "https://x-access-token:$GITHUB_TOKEN@${REPO_URL#https://}" $GH_PAGES_BRANCH

echo -e "${GREEN}GitHub Pages deployment completed!${NC}"
echo -e "${GREEN}Visit https://codistech.github.io/InventoryTrackerSandbox${NC}"

# Clean up
cd ..
rm -rf $TEMP_DIR

exit 0