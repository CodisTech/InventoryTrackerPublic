#!/bin/bash

# Repository Synchronization Script
# This script synchronizes changes between the private, public and sandbox repositories

set -e

# Configuration
PRIVATE_BRANCH="main"
PUBLIC_BRANCH="public"
SANDBOX_BRANCH="sandbox"

PRIVATE_REMOTE="origin"
PUBLIC_REMOTE="public-origin"
SANDBOX_REMOTE="sandbox-origin"

# Make sure we have the current branch before starting
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Confirm with the user
echo "This script will synchronize changes between the three repositories."
echo "Current branch: $CURRENT_BRANCH"
echo ""
echo "Select synchronization option:"
echo "1. Sync from private to public and sandbox (main -> public, sandbox)"
echo "2. Sync from sandbox to private (sandbox -> main)"
echo "3. Sync from main to sandbox only (main -> sandbox)"
echo "4. Sync from main to public only (main -> public)"
echo "5. Pull updates from all remotes"
echo "6. Push changes to all remotes"
echo "7. Exit"
read -p "Enter option (1-7): " SYNC_OPTION

# Function to check for uncommitted changes
check_uncommitted_changes() {
  if ! git diff-index --quiet HEAD --; then
    echo "Error: You have uncommitted changes"
    echo "Please commit or stash your changes before running this script"
    exit 1
  fi
}

# Check for uncommitted changes
check_uncommitted_changes

# Perform the selected synchronization
case $SYNC_OPTION in
  1) # Sync from private to public and sandbox
    echo "Syncing from private (main) to public and sandbox..."
    
    # Update main branch
    echo "Updating main branch..."
    git checkout $PRIVATE_BRANCH
    
    # Sync to public branch
    echo "Syncing to public branch..."
    git checkout $PUBLIC_BRANCH
    git merge $PRIVATE_BRANCH -m "Sync from private to public"
    echo "repository: public" > .repository-type
    git add .repository-type
    git commit -m "Reset repository type to public after merge"
    
    # Sync to sandbox branch
    echo "Syncing to sandbox branch..."
    git checkout $SANDBOX_BRANCH
    git merge $PRIVATE_BRANCH -m "Sync from private to sandbox"
    echo "repository: sandbox" > .repository-type
    git add .repository-type
    git commit -m "Reset repository type to sandbox after merge"
    
    echo "Sync completed from private to public and sandbox"
    ;;
    
  2) # Sync from sandbox to private
    echo "Syncing from sandbox to private (main)..."
    
    # Update sandbox branch
    echo "Updating sandbox branch..."
    git checkout $SANDBOX_BRANCH
    
    # Sync to main branch
    echo "Syncing to main branch..."
    git checkout $PRIVATE_BRANCH
    git merge $SANDBOX_BRANCH -m "Sync from sandbox to private"
    echo "repository: private" > .repository-type
    git add .repository-type
    git commit -m "Reset repository type to private after merge"
    
    echo "Sync completed from sandbox to private"
    ;;
    
  3) # Sync from main to sandbox only
    echo "Syncing from private (main) to sandbox only..."
    
    # Update main branch
    echo "Updating main branch..."
    git checkout $PRIVATE_BRANCH
    
    # Sync to sandbox branch
    echo "Syncing to sandbox branch..."
    git checkout $SANDBOX_BRANCH
    git merge $PRIVATE_BRANCH -m "Sync from private to sandbox"
    echo "repository: sandbox" > .repository-type
    git add .repository-type
    git commit -m "Reset repository type to sandbox after merge"
    
    echo "Sync completed from private to sandbox"
    ;;
    
  4) # Sync from main to public only
    echo "Syncing from private (main) to public only..."
    
    # Update main branch
    echo "Updating main branch..."
    git checkout $PRIVATE_BRANCH
    
    # Sync to public branch
    echo "Syncing to public branch..."
    git checkout $PUBLIC_BRANCH
    git merge $PRIVATE_BRANCH -m "Sync from private to public"
    echo "repository: public" > .repository-type
    git add .repository-type
    git commit -m "Reset repository type to public after merge"
    
    echo "Sync completed from private to public"
    ;;
    
  5) # Pull updates from all remotes
    echo "Pulling updates from all remotes..."
    
    # Pull private branch
    echo "Pulling from private remote..."
    git checkout $PRIVATE_BRANCH
    git pull $PRIVATE_REMOTE $PRIVATE_BRANCH
    
    # Pull public branch
    echo "Pulling from public remote..."
    git checkout $PUBLIC_BRANCH
    git pull $PUBLIC_REMOTE main
    
    # Pull sandbox branch
    echo "Pulling from sandbox remote..."
    git checkout $SANDBOX_BRANCH
    git pull $SANDBOX_REMOTE main
    
    echo "Pull completed from all remotes"
    ;;
    
  6) # Push changes to all remotes
    echo "Pushing changes to all remotes..."
    
    # Push private branch
    echo "Pushing to private remote..."
    git checkout $PRIVATE_BRANCH
    git push $PRIVATE_REMOTE $PRIVATE_BRANCH
    
    # Push public branch
    echo "Pushing to public remote..."
    git checkout $PUBLIC_BRANCH
    git push $PUBLIC_REMOTE $PUBLIC_BRANCH:main
    
    # Push sandbox branch
    echo "Pushing to sandbox remote..."
    git checkout $SANDBOX_BRANCH
    git push $SANDBOX_REMOTE $SANDBOX_BRANCH:main
    
    echo "Push completed to all remotes"
    ;;
    
  7) # Exit
    echo "Exiting without performing any synchronization"
    ;;
    
  *) # Invalid option
    echo "Error: Invalid option selected"
    exit 1
    ;;
esac

# Return to the original branch
git checkout $CURRENT_BRANCH

echo ""
echo "Repository synchronization script completed"
echo "Current branch: $(git rev-parse --abbrev-ref HEAD)"