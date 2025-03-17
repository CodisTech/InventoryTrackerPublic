#!/bin/bash
# Script to commit and push changes to all repository types
# Usage: ./sync-repositories.sh "Commit message"

# Check if a commit message was provided
if [ -z "$1" ]; then
  echo "Please provide a commit message"
  echo "Usage: ./sync-repositories.sh \"Commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"

# Store the original repository type
ORIGINAL_REPO_TYPE=""
if [ -f .repository-type ]; then
  ORIGINAL_REPO_TYPE=$(cat .repository-type)
else
  ORIGINAL_REPO_TYPE="private"
fi

echo "----------------------------------------"
echo "Original repository type: ${ORIGINAL_REPO_TYPE}"
echo "----------------------------------------"

# Helper function to commit and push to a specific branch
commit_and_push() {
  local repo_type=$1
  local branch_name=$repo_type
  
  # Switch to the repository type
  echo "Switching to ${repo_type} repository..."
  node change-repository-type.js ${repo_type}
  
  # Check if branch exists, if not create it
  if ! git show-ref --verify --quiet refs/heads/${branch_name}; then
    echo "Creating ${branch_name} branch..."
    git checkout -b ${branch_name}
  else
    echo "Checking out ${branch_name} branch..."
    git checkout ${branch_name}
  fi
  
  # Add all files
  echo "Adding files..."
  git add .
  
  # Commit changes
  echo "Committing changes..."
  git commit -m "${COMMIT_MESSAGE} [${repo_type}]"
  
  # Push to remote
  echo "Pushing to remote..."
  git push origin ${branch_name} || echo "Failed to push, remote may not be set up"
  
  echo ""
  echo "----------------------------------------"
  echo "${repo_type} repository committed and pushed."
  echo "----------------------------------------"
  echo ""
}

# Commit and push to each repository type
commit_and_push "private"
commit_and_push "public"
commit_and_push "sandbox"

# Switch back to the original repository type
echo "Switching back to ${ORIGINAL_REPO_TYPE} repository..."
node change-repository-type.js ${ORIGINAL_REPO_TYPE}
git checkout main

echo ""
echo "----------------------------------------"
echo "All repositories have been committed and pushed!"
echo "----------------------------------------"