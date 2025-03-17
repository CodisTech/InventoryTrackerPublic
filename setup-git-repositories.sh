#!/bin/bash
# Script to set up Git repositories for all three versions
# Usage: ./setup-git-repositories.sh

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
else
  echo "Git repository already initialized."
fi

# Configure git user if not already done
if [ -z "$(git config user.name)" ]; then
  echo "Setting git user name..."
  git config user.name "Inventory Manager"
fi

if [ -z "$(git config user.email)" ]; then
  echo "Setting git user email..."
  git config user.email "inventory@example.com"
fi

# Get remote origin
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
  echo "No remote origin set up."
  echo "You can set up a remote origin with:"
  echo "  git remote add origin <repository-url>"
  echo ""
  echo "For example:"
  echo "  git remote add origin https://github.com/username/inventory-system.git"
else
  echo "Remote origin already set to: $REMOTE_URL"
fi

# Create branches for each repository type if they don't exist
echo "Setting up repository branches..."

# Main branch (private repository)
git checkout -b main 2>/dev/null || git checkout main
echo "private" > .repository-type
git add .repository-type
git commit -m "Set repository type to private" || echo "No changes to commit for private repository"

# Public branch
git checkout -b public 2>/dev/null || git checkout public
echo "public" > .repository-type
git add .repository-type
git commit -m "Set repository type to public" || echo "No changes to commit for public repository"

# Sandbox branch
git checkout -b sandbox 2>/dev/null || git checkout sandbox
echo "sandbox" > .repository-type
git add .repository-type
git commit -m "Set repository type to sandbox" || echo "No changes to commit for sandbox repository"

# Return to main branch
git checkout main

echo ""
echo "Git repository setup complete!"
echo "Branch structure:"
echo "  main    - Private repository (all features)"
echo "  public  - Public repository (limited features)"
echo "  sandbox - Sandbox repository (testing environment)"
echo ""
echo "To push changes to all branches, use ./sync-repositories.sh \"Commit message\""
echo "To change repository type, use node change-repository-type.js <private|public|sandbox>"