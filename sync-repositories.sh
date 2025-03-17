#!/bin/bash

# Repository Synchronization Script
# This script helps keep the three repositories (private, public, and sandbox) in sync
# by pushing changes to the appropriate remotes.

set -e  # Exit on any error

# Function to show help
function show_help() {
  echo "Repository Synchronization Script for Inventory Management System"
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  --help           Show this help message"
  echo "  --all            Sync all repositories"
  echo "  --private        Push to private repository only"
  echo "  --public         Push to public repository only"
  echo "  --sandbox        Push to sandbox repository only"
  echo "  --force          Force push to repositories (use with caution)"
  echo ""
  echo "Examples:"
  echo "  $0 --all        # Sync all repositories"
  echo "  $0 --public     # Only push to public repository"
  echo ""
}

# Default options
SYNC_PRIVATE=false
SYNC_PUBLIC=false
SYNC_SANDBOX=false
FORCE_PUSH=false

# Parse command-line arguments
if [ $# -eq 0 ]; then
  show_help
  exit 1
fi

for arg in "$@"; do
  case $arg in
    --help)
      show_help
      exit 0
      ;;
    --all)
      SYNC_PRIVATE=true
      SYNC_PUBLIC=true
      SYNC_SANDBOX=true
      ;;
    --private)
      SYNC_PRIVATE=true
      ;;
    --public)
      SYNC_PUBLIC=true
      ;;
    --sandbox)
      SYNC_SANDBOX=true
      ;;
    --force)
      FORCE_PUSH=true
      ;;
    *)
      echo "Unknown option: $arg"
      show_help
      exit 1
      ;;
  esac
done

# Check for uncommitted changes
if [[ $(git status --porcelain) ]]; then
  echo "Error: There are uncommitted changes in the working directory."
  echo "Please commit or stash them before syncing."
  exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"

# Function to sync a specific repository
function sync_repository() {
  local branch="$1"
  local remote="$2"
  local force_flag=""
  
  if [ "$FORCE_PUSH" = true ]; then
    force_flag="--force"
  fi
  
  echo "Syncing $branch branch to $remote remote..."
  
  # Save current branch
  git branch -f temp-sync-branch
  
  # Checkout the branch to sync
  git checkout "$branch"
  
  # Push to the remote
  if [ "$branch" = "main" ]; then
    git push $force_flag "$remote" "$branch"
  else
    git push $force_flag "$remote" "$branch:main"
  fi
  
  # Restore original branch
  git checkout temp-sync-branch
  git branch -D temp-sync-branch
}

# Sync private repository
if [ "$SYNC_PRIVATE" = true ]; then
  sync_repository "main" "origin"
fi

# Sync public repository
if [ "$SYNC_PUBLIC" = true ]; then
  # Prepare and deploy to public branch
  ./deploy-public.sh
  
  # Push public branch to public remote
  sync_repository "public" "public"
fi

# Sync sandbox repository
if [ "$SYNC_SANDBOX" = true ]; then
  # Prepare and deploy to sandbox branch
  ./deploy-sandbox.sh
  
  # Push sandbox branch to sandbox remote
  sync_repository "sandbox" "sandbox"
fi

# Restore original branch
git checkout "$CURRENT_BRANCH"

echo "Repository synchronization completed successfully!"