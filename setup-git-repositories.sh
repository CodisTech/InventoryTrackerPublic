#!/bin/bash

# Script to set up Git repositories for the Inventory Management System
# This script initializes the Git repositories and creates the necessary branches

set -e  # Exit on any error

# Function to check if repository exists
function check_repo_exists() {
  local repo_url="$1"
  local repo_exists
  
  # Try to access the repository, but don't clone it
  git ls-remote "$repo_url" HEAD &>/dev/null
  repo_exists=$?
  
  return $repo_exists  # 0 if exists, non-zero otherwise
}

# Function to create a GitHub repository
function create_github_repo() {
  local repo_name="$1"
  local visibility="$2"  # public or private
  local token="${GITHUB_TOKEN}"
  
  if [ -z "$token" ]; then
    echo "Error: GITHUB_TOKEN environment variable not set"
    echo "Please set the GITHUB_TOKEN environment variable with a GitHub personal access token"
    exit 1
  fi
  
  echo "Creating GitHub repository: $repo_name (visibility: $visibility)..."
  
  # Create repository using GitHub API
  curl -s -H "Authorization: token $token" \
    -d "{\"name\":\"$repo_name\",\"private\":$([ "$visibility" = "private" ] && echo "true" || echo "false")}" \
    https://api.github.com/user/repos
}

# Check and setup GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Warning: GITHUB_TOKEN environment variable not set"
  echo "Some operations may fail without a GitHub token"
fi

# Define repository URLs
USERNAME="$(git config user.username || echo "your-username")"

# Check if we need to ask for username
if [ "$USERNAME" = "your-username" ]; then
  read -p "Enter your GitHub username: " USERNAME
fi

PRIVATE_REPO="https://github.com/$USERNAME/InventoryTracker.git"
PUBLIC_REPO="https://github.com/$USERNAME/InventoryTrackerPublic.git"
SANDBOX_REPO="https://github.com/$USERNAME/InventoryTrackerSandbox.git"

# Check if repositories exist, create if they don't
for repo_url in "$PRIVATE_REPO" "$PUBLIC_REPO" "$SANDBOX_REPO"; do
  repo_name=$(basename "$repo_url" .git)
  
  if ! check_repo_exists "$repo_url"; then
    echo "Repository $repo_url does not exist."
    
    if [ -n "$GITHUB_TOKEN" ]; then
      # Set visibility based on repository name
      visibility="private"
      [[ "$repo_url" == *Public* ]] && visibility="public"
      
      create_github_repo "$repo_name" "$visibility"
      echo "Created repository: $repo_name"
    else
      echo "Please create the repository manually at: $repo_url"
      echo "Press any key to continue once created..."
      read -n 1
    fi
  else
    echo "Repository exists: $repo_url"
  fi
done

# Initialize Git if needed
if [ ! -d .git ]; then
  echo "Initializing Git repository..."
  git init
  git add .
  git commit -m "Initial commit"
fi

# Set up remotes
git remote -v | grep origin > /dev/null || git remote add origin "$PRIVATE_REPO"
git remote -v | grep public > /dev/null || git remote add public "$PUBLIC_REPO"
git remote -v | grep sandbox > /dev/null || git remote add sandbox "$SANDBOX_REPO"

# Update remote URLs if they already exist
git remote set-url origin "$PRIVATE_REPO"
git remote set-url public "$PUBLIC_REPO"
git remote set-url sandbox "$SANDBOX_REPO"

# Create and set up branches
echo "Setting up branches..."

# Ensure we have a main branch
if ! git show-ref --verify --quiet refs/heads/main; then
  # If we're on master, rename it to main
  if git show-ref --verify --quiet refs/heads/master; then
    git branch -m master main
  else
    # Create main branch if it doesn't exist
    git checkout -b main
  fi
fi

# Create repository-specific branches
git checkout main
echo "repository: private" > .repository-type
git add .repository-type
git commit -m "Set repository type to private" || echo "No changes to commit for private"

# Create public branch
git checkout -b public 2>/dev/null || git checkout public
echo "repository: public" > .repository-type
git add .repository-type
git commit -m "Set repository type to public" || echo "No changes to commit for public"

# Create sandbox branch
git checkout -b sandbox 2>/dev/null || git checkout sandbox
echo "repository: sandbox" > .repository-type
git add .repository-type
git commit -m "Set repository type to sandbox" || echo "No changes to commit for sandbox"

# Go back to main branch
git checkout main

echo "Repository setup completed successfully!"
echo
echo "Remotes:"
git remote -v
echo
echo "Branches:"
git branch