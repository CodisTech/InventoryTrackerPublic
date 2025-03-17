#!/bin/bash

# Deploy to the sandbox repository
# This script will update the sandbox branch with the latest changes from main (private)
# and push to the sandbox remote repository

set -e  # Exit on any error

# Check for uncommitted changes
if [[ $(git status --porcelain) ]]; then
  echo "Error: There are uncommitted changes in the working directory."
  echo "Please commit or stash them before deploying."
  exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Remember it to switch back after deployment
echo "Current branch: $CURRENT_BRANCH"

# Checkout the main branch (private repository)
git checkout main

# Update the local main branch
echo "Pulling latest changes from origin main..."
git pull origin main

# Update the sandbox branch
echo "Checking out sandbox branch..."
git checkout sandbox

# Merge changes from main
echo "Merging changes from main to sandbox..."
git merge main -m "Merge changes from private (main) to sandbox"

# Update the repository type
echo "repository: sandbox" > .repository-type

# Update version configuration for sandbox
echo "Modifying version configuration for sandbox repository..."
sed -i 's/repository: "private"/repository: "sandbox"/' client/src/lib/version-config.ts
sed -i 's/environment: "development"/environment: "sandbox"/' client/src/lib/version-config.ts

# Build the application for sandbox deployment
echo "Building the application for sandbox deployment..."
# Add your build commands here, if any
# npm run build

# Commit changes
echo "Committing changes to sandbox branch..."
git add .
git commit -m "Update repository type and version configuration for sandbox deployment"

# Push to sandbox repository
echo "Pushing to sandbox repository..."
git push sandbox sandbox:main

# Optional: Push to origin remote as well to keep branches synced
git push origin sandbox

# Switch back to original branch
echo "Switching back to original branch..."
git checkout $CURRENT_BRANCH

echo "Sandbox deployment completed successfully!"