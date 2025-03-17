#!/bin/bash

# Deploy to the public repository
# This script will update the public branch with the latest changes from main (private)
# and push to the public remote repository

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

# Update the public branch
echo "Checking out public branch..."
git checkout public

# Merge changes from main
echo "Merging changes from main to public..."
git merge main -m "Merge changes from private (main) to public"

# Update the repository type
echo "repository: public" > .repository-type

# Filter out features not available in public repository
echo "Modifying version configuration for public repository..."
sed -i 's/repository: "private"/repository: "public"/' client/src/lib/version-config.ts

# Build the application for public deployment
echo "Building the application for public deployment..."
# Add your build commands here, if any
# npm run build

# Commit changes
echo "Committing changes to public branch..."
git add .
git commit -m "Update repository type and version configuration for public release"

# Push to public repository
echo "Pushing to public repository..."
git push public public:main

# Optional: Push to origin remote as well to keep branches synced
git push origin public

# Switch back to original branch
echo "Switching back to original branch..."
git checkout $CURRENT_BRANCH

echo "Public deployment completed successfully!"